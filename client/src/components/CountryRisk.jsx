import { useMemo } from 'react'
import { SEVERITY_COLORS } from '../constants'

const SEVERITY_SCORE = { extreme: 5, severe: 4, high: 3, moderate: 2, low: 1 }

// Extract country from event name
function extractCountry(name) {
  if (!name) return null
  if (name.includes(':')) return name.split(':')[0].trim()
  const words = name.split(' ')
  if (words.length <= 3) return name
  return null
}

export default function CountryRisk({ disasters, onFlyTo }) {
  const risks = useMemo(() => {
    const map = {}
    disasters.forEach(d => {
      const country = extractCountry(d.name)
      if (!country || country.length > 30) return
      if (!map[country]) map[country] = { country, count: 0, score: 0, worst: 'low' }
      map[country].count++
      map[country].score += SEVERITY_SCORE[d.severity] || 1
      if ((SEVERITY_SCORE[d.severity] || 0) > (SEVERITY_SCORE[map[country].worst] || 0)) {
        map[country].worst = d.severity
      }
    })
    return Object.values(map).sort((a, b) => b.score - a.score).slice(0, 10)
  }, [disasters])

  return (
    <div style={s.wrap}>
      <p style={s.title}>Country Risk Index</p>
      <div style={s.list}>
        {risks.map(({ country, count, score, worst }, i) => {
          const color = SEVERITY_COLORS[worst] || '#aaa'
          return (
            <div key={country} style={s.row} onClick={() => onFlyTo && onFlyTo(country)}>
              <span style={s.rank}>#{i + 1}</span>
              <div style={s.info}>
                <span style={s.name}>{country}</span>
                <div style={s.bar}>
                  <div style={{ ...s.barFill, width: `${Math.min((score / 25) * 100, 100)}%`, background: color }} />
                </div>
              </div>
              <div style={s.meta}>
                <span style={{ ...s.badge, color, borderColor: `${color}44`, background: `${color}18` }}>{worst}</span>
                <span style={s.count}>{count}</span>
              </div>
            </div>
          )
        })}
        {risks.length === 0 && <p style={s.empty}>No data yet</p>}
      </div>
    </div>
  )
}

const s = {
  wrap:    { padding: '12px 0' },
  title:   { color: '#5a4535', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  list:    { display: 'flex', flexDirection: 'column', gap: 6 },
  row:     { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: '#1c1510', borderRadius: 8, cursor: 'pointer' },
  rank:    { color: '#5a4535', fontSize: 10, fontWeight: 700, width: 20, flexShrink: 0 },
  info:    { flex: 1, minWidth: 0 },
  name:    { color: '#c4b49a', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  bar:     { height: 3, background: '#2a1f12', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  meta:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  badge:   { fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, border: '1px solid', textTransform: 'uppercase' },
  count:   { color: '#5a4535', fontSize: 10 },
  empty:   { color: '#5a4535', fontSize: 11, fontStyle: 'italic' },
}
