from pydantic import BaseModel
from typing import Optional, List, Dict

class TaskRequest(BaseModel):
    task: str
    conversation: Optional[List[Dict]] = None

class PlanResponse(BaseModel):
    steps: list
