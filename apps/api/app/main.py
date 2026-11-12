"""
ClaimLens Backend API Service
FastAPI application providing health check and agent pipeline orchestration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ClaimLens API",
    description="Backend service for ClaimLens shortfall forecasting and appeal generation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    """Liveness probe returning operational status."""
    return {"status": "ok"}
