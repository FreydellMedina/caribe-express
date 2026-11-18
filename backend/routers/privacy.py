import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from backend.database import get_db
from backend.schemas import PrivacyConsentCreate, PrivacyConsentResponse

router = APIRouter(prefix="/privacy", tags=["Protección de Datos y Privacidad (Ley 1581 / GDPR - MongoDB)"])

PRIVACY_POLICY_SUMMARY = {
    "normativa": "Ley 1581 de 2012 (Habeas Data Colombia) y Reglamento General de Protección de Datos (GDPR)",
    "responsable": "Caribe Express Logística & Mudanzas S.A.S.",
    "finalidades": [
        "Cálculo algorítmico de costos de transporte y optimización de rutas de mudanza.",
        "Geolocalización satelital para seguimiento en tiempo real del vehículo de carga.",
        "Validación y verificación de antecedentes y licencias de conductores y transportistas.",
        "Facturación electrónica y comunicación operativa ante contingencias en carretera."
    ],
    "derechos_titular": [
        "Conocer, actualizar y rectificar sus datos personales (Habeas Data).",
        "Solicitar prueba de la autorización otorgada.",
        "Ser informado respecto del uso que se le ha dado a sus datos.",
        "Revocar la autorización o solicitar la supresión de datos cuando no medie un deber legal o contractual."
    ],
    "seguridad": "Cifrado en tránsito (TLS/HTTPS), almacenamiento protegido en base de datos MongoDB (localhost:27017), control de acceso basado en roles (RBAC) y prevención activa de ataques."
}

@router.get("/policy")
def get_privacy_policy():
    return PRIVACY_POLICY_SUMMARY

@router.post("/consent", response_model=PrivacyConsentResponse, status_code=status.HTTP_201_CREATED)
def record_user_consent(payload: PrivacyConsentCreate, db = Depends(get_db)):
    new_id = f"priv-{uuid.uuid4().hex[:6]}"
    doc = {
        "_id": new_id,
        "id": new_id,
        "user_name": payload.userName,
        "user_email": payload.userEmail,
        "user_role": payload.userRole,
        "ip_address": payload.ipAddress or "190.248.81.14 (Caribe)",
        "regulation_notice": "Ley 1581 de 2012 (Colombia) / GDPR",
        "accepted_at": datetime.utcnow()
    }
    db.privacy_consents.insert_one(doc)
    return {
        "id": doc["id"],
        "userName": doc["user_name"],
        "userEmail": doc["user_email"],
        "userRole": doc["user_role"],
        "ipAddress": doc["ip_address"],
        "regulationNotice": doc["regulation_notice"],
        "acceptedAt": doc["accepted_at"]
    }

@router.get("/consents", response_model=List[PrivacyConsentResponse])
def list_privacy_consents(db = Depends(get_db)):
    consents = list(db.privacy_consents.find().sort("accepted_at", -1))
    return [
        {
            "id": str(c.get("id") or c.get("_id") or ""),
            "userName": c.get("user_name") or c.get("userName") or "",
            "userEmail": c.get("user_email") or c.get("userEmail") or "",
            "userRole": c.get("user_role") or c.get("userRole") or "cliente",
            "ipAddress": c.get("ip_address") or c.get("ipAddress") or "",
            "regulationNotice": c.get("regulation_notice") or c.get("regulationNotice") or "Ley 1581 de 2012 (Colombia) / GDPR",
            "acceptedAt": c.get("accepted_at") or c.get("acceptedAt") or datetime.utcnow()
        }
        for c in consents
    ]
