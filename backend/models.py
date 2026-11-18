import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

def generate_uuid():
    return str(uuid.uuid4())

class User:
    """Modelo de Usuario para MongoDB."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.email = kwargs.get("email", "")
        self.hashed_password = kwargs.get("hashed_password", "")
        self.full_name = kwargs.get("full_name", "")
        self.phone = kwargs.get("phone")
        self.role = kwargs.get("role", "cliente")
        self.is_active = kwargs.get("is_active", True)
        self.created_at = kwargs.get("created_at") or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "full_name": self.full_name,
            "phone": self.phone,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else str(self.created_at)
        }


class CarrierProfile:
    """Modelo de Transportista para MongoDB."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.user_id = str(kwargs.get("user_id") or "")
        self.company_name = kwargs.get("company_name", "")
        self.document_id = kwargs.get("document_id", "")
        self.phone = kwargs.get("phone", "")
        self.email = kwargs.get("email", "")
        self.base_city = kwargs.get("base_city", "Barranquilla")
        self.coverage_zones = kwargs.get("coverage_zones", [])
        self.vehicle_type = kwargs.get("vehicle_type", "furgon")
        self.vehicle_plate = kwargs.get("vehicle_plate", "")
        self.vehicle_model = kwargs.get("vehicle_model", "")
        self.capacity_kg = kwargs.get("capacity_kg", 3000)
        self.volume_m3 = kwargs.get("volume_m3", 18.0)
        self.base_price = kwargs.get("base_price", 150000.0)
        self.price_per_km = kwargs.get("price_per_km", 2500.0)
        self.floor_without_elevator_surcharge = kwargs.get("floor_without_elevator_surcharge", 20000.0)
        self.helper_rate = kwargs.get("helper_rate", 40000.0)
        self.rating = kwargs.get("rating", 5.0)
        self.total_trips = kwargs.get("total_trips", 0)
        self.verification_status = kwargs.get("verification_status", "pendiente")
        self.photo_url = kwargs.get("photo_url")
        self.avatar_url = kwargs.get("avatar_url")
        self.bio = kwargs.get("bio")
        self.available_now = kwargs.get("available_now", True)
        self.total_earnings = kwargs.get("total_earnings", 0.0)
        self.documents = kwargs.get("documents", [])
        self.created_at = kwargs.get("created_at") or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "user_id": self.user_id,
            "company_name": self.company_name,
            "document_id": self.document_id,
            "phone": self.phone,
            "email": self.email,
            "base_city": self.base_city,
            "coverage_zones": self.coverage_zones,
            "vehicle_type": self.vehicle_type,
            "vehicle_plate": self.vehicle_plate,
            "vehicle_model": self.vehicle_model,
            "capacity_kg": self.capacity_kg,
            "volume_m3": self.volume_m3,
            "base_price": self.base_price,
            "price_per_km": self.price_per_km,
            "floor_without_elevator_surcharge": self.floor_without_elevator_surcharge,
            "helper_rate": self.helper_rate,
            "rating": self.rating,
            "total_trips": self.total_trips,
            "verification_status": self.verification_status,
            "photo_url": self.photo_url,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "available_now": self.available_now,
            "total_earnings": self.total_earnings,
            "documents": self.documents,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else str(self.created_at)
        }


class CarrierDocument:
    """Documentos legales de transportista (SOAT, RUT, Licencia)."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.carrier_id = kwargs.get("carrier_id", "")
        self.name = kwargs.get("name", "")
        self.type = kwargs.get("type", "rut")
        self.status = kwargs.get("status", "pendiente")
        self.file_name = kwargs.get("file_name")
        self.expiry_date = kwargs.get("expiry_date")
        self.feedback = kwargs.get("feedback")


class MoveOrder:
    """Modelo de Orden de Mudanza para MongoDB."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.tracking_code = kwargs.get("tracking_code") or f"CRB-{uuid.uuid4().hex[:5].upper()}"
        self.client_id = kwargs.get("client_id")
        self.client_name = kwargs.get("client_name", "")
        self.client_phone = kwargs.get("client_phone", "")
        self.carrier_id = kwargs.get("carrier_id")
        self.carrier_name = kwargs.get("carrier_name")
        self.carrier_phone = kwargs.get("carrier_phone")
        self.carrier_vehicle_plate = kwargs.get("carrier_vehicle_plate")
        self.origin_city = kwargs.get("origin_city", "")
        self.origin_address = kwargs.get("origin_address", "")
        self.origin_floor = kwargs.get("origin_floor", 1)
        self.origin_elevator = kwargs.get("origin_elevator", True)
        self.dest_city = kwargs.get("dest_city", "")
        self.dest_address = kwargs.get("dest_address", "")
        self.dest_floor = kwargs.get("dest_floor", 1)
        self.dest_elevator = kwargs.get("dest_elevator", True)
        self.property_type = kwargs.get("property_type", "apartamento")
        self.distance_km = kwargs.get("distance_km", 0.0)
        self.estimated_minutes = kwargs.get("estimated_minutes", 0)
        self.total_volume_m3 = kwargs.get("total_volume_m3", 0.0)
        self.helpers_count = kwargs.get("helpers_count", 0)
        self.total_price = kwargs.get("total_price", 0.0)
        self.status = kwargs.get("status", "cotizado")
        self.scheduled_date = kwargs.get("scheduled_date")
        self.scheduled_time = kwargs.get("scheduled_time")
        self.notes = kwargs.get("notes")
        self.timeline = kwargs.get("timeline", [])
        self.created_at = kwargs.get("created_at") or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "tracking_code": self.tracking_code,
            "client_id": self.client_id,
            "client_name": self.client_name,
            "client_phone": self.client_phone,
            "carrier_id": self.carrier_id,
            "carrier_name": self.carrier_name,
            "carrier_phone": self.carrier_phone,
            "carrier_vehicle_plate": self.carrier_vehicle_plate,
            "origin_city": self.origin_city,
            "origin_address": self.origin_address,
            "origin_floor": self.origin_floor,
            "origin_elevator": self.origin_elevator,
            "dest_city": self.dest_city,
            "dest_address": self.dest_address,
            "dest_floor": self.dest_floor,
            "dest_elevator": self.dest_elevator,
            "property_type": self.property_type,
            "distance_km": self.distance_km,
            "estimated_minutes": self.estimated_minutes,
            "total_volume_m3": self.total_volume_m3,
            "helpers_count": self.helpers_count,
            "total_price": self.total_price,
            "status": self.status,
            "scheduled_date": self.scheduled_date,
            "scheduled_time": self.scheduled_time,
            "notes": self.notes,
            "timeline": self.timeline,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else str(self.created_at)
        }


class Dispute:
    """Modelo de Disputa / Reclamación para MongoDB."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.tracking_code = kwargs.get("tracking_code", "")
        self.order_id = kwargs.get("order_id", "")
        self.reported_by = kwargs.get("reported_by", "cliente")
        self.reporter_name = kwargs.get("reporter_name", "")
        self.reason = kwargs.get("reason", "")
        self.description = kwargs.get("description", "")
        self.status = kwargs.get("status", "abierta")
        self.resolution = kwargs.get("resolution")
        self.created_at = kwargs.get("created_at") or datetime.utcnow().isoformat()
        self.resolved_at = kwargs.get("resolved_at")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "tracking_code": self.tracking_code,
            "order_id": self.order_id,
            "reported_by": self.reported_by,
            "reporter_name": self.reporter_name,
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "resolution": self.resolution,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at
        }


class PrivacyConsent:
    """Modelo de Consentimiento Ley 1581 / Habeas Data para MongoDB."""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get("id") or kwargs.get("_id") or generate_uuid())
        self.user_name = kwargs.get("user_name", "")
        self.user_email = kwargs.get("user_email", "")
        self.user_role = kwargs.get("user_role", "cliente")
        self.ip_address = kwargs.get("ip_address", "")
        self.regulation_notice = kwargs.get("regulation_notice", "Ley 1581 de 2012 (Colombia) / GDPR")
        self.accepted_at = kwargs.get("accepted_at") or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "user_name": self.user_name,
            "user_email": self.user_email,
            "user_role": self.user_role,
            "ip_address": self.ip_address,
            "regulation_notice": self.regulation_notice,
            "accepted_at": self.accepted_at.isoformat() if isinstance(self.accepted_at, datetime) else str(self.accepted_at)
        }
