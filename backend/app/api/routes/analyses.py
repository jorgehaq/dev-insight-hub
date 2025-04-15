from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session

from app.api.schemas.analysis import AnalysisResponse, AnalysisCreate
from app.api.schemas.user import User
from app.core.database import get_db
from app.core.mongodb import get_mongo_client, get_analysis_collection
from app.services.user import get_current_active_user
from app.services.repository import get_repository_by_id
from app.services.analysis.tasks import trigger_code_analysis

router = APIRouter()

@router.post("/analyses", response_model=AnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    analysis: AnalysisCreate,
    db: Session = Depends(get_db),
    mongo_client: AsyncIOMotorClient = Depends(get_mongo_client),
    current_user: User = Depends(get_current_active_user)
):
    # Check if repository exists and user has access
    repository = get_repository_by_id(db=db, repository_id=analysis.repository_id)
    if repository is None or repository.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Trigger analysis as a background task
    task_id = trigger_code_analysis.delay(
        repository_id=repository.id,
        code_path=analysis.code_path,
        user_id=current_user.id
    )
    
    # Return task ID for tracking
    return {
        "task_id": str(task_id),
        "repository_id": repository.id,
        "status": "pending"
    }

@router.get("/analyses", response_model=List[AnalysisResponse])
async def get_analyses(
    repository_id: Optional[int] = None,
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    mongo_client: AsyncIOMotorClient = Depends(get_mongo_client),
    current_user: User = Depends(get_current_active_user)
):
    # Get analyses collection
    analyses_collection = await get_analysis_collection(mongo_client)
    
    # Build query
    query = {"user_id": current_user.id}
    if repository_id is not None:
        # Check if repository exists and user has access
        repository = get_repository_by_id(db=db, repository_id=repository_id)
        if repository is None or repository.owner_id != current_user.id:
            raise HTTPException(status_code=404, detail="Repository not found")
        query["repository_id"] = repository_id
    
    # Fetch analyses from MongoDB
    cursor = analyses_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    analyses = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for JSON serialization
    for analysis in analyses:
        analysis["id"] = str(analysis["_id"])
        del analysis["_id"]
    
    return analyses

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    mongo_client: AsyncIOMotorClient = Depends(get_mongo_client),
    current_user: User = Depends(get_current_active_user)
):
    # Get analyses collection
    analyses_collection = await get_analysis_collection(mongo_client)
    
    # Find specific analysis
    from bson.objectid import ObjectId
    try:
        analysis = await analyses_collection.find_one({"_id": ObjectId(analysis_id), "user_id": current_user.id})
    except:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
    
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Convert ObjectId to string for JSON serialization
    analysis["id"] = str(analysis["_id"])
    del analysis["_id"]
    
    return analysis