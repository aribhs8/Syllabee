import boto3
import io
import os

from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# get environment info
profile = os.getenv("PROFILE_NAME")
region = os.getenv("REGION")

class Textract:
    def __init__(self, profile, region):
        self.session = boto3.Session(profile_name=profile)
        self.client = self.session.client('textract', region_name=region)

    def extract_text(self, img):
        b = None
        with open(img, "rb") as i:
            f = i.read()
            b = bytearray(f)

        print(b)

        response = self.client.detect_document_text(
            Document={
                'Bytes': b
            }
        )

        # get text blocks
        blocks = response['Blocks']
        text = ""
        for block in blocks:
            if block['BlockType'] == 'LINE':
                text += block['Text'] + '\n'

        return text


# TESTING
if __name__ == "__main__":
    # specify file
    test_dir = Path(__file__).parent.parent.parent / "tests/texts"
    test_file = test_dir / "ECE380.png"

    # perform text extraction
    extracter = Textract(profile, region)
    text = extracter.extract_text(test_file)

    #print(text)