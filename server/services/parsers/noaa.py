import httpx

# Broader query — all actual alerts, not just extreme/severe so we catch tornadoes & hurricanes
NWS_URL = "https://api.weather.gov/alerts/active?status=actual&message_type=alert"

EVENT_TYPE_MAP = {
    "Tornado Warning":               "tornado",
    "Tornado Watch":                 "tornado",
    "Hurricane Warning":             "hurricane",
    "Hurricane Watch":               "hurricane",
    "Hurricane Local Statement":     "hurricane",
    "Tropical Storm Warning":        "hurricane",
    "Tropical Storm Watch":          "hurricane",
    "Blizzard Warning":              "storm",
    "Winter Storm Warning":          "storm",
    "Winter Storm Watch":            "storm",
    "Severe Thunderstorm Warning":   "storm",
    "Severe Thunderstorm Watch":     "storm",
    "Flash Flood Warning":           "flood",
    "Flash Flood Watch":             "flood",
    "Flood Warning":                 "flood",
    "Flood Watch":                   "flood",
    "Extreme Heat Warning":          "storm",
    "Excessive Heat Warning":        "storm",
    "Excessive Heat Watch":          "storm",
    "Dust Storm Warning":            "storm",
    "High Wind Warning":             "storm",
}

CATEGORY_MAP = {
    "tornado":   "meteorological",
    "hurricane": "meteorological",
    "storm":     "meteorological",
    "flood":     "hydrological",
}

def _severity(s: str) -> str:
    return {"Extreme": "extreme", "Severe": "severe", "Moderate": "moderate", "Minor": "low"}.get(s, "moderate")

def _get_coords(feature: dict):
    geo = feature.get("geometry")
    if not geo:
        return None, None
    coords = geo.get("coordinates")
    if not coords:
        return None, None
    try:
        if geo["type"] == "Polygon":
            c = coords[0][0]
        elif geo["type"] == "MultiPolygon":
            c = coords[0][0][0]
        else:
            c = coords[0]
        return c[1], c[0]
    except (IndexError, TypeError):
        return None, None


async def parse() -> list[dict]:
    headers = {"User-Agent": "EarthAlert/1.0 (contact@earthalert.app)"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(NWS_URL, headers=headers)
        r.raise_for_status()
        data = r.json()

    events = []
    for f in data.get("features", []):
        p = f.get("properties", {})
        event_label = p.get("event", "")
        event_type = EVENT_TYPE_MAP.get(event_label)
        if not event_type:
            continue

        lat, lon = _get_coords(f)
        if lat is None:
            continue

        events.append({
            "id":          f"nws-{p.get('id', '')}",
            "type":        event_type,
            "category":    CATEGORY_MAP.get(event_type, "meteorological"),
            "name":        p.get("headline") or event_label,
            "lat":         lat,
            "lon":         lon,
            "severity":    _severity(p.get("severity", "")),
            "description": p.get("description") or p.get("headline") or "",
            "source":      "NOAA/NWS",
            "url":         "https://www.weather.gov",
            "timestamp":   p.get("onset") or p.get("sent") or "",
        })
    return events
