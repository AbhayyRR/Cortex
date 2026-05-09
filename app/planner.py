import json
import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ALLOWED_TOOLS = {
    "retrieve": "Fetches relevant text chunks from uploaded documents using semantic search.",
    "summarize": "Summarizes or extracts structured information from text.",
    "search": "Searches for specific keywords or phrases in documents with context.",
    "extract": "Extracts specific entities like dates, names, emails, phone numbers, or numbers from documents. For contact info, use 'contact' as input.",
    "compare": "Compares information across multiple documents to find similarities and differences.",
    "analyze": "Performs deep analysis including sentiment, key themes, and topic extraction.",
    "list": "Lists all uploaded documents with their metadata (pages, chunks, etc.)."
}

SYSTEM_PROMPT = f"""
You are a task planner. You must break user tasks into 2-5 steps.

You are ONLY allowed to use these tools:
{json.dumps(list(ALLOWED_TOOLS.keys()), indent=2)}

Rules:
1. Use ONLY the allowed tool names.
2. Each step must have a "tool" and an "input".
3. Keep inputs short and specific.
4. Start with retrieve for document queries.
5. Use summarize to condense information.
6. Consider conversation context for follow-up questions.
7. IMPORTANT: For comparison tasks (compare, compare resumes, who is better), use ONLY the compare tool. Do NOT add retrieve, analyze, or summarize steps before or after compare.
8. The compare tool provides a complete comparison report, so stop after compare.
9. Do NOT chain tools unless necessary - each tool should be self-contained when possible.

Example:
User: "What is Python?"
{{"steps": [{{"tool": "retrieve", "input": "Python definition"}}, {{"tool": "summarize", "input": "retrieved text"}}]}}

User: "Compare the resumes"
{{"steps": [{{"tool": "compare", "input": "resumes comparison"}}]}}

User: "Who is the better candidate?"
{{"steps": [{{"tool": "compare", "input": "candidate comparison"}}]}}

For follow-up questions, reference the previous context.
"""

def plan_task(task_text, conversation_context=None):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    if conversation_context:
        context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_context[-5:]])
        messages.append({"role": "user", "content": f"Previous conversation:\n{context_str}\n\nCurrent task: {task_text}"})
    else:
        messages.append({"role": "user", "content": task_text})
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=messages
    )

    content = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(content)
    except Exception:
        return {"steps": []}

    # Enforce tool whitelist
    clean_steps = []
    for step in parsed.get("steps", []):
        tool = step.get("tool")
        if tool in ALLOWED_TOOLS:
            clean_steps.append(step)

    return {"steps": clean_steps}
