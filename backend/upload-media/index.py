'''
Business: Upload event media files (photos and videos) to cloud storage
Args: event - dict with httpMethod, body (base64 encoded file), headers
      context - object with request_id attribute
Returns: HTTP response with file URL
'''
import json
import base64
import uuid
import os
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    file_name: str = body_data.get('fileName', 'media.jpg')
    file_content_b64: str = body_data.get('fileContent', '')
    file_type: str = body_data.get('fileType', 'image')
    
    if not file_content_b64:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'File content is required'}),
            'isBase64Encoded': False
        }
    
    # Generate unique file name
    file_id = str(uuid.uuid4())
    extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    unique_file_name = f"{file_id}.{extension}"
    
    # For demo: return mock URL with file type
    folder = 'photos' if file_type == 'image' else 'videos'
    file_url = f"https://storage.example.com/{folder}/{unique_file_name}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'url': file_url,
            'fileName': file_name,
            'fileId': file_id,
            'fileType': file_type
        }),
        'isBase64Encoded': False
    }
