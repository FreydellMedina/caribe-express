import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.models import User
from backend.schemas import DisputeCreate, DisputeResolve, DisputeResponse
from backend.security import require_role

router = APIRouter(prefix="/disputes", tags=["Disputas y Mediación (MongoDB)"])

def format_dispute(d: Dict[str, Any]) -> dict:
    return {
        "id": str(d.get("id") or d.get("_id") or ""),
        "trackingCode": d.get("tracking_code") or d.get("trackingCode") or "",
        "orderId": d.get("order_id") or d.get("orderId") or "",
        "reportedBy": d.get("reported_by") or d.get("reportedBy") or "cliente",
        "reporterName": d.get("reporter_name") or d.get("reporterName") or "",
        "reason": d.get("reason", ""),
        "description": d.get("description", ""),
        "status": d.get("status", "abierta"),
        "resolution": d.get("resolution"),
        "createdAt": d.get("created_at") or d.get("createdAt") or datetime.utcnow().isoformat(),
        "resolvedAt": d.get("resolved_at") or d.get("resolvedAt")
    }

@router.get("", response_model=List[DisputeResponse])
def list_disputes(db = Depends(get_db)):
    cursor = db.disputes.find().sort("created_at", -1)
    disputes = list(cursor)
    return [format_dispute(d) for d in disputes]

@router.post("", response_model=DisputeResponse, status_code=status.HTTP_201_CREATED)
def create_dispute(payload: DisputeCreate, db = Depends(get_db)):
    new_id = f"disp-{uuid.uuid4().hex[:6]}"
    doc = {
        "_id": new_id,
        "id": new_id,
        "tracking_code": payload.trackingCode,
        "order_id": payload.orderId,
        "reported_by": payload.reportedBy,
        "reporter_name": payload.reporterName,
        "reason": payload.reason,
        "description": payload.description,
        "status": "abierta",
        "created_at": datetime.utcnow().isoformat(),
        "resolution": None,
        "resolved_at": None
    }
    db.disputes.insert_one(doc)
    return format_dispute(doc)

@router.patch("/{dispute_id}/resolve", response_model=DisputeResponse)
def resolve_dispute(
    dispute_id: str,
    payload: DisputeResolve,
    db = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    disp = db.disputes.find_one({"$or": [{"id": dispute_id}, {"_id": dispute_id}]})
    if not disp:
        raise HTTPException(status_code=404, detail="Disputa no encontrada")
    
    update_data = {
        "status": payload.status,
        "resolution": payload.resolution,
        "resolved_at": datetime.utcnow().isoformat()
    }
    db.disputes.update_one(
        {"$or": [{"id": dispute_id}, {"_id": dispute_id}]},
        {"$set": update_data}
    )
    disp.update(update_data)
    return format_dispute(disp)
