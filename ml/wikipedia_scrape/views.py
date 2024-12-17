from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import GrokPineconeRAG
from typing import List
class ProcessUrlsView(APIView):
    def post(self, request):
        """
        Endpoint to process Wikipedia URLs
        Request body: {"urls": ["url1", "url2", ...]}
        """
        urls = request.data.get('urls', [])
        if not urls:
            return Response({"error": "No URLs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        rag_system = GrokPineconeRAG()
        processed_urls = rag_system.process_urls(urls)
        
        return Response({
            "message": "URLs processed successfully",
            "processed_urls": processed_urls
        }, status=status.HTTP_200_OK)

class QueryKnowledgeBaseView(APIView):
    def post(self, request):
        """
        Endpoint to query the knowledge base
        Request body: {"question": "Your question here"}
        """
        question = request.data.get('question')
        if not question:
            return Response({"error": "No question provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        rag_system = GrokPineconeRAG()
        
        # Retrieve context
        context = rag_system.retrieve_context(question)
        
        # Query Grok with context
        response = rag_system.query_grok(question, context)
        
        return Response({
            "question": question,
            "context": context,
            "answer": response
        }, status=status.HTTP_200_OK)
    

class ChatWithUrlView(APIView):
    def post(self, request):
        """
        Endpoint to chat with content from a specific Wikipedia URL
        Request body: {
            "url": "https://en.wikipedia.org/wiki/Some_Topic",
            "question": "Your specific question about this URL"
        }
        """
        url = request.data.get('url')
        question = request.data.get('question')
        
        if not url or not question:
            return Response(
                {"error": "Both URL and question are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rag_system = GrokPineconeRAG()
        
        # Modify retrieve_context to filter by specific URL
        def retrieve_url_context(query: str, url: str, top_k: int = 5) -> List[str]:
            # Embed query
            query_embedding = rag_system.embedding_model.encode([query])[0].tolist()
            
            # Query Pinecone with URL-specific filter
            results = rag_system.index.query(
                vector=query_embedding, 
                filter={
                    "source": {"$eq": url}
                },
                top_k=top_k, 
                include_metadata=True
            )
            
            # Log retrieved contexts for debugging
            print("Retrieved Contexts for Specific URL:")
            for hit in results['matches']:
                print(f"Source: {hit['metadata']['source']}")
                print(f"Text: {hit['metadata']['text'][:200]}...\n")
            
            # Extract and return context chunks
            return [
                hit['metadata']['text'] 
                for hit in results['matches']
            ]
        
        # Retrieve context specifically from the given URL
        context = retrieve_url_context(question, url)
        
        # If no context found, return appropriate response
        if not context:
            return Response({
                "question": question,
                "url": url,
                "answer": "No relevant information found for this URL and question."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Query Grok with URL-specific context
        response = rag_system.query_grok(question, context)
        
        return Response({
            "question": question,
            "url": url,
            "context": context,
            "answer": response
        }, status=status.HTTP_200_OK)
    
