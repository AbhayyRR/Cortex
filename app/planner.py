import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ALLOWED_TOOLS = {
    "retrieve": "Fetches relevant text chunks from uploaded documents.",
    "summarize": "Summarizes or extracts structured information.",
    "general": "Handles reasoning, rewriting, and extraction tasks."
}

SYSTEM_PROMPT = f"""
You are a task planner. You must break user tasks into 2-5 steps.

You are ONLY allowed to use these tools:
{json.dumps(list(ALLOWED_TOOLS.keys()), indent=2)}

Rules:
1. Use ONLY the allowed tool names.
2. Each step must be JSON: {{"tool": "...", "input": "..."}}.
3. Output must be strictly: {{"steps": [ ... ]}}
4. No explanations. No extra keys. No comments.
5. Tool inputs must be short and concrete, not generic instructions.
"""

def plan_task(task_text):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": task_text}
        ]
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
