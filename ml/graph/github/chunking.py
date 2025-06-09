"""
Smart Chunking Module
Provides advanced text and code chunking capabilities.
"""

from typing import List, Dict, Any, Optional, Union
from langchain.text_splitter import RecursiveCharacterTextSplitter
import re
import ast
import javalang
import esprima
from bs4 import BeautifulSoup
import css_parser

class SmartChunker:
    """Smart chunking with language-specific strategies"""
    
    def __init__(self):
        """Initialize smart chunker"""
        self.setup_chunkers()
    
    def setup_chunkers(self):
        """Setup language-specific chunkers"""
        self.chunkers = {
            "python": self._chunk_python,
            "javascript": self._chunk_javascript,
            "typescript": self._chunk_typescript,
            "java": self._chunk_java,
            "html": self._chunk_html,
            "css": self._chunk_css,
            "default": self._chunk_default
        }
        
        # Initialize default text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def chunk(self, content: str, language: str = "default") -> List[Dict[str, Any]]:
        """Chunk content based on language"""
        if language in self.chunkers:
            return self.chunkers[language](content)
        return self.chunkers["default"](content)
    
    def _chunk_python(self, content: str) -> List[Dict[str, Any]]:
        """Chunk Python code"""
        try:
            tree = ast.parse(content)
            chunks = []
            
            # Process imports
            imports = [node for node in tree.body if isinstance(node, (ast.Import, ast.ImportFrom))]
            if imports:
                chunks.append({
                    "type": "imports",
                    "content": "\n".join(ast.unparse(node) for node in imports),
                    "metadata": {"node_type": "imports"}
                })
            
            # Process classes
            for node in tree.body:
                if isinstance(node, ast.ClassDef):
                    chunks.append({
                        "type": "class",
                        "content": ast.unparse(node),
                        "metadata": {
                            "node_type": "class",
                            "name": node.name,
                            "bases": [b.id for b in node.bases if isinstance(b, ast.Name)],
                            "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)]
                        }
                    })
            
            # Process functions
            for node in tree.body:
                if isinstance(node, ast.FunctionDef):
                    chunks.append({
                        "type": "function",
                        "content": ast.unparse(node),
                        "metadata": {
                            "node_type": "function",
                            "name": node.name,
                            "args": [arg.arg for arg in node.args.args],
                            "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)]
                        }
                    })
            
            return chunks
        except:
            return self._chunk_default(content)
    
    def _chunk_javascript(self, content: str) -> List[Dict[str, Any]]:
        """Chunk JavaScript code"""
        try:
            tree = esprima.parseScript(content, {"loc": True, "range": True})
            chunks = []
            
            # Process imports
            imports = [node for node in tree.body if node.type == "ImportDeclaration"]
            if imports:
                chunks.append({
                    "type": "imports",
                    "content": "\n".join(node.source.value for node in imports),
                    "metadata": {"node_type": "imports"}
                })
            
            # Process classes
            for node in tree.body:
                if node.type == "ClassDeclaration":
                    chunks.append({
                        "type": "class",
                        "content": content[node.range[0]:node.range[1]],
                        "metadata": {
                            "node_type": "class",
                            "name": node.id.name,
                            "methods": [m.key.name for m in node.body.body if m.type == "MethodDefinition"]
                        }
                    })
            
            # Process functions
            for node in tree.body:
                if node.type == "FunctionDeclaration":
                    chunks.append({
                        "type": "function",
                        "content": content[node.range[0]:node.range[1]],
                        "metadata": {
                            "node_type": "function",
                            "name": node.id.name,
                            "params": [p.name for p in node.params]
                        }
                    })
            
            return chunks
        except:
            return self._chunk_default(content)
    
    def _chunk_typescript(self, content: str) -> List[Dict[str, Any]]:
        """Chunk TypeScript code"""
        try:
            tree = esprima.parseScript(content, {"loc": True, "range": True, "jsx": True})
            chunks = []
            
            # Process imports
            imports = [node for node in tree.body if node.type == "ImportDeclaration"]
            if imports:
                chunks.append({
                    "type": "imports",
                    "content": "\n".join(node.source.value for node in imports),
                    "metadata": {"node_type": "imports"}
                })
            
            # Process interfaces
            for node in tree.body:
                if node.type == "InterfaceDeclaration":
                    chunks.append({
                        "type": "interface",
                        "content": content[node.range[0]:node.range[1]],
                        "metadata": {
                            "node_type": "interface",
                            "name": node.id.name,
                            "properties": [p.key.name for p in node.body.properties]
                        }
                    })
            
            # Process classes
            for node in tree.body:
                if node.type == "ClassDeclaration":
                    chunks.append({
                        "type": "class",
                        "content": content[node.range[0]:node.range[1]],
                        "metadata": {
                            "node_type": "class",
                            "name": node.id.name,
                            "methods": [m.key.name for m in node.body.body if m.type == "MethodDefinition"]
                        }
                    })
            
            return chunks
        except:
            return self._chunk_default(content)
    
    def _chunk_html(self, content: str) -> List[Dict[str, Any]]:
        """Chunk HTML code"""
        try:
            soup = BeautifulSoup(content, "html5lib")
            chunks = []
            
            # Process head
            head = soup.find("head")
            if head:
                chunks.append({
                    "type": "head",
                    "content": str(head),
                    "metadata": {
                        "node_type": "head",
                        "scripts": [s.get("src") for s in head.find_all("script")],
                        "styles": [s.get("href") for s in head.find_all("link", rel="stylesheet")]
                    }
                })
            
            # Process body
            body = soup.find("body")
            if body:
                # Process sections
                for section in body.find_all(["section", "div", "article"]):
                    chunks.append({
                        "type": "section",
                        "content": str(section),
                        "metadata": {
                            "node_type": "section",
                            "id": section.get("id"),
                            "class": section.get("class")
                        }
                    })
            
            return chunks
        except:
            return self._chunk_default(content)
    
    def _chunk_css(self, content: str) -> List[Dict[str, Any]]:
        """Chunk CSS code"""
        try:
            parser = css_parser.CSSParser()
            stylesheet = parser.parseString(content)
            chunks = []
            
            # Process rules
            for rule in stylesheet:
                if rule.type == rule.STYLE_RULE:
                    chunks.append({
                        "type": "rule",
                        "content": rule.selectorText + " { " + rule.style.cssText + " }",
                        "metadata": {
                            "node_type": "rule",
                            "selector": rule.selectorText,
                            "properties": [p.name for p in rule.style]
                        }
                    })
                elif rule.type == rule.MEDIA_RULE:
                    chunks.append({
                        "type": "media",
                        "content": str(rule),
                        "metadata": {
                            "node_type": "media",
                            "condition": rule.media.mediaText
                        }
                    })
            
            return chunks
        except:
            return self._chunk_default(content)
    
    def _chunk_default(self, content: str) -> List[Dict[str, Any]]:
        """Default chunking strategy"""
        chunks = self.text_splitter.split_text(content)
        return [{
            "type": "text",
            "content": chunk,
            "metadata": {"node_type": "text"}
        } for chunk in chunks]
    
    def get_chunk_info(self) -> Dict[str, Any]:
        """Get information about chunking strategies"""
        return {
            "strategies": list(self.chunkers.keys()),
            "default_chunk_size": self.text_splitter._chunk_size,
            "default_chunk_overlap": self.text_splitter._chunk_overlap
        } 