"""
seed_mass.py — Caribe Express Mass Database Seeder
====================================================
Genera e inserta en MongoDB:
  - 50 transportistas (carrier) con perfil completo
  - 5000 clientes (cliente) con datos realistas de la Región Caribe colombiana

Uso:
    cd c:\develop\caribe-express
    venv\Scripts\python.exe backend/seed_mass.py

El script es idempotente gracias a prefijos únicos de ID:
  - Transportistas: usr-car-001 .. usr-car-050
  - Clientes:       usr-cli-00001 .. usr-cli-05000
Si ya existen, los omite y no duplica.
"""

import sys
import os
import random
import string
from datetime import datetime, timedelta

# Asegurar que el package backend esté en el path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient, InsertOne
from pymongo.errors import BulkWriteError

# ── Importar hash de contraseñas directamente con bcrypt ──────────────────────
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

# ── Conexión directa a MongoDB ─────────────────────────────────────────────────
MONGO_URL = "mongodb://localhost:27017"
DB_NAME   = "caribe_express"

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=4000)
client.admin.command("ping")
db = client[DB_NAME]
print(f"✅ Conectado a MongoDB: {MONGO_URL} / {DB_NAME}")

# ── Datos base para generación aleatoria ──────────────────────────────────────

NOMBRES_MASCULINOS = [
    "Carlos","Andrés","Juan","Luis","Miguel","Sergio","Alejandro","David","Diego","Fernando",
    "Jorge","Mario","Rafael","Arturo","Jesús","Hernán","Oscar","Gustavo","Ramón","Eduardo",
    "Manuel","Pedro","Felipe","Nicolás","Santiago","Camilo","Jaime","Roberto","Álvaro","César",
    "Iván","Omar","Harold","Wilmer","Jhon","Anderson","Brayan","Kevin","Duván","Yesid",
    "Fabio","Germán","Héctor","Ignacio","Javier","Leonardo","Mauricio","Néstor","Rodrigo","Tomás",
]

NOMBRES_FEMENINOS = [
    "María","Laura","Valentina","Daniela","Camila","Sofía","Paola","Andrea","Carolina","Natalia",
    "Alejandra","Diana","Juliana","Mariana","Luisa","Isabel","Yolanda","Patricia","Claudia","Sandra",
    "Adriana","Beatriz","Carmen","Dolores","Elena","Gloria","Irene","Liliana","Mónica","Nora",
    "Olga","Rosa","Silvia","Teresa","Verónica","Xiomara","Yesenia","Zulma","Astrid","Brenda",
    "Cindy","Dina","Esperanza","Fernanda","Gabriela","Heidy","Ingrid","Johana","Katherine","Lina",
]

APELLIDOS = [
    "García","Martínez","López","Hernández","González","Pérez","Rodríguez","Sánchez","Ramírez","Torres",
    "Flores","Rivera","Gómez","Díaz","Cruz","Morales","Reyes","Gutiérrez","Ortiz","Álvarez",
    "Vargas","Jiménez","Castro","Ramos","Moreno","Medina","Suárez","Acosta","Núñez","Pinto",
    "Barrios","Mendoza","Cardona","Vergara","Palomino","Zapata","Pedraza","Montoya","Cabrera","Nieto",
    "Ríos","Quintero","Herrera","Lozano","Vega","Arrieta","Orozco","Blanco","Parra","Espinosa",
    "Villamizar","Puentes","Daza","Guerrero","Rincón","Muñoz","Becerra","Cárdenas","Mejía","Salcedo",
    "Duarte","Rojas","Velásquez","Sierra","Giraldo","Echeverría","Salamanca","Tovar","Useche","Alvarado",
]

CIUDADES_CARIBE = [
    {"name": "Barranquilla",  "dept": "Atlántico",   "lat": 10.9685,  "lng": -74.7813},
    {"name": "Cartagena",     "dept": "Bolívar",      "lat": 10.3910,  "lng": -75.4794},
    {"name": "Santa Marta",   "dept": "Magdalena",   "lat": 11.2408,  "lng": -74.1990},
    {"name": "Valledupar",    "dept": "Cesar",        "lat": 10.4631,  "lng": -73.2532},
    {"name": "Montería",      "dept": "Córdoba",      "lat":  8.7479,  "lng": -75.8814},
    {"name": "Sincelejo",     "dept": "Sucre",        "lat":  9.3047,  "lng": -75.3978},
    {"name": "Riohacha",      "dept": "La Guajira",   "lat": 11.5444,  "lng": -72.9072},
    {"name": "Soledad",       "dept": "Atlántico",   "lat": 10.9166,  "lng": -74.7666},
    {"name": "Maicao",        "dept": "La Guajira",   "lat": 11.3813,  "lng": -72.2449},
    {"name": "Lorica",        "dept": "Córdoba",      "lat":  9.2347,  "lng": -75.8138},
    {"name": "Ciénaga",       "dept": "Magdalena",   "lat": 11.0063,  "lng": -74.2503},
    {"name": "Sahagún",       "dept": "Córdoba",      "lat":  8.9513,  "lng": -75.4432},
]

DOMINIOS_EMAIL = ["gmail.com","hotmail.com","outlook.com","yahoo.com","icloud.com","live.com"]

TIPOS_VEHICULO = ["pickup","furgon","camion_turbo","camion_grande"]
PESOS_VEHICULO = [0.18, 0.28, 0.30, 0.24]  # distribución realista

EMPRESAS_PREFIJOS = [
    "Fletes","Mudanzas","Transportes","Servicios Logísticos","Furgones",
    "Carga","Express","Rápido","Caribe","Costa",
]
EMPRESAS_SUFIJOS = [
    "del Caribe","Atlántico","del Norte","Bolívar","Santa Marta",
    "del Magdalena","Express","Colombia","Tropical","Costero",
]

# Fotos reales de camiones, furgones y vehículos automotores de carga
VEHICLE_IMAGES = {
    "pickup": [
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    ],
    "furgon": [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1549194388-2469d59ec75c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80",
    ],
    "camion_turbo": [
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&auto=format&fit=crop&q=80",
    ],
    "camion_grande": [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80",
    ]
}

def get_vehicle_photo(v_type: str, index: int) -> str:
    imgs = VEHICLE_IMAGES.get(v_type, VEHICLE_IMAGES["camion_turbo"])
    return imgs[index % len(imgs)]

MODELOS_VEHICULO = {
    "pickup":        ["Chevrolet D-Max 2020","Toyota Hilux 2021","Ford Ranger 2019","Nissan Frontier 2022"],
    "furgon":        ["Furgón Renault Master 2021","Furgón Mercedes Sprinter 2020","Furgón Iveco Daily 2022","Volkswagen Crafter 2021"],
    "camion_turbo":  ["Chevrolet NHR 2021","JAC N75 2022","Hino 300 2020","Foton Aumark 2021"],
    "camion_grande": ["Freightliner M2 2020","Kenworth T300 2021","International 4300 2019","Mack MD 2022"],
}

CAPACIDAD_KG = {
    "pickup":        (500,  900),
    "furgon":        (1000, 1800),
    "camion_turbo":  (2000, 3500),
    "camion_grande": (5000, 8000),
}
VOLUMEN_M3 = {
    "pickup":        (3,  7),
    "furgon":        (10, 20),
    "camion_turbo":  (20, 35),
    "camion_grande": (40, 65),
}

TIPOS_DOC = ["rut","licencia","soat","tecnomecanica","tarjeta_operacion"]

BIOS_TRANSPORTISTAS = [
    "Transportista con más de {n} años de experiencia en la Región Caribe. Especializado en mudanzas residenciales y comerciales.",
    "Conductor profesional con licencia C2 y {n} años operando en el Caribe colombiano. Atención puntual y cuidado con los enseres.",
    "Empresa familiar con {n} años de trayectoria en fletes y mudanzas. Cobertura en toda la costa Caribe.",
    "Transportista verificado con experiencia en rutas intermunicipales. {n} años en el sector logístico del Caribe.",
    "Operador logístico con {n} años de experiencia. Especialista en embalaje y transporte de objetos frágiles y de alto valor.",
]

ZONAS_COBERTURA = {
    "Barranquilla":  ["Barranquilla","Soledad","Malambo","Puerto Colombia","Galapa"],
    "Cartagena":     ["Cartagena","Turbaco","Arjona","Mahates","Clemencia"],
    "Santa Marta":   ["Santa Marta","Ciénaga","Fundación","El Banco","Plato"],
    "Valledupar":    ["Valledupar","Aguachica","La Paz","San Diego","Manaure"],
    "Montería":      ["Montería","Lorica","Sahagún","Cereté","Tierralta"],
    "Sincelejo":     ["Sincelejo","Corozal","Sampués","San Marcos","Tolú"],
    "Riohacha":      ["Riohacha","Maicao","Manaure","Uribia","Albania"],
    "Soledad":       ["Soledad","Barranquilla","Malambo","Galapa"],
    "Maicao":        ["Maicao","Riohacha","Albania","Uribia"],
    "Lorica":        ["Lorica","Montería","Cereté","Ciénaga de Oro"],
    "Ciénaga":       ["Ciénaga","Santa Marta","Fundación","Aracataca"],
    "Sahagún":       ["Sahagún","Montería","Cereté","San Pelayo"],
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def random_name():
    if random.random() < 0.5:
        return random.choice(NOMBRES_MASCULINOS), random.choice(APELLIDOS), random.choice(APELLIDOS)
    else:
        return random.choice(NOMBRES_FEMENINOS), random.choice(APELLIDOS), random.choice(APELLIDOS)

def random_email(nombre, ap1, ap2, suffix=""):
    patterns = [
        f"{nombre.lower()}.{ap1.lower()}",
        f"{nombre.lower()}{ap1.lower()[:3]}",
        f"{ap1.lower()}.{nombre.lower()}",
        f"{nombre.lower()}{random.randint(1,999)}",
        f"{nombre.lower()}_{ap2.lower()[:3]}{random.randint(10,99)}",
    ]
    base = random.choice(patterns)
    # Remove accents and special chars
    base = base.replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ñ","n")
    domain = random.choice(DOMINIOS_EMAIL)
    return f"{base}{suffix}@{domain}"

def random_phone():
    prefix = random.choice(["310","311","312","313","314","315","316","317","320","321","322","323","324","350"])
    number = random.randint(1000000, 9999999)
    return f"+57 {prefix} {str(number)[:3]} {str(number)[3:]}"

def random_placa():
    letters = "".join(random.choices(LETRAS_PLACA, k=3))
    digits  = "".join(random.choices(string.digits, k=3))
    return f"{letters}-{digits}"

def random_date_past(days_back=730):
    delta = timedelta(days=random.randint(30, days_back))
    return (datetime.utcnow() - delta).isoformat()

def random_date_future(days_ahead=365):
    delta = timedelta(days=random.randint(60, days_ahead))
    return (datetime.utcnow() + delta).strftime("%Y-%m-%d")

def build_carrier_docs(status_global):
    docs = []
    for dtype in TIPOS_DOC:
        if status_global == "verificado":
            st = "aprobado"
        elif status_global == "rechazado":
            st = random.choice(["rechazado","en_revision"])
        else:
            st = random.choice(["en_revision","pendiente","aprobado"])
        docs.append({
            "id":          f"doc-{dtype}-{random.randint(1000,9999)}",
            "name":        dtype.upper().replace("_"," "),
            "type":        dtype,
            "status":      st,
            "fileName":    f"{dtype}_{random.randint(100,999)}.pdf",
            "expiryDate":  random_date_future(730),
            "feedback":    "Documento verificado y aprobado por el equipo de auditoría." if st == "aprobado" else None,
        })
    return docs


# ─────────────────────────────────────────────────────────────────────────────
# SEED TRANSPORTISTAS (50)
# ─────────────────────────────────────────────────────────────────────────────

def seed_transportistas(n: int = 50):
    print(f"\n🚛 Iniciando seed de {n} transportistas...")

    hashed_carrier_pwd = get_password_hash("Carrier2026!")
    print("   🔐 Contraseña hasheada (compartida para todos los transportistas)")

    new_users    = []
    new_profiles = []
    skipped      = 0

    # Distribución de ciudades ponderada (Barranquilla dominante)
    pesos_ciudad = [0.30, 0.20, 0.12, 0.08, 0.08, 0.06, 0.05, 0.04, 0.02, 0.02, 0.02, 0.01]

    for i in range(1, n + 1):
        uid = f"usr-car-{i:03d}"

        # Verificar si ya existe
        if db.users.find_one({"id": uid}):
            skipped += 1
            continue

        nombre, ap1, ap2 = random_name()
        full_name = f"{nombre} {ap1} {ap2}"
        email     = random_email(nombre, ap1, ap2, suffix=f"_tr{i}")
        phone     = random_phone()
        city_data = random.choices(CIUDADES_CARIBE, weights=pesos_ciudad, k=1)[0]
        city_name = city_data["name"]

        vehicle_type = random.choices(TIPOS_VEHICULO, weights=PESOS_VEHICULO, k=1)[0]
        cap_range    = CAPACIDAD_KG[vehicle_type]
        vol_range    = VOLUMEN_M3[vehicle_type]
        capacity_kg  = random.randint(*cap_range)
        volume_m3    = round(random.uniform(*vol_range), 1)

        # Tarifas según tipo de vehículo
        base_price   = {
            "pickup":        random.randint(80_000,  150_000),
            "furgon":        random.randint(150_000, 280_000),
            "camion_turbo":  random.randint(250_000, 450_000),
            "camion_grande": random.randint(400_000, 750_000),
        }[vehicle_type]
        price_per_km = {
            "pickup":        random.randint(1_200, 2_200),
            "furgon":        random.randint(1_800, 3_000),
            "camion_turbo":  random.randint(2_500, 4_000),
            "camion_grande": random.randint(3_500, 6_000),
        }[vehicle_type]
        floor_surcharge = random.randint(8_000,  25_000)
        helper_rate     = random.randint(30_000, 65_000)

        rating      = round(random.uniform(3.6, 5.0), 1)
        total_trips = random.randint(10, 350)

        ver_status = random.choices(
            ["verificado","en_revision","rechazado"],
            weights=[0.60, 0.30, 0.10], k=1
        )[0]

        years_exp = random.randint(2, 15)
        bio = random.choice(BIOS_TRANSPORTISTAS).format(n=years_exp)

        company_name = (
            f"{random.choice(EMPRESAS_PREFIJOS)} {ap1} "
            f"{random.choice(EMPRESAS_SUFIJOS)}"
        )
        placa = random_placa()
        modelo_vehiculo = random.choice(MODELOS_VEHICULO[vehicle_type])

        zonas = ZONAS_COBERTURA.get(city_name, [city_name])
        # Añadir 1-3 ciudades extra aleatorias
        extra_cities = random.sample([c["name"] for c in CIUDADES_CARIBE if c["name"] != city_name], k=random.randint(1,3))
        coverage     = list(set(zonas + extra_cities))

        created_at = random_date_past(1095)  # hasta 3 años atrás

        # ── Documento en colección `users` ──
        user_doc = {
            "id":           uid,
            "email":        email,
            "hashed_password": hashed_carrier_pwd,
            "full_name":    full_name,
            "phone":        phone,
            "role":         "transportista",
            "is_active":    True,
            "is_verified":  ver_status == "verificado",
            "created_at":   created_at,
        }

        # ── Documento en colección `carrier_profiles` ──
        profile_doc = {
            "id":               uid,
            "user_id":          uid,
            "fullName":         full_name,
            "companyName":      company_name,
            "documentId":       str(random.randint(10_000_000, 99_999_999)),
            "phone":            phone,
            "email":            email,
            "baseCity":         city_name,
            "coverageZones":    coverage,
            "vehicleType":      vehicle_type,
            "vehiclePlate":     placa,
            "vehicleModel":     modelo_vehiculo,
            "capacityKg":       capacity_kg,
            "volumeM3":         volume_m3,
            "basePrice":        base_price,
            "pricePerKm":       price_per_km,
            "floorWithoutElevatorSurcharge": floor_surcharge,
            "helperRate":       helper_rate,
            "rating":           rating,
            "totalTrips":       total_trips,
            "verificationStatus": ver_status,
            "documents":        build_carrier_docs(ver_status),
            "photoUrl":         get_vehicle_photo(vehicle_type, i),
            "photo_url":        get_vehicle_photo(vehicle_type, i),
            "avatarUrl":        f"https://ui-avatars.com/api/?name={nombre}+{ap1}&background=F97316&color=fff",
            "bio":              bio,
            "availableNow":     random.random() < 0.70,
            "created_at":       created_at,
        }

        new_users.append(user_doc)
        new_profiles.append(profile_doc)

    if new_users:
        try:
            db.users.insert_many(new_users, ordered=False)
            db.carrier_profiles.insert_many(new_profiles, ordered=False)
            print(f"   ✅ Insertados {len(new_users)} transportistas nuevos.")
        except BulkWriteError as bwe:
            inserted = bwe.details.get("nInserted", 0)
            print(f"   ⚠️  {inserted} transportistas insertados (algunos duplicados ignorados).")
    else:
        print(f"   ℹ️  Todos los {skipped} transportistas ya existían — nada que insertar.")

    return len(new_users)


# ─────────────────────────────────────────────────────────────────────────────
# SEED CLIENTES (5000)
# ─────────────────────────────────────────────────────────────────────────────

def seed_clientes(n: int = 5000):
    print(f"\n👤 Iniciando seed de {n} clientes...")

    hashed_client_pwd = get_password_hash("Cliente2026!")
    print("   🔐 Contraseña hasheada (compartida para todos los clientes)")

    # Pesos de ciudad para los clientes (distribución más parecida a población real)
    pesos_ciudad_cli = [0.35, 0.22, 0.12, 0.09, 0.07, 0.05, 0.04, 0.03, 0.01, 0.01, 0.005, 0.005]

    BATCH_SIZE = 500  # Insertar en lotes para eficiencia
    total_inserted = 0
    total_skipped  = 0

    for batch_start in range(1, n + 1, BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE - 1, n)
        batch_docs = []

        for i in range(batch_start, batch_end + 1):
            uid = f"usr-cli-{i:05d}"

            # Verificar si ya existe
            if db.users.find_one({"id": uid}):
                total_skipped += 1
                continue

            nombre, ap1, ap2 = random_name()
            full_name = f"{nombre} {ap1} {ap2}"
            email     = random_email(nombre, ap1, ap2, suffix=f"_{i}")
            phone     = random_phone()
            city_data = random.choices(CIUDADES_CARIBE, weights=pesos_ciudad_cli, k=1)[0]
            created_at = random_date_past(1460)  # hasta 4 años atrás

            user_doc = {
                "id":              uid,
                "email":           email,
                "hashed_password": hashed_client_pwd,
                "full_name":       full_name,
                "phone":           phone,
                "role":            "cliente",
                "is_active":       True,
                "is_verified":     True,
                "city":            city_data["name"],
                "department":      city_data["dept"],
                "created_at":      created_at,
            }
            batch_docs.append(user_doc)

        if batch_docs:
            try:
                db.users.insert_many(batch_docs, ordered=False)
                total_inserted += len(batch_docs)
            except BulkWriteError as bwe:
                inserted = bwe.details.get("nInserted", 0)
                total_inserted += inserted

        print(f"   📦 Lote {batch_start}-{batch_end}: {len(batch_docs)} docs → total acumulado: {total_inserted}", end="\r")

    print(f"\n   ✅ Insertados {total_inserted} clientes nuevos. ({total_skipped} ya existían)")
    return total_inserted


# ─────────────────────────────────────────────────────────────────────────────
# VERIFICACIÓN FINAL
# ─────────────────────────────────────────────────────────────────────────────

def print_summary():
    total_users     = db.users.count_documents({})
    total_clientes  = db.users.count_documents({"role": "cliente"})
    total_carriers  = db.users.count_documents({"role": "transportista"})
    total_admins    = db.users.count_documents({"role": "admin"})
    total_profiles  = db.carrier_profiles.count_documents({})
    total_orders    = db.move_orders.count_documents({}) if "move_orders" in db.list_collection_names() else 0

    print("\n" + "="*55)
    print("   📊  RESUMEN FINAL DE LA BASE DE DATOS")
    print("="*55)
    print(f"   🗄️  Base de datos : caribe_express @ localhost:27017")
    print(f"   👥  Usuarios total : {total_users:,}")
    print(f"      └ 👤 Clientes      : {total_clientes:,}")
    print(f"      └ 🚛 Transportistas: {total_carriers:,}")
    print(f"      └ 🛡️  Admins        : {total_admins:,}")
    print(f"   📋  Perfiles carrier : {total_profiles:,}")
    print(f"   📦  Órdenes          : {total_orders:,}")
    print("="*55)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import time
    t0 = time.time()

    print("\n🌴  CARIBE EXPRESS — SEED MASIVO DE BASE DE DATOS")
    print("="*55)

    carriers_added = seed_transportistas(50)
    clientes_added = seed_clientes(5000)

    print_summary()

    elapsed = time.time() - t0
    print(f"\n⏱️  Tiempo total: {elapsed:.1f}s")
    print("🎉  Seed completado exitosamente.\n")

