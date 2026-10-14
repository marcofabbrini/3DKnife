import { useState } from 'react'
import { Card, Progress } from './ui'
import { useLocalStorage } from '../lib/store'
import { DEFAULT_HABITS } from '../lib/settings'
import { lastDays, todayKey } from '../lib/dates'

export default function Habits() {
  const [habits, setHabits] = useLocalStorage('habits', DEFAULT_HABITS)
  const [done, setDone] = useLocalStorage('habits-done', {})
  const [name, setName] = useState('')
  const today = todayKey()
  const todayDone = done[today] || []

  const toggle = (h) =>
    setDone((prev) => {
      const set = new Set(prev[today] || [])
      if (set.has(h)) set.delete(h)
      else set.add(h)
      return { ...prev, [today]: [...set] }
    })

  const add = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (n && !habits.includes(n)) setHabits([...habits, n])
    setName('')
  }

  const remove = (h) => setHabits(habits.filter((x) => x !== h))

  // Serie di giorni consecutivi, contando oggi solo se l'abitudine è già fatta
  const streak = (h) => {
    let count = 0
    const days = lastDays(60).reverse()
    for (let i = 0; i < days.length; i++) {
      const ok = (done[days[i].key] || []).includes(h)
      if (ok) count++
      else if (i === 0) continue
      else break
    }
    return count
  }

  const pct = habits.length ? (todayDone.filter((h) => habits.includes(h)).length / habits.length) * 100 : 0

  return (
    <Card title="Abitudini" subtitle={`${Math.round(pct)}% di oggi`}>
      <Progress value={pct} />
      <ul className="list">
        {habits.map((h) => (
          <li key={h} className="row">
            <label className="check">
              <input type="checkbox" checked={todayDone.includes(h)} onChange={() => toggle(h)} />
              <span className={todayDone.includes(h) ? 'done' : ''}>{h}</span>
            </label>
            <span className="muted small">{streak(h)} 🔥</span>
            <button className="icon-btn" onClick={() => remove(h)} aria-label={`Elimina ${h}`}>
              ×
            </button>
          </li>
        ))}
        {habits.length === 0 && <li className="muted">Nessuna abitudine: aggiungine una.</li>}
      </ul>
      <form className="inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nuova abitudine" />
        <button type="submit" className="btn">
          Aggiungi
        </button>
      </form>
    </Card>
  )
}
