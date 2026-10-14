# Il mio cruscotto

Cruscotto personale pensato per lo smartphone. Le schede stanno in una scena 3D che puoi disporre ad **anello**, a **pila** o a **griglia**. Tocchi una scheda per aprirne il dettaglio.

**I dati restano nel browser** (localStorage): non c'è nessun server e nel repository non c'è nessun dato personale. Dalla sezione Personalizza puoi scaricare un backup e ripristinarlo su un altro dispositivo.

## Personalizza

Il pulsante **Personalizza**, in alto a destra, permette di:

- scegliere la disposizione: anello, pila o griglia (e attivare la rotazione automatica)
- aggiungere, togliere e riordinare le schede
- impostare i collegamenti: indirizzo del sito Portafoglio, indirizzo del sito Documenti, ID client Google per il Calendario
- scegliere il tema: automatico, chiaro o scuro
- scaricare e ripristinare il backup dei dati

## Schede

Attive all'inizio, perché si collegano facilmente:

| Scheda | Cosa mostra |
| --- | --- |
| Meteo | Previsioni da Open-Meteo (senza chiavi), ricerca per città |
| Calendario | Prossimi eventi di Google Calendar, in sola lettura (vedi sotto) |
| Portafoglio | Apre il tuo sito per la gestione delle carte |
| Documenti | Apre il tuo sito per i documenti di identità |

Disponibili da aggiungere in Personalizza:

| Scheda | Dati |
| --- | --- |
| Attività | Lista con scadenze |
| Ore di lavoro | Cronometro e inserimento manuale, totali di oggi e della settimana |
| Salute | Sonno, passi, acqua, peso |
| Abitudini | Checklist giornaliera con serie di giorni consecutivi |
| Fotovoltaico | Produzione, consumo e immissione in rete, inseriti a mano |
| Auto elettrica | Batteria, autonomia, chilometri, inseriti a mano |
| GitHub | Repository pubblici e commit degli ultimi 7 giorni |
| Spese | Spese per categoria e budget mensile |

### Portafoglio e Documenti

Il cruscotto **non salva né carte né documenti di identità**: conserva solo il link ai tuoi siti dedicati e lo apre in una nuova scheda. Sono accettati solo indirizzi che iniziano con `https://`.

### Collegare Google Calendar

Serve un ID client OAuth personale. L'accesso è in **sola lettura** e il token resta solo in memoria: dopo aver riaperto la pagina basta toccare "Collega Google". Non c'è nessun segreto da custodire.

I passaggi, indicativi (i nomi dei menu di Google possono cambiare):

1. Apri la [console Google Cloud](https://console.cloud.google.com/) e crea un progetto.
2. Abilita la **Google Calendar API**.
3. Configura la **schermata di consenso OAuth**: tipo esterno, aggiungi il tuo indirizzo Google tra gli utenti di prova e lo scope `calendar.readonly`.
4. Crea una credenziale **ID client OAuth** di tipo applicazione web. Tra le origini JavaScript autorizzate aggiungi l'indirizzo del sito (per esempio `https://marcofabbrini.github.io`) e, per provare in locale, `http://localhost:5173`.
5. Copia l'ID client (finisce con `.apps.googleusercontent.com`) in **Personalizza → Collegamenti**.

### Non ancora collegati

L'inverter del fotovoltaico e l'auto elettrica richiedono le API della casa costruttrice, con credenziali che una pagina statica non può custodire. Per ora si inseriscono a mano. Per collegarli servirebbe un piccolo servizio server.

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
  App.jsx               Pagina, titolo e pannelli
  App.css               Stili
  components/
    Stage3D.jsx         Scena 3D: anello, pila, griglia
    Sheet.jsx           Pannello che sale dal basso
    Customize.jsx       Sezione Personalizza
    registry.jsx        Elenco di tutte le schede
    Faces.jsx           Riassunto di ogni scheda (la faccia 3D)
    ...                 Una scheda di dettaglio per file
  lib/
    store.js            Salvataggio nel browser, backup e ripristino
    settings.js         Impostazioni e controllo degli indirizzi
    calendar.js         Accesso a Google Calendar
    useWeather.js       Meteo con cache
    useGitHub.js        GitHub con cache
.github/workflows/deploy.yml   Pubblicazione su GitHub Pages
```

## Pubblicazione su GitHub Pages

1. Nel repository apri **Settings → Pages** e, in **Source**, scegli **GitHub Actions**.
2. A ogni push su `main` il sito viene compilato e pubblicato.

Il sito pubblicato è raggiungibile da chiunque abbia il link, ma mostra solo i dati salvati nel browser di chi lo apre.

## Tecnologie

Vite, React, GSAP e Framer Motion. Le schede 3D usano le trasformazioni CSS, senza librerie 3D.
