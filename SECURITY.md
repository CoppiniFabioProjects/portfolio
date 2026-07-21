# Security Policy

## Superficie d'attacco

Questo è un **sito statico** (React + Vite) pubblicato su GitHub Pages. Non ha
server applicativi né logica lato backend: la superficie d'attacco è minima.

- Nessuna autenticazione, nessuna password, nessun dato personale raccolto dal sito.
- Contenuto renderizzato da React (escaping automatico): nessun `dangerouslySetInnerHTML`.
- Tutti i link esterni usano `rel="noreferrer"`.

## Servizi collegati

- **Supabase** (classifica del mini-gioco): usa solo la chiave *anon/publishable*,
  pubblica per definizione e protetta dalle **RLS policy**. La tabella `scores`
  espone unicamente `name` e `score` (nessun dato sensibile). La chiave
  `service_role` non è mai presente nel repository.
- **Cloudflare Web Analytics**: conteggio visite senza cookie né dati personali.

## Segnalare una vulnerabilità

Per segnalazioni di sicurezza scrivere a **coppinifabio99@gmail.com**.
Si prega di non aprire issue pubbliche per vulnerabilità non ancora risolte.
