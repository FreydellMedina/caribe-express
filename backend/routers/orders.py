import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import MoveOrder, OrderTimeline, CarrierProfile, User
from backend.schemas import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
    TimelineEventSchema
)
from backend.routers.quotes import calculate_quote
from backend.security import get_current_user

router = APIRouter(prefix="/orders", tags=["Órdenes y Mudanzas"])

STATUS_DESCRIPTIONS = {
    "cotizado": ("Cotización Registrada", "Reserva preliminar generada en plataforma Caribe Express."),
    "asignado": ("Servicio Aceptado", "Transportista confirmado y preparando salida."),
    "hacia_origen": ("En Camino al Origen", "El conductor se desplaza hacia la dirección de carga."),
    "cargando": ("Cargando y Embalando", "Asegurando enseres con mantas industriales y vinipel."),
    "en_ruta": ("En Tránsito Intermunicipal", "Desplazamiento por vía nacional monitoreado vía satelital."),
    "descargando": ("Descarga en Destino", "Ingreso y acomodación de bienes en el nuevo inmueble."),
    "completado": ("Entrega Finalizada", "Servicio completado a entera satisfacción del usuario."),
    "cancelado": ("Servicio Cancelado", "Cancelación administrativa de la orden."),
}

def format_order_response(ord: MoveOrder) -> dict:
    timeline_items = [
        TimelineEventSchema(
            status=t.status,
            timestamp=t.timestamp_desc,
            title=t.title,
            description=t.description
        )
        for t in ord.timeline
    ]
    return {
        "id": ord.id,
        "trackingCode": ord.tracking_code,
        "clientName": ord.client_name,
        "clientPhone": ord.client_phone,
        "carrierName": ord.carrier_name,
        "carrierPhone": ord.carrier_phone,
        "carrierVehiclePlate": ord.carrier_vehicle_plate,
        "status": ord.status,
        "originCity": ord.origin_city,
        "originAddress": ord.origin_address,
        "destCity": ord.dest_city,
        "destAddress": ord.dest_address,
        "propertyType": ord.property_type,
        "distanceKm": ord.distance_km,
        "estimatedMinutes": ord.estimated_minutes,
        "totalPrice": ord.total_price,
        "scheduledDate": ord.scheduled_date,
        "scheduledTime": ord.scheduled_time,
        "notes": ord.notes,
        "timeline": timeline_items,
        "rating": ord.rating,
        "clientReview": ord.client_review
    }

@router.get("", response_model=List[OrderResponse])
def list_orders(
    role: Optional[str] = None,
    userId: Optional[str] = None,
    carrierId: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MoveOrder)
    if carrierId:
        query = query.filter(MoveOrder.carrier_id == carrierId)
    if userId:
        query = query.filter(MoveOrder.client_id == userId)
    
    orders = query.order_by(MoveOrder.created_at.desc()).all()
    return [format_order_response(o) for o in orders]

@router.get("/{tracking_code}", response_model=OrderResponse)
def get_order_by_tracking(tracking_code: str, db: Session = Depends(get_db)):
    ord = db.query(MoveOrder).filter(MoveOrder.tracking_code == tracking_code.upper()).first()
    if not ord:
        # Also try by id
        ord = db.query(MoveOrder).filter(MoveOrder.id == tracking_code).first()
    if not ord:
        raise HTTPException(status_code=404, detail="Orden de mudanza no encontrada")
    return format_order_response(ord)

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Calculate quote
    calc = calculate_quote(payload.quote, db)
    carrier = db.query(CarrierProfile).filter(CarrierProfile.id == payload.carrierId).first()

    # Generate tracking code like CRB-XXXXX
    code = f"CRB-{random.randint(10000, 99999)}"

    new_order = MoveOrder(
        tracking_code=code,
        client_id=current_user.id if current_user else None,
        client_name=payload.clientName,
        client_phone=payload.clientPhone,
        carrier_id=carrier.id if carrier else None,
        carrier_name=carrier.company_name if carrier else "Transportador Asignado",
        carrier_phone=carrier.phone if carrier else "+57 300 123 4567",
        carrier_vehicle_plate=carrier.vehicle_plate if carrier else "CRB-001",
        status="asignado",
        origin_address=payload.quote.originAddress,
        origin_city=payload.quote.originCity,
        origin_floor=payload.quote.originFloor,
        origin_elevator=payload.quote.originElevator,
        dest_address=payload.quote.destAddress,
        dest_city=payload.quote.destCity,
        dest_floor=payload.quote.destFloor,
        dest_elevator=payload.quote.destElevator,
        property_type=payload.quote.propertyType,
        suggested_vehicle=calc.suggestedVehicle,
        distance_km=calc.distanceKm,
        estimated_minutes=calc.estimatedMinutes,
        toll_count=calc.tollCount,
        base_rate=calc.breakdown.baseRate,
        distance_cost=calc.breakdown.distanceCost,
        stair_surcharge=calc.breakdown.stairSurcharge,
        helpers_cost=calc.breakdown.helpersCost,
        packing_cost=calc.breakdown.packingCost,
        insurance_cost=calc.breakdown.insuranceCost,
        total_price=calc.breakdown.total,
        scheduled_date=payload.scheduledDate,
        scheduled_time=payload.scheduledTime,
        notes=payload.notes
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Initial timeline entries
    t1 = OrderTimeline(
        order_id=new_order.id,
        status="cotizado",
        timestamp_desc="Hoy, " + datetime.now().strftime("%I:%M %p"),
        title="Cotización Generada",
        description=f"Cotización calculada para ruta {payload.quote.originCity} a {payload.quote.destCity}."
    )
    t2 = OrderTimeline(
        order_id=new_order.id,
        status="asignado",
        timestamp_desc="Hoy, " + datetime.now().strftime("%I:%M %p"),
        title="Servicio Aceptado",
        description=f"Transportista {new_order.carrier_name} confirmado con vehículo {new_order.carrier_vehicle_plate}."
    )
    db.add_all([t1, t2])
    db.commit()
    db.refresh(new_order)

    return format_order_response(new_order)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(MoveOrder).filter(MoveOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    order.status = update.status
    if update.currentLat:
        order.current_lat = update.currentLat
    if update.currentLng:
        order.current_lng = update.currentLng
    if update.locationDesc:
        order.current_location_desc = update.locationDesc
    
    # If completed, add earnings to carrier
    if update.status == "completado" and order.carrier_id:
        carrier = db.query(CarrierProfile).filter(CarrierProfile.id == order.carrier_id).first()
        if carrier:
            carrier.total_earnings = (carrier.total_earnings or 0) + (order.total_price * 0.85) # 85% to driver
            carrier.total_trips = (carrier.total_trips or 0) + 1

    # Add timeline event
    title, desc = STATUS_DESCRIPTIONS.get(
        update.status,
        ("Estado Actualizado", update.notes or "Actualización de ruta.")
    )
    t = OrderTimeline(
        order_id=order.id,
        status=update.status,
        timestamp_desc="Hoy, " + datetime.now().strftime("%I:%M %p"),
        title=title,
        description=update.notes or desc
    )
    db.add(t)
    db.commit()
    db.refresh(order)

    return format_order_response(order)

