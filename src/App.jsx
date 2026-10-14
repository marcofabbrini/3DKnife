import { lazy, Suspense, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// La scena 3D viene caricata a parte per non rallentare il primo rendering
const Scene = lazy(() => import('./Scene'))

const cards = [
  { title: '3D in tempo reale', text: 'Scene WebGL con Three.js e React Three Fiber, che reagiscono al mouse.' },
  { title: 'Animazioni allo scroll', text: 'GSAP ScrollTrigger collega le animazioni allo scorrimento della pagina.' },
  { title: 'Interfaccia fluida', text: 'Framer Motion gestisce ingressi, hover e transizioni dei componenti.' },
]

export default function App() {
  const titleRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Titolo: ogni lettera entra con un leggero ritardo
      gsap.from('.letter', {
        yPercent: 120,
        rotateX: -80,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.04,
        delay: 0.3,
      })

      // Schede: compaiono scorrendo la pagina
      gsap.from('.card', {
        y: 80,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
      })
    })
    return () => ctx.revert()
  }, [])

  const title = 'Il tuo mondo in 3D'

  return (
    <>
      <section className="hero">
        <div className="canvas-wrap">
          <Suspense fallback={<div className="loading">Caricamento scena…</div>}>
            <Scene />
          </Suspense>
        </div>

        <div className="hero-text">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Three.js · GSAP · Framer Motion
          </motion.p>

          <h1 ref={titleRef} aria-label={title}>
            {title.split('').map((ch, i) => (
              <span className="mask" key={i} aria-hidden="true">
                <span className="letter">{ch === ' ' ? ' ' : ch}</span>
              </span>
            ))}
          </h1>

          <motion.a
            href="#sezioni"
            className="cta"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            Scopri di più
          </motion.a>
        </div>

        <div className="scroll-hint" aria-hidden="true">scorri ↓</div>
      </section>

      <section id="sezioni" className="features" ref={cardsRef}>
        {cards.map((c) => (
          <motion.article className="card" key={c.title} whileHover={{ y: -8 }}>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </motion.article>
        ))}
      </section>
    </>
  )
}
