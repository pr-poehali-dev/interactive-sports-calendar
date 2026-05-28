'''
Получение списка мероприятий с медиафайлами, документами и обязательными документами.
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    schema = os.environ.get('MAIN_DB_SCHEMA') or 't_p20079682_interactive_sports_c'
    print(f"[get-events] schema={schema!r} env={os.environ.get('MAIN_DB_SCHEMA')!r}")
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f'''
        SELECT
            e.*,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
                'name', ed.name, 'url', ed.url
            )) FILTER (WHERE ed.id IS NOT NULL), '[]'::json) as documents,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
                'type', em.type, 'name', em.name, 'url', em.url
            )) FILTER (WHERE em.id IS NOT NULL), '[]'::json) as media,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
                'type', erd.doc_type, 'name', erd.doc_name,
                'uploaded', erd.uploaded, 'url', erd.url, 'fileName', erd.file_name
            )) FILTER (WHERE erd.id IS NOT NULL), '[]'::json) as required_documents
        FROM {schema}.events e
        LEFT JOIN {schema}.event_documents ed ON e.id = ed.event_id
        LEFT JOIN {schema}.event_media em ON e.id = em.event_id
        LEFT JOIN {schema}.event_required_documents erd ON e.id = erd.event_id
        GROUP BY e.id
        ORDER BY e.date ASC
    ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    for r in rows:
        if r['id'] == 15:
            print(f"[get-events] event 15 media={r['media']!r}")

    def parse_field(val):
        if val is None: return []
        if isinstance(val, list): return val
        if isinstance(val, str):
            try: return json.loads(val)
            except: return []
        return val

    def serialize(e):
        d = dict(e)
        d['additional_dates'] = [str(dt) for dt in d['additional_dates']] if d.get('additional_dates') else []
        d['media'] = parse_field(d.get('media'))
        d['documents'] = parse_field(d.get('documents'))
        d['required_documents'] = parse_field(d.get('required_documents'))
        return d

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'events': [serialize(e) for e in rows]}, default=str),
        'isBase64Encoded': False
    }