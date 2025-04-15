from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.api.schemas.repository import Repository, RepositoryCreate, RepositoryUpdate
from app.api.schemas.user import User
from app.core.database import get_db
from app.services.user import get_current_active_user
from app.services.repository import (
    create_repository,
    get_repository_by_id,
    get_repositories_by_owner,
    update_repository,
    delete_repository,
)
from app.services.analysis.tasks import trigger_repository_analysis

router = APIRouter()

@router.post("/repositories", response_model=Repository, status_code=status.HTTP_201_CREATED)
async def create_new_repository(
    repository: RepositoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return create_repository(db=db, repository=repository, owner_id=current_user.id)

@router.get("/repositories", response_model=List[Repository])
async def read_repositories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    repositories = get_repositories_by_owner(db=db, owner_id=current_user.id, skip=skip, limit=limit)
    return repositories

@router.get("/repositories/{repository_id}", response_model=Repository)
async def read_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    repository = get_repository_by_id(db=db, repository_id=repository_id)
    if repository is None or repository.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repository

@router.put("/repositories/{repository_id}", response_model=Repository)
async def update_repository_details(
    repository_id: int,
    repository_update: RepositoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    repository = get_repository_by_id(db=db, repository_id=repository_id)
    if repository is None or repository.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return update_repository(db=db, repository=repository, repository_update=repository_update)

@router.delete("/repositories/{repository_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_repository_by_id(
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    repository = get_repository_by_id(db=db, repository_id=repository_id)
    if repository is None or repository.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    delete_repository(db=db, repository_id=repository_id)
    return None

@router.post("/repositories/{repository_id}/analyze", status_code=status.HTTP_202_ACCEPTED)
async def analyze_repository(
    repository_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active