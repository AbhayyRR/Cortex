# app/main.py (top of file)
from dotenv import load_dotenv
load_dotenv()  
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
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
from sqlmodel import select
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return PlainTextResponse("Rate limit exceeded.", status_code=429)


@app.on_event("startup")
def startup():
    init_db()
    os.makedirs("uploads", exist_ok=True)
    
    # Reload all PDFs and rebuild index
    from app.rag import load_pdf_to_chunks, build_faiss_index
    import glob
    
    pdf_files = glob.glob("uploads/*.pdf")
    if pdf_files:
        for pdf_file in pdf_files:
            load_pdf_to_chunks(pdf_file)
        build_faiss_index()

@app.post("/upload")
@limiter.limit("5/minute")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
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

    # Pass conversation history if available
    conversation_context = item.conversation if hasattr(item, 'conversation') else None
    plan = plan_task(item.task, conversation_context)
    steps = plan.get("steps", [])

    execute_task(task.id, steps)

    return {"task_id": task.id, "steps": steps}


@app.get("/result/{task_id}")
def get_result(task_id: int):
    from app.models import SubTask
    session = get_session()
    subtasks = session.exec(
        select(SubTask).where(SubTask.task_id == task_id)
    ).all()
    return [{"id": s.id, "task_id": s.task_id, "step": s.step, "tool": s.tool, "result": s.result} for s in subtasks]

@app.post("/summarize")
async def summarize_document(request: Request):
    from app.rag import documents
    from groq import Groq
    import os
    
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    if not documents:
        return {"error": "No documents uploaded"}
    
    # Summarize all documents
    all_text = "\n\n".join(documents[:10])  # Limit to first 10 chunks to avoid token limits
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {"role": "system", "content": "Provide a comprehensive summary of the uploaded documents."},
            {"role": "user", "content": all_text}
        ]
    )
    
    return {"summary": response.choices[0].message.content}
