"""
Enhanced Retriever Module
Provides advanced retrieval capabilities for code and documentation.
"""

from typing import List, Dict, Any, Optional, Union
from langchain.vectorstores import Chroma
from langchain.retrievers import (
    ContextualCompressionRetriever,
    MultiQueryRetriever,
    ParentDocumentRetriever
)
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain.retrievers.parent_document import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
import numpy as np
from ml.config import Config
from .embeddings import EnhancedEmbeddings

class EnhancedRetriever:
    """Advanced retriever with multiple strategies"""
    
    def __init__(self, embeddings: EnhancedEmbeddings):
        """Initialize enhanced retriever"""
        self.embeddings = embeddings
        self.setup_retrievers()
    
    def setup_retrievers(self):
        """Setup different retrieval strategies"""
        # Initialize vector store
        self.vector_store = Chroma(
            persist_directory=str(Config.VECTOR_STORE_DIR),
            embedding_function=self.embeddings,
            collection_metadata={
                "hnsw:space": "cosine",
                "hnsw:construction_ef": 100,
                "hnsw:search_ef": 100
            }
        )
        
        # Setup text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Setup document store
        self.doc_store = InMemoryStore()
        
        # Initialize retrievers
        self.retrievers = {
            "basic": self.vector_store.as_retriever(
                search_kwargs={"k": 5}
            ),
            "contextual": ContextualCompressionRetriever(
                base_compressor=LLMChainExtractor(),
                base_retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 5}
                )
            ),
            "multi_query": MultiQueryRetriever.from_llm(
                retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 5}
                ),
                llm=ChatOpenAI(temperature=0)
            ),
            "parent_doc": ParentDocumentRetriever(
                vectorstore=self.vector_store,
                docstore=self.doc_store,
                child_splitter=self.text_splitter
            )
        }
        
        self.current_retriever = "basic"
    
    def retrieve(self, query: str, strategy: str = "basic", **kwargs) -> List[Dict[str, Any]]:
        """Retrieve relevant documents using specified strategy"""
        try:
            if strategy not in self.retrievers:
                strategy = "basic"
            
            self.current_retriever = strategy
            documents = self.retrievers[strategy].get_relevant_documents(query)
            
            # Process and enhance results
            results = []
            for doc in documents:
                result = {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": self._calculate_relevance_score(query, doc.page_content)
                }
                
                # Add additional context
                if "file_path" in doc.metadata:
                    result["file_context"] = self._get_file_context(doc.metadata["file_path"])
                
                results.append(result)
            
            # Sort by relevance score
            results.sort(key=lambda x: x["score"], reverse=True)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in retrieval: {str(e)}")
            return []
    
    def _calculate_relevance_score(self, query: str, content: str) -> float:
        """Calculate relevance score between query and content"""
        try:
            # Get embeddings
            query_embedding = self.embeddings.embed_query(query)
            content_embedding = self.embeddings.embed_query(content)
            
            # Calculate cosine similarity
            similarity = self.embeddings.compute_similarity(
                query_embedding,
                content_embedding
            )
            
            # Add additional scoring factors
            score = similarity
            
            # Boost score for exact matches
            if query.lower() in content.lower():
                score += 0.2
            
            # Boost score for code blocks
            if "```" in content:
                score += 0.1
            
            return min(score, 1.0)
            
        except:
            return 0.0
    
    def _get_file_context(self, file_path: str) -> Dict[str, Any]:
        """Get additional context for a file"""
        try:
            # Get file metadata
            metadata = {
                "path": file_path,
                "type": file_path.split(".")[-1].lower(),
                "related_files": self._find_related_files(file_path)
            }
            
            return metadata
            
        except:
            return {}
    
    def _find_related_files(self, file_path: str) -> List[str]:
        """Find files related to the given file"""
        try:
            # Extract file components
            parts = file_path.split("/")
            base_name = parts[-1].split(".")[0]
            
            # Find related files
            related_files = []
            for doc in self.vector_store.get():
                if doc.metadata.get("file_path") != file_path:
                    # Check for related names
                    if base_name in doc.metadata.get("file_path", ""):
                        related_files.append(doc.metadata["file_path"])
            
            return related_files[:5]  # Limit to 5 related files
            
        except:
            return []
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the retriever"""
        try:
            # Process documents
            processed_docs = []
            for doc in documents:
                # Split content
                chunks = self.text_splitter.split_text(doc["content"])
                
                # Create document objects
                for chunk in chunks:
                    processed_docs.append({
                        "page_content": chunk,
                        "metadata": {
                            **doc.get("metadata", {}),
                            "chunk_index": len(processed_docs)
                        }
                    })
            
            # Add to vector store
            self.vector_store.add_documents(processed_docs)
            
            # Add to document store if using parent document retriever
            if "parent_doc" in self.retrievers:
                self.retrievers["parent_doc"].add_documents(processed_docs)
            
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
    
    def switch_retriever(self, strategy: str):
        """Switch retrieval strategy"""
        if strategy in self.retrievers:
            self.current_retriever = strategy
    
    def get_retriever_info(self) -> Dict[str, Any]:
        """Get information about retriever configuration"""
        return {
            "current_strategy": self.current_retriever,
            "available_strategies": list(self.retrievers.keys()),
            "vector_store": {
                "type": "Chroma",
                "persist_directory": str(Config.VECTOR_STORE_DIR)
            },
            "text_splitter": {
                "chunk_size": self.text_splitter._chunk_size,
                "chunk_overlap": self.text_splitter._chunk_overlap
            }
        } 