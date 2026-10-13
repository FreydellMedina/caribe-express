from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CarrierProfile, CarrierDocument, User
from backend.schemas import (
    CarrierResponse,
    CarrierDocumentSchema,
    CarrierRateUpdate,
    DocumentVerificationUpdate
)
from backend.security import get_current_user, require_role

router = APIRouter(prefix="/carriers", tags=["Marketplace y Transportistas"])

def format_carrier_response(c: CarrierProfile) -> dict:
    docs = [
        CarrierDocumentSchema(
            id=d.id,
            name=d.name,
            type=d.type,
            status=d.status,
            fileName=d.file_name,
            expiryDate=d.expiry_date,
            feedback=d.feedback
        )
        for d in c.documents
    ]
    return {
        "id": c.id,
        "fullName": c.company_name or "Transportista Caribe",
        "companyName": c.company_name or "Independiente",
        "documentId": c.document_id,
        "phone": c.phone,
        "email": c.email,
        "baseCity": c.base_city,
        "coverageZones": c.coverage_zones or [],
        "vehicleType": c.vehicle_type,
        "vehiclePlate": c.vehicle_plate,
        "vehicleModel": c.vehicle_model,
        "capacityKg": c.capacity_kg,
        "volumeM3": c.volume_m3,
        "basePrice": c.base_price,
        "pricePerKm": c.price_per_km,
        "floorWithoutElevatorSurcharge": c.floor_without_elevator_surcharge,
        "helperRate": c.helper_rate,
        "rating": c.rating,
        "totalTrips": c.total_trips,
        "verificationStatus": c.verification_status,
        "documents": docs,
        "photoUrl": c.photo_url or "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
        "avatarUrl": c.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        "bio": c.bio or "Transportador profesional con experiencia en mudanzas residenciales y corporativas.",
        "availableNow": c.available_now,
        "totalEarnings": c.total_earnings or 0.0
    }

@router.get("", response_model=List[CarrierResponse])
def list_carriers(
    city: Optional[str] = None,
    vehicleType: Optional[str] = None,
    onlyVerified: bool = False,
    minRating: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CarrierProfile)

    if onlyVerified:
        query = query.filter(CarrierProfile.verification_status == "verificado")

    if vehicleType and vehicleType != "all":
        query = query.filter(CarrierProfile.vehicle_type == vehicleType)

    if minRating:
        query = query.filter(CarrierProfile.rating >= minRating)

    carriers = query.all()

    # Filter by city or coverage zone
    if city and city != "all":
        city_lower = city.lower()
        carriers = [
            c for c in carriers 
            if c.base_city.lower() == city_lower or any(city_lower in z.lower() for z in (c.coverage_zones or []))
        ]

    # Search by text
    if search:
        s_lower = search.lower()
        carriers = [
            c for c in carriers 
            if s_lower in (c.company_name or "").lower() or s_lower in (c.vehicle_model or "").lower()
        ]

    return [format_carrier_response(c) for c in carriers]

@router.get("/{carrier_id}", response_model=CarrierResponse)
def get_carrier_detail(carrier_id: str, db: Session = Depends(get_db)):
    carrier = db.query(CarrierProfile).filter(CarrierProfile.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    return format_carrier_response(carrier)

@router.put("/{carrier_id}/rates", response_model=CarrierResponse)
def update_carrier_rates(
    carrier_id: str,
    rates: CarrierRateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    carrier = db.query(CarrierProfile).filter(CarrierProfile.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    # Update rates
    carrier.base_price = rates.basePrice
    carrier.price_per_km = rates.pricePerKm
    carrier.floor_without_elevator_surcharge = rates.floorSurcharge
    carrier.helper_rate = rates.helperRate

    db.commit()
    db.refresh(carrier)
    return format_carrier_response(carrier)

@router.patch("/{carrier_id}/documents/{doc_id}/verify")
def verify_document(
    carrier_id: str,
    doc_id: str,
    update: DocumentVerificationUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    doc = db.query(CarrierDocument).filter(
        CarrierDocument.id == doc_id,
        CarrierDocument.carrier_id == carrier_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    doc.status = update.status
    doc.feedback = update.feedback
    db.commit()

    # Recheck all carrier documents
    carrier = db.query(CarrierProfile).filter(CarrierProfile.id == carrier_id).first()
    all_docs = carrier.documents
    if update.status == "rechazado":
        carrier.verification_status = "rechazado"
    elif all(d.status == "aprobado" for d in all_docs) and len(all_docs) > 0:
        carrier.verification_status = "verificado"
    
    db.commit()
    return {"message": f"Documento actualizado a estado '{update.status}'", "carrierStatus": carrier.verification_status}

