import httpx
import xmltodict
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from utils.countries import get_coords

RELIEFWEB_URL = "https://reliefweb.int/disasters/rss.xml"

TYPE_MAP = {
    "EP": "disease",
    "TC": "hurricane",
    "FL": "flood",
    "FF": "flood",
    "EQ": "earthquake",
    "VO": "volcano",
    "TS": "tsunami",
    "FR": "wildfire",
    "VW": "storm",
    "CW": "storm",
    "HT": "storm",
    "DR": "drought",
    "LS": "flood",
    "MS": "flood",
}

CATEGORY_MAP = {
    "disease":    "biological",
    "hurricane":  "meteorological",
    "flood":      "hydrological",
    "earthquake": "geological",
    "volcano":    "geological",
    "tsunami":    "geological",
    "wildfire":   "fire",
    "storm":      "meteorological",
    "drought":    "meteorological",
}

DISEASE_KEYWORDS = [
    "outbreak", "epidemic", "cholera", "ebola", "mpox", "monkeypox", "dengue",
    "malaria", "plague", "yellow fever", "marburg", "lassa", "measles",
    "meningitis", "polio", "typhoid", "zika", "covid", "influenza", "chikungunya",
    "hepatitis", "rift valley", "anthrax",
]

def _severity(title: str, code: str) -> str:
    t = title.lower()
    if any(k in t for k in ("ebola", "marburg", "pandemic")): return "extreme"
    if any(k in t for k in ("epidemic", "outbreak", "cholera", "typhoon", "cyclone")): return "severe"
    if code in ("TC", "VO", "TS", "EQ"): return "high"
    return "moderate"

def _parse_date(date_str: str) -> str:
    try:
        return parsedate_to_datetime(date_str).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def _get_code(categories) -> str:
    if not categories:
        return ""
    cats = [categories] if isinstance(categories, str) else categories
    for cat in cats:
        if isinstance(cat, str) and len(cat) >= 2 and cat[2:3] == "-":
            return cat[:2]
    return ""

def _extract_country(title: str, categories) -> str:
    # "Yemen: Floods" -> "Yemen"
    if ":" in title:
        return title.split(":")[0].strip()
    # For typhoons/cyclones, grab first country from category list
    cats = [categories] if isinstance(categories, str) else (categories or [])
    for cat in cats:
        if isinstance(cat, str) and "-" not in cat:
            return cat  # plain country name
    return title


async def parse() -> list[dict]:
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        r = await client.get(RELIEFWEB_URL)
        r.raise_for_status()

    feed  = xmltodict.parse(r.text)
    items = feed.get("rss", {}).get("channel", {}).get("item", [])
    if isinstance(items, dict):
        items = [items]

    events = []
    for item in items:
        title      = item.get("title") or ""
        categories = item.get("category") or []
        code       = _get_code(categories)
        event_type = TYPE_MAP.get(code)

        if code == "EP":
            if not any(kw in title.lower() for kw in DISEASE_KEYWORDS):
                event_type = None

        if not event_type:
            continue

        link    = item.get("link") or ""
        uid     = f"rw-{code}-{link[-20:].replace('/', '-')}"
        country = _extract_country(title, categories)
        lat, lon = get_coords(country)

        events.append({
            "id":          uid,
            "type":        event_type,
            "category":    CATEGORY_MAP.get(event_type, "unknown"),
            "name":        title,
            "lat":         lat,
            "lon":         lon,
            "severity":    _severity(title, code),
            "description": title,
            "source":      "ReliefWeb",
            "url":         link,
            "timestamp":   _parse_date(item.get("pubDate", "")),
        })
    return events
