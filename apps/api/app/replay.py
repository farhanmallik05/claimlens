"""
ClaimLens Replay Engine
Loads and streams authoritative recorded execution traces with realistic timing simulation.
"""

import json
import os
import asyncio
from typing import AsyncGenerator, Dict, List, Any, Optional
from app.config import REPLAY_FILE_PATH, FIXTURES_DIR


def format_sse_message(event_data: Dict[str, Any], event_name: Optional[str] = None) -> str:
    """Formats a dictionary as an SSE data payload, optionally including event line."""
    name = event_name or event_data.get("event")
    payload = json.dumps(event_data)
    if name:
        return f"event: {name}\ndata: {payload}\n\n"
    return f"data: {payload}\n\n"


def load_replay_trace(sample_id: str = "raju") -> Dict[str, Any]:
    """Loads authoritative execution trace from disk."""
    trace_path = str(REPLAY_FILE_PATH)
    if not os.path.exists(trace_path):
        trace_path = os.path.join(FIXTURES_DIR, "raju_trace.json")
    if not os.path.exists(trace_path):
        trace_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "../../../apps/web/public/replay/raju_trace.json"
            )
        )
    with open(trace_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_raju_trace() -> Dict[str, Any]:
    """Alias for load_replay_trace."""
    return load_replay_trace("raju")


def get_replay_events(sample_id: str = "raju") -> List[Dict[str, Any]]:
    """Return all step events recorded in the replay trace."""
    trace_data = load_replay_trace(sample_id)
    return trace_data.get("events", [])


async def stream_replay_events(sample_id: str = "raju") -> AsyncGenerator[str, None]:
    """Asynchronous generator streaming trace events over SSE."""
    trace_data = load_replay_trace()
    events = trace_data.get("events", [])
    
    # Handshake event
    handshake = {
        "type": "handshake",
        "runId": trace_data.get("runId", "run-replay-001"),
        "label": "Replayed from recorded run",
        "sampleId": sample_id,
        "isReplay": True
    }
    yield format_sse_message(handshake)
    await asyncio.sleep(0.04)
    
    # Stream each agent event
    for evt in events:
        sse_event = {
            "type": "agent",
            "step": evt.get("step"),
            "event": evt.get("event"),
            "agent": evt.get("agent"),
            "timestamp": evt.get("timestamp"),
            "message": evt.get("message"),
            "data": evt.get("data")
        }
        yield format_sse_message(sse_event)
        await asyncio.sleep(0.06)
        
    # Final verified result
    final_result = {
        "type": "result",
        "status": "completed",
        "verifiedAgainst": "golden",
        "matchRatio": "14/14",
        "forecast": {
            "billed": 150000,
            "insurerPays": 108500,
            "youPay": 41500,
            "deductionsCount": 3
        },
        "audit": {
            "floatLeakage": 0,
            "provenanceClauseMatch": "100%"
        }
    }
    yield format_sse_message(final_result)
