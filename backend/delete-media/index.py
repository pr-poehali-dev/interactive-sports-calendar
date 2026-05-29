'''
Удаление медиафайлов и документов мероприятия из S3 и БД.
Доступно только администраторам.
'''
import json
import boto3
import os
import psycopg2

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    file_url = body.get('url')
    table = body.get('table')  # 'media' или 'documents'

    if not file_url or table not in ('media', 'documents'):
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Missing url or invalid table'})}

    schema = os.environ.get('MAIN_DB_SCHEMA') or 't_p20079682_interactive_sports_c'
    print(f"[delete-media] table={table} url={file_url} schema={schema}")

    # Удаляем из БД по URL
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    db_table = 'event_media' if table == 'media' else 'event_documents'
    cur.execute(f'DELETE FROM {schema}.{db_table} WHERE url = %s RETURNING id', (file_url,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not deleted:
        return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'File not found in DB'})}

    # Удаляем из S3
    try:
        access_key = os.environ['AWS_ACCESS_KEY_ID']
        cdn_prefix = f'https://cdn.poehali.dev/projects/{access_key}/bucket/'
        if file_url.startswith(cdn_prefix):
            s3_key = file_url[len(cdn_prefix):]
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=access_key,
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            s3.delete_object(Bucket='files', Key=s3_key)
            print(f"[delete-media] s3 deleted key={s3_key}")
    except Exception as e:
        print(f"[delete-media] s3 delete error: {e}")

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True})
    }
