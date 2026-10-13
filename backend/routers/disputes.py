from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Dispute, User
from backend.schemas import DisputeCreate, DisputeResolve, DisputeResponse
from backend.security import require_role

router = APIRouter(prefix="/disputes", tags=["Disputas y Mediación"])

def format_dispute(d: Dispute) -> dict:
    return {
        "id": d.id,
        "trackingCode": d.tracking_code,
        "orderId": d.order_id,
        "reportedBy": d.reported_by,
        "reporterName": d.reporter_name,
        "reason": d.reason,
        "description": d.description,
        "status": d.status,
        "resolution": d.resolution,
        "createdAt": d.created_at,
        "resolvedAt": d.resolved_at
    }

@router.get("", response_model=List[DisputeResponse])
def list_disputes(db: Session = Depends(get_db)):
    disputes = db.query(Dispute).order_by(Dispute.created_at.desc()).all()
    return [format_dispute(d) for d in disputes]

@router.post("", response_model=DisputeResponse, status_code=status.HTTP_201_CREATED)
def create_dispute(payload: DisputeCreate, db: Session = Depends(get_db)):
    new_disp = Dispute(
        tracking_code=payload.trackingCode,
        order_id=payload.orderId,
        reported_by=payload.reportedBy,
        reporterName=payload.reporterName,
        reason=payload.reason,
        description=payload.description,
        status="abierta"
    )
    db.add(new_disp)
    db.commit()
    db.refresh(new_disp)
    return format_dispute(new_disp)

@router.patch("/{dispute_id}/resolve", response_model=DisputeResponse)
def resolve_dispute(
    dispute_id: str,
    payload: DisputeResolve,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    disp = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not disp:
        raise HTTPException(status_code=404, detail="Disputa no encontrada")
    
    disp.status = payload.status
    disp.resolution = payload.resolution
    disp.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(disp)
    return format_dispute(disp)

