from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, repositories, analyses, users
from app.core.config import settings

app = FastAPI(
    title="DevInsightHub API",
    description="API for analyzing code quality and patterns",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(repositories.router, prefix="/api", tags=["Repositories"])
app.include_router(analyses.router, prefix="/api", tags=["Analyses"])
app.include_router(users.router, prefix="/api", tags=["Users"])

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}