from app.tools import tool_retrieve, tool_summarize, tool_search, tool_extract, tool_compare, tool_analyze, tool_list
from app.models import SubTask, Task
from app.database import get_session
import json

def execute_task(task_id, steps):
    session = get_session()

    tool_map = {
        "retrieve": tool_retrieve,
        "summarize": tool_summarize,
        "search": tool_search,
        "extract": tool_extract,
        "compare": tool_compare,
        "analyze": tool_analyze,
        "list": tool_list
    }

    # Store results from previous steps to pass to next steps
    step_results = {}

    for i, step in enumerate(steps):
        tool = step["tool"]
        input_text = step["input"]

        # If input is "retrieved text", "comparison results", "analysis results" or similar, use the previous step's result
        if input_text.lower() in ["retrieved text", "retrieved content", "retrieved", "comparison results", "analysis results"] and i > 0:
            prev_result = step_results.get(i - 1, "")
            # Extract text from JSON if it's a retrieve result
            try:
                parsed = json.loads(prev_result)
                if isinstance(parsed, list):
                    input_text = "\n\n".join([item.get("text", "") for item in parsed])
                else:
                    input_text = prev_result
            except:
                input_text = prev_result

        func = tool_map.get(tool)
        if not func:
            result = f"Unknown tool: {tool}"
        else:
            result = func(input_text)

        step_results[i] = result
        st = SubTask(task_id=task_id, step=input_text, tool=tool, result=result)
        session.add(st)
        session.commit()

    task = session.get(Task, task_id)
    task.status = "completed"
    session.add(task)
    session.commit()
