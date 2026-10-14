import { useRef } from 'react'
import { Card } from './ui'
import { exportAll, importAll } from '../lib/store'

const ITEMS = [
  { name: 'Meteo', status: 'attivo', note: 'Open-Meteo, senza chiavi' },
  { name: 'GitHub', status: 'attivo', note: 'Solo repository pubblici' },
  { name: 'Gmail e Calendar', status: 'da collegare', note: 'Serve un accesso OAuth e un piccolo server' },
  { name: 'Fotovoltaico', status: 'manuale', note: 'Serve l’API del tuo inverter o portale' },
  { name: 'Auto elettrica', status: 'manuale', note: 'Serve l’API della casa costruttrice' },
]

export default function Integrations() {
  const fileRef = useRef(null)

  const download = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cruscotto-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const upload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (data && typeof data === 'object' && window.confirm('Ripristinare il backup? I dati attuali verranno sovrascritti.')) {
        importAll(data)
      }
    } catch {
      window.alert('File non valido.')
    }
    e.target.value = ''
  }

  return (
    <Card title="Collegamenti e backup" wide>
      <div className="split">
        <ul className="list">
          {ITEMS.map((i) => (
            <li key={i.name} className="row">
              <span>
                {i.name}
                <span className="muted small"> · {i.note}</span>
              </span>
              <span className={`badge ${i.status === 'attivo' ? 'ok' : ''}`}>{i.status}</span>
            </li>
          ))}
        </ul>
        <div>
          <p className="muted small">
            I tuoi dati sono salvati solo in questo browser. Scarica un backup per non perderli o per spostarli su un
            altro dispositivo.
          </p>
          <div className="inline-form">
            <button className="btn" onClick={download}>
              Scarica backup
            </button>
            <button className="btn ghost" onClick={() => fileRef.current?.click()}>
              Ripristina
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={upload} />
          </div>
        </div>
      </div>
    </Card>
  )
}
