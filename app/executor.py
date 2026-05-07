from app.tools import tool_retrieve, tool_summarize
from app.models import SubTask, Task
from app.database import get_session

def execute_task(task_id, steps):
    session = get_session()

    tool_map = {
        "retrieve": tool_retrieve,
        "summarize": tool_summarize
    }

    for step in steps:
        tool = step["tool"]
        input_text = step["input"]

        func = tool_map.get(tool)
        if not func:
            result = f"Unknown tool: {tool}"
        else:
            result = func(input_text)

        st = SubTask(task_id=task_id, step=input_text, tool=tool, result=result)
        session.add(st)
        session.commit()

    task = session.get(Task, task_id)
    task.status = "completed"
    session.add(task)
    session.commit()
