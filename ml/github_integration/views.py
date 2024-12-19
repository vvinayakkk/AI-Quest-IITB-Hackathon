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
import base64
import re

class RepoRAG:
    def __init__(self, embedding_model='all-MiniLM-L6-v2'):
        """
        Initialize Repo-wide RAG with embedding model and persistent index
        
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

    def _get_index_path(self, owner, repo, branch='main'):
        """
        Generate a persistent index path for the repository
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            branch (str): Repository branch
        
        Returns:
            str: Path to the persistent index file
        """
        index_dir = os.path.join('repo_indices', owner, repo, branch)
        os.makedirs(index_dir, exist_ok=True)
        return os.path.join(index_dir, 'repo_index.faiss')

    def save_index(self, owner, repo, branch='main'):
        """
        Save the FAISS index and metadata to a persistent storage
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            branch (str): Repository branch
        """
        try:
            index_path = self._get_index_path(owner, repo, branch)
            metadata_path = index_path.replace('.faiss', '_metadata.json')
            
            # Save FAISS index
            faiss.write_index(self.faiss_index, index_path)
            
            # Save metadata
            with open(metadata_path, 'w') as f:
                json.dump(self.file_metadata, f)
            
            print(f"Index saved for {owner}/{repo}:{branch}")
        except Exception as e:
            print(f"Index Saving Error: {e}")

    def load_index(self, owner, repo, branch='main'):
        """
        Load existing FAISS index and metadata from persistent storage
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            branch (str): Repository branch
        
        Returns:
            bool: Whether index was successfully loaded
        """
        try:
            index_path = self._get_index_path(owner, repo, branch)
            metadata_path = index_path.replace('.faiss', '_metadata.json')
            
            # Check if index exists
            if os.path.exists(index_path) and os.path.exists(metadata_path):
                # Load FAISS index
                self.faiss_index = faiss.read_index(index_path)
                
                # Load metadata
                with open(metadata_path, 'r') as f:
                    self.file_metadata = json.load(f)
                
                print(f"Index loaded for {owner}/{repo}:{branch}")
                return True
            
            return False
        except Exception as e:
            print(f"Index Loading Error: {e}")
            return False


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

    def index_repo_files(self, files_data):
        """
        Index multiple files for the entire repository
        
        Args:
            files_data (list): List of file dictionaries with path and content
        
        Returns:
            bool: Indexing success status
        """
        try:
            for file_data in files_data:
                # Only index text files
                if self._is_text_file(file_data['path']):
                    self._index_single_file(file_data)
            
            return True
        except Exception as e:
            print(f"Repo Indexing Error: {e}")
            return False

    def _is_text_file(self, filename):
        """
        Check if file is a text file based on extension
        
        Args:
            filename (str): Name of the file
        
        Returns:
            bool: Whether file is a text file
        """
        text_extensions = [
            'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 
            'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'py', 'rb', 'php',
            'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'swift', 'kt', 'r', 'sql'
        ]
        extension = filename.split('.')[-1].lower()
        return extension in text_extensions

    def _index_single_file(self, file_data):
        """
        Index a single file
        
        Args:
            file_data (dict): File data dictionary
        """
        # Generate embedding for file content
        content = file_data.get('content', '')
        
        # Split content into chunks to handle large files
        chunks = self._split_text_into_chunks(content)
        
        for chunk in chunks:
            embedding = self.generate_embedding(chunk)
            if embedding is not None:
                embedding_np = np.array(embedding).reshape(1, -1)
                self.faiss_index.add(embedding_np)
                
                # Store metadata for each chunk
                metadata = {
                    'index': len(self.file_metadata),
                    'path': file_data['path'],
                    'chunk': chunk
                }
                self.file_metadata.append(metadata)

    def _split_text_into_chunks(self, text, chunk_size=500, overlap=100):
        """
        Split text into overlapping chunks
        
        Args:
            text (str): Input text
            chunk_size (int): Size of each chunk
            overlap (int): Number of characters to overlap between chunks
        
        Returns:
            list: List of text chunks
        """
        chunks = []
        start = 0
        while start < len(text):
            chunks.append(text[start:start+chunk_size])
            start += chunk_size - overlap
        return chunks

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
                        'file_path': metadata['path'],
                        'content': metadata['chunk'],
                        'score': 1 / (1 + dist)  # Convert distance to similarity score
                    })

            return contexts
        
        except Exception as e:
            print(f"Context Retrieval Error: {e}")
            print(traceback.format_exc())
            return []

@csrf_exempt
@require_http_methods(["POST"])
def index_entire_repo(request):
    """
    Index entire repository files with persistent storage
    """
    try:
        # Parse incoming request
        data = json.loads(request.body)
        owner = data.get('owner')
        repo = data.get('repo')
        branch = data.get('branch', 'main')
        print(f"Indexing repository: {owner}/{repo}:{branch}")
        # Initialize Repo RAG
        repo_rag = RepoRAG()

        # Try to load existing index first
        if repo_rag.load_index(owner, repo, branch):
            return JsonResponse({
                'status': 'success', 
                'message': 'Existing index loaded',
                'files_indexed': len(repo_rag.file_metadata)
            })

        # Fetch repository files from GitHub
        github_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        github_headers = {
            'Accept': 'application/vnd.github.v3+json'
        }

        files_response = requests.get(github_url, headers=github_headers)
        if files_response.status_code != 200:
            return JsonResponse({'error': 'Failed to fetch repository files'}, status=400)

        files_data = files_response.json()
        
        # Filter and fetch text file contents
        text_files = [
            file for file in files_data['tree'] 
            if file['type'] == 'blob' and _is_text_file(file['path'])
        ]

        # Fetch contents for each file
        files_contents = []
        for file in text_files:
            try:
                content_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{file['path']}"
                content_response = requests.get(content_url)
                
                if content_response.status_code == 200:
                    files_contents.append({
                        'path': file['path'],
                        'content': content_response.text
                    })
            except Exception as e:
                print(f"Error fetching file content for {file['path']}: {e}")

        # Index files
        indexing_success = repo_rag.index_repo_files(files_contents)

        if not indexing_success:
            return JsonResponse({'error': 'Failed to index repository'}, status=500)

        # Save the index for future use
        repo_rag.save_index(owner, repo, branch)

        return JsonResponse({
            'status': 'success', 
            'files_indexed': len(files_contents)
        })

    except Exception as e:
        print(f"Repo Indexing Error: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)

# The chat_entire_repo function remains mostly the same, 
# but now can first attempt to load an existing index
@csrf_exempt
@require_http_methods(["POST"])
def chat_entire_repo(request):
    """
    Chat with entire repository context
    """
    try:
        # Parse incoming request
        data = json.loads(request.body)
        message = data.get('message')
        owner = data.get('owner')
        repo = data.get('repo')
        branch = data.get('branch', 'main')
        chat_context = data.get('context', [])

        # Initialize Repo RAG
        repo_rag = RepoRAG()

        # Try to load existing index
        if not repo_rag.load_index(owner, repo, branch):
            return JsonResponse({'error': 'Repository not indexed. Please index first.'}, status=400)

        # Retrieve relevant context
        relevant_contexts = repo_rag.retrieve_relevant_context(message)

        # Prepare context for LLM
        context_parts = []
        
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

        # Prepare payload for LLM API
        payload = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful AI assistant answering questions about an entire GitHub repository. Provide context-aware, precise answers."
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{context_text}\n\nQuestion about repository {owner}/{repo}: {message}"
                }
            ],
            "temperature": 0.7,
            "stream": False
        }

        # LLM API headers
        llm_headers = {
            "Authorization": f"Bearer {os.getenv('XAI_API_KEY')}",
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
            'related_contexts': [ctx['file_path'] for ctx in relevant_contexts]
        })

    except Exception as e:
        print(f"Request Processing Error: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)

def _is_text_file(filename):
    """
    Helper function to check if file is a text file
    """
    text_extensions = [
        'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 
        'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'py', 'rb', 'php',
        'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'swift', 'kt', 'r', 'sql'
    ]
    extension = filename.split('.')[-1].lower()
    return extension in text_extensions

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
            "Authorization": f"Bearer {os.getenv('XAI_API_KEY')}",
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