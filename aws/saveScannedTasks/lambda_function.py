import os
import json
import psycopg2

# rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']
    

def lambda_handler(event, context):
    
    newIds = []
    
    data = json.loads(event.get('body'))
  

    # connect to database
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
                            
    cur = conn.cursor()
    cur.execute("""SET search_path = users""")

    if data['type'] == 'add':
        for task in data['data']:
            print(task)
            title = task['title']
            date = task['date']
            note = task['note']
            outline_id = task['outline_id']
            project_id = int(task['project_id'])
            priority = task['priority']
            
            cur.execute("INSERT INTO tasks (title, date, note, outline_id, project_id, priority) VALUES (%s, %s, %s, %s, %s, %s);", (title, date, note, outline_id, project_id, priority))
    else:
        for task in data['data']:
            title = task['title']
            if task['date'] != '':
                date = task['date']
            else:
                date = None
            project_id = int(task['project_id'])
            priority = task['priority']
            
            cur.execute("INSERT INTO tasks (title, date, project_id, priority) VALUES (%s, %s, %s, %s);", (title, date, project_id, priority))

    conn.commit()
    cur.close()
    conn.close()
    
    # body of response object
    taskResponse = {}
  
    # construct http response object
    responseObject = {}
    responseObject['statusCode'] = 200
    responseObject['headers'] = {}
    responseObject['headers']['Access-Control-Allow-Origin'] = '*'
    responseObject['headers']['Access-Control-Allow-Headers'] = '*'

    responseObject['body'] = json.dumps(taskResponse)
    
    # rerturn response
    return responseObject
