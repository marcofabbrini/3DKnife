import { useRef, useState } from 'react'
import { exportAll, importAll } from '../lib/store'

// Backup e ripristino di tutti i dati salvati nel browser
export default function Backup() {
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null)
  const [error, setError] = useState('')

  const download = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cruscotto-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const choose = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('formato')
      setError('')
      setPending(data)
    } catch {
      setError('Il file non è un backup valido.')
    }
  }

  return (
    <div className="backup">
      <p className="muted small">
        I dati sono salvati solo in questo browser. Scarica un backup per non perderli o per spostarli su un altro
        dispositivo.
      </p>
      <div className="inline-form wrap">
        <button type="button" className="btn" onClick={download}>
          Scarica backup
        </button>
        <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
          Ripristina da file
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={choose} />
      </div>
      {error && <p className="muted small">{error}</p>}
      {pending && (
        <div className="confirm">
          <p className="small">Ripristinare il backup? I dati attuali verranno sovrascritti.</p>
          <div className="inline-form">
            <button type="button" className="btn danger" onClick={() => importAll(pending)}>
              Ripristina
            </button>
            <button type="button" className="btn ghost" onClick={() => setPending(null)}>
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
