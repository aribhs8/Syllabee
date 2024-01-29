import os
import json
import psycopg2


# rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']
    

def lambda_handler(event, context):
    # parse query string parameters
    docId = None
    docType = None
    
    if event.get('queryStringParameters') is not None:
        docId = event['queryStringParameters'].get('id')
        docType = event['queryStringParameters'].get('type')
        print('docId=' + str(docId))
        print('docType=' + str(docType))
    
    # connect to database
    conn = psycopg2.connect(host=rds_host, dbname=db_name, user=db_username, 
                            password=db_pw, port=5432)
                            
    cur = conn.cursor()
    cur.execute("""SET search_path = users""")
    
    # get data
    records = []
    if docId is not None:
        cur.execute(f"""SELECT * FROM documents WHERE id={docId}""")
    else:
        if docType == 'outline':
            cur.execute(""" SELECT * FROM documents WHERE outline=true""")
        else:
            cur.execute(""" SELECT * FROM documents """)
        
    for row in cur.fetchall():
        doc = {
            'id': row[0],
            'title': row[1],
            'file_url': row[2],
            'is_outline': row[3],
            'project_id': row[4],
        }
        
        records.append(doc)
    
    conn.commit()
    cur.close()
    conn.close()
    
    # body of response object
    docResponse = {}
    docResponse['id'] = docId
    docResponse['type'] = docType
    docResponse['records'] = records
    
    # construct http response object
    responseObject = {}
    responseObject['statusCode'] = 200
    responseObject['headers'] = {}
    responseObject['headers']['Content-Type'] = 'application/json'
    responseObject['headers']['Access-Control-Allow-Origin'] = '*'
    responseObject['body'] = json.dumps(docResponse)
    
    # rerturn response
    return responseObject
