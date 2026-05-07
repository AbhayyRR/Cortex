from pydantic import BaseModel

class TaskRequest(BaseModel):
    task: str

class PlanResponse(BaseModel):
    steps: list
