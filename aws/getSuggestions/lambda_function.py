import json
import os
import openai
from collections import deque
from search import searchText
import psycopg2
import boto3
from urllib.parse import urlparse

openai.api_key = os.environ['OPENAI_API_KEY']
# rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']
bucket = os.environ['S3_BUCKET_NAME']

def extract_keywords(text):
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {
                'role': 'system',
                'content': 'You will be provided with a block of text, and your task is to extract a list of keywords from it. Just return the keywords separated by commas'
            },
            {
                'role': 'user',
                'content': text
            }
        ],
        temperature=0.5,
        max_tokens=64,
        top_p=1
    )
    
    result = response['choices'][0]['message']['content']
    print(result)
    return result.split(',')

def get_documents(cursor, projectId):
    cursor.execute(f"EXECUTE getTextFiles({projectId})")
    
    rows = [
        { 
        'doc_id': row[0],
        'title': row[1],
        'url': row[2],
        } for row in cursor.fetchall()]
    
    return rows
    
def get_text_content_from_s3(url):
    # Parse S3 URL
    parsed_url = urlparse(url)
    object_key = parsed_url.path[1:]
    print(object_key)
    # Create an S3 client
    s3_client = boto3.client('s3')

    # Download object content
    try:
        response = s3_client.get_object(Bucket=bucket, Key=object_key)
        text_content = response['Body'].read().decode('utf-8')
        
        return text_content

    except Exception as e:
        print("Error reading file from S3: {}".format(str(e)))
        return None
        
def search_documents(cur, keywords, projectId):
    
    search = searchText()
    search.build_trie(keywords)
    search.build_failure_links()
  
    # Example usage:
    text = "This is a sample text with Unit 1 and material mentioned. Bluds also mention unit 2 fam"
    documents = get_documents(cur, projectId)
    
    response = []
    
    for document in documents:
        doc_id, title, url = document['doc_id'], document['title'], document['url']
        if url is not None:
            text = get_text_content_from_s3(url)
            if text is not None:
                text += " " + title
                matches = search.search_keywords(text)
                if len(matches) > 0:
                    response.append({'title': title, 'doc_id':doc_id, 'matches': matches })
    
    return response
  

def build_response(params):
    body = { param : value for param, value in params.items() }
    
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)

    return response

def lambda_handler(event, context):
    
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    
     # specify prepared statements
    cur.execute('PREPARE getTextFiles AS SELECT id, title, text_url FROM documents WHERE project_id=$1 AND outline=false')
  
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }
        
    
    keywords = extract_keywords(params['text'])
    if len(keywords) > 0:
        params['results'] = search_documents(cur, keywords, params['projectId'])
    else:
        params['results'] = []
        
    # remove prepared statements for next use
    cur.execute('DEALLOCATE getTextFiles');
    
    conn.commit()
    cur.close()
    conn.close()
    
    resp = build_response(params)
    print(resp)
    return resp