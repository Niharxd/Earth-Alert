import httpx
import xmltodict
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

# NOAA National Hurricane Center active storms
NHC_ATLANTIC = "https://www.nhc.noaa.gov/index-at.xml"
NHC_EPAC     = "https://www.nhc.noaa.gov/index-ep.xml"
NHC_CPAC     = "https://www.nhc.noaa.gov/index-cp.xml"

def _parse_date(date_str: str) -> str:
    try:
        return parsedate_to_datetime(date_str).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def _get_coords(item: dict):
    # NHC uses georss:point format: "lat lon"
    point = item.get("georss:point", "")
    if point:
        try:
            lat, lon = point.split()
            return float(lat), float(lon)
        except (ValueError, AttributeError):
            pass
    return 0.0, 0.0

def _severity_from_title(title: str) -> str:
    t = title.lower()
    if "hurricane" in t or "typhoon" in t or "cyclone" in t:
        if "category 5" in t or "cat 5" in t: return "extreme"
        if "category 4" in t or "cat 4" in t: return "extreme"
        if "category 3" in t or "cat 3" in t: return "severe"
        if "category 2" in t or "cat 2" in t: return "high"
        if "category 1" in t or "cat 1" in t: return "high"
        return "severe"
    if "tropical storm" in t:
        return "moderate"
    if "tropical depression" in t:
        return "low"
    return "moderate"

async def _fetch_feed(client: httpx.AsyncClient, url: str) -> list[dict]:
    try:
        r = await client.get(url)
        r.raise_for_status()
        feed = xmltodict.parse(r.text)
        items = feed.get("rss", {}).get("channel", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]
        
        events = []
        for item in items:
            title = item.get("title") or ""
            # Skip summary items
            if "summary" in title.lower() or "outlook" in title.lower():
                continue
            
            lat, lon = _get_coords(item)
            if lat == 0 and lon == 0:
                continue
            
            link = item.get("link") or ""
            uid  = f"nhc-{link[-30:].replace('/', '-')}"
            
            events.append({
                "id":          uid,
                "type":        "hurricane",
                "category":    "meteorological",
                "name":        title,
                "lat":         lat,
                "lon":         lon,
                "severity":    _severity_from_title(title),
                "description": item.get("description") or title,
                "source":      "NOAA NHC",
                "url":         link,
                "timestamp":   _parse_date(item.get("pubDate", "")),
            })
        return events
    except Exception as e:
        print(f"[NHC] feed {url} failed: {e}")
        return []


async def parse() -> list[dict]:
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        atlantic = await _fetch_feed(client, NHC_ATLANTIC)
        epac     = await _fetch_feed(client, NHC_EPAC)
        cpac     = await _fetch_feed(client, NHC_CPAC)
    
    # Deduplicate
    seen, events = set(), []
    for e in atlantic + epac + cpac:
        if e["id"] not in seen:
            seen.add(e["id"])
            events.append(e)
    return events
