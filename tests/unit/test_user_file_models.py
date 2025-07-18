from api.models.file import File
from api.models.user import User

def test_file_model_methods():
    f = File(id=1, filename="a.txt", user_id=1, size=123, status="ok", ipfs_hash="hash", created_at=None, updated_at=None)
    assert f.filename == "a.txt"

def test_user_model_methods():
    u = User(id=1, email="a@b.com", name="Test", hashed_password="pw")
    assert u.email == "a@b.com"