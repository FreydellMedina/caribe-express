import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Caribe Express API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres.ucrepfkdtahuqyfohsla:Thegreen098123.@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    )
    DIRECT_URL: str = os.getenv(
        "DIRECT_URL",
        "postgresql://postgres.ucrepfkdtahuqyfohsla:Thegreen098123.@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    )
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "caribe-express-super-secret-key-prod-2026-mudanzas")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
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

