import { Card } from './ui'
import { useSettings } from '../lib/settings'
import { connectCalendar, dayLabel, eventDate, refreshCalendar, timeLabel, useCalendar } from '../lib/calendar'

export default function Calendar() {
  const [settings] = useSettings()
  const cal = useCalendar()
  const connected = cal.status === 'ok'

  // Eventi raggruppati per giorno
  const groups = []
  cal.events.forEach((e) => {
    const date = eventDate(e)
    const label = dayLabel(date)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push({ e, date })
    else groups.push({ label, items: [{ e, date }] })
  })

  return (
    <Card title="Calendario" subtitle="Google Calendar, prossimi 7 giorni">
      {!settings.googleClientId && (
        <p className="muted">
          Per collegare Google serve un ID client personale. Aggiungilo in Personalizza, nella parte Collegamenti. I passaggi
          sono spiegati nel README.
        </p>
      )}

      <div className="inline-form">
        <button
          type="button"
          className="btn"
          disabled={!settings.googleClientId || cal.status === 'loading'}
          onClick={() => (connected ? refreshCalendar() : connectCalendar(settings.googleClientId))}
        >
          {cal.status === 'loading' ? 'Attendi…' : connected ? 'Aggiorna' : 'Collega Google'}
        </button>
      </div>
      {cal.message && <p className="muted">{cal.message}</p>}

      {connected && groups.length === 0 && <p className="muted">Nessun evento nei prossimi 7 giorni.</p>}

      {connected &&
        groups.map((g) => (
          <div key={g.label} className="day-group">
            <h3 className="day-label">{g.label}</h3>
            <ul className="list">
              {g.items.map(({ e, date }) => (
                <li key={e.id} className="row">
                  <span>
                    {e.title}
                    {e.location && <span className="muted small"> · {e.location}</span>}
                  </span>
                  <span className="muted small">{e.allDay ? 'tutto il giorno' : timeLabel(date)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </Card>
  )
}
