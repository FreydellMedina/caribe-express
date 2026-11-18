import logging
from backend.mongodb import get_mongo_db, init_mongo_db

logger = logging.getLogger("caribe_express.database")

def get_db():
    """
    FastAPI dependency providing the active MongoDB database instance
    connected to localhost:27017 (database: caribe_express).
    """
    return get_mongo_db()
