from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any, Optional
import uvicorn
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from ml.config import Config
from ml.logging_config import setup_logging
from ml.agents.research_agent import ResearchAgent
from ml.agents.knowledge_graph_agent import KnowledgeGraphAgent

# Setup logging
setup_logging(
    log_level=Config.LOG_LEVEL,
    log_file=str(Config.LOG_FILE)
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Quest API",
    description="AI-powered research and analysis platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize agents
research_agent = ResearchAgent()
knowledge_graph_agent = KnowledgeGraphAgent()

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    try:
        # Create necessary directories
        Config.create_directories()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    try:
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to AI Quest API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.post("/research")
async def research(query: Dict[str, Any]):
    """Research endpoint"""
    try:
        result = await research_agent.process(query)
        return result
    except Exception as e:
        logger.error(f"Error in research endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/graph")
async def graph_query(query: Dict[str, Any]):
    """Knowledge graph query endpoint"""
    try:
        result = await knowledge_graph_agent.process(query)
        return result
    except Exception as e:
        logger.error(f"Error in graph query endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "type": exc.__class__.__name__
        }
    )

def start():
    """Start the FastAPI application"""
    uvicorn.run(
        "ml.api.main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.DEBUG
    )

if __name__ == "__main__":
    start() 