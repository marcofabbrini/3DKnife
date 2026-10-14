import { useState } from 'react'
import { Card, Stat } from './ui'
import { useLocalStorage } from '../lib/store'
import { useGitHub } from '../lib/useGitHub'
import { timeAgo } from '../lib/dates'

export default function GitHubCard() {
  const [user, setUser] = useLocalStorage('github-user', '')
  const [draft, setDraft] = useState(user)
  const state = useGitHub(user)

  const submit = (e) => {
    e.preventDefault()
    setUser(draft.trim())
  }

  return (
    <Card title="GitHub" subtitle="repository pubblici">
      <form className="inline-form" onSubmit={submit}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nome utente GitHub" aria-label="Utente GitHub" />
        <button type="submit" className="btn">
          Carica
        </button>
      </form>

      {state.status === 'loading' && <p className="muted">Caricamento…</p>}
      {state.status === 'error' && <p className="muted">{state.message}</p>}
      {state.status === 'idle' && <p className="muted">Inserisci il tuo nome utente.</p>}

      {state.status === 'ok' && (
        <>
          <Stat label="Commit pubblici negli ultimi 7 giorni" value={state.pushes} />
          <ul className="list">
            {state.repos.map((r) => (
              <li key={r.id} className="row">
                <a href={r.html_url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
                <span className="muted small">★ {r.stargazers_count}</span>
                <span className="muted small">{timeAgo(r.pushed_at)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
