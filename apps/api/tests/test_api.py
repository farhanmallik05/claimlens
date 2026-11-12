"""
ClaimLens API Backend Integration & Streaming Tests
Tests health check, run initialization, SSE event streaming, replay engine, and security guards.
"""

import json
from fastapi.testclient import TestClient
import pytest

from app.main import app, _ip_request_timestamps, _global_run_timestamps
from app.replay import load_replay_trace, get_replay_events
from app.pipeline import python_forecast_raju, generate_pipeline_events

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_rate_limits():
    """Reset rate limiting timestamps before each test."""
    _ip_request_timestamps.clear()
    _global_run_timestamps.clear()
    yield
    _ip_request_timestamps.clear()
    _global_run_timestamps.clear()


def test_healthz_endpoint():
    """Verify /healthz returns HTTP 200 OK with expected JSON structure."""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_run_success():
    """Verify POST /v1/runs creates a new run with unique runId and queued status."""
    response = client.post("/v1/runs", json={"sampleId": "raju"})
    assert response.status_code == 201
    data = response.json()
    assert "runId" in data
    assert data["runId"].startswith("run-raju-")
    assert data["sampleId"] == "raju"
    assert data["status"] == "queued"
    assert "createdAt" in data


def test_create_run_default_sample():
    """Verify POST /v1/runs defaults to sampleId 'raju' if none is explicitly provided."""
    response = client.post("/v1/runs", json={})
    assert response.status_code == 201
    data = response.json()
    assert data["sampleId"] == "raju"


def test_disallowed_multipart_upload():
    """Verify arbitrary file upload attempts via multipart are rejected with HTTP 403."""
    response = client.post(
        "/v1/runs",
        headers={"content-type": "multipart/form-data; boundary=boundary"},
        content=b"--boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.pdf\"\r\n\r\nfake\r\n--boundary--",
    )
    assert response.status_code == 403
    assert "Arbitrary uploads disabled" in response.json().get("detail", "")


def test_rate_limiting_per_ip():
    """Verify that exceeding 5 runs per hour triggers HTTP 429 Too Many Requests."""
    for i in range(5):
        res = client.post("/v1/runs", json={"sampleId": "raju"})
        assert res.status_code == 201

    # 6th request from same IP must be rejected
    rejected = client.post("/v1/runs", json={"sampleId": "raju"})
    assert rejected.status_code == 429
    assert "Rate limit exceeded" in rejected.json().get("detail", "")


def test_python_rules_engine_parity():
    """Verify pure Python rules engine computes exact Raju baseline numbers without float drift."""
    forecast = python_forecast_raju()
    assert forecast["billed"] == 150000
    assert forecast["insurerPays"] == 108500
    assert forecast["youPay"] == 41500
    assert forecast["shortfall"] == 41500

    # Invariant: billed == insurerPays + youPay
    assert forecast["insurerPays"] + forecast["youPay"] == forecast["billed"]

    # Verify deductions list
    deductions = forecast["deductions"]
    assert len(deductions) == 5

    room_cut = next(d for d in deductions if d["ruleId"] == "ROOM_CAP")
    assert room_cut["amount"] == 15000
    assert room_cut["clauseId"] == "SP-3.1"

    prop_cuts = [d for d in deductions if d["ruleId"] == "PROPORTIONATE"]
    assert len(prop_cuts) == 3
    assert sum(d["amount"] for d in prop_cuts) == 22500

    non_payable = next(d for d in deductions if d["ruleId"] == "NON_PAYABLE")
    assert non_payable["amount"] == 4000


def test_replay_trace_loading():
    """Verify offline replay trace loads from disk and validates schema."""
    trace = load_replay_trace("raju")
    assert trace["status"] == "completed"
    assert trace["replayMetadata"]["isReplay"] is True
    assert trace["replayMetadata"]["circuitBreakerThresholdMs"] == 6000
    assert len(trace["agents"]) == 5
    assert len(trace["events"]) == 10

    events = get_replay_events("raju")
    assert len(events) == 10

    forecast_ev = next(e for e in events if e["event"] == "forecast_ready")
    assert forecast_ev["data"]["insurerPays"] == 108500
    assert forecast_ev["data"]["youPay"] == 41500

    appeal_ev = next(e for e in events if e["event"] == "appeal_ready")
    assert appeal_ev["data"]["overDeductionAmount"] == 9750


def test_direct_replay_endpoint():
    """Verify GET /v1/replay/raju returns the trace."""
    response = client.get("/v1/replay/raju")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert len(data["events"]) == 10


def test_events_sse_stream():
    """Verify GET /v1/runs/{id}/events streams SSE step events with valid structure."""
    # 1. Create run
    create_res = client.post("/v1/runs", json={"sampleId": "raju"})
    assert create_res.status_code == 201
    run_id = create_res.json()["runId"]

    # 2. Connect to SSE stream
    response = client.get(f"/v1/runs/{run_id}/events")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    # 3. Parse SSE lines
    raw_text = response.text
    lines = raw_text.strip().split("\n")

    event_names = []
    data_payloads = []

    for line in lines:
        if line.startswith("event: "):
            event_names.append(line.replace("event: ", "").strip())
        elif line.startswith("data: "):
            payload = json.loads(line.replace("data: ", "").strip())
            data_payloads.append(payload)

    # Assert 10 events were emitted
    assert len(data_payloads) == 10
    assert len(event_names) == 10

    # Assert agent progression
    agents = [p.get("agent") for p in data_payloads]
    assert "policy_parser" in agents
    assert "bill_reader" in agents
    assert "rules_engine" in agents
    assert "explainer" in agents
    assert "appeal_drafter" in agents

    # Assert forecast_ready and appeal_ready payloads
    forecast_item = next(p for p in data_payloads if p.get("event") == "forecast_ready")
    assert forecast_item["data"]["insurerPays"] == 108500
    assert forecast_item["data"]["youPay"] == 41500

    appeal_item = next(p for p in data_payloads if p.get("event") == "appeal_ready")
    assert appeal_item["data"]["overDeductionAmount"] == 9750
