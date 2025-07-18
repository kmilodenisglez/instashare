import uuid
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

# Invalid passwords with the expected error
invalid_passwords = [
    ("short", "Password must be at least 8 characters long"),
    ("nouppercase1!", "Password must contain at least one uppercase letter"),
    ("NOLOWERCASE1!", "Password must contain at least one lowercase letter"),
    ("NoNumber!", "Password must contain at least one number"),
    ("NoSpecial1", "Password must contain at least one special character"),
]

@pytest.mark.parametrize("password,expected_detail", invalid_passwords)
def test_password_strength_validation(password, expected_detail):
    unique_email = f"invalid_pw_{uuid.uuid4()}@example.com"
    response = client.post("/auth/register", data={
        "email": unique_email,
        "password": password,
        "name": "Weak Password User"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == expected_detail


def test_valid_password_registration():
    unique_email = f"valid_pw_{uuid.uuid4()}@example.com"
    response = client.post("/auth/register", data={
        "email": unique_email,
        "password": "Str0ng!Pass",
        "name": "Strong Password User"
    })
    assert response.status_code == 200
    assert "user" in response.json()
