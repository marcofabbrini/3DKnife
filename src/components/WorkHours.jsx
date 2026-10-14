import { useEffect, useState } from 'react'
import { Card, BarChart, Stat } from './ui'
import { useLocalStorage, uid } from '../lib/store'
import { formatMinutes, lastDays, todayKey, weekStartKey } from '../lib/dates'

export default function WorkHours() {
  const [entries, setEntries] = useLocalStorage('work', [])
  const [running, setRunning] = useLocalStorage('work-running', null)
  const [now, setNow] = useState(() => Date.now())
  const [manual, setManual] = useState('')

  // Aggiorna il cronometro ogni secondo solo mentre è attivo
  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const elapsedMin = running ? Math.max(0, (now - running) / 60000) : 0

  const start = () => {
    setNow(Date.now())
    setRunning(Date.now())
  }

  const stop = () => {
    const minutes = (Date.now() - running) / 60000
    if (minutes >= 0.5) setEntries([{ id: uid(), date: todayKey(), minutes }, ...entries])
    setRunning(null)
  }

  const addManual = (e) => {
    e.preventDefault()
    const h = Number(String(manual).replace(',', '.'))
    if (!h || h <= 0) return
    setEntries([{ id: uid(), date: todayKey(), minutes: h * 60 }, ...entries])
    setManual('')
  }

  const sumDay = (key) => entries.filter((e) => e.date === key).reduce((a, e) => a + e.minutes, 0)
  const today = todayKey()
  const weekStart = weekStartKey()
  const week = entries.filter((e) => e.date >= weekStart).reduce((a, e) => a + e.minutes, 0)
  const todayTotal = sumDay(today) + elapsedMin

  const series = lastDays(7).map((d) => ({
    label: d.label,
    value: Math.round((sumDay(d.key) + (d.key === today ? elapsedMin : 0)) / 6) / 10,
  }))

  const clock = () => {
    const s = Math.floor(elapsedMin * 60)
    const p = (n) => String(n).padStart(2, '0')
    return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`
  }

  return (
    <Card title="Ore di lavoro" subtitle="settimana in corso">
      <div className="timer">
        <span className="timer-clock">{running ? clock() : '00:00:00'}</span>
        {running ? (
          <button className="btn danger" onClick={stop}>
            Ferma
          </button>
        ) : (
          <button className="btn" onClick={start}>
            Avvia
          </button>
        )}
      </div>
      <div className="grid-2">
        <Stat label="Oggi" value={formatMinutes(todayTotal)} />
        <Stat label="Settimana" value={formatMinutes(week + elapsedMin)} />
      </div>
      <BarChart data={series} unit=" h" color="#5ce1ff" />
      <form className="inline-form" onSubmit={addManual}>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.25"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Aggiungi ore a mano"
          aria-label="Ore da aggiungere"
        />
        <button type="submit" className="btn">
          Aggiungi
        </button>
      </form>
    </Card>
  )
}
