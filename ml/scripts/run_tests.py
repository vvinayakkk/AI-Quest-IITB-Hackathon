"""
Script to run tests for the ML backend.
"""

import pytest
import argparse
from pathlib import Path
from ml.config.logging import logger

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run tests for the ML backend")
    parser.add_argument(
        "--test-path",
        type=str,
        default="tests",
        help="Path to test directory"
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose output"
    )
    parser.add_argument(
        "--coverage",
        action="store_true",
        help="Generate coverage report"
    )
    return parser.parse_args()

def main():
    """Main function to run tests."""
    args = parse_args()
    
    # Build pytest arguments
    pytest_args = [
        args.test_path,
        "-v" if args.verbose else None,
        "--cov=ml" if args.coverage else None,
        "--cov-report=term-missing" if args.coverage else None,
    ]
    pytest_args = [arg for arg in pytest_args if arg is not None]
    
    # Log test information
    logger.info("Starting test run")
    logger.info(f"Test path: {args.test_path}")
    logger.info(f"Verbose: {args.verbose}")
    logger.info(f"Coverage: {args.coverage}")
    
    # Run tests
    exit_code = pytest.main(pytest_args)
    
    # Log test results
    if exit_code == 0:
        logger.info("All tests passed!")
    else:
        logger.error(f"Tests failed with exit code {exit_code}")
    
    return exit_code

if __name__ == "__main__":
    exit(main()) 