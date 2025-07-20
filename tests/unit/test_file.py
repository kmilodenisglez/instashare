
import io
from fastapi.testclient import TestClient
from api.main import app
from tests.integration.test_auth_and_files_improved import generate_user_data, setup_test_user

client = TestClient(app)
def test_upload_file_no_file(setup_test_user):
    cookies, _ = setup_test_user
    response = client.post("/api/v1/files/upload", files={}, cookies=cookies)
    assert response.status_code in (400, 422)

def test_download_file_not_found(setup_test_user):
    cookies, _ = setup_test_user
    response = client.get("/api/v1/files/999999/download", cookies=cookies)
    assert response.status_code == 404

def test_download_zip_file_not_found(setup_test_user):
    cookies, _ = setup_test_user
    response = client.get("/api/v1/files/999999/download_zip", cookies=cookies)
    assert response.status_code == 404

def test_rename_file_not_found(setup_test_user):
    cookies, _ = setup_test_user
    response = client.patch("/api/v1/files/999999/rename", params={"new_name": "fail.txt"}, cookies=cookies)
    assert response.status_code == 404

def test_download_file_other_user(setup_test_user):
    cookies1, _ = setup_test_user
    file_data = {"uploaded_file": ("test.txt", io.BytesIO(b"secret"), "text/plain")}
    resp = client.post("/api/v1/files/upload", files=file_data, cookies=cookies1)
    file_id = resp.json()["id"]
    user2 = generate_user_data()
    client.post("/auth/register", data=user2)
    login2 = client.post("/auth/login", data={"email": user2["email"], "password": user2["password"]})
    cookies2 = login2.cookies
    response = client.get(f"/api/v1/files/{file_id}/download", cookies=cookies2)
    assert response.status_code == 404

def test_rename_file_other_user(setup_test_user):
    cookies1, _ = setup_test_user
    file_data = {"uploaded_file": ("test.txt", io.BytesIO(b"secret"), "text/plain")}
    resp = client.post("/api/v1/files/upload", files=file_data, cookies=cookies1)
    file_id = resp.json()["id"]
    user2 = generate_user_data()
    client.post("/auth/register", data=user2)
    login2 = client.post("/auth/login", data={"email": user2["email"], "password": user2["password"]})
    cookies2 = login2.cookies
    response = client.patch(f"/api/v1/files/{file_id}/rename", params={"new_name": "hacked.txt"}, cookies=cookies2)
    assert response.status_code == 404

def test_download_zip_file_other_user(setup_test_user):
    cookies1, _ = setup_test_user
    file_data = {"uploaded_file": ("test.txt", io.BytesIO(b"secret"), "text/plain")}
    resp = client.post("/api/v1/files/upload", files=file_data, cookies=cookies1)
    file_id = resp.json()["id"]
    user2 = generate_user_data()
    client.post("/auth/register", data=user2)
    login2 = client.post("/auth/login", data={"email": user2["email"], "password": user2["password"]})
    cookies2 = login2.cookies
    response = client.get(f"/api/v1/files/{file_id}/download_zip", cookies=cookies2)
    assert response.status_code == 404