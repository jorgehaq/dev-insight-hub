from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

from app.core.config import settings

# Async client for FastAPI
async def get_mongo_client():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    try:
        yield client
    finally:
        client.close()

# Sync client for Celery tasks
def get_mongo_sync_client():
    return MongoClient(settings.MONGODB_URI)

async def get_analysis_collection(client: AsyncIOMotorClient):
    db = client.get_database("devinsighthub")
    return db.get_collection("analyses")