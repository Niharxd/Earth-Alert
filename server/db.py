import json
import aiosqlite
from datetime import datetime, timezone

DB_PATH = "earth_alert.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id          TEXT PRIMARY KEY,
                type        TEXT,
                category    TEXT,
                name        TEXT,
                lat         REAL,
                lon         REAL,
                severity    TEXT,
                source      TEXT,
                timestamp   TEXT,
                data        TEXT,
                first_seen  TEXT
            )
        """)
        await db.commit()


async def upsert_events(events: list[dict]):
    async with aiosqlite.connect(DB_PATH) as db:
        now = datetime.now(timezone.utc).isoformat()
        await db.executemany("""
            INSERT INTO events (id, type, category, name, lat, lon, severity, source, timestamp, data, first_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                severity  = excluded.severity,
                timestamp = excluded.timestamp,
                data      = excluded.data
        """, [
            (
                e["id"], e["type"], e["category"], e["name"],
                e["lat"], e["lon"], e["severity"], e["source"],
                e["timestamp"], json.dumps(e), now
            )
            for e in events
        ])
        await db.commit()


async def get_history(limit: int = 500, event_type: str = None, category: str = None) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        conditions, params = [], []
        if event_type:
            conditions.append("type = ?")
            params.append(event_type)
        if category:
            conditions.append("category = ?")
            params.append(category)
        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        params.append(limit)
        cursor = await db.execute(
            f"SELECT data FROM events {where} ORDER BY timestamp DESC LIMIT ?",
            params
        )
        rows = await cursor.fetchall()
        return [json.loads(r["data"]) for r in rows]


async def get_stats() -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT type, category, severity, COUNT(*) as count
            FROM events
            GROUP BY type, category, severity
        """)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]
