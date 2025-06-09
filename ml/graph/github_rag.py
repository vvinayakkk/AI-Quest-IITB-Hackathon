from typing import Dict, List, Any, Optional, Tuple
import logging
from pathlib import Path
import sys
import os
import re
import json
import base64
from datetime import datetime
from github import Github, GithubException
from github.Repository import Repository
from github.ContentFile import ContentFile
from github.Commit import Commit
from github.PullRequest import PullRequest
from github.Issue import Issue
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
import spacy
import networkx as nx
from tqdm import tqdm
import ast
import javalang
import esprima
import dockerfile
import yaml
import json5
import css_parser
import html5lib
from bs4 import BeautifulSoup
from PIL import Image
import pytesseract
import pandas as pd
import numpy as np

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from ml.config import Config
from ml.utils import setup_logging
from ml.graph.neo4j_manager import Neo4jManager

# Setup logging
logger = logging.getLogger(__name__)
setup_logging(
    log_level=Config.LOG_LEVEL,
    log_file=str(Config.LOG_FILE)
)

class TechnologyAnalyzer:
    """Advanced technology stack analyzer"""
    
    def __init__(self):
        """Initialize technology analyzer"""
        self.tech_patterns = {
            "frontend": {
                "react": [
                    r"import\s+React",
                    r"from\s+['\"]react['\"]",
                    r"\.jsx?$",
                    r"\.tsx?$"
                ],
                "vue": [
                    r"import\s+Vue",
                    r"from\s+['\"]vue['\"]",
                    r"\.vue$"
                ],
                "angular": [
                    r"import\s+.*from\s+['\"]@angular/",
                    r"\.component\.ts$"
                ],
                "typescript": [
                    r"\.ts$",
                    r"\.tsx$",
                    r"tsconfig\.json$"
                ],
                "css": [
                    r"\.css$",
                    r"\.scss$",
                    r"\.sass$",
                    r"\.less$"
                ]
            },
            "backend": {
                "python": [
                    r"\.py$",
                    r"requirements\.txt$",
                    r"from\s+flask|from\s+django|from\s+fastapi"
                ],
                "node": [
                    r"\.js$",
                    r"package\.json$",
                    r"from\s+express|from\s+koa"
                ],
                "java": [
                    r"\.java$",
                    r"pom\.xml$",
                    r"\.gradle$"
                ],
                "go": [
                    r"\.go$",
                    r"go\.mod$"
                ]
            },
            "database": {
                "postgresql": [
                    r"postgresql",
                    r"psycopg2",
                    r"pg_"
                ],
                "mongodb": [
                    r"mongodb",
                    r"mongoose"
                ],
                "mysql": [
                    r"mysql",
                    r"mysqldb"
                ]
            },
            "devops": {
                "docker": [
                    r"Dockerfile$",
                    r"docker-compose\.yml$"
                ],
                "kubernetes": [
                    r"\.yaml$",
                    r"kubectl"
                ],
                "terraform": [
                    r"\.tf$",
                    r"terraform"
                ]
            }
        }
    
    def analyze_tech_stack(self, repo: Repository) -> Dict[str, Any]:
        """Analyze technology stack of repository"""
        tech_stack = {
            "frontend": set(),
            "backend": set(),
            "database": set(),
            "devops": set(),
            "dependencies": {},
            "configurations": {}
        }
        
        # Analyze all files
        for file in repo.get_contents("", recursive=True):
            if isinstance(file, ContentFile):
                self._analyze_file_tech(file, tech_stack)
        
        return tech_stack
    
    def _analyze_file_tech(self, file: ContentFile, tech_stack: Dict[str, Any]):
        """Analyze technology in file"""
        try:
            content = base64.b64decode(file.content).decode("utf-8")
            path = file.path.lower()
            
            # Check frontend technologies
            for tech, patterns in self.tech_patterns["frontend"].items():
                if any(re.search(pattern, content) or re.search(pattern, path) for pattern in patterns):
                    tech_stack["frontend"].add(tech)
            
            # Check backend technologies
            for tech, patterns in self.tech_patterns["backend"].items():
                if any(re.search(pattern, content) or re.search(pattern, path) for pattern in patterns):
                    tech_stack["backend"].add(tech)
            
            # Check database technologies
            for tech, patterns in self.tech_patterns["database"].items():
                if any(re.search(pattern, content) or re.search(pattern, path) for pattern in patterns):
                    tech_stack["database"].add(tech)
            
            # Check devops technologies
            for tech, patterns in self.tech_patterns["devops"].items():
                if any(re.search(pattern, content) or re.search(pattern, path) for pattern in patterns):
                    tech_stack["devops"].add(tech)
            
            # Analyze specific file types
            if path.endswith("package.json"):
                self._analyze_package_json(content, tech_stack)
            elif path.endswith("requirements.txt"):
                self._analyze_requirements_txt(content, tech_stack)
            elif path.endswith("Dockerfile"):
                self._analyze_dockerfile(content, tech_stack)
            elif path.endswith(".yaml") or path.endswith(".yml"):
                self._analyze_yaml(content, tech_stack)
            
        except Exception as e:
            logger.error(f"Error analyzing file {file.path}: {str(e)}")

class CodeUnderstanding:
    """Advanced code understanding and analysis"""
    
    def __init__(self):
        """Initialize code understanding"""
        self.nlp = spacy.load("en_core_web_lg")
        self.setup_parsers()
    
    def setup_parsers(self):
        """Setup language-specific parsers"""
        self.parsers = {
            "python": self._parse_python,
            "javascript": self._parse_javascript,
            "typescript": self._parse_typescript,
            "java": self._parse_java,
            "html": self._parse_html,
            "css": self._parse_css
        }
    
    def analyze_code(self, content: str, language: str) -> Dict[str, Any]:
        """Analyze code based on language"""
        if language in self.parsers:
            return self.parsers[language](content)
        return self._generic_analysis(content)
    
    def _parse_python(self, content: str) -> Dict[str, Any]:
        """Parse Python code"""
        try:
            tree = ast.parse(content)
            analysis = {
                "imports": [],
                "classes": [],
                "functions": [],
                "variables": [],
                "decorators": []
            }
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    analysis["imports"].extend(n.name for n in node.names)
                elif isinstance(node, ast.ImportFrom):
                    analysis["imports"].append(f"{node.module}.{node.names[0].name}")
                elif isinstance(node, ast.ClassDef):
                    analysis["classes"].append({
                        "name": node.name,
                        "bases": [b.id for b in node.bases if isinstance(b, ast.Name)],
                        "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)]
                    })
                elif isinstance(node, ast.FunctionDef):
                    analysis["functions"].append({
                        "name": node.name,
                        "args": [arg.arg for arg in node.args.args],
                        "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)]
                    })
                elif isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            analysis["variables"].append(target.id)
            
            return analysis
        except Exception as e:
            logger.error(f"Error parsing Python code: {str(e)}")
            return {}
    
    def _parse_typescript(self, content: str) -> Dict[str, Any]:
        """Parse TypeScript code"""
        try:
            tree = esprima.parseScript(content, {"loc": True, "range": True})
            analysis = {
                "imports": [],
                "interfaces": [],
                "classes": [],
                "functions": [],
                "types": []
            }
            
            for node in tree.body:
                if node.type == "ImportDeclaration":
                    analysis["imports"].append(node.source.value)
                elif node.type == "InterfaceDeclaration":
                    analysis["interfaces"].append({
                        "name": node.id.name,
                        "properties": [p.key.name for p in node.body.properties]
                    })
                elif node.type == "ClassDeclaration":
                    analysis["classes"].append({
                        "name": node.id.name,
                        "methods": [m.key.name for m in node.body.body if m.type == "MethodDefinition"]
                    })
                elif node.type == "FunctionDeclaration":
                    analysis["functions"].append({
                        "name": node.id.name,
                        "params": [p.name for p in node.params]
                    })
                elif node.type == "TypeAliasDeclaration":
                    analysis["types"].append({
                        "name": node.id.name,
                        "type": node.right.type
                    })
            
            return analysis
        except Exception as e:
            logger.error(f"Error parsing TypeScript code: {str(e)}")
            return {}
    
    def _parse_html(self, content: str) -> Dict[str, Any]:
        """Parse HTML code"""
        try:
            soup = BeautifulSoup(content, "html5lib")
            analysis = {
                "elements": [],
                "scripts": [],
                "styles": [],
                "meta": [],
                "links": []
            }
            
            # Analyze elements
            for tag in soup.find_all():
                analysis["elements"].append({
                    "tag": tag.name,
                    "id": tag.get("id"),
                    "class": tag.get("class"),
                    "attributes": dict(tag.attrs)
                })
            
            # Analyze scripts
            for script in soup.find_all("script"):
                analysis["scripts"].append({
                    "src": script.get("src"),
                    "type": script.get("type"),
                    "content": script.string if script.string else None
                })
            
            # Analyze styles
            for style in soup.find_all("style"):
                analysis["styles"].append({
                    "type": style.get("type"),
                    "content": style.string
                })
            
            # Analyze meta tags
            for meta in soup.find_all("meta"):
                analysis["meta"].append(dict(meta.attrs))
            
            # Analyze links
            for link in soup.find_all("link"):
                analysis["links"].append(dict(link.attrs))
            
            return analysis
        except Exception as e:
            logger.error(f"Error parsing HTML code: {str(e)}")
            return {}
    
    def _parse_css(self, content: str) -> Dict[str, Any]:
        """Parse CSS code"""
        try:
            parser = css_parser.CSSParser()
            stylesheet = parser.parseString(content)
            analysis = {
                "rules": [],
                "selectors": [],
                "properties": [],
                "media_queries": []
            }
            
            for rule in stylesheet:
                if rule.type == rule.STYLE_RULE:
                    analysis["rules"].append({
                        "selector": rule.selectorText,
                        "properties": [p.name for p in rule.style]
                    })
                    analysis["selectors"].append(rule.selectorText)
                    analysis["properties"].extend(p.name for p in rule.style)
                elif rule.type == rule.MEDIA_RULE:
                    analysis["media_queries"].append({
                        "condition": rule.media.mediaText,
                        "rules": [r.selectorText for r in rule.cssRules]
                    })
            
            return analysis
        except Exception as e:
            logger.error(f"Error parsing CSS code: {str(e)}")
            return {}

class ImageAnalyzer:
    """Advanced image analysis and understanding"""
    
    def __init__(self):
        """Initialize image analyzer"""
        self.setup_ocr()
    
    def setup_ocr(self):
        """Setup OCR capabilities"""
        try:
            pytesseract.get_tesseract_version()
        except:
            logger.warning("Tesseract OCR not found. Image text extraction will be limited.")
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analyze image content"""
        try:
            image = Image.open(image_path)
            analysis = {
                "metadata": self._extract_metadata(image),
                "text": self._extract_text(image),
                "objects": self._detect_objects(image),
                "colors": self._analyze_colors(image),
                "faces": self._detect_faces(image)
            }
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing image {image_path}: {str(e)}")
            return {}
    
    def _extract_metadata(self, image: Image.Image) -> Dict[str, Any]:
        """Extract image metadata"""
        return {
            "format": image.format,
            "mode": image.mode,
            "size": image.size,
            "info": image.info
        }
    
    def _extract_text(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Extract text from image"""
        try:
            text = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            return [{
                "text": text["text"][i],
                "confidence": text["conf"][i],
                "box": {
                    "left": text["left"][i],
                    "top": text["top"][i],
                    "width": text["width"][i],
                    "height": text["height"][i]
                }
            } for i in range(len(text["text"])) if text["text"][i].strip()]
        except:
            return []
    
    def _detect_objects(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Detect objects in image"""
        # Implement object detection using a pre-trained model
        return []
    
    def _analyze_colors(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze image colors"""
        try:
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Get color histogram
            histogram = image.histogram()
            
            # Find dominant colors
            colors = []
            for i in range(0, len(histogram), 3):
                r, g, b = histogram[i:i+3]
                if r > 0 or g > 0 or b > 0:
                    colors.append({
                        "rgb": (i//3, i//3, i//3),
                        "count": max(r, g, b)
                    })
            
            # Sort by count
            colors.sort(key=lambda x: x["count"], reverse=True)
            
            return {
                "dominant_colors": colors[:5],
                "color_count": len(colors)
            }
        except:
            return {}
    
    def _detect_faces(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Detect faces in image"""
        # Implement face detection using a pre-trained model
        return []

class TableAnalyzer:
    """Advanced table analysis and understanding"""
    
    def __init__(self):
        """Initialize table analyzer"""
        self.setup_parsers()
    
    def setup_parsers(self):
        """Setup table parsers"""
        self.parsers = {
            "csv": self._parse_csv,
            "excel": self._parse_excel,
            "html": self._parse_html_table,
            "json": self._parse_json_table
        }
    
    def analyze_table(self, content: str, format: str) -> Dict[str, Any]:
        """Analyze table content"""
        if format in self.parsers:
            return self.parsers[format](content)
        return {}
    
    def _parse_csv(self, content: str) -> Dict[str, Any]:
        """Parse CSV table"""
        try:
            df = pd.read_csv(content)
            return self._analyze_dataframe(df)
        except:
            return {}
    
    def _parse_excel(self, content: str) -> Dict[str, Any]:
        """Parse Excel table"""
        try:
            df = pd.read_excel(content)
            return self._analyze_dataframe(df)
        except:
            return {}
    
    def _parse_html_table(self, content: str) -> Dict[str, Any]:
        """Parse HTML table"""
        try:
            soup = BeautifulSoup(content, "html5lib")
            table = soup.find("table")
            if table:
                df = pd.read_html(str(table))[0]
                return self._analyze_dataframe(df)
            return {}
        except:
            return {}
    
    def _parse_json_table(self, content: str) -> Dict[str, Any]:
        """Parse JSON table"""
        try:
            data = json.loads(content)
            if isinstance(data, list):
                df = pd.DataFrame(data)
                return self._analyze_dataframe(df)
            return {}
        except:
            return {}
    
    def _analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze pandas DataFrame"""
        try:
            analysis = {
                "columns": [],
                "rows": len(df),
                "types": {},
                "statistics": {},
                "missing": {},
                "unique": {}
            }
            
            # Analyze columns
            for column in df.columns:
                col_analysis = {
                    "name": column,
                    "type": str(df[column].dtype),
                    "missing": df[column].isnull().sum(),
                    "unique": df[column].nunique()
                }
                
                # Add statistics based on type
                if pd.api.types.is_numeric_dtype(df[column]):
                    col_analysis["statistics"] = {
                        "mean": df[column].mean(),
                        "std": df[column].std(),
                        "min": df[column].min(),
                        "max": df[column].max()
                    }
                elif pd.api.types.is_categorical_dtype(df[column]):
                    col_analysis["categories"] = df[column].value_counts().to_dict()
                
                analysis["columns"].append(col_analysis)
                analysis["types"][column] = str(df[column].dtype)
                analysis["missing"][column] = df[column].isnull().sum()
                analysis["unique"][column] = df[column].nunique()
            
            return analysis
        except:
            return {}

class FolderAnalyzer:
    """Advanced folder structure analysis"""
    
    def __init__(self):
        """Initialize folder analyzer"""
        self.max_lines = 250
        self.ignored_patterns = [
            r"\.git/",
            r"node_modules/",
            r"__pycache__/",
            r"\.venv/",
            r"\.env"
        ]
    
    def analyze_folder(self, repo: Repository, path: str = "") -> Dict[str, Any]:
        """Analyze folder structure"""
        try:
            analysis = {
                "structure": {},
                "files": [],
                "metrics": {
                    "total_files": 0,
                    "total_lines": 0,
                    "languages": {},
                    "types": {}
                }
            }
            
            # Get folder contents
            contents = repo.get_contents(path)
            
            # Process each item
            for item in contents:
                if isinstance(item, ContentFile):
                    file_analysis = self._analyze_file(item)
                    analysis["files"].append(file_analysis)
                    self._update_metrics(analysis["metrics"], file_analysis)
                else:
                    # Recursively analyze subfolder
                    subfolder = self.analyze_folder(repo, item.path)
                    analysis["structure"][item.name] = subfolder
                    self._merge_metrics(analysis["metrics"], subfolder["metrics"])
            
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing folder {path}: {str(e)}")
            return {}
    
    def _analyze_file(self, file: ContentFile) -> Dict[str, Any]:
        """Analyze individual file"""
        try:
            # Skip ignored files
            if any(re.search(pattern, file.path) for pattern in self.ignored_patterns):
                return {}
            
            # Get file content
            content = base64.b64decode(file.content).decode("utf-8")
            lines = content.split("\n")
            
            # Analyze file
            analysis = {
                "path": file.path,
                "size": file.size,
                "type": file.type,
                "lines": len(lines),
                "language": self._detect_language(file.path, content),
                "content": lines[:self.max_lines] if len(lines) > self.max_lines else lines
            }
            
            return analysis
        except:
            return {}
    
    def _detect_language(self, path: str, content: str) -> str:
        """Detect programming language"""
        # Simple extension-based detection
        ext = path.split(".")[-1].lower()
        language_map = {
            "py": "Python",
            "js": "JavaScript",
            "ts": "TypeScript",
            "jsx": "React",
            "tsx": "React",
            "html": "HTML",
            "css": "CSS",
            "scss": "SCSS",
            "java": "Java",
            "go": "Go",
            "rs": "Rust",
            "rb": "Ruby",
            "php": "PHP"
        }
        return language_map.get(ext, "Unknown")
    
    def _update_metrics(self, metrics: Dict[str, Any], file_analysis: Dict[str, Any]):
        """Update metrics with file analysis"""
        if not file_analysis:
            return
        
        metrics["total_files"] += 1
        metrics["total_lines"] += file_analysis.get("lines", 0)
        
        language = file_analysis.get("language", "Unknown")
        metrics["languages"][language] = metrics["languages"].get(language, 0) + 1
        
        file_type = file_analysis.get("type", "Unknown")
        metrics["types"][file_type] = metrics["types"].get(file_type, 0) + 1
    
    def _merge_metrics(self, target: Dict[str, Any], source: Dict[str, Any]):
        """Merge metrics from source into target"""
        target["total_files"] += source.get("total_files", 0)
        target["total_lines"] += source.get("total_lines", 0)
        
        for language, count in source.get("languages", {}).items():
            target["languages"][language] = target["languages"].get(language, 0) + count
        
        for file_type, count in source.get("types", {}).items():
            target["types"][file_type] = target["types"].get(file_type, 0) + count

class GitHubRAG:
    """Advanced GitHub RAG implementation with comprehensive code understanding"""
    
    def __init__(self, github_token: str):
        """Initialize GitHub RAG"""
        self.github = Github(github_token)
        self.graph_manager = Neo4jManager()
        self.tech_analyzer = TechnologyAnalyzer()
        self.code_understanding = CodeUnderstanding()
        self.image_analyzer = ImageAnalyzer()
        self.table_analyzer = TableAnalyzer()
        self.folder_analyzer = FolderAnalyzer()
        self.setup_components()
    
    def setup_components(self):
        """Setup RAG components"""
        # Initialize text splitter with enhanced chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Initialize embeddings with enhanced model
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=Config.OPENAI_API_KEY,
            model="text-embedding-3-large"
        )
        
        # Initialize vector store with enhanced indexing
        self.vector_store = Chroma(
            persist_directory=str(Config.VECTOR_STORE_DIR),
            embedding_function=self.embeddings,
            collection_metadata={
                "hnsw:space": "cosine",
                "hnsw:construction_ef": 100,
                "hnsw:search_ef": 100
            }
        )
        
        # Initialize QA chain with enhanced prompt
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(
                temperature=0,
                model_name="gpt-4-turbo-preview"
            ),
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(
                search_kwargs={
                    "k": 5,
                    "fetch_k": 20,
                    "lambda_mult": 0.5
                }
            )
        )
        
        # Setup enhanced prompt template
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""You are an expert code assistant with deep understanding of software development, architecture, and best practices.
            Use the following context to answer the question. If you don't know the answer, say so.
            
            Context includes:
            - Code structure and organization
            - Technology stack and dependencies
            - Architecture patterns and design decisions
            - Documentation and comments
            - Related files and components
            
            Context:
            {context}
            
            Question: {question}
            
            Provide a detailed answer that includes:
            1. Direct answer to the question
            2. Relevant code examples or patterns
            3. Best practices and recommendations
            4. Potential improvements or alternatives
            
            Answer:"""
        )
    
    def process_repository(self, repo_url: str) -> Dict[str, Any]:
        """Process entire repository for comprehensive understanding"""
        try:
            # Extract repository info
            repo_name = self._extract_repo_name(repo_url)
            repo = self.github.get_repo(repo_name)
            
            # Process repository components
            results = {
                "repository": self._process_repo_info(repo),
                "tech_stack": self.tech_analyzer.analyze_tech_stack(repo),
                "codebase": self._process_codebase(repo),
                "commits": self._process_commits(repo),
                "issues": self._process_issues(repo),
                "pull_requests": self._process_pull_requests(repo),
                "dependencies": self._process_dependencies(repo),
                "documentation": self._process_documentation(repo),
                "architecture": self._analyze_architecture(repo),
                "folder_structure": self.folder_analyzer.analyze_folder(repo)
            }
            
            # Build knowledge graph
            self._build_knowledge_graph(repo, results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing repository: {str(e)}")
            raise
    
    def _process_file(self, file: ContentFile) -> Dict[str, Any]:
        """Process individual file with enhanced understanding"""
        try:
            content = base64.b64decode(file.content).decode("utf-8")
            path = file.path.lower()
            
            # Basic file info
            file_info = {
                "path": file.path,
                "size": file.size,
                "type": file.type,
                "language": self._detect_language(path, content)
            }
            
            # Process based on file type
            if path.endswith((".py", ".js", ".ts", ".jsx", ".tsx", ".java")):
                file_info["code_analysis"] = self.code_understanding.analyze_code(
                    content,
                    file_info["language"]
                )
            elif path.endswith((".html", ".htm")):
                file_info["html_analysis"] = self.code_understanding._parse_html(content)
            elif path.endswith((".css", ".scss", ".sass")):
                file_info["css_analysis"] = self.code_understanding._parse_css(content)
            elif path.endswith((".png", ".jpg", ".jpeg", ".gif")):
                file_info["image_analysis"] = self.image_analyzer.analyze_image(file.path)
            elif path.endswith((".csv", ".xlsx", ".xls")):
                file_info["table_analysis"] = self.table_analyzer.analyze_table(
                    content,
                    path.split(".")[-1]
                )
            
            return file_info
            
        except Exception as e:
            logger.error(f"Error processing file {file.path}: {str(e)}")
            return {
                "path": file.path,
                "error": str(e)
            }
    
    def _detect_language(self, path: str, content: str) -> str:
        """Detect programming language with enhanced accuracy"""
        # Use file extension and content analysis
        ext = path.split(".")[-1].lower()
        language_map = {
            "py": "Python",
            "js": "JavaScript",
            "ts": "TypeScript",
            "jsx": "React",
            "tsx": "React",
            "html": "HTML",
            "css": "CSS",
            "scss": "SCSS",
            "java": "Java",
            "go": "Go",
            "rs": "Rust",
            "rb": "Ruby",
            "php": "PHP"
        }
        
        # Check for language-specific patterns
        if ext == "js" and "import React" in content:
            return "React"
        elif ext == "ts" and "import React" in content:
            return "React"
        elif ext == "py" and "from django" in content:
            return "Django"
        elif ext == "py" and "from flask" in content:
            return "Flask"
        
        return language_map.get(ext, "Unknown")

    def _extract_repo_name(self, repo_url: str) -> str:
        """Extract repository name from URL"""
        pattern = r"github\.com/([^/]+/[^/]+)"
        match = re.search(pattern, repo_url)
        if match:
            return match.group(1)
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
    
    def _process_repo_info(self, repo: Repository) -> Dict[str, Any]:
        """Process repository information"""
        return {
            "name": repo.name,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "topics": repo.get_topics(),
            "created_at": repo.created_at.isoformat(),
            "updated_at": repo.updated_at.isoformat()
        }
    
    def _process_codebase(self, repo: Repository) -> Dict[str, Any]:
        """Process entire codebase"""
        codebase = {
            "files": [],
            "structure": {},
            "dependencies": {},
            "metrics": {}
        }
        
        # Process all files
        for file in tqdm(repo.get_contents(""), recursive=True):
            if isinstance(file, ContentFile):
                file_info = self._process_file(file)
                codebase["files"].append(file_info)
                
                # Update structure
                path_parts = file.path.split("/")
                current = codebase["structure"]
                for part in path_parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                current[path_parts[-1]] = file_info
        
        # Calculate metrics
        codebase["metrics"] = self._calculate_codebase_metrics(codebase["files"])
        
        return codebase
    
    def _process_commits(self, repo: Repository) -> List[Dict[str, Any]]:
        """Process repository commits"""
        commits = []
        
        for commit in repo.get_commits():
            commit_info = {
                "sha": commit.sha,
                "author": commit.author.name if commit.author else None,
                "date": commit.commit.author.date.isoformat(),
                "message": commit.commit.message,
                "files": []
            }
            
            # Process changed files
            for file in commit.files:
                commit_info["files"].append({
                    "filename": file.filename,
                    "status": file.status,
                    "additions": file.additions,
                    "deletions": file.deletions,
                    "changes": file.changes
                })
            
            commits.append(commit_info)
        
        return commits
    
    def _process_issues(self, repo: Repository) -> List[Dict[str, Any]]:
        """Process repository issues"""
        issues = []
        
        for issue in repo.get_issues(state="all"):
            issue_info = {
                "number": issue.number,
                "title": issue.title,
                "state": issue.state,
                "created_at": issue.created_at.isoformat(),
                "updated_at": issue.updated_at.isoformat(),
                "labels": [label.name for label in issue.labels],
                "assignees": [assignee.login for assignee in issue.assignees],
                "comments": []
            }
            
            # Process comments
            for comment in issue.get_comments():
                issue_info["comments"].append({
                    "author": comment.user.login,
                    "body": comment.body,
                    "created_at": comment.created_at.isoformat()
                })
            
            issues.append(issue_info)
        
        return issues
    
    def _process_pull_requests(self, repo: Repository) -> List[Dict[str, Any]]:
        """Process repository pull requests"""
        pull_requests = []
        
        for pr in repo.get_pulls(state="all"):
            pr_info = {
                "number": pr.number,
                "title": pr.title,
                "state": pr.state,
                "created_at": pr.created_at.isoformat(),
                "updated_at": pr.updated_at.isoformat(),
                "user": pr.user.login,
                "labels": [label.name for label in pr.labels],
                "commits": [],
                "files": []
            }
            
            # Process commits
            for commit in pr.get_commits():
                pr_info["commits"].append({
                    "sha": commit.sha,
                    "message": commit.commit.message
                })
            
            # Process files
            for file in pr.get_files():
                pr_info["files"].append({
                    "filename": file.filename,
                    "status": file.status,
                    "additions": file.additions,
                    "deletions": file.deletions,
                    "changes": file.changes
                })
            
            pull_requests.append(pr_info)
        
        return pull_requests
    
    def _process_dependencies(self, repo: Repository) -> Dict[str, Any]:
        """Process repository dependencies"""
        dependencies = {
            "python": {},
            "node": {},
            "java": {},
            "other": {}
        }
        
        # Process requirements.txt
        try:
            req_file = repo.get_contents("requirements.txt")
            content = base64.b64decode(req_file.content).decode("utf-8")
            dependencies["python"] = self._parse_requirements(content)
        except:
            pass
        
        # Process package.json
        try:
            pkg_file = repo.get_contents("package.json")
            content = base64.b64decode(pkg_file.content).decode("utf-8")
            pkg_data = json.loads(content)
            dependencies["node"] = {
                "dependencies": pkg_data.get("dependencies", {}),
                "devDependencies": pkg_data.get("devDependencies", {})
            }
        except:
            pass
        
        # Process pom.xml
        try:
            pom_file = repo.get_contents("pom.xml")
            content = base64.b64decode(pom_file.content).decode("utf-8")
            dependencies["java"] = self._parse_pom_xml(content)
        except:
            pass
        
        return dependencies
    
    def _parse_requirements(self, content: str) -> Dict[str, str]:
        """Parse requirements.txt content"""
        requirements = {}
        
        for line in content.split("\n"):
            line = line.strip()
            if line and not line.startswith("#"):
                parts = line.split("==")
                if len(parts) == 2:
                    requirements[parts[0]] = parts[1]
        
        return requirements
    
    def _parse_pom_xml(self, content: str) -> Dict[str, Any]:
        """Parse pom.xml content"""
        dependencies = {
            "dependencies": [],
            "properties": {}
        }
        
        # Extract dependencies
        dep_pattern = r"<dependency>.*?<groupId>(.*?)</groupId>.*?<artifactId>(.*?)</artifactId>.*?<version>(.*?)</version>.*?</dependency>"
        for match in re.finditer(dep_pattern, content, re.DOTALL):
            dependencies["dependencies"].append({
                "group": match.group(1),
                "artifact": match.group(2),
                "version": match.group(3)
            })
        
        # Extract properties
        prop_pattern = r"<([^>]+)>(.*?)</\1>"
        for match in re.finditer(prop_pattern, content):
            dependencies["properties"][match.group(1)] = match.group(2)
        
        return dependencies
    
    def _process_documentation(self, repo: Repository) -> Dict[str, Any]:
        """Process repository documentation"""
        documentation = {
            "readme": None,
            "docs": [],
            "examples": [],
            "api_docs": []
        }
        
        # Process README
        try:
            readme = repo.get_readme()
            documentation["readme"] = {
                "content": base64.b64decode(readme.content).decode("utf-8"),
                "path": readme.path
            }
        except:
            pass
        
        # Process docs directory
        try:
            docs = repo.get_contents("docs")
            for doc in docs:
                if isinstance(doc, ContentFile):
                    documentation["docs"].append({
                        "path": doc.path,
                        "content": base64.b64decode(doc.content).decode("utf-8")
                    })
        except:
            pass
        
        return documentation
    
    def _analyze_architecture(self, repo: Repository) -> Dict[str, Any]:
        """Analyze repository architecture"""
        architecture = {
            "components": [],
            "relationships": [],
            "patterns": [],
            "metrics": {}
        }
        
        # Analyze code structure
        try:
            root = repo.get_contents("")
            self._analyze_component(root, architecture)
        except:
            pass
        
        # Identify design patterns
        architecture["patterns"] = self._identify_design_patterns(architecture["components"])
        
        # Calculate architecture metrics
        architecture["metrics"] = self._calculate_architecture_metrics(architecture)
        
        return architecture
    
    def _analyze_component(self, content: ContentFile, architecture: Dict[str, Any], parent: str = None):
        """Analyze component recursively"""
        if isinstance(content, ContentFile):
            # Process file
            file_info = self._process_file(content)
            component = {
                "name": content.name,
                "type": "file",
                "path": content.path,
                "metrics": file_info["metrics"],
                "entities": file_info["entities"]
            }
            
            if parent:
                architecture["relationships"].append({
                    "source": parent,
                    "target": content.path,
                    "type": "contains"
                })
            
            architecture["components"].append(component)
        else:
            # Process directory
            component = {
                "name": content.name,
                "type": "directory",
                "path": content.path
            }
            
            if parent:
                architecture["relationships"].append({
                    "source": parent,
                    "target": content.path,
                    "type": "contains"
                })
            
            architecture["components"].append(component)
            
            # Process children
            for child in content:
                self._analyze_component(child, architecture, content.path)
    
    def _identify_design_patterns(self, components: List[Dict[str, Any]]) -> List[str]:
        """Identify design patterns in components"""
        patterns = []
        
        # Check for common patterns
        for component in components:
            if component["type"] == "file":
                content = component.get("content", "")
                
                # Singleton pattern
                if re.search(r"class\s+\w+\(.*?\):\s+.*?__instance\s*=", content):
                    patterns.append("Singleton")
                
                # Factory pattern
                if re.search(r"class\s+\w+Factory", content):
                    patterns.append("Factory")
                
                # Observer pattern
                if re.search(r"class\s+\w+Observer", content):
                    patterns.append("Observer")
                
                # Strategy pattern
                if re.search(r"class\s+\w+Strategy", content):
                    patterns.append("Strategy")
        
        return list(set(patterns))
    
    def _calculate_architecture_metrics(self, architecture: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate architecture metrics"""
        metrics = {
            "total_components": len(architecture["components"]),
            "total_relationships": len(architecture["relationships"]),
            "patterns_used": len(architecture["patterns"]),
            "complexity": 0,
            "coupling": 0,
            "cohesion": 0
        }
        
        # Calculate complexity
        for component in architecture["components"]:
            if component["type"] == "file":
                metrics["complexity"] += component.get("metrics", {}).get("complexity", 0)
        
        # Calculate coupling
        metrics["coupling"] = len(architecture["relationships"])
        
        # Calculate cohesion
        file_components = [c for c in architecture["components"] if c["type"] == "file"]
        if file_components:
            metrics["cohesion"] = sum(
                len(c.get("entities", [])) for c in file_components
            ) / len(file_components)
        
        return metrics
    
    def _build_knowledge_graph(self, repo: Repository, results: Dict[str, Any]):
        """Build knowledge graph from repository analysis"""
        try:
            # Create repository node
            repo_node = self.graph_manager.create_node(
                "Repository",
                {
                    "name": repo.name,
                    "description": repo.description,
                    "language": repo.language
                }
            )
            
            # Add codebase nodes
            for file_info in results["codebase"]["files"]:
                file_node = self.graph_manager.create_node(
                    "File",
                    {
                        "path": file_info["path"],
                        "type": file_info["type"],
                        "metrics": file_info["metrics"]
                    }
                )
                
                # Create relationship
                self.graph_manager.create_relationship(
                    repo_node["id"],
                    file_node["id"],
                    "CONTAINS",
                    {
                        "confidence": 0.9
                    }
                )
                
                # Add entity nodes
                for entity in file_info["entities"]:
                    entity_node = self.graph_manager.create_node(
                        "Entity",
                        {
                            "text": entity["text"],
                            "label": entity["label"]
                        }
                    )
                    
                    # Create relationship
                    self.graph_manager.create_relationship(
                        file_node["id"],
                        entity_node["id"],
                        "CONTAINS",
                        {
                            "confidence": 0.9
                        }
                    )
            
            # Add commit nodes
            for commit in results["commits"]:
                commit_node = self.graph_manager.create_node(
                    "Commit",
                    {
                        "sha": commit["sha"],
                        "author": commit["author"],
                        "date": commit["date"],
                        "message": commit["message"]
                    }
                )
                
                # Create relationship
                self.graph_manager.create_relationship(
                    repo_node["id"],
                    commit_node["id"],
                    "HAS_COMMIT",
                    {
                        "confidence": 0.9
                    }
                )
            
            # Add issue nodes
            for issue in results["issues"]:
                issue_node = self.graph_manager.create_node(
                    "Issue",
                    {
                        "number": issue["number"],
                        "title": issue["title"],
                        "state": issue["state"]
                    }
                )
                
                # Create relationship
                self.graph_manager.create_relationship(
                    repo_node["id"],
                    issue_node["id"],
                    "HAS_ISSUE",
                    {
                        "confidence": 0.9
                    }
                )
            
            # Add pull request nodes
            for pr in results["pull_requests"]:
                pr_node = self.graph_manager.create_node(
                    "PullRequest",
                    {
                        "number": pr["number"],
                        "title": pr["title"],
                        "state": pr["state"]
                    }
                )
                
                # Create relationship
                self.graph_manager.create_relationship(
                    repo_node["id"],
                    pr_node["id"],
                    "HAS_PR",
                    {
                        "confidence": 0.9
                    }
                )
            
        except Exception as e:
            logger.error(f"Error building knowledge graph: {str(e)}")
            raise
    
    def query(self, question: str) -> Dict[str, Any]:
        """Query the RAG system
        
        Args:
            question: Question to ask
            
        Returns:
            Answer and context
        """
        try:
            # Get answer from QA chain
            result = self.qa_chain.run(
                self.prompt_template.format(
                    context=self._get_relevant_context(question),
                    question=question
                )
            )
            
            return {
                "answer": result,
                "confidence": self._calculate_confidence(result)
            }
            
        except Exception as e:
            logger.error(f"Error querying RAG: {str(e)}")
            raise
    
    def _get_relevant_context(self, question: str) -> str:
        """Get relevant context for question"""
        # Search vector store
        docs = self.vector_store.similarity_search(question, k=5)
        
        # Combine context
        context = "\n\n".join(doc.page_content for doc in docs)
        
        return context
    
    def _calculate_confidence(self, answer: str) -> float:
        """Calculate confidence score for answer"""
        # Simple confidence calculation based on answer length and content
        if not answer or answer.strip() == "I don't know":
            return 0.0
        
        # Check for uncertainty indicators
        uncertainty_indicators = [
            "I'm not sure",
            "I don't know",
            "I can't tell",
            "I'm uncertain"
        ]
        
        if any(indicator in answer.lower() for indicator in uncertainty_indicators):
            return 0.3
        
        # Check for confidence indicators
        confidence_indicators = [
            "definitely",
            "certainly",
            "absolutely",
            "clearly"
        ]
        
        if any(indicator in answer.lower() for indicator in confidence_indicators):
            return 0.9
        
        # Default confidence
        return 0.7 