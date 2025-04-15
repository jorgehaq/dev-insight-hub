from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RepositoryBase(BaseModel):
    name: str
    url: str
    is_public: bool = True

class RepositoryCreate(RepositoryBase):
    pass

class RepositoryUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    is_public: Optional[bool] = None

class RepositoryInDBBase(RepositoryBase):
    id: int
    owner_id: int
    github_repo_id: Optional[str] = None
    github_webhook_id: Optional[str] = None
    last_analyzed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Repository(RepositoryInDBBase):
    pass