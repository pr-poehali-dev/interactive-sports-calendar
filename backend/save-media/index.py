'''
Загрузка медиафайлов к мероприятиям в S3 и запись в БД.
'''
import json
import base64
import boto3
import os
import psycopg2
from datetime import datetime
import uuid

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    event_id = body.get('event_id')
    file_type = body.get('file_type')
    file_name = body.get('file_name')
    file_data = body.get('file_data')
    mime_type = body.get('mime_type')
    document_type = body.get('document_type')

    if not all([event_id, file_type, file_name, file_data]):
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Missing required fields'})}

    file_content = base64.b64decode(file_data)
    file_size = len(file_content)

    file_extension = file_name.split('.')[-1] if '.' in file_name else ''
    unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
    s3_key = f"events/{event_id}/{file_type}/{unique_filename}"

    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    s3.put_object(Bucket='files', Key=s3_key, Body=file_content, ContentType=mime_type or 'application/octet-stream')

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    schema = os.environ.get('MAIN_DB_SCHEMA') or 't_p20079682_interactive_sports_c'
    print(f"[save-media] schema={schema!r} event_id={event_id} file_type={file_type}")

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if file_type == 'document':
        cur.execute(f'''
            INSERT INTO {schema}.event_documents (event_id, name, url, uploaded_at)
            VALUES (%s, %s, %s, %s) RETURNING id
        ''', (event_id, file_name, cdn_url, datetime.now()))
    else:
        cur.execute(f'''
            INSERT INTO {schema}.event_media (event_id, type, name, url, uploaded_at)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        ''', (event_id, file_type, file_name, cdn_url, datetime.now()))

    media_id = cur.fetchone()[0]

    if document_type:
        cur.execute(f'''
            UPDATE {schema}.event_required_documents
            SET uploaded = true, url = %s, file_name = %s
            WHERE event_id = %s AND doc_type = %s
        ''', (cdn_url, file_name, event_id, document_type))

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'id': media_id, 'url': cdn_url, 'file_name': file_name, 'file_size': file_size})
    }
