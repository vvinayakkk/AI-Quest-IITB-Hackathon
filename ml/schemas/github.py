"""
GitHub Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class GitHubAnalysisRequest(BaseModel):
    code: str
    language: str
    file_path: Optional[str] = None
    cursor_position: Optional[int] = None
    repository: Optional[str] = None
    branch: Optional[str] = None

class GitHubStyleRequest(BaseModel):
    code: str
    language: str
    style_type: Optional[str] = None
    repository: Optional[str] = None

class GitHubTestRequest(BaseModel):
    code: str
    language: str
    test_type: Optional[str] = None
    repository: Optional[str] = None

class GitHubSearchRequest(BaseModel):
    query: str
    language: Optional[str] = None
    search_type: Optional[str] = None
    repository: Optional[str] = None

class GitHubGenerationRequest(BaseModel):
    prompt: str
    language: str
    context: Optional[Dict[str, Any]] = None
    repository: Optional[str] = None

class GitHubAnalysisResponse(BaseModel):
    suggestions: List[Dict[str, Any]]
    issues: List[Dict[str, Any]]
    metrics: Dict[str, Any]

class GitHubStyleResponse(BaseModel):
    issues: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]
    score: float

class GitHubTestResponse(BaseModel):
    tests: List[Dict[str, Any]]
    coverage: Dict[str, float]
    metrics: Dict[str, Any]

class GitHubSearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total: int
    metrics: Dict[str, Any]

class GitHubGenerationResponse(BaseModel):
    code: str
    explanation: str
    metrics: Dict[str, Any] 