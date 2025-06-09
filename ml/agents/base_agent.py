from typing import Dict, List, Any, Optional
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Base class for all AI agents"""
    
    def __init__(self, agent_type: str):
        """Initialize base agent"""
        self.agent_type = agent_type
        self.tools = {}
        self.capabilities = set()
        self.memory = []
        self._initialize_tools()
        self._initialize_capabilities()
    
    @abstractmethod
    def _initialize_tools(self):
        """Initialize agent tools"""
        pass
    
    @abstractmethod
    def _initialize_capabilities(self):
        """Initialize agent capabilities"""
        pass
    
    @abstractmethod
    def process(self, input_data: Any) -> Dict[str, Any]:
        """Process input data and return results"""
        pass
    
    def add_tool(self, name: str, tool: Any):
        """Add a tool to the agent"""
        self.tools[name] = tool
        logger.info(f"Added tool {name} to {self.agent_type} agent")
    
    def remove_tool(self, name: str):
        """Remove a tool from the agent"""
        if name in self.tools:
            del self.tools[name]
            logger.info(f"Removed tool {name} from {self.agent_type} agent")
    
    def add_capability(self, capability: str):
        """Add a capability to the agent"""
        self.capabilities.add(capability)
        logger.info(f"Added capability {capability} to {self.agent_type} agent")
    
    def remove_capability(self, capability: str):
        """Remove a capability from the agent"""
        if capability in self.capabilities:
            self.capabilities.remove(capability)
            logger.info(f"Removed capability {capability} from {self.agent_type} agent")
    
    def add_to_memory(self, item: Any):
        """Add an item to agent memory"""
        self.memory.append(item)
        logger.debug(f"Added item to {self.agent_type} agent memory")
    
    def clear_memory(self):
        """Clear agent memory"""
        self.memory = []
        logger.info(f"Cleared {self.agent_type} agent memory")
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "type": self.agent_type,
            "tools": list(self.tools.keys()),
            "capabilities": list(self.capabilities),
            "memory_size": len(self.memory)
        } 