import os
import json
import psycopg2
import boto3
import joblib
import math


from getProjects import getProjects
from getTasks import get_tasks_for_project
from gpt import get_task_estimation
from model import predict_priority


# # rds settings
db_username = os.environ['DB_USER_NAME']
db_pw = os.environ['DB_PASSWORD']
rds_host = os.environ['RDS_HOST']
db_name = os.environ['DB_NAME']

cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'


def lambda_handler(event, context):
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }
    
    print(params)
    title = params['title']
    date = params['date']
    note = params['note']
    project_id = params['project_id']

    estimate = get_task_estimation(title, date, note, project_id)
    
    # estimate = get_task_estimation("Assignment 2", "04-04-2024", "You must design an ML linear regression algorithm", "1")
    predicted = (int(max(1, min(10, math.ceil(predict_priority((estimate))[0])))))
    print(predicted)

    
    # build and return response
    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers'] = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    }
    
    response['body'] = json.dumps(predicted)

    return response