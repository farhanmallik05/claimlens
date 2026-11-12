"""
Health check integration tests for ClaimLens API.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_healthz_status_code():
    """Verify /healthz returns HTTP 200 OK."""
    response = client.get("/healthz")
    assert response.status_code == 200


def test_healthz_payload():
    """Verify /healthz returns exact contract status 'ok'."""
    response = client.get("/healthz")
    data = response.json()
    assert data == {"status": "ok"}
    assert data.get("status") == "ok"
