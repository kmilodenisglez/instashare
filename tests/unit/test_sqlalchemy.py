import uuid
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_register_db_error(monkeypatch):
    # Mock the commit method to throw an exception
    with patch("api.database.SessionLocal") as mock_session:
        mock_db = MagicMock()
        mock_db.commit.side_effect = Exception("DB error")
        mock_session.return_value = mock_db

        response = client.post(f"/auth/register", data={
            "email": f"faildb_{uuid.uuid4()}@example.com",
            "password": "B@j0Mund1",
            "name": "Test"
        })
        # Wait for a 500 error or whatever code you handle in your backend
        assert response.status_code in (400, 500)
        assert "Email already registered" in response.text or "DB" in response.text