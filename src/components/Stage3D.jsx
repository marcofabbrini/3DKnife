import { useEffect, useRef, useState } from 'react'
import { CARDS } from './registry'

const mod = (a, n) => ((a % n) + n) % n

// Scena 3D con le schede: anello, pila o griglia.
// ids: schede da mostrare. layout: ring | deck | grid. onOpen: tocco su una scheda in primo piano.
export default function Stage3D({ ids, layout, auto, onOpen }) {
  const stageRef = useRef(null)
  const sceneRef = useRef(null)
  const dragRef = useRef(null)
  const pausedRef = useRef(false)
  const [width, setWidth] = useState(360)
  const [ready, setReady] = useState(false)
  const [order, setOrder] = useState(ids)
  const [cur, setCur] = useState(0)
  const [staggered, setStaggered] = useState(false)

  const N = order.length

  // Larghezza della scena, per adattare dimensioni e colonne
  useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // La prima disposizione appare senza animazione, poi si attivano le transizioni
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  // Rotazione automatica, solo se richiesta e se il dispositivo non chiede meno movimento
  useEffect(() => {
    if (!auto || N < 2 || layout === 'grid') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => {
      if (!pausedRef.current && !document.hidden) setCur((c) => c + 1)
    }, 3500)
    return () => clearInterval(id)
  }, [auto, N, layout])

  const narrow = width < 640
  const cw = narrow ? Math.min(210, Math.max(150, Math.round(width * 0.56))) : 236
  const ch = narrow ? Math.round(cw * 1.3) : 292
  const cols = narrow ? 2 : 4
  const rows = Math.max(1, Math.ceil(N / cols))
  const gap = narrow ? 12 : 18
  const step = 360 / Math.max(N, 1)
  const R = N >= 2 ? cw / 2 / Math.tan(Math.PI / N) + 36 : 0
  const height = layout === 'grid' ? rows * (ch + gap) - gap + 48 : ch + (narrow ? 120 : 170)
  const activeId = order[mod(cur, Math.max(N, 1))]

  const stepBy = (dir) => setCur((c) => c + dir)

  const shuffle = () => {
    setOrder((o) => {
      const a = [...o]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    })
    setStaggered(true)
    setTimeout(() => setStaggered(false), 1400)
  }

  const bringFront = (id) =>
    setCur((c) => {
      let d = mod(order.indexOf(id) - c, N)
      if (d > N / 2) d -= N
      return c + d
    })

  const onCardClick = (id) => {
    if (dragRef.current?.moved) return
    if (layout === 'grid' || id === activeId) onOpen(id)
    else bringFront(id)
  }

  const onPointerDown = (e) => {
    if (layout !== 'grid') dragRef.current = { x: e.clientX, moved: false }
  }

  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse' && sceneRef.current) {
      const r = stageRef.current.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      sceneRef.current.style.setProperty('--rx', `${(-ny * 4).toFixed(2)}deg`)
      sceneRef.current.style.setProperty('--ry', `${(nx * 6).toFixed(2)}deg`)
    }
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.x
    if (Math.abs(dx) >= 50) {
      if (!drag.moved) {
        drag.moved = true
        try {
          stageRef.current.setPointerCapture(e.pointerId)
        } catch {
          // alcuni browser non permettono la cattura: il trascinamento funziona comunque
        }
      }
      stepBy(dx < 0 ? 1 : -1)
      drag.x = e.clientX
    }
  }

  const endDrag = () => setTimeout(() => (dragRef.current = null), 0)

  const resetTilt = () => {
    pausedRef.current = false
    if (sceneRef.current) {
      sceneRef.current.style.setProperty('--rx', '0deg')
      sceneRef.current.style.setProperty('--ry', '0deg')
    }
  }

  const onKeyDown = (e) => {
    if (layout === 'grid' || N < 2) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      stepBy(1)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      stepBy(-1)
    }
  }

  return (
    <>
      <div
        ref={stageRef}
        className={`stage${ready ? ' ready' : ''}`}
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => (pausedRef.current = true)}
        onPointerLeave={resetTilt}
        onKeyDown={onKeyDown}
      >
        <div ref={sceneRef} className="scene" style={{ '--tz': layout === 'ring' ? `${-R}px` : '0px' }}>
          {order.map((id, p) => {
            const card = CARDS[id]
            if (!card) return null
            const Face = card.Face
            let transform = ''
            let opacity = 1
            let on = false

            if (layout === 'ring') {
              const angle = (p - cur) * step
              const c = Math.cos((angle * Math.PI) / 180)
              transform = `rotateY(${angle}deg) translateZ(${R}px)`
              opacity = c > 0.02 ? 0.4 + 0.6 * c : 0
              on = id === activeId
            } else if (layout === 'deck') {
              const k = mod(p - cur, N)
              const dx = (k - (Math.min(N, 4) - 1) / 2) * (narrow ? 38 : 60)
              transform = `translate3d(${dx}px, ${15 - k * 10}px, ${-k * 120}px) rotateY(${k ? -14 : -6}deg)`
              opacity = k > 3 ? 0 : 1 - k * 0.2
              on = k === 0
            } else {
              const col = p % cols
              const row = Math.floor(p / cols)
              const inRow = Math.min(cols, N - row * cols)
              const x = (col - (inRow - 1) / 2) * (cw + gap)
              const y = (row - (rows - 1) / 2) * (ch + gap)
              transform = `translate3d(${x}px, ${y}px, 0px)`
            }

            const hidden = opacity < 0.3
            return (
              <article
                key={id}
                className={`tile${on ? ' on' : ''}`}
                role="button"
                aria-label={`${card.title}, tocca per aprire`}
                tabIndex={hidden ? -1 : 0}
                style={{
                  width: cw,
                  height: ch,
                  marginLeft: -cw / 2,
                  marginTop: -ch / 2,
                  transform,
                  opacity,
                  pointerEvents: hidden ? 'none' : 'auto',
                  transitionDelay: staggered ? `${p * 45}ms` : undefined,
                  '--acc': `var(${card.acc})`,
                }}
                onClick={() => onCardClick(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onCardClick(id)
                  }
                }}
              >
                <Face />
              </article>
            )
          })}
        </div>
      </div>

      <div className="stage-controls">
        {layout !== 'grid' && N > 1 && (
          <>
            <button type="button" className="btn ghost round" aria-label="Scheda precedente" onClick={() => stepBy(-1)}>
              ←
            </button>
            <button type="button" className="btn ghost round" aria-label="Scheda successiva" onClick={() => stepBy(1)}>
              →
            </button>
          </>
        )}
        {N > 1 && (
          <button type="button" className="btn ghost" onClick={shuffle}>
            Mescola
          </button>
        )}
      </div>
      <p className="hint">
        {layout === 'grid' ? 'Tocca una scheda per aprirla.' : 'Scorri per cambiare scheda, tocca quella davanti per aprirla.'}
      </p>
    </>
  )
}
