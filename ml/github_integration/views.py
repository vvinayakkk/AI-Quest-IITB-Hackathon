import os
import json
import requests
import traceback
import faiss  # Will use CPU version by default
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from sentence_transformers import SentenceTransformer

class FAISSRAG:
    def __init__(self, embedding_model='all-MiniLM-L6-v2'):
        """
        Initialize FAISS RAG with embedding model using CPU version
        
        Args:
            embedding_model (str): Sentence transformer model name
        """
        # Initialize embedding model
        self.embedding_model = SentenceTransformer(embedding_model)
        
        # Initialize FAISS index and metadata storage
        self.faiss_index = None
        self.file_metadata = []
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        
        # Initialize FAISS index using CPU
        self._initialize_faiss_index()

    def _initialize_faiss_index(self):
        """
        Initialize FAISS index for similarity search using CPU
        """
        # Explicitly create a flat (brute-force) index for dense vectors on CPU
        self.faiss_index = faiss.IndexFlatL2(self.embedding_dim)

    def generate_embedding(self, text):
        """
        Generate embedding for given text
        
        Args:
            text (str): Input text to embed
        
        Returns:
            numpy.ndarray: Embedding vector
        """
        try:
            # Truncate text to prevent excessive embedding
            truncated_text = str(text)[:1000]
            embedding = self.embedding_model.encode(truncated_text, convert_to_tensor=False)
            return embedding
        except Exception as e:
            print(f"Embedding Generation Error: {e}")
            return None

    def index_file(self, owner, repo, file_path, content):
        """
        Index a file in FAISS index
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            file_path (str): Path of the file
            content (str): File content
        
        Returns:
            bool: Indexing success status
        """
        try:
            # Generate embedding
            embedding = self.generate_embedding(content)
            if embedding is None:
                print(f"Failed to generate embedding for {file_path}")
                return False

            # Convert embedding to numpy array and reshape
            embedding_np = np.array(embedding).reshape(1, -1)

            # Add embedding to FAISS index
            self.faiss_index.add(embedding_np)

            # Store file metadata
            metadata = {
                'index': len(self.file_metadata),
                'owner': owner,
                'repo': repo,
                'file_path': file_path,
                'content': content
            }
            self.file_metadata.append(metadata)

            return True
        
        except Exception as e:
            print(f"File Indexing Error: {e}")
            return False

    def retrieve_relevant_context(self, query, top_k=3):
        """
        Retrieve relevant context using vector similarity search
        
        Args:
            query (str): Search query
            top_k (int, optional): Number of top results to retrieve
        
        Returns:
            list: Relevant file contexts
        """
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            if query_embedding is None:
                print("Failed to generate query embedding")
                return []

            # Reshape query embedding
            query_embedding_np = np.array(query_embedding).reshape(1, -1)

            # Perform similarity search
            distances, indices = self.faiss_index.search(query_embedding_np, top_k)

            # Retrieve and return relevant contexts
            contexts = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx < len(self.file_metadata):
                    metadata = self.file_metadata[idx]
                    contexts.append({
                        'file_path': metadata['file_path'],
                        'content': metadata['content'],
                        'score': 1 / (1 + dist)  # Convert distance to similarity score
                    })

            return contexts
        
        except Exception as e:
            print(f"Context Retrieval Error: {e}")
            print(traceback.format_exc())
            return []

@csrf_exempt
@require_http_methods(["POST"])
def chat_single_file(request):
    """
    Enhanced chat with file context using FAISS RAG
    """
    try:
        # Parse incoming request
        data = json.loads(request.body)
        message = data.get('message')
        owner = data.get('owner')
        repo = data.get('repo')
        selected_file = data.get('selected_file')
        file_content = data.get('file_content', '')
        chat_context = data.get('context', [])

        # Initialize FAISS RAG
        rag_handler = FAISSRAG()

        # Index the file
        indexing_success = rag_handler.index_file(owner, repo, selected_file, file_content)
        if not indexing_success:
            print(f"Failed to index file: {selected_file}")

        # Retrieve relevant context
        relevant_contexts = rag_handler.retrieve_relevant_context(message)

        # Prepare context for LLM
        context_parts = [
            f"File: {selected_file}\n{file_content[:5000]}"  # Original file content
        ]
        
        # Add retrieved contexts
        context_parts.extend([
            f"Related Context (File: {ctx['file_path']}, Score: {ctx['score']:.2f}):\n{ctx['content'][:1000]}" 
            for ctx in relevant_contexts
        ])

        # Add chat history
        if chat_context:
            chat_history = [
                f"{msg.get('role', 'unknown')}: {msg.get('content', 'No content')}" 
                for msg in chat_context[-5:]
            ]
            context_parts.extend(chat_history)
        
        context_text = "\n\n".join(context_parts)

        # Prepare payload for LLM API (using Grok as an example)
        payload = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful AI assistant answering questions about GitHub repository files. Provide context-aware, precise answers."
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{context_text}\n\nQuestion: {message}"
                }
            ],
            "temperature": 0.7,
            "stream": False
        }

        # LLM API headers
        llm_headers = {
            "Authorization": f"Bearer {os.getenv('GROK_API_KEY')}",
            "Content-Type": "application/json"
        }

        try:
            # Send request to LLM API
            response = requests.post(
                "https://api.x.ai/v1/chat/completions", 
                headers=llm_headers, 
                json=payload,
                timeout=30
            )
            
            # Response handling
            if response.status_code != 200:
                return JsonResponse({
                    'error': f"API returned status code {response.status_code}",
                    'response_text': response.text
                }, status=response.status_code)
            
            response_json = response.json()
            llm_response = response_json['choices'][0]['message']['content']

        except Exception as e:
            llm_response = f"Error processing AI response: {e}"

        return JsonResponse({
            'response': llm_response,
            'file': selected_file,
            'related_contexts': [ctx['file_path'] for ctx in relevant_contexts]
        })

    except Exception as e:
        print(f"Request Processing Error: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)