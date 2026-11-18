from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.mongodb import serialize_mongo_doc
from backend.schemas import (
    CarrierResponse,
    CarrierDocumentSchema,
    CarrierRateUpdate,
    DocumentVerificationUpdate
)
from backend.security import get_current_user, require_role
from backend.models import User

router = APIRouter(prefix="/carriers", tags=["Marketplace y Transportistas (MongoDB)"])

def format_carrier_response(c: Dict[str, Any]) -> dict:
    raw_docs = c.get("documents", []) or []
    docs = [
        CarrierDocumentSchema(
            id=d.get("id", ""),
            name=d.get("name", ""),
            type=d.get("type", "rut"),
            status=d.get("status", "pendiente"),
            fileName=d.get("fileName") or d.get("file_name"),
            expiryDate=d.get("expiryDate") or d.get("expiry_date"),
            feedback=d.get("feedback")
        )
        for d in raw_docs
    ]
    return {
        "id": str(c.get("id") or c.get("_id") or ""),
        "fullName": c.get("company_name") or c.get("companyName") or "Transportista Caribe",
        "companyName": c.get("company_name") or c.get("companyName") or "Independiente",
        "documentId": c.get("document_id") or c.get("documentId") or "",
        "phone": c.get("phone", ""),
        "email": c.get("email", ""),
        "baseCity": c.get("base_city") or c.get("baseCity") or "Barranquilla",
        "coverageZones": c.get("coverage_zones") or c.get("coverageZones") or [],
        "vehicleType": c.get("vehicle_type") or c.get("vehicleType") or "furgon",
        "vehiclePlate": c.get("vehicle_plate") or c.get("vehiclePlate") or "",
        "vehicleModel": c.get("vehicle_model") or c.get("vehicleModel") or "",
        "capacityKg": c.get("capacity_kg") or c.get("capacityKg") or 3000,
        "volumeM3": float(c.get("volume_m3") or c.get("volumeM3") or 18.0),
        "basePrice": float(c.get("base_price") or c.get("basePrice") or 150000.0),
        "pricePerKm": float(c.get("price_per_km") or c.get("pricePerKm") or 2500.0),
        "floorWithoutElevatorSurcharge": float(c.get("floor_without_elevator_surcharge") or c.get("floorWithoutElevatorSurcharge") or 20000.0),
        "helperRate": float(c.get("helper_rate") or c.get("helperRate") or 40000.0),
        "rating": float(c.get("rating") or 5.0),
        "totalTrips": int(c.get("total_trips") or c.get("totalTrips") or 0),
        "verificationStatus": c.get("verification_status") or c.get("verificationStatus") or "pendiente",
        "documents": docs,
        "photoUrl": c.get("photo_url") or c.get("photoUrl") or "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
        "avatarUrl": c.get("avatar_url") or c.get("avatarUrl") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        "bio": c.get("bio") or "Transportador profesional con experiencia en mudanzas residenciales y corporativas.",
        "availableNow": c.get("available_now") if c.get("available_now") is not None else c.get("availableNow", True),
        "totalEarnings": float(c.get("total_earnings") or c.get("totalEarnings") or 0.0)
    }

@router.get("", response_model=List[CarrierResponse])
def list_carriers(
    city: Optional[str] = None,
    vehicleType: Optional[str] = None,
    onlyVerified: bool = False,
    minRating: Optional[float] = None,
    search: Optional[str] = None,
    db = Depends(get_db)
):
    query_filter: Dict[str, Any] = {}
    if onlyVerified:
        query_filter["$or"] = [
            {"verification_status": "verificado"},
            {"verificationStatus": "verificado"}
        ]
    if vehicleType and vehicleType != "all":
        query_filter["$or"] = [
            {"vehicle_type": vehicleType},
            {"vehicleType": vehicleType}
        ]
    if minRating:
        query_filter["rating"] = {"$gte": minRating}

    cursor = db.carrier_profiles.find(query_filter)
    carriers = list(cursor)

    # Filtrar por ciudad o zona de cobertura
    if city and city != "all":
        city_lower = city.lower()
        filtered = []
        for c in carriers:
            base = (c.get("base_city") or c.get("baseCity") or "").lower()
            zones = [z.lower() for z in (c.get("coverage_zones") or c.get("coverageZones") or [])]
            if base == city_lower or any(city_lower in z for z in zones):
                filtered.append(c)
        carriers = filtered

    # Búsqueda libre
    if search:
        s_lower = search.lower()
        carriers = [
            c for c in carriers 
            if s_lower in (c.get("company_name") or c.get("companyName") or "").lower()
            or s_lower in (c.get("vehicle_model") or c.get("vehicleModel") or "").lower()
        ]

    return [format_carrier_response(c) for c in carriers]

@router.get("/{carrier_id}", response_model=CarrierResponse)
def get_carrier_detail(carrier_id: str, db = Depends(get_db)):
    carrier = db.carrier_profiles.find_one({"$or": [{"id": carrier_id}, {"_id": carrier_id}]})
    if not carrier:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    return format_carrier_response(carrier)

@router.put("/{carrier_id}/rates", response_model=CarrierResponse)
def update_carrier_rates(
    carrier_id: str,
    rates: CarrierRateUpdate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    carrier = db.carrier_profiles.find_one({"$or": [{"id": carrier_id}, {"_id": carrier_id}]})
    if not carrier:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    update_data = {
        "base_price": rates.basePrice,
        "price_per_km": rates.pricePerKm,
        "floor_without_elevator_surcharge": rates.floorSurcharge,
        "helper_rate": rates.helperRate
    }
    db.carrier_profiles.update_one(
        {"$or": [{"id": carrier_id}, {"_id": carrier_id}]},
        {"$set": update_data}
    )
    carrier.update(update_data)
    return format_carrier_response(carrier)

@router.patch("/{carrier_id}/documents/{doc_id}/verify")
def verify_document(
    carrier_id: str,
    doc_id: str,
    update: DocumentVerificationUpdate,
    db = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    carrier = db.carrier_profiles.find_one({"$or": [{"id": carrier_id}, {"_id": carrier_id}]})
    if not carrier:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    docs = carrier.get("documents", [])
    doc_found = False
    for d in docs:
        if d.get("id") == doc_id:
            d["status"] = update.status
            d["feedback"] = update.feedback
            doc_found = True
            break
    
    if not doc_found:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    new_status = carrier.get("verification_status", "pendiente")
    if update.status == "rechazado":
        new_status = "rechazado"
    elif all(d.get("status") == "aprobado" for d in docs) and len(docs) > 0:
        new_status = "verificado"
    
    db.carrier_profiles.update_one(
        {"$or": [{"id": carrier_id}, {"_id": carrier_id}]},
        {"$set": {"documents": docs, "verification_status": new_status}}
    )

    return {"message": f"Documento actualizado a estado '{update.status}'", "carrierStatus": new_status}
