import os
import json
import requests
import traceback
import uuid

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

import neo4j
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter

class GitHubChatRAG:
    def __init__(self):
        # Initialize Neo4j connection
        try:
            self.neo4j_driver = neo4j.GraphDatabase.driver(
                os.getenv('NEO4J_URI'), 
                auth=(
                    os.getenv('NEO4J_USER'), 
                    os.getenv('NEO4J_PASSWORD')
                )
            )
        except Exception as neo4j_connect_err:
            print(f"Neo4j Connection Error: {neo4j_connect_err}")
            raise

        # Initialize Pinecone
        try:
            self.pc = Pinecone(
                api_key=os.getenv('PINECONE_API_KEY')
            )

            # Use the index name from environment variable
            index_name = os.getenv('PINECONE_INDEX_NAME', 'github-repos')
            
            # Ensure the index exists
            existing_indexes = self.pc.list_indexes()
            if not any(idx.name == index_name for idx in existing_indexes):
                try:
                    self.pc.create_index(
                        name=index_name,
                        dimension=384,  # Dimension for all-MiniLM-L6-v2
                        metric='cosine',
                        spec={"pod": {"environment": "gcp-starter"}}
                    )
                    print(f"Created new index: {index_name}")
                except Exception as create_err:
                    print(f"Error creating index: {create_err}")
                    raise

            # Get the index
            self.pinecone_index = self.pc.Index(index_name)

        except Exception as pinecone_err:
            print(f"Pinecone initialization error: {pinecone_err}")
            raise

        # Sentence Transformer Embeddings
        self.embeddings_model = SentenceTransformer(
            os.getenv('SENTENCE_TRANSFORMER_MODEL', 'all-MiniLM-L6-v2')
        )

    def preprocess_file(self, file_content, selected_file):
        """
        Preprocess file content for Graph RAG and vector indexing
        """
        # Validate file content
        if not file_content or not isinstance(file_content, str):
            print(f"Invalid file content for {selected_file}")
            return []

        # Split content into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )
        
        try:
            chunks = text_splitter.split_text(file_content)
        except Exception as split_err:
            print(f"Error splitting text for {selected_file}: {split_err}")
            chunks = [file_content]  # Fallback to entire content as a single chunk

        # Validate chunks
        if not chunks:
            print(f"No chunks generated for {selected_file}")
            return []

        # Generate embeddings using Sentence Transformer
        try:
            embeddings = self.embeddings_model.encode(chunks)
        except Exception as embed_err:
            print(f"Error generating embeddings: {embed_err}")
            return []
        
        # Prepare vectors for Pinecone
        vectors = [
            {
                'id': f"{selected_file}_{i}", 
                'values': embedding.tolist(), 
                'metadata': {
                    'text': chunk, 
                    'file': selected_file
                }
            } for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]

        # Upsert vectors to Pinecone with more robust error handling
        try:
            if vectors:
                # Truncate to first 100 vectors due to potential limitations
                upsert_results = self.pinecone_index.upsert(vectors[:100])
                print(f"Upserted {min(len(vectors), 100)} vectors for {selected_file}")
                print(f"Upsert results: {upsert_results}")
        except Exception as upsert_err:
            print(f"Error upserting vectors: {upsert_err}")
            # Consider adding retry logic or fallback mechanism if needed

        # Create Neo4j graph relationships
        with self.neo4j_driver.session() as session:
            for i, chunk in enumerate(chunks[:100]):
                try:
                    session.execute_write(
                        self._create_file_chunk_relationship, 
                        selected_file, 
                        f"{selected_file}_{i}", 
                        chunk
                    )
                except Exception as neo4j_err:
                    print(f"Error creating Neo4j relationship: {neo4j_err}")

        return chunks

    @staticmethod
    def _create_file_chunk_relationship(tx, file_name, chunk_id, content):
        """
        Helper method for creating Neo4j file-chunk relationships
        """
        tx.run(
            """
            MERGE (f:File {name: $file})
            MERGE (c:Chunk {id: $chunk_id})
            SET c.content = $content
            MERGE (f)-[:CONTAINS]->(c)
            """, 
            file=file_name, 
            chunk_id=chunk_id,
            content=content
        )

    def retrieve_relevant_context(self, query, top_k=5):
        """
        Retrieve relevant context from Pinecone and Neo4j
        """
        # Generate query embedding
        query_embedding = self.embeddings_model.encode([query])[0].tolist()

        # Pinecone semantic search with error handling
        try:
            pinecone_results = self.pinecone_index.query(
                vector=query_embedding, 
                top_k=top_k, 
                include_metadata=True
            )
        except Exception as search_err:
            print(f"Pinecone search error: {search_err}")
            pinecone_results = {'matches': []}

        # Retrieve additional context from Neo4j
        try:
            with self.neo4j_driver.session() as session:
                neo4j_context = session.run(
                    """
                    MATCH (f:File)-[:CONTAINS]->(c:Chunk)
                    WHERE c.content CONTAINS $search_query
                    RETURN f.name, c.content
                    LIMIT $limit
                    """, 
                    search_query=query,  # Changed from 'query' to 'search_query'
                    limit=top_k
                )
        except Exception as neo4j_err:
            print(f"Neo4j context retrieval error: {neo4j_err}")
            neo4j_context = []

        # Combine and deduplicate contexts
        contexts = []
        pinecone_contexts = [
            result['metadata']['text'] 
            for result in pinecone_results.get('matches', [])
        ]
        contexts.extend(pinecone_contexts)

        neo4j_additional_contexts = [
            record['c.content'] 
            for record in neo4j_context
        ]
        contexts.extend([
            ctx for ctx in neo4j_additional_contexts 
            if ctx not in contexts
        ])

        return contexts[:top_k]

    def refine_answer_with_grok(self, query, contexts):
        """
        Refine the answer using Grok API with improved error handling
        """
        # Prepare payload for Grok API
        payload = {
            "model": "grok-beta",  # Updated to the current model name
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful AI assistant answering questions about code. Use the provided context to generate a precise and informative answer."
                },
                {
                    "role": "user", 
                    "content": f"Contexts:\n{chr(10).join(contexts)}\n\nQuery: {query}"
                }
            ],
            "temperature": 0.7,
            "stream": False
        }

        # Prepare headers
        grok_headers = {
            "Authorization": f"Bearer {os.getenv('GROK_API_KEY')}",
            "Content-Type": "application/json"
        }

        try:
            # Send request to Grok API
            response = requests.post(
                "https://api.x.ai/v1/chat/completions", 
                headers=grok_headers, 
                json=payload,
                timeout=30
            )
            
            # Detailed error handling
            if response.status_code != 200:
                return f"API Error: {response.status_code} - {response.text}"
            
            # Parse response
            response_json = response.json()
            if 'choices' in response_json and response_json['choices']:
                return response_json['choices'][0]['message']['content']
            else:
                return "Unable to process the API response"

        except requests.RequestException as req_err:
            return f"Request Error: {str(req_err)}"
        except ValueError as val_err:
            return f"JSON Parsing Error: {str(val_err)}"
        except Exception as e:
            return f"Unexpected Error in answer refinement: {str(e)}"

@csrf_exempt
@require_http_methods(["POST"])
def chat_single_file(request):
    """Chat with a single file context using Graph RAG"""
    try:
        # Parse request data
        data = json.loads(request.body)
        message = data.get('message')
        owner = data.get('owner')
        repo = data.get('repo')
        selected_file = data.get('selected_file')
        file_content = data.get('file_content', '')
        chat_context = data.get('context', [])

        # Initialize RAG system
        rag_system = GitHubChatRAG()

        # Preprocess and index file
        processed_chunks = rag_system.preprocess_file(file_content, selected_file)

        # If no chunks were processed, return an error
        if not processed_chunks:
            return JsonResponse({
                'response': "Could not process the file content.",
                'file': selected_file,
                'contexts': []
            })

        # Retrieve relevant context
        relevant_contexts = rag_system.retrieve_relevant_context(message)

        # Refine answer with Grok
        refined_response = rag_system.refine_answer_with_grok(message, relevant_contexts)

        return JsonResponse({
            'response': refined_response,
            'file': selected_file,
            'contexts': relevant_contexts
        })

    except Exception as e:
        print(f"Request Processing Error: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)