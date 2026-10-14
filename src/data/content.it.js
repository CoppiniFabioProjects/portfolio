// ============================================================
//  CONTENUTI IN ITALIANO — Fabio Coppini Portfolio
//  Modifica qui testi e link. La versione inglese è in content.en.js e deve
//  avere la stessa struttura (lo verifica content.en.test.js).
// ============================================================

export const profile = {
  name: "Fabio Coppini",
  role: "Informatico Umanista",
  location: "Pistoia / Quarrata, Italia",
  email: "coppinifabio99@gmail.com",
  phone: "+39 334 923 5662",
  linkedin: "https://www.linkedin.com/in/coppinifabio/",
  linkedinFollowers: "7.7k",
  github: "https://github.com/CoppiniFabioProjects/",
  tagline: "Libero come un'aquila.",
  headline: "Full-Stack Developer",
  stack: "React · Next.js · Supabase",
  intro:
    "Non sono il classico sviluppatore. Laureato in Informatica Umanistica all'Università di Pisa, opero nell'intersezione rara tra la fredda precisione degli algoritmi e la caotica bellezza della cultura umana.",
};

export const nav = [
  { id: "about", label: "Vetrina" },
  { id: "skills", label: "Tech" },
  { id: "linux", label: "Linux" },
  { id: "experience", label: "Timeline" },
  { id: "projects", label: "Progetti" },
  { id: "gioca", label: "Gioca" },
  { id: "contact", label: "Contatti" },
];

export const vetrina = {
  // Storie dal lavoro: ognuna viene da un post LinkedIn, con il link all'originale
  stories: [
    {
      icon: "GitPullRequest",
      tag: "Metodo · Code review",
      title: "Non sbaglio mai. Poi ho sbagliato.",
      body:
        "Una modifica giusta per un cliente, scritta nella classe condivisa da tutte le stampe: i pesi di DDT e fatture hanno perso i decimali per tutti. Ho messo per iscritto cosa è successo e cosa cambia da quel giorno.",
      lesson: "Un commento non è una condizione.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7508933285134372865/",
      accent: "purple",
    },
    {
      icon: "Lock",
      tag: "Sicurezza · Supabase",
      title: "Il login protegge le pagine, non i dati.",
      body:
        "La chiave anon di un BaaS è pubblica: una chiamata REST arriva al database senza passare dal tuo codice. La difesa sono le policy RLS e, per le pagine pubbliche, una funzione SECURITY DEFINER che risponde sì o no senza mostrare le righe.",
      lesson: "Su dati personali il SELECT «minimo» è già il problema.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7485423343811227649/",
      accent: "garuda",
    },
    {
      icon: "History",
      tag: "Legacy · Windows CE",
      title: "2003. Un palmare. 15.000 righe senza test.",
      body:
        "Un'app di tentata vendita in eMbedded Visual Basic registrava fatture che nessuno aveva scelto. Due patch, undici righe, l'ambiente di build ricostruito in una macchina virtuale e il rilascio sui terminali, sul campo.",
      lesson: "Il codice vecchio non è codice morto: ha lavorato più di te.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7502766993562025987/",
      accent: "purple",
    },
    {
      icon: "Gauge",
      tag: "Prestazioni · SQL su DB2",
      title: "Ho tolto una riga di SQL e la pagina vola.",
      body:
        "Un filtro di stagionalità scritto con un CASE nella WHERE impediva al database di usare gli indici. Ho spostato la regola in Java, lasciando alla query un'uguaglianza su chiave, e ho confrontato il risultato su 53 settimane: zero differenze.",
      lesson: "La condizione più comoda da scrivere è spesso la più costosa da eseguire.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7503489910654349312/",
      accent: "garuda",
    },
    {
      icon: "Radio",
      tag: "Realtime · spostiamoci",
      title: "La posizione live funzionava. Tranne quando serviva.",
      body:
        "Chi aspettava fermo al punto d'incontro spariva dalla mappa. Tre bug della stessa famiglia: trasmettevo prima di essere in ascolto, da fermo il GPS tace, i canali broadcast non hanno storico. Li ho trovati con due telefoni in mano.",
      lesson: "Se lo stato dipende da eventi, va progettato anche il silenzio.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7487143100046327808/",
      accent: "purple",
    },
    {
      icon: "Scale",
      tag: "Dati · DigitaLions",
      title: "Un motore di punteggio per 92 Lions Club.",
      body:
        "Il regolamento assegna punti su 16 tipologie di attività, il portale ufficiale ne espone 4. La tipologia la assegna una persona: finché non lo fa, il punteggio non è zero, è assente. E i dati del concorso li protegge il database, colonna per colonna.",
      lesson: "Su una classifica ufficiale, un dato indovinato è peggio di uno mancante.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7502685882110500865/",
      accent: "garuda",
    },
  ],
  cards: [
    {
      icon: "Trophy",
      title: "Padel Player",
      body:
        "Gioco competitivo e agonistico. Disciplina, strategia e riflessi trasferiti dal campo al codice.",
      link: { href: "https://app.playtomic.io/", label: "Playtomic" },
      image: "/portfolio/padel.webp",
      accent: "garuda",
    },
    {
      icon: "Bot",
      title: "Insegnante di Robotica",
      body:
        "Con Scienza Ludica APS insegno robotica ed educativa nelle scuole di Prato e Pistoia: Lego Spike, Ozobot e Scratch.",
      link: { href: "https://scienzaludica.org/", label: "Scienza Ludica" },
      image: "/portfolio/scienzaludica.webp",
      accent: "purple",
    },
    {
      icon: "Sprout",
      title: "Vento e Vertigine",
      body:
        "Volontariato con attenzione all'innovazione etica, alla sostenibilità e all'uso consapevole del linguaggio.",
      link: { href: "https://www.ventoevertigine.com/", label: "Vento e Vertigine" },
      image: "/portfolio/ventoevertigine.webp",
      accent: "garuda",
    },
  ],
};

export const tech = [
  {
    title: "Frontend",
    icon: "Layout",
    accent: "purple",
    items: ["React 19", "Next.js 15 / 16", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Three.js", "TanStack Query", "PWA & Web Push"],
  },
  {
    title: "Backend & Database",
    icon: "Database",
    accent: "garuda",
    items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "Funzioni SECURITY DEFINER", "Realtime & pg_cron", "Edge Functions", "Node.js"],
  },
  {
    title: "Gestionali & Enterprise",
    icon: "Factory",
    accent: "purple",
    items: ["Java", "DB2 su IBM i", "SQL Server", "Spring Boot", "ERP", "Ottimizzazione SQL", "Legacy: eVB · Windows CE", "Integrazioni di magazzino"],
  },
  {
    title: "Metodo & Qualità",
    icon: "ClipboardCheck",
    accent: "garuda",
    items: ["Analisi funzionale", "Note tecniche", "Piani di test", "Code review", "Git · Bitbucket · GitHub", "CI/CD con GitHub Actions", "Manuali d'uso", "Go-live dai clienti"],
  },
  {
    title: "NLP & Codifica di Testi",
    icon: "ScrollText",
    accent: "purple",
    items: ["Python", "NLTK", "Tokenizzazione", "POS Tagging", "Named Entity Recognition", "XML", "XSLT", "TEI"],
  },
  {
    title: "AI, Cloud & Tooling",
    icon: "Cloud",
    accent: "garuda",
    items: ["Claude Code", "Cursor", "Agenti in parallelo", "Vercel", "Docker", "Linux", "Vite", "GitHub Pages"],
  },
];

export const linux = {
  distro: "Garuda Linux",
  points: [
    { icon: "Terminal", title: "Terminale & Shell", body: "Zsh + oh-my-zsh, Hyprland (Wayland). Ambiente cucito su misura, veloce e minimale." },
    { icon: "Container", title: "Docker & Deploy", body: "Containerizzazione, pipeline GitHub CI/CD, deploy su Vercel di web app React/Supabase." },
    { icon: "Cpu", title: "Hardware & Networking", body: "Assemblaggio PC, troubleshooting hardware, reti e debugging avanzato." },
    { icon: "Users", title: "Community", body: "Open source, documentazione, condivisione della conoscenza e mentorship." },
  ],
};

export const timeline = [
  {
    period: "Giu 2026 — oggi",
    org: "spostiamoci",
    role: "Co-founder & Full-Stack Developer",
    body: "Ideazione e sviluppo full-stack della piattaforma di mobilità sociale di fiducia: Next.js, React, Supabase, PostGIS. Dall'architettura al prodotto installabile (PWA), con samo, l'assistente che rende equi i viaggi.",
    link: "https://spostiamoci.vercel.app",
    linkLabel: "Apri l'app",
    current: true,
  },
  {
    period: "Mag 2025 — oggi",
    org: "01Informatica",
    role: "Sviluppatore Full-Stack (Apprendista)",
    body: "Sviluppo e assistenza su Codice01, il gestionale ERP dell'azienda (Java, DB2): seguo i lavori dall'analisi al rilascio, compresi i go-live dai clienti e il codice legacy. Mentorship di Michele.",
    current: true,
  },
  {
    period: "Set 2024 — oggi",
    org: "Scienza Ludica",
    role: "Educatore di Robotica & Informatica",
    body: "Docenza nelle scuole primarie e secondarie di Prato e Pistoia.",
    current: true,
  },
  {
    period: "Nov 2023",
    org: "Madilo SRL (DHL)",
    role: "Logistica & Distribuzione",
    body: "Ruolo operativo nella logistica e distribuzione.",
  },
  {
    period: "2018 — 2023",
    org: "Università di Pisa",
    role: "Laurea in Informatica Umanistica",
    body: "Voto 98/110. Tesi in Linguistica Computazionale: analisi NLP in Python/NLTK dei testi delle medaglie d'oro. Codifica di testi con XML/XSLT/TEI.",
    link: "https://drive.google.com/drive/folders/171K8z4jlj_PbVp7bJ7IUweG75Hj5ZixM?usp=sharing",
    linkLabel: "Leggi la tesi",
    thesis: true, // la tesi: la usa anche il comando «tesi» del terminale
  },
  {
    period: "2013 — 2018",
    org: "ITTS Silvano Fedi",
    role: "Diploma Perito Informatico",
    body: 'Tesi: "La Rivoluzione Digitale confrontata con l\'Anarchia".',
    link: "https://drive.google.com/file/d/1TUFOxMBUeuC53R0BwsnYKp5MsOFMxeO6/view?usp=sharing",
  },
];

// I due progetti di punta — blocchi cinematici full-bleed
export const flagship = [
  {
    index: "01",
    title: "spostiamoci",
    tagline: "Il LinkedIn della mobilità quotidiana",
    body:
      "Il carpooling tra sconosciuti non decolla: manca la fiducia. spostiamoci lo risolve facendoti viaggiare solo con la tua rete — gli «amoci», a 1°, 2° e 3° grado. C'è samo, l'assistente che sorteggia con giustizia chi guida, divide le spese in automatico e trova i compagni giusti su rotte reali (PostGIS) con chat in tempo reale. Meno traffico, meno CO₂ e relazioni che si rafforzano a ogni viaggio. PWA installabile, login in un tocco.",
    metrics: [
      { value: "33", label: "Early-amoci in rete" },
      { value: "fino a 103€", label: "Risparmio mensile / utente" },
      { value: "−69 kg", label: "CO₂ al mese / utente" },
    ],
    tags: ["Next.js 15", "React 19", "Supabase", "PostGIS", "Realtime", "PWA"],
    image: "/portfolio/spostiamoci-poster.webp",
    phone3d: true, // il poster (9:16) va sullo schermo di uno smartphone 3D
    link: "https://spostiamoci.vercel.app",
    linkLabel: "Apri l'app",
    status: "Live",
    accent: "garuda",
  },
  {
    index: "02",
    title: "DigitaLions",
    tagline: "Tecnologia al servizio del bene",
    body:
      "Gestionale enterprise per il Lions Club — Distretto 108 LA (Toscana). Ogni socio accede col proprio numero di matricola e registra le attività di servizio; senior e presidenti di distretto le revisionano e validano in una gerarchia di ruoli e permessi. Dashboard e statistiche trasformano migliaia di ore di volontariato in dati misurabili, e ogni notte si aggiornano da sole dalle statistiche ufficiali di Lions International. Evoluzione del progetto ServiceScore, oggi con dominio proprio.",
    metrics: [
      { value: "3.000", label: "Soci" },
      { value: "7.000+", label: "Attività gestite" },
      { value: "108 LA", label: "Distretto Toscana" },
    ],
    tags: ["Next.js 16", "React 19", "TypeScript", "Supabase", "RLS", "Vercel"],
    image: "/portfolio/digitalions.webp",
    link: "https://digitalions108la.it",
    linkLabel: "Visita DigitaLions",
    status: "Live",
    accent: "lions",
  },
];

export const projects = [
  {
    title: "FitTracker App",
    tagline: "Il futuro del fitness intelligente",
    body: "Monitoraggio biometrico e AI personalizzata. Coming soon.",
    tags: ["Mobile", "AI"],
    image: "/portfolio/portfolio.webp",
    status: "Coming Soon",
  },
  {
    title: "01 Informatica",
    body: "Gestione siti web, sviluppo CMS e software gestionale interno all'azienda.",
    tags: ["CMS", "Web Design", "Java"],
    image: "/portfolio/logo_01informatica.webp",
    link: "https://www.info01.it/",
  },
  {
    title: "Middleware Logistica",
    body: "Web app per la gestione dei flussi di magazzino e interfacciamento hardware automatizzato con sistemi ERP (Ciampalini ModulaV2 / MGM). Architettura ibrida con error handling avanzato. Progetto aziendale (01 Informatica) — codice proprietario.",
    tags: ["React", "ERP", "Hardware"],
    image: "/portfolio/modula.webp",
  },
  {
    title: "First Lego League USA",
    body: "Team leader e coordinamento scientifico per la competizione internazionale di robotica.",
    tags: ["Robotica", "Team Lead"],
    image: "/portfolio/CHALLENGE_2.webp",
    link: "https://www.youtube.com/watch?v=S2FbYDwy31o",
  },
];

export const interests = [
  "Leopardi", "Scacchi", "Oscar Wilde", "Pavarotti",
  "Fromm", "Bel Canto", "Padel", "Gaming", "Linux",
];
