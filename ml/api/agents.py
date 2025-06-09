"""
Agent API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ml.database.connection import get_db
from ml.schemas.agents import AgentRequest
from ml.services.agents import (
    create_agent,
    execute_agent,
    get_agent_status,
    list_agents
)

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/create")
async def create_new_agent(
    request: AgentRequest,
    db: Session = Depends(get_db)
):
    """Create a new agent"""
    try:
        agent = create_agent(
            task=request.task,
            context=request.context,
            agent_type=request.agent_type,
            parameters=request.parameters,
            repository=request.repository,
            db=db
        )
        return {"agent_id": agent.id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/execute")
async def execute_agent_task(
    agent_id: str,
    request: AgentRequest,
    db: Session = Depends(get_db)
):
    """Execute an agent task"""
    try:
        result = execute_agent(
            agent_id=agent_id,
            task=request.task,
            context=request.context,
            parameters=request.parameters,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}/status")
async def get_agent_status(
    agent_id: str,
    db: Session = Depends(get_db)
):
    """Get the status of an agent"""
    try:
        status = get_agent_status(
            agent_id=agent_id,
            db=db
        )
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_all_agents(
    db: Session = Depends(get_db)
):
    """List all available agents"""
    try:
        agents = list_agents(db=db)
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 