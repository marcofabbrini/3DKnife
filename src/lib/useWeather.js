import { useEffect, useState } from 'react'

const TTL = 10 * 60 * 1000
const cache = new Map()

// Descrizioni brevi dei codici meteo WMO usati da Open-Meteo
const CODES = [
  [[0], 'Sereno'],
  [[1, 2], 'Poco nuvoloso'],
  [[3], 'Coperto'],
  [[45, 48], 'Nebbia'],
  [[51, 53, 55, 56, 57], 'Pioviggine'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Pioggia'],
  [[71, 73, 75, 77, 85, 86], 'Neve'],
  [[95, 96, 99], 'Temporale'],
]
export const describeWeather = (code) => CODES.find(([list]) => list.includes(code))?.[1] ?? '—'

// Meteo di una città, con cache di 10 minuti condivisa tra scheda e dettaglio
export function useWeather(city) {
  const [state, setState] = useState(() => {
    if (!city) return { status: 'idle' }
    const hit = cache.get(city)
    return hit && Date.now() - hit.t < TTL ? hit.state : { status: 'loading' }
  })

  useEffect(() => {
    if (!city) return undefined
    const ctrl = new AbortController()

    const run = async () => {
      const hit = cache.get(city)
      if (hit && Date.now() - hit.t < TTL) {
        setState(hit.state)
        return
      }
      setState({ status: 'loading' })
      try {
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it`,
          { signal: ctrl.signal },
        ).then((r) => r.json())
        const place = geo.results?.[0]
        if (!place) {
          setState({ status: 'error', message: 'Città non trovata.' })
          return
        }
        const w = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
            '&current=temperature_2m,weather_code,wind_speed_10m' +
            '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code' +
            '&timezone=auto&forecast_days=4',
          { signal: ctrl.signal },
        ).then((r) => r.json())
        const next = { status: 'ok', place: `${place.name}${place.country ? `, ${place.country}` : ''}`, w }
        cache.set(city, { t: Date.now(), state: next })
        setState(next)
      } catch (err) {
        if (err.name !== 'AbortError') setState({ status: 'error', message: 'Meteo non disponibile.' })
      }
    }

    run()
    return () => ctrl.abort()
  }, [city])

  return city ? state : { status: 'idle' }
}
