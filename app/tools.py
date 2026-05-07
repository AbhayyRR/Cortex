from app.rag import retrieve
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def tool_retrieve(input_text):
    return "\n".join(retrieve(input_text))

def tool_summarize(input_text):
    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0,
        messages=[
            {"role": "system", "content": "Summarize clearly."},
            {"role": "user", "content": input_text}
        ]
    )
    return resp["choices"][0]["message"]["content"]
