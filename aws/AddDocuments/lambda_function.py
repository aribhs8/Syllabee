import os
import io
import json
import boto3
import base64
import psycopg2
from uuid import uuid4

from requests_toolbelt import MultipartDecoder
from aws import Textract
from gpt import gpt_summarize_text

# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

# S3 settings
s3 = boto3.resource('s3')
bucket_name = os.environ['S3_BUCKET_NAME']


def fetch_document(cursor):
    cursor.execute('SELECT * FROM documents WHERE id=(SELECT max(id) FROM documents);')
    row = cursor.fetchone()

    return { 
        'id': row[0], 
        'title': row[1], 
        'file_url': row[2], 
        'is_outline': row[3], 
        'project_id': row[4]
    }

def build_response(doc):
    body = {}
    body['document'] = doc

    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    return response

def lambda_handler(event, context):
    params = event['queryStringParameters']
    payload = json.loads(event['body'])
    
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    
    cur.execute('PREPARE deleteDoc AS DELETE FROM documents WHERE id=$1')
    cur.execute('PREPARE updateDoc AS UPDATE documents SET title=$1, outline=$2 WHERE id=$3')
    cur.execute('PREPARE insertDoc AS INSERT INTO documents(title, file_url, outline, user_id) VALUES ($1, $2, $3, $4)')
    cur.execute('PREPARE insertProjectDoc AS INSERT INTO documents(title, file_url, outline, project_id, user_id) VALUES ($1, $2, $3, $4, $5)')
    cur.execute('PREPARE insertOutline AS INSERT INTO projectoutlinesummaries(project_id, outline_summary) VALUES ($1, $2)')

    doc = None
    if params.get('option'):
        if params['option'] == 'add':
            doc_title = payload['title']
            file = payload['file']
            filename = payload['filename']
            is_outline = True
            project_id = payload['project_id']
            if(project_id == ''):
                project_id = None
            user_id = payload['user_id']
            
            # temporary (remove conditionals once cleanup completed)
            if payload.get('outline') is not None:
                is_outline = payload['outline']
            
            if payload.get('user_id'):
                user_id = payload['user_id']
            
            filename, file_ext = os.path.splitext(filename)
            filename = filename + '_' + str(uuid4()) + file_ext
            
            bucket = s3.Bucket(bucket_name)
            bucket.upload_fileobj(io.BytesIO(base64.b64decode(file)), f'documents/{filename}', ExtraArgs={"ACL": "public-read"})
            file_url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/documents/{filename}"

            method = 1

            if filename.endswith('.pdf'):
                method = 2
            
            extractor = Textract(bucket_name)
            print("OVER HERE")
            print(filename)

            if method == 1:
                text = extractor.extract_text_synchronous(f'documents/{filename}')
            else:
                print("OVER HERE2")

                text = extractor.extract_text_asynchronous(f'documents/{filename}')
            
            print(text)
            print("OVER HERE3")
            summary = gpt_summarize_text(text)


            if project_id is None:
                cur.execute(f"EXECUTE insertDoc('{doc_title}', '{file_url}', {is_outline}, '{user_id}')")
            else:
                cur.execute(f"EXECUTE insertProjectDoc('{doc_title}', '{file_url}', {is_outline}, '{project_id}', '{user_id}')")
                cur.execute("EXECUTE insertOutline(%s, %s)", (project_id, summary))

            doc=fetch_document(cur)
            
        elif params['option'] == 'delete':
            doc_id = payload['id']
            cur.execute(f'EXECUTE deleteDoc({doc_id})')
            
        elif params['option'] == 'edit':
            doc_id = payload['id']
            doc_title = payload['title']
            is_outline = payload['outline']
            cur.execute(f"EXECUTE updateDoc('{doc_title}', {is_outline}, {doc_id})")
            
    cur.execute('DEALLOCATE deleteDoc')
    cur.execute('DEALLOCATE updateDoc')
    cur.execute('DEALLOCATE insertDoc')
    cur.execute('DEALLOCATE insertProjectDoc')

    conn.commit()
    cur.close()
    conn.close()
    
    response = build_response(doc)
    return response
