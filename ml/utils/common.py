"""
Common utility functions for the ML backend.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Load and parse a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {str(e)}")
        raise

def save_json_file(data: Dict[str, Any], file_path: Path) -> None:
    """Save data to a JSON file."""
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving JSON file {file_path}: {str(e)}")
        raise

def format_timestamp(timestamp: Optional[datetime] = None) -> str:
    """Format a timestamp in ISO format."""
    if timestamp is None:
        timestamp = datetime.utcnow()
    return timestamp.isoformat()

def safe_get(obj: Dict[str, Any], *keys: str, default: Any = None) -> Any:
    """Safely get nested dictionary values."""
    for key in keys:
        if not isinstance(obj, dict):
            return default
        obj = obj.get(key, default)
        if obj is None:
            return default
    return obj 