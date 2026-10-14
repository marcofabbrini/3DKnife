import { useState } from 'react'
import { Card } from './ui'
import { useLocalStorage, uid } from '../lib/store'
import { todayKey } from '../lib/dates'

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const today = todayKey()

  const add = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setTasks([{ id: uid(), text: t, due, done: false }, ...tasks])
    setText('')
    setDue('')
  }

  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  // Da fare per prime: scadenza più vicina; completate in fondo
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (a.due || '9999').localeCompare(b.due || '9999')
  })
  const open = tasks.filter((t) => !t.done).length

  return (
    <Card title="Attività" subtitle={`${open} da fare`}>
      <form className="inline-form wrap" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nuova attività" aria-label="Attività" />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Scadenza" />
        <button type="submit" className="btn">
          Aggiungi
        </button>
      </form>
      <ul className="list">
        {sorted.slice(0, 8).map((t) => {
          const overdue = !t.done && t.due && t.due < today
          return (
            <li key={t.id} className="row">
              <label className="check">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                <span className={t.done ? 'done' : ''}>{t.text}</span>
              </label>
              {t.due && (
                <span className={overdue ? 'badge bad' : 'badge'}>
                  {t.due === today ? 'oggi' : t.due.slice(5).split('-').reverse().join('/')}
                </span>
              )}
              <button
                className="icon-btn"
                onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
                aria-label="Elimina attività"
              >
                ×
              </button>
            </li>
          )
        })}
        {tasks.length === 0 && <li className="muted">Niente in programma.</li>}
      </ul>
    </Card>
  )
}
