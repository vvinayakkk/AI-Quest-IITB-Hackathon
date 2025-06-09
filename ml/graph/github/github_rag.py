"""
GitHub RAG Module
Main module that integrates all components for GitHub repository analysis.
"""

from typing import List, Dict, Any, Optional, Union
from github import Github
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import spacy
import networkx as nx
from ml.config import Config
from ml.graph.github.embeddings import EnhancedEmbeddings
from ml.graph.github.chunking import SmartChunker
from ml.graph.github.chat import ChatManager
from ml.graph.github.retrieval import EnhancedRetriever
from ml.graph.github.knowledge_graph import KnowledgeGraphBuilder
from ml.graph.github.language_analyzers import (
    PythonAnalyzer,
    JavaScriptAnalyzer,
    HTMLAnalyzer,
    CSSAnalyzer
)

class GitHubRAG:
    """GitHub Repository Analysis and Generation"""
    
    def __init__(self, github_token: str):
        """Initialize GitHub RAG"""
        self.github = Github(github_token)
        self.setup_components()
    
    def setup_components(self):
        """Setup RAG components"""
        # Initialize embeddings
        self.embeddings = EnhancedEmbeddings()
        
        # Initialize chunker
        self.chunker = SmartChunker()
        
        # Initialize chat manager
        self.chat_manager = ChatManager()
        
        # Initialize retriever
        self.retriever = EnhancedRetriever(self.embeddings)
        
        # Initialize knowledge graph
        self.knowledge_graph = KnowledgeGraphBuilder()
        
        # Initialize language analyzers
        self.analyzers = {
            "python": PythonAnalyzer(),
            "javascript": JavaScriptAnalyzer(),
            "html": HTMLAnalyzer(),
            "css": CSSAnalyzer()
        }
        
        # Load spaCy model
        self.nlp = spacy.load("en_core_web_lg")
    
    def process_repository(self, repo_url: str) -> Dict[str, Any]:
        """Process a GitHub repository"""
        try:
            # Extract repository information
            repo_info = self._extract_repo_info(repo_url)
            
            # Process codebase
            codebase = self._process_codebase(repo_info)
            
            # Process commits
            commits = self._process_commits(repo_info)
            
            # Process issues and PRs
            issues_prs = self._process_issues_prs(repo_info)
            
            # Process dependencies
            dependencies = self._process_dependencies(repo_info)
            
            # Process documentation
            documentation = self._process_documentation(repo_info)
            
            # Build knowledge graph
            graph_data = {
                "repository": repo_info,
                "codebase": codebase,
                "commits": commits,
                "issues_prs": issues_prs,
                "dependencies": dependencies,
                "documentation": documentation
            }
            graph_info = self.knowledge_graph.build_graph(graph_data)
            
            return {
                "repository": repo_info,
                "codebase": codebase,
                "commits": commits,
                "issues_prs": issues_prs,
                "dependencies": dependencies,
                "documentation": documentation,
                "graph": graph_info
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _extract_repo_info(self, repo_url: str) -> Dict[str, Any]:
        """Extract repository information"""
        repo = self.github.get_repo(repo_url)
        return {
            "name": repo.name,
            "owner": repo.owner.login,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "topics": repo.get_topics(),
            "created_at": repo.created_at.isoformat(),
            "updated_at": repo.updated_at.isoformat()
        }
    
    def _process_codebase(self, repo_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process repository codebase"""
        repo = self.github.get_repo(f"{repo_info['owner']}/{repo_info['name']}")
        codebase = []
        
        for content in repo.get_contents(""):
            if content.type == "file":
                file_info = self._process_file(content)
                if file_info:
                    codebase.append(file_info)
            elif content.type == "dir":
                codebase.extend(self._process_directory(content))
        
        return codebase
    
    def _process_file(self, content: Any) -> Optional[Dict[str, Any]]:
        """Process a single file"""
        try:
            # Get file content
            file_content = content.decoded_content.decode()
            
            # Detect language
            language = self._detect_language(content.name, file_content)
            
            # Analyze code if language is supported
            analysis = {}
            if language in self.analyzers:
                analysis = self.analyzers[language].analyze(file_content)
            
            # Chunk content
            chunks = self.chunker.chunk(file_content, language)
            
            # Store chunks in vector store
            self.retriever.add_documents(chunks)
            
            return {
                "path": content.path,
                "language": language,
                "size": content.size,
                "analysis": analysis,
                "chunks": len(chunks)
            }
            
        except Exception as e:
            return None
    
    def _process_directory(self, content: Any) -> List[Dict[str, Any]]:
        """Process a directory"""
        files = []
        for item in content.get_contents():
            if item.type == "file":
                file_info = self._process_file(item)
                if file_info:
                    files.append(file_info)
            elif item.type == "dir":
                files.extend(self._process_directory(item))
        return files
    
    def _process_commits(self, repo_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process repository commits"""
        repo = self.github.get_repo(f"{repo_info['owner']}/{repo_info['name']}")
        commits = []
        
        for commit in repo.get_commits():
            commit_info = {
                "sha": commit.sha,
                "author": commit.author.login if commit.author else None,
                "message": commit.commit.message,
                "date": commit.commit.author.date.isoformat(),
                "files": [file.filename for file in commit.files]
            }
            commits.append(commit_info)
        
        return commits
    
    def _process_issues_prs(self, repo_info: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Process issues and pull requests"""
        repo = self.github.get_repo(f"{repo_info['owner']}/{repo_info['name']}")
        
        issues = []
        for issue in repo.get_issues():
            issue_info = {
                "number": issue.number,
                "title": issue.title,
                "state": issue.state,
                "author": issue.user.login,
                "created_at": issue.created_at.isoformat(),
                "updated_at": issue.updated_at.isoformat(),
                "labels": [label.name for label in issue.labels],
                "comments": issue.comments
            }
            issues.append(issue_info)
        
        prs = []
        for pr in repo.get_pulls():
            pr_info = {
                "number": pr.number,
                "title": pr.title,
                "state": pr.state,
                "author": pr.user.login,
                "created_at": pr.created_at.isoformat(),
                "updated_at": pr.updated_at.isoformat(),
                "labels": [label.name for label in pr.labels],
                "comments": pr.comments,
                "commits": pr.commits,
                "additions": pr.additions,
                "deletions": pr.deletions,
                "changed_files": pr.changed_files
            }
            prs.append(pr_info)
        
        return {
            "issues": issues,
            "pull_requests": prs
        }
    
    def _process_dependencies(self, repo_info: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Process repository dependencies"""
        repo = self.github.get_repo(f"{repo_info['owner']}/{repo_info['name']}")
        dependencies = {
            "python": [],
            "javascript": [],
            "java": [],
            "ruby": []
        }
        
        try:
            # Check for requirements.txt
            requirements = repo.get_contents("requirements.txt")
            if requirements:
                content = requirements.decoded_content.decode()
                for line in content.splitlines():
                    if line and not line.startswith("#"):
                        dep_info = self._parse_dependency(line)
                        if dep_info:
                            dependencies["python"].append(dep_info)
        except:
            pass
        
        try:
            # Check for package.json
            package_json = repo.get_contents("package.json")
            if package_json:
                content = package_json.decoded_content.decode()
                import json
                data = json.loads(content)
                if "dependencies" in data:
                    for name, version in data["dependencies"].items():
                        dependencies["javascript"].append({
                            "name": name,
                            "version": version,
                            "type": "dependency"
                        })
                if "devDependencies" in data:
                    for name, version in data["devDependencies"].items():
                        dependencies["javascript"].append({
                            "name": name,
                            "version": version,
                            "type": "devDependency"
                        })
        except:
            pass
        
        return dependencies
    
    def _parse_dependency(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse dependency line"""
        try:
            # Remove comments
            line = line.split("#")[0].strip()
            if not line:
                return None
            
            # Parse package name and version
            if "==" in line:
                name, version = line.split("==")
            elif ">=" in line:
                name, version = line.split(">=")
            elif "<=" in line:
                name, version = line.split("<=")
            else:
                name, version = line, "latest"
            
            return {
                "name": name.strip(),
                "version": version.strip(),
                "type": "dependency"
            }
        except:
            return None
    
    def _process_documentation(self, repo_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process repository documentation"""
        repo = self.github.get_repo(f"{repo_info['owner']}/{repo_info['name']}")
        documentation = []
        
        # Check for README
        try:
            readme = repo.get_readme()
            if readme:
                content = readme.decoded_content.decode()
                documentation.append({
                    "path": "README.md",
                    "content": content,
                    "type": "readme"
                })
        except:
            pass
        
        # Check for docs directory
        try:
            docs = repo.get_contents("docs")
            if docs:
                for content in docs:
                    if content.type == "file" and content.name.endswith((".md", ".rst", ".txt")):
                        doc_content = content.decoded_content.decode()
                        documentation.append({
                            "path": content.path,
                            "content": doc_content,
                            "type": "documentation"
                        })
        except:
            pass
        
        return documentation
    
    def _detect_language(self, filename: str, content: str) -> str:
        """Detect programming language"""
        # Check file extension
        ext = filename.split(".")[-1].lower()
        if ext in ["py"]:
            return "python"
        elif ext in ["js", "jsx"]:
            return "javascript"
        elif ext in ["ts", "tsx"]:
            return "typescript"
        elif ext in ["html", "htm"]:
            return "html"
        elif ext in ["css", "scss", "sass"]:
            return "css"
        elif ext in ["java"]:
            return "java"
        else:
            return "unknown"
    
    def query(self, question: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query the repository"""
        try:
            # Retrieve relevant documents
            docs = self.retriever.retrieve(question)
            
            # Query knowledge graph
            graph_results = self.knowledge_graph.query_graph(question)
            
            # Get chat response
            response = self.chat_manager.chat(
                question,
                context={
                    "documents": docs,
                    "graph_results": graph_results,
                    "context": context
                }
            )
            
            return {
                "answer": response["answer"],
                "code_blocks": response["code_blocks"],
                "references": response["references"],
                "confidence": response["confidence"]
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_repository_info(self) -> Dict[str, Any]:
        """Get repository information"""
        return {
            "embeddings": self.embeddings.get_model_info(),
            "chunking": self.chunker.get_chunk_info(),
            "retrieval": self.retriever.get_retrieval_info(),
            "graph": self.knowledge_graph.get_graph_info()
        } 