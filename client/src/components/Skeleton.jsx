// Shimmer animation is in index.css as @keyframes shimmer

function SkeletonBox({ width = '100%', height = 12, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #1c1510 25%, #2a1f12 50%, #1c1510 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  )
}

export function SidebarSkeleton() {
  return (
    <div style={{ width: 230, background: '#141008', borderRight: '1px solid #3d2e1e', padding: '12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SkeletonBox height={32} radius={8} />
      {[5, 4, 5].map((count, si) => (
        <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBox width={60} height={8} />
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBox key={i} height={28} radius={6} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EventListSkeleton() {
  return (
    <div style={{ width: 240, background: '#141008', borderRight: '1px solid #3d2e1e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a1f12' }}>
        <SkeletonBox width={80} height={10} />
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #1c1510' }}>
          <SkeletonBox width={24} height={24} radius={6} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SkeletonBox height={10} width={`${60 + (i % 3) * 15}%`} />
            <SkeletonBox height={8} width="50%" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0e0b08', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Fake grid lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 16}%`, height: 1, background: '#1c1510' }} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 12}%`, width: 1, background: '#1c1510' }} />
        ))}
        {/* Fake markers */}
        {[
          { top: '30%', left: '20%' }, { top: '45%', left: '55%' },
          { top: '25%', left: '70%' }, { top: '60%', left: '35%' },
          { top: '50%', left: '80%' }, { top: '70%', left: '60%' },
          { top: '35%', left: '45%' }, { top: '55%', left: '15%' },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos,
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(90deg, #2a1f12 25%, #3d2e1e 50%, #2a1f12 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
        {/* Center loading text */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6600', animation: 'pulse 1s ease-in-out infinite' }} />
          <span style={{ color: '#3d2e1e', fontSize: 12, letterSpacing: 1 }}>Loading live data...</span>
        </div>
      </div>
    </div>
  )
}
