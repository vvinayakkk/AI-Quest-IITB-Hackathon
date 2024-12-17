from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import json
from neo4j import GraphDatabase
from pinecone import Pinecone
import asyncio
import aiohttp
import requests
import base64
from datetime import datetime
from sentence_transformers import SentenceTransformer
import numpy as np
import torch
from typing import List

class RepositoryKnowledgeGraph:
    def __init__(self):
        try:
            self.driver = GraphDatabase.driver(
                os.getenv("NEO4J_URI"),
                auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
            )
            
            # Initialize Pinecone with better error handling
            self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME")
            
            # Check if index exists, create if it doesn't
            existing_indexes = self.pc.list_indexes()
            if index_name not in existing_indexes:
                # Modify index creation for free plan
                self.pc.create_index(
                    name=index_name,
                    dimension=384,  # dimension for 'all-MiniLM-L6-v2' model
                    metric="cosine",
                    spec={"pod": {"environment": "gcp-starter"}}  # Use gcp-starter for free plan
                )
                print(f"Created new Pinecone index: {index_name}")
            
            self.index = self.pc.Index(index_name)
            
            # Initialize Sentence Transformer
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.encoder.to(self.device)
            
        except Exception as e:
            raise RuntimeError(f"Failed to initialize RepositoryKnowledgeGraph: {str(e)}")

        

    def close(self):
        self.driver.close()

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
            "Authorization": f"Bearer {os.getenv('GROK_API_KEY')}",
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

    def get_embeddings(self, text):
        """Generate embeddings using Sentence Transformers"""
        max_length = 512
        chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
        
        embeddings = self.encoder.encode(chunks, convert_to_tensor=True)
        
        if len(chunks) > 1:
            embeddings = torch.mean(embeddings, dim=0)
            
        return embeddings.cpu().numpy()

    async def fetch_file_content(self, owner, repo, path):
        url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/{path}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()

    def create_file_node(self, tx, file_path: str, content: str, embeddings: np.ndarray):
            """Create or update file node with validation"""
            if not file_path or not content:
                raise ValueError("File path and content are required")
                
            query = """
            MERGE (f:File {path: $path})
            SET f.content = $content,
                f.embeddings = $embeddings,
                f.last_updated = datetime()
            """
            tx.run(query, 
                path=file_path, 
                content=content, 
                embeddings=embeddings.tolist())


        
    def create_relationships(self, tx, file_path, related_files):
        query = """
        MATCH (f1:File {path: $file1})
        MATCH (f2:File {path: $file2})
        MERGE (f1)-[r:RELATED_TO]->(f2)
        SET r.similarity = $similarity
        """
        for related in related_files:
            tx.run(query, file1=file_path, file2=related['path'], similarity=related['similarity'])

knowledge_graph = RepositoryKnowledgeGraph()

@csrf_exempt
async def index_repository(self, owner: str, repo: str, files: List[str]):
        """Index repository files with proper error handling and validation"""
        results = []
        
        try:
            for file_path in files:
                try:
                    # Fetch and process file content
                    content = await self.fetch_file_content(owner, repo, file_path)
                    embeddings = self.get_embeddings(content)
                    
                    # Create unique namespace for each repo
                    namespace = f"{owner}-{repo}"
                    vector_id = base64.b64encode(f"{owner}/{repo}/{file_path}".encode()).decode()
                    
                    # Upsert to Pinecone with retry logic
                    max_retries = 3
                    for attempt in range(max_retries):
                        try:
                            self.index.upsert(
                                vectors=[(vector_id, embeddings.tolist())],
                                namespace=namespace
                            )
                            break
                        except Exception as e:
                            if attempt == max_retries - 1:
                                raise
                            await asyncio.sleep(1 * (attempt + 1))
                    
                    # Update Neo4j
                    with self.driver.session() as session:
                        session.execute_write(self.create_file_node, file_path, content, embeddings)
                        
                        # Find related files
                        search_response = self.index.query(
                            embeddings.tolist(),
                            top_k=5,
                            namespace=namespace
                        )
                        
                        related = [
                            {
                                'path': hit['id'],
                                'similarity': hit['score']
                            } for hit in search_response['matches']
                            if hit['id'] != vector_id  # Exclude self-reference
                        ]
                        
                        session.execute_write(self.create_relationships, file_path, related)
                    
                    results.append({
                        'file': file_path,
                        'status': 'success'
                    })
                    
                except Exception as e:
                    results.append({
                        'file': file_path,
                        'status': 'error',
                        'error': str(e)
                    })
                    
            return results
            
        except Exception as e:
            raise RuntimeError(f"Failed to index repository: {str(e)}")

@csrf_exempt
async def chat(self, message: str, owner: str, repo: str, 
                  selected_file: str = None, chat_context: List[dict] = None) -> dict:
        """Enhanced chat functionality with better error handling"""
        try:
            # Get embeddings for the query
            query_embedding = self.get_embeddings(message)
            namespace = f"{owner}-{repo}"
            
            # Search Pinecone with retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    search_response = self.index.query(
                        query_embedding.tolist(),
                        top_k=3,
                        namespace=namespace
                    )
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(1 * (attempt + 1))
            
            relevant_paths = [hit['id'] for hit in search_response['matches']]
            
            # Get file contents from Neo4j
            with self.driver.session() as session:
                file_contents = session.run("""
                    MATCH (f:File)
                    WHERE f.path IN $paths
                    RETURN f.path, f.content
                    """, paths=relevant_paths)
                
                # Build context for Grok
                context_parts = []
                for record in file_contents:
                    file_path = record['f.path']
                    content = record['f.content']
                    if len(content) > 1000:
                        content = content[:1000] + "..."
                    context_parts.append(f"File: {file_path}\n{content}")
                
                # Add selected file context if available
                if selected_file:
                    selected_content = session.run("""
                        MATCH (f:File {path: $path})
                        RETURN f.content
                        """, path=selected_file).single()
                    
                    if selected_content:
                        context_parts.append(
                            f"Currently selected file: {selected_file}\n{selected_content['f.content']}"
                        )
            
            # Add chat history context
            if chat_context:
                chat_history = [
                    f"{msg['role']}: {msg['content']}" 
                    for msg in chat_context[-5:]
                ]
                context_parts.extend(chat_history)
            
            # Get response from Grok
            response = self.query_grok(
                question=message,
                context=context_parts
            )
            
            return {
                'response': response,
                'context_files': relevant_paths
            }
            
        except Exception as e:
            raise RuntimeError(f"Chat error: {str(e)}")