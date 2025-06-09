"""
Agent Manager for coordinating and managing AI agents.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import json
from pathlib import Path
from ml.agents.agent import Agent
from ml.config.settings import AGENT_TYPES, AGENT_CONFIGS

class AgentManager:
    """Manager for coordinating and managing AI agents"""
    
    def __init__(self):
        """Initialize the agent manager"""
        self.agents: Dict[str, Agent] = {}
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.setup_components()
    
    def setup_components(self):
        """Setup agent manager components"""
        # Create necessary directories
        self.data_dir = Path("data/agents")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing agents and tasks
        self._load_data()
    
    def _load_data(self):
        """Load existing agents and tasks"""
        try:
            # Load agents
            agents_path = self.data_dir / "agents.json"
            if agents_path.exists():
                with open(agents_path, "r") as f:
                    agents_data = json.load(f)
                    for agent_id, agent_data in agents_data.items():
                        self.agents[agent_id] = Agent(
                            agent_id=agent_id,
                            agent_type=agent_data["type"],
                            config=agent_data["config"]
                        )
            
            # Load tasks
            tasks_path = self.data_dir / "tasks.json"
            if tasks_path.exists():
                with open(tasks_path, "r") as f:
                    self.tasks = json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
    
    def _save_data(self):
        """Save agents and tasks data"""
        try:
            # Save agents
            agents_path = self.data_dir / "agents.json"
            agents_data = {
                agent_id: {
                    "type": agent.agent_type,
                    "config": agent.config
                }
                for agent_id, agent in self.agents.items()
            }
            with open(agents_path, "w") as f:
                json.dump(agents_data, f)
            
            # Save tasks
            tasks_path = self.data_dir / "tasks.json"
            with open(tasks_path, "w") as f:
                json.dump(self.tasks, f)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def create_agent(self, task: str, context: Optional[Dict[str, Any]] = None,
                    agent_type: str = "default", parameters: Optional[Dict[str, Any]] = None) -> Agent:
        """Create a new agent"""
        try:
            # Generate agent ID
            agent_id = str(uuid.uuid4())
            
            # Get agent configuration
            config = AGENT_CONFIGS.get(agent_type, {})
            if parameters:
                config.update(parameters)
            
            # Create agent
            agent = Agent(
                agent_id=agent_id,
                agent_type=agent_type,
                config=config
            )
            
            # Store agent
            self.agents[agent_id] = agent
            
            # Create task
            task_id = str(uuid.uuid4())
            self.tasks[task_id] = {
                "agent_id": agent_id,
                "task": task,
                "context": context or {},
                "status": "created",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Save data
            self._save_data()
            
            return agent
        except Exception as e:
            print(f"Error creating agent: {e}")
            return None
    
    def execute_agent(self, agent_id: str, task: str,
                     context: Optional[Dict[str, Any]] = None,
                     parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute an agent task"""
        try:
            if agent_id not in self.agents:
                raise ValueError(f"Agent {agent_id} not found")
            
            # Get agent
            agent = self.agents[agent_id]
            
            # Create task
            task_id = str(uuid.uuid4())
            self.tasks[task_id] = {
                "agent_id": agent_id,
                "task": task,
                "context": context or {},
                "status": "running",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Execute task
            result = agent.execute(task, context, parameters)
            
            # Update task status
            self.tasks[task_id].update({
                "status": "completed",
                "result": result,
                "updated_at": datetime.utcnow().isoformat()
            })
            
            # Save data
            self._save_data()
            
            return {
                "task_id": task_id,
                "status": "completed",
                "result": result
            }
        except Exception as e:
            print(f"Error executing agent: {e}")
            return {
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            }
    
    def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """Get the status of an agent"""
        try:
            if agent_id not in self.agents:
                raise ValueError(f"Agent {agent_id} not found")
            
            # Get agent
            agent = self.agents[agent_id]
            
            # Get agent tasks
            agent_tasks = [
                task for task_id, task in self.tasks.items()
                if task["agent_id"] == agent_id
            ]
            
            return {
                "agent_id": agent_id,
                "type": agent.agent_type,
                "status": "active",
                "task_count": len(agent_tasks),
                "last_task": agent_tasks[-1] if agent_tasks else None
            }
        except Exception as e:
            print(f"Error getting agent status: {e}")
            return {
                "agent_id": agent_id,
                "status": "error",
                "error": str(e)
            }
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all available agents"""
        try:
            return [
                {
                    "agent_id": agent_id,
                    "type": agent.agent_type,
                    "status": "active",
                    "task_count": len([
                        task for task in self.tasks.values()
                        if task["agent_id"] == agent_id
                    ])
                }
                for agent_id, agent in self.agents.items()
            ]
        except Exception as e:
            print(f"Error listing agents: {e}")
            return []
    
    def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        try:
            if agent_id not in self.agents:
                raise ValueError(f"Agent {agent_id} not found")
            
            # Remove agent
            del self.agents[agent_id]
            
            # Remove agent tasks
            self.tasks = {
                task_id: task
                for task_id, task in self.tasks.items()
                if task["agent_id"] != agent_id
            }
            
            # Save data
            self._save_data()
            
            return True
        except Exception as e:
            print(f"Error deleting agent: {e}")
            return False
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get the status of a task"""
        try:
            if task_id not in self.tasks:
                raise ValueError(f"Task {task_id} not found")
            
            return self.tasks[task_id]
        except Exception as e:
            print(f"Error getting task status: {e}")
            return {
                "task_id": task_id,
                "status": "error",
                "error": str(e)
            } 