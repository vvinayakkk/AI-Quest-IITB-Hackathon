"""
Agent service implementation.
"""

from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from ml.agents.agent_manager import AgentManager
from ml.agents.agent import Agent

# Initialize agent manager
agent_manager = AgentManager()

def create_agent(
    task: str,
    context: Optional[Dict[str, Any]] = None,
    agent_type: str = "default",
    parameters: Optional[Dict[str, Any]] = None,
    repository: Optional[str] = None,
    db: Session = None
) -> Agent:
    """Create a new agent"""
    try:
        agent = agent_manager.create_agent(
            task=task,
            context=context,
            agent_type=agent_type,
            parameters=parameters,
            repository=repository
        )
        return agent
    except Exception as e:
        raise Exception(f"Error creating agent: {str(e)}")

def execute_agent(
    agent_id: str,
    task: str,
    context: Optional[Dict[str, Any]] = None,
    parameters: Optional[Dict[str, Any]] = None,
    repository: Optional[str] = None,
    db: Session = None
) -> Dict[str, Any]:
    """Execute an agent task"""
    try:
        result = agent_manager.execute_agent(
            agent_id=agent_id,
            task=task,
            context=context,
            parameters=parameters,
            repository=repository
        )
        return result
    except Exception as e:
        raise Exception(f"Error executing agent: {str(e)}")

def get_agent_status(
    agent_id: str,
    db: Session = None
) -> Dict[str, Any]:
    """Get agent status"""
    try:
        status = agent_manager.get_agent_status(agent_id)
        return status
    except Exception as e:
        raise Exception(f"Error getting agent status: {str(e)}")

def list_agents(
    db: Session = None
) -> List[Dict[str, Any]]:
    """List all agents"""
    try:
        agents = agent_manager.list_agents()
        return agents
    except Exception as e:
        raise Exception(f"Error listing agents: {str(e)}") 