import { useState, useCallback, useEffect } from 'react'
import { useWebSocket } from './useWebSocket'
import { useNotifications } from './useNotifications'
import { api } from '../services/api'

export function useDisasters() {
  const [all, setAll]                       = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [lastUpdated, setLastUpdated]       = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeType, setActiveType]         = useState(null)
  const [activeSeverity, setActiveSeverity] = useState(null)
  const [search, setSearch]                 = useState('')

  const { notify } = useNotifications()

  // Immediate REST load so map isn't empty while WS connects
  useEffect(() => {
    api.getAll()
      .then(data => {
        setAll(data.disasters || [])
        setLastUpdated(new Date())
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  // WebSocket for real-time updates
  const handleMessage = useCallback((msg) => {
    if (msg.type === 'init' || msg.type === 'update') {
      const events = msg.events || msg.disasters || []
      if (events.length > 0) {
        setAll(events)
        setLastUpdated(new Date())
        setLoading(false)
        setError(null)
      }
      if (msg.type === 'update' && msg.new_events?.length) {
        notify(msg.new_events)
      }
    }
  }, [notify])

  const { connected } = useWebSocket(handleMessage)

  const refresh = useCallback(async () => {
    try {
      const data = await api.getAll()
      setAll(data.disasters || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const disasters = all.filter((d) => {
    if (activeCategory && d.category !== activeCategory) return false
    if (activeType     && d.type     !== activeType)     return false
    if (activeSeverity && d.severity !== activeSeverity) return false
    if (search) {
      const q = search.toLowerCase()
      if (!d.name?.toLowerCase().includes(q) &&
          !d.type?.toLowerCase().includes(q) &&
          !d.description?.toLowerCase().includes(q)) return false
    }
    return true
  })

  return {
    disasters, total: all.length, loading, error, lastUpdated, connected,
    activeCategory, setActiveCategory,
    activeType,     setActiveType,
    activeSeverity, setActiveSeverity,
    search,         setSearch,
    refresh,
  }
}
