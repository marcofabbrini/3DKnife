import { useState } from 'react'
import { Card, Progress, Stat } from './ui'
import { useLocalStorage, uid } from '../lib/store'
import { formatEuro, monthKey, todayKey } from '../lib/dates'

const CATEGORIES = ['Casa', 'Spesa', 'Trasporti', 'Svago', 'Salute', 'Altro']

export default function Budget() {
  const [expenses, setExpenses] = useLocalStorage('expenses', [])
  const [budget, setBudget] = useLocalStorage('budget', 0)
  const [form, setForm] = useState({ amount: '', cat: CATEGORIES[1], note: '' })

  const month = monthKey()
  const thisMonth = expenses.filter((e) => e.date.startsWith(month))
  const total = thisMonth.reduce((a, e) => a + e.amount, 0)
  const byCat = CATEGORIES.map((c) => ({
    c,
    v: thisMonth.filter((e) => e.cat === c).reduce((a, e) => a + e.amount, 0),
  })).filter((x) => x.v > 0)
  const pct = budget > 0 ? (total / budget) * 100 : 0

  const add = (e) => {
    e.preventDefault()
    const amount = Number(String(form.amount).replace(',', '.'))
    if (!amount || amount <= 0) return
    setExpenses([{ id: uid(), date: todayKey(), amount, cat: form.cat, note: form.note.trim() }, ...expenses])
    setForm({ ...form, amount: '', note: '' })
  }

  return (
    <Card title="Spese" subtitle="questo mese" wide>
      <div className="split">
        <div>
          <Stat
            label="Spesa del mese"
            value={formatEuro(total)}
            hint={budget > 0 ? `${formatEuro(Math.max(budget - total, 0))} rimasti su ${formatEuro(budget)}` : 'Imposta un budget'}
          />
          {budget > 0 && <Progress value={pct} danger={pct >= 100} />}
          <label className="field">
            <span>Budget mensile (€)</span>
            <input
              type="number"
              min="0"
              step="10"
              value={budget || ''}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </label>
          <ul className="list">
            {byCat.map((x) => (
              <li key={x.c} className="row">
                <span>{x.c}</span>
                <span className="muted">{formatEuro(x.v)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <form className="inline-form wrap" onSubmit={add}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Importo €"
              aria-label="Importo"
            />
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} aria-label="Categoria">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Nota (facoltativa)"
              aria-label="Nota"
            />
            <button type="submit" className="btn">
              Aggiungi
            </button>
          </form>
          <ul className="list">
            {expenses.slice(0, 6).map((e) => (
              <li key={e.id} className="row">
                <span>
                  {e.cat}
                  {e.note && <span className="muted"> · {e.note}</span>}
                </span>
                <span className="muted small">{e.date.slice(5).split('-').reverse().join('/')}</span>
                <strong>{formatEuro(e.amount)}</strong>
                <button
                  className="icon-btn"
                  onClick={() => setExpenses(expenses.filter((x) => x.id !== e.id))}
                  aria-label="Elimina spesa"
                >
                  ×
                </button>
              </li>
            ))}
            {expenses.length === 0 && <li className="muted">Nessuna spesa registrata.</li>}
          </ul>
        </div>
      </div>
    </Card>
  )
}
