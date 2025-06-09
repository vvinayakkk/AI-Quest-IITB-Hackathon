"""
Advanced Search Module
Provides semantic and fuzzy search capabilities for code and documentation.
"""

from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ml.config import Config
from ml.graph.github.embeddings import EnhancedEmbeddings

class SearchType(Enum):
    SEMANTIC = "semantic"
    FUZZY = "fuzzy"
    REGEX = "regex"
    HYBRID = "hybrid"

@dataclass
class SearchResult:
    content: str
    score: float
    location: Dict[str, Any]
    context: Dict[str, Any]
    type: str

class AdvancedSearcher:
    """Advanced search with multiple strategies"""
    
    def __init__(self):
        """Initialize searcher"""
        self.embeddings = EnhancedEmbeddings()
        self.setup_search_components()
    
    def setup_search_components(self):
        """Setup search components"""
        # Initialize TF-IDF vectorizer
        self.tfidf = TfidfVectorizer(
            analyzer="word",
            tokenizer=self._tokenize,
            preprocessor=self._preprocess,
            stop_words="english"
        )
        
        # Initialize search index
        self.index = {}
        
        # Initialize search history
        self.history = []
    
    def search(self, query: str, type: SearchType = SearchType.HYBRID) -> List[SearchResult]:
        """Search using specified strategy"""
        try:
            # Add to search history
            self.history.append(query)
            
            # Perform search based on type
            if type == SearchType.SEMANTIC:
                results = self._semantic_search(query)
            elif type == SearchType.FUZZY:
                results = self._fuzzy_search(query)
            elif type == SearchType.REGEX:
                results = self._regex_search(query)
            else:  # HYBRID
                results = self._hybrid_search(query)
            
            return results
            
        except Exception as e:
            return [SearchResult(
                content=str(e),
                score=0.0,
                location={},
                context={},
                type="error"
            )]
    
    def _semantic_search(self, query: str) -> List[SearchResult]:
        """Perform semantic search"""
        # Get query embedding
        query_embedding = self.embeddings.embed_query(query)
        
        # Search in index
        results = []
        for doc_id, doc in self.index.items():
            # Calculate similarity
            similarity = cosine_similarity(
                [query_embedding],
                [doc["embedding"]]
            )[0][0]
            
            if similarity > 0.5:  # Threshold
                results.append(SearchResult(
                    content=doc["content"],
                    score=similarity,
                    location=doc["location"],
                    context=doc["context"],
                    type="semantic"
                ))
        
        # Sort by score
        results.sort(key=lambda x: x.score, reverse=True)
        return results
    
    def _fuzzy_search(self, query: str) -> List[SearchResult]:
        """Perform fuzzy search"""
        results = []
        query_terms = set(self._tokenize(query))
        
        for doc_id, doc in self.index.items():
            # Calculate term overlap
            doc_terms = set(self._tokenize(doc["content"]))
            overlap = len(query_terms & doc_terms) / len(query_terms)
            
            if overlap > 0.3:  # Threshold
                results.append(SearchResult(
                    content=doc["content"],
                    score=overlap,
                    location=doc["location"],
                    context=doc["context"],
                    type="fuzzy"
                ))
        
        # Sort by score
        results.sort(key=lambda x: x.score, reverse=True)
        return results
    
    def _regex_search(self, query: str) -> List[SearchResult]:
        """Perform regex search"""
        results = []
        pattern = re.compile(query, re.IGNORECASE)
        
        for doc_id, doc in self.index.items():
            # Find matches
            matches = pattern.finditer(doc["content"])
            for match in matches:
                results.append(SearchResult(
                    content=match.group(),
                    score=1.0,
                    location={
                        "start": match.start(),
                        "end": match.end(),
                        "line": doc["content"][:match.start()].count("\n") + 1
                    },
                    context=doc["context"],
                    type="regex"
                ))
        
        return results
    
    def _hybrid_search(self, query: str) -> List[SearchResult]:
        """Perform hybrid search"""
        # Get results from all strategies
        semantic_results = self._semantic_search(query)
        fuzzy_results = self._fuzzy_search(query)
        regex_results = self._regex_search(query)
        
        # Combine and deduplicate results
        results = {}
        for result in semantic_results + fuzzy_results + regex_results:
            key = result.content
            if key not in results or result.score > results[key].score:
                results[key] = result
        
        # Sort by score
        return sorted(results.values(), key=lambda x: x.score, reverse=True)
    
    def index_document(self, content: str, location: Dict[str, Any], context: Dict[str, Any]) -> None:
        """Index a document for searching"""
        # Generate document ID
        doc_id = hash(content)
        
        # Get document embedding
        embedding = self.embeddings.embed_document(content)
        
        # Store in index
        self.index[doc_id] = {
            "content": content,
            "embedding": embedding,
            "location": location,
            "context": context
        }
    
    def remove_document(self, doc_id: int) -> None:
        """Remove a document from the index"""
        if doc_id in self.index:
            del self.index[doc_id]
    
    def clear_index(self) -> None:
        """Clear the search index"""
        self.index.clear()
    
    def get_search_history(self) -> List[str]:
        """Get search history"""
        return self.history
    
    def clear_search_history(self) -> None:
        """Clear search history"""
        self.history.clear()
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text for search"""
        # Convert to lowercase
        text = text.lower()
        
        # Split into words
        words = re.findall(r"\w+", text)
        
        # Remove stop words
        stop_words = set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"])
        words = [w for w in words if w not in stop_words]
        
        return words
    
    def _preprocess(self, text: str) -> str:
        """Preprocess text for search"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters
        text = re.sub(r"[^\w\s]", "", text)
        
        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text).strip()
        
        return text

class CodeSearcher(AdvancedSearcher):
    """Specialized searcher for code"""
    
    def __init__(self):
        """Initialize code searcher"""
        super().__init__()
        self.setup_code_search()
    
    def setup_code_search(self):
        """Setup code-specific search components"""
        # Initialize code-specific tokenizer
        self.code_tokenizer = self._tokenize_code
        
        # Initialize code-specific preprocessor
        self.code_preprocessor = self._preprocess_code
    
    def _tokenize_code(self, code: str) -> List[str]:
        """Tokenize code for search"""
        # Split into tokens
        tokens = []
        
        # Handle identifiers
        identifiers = re.findall(r"\b[a-zA-Z_]\w*\b", code)
        tokens.extend(identifiers)
        
        # Handle operators
        operators = re.findall(r"[+\-*/=<>!&|^~%]+", code)
        tokens.extend(operators)
        
        # Handle strings
        strings = re.findall(r'"[^"]*"|\'[^\']*\'', code)
        tokens.extend(strings)
        
        # Handle numbers
        numbers = re.findall(r"\b\d+\b", code)
        tokens.extend(numbers)
        
        return tokens
    
    def _preprocess_code(self, code: str) -> str:
        """Preprocess code for search"""
        # Remove comments
        code = re.sub(r"//.*$|/\*.*?\*/", "", code, flags=re.MULTILINE)
        
        # Remove extra whitespace
        code = re.sub(r"\s+", " ", code).strip()
        
        return code
    
    def search_code(self, query: str, language: str) -> List[SearchResult]:
        """Search code with language-specific handling"""
        try:
            # Preprocess query
            processed_query = self._preprocess_code(query)
            
            # Get results
            results = self.search(processed_query)
            
            # Filter by language
            results = [r for r in results if r.context.get("language") == language]
            
            return results
            
        except Exception as e:
            return [SearchResult(
                content=str(e),
                score=0.0,
                location={},
                context={},
                type="error"
            )]

class DocumentationSearcher(AdvancedSearcher):
    """Specialized searcher for documentation"""
    
    def __init__(self):
        """Initialize documentation searcher"""
        super().__init__()
        self.setup_doc_search()
    
    def setup_doc_search(self):
        """Setup documentation-specific search components"""
        # Initialize documentation-specific tokenizer
        self.doc_tokenizer = self._tokenize_doc
        
        # Initialize documentation-specific preprocessor
        self.doc_preprocessor = self._preprocess_doc
    
    def _tokenize_doc(self, doc: str) -> List[str]:
        """Tokenize documentation for search"""
        # Split into words
        words = re.findall(r"\b\w+\b", doc)
        
        # Remove common documentation words
        doc_stop_words = set([
            "the", "a", "an", "and", "or", "but",
            "this", "that", "these", "those",
            "is", "are", "was", "were",
            "in", "on", "at", "to", "for", "of", "with", "by"
        ])
        words = [w for w in words if w.lower() not in doc_stop_words]
        
        return words
    
    def _preprocess_doc(self, doc: str) -> str:
        """Preprocess documentation for search"""
        # Convert to lowercase
        doc = doc.lower()
        
        # Remove markdown
        doc = re.sub(r"#+", "", doc)
        doc = re.sub(r"\*\*|\*|__|_", "", doc)
        doc = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", doc)
        
        # Remove code blocks
        doc = re.sub(r"```.*?```", "", doc, flags=re.DOTALL)
        doc = re.sub(r"`.*?`", "", doc)
        
        # Remove extra whitespace
        doc = re.sub(r"\s+", " ", doc).strip()
        
        return doc
    
    def search_documentation(self, query: str, doc_type: str) -> List[SearchResult]:
        """Search documentation with type-specific handling"""
        try:
            # Preprocess query
            processed_query = self._preprocess_doc(query)
            
            # Get results
            results = self.search(processed_query)
            
            # Filter by documentation type
            results = [r for r in results if r.context.get("type") == doc_type]
            
            return results
            
        except Exception as e:
            return [SearchResult(
                content=str(e),
                score=0.0,
                location={},
                context={},
                type="error"
            )] 