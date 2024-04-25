import os
import json
import psycopg2


# RDS settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

def fetch_project(cursor):
    cursor.execute('SELECT * FROM projects WHERE id=(SELECT max(id) FROM projects);')
    row = cursor.fetchone()

    return { 'id': row[0], 'title': row[1], 'description': row[2], 'owner': row[3], 'owner_id': row[4] }

def build_response(project):
    body = {}
    body['project'] = project

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
    
    cur.execute('PREPARE insertProject AS INSERT INTO projects(title, description, owner, owner_id, members) VALUES ($1, $2, $3, $4, $5)')
    cur.execute('PREPARE deleteProject AS DELETE FROM projects WHERE id=$1')
    cur.execute('PREPARE updateProject AS UPDATE projects SET title=$1, description=$2 WHERE id=$3')
    
    project = None
    if params.get('option'):
        if params['option'] == 'add':
            # parse payload
            title = payload['title']
            description = payload['description']
            owner = payload['owner']
            owner_id = payload['owner_id']
            
            # add project to schema
            cur.execute(f"EXECUTE insertProject('{title}', '{description}', '{owner}', '{owner_id}', ARRAY['{owner_id}'])")
            project = fetch_project(cur)
            
        elif params['option'] == 'delete':
            # parse payload
            project_id = payload['id']
            project = cur.execute(f'SELECT * FROM projects WHERE id={project_id}')
            cur.execute(f'EXECUTE deleteProject({project_id})')
            # cur.execute(f"DELETE FROM projects WHERE id={project_id}")
            
        elif params['option'] == 'edit':
            project_id = payload['id']
            title = payload['title']
            description = payload['description']
            cur.execute(f"EXECUTE updateProject('{title}', '{description}', {project_id})")
        
        elif params['option'] == 'add_member' or params['option'] == 'remove_member':
            sqlValue = 'append' if params['option'] == 'add_member' else 'remove'
            project_id = payload['id']
            user_id = payload['user_id']
            cur.execute(f"UPDATE projects SET members=array_{sqlValue}(members, '{user_id}') WHERE id={project_id}")
            if params['option'] == 'remove_member':
                cur.execute(f"UPDATE tasks SET assignee_id = NULL WHERE assignee_id = '{user_id}' AND project_id = {project_id}")
            
    cur.execute('DEALLOCATE insertProject')
    cur.execute('DEALLOCATE deleteProject')
    cur.execute('DEALLOCATE updateProject')
            
    conn.commit()
    cur.close()
    conn.close()
    
    response = build_response(project)
    
    return response
