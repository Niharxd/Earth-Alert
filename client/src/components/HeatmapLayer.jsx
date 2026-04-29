import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { SEVERITY_ORDER } from '../constants'

const SEVERITY_WEIGHT = {
  extreme:  1.0,
  severe:   0.8,
  high:     0.6,
  moderate: 0.4,
  low:      0.2,
}

export default function HeatmapLayer({ disasters }) {
  const map = useMap()

  useEffect(() => {
    const points = disasters
      .filter(d => d.lat !== 0 || d.lon !== 0)
      .map(d => [d.lat, d.lon, SEVERITY_WEIGHT[d.severity] || 0.3])

    const heat = L.heatLayer(points, {
      radius:  25,
      blur:    20,
      maxZoom: 10,
      max:     1.0,
      gradient: {
        0.2: '#00cc44',
        0.4: '#ffdd00',
        0.6: '#ffaa00',
        0.8: '#ff6600',
        1.0: '#ff0000',
      },
    }).addTo(map)

    return () => map.removeLayer(heat)
  }, [disasters, map])

  return null
}
