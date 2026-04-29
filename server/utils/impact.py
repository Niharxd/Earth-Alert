from utils.population import estimate_affected_population

# Historical average impact ranges per disaster type and severity
IMPACT_MODELS = {
    "earthquake": {
        "extreme":  {"deaths": (10000, 100000), "displaced": (100000, 1000000), "economic_usd": (10e9, 100e9)},
        "severe":   {"deaths": (1000,  10000),  "displaced": (10000,  100000),  "economic_usd": (1e9,  10e9)},
        "high":     {"deaths": (100,   1000),   "displaced": (1000,   10000),   "economic_usd": (100e6, 1e9)},
        "moderate": {"deaths": (10,    100),    "displaced": (100,    1000),    "economic_usd": (10e6, 100e6)},
        "low":      {"deaths": (0,     10),     "displaced": (0,      100),     "economic_usd": (1e6,  10e6)},
    },
    "tsunami": {
        "extreme":  {"deaths": (5000,  50000),  "displaced": (50000,  500000),  "economic_usd": (5e9,  50e9)},
        "severe":   {"deaths": (500,   5000),   "displaced": (5000,   50000),   "economic_usd": (500e6, 5e9)},
        "high":     {"deaths": (50,    500),    "displaced": (500,    5000),    "economic_usd": (50e6, 500e6)},
        "moderate": {"deaths": (5,     50),     "displaced": (50,     500),     "economic_usd": (5e6,  50e6)},
        "low":      {"deaths": (0,     5),      "displaced": (0,      50),      "economic_usd": (1e6,  5e6)},
    },
    "hurricane": {
        "extreme":  {"deaths": (500,   5000),   "displaced": (500000, 5000000), "economic_usd": (20e9, 200e9)},
        "severe":   {"deaths": (100,   500),    "displaced": (100000, 500000),  "economic_usd": (5e9,  20e9)},
        "high":     {"deaths": (20,    100),    "displaced": (10000,  100000),  "economic_usd": (1e9,  5e9)},
        "moderate": {"deaths": (5,     20),     "displaced": (1000,   10000),   "economic_usd": (100e6, 1e9)},
        "low":      {"deaths": (0,     5),      "displaced": (100,    1000),    "economic_usd": (10e6, 100e6)},
    },
    "wildfire": {
        "extreme":  {"deaths": (50,    500),    "displaced": (50000,  500000),  "economic_usd": (5e9,  50e9)},
        "severe":   {"deaths": (10,    50),     "displaced": (5000,   50000),   "economic_usd": (500e6, 5e9)},
        "high":     {"deaths": (1,     10),     "displaced": (500,    5000),    "economic_usd": (50e6, 500e6)},
        "moderate": {"deaths": (0,     1),      "displaced": (50,     500),     "economic_usd": (5e6,  50e6)},
        "low":      {"deaths": (0,     0),      "displaced": (0,      50),      "economic_usd": (1e6,  5e6)},
    },
    "flood": {
        "extreme":  {"deaths": (500,   5000),   "displaced": (500000, 5000000), "economic_usd": (5e9,  50e9)},
        "severe":   {"deaths": (50,    500),    "displaced": (50000,  500000),  "economic_usd": (500e6, 5e9)},
        "high":     {"deaths": (5,     50),     "displaced": (5000,   50000),   "economic_usd": (50e6, 500e6)},
        "moderate": {"deaths": (1,     5),      "displaced": (500,    5000),    "economic_usd": (5e6,  50e6)},
        "low":      {"deaths": (0,     1),      "displaced": (50,     500),     "economic_usd": (1e6,  5e6)},
    },
    "volcano": {
        "extreme":  {"deaths": (1000,  10000),  "displaced": (100000, 1000000), "economic_usd": (5e9,  50e9)},
        "severe":   {"deaths": (100,   1000),   "displaced": (10000,  100000),  "economic_usd": (500e6, 5e9)},
        "high":     {"deaths": (10,    100),    "displaced": (1000,   10000),   "economic_usd": (50e6, 500e6)},
        "moderate": {"deaths": (1,     10),     "displaced": (100,    1000),    "economic_usd": (5e6,  50e6)},
        "low":      {"deaths": (0,     1),      "displaced": (10,     100),     "economic_usd": (1e6,  5e6)},
    },
    "tornado": {
        "extreme":  {"deaths": (50,    500),    "displaced": (5000,   50000),   "economic_usd": (1e9,  10e9)},
        "severe":   {"deaths": (10,    50),     "displaced": (500,    5000),    "economic_usd": (100e6, 1e9)},
        "high":     {"deaths": (1,     10),     "displaced": (50,     500),     "economic_usd": (10e6, 100e6)},
        "moderate": {"deaths": (0,     1),      "displaced": (5,      50),      "economic_usd": (1e6,  10e6)},
        "low":      {"deaths": (0,     0),      "displaced": (0,      5),       "economic_usd": (100e3, 1e6)},
    },
    "disease": {
        "extreme":  {"deaths": (10000, 1000000),"displaced": (0,      0),       "economic_usd": (10e9, 1000e9)},
        "severe":   {"deaths": (1000,  10000),  "displaced": (0,      0),       "economic_usd": (1e9,  10e9)},
        "high":     {"deaths": (100,   1000),   "displaced": (0,      0),       "economic_usd": (100e6, 1e9)},
        "moderate": {"deaths": (10,    100),    "displaced": (0,      0),       "economic_usd": (10e6, 100e6)},
        "low":      {"deaths": (0,     10),     "displaced": (0,      0),       "economic_usd": (1e6,  10e6)},
    },
}

DEFAULT_MODEL = {
    "extreme":  {"deaths": (100,  1000),  "displaced": (10000, 100000), "economic_usd": (1e9,  10e9)},
    "severe":   {"deaths": (10,   100),   "displaced": (1000,  10000),  "economic_usd": (100e6, 1e9)},
    "high":     {"deaths": (1,    10),    "displaced": (100,   1000),   "economic_usd": (10e6, 100e6)},
    "moderate": {"deaths": (0,    1),     "displaced": (10,    100),    "economic_usd": (1e6,  10e6)},
    "low":      {"deaths": (0,    0),     "displaced": (0,     10),     "economic_usd": (100e3, 1e6)},
}

def _fmt_money(v: float) -> str:
    if v >= 1e9:  return f"${v/1e9:.1f}B"
    if v >= 1e6:  return f"${v/1e6:.0f}M"
    return f"${v/1e3:.0f}K"

def _fmt_num(v: float) -> str:
    if v >= 1e6: return f"{v/1e6:.1f}M"
    if v >= 1e3: return f"{v/1e3:.0f}K"
    return str(int(v))

def predict_impact(event: dict) -> dict:
    event_type = event.get("type", "unknown")
    severity   = event.get("severity", "moderate")
    lat        = event.get("lat", 0)
    lon        = event.get("lon", 0)

    model     = IMPACT_MODELS.get(event_type, DEFAULT_MODEL)
    sev_model = model.get(severity, model.get("moderate", {}))

    deaths_lo,   deaths_hi   = sev_model.get("deaths",       (0, 0))
    displaced_lo, displaced_hi = sev_model.get("displaced",  (0, 0))
    econ_lo,     econ_hi     = sev_model.get("economic_usd", (0, 0))

    # Population multiplier — more people nearby = higher impact
    pop_data   = estimate_affected_population(lat, lon, radius_km=300)
    pop_est    = pop_data.get("estimate") or 0
    multiplier = min(max(pop_est / 5_000_000, 0.1), 3.0) if pop_est else 1.0

    deaths_est   = int(((deaths_lo + deaths_hi) / 2) * multiplier)
    displaced_est = int(((displaced_lo + displaced_hi) / 2) * multiplier)
    econ_est     = ((econ_lo + econ_hi) / 2) * multiplier

    # Confidence based on how much data we have
    has_magnitude = bool(event.get("magnitude"))
    has_pop       = pop_est > 0
    confidence    = "high" if (has_magnitude and has_pop) else "medium" if (has_magnitude or has_pop) else "low"

    return {
        "estimated_deaths":     deaths_est,
        "estimated_displaced":  displaced_est,
        "estimated_economic":   _fmt_money(econ_est),
        "deaths_range":         f"{_fmt_num(deaths_lo * multiplier)} – {_fmt_num(deaths_hi * multiplier)}",
        "displaced_range":      f"{_fmt_num(displaced_lo * multiplier)} – {_fmt_num(displaced_hi * multiplier)}",
        "economic_range":       f"{_fmt_money(econ_lo * multiplier)} – {_fmt_money(econ_hi * multiplier)}",
        "population_at_risk":   pop_est,
        "nearby_cities":        pop_data.get("nearby_cities", []),
        "confidence":           confidence,
        "note":                 "Estimates based on historical averages for similar events. Actual impact may vary significantly.",
    }
