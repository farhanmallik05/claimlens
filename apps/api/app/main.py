"""
ClaimLens Backend API Gateway
FastAPI application providing health checks, run orchestration, and SSE event streaming.
Conforms to plan/trd.md §6.6, §6.8 and PROJECT.md § Interface Contracts.
"""

from collections import defaultdict
from datetime import datetime, timezone, timedelta
import time
from typing import Any, Dict, List, Optional
import uuid

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import (
    ALLOWED_ORIGINS,
    RATE_LIMIT_PER_IP_PER_HOUR,
    RATE_LIMIT_GLOBAL_PER_DAY,
    UPLOADS_ENABLED,
)
from app.pipeline import execute_pipeline_stream
from app.replay import load_replay_trace, stream_replay_events

app = FastAPI(
    title="ClaimLens API",
    description="Backend service for ClaimLens shortfall forecasting and appeal generation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def block_arbitrary_uploads_middleware(request: Request, call_next):
    """Enforce ADR-004: Arbitrary document uploads disabled until PII redaction passes."""
    if request.url.path.startswith("/v1/runs") and request.method == "POST":
        content_type = request.headers.get("content-type", "")
        if ("multipart/form-data" in content_type or "application/octet-stream" in content_type) and not UPLOADS_ENABLED:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Arbitrary uploads disabled for demo sandbox security. Use preset sampleId."},
            )
    return await call_next(request)


# Rate Limiting State (In-Memory Guards per TRD §6.6)
# 5 runs / IP / hour; 30 runs / day global
_ip_request_timestamps: Dict[str, List[float]] = defaultdict(list)
_global_run_timestamps: List[float] = []

# In-Memory Runs Registry
RUNS: Dict[str, Dict[str, Any]] = {}


class CreateRunRequest(BaseModel):
    sampleId: str = Field(
        default="raju",
        description="Preset sample identifier (e.g. 'raju', 'multiroom', 'dispute')",
    )


class CreateRunResponse(BaseModel):
    runId: str
    sampleId: str
    status: str
    createdAt: str


def check_rate_limits(client_ip: str) -> None:
    """Enforce rate limits: 5 runs/IP/hour and 30 runs/day global."""
    now = time.time()
    one_hour_ago = now - 3600
    one_day_ago = now - 86400

    # Prune old timestamps
    _ip_request_timestamps[client_ip] = [
        t for t in _ip_request_timestamps[client_ip] if t > one_hour_ago
    ]
    global _global_run_timestamps
    _global_run_timestamps = [t for t in _global_run_timestamps if t > one_day_ago]

    # Check IP hourly limit
    if len(_ip_request_timestamps[client_ip]) >= RATE_LIMIT_PER_IP_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: maximum {RATE_LIMIT_PER_IP_PER_HOUR} runs per IP per hour.",
        )

    # Check global daily limit
    if len(_global_run_timestamps) >= RATE_LIMIT_GLOBAL_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Global rate limit reached: maximum {RATE_LIMIT_GLOBAL_PER_DAY} runs per day.",
        )

    # Record current run
    _ip_request_timestamps[client_ip].append(now)
    _global_run_timestamps.append(now)


@app.get("/healthz")
def healthz() -> dict:
    """Liveness probe returning operational status (used by keep-alive cron and CI)."""
    return {"status": "ok"}


@app.post("/v1/runs", response_model=CreateRunResponse, status_code=status.HTTP_201_CREATED)
async def create_run(payload: CreateRunRequest, request: Request) -> CreateRunResponse:
    """
    Initialize a new claim analysis pipeline run.
    Arbitrary uploads remain disabled (ADR-004) until PII redaction gate passes.
    """
    # Verify Content-Type is application/json (reject multipart/arbitrary file upload attempts)
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type and not UPLOADS_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Arbitrary uploads disabled for demo sandbox security. Use preset sampleId.",
        )

    # Determine client IP for rate limiting
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_rate_limits(client_ip)

    sample_id = payload.sampleId or "raju"
    run_id = f"run-{sample_id}-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()

    RUNS[run_id] = {
        "runId": run_id,
        "sampleId": sample_id,
        "status": "queued",
        "createdAt": created_at,
    }

    return CreateRunResponse(
        runId=run_id,
        sampleId=sample_id,
        status="queued",
        createdAt=created_at,
    )


@app.get("/v1/runs/{run_id}/events")
async def get_run_events(run_id: str, request: Request) -> StreamingResponse:
    """
    Stream agent execution events over Server-Sent Events (SSE).
    Emits typed step events for policy_parser -> bill_reader -> rules_engine -> explainer -> appeal_drafter.
    """
    sample_id = "raju"
    if run_id in RUNS:
        sample_id = RUNS[run_id].get("sampleId", "raju")
    elif "raju" in run_id:
        sample_id = "raju"

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        execute_pipeline_stream(sample_id=sample_id, delay_seconds=0.02),
        media_type="text/event-stream",
        headers=headers,
    )


@app.get("/v1/replay/{sample_id}")
def get_replay_data(sample_id: str = "raju") -> dict:
    """Direct JSON access to recorded replay trace."""
    try:
        return load_replay_trace(sample_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
