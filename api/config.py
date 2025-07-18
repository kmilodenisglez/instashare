from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global settings configuration using environment variables"""

    OUTPUT_DIR: str = Field(
        default="/output", description="Directory where output files will be written"
    )

    # Database configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./output/instashare.db",
        description="Database connection URL",
    )

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = Field(
        default=None, description="Google OAuth client ID"
    )

    GOOGLE_CLIENT_SECRET: Optional[str] = Field(
        default=None, description="Google OAuth client secret"
    )

    # Session
    SESSION_SECRET_KEY: str = Field(
        default="default_secret_key", description="Secret key for sessions"
    )

    # Optional, required if using https://pinata.cloud (IPFS pinning service)
    PINATA_API_KEY: Optional[str] = Field(default=None, description="Pinata API key")

    PINATA_API_SECRET: Optional[str] = Field(
        default=None, description="Pinata API secret"
    )

    IPFS_GATEWAY_URL: str = Field(
        default="https://gateway.pinata.cloud/ipfs",
        description="IPFS gateway URL for accessing uploaded files. Recommended to use own dedicated gateway to avoid congestion and rate limiting. Example: 'https://ipfs.my-dao.org/ipfs' (Note: won't work for third-party files)",
    )

    REDIS_URL: Optional[str] = Field(
        default="redis://localhost:6379", description="Redis URL for caching and Celery"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
