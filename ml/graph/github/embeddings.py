"""
Enhanced Embeddings Module
Provides advanced embedding capabilities for code and text.
"""

from typing import List, Dict, Any, Optional, Union
import numpy as np
from langchain.embeddings import OpenAIEmbeddings
from langchain.embeddings.base import Embeddings
from sentence_transformers import SentenceTransformer
import torch
from ml.config import Config

class EnhancedEmbeddings(Embeddings):
    """Enhanced embeddings with multiple models and fallback strategies"""
    
    def __init__(self):
        """Initialize enhanced embeddings"""
        self.models = {
            "openai": OpenAIEmbeddings(
                openai_api_key=Config.OPENAI_API_KEY,
                model="text-embedding-3-large"
            ),
            "codebert": SentenceTransformer("microsoft/codebert-base"),
            "all-mpnet": SentenceTransformer("all-mpnet-base-v2")
        }
        self.current_model = "openai"
        self.fallback_chain = ["openai", "codebert", "all-mpnet"]
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents"""
        try:
            return self.models[self.current_model].embed_documents(texts)
        except Exception as e:
            return self._fallback_embed_documents(texts, e)
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a query"""
        try:
            return self.models[self.current_model].embed_query(text)
        except Exception as e:
            return self._fallback_embed_query(text, e)
    
    def _fallback_embed_documents(self, texts: List[str], error: Exception) -> List[List[float]]:
        """Fallback strategy for document embedding"""
        for model_name in self.fallback_chain:
            if model_name != self.current_model:
                try:
                    self.current_model = model_name
                    return self.models[model_name].embed_documents(texts)
                except:
                    continue
        raise error
    
    def _fallback_embed_query(self, text: str, error: Exception) -> List[float]:
        """Fallback strategy for query embedding"""
        for model_name in self.fallback_chain:
            if model_name != self.current_model:
                try:
                    self.current_model = model_name
                    return self.models[model_name].embed_query(text)
                except:
                    continue
        raise error
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of the embeddings"""
        if self.current_model == "openai":
            return 3072  # text-embedding-3-large dimension
        elif self.current_model == "codebert":
            return 768  # CodeBERT dimension
        else:
            return 768  # MPNet dimension
    
    def compute_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def batch_embed(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Embed texts in batches"""
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.embed_documents(batch)
            embeddings.extend(batch_embeddings)
        return embeddings
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current embedding model"""
        return {
            "model": self.current_model,
            "dimension": self.get_embedding_dimension(),
            "fallback_chain": self.fallback_chain
        } 