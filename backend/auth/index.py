import json
import os
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление пользователями и мероприятиями
    Args: event с httpMethod, body, queryStringParameters
          context с request_id
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'POST')
    params = event.get('queryStringParameters') or {}
    path: str = params.get('action', 'login')
    resource: str = params.get('resource', 'users')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if resource == 'events':
        if method == 'GET' and path == 'list':
            return handle_list_events(event)
        elif method == 'POST':
            return handle_create_event(event)
        elif method == 'PUT':
            if path == 'approve':
                return handle_approve_event(event)
            elif path == 'update':
                return handle_update_event(event)
            elif path == 'report':
                return handle_report_event(event)
        elif method == 'DELETE':
            return handle_delete_event(event)
    
    if method == 'GET':
        if path == 'list':
            return handle_list_users(event)
        else:
            return handle_get_user(event)
    elif method == 'POST':
        if path == 'register':
            return handle_register(event)
        else:
            return handle_login(event)
    elif method == 'PUT':
        if path == 'approve':
            return handle_approve_user(event)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    elif method == 'DELETE':
        return handle_delete_user(event)
    else:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

def handle_register(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    name = body_data.get('name', '').strip()
    phone = body_data.get('phone', '').strip()
    user_type = body_data.get('user_type', 'individual')
    
    inn = body_data.get('inn', '').strip() if user_type == 'legal' else None
    company_name = body_data.get('company_name', '').strip() if user_type == 'legal' else None
    legal_address = body_data.get('legal_address', '').strip() if user_type == 'legal' else None
    
    birth_date = body_data.get('birth_date', '').strip() if user_type == 'individual' else None
    passport_series = body_data.get('passport_series', '').strip() if user_type == 'individual' else None
    passport_number = body_data.get('passport_number', '').strip() if user_type == 'individual' else None
    passport_issue_date = body_data.get('passport_issue_date', '').strip() if user_type == 'individual' else None
    passport_issued_by = body_data.get('passport_issued_by', '').strip() if user_type == 'individual' else None
    
    if not email or not password or not name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, пароль и имя обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing_user = cur.fetchone()
        
        if existing_user:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """INSERT INTO users (
                email, password, name, phone, user_type, 
                inn, company_name, legal_address,
                birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by,
                approved, submitted_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()) RETURNING id""",
            (email, password_hash, name, phone, user_type, 
             inn, company_name, legal_address,
             birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by,
             False)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Регистрация успешна. Ожидайте одобрения администратора.',
                'user_id': user_id
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_login(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, email, name, phone, user_type, approved FROM users WHERE email = %s AND password = %s",
            (email, password_hash)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный email или пароль'}),
                'isBase64Encoded': False
            }
        
        user_id, user_email, name, phone, user_type, approved = user
        
        if not approved and user_type != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Ваш аккаунт ожидает одобрения администратора'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user_id,
                    'email': user_email,
                    'name': name,
                    'phone': phone,
                    'user_type': user_type,
                    'approved': approved
                }
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_list_users(event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            """SELECT id, email, name, phone, user_type, approved, submitted_at,
                      inn, company_name, legal_address,
                      birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by
               FROM users ORDER BY submitted_at DESC"""
        )
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            (user_id, email, name, phone, user_type, approved, submitted_at,
             inn, company_name, legal_address,
             birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by) = row
            
            user_data = {
                'id': user_id,
                'email': email,
                'name': name,
                'phone': phone,
                'user_type': user_type,
                'approved': approved,
                'submitted_at': submitted_at.isoformat() if submitted_at else None
            }
            
            if user_type == 'legal':
                user_data['inn'] = inn
                user_data['company_name'] = company_name
                user_data['legal_address'] = legal_address
            else:
                user_data['birth_date'] = birth_date.isoformat() if birth_date else None
                user_data['passport_series'] = passport_series
                user_data['passport_number'] = passport_number
                user_data['passport_issue_date'] = passport_issue_date.isoformat() if passport_issue_date else None
                user_data['passport_issued_by'] = passport_issued_by
            
            users.append(user_data)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_delete_user(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id')
    
    print(f'DELETE USER REQUEST: user_id={user_id}')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        print(f'Executing DELETE for user_id={user_id}')
        cur.execute("DELETE FROM users WHERE id = %s RETURNING id", (user_id,))
        deleted = cur.fetchone()
        print(f'DELETE result: {deleted}')
        
        if not deleted:
            cur.close()
            conn.close()
            print('User not found in database')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f'User {deleted[0]} successfully deleted')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Пользователь удален'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error in delete: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_approve_user(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute("UPDATE users SET approved = true WHERE id = %s RETURNING id, email, name", (user_id,))
        updated = cur.fetchone()
        
        if not updated:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        user_id_result, email, name = updated
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Пользователь одобрен',
                'user': {'id': user_id_result, 'email': email, 'name': name}
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера одобрения: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_get_user(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, email, name, phone, user_type, approved, submitted_at FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        user_id, email, name, phone, user_type, approved, submitted_at = user
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'phone': phone,
                    'user_type': user_type,
                    'approved': approved,
                    'submitted_at': submitted_at.isoformat() if submitted_at else None
                }
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Database error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_list_events(event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT 
                e.*,
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                    'name', ed.name, 
                    'url', ed.url
                )) FILTER (WHERE ed.id IS NOT NULL), '[]'::json) as documents,
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                    'type', em.type,
                    'name', em.name,
                    'url', em.url
                )) FILTER (WHERE em.id IS NOT NULL), '[]'::json) as media,
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                    'type', erd.doc_type,
                    'name', erd.doc_name,
                    'uploaded', erd.uploaded,
                    'url', erd.url,
                    'fileName', erd.file_name
                )) FILTER (WHERE erd.id IS NOT NULL), '[]'::json) as required_documents
            FROM events e
            LEFT JOIN event_documents ed ON e.id = ed.event_id
            LEFT JOIN event_media em ON e.id = em.event_id
            LEFT JOIN event_required_documents erd ON e.id = erd.event_id
            GROUP BY e.id
            ORDER BY e.date ASC
        ''')
        events = cur.fetchall()
        cur.close()
        conn.close()
        
        def serialize_event(e):
            d = dict(e)
            if d.get('additional_dates'):
                d['additional_dates'] = [str(dt) for dt in d['additional_dates']]
            else:
                d['additional_dates'] = []
            return d

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'events': [serialize_event(e) for e in events]}, default=str),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка списка событий: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_create_event(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    try:
        import psycopg2
        from datetime import datetime
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        approved = body_data.get('approved', False)
        event_type = body_data.get('event_type')
        event_level = body_data.get('event_level')
        event_date = body_data.get('date')
        event_number = body_data.get('event_number')
        
        if approved and not event_number:
            year = datetime.strptime(str(event_date), '%Y-%m-%d').year
            cur.execute('''
                SELECT COUNT(*) FROM events 
                WHERE approved = TRUE AND EXTRACT(YEAR FROM date) = %s
            ''', (year,))
            approved_count = cur.fetchone()[0]
            event_number = f'МО-{year}-{str(approved_count + 1).zfill(3)}'
        
        additional_dates_raw = body_data.get('additional_dates', []) or []
        additional_dates_list = [d for d in additional_dates_raw if d]
        additional_dates = additional_dates_list if additional_dates_list else None
        additional_dates_sql = "ARRAY[" + ",".join(f"'{d}'::date" for d in additional_dates_list) + "]::date[]" if additional_dates_list else "NULL::date[]"

        cur.execute(f'''
            INSERT INTO events (
                event_number, title, date, time, location, event_type, 
                event_level, sport, description, organizer, responsible_person,
                responsible_position, responsible_phone, max_participants, 
                max_spectators, participants, status, approved, submitted_by,
                additional_dates
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, {additional_dates_sql})
            RETURNING id
        ''', (
            event_number,
            body_data.get('title'),
            event_date,
            body_data.get('time'),
            body_data.get('location'),
            event_type,
            event_level,
            body_data.get('sport'),
            body_data.get('description'),
            body_data.get('organizer'),
            body_data.get('responsible_person'),
            body_data.get('responsible_position'),
            body_data.get('responsible_phone'),
            body_data.get('max_participants', 50),
            body_data.get('max_spectators'),
            body_data.get('participants', 0),
            body_data.get('status', 'upcoming'),
            approved,
            body_data.get('submitted_by')
        ))
        
        event_id = cur.fetchone()[0]
        
        documents = body_data.get('documents', [])
        for doc in documents:
            cur.execute('''
                INSERT INTO event_documents (event_id, name, url)
                VALUES (%s, %s, %s)
            ''', (event_id, doc.get('name'), doc.get('url')))
        
        cur.execute('''
            INSERT INTO event_required_documents (event_id, doc_type, doc_name, uploaded)
            VALUES 
                (%s, 'approval_letter', 'Письмо о согласовании', FALSE),
                (%s, 'police_notification', 'Уведомление ОМВД', FALSE),
                (%s, 'security_plan', 'План ОБ', FALSE),
                (%s, 'regulations', 'Положение', FALSE),
                (%s, 'protocols', 'Протоколы', FALSE)
        ''', (event_id, event_id, event_id, event_id, event_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'event_id': event_id}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка создания события: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_approve_event(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    event_id = params.get('event_id')
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        from datetime import datetime
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute('''
            SELECT title, date, event_type, event_level, submitted_by 
            FROM events 
            WHERE id = %s
        ''', (event_id,))
        event_data = cur.fetchone()
        
        if not event_data:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Мероприятие не найдено'}),
                'isBase64Encoded': False
            }
        
        title, event_date, event_type, event_level, submitted_by = event_data
        year = datetime.strptime(str(event_date), '%Y-%m-%d').year
        
        cur.execute('''
            SELECT COUNT(*) FROM events 
            WHERE approved = TRUE AND EXTRACT(YEAR FROM date) = %s
        ''', (year,))
        approved_count = cur.fetchone()[0]
        
        event_number = None
        if event_type == 'local' and event_level in ('municipal', 'intermunicipal'):
            event_number = f'МО-{year}-{str(approved_count + 1).zfill(3)}'
        
        if event_number:
            cur.execute('UPDATE events SET approved = TRUE, event_number = %s WHERE id = %s', (event_number, event_id))
        else:
            cur.execute('UPDATE events SET approved = TRUE WHERE id = %s', (event_id,))
        
        cur.execute('''
            INSERT INTO event_required_documents (event_id, doc_type, doc_name, uploaded)
            VALUES 
                (%s, 'approval_letter', 'Письмо о согласовании', FALSE),
                (%s, 'police_notification', 'Уведомление ОМВД', FALSE),
                (%s, 'security_plan', 'План ОБ', FALSE),
                (%s, 'regulations', 'Положение', FALSE),
                (%s, 'protocols', 'Протоколы', FALSE)
            ON CONFLICT DO NOTHING
        ''', (event_id, event_id, event_id, event_id, event_id))
        
        conn.commit()
        
        if submitted_by:
            import requests
            try:
                event_number_html = f'<p><strong>Номер мероприятия:</strong> {event_number}</p>' if event_number else ''
                email_data = {
                    'to': submitted_by,
                    'subject': f'Мероприятие одобрено: {title}',
                    'html': f'''
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Мероприятие одобрено!</h2>
                        <p>Здравствуйте!</p>
                        <p>Ваше мероприятие <strong>"{title}"</strong> успешно прошло модерацию и добавлено в календарь.</p>
                        {event_number_html}
                        <p><strong>Дата проведения:</strong> {event_date}</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px;">С уважением,<br>Администрация календаря спортивных мероприятий</p>
                    </div>
                    '''
                }
                requests.post(
                    'https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574',
                    json=email_data,
                    timeout=5
                )
            except Exception as email_error:
                print(f'Ошибка отправки письма: {str(email_error)}')
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'event_number': event_number}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка одобрения события: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_update_event(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    event_id = params.get('event_id')
    body_data = json.loads(event.get('body', '{}'))
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE events SET
                event_number = %s,
                title = %s,
                date = %s,
                time = %s,
                location = %s,
                event_type = %s,
                event_level = %s,
                sport = %s,
                description = %s,
                organizer = %s,
                max_participants = %s,
                max_spectators = %s,
                participants = %s,
                status = %s,
                result = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            body_data.get('event_number'),
            body_data.get('title'),
            body_data.get('date'),
            body_data.get('time'),
            body_data.get('location'),
            body_data.get('event_type'),
            body_data.get('event_level'),
            body_data.get('sport'),
            body_data.get('description'),
            body_data.get('organizer'),
            body_data.get('max_participants'),
            body_data.get('max_spectators'),
            body_data.get('participants'),
            body_data.get('status'),
            body_data.get('result'),
            event_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обновления события: {str(e)}'}),
            'isBase64Encoded': False
        }

def handle_report_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить фактические итоги прошедшего мероприятия (участники, зрители, комментарий)."""
    params = event.get('queryStringParameters', {}) or {}
    event_id = params.get('event_id')
    body_data = json.loads(event.get('body', '{}'))

    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id обязателен'}),
            'isBase64Encoded': False
        }

    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()

        cur.execute('''
            UPDATE events SET
                actual_participants = %s,
                actual_spectators = %s,
                actual_comment = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            body_data.get('actual_participants'),
            body_data.get('actual_spectators'),
            body_data.get('actual_comment'),
            event_id
        ))

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сохранения итогов: {str(e)}'}),
            'isBase64Encoded': False
        }


def handle_delete_event(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    event_id = params.get('event_id')
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute('DELETE FROM event_media WHERE event_id = %s', (event_id,))
        cur.execute('DELETE FROM event_documents WHERE event_id = %s', (event_id,))
        cur.execute('DELETE FROM event_required_documents WHERE event_id = %s', (event_id,))
        cur.execute('DELETE FROM events WHERE id = %s', (event_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка удаления события: {str(e)}'}),
            'isBase64Encoded': False
        }