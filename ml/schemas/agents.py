"""
Agent Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AgentRequest(BaseModel):
    task: str
    context: Optional[Dict[str, Any]] = None
    agent_type: Optional[str] = "default"
    parameters: Optional[Dict[str, Any]] = None
    repository: Optional[str] = None

class AgentResponse(BaseModel):
    agent_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AgentStatus(BaseModel):
    agent_id: str
    type: str
    status: str
    task_count: int
    last_task: Optional[Dict[str, Any]] = None
    created_at: datetime
    last_active: datetime

class AgentList(BaseModel):
    agents: List[AgentStatus]
    total: int

class AgentTask(BaseModel):
    task_id: str
    agent_id: str
    task: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AgentMetrics(BaseModel):
    success_rate: float
    average_execution_time: float
    total_tasks: int
    active_tasks: int
    error_count: int 