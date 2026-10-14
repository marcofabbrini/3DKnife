import { useEffect, useState } from 'react'

const PREFIX = 'dash:'

// Come useState, ma il valore resta salvato nel browser
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // archivio pieno o bloccato: la scheda continua a funzionare senza salvare
    }
  }, [key, value])

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
