import { useState, useEffect } from 'react'
import { X, ExternalLink, MapPin, Clock, Database, Users, Activity, Waves, Mountain, Wind, CloudLightning, CloudRain, Flame, Droplets, Sun, Biohazard, AlertTriangle } from 'lucide-react'
import { SEVERITY_COLORS, DISASTER_TYPES, CATEGORIES } from '../constants'

const TYPE_ICONS = {
  earthquake: Activity,
  tsunami:    Waves,
  volcano:    Mountain,
  hurricane:  Wind,
  tornado:    CloudLightning,
  storm:      CloudRain,
  wildfire:   Flame,
  flood:      Droplets,
  drought:    Sun,
  disease:    Biohazard,
}

export default function DetailPanel({ disaster, onClose }) {
  if (!disaster) return null

  const color    = SEVERITY_COLORS[disaster.severity] || '#aaa'
  const typeInfo  = DISASTER_TYPES[disaster.type] || { label: disaster.type }
  const catInfo   = CATEGORIES[disaster.category]  || { label: disaster.category }
  const TypeIcon  = TYPE_ICONS[disaster.type] || AlertTriangle

  const [population, setPopulation] = useState(null)
  const [impact,     setImpact]     = useState(null)

  useEffect(() => {
    if (disaster?.lat && disaster?.lon && !(disaster.lat === 0 && disaster.lon === 0)) {
      fetch(`/api/disasters/${encodeURIComponent(disaster.id)}/population`)
        .then(r => r.json()).then(setPopulation).catch(() => {})
      fetch(`/api/disasters/${encodeURIComponent(disaster.id)}/impact`)
        .then(r => r.json()).then(setImpact).catch(() => {})
    } else {
      setPopulation(null)
      setImpact(null)
    }
  }, [disaster?.id])

  const stats = [
    disaster.magnitude  && { label: 'Magnitude',  value: `M${disaster.magnitude}` },
    disaster.depth_km   && { label: 'Depth',       value: `${disaster.depth_km} km` },
    disaster.wind_mph   && { label: 'Wind Speed',  value: `${disaster.wind_mph} mph` },
    disaster.pressure_mb&& { label: 'Pressure',    value: `${disaster.pressure_mb} mb` },
    disaster.frp        && { label: 'Fire Power',  value: `${disaster.frp} MW` },
    disaster.brightness && { label: 'Brightness',  value: `${disaster.brightness} K` },
    disaster.deaths     && { label: 'Deaths',      value: disaster.deaths.toLocaleString() },
    disaster.affected   && { label: 'Affected',    value: disaster.affected.toLocaleString() },
  ].filter(Boolean)

  const hasCoords = disaster.lat !== 0 || disaster.lon !== 0

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={{ ...s.header, background: `linear-gradient(135deg, ${color}18, transparent)` }}>
        <div style={s.headerTop}>
          <div style={{ ...s.severityBadge, background: `${color}22`, border: `1px solid ${color}55`, color }}>
            {disaster.severity.toUpperCase()}
          </div>
          <button style={s.close} onClick={onClose}><X size={15} /></button>
        </div>
        <div style={s.typeRow}>
          <div style={{ ...s.typeIconWrap, background: `${color}18`, border: `1px solid ${color}33` }}>
            <TypeIcon size={20} color={color} />
          </div>
          <div>
            <div style={{ ...s.typeLabel, color }}>{typeInfo.label}</div>
            <div style={s.catLabel}>{catInfo.label}</div>
          </div>
        </div>
        <p style={s.name}>{disaster.name}</p>
      </div>

      <div style={s.body}>
        {/* Stats grid */}
        {stats.length > 0 && (
          <div style={s.statsGrid}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{ ...s.statBox, borderColor: `${color}22` }}>
                <div style={s.statVal}>{value}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Meta */}
        <div style={s.meta}>
          {hasCoords && (
            <div style={s.metaRow}>
              <MapPin size={11} color="#444" />
              <span style={s.metaVal}>{disaster.lat.toFixed(3)}°, {disaster.lon.toFixed(3)}°</span>
            </div>
          )}
          <div style={s.metaRow}>
            <Clock size={11} color="#444" />
            <span style={s.metaVal}>{new Date(disaster.timestamp).toLocaleString()}</span>
          </div>
          <div style={s.metaRow}>
            <Database size={11} color="#444" />
            <span style={s.metaVal}>{disaster.source}</span>
          </div>
          {population?.estimate && (
            <div style={s.metaRow}>
              <Users size={11} color="#444" />
              <span style={s.metaVal}>~{(population.estimate / 1_000_000).toFixed(1)}M people within 200km</span>
            </div>
          )}
        </div>
        {population?.nearby_cities?.length > 0 && (
          <div style={s.cities}>
            <p style={s.citiesTitle}>Nearby cities</p>
            {population.nearby_cities.map(c => (
              <div key={c.name} style={s.cityRow}>
                <span style={s.cityName}>{c.name}</span>
                <span style={s.cityDist}>{c.distance_km} km · {c.population_m}M</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {disaster.description && disaster.description !== disaster.name && (
          <div style={s.desc}>
            <p style={s.descText}>{disaster.description.slice(0, 300)}{disaster.description.length > 300 ? '...' : ''}</p>
          </div>
        )}

        {/* Predicted Impact */}
        {impact && (
          <div style={s.impactBox}>
            <p style={s.impactTitle}>⚠️ Predicted Impact <span style={s.confidence}>{impact.confidence} confidence</span></p>
            <div style={s.impactGrid}>
              <div style={s.impactItem}>
                <span style={s.impactVal}>{impact.deaths_range}</span>
                <span style={s.impactLabel}>Est. Deaths</span>
              </div>
              <div style={s.impactItem}>
                <span style={s.impactVal}>{impact.displaced_range}</span>
                <span style={s.impactLabel}>Displaced</span>
              </div>
              <div style={{ ...s.impactItem, gridColumn: '1 / -1' }}>
                <span style={s.impactVal}>{impact.economic_range}</span>
                <span style={s.impactLabel}>Economic Loss</span>
              </div>
            </div>
            <p style={s.impactNote}>{impact.note}</p>
          </div>
        )}

        {/* Link */}
        {disaster.url && (
          <a href={disaster.url} target="_blank" rel="noreferrer" style={{ ...s.link, background: `${color}18`, border: `1px solid ${color}33`, color }}>
            {disaster.source === 'NOAA/NWS'  ? 'View on weather.gov' :
             disaster.source === 'USGS'      ? 'View on USGS' :
             disaster.source === 'GDACS'     ? 'View on GDACS' :
             disaster.source === 'ReliefWeb' ? 'View on ReliefWeb' :
             disaster.source === 'NASA FIRMS'? 'View on NASA FIRMS' :
             'View full report'} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

const s = {
  panel: {
    position: 'absolute', top: 0, right: 0, width: 310, height: '100%',
    background: '#141008', borderLeft: '1px solid #3d2e1e',
    display: 'flex', flexDirection: 'column', zIndex: 1000,
    animation: 'slideIn 0.25s ease-out', overflowY: 'auto',
  },
  header:     { padding: '14px 14px 10px', flexShrink: 0 },
  headerTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  severityBadge: { fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: '3px 10px', borderRadius: 20 },
  close:      { background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', padding: 4 },
  typeRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  typeIconWrap:{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeLabel:  { fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  catLabel:   { color: '#444', fontSize: 11, marginTop: 2 },
  name:       { color: '#ccc', fontSize: 13, lineHeight: 1.5, fontWeight: 500 },
  body:       { padding: '10px 14px', flex: 1 },
  statsGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 },
  statBox:    { background: '#1c1510', border: '1px solid', borderRadius: 8, padding: '8px 10px' },
  statVal:    { color: '#e8ddd0', fontWeight: 700, fontSize: 15 },
  statLabel:  { color: '#5a4535', fontSize: 10, marginTop: 2 },
  meta:       { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, padding: '10px 0', borderTop: '1px solid #2a1f12', borderBottom: '1px solid #2a1f12' },
  metaRow:    { display: 'flex', alignItems: 'center', gap: 6 },
  metaVal:    { color: '#555', fontSize: 11 },
  desc:       { marginBottom: 12 },
  descText:   { color: '#555', fontSize: 12, lineHeight: 1.7 },
  link:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', width: '100%' },
  cities:     { background: '#12121e', borderRadius: 8, padding: '8px 10px', marginBottom: 12 },
  citiesTitle:{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  cityRow:    { display: 'flex', justifyContent: 'space-between', padding: '3px 0' },
  cityName:   { color: '#888', fontSize: 11 },
  cityDist:   { color: '#444', fontSize: 11 },
  impactBox:  { background: '#1c1510', border: '1px solid #3d2e1e', borderRadius: 10, padding: '10px 12px', marginBottom: 12 },
  impactTitle:{ color: '#c4b49a', fontSize: 11, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  confidence: { color: '#5a4535', fontSize: 9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  impactGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 },
  impactItem: { background: '#141008', borderRadius: 6, padding: '6px 8px' },
  impactVal:  { color: '#ff6600', fontSize: 12, fontWeight: 700, display: 'block' },
  impactLabel:{ color: '#5a4535', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  impactNote: { color: '#5a4535', fontSize: 9, lineHeight: 1.5, fontStyle: 'italic' },
}
