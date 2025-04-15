import pytest
from app.analyzers.ast_analyzer import ASTAnalyzer

def test_basic_imports():
    code = """
import os
import sys
from datetime import datetime
from typing import List, Optional
"""
    analyzer = ASTAnalyzer(code)
    result = analyzer.analyze()
    
    # Check imports
    imports = result["imports"]
    assert len(imports) == 4
    
    # Check specific imports
    assert any(imp["name"] == "os" for imp in imports)
    assert any(imp["name"] == "sys" for imp in imports)
    assert any(imp["name"] == "datetime" and imp["module"] == "datetime" for imp in imports)
    assert any(imp["name"] == "List" and imp["module"] == "typing" for imp in imports)

def test_function_analysis():
    code = """
def simple_function():
    return 42

def complex_function(a, b=10, *args, **kwargs):
    if a > b:
        return a
    elif a < b:
        return b
    else:
        return a + b
"""
    analyzer = ASTAnalyzer(code)
    result = analyzer.analyze()
    
    # Check functions
    functions = result["functions"]
    assert len(functions) == 2
    
    # Find functions by name
    simple = next(f for f in functions if f["name"] == "simple_function")
    complex = next(f for f in functions if f["name"] == "complex_function")
    
    # Check simple function
    assert len(simple["args"]["args"]) == 0
    assert simple["complexity"] == 1  # Just one path
    
    # Check complex function
    assert len(complex["args"]["args"]) == 2
    assert complex["args"]["args"][0] == "a"
    assert complex["args"]["args"][1] == "b"
    assert complex["complexity"] > 1  # Multiple paths with if/elif/else

def test_class_analysis():
    code = """
class SimpleClass:
    def __init__(self, value):
        self.value = value
        
    def get_value(self):
        return self.value
        
    def set_value(self, new_value):
        self.value = new_value
        
class ComplexClass(BaseClass):
    @classmethod
    def factory(cls, data):
        return cls(data)
        
    @property
    def value_squared(self):
        return self.value ** 2
"""
    analyzer = ASTAnalyzer(code)
    result = analyzer.analyze()
    
    # Check classes
    classes = result["classes"]
    assert len(classes) == 2
    
    # Find classes by name
    simple = next(c for c in classes if c["name"] == "SimpleClass")
    complex = next(c for c in classes if c["name"] == "ComplexClass")
    
    # Check simple class
    assert len(simple["methods"]) == 3
    assert "__init__" in simple["methods"]
    assert "get_value" in simple["methods"]
    assert "set_value" in simple["methods"]
    assert len(simple["bases"]) == 0
    
    # Check complex class
    assert len(complex["methods"]) == 2
    assert "factory" in complex["methods"]
    assert "value_squared" in complex["methods"]
    assert len(complex["bases"]) == 1
    assert complex["bases"][0] == "BaseClass"
    assert len(complex["decorators"]) > 0

def test_complexity_analysis():
    code = """
def complex_function(n):
    result = 0
    for i in range(n):
        if i % 2 == 0:
            result += i
        elif i % 3 == 0:
            result += i * 2
        else:
            result -= i
    return result

class SimpleClass:
    def method1(self):
        pass
        
    def method2(self):
        pass
"""
    analyzer = ASTAnalyzer(code)
    result = analyzer.analyze()
    
    # Check complexity metrics
    complexity = result["complexity"]
    
    # Basic counts
    assert complexity["functions"] == 3  # complex_function, method1, method2
    assert complexity["classes"] == 1
    assert complexity["control_flow"] > 0  # Should have at least one control flow structure
    
    # Check cyclomatic complexity
    functions = result["functions"]
    complex_func = next(f for f in functions if f["name"] == "complex_function")
    assert complex_func["complexity"] > 1  # Should have higher complexity