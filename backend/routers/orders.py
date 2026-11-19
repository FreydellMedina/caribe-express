import random
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.mongodb import serialize_mongo_doc
from backend.schemas import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
    TimelineEventSchema
)
from backend.routers.quotes import calculate_quote
from backend.security import get_current_user
from backend.models import User

router = APIRouter(prefix="/orders", tags=["Órdenes y Mudanzas (MongoDB)"])

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

def format_order_response(ord: Dict[str, Any]) -> dict:
    raw_timeline = ord.get("timeline", []) or []
    timeline_items = [
        TimelineEventSchema(
            status=t.get("status", "cotizado"),
            timestamp=t.get("timestamp") or t.get("timestamp_desc") or "",
            title=t.get("title", ""),
            description=t.get("description", "")
        )
        for t in raw_timeline
    ]
    return {
        "id": str(ord.get("id") or ord.get("_id") or ""),
        "trackingCode": ord.get("tracking_code") or ord.get("trackingCode") or "",
        "clientName": ord.get("client_name") or ord.get("clientName") or "",
        "clientPhone": ord.get("client_phone") or ord.get("clientPhone") or "",
        "carrierName": ord.get("carrier_name") or ord.get("carrierName"),
        "carrierPhone": ord.get("carrier_phone") or ord.get("carrierPhone"),
        "carrierVehiclePlate": ord.get("carrier_vehicle_plate") or ord.get("carrierVehiclePlate"),
        "status": ord.get("status", "cotizado"),
        "originCity": ord.get("origin_city") or ord.get("originCity") or "",
        "originAddress": ord.get("origin_address") or ord.get("originAddress") or "",
        "destCity": ord.get("dest_city") or ord.get("destCity") or "",
        "destAddress": ord.get("dest_address") or ord.get("destAddress") or "",
        "propertyType": ord.get("property_type") or ord.get("propertyType") or "apartamento",
        "distanceKm": float(ord.get("distance_km") or ord.get("distanceKm") or 0.0),
        "estimatedMinutes": int(ord.get("estimated_minutes") or ord.get("estimatedMinutes") or 0),
        "totalPrice": float(ord.get("total_price") or ord.get("totalPrice") or 0.0),
        "scheduledDate": ord.get("scheduled_date") or ord.get("scheduledDate"),
        "scheduledTime": ord.get("scheduled_time") or ord.get("scheduledTime"),
        "notes": ord.get("notes"),
        "timeline": timeline_items,
        "createdAt": ord.get("created_at") or ord.get("createdAt") or datetime.utcnow().isoformat()
    }

@router.get("", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    clientEmail: Optional[str] = None,
    db = Depends(get_db)
):
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    cursor = db.move_orders.find(query).sort("created_at", -1)
    orders = list(cursor)
    return [format_order_response(o) for o in orders]

@router.get("/{tracking_code}", response_model=OrderResponse)
def get_order_by_tracking_code(tracking_code: str, db = Depends(get_db)):
    ord = db.move_orders.find_one({
        "$or": [
            {"tracking_code": tracking_code},
            {"trackingCode": tracking_code},
            {"id": tracking_code},
            {"_id": tracking_code}
        ]
    })
    if not ord:
        raise HTTPException(status_code=404, detail="Orden de mudanza no encontrada")
    return format_order_response(ord)

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    tracking_code = f"CRB-{random.randint(10000, 99999)}"
    carrier_name = None
    carrier_phone = None
    carrier_plate = None

    if payload.carrierId:
        carrier = db.carrier_profiles.find_one({"$or": [{"id": payload.carrierId}, {"_id": payload.carrierId}]})
        if carrier:
            carrier_name = carrier.get("company_name") or carrier.get("companyName")
            carrier_phone = carrier.get("phone")
            carrier_plate = carrier.get("vehicle_plate") or carrier.get("vehiclePlate")

    init_title, init_desc = STATUS_DESCRIPTIONS["cotizado"]
    now_str = datetime.utcnow().strftime("%d %b, %I:%M %p")
    new_id = f"ord-{uuid.uuid4().hex[:6]}"

    q = payload.quote
    orig_city = payload.originCity or (q.originCity if q else "Barranquilla")
    orig_addr = payload.originAddress or (q.originAddress if q else "")
    orig_floor = payload.originFloor if payload.originFloor is not None else (q.originFloor if q else 1)
    orig_elev = payload.originElevator if payload.originElevator is not None else (q.originElevator if q else True)
    dst_city = payload.destCity or (q.destCity if q else "Cartagena")
    dst_addr = payload.destAddress or (q.destAddress if q else "")
    dst_floor = payload.destFloor if payload.destFloor is not None else (q.destFloor if q else 1)
    dst_elev = payload.destElevator if payload.destElevator is not None else (q.destElevator if q else True)
    prop_type = payload.propertyType or (q.propertyType if q else "apartamento")

    order_doc = {
        "_id": new_id,
        "id": new_id,
        "tracking_code": tracking_code,
        "client_id": current_user.id if current_user else None,
        "client_name": payload.clientName,
        "client_phone": payload.clientPhone,
        "carrier_id": payload.carrierId,
        "carrier_name": carrier_name,
        "carrier_phone": carrier_phone,
        "carrier_vehicle_plate": carrier_plate,
        "origin_city": orig_city,
        "origin_address": orig_addr,
        "origin_floor": orig_floor,
        "origin_elevator": orig_elev,
        "dest_city": dst_city,
        "dest_address": dst_addr,
        "dest_floor": dst_floor,
        "dest_elevator": dst_elev,
        "property_type": prop_type,
        "distance_km": payload.distanceKm or 0.0,
        "estimated_minutes": payload.estimatedMinutes or 0,
        "total_volume_m3": 12.0,
        "helpers_count": payload.helpersCount or 1,
        "total_price": payload.totalPrice or 0.0,
        "status": "cotizado",
        "scheduled_date": payload.scheduledDate,
        "scheduled_time": payload.scheduledTime,
        "notes": payload.notes,
        "created_at": datetime.utcnow().isoformat(),
        "timeline": [
            {
                "status": "cotizado",
                "timestamp": now_str,
                "title": init_title,
                "description": init_desc
            }
        ]
    }

    db.move_orders.insert_one(order_doc)
    return format_order_response(order_doc)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db = Depends(get_db)
):
    ord = db.move_orders.find_one({"$or": [{"id": order_id}, {"_id": order_id}, {"tracking_code": order_id}]})
    if not ord:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    status_key = payload.status
    title, desc = STATUS_DESCRIPTIONS.get(status_key, ("Estado Actualizado", "El servicio ha cambiado de estado."))
    if payload.notes:
        desc = payload.notes

    now_str = datetime.utcnow().strftime("%d %b, %I:%M %p")
    new_event = {
        "status": status_key,
        "timestamp": now_str,
        "title": title,
        "description": desc
    }

    timeline = ord.get("timeline", []) or []
    timeline.append(new_event)

    db.move_orders.update_one(
        {"$or": [{"id": order_id}, {"_id": order_id}, {"tracking_code": order_id}]},
        {"$set": {"status": status_key, "timeline": timeline}}
    )

    ord["status"] = status_key
    ord["timeline"] = timeline
    return format_order_response(ord)
