import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="cliente", index=True) # "cliente", "transportista", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    carrier_profile = relationship("CarrierProfile", back_populates="user", uselist=False)
    orders = relationship("MoveOrder", back_populates="client", foreign_keys="[MoveOrder.client_id]")


class CarrierProfile(Base):
    __tablename__ = "carrier_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=True)
    document_id = Column(String, nullable=False) # NIT o Cédula
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    base_city = Column(String, nullable=False) # Barranquilla, Cartagena, etc.
    coverage_zones = Column(JSON, default=list) # Array of cities
    vehicle_type = Column(String, nullable=False) # pickup, furgon, camion_turbo, camion_grande
    vehicle_plate = Column(String, nullable=False)
    vehicle_model = Column(String, nullable=False)
    capacity_kg = Column(Integer, default=3000)
    volume_m3 = Column(Float, default=18.0)
    base_price = Column(Float, default=150000.0)
    price_per_km = Column(Float, default=2500.0)
    floor_without_elevator_surcharge = Column(Float, default=20000.0)
    helper_rate = Column(Float, default=40000.0)
    rating = Column(Float, default=5.0)
    total_trips = Column(Integer, default=0)
    verification_status = Column(String, default="pendiente") # "verificado", "en_revision", "rechazado", "pendiente"
    photo_url = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    available_now = Column(Boolean, default=True)
    total_earnings = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="carrier_profile")
    documents = relationship("CarrierDocument", back_populates="carrier", cascade="all, delete-orphan")
    assigned_orders = relationship("MoveOrder", back_populates="carrier", foreign_keys="[MoveOrder.carrier_id]")


class CarrierDocument(Base):
    __tablename__ = "carrier_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    carrier_id = Column(String, ForeignKey("carrier_profiles.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # "rut", "licencia", "soat", "tecnomecanica", "tarjeta_operacion"
    status = Column(String, default="pendiente") # "aprobado", "en_revision", "rechazado", "pendiente"
    file_name = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    carrier = relationship("CarrierProfile", back_populates="documents")


class MoveOrder(Base):
    __tablename__ = "move_orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    tracking_code = Column(String, unique=True, index=True, nullable=False)
    client_id = Column(String, ForeignKey("users.id"), nullable=True)
    client_name = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    carrier_id = Column(String, ForeignKey("carrier_profiles.id"), nullable=True)
    carrier_name = Column(String, nullable=True)
    carrier_phone = Column(String, nullable=True)
    carrier_vehicle_plate = Column(String, nullable=True)
    status = Column(String, default="cotizado", index=True) 
    # "cotizado", "asignado", "hacia_origen", "cargando", "en_ruta", "descargando", "completado", "cancelado"

    # Route & Location details
    origin_address = Column(String, nullable=False)
    origin_city = Column(String, nullable=False)
    origin_lat = Column(Float, default=10.9685)
    origin_lng = Column(Float, default=-74.7813)
    origin_floor = Column(Integer, default=1)
    origin_elevator = Column(Boolean, default=True)

    dest_address = Column(String, nullable=False)
    dest_city = Column(String, nullable=False)
    dest_lat = Column(Float, default=10.3910)
    dest_lng = Column(Float, default=-75.4794)
    dest_floor = Column(Integer, default=1)
    dest_elevator = Column(Boolean, default=True)

    property_type = Column(String, default="apartamento") # "casa", "apartamento", "bodega"
    suggested_vehicle = Column(String, default="furgon")
    distance_km = Column(Float, default=0.0)
    estimated_minutes = Column(Integer, default=0)
    toll_count = Column(Integer, default=0)

    # Cost breakdown
    base_rate = Column(Float, default=0.0)
    distance_cost = Column(Float, default=0.0)
    stair_surcharge = Column(Float, default=0.0)
    helpers_cost = Column(Float, default=0.0)
    packing_cost = Column(Float, default=0.0)
    insurance_cost = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)

    # Current Live Tracking Coordinates
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    current_location_desc = Column(String, nullable=True)

    scheduled_date = Column(String, nullable=False)
    scheduled_time = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    client_review = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", back_populates="orders", foreign_keys=[client_id])
    carrier = relationship("CarrierProfile", back_populates="assigned_orders", foreign_keys=[carrier_id])
    timeline = relationship("OrderTimeline", back_populates="order", cascade="all, delete-orphan")


class OrderTimeline(Base):
    __tablename__ = "order_timelines"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("move_orders.id"), nullable=False)
    status = Column(String, nullable=False)
    timestamp_desc = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("MoveOrder", back_populates="timeline")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, default=generate_uuid)
    tracking_code = Column(String, nullable=False, index=True)
    order_id = Column(String, nullable=False)
    reported_by = Column(String, nullable=False) # "cliente", "transportista"
    reporter_name = Column(String, nullable=False)
    reason = Column(String, nullable=False) # "retraso_severo", "dano_mercancia", "cobro_inadecuado", "cancelacion_injustificada", "otro"
    description = Column(Text, nullable=False)
    status = Column(String, default="abierta") # "abierta", "en_investigacion", "resuelta", "rechazada"
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class PrivacyConsent(Base):
    __tablename__ = "privacy_consents"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    regulation_notice = Column(String, default="Ley 1581 de 2012 (Colombia) / GDPR")
    accepted_at = Column(DateTime, default=datetime.utcnow)

