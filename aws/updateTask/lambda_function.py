import os
import json
import psycopg2

# rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']
    
def lambda_handler(event, context):
    data = json.loads(event.get('body'))
    task = data['updatedTask']
    
    # connect to database
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
                            
  
        
    cur = conn.cursor()
    cur.execute("""SET search_path = users""")
    # cur.execute('PREPARE updateTask AS UPDATE tasks SET title=$1, date=$2, note=$3 WHERE id=$4')

    taskId = task['id']
    if taskId is not None:
        title = task['title']
        date = task['date']
        note = task['note']
        assignee = task['assignee']
        status = task['status']
        priority = task['priority']
        
        if 'completion_date' in task:
            completionDate = task['completion_date']
            cur.execute("UPDATE tasks SET title = %s, date = %s, note = %s, assignee_id = %s, status = %s, priority = %s, completion_date = %s WHERE id = %s", (title, date, note , assignee, status, priority, completionDate, taskId)) 
       
        else:   
            # cur.execute(f"EXECUTE updateTask('{title}', '{date}', '{note}', {taskId})")
            cur.execute("UPDATE tasks SET title = %s, date = %s, note = %s, assignee_id = %s, status = %s, priority = %s WHERE id = %s", (title, date, note , assignee, status, priority, taskId)) 
       
    
    conn.commit()
    cur.close()
    conn.close()
    
    # body of response object
    taskResponse = {}
  
    # construct http response object
    responseObject = {}
    responseObject['statusCode'] = 200
    responseObject['headers'] = {}
    responseObject['headers']['Content-Type'] = 'application/json'
    responseObject['headers']['Access-Control-Allow-Origin'] = '*'
    responseObject['headers']['Access-Control-Allow-Headers'] = '*'
    responseObject['body'] = json.dumps(taskResponse)
    
    # rerturn response
    return responseObject
