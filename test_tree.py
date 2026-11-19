import urllib.request, json
try:
    resp = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/predictions/tree-rules')
    print("STATUS:", resp.status)
    data = json.loads(resp.read())
    print("KEYS:", list(data.keys()))
    print("DEPTH:", data.get("depth"))
    print("LEAVES:", data.get("n_leaves"))
    print("RULES (first 200 chars):", str(data.get("rules"))[:200])
except Exception as e:
    print("ERROR:", e)

