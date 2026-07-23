"""
Database configuration.

Locally this defaults to SQLite (zero setup, great for development/demo).
In production (e.g. on EC2), set the DATABASE_URL environment variable to
point at an AWS RDS Postgres instance, e.g.:

    DATABASE_URL=postgresql://user:password@your-rds-endpoint.rds.amazonaws.com:5432/taskdb

No code changes needed to switch — SQLAlchemy handles both.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tasktracker.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
