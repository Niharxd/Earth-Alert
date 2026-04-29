import logging
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.aggregator import fetch_all_disasters, get_cache
from db import init_db, upsert_events, get_history, get_stats
from utils.correlation import find_correlations
from utils.trends import get_trends
from utils.population import estimate_affected_population
from utils.impact import predict_impact
from services.parsers.news import fetch_news

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"[WS] Client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
        logger.info(f"[WS] Client disconnected. Total: {len(self.active)}")

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)

manager = ConnectionManager()


async def refresh_and_broadcast():
    logger.info("[CRON] Refreshing disaster data...")
    prev_ids = {e["id"] for e in get_cache()}
    events   = await fetch_all_disasters()
    await upsert_events(events)

    new_events = [e for e in events if e["id"] not in prev_ids]
    if manager.active:
        await manager.broadcast({
            "type":       "update",
            "count":      len(events),
            "new_count":  len(new_events),
            "new_events": new_events,
            "updated":    datetime.now(timezone.utc).isoformat(),
        })
    if new_events:
        logger.info(f"[WS] Broadcast {len(new_events)} new events to {len(manager.active)} clients")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await refresh_and_broadcast()
    scheduler.add_job(refresh_and_broadcast, "interval", minutes=15, id="refresh")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Earth Alert API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# ── REST endpoints ──────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat(), "clients": len(manager.active)}

@app.get("/api/disasters")
def get_all():
    data = get_cache()
    return {"count": len(data), "updated": datetime.now(timezone.utc).isoformat(), "disasters": data}

@app.get("/api/disasters/category/{category}")
def get_by_category(category: str):
    data = [d for d in get_cache() if d["category"] == category]
    return {"count": len(data), "category": category, "disasters": data}

@app.get("/api/disasters/type/{type}")
def get_by_type(type: str):
    data = [d for d in get_cache() if d["type"] == type]
    return {"count": len(data), "type": type, "disasters": data}

@app.get("/api/disasters/{id}")
def get_by_id(id: str):
    item = next((d for d in get_cache() if d["id"] == id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@app.get("/api/history")
async def history(
    limit:    int           = Query(500, le=2000),
    type:     Optional[str] = None,
    category: Optional[str] = None,
):
    data = await get_history(limit=limit, event_type=type, category=category)
    return {"count": len(data), "events": data}

@app.get("/api/stats")
async def stats():
    return {"stats": await get_stats()}

@app.get("/api/correlations")
def correlations():
    return {"correlations": find_correlations(get_cache())}

@app.get("/api/trends")
async def trends(days: int = Query(7, le=30)):
    return await get_trends(days=days)

@app.get("/api/population")
def population(lat: float, lon: float, radius_km: float = 200):
    return estimate_affected_population(lat, lon, radius_km)

@app.get("/api/disasters/{id}/population")
def disaster_population(id: str):
    item = next((d for d in get_cache() if d["id"] == id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return estimate_affected_population(item["lat"], item["lon"])

@app.get("/api/disasters/{id}/impact")
def disaster_impact(id: str):
    item = next((d for d in get_cache() if d["id"] == id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return predict_impact(item)

@app.get("/api/news")
async def news(q: Optional[str] = None):
    articles = await fetch_news(query=q)
    return {"count": len(articles), "articles": articles}

@app.get("/api/export")
def export():
    from fastapi.responses import Response
    import json
    data = get_cache()
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=earth_alert_export.json"}
    )

@app.get("/api/export/csv")
def export_csv():
    from fastapi.responses import Response
    import csv, io
    data = get_cache()
    if not data:
        return Response(content="", media_type="text/csv")
    buf = io.StringIO()
    fields = ["id","type","category","name","lat","lon","severity","magnitude","depth_km","wind_mph","frp","deaths","affected","source","url","timestamp"]
    w = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    w.writerows(data)
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=earth_alert_export.csv"}
    )


# ── WebSocket ───────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        # Send current data immediately on connect
        await ws.send_json({
            "type":    "init",
            "count":   len(get_cache()),
            "events":  get_cache(),
            "updated": datetime.now(timezone.utc).isoformat(),
        })
        while True:
            await ws.receive_text()  # keep alive
    except WebSocketDisconnect:
        manager.disconnect(ws)
