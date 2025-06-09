# AI-Quest IITB ML Backend

## Overview
AI-Quest IITB ML Backend is a modular, production-grade backend for advanced AI-powered research, code analysis, and knowledge retrieval. It powers features like:
- Wikipedia-powered chat with multi-article aggregation, citation, and context
- GitHub repository analysis and code RAG (Retrieval Augmented Generation)
- Agent-based automation for research, code, and data tasks
- Extensible architecture for new AI/ML features

This backend is built with FastAPI, Transformers, and modern Python best practices.

---

## Features
- **Wikipedia Chat**: Users can chat, get answers synthesized from multiple Wikipedia articles, and receive citations. Context is maintained for follow-up questions.
- **GitHub RAG**: Analyze repositories, extract code/documentation, and answer questions about codebases with context-aware retrieval.
- **Agent System**: Modular agents for research, code analysis, document processing, and more.
- **Extensible API**: Easily add new endpoints, agents, or data sources.
- **Production-Ready**: Logging, config, caching, and test structure included.

---

## Architecture
```
ml/
├── api/         # FastAPI route handlers (chat, github, agents, etc.)
├── agents/      # Agent classes and managers
├── config/      # Configuration and logging
├── core/        # Core logic (rag, github, etc.)
├── database/    # DB connection and models
├── graph/       # Knowledge graph, Wikipedia RAG, GitHub RAG
├── models/      # ORM/database models
├── schemas/     # Pydantic models for API
├── scripts/     # Run/test/utility scripts
├── services/    # Business logic/services
├── tests/       # Pytest-based tests
├── utils/       # Utility functions
├── app.py       # FastAPI app entry point
├── requirements.txt
├── README.md
└── .env.example
```

---

## Setup & Installation
1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd AI-Quest-IITB-Hackathon/ml
   ```
2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```
5. **Run the application**
   ```bash
   python scripts/run.py
   # or
   uvicorn app:app --reload
   ```

---

## Configuration
- All environment variables are in `.env.example`.
- Logging, cache, and model settings are in `config/settings.py`.
- Wikipedia cache is in `cache/wikipedia/` by default.

---

## API Documentation
Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 1. Wikipedia Chat API
**Endpoint:** `POST /api/v1/chat/chat`  
**Description:** Chat with Wikipedia-powered answers. Aggregates multiple articles, provides citations, and maintains context for follow-up questions.

**Request Body:**
```json
{
  "query": "What is quantum computing?"
}
```
- **query** (string, required): The user's question or topic.

**Response Body:**
```json
{
  "answer": "Quantum computing is ... [summary from multiple Wikipedia articles]",
  "citations": [
    "Source: https://en.wikipedia.org/wiki/Quantum_computing",
    "Source: https://en.wikipedia.org/wiki/Quantum_information"
  ],
  "context": [
    {"title": "...", "summary": "...", "url": "..."},
    ...
  ]
}
```
- **answer** (string): Synthesized answer from multiple Wikipedia articles.
- **citations** (array of strings): List of citation URLs.
- **context** (array of objects): Context for follow-up questions.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/chat/chat" -H "Content-Type: application/json" -d '{"query": "What is quantum computing?"}'
```

**Example Response:**
```json
{
  "answer": "Quantum computing is a type of computation that harnesses the collective properties of quantum states to perform calculations. It uses quantum bits (qubits) instead of classical bits.",
  "citations": [
    "Source: https://en.wikipedia.org/wiki/Quantum_computing",
    "Source: https://en.wikipedia.org/wiki/Quantum_information"
  ],
  "context": [
    {"title": "Quantum computing", "summary": "...", "url": "https://en.wikipedia.org/wiki/Quantum_computing"},
    {"title": "Quantum information", "summary": "...", "url": "https://en.wikipedia.org/wiki/Quantum_information"}
  ]
}
```

**Error Codes:**
- `404 Not Found`: No relevant information found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Multi-article aggregation for comprehensive answers.
- Real citations for transparency.
- Context is maintained for follow-up questions.

---

### 2. GitHub RAG API
**Endpoint:** `POST /api/v1/github/analyze`  
**Description:** Analyze a GitHub repository for code, documentation, and structure.

**Request Body:**
```json
{
  "repo_url": "https://github.com/example/repo"
}
```
- **repo_url** (string, required): URL of the GitHub repository.

**Response Body:**
```json
{
  "summary": "Repository summary...",
  "files": ["file1.py", "file2.py", ...],
  "insights": ["insight1", "insight2", ...],
  "graph": {"nodes": [...], "edges": [...]}
}
```
- **summary** (string): Summary of the repository.
- **files** (array of strings): List of files in the repository.
- **insights** (array of strings): Key insights about the repository.
- **graph** (object): Knowledge graph of the repository.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/github/analyze" -H "Content-Type: application/json" -d '{"repo_url": "https://github.com/example/repo"}'
```

**Example Response:**
```json
{
  "summary": "A Python-based ML project with FastAPI and Transformers.",
  "files": ["app.py", "requirements.txt", "README.md"],
  "insights": ["Uses FastAPI for API", "Includes ML models"],
  "graph": {"nodes": [...], "edges": [...]}
}
```

**Error Codes:**
- `400 Bad Request`: Invalid repository URL.
- `404 Not Found`: Repository not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Extracts code, documentation, and structure.
- Builds a knowledge graph for context-aware retrieval.

---

### 3. GitHub Code Style API
**Endpoint:** `POST /api/v1/github/check_style`  
**Description:** Check the code style of a GitHub repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/example/repo"
}
```
- **repo_url** (string, required): URL of the GitHub repository.

**Response Body:**
```json
{
  "style_report": "Code style report...",
  "issues": ["issue1", "issue2", ...]
}
```
- **style_report** (string): Detailed code style report.
- **issues** (array of strings): List of style issues.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/github/check_style" -H "Content-Type: application/json" -d '{"repo_url": "https://github.com/example/repo"}'
```

**Example Response:**
```json
{
  "style_report": "Code follows PEP 8 standards.",
  "issues": ["Missing docstrings in functions", "Line too long in file1.py"]
}
```

**Error Codes:**
- `400 Bad Request`: Invalid repository URL.
- `404 Not Found`: Repository not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Checks for PEP 8 compliance and other style issues.

---

### 4. GitHub Test Generation API
**Endpoint:** `POST /api/v1/github/generate_tests`  
**Description:** Generate unit tests for a GitHub repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/example/repo"
}
```
- **repo_url** (string, required): URL of the GitHub repository.

**Response Body:**
```json
{
  "tests": ["test1.py", "test2.py", ...],
  "coverage": "85%"
}
```
- **tests** (array of strings): Generated test files.
- **coverage** (string): Test coverage percentage.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/github/generate_tests" -H "Content-Type: application/json" -d '{"repo_url": "https://github.com/example/repo"}'
```

**Example Response:**
```json
{
  "tests": ["test_app.py", "test_models.py"],
  "coverage": "85%"
}
```

**Error Codes:**
- `400 Bad Request`: Invalid repository URL.
- `404 Not Found`: Repository not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Generates unit tests for the repository.
- Reports test coverage.

---

### 5. GitHub Code Search API
**Endpoint:** `POST /api/v1/github/search`  
**Description:** Search for code in a GitHub repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/example/repo",
  "query": "def main"
}
```
- **repo_url** (string, required): URL of the GitHub repository.
- **query** (string, required): Search query.

**Response Body:**
```json
{
  "results": ["file1.py:10", "file2.py:20", ...]
}
```
- **results** (array of strings): List of search results.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/github/search" -H "Content-Type: application/json" -d '{"repo_url": "https://github.com/example/repo", "query": "def main"}'
```

**Example Response:**
```json
{
  "results": ["app.py:10", "main.py:5"]
}
```

**Error Codes:**
- `400 Bad Request`: Invalid repository URL or query.
- `404 Not Found`: Repository not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Searches for code snippets in the repository.

---

### 6. GitHub Code Generation API
**Endpoint:** `POST /api/v1/github/generate`  
**Description:** Generate code for a GitHub repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/example/repo",
  "prompt": "Generate a FastAPI endpoint for user authentication"
}
```
- **repo_url** (string, required): URL of the GitHub repository.
- **prompt** (string, required): Code generation prompt.

**Response Body:**
```json
{
  "generated_code": "from fastapi import FastAPI, Depends, HTTPException...",
  "file": "auth.py"
}
```
- **generated_code** (string): Generated code snippet.
- **file** (string): File where the code is generated.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/github/generate" -H "Content-Type: application/json" -d '{"repo_url": "https://github.com/example/repo", "prompt": "Generate a FastAPI endpoint for user authentication"}'
```

**Example Response:**
```json
{
  "generated_code": "from fastapi import FastAPI, Depends, HTTPException...",
  "file": "auth.py"
}
```

**Error Codes:**
- `400 Bad Request`: Invalid repository URL or prompt.
- `404 Not Found`: Repository not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Generates code based on the provided prompt.

---

### 7. Agents API
**Endpoint:** `POST /api/v1/agents/create`  
**Description:** Create a new agent for research, code, or data tasks.

**Request Body:**
```json
{
  "agent_type": "research",
  "task": "Summarize the latest AI research on transformers"
}
```
- **agent_type** (string, required): Type of agent (e.g., "research", "code", "data").
- **task** (string, required): Task for the agent.

**Response Body:**
```json
{
  "agent_id": "agent123",
  "status": "created"
}
```
- **agent_id** (string): Unique identifier for the agent.
- **status** (string): Status of the agent.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/agents/create" -H "Content-Type: application/json" -d '{"agent_type": "research", "task": "Summarize the latest AI research on transformers"}'
```

**Example Response:**
```json
{
  "agent_id": "agent123",
  "status": "created"
}
```

**Error Codes:**
- `400 Bad Request`: Invalid agent type or task.
- `500 Internal Server Error`: Server error.

**Notes:**
- Creates a new agent for the specified task.

---

### 8. Agents Execute API
**Endpoint:** `POST /api/v1/agents/execute`  
**Description:** Execute a task with an existing agent.

**Request Body:**
```json
{
  "agent_id": "agent123",
  "task": "Summarize the latest AI research on transformers"
}
```
- **agent_id** (string, required): Unique identifier for the agent.
- **task** (string, required): Task for the agent.

**Response Body:**
```json
{
  "result": "Latest research on transformers...",
  "details": {...}
}
```
- **result** (string): Result of the task.
- **details** (object): Additional details.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/agents/execute" -H "Content-Type: application/json" -d '{"agent_id": "agent123", "task": "Summarize the latest AI research on transformers"}'
```

**Example Response:**
```json
{
  "result": "Latest research on transformers...",
  "details": {...}
}
```

**Error Codes:**
- `400 Bad Request`: Invalid agent ID or task.
- `404 Not Found`: Agent not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Executes a task with the specified agent.

---

### 9. Agents Status API
**Endpoint:** `GET /api/v1/agents/status/{agent_id}`  
**Description:** Get the status of an agent.

**Response Body:**
```json
{
  "status": "running",
  "details": {...}
}
```
- **status** (string): Status of the agent.
- **details** (object): Additional details.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/agents/status/agent123"
```

**Example Response:**
```json
{
  "status": "running",
  "details": {...}
}
```

**Error Codes:**
- `404 Not Found`: Agent not found.
- `500 Internal Server Error`: Server error.

**Notes:**
- Retrieves the status of the specified agent.

---

### 10. Agents List API
**Endpoint:** `GET /api/v1/agents/list`  
**Description:** List all agents.

**Response Body:**
```json
{
  "agents": [
    {"agent_id": "agent123", "status": "running"},
    {"agent_id": "agent456", "status": "completed"}
  ]
}
```
- **agents** (array of objects): List of agents.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/agents/list"
```

**Example Response:**
```json
{
  "agents": [
    {"agent_id": "agent123", "status": "running"},
    {"agent_id": "agent456", "status": "completed"}
  ]
}
```

**Error Codes:**
- `500 Internal Server Error`: Server error.

**Notes:**
- Lists all agents and their statuses.

---

## Usage Examples
### Wikipedia Chat (Python)
```python
import requests
resp = requests.post("http://localhost:8000/api/v1/chat/chat", json={"query": "What is quantum computing?"})
print(resp.json())
```

### GitHub RAG (Python)
```python
import requests
resp = requests.post("http://localhost:8000/api/v1/github/analyze", json={"repo_url": "https://github.com/example/repo"})
print(resp.json())
```

---

## Development Workflow
- **Run tests:**
  ```bash
  python scripts/run_tests.py
  ```
- **Lint code:**
  ```bash
  flake8
  ```
- **Format code:**
  ```bash
  black .
  ```
- **Add new features:**
  - Add new endpoints in `api/`
  - Add new agents in `agents/`
  - Add new RAG/data logic in `graph/`

---

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## FAQ
**Q: How does the Wikipedia chat maintain context?**
A: Each query and its results are stored in a context cache, so follow-up questions can reference previous answers.

**Q: Can I add new data sources or agents?**
A: Yes! The architecture is modular. Add new agents in `agents/`, new RAG modules in `graph/`, and new endpoints in `api/`.

**Q: Is this production-ready?**
A: Yes, with logging, config, and test structure. For full production, add HTTPS, authentication, and monitoring as needed.

---

## License
MIT License. See `LICENSE` file.
