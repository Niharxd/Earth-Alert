import { SEVERITY_COLORS, DISASTER_TYPES, SEVERITY_ORDER } from '../constants'

const SORT_WEIGHT = SEVERITY_ORDER.reduce((a, s, i) => ({ ...a, [s]: i }), {})

export default function EventList({ disasters, onSelect, selected }) {
  const sorted = [...disasters].sort((a, b) =>
    (SORT_WEIGHT[a.severity] ?? 99) - (SORT_WEIGHT[b.severity] ?? 99)
  )

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>Events</span>
        <span style={s.count}>{disasters.length}</span>
      </div>
      <div style={s.list}>
        {sorted.length === 0 && (
          <div style={s.empty}>No events match filters</div>
        )}
        {sorted.map((d) => {
          const color    = SEVERITY_COLORS[d.severity] || '#aaa'
          const typeInfo = DISASTER_TYPES[d.type] || { emoji: '⚠️' }
          const isActive = selected?.id === d.id
          return (
            <button
              key={d.id}
              style={{
                ...s.item,
                background: isActive ? `${color}14` : 'transparent',
                borderLeft: `3px solid ${isActive ? color : 'transparent'}`,
              }}
              onClick={() => onSelect(d)}
            >
              <span style={s.emoji}>{typeInfo.emoji}</span>
              <div style={s.info}>
                <div style={s.name}>{d.name}</div>
                <div style={s.sub}>
                  <span style={{ ...s.sev, color }}>{d.severity}</span>
                  <span style={s.dot2}>·</span>
                  <span style={s.src}>{d.source}</span>
                </div>
              </div>
              <div style={{ ...s.bar, background: color }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  wrap:  { width: 240, background: '#141008', borderRight: '1px solid #3d2e1e', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  header:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 8px', borderBottom: '1px solid #2a1f12', flexShrink: 0 },
  title: { color: '#5a4535', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' },
  count: { background: '#ff660018', color: '#ff6600', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, border: '1px solid #ff660033' },
  list:  { overflowY: 'auto', flex: 1 },
  empty: { color: '#333', fontSize: 12, textAlign: 'center', padding: '30px 16px' },
  item:  { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', position: 'relative', borderLeft: '3px solid transparent' },
  emoji: { fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' },
  info:  { flex: 1, minWidth: 0 },
  name:  { color: '#bbb', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 },
  sub:   { display: 'flex', alignItems: 'center', gap: 4 },
  sev:   { fontSize: 10, fontWeight: 700, textTransform: 'capitalize' },
  dot2:  { color: '#333', fontSize: 10 },
  src:   { color: '#333', fontSize: 10 },
  bar:   { width: 2, height: 28, borderRadius: 1, flexShrink: 0, opacity: 0.4 },
}
