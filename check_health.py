import urllib.request, json
try:
    resp = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/predictions/info', timeout=15)
    data = json.loads(resp.read())
    print("STATUS:", resp.status)
    print("Accuracy:", data.get("accuracy_pct"), "%")
    print("Dataset:", data.get("dataset_size"), "registros")
    print("Classes:", data.get("classes"))
    print("Top feature:", list(data.get("feature_importance",{}).keys())[0])
    print("Distribution:", data.get("distribution"))
except Exception as e:
    print("ERROR:", e)
