import random
import string
from datetime import datetime, timezone


CATEGORY_MAP = {
    "earthquake": "geological",
    "tsunami":    "geological",
    "volcano":    "geological",
    "hurricane":  "meteorological",
    "tornado":    "meteorological",
    "storm":      "meteorological",
    "drought":    "meteorological",
    "wildfire":   "fire",
    "flood":      "hydrological",
    "disease":    "biological",
}


def _severity_earthquake(e):
    m = e.get("magnitude") or 0
    if m >= 8.0: return "extreme"
    if m >= 7.0: return "severe"
    if m >= 6.0: return "high"
    if m >= 5.0: return "moderate"
    return "low"

def _severity_tsunami(e):
    m = e.get("magnitude") or 0
    if m >= 8.0: return "extreme"
    if m >= 7.0: return "severe"
    return "high"

def _severity_storm_or_hurricane(e):
    w = e.get("wind_mph") or 0
    if w >= 157: return "extreme"
    if w >= 130: return "severe"
    if w >= 111: return "high"
    if w >= 74:  return "moderate"
    return e.get("severity") or "moderate"

def _severity_wildfire(e):
    a   = e.get("area_acres") or 0
    frp = e.get("frp") or 0
    if a >= 100000 or frp >= 1000: return "extreme"
    if a >= 10000  or frp >= 500:  return "severe"
    if a >= 1000   or frp >= 100:  return "high"
    if a >= 100    or frp >= 10:   return "moderate"
    return "low"

SEVERITY_FN = {
    "earthquake": _severity_earthquake,
    "tsunami":    _severity_tsunami,
    "volcano":    lambda e: e.get("severity") or "high",
    "storm":      _severity_storm_or_hurricane,
    "hurricane":  _severity_storm_or_hurricane,
    "tornado":    lambda e: e.get("severity") or "severe",
    "wildfire":   _severity_wildfire,
    "flood":      lambda e: e.get("severity") or "high",
    "drought":    lambda e: e.get("severity") or "moderate",
    "disease":    lambda e: e.get("severity") or "moderate",
}


def _rand_id():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"evt-{int(datetime.now(timezone.utc).timestamp())}-{suffix}"


def normalize(raw: dict) -> dict:
    event_type = raw.get("type") or "unknown"
    severity_fn = SEVERITY_FN.get(event_type, lambda e: e.get("severity") or "moderate")

    return {
        "id":          raw.get("id") or _rand_id(),
        "type":        event_type,
        "category":    raw.get("category") or CATEGORY_MAP.get(event_type, "unknown"),
        "name":        raw.get("name") or "Unknown Event",
        "lat":         float(raw.get("lat") or 0),
        "lon":         float(raw.get("lon") or 0),
        "severity":    severity_fn(raw),
        "magnitude":   raw.get("magnitude"),
        "depth_km":    raw.get("depth_km"),
        "wind_mph":    raw.get("wind_mph"),
        "pressure_mb": raw.get("pressure_mb"),
        "area_acres":  raw.get("area_acres"),
        "frp":         raw.get("frp"),
        "brightness":  raw.get("brightness"),
        "deaths":      raw.get("deaths"),
        "affected":    raw.get("affected"),
        "description": raw.get("description") or "",
        "source":      raw.get("source") or "Unknown",
        "url":         raw.get("url"),
        "timestamp":   raw.get("timestamp") or datetime.now(timezone.utc).isoformat(),
        "track":       raw.get("track") or [],
    }
