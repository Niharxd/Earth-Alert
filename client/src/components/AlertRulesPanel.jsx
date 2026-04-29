import { useState } from 'react'
import { X, Plus, Trash2, Bell, MapPin } from 'lucide-react'
import { DISASTER_TYPES, SEVERITY_ORDER } from '../constants'

export default function AlertRulesPanel({ rules, addRule, removeRule, watchlist, addToWatchlist, removeFromWatchlist, onClose }) {
  const [tab, setTab] = useState('rules')
  const [form, setForm] = useState({ type: '', severity: '', minMagnitude: '' })
  const [regionInput, setRegionInput] = useState('')

  const handleAdd = () => {
    if (!form.type && !form.severity && !form.minMagnitude) return
    addRule({
      type:         form.type || null,
      severity:     form.severity || null,
      minMagnitude: form.minMagnitude ? parseFloat(form.minMagnitude) : null,
    })
    setForm({ type: '', severity: '', minMagnitude: '' })
  }

  const handleAddRegion = () => {
    if (!regionInput.trim()) return
    addToWatchlist(regionInput.trim())
    setRegionInput('')
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>Alerts & Watchlist</span>
        <button style={s.close} onClick={onClose}><X size={14} /></button>
      </div>

      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'rules' ? s.tabActive : {}) }} onClick={() => setTab('rules')}>
          <Bell size={11} /> Rules ({rules.length})
        </button>
        <button style={{ ...s.tab, ...(tab === 'watchlist' ? s.tabActive : {}) }} onClick={() => setTab('watchlist')}>
          <MapPin size={11} /> Watchlist ({watchlist.length})
        </button>
      </div>

      <div style={s.body}>
        {tab === 'rules' && (
          <>
            <div style={s.form}>
              <select style={s.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="">Any type</option>
                {Object.entries(DISASTER_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
              <select style={s.select} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                <option value="">Any severity</option>
                {SEVERITY_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                style={s.input}
                type="number"
                placeholder="Min magnitude"
                value={form.minMagnitude}
                onChange={e => setForm(f => ({ ...f, minMagnitude: e.target.value }))}
              />
              <button style={s.addBtn} onClick={handleAdd}>
                <Plus size={12} /> Add Rule
              </button>
            </div>

            {rules.length === 0
              ? <p style={s.empty}>No rules yet. Add one above to get notified.</p>
              : rules.map(rule => (
                <div key={rule.id} style={s.ruleRow}>
                  <div style={s.ruleInfo}>
                    {rule.type && <span style={s.tag}>{DISASTER_TYPES[rule.type]?.emoji} {rule.type}</span>}
                    {rule.severity && <span style={s.tag}>≥ {rule.severity}</span>}
                    {rule.minMagnitude && <span style={s.tag}>M≥{rule.minMagnitude}</span>}
                  </div>
                  <button style={s.delBtn} onClick={() => removeRule(rule.id)}><Trash2 size={11} /></button>
                </div>
              ))
            }
          </>
        )}

        {tab === 'watchlist' && (
          <>
            <div style={s.form}>
              <input
                style={{ ...s.input, flex: 1 }}
                placeholder="Region, country or city..."
                value={regionInput}
                onChange={e => setRegionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddRegion()}
              />
              <button style={s.addBtn} onClick={handleAddRegion}>
                <Plus size={12} /> Watch
              </button>
            </div>
            {watchlist.length === 0
              ? <p style={s.empty}>No regions watched. Add one to get notified of events there.</p>
              : watchlist.map(region => (
                <div key={region} style={s.ruleRow}>
                  <span style={s.regionLabel}><MapPin size={11} /> {region}</span>
                  <button style={s.delBtn} onClick={() => removeFromWatchlist(region)}><Trash2 size={11} /></button>
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  panel:      { position: 'relative', width: 320, maxHeight: '60vh', background: '#0c0c18', border: '1px solid #1e1e2e', borderRadius: '0 12px 12px 0', zIndex: 1001, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.2s ease-out', boxShadow: '4px 0 24px rgba(0,0,0,0.5)' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #1e1e2e' },
  title:      { color: '#fff', fontWeight: 700, fontSize: 13 },
  close:      { background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex' },
  tabs:       { display: 'flex', borderBottom: '1px solid #1e1e2e' },
  tab:        { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: 'none', border: 'none', color: '#444', fontSize: 11, cursor: 'pointer' },
  tabActive:  { color: '#ff6600', borderBottom: '2px solid #ff6600' },
  body:       { overflowY: 'auto', flex: 1, padding: '10px 12px' },
  form:       { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  select:     { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: 6, color: '#888', fontSize: 11, padding: '5px 8px', flex: 1, minWidth: 100 },
  input:      { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: 6, color: '#888', fontSize: 11, padding: '5px 8px' },
  addBtn:     { display: 'flex', alignItems: 'center', gap: 4, background: '#ff660018', border: '1px solid #ff660044', borderRadius: 6, color: '#ff6600', fontSize: 11, fontWeight: 600, padding: '5px 10px', cursor: 'pointer' },
  ruleRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#12121e', borderRadius: 6, marginBottom: 4 },
  ruleInfo:   { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tag:        { background: '#1e1e2e', color: '#888', fontSize: 10, padding: '2px 6px', borderRadius: 4 },
  delBtn:     { background: 'none', border: 'none', color: '#333', cursor: 'pointer', display: 'flex' },
  regionLabel:{ display: 'flex', alignItems: 'center', gap: 5, color: '#888', fontSize: 12 },
  empty:      { color: '#333', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' },
}
