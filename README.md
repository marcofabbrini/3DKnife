# Il mio sito 3D

Sito con grafica 3D ed effetti animati, costruito con:

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- [Three.js](https://threejs.org/), [React Three Fiber](https://r3f.docs.pmnd.rs/) e [drei](https://drei.docs.pmnd.rs/) per la scena 3D
- [GSAP](https://gsap.com/) (con ScrollTrigger) per le animazioni allo scroll
- [Framer Motion](https://motion.dev/) per le animazioni dell'interfaccia

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
  Scene.jsx   Scena 3D (oggetto, particelle, luci)
  App.jsx     Pagina: testi, titolo animato, schede
  App.css     Stili della pagina
  index.css   Stili globali
public/       File statici
.github/workflows/deploy.yml   Pubblicazione automatica su GitHub Pages
```

## Pubblicazione su GitHub Pages

1. Carica il progetto su GitHub (ramo `main`).
2. Nel repository apri **Settings → Pages** e, in **Source**, scegli **GitHub Actions**.
3. A ogni push su `main` il sito viene compilato e pubblicato automaticamente.
