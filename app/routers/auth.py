from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from app.models import User
from app.database import get_db

# load environment variables from .env
load_dotenv()

router = APIRouter()

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth_callback')
    print("REDIRECT URI:", redirect_uri)
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/callback/google')
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')

    if not user_info:
        raise HTTPException(400, "Could not get userinfo")

    # Check if user exists
    user = db.query(User).filter(User.email == user_info['email']).first()
    if not user:
        user = User(email=user_info['email'], name=user_info.get('name'))
        db.add(user)
        db.commit()
        db.refresh(user)

    request.session['user'] = {'id': user.id, 'email': user.email, 'name': user.name}

    return {
        "message": "Welcome",
        "user": request.session['user']
    }
