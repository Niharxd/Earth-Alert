import { useState, useEffect } from 'react'
import { RefreshCw, Globe, Bell, BellOff, Layers, Map, Maximize2, Minimize2, Download, Sun, Moon, BarChart2, AlertCircle, Volume2, VolumeX, Share2, Navigation, Newspaper, Cloud } from 'lucide-react'
import { CATEGORIES } from '../constants'
import { useNotifications } from '../hooks/useNotifications'
import { useTheme } from '../context/ThemeContext'
import LiveCounter from './LiveCounter'

export default function Navbar({
  disasters, total, lastUpdated, loading, connected,
  onRefresh, showHeatmap, setShowHeatmap,
  fullscreen, setFullscreen,
  showStats, setShowStats,
  showAlerts, setShowAlerts,
  soundEnabled, onToggleSound,
  showShare, setShowShare,
  onNearMe,
  showNews, setShowNews,
  weatherLayer, setWeatherLayer,
}) {
  const [now, setNow] = useState(new Date())
  const { permission, requestPermission } = useNotifications()
  const { mode, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time    = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const updated = lastUpdated ? `${Math.floor((now - lastUpdated) / 60000)}m ago` : '...'

  const catCounts = Object.keys(CATEGORIES).reduce((acc, k) => {
    acc[k] = disasters.filter(d => d.category === k).length
    return acc
  }, {})

  const handleExportCSV = () => window.open('http://localhost:3001/api/export/csv', '_blank')
  const handleExportJSON = () => window.open('http://localhost:3001/api/export', '_blank')

  return (
    <nav style={s.nav}>
      <div style={s.left}>
        <div style={s.brand}>
          <Globe size={20} color="#ff6600" />
          <span style={s.title}>Earth<span style={s.alert}>Alert</span></span>
        </div>
        <div style={s.divider} />
        <div style={s.cats}>
          {Object.entries(CATEGORIES).map(([key, { emoji }]) => (
            <div key={key} style={s.cat} title={key}>
              <span>{emoji}</span>
              <span style={s.catCount}>{catCounts[key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.center}>
        <span style={{ ...s.wsDot, background: connected ? '#00cc44' : '#ff3333' }} title={connected ? 'Live' : 'Reconnecting...'} />
        <span style={{ ...s.liveText, color: connected ? '#00cc44' : '#ff3333' }}>{connected ? 'LIVE' : 'RECONNECTING'}</span>
        <span style={s.totalBadge}><LiveCounter value={total} /> events</span>
      </div>

      <div style={s.right}>
        <span style={s.updated}>{updated}</span>
        <span style={s.clock}>{time}</span>

        <div style={s.divider} />

        <IconBtn title="Toggle Heatmap" active={showHeatmap} onClick={() => setShowHeatmap(v => !v)}>
          {showHeatmap ? <Map size={14} /> : <Layers size={14} />}
        </IconBtn>

        <IconBtn
          title={permission === 'granted' ? 'Notifications on' : 'Enable notifications'}
          active={permission === 'granted'}
          onClick={requestPermission}
        >
          {permission === 'granted' ? <Bell size={14} /> : <BellOff size={14} />}
        </IconBtn>

        <IconBtn title="Export CSV" onClick={handleExportCSV}>
          <Download size={14} />
          <span style={s.btnLabel}>CSV</span>
        </IconBtn>

        <IconBtn title="Export JSON" onClick={handleExportJSON}>
          <Download size={14} />
          <span style={s.btnLabel}>JSON</span>
        </IconBtn>

        <IconBtn title={fullscreen ? 'Exit fullscreen' : 'Fullscreen map'} onClick={() => setFullscreen(v => !v)}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </IconBtn>

        <IconBtn title="Analytics" active={showStats} onClick={() => setShowStats(v => !v)}>
          <BarChart2 size={14} />
        </IconBtn>

        <IconBtn title="Alert Rules" active={showAlerts} onClick={() => setShowAlerts(v => !v)}>
          <AlertCircle size={14} />
        </IconBtn>

        <IconBtn title="News Feed" active={showNews} onClick={() => setShowNews(v => !v)}>
          <Newspaper size={14} />
        </IconBtn>

        <IconBtn title={weatherLayer ? `Weather: ${weatherLayer}` : 'Weather overlay'} active={!!weatherLayer}
          onClick={() => {
            const layers = [null, 'precipitation', 'wind', 'temp', 'clouds']
            const idx = layers.indexOf(weatherLayer)
            setWeatherLayer(layers[(idx + 1) % layers.length])
          }}
        >
          <Cloud size={14} />
          {weatherLayer && <span style={s.btnLabel}>{weatherLayer.slice(0,4)}</span>}
        </IconBtn>

        <IconBtn title={mode === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}>
          {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </IconBtn>

        <IconBtn title={soundEnabled ? 'Sound on' : 'Sound off'} active={soundEnabled} onClick={onToggleSound}>
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </IconBtn>

        <IconBtn title="Near me" onClick={onNearMe}>
          <Navigation size={14} />
        </IconBtn>

        <IconBtn title="Share / Screenshot" active={showShare} onClick={() => setShowShare(v => !v)}>
          <Share2 size={14} />
        </IconBtn>

        <IconBtn title="Refresh" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} style={loading ? s.spin : undefined} />
        </IconBtn>
      </div>
    </nav>
  )
}

function IconBtn({ children, active, onClick, title, disabled }) {
  return (
    <button
      style={{
        ...s.btn,
        background: active ? '#ff660018' : 'none',
        borderColor: active ? '#ff660044' : '#1e1e2e',
        color: active ? '#ff6600' : '#555',
      }}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const s = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 14px', height: 50, background: '#141008',
    borderBottom: '1px solid #3d2e1e', flexShrink: 0, zIndex: 100, position: 'relative',
  },
  left:      { display: 'flex', alignItems: 'center', gap: 12 },
  brand:     { display: 'flex', alignItems: 'center', gap: 8 },
  title:     { color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' },
  alert:     { color: '#ff6600' },
  divider:   { width: 1, height: 20, background: '#3d2e1e', flexShrink: 0 },
  cats:      { display: 'flex', gap: 10 },
  cat:       { display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 },
  catCount:  { color: '#444', fontSize: 11 },
  center:    { display: 'flex', alignItems: 'center', gap: 8, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  wsDot:     { width: 7, height: 7, borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' },
  liveText:  { fontSize: 10, fontWeight: 800, letterSpacing: 2 },
  totalBadge:{ background: '#ff660018', color: '#ff6600', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, border: '1px solid #ff660033' },
  right:     { display: 'flex', alignItems: 'center', gap: 6 },
  updated:   { color: '#333', fontSize: 11 },
  clock:     { color: '#333', fontSize: 12, fontFamily: 'monospace', minWidth: 70 },
  btn:       { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid #3d2e1e', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', transition: 'all 0.15s' },
  btnLabel:  { fontSize: 11, fontWeight: 600 },
  spin:      { animation: 'spin 1s linear infinite' },
}
