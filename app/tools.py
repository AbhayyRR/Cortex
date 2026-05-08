from app.rag import retrieve
from groq import Groq
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def tool_retrieve(input_text):
    results = retrieve(input_text)
    formatted_results = []
    for result in results:
        formatted_results.append({
            'text': result['text'],
            'source': result['source'],
            'confidence': result['confidence']
        })
    return json.dumps(formatted_results)

def tool_summarize(input_text):
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {"role": "system", "content": "Summarize clearly."},
            {"role": "user", "content": input_text}
        ]
    )
    return resp.choices[0].message.content
