# Project Structure Reorganization Guide

## Current Structure
```
ml/
├── __init__.py
├── app.py
├── main.py
├── config.py
├── utils.py
├── logging_config.py
├── cleanup.py
├── test.py
├── prod.py
├── dev.py
├── .env.example
├── .coveragerc
├── .gitignore
├── requirements.txt
├── README.md
├── agents/
├── api/
├── config/
├── database/
├── graph/
├── models/
├── schemas/
├── tests/
└── utils/
```

## Target Structure
```
ml/
├── __init__.py
├── main.py                 # Main FastAPI application
├── core/                  # Core functionality
│   ├── __init__.py
│   ├── config.py         # Configuration management
│   ├── logging.py        # Logging configuration
│   └── utils.py         # Utility functions
├── api/                  # API routes
│   ├── __init__.py
│   ├── github.py        # GitHub-related routes
│   └── agents.py        # Agent-related routes
├── services/            # Business logic
│   ├── __init__.py
│   ├── github.py       # GitHub service
│   └── agents.py       # Agent service
├── graph/              # Graph-based components
│   ├── __init__.py
│   ├── github/        # GitHub-specific components
│   │   ├── __init__.py
│   │   ├── code_analysis.py
│   │   ├── code_generation.py
│   │   ├── code_style.py
│   │   ├── realtime_analysis.py
│   │   ├── search.py
│   │   └── test_generation.py
│   └── rag/          # RAG components
│       ├── __init__.py
│       └── graph_rag.py
├── agents/           # Agent system
│   ├── __init__.py
│   ├── agent.py
│   └── agent_manager.py
├── database/        # Database management
│   ├── __init__.py
│   ├── connection.py
│   └── models.py
├── models/         # ML models
│   ├── __init__.py
│   └── database.py
├── schemas/       # Pydantic models
│   ├── __init__.py
│   ├── github.py
│   └── agents.py
├── config/       # Configuration files
│   ├── __init__.py
│   └── settings.py
├── tests/       # Test files
│   ├── __init__.py
│   ├── test_github.py
│   └── test_agents.py
└── utils/      # Utility functions
    ├── __init__.py
    └── helpers.py
```

## Steps to Reorganize

1. Create new directories:
```bash
mkdir -p ml/core ml/services
```

2. Move core files:
```bash
mv ml/utils.py ml/core/
mv ml/config.py ml/core/
mv ml/logging_config.py ml/core/
```

3. Create service files:
```bash
touch ml/services/__init__.py
touch ml/services/github.py
touch ml/services/agents.py
```

4. Move and rename files:
```bash
mv ml/app.py ml/main.py
mv ml/dev.py ml/config/dev.py
mv ml/prod.py ml/config/prod.py
mv ml/test.py ml/config/test.py
```

5. Update imports in all files to reflect new structure

6. Create necessary __init__.py files:
```bash
touch ml/core/__init__.py
touch ml/services/__init__.py
touch ml/graph/rag/__init__.py
```

7. Move test files:
```bash
mv ml/tests/test_*.py ml/tests/
```

8. Update requirements.txt and README.md to reflect new structure

## File Contents to Update

1. Update main.py imports:
```python
from ml.core.config import *
from ml.core.logging import *
from ml.core.utils import *
from ml.api.github import router as github_router
from ml.api.agents import router as agents_router
```

2. Update service imports:
```python
from ml.core.config import *
from ml.core.utils import *
from ml.graph.github import *
from ml.agents import *
```

3. Update API route imports:
```python
from ml.services.github import *
from ml.services.agents import *
from ml.schemas.github import *
from ml.schemas.agents import *
```

## Next Steps

1. Create new files with proper imports
2. Move existing code to new locations
3. Update all import statements
4. Test the new structure
5. Update documentation 