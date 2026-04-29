export default function Sparkline({ data = [], color = '#ff6600', width = 60, height = 24 }) {
  if (!data.length || data.every(v => v === 0)) {
    return <svg width={width} height={height}><line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#222" strokeWidth="1" /></svg>
  }

  const max = Math.max(...data, 1)
  const step = width / (data.length - 1 || 1)

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - (v / max) * (height - 4) - 2,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L${(data.length-1)*step},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="2.5" fill={color} />
      )}
    </svg>
  )
}
