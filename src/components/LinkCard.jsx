import { Card } from './ui'
import { safeUrl, useSettings } from '../lib/settings'

// Dettaglio di una scheda che apre un sito esterno (Portafoglio, Documenti).
// Qui non viene salvato nulla: carte e documenti restano nel sito dedicato.
function LinkDetail({ title, field, intro }) {
  const [settings] = useSettings()
  const url = safeUrl(settings[field])

  return (
    <Card title={title}>
      <p className="muted">{intro}</p>
      {url ? (
        <a className="btn link-btn" href={url} target="_blank" rel="noopener noreferrer">
          Apri {title.toLowerCase()}
        </a>
      ) : (
        <p>
          Il link non è ancora impostato. Aprilo da <strong>Personalizza → Collegamenti</strong> e incolla l’indirizzo
          del tuo sito, che deve iniziare con https://.
        </p>
      )}
    </Card>
  )
}

export function WalletDetail() {
  return (
    <LinkDetail
      title="Portafoglio"
      field="walletUrl"
      intro="Le tue carte restano nel sito che le gestisce. Il cruscotto conserva solo il link per aprirlo."
    />
  )
}

export function DocsDetail() {
  return (
    <LinkDetail
      title="Documenti"
      field="docsUrl"
      intro="Documenti di identità e altri file importanti restano nel tuo sito dedicato. Il cruscotto conserva solo il link."
    />
  )
}
