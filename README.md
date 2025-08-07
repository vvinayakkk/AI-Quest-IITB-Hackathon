# AI-Quest IITB Hackathon Project

## Overview
AI-Quest IITB is a modular, production-grade repository for advanced AI-powered research, code analysis, knowledge retrieval, and community features. It powers:
- Wikipedia-powered chat with multi-article aggregation, citation, and context
- GitHub repository analysis and code RAG (Retrieval Augmented Generation)
- Agent-based automation for research, code, and data tasks
- Full-featured community backend (posts, comments, moderation, notifications, user groups, collections, etc.)
- Extensible architecture for new AI/ML and community features

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/5c9803d2-d2be-428f-95b1-41ecf9bfce8e" />

This backend is built with FastAPI, Transformers, and modern Python best practices.

---

## Key Features

### ML & AI Features
- **Wikipedia Chat**: Ask questions and get answers synthesized from multiple Wikipedia articles, with citations and context for follow-up questions.
- **GitHub Repository Analysis (RAG)**: Analyze repositories, extract code/documentation, and answer questions about codebases with context-aware retrieval and knowledge graphs.
- **Agent System**: Modular agents for research, code analysis, document processing, and more. Automate complex research and data tasks.
- **Extensible ML API**: Easily add new endpoints, agents, or data sources for advanced AI/ML use cases.

### Community & Content Features
- **Authentication & User Management**: Secure signup, login, password reset, email verification, and user profile management.
- **Posts & Comments**: Create, update, delete, search, and interact with posts and comments. Includes voting, bookmarking, reporting, and trending content.
- **Collections & Bookmarks**: Organize content into collections, manage bookmarks, and collaborate on reading lists.
- **Content Organization**: Categories, tags, badges, and achievements for rich content classification and gamification.
- **Moderation & Reporting**: Flag/report content, moderation queues, ban/unban users, and detailed moderation analytics.
- **User Groups & Teams**: Create and manage user groups, assign roles, and collaborate in teams.
- **Messaging & Notifications**: Private messaging, notification preferences, and real-time alerts.
- **Community Guidelines**: Publish, update, and manage community guidelines and policies.
- **Integration System**: Connect with external services (e.g., GitHub, OAuth providers, webhooks, API keys) and manage integration settings.
- **Analytics & System Health**: Track system health, logs, metrics, and analytics for monitoring and optimization.

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
server/
├── routes/      # Express route handlers (auth, user, post, content, etc.)
├── controllers/ # Business logic/controllers
├── models/      # Mongoose models
├── middleware/  # Express middleware
├── ...
```

---

## Setup & Installation
1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd AI-Quest-IITB-Hackathon
   ```
2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
3. **Install dependencies**
   ```bash
   pip install -r ml/requirements.txt
   ```
4. **Configure environment**
   ```bash
   cp ml/.env.example ml/.env
   # Edit ml/.env as needed
   ```
5. **Run the ML backend**
   ```bash
   cd ml
   python scripts/run.py
   # or
   uvicorn app:app --reload
   ```
6. **Run the Node.js server**
   ```bash
   cd server
   npm install
   npm start
   ```

---

## Usage Examples
- **Wikipedia Chat**: Ask questions and get cited, multi-article answers.
- **GitHub RAG**: Analyze any public repo for code, docs, and structure.
- **Agent Automation**: Automate research, code, and data tasks with modular agents.
- **Community Platform**: Build, moderate, and grow a knowledge-sharing community with rich content, moderation, and collaboration features.

---

## Development Workflow
- **Run ML tests:**
  ```bash
  cd ml
  python scripts/run_tests.py
  ```
- **Lint ML code:**
  ```bash
  cd ml
  flake8
  ```
- **Format ML code:**
  ```bash
  cd ml
  black .
  ```
- **Run Node.js server tests:**
  ```bash
  cd server
  npm test
  ```
- **Add new features:**
  - Add new endpoints in `ml/api/` or `server/routes/`
  - Add new agents in `ml/agents/`
  - Add new RAG/data logic in `ml/graph/`
  - Add new community features in `server/`

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

**Q: Can I add new data sources, agents, or community features?**
A: Yes! The architecture is modular. Add new agents in `ml/agents/`, new RAG modules in `ml/graph/`, new endpoints in `ml/api/` or `server/routes/`, and new features in `server/`.

**Q: Is this production-ready?**
A: Yes, with logging, config, and test structure. For full production, add HTTPS, authentication, and monitoring as needed.

---

## License
MIT License. See `LICENSE` file.

