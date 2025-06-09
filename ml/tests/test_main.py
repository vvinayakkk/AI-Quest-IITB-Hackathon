import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv
from config import Config

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

def run_type_checker():
    """Run type checker"""
    print("Running type checker...")
    
    # Run mypy
    subprocess.run([
        sys.executable,
        "-m",
        "mypy",
        ".",
        "--strict",
        "--ignore-missing-imports"
    ])

def run_security_check():
    """Run security check"""
    print("Running security check...")
    
    # Run bandit
    subprocess.run([
        sys.executable,
        "-m",
        "bandit",
        "-r",
        ".",
        "-f",
        "json",
        "-o",
        "bandit-results.json"
    ])

def main():
    """Run project in test mode"""
    print("Starting test mode...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Create required directories
    os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.GRAPH_PERSIST_DIR, exist_ok=True)
    os.makedirs(Config.CACHE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(Config.LOG_FILE), exist_ok=True)
    
    # Run linters
    run_linter()
    
    # Run type checker
    run_type_checker()
    
    # Run security check
    run_security_check()
    
    # Run tests
    run_tests()
    
    print("\nTest mode completed successfully!")

if __name__ == "__main__":
    main() 