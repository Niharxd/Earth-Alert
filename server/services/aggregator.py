import asyncio
import logging
from utils.normalizer import normalize
from services.parsers import usgs, firms, gdacs, noaa, who
from services.parsers import nhc

logger = logging.getLogger(__name__)

_cache: list[dict] = []

PARSERS = [
    ("USGS",       usgs.parse),
    ("FIRMS",      firms.parse),
    ("GDACS",      gdacs.parse),
    ("NOAA",       noaa.parse),
    ("NHC",        nhc.parse),
    ("ReliefWeb",  who.parse),
]


async def fetch_all_disasters() -> list[dict]:
    global _cache

    async def _run(name, fn):
        try:
            events = await fn()
            logger.info(f"[{name}] fetched {len(events)} events")
            return events
        except Exception as e:
            logger.error(f"[{name}] failed: {e}")
            return []

    results = await asyncio.gather(*[_run(name, fn) for name, fn in PARSERS])
    all_events = [e for batch in results for e in batch]

    normalized = [normalize(e) for e in all_events]

    seen = set()
    deduped = []
    for e in normalized:
        if e["id"] not in seen:
            seen.add(e["id"])
            deduped.append(e)

    _cache = deduped
    logger.info(f"[Aggregator] Total cached: {len(_cache)} events")
    return _cache


def get_cache() -> list[dict]:
    return _cache
