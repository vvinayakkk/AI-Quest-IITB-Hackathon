"""
Base Agent class for AI agents.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json
from pathlib import Path
from ml.config.settings import AGENT_TYPES, AGENT_CONFIGS

class Agent:
    """Base class for AI agents"""
    
    def __init__(self, agent_id: str, agent_type: str, config: Dict[str, Any]):
        """Initialize agent"""
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.config = config
        self.setup_components()
    
    def setup_components(self):
        """Setup agent components"""
        # Create agent directory
        self.agent_dir = Path(f"data/agents/{self.agent_id}")
        self.agent_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize agent state
        self.state = {
            "created_at": datetime.utcnow().isoformat(),
            "last_active": datetime.utcnow().isoformat(),
            "task_count": 0,
            "success_count": 0,
            "error_count": 0
        }
        
        # Save initial state
        self._save_state()
    
    def _save_state(self):
        """Save agent state"""
        try:
            state_path = self.agent_dir / "state.json"
            with open(state_path, "w") as f:
                json.dump(self.state, f)
        except Exception as e:
            print(f"Error saving agent state: {e}")
    
    def _load_state(self):
        """Load agent state"""
        try:
            state_path = self.agent_dir / "state.json"
            if state_path.exists():
                with open(state_path, "r") as f:
                    self.state = json.load(f)
        except Exception as e:
            print(f"Error loading agent state: {e}")
    
    def execute(self, task: str, context: Optional[Dict[str, Any]] = None,
                parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a task"""
        try:
            # Update state
            self.state["last_active"] = datetime.utcnow().isoformat()
            self.state["task_count"] += 1
            
            # Execute task based on agent type
            if self.agent_type == "code_analysis":
                result = self._execute_code_analysis(task, context, parameters)
            elif self.agent_type == "test_generation":
                result = self._execute_test_generation(task, context, parameters)
            elif self.agent_type == "code_generation":
                result = self._execute_code_generation(task, context, parameters)
            else:
                result = self._execute_default(task, context, parameters)
            
            # Update success count
            self.state["success_count"] += 1
            
            # Save state
            self._save_state()
            
            return result
        except Exception as e:
            # Update error count
            self.state["error_count"] += 1
            
            # Save state
            self._save_state()
            
            raise e
    
    def _execute_code_analysis(self, task: str, context: Optional[Dict[str, Any]] = None,
                             parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute code analysis task"""
        # Implement code analysis logic
        return {
            "type": "code_analysis",
            "task": task,
            "result": "Code analysis result"
        }
    
    def _execute_test_generation(self, task: str, context: Optional[Dict[str, Any]] = None,
                               parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute test generation task"""
        # Implement test generation logic
        return {
            "type": "test_generation",
            "task": task,
            "result": "Test generation result"
        }
    
    def _execute_code_generation(self, task: str, context: Optional[Dict[str, Any]] = None,
                               parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute code generation task"""
        # Implement code generation logic
        return {
            "type": "code_generation",
            "task": task,
            "result": "Code generation result"
        }
    
    def _execute_default(self, task: str, context: Optional[Dict[str, Any]] = None,
                        parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute default task"""
        return {
            "type": "default",
            "task": task,
            "result": "Default task result"
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent_id": self.agent_id,
            "type": self.agent_type,
            "state": self.state,
            "config": self.config
        }
    
    def update_config(self, config: Dict[str, Any]):
        """Update agent configuration"""
        self.config.update(config)
        self._save_state()
    
    def reset(self):
        """Reset agent state"""
        self.state = {
            "created_at": datetime.utcnow().isoformat(),
            "last_active": datetime.utcnow().isoformat(),
            "task_count": 0,
            "success_count": 0,
            "error_count": 0
        }
        self._save_state() 