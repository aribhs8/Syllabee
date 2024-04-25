import os
import json
import boto3
import psycopg2
import datetime
from ics import Calendar, Event
from uuid import uuid4

db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

bucket = os.environ['S3_BUCKET_NAME']
folder = 'calendars'
s3_client = boto3.resource('s3')


def build_response(id, f):
    body = {}
    body['user_id'] = id
    body['file_url'] = f
    
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    
    return response

def lambda_handler(event, context):
    payload = json.loads(event['body'])
    params = payload['params']
    
    user_id = params['userId']
    file_url = ''
    events = params.get('events')
    revoke = params.get('revoke')
    
    if events is not None:
        c = Calendar()
        for event in events:
            name = event['title']
            begin = datetime.datetime.strptime(event['start'], '%Y-%m-%d')
            
            b = begin.strftime('%Y-%m-%d %H:%M:%S')
            e = Event(name=name, begin=b)
            e.make_all_day()
            c.events.add(e)
            
        filename = params['filename'].split('calendars/')[1] if params.get('filename') and not revoke else f'{user_id}/{uuid4()}.ics'
        name = filename.split('/')[1]
        
        with open(f'/tmp/{name}', 'w+') as f:
            f.writelines(c.serialize_iter())
            
        with open(f'/tmp/{name}', 'rb') as f:
            bk = s3_client.Bucket(bucket)
            bk.upload_fileobj(f, f'calendars/{filename}', ExtraArgs={"ACL": "public-read"})
            
        file_url = f"https://{bucket}.s3.us-east-2.amazonaws.com/calendars/{filename}"
        conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
        cur = conn.cursor()
        cur.execute('SET search_path = users')
        cur.execute(
            """
            PREPARE editICS AS
            INSERT INTO users (user_id, calendar)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET calendar=$2
            """
        )
        
        cur.execute(f"EXECUTE editICS('{user_id}', '{file_url}')")
        cur.execute('DEALLOCATE editICS')
        conn.commit()
        cur.close()
        conn.close()
        
    resp = build_response(user_id, file_url)
    return resp
    