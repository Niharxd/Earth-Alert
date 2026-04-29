import { useMap } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

const OWM_KEY = '190f03256c8074cf5a37618059acb3aa'

const LAYERS = {
  precipitation: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
  wind:          `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
  temp:          `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
  clouds:        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
}

export default function WeatherLayer({ layer }) {
  const map      = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }
    if (!layer || !LAYERS[layer]) return

    const tileLayer = L.tileLayer(LAYERS[layer], {
      opacity:     0.6,
      attribution: '&copy; OpenWeatherMap',
      maxZoom:     19,
    })
    tileLayer.addTo(map)
    layerRef.current = tileLayer

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [layer, map])

  return null
}

export { LAYERS }
