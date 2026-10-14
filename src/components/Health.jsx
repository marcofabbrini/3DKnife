import { useState } from 'react'
import { Card, BarChart, Stat } from './ui'
import { useLocalStorage } from '../lib/store'
import { lastDays, todayKey } from '../lib/dates'

const METRICS = [
  { id: 'sleep', label: 'Sonno', unit: ' h', step: 0.25 },
  { id: 'steps', label: 'Passi', unit: '', step: 100 },
  { id: 'water', label: 'Acqua', unit: ' l', step: 0.25 },
  { id: 'weight', label: 'Peso', unit: ' kg', step: 0.1 },
]

export default function Health() {
  const [log, setLog] = useLocalStorage('health', {})
  const [metric, setMetric] = useState('sleep')
  const today = todayKey()
  const todayData = log[today] || {}
  const current = METRICS.find((m) => m.id === metric)

  const setValue = (id, raw) => {
    const value = raw === '' ? undefined : Number(raw)
    setLog((prev) => {
      const day = { ...(prev[today] || {}) }
      if (value === undefined || Number.isNaN(value)) delete day[id]
      else day[id] = value
      return { ...prev, [today]: day }
    })
  }

  const days = lastDays(7)
  const series = days.map((d) => ({ label: d.label, value: log[d.key]?.[metric] || 0 }))
  const filled = series.filter((s) => s.value > 0)
  const avg = filled.length ? filled.reduce((a, s) => a + s.value, 0) / filled.length : 0

  return (
    <Card title="Salute" subtitle="oggi">
      <div className="grid-2">
        {METRICS.map((m) => (
          <label key={m.id} className="field">
            <span>{m.label}</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step={m.step}
              value={todayData[m.id] ?? ''}
              onChange={(e) => setValue(m.id, e.target.value)}
              placeholder="—"
            />
          </label>
        ))}
      </div>

      <div className="tabs" role="tablist">
        {METRICS.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={metric === m.id}
            className={metric === m.id ? 'tab on' : 'tab'}
            onClick={() => setMetric(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <BarChart data={series} unit={current.unit} />
      <Stat
        label={`Media ultimi 7 giorni`}
        value={filled.length ? `${avg.toFixed(1)}${current.unit}` : '—'}
        hint={filled.length ? `${filled.length} giorni con dati` : 'Inserisci un valore per iniziare'}
      />
    </Card>
  )
}
