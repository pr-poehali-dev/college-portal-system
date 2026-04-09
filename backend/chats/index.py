"""
Чаты: list, messages, send, create (admin only), members.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resp(status, body):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False, default=str)}


def get_user_from_token(token):
    if not token:
        return None
    try:
        parts = token.split(':')
        return {'id': int(parts[0]), 'role': parts[1], 'login': parts[2]}
    except Exception:
        return None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    token = event.get('headers', {}).get('X-Session-Id', '')
    user = get_user_from_token(token)

    if not user:
        return resp(401, {'error': 'Не авторизован'})

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = qs.get('action') or body.get('action', 'list')

    if action == 'list':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT c.id, c.name, c.created_at, "
            f"(SELECT m.text FROM {SCHEMA}.messages m WHERE m.chat_id=c.id ORDER BY m.created_at DESC LIMIT 1) as last_msg, "
            f"(SELECT m.created_at FROM {SCHEMA}.messages m WHERE m.chat_id=c.id ORDER BY m.created_at DESC LIMIT 1) as last_time "
            f"FROM {SCHEMA}.chats c "
            f"JOIN {SCHEMA}.chat_members cm ON cm.chat_id=c.id "
            f"WHERE cm.user_id=%s ORDER BY last_time DESC NULLS LAST",
            (user['id'],)
        )
        rows = cur.fetchall()
        conn.close()
        chats = [{'id': r[0], 'name': r[1], 'created_at': r[2], 'last_msg': r[3], 'last_time': r[4]} for r in rows]
        return resp(200, {'chats': chats})

    if action == 'messages':
        chat_id = int(qs.get('chat_id') or body.get('chat_id', 0))
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, user['id']))
        if not cur.fetchone():
            conn.close()
            return resp(403, {'error': 'Нет доступа'})
        cur.execute(
            f"SELECT m.id, m.text, m.created_at, u.id, u.full_name "
            f"FROM {SCHEMA}.messages m JOIN {SCHEMA}.users u ON m.user_id=u.id "
            f"WHERE m.chat_id=%s ORDER BY m.created_at ASC LIMIT 100",
            (chat_id,)
        )
        rows = cur.fetchall()
        conn.close()
        messages = [{'id': r[0], 'text': r[1], 'created_at': r[2], 'user_id': r[3], 'user_name': r[4]} for r in rows]
        return resp(200, {'messages': messages})

    if action == 'send':
        chat_id = int(body.get('chat_id', 0))
        text = body.get('text', '').strip()
        if not chat_id or not text:
            return resp(400, {'error': 'Укажите чат и текст'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, user['id']))
        if not cur.fetchone():
            conn.close()
            return resp(403, {'error': 'Нет доступа'})
        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (chat_id, user_id, text) VALUES (%s,%s,%s) RETURNING id, created_at",
            (chat_id, user['id'], text)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return resp(201, {'id': row[0], 'created_at': row[1]})

    if action == 'create':
        if user['role'] != 'admin':
            return resp(403, {'error': 'Только администратор создаёт чаты'})
        name = body.get('name', '').strip()
        member_ids = body.get('member_ids', [])
        if not name:
            return resp(400, {'error': 'Укажите название'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.chats (name, created_by) VALUES (%s,%s) RETURNING id", (name, user['id']))
        chat_id = cur.fetchone()[0]
        all_members = list(set([user['id']] + [int(m) for m in member_ids]))
        for uid in all_members:
            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (chat_id, uid))
        conn.commit()
        conn.close()
        return resp(201, {'id': chat_id, 'message': 'Чат создан'})

    if action == 'members':
        chat_id = int(qs.get('chat_id') or body.get('chat_id', 0))
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.full_name, u.role FROM {SCHEMA}.chat_members cm "
            f"JOIN {SCHEMA}.users u ON cm.user_id=u.id WHERE cm.chat_id=%s",
            (chat_id,)
        )
        rows = cur.fetchall()
        conn.close()
        return resp(200, {'members': [{'id': r[0], 'full_name': r[1], 'role': r[2]} for r in rows]})

    return resp(400, {'error': 'Укажите action'})
