import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class Config:
    """Configuration settings for the application"""
    
    # Base paths
    BASE_DIR = Path(__file__).parent.parent
    ML_DIR = BASE_DIR / "ml"
    DATA_DIR = ML_DIR / "data"
    MODELS_DIR = ML_DIR / "models"
    LOGS_DIR = ML_DIR / "logs"
    
    # API settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Model settings
    MODEL_NAME = os.getenv("MODEL_NAME", "gemini-pro")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "models/embedding-001")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1024"))
    TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
    
    # Vector store settings
    CHROMA_PERSIST_DIR = DATA_DIR / "chroma"
    VECTOR_DIMENSION = int(os.getenv("VECTOR_DIMENSION", "768"))
    
    # Graph settings
    GRAPH_PERSIST_DIR = DATA_DIR / "graph"
    MAX_GRAPH_NODES = int(os.getenv("MAX_GRAPH_NODES", "10000"))
    MAX_GRAPH_RELATIONSHIPS = int(os.getenv("MAX_GRAPH_RELATIONSHIPS", "50000"))
    
    # Cache settings
    CACHE_DIR = DATA_DIR / "cache"
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour
    
    # Logging settings
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = LOGS_DIR / "app.log"
    
    # Security settings
    API_KEY = os.getenv("API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    @classmethod
    def get_model_config(cls) -> Dict[str, Any]:
        """Get model configuration"""
        return {
            "model_name": cls.MODEL_NAME,
            "embedding_model": cls.EMBEDDING_MODEL,
            "max_tokens": cls.MAX_TOKENS,
            "temperature": cls.TEMPERATURE
        }
    
    @classmethod
    def get_api_config(cls) -> Dict[str, Any]:
        """Get API configuration"""
        return {
            "host": cls.API_HOST,
            "port": cls.API_PORT,
            "debug": cls.DEBUG
        }
    
    @classmethod
    def get_graph_config(cls) -> Dict[str, Any]:
        """Get graph configuration"""
        return {
            "persist_dir": str(cls.GRAPH_PERSIST_DIR),
            "max_nodes": cls.MAX_GRAPH_NODES,
            "max_relationships": cls.MAX_GRAPH_RELATIONSHIPS
        }
    
    @classmethod
    def get_vector_store_config(cls) -> Dict[str, Any]:
        """Get vector store configuration"""
        return {
            "persist_dir": str(cls.CHROMA_PERSIST_DIR),
            "dimension": cls.VECTOR_DIMENSION
        }
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        directories = [
            cls.DATA_DIR,
            cls.MODELS_DIR,
            cls.LOGS_DIR,
            cls.CHROMA_PERSIST_DIR,
            cls.GRAPH_PERSIST_DIR,
            cls.CACHE_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True) 