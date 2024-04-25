import os
import json
import psycopg2
import boto3


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

cognito_client = boto3.client('cognito-idp')

user_pool_id = 'us-east-2_JsONbQ14O'

def getUserInfo(user_id):
    info = {}
    response = cognito_client.list_users(
        UserPoolId=user_pool_id,
        AttributesToGet=[
            'name',
            'email'
        ],
        Filter='sub="'+user_id+'"'
    )
    
    info['user_id'] = user_id
    print("USSUSUSUSER" + user_id)
    info['name'] = response['Users'][0]['Attributes'][0]['Value']
    print([info['name']])

    info['email'] = response['Users'][0]['Attributes'][1]['Value']
    
    return info
    

def fetch_project(cursor, id, members=False):
    cursor.execute(f'EXECUTE getSpecifiedProject({id})')
    row = cursor.fetchone()
    
    membersInfo = []
    if(row[6] != None and len(row[6]) > 0):
        for user_id in row[6]:
            membersInfo.append(getUserInfo(user_id))
    
    if members:
        return membersInfo
        
    return { 
        'id': row[0], 
        'title': row[1], 
        'description': row[2], 
        'owner': row[3], 'owner_id': row[5],
        'shared': row[4], 'members': membersInfo
    }

def fetch_projects(cursor, owner_id=None, shared=False):
    if owner_id:
        if shared:
            cursor.execute(f'SELECT * FROM PROJECTS WHERE {owner_id} = ANY(members)')
        else:
            cursor.execute(f'EXECUTE getIndividualProject({owner_id})')
            # cursor.execute(f'SELECT * FROM PROJECTS WHERE owner_id={whereclause}')
    else:
        cursor.execute('SELECT * FROM PROJECTS')

    rows = []
    for row in cursor.fetchall():
        membersInfo = []
        if(row[6] != None and len(row[6]) > 0):
            for user_id in row[6]:
                membersInfo.append(getUserInfo(user_id))
        rows.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'owner': row[3], 'owner_id': row[5],
            'shared': row[4], 'members': membersInfo
        })
    
    return rows

def build_response(p, r):
    body = { param : value for param, value in p.items() }
    body['records'] = r

    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    
    return response

def lambda_handler(event, context):
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }

    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path=users')
    
    cur.execute('PREPARE getSpecifiedProject AS SELECT * FROM projects WHERE id=$1')
    cur.execute('PREPARE getIndividualProject AS SELECT * FROM projects WHERE owner_id=$1')

    records = []
    if params.get('id'):
        if params.get('members'):
            records = fetch_project(cur, params['id'], True)
            
        else:
            project = fetch_project(cur, params['id'])
            records.append(project)
            
    
    elif params.get('owner_id'):
        if params.get('shared'):
            records = fetch_projects(cur, params['owner_id'], True)
        else:
            records = fetch_projects(cur, params['owner_id'])
        
    else:
        records = fetch_projects(cur)
        
    cur.execute('DEALLOCATE getSpecifiedProject')
    cur.execute('DEALLOCATE getIndividualProject')
    
    conn.commit()
    cur.close()
    conn.close()

    # build and return response
    resp = build_response(params, records)
    return resp
