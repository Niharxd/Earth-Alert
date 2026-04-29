import httpx
import xmltodict
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

FEEDS = [
    ("BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
    ("ReliefWeb",  "https://reliefweb.int/headlines/rss.xml"),
]

DISASTER_KEYWORDS = [
    "earthquake", "tsunami", "flood", "hurricane", "typhoon", "cyclone",
    "tornado", "wildfire", "fire", "volcano", "eruption", "drought",
    "disaster", "emergency", "evacuation", "death toll", "casualties",
    "disease", "outbreak", "epidemic", "landslide", "storm", "quake",
]

def _parse_date(s: str) -> str:
    try:
        return parsedate_to_datetime(s).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def _matches(title: str, desc: str) -> bool:
    text = f"{title} {desc}".lower()
    return any(kw in text for kw in DISASTER_KEYWORDS)

async def fetch_news(query: str = None) -> list[dict]:
    articles = []
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        for source, url in FEEDS:
            try:
                r = await client.get(url)
                r.raise_for_status()
                feed  = xmltodict.parse(r.text)
                items = feed.get("rss", {}).get("channel", {}).get("item", [])
                if isinstance(items, dict):
                    items = [items]
                for item in items:
                    title = item.get("title") or ""
                    desc  = item.get("description") or ""
                    link  = item.get("link") or ""
                    if query:
                        if query.lower() not in f"{title} {desc}".lower():
                            continue
                    elif not _matches(title, desc):
                        continue
                    articles.append({
                        "title":     title,
                        "source":    source,
                        "url":       link,
                        "desc":      desc[:200] if desc else "",
                        "timestamp": _parse_date(item.get("pubDate", "")),
                    })
            except Exception as e:
                print(f"[News] {source} failed: {e}")

    # Sort by newest first, deduplicate by title
    seen, deduped = set(), []
    for a in sorted(articles, key=lambda x: x["timestamp"], reverse=True):
        if a["title"] not in seen:
            seen.add(a["title"])
            deduped.append(a)
    return deduped[:50]
