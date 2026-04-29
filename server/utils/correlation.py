import math
from datetime import datetime, timezone

# Correlation rules: if disaster A is within X km of disaster B within Y hours, flag it
CORRELATION_RULES = [
    ("earthquake", "tsunami",   500,  6,  "Earthquake may have triggered tsunami"),
    ("earthquake", "volcano",   300,  48, "Seismic activity near volcanic zone"),
    ("earthquake", "flood",     200,  24, "Earthquake may cause dam failure or landslide flooding"),
    ("volcano",    "earthquake",300,  48, "Volcanic activity with seismic unrest"),
    ("hurricane",  "flood",     400,  24, "Hurricane causing inland flooding"),
    ("wildfire",   "storm",     300,  12, "Storm conditions spreading wildfire"),
]

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def _hours_apart(ts1: str, ts2: str) -> float:
    try:
        def parse(ts):
            ts = ts.replace("Z", "+00:00")
            return datetime.fromisoformat(ts)
        return abs((parse(ts1) - parse(ts2)).total_seconds()) / 3600
    except Exception:
        return 999

def find_correlations(events: list[dict]) -> list[dict]:
    correlations = []
    seen = set()

    for rule in CORRELATION_RULES:
        type_a, type_b, max_km, max_hours, message = rule
        group_a = [e for e in events if e["type"] == type_a and (e["lat"] != 0 or e["lon"] != 0)]
        group_b = [e for e in events if e["type"] == type_b and (e["lat"] != 0 or e["lon"] != 0)]

        for a in group_a:
            for b in group_b:
                if a["id"] == b["id"]:
                    continue
                key = tuple(sorted([a["id"], b["id"]]))
                if key in seen:
                    continue

                dist  = _haversine(a["lat"], a["lon"], b["lat"], b["lon"])
                hours = _hours_apart(a["timestamp"], b["timestamp"])

                if dist <= max_km and hours <= max_hours:
                    seen.add(key)
                    correlations.append({
                        "event_a":    a["id"],
                        "event_b":    b["id"],
                        "type_a":     type_a,
                        "type_b":     type_b,
                        "distance_km": round(dist),
                        "hours_apart": round(hours, 1),
                        "message":    message,
                        "severity":   "extreme" if (a["severity"] in ("extreme","severe") or b["severity"] in ("extreme","severe")) else "high",
                    })

    return correlations
