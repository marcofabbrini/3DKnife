import { useLocalStorage } from '../lib/store'
import { DEFAULT_HABITS, safeUrl, useSettings } from '../lib/settings'
import { describeWeather, useWeather } from '../lib/useWeather'
import { useGitHub } from '../lib/useGitHub'
import { dayLabel, eventDate, timeLabel, useCalendar } from '../lib/calendar'
import { formatEuro, formatMinutes, lastDays, monthKey, todayKey, weekStartKey } from '../lib/dates'

const TONE = { ok: '--ok', warn: '--warn', bad: '--danger', mute: '--muted' }
const fmt = (n, digits = 1) => Number(n).toLocaleString('it-IT', { maximumFractionDigits: digits })

function Spark({ values }) {
  const w = 200
  const h = 46
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => [(i * w) / (values.length - 1), h - 5 - ((v - min) / range) * (h - 12)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path className="sa" d={`${line} L${w} ${h} L0 ${h} Z`} />
      <path className="sl" d={line} />
      <circle className="sd" cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r="3.2" />
    </svg>
  )
}

// Faccia riassuntiva di una scheda: titolo, valore, nota, grafico o barra, etichetta di stato
export function Face({ k, v, sub, spark, bar, pill }) {
  const showSpark = spark && spark.length > 1 && spark.some((x) => x > 0)
  return (
    <>
      <div className="kicker">{k}</div>
      <div className="value">{v}</div>
      <div className="sub">{sub}</div>
      <div className="grow" />
      {showSpark && <Spark values={spark} />}
      {!showSpark && bar != null && (
        <div className="bar" role="img" aria-label={`${Math.round(bar)}%`}>
          <i style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
        </div>
      )}
      {pill && (
        <span className="pill" style={{ '--tone': `var(${TONE[pill[1]]})` }}>
          {pill[0]}
        </span>
      )}
    </>
  )
}

// ---------- Schede collegate ----------

export function WeatherFace() {
  const [city] = useLocalStorage('weather-city', '')
  const wx = useWeather(city)
  if (wx.status === 'ok') {
    const d = wx.w.daily
    const rain = d.precipitation_probability_max[0] ?? 0
    return (
      <Face
        k="Meteo"
        v={`${Math.round(wx.w.current.temperature_2m)}°`}
        sub={`${describeWeather(wx.w.current.weather_code)}, min ${Math.round(d.temperature_2m_min[0])}° e max ${Math.round(d.temperature_2m_max[0])}°`}
        spark={d.temperature_2m_max}
        pill={[`Pioggia ${rain}%`, rain >= 50 ? 'warn' : 'mute']}
      />
    )
  }
  const sub = !city
    ? 'Tocca per scegliere la città'
    : wx.status === 'loading'
      ? 'Caricamento…'
      : wx.message || 'Meteo non disponibile'
  return <Face k="Meteo" v="—" sub={sub} pill={!city ? ['Città mancante', 'warn'] : undefined} />
}

export function CalendarFace() {
  const [settings] = useSettings()
  const cal = useCalendar()
  if (cal.status === 'ok') {
    if (cal.events.length === 0) {
      return <Face k="Calendario" v="Libero" sub="Nessun evento nei prossimi 7 giorni" pill={['Google collegato', 'ok']} />
    }
    const next = cal.events[0]
    const date = eventDate(next)
    const label = dayLabel(date)
    const todayCount = cal.events.filter((e) => dayLabel(eventDate(e)) === 'Oggi').length
    return (
      <Face
        k="Calendario"
        v={next.allDay ? label : timeLabel(date)}
        sub={`${next.allDay ? '' : `${label}, `}${next.title}`}
        pill={[todayCount === 1 ? '1 evento oggi' : `${todayCount} eventi oggi`, todayCount ? 'ok' : 'mute']}
      />
    )
  }
  return (
    <Face
      k="Calendario"
      v="—"
      sub={cal.message || (cal.status === 'loading' ? 'Collegamento in corso…' : 'Tocca per collegare Google Calendar')}
      pill={settings.googleClientId ? ['Da collegare', 'mute'] : ['Manca l’ID client', 'warn']}
    />
  )
}

export function GitHubFace() {
  const [user] = useLocalStorage('github-user', '')
  const gh = useGitHub(user)
  if (gh.status === 'ok') {
    return (
      <Face
        k="GitHub"
        v={String(gh.pushes)}
        sub="commit pubblici negli ultimi 7 giorni"
        pill={[`${gh.repos.length} repository recenti`, 'mute']}
      />
    )
  }
  const sub = !user ? 'Tocca per inserire il tuo utente' : gh.status === 'loading' ? 'Caricamento…' : gh.message
  return <Face k="GitHub" v="—" sub={sub} pill={!user ? ['Utente mancante', 'warn'] : undefined} />
}

// ---------- Schede con link ----------

function LinkFace({ k, field, sub }) {
  const [settings] = useSettings()
  const custom = safeUrl(settings[field])
  return (
    <Face
      k={k}
      v="Apri"
      sub={sub}
      pill={custom ? [new URL(custom).hostname, 'ok'] : ['Integrato', 'ok']}
    />
  )
}

export const WalletFace = () => <LinkFace k="Portafoglio" field="walletUrl" sub="Carte e documenti, solo su questo dispositivo" />
export const DocsFace = () => <LinkFace k="Documenti" field="docsUrl" sub="Documenti di identità e scansioni" />

// ---------- Schede con dati inseriti a mano ----------

export function TasksFace() {
  const [tasks] = useLocalStorage('tasks', [])
  const today = todayKey()
  const open = tasks.filter((t) => !t.done)
  const dueToday = open.filter((t) => t.due === today).length
  const overdue = open.filter((t) => t.due && t.due < today).length
  return (
    <Face
      k="Attività"
      v={String(open.length)}
      sub={`da fare, ${dueToday} in scadenza oggi`}
      bar={tasks.length ? ((tasks.length - open.length) / tasks.length) * 100 : null}
      pill={overdue ? [`${overdue} in ritardo`, 'bad'] : ['Tutto in regola', 'ok']}
    />
  )
}

export function WorkFace() {
  const [entries] = useLocalStorage('work', [])
  const [running] = useLocalStorage('work-running', null)
  const sum = (key) => entries.filter((e) => e.date === key).reduce((a, e) => a + e.minutes, 0)
  const weekStart = weekStartKey()
  const week = entries.filter((e) => e.date >= weekStart).reduce((a, e) => a + e.minutes, 0)
  return (
    <Face
      k="Ore di lavoro"
      v={formatMinutes(sum(todayKey()))}
      sub={`oggi, ${formatMinutes(week)} in settimana`}
      spark={lastDays(7).map((d) => sum(d.key) / 60)}
      pill={running ? ['Cronometro attivo', 'ok'] : ['Cronometro fermo', 'mute']}
    />
  )
}

export function HealthFace() {
  const [log] = useLocalStorage('health', {})
  const today = log[todayKey()] || {}
  return (
    <Face
      k="Salute"
      v={today.sleep ? `${fmt(today.sleep)} h` : '—'}
      sub={today.sleep ? 'di sonno oggi' : 'Nessun dato di oggi'}
      spark={lastDays(7).map((d) => log[d.key]?.sleep || 0)}
      pill={today.steps ? [`${fmt(today.steps, 0)} passi`, 'mute'] : ['Inserisci i dati', 'mute']}
    />
  )
}

export function HabitsFace() {
  const [habits] = useLocalStorage('habits', DEFAULT_HABITS)
  const [done] = useLocalStorage('habits-done', {})
  const todayDone = (done[todayKey()] || []).filter((h) => habits.includes(h)).length
  const pct = habits.length ? (todayDone / habits.length) * 100 : 0
  return (
    <Face
      k="Abitudini"
      v={`${todayDone}/${habits.length}`}
      sub="completate oggi"
      bar={habits.length ? pct : null}
      pill={habits.length && todayDone === habits.length ? ['Tutte fatte', 'ok'] : undefined}
    />
  )
}

export function SolarFace() {
  const [log] = useLocalStorage('solar', {})
  const month = monthKey()
  const rows = Object.entries(log).filter(([k]) => k.startsWith(month))
  const prod = rows.reduce((a, [, d]) => a + (d.prod || 0), 0)
  const exp = rows.reduce((a, [, d]) => a + (d.exp || 0), 0)
  const selfUse = prod > 0 ? Math.max(0, ((prod - exp) / prod) * 100) : 0
  return (
    <Face
      k="Fotovoltaico"
      v={`${fmt(prod)} kWh`}
      sub="prodotti nel mese"
      spark={lastDays(7).map((d) => log[d.key]?.prod || 0)}
      pill={prod > 0 ? [`Autoconsumo ${Math.round(selfUse)}%`, 'mute'] : ['Inserisci i dati', 'mute']}
    />
  )
}

export function CarFace() {
  const [car] = useLocalStorage('car', {})
  const battery = car.battery === '' || car.battery == null ? null : Number(car.battery)
  const pill = car.plugged ? ['In carica', 'ok'] : battery !== null && battery < 20 ? ['Batteria bassa', 'bad'] : ['Non in carica', 'mute']
  return (
    <Face
      k="Auto elettrica"
      v={battery === null ? '—' : `${battery}%`}
      sub={car.range ? `batteria, autonomia ${car.range} km` : 'Tocca per inserire lo stato'}
      bar={battery}
      pill={pill}
    />
  )
}

export function BudgetFace() {
  const [expenses] = useLocalStorage('expenses', [])
  const [budget] = useLocalStorage('budget', 0)
  const month = monthKey()
  const total = expenses.filter((e) => e.date.startsWith(month)).reduce((a, e) => a + e.amount, 0)
  const pct = budget > 0 ? (total / budget) * 100 : null
  return (
    <Face
      k="Spese"
      v={formatEuro(total)}
      sub={budget > 0 ? `questo mese su ${formatEuro(budget)}` : 'questo mese, imposta un budget'}
      bar={pct}
      pill={pct === null ? undefined : pct >= 100 ? ['Oltre il budget', 'bad'] : ['Entro il budget', 'ok']}
    />
  )
}
