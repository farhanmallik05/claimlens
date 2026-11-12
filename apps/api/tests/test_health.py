"""
Health check integration tests alias for ClaimLens API.
"""

from .test_healthz import test_healthz_status_code, test_healthz_payload

__all__ = ["test_healthz_status_code", "test_healthz_payload"]
