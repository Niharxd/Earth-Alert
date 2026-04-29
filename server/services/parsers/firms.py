import os
import io
import csv
import httpx
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

KEY = os.getenv("NASA_FIRMS_KEY")
FIRMS_URL = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{KEY}/VIIRS_SNPP_NRT/world/1"


async def parse() -> list[dict]:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(FIRMS_URL)
        r.raise_for_status()

    reader = csv.DictReader(io.StringIO(r.text))
    events = []
    for row in reader:
        try:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
        except (KeyError, ValueError):
            continue

        acq_date = row.get("acq_date", "")
        acq_time = row.get("acq_time", "0000").zfill(4)
        try:
            ts = datetime.strptime(f"{acq_date} {acq_time}", "%Y-%m-%d %H%M").replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            ts = datetime.now(timezone.utc).isoformat()

        frp = row.get("frp")
        confidence = row.get("confidence", "")
        events.append({
            "id":          f"firms-{lat}-{lon}-{acq_date}-{acq_time}",
            "type":        "wildfire",
            "category":    "fire",
            "name":        f"Active Fire ({acq_date})",
            "lat":         lat,
            "lon":         lon,
            "frp":         float(frp) if frp else None,
            "brightness":  float(row["bright_ti4"]) if row.get("bright_ti4") else None,
            "description": f"Satellite-detected fire. FRP: {frp} MW, Confidence: {confidence}",
            "source":      "NASA FIRMS",
            "url":         "https://firms.modaps.eosdis.nasa.gov/",
            "timestamp":   ts,
        })
    return events
