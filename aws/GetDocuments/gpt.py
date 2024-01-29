import os
import openai
import json

openai.api_key = os.environ['OPENAI_API_KEY']


def get_task(title, date):
	task_info = {
		"title": title,
		"date": date
	}

	return json.dumps(task_info)

def gpt_parse_tasks(text):
	# define function to call
	functions = [
		{
			"name": "get_task",
			"description": "Create task objects for deliverables present in the text.",
			"parameters": {
				"type": "object",
				"properties": {
					"title": {
						"type": "string",
						"description": "Title of deliverable",
					},
					"date": {"type": "string"},
				},
				"required": ["title"],
			},
		}
	]

	# initial query
	messages = [
		{ "role": "system", "content": "You are a helpful assistant." },
		{ "role": "assistant", "content": "Identify title and date of deliverables present in this text."},
		{ "role": "user", "content": text}
	]

	# keep calling function until all tasks found
	tasks = []
	while True:
		response = openai.ChatCompletion.create(
			model="gpt-3.5-turbo",
			messages=messages,
			functions=functions,
			function_call="auto",
		)

		response_message = response["choices"][0]["message"]

		if response_message.get("function_call"):
			available_functions = {
            	"get_task": get_task,
			}
			
			# create task object
			function_name = response_message["function_call"]["name"]
			function_to_call = available_functions[function_name]
			function_args = json.loads(response_message["function_call"]["arguments"])
			function_response = function_to_call(
				title=function_args.get("title"),
				date=function_args.get("date"),
			)
			
			tasks.append(function_response)

			# prepare next iteration
			messages.append(response_message)
			messages.append({ "role": "user", "content": "Identify another test/deliverable and date present in this text."})
			
		else:
			# exit condition - no more tasks to extract
			break

	return tasks
