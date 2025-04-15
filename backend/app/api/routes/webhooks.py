import hmac
import hashlib
import json
from fastapi import APIRouter, Request, Response, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services.repository import get_repository_by_github_id
from app.services.analysis.tasks import trigger_repository_analysis

router = APIRouter()

def verify_signature(payload_body, signature_header, secret_token):
    """
    Verify GitHub webhook signature
    """
    if not signature_header:
        return False
    
    # Get signature from header
    signature = signature_header.split("=")[1]
    
    # Calculate expected signature
    mac = hmac.new(secret_token.encode(), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = mac.hexdigest()
    
    # Compare signatures using constant-time comparison to prevent timing attacks
    return hmac.compare_digest(signature, expected_signature)

@router.post("/github", status_code=202)
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Get the full request body as bytes
    payload_body = await request.body()
    
    # Get the signature from the header
    signature_header = request.headers.get("X-Hub-Signature-256")
    
    # Get the event type
    event_type = request.headers.get("X-GitHub-Event")
    
    # Verify signature if secret is configured
    if settings.GITHUB_WEBHOOK_SECRET:
        if not verify_signature(payload_body, signature_header, settings.GITHUB_WEBHOOK_SECRET):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    try:
        payload = json.loads(payload_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid payload format")
    
    # Handle different event types
    if event_type == "push":
        # Get repository information
        repo_id = payload.get("repository", {}).get("id")
        if not repo_id:
            return {"status": "error", "message": "Repository ID not found in payload"}
        
        # Look up the repository in our database
        repository = get_repository_by_github_id(db, str(repo_id))
        if not repository:
            return {"status": "error", "message": "Repository not found in database"}
        
        # Trigger analysis in the background
        background_tasks.add_task(
            trigger_repository_analysis,
            repository_id=repository.id,
            user_id=repository.owner_id
        )
        
        return {"status": "accepted", "message": "Analysis triggered"}
    
    # For other event types
    return {"status": "ignored", "message": f"Event type {event_type} not processed"}