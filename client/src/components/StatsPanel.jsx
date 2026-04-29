import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, X } from 'lucide-react'
import Sparkline from './Sparkline'
import FrequencyChart from './FrequencyChart'
import CountryRisk from './CountryRisk'
import { DISASTER_TYPES, SEVERITY_COLORS } from '../constants'

export default function StatsPanel({ disasters, onClose, onFlyTo }) {
  const [trends, setTrends]             = useState(null)
  const [correlations, setCorrelations] = useState([])
  const [tab, setTab]                   = useState('frequency')

  useEffect(() => {
    fetch('/api/trends').then(r => r.json()).then(setTrends).catch(() => {})
    fetch('/api/correlations').then(r => r.json()).then(d => setCorrelations(d.correlations || [])).catch(() => {})
  }, [])

  const TABS = [
    { id: 'frequency',    label: 'Frequency' },
    { id: 'countries',    label: 'Risk Index' },
    { id: 'trends',       label: '7-Day Trends' },
    { id: 'correlations', label: 'Correlations' },
  ]

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>Analytics</span>
        <button style={s.close} onClick={onClose}><X size={14} /></button>
      </div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.body}>
        {tab === 'frequency' && <FrequencyChart disasters={disasters} />}

        {tab === 'countries' && <CountryRisk disasters={disasters} onFlyTo={onFlyTo} />}

        {tab === 'trends' && (
          trends ? (
            <div style={s.sparklines}>
              {Object.entries(trends.sparklines || {}).map(([type, data]) => {
                const info  = DISASTER_TYPES[type] || { label: type }
                const color = '#ff6600'
                const total = trends.summary?.[type]?.total || 0
                return (
                  <div key={type} style={s.sparkRow}>
                    <span style={s.sparkLabel}>{info.label}</span>
                    <Sparkline data={data} color={color} width={80} height={20} />
                    <span style={{ ...s.sparkCount, color }}>{total}</span>
                  </div>
                )
              })}
              {!Object.keys(trends.sparklines || {}).length && <p style={s.empty}>Collecting data...</p>}
            </div>
          ) : <p style={s.empty}>Loading...</p>
        )}

        {tab === 'correlations' && (
          correlations.length === 0
            ? <p style={s.empty}>No correlated events detected</p>
            : correlations.map((c, i) => (
              <div key={i} style={{ ...s.corrCard, borderColor: SEVERITY_COLORS[c.severity] + '44' }}>
                <div style={{ ...s.corrBadge, color: SEVERITY_COLORS[c.severity] }}>
                  {DISASTER_TYPES[c.type_a]?.label} + {DISASTER_TYPES[c.type_b]?.label}
                </div>
                <p style={s.corrMsg}>{c.message}</p>
                <p style={s.corrMeta}>{c.distance_km} km apart · {c.hours_apart}h difference</p>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

const s = {
  panel:      { position: 'relative', width: 320, maxHeight: '60vh', background: '#141008', border: '1px solid #3d2e1e', borderRadius: '0 12px 12px 0', zIndex: 1001, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out', boxShadow: '4px 0 24px rgba(0,0,0,0.5)' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #3d2e1e' },
  title:      { color: '#e8ddd0', fontWeight: 700, fontSize: 13 },
  close:      { background: 'none', border: 'none', color: '#5a4535', cursor: 'pointer', display: 'flex' },
  tabs:       { display: 'flex', borderBottom: '1px solid #2a1f12', flexShrink: 0 },
  tab:        { flex: 1, padding: '7px 4px', background: 'none', border: 'none', color: '#5a4535', fontSize: 10, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 },
  tabActive:  { color: '#ff6600', borderBottom: '2px solid #ff6600' },
  body:       { overflowY: 'auto', flex: 1, padding: '10px 14px' },
  sparklines: { display: 'flex', flexDirection: 'column', gap: 8 },
  sparkRow:   { display: 'flex', alignItems: 'center', gap: 8 },
  sparkLabel: { color: '#8a7560', fontSize: 11, width: 70 },
  sparkCount: { fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: 'right' },
  corrCard:   { background: '#1c1510', border: '1px solid', borderRadius: 8, padding: '8px 10px', marginBottom: 6 },
  corrBadge:  { fontSize: 12, marginBottom: 4, fontWeight: 600 },
  corrMsg:    { color: '#c4b49a', fontSize: 11, marginBottom: 4 },
  corrMeta:   { color: '#5a4535', fontSize: 10 },
  empty:      { color: '#5a4535', fontSize: 11, fontStyle: 'italic' },
}
