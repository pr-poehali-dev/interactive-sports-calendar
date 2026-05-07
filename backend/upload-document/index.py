'''
Загрузка документов к мероприятиям: S3 хранилище + запись в event_documents
Args: event - dict с httpMethod, body (base64 файл), event_id, fileName, fileContent
Returns: HTTP response с URL файла
'''
import json
import base64
import boto3
import os
import psycopg2
import uuid
from datetime import datetime
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-User-Id',
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

    file_name: str = body_data.get('fileName', 'document.pdf')
    file_content_b64: str = body_data.get('fileContent', '')
    event_id = body_data.get('event_id') or body_data.get('eventId')
    document_type: str = body_data.get('documentType') or body_data.get('document_type')

    if not file_content_b64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'File content is required'}),
            'isBase64Encoded': False
        }

    file_content = base64.b64decode(file_content_b64)
    file_id = str(uuid.uuid4())
    extension = file_name.rsplit('.', 1)[-1] if '.' in file_name else 'pdf'
    unique_file_name = f"{file_id}.{extension}"
    folder = f"events/{event_id}/documents" if event_id else "documents"
    s3_key = f"{folder}/{unique_file_name}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    s3.put_object(
        Bucket='files',
        Key=s3_key,
        Body=file_content,
        ContentType='application/octet-stream'
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    if event_id:
        schema = os.environ['MAIN_DB_SCHEMA']
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        cur.execute(
            f'INSERT INTO {schema}.event_documents (event_id, name, url, uploaded_at) VALUES (%s, %s, %s, %s) RETURNING id',
            (event_id, file_name, cdn_url, datetime.now())
        )
        doc_id = cur.fetchone()[0]

        if document_type:
            cur.execute(
                f'UPDATE {schema}.event_required_documents SET uploaded = true, url = %s, file_name = %s WHERE event_id = %s AND doc_type = %s',
                (cdn_url, file_name, event_id, document_type)
            )

        conn.commit()
        cur.close()
        conn.close()
    else:
        doc_id = file_id

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'url': cdn_url,
            'fileName': file_name,
            'fileId': str(doc_id)
        }),
        'isBase64Encoded': False
    }
