import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.config import settings
from backend.database import get_db
from backend.mongodb import serialize_mongo_doc
from backend.models import User, CarrierProfile
from backend.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    RefreshTokenRequest,
    UpdateProfileRequest,
    ChangePasswordRequest
)
from backend.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    get_current_user
)

logger = logging.getLogger("caribe_express.auth")
router = APIRouter(prefix="/auth", tags=["Autenticación, Seguridad y Roles"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db = Depends(get_db)
):
    """
    Registra un nuevo usuario exclusivamente en MongoDB (localhost:27017).
    Hashea la contraseña con bcrypt.
    """
    # 1. Regla de negocio: El rol de administrador no se puede crear por registro público
    if (user_in.role or "").lower() == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El rol de Administrador no puede crearse por registro público. Se administra directamente desde la base de datos."
        )

    # 2. Verificar si el usuario ya existe en MongoDB
    existing_mongo = db.users.find_one({"email": user_in.email})
    if existing_mongo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con este correo electrónico."
        )
    
    # 3. Hashear contraseña con bcrypt
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role or "cliente"
    )

    # 4. Guardar en la colección users de MongoDB
    db.users.insert_one(new_user.to_dict())

    # 4. Si es transportista, crear perfil inicial en carrier_profiles
    if new_user.role == "transportista":
        carrier_prof = CarrierProfile(
            user_id=new_user.id,
            company_name=new_user.full_name,
            document_id="1082000123",
            phone=new_user.phone or "+57 300 000 0000",
            email=new_user.email,
            base_city="Barranquilla",
            coverage_zones=["Barranquilla", "Cartagena", "Santa Marta"],
            vehicle_type="furgon",
            vehicle_plate="CAR-101",
            vehicle_model="Renault Master 2023",
            verification_status="en_revision",
            documents=[]
        )
        db.carrier_profiles.insert_one(carrier_prof.to_dict())

    # 5. Generar Access & Refresh Tokens (estándar para Flutter & Web)
    token_payload = {"sub": new_user.id, "role": new_user.role, "email": new_user.email}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    user_resp = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        is_active=new_user.is_active,
        created_at=new_user.created_at if isinstance(new_user.created_at, datetime) else datetime.utcnow()
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user_resp
    }

@router.post("/login", response_model=Token)
@limiter.limit("10/minute") # Mitigar ataques de fuerza bruta
def login_user(
    request: Request,
    credentials: UserLogin,
    db = Depends(get_db)
):
    """
    Autentica al usuario contra la colección users de MongoDB.
    Protegido contra fuerza bruta con SlowAPI (10 req/min por IP).
    Retorna access_token y refresh_token.
    """
    mongo_user = db.users.find_one({"email": credentials.email})
    if not mongo_user or not verify_password(credentials.password, mongo_user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (correo o contraseña no válidos)."
        )
    
    if not mongo_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta suspendida o inactiva. Contacta a soporte."
        )

    user_id = str(mongo_user.get("id") or mongo_user.get("_id"))
    token_payload = {
        "sub": user_id,
        "role": mongo_user.get("role", "cliente"),
        "email": mongo_user["email"]
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    user_resp = UserResponse(
        id=user_id,
        email=mongo_user["email"],
        full_name=mongo_user.get("full_name", ""),
        phone=mongo_user.get("phone"),
        role=mongo_user.get("role", "cliente"),
        is_active=mongo_user.get("is_active", True),
        created_at=datetime.utcnow()
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user_resp
    }

@router.post("/refresh", response_model=Token)
def refresh_access_token(
    payload: RefreshTokenRequest,
    db = Depends(get_db)
):
    """
    Renueva el access token expirado usando un refresh token válido desde la app móvil o web.
    """
    decoded = verify_refresh_token(payload.refresh_token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado. Inicia sesión nuevamente."
        )
    
    user_id = decoded.get("sub")
    mongo_user = db.users.find_one({"$or": [{"id": user_id}, {"_id": user_id}]})
    if not mongo_user or not mongo_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o cuenta desactivada."
        )

    token_payload = {
        "sub": user_id,
        "role": mongo_user.get("role", "cliente"),
        "email": mongo_user["email"]
    }
    new_access_token = create_access_token(token_payload)
    new_refresh_token = create_refresh_token(token_payload)

    user_resp = UserResponse(
        id=user_id,
        email=mongo_user["email"],
        full_name=mongo_user.get("full_name", ""),
        phone=mongo_user.get("phone"),
        role=mongo_user.get("role", "cliente"),
        is_active=mongo_user.get("is_active", True),
        created_at=datetime.utcnow()
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user_resp
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at if isinstance(current_user.created_at, datetime) else datetime.utcnow()
    )

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    update_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Actualiza datos del perfil del usuario en MongoDB."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    
    update_fields = {}
    if update_data.full_name is not None and update_data.full_name.strip():
        current_user.full_name = update_data.full_name.strip()
        update_fields["full_name"] = current_user.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone.strip()
        update_fields["phone"] = current_user.phone

    if update_fields:
        db.users.update_one(
            {"$or": [{"id": current_user.id}, {"_id": current_user.id}]},
            {"$set": update_fields}
        )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at if isinstance(current_user.created_at, datetime) else datetime.utcnow()
    )

@router.post("/change-password")
def change_user_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Permite al usuario cambiar su contraseña en MongoDB."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta."
        )
    
    new_hashed = get_password_hash(payload.new_password)
    db.users.update_one(
        {"$or": [{"id": current_user.id}, {"_id": current_user.id}]},
        {"$set": {"hashed_password": new_hashed}}
    )

    return {"status": "success", "message": "Contraseña actualizada exitosamente."}
