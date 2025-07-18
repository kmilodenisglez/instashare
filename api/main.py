#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
import redis.asyncio as redis
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse

from api.database import create_tables
from api.routers import auth_router, file_router

# Load environment variables from .env
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan for startup/shutdown events."""
    create_tables()

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")

    yield  # App is running here

    # Optional: Clean shutdown
    # await redis_client.close()  # Uncomment if using persistent redis connection


app = FastAPI(
    title="Instashare DFS API",
    version="1.0.0",
    redoc_url=None,
    description="Instashare DFS API",
    contact={"name": "Instashare", "email": "kmilo.denis.glez@gmail.com"},
    lifespan=lifespan,
)

# Session Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "default_secret_key"),
)

# CORS Middleware (Development + Production domains)
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

# Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(file_router, prefix="/api/v1")

# Health check / root endpoint
@app.get("/api/v1", response_class=JSONResponse)
def read_root() -> dict:
    return {"message": "Welcome to Instashare DFS API"}
