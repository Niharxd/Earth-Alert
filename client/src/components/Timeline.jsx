import { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export default function Timeline({ disasters, onFilterByTime }) {
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(100) // 0-100%

  const now = Date.now()
  const oldest = Math.min(...disasters.map(d => new Date(d.timestamp).getTime()))
  const range = now - oldest

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPosition(p => {
        const next = p - 1
        if (next <= 0) {
          setPlaying(false)
          return 0
        }
        return next
      })
    }, 200)
    return () => clearInterval(id)
  }, [playing])

  useEffect(() => {
    const cutoff = oldest + (range * position / 100)
    onFilterByTime(cutoff)
  }, [position, oldest, range, onFilterByTime])

  const formatDate = (ts) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div style={{ ...s.wrap, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#141008', borderTop: '1px solid #3d2e1e', flexShrink: 0 }}>
      <div style={s.controls}>
        <button style={s.btn} onClick={() => setPosition(0)} title="Jump to oldest">
          <SkipBack size={12} />
        </button>
        <button style={s.btn} onClick={() => setPlaying(v => !v)} title={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button style={s.btn} onClick={() => setPosition(100)} title="Jump to now">
          <SkipForward size={12} />
        </button>
      </div>

      <div style={s.sliderWrap}>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={e => setPosition(Number(e.target.value))}
          style={s.slider}
        />
        <div style={s.labels}>
          <span style={s.label}>{formatDate(oldest)}</span>
          <span style={s.label}>{formatDate(oldest + (range * position / 100))}</span>
          <span style={s.label}>{formatDate(now)}</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap:       { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#0c0c18', borderTop: '1px solid #1e1e2e', flexShrink: 0 },
  controls:   { display: 'flex', gap: 4 },
  btn:        { background: 'none', border: '1px solid #1e1e2e', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#555', display: 'flex' },
  sliderWrap: { flex: 1 },
  slider:     { width: '100%', height: 4, background: '#1e1e2e', borderRadius: 2, outline: 'none', appearance: 'none', cursor: 'pointer' },
  labels:     { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  label:      { fontSize: 10, color: '#333' },
}
