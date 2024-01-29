import os
import json
import psycopg2
import boto3

from aws import Textract
from gpt import gpt_parse_tasks


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

# S3
s3_client = boto3.client('s3')


def fetch_file(url):
    bucket_key = url.split('amazonaws.com/')[1]
    s3_response = s3_client.get_object(Bucket='syllabus-scanner', Key=bucket_key)
    body = s3_response['Body']
    
    b = b''
    for i in body:
        b += i
    
    return bytearray(b)

def fetch_document(cursor, id):
    cursor.execute(f'SELECT * FROM documents WHERE id={id}')
    row = cursor.fetchone()

    return { 'id': row[0], 'title': row[1], 'file_url': row[2], 'is_outline': row[3], 'project_id': row[4] }

def fetch_documents(cursor, whereclause=None):
    if whereclause:
        cursor.execute(f'SELECT * FROM DOCUMENTS WHERE {whereclause}')
    else:
        cursor.execute('SELECT * FROM DOCUMENTS')

    rows = [{ 'id': row[0], 'title': row[1], 'file_url': row[2], 'is_outline': row[3], 'project_id': row[4] } for row in cursor.fetchall()]
    return rows

def build_response(p, r, t=None):
    body = { param : value for param, value in p.items() }
    body['records'] = r

    if t is not None:
        body['scannedTasks'] = t
    
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)

    return response

def lambda_handler(event, context):
    # parse query string parameters
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }

    # connect to table schema
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    
    # get data from sql table
    records = []
    scannedTasks = None
    if params.get('id'):
        doc = fetch_document(cur, params['id'])
        records.append(doc)

        # extract tasks from outline
        if params.get('outline') and params.get('extract'):
            if params['outline']:
                if params['extract'] == 'gpt':
                    extractor = Textract()
                    text = extractor.extract_text(fetch_file(doc['file_url']))
                    scannedTasks = gpt_parse_tasks(text)

                elif params['extract'] == 'textract':
                    extractor = Textract()
                    scannedTasks = extractor.extract_task(fetch_file(doc['file_url']))

    elif params.get('outline'):
        docs = fetch_documents(cur, f"outline={params['outline']}")
        records = [doc for doc in docs]

    else:
        docs = fetch_documents(cur)
        records = [doc for doc in docs]

    # close connection to db
    conn.commit()
    cur.close()
    conn.close()

    # build & return response
    resp = build_response(params, records, scannedTasks)
    return resp
