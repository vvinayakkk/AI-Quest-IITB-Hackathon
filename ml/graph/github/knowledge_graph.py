"""
Knowledge Graph Builder Module
Provides advanced knowledge graph construction capabilities.
"""

from typing import List, Dict, Any, Optional, Union
import networkx as nx
from neo4j import GraphDatabase
import spacy
from ml.config import Config
from ml.graph.neo4j_manager import Neo4jManager

class KnowledgeGraphBuilder:
    """Advanced knowledge graph builder"""
    
    def __init__(self):
        """Initialize knowledge graph builder"""
        self.setup_components()
    
    def setup_components(self):
        """Setup graph components"""
        # Initialize Neo4j manager
        self.neo4j = Neo4jManager()
        
        # Load spaCy model
        self.nlp = spacy.load("en_core_web_lg")
        
        # Initialize NetworkX graph
        self.graph = nx.DiGraph()
    
    def build_graph(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Build knowledge graph from data"""
        try:
            # Clear existing graph
            self.graph.clear()
            
            # Process repository data
            if "repository" in data:
                self._process_repository(data["repository"])
            
            # Process codebase
            if "codebase" in data:
                self._process_codebase(data["codebase"])
            
            # Process dependencies
            if "dependencies" in data:
                self._process_dependencies(data["dependencies"])
            
            # Process documentation
            if "documentation" in data:
                self._process_documentation(data["documentation"])
            
            # Process architecture
            if "architecture" in data:
                self._process_architecture(data["architecture"])
            
            # Store in Neo4j
            self._store_in_neo4j()
            
            return {
                "nodes": len(self.graph.nodes),
                "edges": len(self.graph.edges),
                "components": nx.number_weakly_connected_components(self.graph)
            }
            
        except Exception as e:
            logger.error(f"Error building knowledge graph: {str(e)}")
            return {
                "error": str(e)
            }
    
    def _process_repository(self, repo_data: Dict[str, Any]):
        """Process repository data"""
        # Add repository node
        self.graph.add_node(
            repo_data["name"],
            type="repository",
            **repo_data
        )
        
        # Add owner relationship
        if "owner" in repo_data:
            self.graph.add_node(
                repo_data["owner"],
                type="user"
            )
            self.graph.add_edge(
                repo_data["owner"],
                repo_data["name"],
                type="owns"
            )
    
    def _process_codebase(self, codebase: List[Dict[str, Any]]):
        """Process codebase data"""
        for file_data in codebase:
            # Add file node
            self.graph.add_node(
                file_data["path"],
                type="file",
                **file_data
            )
            
            # Add relationships
            if "imports" in file_data:
                for imp in file_data["imports"]:
                    self.graph.add_edge(
                        file_data["path"],
                        imp,
                        type="imports"
                    )
            
            if "classes" in file_data:
                for cls in file_data["classes"]:
                    self.graph.add_node(
                        f"{file_data['path']}:{cls['name']}",
                        type="class",
                        **cls
                    )
                    self.graph.add_edge(
                        file_data["path"],
                        f"{file_data['path']}:{cls['name']}",
                        type="contains"
                    )
            
            if "functions" in file_data:
                for func in file_data["functions"]:
                    self.graph.add_node(
                        f"{file_data['path']}:{func['name']}",
                        type="function",
                        **func
                    )
                    self.graph.add_edge(
                        file_data["path"],
                        f"{file_data['path']}:{func['name']}",
                        type="contains"
                    )
    
    def _process_dependencies(self, dependencies: Dict[str, Any]):
        """Process dependencies data"""
        for dep_type, deps in dependencies.items():
            for dep in deps:
                # Add dependency node
                self.graph.add_node(
                    dep["name"],
                    type="dependency",
                    **dep
                )
                
                # Add relationship
                self.graph.add_edge(
                    dep["name"],
                    dep["dependent"],
                    type=f"depends_on_{dep_type}"
                )
    
    def _process_documentation(self, docs: List[Dict[str, Any]]):
        """Process documentation data"""
        for doc in docs:
            # Add documentation node
            self.graph.add_node(
                doc["path"],
                type="documentation",
                **doc
            )
            
            # Add relationships
            if "related_files" in doc:
                for file in doc["related_files"]:
                    self.graph.add_edge(
                        doc["path"],
                        file,
                        type="documents"
                    )
    
    def _process_architecture(self, arch: Dict[str, Any]):
        """Process architecture data"""
        # Add architecture node
        self.graph.add_node(
            "architecture",
            type="architecture",
            **arch
        )
        
        # Add relationships
        if "components" in arch:
            for comp in arch["components"]:
                self.graph.add_node(
                    comp["name"],
                    type="component",
                    **comp
                )
                self.graph.add_edge(
                    "architecture",
                    comp["name"],
                    type="contains"
                )
    
    def _store_in_neo4j(self):
        """Store graph in Neo4j"""
        try:
            # Clear existing data
            self.neo4j.clear()
            
            # Create nodes
            for node, data in self.graph.nodes(data=True):
                self.neo4j.create_node(
                    node,
                    data.get("type", "unknown"),
                    data
                )
            
            # Create relationships
            for source, target, data in self.graph.edges(data=True):
                self.neo4j.create_relationship(
                    source,
                    target,
                    data.get("type", "related"),
                    data
                )
            
        except Exception as e:
            logger.error(f"Error storing in Neo4j: {str(e)}")
    
    def query_graph(self, query: str) -> List[Dict[str, Any]]:
        """Query the knowledge graph"""
        try:
            # Parse query using spaCy
            doc = self.nlp(query)
            
            # Extract entities
            entities = [ent.text for ent in doc.ents]
            
            # Build Cypher query
            cypher_query = self._build_cypher_query(entities, query)
            
            # Execute query
            results = self.neo4j.query(cypher_query)
            
            return results
            
        except Exception as e:
            logger.error(f"Error querying graph: {str(e)}")
            return []
    
    def _build_cypher_query(self, entities: List[str], query: str) -> str:
        """Build Cypher query from natural language"""
        # Basic query template
        query_template = """
        MATCH (n)
        WHERE n.name IN $entities
        OR n.type IN $entities
        OR n.content CONTAINS $query
        RETURN n
        LIMIT 10
        """
        
        return query_template
    
    def get_graph_info(self) -> Dict[str, Any]:
        """Get information about the knowledge graph"""
        return {
            "nodes": len(self.graph.nodes),
            "edges": len(self.graph.edges),
            "node_types": self._get_node_types(),
            "edge_types": self._get_edge_types(),
            "components": nx.number_weakly_connected_components(self.graph)
        }
    
    def _get_node_types(self) -> Dict[str, int]:
        """Get count of node types"""
        types = {}
        for _, data in self.graph.nodes(data=True):
            node_type = data.get("type", "unknown")
            types[node_type] = types.get(node_type, 0) + 1
        return types
    
    def _get_edge_types(self) -> Dict[str, int]:
        """Get count of edge types"""
        types = {}
        for _, _, data in self.graph.edges(data=True):
            edge_type = data.get("type", "unknown")
            types[edge_type] = types.get(edge_type, 0) + 1
        return types 