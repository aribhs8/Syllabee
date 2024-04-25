import os
import json
import psycopg2
import boto3


# rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'

task_status_map = {
    0: 'To Do',
    1: 'In Progress',
    2: 'Done'
}

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
    if len(response['Users']) == 0:
        return 
    info['name'] = response['Users'][0]['Attributes'][0]['Value']
    info['email'] = response['Users'][0]['Attributes'][1]['Value']
    
    return info


def fetch_task(cursor, id):
    cursor.execute(f'EXECUTE getSpecifiedTask({id})')
    # cursor.execute(f'SELECT * FROM TASKS WHERE id={id}')
    row = cursor.fetchone()
  
    return {
        'id': row[0],
        'title': row[1],
        'note': row[2],
        'date': str(row[3]),
        'outline': row[4],
        'project': row[5],
        'assignee': getUserInfo(row[6]) if row[6] != None else row[6],
        'status': task_status_map[row[7]],
        'priority': row[8],
        'completion_date': str(row[9])
    }
    
def fetch_tasks(cursor, column=None):
    if column:
        if column['name'] == 'project_id':
            cursor.execute(f"EXECUTE getProjectTasks({column['value']})")
        elif column['name'] == 'outline_id':
            cursor.execute(f"EXECUTE getTasksFromDoc({column['value']})")
        elif column['name'] == 'user_id':
            cursor.execute(f"EXECUTE getUserTasks('{column['value']}')")
    else:
        cursor.execute('SELECT * FROM TASKS')

    rows = [
        { 
        'id': row[0], 
        'title': row[1],
        'note': row[2],
        'date': str(row[3]),
        'outline': row[4],
        'project': row[5],
        'assignee': getUserInfo(row[6]) if row[6] != None else row[6],
        'status': task_status_map[row[7]],
        'priority': row[8],
        'completion_date': str(row[9])
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
        params = { param: value for param, value in event['queryStringParameters'].items() }
        
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path = users')
    
    # specify prepared statements
    cur.execute('PREPARE getSpecifiedTask AS SELECT * FROM tasks WHERE id=$1')
    cur.execute('PREPARE getProjectTasks AS SELECT * FROM tasks WHERE project_id=$1')
    cur.execute('PREPARE getTasksFromDoc AS SELECT * FROM tasks WHERE outline_id=$1')
    
    cur.execute(
        """
        PREPARE getUserTaskDates AS
        SELECT
        	tasks.id, tasks.title, tasks.date, tasks.project_id, tasks.assignee_id,
        	projects.title, projects.owner_id, projects.members
        FROM tasks
        JOIN projects ON tasks.project_id = projects.id
        WHERE 
        tasks.date IS NOT NULL AND (
            projects.owner_id = $1 OR
            $1 = ANY(projects.members)
        )
        """
    )
    
    cur.execute(
        """
        PREPARE getRecTasks AS
        SELECT
        	tasks.id, tasks.title, tasks.date, tasks.project_id, tasks.assignee_id,
        	projects.title, projects.owner_id, projects.members
        FROM tasks
        JOIN projects ON tasks.project_id = projects.id
        WHERE
        tasks.assignee_id=$1 OR (
        	projects.owner_id=$1
        )
        ORDER BY CASE WHEN tasks.assignee_id=$1 THEN 1 END
        """
    )
    
    records = []
    print(params)
    if params.get('id'):
        task = fetch_task(cur, params['id'])
        records.append(task)
    else:
        if params.get('outline_id'):
            tasks = fetch_tasks(cur, { 'name': 'outline_id', 'value': params['outline_id'] })
            records = [task for task in tasks]
        elif params.get('project_id'):
            tasks = fetch_tasks(cur, { 'name': 'project_id', 'value': params['project_id'] })
            records = [task for task in tasks]
        elif params.get('user_id'):
            if params.get('rec'):
                cur.execute(f"EXECUTE getRecTasks('{params['user_id']}')")
                records = [
                    {
                        'id': row[0],
                        'title': row[1],
                        'date': str(row[2]),
                        'project_id': row[3],
                        'assignee_id': row[4],
                        'assignee': getUserInfo(row[4]) if row[4] != None else row[4],
                        'project_title': row[5],
                        'project_owner_id': row[6],
                        'project_members': row[7]
                    }
                    for row in cur.fetchall()
                ]
            else:
                cur.execute(f"EXECUTE getUserTaskDates('{params['user_id']}')")
                records = [
                    {
                        'id': row[0],
                        'title': row[1],
                        'date': str(row[2]),
                        'project_id': row[3],
                        'assignee_id': row[4],
                        'assignee': getUserInfo(row[4]) if row[4] != None else row[4],
                        'project_title': row[5],
                        'project_owner_id': row[6],
                        'project_members': row[7]
                    }
                    for row in cur.fetchall()
                ]
        
    # remove prepared statements for next use
    cur.execute('DEALLOCATE getSpecifiedTask');
    cur.execute('DEALLOCATE getProjectTasks')
    cur.execute('DEALLOCATE getTasksFromDoc')
    cur.execute('DEALLOCATE getUserTaskDates')
    cur.execute('DEALLOCATE getRecTasks')
    
    conn.commit()
    cur.close()
    conn.close()
    
    resp = build_response(params, records)
    return resp
