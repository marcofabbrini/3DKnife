import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import './App.css'
import Stage3D from './components/Stage3D'
import Sheet from './components/Sheet'
import Customize from './components/Customize'
import { CARDS } from './components/registry'
import { safeUrl, useSettings } from './lib/settings'

const TITLE = 'Il mio cruscotto'

export default function App() {
  const [settings] = useSettings()
  const [openId, setOpenId] = useState(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [today] = useState(() =>
    new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }),
  )

  const closeDetail = useCallback(() => setOpenId(null), [])
  const closeCustom = useCallback(() => setCustomOpen(false), [])

  // Titolo: le lettere entrano una alla volta
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.letter', {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.035,
        delay: 0.15,
      })
    })
    return () => ctx.revert()
  }, [])

  // Tema scelto in Personalizza; "automatico" segue il dispositivo
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'light' || settings.theme === 'dark') root.dataset.theme = settings.theme
    else delete root.dataset.theme
  }, [settings.theme])

  const ids = settings.order.filter((id) => CARDS[id])

  // Portafoglio e Documenti aprono direttamente il tuo sito, se il link è impostato
  const openCard = (id) => {
    const link = CARDS[id].link
    const url = link ? safeUrl(settings[link]) : ''
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else setOpenId(id)
  }

  const Detail = openId ? CARDS[openId].Detail : null

  return (
    <>
      <header className="top">
        <div className="top-title">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {today}
          </motion.p>
          <h1 aria-label={TITLE}>
            {TITLE.split('').map((ch, i) => (
              <span className="mask" key={i} aria-hidden="true">
                <span className="letter">{ch === ' ' ? ' ' : ch}</span>
              </span>
            ))}
          </h1>
        </div>
        <button type="button" className="btn" onClick={() => setCustomOpen(true)}>
          Personalizza
        </button>
      </header>

      <main className="main">
        {ids.length > 0 ? (
          <Stage3D key={ids.join('|')} ids={ids} layout={settings.layout} auto={settings.auto} onOpen={openCard} />
        ) : (
          <p className="empty">Nessuna scheda attiva. Apri Personalizza e aggiungine una.</p>
        )}
      </main>

      <AnimatePresence>
        {openId && (
          <Sheet key="detail" title={CARDS[openId].title} onClose={closeDetail}>
            <Detail />
          </Sheet>
        )}
        {customOpen && (
          <Sheet key="custom" title="Personalizza" onClose={closeCustom}>
            <Customize />
          </Sheet>
        )}
      </AnimatePresence>
    </>
  )
}
