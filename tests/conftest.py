import pytest
from starlette.testclient import TestClient
from api.main import app

@pytest.fixture(scope="session")
def client():
    """Fixture for FastAPI TestClient."""
    with TestClient(app) as c:
        yield c 