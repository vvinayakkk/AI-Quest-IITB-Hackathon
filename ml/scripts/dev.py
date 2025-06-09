import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv
from config import Config

def run_development_server():
    """Run the development server"""
    print("Starting development server...")
    
    # Set environment variables
    os.environ["DEBUG"] = "True"
    os.environ["LOG_LEVEL"] = "DEBUG"
    
    # Run the server with auto-reload
    subprocess.run([
        sys.executable,
        "-m",
        "uvicorn",
        "api.main:app",
        "--host",
        Config.HOST,
        "--port",
        str(Config.PORT),
        "--reload",
        "--reload-dir",
        ".",
        "--log-level",
        "debug"
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

def run_tests():
    """Run tests in watch mode"""
    print("Running tests in watch mode...")
    
    # Run pytest with watch
    subprocess.run([
        sys.executable,
        "-m",
        "pytest",
        "tests",
        "-v",
        "--cov=.",
        "--cov-report=term-missing",
        "--cov-report=html",
        "--cov-config=.coveragerc",
        "-f"
    ])

def main():
    """Run project in development mode"""
    print("Starting development mode...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Create required directories
    os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.GRAPH_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.CACHE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(Config.LOG_FILE), exist_ok=True)
    
    # Run linters
    run_linter()
    
    # Run tests in watch mode
    run_tests()
    
    # Run development server
    run_development_server()

if __name__ == "__main__":
    main() 