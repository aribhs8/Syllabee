import json
import boto3

cognito_client = boto3.client('cognito-idp')
user_pool_id = 'us-east-2_JsONbQ14O'

def build_response(p, r):
    body = { param : value for param, value in p.items() }
    body['records'] = r

    response = {}
    response['statusCode'] = 200
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['body'] = json.dumps(body)
    
    return response

def lambda_handler(event, context):
    # handle params
    params = {}
    if event.get('queryStringParameters') is not None:
        params = { param: value for param, value in event['queryStringParameters'].items() }

   
    # get data from table
    records = []
    response = cognito_client.list_users(
        UserPoolId=user_pool_id,
        AttributesToGet=[
            'name',
            'email',
            'sub'
        ]
    )
    
    for user in response['Users']:
        info = {}
        info['user_id'] = user['Attributes'][0]['Value']
        info['name'] = user['Attributes'][1]['Value']
        info['email'] = user['Attributes'][2]['Value']
        records.append(info)


    # build and return response
    resp = build_response(params, records)
    return resp
