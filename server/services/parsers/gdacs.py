import httpx
import xmltodict
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

GDACS_URL    = "https://www.gdacs.org/xml/rss.xml"
VOLCANO_URL  = "https://www.gdacs.org/xml/rss_vo.xml"
TSUNAMI_URL  = "https://www.gdacs.org/xml/rss_ts.xml"

TYPE_MAP = {
    "EQ": "earthquake",
    "TC": "hurricane",
    "FL": "flood",
    "VO": "volcano",
    "DR": "drought",
    "WF": "wildfire",
    "TS": "tsunami",
}

CATEGORY_MAP = {
    "EQ": "geological",
    "TC": "meteorological",
    "FL": "hydrological",
    "VO": "geological",
    "DR": "meteorological",
    "WF": "fire",
    "TS": "geological",
}

def _severity(color: str) -> str:
    return {"Red": "severe", "Orange": "high", "Green": "moderate"}.get(color, "low")

def _parse_date(date_str: str) -> str:
    try:
        return parsedate_to_datetime(date_str).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def _parse_items(items, default_type=None, default_category=None) -> list[dict]:
    if not items:
        return []
    if isinstance(items, dict):
        items = [items]

    events = []
    for item in items:
        code = item.get("gdacs:eventtype", "")
        event_type     = TYPE_MAP.get(code, default_type)
        event_category = CATEGORY_MAP.get(code, default_category)
        if not event_type:
            continue

        geo = item.get("geo:Point", {})
        try:
            lat = float(geo.get("geo:lat", 0))
            lon = float(geo.get("geo:long", 0))
        except (ValueError, TypeError):
            lat, lon = 0.0, 0.0

        event_id = item.get("gdacs:eventid") or ""
        if isinstance(item.get("guid"), dict):
            event_id = event_id or item["guid"].get("#text", "")

        events.append({
            "id":          f"gdacs-{event_type}-{event_id}",
            "type":        event_type,
            "category":    event_category,
            "name":        item.get("title") or "Unknown Event",
            "lat":         lat,
            "lon":         lon,
            "severity":    _severity(item.get("gdacs:alertlevel", "Green")),
            "deaths":      int(item["gdacs:deaths"]) if item.get("gdacs:deaths") else None,
            "affected":    int(item["gdacs:affected"]) if item.get("gdacs:affected") else None,
            "description": item.get("description") or "",
            "source":      "GDACS",
            "url":         item.get("link"),
            "timestamp":   _parse_date(item.get("pubDate", "")),
        })
    return events


async def _fetch_feed(client: httpx.AsyncClient, url: str, default_type=None, default_category=None) -> list[dict]:
    try:
        r = await client.get(url)
        r.raise_for_status()
        feed = xmltodict.parse(r.text)
        items = feed.get("rss", {}).get("channel", {}).get("item", [])
        return _parse_items(items, default_type, default_category)
    except Exception as e:
        print(f"[GDACS] feed {url} failed: {e}")
        return []


async def parse() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        main = await _fetch_feed(client, GDACS_URL)
    return main
