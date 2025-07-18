import os

from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from api.database import get_db
from api.models import User
from api.utils import hash_password, verify_password
from api.utils.validators import validate_password

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
async def google_login(request: Request, redirect_uri: str = "http://localhost:3000/"):
    # Save redirect_uri in session
    request.session["redirect_uri"] = redirect_uri
    redirect_uri_backend = request.url_for("auth_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri_backend)


@router.post("/register")
async def register(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(None),
    db: Session = Depends(get_db)
):
    # Password validation
    validate_password(password)
    
    # Check if user already exists using modern SQLAlchemy syntax
    existing_user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=email, name=name, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    # Optionally log in the user after registration
    request.session["user"] = {"id": user.id, "email": user.email, "name": user.name}
    return {"message": "User registered", "user": {"id": user.id, "email": user.email, "name": user.name}}

@router.post("/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or user.hashed_password is None or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    request.session["user"] = {"id": user.id, "email": user.email, "name": user.name}
    return {"message": "Logged in", "user": {"id": user.id, "email": user.email, "name": user.name}}

@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}


@router.get("/me")
async def get_me(request: Request):
    user = request.session.get("user")
    if not user:
        return {"authenticated": False}
    return {"authenticated": True, "user": user}


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
