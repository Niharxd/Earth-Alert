import { useEffect, useRef, useState } from 'react'

export default function LiveCounter({ value, color = '#ff6600' }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (value === prevRef.current) return
    const diff  = value - prevRef.current
    const steps = Math.min(Math.abs(diff), 20)
    const step  = diff / steps
    let current = prevRef.current
    let i = 0
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
    const id = setInterval(() => {
      current += step
      i++
      setDisplay(Math.round(current))
      if (i >= steps) {
        clearInterval(id)
        setDisplay(value)
        prevRef.current = value
      }
    }, 30)
    return () => clearInterval(id)
  }, [value])

  return (
    <span style={{
      color,
      fontWeight: 900,
      fontSize: 13,
      transition: 'color 0.3s',
      textShadow: flash ? `0 0 8px ${color}` : 'none',
    }}>
      {display}
    </span>
  )
}
