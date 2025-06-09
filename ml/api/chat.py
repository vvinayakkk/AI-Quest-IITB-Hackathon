"""
Chat API route for Wikipedia-powered answers with citations and context.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ml.graph.wikipedia_rag import WikipediaRAG
from ml.config.settings import settings

router = APIRouter()

# Initialize Wikipedia RAG
wiki_rag = WikipediaRAG(cache_dir=settings.CACHE_DIR / "wikipedia")

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[str]
    context: Optional[List[Dict[str, Any]]] = None

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint that uses Wikipedia RAG to provide answers with citations and context."""
    try:
        # Gather information from Wikipedia
        articles = wiki_rag.gather_info(request.query, num_articles=3)
        if not articles or "error" in articles[0]:
            raise HTTPException(status_code=404, detail="No relevant information found.")

        # Summarize and cite articles
        summaries = []
        citations = []
        for article in articles:
            if "summary" in article:
                summaries.append(article["summary"])
                citations.append(wiki_rag.cite_article(article))

        # Combine summaries into a single answer
        answer = " ".join(summaries)

        # Store context for follow-up questions
        wiki_rag.store_context(request.query, articles)
        wiki_rag.save_context()

        return ChatResponse(answer=answer, citations=citations, context=articles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 