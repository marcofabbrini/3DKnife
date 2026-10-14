import { useSyncExternalStore } from 'react'

// Google Calendar in sola lettura.
// Il token di accesso resta solo in memoria (dura circa un'ora) e non viene mai salvato:
// alla riapertura della pagina basta toccare "Collega Google".
let token = null
let state = { status: 'idle', events: [], message: '' }
const subscribers = new Set()

function set(patch) {
  state = { ...state, ...patch }
  subscribers.forEach((fn) => fn())
}

export function useCalendar() {
  return useSyncExternalStore(
    (callback) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
    () => state,
  )
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('script'))
    document.head.appendChild(script)
  })
}

export async function refreshCalendar() {
  if (!token) {
    set({ status: 'idle', message: 'Sessione scaduta: ricollega Google.', events: [] })
    return
  }
  set({ status: 'loading', message: '' })
  try {
    const now = new Date()
    const max = new Date(now.getTime() + 7 * 86400000)
    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: max.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20',
    })
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      token = null
      set({ status: 'idle', message: 'Sessione scaduta: ricollega Google.', events: [] })
      return
    }
    if (!res.ok) {
      set({ status: 'error', message: 'Google Calendar non ha risposto: riprova più tardi.' })
      return
    }
    const json = await res.json()
    const events = (json.items || []).map((e) => ({
      id: e.id,
      title: e.summary || '(senza titolo)',
      start: e.start?.dateTime || e.start?.date,
      allDay: !e.start?.dateTime,
      location: e.location || '',
    }))
    set({ status: 'ok', events, message: '' })
  } catch {
    set({ status: 'error', message: 'Google Calendar non raggiungibile.' })
  }
}

export async function connectCalendar(clientId) {
  const id = String(clientId || '').trim()
  if (!id) {
    set({ status: 'error', message: 'Inserisci l’ID client Google in Personalizza.' })
    return
  }
  set({ status: 'loading', message: '' })
  try {
    await loadGoogleScript()
  } catch {
    set({ status: 'error', message: 'Impossibile caricare l’accesso Google.' })
    return
  }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: id,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    callback: (response) => {
      if (response.error || !response.access_token) {
        set({ status: 'error', message: 'Accesso a Google negato o annullato.' })
        return
      }
      token = response.access_token
      refreshCalendar()
    },
    error_callback: () => set({ status: 'error', message: 'Accesso a Google annullato.' }),
  })
  client.requestAccessToken({ prompt: '' })
}

// Etichetta del giorno di un evento: Oggi, Domani o giorno della settimana
export function eventDate(event) {
  return event.allDay ? new Date(`${event.start}T00:00:00`) : new Date(event.start)
}

export function dayLabel(date) {
  const start = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((start(date) - start(new Date())) / 86400000)
  if (diff === 0) return 'Oggi'
  if (diff === 1) return 'Domani'
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const timeLabel = (date) => date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
