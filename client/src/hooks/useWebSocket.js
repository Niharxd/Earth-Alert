import { useState, useEffect, useRef } from 'react'

const WS_URL = `ws://${window.location.hostname}:3001/ws`

export function useWebSocket(onMessage) {
  const [connected, setConnected] = useState(false)
  const wsRef        = useRef(null)
  const reconnectRef = useRef(null)
  const onMessageRef = useRef(onMessage)

  // Keep ref up to date without triggering reconnects
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  useEffect(() => {
    let destroyed = false

    function connect() {
      if (destroyed) return
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!destroyed) setConnected(true)
      }

      ws.onmessage = (e) => {
        try {
          onMessageRef.current(JSON.parse(e.data))
        } catch {}
      }

      ws.onclose = () => {
        if (!destroyed) {
          setConnected(false)
          reconnectRef.current = setTimeout(connect, 4000)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      destroyed = true
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, []) // empty deps — only runs once on mount

  return { connected }
}
