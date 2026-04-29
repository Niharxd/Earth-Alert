import { useState, useEffect, useCallback } from 'react'
import { DISASTER_TYPES } from '../constants'

const STORAGE_KEY = 'earth_alert_rules'
const WATCHLIST_KEY = 'earth_alert_watchlist'

export function useAlertRules() {
  const [rules, setRules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  }, [rules])

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  const addRule = useCallback((rule) => {
    setRules(r => [...r, { ...rule, id: Date.now().toString() }])
  }, [])

  const removeRule = useCallback((id) => {
    setRules(r => r.filter(x => x.id !== id))
  }, [])

  const addToWatchlist = useCallback((region) => {
    setWatchlist(w => w.includes(region) ? w : [...w, region])
  }, [])

  const removeFromWatchlist = useCallback((region) => {
    setWatchlist(w => w.filter(x => x !== region))
  }, [])

  const matchesRules = useCallback((event) => {
    return rules.some(rule => {
      if (rule.type     && rule.type     !== event.type)     return false
      if (rule.category && rule.category !== event.category) return false
      if (rule.minMagnitude && (event.magnitude || 0) < rule.minMagnitude) return false
      if (rule.severity) {
        const order = ['low','moderate','high','severe','extreme']
        if (order.indexOf(event.severity) < order.indexOf(rule.severity)) return false
      }
      return true
    })
  }, [rules])

  const isWatched = useCallback((event) => {
    if (!watchlist.length) return false
    const name = event.name?.toLowerCase() || ''
    return watchlist.some(r => name.includes(r.toLowerCase()))
  }, [watchlist])

  return {
    rules, addRule, removeRule,
    watchlist, addToWatchlist, removeFromWatchlist,
    matchesRules, isWatched,
  }
}
