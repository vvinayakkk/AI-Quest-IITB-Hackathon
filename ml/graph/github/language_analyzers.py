"""
Language Analyzers Module
Provides specialized analyzers for different programming languages.
"""

from typing import List, Dict, Any, Optional, Union
import ast
import javalang
import esprima
import html5lib
from bs4 import BeautifulSoup
import css_parser
import re
from ml.config import Config

class PythonAnalyzer:
    """Python code analyzer"""
    
    def analyze(self, code: str) -> Dict[str, Any]:
        """Analyze Python code"""
        try:
            tree = ast.parse(code)
            return {
                "imports": self._get_imports(tree),
                "classes": self._get_classes(tree),
                "functions": self._get_functions(tree),
                "variables": self._get_variables(tree),
                "complexity": self._calculate_complexity(tree)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _get_imports(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Extract import statements"""
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.append({
                        "type": "import",
                        "module": name.name,
                        "alias": name.asname
                    })
            elif isinstance(node, ast.ImportFrom):
                for name in node.names:
                    imports.append({
                        "type": "from_import",
                        "module": node.module,
                        "name": name.name,
                        "alias": name.asname
                    })
        return imports
    
    def _get_classes(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Extract class definitions"""
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                class_info = {
                    "name": node.name,
                    "bases": [base.id for base in node.bases if isinstance(base, ast.Name)],
                    "methods": self._get_class_methods(node),
                    "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)]
                }
                classes.append(class_info)
        return classes
    
    def _get_class_methods(self, class_node: ast.ClassDef) -> List[Dict[str, Any]]:
        """Extract class methods"""
        methods = []
        for node in class_node.body:
            if isinstance(node, ast.FunctionDef):
                method_info = {
                    "name": node.name,
                    "args": self._get_function_args(node),
                    "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)],
                    "returns": self._get_function_returns(node)
                }
                methods.append(method_info)
        return methods
    
    def _get_functions(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Extract function definitions"""
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_info = {
                    "name": node.name,
                    "args": self._get_function_args(node),
                    "decorators": [d.id for d in node.decorator_list if isinstance(d, ast.Name)],
                    "returns": self._get_function_returns(node)
                }
                functions.append(function_info)
        return functions
    
    def _get_function_args(self, func_node: ast.FunctionDef) -> List[Dict[str, Any]]:
        """Extract function arguments"""
        args = []
        for arg in func_node.args.args:
            arg_info = {
                "name": arg.arg,
                "annotation": ast.unparse(arg.annotation) if arg.annotation else None
            }
            args.append(arg_info)
        return args
    
    def _get_function_returns(self, func_node: ast.FunctionDef) -> Optional[str]:
        """Extract function return type"""
        if func_node.returns:
            return ast.unparse(func_node.returns)
        return None
    
    def _get_variables(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Extract variable assignments"""
        variables = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        var_info = {
                            "name": target.id,
                            "value": ast.unparse(node.value)
                        }
                        variables.append(var_info)
        return variables
    
    def _calculate_complexity(self, tree: ast.AST) -> Dict[str, int]:
        """Calculate code complexity metrics"""
        complexity = {
            "cyclomatic": 0,
            "cognitive": 0,
            "halstead": 0
        }
        
        for node in ast.walk(tree):
            # Cyclomatic complexity
            if isinstance(node, (ast.If, ast.While, ast.For, ast.Try, ast.ExceptHandler)):
                complexity["cyclomatic"] += 1
            
            # Cognitive complexity
            if isinstance(node, (ast.If, ast.While, ast.For)):
                complexity["cognitive"] += 1
            elif isinstance(node, ast.Try):
                complexity["cognitive"] += len(node.handlers)
        
        return complexity

class JavaScriptAnalyzer:
    """JavaScript code analyzer"""
    
    def analyze(self, code: str) -> Dict[str, Any]:
        """Analyze JavaScript code"""
        try:
            tree = esprima.parseScript(code, {"loc": True, "range": True})
            return {
                "imports": self._get_imports(tree),
                "classes": self._get_classes(tree),
                "functions": self._get_functions(tree),
                "variables": self._get_variables(tree),
                "complexity": self._calculate_complexity(tree)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _get_imports(self, tree: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract import statements"""
        imports = []
        for node in tree.body:
            if node.type == "ImportDeclaration":
                import_info = {
                    "type": "import",
                    "source": node.source.value,
                    "specifiers": []
                }
                for spec in node.specifiers:
                    spec_info = {
                        "type": spec.type,
                        "local": spec.local.name,
                        "imported": spec.imported.name if hasattr(spec, "imported") else None
                    }
                    import_info["specifiers"].append(spec_info)
                imports.append(import_info)
        return imports
    
    def _get_classes(self, tree: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract class definitions"""
        classes = []
        for node in tree.body:
            if node.type == "ClassDeclaration":
                class_info = {
                    "name": node.id.name,
                    "superClass": node.superClass.id.name if node.superClass else None,
                    "methods": self._get_class_methods(node),
                    "decorators": self._get_decorators(node)
                }
                classes.append(class_info)
        return classes
    
    def _get_class_methods(self, class_node: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract class methods"""
        methods = []
        for node in class_node.body.body:
            if node.type == "MethodDefinition":
                method_info = {
                    "name": node.key.name,
                    "kind": node.kind,
                    "static": node.static,
                    "params": self._get_function_params(node.value)
                }
                methods.append(method_info)
        return methods
    
    def _get_functions(self, tree: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract function definitions"""
        functions = []
        for node in tree.body:
            if node.type in ["FunctionDeclaration", "FunctionExpression"]:
                function_info = {
                    "name": node.id.name if node.id else "anonymous",
                    "params": self._get_function_params(node),
                    "async": node.async,
                    "generator": node.generator
                }
                functions.append(function_info)
        return functions
    
    def _get_function_params(self, func_node: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract function parameters"""
        params = []
        for param in func_node.params:
            param_info = {
                "name": param.name,
                "type": param.type,
                "default": ast.unparse(param.default) if param.default else None
            }
            params.append(param_info)
        return params
    
    def _get_variables(self, tree: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract variable declarations"""
        variables = []
        for node in tree.body:
            if node.type == "VariableDeclaration":
                for decl in node.declarations:
                    var_info = {
                        "name": decl.id.name,
                        "kind": node.kind,
                        "value": ast.unparse(decl.init) if decl.init else None
                    }
                    variables.append(var_info)
        return variables
    
    def _get_decorators(self, node: Dict[str, Any]) -> List[str]:
        """Extract decorators"""
        decorators = []
        if hasattr(node, "decorators"):
            for decorator in node.decorators:
                if decorator.expression.type == "CallExpression":
                    decorators.append(decorator.expression.callee.name)
                else:
                    decorators.append(decorator.expression.name)
        return decorators
    
    def _calculate_complexity(self, tree: Dict[str, Any]) -> Dict[str, int]:
        """Calculate code complexity metrics"""
        complexity = {
            "cyclomatic": 0,
            "cognitive": 0,
            "halstead": 0
        }
        
        def traverse(node: Dict[str, Any]):
            # Cyclomatic complexity
            if node.type in ["IfStatement", "WhileStatement", "ForStatement", "TryStatement", "CatchClause"]:
                complexity["cyclomatic"] += 1
            
            # Cognitive complexity
            if node.type in ["IfStatement", "WhileStatement", "ForStatement"]:
                complexity["cognitive"] += 1
            elif node.type == "TryStatement":
                complexity["cognitive"] += len(node.handler.block.body)
            
            # Recursively traverse child nodes
            for key, value in node.items():
                if isinstance(value, dict):
                    traverse(value)
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, dict):
                            traverse(item)
        
        traverse(tree)
        return complexity

class HTMLAnalyzer:
    """HTML code analyzer"""
    
    def analyze(self, code: str) -> Dict[str, Any]:
        """Analyze HTML code"""
        try:
            soup = BeautifulSoup(code, "html5lib")
            return {
                "structure": self._get_structure(soup),
                "elements": self._get_elements(soup),
                "links": self._get_links(soup),
                "forms": self._get_forms(soup),
                "scripts": self._get_scripts(soup),
                "styles": self._get_styles(soup)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _get_structure(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract document structure"""
        return {
            "doctype": soup.doctype.string if soup.doctype else None,
            "html": {
                "lang": soup.html.get("lang") if soup.html else None,
                "head": bool(soup.head),
                "body": bool(soup.body)
            }
        }
    
    def _get_elements(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract HTML elements"""
        elements = []
        for tag in soup.find_all():
            element_info = {
                "tag": tag.name,
                "id": tag.get("id"),
                "classes": tag.get("class", []),
                "attributes": dict(tag.attrs),
                "text": tag.get_text(strip=True) if tag.string else None
            }
            elements.append(element_info)
        return elements
    
    def _get_links(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract links"""
        links = []
        for link in soup.find_all("a"):
            link_info = {
                "href": link.get("href"),
                "text": link.get_text(strip=True),
                "target": link.get("target"),
                "rel": link.get("rel")
            }
            links.append(link_info)
        return links
    
    def _get_forms(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract forms"""
        forms = []
        for form in soup.find_all("form"):
            form_info = {
                "action": form.get("action"),
                "method": form.get("method"),
                "inputs": self._get_form_inputs(form)
            }
            forms.append(form_info)
        return forms
    
    def _get_form_inputs(self, form: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract form inputs"""
        inputs = []
        for input_tag in form.find_all(["input", "select", "textarea"]):
            input_info = {
                "type": input_tag.name,
                "name": input_tag.get("name"),
                "id": input_tag.get("id"),
                "required": bool(input_tag.get("required")),
                "attributes": dict(input_tag.attrs)
            }
            inputs.append(input_info)
        return inputs
    
    def _get_scripts(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract scripts"""
        scripts = []
        for script in soup.find_all("script"):
            script_info = {
                "src": script.get("src"),
                "type": script.get("type"),
                "async": bool(script.get("async")),
                "defer": bool(script.get("defer")),
                "content": script.string
            }
            scripts.append(script_info)
        return scripts
    
    def _get_styles(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract styles"""
        styles = []
        for style in soup.find_all("style"):
            style_info = {
                "type": style.get("type"),
                "media": style.get("media"),
                "content": style.string
            }
            styles.append(style_info)
        return styles

class CSSAnalyzer:
    """CSS code analyzer"""
    
    def analyze(self, code: str) -> Dict[str, Any]:
        """Analyze CSS code"""
        try:
            stylesheet = css_parser.parseString(code)
            return {
                "rules": self._get_rules(stylesheet),
                "selectors": self._get_selectors(stylesheet),
                "properties": self._get_properties(stylesheet),
                "media_queries": self._get_media_queries(stylesheet),
                "variables": self._get_variables(stylesheet)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _get_rules(self, stylesheet: css_parser.CSSStyleSheet) -> List[Dict[str, Any]]:
        """Extract CSS rules"""
        rules = []
        for rule in stylesheet:
            if rule.type == rule.STYLE_RULE:
                rule_info = {
                    "selector": rule.selectorText,
                    "properties": self._get_rule_properties(rule),
                    "specificity": self._calculate_specificity(rule.selectorText)
                }
                rules.append(rule_info)
        return rules
    
    def _get_rule_properties(self, rule: css_parser.CSSStyleRule) -> List[Dict[str, Any]]:
        """Extract rule properties"""
        properties = []
        for prop in rule.style:
            prop_info = {
                "name": prop.name,
                "value": prop.value,
                "important": prop.priority == "important"
            }
            properties.append(prop_info)
        return properties
    
    def _get_selectors(self, stylesheet: css_parser.CSSStyleSheet) -> List[Dict[str, Any]]:
        """Extract CSS selectors"""
        selectors = []
        for rule in stylesheet:
            if rule.type == rule.STYLE_RULE:
                for selector in rule.selectorList:
                    selector_info = {
                        "text": selector.selectorText,
                        "specificity": self._calculate_specificity(selector.selectorText),
                        "type": self._get_selector_type(selector.selectorText)
                    }
                    selectors.append(selector_info)
        return selectors
    
    def _get_selector_type(self, selector: str) -> str:
        """Determine selector type"""
        if selector.startswith("#"):
            return "id"
        elif selector.startswith("."):
            return "class"
        elif selector.startswith("["):
            return "attribute"
        elif selector.startswith(":"):
            return "pseudo"
        else:
            return "element"
    
    def _get_properties(self, stylesheet: css_parser.CSSStyleSheet) -> List[Dict[str, Any]]:
        """Extract CSS properties"""
        properties = []
        for rule in stylesheet:
            if rule.type == rule.STYLE_RULE:
                for prop in rule.style:
                    prop_info = {
                        "name": prop.name,
                        "value": prop.value,
                        "important": prop.priority == "important",
                        "rule": rule.selectorText
                    }
                    properties.append(prop_info)
        return properties
    
    def _get_media_queries(self, stylesheet: css_parser.CSSStyleSheet) -> List[Dict[str, Any]]:
        """Extract media queries"""
        media_queries = []
        for rule in stylesheet:
            if rule.type == rule.MEDIA_RULE:
                media_info = {
                    "condition": rule.media.mediaText,
                    "rules": self._get_rules(rule)
                }
                media_queries.append(media_info)
        return media_queries
    
    def _get_variables(self, stylesheet: css_parser.CSSStyleSheet) -> List[Dict[str, Any]]:
        """Extract CSS variables"""
        variables = []
        for rule in stylesheet:
            if rule.type == rule.STYLE_RULE:
                for prop in rule.style:
                    if prop.name.startswith("--"):
                        var_info = {
                            "name": prop.name,
                            "value": prop.value,
                            "rule": rule.selectorText
                        }
                        variables.append(var_info)
        return variables
    
    def _calculate_specificity(self, selector: str) -> Dict[str, int]:
        """Calculate selector specificity"""
        specificity = {
            "id": 0,
            "class": 0,
            "element": 0
        }
        
        # Count IDs
        specificity["id"] = selector.count("#")
        
        # Count classes and attributes
        specificity["class"] = selector.count(".") + selector.count("[")
        
        # Count elements
        specificity["element"] = len(re.findall(r"^[a-zA-Z]+|[^.#\[]+[a-zA-Z]+", selector))
        
        return specificity 