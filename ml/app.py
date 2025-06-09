"""
Main FastAPI application for the ML backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml.config.settings import settings
from ml.api.github import router as github_router
from ml.api.agents import router as agents_router
from ml.api.chat import router as chat_router
import logging

# Set up logging
from ml.config.logging import logger

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Quest IITB Hackathon ML components",
    version=settings.VERSION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Include routers
app.include_router(github_router, prefix=f"{settings.API_V1_STR}/github", tags=["GitHub"])
app.include_router(agents_router, prefix=f"{settings.API_V1_STR}/agents", tags=["Agents"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat"])

# Root endpoint
@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "status": "active"
    }

# Health check endpoint
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION
    }

# The /api/v1/chat/chat endpoint now provides Wikipedia-powered answers with citations and context.

# Optionally, add more routers or endpoints as needed

# To run: uvicorn ml.app:app --reload 