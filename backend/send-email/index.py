import json
import smtplib
import socket
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email уведомлений пользователям
    Args: event с httpMethod, body (to, subject, html)
          context с request_id
    Returns: HTTP response с результатом отправки
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    to_email = body_data.get('to')
    subject = body_data.get('subject')
    html_content = body_data.get('html')
    
    if not to_email or not subject or not html_content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields: to, subject, html'}),
            'isBase64Encoded': False
        }
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'SMTP credentials not configured'}),
            'isBase64Encoded': False
        }
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'Истра События <{smtp_user}>'
    msg['To'] = to_email
    msg['Reply-To'] = smtp_user
    
    # Добавляем заголовки для уменьшения вероятности попадания в спам
    msg['X-Mailer'] = 'Python SMTP'
    msg['X-Priority'] = '3'
    
    # Создаем текстовую версию из HTML (простое удаление тегов)
    import re
    text_content = re.sub('<[^<]+?>', '', html_content)
    text_content = re.sub(r'\s+', ' ', text_content).strip()
    
    # Добавляем сначала текстовую версию, потом HTML
    text_part = MIMEText(text_content, 'plain', 'utf-8')
    html_part = MIMEText(html_content, 'html', 'utf-8')
    
    msg.attach(text_part)
    msg.attach(html_part)
    
    try:
        print(f'Connecting to SMTP {smtp_host}:{smtp_port}')
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        print('SMTP connection established')
        
        server.starttls()
        print('TLS started')
        
        server.login(smtp_user, smtp_password)
        print('SMTP login successful')
        
        server.send_message(msg)
        print(f'Email sent to {to_email}')
        
        server.quit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': f'Email sent to {to_email}'}),
            'isBase64Encoded': False
        }
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f'SMTP authentication failed: {str(e)}'
        print(error_msg)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': error_msg, 'type': 'auth'}),
            'isBase64Encoded': False
        }
    except smtplib.SMTPException as e:
        error_msg = f'SMTP error: {str(e)}'
        print(error_msg)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': error_msg, 'type': 'smtp'}),
            'isBase64Encoded': False
        }
    except socket.timeout as e:
        error_msg = f'SMTP timeout: connection to {smtp_host}:{smtp_port} timed out'
        print(error_msg)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': error_msg, 'type': 'timeout'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        error_msg = f'Failed to send email: {str(e)}'
        print(error_msg)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': error_msg, 'type': 'unknown'}),
            'isBase64Encoded': False
        }