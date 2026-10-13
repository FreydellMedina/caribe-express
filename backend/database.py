import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import settings

logger = logging.getLogger("caribe_express.database")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL.strip()
    
    # Remove prisma pgbouncer parameter if present (not recognized by psycopg2)
    db_url = db_url.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")
    
    # Remove bracket wrapper from password if present (e.g. :[password]@ -> :password@)
    import re
    db_url = re.sub(r':\[(.*?)\]@', r':\1@', db_url)

    # Ensure correct driver prefix for psycopg2
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+psycopg2://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    # Try connecting to primary PostgreSQL
    try:
        connect_args = {}
        if "postgresql" in db_url:
            connect_args["sslmode"] = "require"
            connect_args["connect_timeout"] = 4
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args=connect_args
            )
            # Test connection
            with engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL (Supabase)")
            return engine
    except Exception as e:
        logger.warning(f"Failed to connect to primary PostgreSQL database: {e}. Falling back to SQLite local database.")

    
    # Fallback SQLite
    sqlite_url = "sqlite:///./caribe_express.db"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
