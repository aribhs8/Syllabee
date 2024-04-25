import json
import boto3
import base64
import pandas as pd
import uuid

from datetime import datetime

def map_word_id(response):
    word_map = {}
    for block in response["Blocks"]:
        if block["BlockType"] == "WORD":
            word_map[block["Id"]] = block["Text"]
        if block["BlockType"] == "SELECTION_ELEMENT":
            word_map[block["Id"]] = block["SelectionStatus"]
    return word_map

def extract_table_info(response, word_map):
    rows = []
    table = None
    columns = ["Unit", "Course Requirements", "Due Date", "Weight"]
    new_columns = ["Unit", "title", "date", "Weight"]

    for block in response["Blocks"]:
        if block["BlockType"] == "TABLE":
            table = []
        elif block["BlockType"] == "CELL":
            if "Relationships" in block:
                cell_text = " ".join([word_map[i] for rel in block["Relationships"] for i in rel["Ids"]])
            else:
                cell_text = " "

            if table is not None:
                table.append(cell_text)

    # Convert the table list to an array of objects
    num_columns = len(columns)
    num_rows = len(table) // num_columns

    for i in range(num_rows):
        obj = {}
        for j in range(num_columns):
            obj[new_columns[j]] = table[i * num_columns + j]  # Update this line to use new_columns

        # Check if the row has a due date before adding it to the result
        if obj["date"].strip() != "" and obj["date"] != "Due Date":
            date_string = obj["date"]
            input_format = "%A, %B %d, %Y at %I:%M %p"
            date_obj = datetime.strptime(date_string, input_format)
            output_format = "%Y-%m-%d"
            
            obj["date"] = date_obj.strftime(output_format)
            
            # Add the object to the rows list
            rows.append(obj)

    return rows


def lambda_handler(event, context):
    eventBody = (event['body'])
    imageBase64 = eventBody['Image']

    # Amazon Textract client
    textract = boto3.client('textract')

    # Call Amazon Textract
    response = textract.analyze_document(
        Document={
            'Bytes': base64.b64decode(imageBase64)
        },
        FeatureTypes=["FORMS", "TABLES"],
    )

    word_map = map_word_id(response)
    table = extract_table_info(response, word_map)
    print(json.dumps(table))  # Print the array of objects
    return {
        'statusCode': 200,
        'body': json.dumps(table)
    }
