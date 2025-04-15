import ast
import os
from typing import Dict, List, Any

class ASTAnalyzer:
    """
    Analyzes Python code using Abstract Syntax Tree (AST)
    """
    
    def __init__(self, code: str):
        self.code = code
        self.tree = ast.parse(code)
    
    def analyze(self) -> Dict[str, Any]:
        """
        Perform full analysis of the code
        """
        return {
            "imports": self._analyze_imports(),
            "functions": self._analyze_functions(),
            "classes": self._analyze_classes(),
            "complexity": self._analyze_complexity(),
        }
    
    def _analyze_imports(self) -> List[Dict[str, str]]:
        """
        Analyze import statements in the code
        """
        imports = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.append({
                        "type": "import",
                        "name": name.name,
                        "asname": name.asname,
                    })
            elif isinstance(node, ast.ImportFrom):
                for name in node.names:
                    imports.append({
                        "type": "import_from",
                        "module": node.module,
                        "name": name.name,
                        "asname": name.asname,
                    })
        return imports
    
    def _analyze_functions(self) -> List[Dict[str, Any]]:
        """
        Analyze function definitions in the code
        """
        functions = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                args = {
                    "args": [arg.arg for arg in node.args.args],
                    "defaults": len(node.args.defaults),
                    "vararg": node.args.vararg.arg if node.args.vararg else None,
                    "kwarg": node.args.kwarg.arg if node.args.kwarg else None,
                }
                
                functions.append({
                    "name": node.name,
                    "args": args,
                    "line_start": node.lineno,
                    "line_end": node.end_lineno if hasattr(node, "end_lineno") else node.lineno,
                    "decorators": [self._get_decorator_name(d) for d in node.decorator_list],
                    "complexity": self._calculate_function_complexity(node),
                })
        return functions
    
    def _analyze_classes(self) -> List[Dict[str, Any]]:
        """
        Analyze class definitions in the code
        """
        classes = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.ClassDef):
                methods = []
                for child in node.body:
                    if isinstance(child, ast.FunctionDef):
                        methods.append(child.name)
                
                classes.append({
                    "name": node.name,
                    "bases": [self._get_base_name(base) for base in node.bases],
                    "methods": methods,
                    "line_start": node.lineno,
                    "line_end": node.end_lineno if hasattr(node, "end_lineno") else node.lineno,
                    "decorators": [self._get_decorator_name(d) for d in node.decorator_list],
                })
        return classes
    
    def _analyze_complexity(self) -> Dict[str, Any]:
        """
        Calculate complexity metrics for the code
        """
        # Count statements
        statements = len([node for node in ast.walk(self.tree) 
                          if isinstance(node, (ast.Assign, ast.AugAssign, ast.Return, 
                                             ast.Raise, ast.Assert, ast.Delete, 
                                             ast.Pass, ast.Import, ast.ImportFrom))])
        
        # Count control flow statements
        control_flow = len([node for node in ast.walk(self.tree)
                            if isinstance(node, (ast.If, ast.For, ast.While, 
                                               ast.Break, ast.Continue))])
        
        # Count function/method definitions
        functions = len([node for node in ast.walk(self.tree) 
                         if isinstance(node, ast.FunctionDef)])
        
        # Count class definitions
        classes = len([node for node in ast.walk(self.tree) 
                       if isinstance(node, ast.ClassDef)])
        
        return {
            "loc": self.code.count('\n') + 1,
            "statements": statements,
            "control_flow": control_flow,
            "functions": functions,
            "classes": classes,
            "complexity_score": control_flow + functions + classes,
        }
    
    def _calculate_function_complexity(self, node: ast.FunctionDef) -> int:
        """
        Calculate cyclomatic complexity for a function
        """
        complexity = 1  # Start with 1 (for the function itself)
        
        # Count branching statements
        for inner_node in ast.walk(node):
            if isinstance(inner_node, (ast.If, ast.For, ast.While, ast.IfExp)):
                complexity += 1
            elif isinstance(inner_node, ast.BoolOp) and isinstance(inner_node.op, ast.And):
                complexity += len(inner_node.values) - 1
        
        return complexity
    
    def _get_decorator_name(self, node: ast.expr) -> str:
        """
        Get the name of a decorator
        """
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_decorator_name(node.value)}.{node.attr}"
        elif isinstance(node, ast.Call):
            return self._get_decorator_name(node.func)
        return str(node)
    
    def _get_base_name(self, node: ast.expr) -> str:
        """
        Get the name of a base class
        """
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_base_name(node.value)}.{node.attr}"
        return str(node)