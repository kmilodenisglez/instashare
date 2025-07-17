"""
Models package - SQLAlchemy database models
"""

# Import Base first
from .base import Base
from .file import File

# Import models in the correct order to avoid relationship problems
from .user import User


# Ensure all relationships are configured
def configure_mappers():
    """Configure all SQLAlchemy mappers"""
    from sqlalchemy.orm import configure_mappers

    configure_mappers()


__all__ = ["Base", "User", "File", "configure_mappers"]
