import { useEffect, useState } from 'react'
import { Card } from './ui'
import { useLocalStorage } from '../lib/store'

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
const describe = (c) => CODES.find(([list]) => list.includes(c))?.[1] ?? '—'

export default function Weather() {
  const [city, setCity] = useLocalStorage('weather-city', '')
  const [draft, setDraft] = useState(city)
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (!city) return undefined
    const ctrl = new AbortController()
    const run = async () => {
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
        setState({ status: 'ok', place: `${place.name}${place.country ? `, ${place.country}` : ''}`, w })
      } catch (err) {
        if (err.name !== 'AbortError') setState({ status: 'error', message: 'Meteo non disponibile.' })
      }
    }
    run()
    return () => ctrl.abort()
  }, [city])

  const submit = (e) => {
    e.preventDefault()
    setCity(draft.trim())
  }

  return (
    <Card title="Meteo" subtitle={state.status === 'ok' ? state.place : undefined}>
      <form className="inline-form" onSubmit={submit}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Città (es. Roma)" aria-label="Città" />
        <button type="submit" className="btn">
          Cerca
        </button>
      </form>

      {state.status === 'loading' && <p className="muted">Caricamento…</p>}
      {state.status === 'error' && <p className="muted">{state.message}</p>}
      {state.status === 'idle' && !city && <p className="muted">Scrivi una città per vedere le previsioni.</p>}

      {state.status === 'ok' && (
        <>
          <div className="weather-now">
            <span className="weather-temp">{Math.round(state.w.current.temperature_2m)}°</span>
            <span>
              {describe(state.w.current.weather_code)}
              <br />
              <span className="muted small">Vento {Math.round(state.w.current.wind_speed_10m)} km/h</span>
            </span>
          </div>
          <ul className="forecast">
            {state.w.daily.time.map((t, i) => (
              <li key={t}>
                <span className="muted small">
                  {i === 0 ? 'Oggi' : new Date(t).toLocaleDateString('it-IT', { weekday: 'short' })}
                </span>
                <span>{describe(state.w.daily.weather_code[i])}</span>
                <span>
                  {Math.round(state.w.daily.temperature_2m_max[i])}° / {Math.round(state.w.daily.temperature_2m_min[i])}°
                </span>
                <span className="muted small">☔ {state.w.daily.precipitation_probability_max[i] ?? 0}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
