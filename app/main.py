# app/main.py (top of file)
from dotenv import load_dotenv
load_dotenv()  
from fastapi import FastAPI, UploadFile, File
from app.database import init_db, get_session
from app.models import Task
from app.schemas import TaskRequest
from app.rag import load_pdf_to_chunks, build_faiss_index
from app.planner import plan_task
from app.executor import execute_task
from app.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from fastapi.responses import PlainTextResponse
from fastapi import Request

app = FastAPI()

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return PlainTextResponse("Rate limit exceeded.", status_code=429)


@app.on_event("startup")
def startup():
    init_db()

@app.post("/upload")
@limiter.limit("5/minute")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    file_path = f"./uploaded_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    load_pdf_to_chunks(file_path)
    build_faiss_index()

    return {"status": "document indexed"}



@app.post("/task")
def create_task(item: TaskRequest):
    session = get_session()
    task = Task(input_text=item.task)
    session.add(task)
    session.commit()
    session.refresh(task)

    plan = plan_task(item.task)
    steps = plan.get("steps", [])

    execute_task(task.id, steps)

    return {"task_id": task.id, "steps": steps}


@app.get("/result/{task_id}")
def get_result(task_id: int):
    session = get_session()
    subtasks = session.exec(
        f"SELECT * FROM SubTask WHERE task_id={task_id}"
    ).all()
    return subtasks
