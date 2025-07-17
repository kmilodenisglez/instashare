import os

from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.database import get_db
from api.models import User

# load environment variables from .env
load_dotenv()

router = APIRouter()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/login")
async def login(request: Request, redirect_uri: str = "http://localhost:3000/"):
    # Save redirect_uri in session
    request.session["redirect_uri"] = redirect_uri
    redirect_uri_backend = request.url_for("auth_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri_backend)


@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "logged out"}

@router.get("/callback/google")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(400, "Could not get userinfo")

    # Check if user exists
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(email=user_info["email"], name=user_info.get("name"))
        db.add(user)
        db.commit()
        db.refresh(user)

    request.session["user"] = {"id": user.id, "email": user.email, "name": user.name}

    # Redirect back to frontend
    redirect_uri = request.session.get("redirect_uri", "http://localhost:3000/")
    return RedirectResponse(url=redirect_uri)


@router.post("/test-login")
async def test_login(request: Request):
    # Simulate a user login for testing
    request.session["user"] = {"id": 1, "email": "test@example.com", "name": "Test"}
    return {"message": "logged in"}
