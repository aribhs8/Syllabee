import os
import json
import boto3
import psycopg2

from aws import Textract


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

bucket = os.environ['S3_BUCKET_NAME']
folder = 'documents'

def build_response(params, text):
    body = { param : value for param, value in params.items() }
    body['text'] = text
    
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    
    return response

def lambda_handler(event, context):
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }
        
    doc_id = params['id']
    filename = f"documents/{params['filename']}"
    method = 1
    
    if filename.endswith('.pdf'):
        method = 2
    
    extractor = Textract(bucket)
    if method == 1:
        text = extractor.extract_text_synchronous(filename)
    else:
        text = extractor.extract_text_asynchronous(filename)
    
    file_url = extractor.upload_text(filename.split('/')[1], text)
    
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    cur.execute('PREPARE updateDoc AS UPDATE documents SET text_url=$1 WHERE id=$2')
    cur.execute(f"EXECUTE updateDoc('{file_url}', {doc_id})")
    cur.execute('DEALLOCATE updateDoc')
    
    conn.commit()
    cur.close()
    conn.close()
    
    response = build_response(params, text)
    return response
