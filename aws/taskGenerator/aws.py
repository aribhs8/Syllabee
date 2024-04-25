import boto3
from datetime import datetime

class Textract:
    def __init__(self):
        self.client = boto3.client('textract')
    
    def extract_tasks(self, image):
        # Call Amazon Textract
        response = self.client.analyze_document(
            Document={
            'Bytes': image
            },
        FeatureTypes=["FORMS", "TABLES"])
        
        word_map = self.map_word_id(response)
        table = self.extract_table_info(response, word_map)
        text = self.get_text(response)

        return table, text
        
    def get_text(self, response):
        text = ''
        blocks = response['Blocks']
        for block in blocks:
            if block['BlockType'] == 'LINE':
                text += block['Text'] + '\n'

        return text

    def map_word_id(self, response):
        word_map = {}
        for block in response["Blocks"]:
            if block["BlockType"] == "WORD":
                word_map[block["Id"]] = block["Text"]
            if block["BlockType"] == "SELECTION_ELEMENT":
                word_map[block["Id"]] = block["SelectionStatus"]
        
        return word_map
    
    def extract_table_info(self, response, word_map):
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
    
        for i in range(1, num_rows):
            obj = {}
            for j in range(num_columns):
                obj[new_columns[j]] = table[i * num_columns + j]  # Update this line to use new_columns
    
            # Check if the row has a due date before adding it to the result
            if obj["date"].strip() != "" and obj["date"] != "Due Date" and "Late submission" not in obj["date"]:
                date_string = obj["date"]
                input_format = "%A, %B %d, %Y at %I:%M %p"
                date_obj = datetime.strptime(date_string, input_format)
                output_format = "%Y-%m-%d"
                
                obj["date"] = date_obj.strftime(output_format)
                
                # Add the object to the rows list
                rows.append(obj)
    
        return rows
    