from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from backend.database import get_db
from backend.models import User, CarrierProfile
from backend.schemas import UserCreate, UserLogin, UserResponse, Token
from backend.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación y Roles"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con este correo electrónico."
        )
    
    # Hash password
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role or "cliente"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If carrier role, create starter carrier profile
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
            verification_status="en_revision"
        )
        db.add(carrier_prof)
        db.commit()

    # Generate token
    token = create_access_token({"sub": new_user.id, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
@limiter.limit("10/minute") # Mitigate brute force attacks
def login_user(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (correo o contraseña no válidos)."
        )
    
    token = create_access_token({"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return current_user

