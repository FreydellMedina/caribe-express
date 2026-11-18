import logging
from typing import Optional, Dict, Any, List
import pymongo
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

from backend.config import settings

logger = logging.getLogger("caribe_express.mongodb")

_client: Optional[MongoClient] = None
_db = None
_is_mock: bool = False

def serialize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Converts MongoDB internal _id to standard string id for JSON/Pydantic serialization."""
    if not doc:
        return None
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res["_id"]) if "id" not in res else res["id"]
        res.pop("_id", None)
    return res

def serialize_mongo_list(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_mongo_doc(d) for d in docs if d is not None]

def init_mongo_db():
    """
    Initializes the MongoDB connection to localhost:27017 (or settings.MONGODB_URL).
    If MongoDB is available, connects to it and configures indexes.
    If the daemon is offline, falls back gracefully to mongomock for continuous operation.
    """
    global _client, _db, _is_mock

    mongo_uri = settings.MONGODB_URL
    db_name = settings.MONGODB_DB_NAME

    try:
        # Attempt connecting to native MongoDB at localhost:27017
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=1200,
            connectTimeoutMS=1200
        )
        # Test server connection with ping
        client.admin.command('ping')
        _client = client
        _db = _client[db_name]
        _is_mock = False
        logger.info(f"Connected to native MongoDB server at {mongo_uri} (database: '{db_name}')")
    except Exception as exc:
        logger.warning(
            f"Could not connect to native MongoDB at {mongo_uri} ({exc}). "
            f"Using mongomock in-memory engine for seamless development/testing."
        )
        import mongomock
        _client = mongomock.MongoClient()
        _db = _client[db_name]
        _is_mock = True
        logger.info(f"Initialized in-memory MongoDB engine for '{db_name}'.")

    # Create Indexes
    try:
        _db.users.create_index([("email", pymongo.ASCENDING)], unique=True)
        _db.move_orders.create_index([("tracking_code", pymongo.ASCENDING)], unique=True)
        _db.carrier_profiles.create_index([("user_id", pymongo.ASCENDING)], unique=True)
        _db.carrier_profiles.create_index([("base_city", pymongo.ASCENDING)])
    except Exception as idx_err:
        logger.debug(f"Index creation note: {idx_err}")

    # Seed initial documents
    seed_mongo_database(_db)

    return _db

def get_mongo_db():
    """FastAPI Dependency for accessing MongoDB collection database."""
    global _db
    if _db is None:
        init_mongo_db()
    return _db

def seed_mongo_database(db):
    """Populates MongoDB with comprehensive realistic Caribbean express logistics data."""
    from backend.security import get_password_hash

    # Check if users already exist
    count = db.users.count_documents({})
    if count > 0:
        return

    logger.info("Seeding realistic database records into MongoDB...")

    # 1. UNICO REGISTRO DE ADMINISTRADOR
    admin_user = {
        "_id": "usr-admin-1",
        "id": "usr-admin-1",
        "email": "admin@caribeexpress.co",
        "hashed_password": get_password_hash("AdminCaribe2026!"),
        "full_name": "Carlos Valderrama (Admin Caribe Express)",
        "phone": "+57 300 999 8877",
        "role": "admin",
        "is_active": True,
        "created_at": "2026-10-01T08:00:00Z"
    }

    # 2. CLIENTES REGISTRADOS CON HISTORIAL REAL
    clients_seed = [
        {
            "_id": "usr-client-1",
            "id": "usr-client-1",
            "email": "cliente@caribeexpress.co",
            "hashed_password": get_password_hash("Cliente2026!"),
            "full_name": "María Alejandra Restrepo",
            "phone": "+57 301 849 2011",
            "role": "cliente",
            "is_active": True,
            "created_at": "2026-10-10T11:00:00Z"
        },
        {
            "_id": "usr-client-2",
            "id": "usr-client-2",
            "email": "andres.mendoza@gmail.com",
            "hashed_password": get_password_hash("Cliente2026!"),
            "full_name": "Andrés Felipe Mendoza",
            "phone": "+57 312 450 8821",
            "role": "cliente",
            "is_active": True,
            "created_at": "2026-10-12T14:30:00Z"
        },
        {
            "_id": "usr-client-3",
            "id": "usr-client-3",
            "email": "valentina.char@costa.co",
            "hashed_password": get_password_hash("Cliente2026!"),
            "full_name": "Valentina Char Arboleda",
            "phone": "+57 305 712 9940",
            "role": "cliente",
            "is_active": True,
            "created_at": "2026-10-15T09:15:00Z"
        },
        {
            "_id": "usr-client-4",
            "id": "usr-client-4",
            "email": "david.cardenas@valledupar.co",
            "hashed_password": get_password_hash("Cliente2026!"),
            "full_name": "David Eduardo Cárdenas",
            "phone": "+57 318 642 1199",
            "role": "cliente",
            "is_active": True,
            "created_at": "2026-10-18T16:00:00Z"
        },
        {
            "_id": "usr-client-5",
            "id": "usr-client-5",
            "email": "camila.daza@sinu.co",
            "hashed_password": get_password_hash("Cliente2026!"),
            "full_name": "Camila Sofía Daza",
            "phone": "+57 320 981 7733",
            "role": "cliente",
            "is_active": True,
            "created_at": "2026-10-22T10:45:00Z"
        }
    ]

    # 3. TRANSPORTISTAS REGISTRADOS (LABORANDO Y CON RUTAS)
    carrier_users_seed = [
        {
            "_id": "usr-carrier-1",
            "id": "usr-carrier-1",
            "email": "operaciones@transportesdelcaribe.com.co",
            "hashed_password": get_password_hash("Carrier2026!"),
            "full_name": "Jairo Mendoza Cárdenas",
            "phone": "+57 301 542 9811",
            "role": "transportista",
            "is_active": True,
            "created_at": "2026-09-15T08:00:00Z"
        },
        {
            "_id": "usr-carrier-2",
            "id": "usr-carrier-2",
            "email": "contacto@mudanzaslaheroica.com",
            "hashed_password": get_password_hash("Heroica2026!"),
            "full_name": "Roberto Gómez Bolivariano",
            "phone": "+57 315 782 1190",
            "role": "transportista",
            "is_active": True,
            "created_at": "2026-09-20T10:00:00Z"
        },
        {
            "_id": "usr-carrier-3",
            "id": "usr-carrier-3",
            "email": "gerencia@fletestayrona.com",
            "hashed_password": get_password_hash("Carrier2026!"),
            "full_name": "Álvaro José De la Espriella",
            "phone": "+57 310 443 2299",
            "role": "transportista",
            "is_active": True,
            "created_at": "2026-09-25T11:00:00Z"
        },
        {
            "_id": "usr-carrier-4",
            "id": "usr-carrier-4",
            "email": "mudanzas@rapidosdelsinu.com",
            "hashed_password": get_password_hash("Carrier2026!"),
            "full_name": "Guillermo Peñaloza",
            "phone": "+57 314 887 6620",
            "role": "transportista",
            "is_active": True,
            "created_at": "2026-10-02T12:00:00Z"
        },
        {
            "_id": "usr-carrier-5",
            "id": "usr-carrier-5",
            "email": "nelson.miranda@cootranscosta.co",
            "hashed_password": get_password_hash("Carrier2026!"),
            "full_name": "Nelson Enrique Miranda",
            "phone": "+57 317 229 0011",
            "role": "transportista",
            "is_active": True,
            "created_at": "2026-10-05T09:00:00Z"
        }
    ]

    all_users = [admin_user] + clients_seed + carrier_users_seed
    db.users.insert_many(all_users)

    # 4. PERFILES DETALLADOS DE TRANSPORTISTAS Y FLOTAS
    carriers_seed = [
        {
            "_id": "car-1",
            "id": "car-1",
            "user_id": "usr-carrier-1",
            "company_name": "Transportes del Caribe S.A.S.",
            "document_id": "901.442.819-3",
            "phone": "+57 301 542 9811",
            "email": "operaciones@transportesdelcaribe.com.co",
            "base_city": "Barranquilla",
            "coverage_zones": ["Barranquilla", "Cartagena", "Santa Marta", "Valledupar"],
            "vehicle_type": "camion_turbo",
            "vehicle_plate": "WLZ-832",
            "vehicle_model": "Chevrolet NHR Turbo 2023 con Furgón Aislado",
            "capacity_kg": 4500,
            "volume_m3": 24.0,
            "base_price": 180000.0,
            "price_per_km": 2800.0,
            "floor_without_elevator_surcharge": 25000.0,
            "helper_rate": 45000.0,
            "rating": 4.95,
            "total_trips": 184,
            "verification_status": "verificado",
            "photo_url": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "bio": "Empresa familiar líder en mudanzas seguras en toda la Costa Atlántica. Personal uniformado, mantas térmicas y póliza todo riesgo.",
            "available_now": True,
            "total_earnings": 18500000.0,
            "documents": [
                {
                    "id": "doc-1",
                    "name": "Registro Único Tributario (RUT)",
                    "type": "rut",
                    "status": "aprobado",
                    "file_name": "RUT_Transportes_Caribe_2026.pdf",
                    "expiry_date": "Indefinida"
                },
                {
                    "id": "doc-2",
                    "name": "Póliza SOAT Vigente",
                    "type": "soat",
                    "status": "aprobado",
                    "file_name": "SOAT_WLZ832_2026.pdf",
                    "expiry_date": "2026-11-30"
                },
                {
                    "id": "doc-3",
                    "name": "Licencia de Conducción C2",
                    "type": "licencia",
                    "status": "aprobado",
                    "file_name": "Licencia_Jairo_Mendoza_C2.pdf",
                    "expiry_date": "2028-05-15"
                }
            ]
        },
        {
            "_id": "car-2",
            "id": "car-2",
            "user_id": "usr-carrier-2",
            "company_name": "Mudanzas Rápidas La Heroica",
            "document_id": "800.119.324-1",
            "phone": "+57 315 782 1190",
            "email": "contacto@mudanzaslaheroica.com",
            "base_city": "Cartagena",
            "coverage_zones": ["Cartagena", "Barranquilla", "Sincelejo", "Montería"],
            "vehicle_type": "furgon",
            "vehicle_plate": "UVR-419",
            "vehicle_model": "Renault Master 2022 Furgón Cerrado",
            "capacity_kg": 3200,
            "volume_m3": 18.0,
            "base_price": 140000.0,
            "price_per_km": 2400.0,
            "floor_without_elevator_surcharge": 20000.0,
            "helper_rate": 40000.0,
            "rating": 4.78,
            "total_trips": 92,
            "verification_status": "en_revision",
            "photo_url": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            "bio": "Especialistas en mudanzas residenciales en el Centro Histórico, Bocagrande y Castillogrande con permisos de tránsito.",
            "available_now": True,
            "total_earnings": 9100000.0,
            "documents": [
                {
                    "id": "doc-4",
                    "name": "RUT Empresa",
                    "type": "rut",
                    "status": "aprobado",
                    "file_name": "RUT_LaHeroica_2026.pdf",
                    "expiry_date": "Indefinida"
                },
                {
                    "id": "doc-5",
                    "name": "Póliza SOAT",
                    "type": "soat",
                    "status": "en_revision",
                    "file_name": "SOAT_UVR419_Renovacion.pdf",
                    "expiry_date": "2026-10-15"
                }
            ]
        },
        {
            "_id": "car-3",
            "id": "car-3",
            "user_id": "usr-carrier-3",
            "company_name": "Fletes y Mudanzas Tayrona Express",
            "document_id": "900.871.205-8",
            "phone": "+57 310 443 2299",
            "email": "gerencia@fletestayrona.com",
            "base_city": "Santa Marta",
            "coverage_zones": ["Santa Marta", "Barranquilla", "Riohacha", "Valledupar", "Maicao"],
            "vehicle_type": "camion_grande",
            "vehicle_plate": "TTK-902",
            "vehicle_model": "Hino 500 Doble Troque con Rampa Hidráulica",
            "capacity_kg": 8500,
            "volume_m3": 36.0,
            "base_price": 310000.0,
            "price_per_km": 3400.0,
            "floor_without_elevator_surcharge": 30000.0,
            "helper_rate": 50000.0,
            "rating": 4.88,
            "total_trips": 142,
            "verification_status": "verificado",
            "photo_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            "bio": "Especialistas en mudanzas de gran volumen y traslados corporativos por la Troncal del Caribe. Rampa hidráulica para pianos y motos.",
            "available_now": True,
            "total_earnings": 24800000.0,
            "documents": [
                {
                    "id": "doc-6",
                    "name": "RUT Empresa",
                    "type": "rut",
                    "status": "aprobado",
                    "file_name": "RUT_Tayrona_2026.pdf",
                    "expiry_date": "Indefinida"
                },
                {
                    "id": "doc-7",
                    "name": "Póliza SOAT",
                    "type": "soat",
                    "status": "aprobado",
                    "file_name": "SOAT_TTK902_2026.pdf",
                    "expiry_date": "2027-01-20"
                },
                {
                    "id": "doc-8",
                    "name": "Licencia C3",
                    "type": "licencia",
                    "status": "aprobado",
                    "file_name": "Licencia_Alvaro_DelaEspriella_C3.pdf",
                    "expiry_date": "2028-11-10"
                }
            ]
        },
        {
            "_id": "car-4",
            "id": "car-4",
            "user_id": "usr-carrier-4",
            "company_name": "Mudanzas Rápidas Del Sinú",
            "document_id": "1067891234",
            "phone": "+57 314 887 6620",
            "email": "mudanzas@rapidosdelsinu.com",
            "base_city": "Montería",
            "coverage_zones": ["Montería", "Sincelejo", "Cartagena", "Lorica", "Montelíbano"],
            "vehicle_type": "pickup",
            "vehicle_plate": "QRT-315",
            "vehicle_model": "Nissan Frontier Estacas 4x4",
            "capacity_kg": 1500,
            "volume_m3": 7.5,
            "base_price": 105000.0,
            "price_per_km": 2100.0,
            "floor_without_elevator_surcharge": 18000.0,
            "helper_rate": 35000.0,
            "rating": 4.82,
            "total_trips": 67,
            "verification_status": "verificado",
            "photo_url": "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            "bio": "Mudanzas express y traslados ágiles para apartamentos y apartaestudios en Córdoba y Sucre.",
            "available_now": True,
            "total_earnings": 6400000.0,
            "documents": [
                {
                    "id": "doc-9",
                    "name": "RUT Persona Natural",
                    "type": "rut",
                    "status": "aprobado",
                    "file_name": "RUT_Guillermo_Penaloza.pdf",
                    "expiry_date": "Indefinida"
                },
                {
                    "id": "doc-10",
                    "name": "Póliza SOAT",
                    "type": "soat",
                    "status": "aprobado",
                    "file_name": "SOAT_QRT315.pdf",
                    "expiry_date": "2026-12-15"
                }
            ]
        },
        {
            "_id": "car-5",
            "id": "car-5",
            "user_id": "usr-carrier-5",
            "company_name": "Cootranscosta Mudanzas Intermunicipales",
            "document_id": "890.312.449-1",
            "phone": "+57 317 229 0011",
            "email": "nelson.miranda@cootranscosta.co",
            "base_city": "Valledupar",
            "coverage_zones": ["Valledupar", "Barranquilla", "Santa Marta", "Bucaramanga", "Bosconia"],
            "vehicle_type": "camion_turbo",
            "vehicle_plate": "WKN-608",
            "vehicle_model": "Isuzu NPR 2021 con Furgón de Aluminio",
            "capacity_kg": 4800,
            "volume_m3": 26.0,
            "base_price": 175000.0,
            "price_per_km": 2750.0,
            "floor_without_elevator_surcharge": 22000.0,
            "helper_rate": 42000.0,
            "rating": 4.91,
            "total_trips": 115,
            "verification_status": "en_revision",
            "photo_url": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
            "bio": "Cooperativa con 15 años conectando el Cesar con el Atlántico y Magdalena. Conductores certificados y monitoreo constante.",
            "available_now": True,
            "total_earnings": 15200000.0,
            "documents": [
                {
                    "id": "doc-11",
                    "name": "RUT Cooperativa",
                    "type": "rut",
                    "status": "aprobado",
                    "file_name": "RUT_Cootranscosta.pdf",
                    "expiry_date": "Indefinida"
                },
                {
                    "id": "doc-12",
                    "name": "Tarjeta de Operación",
                    "type": "tarjeta_operacion",
                    "status": "aprobado",
                    "file_name": "Tarjeta_Operacion_WKN608.pdf",
                    "expiry_date": "2027-04-10"
                },
                {
                    "id": "doc-13",
                    "name": "Revisión Técnico-Mecánica",
                    "type": "tecnomecanica",
                    "status": "rechazado",
                    "file_name": "Tecno_WKN608_Ilegible.pdf",
                    "expiry_date": "2026-10-01",
                    "feedback": "El documento adjunto está borroso. Por favor subir imagen escaneada en alta resolución."
                }
            ]
        }
    ]
    db.carrier_profiles.insert_many(carriers_seed)

    # 5. ORDENES DE MUDANZA EN DIVERSOS ESTADOS
    orders_seed = [
        {
            "_id": "ord-101",
            "id": "ord-101",
            "tracking_code": "CRB-84920",
            "client_id": "usr-client-1",
            "client_name": "María Alejandra Restrepo",
            "client_phone": "+57 301 849 2011",
            "carrier_id": "car-1",
            "carrier_name": "Transportes del Caribe S.A.S.",
            "carrier_phone": "+57 301 542 9811",
            "carrier_vehicle_plate": "WLZ-832",
            "origin_city": "Barranquilla",
            "origin_address": "Carrera 53 # 82-140, Alto Prado, Apto 402",
            "origin_floor": 4,
            "origin_elevator": True,
            "dest_city": "Cartagena",
            "dest_address": "Avenida San Martín # 6-32, Bocagrande, Torre 2",
            "dest_floor": 8,
            "dest_elevator": True,
            "property_type": "apartamento",
            "distance_km": 118.0,
            "estimated_minutes": 120,
            "total_volume_m3": 14.5,
            "helpers_count": 2,
            "total_price": 585000.0,
            "status": "en_ruta",
            "scheduled_date": "2026-11-18",
            "scheduled_time": "08:00 AM",
            "notes": "Mercancía delicada (vajilla y cuadros). Requiere vinipel extra.",
            "created_at": "2026-11-18T07:30:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "18 Nov, 07:30 AM",
                    "title": "Cotización Generada",
                    "description": "Ruta Barranquilla → Cartagena calculada exitosamente."
                },
                {
                    "status": "asignado",
                    "timestamp": "18 Nov, 08:15 AM",
                    "title": "Transportista Confirmado",
                    "description": "Transportes del Caribe S.A.S. aceptó la mudanza."
                },
                {
                    "status": "cargando",
                    "timestamp": "18 Nov, 09:00 AM",
                    "title": "Carga en Alto Prado",
                    "description": "Enseres protegidos con mantas y estibados en camión WLZ-832."
                },
                {
                    "status": "en_ruta",
                    "timestamp": "18 Nov, 10:45 AM",
                    "title": "En Tránsito por Vía al Mar",
                    "description": "Paso por peaje Puerto Colombia con monitoreo GPS activo."
                }
            ]
        },
        {
            "_id": "ord-102",
            "id": "ord-102",
            "tracking_code": "CRB-19402",
            "client_id": "usr-client-2",
            "client_name": "Andrés Felipe Mendoza",
            "client_phone": "+57 312 450 8821",
            "carrier_id": "car-2",
            "carrier_name": "Mudanzas Rápidas La Heroica",
            "carrier_phone": "+57 315 782 1190",
            "carrier_vehicle_plate": "UVR-419",
            "origin_city": "Cartagena",
            "origin_address": "Calle del Torno # 39-12, San Diego",
            "origin_floor": 2,
            "origin_elevator": False,
            "dest_city": "Santa Marta",
            "dest_address": "Carrera 1 # 18-40, El Rodadero",
            "dest_floor": 3,
            "dest_elevator": True,
            "property_type": "apartamento",
            "distance_km": 228.0,
            "estimated_minutes": 240,
            "total_volume_m3": 12.0,
            "helpers_count": 2,
            "total_price": 790000.0,
            "status": "cargando",
            "scheduled_date": "2026-11-18",
            "scheduled_time": "10:30 AM",
            "notes": "Incluye juego de comedor de roble y cama king size.",
            "created_at": "2026-11-18T08:00:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "18 Nov, 08:00 AM",
                    "title": "Cotización Registrada",
                    "description": "Tarifa calculada con recargo de piso por escalera en origen."
                },
                {
                    "status": "asignado",
                    "timestamp": "18 Nov, 08:40 AM",
                    "title": "Servicio Asignado",
                    "description": "Conductor Roberto Gómez en camino hacia el centro histórico."
                },
                {
                    "status": "cargando",
                    "timestamp": "18 Nov, 10:15 AM",
                    "title": "Cargando en San Diego",
                    "description": "Bajando muebles por escalera con 2 auxiliares de cargue."
                }
            ]
        },
        {
            "_id": "ord-103",
            "id": "ord-103",
            "tracking_code": "CRB-55310",
            "client_id": "usr-client-3",
            "client_name": "Valentina Char Arboleda",
            "client_phone": "+57 305 712 9940",
            "carrier_id": "car-3",
            "carrier_name": "Fletes y Mudanzas Tayrona Express",
            "carrier_phone": "+57 310 443 2299",
            "carrier_vehicle_plate": "TTK-902",
            "origin_city": "Santa Marta",
            "origin_address": "Playa Salguero, Edificio Velas del Mar",
            "origin_floor": 12,
            "origin_elevator": True,
            "dest_city": "Barranquilla",
            "dest_address": "Carrera 58 # 96-45, Riomar",
            "dest_floor": 2,
            "dest_elevator": True,
            "property_type": "apartamento",
            "distance_km": 104.0,
            "estimated_minutes": 110,
            "total_volume_m3": 28.0,
            "helpers_count": 3,
            "total_price": 980000.0,
            "status": "completado",
            "scheduled_date": "2026-11-16",
            "scheduled_time": "07:00 AM",
            "notes": "Mudanza integral de casa de playa a penthouse.",
            "created_at": "2026-11-16T06:30:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "16 Nov, 06:30 AM",
                    "title": "Cotización Gran Volumen",
                    "description": "Asignado camión Hino doble troque de 36 m³."
                },
                {
                    "status": "cargando",
                    "timestamp": "16 Nov, 07:30 AM",
                    "title": "Embalaje Profesional",
                    "description": "Protección de muebles de terraza y electrodomésticos."
                },
                {
                    "status": "en_ruta",
                    "timestamp": "16 Nov, 10:00 AM",
                    "title": "Cruce Puente Pumarejo",
                    "description": "Llegada al área metropolitana de Barranquilla sin novedad."
                },
                {
                    "status": "descargando",
                    "timestamp": "16 Nov, 12:30 PM",
                    "title": "Descarga en Riomar",
                    "description": "Ubicación de mobiliario según plano del cliente."
                },
                {
                    "status": "completado",
                    "timestamp": "16 Nov, 03:00 PM",
                    "title": "Entrega Finalizada",
                    "description": "Servicio concluido a entera satisfacción. Calificación: 5 estrellas."
                }
            ]
        },
        {
            "_id": "ord-104",
            "id": "ord-104",
            "tracking_code": "CRB-77291",
            "client_id": "usr-client-4",
            "client_name": "David Eduardo Cárdenas",
            "client_phone": "+57 318 642 1199",
            "carrier_id": "car-5",
            "carrier_name": "Cootranscosta Mudanzas Intermunicipales",
            "carrier_phone": "+57 317 229 0011",
            "carrier_vehicle_plate": "WKN-608",
            "origin_city": "Valledupar",
            "origin_address": "Barrio Novalito, Manzana C Casa 8",
            "origin_floor": 1,
            "origin_elevator": True,
            "dest_city": "Barranquilla",
            "dest_address": "Carrera 46 # 74-88, El Golf",
            "dest_floor": 5,
            "dest_elevator": True,
            "property_type": "casa",
            "distance_km": 298.0,
            "estimated_minutes": 310,
            "total_volume_m3": 18.0,
            "helpers_count": 2,
            "total_price": 1150000.0,
            "status": "asignado",
            "scheduled_date": "2026-11-19",
            "scheduled_time": "06:00 AM",
            "notes": "Incluye servicio de desarmado y armado de camas.",
            "created_at": "2026-11-18T14:00:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "18 Nov, 02:00 PM",
                    "title": "Cotización Aprobada",
                    "description": "Ruta Valledupar → Barranquilla vía Bosconia."
                },
                {
                    "status": "asignado",
                    "timestamp": "18 Nov, 03:15 PM",
                    "title": "Vehículo Asignado",
                    "description": "Camión Isuzu NPR WKN-608 reservado para las 06:00 AM de mañana."
                }
            ]
        },
        {
            "_id": "ord-105",
            "id": "ord-105",
            "tracking_code": "CRB-33180",
            "client_id": "usr-client-5",
            "client_name": "Camila Sofía Daza",
            "client_phone": "+57 320 981 7733",
            "carrier_id": "car-4",
            "carrier_name": "Mudanzas Rápidas Del Sinú",
            "carrier_phone": "+57 314 887 6620",
            "carrier_vehicle_plate": "QRT-315",
            "origin_city": "Montería",
            "origin_address": "Calle 68 # 4-22, El Recreo",
            "origin_floor": 2,
            "origin_elevator": False,
            "dest_city": "Cartagena",
            "dest_address": "Crespo, Carrera 3 # 70-15",
            "dest_floor": 1,
            "dest_elevator": True,
            "property_type": "apartamento",
            "distance_km": 248.0,
            "estimated_minutes": 260,
            "total_volume_m3": 6.5,
            "helpers_count": 1,
            "total_price": 540000.0,
            "status": "cotizado",
            "scheduled_date": "2026-11-25",
            "scheduled_time": "09:00 AM",
            "notes": "Apartaestudio: cama, nevera pequeña, escritorio y 8 cajas.",
            "created_at": "2026-11-18T16:20:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "18 Nov, 04:20 PM",
                    "title": "Cotización Express",
                    "description": "Pickup 4x4 seleccionada. Tarifa reservada."
                }
            ]
        },
        {
            "_id": "ord-106",
            "id": "ord-106",
            "tracking_code": "CRB-99214",
            "client_id": "usr-client-1",
            "client_name": "María Alejandra Restrepo",
            "client_phone": "+57 301 849 2011",
            "carrier_id": "car-1",
            "carrier_name": "Transportes del Caribe S.A.S.",
            "carrier_phone": "+57 301 542 9811",
            "carrier_vehicle_plate": "WLZ-832",
            "origin_city": "Barranquilla",
            "origin_address": "Calle 76 # 54-11, Prado",
            "origin_floor": 1,
            "origin_elevator": True,
            "dest_city": "Barranquilla",
            "dest_address": "Carrera 51B # 84-20, Villa Country",
            "dest_floor": 4,
            "dest_elevator": True,
            "property_type": "apartamento",
            "distance_km": 6.5,
            "estimated_minutes": 30,
            "total_volume_m3": 11.0,
            "helpers_count": 2,
            "total_price": 280000.0,
            "status": "completado",
            "scheduled_date": "2026-11-10",
            "scheduled_time": "08:30 AM",
            "notes": "Mudanza local rápida dentro del norte de Barranquilla.",
            "created_at": "2026-11-10T08:00:00Z",
            "timeline": [
                {
                    "status": "cotizado",
                    "timestamp": "10 Nov, 08:00 AM",
                    "title": "Servicio Local Urbano",
                    "description": "Tarifa calculada para perímetro urbano."
                },
                {
                    "status": "cargando",
                    "timestamp": "10 Nov, 09:00 AM",
                    "title": "Cargue en Prado",
                    "description": "Embalaje de línea blanca y muebles."
                },
                {
                    "status": "completado",
                    "timestamp": "10 Nov, 12:45 PM",
                    "title": "Completado en Villa Country",
                    "description": "Descargue en 4to piso por ascensor. Cliente satisfecho."
                }
            ]
        }
    ]
    db.move_orders.insert_many(orders_seed)

    # 6. DISPUTAS Y RECLAMACIONES PARA EL PANEL DE ADMINISTRACIÓN
    disputes_seed = [
        {
            "_id": "disp-1",
            "id": "disp-1",
            "tracking_code": "CRB-84920",
            "order_id": "ord-101",
            "reported_by": "cliente",
            "reporter_name": "María Alejandra Restrepo",
            "reason": "Retraso en vía por lluvia intensa",
            "description": "El camión tardó 45 minutos más de lo previsto debido a congestión en el peaje Marahuaco por lluvias tropicales.",
            "status": "abierta",
            "resolution": None,
            "created_at": "2026-11-18T11:30:00Z",
            "resolved_at": None
        },
        {
            "_id": "disp-2",
            "id": "disp-2",
            "tracking_code": "CRB-19402",
            "order_id": "ord-102",
            "reported_by": "transportista",
            "reporter_name": "Roberto Gómez (Mudanzas La Heroica)",
            "reason": "Piso de destino sin ascensor no reportado",
            "description": "El inmueble de destino en Santa Marta reportó ascensor pero está en mantenimiento técnico, requiriendo subida por escaleras.",
            "status": "abierta",
            "resolution": None,
            "created_at": "2026-11-18T12:00:00Z",
            "resolved_at": None
        },
        {
            "_id": "disp-3",
            "id": "disp-3",
            "tracking_code": "CRB-99214",
            "order_id": "ord-106",
            "reported_by": "cliente",
            "reporter_name": "María Alejandra Restrepo",
            "reason": "Pequeño raspón en pata de mesa de centro",
            "description": "Se evidenció un roce menor en la pata de madera durante el ingreso al ascensor.",
            "status": "resuelta",
            "resolution": "Transportista reconoció costo de restauración de $50.000 COP y cliente aceptó a satisfacción.",
            "created_at": "2026-11-10T14:00:00Z",
            "resolved_at": "2026-11-11T10:00:00Z"
        }
    ]
    db.disputes.insert_many(disputes_seed)

    # 7. LOGS DE PRIVACIDAD LEY 1581 / HABEAS DATA
    privacy_seed = [
        {
            "_id": "priv-1",
            "id": "priv-1",
            "user_name": "María Alejandra Restrepo",
            "user_email": "cliente@caribeexpress.co",
            "user_role": "cliente",
            "ip_address": "190.248.81.14 (Barranquilla, Claro Fibra)",
            "regulation_notice": "Ley 1581 de 2012 (Colombia) / GDPR",
            "accepted_at": "2026-10-10T11:05:00Z"
        },
        {
            "_id": "priv-2",
            "id": "priv-2",
            "user_name": "Jairo Mendoza Cárdenas",
            "user_email": "operaciones@transportesdelcaribe.com.co",
            "user_role": "transportista",
            "ip_address": "181.137.92.50 (Barranquilla, Tigo)",
            "regulation_notice": "Ley 1581 de 2012 (Colombia) / GDPR",
            "accepted_at": "2026-09-15T08:10:00Z"
        },
        {
            "_id": "priv-3",
            "id": "priv-3",
            "user_name": "Andrés Felipe Mendoza",
            "user_email": "andres.mendoza@gmail.com",
            "user_role": "cliente",
            "ip_address": "186.84.112.20 (Cartagena, Movistar)",
            "regulation_notice": "Ley 1581 de 2012 (Colombia) / GDPR",
            "accepted_at": "2026-10-12T14:32:00Z"
        },
        {
            "_id": "priv-4",
            "id": "priv-4",
            "user_name": "Valentina Char Arboleda",
            "user_email": "valentina.char@costa.co",
            "user_role": "cliente",
            "ip_address": "190.158.44.18 (Santa Marta, Tigo)",
            "regulation_notice": "Ley 1581 de 2012 (Colombia) / GDPR",
            "accepted_at": "2026-10-15T09:18:00Z"
        }
    ]
    db.privacy_consents.insert_many(privacy_seed)

    logger.info("MongoDB seed successfully completed with rich realistic Caribbean dataset!")
