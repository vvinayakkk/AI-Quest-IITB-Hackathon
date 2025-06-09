"""
GitHub API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ml.database.connection import get_db
from ml.schemas.github import (
    GitHubAnalysisRequest,
    GitHubStyleRequest,
    GitHubTestRequest,
    GitHubSearchRequest,
    GitHubGenerationRequest
)
from ml.services.github import (
    analyze_code,
    check_style,
    generate_tests,
    search_code,
    generate_code
)

router = APIRouter(prefix="/github", tags=["github"])

@router.post("/analyze")
async def analyze_github_code(
    request: GitHubAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Analyze GitHub code and provide real-time suggestions"""
    try:
        result = analyze_code(
            code=request.code,
            language=request.language,
            file_path=request.file_path,
            cursor_position=request.cursor_position,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/style")
async def check_github_style(
    request: GitHubStyleRequest,
    db: Session = Depends(get_db)
):
    """Check GitHub code style and provide suggestions"""
    try:
        result = check_style(
            code=request.code,
            language=request.language,
            style_type=request.style_type,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-tests")
async def generate_github_tests(
    request: GitHubTestRequest,
    db: Session = Depends(get_db)
):
    """Generate tests for GitHub code"""
    try:
        result = generate_tests(
            code=request.code,
            language=request.language,
            test_type=request.test_type,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_github_code(
    request: GitHubSearchRequest,
    db: Session = Depends(get_db)
):
    """Search GitHub code using various strategies"""
    try:
        result = search_code(
            query=request.query,
            language=request.language,
            search_type=request.search_type,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_github_code(
    request: GitHubGenerationRequest,
    db: Session = Depends(get_db)
):
    """Generate GitHub code based on prompt and context"""
    try:
        result = generate_code(
            prompt=request.prompt,
            language=request.language,
            context=request.context,
            repository=request.repository,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 