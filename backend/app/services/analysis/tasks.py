import os
import tempfile
import shutil
import git
import datetime
from celery import shared_task
import glob
from pathlib import Path
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.mongodb import get_mongo_sync_client
from app.analyzers.ast_analyzer import ASTAnalyzer
from app.analyzers.quality_analyzer import QualityAnalyzer
from app.models.repository import Repository

@shared_task
def trigger_repository_analysis(repository_id: int, user_id: int):
    """
    Trigger a full repository analysis by cloning and analyzing all files
    """
    # Create DB session
    db = SessionLocal()
    try:
        # Get repository
        repository = db.query(Repository).filter(Repository.id == repository_id).first()
        if not repository:
            return {"status": "error", "message": "Repository not found"}
        
        # Create a temp directory for the clone
        with tempfile.TemporaryDirectory() as tmp_dir:
            try:
                # Clone the repository
                repo = git.Repo.clone_from(repository.url, tmp_dir)
                
                # Analyze the repository
                analysis_result = analyze_repository_files(tmp_dir, repository_id, user_id)
                
                # Update repository last_analyzed_at
                repository.last_analyzed_at = datetime.datetime.utcnow()
                db.commit()
                
                return analysis_result
                
            except git.GitCommandError as e:
                return {
                    "status": "error",
                    "message": f"Failed to clone repository: {str(e)}"
                }
                
    finally:
        db.close()

@shared_task
def trigger_code_analysis(repository_id: int, code_path: str, user_id: int):
    """
    Trigger analysis for a specific code file or directory
    """
    # Create DB session
    db = SessionLocal()
    try:
        # Get repository
        repository = db.query(Repository).filter(Repository.id == repository_id).first()
        if not repository:
            return {"status": "error", "message": "Repository not found"}
        
        # Create a temp directory for the clone
        with tempfile.TemporaryDirectory() as tmp_dir:
            try:
                # Clone the repository
                repo = git.Repo.clone_from(repository.url, tmp_dir)
                
                # Construct the full path
                full_path = os.path.join(tmp_dir, code_path)
                
                # Check if the path exists
                if not os.path.exists(full_path):
                    return {
                        "status": "error",
                        "message": f"Path {code_path} not found in repository"
                    }
                
                # Analyze the file or directory
                if os.path.isfile(full_path):
                    analysis_result = analyze_file(full_path, repository_id, user_id)
                else:
                    analysis_result = analyze_directory(full_path, repository_id, user_id)
                
                return analysis_result
                
            except git.GitCommandError as e:
                return {
                    "status": "error",
                    "message": f"Failed to clone repository: {str(e)}"
                }
                
    finally:
        db.close()

def analyze_repository_files(repo_path: str, repository_id: int, user_id: int):
    """
    Analyze all Python files in the repository
    """
    # Find all Python files
    python_files = glob.glob(f"{repo_path}/**/*.py", recursive=True)
    
    # Initialize MongoDB client
    mongo_client = get_mongo_sync_client()
    db = mongo_client.get_database("devinsighthub")
    analyses_collection = db.get_collection("analyses")
    
    # Initialize results
    all_results = {
        "repository_id": repository_id,
        "user_id": user_id,
        "files_analyzed": 0,
        "files_with_issues": 0,
        "total_issues": 0,
        "status": "completed",
        "created_at": datetime.datetime.utcnow(),
        "file_results": []
    }
    
    # Analyze each file
    for file_path in python_files:
        try:
            # Skip non-Python files and virtual environments
            if not file_path.endswith('.py') or 'venv' in file_path or 'env' in file_path:
                continue
                
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
                
            # Get relative path
            rel_path = os.path.relpath(file_path, repo_path)
            
            # Analyze code
            result = analyze_code(code, rel_path)
            
            # Count issues
            issues_count = len(result.get("quality", {}).get("code_smells", []))
            
            # Update stats
            all_results["files_analyzed"] += 1
            if issues_count > 0:
                all_results["files_with_issues"] += 1
                all_results["total_issues"] += issues_count
                
            # Add file result
            all_results["file_results"].append({
                "file_path": rel_path,
                "issues_count": issues_count,
                "result": result
            })
                
        except Exception as e:
            # Log error and continue with next file
            print(f"Error analyzing {file_path}: {str(e)}")
            all_results["file_results"].append({
                "file_path": os.path.relpath(file_path, repo_path),
                "error": str(e)
            })
    
    # Save results to MongoDB
    analyses_collection.insert_one(all_results)
    
    # Return summary
    summary = {
        "status": "completed",
        "repository_id": repository_id,
        "files_analyzed": all_results["files_analyzed"],
        "files_with_issues": all_results["files_with_issues"],
        "total_issues": all_results["total_issues"]
    }
    
    return summary

def analyze_directory(dir_path: str, repository_id: int, user_id: int):
    """
    Analyze all Python files in a directory
    """
    # Find all Python files
    python_files = glob.glob(f"{dir_path}/**/*.py", recursive=True)
    
    # Initialize MongoDB client
    mongo_client = get_mongo_sync_client()
    db = mongo_client.get_database("devinsighthub")
    analyses_collection = db.get_collection("analyses")
    
    # Initialize results
    all_results = {
        "repository_id": repository_id,
        "user_id": user_id,
        "directory": os.path.basename(dir_path),
        "files_analyzed": 0,
        "files_with_issues": 0,
        "total_issues": 0,
        "status": "completed",
        "created_at": datetime.datetime.utcnow(),
        "file_results": []
    }
    
    # Analyze each file
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
                
            # Get relative path
            rel_path = os.path.relpath(file_path, os.path.dirname(dir_path))
            
            # Analyze code
            result = analyze_code(code, rel_path)
            
            # Count issues
            issues_count = len(result.get("quality", {}).get("code_smells", []))
            
            # Update stats
            all_results["files_analyzed"] += 1
            if issues_count > 0:
                all_results["files_with_issues"] += 1
                all_results["total_issues"] += issues_count
                
            # Add file result
            all_results["file_results"].append({
                "file_path": rel_path,
                "issues_count": issues_count,
                "result": result
            })
                
        except Exception as e:
            # Log error and continue with next file
            all_results["file_results"].append({
                "file_path": os.path.relpath(file_path, os.path.dirname(dir_path)),
                "error": str(e)
            })
    
    # Save results to MongoDB
    result_id = analyses_collection.insert_one(all_results).inserted_id
    
    # Return summary
    summary = {
        "id": str(result_id),
        "status": "completed",
        "repository_id": repository_id,
        "directory": os.path.basename(dir_path),
        "files_analyzed": all_results["files_analyzed"],
        "files_with_issues": all_results["files_with_issues"],
        "total_issues": all_results["total_issues"]
    }
    
    return summary

def analyze_file(file_path: str, repository_id: int, user_id: int):
    """
    Analyze a single file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
            
        # Get filename
        filename = os.path.basename(file_path)
        
        # Analyze code
        result = analyze_code(code, filename)
        
        # Initialize MongoDB client
        mongo_client = get_mongo_sync_client()
        db = mongo_client.get_database("devinsighthub")
        analyses_collection = db.get_collection("analyses")
        
        # Prepare analysis document
        analysis_doc = {
            "repository_id": repository_id,
            "user_id": user_id,
            "file_path": filename,
            "status": "completed",
            "created_at": datetime.datetime.utcnow(),
            "result": result
        }
        
        # Insert into MongoDB
        result_id = analyses_collection.insert_one(analysis_doc).inserted_id
        
        # Return analysis result with ID
        return {
            "id": str(result_id),
            "status": "completed",
            "repository_id": repository_id,
            "file_path": filename
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to analyze file: {str(e)}"
        }

def analyze_code(code: str, filename: str):
    """
    Analyze code content using both analyzers
    """
    result = {}
    
    # Use AST analyzer for Python files
    if filename.endswith('.py'):
        try:
            ast_analyzer = ASTAnalyzer(code)
            result["ast"] = ast_analyzer.analyze()
        except SyntaxError:
            result["ast"] = {"error": "Syntax error in Python code"}
        except Exception as e:
            result["ast"] = {"error": str(e)}
    
    # Use quality analyzer for all files
    try:
        quality_analyzer = QualityAnalyzer(code, filename)
        result["quality"] = quality_analyzer.analyze()
    except Exception as e:
        result["quality"] = {"error": str(e)}
    
    return result