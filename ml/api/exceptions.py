from fastapi import HTTPException
from typing import Any, Dict, Optional

class AIQuestException(HTTPException):
    """Base exception for AI Quest API"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.metadata = metadata or {}

class ModelError(AIQuestException):
    """Exception for model-related errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "MODEL_ERROR",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class ValidationError(AIQuestException):
    """Exception for validation errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "VALIDATION_ERROR",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class AuthenticationError(AIQuestException):
    """Exception for authentication errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "AUTHENTICATION_ERROR",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class AuthorizationError(AIQuestException):
    """Exception for authorization errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "AUTHORIZATION_ERROR",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=403,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class ResourceNotFoundError(AIQuestException):
    """Exception for resource not found errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "RESOURCE_NOT_FOUND",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=404,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class RateLimitError(AIQuestException):
    """Exception for rate limit errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "RATE_LIMIT_EXCEEDED",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=429,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

class ServiceUnavailableError(AIQuestException):
    """Exception for service unavailable errors"""
    def __init__(
        self,
        detail: str,
        error_code: str = "SERVICE_UNAVAILABLE",
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=503,
            detail=detail,
            error_code=error_code,
            metadata=metadata
        )

def handle_exception(exc: Exception) -> AIQuestException:
    """Convert generic exceptions to AIQuestException"""
    if isinstance(exc, AIQuestException):
        return exc
    
    if isinstance(exc, ValueError):
        return ValidationError(str(exc))
    
    if isinstance(exc, KeyError):
        return ResourceNotFoundError(str(exc))
    
    return ModelError(str(exc)) 