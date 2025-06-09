from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class Neo4jConfig:
    """Configuration for Neo4j database"""
    
    # Connection settings
    URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
    USERNAME = os.getenv('NEO4J_USERNAME', 'neo4j')
    PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')
    
    # Database settings
    DATABASE = os.getenv('NEO4J_DATABASE', 'neo4j')
    
    # Graph settings
    MAX_NODES = int(os.getenv('NEO4J_MAX_NODES', '1000000'))
    MAX_RELATIONSHIPS = int(os.getenv('NEO4J_MAX_RELATIONSHIPS', '10000000'))
    
    # Index settings
    NODE_INDEXES = {
        'Document': ['id', 'title', 'type'],
        'Section': ['id', 'title'],
        'Entity': ['id', 'name', 'type'],
        'Repository': ['id', 'name', 'owner'],
        'Issue': ['id', 'number'],
        'PullRequest': ['id', 'number'],
        'File': ['id', 'name', 'path'],
        'Comment': ['id'],
        'Review': ['id']
    }
    
    RELATIONSHIP_INDEXES = {
        'CONTAINS': ['type'],
        'MENTIONS': ['type', 'count'],
        'HAS_ISSUE': ['type'],
        'HAS_PR': ['type'],
        'HAS_COMMENT': ['type'],
        'HAS_REVIEW': ['type']
    }
    
    # Cache settings
    CACHE_TTL = int(os.getenv('NEO4J_CACHE_TTL', '3600'))  # 1 hour
    
    @classmethod
    def get_connection_config(cls) -> Dict[str, Any]:
        """Get connection configuration"""
        return {
            'uri': cls.URI,
            'username': cls.USERNAME,
            'password': cls.PASSWORD,
            'database': cls.DATABASE
        }
    
    @classmethod
    def get_graph_config(cls) -> Dict[str, Any]:
        """Get graph configuration"""
        return {
            'max_nodes': cls.MAX_NODES,
            'max_relationships': cls.MAX_RELATIONSHIPS,
            'cache_ttl': cls.CACHE_TTL
        } 