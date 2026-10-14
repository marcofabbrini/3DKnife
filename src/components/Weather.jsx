import { useState } from 'react'
import { Card } from './ui'
import { useLocalStorage } from '../lib/store'
import { describeWeather, useWeather } from '../lib/useWeather'

export default function Weather() {
  const [city, setCity] = useLocalStorage('weather-city', '')
  const [draft, setDraft] = useState(city)
  const state = useWeather(city)

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
      {state.status === 'idle' && <p className="muted">Scrivi una città per vedere le previsioni.</p>}

      {state.status === 'ok' && (
        <>
          <div className="weather-now">
            <span className="weather-temp">{Math.round(state.w.current.temperature_2m)}°</span>
            <span>
              {describeWeather(state.w.current.weather_code)}
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
                <span>{describeWeather(state.w.daily.weather_code[i])}</span>
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
