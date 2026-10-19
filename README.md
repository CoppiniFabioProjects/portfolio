# Portfolio — Fabio Coppini

Portfolio personale. **Informatico Umanista** — all'intersezione tra la precisione degli algoritmi e la bellezza della cultura umana.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS v4**
- **Framer Motion** (animazioni cinematiche allo scroll)
- **Lenis** (smooth scroll)
- **Polvere** ([`src/dust/`](src/dust/)): WebGL puro, senza librerie. L'aquila, il ritratto e le immagini dei progetti si compongono da granelli di luce; scorrendo, un'immagine si sbriciola e si versa nella successiva. Il motore lavora solo durante le transizioni: a riposo si vede l'immagine vera e la GPU è ferma. Con "riduci movimento", risparmio dati o senza WebGL le immagini si vedono e basta.
- Deploy automatico su **GitHub Pages** via GitHub Actions

## Sviluppo
```bash
npm install
npm run dev      # server locale
npm run build    # build di produzione in dist/
npm run preview  # anteprima della build
```

## Contenuti
Il sito è in due lingue: italiano su `/portfolio/` ([`index.html`](index.html)) e inglese su `/portfolio/en/` ([`en/index.html`](en/index.html)). La lingua la decide `<html lang>`, la stessa app serve entrambe.

- Contenuti (profilo, vetrina, competenze, timeline, progetti): [`src/data/content.it.js`](src/data/content.it.js) e [`src/data/content.en.js`](src/data/content.en.js).
- Testi fissi dell'interfaccia (pulsanti, titoli, terminale, gioco): [`src/data/ui.js`](src/data/ui.js).
- Le due lingue devono avere la stessa struttura: se aggiungi un campo in italiano, aggiungilo anche in inglese (lo controlla `npm test`).

## CV
Sorgente in [`cv/`](cv/) (testi in `cv/content.mjs`). `npm run cv` rigenera `public/cv-fabio-coppini.pdf` e `public/cv-fabio-coppini-en.pdf` (serve Playwright: `npm i --no-save playwright && npx playwright install chromium`).
