from typing import List, Optional
from sqlalchemy.orm import Session

from app.api.schemas.repository import RepositoryCreate, RepositoryUpdate
from app.models.repository import Repository

def get_repository_by_id(db: Session, repository_id: int) -> Optional[Repository]:
    return db.query(Repository).filter(Repository.id == repository_id).first()

def get_repositories_by_owner(
    db: Session, owner_id: int, skip: int = 0, limit: int = 100
) -> List[Repository]:
    return db.query(Repository).filter(Repository.owner_id == owner_id).offset(skip).limit(limit).all()

def create_repository(db: Session, repository: RepositoryCreate, owner_id: int) -> Repository:
    db_repository = Repository(
        name=repository.name,
        url=repository.url,
        is_public=repository.is_public,
        owner_id=owner_id
    )
    db.add(db_repository)
    db.commit()
    db.refresh(db_repository)
    return db_repository

def update_repository(
    db: Session, repository: Repository, repository_update: RepositoryUpdate
) -> Repository:
    update_data = repository_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(repository, field, value)
    
    db.commit()
    db.refresh(repository)
    return repository

def delete_repository(db: Session, repository_id: int) -> None:
    db.query(Repository).filter(Repository.id == repository_id).delete()
    db.commit()