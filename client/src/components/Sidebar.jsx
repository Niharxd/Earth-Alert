import { useState } from 'react'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import { CATEGORIES, DISASTER_TYPES, SEVERITY_COLORS, SEVERITY_ORDER } from '../constants'

export default function Sidebar({
  disasters, search, setSearch,
  activeCategory, setActiveCategory,
  activeType, setActiveType,
  activeSeverity, setActiveSeverity,
}) {
  const [open, setOpen] = useState({ categories: true, types: true, severity: true })
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }))
  const countBy = (key, val) => disasters.filter(d => d[key] === val).length
  const pick = (setter, cur, val) => setter(cur === val ? null : val)

  const hasFilters = activeCategory || activeType || activeSeverity || search
  const clearAll = () => {
    setActiveCategory(null); setActiveType(null)
    setActiveSeverity(null); setSearch('')
  }

  return (
    <aside style={s.sidebar}>
      {/* Search */}
      <div style={s.searchWrap}>
        <Search size={13} color="#444" style={s.searchIcon} />
        <input
          style={s.search}
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button style={s.clearSearch} onClick={() => setSearch('')}>
            <X size={11} />
          </button>
        )}
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div style={s.activeFilters}>
          {activeCategory && <Pill label={CATEGORIES[activeCategory]?.emoji + ' ' + activeCategory} onRemove={() => setActiveCategory(null)} />}
          {activeType     && <Pill label={DISASTER_TYPES[activeType]?.emoji + ' ' + activeType}     onRemove={() => setActiveType(null)} />}
          {activeSeverity && <Pill label={activeSeverity} onRemove={() => setActiveSeverity(null)} color={SEVERITY_COLORS[activeSeverity]} />}
          <button style={s.clearAll} onClick={clearAll}>Clear all</button>
        </div>
      )}

      {/* Categories */}
      <Section label="Categories" open={open.categories} onToggle={() => toggle('categories')}>
        {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
          <FilterRow
            key={key}
            active={activeCategory === key}
            onClick={() => pick(setActiveCategory, activeCategory, key)}
            label={`${emoji} ${label}`}
            count={countBy('category', key)}
          />
        ))}
      </Section>

      {/* Types */}
      <Section label="Type" open={open.types} onToggle={() => toggle('types')}>
        {Object.entries(DISASTER_TYPES).map(([key, { label, emoji }]) => (
          <FilterRow
            key={key}
            active={activeType === key}
            onClick={() => pick(setActiveType, activeType, key)}
            label={`${emoji} ${label}`}
            count={countBy('type', key)}
          />
        ))}
      </Section>

      {/* Severity */}
      <Section label="Severity" open={open.severity} onToggle={() => toggle('severity')}>
        {SEVERITY_ORDER.map((sev) => (
          <FilterRow
            key={sev}
            active={activeSeverity === sev}
            onClick={() => pick(setActiveSeverity, activeSeverity, sev)}
            label={sev.charAt(0).toUpperCase() + sev.slice(1)}
            count={countBy('severity', sev)}
            color={SEVERITY_COLORS[sev]}
            dot
          />
        ))}
      </Section>
    </aside>
  )
}

function Section({ label, open, onToggle, children }) {
  return (
    <div style={s.section}>
      <button style={s.sectionHeader} onClick={onToggle}>
        <span style={s.sectionLabel}>{label}</span>
        {open ? <ChevronDown size={12} color="#444" /> : <ChevronRight size={12} color="#444" />}
      </button>
      {open && <div style={s.sectionBody}>{children}</div>}
    </div>
  )
}

function FilterRow({ active, onClick, label, count, color, dot }) {
  const c = color || '#ff6600'
  return (
    <button onClick={onClick} style={{ ...s.row, background: active ? `${c}12` : 'transparent', borderLeft: `2px solid ${active ? c : 'transparent'}` }}>
      <div style={s.rowLeft}>
        {dot && <span style={{ ...s.dot, background: c }} />}
        <span style={{ ...s.rowLabel, color: active ? c : '#777' }}>{label}</span>
      </div>
      <span style={{ ...s.rowCount, color: active ? c : '#444', background: active ? `${c}18` : '#ffffff08' }}>{count}</span>
    </button>
  )
}

function Pill({ label, onRemove, color }) {
  return (
    <div style={{ ...s.pill, borderColor: color || '#ff6600', color: color || '#ff6600' }}>
      <span>{label}</span>
      <button style={s.pillX} onClick={onRemove}><X size={9} /></button>
    </div>
  )
}

const s = {
  sidebar: {
    width: 230, background: '#141008', borderRight: '1px solid #3d2e1e',
    overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
  },
  searchWrap: { position: 'relative', padding: '10px 10px 6px', flexShrink: 0 },
  searchIcon: { position: 'absolute', left: 20, top: '50%', transform: 'translateY(-30%)' },
  search: {
    width: '100%', background: '#1c1510', border: '1px solid #3d2e1e',
    borderRadius: 8, padding: '7px 28px 7px 28px', color: '#e8ddd0',
    fontSize: 12, outline: 'none',
  },
  clearSearch: { position: 'absolute', right: 18, top: '50%', transform: 'translateY(-30%)', background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex' },
  activeFilters: { display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 10px 8px' },
  pill: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 6px', borderRadius: 10, border: '1px solid', background: 'transparent' },
  pillX: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 },
  clearAll: { fontSize: 10, color: '#444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' },
  section: { borderBottom: '1px solid #2a1f12' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' },
  sectionLabel: { color: '#5a4535', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionBody: { padding: '2px 0 6px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '5px 12px 5px 10px', border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '2px solid transparent' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  rowLabel: { fontSize: 12, color: '#777' },
  rowCount: { fontSize: 11, padding: '1px 6px', borderRadius: 8, fontWeight: 600 },
}
