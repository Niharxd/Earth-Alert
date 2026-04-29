import { useState, useEffect } from 'react'
import { X, ExternalLink, RefreshCw, Search } from 'lucide-react'

export default function NewsPanel({ onClose, selectedDisaster }) {
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [search,   setSearch]   = useState('')

  const load = (q = '') => {
    setLoading(true)
    fetch(`/api/news${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    // Auto-search for selected disaster type/name
    if (selectedDisaster) {
      const q = selectedDisaster.type
      setQuery(q)
      load(q)
    } else {
      load()
    }
  }, [selectedDisaster?.id])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
    load(search)
  }

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>📰 Live News</span>
        <div style={s.headerRight}>
          <button style={s.iconBtn} onClick={() => load(query)} title="Refresh">
            <RefreshCw size={13} color="#8a7560" />
          </button>
          <button style={s.iconBtn} onClick={onClose}>
            <X size={13} color="#8a7560" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} style={s.searchForm}>
        <Search size={12} color="#5a4535" style={{ flexShrink: 0 }} />
        <input
          style={s.searchInput}
          placeholder="Search news..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" style={s.searchBtn}>Go</button>
      </form>

      {query && (
        <div style={s.queryBadge}>
          Showing: <strong>{query}</strong>
          <button style={s.clearQuery} onClick={() => { setQuery(''); setSearch(''); load('') }}>×</button>
        </div>
      )}

      <div style={s.list}>
        {loading && <div style={s.loading}>Loading news...</div>}
        {!loading && articles.length === 0 && (
          <div style={s.empty}>No disaster news found</div>
        )}
        {articles.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" style={s.article}>
            <div style={s.articleTop}>
              <span style={s.source}>{a.source}</span>
              <span style={s.time}>{timeAgo(a.timestamp)}</span>
            </div>
            <p style={s.articleTitle}>{a.title}</p>
            {a.desc && <p style={s.articleDesc}>{a.desc}</p>}
            <div style={s.articleFooter}>
              <ExternalLink size={10} color="#5a4535" />
              <span style={s.readMore}>Read more</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

const s = {
  panel:        { position: 'absolute', top: 0, right: 0, width: 320, height: '100%', background: '#141008', borderLeft: '1px solid #3d2e1e', display: 'flex', flexDirection: 'column', zIndex: 999, animation: 'slideIn 0.25s ease-out' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #2a1f12', flexShrink: 0 },
  title:        { color: '#e8ddd0', fontWeight: 700, fontSize: 14 },
  headerRight:  { display: 'flex', gap: 6 },
  iconBtn:      { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 },
  searchForm:   { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #2a1f12', flexShrink: 0 },
  searchInput:  { flex: 1, background: 'none', border: 'none', color: '#e8ddd0', fontSize: 12, outline: 'none' },
  searchBtn:    { background: '#ff660022', border: '1px solid #ff660044', color: '#ff6600', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  queryBadge:   { padding: '4px 14px', fontSize: 11, color: '#8a7560', background: '#1c1510', borderBottom: '1px solid #2a1f12', flexShrink: 0 },
  clearQuery:   { background: 'none', border: 'none', color: '#ff6600', cursor: 'pointer', marginLeft: 6, fontSize: 14 },
  list:         { overflowY: 'auto', flex: 1 },
  loading:      { color: '#5a4535', fontSize: 12, textAlign: 'center', padding: 24 },
  empty:        { color: '#5a4535', fontSize: 12, textAlign: 'center', padding: 24, fontStyle: 'italic' },
  article:      { display: 'block', padding: '12px 14px', borderBottom: '1px solid #1c1510', textDecoration: 'none', transition: 'background 0.15s' },
  articleTop:   { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  source:       { color: '#ff6600', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  time:         { color: '#5a4535', fontSize: 10 },
  articleTitle: { color: '#e8ddd0', fontSize: 12, fontWeight: 600, lineHeight: 1.5, marginBottom: 4 },
  articleDesc:  { color: '#8a7560', fontSize: 11, lineHeight: 1.5, marginBottom: 6 },
  articleFooter:{ display: 'flex', alignItems: 'center', gap: 4 },
  readMore:     { color: '#5a4535', fontSize: 10 },
}
