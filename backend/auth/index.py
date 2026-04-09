"""
Авторизация: login, me, users, users_create, groups, groups_create.
Передавать action через query (?action=login) или в теле запроса.
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

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = qs.get('action') or body.get('action', '')

    if action == 'login':
        login = body.get('login', '').strip()
        password = body.get('password', '').strip()
        if not login or not password:
            return resp(400, {'error': 'Введите логин и пароль'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, login, full_name, role, group_id FROM {SCHEMA}.users WHERE login=%s AND password_hash=%s",
            (login, password)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp(401, {'error': 'Неверный логин или пароль'})
        u = {'id': row[0], 'login': row[1], 'full_name': row[2], 'role': row[3], 'group_id': row[4]}
        return resp(200, {'user': u, 'token': f"{row[0]}:{row[3]}:{row[1]}"})

    if action == 'me':
        if not user:
            return resp(401, {'error': 'Не авторизован'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, login, full_name, role, group_id FROM {SCHEMA}.users WHERE id=%s", (user['id'],))
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp(401, {'error': 'Пользователь не найден'})
        return resp(200, {'user': {'id': row[0], 'login': row[1], 'full_name': row[2], 'role': row[3], 'group_id': row[4]}})

    if action == 'users':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.login, u.full_name, u.role, u.group_id, g.name "
            f"FROM {SCHEMA}.users u LEFT JOIN {SCHEMA}.groups g ON u.group_id=g.id ORDER BY u.role, u.full_name"
        )
        rows = cur.fetchall()
        conn.close()
        return resp(200, {'users': [{'id': r[0], 'login': r[1], 'full_name': r[2], 'role': r[3], 'group_id': r[4], 'group_name': r[5]} for r in rows]})

    if action == 'users_create':
        if not user or user['role'] != 'admin':
            return resp(403, {'error': 'Только администратор'})
        login = body.get('login', '').strip()
        password = body.get('password', '').strip()
        full_name = body.get('full_name', '').strip()
        role = body.get('role', 'student')
        group_id = body.get('group_id') or None
        if not login or not password or not full_name:
            return resp(400, {'error': 'Заполните все поля'})
        if role not in ('student', 'teacher', 'admin'):
            return resp(400, {'error': 'Неверная роль'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (login, password_hash, full_name, role, group_id) VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (login, password, full_name, role, group_id)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return resp(201, {'id': new_id, 'message': 'Пользователь создан'})

    if action == 'groups':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, name, year FROM {SCHEMA}.groups ORDER BY name")
        rows = cur.fetchall()
        conn.close()
        return resp(200, {'groups': [{'id': r[0], 'name': r[1], 'year': r[2]} for r in rows]})

    if action == 'groups_create':
        if not user or user['role'] != 'admin':
            return resp(403, {'error': 'Только администратор'})
        name = body.get('name', '').strip()
        year = body.get('year', 1)
        if not name:
            return resp(400, {'error': 'Укажите название группы'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.groups (name, year) VALUES (%s,%s) RETURNING id", (name, year))
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return resp(201, {'id': new_id, 'message': 'Группа создана'})

    return resp(400, {'error': 'Укажите action'})
