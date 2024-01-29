import boto3

class Textract:
    def __init__(self):
        self.client = boto3.client('textract')

    def extract_text(self, b_img):

        response = self.client.detect_document_text(
            Document={
                'Bytes': b_img
            }
        )

        # get text blocks
        blocks = response['Blocks']
        text = ""
        for block in blocks:
            if block['BlockType'] == 'LINE':
                text += block['Text'] + '\n'

        return text
