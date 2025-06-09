from typing import Dict, List, Any, Optional
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable
import logging
from ..config.neo4j_config import Neo4jConfig

logger = logging.getLogger(__name__)

class Neo4jManager:
    """Manager for Neo4j database operations"""
    
    def __init__(self):
        """Initialize Neo4j manager"""
        self.config = Neo4jConfig()
        self._connect()
        self._create_indexes()
    
    def _connect(self):
        """Connect to Neo4j database"""
        try:
            self.driver = GraphDatabase.driver(
                self.config.URI,
                auth=(self.config.USERNAME, self.config.PASSWORD)
            )
            logger.info("Connected to Neo4j database")
        except Exception as e:
            logger.error(f"Error connecting to Neo4j: {str(e)}")
            raise
    
    def _create_indexes(self):
        """Create indexes for nodes and relationships"""
        try:
            with self.driver.session() as session:
                # Create indexes for nodes
                for label, properties in self.config.NODE_INDEXES.items():
                    for prop in properties:
                        session.run(
                            f"CREATE INDEX IF NOT EXISTS FOR (n:{label}) ON (n.{prop})"
                        )
                
                # Create indexes for relationships
                for rel_type, properties in self.config.RELATIONSHIP_INDEXES.items():
                    for prop in properties:
                        session.run(
                            f"CREATE INDEX IF NOT EXISTS FOR ()-[r:{rel_type}]->() ON (r.{prop})"
                        )
                
                logger.info("Created Neo4j indexes")
        except Exception as e:
            logger.error(f"Error creating indexes: {str(e)}")
            raise
    
    def create_node(self, label: str, properties: Dict[str, Any]) -> str:
        """Create a node with the given label and properties"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    f"CREATE (n:{label} $properties) RETURN id(n) as node_id",
                    properties=properties
                )
                node_id = result.single()["node_id"]
                logger.info(f"Created {label} node with ID {node_id}")
                return str(node_id)
        except Exception as e:
            logger.error(f"Error creating node: {str(e)}")
            raise
    
    def create_relationship(
        self,
        from_id: str,
        to_id: str,
        rel_type: str,
        properties: Dict[str, Any] = None
    ):
        """Create a relationship between two nodes"""
        try:
            with self.driver.session() as session:
                session.run(
                    f"""
                    MATCH (a), (b)
                    WHERE id(a) = $from_id AND id(b) = $to_id
                    CREATE (a)-[r:{rel_type} $properties]->(b)
                    """,
                    from_id=int(from_id),
                    to_id=int(to_id),
                    properties=properties or {}
                )
                logger.info(f"Created {rel_type} relationship from {from_id} to {to_id}")
        except Exception as e:
            logger.error(f"Error creating relationship: {str(e)}")
            raise
    
    def get_node(self, node_id: str) -> Dict[str, Any]:
        """Get a node by ID"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    "MATCH (n) WHERE id(n) = $node_id RETURN n",
                    node_id=int(node_id)
                )
                node = result.single()
                if node:
                    return dict(node["n"])
                return None
        except Exception as e:
            logger.error(f"Error getting node: {str(e)}")
            raise
    
    def get_relationships(
        self,
        node_id: str,
        rel_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get relationships for a node"""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (n)-[r]->(m)
                WHERE id(n) = $node_id
                """
                if rel_type:
                    query += f" AND type(r) = '{rel_type}'"
                query += " RETURN r, m"
                
                result = session.run(query, node_id=int(node_id))
                return [
                    {
                        "relationship": dict(record["r"]),
                        "target_node": dict(record["m"])
                    }
                    for record in result
                ]
        except Exception as e:
            logger.error(f"Error getting relationships: {str(e)}")
            raise
    
    def update_node(self, node_id: str, properties: Dict[str, Any]):
        """Update node properties"""
        try:
            with self.driver.session() as session:
                session.run(
                    """
                    MATCH (n)
                    WHERE id(n) = $node_id
                    SET n += $properties
                    """,
                    node_id=int(node_id),
                    properties=properties
                )
                logger.info(f"Updated node {node_id}")
        except Exception as e:
            logger.error(f"Error updating node: {str(e)}")
            raise
    
    def delete_node(self, node_id: str):
        """Delete a node"""
        try:
            with self.driver.session() as session:
                session.run(
                    "MATCH (n) WHERE id(n) = $node_id DETACH DELETE n",
                    node_id=int(node_id)
                )
                logger.info(f"Deleted node {node_id}")
        except Exception as e:
            logger.error(f"Error deleting node: {str(e)}")
            raise
    
    def query(self, cypher: str, parameters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Execute a Cypher query"""
        try:
            with self.driver.session() as session:
                result = session.run(cypher, parameters or {})
                return [dict(record) for record in result]
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            raise
    
    def close(self):
        """Close the database connection"""
        try:
            self.driver.close()
            logger.info("Closed Neo4j connection")
        except Exception as e:
            logger.error(f"Error closing connection: {str(e)}")
            raise 