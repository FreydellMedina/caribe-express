from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# ----------------- AUTH & USERS -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "cliente" # cliente, transportista, admin

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# ----------------- CARRIERS -----------------
class CarrierDocumentSchema(BaseModel):
    id: str
    name: str
    type: str # rut, licencia, soat, tecnomecanica, tarjeta_operacion
    status: str # aprobado, en_revision, rechazado, pendiente
    fileName: Optional[str] = None
    expiryDate: Optional[str] = None
    feedback: Optional[str] = None

    class Config:
        from_attributes = True

class CarrierResponse(BaseModel):
    id: str
    fullName: str
    companyName: str
    documentId: str
    phone: str
    email: str
    baseCity: str
    coverageZones: List[str]
    vehicleType: str
    vehiclePlate: str
    vehicleModel: str
    capacityKg: int
    volumeM3: float
    basePrice: float
    pricePerKm: float
    floorWithoutElevatorSurcharge: float
    helperRate: float
    rating: float
    totalTrips: int
    verificationStatus: str
    documents: List[CarrierDocumentSchema] = []
    photoUrl: Optional[str] = None
    avatarUrl: Optional[str] = None
    bio: Optional[str] = None
    availableNow: bool = True
    totalEarnings: Optional[float] = 0.0

    class Config:
        from_attributes = True

class CarrierRateUpdate(BaseModel):
    basePrice: float
    pricePerKm: float
    floorSurcharge: float
    helperRate: float

class DocumentVerificationUpdate(BaseModel):
    status: str # aprobado, rechazado
    feedback: Optional[str] = None


# ----------------- QUOTES & PRICING ENGINE -----------------
class InventoryItemSchema(BaseModel):
    id: str
    name: str
    volumeM3: float
    count: int
    isFragile: Optional[bool] = False

class QuoteRequest(BaseModel):
    originCity: str
    originAddress: str
    originFloor: int = 1
    originElevator: bool = True
    destCity: str
    destAddress: str
    destFloor: int = 1
    destElevator: bool = True
    propertyType: str = "apartamento" # casa, apartamento, bodega
    inventory: List[InventoryItemSchema] = []
    carrierId: Optional[str] = None
    helpersCount: int = 1
    packingService: bool = False
    disassemblyService: bool = False
    expressInsurance: bool = False

class QuoteBreakdown(BaseModel):
    baseRate: float
    distanceCost: float
    stairSurcharge: float
    helpersCost: float
    packingCost: float
    insuranceCost: float
    total: float

class QuoteResponse(BaseModel):
    distanceKm: float
    estimatedMinutes: int
    tollCount: int
    suggestedVehicle: str
    totalVolumeM3: float
    breakdown: QuoteBreakdown


# ----------------- ORDERS & TRACKING -----------------
class TimelineEventSchema(BaseModel):
    status: str
    timestamp: str
    title: str
    description: str

class OrderCreate(BaseModel):
    carrierId: str
    clientName: str
    clientPhone: str
    scheduledDate: str
    scheduledTime: str
    quote: QuoteRequest
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    currentLat: Optional[float] = None
    currentLng: Optional[float] = None
    locationDesc: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    trackingCode: str
    clientName: str
    clientPhone: str
    carrierName: Optional[str] = None
    carrierPhone: Optional[str] = None
    carrierVehiclePlate: Optional[str] = None
    status: str
    originCity: str
    originAddress: str
    destCity: str
    destAddress: str
    propertyType: str
    distanceKm: float
    estimatedMinutes: int
    totalPrice: float
    scheduledDate: str
    scheduledTime: str
    notes: Optional[str] = None
    timeline: List[TimelineEventSchema] = []
    rating: Optional[float] = None
    clientReview: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------- DISPUTES -----------------
class DisputeCreate(BaseModel):
    orderId: str
    trackingCode: str
    reportedBy: str = "cliente" # cliente, transportista
    reporterName: str
    reason: str
    description: str

class DisputeResolve(BaseModel):
    resolution: str
    status: str = "resuelta"

class DisputeResponse(BaseModel):
    id: str
    trackingCode: str
    orderId: str
    reportedBy: str
    reporterName: str
    reason: str
    description: str
    status: str
    resolution: Optional[str] = None
    createdAt: datetime
    resolvedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----------------- PRIVACY (LEY 1581 / GDPR) -----------------
class PrivacyConsentCreate(BaseModel):
    userName: str
    userEmail: EmailStr
    userRole: str
    ipAddress: Optional[str] = "190.248.81.14 (Caribe)"

class PrivacyConsentResponse(BaseModel):
    id: str
    userName: str
    userEmail: str
    userRole: str
    ipAddress: str
    regulationNotice: str
    acceptedAt: datetime

    class Config:
        from_attributes = True

