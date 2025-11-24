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
                'Access-Control-Allow-Headers': 'Content-Type',
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