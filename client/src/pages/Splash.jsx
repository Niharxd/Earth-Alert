import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

export default function Splash({ onDone }) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 2400)
    const doneTimer = setTimeout(() => onDone(), 3000)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div style={{ ...s.wrap, opacity: fade ? 0 : 1 }}>
      <div style={s.rings}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...s.ring, animationDelay: `${i * 0.4}s`, width: i * 130, height: i * 130 }} />
        ))}
      </div>

      <div style={s.iconWrap}>
        <Globe size={64} color="#ff6600" strokeWidth={1.5} />
      </div>

      <div style={s.brand}>
        <span style={s.earth}>Earth</span>
        <span style={s.alert}>Alert</span>
      </div>
      <p style={s.tagline}>Real-time global disaster tracking</p>

      <div style={s.barWrap}>
        <div style={s.bar} />
      </div>
    </div>
  )
}

const s = {
  wrap: {
    position: 'fixed', inset: 0, background: '#0e0b08',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, transition: 'opacity 0.6s ease',
  },
  rings: { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute', borderRadius: '50%',
    border: '1px solid rgba(255,102,0,0.12)',
    animation: 'ringPulse 2s ease-in-out infinite',
  },
  iconWrap: { marginBottom: 24, filter: 'drop-shadow(0 0 24px rgba(255,102,0,0.4))', animation: 'float 3s ease-in-out infinite' },
  brand:    { display: 'flex', gap: 6, fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 },
  earth:    { color: '#ffffff' },
  alert:    { color: '#ff6600' },
  tagline:  { color: '#5a4535', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 },
  barWrap:  { width: 200, height: 2, background: '#3d2e1e', borderRadius: 2, overflow: 'hidden' },
  bar:      { height: '100%', background: 'linear-gradient(90deg, #ff6600, #ff3300)', borderRadius: 2, animation: 'loadBar 2.4s ease-in-out forwards' },
}
