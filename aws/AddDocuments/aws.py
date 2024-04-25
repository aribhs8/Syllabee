import boto3
import time
import base64
import os
import io


class Textract:
    def __init__(self, bucket):
        self.textract_client = boto3.client('textract')
        self.s3_client = boto3.resource('s3')
        self.bucket = bucket
    
    def extract_text_synchronous(self, filename):
        response = self.textract_client.detect_document_text(
            Document = {'S3Object': { 'Bucket': self.bucket, 'Name': filename }}
        )
        
        text = ''
        blocks = response['Blocks']
        for block in blocks:
            if block['BlockType'] == 'LINE':
                text += block['Text'] + '\n'

        return text
    
    def extract_text_asynchronous(self, filename):
        response = self.textract_client.start_document_text_detection(
            DocumentLocation = {
                'S3Object': { 'Bucket': self.bucket, 'Name': filename }
                
            }
        )
        
        job_id = response['JobId']
        status = 'IN_PROGRESS'
        
        while status == 'IN_PROGRESS':
            print("Progressing")
            time.sleep(1)
            response = self.textract_client.get_document_text_detection(JobId=job_id)
            status = response['JobStatus']

        if status == 'SUCCEEDED':
            print("Finished")

            text = ''
            blocks = response['Blocks']
            for block in blocks:
                if block['BlockType'] == 'LINE':
                    text += block['Text'] + '\n'
                    
            return text
        
        return None
        
    def upload_text(self, filename, text):
        name, ext = os.path.splitext(filename)
        
        with open(f'/tmp/{name}.txt', 'w+') as f:
            f.write(text)
            
        with open(f'/tmp/{name}.txt', 'rb') as f:
            bucket = self.s3_client.Bucket(self.bucket)
            bucket.upload_fileobj(f, f'documents/{name}.txt', ExtraArgs={"ACL": "public-read"})
        
        file_url = f"https://{self.bucket}.s3.us-east-2.amazonaws.com/documents/{name}.txt"
        return file_url
