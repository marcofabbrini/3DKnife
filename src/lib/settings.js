import { useCallback } from 'react'
import { useLocalStorage } from './store'

export const DEFAULT_HABITS = ['Acqua', 'Movimento', 'Lettura']

// Schede attive all'inizio: quelle che si collegano più facilmente
export const DEFAULT_ORDER = ['meteo', 'calendario', 'portafoglio', 'documenti']

export const DEFAULTS = {
  layout: 'ring', // ring | deck | grid
  order: DEFAULT_ORDER,
  theme: 'auto', // auto | light | dark
  auto: false, // rotazione automatica
  walletUrl: '',
  docsUrl: '',
  googleClientId: '',
}

export function useSettings() {
  const [stored, setStored] = useLocalStorage('settings', {})
  const settings = { ...DEFAULTS, ...stored }
  const update = useCallback((patch) => setStored((prev) => ({ ...prev, ...patch })), [setStored])
  const reset = useCallback(() => setStored({}), [setStored])
  return [settings, update, reset]
}

// Accetta solo indirizzi https: nessun javascript: o altri schemi
export function safeUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}
