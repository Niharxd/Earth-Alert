import httpx
from datetime import datetime, timezone

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"


async def parse() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(USGS_URL)
        r.raise_for_status()
        data = r.json()

    events = []
    for f in data.get("features", []):
        p = f["properties"]
        lon, lat, depth = f["geometry"]["coordinates"]
        is_tsunami = p.get("tsunami") == 1
        events.append({
            "id":          f"usgs-{f['id']}",
            "type":        "tsunami" if is_tsunami else "earthquake",
            "category":    "geological",
            "name":        p.get("place") or "Unknown Location",
            "lat":         lat,
            "lon":         lon,
            "magnitude":   p.get("mag"),
            "depth_km":    depth,
            "description": p.get("title") or "",
            "source":      "USGS",
            "url":         p.get("url"),
            "timestamp":   datetime.fromtimestamp(p["time"] / 1000, tz=timezone.utc).isoformat(),
        })
    return events
