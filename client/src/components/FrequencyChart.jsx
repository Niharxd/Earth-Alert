import { useEffect, useState } from 'react'
import { DISASTER_TYPES, SEVERITY_COLORS } from '../constants'

const TYPE_COLORS = {
  earthquake: '#ff6600', tsunami: '#0088ff', volcano: '#ff4400',
  hurricane:  '#4488ff', tornado: '#8844ff', storm:   '#44aaff',
  wildfire:   '#ff3300', flood:   '#00aaff', drought: '#ffaa00', disease: '#00cc88',
}

export default function FrequencyChart({ disasters }) {
  const counts = Object.keys(DISASTER_TYPES).map(type => ({
    type,
    label: DISASTER_TYPES[type].label,
    count: disasters.filter(d => d.type === type).length,
    color: TYPE_COLORS[type] || '#ff6600',
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count)

  const max = Math.max(...counts.map(c => c.count), 1)

  return (
    <div style={s.wrap}>
      <p style={s.title}>Active Events by Type</p>
      <div style={s.bars}>
        {counts.map(({ type, label, count, color }) => (
          <div key={type} style={s.row}>
            <span style={s.label}>{label}</span>
            <div style={s.barTrack}>
              <div style={{ ...s.bar, width: `${(count / max) * 100}%`, background: color }} />
            </div>
            <span style={{ ...s.count, color }}>{count}</span>
          </div>
        ))}
        {counts.length === 0 && <p style={s.empty}>No active events</p>}
      </div>
    </div>
  )
}

const s = {
  wrap:     { padding: '12px 0' },
  title:    { color: '#5a4535', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  bars:     { display: 'flex', flexDirection: 'column', gap: 8 },
  row:      { display: 'flex', alignItems: 'center', gap: 8 },
  label:    { color: '#8a7560', fontSize: 11, width: 72, flexShrink: 0 },
  barTrack: { flex: 1, height: 6, background: '#2a1f12', borderRadius: 3, overflow: 'hidden' },
  bar:      { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  count:    { fontSize: 11, fontWeight: 700, width: 24, textAlign: 'right', flexShrink: 0 },
  empty:    { color: '#5a4535', fontSize: 11, fontStyle: 'italic' },
}
