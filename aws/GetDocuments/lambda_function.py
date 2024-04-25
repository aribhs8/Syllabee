import os
import json
import psycopg2


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']


def fetch_document(cursor, id):
    cursor.execute(f'EXECUTE getSpecifiedDoc({id})')
    row = cursor.fetchone()

    return { 
        'id': row[0],
        'title': row[1],
        'file_url': row[2],
        'is_outline': row[3],
        'project_id': row[4],
        'text_url': row[6]
    }

def fetch_documents(cursor, column=None):
    if column:
        if column['name'] == 'project_id':
            cursor.execute(f"EXECUTE getProjectDocs({column['value']})")
        elif column['name'] == 'user_id':
            cursor.execute(f"EXECUTE getUserDocs({column['value']})")
        elif column['name'] == 'outline':
            cursor.execute(f"EXECUTE getOutlines({column['value']})")
    else:
        cursor.execute('SELECT * FROM DOCUMENTS')

    rows = [{ 
        'id': row[0],
        'title': row[1],
        'file_url': row[2],
        'is_outline': row[3],
        'project_id': row[4],
        'text_url': row[6]
    } for row in cursor.fetchall()]
    
    return rows

def build_response(p, r):
    body = { param : value for param, value in p.items() }
    body['records'] = r
    
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

    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    
    # specify prepared statements
    cur.execute('PREPARE getSpecifiedDoc AS SELECT * FROM documents WHERE id=$1')
    cur.execute('PREPARE getProjectDocs AS SELECT * FROM documents WHERE project_id=$1')
    cur.execute("""
        PREPARE getUserDocs AS 
        SELECT *
        FROM documents 
        JOIN projects ON documents.project_id = projects.id
        WHERE documents.user_id = $1 OR $1 = ANY(projects.members)
        """)
    cur.execute('PREPARE getOutlines AS SELECT * FROM documents WHERE outline=$1')
    
    records = []
    if params.get('id'):
        doc = fetch_document(cur, params['id'])
        records.append(doc)

    elif params.get('outline'):
        docs = fetch_documents(
            cur, 
            { 'name': 'outline', 'value': params['outline'] }
        )
        records = [doc for doc in docs]
        
    elif params.get('project_id'):
        docs = fetch_documents(
            cur, 
            { 'name': 'project_id', 'value': params['project_id'] }
        )
        records = [doc for doc in docs]
    
    elif params.get('user_id'):
        docs = fetch_documents(
            cur, 
            { 'name': 'user_id', 'value': params['user_id'] }
        )
        records = [doc for doc in docs]
    
    else:
        docs = fetch_documents(cur)
        records = [doc for doc in docs]
        
    # remove prepared statements for next use
    cur.execute('DEALLOCATE getSpecifiedDoc');
    cur.execute('DEALLOCATE getProjectDocs')
    cur.execute('DEALLOCATE getUserDocs')
    cur.execute('DEALLOCATE getOutlines')

    # close connection to db
    conn.commit()
    cur.close()
    conn.close()

    # build & return response
    resp = build_response(params, records)
    return resp
