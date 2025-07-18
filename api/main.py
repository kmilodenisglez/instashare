# !/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from api.database import create_tables
from api.routers import auth_router, file_router

# load environment variables from .env
load_dotenv()

# Create tables at application startup
create_tables()

app = FastAPI(
    title="Instashare DFS API",
    redoc_url=None,
    version="1.0.0",
    description="Instashare DFS API",
    contact={
        "name": "Instashare",
        # 'url': '',
        "email": "kmilo.denis.glez@gmail.com",
    },
)

# session middleware
app.add_middleware(
    SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "default_secret_key")
)

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://instashare-qba.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(file_router, prefix="/api/v1")


@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to Instashare DFS API"}
