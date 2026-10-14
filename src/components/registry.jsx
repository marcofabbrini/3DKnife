import Weather from './Weather'
import Calendar from './Calendar'
import { WalletDetail, DocsDetail } from './LinkCard'
import Tasks from './Tasks'
import WorkHours from './WorkHours'
import Health from './Health'
import Habits from './Habits'
import Solar from './Solar'
import ElectricCar from './ElectricCar'
import GitHubCard from './GitHubCard'
import Budget from './Budget'
import {
  WeatherFace,
  CalendarFace,
  WalletFace,
  DocsFace,
  TasksFace,
  WorkFace,
  HealthFace,
  HabitsFace,
  SolarFace,
  CarFace,
  GitHubFace,
  BudgetFace,
} from './Faces'

// Tutte le schede disponibili.
// acc: colore d'accento. kind: come arrivano i dati. link: impostazione con l'indirizzo da aprire.
export const CARDS = {
  meteo: { title: 'Meteo', acc: '--accent', kind: 'collegata', Detail: Weather, Face: WeatherFace },
  calendario: { title: 'Calendario', acc: '--accent-2', kind: 'collegata', Detail: Calendar, Face: CalendarFace },
  portafoglio: { title: 'Portafoglio', acc: '--ok', kind: 'link', link: 'walletUrl', Detail: WalletDetail, Face: WalletFace },
  documenti: { title: 'Documenti', acc: '--warn', kind: 'link', link: 'docsUrl', Detail: DocsDetail, Face: DocsFace },
  attivita: { title: 'Attività', acc: '--accent-2', kind: 'manuale', Detail: Tasks, Face: TasksFace },
  ore: { title: 'Ore di lavoro', acc: '--warn', kind: 'manuale', Detail: WorkHours, Face: WorkFace },
  salute: { title: 'Salute', acc: '--ok', kind: 'manuale', Detail: Health, Face: HealthFace },
  abitudini: { title: 'Abitudini', acc: '--danger', kind: 'manuale', Detail: Habits, Face: HabitsFace },
  fotovoltaico: { title: 'Fotovoltaico', acc: '--warn', kind: 'manuale', Detail: Solar, Face: SolarFace },
  auto: { title: 'Auto elettrica', acc: '--accent', kind: 'manuale', Detail: ElectricCar, Face: CarFace },
  github: { title: 'GitHub', acc: '--accent-2', kind: 'collegata', Detail: GitHubCard, Face: GitHubFace },
  spese: { title: 'Spese', acc: '--accent', kind: 'manuale', Detail: Budget, Face: BudgetFace },
}

export const ALL_IDS = Object.keys(CARDS)
