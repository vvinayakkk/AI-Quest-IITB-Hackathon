from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import logging
from typing import Callable
import json
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from ml.config import Config

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timer
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client_host": request.client.host if request.client else None
            }
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {response.status_code} ({duration:.2f}s)",
                extra={
                    "status_code": response.status_code,
                    "duration": duration
                }
            )
            
            return response
            
        except Exception as e:
            # Log error
            logger.error(
                f"Error processing request: {str(e)}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e)
                }
            )
            raise

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware for API key authentication"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip authentication for health check
        if request.url.path == "/health":
            return await call_next(request)
        
        # Get API key from header
        api_key = request.headers.get("X-API-Key")
        
        # Check API key
        if not api_key or api_key != Config.API_KEY:
            logger.warning(
                f"Invalid API key attempt from {request.client.host if request.client else 'unknown'}",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "client_host": request.client.host if request.client else None
                }
            )
            return Response(
                content=json.dumps({
                    "error": "Invalid API key",
                    "error_code": "AUTHENTICATION_ERROR"
                }),
                status_code=401,
                media_type="application/json"
            )
        
        return await call_next(request)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health check
        if request.url.path == "/health":
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get current time
        current_time = time.time()
        
        # Clean old requests
        self.requests = {
            ip: timestamps
            for ip, timestamps in self.requests.items()
            if current_time - timestamps[-1] < 60  # Keep last minute
        }
        
        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(current_time)
        
        # Check rate limit (100 requests per minute)
        if len(self.requests[client_ip]) > 100:
            logger.warning(
                f"Rate limit exceeded for {client_ip}",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "client_host": client_ip
                }
            )
            return Response(
                content=json.dumps({
                    "error": "Rate limit exceeded",
                    "error_code": "RATE_LIMIT_EXCEEDED"
                }),
                status_code=429,
                media_type="application/json"
            )
        
        return await call_next(request)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for error handling"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            # Log error
            logger.error(
                f"Unhandled exception: {str(e)}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e)
                }
            )
            
            # Return error response
            return Response(
                content=json.dumps({
                    "error": str(e),
                    "error_code": "INTERNAL_SERVER_ERROR"
                }),
                status_code=500,
                media_type="application/json"
            ) 