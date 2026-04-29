from datetime import datetime, timezone, timedelta
import aiosqlite
from db import DB_PATH


async def get_trends(days: int = 7) -> dict:
    """Return daily event counts per type for the last N days."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Daily counts per type
        cursor = await db.execute("""
            SELECT
                type,
                DATE(timestamp) as day,
                COUNT(*) as count
            FROM events
            WHERE timestamp >= ?
            GROUP BY type, day
            ORDER BY day ASC
        """, (since,))
        rows = await cursor.fetchall()

        # Total per type
        cursor2 = await db.execute("""
            SELECT type, COUNT(*) as total, MAX(timestamp) as latest
            FROM events
            WHERE timestamp >= ?
            GROUP BY type
        """, (since,))
        totals = await cursor2.fetchall()

    # Build day labels
    day_labels = [(datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days-1, -1, -1)]

    # Group by type
    by_type = {}
    for row in rows:
        t = row["type"]
        if t not in by_type:
            by_type[t] = {d: 0 for d in day_labels}
        if row["day"] in by_type[t]:
            by_type[t][row["day"]] = row["count"]

    sparklines = {
        t: [counts[d] for d in day_labels]
        for t, counts in by_type.items()
    }

    summary = {
        row["type"]: {"total": row["total"], "latest": row["latest"]}
        for row in totals
    }

    return {
        "days":      day_labels,
        "sparklines": sparklines,
        "summary":   summary,
    }
