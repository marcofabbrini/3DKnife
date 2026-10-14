import { useState } from 'react'
import { Card, BarChart, Stat } from './ui'
import { useLocalStorage } from '../lib/store'
import { lastDays, monthKey, todayKey } from '../lib/dates'

const FIELDS = [
  { id: 'prod', label: 'Prodotti (kWh)' },
  { id: 'cons', label: 'Consumati (kWh)' },
  { id: 'exp', label: 'Immessi in rete (kWh)' },
]

export default function Solar() {
  const [log, setLog] = useLocalStorage('solar', {})
  const [day, setDay] = useState(todayKey())
  const data = log[day] || {}

  const setValue = (id, raw) => {
    const v = raw === '' ? undefined : Number(raw)
    setLog((prev) => {
      const d = { ...(prev[day] || {}) }
      if (v === undefined || Number.isNaN(v)) delete d[id]
      else d[id] = v
      return { ...prev, [day]: d }
    })
  }

  const month = monthKey()
  const monthDays = Object.entries(log).filter(([k]) => k.startsWith(month))
  const sum = (id) => monthDays.reduce((a, [, d]) => a + (d[id] || 0), 0)
  const prod = sum('prod')
  const exp = sum('exp')
  // Quota di produzione usata in casa invece di essere immessa in rete
  const selfUse = prod > 0 ? Math.max(0, ((prod - exp) / prod) * 100) : 0

  const series = lastDays(7).map((d) => ({
    label: d.label,
    value: log[d.key]?.prod || 0,
    value2: log[d.key]?.cons || 0,
  }))

  return (
    <Card title="Fotovoltaico" subtitle="inserimento manuale">
      <div className="grid-2">
        <Stat label="Prodotti nel mese" value={`${prod.toFixed(1)} kWh`} />
        <Stat label="Autoconsumo" value={prod > 0 ? `${selfUse.toFixed(0)}%` : '—'} hint="produzione non immessa in rete" />
      </div>
      <BarChart data={series} unit=" kWh" color="var(--warn)" color2="var(--accent)" />
      <p className="legend muted small">
        <span className="dot" style={{ background: 'var(--warn)' }} /> Prodotti
        <span className="dot" style={{ background: 'var(--accent)' }} /> Consumati
      </p>
      <label className="field">
        <span>Giorno</span>
        <input type="date" value={day} max={todayKey()} onChange={(e) => setDay(e.target.value || todayKey())} />
      </label>
      <div className="grid-3">
        {FIELDS.map((f) => (
          <label key={f.id} className="field">
            <span>{f.label}</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={data[f.id] ?? ''}
              onChange={(e) => setValue(f.id, e.target.value)}
              placeholder="—"
            />
          </label>
        ))}
      </div>
    </Card>
  )
}
