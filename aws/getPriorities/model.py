import boto3
import os
import sklearn
from sklearn.externals import joblib

from io import BytesIO
import pickle
import base64
import json


# Initialize the S3 client
s3_client = boto3.client('s3')

source_bucket = os.environ['S3_BUCKET_NAME']
key = 'linear_regression_model.pkl'

local_model_path = '/tmp/linear_regression_model.pkl'  # Local file path where the model will be stored


def predict_priority(estimate):
    data = BytesIO()
    s3_client.download_fileobj(source_bucket, key, data)
    data.seek(0)
    print(data)
    
    load_model = pickle.loads(data.read())

    print("load_model", load_model)
    
    y_pred = load_model.predict([estimate])
    print(y_pred)
    return y_pred

