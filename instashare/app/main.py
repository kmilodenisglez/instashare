# !/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.auth import router as auth_router
from dotenv import load_dotenv
import os

# load environment variables from .env
load_dotenv()

app = FastAPI(
    title='Instashare DFS API',
    redoc_url=None,
    version='1.0.0',
    description='Instashare DFS API',
    contact={
        'name': 'Instashare',
        # 'url': '',
        'email': 'kmilo.denis.glez@gmail.com'
    }
)

# session middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "default_secret_key"))

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to Instashare DFS API"} 