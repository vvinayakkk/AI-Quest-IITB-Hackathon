"""
Script to run the ML backend application.
"""

import uvicorn
import argparse
from pathlib import Path
from ml.config.settings import settings
from ml.config.logging import logger

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run the ML backend application")
    parser.add_argument(
        "--host",
        type=str,
        default=settings.HOST,
        help="Host to run the server on"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=settings.PORT,
        help="Port to run the server on"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=settings.DEBUG,
        help="Enable auto-reload"
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default=settings.LOG_LEVEL,
        help="Logging level"
    )
    return parser.parse_args()

def main():
    """Main function to run the application."""
    args = parse_args()
    
    # Configure logging
    logger.setLevel(args.log_level)
    
    # Log startup information
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Server running at http://{args.host}:{args.port}")
    logger.info(f"Debug mode: {args.reload}")
    logger.info(f"Log level: {args.log_level}")
    
    # Run the application
    uvicorn.run(
        "ml.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level=args.log_level.lower()
    )

if __name__ == "__main__":
    main() 