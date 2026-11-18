import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Caribe Express API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database - MongoDB (Base de datos exclusiva)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "caribe_express")
    
    # JWT & Auth (Hardened for Web & Flutter Mobile Apps)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "caribe-express-super-secret-key-prod-2026-mudanzas")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30 # 30 days for mobile app session longevity
    
    # Google Maps Platform (Places Autocomplete, Distance Matrix, Directions API)
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:80",
        "*"
    ]
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

