"""
Code Style and Linting Integration Module
Provides code style checking and linting capabilities.
"""

from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum
import ast
import esprima
import javalang
import typescript
import autopep8
import black
import isort
import pylint.lint
import mypy.api
import pytest
import docstring_parser
from ml.config import Config

class StyleType(Enum):
    FORMATTING = "formatting"
    NAMING = "naming"
    COMPLEXITY = "complexity"
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    PERFORMANCE = "performance"

@dataclass
class StyleIssue:
    type: StyleType
    message: str
    location: tuple
    severity: str
    fix: Optional[str] = None

class CodeStyler:
    """Code style checker and formatter"""
    
    def __init__(self):
        """Initialize styler"""
        self.setup_components()
    
    def setup_components(self):
        """Setup style components"""
        # Initialize language-specific stylers
        self.language_stylers = {
            "python": PythonStyler(),
            "typescript": TypeScriptStyler(),
            "javascript": JavaScriptStyler(),
            "java": JavaStyler()
        }
        
        # Initialize linters
        self.linters = {
            "python": PythonLinter(),
            "typescript": TypeScriptLinter(),
            "javascript": JavaScriptLinter(),
            "java": JavaLinter()
        }
    
    def check_style(self, code: str, language: str) -> Dict[str, Any]:
        """Check code style"""
        try:
            if language not in self.language_stylers:
                return {"error": f"Unsupported language: {language}"}
            
            styler = self.language_stylers[language]
            linter = self.linters[language]
            
            # Get style issues
            style_issues = styler.check_style(code)
            
            # Get linting issues
            lint_issues = linter.check_code(code)
            
            # Get formatting suggestions
            format_suggestions = styler.get_formatting_suggestions(code)
            
            # Get naming suggestions
            naming_suggestions = styler.get_naming_suggestions(code)
            
            # Get complexity suggestions
            complexity_suggestions = styler.get_complexity_suggestions(code)
            
            # Get documentation suggestions
            doc_suggestions = styler.get_documentation_suggestions(code)
            
            # Get security suggestions
            security_suggestions = styler.get_security_suggestions(code)
            
            # Get performance suggestions
            performance_suggestions = styler.get_performance_suggestions(code)
            
            return {
                "style_issues": style_issues,
                "lint_issues": lint_issues,
                "format_suggestions": format_suggestions,
                "naming_suggestions": naming_suggestions,
                "complexity_suggestions": complexity_suggestions,
                "doc_suggestions": doc_suggestions,
                "security_suggestions": security_suggestions,
                "performance_suggestions": performance_suggestions
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def format_code(self, code: str, language: str) -> Dict[str, Any]:
        """Format code"""
        try:
            if language not in self.language_stylers:
                return {"error": f"Unsupported language: {language}"}
            
            styler = self.language_stylers[language]
            
            # Format code
            formatted_code = styler.format_code(code)
            
            return {
                "formatted_code": formatted_code,
                "changes": styler.get_formatting_changes(code, formatted_code)
            }
            
        except Exception as e:
            return {"error": str(e)}

class PythonStyler:
    """Python-specific styler"""
    
    def check_style(self, code: str) -> List[StyleIssue]:
        """Check Python code style"""
        issues = []
        try:
            # Check with autopep8
            fixed_code = autopep8.fix_code(code)
            if fixed_code != code:
                issues.append(StyleIssue(
                    type=StyleType.FORMATTING,
                    message="Code style can be improved",
                    location=(0, 0),
                    severity="warning",
                    fix=fixed_code
                ))
            
            # Check with black
            try:
                black.format_str(code, mode=black.FileMode())
            except black.InvalidInput:
                issues.append(StyleIssue(
                    type=StyleType.FORMATTING,
                    message="Code formatting can be improved",
                    location=(0, 0),
                    severity="warning"
                ))
            
            # Check with isort
            try:
                isort.code(code)
            except isort.exceptions.ISortError:
                issues.append(StyleIssue(
                    type=StyleType.FORMATTING,
                    message="Import order can be improved",
                    location=(0, 0),
                    severity="warning"
                ))
            
            return issues
            
        except Exception as e:
            return [StyleIssue(
                type=StyleType.FORMATTING,
                message=str(e),
                location=(0, 0),
                severity="error"
            )]
    
    def get_formatting_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get formatting suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check indentation
            self._check_indentation(tree, suggestions)
            
            # Check line length
            self._check_line_length(tree, suggestions)
            
            # Check whitespace
            self._check_whitespace(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_naming_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get naming suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check variable names
            self._check_variable_names(tree, suggestions)
            
            # Check function names
            self._check_function_names(tree, suggestions)
            
            # Check class names
            self._check_class_names(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_complexity_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get complexity suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check function complexity
            self._check_function_complexity(tree, suggestions)
            
            # Check class complexity
            self._check_class_complexity(tree, suggestions)
            
            # Check module complexity
            self._check_module_complexity(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_documentation_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get documentation suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check module docstring
            self._check_module_docstring(tree, suggestions)
            
            # Check class docstrings
            self._check_class_docstrings(tree, suggestions)
            
            # Check function docstrings
            self._check_function_docstrings(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_security_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get security suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check for security issues
            self._check_security_issues(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_performance_suggestions(self, code: str) -> List[Dict[str, Any]]:
        """Get performance suggestions"""
        suggestions = []
        try:
            # Parse code
            tree = ast.parse(code)
            
            # Check for performance issues
            self._check_performance_issues(tree, suggestions)
            
            return suggestions
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def format_code(self, code: str) -> str:
        """Format code"""
        try:
            # Format with autopep8
            code = autopep8.fix_code(code)
            
            # Format with black
            code = black.format_str(code, mode=black.FileMode())
            
            # Format with isort
            code = isort.code(code)
            
            return code
            
        except Exception as e:
            return code
    
    def get_formatting_changes(self, original_code: str, formatted_code: str) -> List[Dict[str, Any]]:
        """Get formatting changes"""
        changes = []
        try:
            # Compare original and formatted code
            original_lines = original_code.splitlines()
            formatted_lines = formatted_code.splitlines()
            
            for i, (orig, fmt) in enumerate(zip(original_lines, formatted_lines)):
                if orig != fmt:
                    changes.append({
                        "line": i + 1,
                        "original": orig,
                        "formatted": fmt
                    })
            
            return changes
            
        except Exception as e:
            return [{"error": str(e)}]
    
    def _check_indentation(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check indentation"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.If, ast.For, ast.While)):
                # Check indentation level
                if node.col_offset % 4 != 0:
                    suggestions.append({
                        "type": "indentation",
                        "message": "Incorrect indentation",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Use 4 spaces for indentation"
                    })
    
    def _check_line_length(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check line length"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Expr):
                # Check line length
                if len(node.value.s) > 79:  # PEP 8 standard
                    suggestions.append({
                        "type": "line_length",
                        "message": "Line too long",
                        "location": (node.lineno, node.lineno),
                        "suggestion": "Keep lines under 79 characters"
                    })
    
    def _check_whitespace(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check whitespace"""
        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp):
                # Check operator spacing
                if not isinstance(node.op, (ast.Add, ast.Sub, ast.Mult, ast.Div)):
                    suggestions.append({
                        "type": "whitespace",
                        "message": "Incorrect operator spacing",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Add spaces around operators"
                    })
    
    def _check_variable_names(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check variable names"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                # Check variable naming convention
                if not node.id.islower() and not node.id.isupper():
                    suggestions.append({
                        "type": "naming",
                        "message": "Incorrect variable naming",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Use snake_case for variables"
                    })
    
    def _check_function_names(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check function names"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Check function naming convention
                if not node.name.islower():
                    suggestions.append({
                        "type": "naming",
                        "message": "Incorrect function naming",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Use snake_case for functions"
                    })
    
    def _check_class_names(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check class names"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Check class naming convention
                if not node.name[0].isupper():
                    suggestions.append({
                        "type": "naming",
                        "message": "Incorrect class naming",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Use PascalCase for classes"
                    })
    
    def _check_function_complexity(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check function complexity"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Calculate cyclomatic complexity
                complexity = self._calculate_complexity(node)
                if complexity > 10:  # Arbitrary threshold
                    suggestions.append({
                        "type": "complexity",
                        "message": "Function too complex",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Break down into smaller functions"
                    })
    
    def _check_class_complexity(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check class complexity"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Calculate class complexity
                complexity = self._calculate_class_complexity(node)
                if complexity > 20:  # Arbitrary threshold
                    suggestions.append({
                        "type": "complexity",
                        "message": "Class too complex",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Break down into smaller classes"
                    })
    
    def _check_module_complexity(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check module complexity"""
        # Calculate module complexity
        complexity = self._calculate_module_complexity(tree)
        if complexity > 50:  # Arbitrary threshold
            suggestions.append({
                "type": "complexity",
                "message": "Module too complex",
                "location": (1, 1),
                "suggestion": "Break down into smaller modules"
            })
    
    def _check_module_docstring(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check module docstring"""
        if not tree.body or not isinstance(tree.body[0], ast.Expr) or not isinstance(tree.body[0].value, ast.Str):
            suggestions.append({
                "type": "documentation",
                "message": "Missing module docstring",
                "location": (1, 1),
                "suggestion": "Add module docstring"
            })
    
    def _check_class_docstrings(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check class docstrings"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if not node.body or not isinstance(node.body[0], ast.Expr) or not isinstance(node.body[0].value, ast.Str):
                    suggestions.append({
                        "type": "documentation",
                        "message": "Missing class docstring",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Add class docstring"
                    })
    
    def _check_function_docstrings(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check function docstrings"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if not node.body or not isinstance(node.body[0], ast.Expr) or not isinstance(node.body[0].value, ast.Str):
                    suggestions.append({
                        "type": "documentation",
                        "message": "Missing function docstring",
                        "location": (node.lineno, node.end_lineno),
                        "suggestion": "Add function docstring"
                    })
    
    def _check_security_issues(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check security issues"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # Check for dangerous functions
                if isinstance(node.func, ast.Name):
                    if node.func.id in ["eval", "exec", "input"]:
                        suggestions.append({
                            "type": "security",
                            "message": "Potentially dangerous function call",
                            "location": (node.lineno, node.end_lineno),
                            "suggestion": "Use safer alternatives"
                        })
    
    def _check_performance_issues(self, tree: ast.AST, suggestions: List[Dict[str, Any]]) -> None:
        """Check performance issues"""
        for node in ast.walk(tree):
            if isinstance(node, ast.For):
                # Check for inefficient loops
                if isinstance(node.target, ast.Name) and isinstance(node.iter, ast.Call):
                    if isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range":
                        suggestions.append({
                            "type": "performance",
                            "message": "Inefficient loop",
                            "location": (node.lineno, node.end_lineno),
                            "suggestion": "Use list comprehension or generator expression"
                        })
    
    def _calculate_complexity(self, node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.ExceptHandler)):
                complexity += 1
        return complexity
    
    def _calculate_class_complexity(self, node: ast.ClassDef) -> int:
        """Calculate class complexity"""
        complexity = 0
        for child in node.body:
            if isinstance(child, ast.FunctionDef):
                complexity += self._calculate_complexity(child)
        return complexity
    
    def _calculate_module_complexity(self, tree: ast.AST) -> int:
        """Calculate module complexity"""
        complexity = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                complexity += self._calculate_complexity(node)
        return complexity

class PythonLinter:
    """Python-specific linter"""
    
    def check_code(self, code: str) -> List[Dict[str, Any]]:
        """Check code with linters"""
        issues = []
        try:
            # Run pylint
            pylint_output = pylint.lint.Run([code], do_exit=False)
            for issue in pylint_output.linter.stats.by_msg:
                issues.append({
                    "tool": "pylint",
                    "message": issue
                })
            
            # Run mypy
            mypy_output = mypy.api.run([code])
            for line in mypy_output[0].splitlines():
                if line.startswith("error:"):
                    issues.append({
                        "tool": "mypy",
                        "message": line
                    })
            
            return issues
            
        except Exception as e:
            return [{"error": str(e)}]

# Implement similar classes for other languages
class TypeScriptStyler:
    """TypeScript-specific styler"""
    # Similar implementation to PythonStyler but with TypeScript-specific features
    pass

class JavaScriptStyler:
    """JavaScript-specific styler"""
    # Similar implementation to PythonStyler but with JavaScript-specific features
    pass

class JavaStyler:
    """Java-specific styler"""
    # Similar implementation to PythonStyler but with Java-specific features
    pass

class TypeScriptLinter:
    """TypeScript-specific linter"""
    # Similar implementation to PythonLinter but with TypeScript-specific features
    pass

class JavaScriptLinter:
    """JavaScript-specific linter"""
    # Similar implementation to PythonLinter but with JavaScript-specific features
    pass

class JavaLinter:
    """Java-specific linter"""
    # Similar implementation to PythonLinter but with Java-specific features
    pass 