import asyncio
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.repository import Repository
from app.services.user import get_password_hash
from pymongo import MongoClient

# MongoDB connection
mongo_client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/devinsighthub"))
mongo_db = mongo_client.get_database("devinsighthub")
analyses_collection = mongo_db.get_collection("analyses")

def seed_users(db: Session):
    print("Seeding users...")
    # Check if admin user exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        print("Admin user created")
    
    # Create a regular test user
    test_user = db.query(User).filter(User.username == "testuser").first()
    if not test_user:
        test_user = User(
            username="testuser",
            email="user@example.com",
            hashed_password=get_password_hash("userpassword"),
            is_active=True,
            is_superuser=False
        )
        db.add(test_user)
        print("Test user created")
    
    db.commit()
    
    # Return users for repository seeding
    return admin, test_user

def seed_repositories(db: Session, admin, test_user):
    print("Seeding repositories...")
    # Sample repositories for admin
    admin_repos = [
        {
            "name": "Sample Project",
            "url": "https://github.com/sample/project",
            "is_public": True,
            "github_repo_id": "12345"
        },
        {
            "name": "Private Library",
            "url": "https://github.com/sample/library",
            "is_public": False,
            "github_repo_id": "67890"
        }
    ]
    
    for repo_data in admin_repos:
        repo = db.query(Repository).filter(
            Repository.name == repo_data["name"],
            Repository.owner_id == admin.id
        ).first()
        
        if not repo:
            repo = Repository(
                name=repo_data["name"],
                url=repo_data["url"],
                is_public=repo_data["is_public"],
                github_repo_id=repo_data["github_repo_id"],
                owner_id=admin.id
            )
            db.add(repo)
            print(f"Created repository: {repo_data['name']} for admin")
    
    # Sample repositories for test user
    user_repos = [
        {
            "name": "Test App",
            "url": "https://github.com/testuser/app",
            "is_public": True,
            "github_repo_id": "54321"
        }
    ]
    
    for repo_data in user_repos:
        repo = db.query(Repository).filter(
            Repository.name == repo_data["name"],
            Repository.owner_id == test_user.id
        ).first()
        
        if not repo:
            repo = Repository(
                name=repo_data["name"],
                url=repo_data["url"],
                is_public=repo_data["is_public"],
                github_repo_id=repo_data["github_repo_id"],
                owner_id=test_user.id
            )
            db.add(repo)
            print(f"Created repository: {repo_data['name']} for test user")
    
    db.commit()

def seed_mongodb():
    print("Seeding MongoDB with sample analyses...")
    
    # Check if we already have sample data
    count = analyses_collection.count_documents({})
    if count > 0:
        print(f"MongoDB already has {count} documents, skipping seed")
        return
    
    # Sample analysis result
    sample_analysis = {
        "repository_id": 1,
        "user_id": 1,
        "status": "completed",
        "created_at": "2023-07-01T12:00:00Z",
        "files_analyzed": 10,
        "files_with_issues": 3,
        "total_issues": 15,
        "file_results": [
            {
                "file_path": "app/main.py",
                "issues_count": 2,
                "result": {
                    "ast": {
                        "imports": [
                            {"type": "import", "name": "fastapi", "asname": None}
                        ],
                        "functions": [
                            {
                                "name": "create_app",
                                "args": {"args": [], "defaults": 0, "vararg": None, "kwarg": None},
                                "line_start": 10,
                                "line_end": 15,
                                "decorators": [],
                                "complexity": 1
                            }
                        ],
                        "classes": [],
                        "complexity": {
                            "loc": 20,
                            "statements": 15,
                            "control_flow": 2,
                            "functions": 1,
                            "classes": 0,
                            "complexity_score": 3
                        }
                    },
                    "quality": {
                        "maintainability": {
                            "loc": 20,
                            "lloc": 15,
                            "sloc": 18,
                            "comments": 2,
                            "multi": 0,
                            "blank": 2,
                            "maintainability_index": 75.5
                        },
                        "code_smells": [
                            {
                                "type": "long_line",
                                "line": 12,
                                "message": "Line is too long (120 chars)",
                                "severity": "minor"
                            },
                            {
                                "type": "unused_import",
                                "line": 2,
                                "message": "Unused import 'os'",
                                "severity": "minor"
                            }
                        ],
                        "metrics": {
                            "cyclomatic_complexity": {
                                "total": 3,
                                "average": 3.0,
                                "max": 3,
                                "functions": [
                                    {
                                        "name": "create_app",
                                        "complexity": 3,
                                        "line": 10
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]
    }
    
    # Insert sample data
    analyses_collection.insert_one(sample_analysis)
    print("Added sample analysis to MongoDB")

def main():
    db = SessionLocal()
    try:
        admin, test_user = seed_users(db)
        seed_repositories(db, admin, test_user)
        seed_mongodb()
        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()