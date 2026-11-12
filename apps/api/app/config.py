"""
ClaimLens Backend Configuration
Provides application configuration, security parameters, and circuit breaker defaults.
Conforms to plan/trd.md §6.6, §6.8 and PROJECT.md § Interface Contracts.
"""

import os
from pathlib import Path
from typing import List

# Base paths
API_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = API_DIR.parent.parent

# Replay fixture path resolution
_default_replay_path = ROOT_DIR / "fixtures" / "raju_trace.json"
if not _default_replay_path.exists():
    _default_replay_path = ROOT_DIR / "apps" / "web" / "public" / "replay" / "raju_trace.json"

REPLAY_FILE_PATH = Path(os.getenv("REPLAY_FILE_PATH", str(_default_replay_path)))
FIXTURES_DIR = str(ROOT_DIR / "fixtures")

# Fallback circuit breaker timeout in milliseconds
CIRCUIT_BREAKER_TIMEOUT_MS: int = int(os.getenv("CIRCUIT_BREAKER_TIMEOUT_MS", "6000"))

# Security and rate limiting guards (TRD §6.6)
# 5 runs / IP / hour; 30 runs / day global
RATE_LIMIT_PER_IP_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_IP_PER_HOUR", "5"))
RATE_LIMIT_GLOBAL_PER_DAY: int = int(os.getenv("RATE_LIMIT_GLOBAL_PER_DAY", "30"))
PER_AGENT_TIMEOUT_SECONDS: int = int(os.getenv("PER_AGENT_TIMEOUT_SECONDS", "25"))
MAX_REQUEST_SIZE_MB: int = int(os.getenv("MAX_REQUEST_SIZE_MB", "8"))

# Arbitrary uploads disabled for demo sandbox security (TRD §6.6 / ADR-004)
UPLOADS_ENABLED: bool = os.getenv("UPLOADS_ENABLED", "false").lower() in ("true", "1")

# LLM & Vision settings (TRD §6.7, §6.8)
VISION_MODEL: str = os.getenv("VISION_MODEL", "gpt-4o-mini")
LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")

# CORS origin allowlist
_raw_origins = os.getenv("ALLOWED_ORIGIN", "*")
if _raw_origins == "*":
    ALLOWED_ORIGINS: List[str] = ["*"]
else:
    ALLOWED_ORIGINS = [orig.strip() for orig in _raw_origins.split(",") if orig.strip()]


class Settings:
    """Settings wrapper class for structured configuration access."""
    API_DIR: Path = API_DIR
    ROOT_DIR: Path = ROOT_DIR
    FIXTURES_DIR: str = FIXTURES_DIR
    REPLAY_FILE_PATH: Path = REPLAY_FILE_PATH
    CIRCUIT_BREAKER_TIMEOUT_MS: int = CIRCUIT_BREAKER_TIMEOUT_MS
    RATE_LIMIT_PER_IP_PER_HOUR: int = RATE_LIMIT_PER_IP_PER_HOUR
    RATE_LIMIT_GLOBAL_PER_DAY: int = RATE_LIMIT_GLOBAL_PER_DAY
    PER_AGENT_TIMEOUT_SECONDS: int = PER_AGENT_TIMEOUT_SECONDS
    MAX_REQUEST_SIZE_MB: int = MAX_REQUEST_SIZE_MB
    UPLOADS_ENABLED: bool = UPLOADS_ENABLED
    VISION_MODEL: str = VISION_MODEL
    LLM_API_KEY: str = LLM_API_KEY
    ALLOWED_ORIGINS: List[str] = ALLOWED_ORIGINS


settings = Settings()
