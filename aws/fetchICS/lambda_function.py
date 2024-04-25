import os
import json
import psycopg2


db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

def build_response(body):
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    
    return response

def lambda_handler(event, context):
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { 
            param: value 
            for param, value in event['queryStringParameters'].items() 
        }
        
    user_id = params['user_id']
    
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    cur.execute('PREPARE getICS AS SELECT * FROM users WHERE user_id=$1')
    
    cur.execute(f"EXECUTE getICS('{user_id}')")
    row = cur.fetchone()
    if row is None:
        body = {'user_id': user_id, 'file_url': None}
    else:
        body = {'user_id': row[0], 'file_url': row[1]}
    
    cur.execute('DEALLOCATE getICS')
    
    conn.commit()
    cur.close()
    conn.close()
        
    resp = build_response(body)
    return resp
