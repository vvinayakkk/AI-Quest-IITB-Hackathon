from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import GrokPineconeRAG

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