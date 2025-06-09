"""
Wikipedia RAG (Retrieval Augmented Generation) module for scraping, summarizing, and citing Wikipedia articles.
"""

import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any, Optional
import json
from pathlib import Path
from transformers import pipeline
import wikipediaapi
import hashlib
import time

logger = logging.getLogger(__name__)

class WikipediaRAG:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or Path("cache/wikipedia")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.context = {}  # Store context for chat interactions
        self.wiki = wikipediaapi.Wikipedia(language='en', user_agent='AI-Quest-IITB-Hackathon/1.0')
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    def scrape_article(self, title: str) -> Dict[str, Any]:
        """Scrape a Wikipedia article by title."""
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            content = soup.find('div', {'id': 'mw-content-text'})
            if not content:
                return {"error": "Article not found"}
            text = content.get_text(separator=' ', strip=True)
            return {"title": title, "url": url, "content": text}
        except Exception as e:
            logger.error(f"Error scraping article {title}: {str(e)}")
            return {"error": str(e)}

    def summarize_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize a Wikipedia article using BART."""
        if "error" in article:
            return article
        try:
            summary = self.summarizer(article["content"], max_length=150, min_length=50, do_sample=False)[0]['summary_text']
            return {**article, "summary": summary}
        except Exception as e:
            logger.error(f"Error summarizing article {article['title']}: {str(e)}")
            return {**article, "summary": "Error summarizing article."}

    def cite_article(self, article: Dict[str, Any]) -> str:
        """Generate a citation for a Wikipedia article."""
        if "error" in article:
            return f"Error: {article['error']}"
        return f"Source: {article['url']}"

    def gather_info(self, query: str, num_articles: int = 3) -> List[Dict[str, Any]]:
        """Gather information from multiple Wikipedia articles based on a query."""
        search_results = self.wiki.page(query)
        if not search_results.exists():
            return [{"error": f"No articles found for query: {query}"}]
        articles = [search_results.title]
        results = []
        for title in articles[:num_articles]:
            article = self.scrape_article(title)
            if "error" not in article:
                article = self.summarize_article(article)
                results.append(article)
        return results

    def store_context(self, query: str, articles: List[Dict[str, Any]]) -> None:
        """Store context for future chat interactions."""
        self.context[query] = articles

    def get_context(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Retrieve context for a query."""
        return self.context.get(query)

    def save_context(self) -> None:
        """Save context to a JSON file."""
        context_file = self.cache_dir / "context.json"
        with open(context_file, 'w', encoding='utf-8') as f:
            json.dump(self.context, f, indent=2)

    def load_context(self) -> None:
        """Load context from a JSON file."""
        context_file = self.cache_dir / "context.json"
        if context_file.exists():
            with open(context_file, 'r', encoding='utf-8') as f:
                self.context = json.load(f)

# Example usage:
# wiki_rag = WikipediaRAG()
# articles = wiki_rag.gather_info("Python programming")
# wiki_rag.store_context("Python programming", articles)
# wiki_rag.save_context() 