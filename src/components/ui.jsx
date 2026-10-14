import { motion } from 'framer-motion'

// Contenitore comune di ogni scheda
export function Card({ title, subtitle, wide, children }) {
  return (
    <motion.section
      className={`card${wide ? ' wide' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <header className="card-head">
        <h2>{title}</h2>
        {subtitle && <span className="muted">{subtitle}</span>}
      </header>
      {children}
    </motion.section>
  )
}

// Grafico a barre semplice in SVG. data: [{label, value, value2?}]
export function BarChart({ data, color = 'var(--accent-2)', color2 = 'var(--accent)', unit = '' }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.value || 0, d.value2 || 0]))
  const W = 280
  const H = 90
  const group = W / data.length
  const hasTwo = data.some((d) => d.value2 !== undefined)
  const bw = hasTwo ? group * 0.3 : group * 0.55

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="chart" role="img" aria-label="Grafico a barre">
      {data.map((d, i) => {
        const x = i * group + group / 2
        const h1 = ((d.value || 0) / max) * H
        const h2 = ((d.value2 || 0) / max) * H
        return (
          <g key={d.label + i}>
            <rect
              x={hasTwo ? x - bw - 1 : x - bw / 2}
              y={H - h1}
              width={bw}
              height={Math.max(h1, d.value ? 2 : 0)}
              rx="3"
              style={{ fill: color }}
            >
              <title>{`${d.label}: ${d.value || 0}${unit}`}</title>
            </rect>
            {hasTwo && (
              <rect x={x + 1} y={H - h2} width={bw} height={Math.max(h2, d.value2 ? 2 : 0)} rx="3" style={{ fill: color2 }}>
                <title>{`${d.label}: ${d.value2 || 0}${unit}`}</title>
              </rect>
            )}
            <text x={x} y={H + 14} textAnchor="middle" className="chart-label">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Barra di avanzamento con valore da 0 a 100
export function Progress({ value, danger }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-bar${danger ? ' danger' : ''}`} style={{ width: `${v}%` }} />
    </div>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {hint && <span className="stat-hint muted">{hint}</span>}
    </div>
  )
}
