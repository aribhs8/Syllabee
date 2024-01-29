import os
import json
import psycopg2


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']


def fetch_project(cursor, id):
    cursor.execute(f'SELECT * FROM PROJECTS WHERE id={id}')
    row = cursor.fetchone()

    return { 
        'id': row[0], 
        'title': row[1], 
        'description': row[2], 
        'owner': row[3], 'owner_id': row[4],
        'shared': row[5], 'shared_with': row[6]
    }

def fetch_projects(cursor, whereclause=None):
    if whereclause:
        cursor.execute(f'SELECT * FROM PROJECTS WHERE {whereclause}')
    else:
        cursor.execute('SELECT * FROM PROJECTS')

    rows = []
    for row in cursor.fetchall():
        rows.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'owner': row[3], 'owner_id': row[4],
            'shared': row[5], 'shared_with': row[6]
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

def lambda_handler(event, context):
    # handle params
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }

    # connect to table schema
    conn = psycopg2.connect(host=rds_host, db_name=db_name, user=db_username, password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path=users')

    # get data from table
    records = []
    if params.get('id'):
        project = fetch_project(cur, params['id'])
        records.append(project)

    else:
        projects = fetch_projects(cur)
        records = [project for project in projects]

    # close conn to db
    conn.commit()
    cur.close()
    conn.close()

    # build and return response
    resp = build_response(params, records)
    return resp
