"""
Chat Manager Module
Provides advanced chat capabilities for code understanding and assistance.
"""

from typing import List, Dict, Any, Optional, Union
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.schema import HumanMessage, AIMessage, SystemMessage
import json
from ml.config import Config

class ChatManager:
    """Advanced chat manager with context-aware responses"""
    
    def __init__(self):
        """Initialize chat manager"""
        self.setup_models()
        self.setup_memory()
        self.setup_prompts()
    
    def setup_models(self):
        """Setup chat models"""
        self.models = {
            "gpt4": ChatOpenAI(
                model_name="gpt-4-turbo-preview",
                temperature=0.7,
                max_tokens=2000
            ),
            "gpt35": ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.7,
                max_tokens=1000
            )
        }
        self.current_model = "gpt4"
    
    def setup_memory(self):
        """Setup conversation memory"""
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
    
    def setup_prompts(self):
        """Setup chat prompts"""
        self.system_prompt = """You are an expert code assistant with deep understanding of software development.
        You can help with:
        1. Code understanding and explanation
        2. Bug fixing and debugging
        3. Code optimization and refactoring
        4. Architecture and design patterns
        5. Best practices and recommendations
        
        Always provide:
        1. Clear and concise explanations
        2. Code examples when relevant
        3. Best practices and alternatives
        4. Potential improvements
        
        Use the following context to provide accurate and helpful responses."""
        
        self.prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessage(content="{input}")
        ])
    
    def chat(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process chat message with context"""
        try:
            # Prepare context
            if context:
                context_str = self._format_context(context)
                system_message = f"{self.system_prompt}\n\nContext:\n{context_str}"
            else:
                system_message = self.system_prompt
            
            # Create conversation chain
            chain = ConversationChain(
                llm=self.models[self.current_model],
                memory=self.memory,
                prompt=self.prompt,
                verbose=True
            )
            
            # Process message
            response = chain.predict(input=message)
            
            # Extract code blocks and references
            code_blocks = self._extract_code_blocks(response)
            references = self._extract_references(response)
            
            return {
                "response": response,
                "code_blocks": code_blocks,
                "references": references,
                "context_used": bool(context)
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "response": "I apologize, but I encountered an error processing your request."
            }
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for chat"""
        context_str = []
        
        if "code" in context:
            context_str.append(f"Code:\n{context['code']}")
        
        if "file_path" in context:
            context_str.append(f"File: {context['file_path']}")
        
        if "language" in context:
            context_str.append(f"Language: {context['language']}")
        
        if "related_files" in context:
            context_str.append("Related Files:")
            for file in context["related_files"]:
                context_str.append(f"- {file}")
        
        return "\n".join(context_str)
    
    def _extract_code_blocks(self, text: str) -> List[Dict[str, Any]]:
        """Extract code blocks from response"""
        code_blocks = []
        pattern = r"```(\w+)?\n(.*?)\n```"
        
        for match in re.finditer(pattern, text, re.DOTALL):
            language = match.group(1) or "text"
            code = match.group(2)
            code_blocks.append({
                "language": language,
                "code": code
            })
        
        return code_blocks
    
    def _extract_references(self, text: str) -> List[Dict[str, Any]]:
        """Extract references from response"""
        references = []
        
        # Extract file references
        file_pattern = r"`([^`]+\.\w+)`"
        for match in re.finditer(file_pattern, text):
            references.append({
                "type": "file",
                "name": match.group(1)
            })
        
        # Extract function references
        func_pattern = r"`([^`]+\([^)]*\))`"
        for match in re.finditer(func_pattern, text):
            references.append({
                "type": "function",
                "name": match.group(1)
            })
        
        return references
    
    def clear_memory(self):
        """Clear conversation memory"""
        self.memory.clear()
    
    def switch_model(self, model_name: str):
        """Switch chat model"""
        if model_name in self.models:
            self.current_model = model_name
    
    def get_chat_info(self) -> Dict[str, Any]:
        """Get information about chat configuration"""
        return {
            "current_model": self.current_model,
            "available_models": list(self.models.keys()),
            "memory_type": "ConversationBufferMemory",
            "system_prompt": self.system_prompt
        } 