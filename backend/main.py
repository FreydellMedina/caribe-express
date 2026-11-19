import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.config import settings
from backend.mongodb import init_mongo_db, get_mongo_db
from backend.security import SecurityHeadersMiddleware, limiter

from backend.routers import (
    auth,
    quotes,
    carriers,
    orders,
    disputes,
    privacy,
    maps,
    predictions,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("caribe_express.main")

def setup_mongodb():
    """Initializes MongoDB database synchronously and seeds initial collections."""
    try:
        init_mongo_db()
        logger.info("MongoDB database verified, connected and seeded successfully.")
    except Exception as e:
        logger.error(f"MongoDB initialization error: {e}")

# Run database setup immediately on module load
setup_mongodb()

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_mongodb()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API de Caribe Express: Plataforma de Mudanzas y Logística con Cotizador Algorítmico, Geolocalización y Control RBAC (MongoDB nativo).",
    lifespan=lifespan
)

# SlowAPI Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware (XSS, CSRF, Clickjacking protection)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Middleware (permitir Web y Flutter Mobile)
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
app.include_router(predictions.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "database": "mongodb",
        "docs_url": "/docs",
        "regulations": "Ley 1581 de 2012 (Colombia) / GDPR Compliant",
        "region": "Región Caribe Colombiana"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "mongodb (localhost:27017)",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Alias for Vite proxy: /api/v1/health → backend /api/v1/health
@app.get("/api/v1/health")
def health_check_v1():
    return {
        "status": "healthy",
        "database": "mongodb (localhost:27017)",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
