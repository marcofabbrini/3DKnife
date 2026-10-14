# Il mio cruscotto

Dashboard personale per tenere sotto controllo salute, abitudini, spese, attività, ore di lavoro, energia, auto elettrica e progetti, con una testata 3D animata.

**Tutti i dati restano nel browser** (localStorage): non c'è nessun server e nel repository non c'è nessun dato personale. Dal riquadro "Collegamenti e backup" puoi scaricare un file di backup e ripristinarlo su un altro dispositivo.

## Cosa c'è

| Scheda | Dati |
| --- | --- |
| Meteo | Open-Meteo (senza chiavi), ricerca per città |
| Attività | Lista con scadenze, ordinata per urgenza |
| Ore di lavoro | Cronometro, inserimento manuale, totali di oggi e della settimana |
| Salute | Sonno, passi, acqua, peso, con grafico degli ultimi 7 giorni |
| Abitudini | Checklist giornaliera con serie di giorni consecutivi |
| Fotovoltaico | Produzione, consumo e immissione in rete (inserimento manuale), autoconsumo del mese |
| Auto elettrica | Batteria, autonomia, chilometri (inserimento manuale) |
| GitHub | Repository pubblici e commit degli ultimi 7 giorni, con la API pubblica |
| Spese | Spese per categoria, budget mensile e avanzamento |

### Cosa non è ancora collegato

Gmail, Google Calendar, l'inverter del fotovoltaico e l'auto elettrica richiedono accessi con credenziali (OAuth o chiavi delle case costruttrici). Una pagina statica su GitHub Pages non può custodire queste chiavi in modo sicuro: per collegarli serve un piccolo servizio server (ad esempio Cloudflare Workers) che le tenga al riparo. Nel frattempo si inseriscono a mano.

## Avvio in locale

Serve Node.js 20 o superiore.

```bash
npm install
npm run dev
```

Poi apri l'indirizzo mostrato nel terminale (di solito http://localhost:5173).

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Crea la versione di produzione in `dist/` |
| `npm run preview` | Mostra in locale la versione di produzione |
| `npm run lint` | Controlla il codice con Oxlint |

## Struttura

```
src/
  App.jsx          Pagina e griglia delle schede
  App.css          Stili della dashboard
  Scene.jsx        Scena 3D della testata (Three.js)
  components/      Una scheda per file (Health, Budget, Solar, ...)
  lib/store.js     Salvataggio nel browser, backup e ripristino
  lib/dates.js     Funzioni per date e formati
.github/workflows/deploy.yml   Pubblicazione su GitHub Pages
```

## Pubblicazione su GitHub Pages

1. Nel repository apri **Settings → Pages** e, in **Source**, scegli **GitHub Actions**.
2. A ogni push su `main` il sito viene compilato e pubblicato.

Il sito pubblicato è raggiungibile da chiunque abbia il link, ma mostra solo i dati salvati nel browser di chi lo apre: i tuoi dati non sono visibili agli altri.

## Tecnologie

Vite, React, Three.js con React Three Fiber, GSAP e Framer Motion.
