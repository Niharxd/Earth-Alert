# Approximate population (millions) and density (per km²) by country
# Used to estimate affected population near disaster coordinates

COUNTRY_POPULATION = {
    "China": (1400, 153), "India": (1380, 464), "United States": (331, 36),
    "Indonesia": (273, 151), "Pakistan": (220, 287), "Brazil": (213, 25),
    "Nigeria": (206, 226), "Bangladesh": (165, 1265), "Russia": (146, 9),
    "Ethiopia": (115, 115), "Mexico": (128, 66), "Japan": (126, 347),
    "Philippines": (109, 368), "Egypt": (102, 103), "DR Congo": (90, 40),
    "Vietnam": (97, 314), "Iran": (84, 52), "Turkey": (84, 110),
    "Germany": (83, 240), "Thailand": (70, 137), "United Kingdom": (67, 281),
    "France": (67, 123), "Tanzania": (60, 68), "South Africa": (59, 49),
    "Myanmar": (54, 83), "Kenya": (54, 95), "Colombia": (51, 46),
    "Spain": (47, 94), "Uganda": (46, 213), "Argentina": (45, 17),
    "Algeria": (44, 18), "Sudan": (44, 24), "Iraq": (40, 93),
    "Ukraine": (44, 77), "Afghanistan": (39, 60), "Poland": (38, 124),
    "Canada": (38, 4), "Morocco": (37, 83), "Saudi Arabia": (35, 16),
    "Peru": (33, 26), "Venezuela": (28, 33), "Malaysia": (32, 99),
    "Mozambique": (31, 40), "Ghana": (31, 137), "Nepal": (29, 204),
    "Yemen": (30, 57), "Australia": (26, 3), "North Korea": (26, 216),
    "Cameroon": (27, 57), "Madagascar": (27, 47), "Ivory Coast": (26, 83),
    "Niger": (24, 19), "Sri Lanka": (22, 341), "Burkina Faso": (21, 77),
    "Mali": (20, 16), "Romania": (19, 84), "Chile": (19, 26),
    "Kazakhstan": (19, 7), "Ecuador": (18, 71), "Guatemala": (17, 157),
    "Cambodia": (17, 95), "Zimbabwe": (15, 38), "Senegal": (17, 88),
    "Chad": (16, 13), "Somalia": (16, 25), "Rwanda": (13, 525),
    "Bolivia": (12, 11), "Haiti": (11, 413), "Burundi": (12, 463),
    "Tunisia": (12, 77), "Belgium": (11, 383), "Cuba": (11, 106),
    "Jordan": (10, 115), "Greece": (11, 83), "Czech Republic": (11, 139),
    "Portugal": (10, 112), "Sweden": (10, 25), "Hungary": (10, 108),
    "Azerbaijan": (10, 123), "Honduras": (10, 90), "Tajikistan": (10, 70),
    "Israel": (9, 418), "Switzerland": (9, 219), "Austria": (9, 107),
    "Papua New Guinea": (9, 20), "Sierra Leone": (8, 111),
    "Laos": (7, 30), "Libya": (7, 4), "El Salvador": (6, 309),
    "Nicaragua": (7, 54), "Kyrgyzstan": (7, 35), "Turkmenistan": (6, 12),
    "Singapore": (6, 8358), "Denmark": (6, 137), "Finland": (6, 18),
    "Norway": (5, 15), "New Zealand": (5, 19), "Costa Rica": (5, 99),
    "Ireland": (5, 72), "Oman": (5, 16), "Panama": (4, 57),
    "Kuwait": (4, 232), "Croatia": (4, 73), "Moldova": (4, 122),
    "Uruguay": (3, 20), "Armenia": (3, 104), "Albania": (3, 105),
    "Mongolia": (3, 2), "Jamaica": (3, 270), "Qatar": (3, 248),
    "Namibia": (3, 3), "Botswana": (2, 4), "Lesotho": (2, 68),
    "Gambia": (2, 207), "Gabon": (2, 8), "Mauritania": (4, 4),
    "Fiji": (1, 49), "Guyana": (1, 4), "Bhutan": (1, 20),
}

# Major city population hotspots (lat, lon, population_millions, name)
CITY_HOTSPOTS = [
    (35.68, 139.69, 37.4, "Tokyo"), (28.67, 77.22, 30.3, "Delhi"),
    (31.23, 121.47, 27.1, "Shanghai"), (23.73, 90.40, 21.0, "Dhaka"),
    (19.08, 72.88, 20.7, "Mumbai"), (-23.55, -46.63, 21.8, "São Paulo"),
    (40.71, -74.01, 18.8, "New York"), (30.06, 31.25, 20.9, "Cairo"),
    (6.52, 3.38, 14.8, "Lagos"), (39.93, 116.39, 21.5, "Beijing"),
    (34.69, 135.50, 19.3, "Osaka"), (37.57, 126.98, 9.8, "Seoul"),
    (1.35, 103.82, 5.9, "Singapore"), (13.75, 100.52, 10.7, "Bangkok"),
    (14.60, 120.98, 13.9, "Manila"), (3.14, 101.69, 8.2, "Kuala Lumpur"),
    (28.61, 77.21, 30.3, "New Delhi"), (-6.21, 106.85, 10.6, "Jakarta"),
    (24.87, 67.01, 16.1, "Karachi"), (33.69, 73.06, 1.1, "Islamabad"),
    (51.51, -0.13, 9.3, "London"), (48.85, 2.35, 11.0, "Paris"),
    (52.52, 13.40, 3.7, "Berlin"), (55.75, 37.62, 12.5, "Moscow"),
    (-33.87, 151.21, 5.3, "Sydney"), (-37.81, 144.96, 5.0, "Melbourne"),
    (43.65, -79.38, 6.3, "Toronto"), (45.51, -73.55, 4.2, "Montreal"),
    (19.43, -99.13, 21.6, "Mexico City"), (4.71, -74.07, 10.9, "Bogotá"),
    (-12.05, -77.04, 10.9, "Lima"), (-34.60, -58.38, 15.2, "Buenos Aires"),
    (33.57, -7.59, 4.3, "Casablanca"), (-26.20, 28.04, 5.6, "Johannesburg"),
    (-4.32, 15.32, 14.3, "Kinshasa"), (9.05, 7.49, 3.6, "Abuja"),
    (6.37, 2.39, 2.4, "Cotonou"), (12.37, -1.53, 2.8, "Ouagadougou"),
]

import math

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def estimate_affected_population(lat: float, lon: float, radius_km: float = 200) -> dict:
    """Estimate population within radius_km of coordinates."""
    if lat == 0 and lon == 0:
        return {"estimate": None, "nearby_cities": []}

    nearby_cities = []
    for clat, clon, pop, name in CITY_HOTSPOTS:
        dist = _haversine(lat, lon, clat, clon)
        if dist <= radius_km:
            nearby_cities.append({"name": name, "population_m": pop, "distance_km": round(dist)})

    nearby_cities.sort(key=lambda x: x["distance_km"])

    # Rough estimate based on nearby cities
    if nearby_cities:
        estimate = sum(c["population_m"] for c in nearby_cities[:3]) * 1_000_000
    else:
        estimate = None

    return {
        "estimate": int(estimate) if estimate else None,
        "nearby_cities": nearby_cities[:5],
    }
