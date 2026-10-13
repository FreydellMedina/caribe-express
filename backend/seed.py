import logging
from sqlalchemy.orm import Session
from backend.models import User, CarrierProfile, CarrierDocument, MoveOrder, OrderTimeline, Dispute, PrivacyConsent
from backend.security import get_password_hash

logger = logging.getLogger("caribe_express.seed")

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).first():
        logger.info("Database already seeded.")
        return

    logger.info("Seeding initial database records for Caribe Express...")

    # 1. Admin User
    admin = User(
        id="usr-admin-1",
        email="admin@caribeexpress.co",
        hashed_password=get_password_hash("AdminCaribe2026!"),
        full_name="Carlos Valderrama (Admin Caribe)",
        phone="+57 300 999 8877",
        role="admin"
    )

    # 2. Carrier User
    carrier_user = User(
        id="usr-carrier-1",
        email="operaciones@transportesdelcaribe.com.co",
        hashed_password=get_password_hash("Carrier2026!"),
        full_name="Jairo Mendoza Cárdenas",
        phone="+57 301 542 9811",
        role="transportista"
    )

    # 3. Client User
    client_user = User(
        id="usr-client-1",
        email="cliente@caribeexpress.co",
        hashed_password=get_password_hash("Cliente2026!"),
        full_name="María Alejandra Restrepo",
        phone="+57 301 849 2011",
        role="cliente"
    )

    # 4. Carrier User 2
    carrier_user_2 = User(
        id="usr-carrier-2",
        email="contacto@mudanzaslaheroica.com",
        hashed_password=get_password_hash("Heroica2026!"),
        full_name="Roberto Gómez Bolivariano",
        phone="+57 315 782 1190",
        role="transportista"
    )

    db.add_all([admin, carrier_user, client_user, carrier_user_2])
    db.commit()

    # 5. Carrier Profile 1 (Verificado)
    carrier_1 = CarrierProfile(
        id="car-1",
        user_id=carrier_user.id,
        company_name="Transportes del Caribe S.A.S.",
        document_id="901.442.819-3",
        phone="+57 301 542 9811",
        email="operaciones@transportesdelcaribe.com.co",
        base_city="Barranquilla",
        coverage_zones=["Barranquilla", "Cartagena", "Santa Marta", "Valledupar"],
        vehicle_type="camion_turbo",
        vehicle_plate="WLZ-832",
        vehicle_model="Chevrolet NHR Turbo 2023 con Furgón Aislado",
        capacity_kg=4500,
        volume_m3=24.0,
        base_price=180000.0,
        price_per_km=2800.0,
        floor_without_elevator_surcharge=25000.0,
        helper_rate=45000.0,
        rating=4.95,
        total_trips=184,
        verification_status="verificado",
        photo_url="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        bio="Empresa familiar líder en mudanzas seguras en toda la Costa Atlántica. Personal uniformado, mantas térmicas y póliza todo riesgo.",
        available_now=True,
        total_earnings=18500000.0
    )

    # Carrier 2 (En revision)
    carrier_2 = CarrierProfile(
        id="car-2",
        user_id=carrier_user_2.id,
        company_name="Mudanzas Rápidas La Heroica",

        document_id="800.119.324-1",
        phone="+57 315 782 1190",
        email="contacto@mudanzaslaheroica.com",
        base_city="Cartagena",
        coverage_zones=["Cartagena", "Barranquilla", "Sincelejo", "Montería"],
        vehicle_type="furgon",
        vehicle_plate="UVR-419",
        vehicle_model="Hino Dutro City 2022",
        capacity_kg=3500,
        volume_m3=18.0,
        base_price=150000.0,
        price_per_km=2500.0,
        floor_without_elevator_surcharge=20000.0,
        helper_rate=40000.0,
        rating=4.82,
        total_trips=96,
        verification_status="en_revision",
        photo_url="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        bio="Especialistas en mudanzas residenciales de apartamentos en Bocagrande, Castillogrande y Manga con polea de carga.",
        available_now=True,
        total_earnings=9200000.0
    )

    db.add_all([carrier_1, carrier_2])
    db.commit()

    # Documents for Carrier 1
    doc1 = CarrierDocument(
        id="doc-1",
        carrier_id=carrier_1.id,
        name="RUT Dian Actualizado 2026",
        type="rut",
        status="aprobado",
        file_name="RUT_Transportes_del_Caribe_2026.pdf",
        expiry_date="2027-12-31"
    )
    doc2 = CarrierDocument(
        id="doc-2",
        carrier_id=carrier_1.id,
        name="Licencia Conducción Categoría C2",
        type="licencia",
        status="aprobado",
        file_name="Licencia_C2_JMendoza.pdf",
        expiry_date="2028-04-15"
    )
    doc3 = CarrierDocument(
        id="doc-3",
        carrier_id=carrier_1.id,
        name="Póliza SOAT Vigente",
        type="soat",
        status="aprobado",
        file_name="SOAT_WLZ832_SegurosBolivar.pdf",
        expiry_date="2027-02-18"
    )

    # Documents for Carrier 2 (Pending review)
    doc4 = CarrierDocument(
        id="doc-4",
        carrier_id=carrier_2.id,
        name="RUT Dian 2026",
        type="rut",
        status="aprobado",
        file_name="RUT_Mudanzas_Heroica.pdf",
        expiry_date="2027-06-30"
    )
    doc5 = CarrierDocument(
        id="doc-5",
        carrier_id=carrier_2.id,
        name="Revisión Tecnomecánica",
        type="tecnomecanica",
        status="en_revision",
        file_name="Tecnomecanica_UVR419.pdf",
        expiry_date="2026-11-20"
    )

    db.add_all([doc1, doc2, doc3, doc4, doc5])
    db.commit()

    # Sample Move Order
    order_1 = MoveOrder(
        id="ord-101",
        tracking_code="CRB-84920",
        client_id=client_user.id,
        client_name=client_user.full_name,
        client_phone=client_user.phone,
        carrier_id=carrier_1.id,
        carrier_name=carrier_1.company_name,
        carrier_phone=carrier_1.phone,
        carrier_vehicle_plate=carrier_1.vehicle_plate,
        status="en_ruta",
        origin_address="Carrera 53 # 82-140, Alto Prado",
        origin_city="Barranquilla",
        origin_floor=3,
        origin_elevator=True,
        dest_address="Avenida San Martín # 6-32, Bocagrande",
        dest_city="Cartagena",
        dest_floor=2,
        dest_elevator=False,
        property_type="apartamento",
        suggested_vehicle="camion_turbo",
        distance_km=118.0,
        estimated_minutes=120,
        toll_count=2,
        base_rate=180000.0,
        distance_cost=330400.0,
        stair_surcharge=25000.0,
        helpers_cost=90000.0,
        packing_cost=75000.0,
        insurance_cost=35000.0,
        total_price=735400.0,
        current_lat=10.6850,
        current_lng=-75.1200,
        current_location_desc="Km 45 Vía al Mar (Sentido Cartagena)",
        scheduled_date="2026-10-18",
        scheduled_time="08:30 AM",
        notes="Manipular vajilla con sumo cuidado."
    )
    db.add(order_1)
    db.commit()

    # Timelines for order 1
    t1 = OrderTimeline(
        order_id=order_1.id,
        status="cotizado",
        timestamp_desc="Ayer, 04:30 PM",
        title="Cotización Generada",
        description="Reserva realizada en Caribe Express con inventario de 14.2 m³."
    )
    t2 = OrderTimeline(
        order_id=order_1.id,
        status="asignado",
        timestamp_desc="Ayer, 05:15 PM",
        title="Servicio Aceptado",
        description="Transportes del Caribe confirmó disponibilidad con Camión Chevrolet NHR."
    )
    t3 = OrderTimeline(
        order_id=order_1.id,
        status="cargando",
        timestamp_desc="Hoy, 08:30 AM",
        title="Cargando y Embalando",
        description="Embalaje de línea blanca y subida a camión en Alto Prado."
    )
    t4 = OrderTimeline(
        order_id=order_1.id,
        status="en_ruta",
        timestamp_desc="Hoy, 10:15 AM",
        title="En Tránsito Intermunicipal",
        description="Desplazamiento por Vía al Mar hacia Bocagrande con monitoreo GPS."
    )
    db.add_all([t1, t2, t3, t4])

    # Sample Privacy Consent Record
    privacy_consent = PrivacyConsent(
        id="priv-001",
        user_name=client_user.full_name,
        user_email=client_user.email,
        user_role="cliente",
        ip_address="190.248.81.14 (Barranquilla)",
        regulation_notice="Ley 1581 de 2012 (Colombia) / GDPR"
    )
    db.add(privacy_consent)

    db.commit()
    logger.info("Database seeding successfully completed!")
