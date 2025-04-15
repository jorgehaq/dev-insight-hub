import os
import base64
from github import Github, GithubIntegration
from app.core.config import settings

def get_github_client():
    """
    Returns a PyGithub client using the app's credentials
    """
    try:
        # Try to use GitHub App authentication if credentials are provided
        if settings.GITHUB_APP_ID and settings.GITHUB_APP_PRIVATE_KEY:
            integration = GithubIntegration(
                settings.GITHUB_APP_ID,
                settings.GITHUB_APP_PRIVATE_KEY
            )
            return integration
        else:
            # Fallback to token-based auth if present in env
            token = os.getenv("GITHUB_TOKEN")
            if token:
                return Github(token)
            else:
                # Anonymous client as last resort
                return Github()
    except Exception as e:
        print(f"Error initializing GitHub client: {str(e)}")
        # Return anonymous client as fallback
        return Github()

def get_repository_info(repo_url):
    """
    Extract owner and repo name from GitHub URL
    """
    # Handle different URL formats
    if "github.com" not in repo_url:
        raise ValueError("Not a valid GitHub URL")
    
    # Extract owner/repo part
    parts = repo_url.split("github.com/")
    if len(parts) != 2:
        raise ValueError("Could not parse GitHub URL")
    
    path = parts[1].strip("/")
    
    # Remove .git suffix if present
    if path.endswith(".git"):
        path = path[:-4]
    
    # Split into owner and repo
    path_parts = path.split("/")
    if len(path_parts) < 2:
        raise ValueError("Could not extract owner and repo from URL")
    
    owner = path_parts[0]
    repo = path_parts[1]
    
    return owner, repo

def get_file_content(repo_url, path, ref="main"):
    """
    Get file content from GitHub
    """
    try:
        owner, repo_name = get_repository_info(repo_url)
        
        client = get_github_client()
        repo = client.get_repo(f"{owner}/{repo_name}")
        
        # Get file content
        file_content = repo.get_contents(path, ref=ref)
        
        # If it's a directory, return list of files
        if isinstance(file_content, list):
            return {
                "is_dir": True,
                "contents": [
                    {
                        "name": item.name,
                        "path": item.path,
                        "type": "dir" if item.type == "dir" else "file",
                        "sha": item.sha
                    }
                    for item in file_content
                ]
            }
        
        # If it's a file, decode and return content
        decoded_content = base64.b64decode(file_content.content).decode("utf-8")
        return {
            "is_dir": False,
            "content": decoded_content,
            "name": file_content.name,
            "path": file_content.path,
            "sha": file_content.sha
        }
    
    except Exception as e:
        return {"error": str(e)}

def setup_webhook(repo_url, webhook_url, secret=None):
    """
    Set up a webhook for a repository
    """
    try:
        owner, repo_name = get_repository_info(repo_url)
        
        client = get_github_client()
        repo = client.get_repo(f"{owner}/{repo_name}")
        
        # Set up webhook configuration
        config = {
            "url": webhook_url,
            "content_type": "json",
            "insecure_ssl": "0"
        }
        
        if secret:
            config["secret"] = secret
        
        # Create webhook
        hook = repo.create_hook(
            name="web",
            config=config,
            events=["push", "pull_request"],
            active=True
        )
        
        return {
            "id": hook.id,
            "url": hook.url,
            "status": "created"
        }
    
    except Exception as e:
        return {"error": str(e)}