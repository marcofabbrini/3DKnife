import { useState } from 'react'
import Backup from './Backup'
import { ALL_IDS, CARDS } from './registry'
import { safeUrl, useSettings } from '../lib/settings'

const LAYOUTS = [
  { id: 'ring', name: 'Anello', desc: 'Le schede girano su un cilindro' },
  { id: 'deck', name: 'Pila', desc: 'Scorrono come carte impilate' },
  { id: 'grid', name: 'Griglia', desc: 'Tutte visibili insieme' },
]

const THEMES = [
  { id: 'auto', name: 'Automatico' },
  { id: 'light', name: 'Chiaro' },
  { id: 'dark', name: 'Scuro' },
]

const KIND_LABEL = { collegata: 'collegata', link: 'apre il tuo sito', manuale: 'dati a mano' }

function UrlField({ id, label, value, onChange, placeholder }) {
  const invalid = value.trim() !== '' && safeUrl(value) === ''
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="url"
        inputMode="url"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
      />
      {invalid && <span className="field-error">L’indirizzo deve iniziare con https://</span>}
    </label>
  )
}

export default function Customize() {
  const [settings, update, reset] = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)

  const enabled = settings.order.filter((id) => CARDS[id])
  const disabled = ALL_IDS.filter((id) => !enabled.includes(id))

  const add = (id) => update({ order: [...enabled, id] })
  const remove = (id) => update({ order: enabled.filter((x) => x !== id) })
  const move = (id, dir) => {
    const i = enabled.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= enabled.length) return
    const next = [...enabled]
    ;[next[i], next[j]] = [next[j], next[i]]
    update({ order: next })
  }

  return (
    <>
      <section className="section" aria-labelledby="sec-layout">
        <h3 id="sec-layout">Disposizione</h3>
        <div className="options" role="radiogroup" aria-label="Disposizione delle schede">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={settings.layout === l.id}
              className="option"
              onClick={() => update({ layout: l.id })}
            >
              <strong>{l.name}</strong>
              <span className="muted small">{l.desc}</span>
            </button>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={settings.auto} onChange={(e) => update({ auto: e.target.checked })} />
          <span>Rotazione automatica (anello e pila)</span>
        </label>
      </section>

      <section className="section" aria-labelledby="sec-cards">
        <h3 id="sec-cards">Schede attive</h3>
        <ul className="list">
          {enabled.map((id, i) => (
            <li key={id} className="row">
              <span>
                {CARDS[id].title}
                <span className="muted small"> · {KIND_LABEL[CARDS[id].kind]}</span>
              </span>
              <button type="button" className="icon-btn sq" aria-label={`Sposta su ${CARDS[id].title}`} disabled={i === 0} onClick={() => move(id, -1)}>
                ↑
              </button>
              <button type="button" className="icon-btn sq" aria-label={`Sposta giù ${CARDS[id].title}`} disabled={i === enabled.length - 1} onClick={() => move(id, 1)}>
                ↓
              </button>
              <button type="button" className="btn ghost small-btn" onClick={() => remove(id)}>
                Togli
              </button>
            </li>
          ))}
          {enabled.length === 0 && <li className="muted">Nessuna scheda attiva: aggiungine una qui sotto.</li>}
        </ul>

        {disabled.length > 0 && (
          <>
            <h3 id="sec-add">Schede da aggiungere</h3>
            <ul className="list">
              {disabled.map((id) => (
                <li key={id} className="row">
                  <span>
                    {CARDS[id].title}
                    <span className="muted small"> · {KIND_LABEL[CARDS[id].kind]}</span>
                  </span>
                  <button type="button" className="btn small-btn" onClick={() => add(id)}>
                    Aggiungi
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="section" aria-labelledby="sec-links">
        <h3 id="sec-links">Collegamenti</h3>
        <UrlField
          id="wallet-url"
          label="Portafoglio: indirizzo diverso (facoltativo)"
          value={settings.walletUrl}
          onChange={(v) => update({ walletUrl: v })}
          placeholder="https://…"
        />
        <UrlField
          id="docs-url"
          label="Documenti: indirizzo diverso (facoltativo)"
          value={settings.docsUrl}
          onChange={(v) => update({ docsUrl: v })}
          placeholder="https://…"
        />
        <label className="field" htmlFor="google-client">
          <span>ID client Google (per il Calendario)</span>
          <input
            id="google-client"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            value={settings.googleClientId}
            onChange={(e) => update({ googleClientId: e.target.value })}
            placeholder="xxxx.apps.googleusercontent.com"
          />
        </label>
        <p className="muted small">
          L’ID client è un identificativo pubblico, non una password. I passaggi per crearlo sono nel README.
        </p>
      </section>

      <section className="section" aria-labelledby="sec-look">
        <h3 id="sec-look">Aspetto</h3>
        <div className="options two" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={settings.theme === t.id}
              className="option"
              onClick={() => update({ theme: t.id })}
            >
              <strong>{t.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="sec-data">
        <h3 id="sec-data">Dati</h3>
        <Backup />
        <div className="confirm-row">
          {confirmReset ? (
            <>
              <span className="small">Torni alle schede e alle impostazioni iniziali. I dati inseriti restano.</span>
              <div className="inline-form">
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    reset()
                    setConfirmReset(false)
                  }}
                >
                  Ripristina
                </button>
                <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>
                  Annulla
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirmReset(true)}>
              Ripristina impostazioni iniziali
            </button>
          )}
        </div>
      </section>
    </>
  )
}
