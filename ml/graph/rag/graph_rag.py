"""
Graph RAG (Retrieval-Augmented Generation) implementation.
"""

from typing import List, Dict, Any, Optional
import networkx as nx
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from pathlib import Path

class GraphRAG:
    """Graph-based RAG system for code understanding and retrieval"""
    
    def __init__(self):
        """Initialize the Graph RAG system"""
        self.graph = nx.DiGraph()
        self.vectorizer = TfidfVectorizer()
        self.document_vectors = None
        self.documents = []
        self.last_update = None
        self.setup_components()
    
    def setup_components(self):
        """Setup RAG components"""
        # Initialize graph with metadata
        self.graph.add_node("root", type="root", created_at=datetime.utcnow())
        
        # Create necessary directories
        self.data_dir = Path("data/graph_rag")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing data if available
        self._load_data()
    
    def _load_data(self):
        """Load existing graph and document data"""
        try:
            # Load graph
            graph_path = self.data_dir / "graph.json"
            if graph_path.exists():
                with open(graph_path, "r") as f:
                    graph_data = json.load(f)
                    self.graph = nx.node_link_graph(graph_data)
            
            # Load documents
            docs_path = self.data_dir / "documents.json"
            if docs_path.exists():
                with open(docs_path, "r") as f:
                    self.documents = json.load(f)
                
                # Update document vectors
                if self.documents:
                    self.document_vectors = self.vectorizer.fit_transform(
                        [doc["content"] for doc in self.documents]
                    )
        except Exception as e:
            print(f"Error loading data: {e}")
    
    def _save_data(self):
        """Save graph and document data"""
        try:
            # Save graph
            graph_path = self.data_dir / "graph.json"
            graph_data = nx.node_link_data(self.graph)
            with open(graph_path, "w") as f:
                json.dump(graph_data, f)
            
            # Save documents
            docs_path = self.data_dir / "documents.json"
            with open(docs_path, "w") as f:
                json.dump(self.documents, f)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def add_document(self, content: str, metadata: Dict[str, Any]):
        """Add a document to the RAG system"""
        try:
            # Create document node
            doc_id = f"doc_{len(self.documents)}"
            self.graph.add_node(
                doc_id,
                type="document",
                content=content,
                metadata=metadata,
                created_at=datetime.utcnow()
            )
            
            # Connect to root
            self.graph.add_edge("root", doc_id)
            
            # Add to documents list
            self.documents.append({
                "id": doc_id,
                "content": content,
                "metadata": metadata
            })
            
            # Update document vectors
            self.document_vectors = self.vectorizer.fit_transform(
                [doc["content"] for doc in self.documents]
            )
            
            # Save data
            self._save_data()
            
            return doc_id
        except Exception as e:
            print(f"Error adding document: {e}")
            return None
    
    def add_relationship(self, source_id: str, target_id: str, relationship_type: str):
        """Add a relationship between documents"""
        try:
            if source_id in self.graph and target_id in self.graph:
                self.graph.add_edge(
                    source_id,
                    target_id,
                    type=relationship_type,
                    created_at=datetime.utcnow()
                )
                self._save_data()
                return True
            return False
        except Exception as e:
            print(f"Error adding relationship: {e}")
            return False
    
    def query(self, query: str, context: Optional[Dict[str, Any]] = None,
              max_results: int = 10, similarity_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Query the RAG system"""
        try:
            # Transform query
            query_vector = self.vectorizer.transform([query])
            
            # Calculate similarities
            similarities = cosine_similarity(query_vector, self.document_vectors).flatten()
            
            # Get top results
            top_indices = np.argsort(similarities)[-max_results:][::-1]
            
            # Filter by threshold and format results
            results = []
            for idx in top_indices:
                if similarities[idx] >= similarity_threshold:
                    doc = self.documents[idx]
                    results.append({
                        "id": doc["id"],
                        "content": doc["content"],
                        "metadata": doc["metadata"],
                        "similarity": float(similarities[idx])
                    })
            
            return results
        except Exception as e:
            print(f"Error querying: {e}")
            return []
    
    def update(self):
        """Update the RAG system"""
        try:
            # Update document vectors
            if self.documents:
                self.document_vectors = self.vectorizer.fit_transform(
                    [doc["content"] for doc in self.documents]
                )
            
            # Update last update timestamp
            self.last_update = datetime.utcnow()
            
            # Save data
            self._save_data()
            
            return True
        except Exception as e:
            print(f"Error updating: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get the status of the RAG system"""
        return {
            "document_count": len(self.documents),
            "graph_size": self.graph.number_of_nodes(),
            "relationship_count": self.graph.number_of_edges(),
            "last_update": self.last_update.isoformat() if self.last_update else None
        }
    
    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID"""
        try:
            if doc_id in self.graph:
                node_data = self.graph.nodes[doc_id]
                return {
                    "id": doc_id,
                    "content": node_data.get("content"),
                    "metadata": node_data.get("metadata"),
                    "created_at": node_data.get("created_at").isoformat()
                }
            return None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    def get_relationships(self, doc_id: str) -> List[Dict[str, Any]]:
        """Get relationships for a document"""
        try:
            if doc_id in self.graph:
                relationships = []
                for source, target, data in self.graph.edges(data=True):
                    if source == doc_id or target == doc_id:
                        relationships.append({
                            "source": source,
                            "target": target,
                            "type": data.get("type"),
                            "created_at": data.get("created_at").isoformat()
                        })
                return relationships
            return []
        except Exception as e:
            print(f"Error getting relationships: {e}")
            return [] 