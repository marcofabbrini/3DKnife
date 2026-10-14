import { useEffect, useState } from 'react'

const TTL = 10 * 60 * 1000
const cache = new Map()

// Repository pubblici e commit degli ultimi 7 giorni di un utente GitHub (API pubblica, senza chiavi)
export function useGitHub(user) {
  const [state, setState] = useState(() => {
    if (!user) return { status: 'idle' }
    const hit = cache.get(user)
    return hit && Date.now() - hit.t < TTL ? hit.state : { status: 'loading' }
  })

  useEffect(() => {
    if (!user) return undefined
    const ctrl = new AbortController()

    const run = async () => {
      const hit = cache.get(user)
      if (hit && Date.now() - hit.t < TTL) {
        setState(hit.state)
        return
      }
      setState({ status: 'loading' })
      try {
        const name = encodeURIComponent(user)
        const [repos, events] = await Promise.all([
          fetch(`https://api.github.com/users/${name}/repos?sort=pushed&per_page=6`, { signal: ctrl.signal }),
          fetch(`https://api.github.com/users/${name}/events/public?per_page=100`, { signal: ctrl.signal }),
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
        const weekAgo = Date.now() - 7 * 86400000
        const pushes = eventList
          .filter((ev) => ev.type === 'PushEvent' && new Date(ev.created_at).getTime() >= weekAgo)
          .reduce((a, ev) => a + (ev.payload?.commits?.length || 1), 0)
        const next = { status: 'ok', repos: repoList, pushes }
        cache.set(user, { t: Date.now(), state: next })
        setState(next)
      } catch (err) {
        if (err.name !== 'AbortError') setState({ status: 'error', message: 'GitHub non raggiungibile.' })
      }
    }

    run()
    return () => ctrl.abort()
  }, [user])

  return user ? state : { status: 'idle' }
}
