import os
import click
import requests
import networkx as nx
import wikipedia
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import uuid

class GrokPineconeRAG:
    def __init__(self, grok_api_key: str, pinecone_api_key: str):
        # Grok API Setup
        self.grok_api_key = grok_api_key
        self.grok_base_url = "https://api.x.ai/v1/chat/completions"
        self.grok_headers = {
            "Authorization": f"Bearer {self.grok_api_key}",
            "Content-Type": "application/json"
        }
        
        # Embedding Model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pinecone Setup
        self.pc = Pinecone(api_key=pinecone_api_key)
        
        # Create or connect to index
        self.index_name = "wikipedia-knowledge-base"
        if self.index_name not in [index.name for index in self.pc.list_indexes()]:
            self.pc.create_index(
                name=self.index_name, 
                dimension=384,  # Dimension of all-MiniLM-L6-v2
                metric="cosine",
                spec=ServerlessSpec(
                    cloud='aws',  # Revert to AWS 
                    region='us-east-1'  # Use us-east-1, which is typically supported
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

    def process_urls(self, urls: List[str]):
        """Process Wikipedia URLs and store in Pinecone"""
        for url in urls:
            # Fetch content
            content = self.fetch_wikipedia_content(url)
            
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
            
            # Build graph relationships
            self.add_graph_relationships(urls)
            
            print(f"Processed {url}: {len(vectors)} chunks added")

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
        """
        Send query to Grok API with optional context
        """
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

        try:
            response = requests.post(
                self.grok_base_url, 
                headers=self.grok_headers, 
                json=payload
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except requests.RequestException as e:
            print(f"API Error: {e}")
            return f"Sorry, I couldn't process the request. Error: {e}"

    def clear_index(self):
        """Clear all vectors from the Pinecone index"""
        # Delete all vectors
        self.index.delete(delete_all=True)
        print("Pinecone index cleared successfully.")

@click.command()
@click.option('--grok-key', required=True, help='Grok API Key')
@click.option('--pinecone-key', required=True, help='Pinecone API Key')
def main(grok_key, pinecone_key):
    """
    CLI for Grok-powered RAG System with Pinecone
    """
    rag = GrokPineconeRAG(grok_key, pinecone_key)

    while True:
        print("\n--- Grok RAG with Pinecone ---")
        print("1. Add Wikipedia URLs to Knowledge Base")
        print("2. Ask a Question")
        print("3. View Graph Relationships")
        print("4. Clear Knowledge Base")
        print("5. Exit")

        choice = input("Enter your choice: ")

        if choice == '1':
            urls = input("Enter Wikipedia URLs (comma-separated): ").split(',')
            urls = [url.strip() for url in urls]
            rag.process_urls(urls)
            print("URLs processed successfully!")

        elif choice == '2':
            question = input("Ask your question: ")
            
            # Retrieve context
            context = rag.retrieve_context(question)
            
            # Query Grok with context
            response = rag.query_grok(question, context)
            
            print("\nGrok's Response:")
            print(response)

        elif choice == '3':
            # Visualize graph relationships
            print("\nWikipedia Page Relationships:")
            for edge in rag.graph.edges():
                print(f"{edge[0]} -> {edge[1]}")

        elif choice == '4':
            # Clear Pinecone index
            confirm = input("Are you sure you want to clear the entire knowledge base? (yes/no): ")
            if confirm.lower() in ['yes', 'y']:
                rag.clear_index()

        elif choice == '5':
            break

        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()