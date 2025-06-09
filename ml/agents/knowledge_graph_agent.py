from typing import Dict, List, Any, Optional
import logging
from .base_agent import BaseAgent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import networkx as nx
import json
import os

logger = logging.getLogger(__name__)

class KnowledgeGraphAgent(BaseAgent):
    """Agent for knowledge graph operations"""
    
    def __init__(self, model_name: str = "gemini-pro"):
        """Initialize knowledge graph agent"""
        super().__init__("knowledge_graph")
        self.model_name = model_name
        self.api_key = os.getenv('GOOGLE_API_KEY')
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.3,
            max_tokens=1024,
            api_key=self.api_key
        )
        
        # Initialize memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize graph
        self.graph = nx.DiGraph()
        
        # Initialize embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            api_key=self.api_key
        )
        
        # Initialize vector store
        self.vector_store = Chroma(
            embedding_function=self.embeddings,
            persist_directory="data/chroma"
        )
    
    def _initialize_tools(self):
        """Initialize knowledge graph tools"""
        self.add_tool("entity_extraction", self._extract_entities)
        self.add_tool("relationship_mapping", self._map_relationships)
        self.add_tool("graph_reasoning", self._reason_with_graph)
    
    def _initialize_capabilities(self):
        """Initialize knowledge graph capabilities"""
        self.add_capability("entity_extraction")
        self.add_capability("relationship_mapping")
        self.add_capability("graph_reasoning")
        self.add_capability("vector_search")
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities from text"""
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""
            Extract named entities from the following text:
            {text}
            
            For each entity, provide:
            1. The entity text
            2. The entity type
            3. The start and end positions
            
            Format the output as a JSON array of objects.
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = chain.run(text=text)
        return json.loads(result)
    
    def _map_relationships(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Map relationships between entities"""
        prompt = PromptTemplate(
            input_variables=["entities"],
            template="""
            Identify relationships between the following entities:
            {entities}
            
            For each relationship, provide:
            1. Source entity
            2. Target entity
            3. Relationship type
            4. Confidence score
            
            Format the output as a JSON array of objects.
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = chain.run(entities=json.dumps(entities))
        return json.loads(result)
    
    def _reason_with_graph(self, query: str) -> Dict[str, Any]:
        """Reason with the knowledge graph"""
        # Convert query to vector
        query_vector = self.embeddings.embed_query(query)
        
        # Search vector store
        results = self.vector_store.similarity_search_with_score(query)
        
        # Extract relevant subgraph
        subgraph = self._extract_subgraph(results)
        
        # Generate response
        prompt = PromptTemplate(
            input_variables=["query", "subgraph"],
            template="""
            Answer the following query based on the knowledge graph:
            Query: {query}
            
            Relevant graph information:
            {subgraph}
            
            Provide a detailed response that:
            1. Directly answers the query
            2. Cites relevant entities and relationships
            3. Explains the reasoning process
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.run(
            query=query,
            subgraph=json.dumps(subgraph, indent=2)
        )
        
        return {
            "response": response,
            "subgraph": subgraph,
            "confidence": self._calculate_confidence(results)
        }
    
    def _extract_subgraph(self, results: List[Any]) -> Dict[str, Any]:
        """Extract relevant subgraph from search results"""
        # Implement subgraph extraction logic
        pass
    
    def _calculate_confidence(self, results: List[Any]) -> float:
        """Calculate confidence score for the results"""
        # Implement confidence scoring logic
        return 0.85  # Placeholder
    
    def get_prompt_template(self) -> PromptTemplate:
        """Get knowledge graph prompt template"""
        return PromptTemplate(
            input_variables=["input", "chat_history"],
            template="""
            You are a knowledge graph assistant. Your task is to help with graph-based reasoning.
            
            Chat history:
            {chat_history}
            
            User input: {input}
            
            Please provide a detailed response based on the knowledge graph.
            """
        )
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process knowledge graph query"""
        try:
            # Create chain
            chain = LLMChain(
                llm=self.llm,
                prompt=self.get_prompt_template(),
                memory=self.memory,
                verbose=True
            )
            
            # Process input
            response = chain.run(input=input_data["query"])
            
            # Reason with graph
            graph_response = self._reason_with_graph(input_data["query"])
            
            return {
                "response": response,
                "graph_insights": graph_response,
                "confidence": graph_response["confidence"]
            }
            
        except Exception as e:
            logger.error(f"Error processing knowledge graph query: {str(e)}")
            raise 