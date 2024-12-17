import os
import uuid
import networkx as nx
import wikipedia
import requests
from typing import List
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from django.conf import settings

class GrokPineconeRAG:
    def __init__(self):
        # Embedding Model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pinecone Setup
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        
        # Create or connect to index
        self.index_name = "wikipedia-knowledge-base"
        if self.index_name not in [index.name for index in self.pc.list_indexes()]:
            self.pc.create_index(
                name=self.index_name, 
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud='aws',
                    region='us-east-1'
                )
            )
        
        # Connect to the index
        self.index = self.pc.Index(self.index_name)
        
        # Graph to track relationships
        self.graph = nx.DiGraph()

    def fetch_wikipedia_content(self, url: str) -> str:
        """Fetch content from Wikipedia URL"""
        try:
            # Extract page title from URL
            title = url.split("/wiki/")[-1].replace("_", " ")
            page = wikipedia.page(title)
            return page.content
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return ""

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        words = text.split()
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        return chunks

    def fetch_wikipedia_content(self, url: str) -> str:
        """
        Fetch content from Wikipedia URL with improved error handling and URL parsing
        """
        try:
            # Clean and normalize the URL
            url = url.strip()
            
            # Extract page title from URL, handling different URL formats
            if "/wiki/" in url:
                title = url.split("/wiki/")[-1].replace("_", " ")
            else:
                # Fallback for potential different URL formats
                title = url.split("/")[-1].replace("_", " ")
            
            # URL decode the title to handle encoded characters
            import urllib.parse
            title = urllib.parse.unquote(title)
            
            # Try fetching the page
            try:
                page = wikipedia.page(title, auto_suggest=True)
                return page.content
            except wikipedia.DisambiguationError as e:
                # If disambiguation occurs, try the first suggested page
                if e.options:
                    page = wikipedia.page(e.options[0])
                    return page.content
            except wikipedia.PageError:
                # If page not found, try alternative search methods
                search_results = wikipedia.search(title)
                if search_results:
                    page = wikipedia.page(search_results[0])
                    return page.content
                
                print(f"Could not find page for: {title}")
                return ""
        
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return ""

    def process_urls(self, urls: List[str]):
        """
        Process Wikipedia URLs and store in Pinecone with enhanced error handling
        """
        processed_urls = []
        for url in urls:
            # Fetch content
            content = self.fetch_wikipedia_content(url)
            
            # Only process if content is not empty
            if content:
                # Chunk text
                chunks = self.chunk_text(content)
                
                # Create embeddings
                embeddings = self.embedding_model.encode(chunks)
                
                # Prepare vectors for Pinecone
                vectors = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    vector_id = str(uuid.uuid4())
                    vectors.append({
                        'id': vector_id,
                        'values': embedding.tolist(),
                        'metadata': {
                            'source': url,
                            'text': chunk,
                            'chunk_index': i
                        }
                    })
                
                # Upsert vectors to Pinecone
                if vectors:
                    self.index.upsert(vectors)
                    processed_urls.append({
                        'url': url,
                        'chunks': len(vectors)
                    })
                
                print(f"Processed {url}: {len(vectors)} chunks added")
            else:
                print(f"No content found for {url}")
        
        # Build graph relationships
        if processed_urls:
            self.add_graph_relationships([u['url'] for u in processed_urls])
        
        return processed_urls

    def add_graph_relationships(self, urls: List[str]):
        """Build graph of Wikipedia page relationships"""
        for i in range(len(urls)):
            for j in range(i+1, len(urls)):
                self.graph.add_edge(urls[i], urls[j])

    def retrieve_context(self, query: str, top_k: int = 5) -> List[str]:
        """Retrieve most relevant chunks from Pinecone"""
        # Embed query
        query_embedding = self.embedding_model.encode([query])[0].tolist()
        
        # Query Pinecone
        results = self.index.query(
            vector=query_embedding, 
            top_k=top_k, 
            include_metadata=True
        )
        
        # Extract and return context chunks
        return [
            hit['metadata']['text'] 
            for hit in results['matches']
        ]

    def query_grok(self, question: str, context: List[str] = None) -> str:
        """Send query to Grok API with optional context"""
        # Prepare context
        context_text = "\n\n".join(context) if context else ""
        
        payload = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful AI assistant answering questions based on provided context. If the context doesn't contain enough information, explain what's missing."
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{context_text}\n\nQuestion: {question}"
                }
            ],
            "temperature": 0.7,
            "stream": False
        }

        grok_headers = {
            "Authorization": f"Bearer {settings.GROK_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(
                "https://api.x.ai/v1/chat/completions", 
                headers=grok_headers, 
                json=payload
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except requests.RequestException as e:
            print(f"API Error: {e}")
            return f"Sorry, I couldn't process the request. Error: {e}"