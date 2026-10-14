import { useCallback, useRef, useSyncExternalStore } from 'react'

const PREFIX = 'dash:'

// Copia in memoria e iscritti: così più componenti che leggono la stessa chiave
// (la scheda riassuntiva e il suo dettaglio) restano sempre allineati.
const cache = new Map()
const listeners = new Map()

function read(key, initial) {
  if (cache.has(key)) return cache.get(key)
  let value = initial
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw !== null) value = JSON.parse(raw)
  } catch {
    // archivio bloccato o voce non valida: uso il valore iniziale
  }
  cache.set(key, value)
  return value
}

function write(key, value) {
  cache.set(key, value)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // archivio pieno o bloccato: il valore resta valido finché la pagina è aperta
  }
  listeners.get(key)?.forEach((fn) => fn())
}

// Come useState, ma il valore resta salvato nel browser
export function useLocalStorage(key, initial) {
  const initialRef = useRef(initial)

  const subscribe = useCallback(
    (callback) => {
      let set = listeners.get(key)
      if (!set) {
        set = new Set()
        listeners.set(key, set)
      }
      set.add(callback)
      return () => set.delete(callback)
    },
    [key],
  )

  const value = useSyncExternalStore(subscribe, () => read(key, initialRef.current))

  const setValue = useCallback(
    (next) => {
      const prev = read(key, initialRef.current)
      write(key, typeof next === 'function' ? next(prev) : next)
    },
    [key],
  )

  return [value, setValue]
}

// Raccoglie tutti i dati della dashboard in un oggetto (per il backup)
export function exportAll() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) {
      try {
        data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k))
      } catch {
        // voce non valida: la salto
      }
    }
  }
  return data
}

// Ripristina un backup e ricarica la pagina
export function importAll(data) {
  Object.entries(data).forEach(([k, v]) => {
    localStorage.setItem(PREFIX + k, JSON.stringify(v))
  })
  window.location.reload()
}

export const uid = () => Math.random().toString(36).slice(2, 10)
