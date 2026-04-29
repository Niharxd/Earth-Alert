import { useCallback, useState, useMemo } from 'react'
import { useDisasters }    from './hooks/useDisasters'
import { useAlertRules }   from './hooks/useAlertRules'
import { useGeolocation }  from './hooks/useGeolocation'
import { useKeyboard }     from './hooks/useKeyboard'
import { useSoundAlert }   from './hooks/useSoundAlert'
import { ThemeProvider }   from './context/ThemeContext'
import Navbar          from './components/Navbar'
import Sidebar         from './components/Sidebar'
import EventList       from './components/EventList'
import Map             from './components/Map'
import DetailPanel     from './components/DetailPanel'
import Timeline        from './components/Timeline'
import StatsPanel      from './components/StatsPanel'
import AlertRulesPanel from './components/AlertRulesPanel'
import SharePanel      from './components/SharePanel'
import NewsPanel       from './components/NewsPanel'
import { SidebarSkeleton, EventListSkeleton, MapSkeleton } from './components/Skeleton'

function Dashboard() {
  const [showHeatmap,  setShowHeatmap]  = useState(false)
  const [fullscreen,   setFullscreen]   = useState(false)
  const [showStats,    setShowStats]    = useState(false)
  const [showAlerts,   setShowAlerts]   = useState(false)
  const [showShare,    setShowShare]    = useState(false)
  const [showNews,     setShowNews]     = useState(false)
  const [weatherLayer, setWeatherLayer] = useState(null)
  const [timeFilter,   setTimeFilter]   = useState(null)
  const [selected,     setSelected]     = useState(null)
  const [flyTarget,    setFlyTarget]    = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const {
    disasters, total, loading, error, lastUpdated, connected,
    activeCategory, setActiveCategory,
    activeType,     setActiveType,
    activeSeverity, setActiveSeverity,
    search,         setSearch,
    refresh,
  } = useDisasters()

  const { rules, addRule, removeRule, watchlist, addToWatchlist, removeFromWatchlist, isWatched } = useAlertRules()
  const { location: userLocation, locate } = useGeolocation()
  const { play: playSound, toggle: toggleSound } = useSoundAlert()

  const handleSelect = useCallback((d) => setSelected(d), [])
  const handleClose  = useCallback(() => setSelected(null), [])

  const handleToggleSound = useCallback(() => {
    const enabled = toggleSound()
    setSoundEnabled(enabled)
  }, [toggleSound])

  const handleNearMe = useCallback(() => {
    locate()
    if (userLocation) {
      setFlyTarget({ lat: userLocation.lat, lon: userLocation.lon, zoom: 7 })
    }
  }, [locate, userLocation])

  const handleFlyTo = useCallback((country) => {
    // Find a disaster in that country and fly to it
    const event = disasters.find(d => d.name?.toLowerCase().includes(country.toLowerCase()))
    if (event && (event.lat !== 0 || event.lon !== 0)) {
      setFlyTarget({ lat: event.lat, lon: event.lon, zoom: 5 })
    }
  }, [disasters])

  // Keyboard shortcuts
  useKeyboard(useMemo(() => ({
    'f': () => setFullscreen(v => !v),
    'h': () => setShowHeatmap(v => !v),
    'Escape': () => { setSelected(null); setShowStats(false); setShowAlerts(false); setShowShare(false) },
    'a': () => setShowStats(v => !v),
    's': () => setShowShare(v => !v),
    'n': () => handleNearMe(),
  }), [handleNearMe]))

  const visibleDisasters = timeFilter
    ? disasters.filter(d => new Date(d.timestamp).getTime() <= timeFilter)
    : disasters

  const enriched = visibleDisasters.map(d => ({ ...d, watched: isWatched(d) }))

  return (
    <div className="dashboard" style={s.root}>
      <Navbar
        disasters={enriched}
        total={total}
        lastUpdated={lastUpdated}
        loading={loading}
        connected={connected}
        onRefresh={refresh}
        showHeatmap={showHeatmap}   setShowHeatmap={setShowHeatmap}
        fullscreen={fullscreen}     setFullscreen={setFullscreen}
        showStats={showStats}       setShowStats={setShowStats}
        showAlerts={showAlerts}     setShowAlerts={setShowAlerts}
        soundEnabled={soundEnabled} onToggleSound={handleToggleSound}
        showShare={showShare}       setShowShare={setShowShare}
        onNearMe={handleNearMe}
        showNews={showNews}         setShowNews={setShowNews}
        weatherLayer={weatherLayer} setWeatherLayer={setWeatherLayer}
      />

      <div style={s.body}>
        {!fullscreen && (
          loading ? <SidebarSkeleton /> :
          <Sidebar
            disasters={enriched}
            search={search}               setSearch={setSearch}
            activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            activeType={activeType}         setActiveType={setActiveType}
            activeSeverity={activeSeverity} setActiveSeverity={setActiveSeverity}
          />
        )}

        {!fullscreen && (
          loading ? <EventListSkeleton /> :
          <EventList disasters={enriched} onSelect={handleSelect} selected={selected} />
        )}

        <div style={s.mapCol}>
          <div style={s.mapWrap}>
            {error && <div style={s.error}>⚠️ {error}</div>}
            {loading && !enriched.length
              ? <MapSkeleton />
              : <Map
                  disasters={enriched}
                  onSelect={handleSelect}
                  selected={selected}
                  showHeatmap={showHeatmap}
                  flyTarget={flyTarget}
                  userLocation={userLocation}
                  weatherLayer={weatherLayer}
                />
            }
            {selected  && <DetailPanel disaster={selected} onClose={handleClose} />}
            {showShare && <SharePanel onClose={() => setShowShare(false)} selected={selected} />}
            {showNews  && <NewsPanel  onClose={() => setShowNews(false)}  selectedDisaster={selected} />}
          </div>

          <Timeline disasters={disasters} onFilterByTime={setTimeFilter} />

          {/* Panels outside mapWrap so they aren't clipped by overflow:hidden */}
          {showStats  && (
            <div style={s.overlayPanel}>
              <StatsPanel disasters={enriched} onClose={() => setShowStats(false)} onFlyTo={handleFlyTo} />
            </div>
          )}
          {showAlerts && (
            <div style={s.overlayPanel}>
              <AlertRulesPanel
                rules={rules} addRule={addRule} removeRule={removeRule}
                watchlist={watchlist} addToWatchlist={addToWatchlist}
                removeFromWatchlist={removeFromWatchlist}
                onClose={() => setShowAlerts(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div style={s.shortcuts}>
        F fullscreen · H heatmap · A analytics · S share · N near me · Esc close
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}

const s = {
  root:       { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", background: '#0e0b08', color: '#e8ddd0' },
  body:       { display: 'flex', flex: 1, overflow: 'hidden' },
  mapCol:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  mapWrap:    { flex: 1, position: 'relative', overflow: 'hidden' },
  loading:    { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5a4535', fontSize: 13, gap: 10 },
  loadingDot: { width: 8, height: 8, borderRadius: '50%', background: '#ff6600', animation: 'pulse 1s ease-in-out infinite' },
  error:      { position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#ff000018', border: '1px solid #ff000044', color: '#ff6666', padding: '8px 16px', borderRadius: 8, fontSize: 12, zIndex: 10, whiteSpace: 'nowrap' },
  shortcuts:  { background: '#141008', borderTop: '1px solid #2a1f12', padding: '3px 16px', fontSize: 10, color: '#3d2e1e', letterSpacing: 0.5, flexShrink: 0 },
  overlayPanel:{ position: 'absolute', bottom: 78, left: 0, zIndex: 1001 },
}
