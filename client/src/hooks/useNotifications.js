import { useEffect, useRef, useState } from 'react'
import { DISASTER_TYPES, SEVERITY_COLORS } from '../constants'

const NOTIFY_SEVERITIES = new Set(['extreme', 'severe'])

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission)
  const seenRef = useRef(new Set())

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const notify = (events) => {
    if (permission !== 'granted') return
    events
      .filter(e => NOTIFY_SEVERITIES.has(e.severity) && !seenRef.current.has(e.id))
      .forEach(e => {
        seenRef.current.add(e.id)
        const emoji = DISASTER_TYPES[e.type]?.emoji || '⚠️'
        new Notification(`${emoji} ${e.severity.toUpperCase()} ${e.type}`, {
          body: e.name,
          icon: '/favicon.ico',
          tag:  e.id,
          badge: '/favicon.ico',
        })
      })
  }

  return { permission, requestPermission, notify }
}
