import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import './App.css'
import Health from './components/Health'
import Habits from './components/Habits'
import Budget from './components/Budget'
import Tasks from './components/Tasks'
import WorkHours from './components/WorkHours'
import Solar from './components/Solar'
import ElectricCar from './components/ElectricCar'
import Weather from './components/Weather'
import GitHubCard from './components/GitHubCard'
import Integrations from './components/Integrations'

// La scena 3D si carica a parte, così le schede compaiono subito
const Scene = lazy(() => import('./Scene'))

const TITLE = 'Il mio cruscotto'

export default function App() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.letter', {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.035,
        delay: 0.2,
      })
    })
    return () => ctx.revert()
  }, [])

  const [today] = useState(() =>
    new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }),
  )

  return (
    <>
      <header className="top">
        <div className="top-canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
        <div className="top-text">
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
      </header>

      <main className="dashboard">
        <Weather />
        <Tasks />
        <WorkHours />
        <Health />
        <Habits />
        <Solar />
        <ElectricCar />
        <GitHubCard />
        <Budget />
        <Integrations />
      </main>

      <footer className="foot muted small">I dati restano solo nel tuo browser.</footer>
    </>
  )
}
