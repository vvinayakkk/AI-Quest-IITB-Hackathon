import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv
from config import Config

def run_production_server():
    """Run the production server"""
    print("Starting production server...")
    
    # Set environment variables
    os.environ["DEBUG"] = "False"
    os.environ["LOG_LEVEL"] = "INFO"
    
    # Run the server with gunicorn
    subprocess.run([
        "gunicorn",
        "api.main:app",
        "--host",
        Config.HOST,
        "--port",
        str(Config.PORT),
        "--workers",
        str(os.cpu_count() * 2 + 1),
        "--worker-class",
        "uvicorn.workers.UvicornWorker",
        "--log-level",
        "info",
        "--access-logfile",
        "-",
        "--error-logfile",
        "-",
        "--capture-output",
        "--enable-stdio-inheritance"
    ])

def run_tests():
    """Run tests"""
    print("Running tests...")
    
    # Run pytest
    subprocess.run([
        sys.executable,
        "-m",
        "pytest",
        "tests",
        "-v",
        "--cov=.",
        "--cov-report=term-missing",
        "--cov-report=html",
        "--cov-config=.coveragerc"
    ])

def run_linter():
    """Run code linters"""
    print("Running linters...")
    
    # Run black
    subprocess.run([sys.executable, "-m", "black", "."])
    
    # Run isort
    subprocess.run([sys.executable, "-m", "isort", "."])
    
    # Run flake8
    subprocess.run([sys.executable, "-m", "flake8", "."])
    
    # Run mypy
    subprocess.run([sys.executable, "-m", "mypy", "."])

def main():
    """Run project in production mode"""
    print("Starting production mode...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Create required directories
    os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.GRAPH_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.CACHE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(Config.LOG_FILE), exist_ok=True)
    
    # Run linters
    run_linter()
    
    # Run tests
    run_tests()
    
    # Run production server
    run_production_server()

if __name__ == "__main__":
    main() 