"""
update_carrier_vehicle_photos.py
================================
Actualiza las fotos de perfil en la base de datos MongoDB para que todos los transportistas
muestren fotos reales de camiones, camionetas y furgones de mudanza en lugar de retratos de personas.
"""

from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME   = "caribe_express"

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=4000)
db = client[DB_NAME]

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

carriers = list(db.carrier_profiles.find({}))
print(f"Total perfiles a revisar: {len(carriers)}")

updated_count = 0
for idx, c in enumerate(carriers):
    v_type = c.get("vehicleType") or c.get("vehicle_type") or "camion_turbo"
    if v_type not in VEHICLE_IMAGES:
        v_type = "camion_turbo"
    
    img_list = VEHICLE_IMAGES[v_type]
    chosen_img = img_list[idx % len(img_list)]
    
    # Actualizar tanto photoUrl como photo_url
    db.carrier_profiles.update_one(
        {"_id": c["_id"]},
        {"$set": {
            "photoUrl": chosen_img,
            "photo_url": chosen_img
        }}
    )
    updated_count += 1

print(f"✅ Se actualizaron {updated_count} perfiles con fotos de camiones y vehículos automotores.")

