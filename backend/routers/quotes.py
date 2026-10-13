import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CarrierProfile
from backend.schemas import QuoteRequest, QuoteResponse, QuoteBreakdown

router = APIRouter(prefix="/quotes", tags=["Motor de Cotización y Precios"])

# Predefined route matrix for Caribbean Colombian cities (fallback / calibration)
ROUTE_DISTANCES = {
    ("barranquilla", "cartagena"): {"km": 118.0, "mins": 120, "tolls": 2},
    ("barranquilla", "santa marta"): {"km": 104.0, "mins": 110, "tolls": 2},
    ("barranquilla", "valledupar"): {"km": 298.0, "mins": 310, "tolls": 3},
    ("barranquilla", "montería"): {"km": 385.0, "mins": 420, "tolls": 4},
    ("barranquilla", "monteria"): {"km": 385.0, "mins": 420, "tolls": 4},
    ("barranquilla", "sincelejo"): {"km": 235.0, "mins": 240, "tolls": 3},
    ("barranquilla", "riohacha"): {"km": 275.0, "mins": 290, "tolls": 3},
    ("cartagena", "santa marta"): {"km": 228.0, "mins": 240, "tolls": 4},
    ("cartagena", "montería"): {"km": 248.0, "mins": 260, "tolls": 3},
    ("cartagena", "monteria"): {"km": 248.0, "mins": 260, "tolls": 3},
    ("cartagena", "sincelejo"): {"km": 168.0, "mins": 175, "tolls": 2},
    ("cartagena", "valledupar"): {"km": 395.0, "mins": 410, "tolls": 4},
    ("santa marta", "valledupar"): {"km": 255.0, "mins": 270, "tolls": 2},
    ("santa marta", "riohacha"): {"km": 172.0, "mins": 175, "tolls": 2},
    ("sincelejo", "montería"): {"km": 82.0, "mins": 90, "tolls": 1},
    ("sincelejo", "monteria"): {"km": 82.0, "mins": 90, "tolls": 1},
}

BASE_VEHICLE_RATES = {
    "pickup": {"base": 110000.0, "per_km": 2100.0, "stair_surcharge": 18000.0, "helper": 35000.0},
    "furgon": {"base": 150000.0, "per_km": 2500.0, "stair_surcharge": 20000.0, "helper": 40000.0},
    "camion_turbo": {"base": 180000.0, "per_km": 2800.0, "stair_surcharge": 25000.0, "helper": 45000.0},
    "camion_grande": {"base": 320000.0, "per_km": 3400.0, "stair_surcharge": 30000.0, "helper": 50000.0},
}

def get_distance_and_duration(origin_city: str, dest_city: str):
    o = origin_city.strip().lower()
    d = dest_city.strip().lower()
    if o == d:
        return 16.0, 35, 0 # Desplazamiento local urbano
    
    direct = ROUTE_DISTANCES.get((o, d))
    if direct:
        return direct["km"], direct["mins"], direct["tolls"]
    reverse = ROUTE_DISTANCES.get((d, o))
    if reverse:
        return reverse["km"], reverse["mins"], reverse["tolls"]
    
    return 195.0, 210, 2 # Default regional estimate

@router.post("/calculate", response_model=QuoteResponse)
def calculate_quote(req: QuoteRequest, db: Session = Depends(get_db)):
    # 1. Total volume m3
    total_volume_m3 = sum(item.volumeM3 * item.count for item in req.inventory)
    if total_volume_m3 == 0:
        total_volume_m3 = 10.0 # Default base load

    # 2. Suggested vehicle
    if total_volume_m3 > 25.0:
        suggested_vehicle = "camion_grande"
    elif total_volume_m3 > 14.0:
        suggested_vehicle = "camion_turbo"
    elif total_volume_m3 > 6.0:
        suggested_vehicle = "furgon"
    else:
        suggested_vehicle = "pickup"

    # 3. Distance and travel time
    km, mins, tolls = get_distance_and_duration(req.originCity, req.destCity)

    # 4. Check rates from selected carrier or vehicle standards
    base_rate = BASE_VEHICLE_RATES[suggested_vehicle]["base"]
    per_km = BASE_VEHICLE_RATES[suggested_vehicle]["per_km"]
    extra_stair = BASE_VEHICLE_RATES[suggested_vehicle]["stair_surcharge"]
    helper_unit = BASE_VEHICLE_RATES[suggested_vehicle]["helper"]

    if req.carrierId:
        carrier = db.query(CarrierProfile).filter(CarrierProfile.id == req.carrierId).first()
        if carrier:
            base_rate = carrier.base_price
            per_km = carrier.price_per_km
            extra_stair = carrier.floor_without_elevator_surcharge
            helper_unit = carrier.helper_rate

    # 5. Calculate cost breakdown
    distance_cost = round(km * per_km)

    stair_floors = 0
    if not req.originElevator and req.originFloor > 1:
        stair_floors += (req.originFloor - 1)
    if not req.destElevator and req.destFloor > 1:
        stair_floors += (req.destFloor - 1)
    
    stair_surcharge = stair_floors * extra_stair
    helpers_cost = req.helpersCount * helper_unit
    packing_cost = (120000.0 if suggested_vehicle == "camion_grande" else 75000.0) if req.packingService else 0.0
    disassembly_cost = 45000.0 if req.disassemblyService else 0.0
    total_packing = packing_cost + disassembly_cost
    insurance_cost = (55000.0 if suggested_vehicle == "camion_grande" else 35000.0) if req.expressInsurance else 0.0

    total = base_rate + distance_cost + stair_surcharge + helpers_cost + total_packing + insurance_cost

    return QuoteResponse(
        distanceKm=km,
        estimatedMinutes=mins,
        tollCount=tolls,
        suggestedVehicle=suggested_vehicle,
        totalVolumeM3=round(total_volume_m3, 2),
        breakdown=QuoteBreakdown(
            baseRate=base_rate,
            distanceCost=distance_cost,
            stairSurcharge=stair_surcharge,
            helpersCost=helpers_cost,
            packingCost=total_packing,
            insuranceCost=insurance_cost,
            total=total
        )
    )

