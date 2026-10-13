export type UserRole = 'cliente' | 'transportista' | 'admin';

export type PropertyType = 'casa' | 'apartamento' | 'bodega';

export type VehicleType = 'pickup' | 'furgon' | 'camion_turbo' | 'camion_grande';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'muebles' | 'electrodomesticos' | 'cajas' | 'otros';
  volumeM3: number;
  count: number;
  isFragile?: boolean;
}

export interface LocationPoint {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface QuoteDetails {
  origin: LocationPoint;
  destination: LocationPoint;
  propertyType: PropertyType;
  originFloor: number;
  originHasElevator: boolean;
  destinationFloor: number;
  destinationHasElevator: boolean;
  inventory: InventoryItem[];
  suggestedVehicle: VehicleType;
  distanceKm: number;
  estimatedMinutes: number;
  tollCount: number;
  additionalServices: {
    helpersCount: number;
    packingService: boolean;
    disassemblyService: boolean;
    expressInsurance: boolean;
  };
  breakdown: {
    baseRate: number;
    distanceCost: number;
    stairSurcharge: number;
    helpersCost: number;
    packingCost: number;
    insuranceCost: number;
    total: number;
  };
}

export interface CarrierDocument {
  id: string;
  name: string;
  type: 'rut' | 'licencia' | 'soat' | 'tecnomecanica' | 'tarjeta_operacion';
  status: 'aprobado' | 'en_revision' | 'rechazado' | 'pendiente';
  fileName?: string;
  expiryDate?: string;
  feedback?: string;
}

export interface Carrier {
  id: string;
  fullName: string;
  companyName: string;
  documentId: string; // Cédula o NIT
  phone: string;
  email: string;
  baseCity: string;
  coverageZones: string[];
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  capacityKg: number;
  volumeM3: number;
  basePrice: number;
  pricePerKm: number;
  floorWithoutElevatorSurcharge: number;
  helperRate: number;
  rating: number;
  totalTrips: number;
  verificationStatus: 'verificado' | 'en_revision' | 'rechazado';
  documents: CarrierDocument[];
  photoUrl: string;
  avatarUrl: string;
  bio: string;
  availableNow: boolean;
}

export type MoveOrderStatus =
  | 'cotizado'
  | 'asignado'
  | 'hacia_origen'
  | 'cargando'
  | 'en_ruta'
  | 'descargando'
  | 'completado'
  | 'cancelado';

export interface TimelineEvent {
  status: MoveOrderStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface MoveOrder {
  id: string;
  trackingCode: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  carrierId: string;
  carrierName: string;
  carrierPhone: string;
  carrierVehiclePlate: string;
  status: MoveOrderStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    description: string;
  };
  quote: QuoteDetails;
  scheduledDate: string;
  scheduledTime: string;
  timeline: TimelineEvent[];
  notes?: string;
  rating?: number;
  clientReview?: string;
}

export interface Dispute {
  id: string;
  trackingCode: string;
  orderId: string;
  reportedBy: 'cliente' | 'transportista';
  reporterName: string;
  reason: 'retraso_severo' | 'dano_mercancia' | 'cobro_inadecuado' | 'cancelacion_injustificada' | 'otro';
  description: string;
  status: 'abierta' | 'en_investigacion' | 'resuelta' | 'rechazada';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PrivacyConsentRecord {
  id: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  ipAddress: string;
  acceptedAt: string;
  regulationNotice: 'Ley 1581 de 2012 (Colombia) / GDPR';
}
