import json
import boto3
import os
import psycopg2

from gpt import gpt_parse_tasks
from aws import Textract


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

bucket_name = os.environ['S3_BUCKET_NAME']
s3_client = boto3.client('s3')
s3_resource = boto3.resource('s3')


def build_response(params, tasks):
    body = { param : value for param, value in params.items() }
    body['tasks'] = tasks
    
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)

    return response
    
def fetch_file(url):
    bucket_key = url.split('amazonaws.com/')[1]
    s3_response = s3_client.get_object(Bucket=bucket_name, Key=bucket_key)
    body = s3_response['Body']
    
    b = b''
    for i in body:
        b += i
    
    return bytearray(b)
    
def upload_text(filename, text):
    name, ext = os.path.splitext(filename)
    
    with open(f'/tmp/{name}.txt', 'w+') as f:
        f.write(text)
        
    with open(f'/tmp/{name}.txt', 'rb') as f:
        bucket = s3_resource.Bucket(bucket_name)
        bucket.upload_fileobj(f, f'documents/{name}.txt', ExtraArgs={"ACL": "public-read"})
    
    file_url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/documents/{name}.txt"
    return file_url

def lambda_handler(event, context):
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }
        
    text = params.get('text')
    protocol = params['protocol']
    file_url = params.get('file_url')
    doc_id = params.get('id')
    
    if protocol == 'gpt':
        tasks = gpt_parse_tasks(text)
    else:
        extractor = Textract()
        tasks, text = extractor.extract_tasks(fetch_file(file_url))
        
        file = file_url.split('amazonaws.com/')[1]
        url = upload_text(file.split('documents/')[1], text)
    
        conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                                password=db_pw, port=5432)
        cur = conn.cursor()
        cur.execute('SET search_path = users')
        cur.execute('PREPARE updateDoc AS UPDATE documents SET text_url=$1 WHERE id=$2')
        cur.execute(f"EXECUTE updateDoc('{url}', {doc_id})")
        cur.execute('DEALLOCATE updateDoc')
    
        conn.commit()
        cur.close()
        conn.close()
    
    response = build_response(params, tasks)
    return response
