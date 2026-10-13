import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.models import *
from backend.seed import seed_database
from backend.security import SecurityHeadersMiddleware, limiter

from backend.routers import (
    auth,
    quotes,
    carriers,
    orders,
    disputes,
    privacy,
    maps,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("caribe_express.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("SQLAlchemy tables initialized successfully.")
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API de Caribe Express: Plataforma de Mudanzas y Logística con Cotizador Algorítmico, Geolocalización y Control RBAC.",
    lifespan=lifespan
)

# SlowAPI Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware (XSS, CSRF, Clickjacking protection)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(quotes.router, prefix=settings.API_V1_STR)
app.include_router(carriers.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(disputes.router, prefix=settings.API_V1_STR)
app.include_router(privacy.router, prefix=settings.API_V1_STR)
app.include_router(maps.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "regulations": "Ley 1581 de 2012 (Colombia) / GDPR Compliant",
        "region": "Región Caribe Colombiana"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

