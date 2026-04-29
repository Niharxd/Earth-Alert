import { useRef, useCallback } from 'react'

export function useSoundAlert() {
  const enabledRef = useRef(false)

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    return enabledRef.current
  }, [])

  const play = useCallback((severity) => {
    if (!enabledRef.current) return
    if (!['extreme', 'severe'].includes(severity)) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = severity === 'extreme' ? 880 : 660
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [])

  return { play, toggle, enabled: () => enabledRef.current }
}
