// ============================================================
//  CONTENUTI — Fabio Coppini Portfolio
//  Modifica qui testi e link: i componenti leggono da questo file.
// ============================================================

export const profile = {
  name: "Fabio Coppini",
  role: "Informatico Umanista",
  location: "Pistoia / Quarrata, Italia",
  email: "coppinifabio99@gmail.com",
  phone: "+39 334 923 5662",
  linkedin: "https://www.linkedin.com/in/coppinifabio/",
  github: "https://github.com/CoppiniFabioProjects/",
  tagline: "Libero come un'aquila.",
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

// Manifesto — righe rivelate allo scroll (sezione pinnata stile Longbow)
export const manifesto = {
  kicker: "Celeritas · Levitas",
  lines: [
    "Non chiedo",
    "più potenza.",
    "Tolgo peso.",
  ],
  body:
    "Come le auto che ammiro, credo nella leggerezza: meno complessità, più reattività. Codice che non distrae, che unisce la precisione dell'algoritmo alla bellezza della cultura umana.",
};

export const vetrina = {
  main: {
    title: "Informatica Umanistica",
    subtitle: "Università di Pisa",
    body:
      "Tesi in Linguistica Computazionale: analisi NLP dei testi delle medaglie d'oro, sviluppata in Python con NLTK — tokenizzazione, POS tagging e named entity recognition. Il percorso dove gli algoritmi incontrano la lingua e la cultura umana.",
    stats: [
      { value: "NLP", label: "Tesi" },
      { value: "98", label: "Voto" },
    ],
    link: {
      href: "https://drive.google.com/drive/folders/171K8z4jlj_PbVp7bJ7IUweG75Hj5ZixM?usp=sharing",
      label: "Leggi la Tesi",
    },
  },
  cards: [
    {
      icon: "Trophy",
      title: "Padel Player",
      body:
        "Gioco competitivo e agonistico. Disciplina, strategia e riflessi trasferiti dal campo al codice.",
      link: { href: "https://app.playtomic.io/", label: "Playtomic" },
      image: "/portfolio/padel.jpg",
      accent: "garuda",
    },
    {
      icon: "Bot",
      title: "Insegnante di Robotica",
      body:
        "Con Scienza Ludica APS insegno robotica ed educativa nelle scuole di Prato e Pistoia: Lego Spike, Ozobot e Scratch.",
      link: { href: "https://scienzaludica.org/", label: "Scienza Ludica" },
      image: "/portfolio/scienzaludica.jpg",
      accent: "purple",
    },
    {
      icon: "Sprout",
      title: "Vento e Vertigine",
      body:
        "Volontariato con attenzione all'innovazione etica, alla sostenibilità e all'uso consapevole del linguaggio.",
      link: { href: "https://www.ventoevertigine.com/", label: "Vento e Vertigine" },
      image: "/portfolio/ventoevertigine.jpg",
      accent: "garuda",
    },
  ],
  stats: [
    { value: "B2", label: "Inglese" },
    { value: "110%", label: "Dedizione" },
    { value: "B", label: "Patente" },
  ],
};

export const tech = [
  {
    title: "Frontend",
    icon: "Layout",
    accent: "purple",
    items: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS v4", "Vite", "Framer Motion", "TanStack Query", "PWA"],
  },
  {
    title: "Backend & Database",
    icon: "Database",
    accent: "garuda",
    items: ["Node.js", "Supabase", "PostgreSQL", "Prisma / Drizzle", "Server Actions", "REST APIs", "Auth & RLS", "Redis"],
  },
  {
    title: "DevOps & Cloud",
    icon: "Cloud",
    accent: "purple",
    items: ["Vercel", "Docker", "GitHub Actions", "CI/CD", "Git & GitHub", "Linux", "Nginx", "Cloudflare"],
  },
  {
    title: "NLP & Linguistica Computazionale",
    icon: "ScrollText",
    accent: "garuda",
    items: ["Python", "NLTK", "spaCy", "Tokenizzazione", "POS Tagging", "Named Entity Recognition", "WordNet", "Corpora"],
  },
  {
    title: "Codifica di Testi & Markup",
    icon: "Boxes",
    accent: "purple",
    items: ["XML", "XSLT", "XPath", "TEI", "Codifica di testi", "Metadati semantici", "RegEx", "Schema / DTD"],
  },
  {
    title: "AI, Design & Tooling",
    icon: "Palette",
    accent: "garuda",
    items: ["Cursor IDE", "Claude Code", "Higgsfield", "Prompt Engineering", "Figma", "Canva Pro", "Mermaid", "Excalidraw", "OpenGraph", "SEO"],
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
    period: "Mag 2025 — oggi",
    org: "01Informatica",
    role: "Sviluppatore Full-Stack (Apprendista)",
    body: "Sviluppo software full-stack, gestione siti e gestionale interno, supporto tecnico e problem solving IT. Mentorship di Michele.",
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
    title: "spostiAMOci",
    tagline: "Il LinkedIn della mobilità quotidiana",
    body:
      "Il carpooling tra sconosciuti non decolla: manca la fiducia. spostiAMOci lo risolve facendoti condividere gli spostamenti solo con la tua rete — gli «AMOci», a 1°, 2° e 3° grado di conoscenza. Rotte reali su mappa (PostGIS), chat in tempo reale e una «bilancia della reciprocità» che mantiene equo lo scambio. Risultato: meno traffico, meno CO₂ e relazioni che si rafforzano a ogni viaggio. PWA installabile su qualsiasi telefono.",
    tags: ["Next.js 15", "React 19", "Supabase", "PostGIS", "Realtime", "Three.js"],
    image: "/portfolio/spostiamoci-poster.jpg",
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
      "Gestionale enterprise per il Lions Club — Distretto 108 LA (Toscana). Ogni socio accede col proprio numero di matricola e registra le attività di servizio; senior e presidenti di distretto le revisionano e validano in una gerarchia di ruoli e permessi. Dashboard e statistiche trasformano migliaia di ore di volontariato in dati misurabili. Evoluzione del progetto ServiceScore, oggi con dominio proprio.",
    metrics: [
      { value: "3.000", label: "Soci" },
      { value: "7.000+", label: "Attività gestite" },
      { value: "108 LA", label: "Distretto Toscana" },
    ],
    tags: ["React", "Supabase", "Auth & RLS", "Dashboard", "Multi-ruolo"],
    image: "/portfolio/digitalions.jpg",
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
    image: "/portfolio/portfolio.jpg",
    status: "Coming Soon",
  },
  {
    title: "01 Informatica",
    body: "Gestione siti web, sviluppo CMS e software gestionale interno all'azienda.",
    tags: ["CMS", "Web Design", "Java"],
    image: "/portfolio/logo_01informatica.png",
    link: "https://www.info01.it/",
  },
  {
    title: "Middleware Logistica",
    body: "Web app per la gestione dei flussi di magazzino e interfacciamento hardware automatizzato con sistemi ERP (Ciampalini ModulaV2 / MGM). Architettura ibrida con error handling avanzato.",
    tags: ["React", "ERP", "Hardware"],
    image: "/portfolio/modula.png",
    link: "https://github.com/CoppiniFabioProjects/j01modula",
  },
  {
    title: "First Lego League USA",
    body: "Team leader e coordinamento scientifico per la competizione internazionale di robotica.",
    tags: ["Robotica", "Team Lead"],
    image: "/portfolio/CHALLENGE_2.jpg",
    link: "https://www.youtube.com/watch?v=S2FbYDwy31o",
  },
];

export const interests = [
  "Leopardi", "Scacchi", "Oscar Wilde", "Pavarotti",
  "Fromm", "Bel Canto", "Padel", "Gaming", "Linux",
];
