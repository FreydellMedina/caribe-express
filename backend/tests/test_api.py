"""
Tests de integración para la API de Caribe Express.
Cubre: autenticación (login/register), cotizador, transportistas, órdenes, privacidad y seguridad.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# ─────────────────────────────────────────────────────────────
# Fixtures de datos de prueba
# ─────────────────────────────────────────────────────────────

NEW_USER_EMAIL = "test_user_caribe@pytest.com"
NEW_USER_PASSWORD = "TestCaribe2026!"
NEW_USER_NAME = "Usuario Test PyTest"


# ─────────────────────────────────────────────────────────────
# 1. Healthcheck y Raíz
# ─────────────────────────────────────────────────────────────

class TestHealthAndRoot:
    def test_root_returns_app_info(self):
        """La ruta raíz debe responder con metadata de la app."""
        r = client.get("/")
        assert r.status_code == 200
        body = r.json()
        assert body["app"] == "Caribe Express API"
        assert body["status"] == "online"
        assert "Ley 1581" in body["regulations"]

    def test_health_check_returns_healthy(self):
        """El health endpoint debe indicar estado healthy."""
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"
        assert r.json()["version"] == "1.0.0"

    def test_swagger_docs_accessible(self):
        """La documentación Swagger debe estar disponible."""
        r = client.get("/docs")
        assert r.status_code == 200

    def test_openapi_json_valid(self):
        """El schema OpenAPI debe retornar 200."""
        r = client.get("/openapi.json")
        assert r.status_code == 200
        data = r.json()
        assert "paths" in data
        assert "/api/v1/auth/login" in data["paths"]
        assert "/api/v1/auth/register" in data["paths"]
        assert "/api/v1/quotes/calculate" in data["paths"]
        assert "/api/v1/carriers" in data["paths"]
        assert "/api/v1/orders" in data["paths"]
        assert "/api/v1/privacy/consent" in data["paths"]
        assert "/api/v1/maps/directions" in data["paths"]


# ─────────────────────────────────────────────────────────────
# 2. Autenticación (Login / Register / JWT / RBAC)
# ─────────────────────────────────────────────────────────────

class TestAuthentication:
    def test_register_new_user_successfully(self):
        """Registro de nuevo usuario cliente debe retornar token JWT."""
        import time
        unique_email = f"test_{int(time.time())}@caribe.co"
        r = client.post("/api/v1/auth/register", json={
            "email": unique_email,
            "password": "TestCaribe2026!",
            "full_name": "Usuario PyTest Temporal",
            "role": "cliente"
        })
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.json()}"
        body = r.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == unique_email
        assert body["user"]["role"] == "cliente"

    def test_register_duplicate_email_fails(self):
        """Registro con correo ya existente debe retornar 400."""
        client.post("/api/v1/auth/register", json={
            "email": "duplicate_test@caribe.co",
            "password": "Test1234!",
            "full_name": "Duplicate User"
        })
        r = client.post("/api/v1/auth/register", json={
            "email": "duplicate_test@caribe.co",
            "password": "Test1234!",
            "full_name": "Duplicate User"
        })
        assert r.status_code == 400
        assert "Ya existe" in r.json()["detail"]

    def test_login_seeded_admin_user(self):
        """Login con el usuario Admin del seed debe funcionar."""
        r = client.post("/api/v1/auth/login", json={
            "email": "admin@caribeexpress.co",
            "password": "AdminCaribe2026!"
        })
        assert r.status_code == 200, f"Login admin failed: {r.json()}"
        body = r.json()
        assert "access_token" in body
        assert body["user"]["role"] == "admin"

    def test_login_seeded_carrier_user(self):
        """Login con transportista verificado del seed debe funcionar."""
        r = client.post("/api/v1/auth/login", json={
            "email": "operaciones@transportesdelcaribe.com.co",
            "password": "Carrier2026!"
        })
        assert r.status_code == 200, f"Login carrier failed: {r.json()}"
        assert r.json()["user"]["role"] == "transportista"

    def test_login_seeded_client_user(self):
        """Login con el usuario Cliente del seed debe funcionar."""
        r = client.post("/api/v1/auth/login", json={
            "email": "cliente@caribeexpress.co",
            "password": "Cliente2026!"
        })
        assert r.status_code == 200, f"Login client failed: {r.json()}"
        assert r.json()["user"]["role"] == "cliente"

    def test_login_wrong_password_fails(self):
        """Login con contraseña incorrecta debe retornar 401."""
        r = client.post("/api/v1/auth/login", json={
            "email": "admin@caribeexpress.co",
            "password": "PasswordIncorrecta!!"
        })
        assert r.status_code == 401
        assert "Credenciales incorrectas" in r.json()["detail"]

    def test_login_nonexistent_email_fails(self):
        """Login con email inexistente debe retornar 401."""
        r = client.post("/api/v1/auth/login", json={
            "email": "noexiste@caribe.co",
            "password": "Password123!"
        })
        assert r.status_code == 401

    def test_me_endpoint_requires_auth(self):
        """El endpoint /me sin token debe retornar 401."""
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 401

    def test_me_endpoint_with_valid_token(self):
        """El endpoint /me con token válido debe retornar el usuario."""
        login_r = client.post("/api/v1/auth/login", json={
            "email": "cliente@caribeexpress.co",
            "password": "Cliente2026!"
        })
        token = login_r.json()["access_token"]
        r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        assert r.json()["email"] == "cliente@caribeexpress.co"

    def test_register_carrier_creates_profile(self):
        """Registro de transportista debe crear perfil de transportista."""
        import time
        unique_email = f"carrier_{int(time.time())}@logistica.co"
        r = client.post("/api/v1/auth/register", json={
            "email": unique_email,
            "password": "Carrier2026!",
            "full_name": "Nuevo Transportista PyTest",
            "role": "transportista",
            "phone": "+57 311 999 8877"
        })
        assert r.status_code == 201
        assert r.json()["user"]["role"] == "transportista"


# ─────────────────────────────────────────────────────────────
# 3. Motor de Cotización (Algorithmic Pricing Engine)
# ─────────────────────────────────────────────────────────────

class TestQuotingEngine:
    def test_basic_quote_barranquilla_cartagena(self):
        """Cotización básica entre Barranquilla y Cartagena debe retornar precios."""
        r = client.post("/api/v1/quotes/calculate", json={
            "originCity": "Barranquilla",
            "originAddress": "Carrera 53 # 82-140, Alto Prado",
            "originFloor": 1,
            "originElevator": True,
            "destCity": "Cartagena",
            "destAddress": "Avenida San Martín # 6-32, Bocagrande",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "apartamento",
            "inventory": [{"id": "cama_king", "name": "Cama King", "volumeM3": 2.2, "count": 1}],
            "helpersCount": 2,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        assert r.status_code == 200
        body = r.json()
        assert body["distanceKm"] == 118.0
        assert body["estimatedMinutes"] == 120
        assert body["tollCount"] == 2
        assert body["breakdown"]["total"] > 0
        assert body["breakdown"]["distanceCost"] > 0

    def test_stair_surcharge_applied_correctly(self):
        """Recargo por pisos sin ascensor debe calcularse correctamente."""
        r_with_stairs = client.post("/api/v1/quotes/calculate", json={
            "originCity": "Barranquilla",
            "originAddress": "Prueba",
            "originFloor": 5,
            "originElevator": False,      # ← 4 pisos de escalera
            "destCity": "Cartagena",
            "destAddress": "Prueba",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "apartamento",
            "inventory": [],
            "helpersCount": 0,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        r_no_stairs = client.post("/api/v1/quotes/calculate", json={
            "originCity": "Barranquilla",
            "originAddress": "Prueba",
            "originFloor": 1,
            "originElevator": True,
            "destCity": "Cartagena",
            "destAddress": "Prueba",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "apartamento",
            "inventory": [],
            "helpersCount": 0,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        assert r_with_stairs.status_code == 200
        assert r_no_stairs.status_code == 200
        # La cotización con escaleras debe ser más cara
        assert r_with_stairs.json()["breakdown"]["total"] > r_no_stairs.json()["breakdown"]["total"]
        assert r_with_stairs.json()["breakdown"]["stairSurcharge"] > 0
        assert r_no_stairs.json()["breakdown"]["stairSurcharge"] == 0

    def test_same_city_quote(self):
        """Cotización dentro de la misma ciudad debe usar distancia urbana corta."""
        r = client.post("/api/v1/quotes/calculate", json={
            "originCity": "Barranquilla",
            "originAddress": "Calle 70",
            "originFloor": 1,
            "originElevator": True,
            "destCity": "Barranquilla",
            "destAddress": "Calle 80",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "casa",
            "inventory": [],
            "helpersCount": 1,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        assert r.status_code == 200
        assert r.json()["distanceKm"] == 16.0

    def test_vehicle_suggestion_by_volume(self):
        """El motor debe sugerir vehículo según el volumen total del inventario."""
        # Inventario grande → camion_grande
        r_big = client.post("/api/v1/quotes/calculate", json={
            "originCity": "Cartagena",
            "originAddress": "Test",
            "originFloor": 1,
            "originElevator": True,
            "destCity": "Barranquilla",
            "destAddress": "Test",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "bodega",
            "inventory": [
                {"id": "sofa_3", "name": "Sofá", "volumeM3": 2.5, "count": 10},
            ],
            "helpersCount": 2,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        assert r_big.status_code == 200
        assert r_big.json()["suggestedVehicle"] == "camion_grande"

    def test_packing_service_increases_total(self):
        """Activar servicio de embalaje debe incrementar el costo total."""
        base_params = {
            "originCity": "Santa Marta",
            "originAddress": "El Rodadero",
            "originFloor": 2,
            "originElevator": False,
            "destCity": "Barranquilla",
            "destAddress": "Riomar",
            "destFloor": 3,
            "destElevator": True,
            "propertyType": "apartamento",
            "inventory": [{"id": "nevera_grande", "name": "Nevera", "volumeM3": 1.5, "count": 1, "isFragile": True}],
            "helpersCount": 1,
            "expressInsurance": False,
            "disassemblyService": False
        }
        r_no_pack = client.post("/api/v1/quotes/calculate", json={**base_params, "packingService": False})
        r_with_pack = client.post("/api/v1/quotes/calculate", json={**base_params, "packingService": True})
        assert r_no_pack.status_code == 200
        assert r_with_pack.status_code == 200
        assert r_with_pack.json()["breakdown"]["total"] > r_no_pack.json()["breakdown"]["total"]


# ─────────────────────────────────────────────────────────────
# 4. Marketplace de Transportistas
# ─────────────────────────────────────────────────────────────

class TestCarriersMarketplace:
    def test_list_all_carriers_returns_seeded_data(self):
        """El endpoint de transportistas debe retornar los registros del seed."""
        r = client.get("/api/v1/carriers")
        assert r.status_code == 200
        carriers = r.json()
        assert isinstance(carriers, list)
        assert len(carriers) >= 2
        carrier_ids = [c["id"] for c in carriers]
        assert "car-1" in carrier_ids
        assert "car-2" in carrier_ids

    def test_filter_carriers_by_verified_status(self):
        """Filtro de transportistas verificados debe excluir los en revisión."""
        r = client.get("/api/v1/carriers?onlyVerified=true")
        assert r.status_code == 200
        carriers = r.json()
        for c in carriers:
            assert c["verificationStatus"] == "verificado"

    def test_filter_carriers_by_city(self):
        """Filtro por ciudad base debe retornar solo transportistas de esa ciudad."""
        r = client.get("/api/v1/carriers?city=Cartagena")
        assert r.status_code == 200
        carriers = r.json()
        assert all(
            c["baseCity"] == "Cartagena" or "Cartagena" in c["coverageZones"]
            for c in carriers
        )

    def test_filter_carriers_by_vehicle_type(self):
        """Filtro por tipo de vehículo debe retornar solo ese tipo."""
        r = client.get("/api/v1/carriers?vehicleType=camion_turbo")
        assert r.status_code == 200
        carriers = r.json()
        assert all(c["vehicleType"] == "camion_turbo" for c in carriers)

    def test_get_carrier_detail_by_id(self):
        """Obtener detalle de transportista por ID debe retornar sus datos completos."""
        r = client.get("/api/v1/carriers/car-1")
        assert r.status_code == 200
        c = r.json()
        assert c["id"] == "car-1"
        assert c["companyName"] == "Transportes del Caribe S.A.S."
        assert isinstance(c["documents"], list)
        assert len(c["documents"]) >= 3

    def test_get_nonexistent_carrier_returns_404(self):
        """Buscar un transportista que no existe debe retornar 404."""
        r = client.get("/api/v1/carriers/car-does-not-exist")
        assert r.status_code == 404

    def test_carrier_profile_has_required_fields(self):
        """El perfil de transportista debe contener todos los campos requeridos por el spec."""
        r = client.get("/api/v1/carriers/car-1")
        body = r.json()
        required_fields = [
            "id", "fullName", "companyName", "documentId", "phone", "email",
            "baseCity", "coverageZones", "vehicleType", "vehiclePlate", "vehicleModel",
            "capacityKg", "volumeM3", "basePrice", "pricePerKm", "rating",
            "totalTrips", "verificationStatus", "documents", "availableNow"
        ]
        for field in required_fields:
            assert field in body, f"Campo requerido faltante: {field}"


# ─────────────────────────────────────────────────────────────
# 5. Órdenes de Mudanza y Ciclo de Vida
# ─────────────────────────────────────────────────────────────

class TestOrders:
    def test_list_orders_returns_seeded_order(self):
        """El listado de órdenes debe incluir la orden del seed."""
        r = client.get("/api/v1/orders")
        assert r.status_code == 200
        orders = r.json()
        assert isinstance(orders, list)
        assert len(orders) >= 1
        tracking_codes = [o["trackingCode"] for o in orders]
        assert "CRB-84920" in tracking_codes

    def test_get_order_by_tracking_code(self):
        """Buscar orden por tracking code debe retornar la orden correcta."""
        r = client.get("/api/v1/orders/CRB-84920")
        assert r.status_code == 200
        body = r.json()
        assert body["trackingCode"] == "CRB-84920"
        assert body["originCity"] == "Barranquilla"
        assert body["destCity"] == "Cartagena"
        assert isinstance(body["timeline"], list)
        assert len(body["timeline"]) >= 2

    def test_get_order_by_invalid_code_returns_404(self):
        """Buscar código de rastreo que no existe debe retornar 404."""
        r = client.get("/api/v1/orders/CRB-00000")
        assert r.status_code == 404

    def test_update_order_status_lifecycle(self):
        """Actualizar el estado de una orden debe crear evento de timeline."""
        r = client.patch("/api/v1/orders/ord-101/status", json={
            "status": "descargando",
            "notes": "Iniciando descarga en Bocagrande."
        })
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "descargando"
        statuses_in_timeline = [t["status"] for t in body["timeline"]]
        assert "descargando" in statuses_in_timeline


# ─────────────────────────────────────────────────────────────
# 6. Optimización de Rutas y Google Maps
# ─────────────────────────────────────────────────────────────

class TestMapsAndRouting:
    def test_directions_barranquilla_to_cartagena(self):
        """La ruta Barranquilla → Cartagena debe retornar datos de distancia y tiempo."""
        r = client.get("/api/v1/maps/directions?origin=Barranquilla&destination=Cartagena")
        assert r.status_code == 200
        body = r.json()
        assert body["distanceKm"] > 0
        assert body["durationMinutes"] > 0
        assert body["trafficStatus"] in ["fluido", "moderado", "concurrido"]

    def test_directions_same_city_returns_short_distance(self):
        """Ruta dentro de la misma ciudad debe ser corta."""
        r = client.get("/api/v1/maps/directions?origin=Barranquilla&destination=Barranquilla")
        assert r.status_code == 200
        body = r.json()
        assert body["distanceKm"] <= 30

    def test_places_autocomplete_barranquilla(self):
        """Autocompletado de direcciones para 'Prado' en Barranquilla debe retornar resultados."""
        r = client.get("/api/v1/maps/places/autocomplete?query=Prado&city=Barranquilla")
        assert r.status_code == 200
        results = r.json()
        assert isinstance(results, list)
        assert len(results) >= 1
        assert "description" in results[0]

    def test_places_autocomplete_minimum_length(self):
        """Autocomplete con menos de 2 caracteres debe retornar 422."""
        r = client.get("/api/v1/maps/places/autocomplete?query=A")
        assert r.status_code == 422


# ─────────────────────────────────────────────────────────────
# 7. Política de Privacidad y Habeas Data (Ley 1581 / GDPR)
# ─────────────────────────────────────────────────────────────

class TestPrivacyAndCompliance:
    def test_privacy_policy_endpoint_returns_structured_data(self):
        """El endpoint de política de privacidad debe retornar texto legal estructurado."""
        r = client.get("/api/v1/privacy/policy")
        assert r.status_code == 200
        body = r.json()
        assert "normativa" in body
        assert "Ley 1581" in body["normativa"]
        assert "GDPR" in body["normativa"]
        assert isinstance(body["finalidades"], list)
        assert isinstance(body["derechos_titular"], list)
        assert len(body["finalidades"]) >= 3
        assert len(body["derechos_titular"]) >= 3

    def test_record_privacy_consent_successfully(self):
        """El endpoint de consentimiento debe crear el registro de aceptación."""
        import time
        r = client.post("/api/v1/privacy/consent", json={
            "userName": "Juan Test Habeas",
            "userEmail": f"habeas_{int(time.time())}@test.co",
            "userRole": "cliente",
            "ipAddress": "190.248.81.99 (Barranquilla)"
        })
        assert r.status_code == 201
        body = r.json()
        assert body["userName"] == "Juan Test Habeas"
        assert body["regulationNotice"] == "Ley 1581 de 2012 (Colombia) / GDPR"
        assert "id" in body
        assert "acceptedAt" in body

    def test_list_privacy_consents_returns_records(self):
        """El listado de consentimientos debe incluir el registro del seed."""
        r = client.get("/api/v1/privacy/consents")
        assert r.status_code == 200
        consents = r.json()
        assert isinstance(consents, list)
        assert len(consents) >= 1
        assert "userName" in consents[0]
        assert "regulationNotice" in consents[0]


# ─────────────────────────────────────────────────────────────
# 8. Seguridad: Cabeceras HTTP y Protección
# ─────────────────────────────────────────────────────────────

class TestSecurityHeaders:
    def test_security_headers_present_on_api_response(self):
        """Las respuestas de la API deben incluir cabeceras de seguridad contra XSS y clickjacking."""
        r = client.get("/health")
        headers = r.headers
        assert headers.get("x-content-type-options") == "nosniff", "Falta X-Content-Type-Options"
        assert headers.get("x-frame-options") == "DENY", "Falta X-Frame-Options: DENY (protección clickjacking)"
        assert headers.get("x-xss-protection") == "1; mode=block", "Falta X-XSS-Protection"
        assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_admin_endpoint_rejects_unauthenticated_request(self):
        """Endpoints protegidos para admin deben rechazar peticiones sin token."""
        r = client.patch("/api/v1/carriers/car-2/documents/doc-5/verify", json={
            "status": "aprobado"
        })
        # Debe retornar 401 (no autenticado) o 403 (sin permisos de admin)
        assert r.status_code in [401, 403], f"Endpoint admin aceptó petición no autenticada: {r.status_code}"

    def test_invalid_jwt_token_rejected(self):
        """Token JWT malformado debe ser rechazado."""
        r = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer token_obviamente_invalido_xyz123"
        })
        assert r.status_code == 401

    def test_sql_injection_attempt_in_quote_returns_validation_error(self):
        """Intento de inyección SQL en campos de texto debe ser rechazado por Pydantic."""
        r = client.post("/api/v1/quotes/calculate", json={
            "originCity": "'; DROP TABLE users; --",
            "originAddress": "Ataque XSS <script>alert('hack')</script>",
            "originFloor": 1,
            "originElevator": True,
            "destCity": "SELECT * FROM orders",
            "destAddress": "Test",
            "destFloor": 1,
            "destElevator": True,
            "propertyType": "casa",
            "inventory": [],
            "helpersCount": 0,
            "packingService": False,
            "expressInsurance": False,
            "disassemblyService": False
        })
        # El ORM y la validación Pydantic deben manejar los valores de forma segura
        # La respuesta debe ser 200 (procesado como texto) o 422 (validación fallida), pero NUNCA un error 500
        assert r.status_code in [200, 422], f"Posible inyección SQL no manejada: status {r.status_code}"

