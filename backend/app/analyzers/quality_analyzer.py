import re
from typing import Dict, List, Any
import radon.complexity as radon_cc
from radon.raw import analyze

class QualityAnalyzer:
    """
    Analyzes code quality metrics.
    """
    
    def __init__(self, code: str, filename: str = "unknown.py"):
        self.code = code
        self.filename = filename
    
    def analyze(self) -> Dict[str, Any]:
        """
        Perform full quality analysis of the code
        """
        return {
            "maintainability": self._analyze_maintainability(),
            "code_smells": self._detect_code_smells(),
            "metrics": self._calculate_metrics(),
        }
    
    def _analyze_maintainability(self) -> Dict[str, Any]:
        """
        Calculate maintainability metrics
        """
        # Use radon to calculate maintainability index
        results = {}
        
        # This is a simplification - in a real system, we'd use the complete radon API
        try:
            raw_metrics = analyze(self.code)
            results["loc"] = raw_metrics.loc
            results["lloc"] = raw_metrics.lloc
            results["sloc"] = raw_metrics.sloc
            results["comments"] = raw_metrics.comments
            results["multi"] = raw_metrics.multi
            results["blank"] = raw_metrics.blank
            
            # Calculate a simple maintainability index
            # This is a simplification of the actual formula
            comment_ratio = raw_metrics.comments / raw_metrics.lloc if raw_metrics.lloc > 0 else 0
            results["maintainability_index"] = max(0, min(100, 100 - raw_metrics.lloc / 100 + 25 * comment_ratio))
            
        except Exception as e:
            results["error"] = str(e)
            results["maintainability_index"] = 0
            
        return results
    
    def _detect_code_smells(self) -> List[Dict[str, Any]]:
        """
        Detect common code smells
        """
        smells = []
        
        # Long lines
        for i, line in enumerate(self.code.splitlines(), 1):
            if len(line.strip()) > 100:
                smells.append({
                    "type": "long_line",
                    "line": i,
                    "message": f"Line is too long ({len(line)} chars)",
                    "severity": "minor"
                })
        
        # Large functions (simplistic approach for demo)
        function_pattern = r"def\s+(\w+)\s*\(.*?\):"
        for match in re.finditer(function_pattern, self.code):
            func_name = match.group(1)
            func_start = self.code[:match.start()].count('\n') + 1
            
            # Find indentation level
            next_line_match = re.search(r"\n\s*", self.code[match.end():])
            if next_line_match:
                indent_level = len(next_line_match.group().strip('\n'))
                
                # Find end of function by indentation
                lines = self.code[match.end():].splitlines()
                func_end = func_start
                for i, line in enumerate(lines, 1):
                    if line.strip() and (len(line) - len(line.lstrip())) < indent_level:
                        break
                    func_end = func_start + i
                
                # Check function length
                if func_end - func_start > 50:
                    smells.append({
                        "type": "large_function",
                        "line": func_start,
                        "message": f"Function '{func_name}' is too large ({func_end - func_start} lines)",
                        "severity": "major"
                    })
        
        # TODO: Add more code smell detectors (duplicated code, high complexity, etc.)
        
        return smells
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """
        Calculate additional code metrics
        """
        metrics = {}
        
        # Calculate cyclomatic complexity using radon
        try:
            blocks = list(radon_cc.cc_visit(self.code))
            
            if blocks:
                total_cc = sum(block.complexity for block in blocks)
                avg_cc = total_cc / len(blocks)
                max_cc = max(block.complexity for block in blocks)
                
                metrics["cyclomatic_complexity"] = {
                    "total": total_cc,
                    "average": avg_cc,
                    "max": max_cc,
                    "functions": [
                        {
                            "name": block.name,
                            "complexity": block.complexity,
                            "line": block.lineno
                        }
                        for block in blocks
                    ]
                }
            else:
                metrics["cyclomatic_complexity"] = {
                    "total": 0,
                    "average": 0,
                    "max": 0,
                    "functions": []
                }
                
        except Exception as e:
            metrics["cyclomatic_complexity"] = {
                "error": str(e)
            }
        
        return metrics