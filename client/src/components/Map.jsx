import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Circle, useMapEvents, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import HeatmapLayer from './HeatmapLayer'
import WeatherLayer from './WeatherLayer'
import { SEVERITY_COLORS } from '../constants'
import { useTheme } from '../context/ThemeContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const EMOJI_MAP = {
  earthquake: '🌍', tsunami: '🌊', volcano: '🌋', hurricane: '🌀',
  tornado: '🌪️', storm: '⛈️', wildfire: '🔥', flood: '💧',
  drought: '☀️', disease: '🦠',
}

const TILES = {
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain:   'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
}

const makeIcon = (type, severity) => {
  const color   = SEVERITY_COLORS[severity] || '#aaa'
  const emoji   = EMOJI_MAP[type] || '⚠️'
  const size    = severity === 'extreme' ? 38 : severity === 'severe' ? 34 : 30
  const pulse   = severity === 'extreme'
    ? `<div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:pulse 1.8s ease-in-out infinite;"></div>`
    : ''
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="position:absolute;inset:0;border-radius:50%;background:${color}20;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.48)}px;box-shadow:0 0 14px ${color}55;cursor:pointer;">${emoji}</div>
    </div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  const size  = count > 100 ? 46 : count > 20 ? 40 : 34
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,102,0,0.15);border:2px solid rgba(255,102,0,0.6);display:flex;align-items:center;justify-content:center;color:#ff6600;font-weight:700;font-size:${size > 40 ? 13 : 11}px;box-shadow:0 0 14px rgba(255,102,0,0.3);">${count}</div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function AutoZoom({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected && (selected.lat !== 0 || selected.lon !== 0)) {
      map.flyTo([selected.lat, selected.lon], Math.max(map.getZoom(), 5), { duration: 1.2 })
    }
  }, [selected, map])
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], target.zoom || 6, { duration: 1.5 })
  }, [target, map])
  return null
}

function RadiusClickHandler({ radiusMode, onRadiusSet }) {
  useMapEvents({
    click(e) {
      if (radiusMode) onRadiusSet({ lat: e.latlng.lat, lon: e.latlng.lng })
    }
  })
  return null
}

function Markers({ disasters, onSelect }) {
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  return (
    <MarkerClusterGroup
      chunkedLoading maxClusterRadius={50}
      spiderfyOnMaxZoom showCoverageOnHover={false}
      iconCreateFunction={createClusterIcon}
    >
      {disasters.filter(d => d.lat != null && d.lon != null && !(d.lat === 0 && d.lon === 0)).map((d) => (
        <Marker
          key={d.id}
          position={[d.lat, d.lon]}
          icon={makeIcon(d.type, d.severity)}
          eventHandlers={{ click: () => onSelectRef.current(d) }}
        />
      ))}
    </MarkerClusterGroup>
  )
}

const RADIUS_OPTIONS = [100, 250, 500, 1000] // km

export default function Map({ disasters, onSelect, selected, showHeatmap, flyTarget, userLocation, weatherLayer }) {
  const { theme }       = useTheme()
  const [tileMode, setTileMode]     = useState('dark')
  const [radiusMode, setRadiusMode] = useState(false)
  const [radiusKm, setRadiusKm]     = useState(250)
  const [radiusCenter, setRadiusCenter] = useState(null)
  const [searchVal, setSearchVal]   = useState('')

  const tileUrl = tileMode === 'dark' ? theme.mapTile : TILES[tileMode]

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchVal)}&format=json&limit=1`)
      const data = await r.json()
      if (data[0]) {
        setRadiusCenter({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) })
      }
    } catch {}
  }

  const nearbyCount = radiusCenter
    ? disasters.filter(d => {
        if (!d.lat || !d.lon) return false
        const R = 6371
        const dLat = (d.lat - radiusCenter.lat) * Math.PI / 180
        const dLon = (d.lon - radiusCenter.lon) * Math.PI / 180
        const a = Math.sin(dLat/2)**2 + Math.cos(radiusCenter.lat * Math.PI/180) * Math.cos(d.lat * Math.PI/180) * Math.sin(dLon/2)**2
        return R * 2 * Math.asin(Math.sqrt(a)) <= radiusKm
      }).length
    : 0

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* Map toolbar */}
      <div style={s.toolbar}>
        {/* Location search */}
        <form onSubmit={handleSearch} style={s.searchForm}>
          <input
            style={s.searchInput}
            placeholder="Search location..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
          <button type="submit" style={s.searchBtn}>→</button>
        </form>

        {/* Tile switcher */}
        <div style={s.tileGroup}>
          {Object.keys(TILES).map(mode => (
            <button
              key={mode}
              style={{ ...s.tileBtn, background: tileMode === mode ? '#ff660033' : '#1c1510', color: tileMode === mode ? '#ff6600' : '#8a7560', border: `1px solid ${tileMode === mode ? '#ff660066' : '#3d2e1e'}` }}
              onClick={() => setTileMode(mode)}
            >
              {mode === 'dark' ? '🌑' : mode === 'satellite' ? '🛰️' : '🏔️'}
            </button>
          ))}
        </div>

        {/* Radius tool */}
        <button
          style={{ ...s.toolBtn, background: radiusMode ? '#ff660033' : '#1c1510', color: radiusMode ? '#ff6600' : '#8a7560', border: `1px solid ${radiusMode ? '#ff660066' : '#3d2e1e'}` }}
          onClick={() => { setRadiusMode(v => !v); if (radiusMode) setRadiusCenter(null) }}
          title="Draw radius (click map)"
        >
          ⭕ Radius
        </button>

        {radiusMode && (
          <select
            style={s.radiusSelect}
            value={radiusKm}
            onChange={e => setRadiusKm(Number(e.target.value))}
          >
            {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
          </select>
        )}

        {radiusCenter && (
          <span style={s.radiusCount}>{nearbyCount} events within {radiusKm}km</span>
        )}
      </div>

      <MapContainer center={[20, 0]} zoom={2} minZoom={2} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer url={tileUrl} attribution='&copy; CARTO / Esri' maxZoom={19} />
        <ZoomControl position="bottomright" />

        {weatherLayer && <WeatherLayer layer={weatherLayer} />}

        {showHeatmap && <HeatmapLayer disasters={disasters} />}
        {!showHeatmap && <Markers disasters={disasters} onSelect={onSelect} />}

        {radiusCenter && (
          <Circle
            center={[radiusCenter.lat, radiusCenter.lon]}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#ff6600', fillColor: '#ff6600', fillOpacity: 0.08, weight: 2 }}
          />
        )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={L.divIcon({
              html: `<div style="width:14px;height:14px;border-radius:50%;background:#4488ff;border:3px solid #fff;box-shadow:0 0 10px #4488ff;"></div>`,
              className: '', iconSize: [14, 14], iconAnchor: [7, 7],
            })}
          />
        )}

        <AutoZoom selected={selected} />
        {flyTarget && <FlyTo target={flyTarget} />}
        <RadiusClickHandler radiusMode={radiusMode} onRadiusSet={setRadiusCenter} />
      </MapContainer>
    </div>
  )
}

const s = {
  toolbar:      { position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', maxWidth: 'calc(100% - 20px)' },
  searchForm:   { display: 'flex', background: '#141008', border: '1px solid #3d2e1e', borderRadius: 8, overflow: 'hidden' },
  searchInput:  { background: 'none', border: 'none', color: '#e8ddd0', fontSize: 12, padding: '6px 10px', outline: 'none', width: 160 },
  searchBtn:    { background: '#ff660022', border: 'none', color: '#ff6600', padding: '6px 10px', cursor: 'pointer', fontSize: 13 },
  tileGroup:    { display: 'flex', gap: 4 },
  tileBtn:      { borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  toolBtn:      { borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 },
  radiusSelect: { background: '#141008', border: '1px solid #3d2e1e', color: '#e8ddd0', borderRadius: 6, padding: '5px 8px', fontSize: 11 },
  radiusCount:  { background: '#ff660022', border: '1px solid #ff660044', color: '#ff6600', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600 },
}
