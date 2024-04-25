import os
import json
import psycopg2
import boto3


# # rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'

import os
import json
import psycopg2
import boto3

# # rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'

def getProjects(project_id):
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, password=db_pw, port=5432)
    cur = conn.cursor()
    cur.execute('SET search_path=users')
    
    cur.execute(f"SELECT * FROM projectoutlinesummaries WHERE project_id={project_id}")
    records = []
    
    # Create a hashmap to store outline summaries based on project IDs
    outline_summaries = {}
    
    for row in cur.fetchall():
        summary = row[1]
        
        # # Check if the outline summary for the project ID is already retrieved
        # if project_id in outline_summaries:
        #     summary = outline_summaries[project_id]
        # else:
        #     cur.execute("SELECT outline_summary FROM projectoutlinesummaries WHERE project_id = %s", (project_id,))
        #     summary_row = cur.fetchone()
        #     summary = summary_row[0] if summary_row else None
            
        #     # Store the outline summary in the hashmap for future access
        #     outline_summaries[project_id] = summary
        
        # records.append({
        #     'id': row[0],
        #     'title': row[1],
        #     'description': row[2],
        #     'owner': row[3], 
        #     'owner_id': row[5],
        #     'shared': row[4],
        #     'summary': summary
        # })
        
        records.append({
            'summary': summary
        })
    
    conn.commit()
    cur.close()
    conn.close()

    return records
