import { Card, Progress } from './ui'
import { useLocalStorage } from '../lib/store'

const EMPTY = { battery: '', range: '', plugged: false, odometer: '', note: '' }

export default function ElectricCar() {
  const [car, setCar] = useLocalStorage('car', EMPTY)
  const set = (k, v) => setCar({ ...car, [k]: v })
  const battery = car.battery === '' ? null : Math.max(0, Math.min(100, Number(car.battery)))

  return (
    <Card title="Auto elettrica" subtitle="inserimento manuale">
      <div className="car-gauge">
        <span className="car-pct">{battery === null ? '—' : `${battery}%`}</span>
        <Progress value={battery ?? 0} danger={battery !== null && battery < 20} />
        {battery !== null && battery < 20 && <span className="badge bad">Batteria bassa</span>}
      </div>
      <div className="grid-2">
        <label className="field">
          <span>Batteria (%)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            value={car.battery}
            onChange={(e) => set('battery', e.target.value)}
            placeholder="—"
          />
        </label>
        <label className="field">
          <span>Autonomia (km)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={car.range}
            onChange={(e) => set('range', e.target.value)}
            placeholder="—"
          />
        </label>
        <label className="field">
          <span>Contachilometri (km)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={car.odometer}
            onChange={(e) => set('odometer', e.target.value)}
            placeholder="—"
          />
        </label>
        <label className="field">
          <span>Nota (es. ultima ricarica)</span>
          <input value={car.note} onChange={(e) => set('note', e.target.value)} placeholder="—" />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={car.plugged} onChange={(e) => set('plugged', e.target.checked)} />
        <span>In carica</span>
      </label>
    </Card>
  )
}
