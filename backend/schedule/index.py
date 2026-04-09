"""
Расписание: list, add, delete.
action=list (GET), action=add (POST teacher/admin), action=delete (POST admin)
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

    action = qs.get('action') or body.get('action', 'list')

    if action == 'list':
        group_id = qs.get('group_id') or body.get('group_id')
        teacher_id = qs.get('teacher_id') or body.get('teacher_id')
        day = qs.get('day_of_week') or body.get('day_of_week')

        conn = get_conn()
        cur = conn.cursor()
        sql = (
            f"SELECT s.id, s.subject, s.lesson_type, s.room, s.day_of_week, s.time_start, "
            f"u.full_name, u.id, g.name, g.id "
            f"FROM {SCHEMA}.schedule s "
            f"JOIN {SCHEMA}.users u ON s.teacher_id=u.id "
            f"JOIN {SCHEMA}.groups g ON s.group_id=g.id WHERE 1=1"
        )
        params = []
        if group_id:
            sql += " AND s.group_id=%s"
            params.append(int(group_id))
        if teacher_id:
            sql += " AND s.teacher_id=%s"
            params.append(int(teacher_id))
        if day is not None:
            sql += " AND s.day_of_week=%s"
            params.append(int(day))
        sql += " ORDER BY s.day_of_week, s.time_start"
        cur.execute(sql, params)
        rows = cur.fetchall()
        conn.close()
        lessons = [{'id': r[0], 'subject': r[1], 'lesson_type': r[2], 'room': r[3], 'day_of_week': r[4], 'time_start': r[5], 'teacher_name': r[6], 'teacher_id': r[7], 'group_name': r[8], 'group_id': r[9]} for r in rows]
        return resp(200, {'lessons': lessons})

    if action == 'add':
        if not user or user['role'] not in ('teacher', 'admin'):
            return resp(403, {'error': 'Недостаточно прав'})
        teacher_id = body.get('teacher_id') or user['id']
        group_id = body.get('group_id')
        subject = body.get('subject', '').strip()
        lesson_type = body.get('lesson_type', 'Лекция').strip()
        room = body.get('room', '').strip()
        day_of_week = body.get('day_of_week')
        time_start = body.get('time_start', '').strip()
        if not group_id or not subject or day_of_week is None or not time_start:
            return resp(400, {'error': 'Заполните все поля'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.schedule (teacher_id, group_id, subject, lesson_type, room, day_of_week, time_start) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (int(teacher_id), int(group_id), subject, lesson_type, room, int(day_of_week), time_start)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return resp(201, {'id': new_id, 'message': 'Пара добавлена'})

    return resp(400, {'error': 'Укажите action'})
