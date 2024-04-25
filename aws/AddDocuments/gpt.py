import os
import openai

openai.api_key = os.environ['OPENAI_API_KEY']

def gpt_summarize_text(text):
    # initial query
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "assistant", "content": "Can you give me a summary of this document?"},
        {"role": "user", "content": text}
    ]

    # call the model to generate a summary
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )

    # extract the summary from the response
    summary = response["choices"][0]["message"]["content"]

    return summary
