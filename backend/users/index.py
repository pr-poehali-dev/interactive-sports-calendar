import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление пользователями - регистрация, получение списка, одобрение
    Args: event с httpMethod, body, queryStringParameters
          context с request_id
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    # GET - получить всех пользователей
    if method == 'GET':
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, email, name, phone, user_type, approved, submitted_at,
                   birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by,
                   inn, company_name, legal_address
            FROM users
            ORDER BY submitted_at DESC
        """)
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            user = {
                'id': row[0],
                'email': row[1],
                'name': row[2],
                'phone': row[3],
                'userType': row[4],
                'approved': row[5],
                'submittedAt': row[6].isoformat() if row[6] else None,
                'birthDate': row[7].isoformat() if row[7] else None,
                'passportSeries': row[8],
                'passportNumber': row[9],
                'passportIssueDate': row[10].isoformat() if row[10] else None,
                'passportIssuedBy': row[11],
                'inn': row[12],
                'companyName': row[13],
                'legalAddress': row[14]
            }
            users.append(user)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users}),
            'isBase64Encoded': False
        }
    
    # POST - регистрация нового пользователя
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        email = body_data.get('email')
        password = body_data.get('password')
        name = body_data.get('name')
        phone = body_data.get('phone')
        user_type = body_data.get('userType')
        
        if not all([email, password, name, phone, user_type]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Проверка существующего пользователя
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User with this email already exists'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            INSERT INTO users (
                email, password, name, phone, user_type,
                birth_date, passport_series, passport_number, passport_issue_date, passport_issued_by,
                inn, company_name, legal_address
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            email, password, name, phone, user_type,
            body_data.get('birthDate'), body_data.get('passportSeries'), body_data.get('passportNumber'),
            body_data.get('passportIssueDate'), body_data.get('passportIssuedBy'),
            body_data.get('inn'), body_data.get('companyName'), body_data.get('legalAddress')
        ))
        user_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'id': user_id, 'message': 'User registered successfully'}),
            'isBase64Encoded': False
        }
    
    # PUT - одобрение или отклонение пользователя
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email')
        action = body_data.get('action')  # 'approve' or 'reject'
        
        if not email or not action:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing email or action'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if action == 'approve':
            cur.execute("UPDATE users SET approved = TRUE WHERE email = %s", (email,))
        elif action == 'reject':
            cur.execute("DELETE FROM users WHERE email = %s", (email,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': f'User {action}d successfully'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
