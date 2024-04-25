import os
import json
import psycopg2
import boto3

# Initialize AWS Cognito client
cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'

def fetch_tasks(cursor, project_id):
    cursor.execute(f"SELECT * FROM tasks WHERE project_id={project_id}")
    rows = cursor.fetchall()
    tasks = []
    for row in rows:
        task = {
            'id': row[0],
            'title': row[1],
            'note': row[2],
            'date': str(row[3]),
            'outline': row[4],
            'project': row[5],
        }
        tasks.append(task)
    return tasks

def get_tasks_for_project(project_id):
    conn = psycopg2.connect(host=os.environ['RDS_HOST'], dbname=os.environ['DB_NAME'], user=os.environ['DB_USER_NAME'], 
                            password=os.environ['DB_PASSWORD'], port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path=users')
    tasks = fetch_tasks(cur, project_id)
    
    cur.close()
    conn.close()
    
    return tasks
