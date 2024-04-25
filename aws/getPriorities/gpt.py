import os
import openai
import re
import datetime


from getTasks import get_tasks_for_project
from getProjects import getProjects

openai.api_key = os.environ['OPENAI_API_KEY']

def getTaskDetails(project_id):
    tasks = get_tasks_for_project(project_id)
    returnArray = []
    for task in tasks:
        returnArray.append((task['title'], task['date']))
    
    print("Yo")
    print(returnArray)
    
    return returnArray

def get_task_estimation(title, date, note, project_id):
    print(project_id)
    tasks = get_tasks_for_project(project_id)
    print(getProjects(project_id))
    summary = getProjects(project_id)[0]['summary']
    print(summary)
    
    print(title, date, note)

    # for task in tasks:
    
    # Initialize conversation
    
    if not note:
        conversation = [
            {"role": "system", "content": "You are a task time estimation assistant pro who uses context around the task and project to help determine accurate estimates."},
            {"role": "user", "content": f"Given the project outline: {summary}, the title of the task: {title}, and a description/note about the task: {task['note']}, how long do you think it would take to complete this task? Just give me a straight answer with the time in hours. So 30 minutes would be 0.5. Please give me a straight number, no converation or any other words in the sentence please. If it's an exam, return 10."}
        ]
    else:
        conversation = [
            {"role": "system", "content": "You are a task time estimation assistant pro who uses context around the task and project to help determine accurate estimates."},
            {"role": "user", "content": f"Given the project outline: {summary} and the title of the task: {title}, how long do you think it would take to complete this task? Just give me a straight answer with the time in hours. So 30 minutes would be 0.5. Please give me a straight number, no converation or any other words in the sentence please. Let's say if it's an exam, how long it would take to actually prepare for it?"}
        ]

    # Call GPT-3 API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation,
    )
    lengthOfTime = re.search(r'\d+(\.\d+)?', response["choices"][0]["message"]["content"]).group()
    if not date:
        context = getTaskDetails(project_id)

        conversation = [
            {"role": "system", "content": "You are a task time estimation assistant pro who uses context around the task and project to help determine accurate estimates."},
            {"role": "user", "content": f"Given the project outline: {summary}, the title of the task: {title}, a description/note about the task: {note}, and expected time it will take to complete the task: {lengthOfTime}, can you  tell me when you think this task would be due given the context I provided? Can you give me the number of days in which this would be due? This is different from how long you think it would take to complete. I need you to account for completing other potential tasks before doing this one for the project. Here are some other tasks and their due dates for this project which can help you decide and provide some context to you, use your own due diligence as well: {context}. "}
        ]
        
    
    # Call GPT-3 API
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=conversation,
    )
    
    date = re.search(r'\d+(\.\d+)?', response["choices"][0]["message"]["content"]).group()

    date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')

    if date_pattern.match(date):
        due_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
        today = datetime.date.today()
        
        # Calculate the difference in days
        difference_in_days = (due_date - today).days

        if (difference_in_days > 0):
            date = difference_in_days
    
    print(float(lengthOfTime), float(date))

    return [float(lengthOfTime), float(date)]
