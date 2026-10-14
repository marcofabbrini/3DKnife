import { useEffect, useState } from 'react'
import { Card, Stat } from './ui'
import { useLocalStorage } from '../lib/store'
import { timeAgo } from '../lib/dates'

export default function GitHubCard() {
  const [user, setUser] = useLocalStorage('github-user', '')
  const [draft, setDraft] = useState(user)
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (!user) return undefined
    const ctrl = new AbortController()
    const run = async () => {
      setState({ status: 'loading' })
      try {
        const [repos, events] = await Promise.all([
          fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=6`, {
            signal: ctrl.signal,
          }),
          fetch(`https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`, {
            signal: ctrl.signal,
          }),
        ])
        if (repos.status === 404) {
          setState({ status: 'error', message: 'Utente non trovato.' })
          return
        }
        if (!repos.ok || !events.ok) {
          setState({ status: 'error', message: 'Limite di richieste di GitHub raggiunto: riprova più tardi.' })
          return
        }
        const [repoList, eventList] = [await repos.json(), await events.json()]
        // Commit pubblici degli ultimi 7 giorni, calcolati qui e non durante il render
        const weekAgo = Date.now() - 7 * 86400000
        const pushes = eventList
          .filter((ev) => ev.type === 'PushEvent' && new Date(ev.created_at).getTime() >= weekAgo)
          .reduce((a, ev) => a + (ev.payload?.commits?.length || 1), 0)
        setState({ status: 'ok', repos: repoList, pushes })
      } catch (err) {
        if (err.name !== 'AbortError') setState({ status: 'error', message: 'GitHub non raggiungibile.' })
      }
    }
    run()
    return () => ctrl.abort()
  }, [user])

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
      {state.status === 'idle' && !user && <p className="muted">Inserisci il tuo nome utente.</p>}

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
