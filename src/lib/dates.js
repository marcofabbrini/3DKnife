const pad = (n) => String(n).padStart(2, '0')

// Data locale in formato AAAA-MM-GG
export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayKey = () => toKey(new Date())

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

// Gli ultimi n giorni, dal più vecchio a oggi
export function lastDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({
      key: toKey(d),
      label: d.toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 3),
    })
  }
  return out
}

// Lunedì della settimana corrente
export function weekStartKey() {
  const d = new Date()
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return toKey(d)
}

export const formatMinutes = (min) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${h}h ${pad(m)}m`
}

export const formatEuro = (n) =>
  n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })

export const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} min fa`
  if (diff < 86400) return `${Math.round(diff / 3600)} h fa`
  return `${Math.round(diff / 86400)} g fa`
}
