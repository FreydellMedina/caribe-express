from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import PrivacyConsent
from backend.schemas import PrivacyConsentCreate, PrivacyConsentResponse

router = APIRouter(prefix="/privacy", tags=["Protección de Datos y Privacidad (Ley 1581 / GDPR)"])

PRIVACY_POLICY_SUMMARY = {
    "normativa": "Ley Estatutaria 1581 de 2012 (Colombia) y Reglamento General de Protección de Datos (GDPR)",
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
    "seguridad": "Cifrado en tránsito (TLS/HTTPS), almacenamiento protegido en base de datos PostgreSQL, control de acceso basado en roles (RBAC) y prevención activa de ataques."
}

@router.get("/policy")
def get_privacy_policy():
    return PRIVACY_POLICY_SUMMARY

@router.post("/consent", response_model=PrivacyConsentResponse, status_code=status.HTTP_201_CREATED)
def record_user_consent(payload: PrivacyConsentCreate, db: Session = Depends(get_db)):
    consent = PrivacyConsent(
        user_name=payload.userName,
        user_email=payload.userEmail,
        user_role=payload.userRole,
        ip_address=payload.ipAddress or "190.248.81.14 (Caribe)",
        regulation_notice="Ley 1581 de 2012 (Colombia) / GDPR",
        accepted_at=datetime.utcnow()
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return {
        "id": consent.id,
        "userName": consent.user_name,
        "userEmail": consent.user_email,
        "userRole": consent.user_role,
        "ipAddress": consent.ip_address,
        "regulationNotice": consent.regulation_notice,
        "acceptedAt": consent.accepted_at
    }

@router.get("/consents", response_model=List[PrivacyConsentResponse])
def list_privacy_consents(db: Session = Depends(get_db)):
    consents = db.query(PrivacyConsent).order_by(PrivacyConsent.accepted_at.desc()).all()
    return [
        {
            "id": c.id,
            "userName": c.user_name,
            "userEmail": c.user_email,
            "userRole": c.user_role,
            "ipAddress": c.ip_address,
            "regulationNotice": c.regulation_notice,
            "acceptedAt": c.accepted_at
        }
        for c in consents
    ]

