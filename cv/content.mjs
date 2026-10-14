// Contenuti del CV di Fabio Coppini, in italiano e in inglese.
// Fonte: i testi del profilo LinkedIn approvati da Fabio (ottobre 2026).
// Le due lingue devono avere la stessa struttura: lo verifica cv/content.test.mjs.
// Per rigenerare i PDF: `npm run cv` (vedi cv/build-cv.mjs).

// Contatti: valori autoesplicativi, uno per riga (il luogo sta sotto al nome)
const contacts = (portfolioUrl) => [
  { v: "coppinifabio99@gmail.com", href: "mailto:coppinifabio99@gmail.com" },
  { v: "+39 334 923 5662", href: "tel:+393349235662" },
  { v: "linkedin.com/in/coppinifabio", href: "https://www.linkedin.com/in/coppinifabio/" },
  { v: "github.com/CoppiniFabioProjects", href: "https://github.com/CoppiniFabioProjects/" },
  { v: portfolioUrl.replace("https://", ""), href: portfolioUrl },
];

export const cv = {
  it: {
    lang: "it",
    file: "cv-fabio-coppini.pdf",
    title: "Fabio Coppini — Curriculum Vitae",
    name: ["Fabio", "Coppini"],
    role: "Full-Stack Developer",
    stack: "React · Next.js · Supabase",
    sub: "Co-founder di spostiamoci · Informatico Umanista (UniPi)",
    tagline: "Libero come un'aquila.",
    labels: {
      contacts: "Contatti", skills: "Competenze", languages: "Lingue", extra: "Altro",
      experience: "Esperienza", project: "Progetto", education: "Formazione",
      grade: "voto",
    },
    place: "Pistoia / Quarrata",
    contacts: contacts("https://coppinifabioprojects.github.io/portfolio/"),
    profile:
      "Sviluppatore full-stack: costruisco web app e PWA con React, Next.js e Supabase, e lavoro ogni giorno su un gestionale ERP in Java e DB2. Co-founder di spostiamoci. Informatico Umanista, laureato all'Università di Pisa con una tesi di linguistica computazionale (NLP in Python). Seguo un lavoro dall'analisi al rilascio — analisi funzionale, nota tecnica, sviluppo, piano di test, manuale — e uso l'AI (Claude Code, Cursor) come sparring partner: le decisioni restano mie.",
    experience: [
      {
        role: "Co-founder & Full-Stack Developer",
        org: "spostiamoci",
        period: "Giu 2026 — oggi",
        link: { label: "spostiamoci.vercel.app", href: "https://spostiamoci.vercel.app" },
        intro:
          "Carpooling basato sulla fiducia: si viaggia solo con la propria rete di contatti (gli «amoci»), fino al 3° grado. Idea e visione di Valentina Elisa Camponovo; io curo architettura e sviluppo, dal database al prodotto installabile. In produzione.",
        bullets: [
          "Frontend: Next.js 15 e React 19, PWA con notifiche Web Push, mappe Leaflet + Mapbox.",
          "Backend: Supabase, PostgreSQL + PostGIS, oltre 150 migrazioni. Matching a corridoi di viaggio, grafo di fiducia con Row Level Security su tutte le tabelle, sorteggio equo del guidatore, promemoria con pg_cron.",
          "samo: assistente AI con function calling lato server, che esegue le azioni invece di limitarsi a rispondere.",
        ],
      },
      {
        role: "Sviluppatore Full-Stack (apprendistato)",
        org: "01 INFORMATICA S.r.l.",
        period: "Mag 2025 — oggi",
        intro:
          "Sviluppo e assistenza su Codice01, il gestionale ERP dell'azienda (Java, DB2 su IBM i): seguo i lavori dall'analisi al rilascio. Curo anche siti web e supporto ai clienti (WordPress, PHP).",
        bullets: [
          "Nuove funzioni su ordini, bolle fornitore, spedizioni, etichette e fatture: abbinamento ordine-bolla che si riallinea da solo, carrellizzazione con secchi misti, scorporo IVA sulle autofatture attivabile da configurazione.",
          "Prestazioni SQL: riscrittura di query con predicati non sargable, spostando la logica di stagionalità da SQL a Java.",
          "Tentata vendita: correzione e rilascio dell'app legacy in eMbedded Visual Basic per Windows CE (ambiente di build ricostruito in macchina virtuale), avvio sul campo presso un cliente e analisi degli errori dei terminali.",
          "j01modula: web app che collega il gestionale ai magazzini automatici (DB2 e SQL Server), operativa anche con uno dei due database fermo.",
          "Metodo: oltre 30 documenti tra analisi funzionali, piani di test e manuali d'uso, una quarantina di note tecniche; un branch per ticket, pull request e code review su Bitbucket; una guida interna di 12 pagine per usare Claude Code nell'analisi dei ticket.",
        ],
      },
      {
        role: "Educatore di Robotica e Informatica",
        org: "Scienza Ludica APS",
        period: "Set 2024 — oggi",
        intro:
          "Laboratori di robotica educativa e programmazione nelle scuole primarie e secondarie di Prato e Pistoia, con LEGO Spike, Ozobot e Scratch. Socio dell'associazione.",
        bullets: [],
      },
    ],
    project: {
      name: "DigitaLions",
      note: "ex ServiceScore",
      period: "Mar 2026 — oggi",
      link: { label: "digitalions108la.it", href: "https://digitalions108la.it" },
      intro:
        "La piattaforma del Distretto Lions 108 LA (Toscana), progettata e sviluppata per intero da me: database, permessi, interfaccia e messa in produzione. Circa 3.000 soci, 92 club, oltre 7.000 attività di service.",
      bullets: [
        "Permessi a matrice ruolo/pagina applicati dal database (Row Level Security, privilegi di colonna): ogni officer vede il proprio club, la propria zona o tutto il distretto.",
        "Dashboard aggiornata ogni notte dalle statistiche ufficiali di Lions International, con riprova automatica; import completo dal portale ufficiale con controllo dei totali.",
        "«La Sfida dei Leoni»: motore di punteggio e classifica fra i club secondo il regolamento del Distretto.",
      ],
      stack: "Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · Vercel",
    },
    education: [
      {
        title: "Laurea in Informatica Umanistica",
        org: "Università di Pisa",
        period: "Nov 2018 — Apr 2023",
        grade: "98/110",
        body:
          "Tesi in Linguistica Computazionale: analisi NLP dei testi delle medaglie d'oro in Python con NLTK (tokenizzazione, POS tagging, named entity recognition). Codifica di testi con XML, XSLT e TEI.",
      },
      {
        title: "Diploma di Perito Informatico",
        org: "ITTS «Fedi-Fermi»",
        period: "Set 2013 — Giu 2018",
        grade: "78/100",
        body: "Tesina: «La Rivoluzione Digitale confrontata con l'Anarchia».",
      },
    ],
    skills: [
      { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "PWA"] },
      { group: "Backend & dati", items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "Node.js"] },
      { group: "Gestionali", items: ["Java", "DB2 su IBM i", "SQL Server", "ERP", "eVB · Windows CE"] },
      { group: "Metodo", items: ["Analisi funzionale", "Piani di test", "Code review", "Documentazione", "Git · Bitbucket"] },
      { group: "Strumenti & AI", items: ["Claude Code", "Cursor", "Docker", "Linux", "Vercel"] },
      { group: "NLP", items: ["Python", "NLTK", "XML · XSLT · TEI"] },
    ],
    languages: [
      { name: "Italiano", level: "Madrelingua" },
      { name: "Inglese", level: "B2" },
    ],
    extra: [
      "Patente B · Automunito",
      "Volontariato: socio di Vento e Vertigine APS, dal 2024",
      "Padel agonistico · Scacchi",
    ],
    privacy:
      "Autorizzo il trattamento dei dati personali contenuti nel presente curriculum ai sensi del Regolamento UE 2016/679 (GDPR).",
  },

  en: {
    lang: "en",
    file: "cv-fabio-coppini-en.pdf",
    title: "Fabio Coppini — Curriculum Vitae",
    name: ["Fabio", "Coppini"],
    role: "Full-Stack Developer",
    stack: "React · Next.js · Supabase",
    sub: "Co-founder of spostiamoci · Digital Humanities graduate (University of Pisa)",
    tagline: "Free as an eagle.",
    labels: {
      contacts: "Contact", skills: "Skills", languages: "Languages", extra: "More",
      experience: "Experience", project: "Featured project", education: "Education",
      grade: "grade",
    },
    place: "Pistoia / Quarrata, Italy",
    contacts: contacts("https://coppinifabioprojects.github.io/portfolio/en/"),
    profile:
      "Full-stack developer: I build web apps and PWAs with React, Next.js and Supabase, and every day I work on an ERP system in Java and DB2. Co-founder of spostiamoci. Digital Humanities graduate from the University of Pisa, with a thesis in computational linguistics (NLP in Python). I take work from analysis to release — functional analysis, technical note, development, test plan, user manual — and I use AI (Claude Code, Cursor) as a sparring partner: the decisions stay mine.",
    experience: [
      {
        role: "Co-founder & Full-Stack Developer",
        org: "spostiamoci",
        period: "Jun 2026 — present",
        link: { label: "spostiamoci.vercel.app", href: "https://spostiamoci.vercel.app" },
        intro:
          "Trust-based carpooling: you only travel with your own network (the «amoci»), up to the 3rd degree. Idea and vision by Valentina Elisa Camponovo; I own architecture and development, from the database to the installable product. In production.",
        bullets: [
          "Frontend: Next.js 15 and React 19, PWA with Web Push notifications, Leaflet + Mapbox maps.",
          "Backend: Supabase, PostgreSQL + PostGIS, 150+ migrations. Travel-corridor matching, a trust graph with Row Level Security on every table, fair driver selection, reminders with pg_cron.",
          "samo: an AI assistant with server-side function calling that takes actions instead of just answering.",
        ],
      },
      {
        role: "Full-Stack Developer (apprenticeship)",
        org: "01 INFORMATICA S.r.l.",
        period: "May 2025 — present",
        intro:
          "Development and support on Codice01, the company's ERP system (Java, DB2 on IBM i), taking work from analysis to release. I also look after websites and customer support (WordPress, PHP).",
        bullets: [
          "New features for orders, supplier delivery notes, shipping, labels and invoices: self-realigning order/delivery-note matching, mixed-bucket trolley loading, configurable VAT split on self-invoices.",
          "SQL performance: rewrote queries with non-sargable predicates, moving the seasonality logic from SQL to Java.",
          "Van sales: fixed and released the legacy eMbedded Visual Basic app for Windows CE (build environment rebuilt in a virtual machine), on-site rollout at a customer, analysis of handheld-terminal errors.",
          "j01modula: web app connecting the ERP to automated warehouses (DB2 and SQL Server), still operational when one of the two databases is down.",
          "Method: 30+ documents across functional analyses, test plans and user manuals, about forty technical notes; one branch per ticket, pull requests and code review on Bitbucket; an internal 12-page guide on using Claude Code to analyse support tickets.",
        ],
      },
      {
        role: "Robotics & Computing Educator",
        org: "Scienza Ludica APS",
        period: "Sep 2024 — present",
        intro:
          "Educational robotics and programming workshops in primary and secondary schools in Prato and Pistoia, with LEGO Spike, Ozobot and Scratch. Member of the association.",
        bullets: [],
      },
    ],
    project: {
      name: "DigitaLions",
      note: "formerly ServiceScore",
      period: "Mar 2026 — present",
      link: { label: "digitalions108la.it", href: "https://digitalions108la.it" },
      intro:
        "The platform of Lions District 108 LA (Tuscany), designed and built entirely by me: database, permissions, interface and production deployment. About 3,000 members, 92 clubs, 7,000+ service activities.",
      bullets: [
        "Role-by-page permission matrix enforced by the database (Row Level Security, column privileges): each officer sees their own club, zone or the whole district.",
        "Dashboard refreshed every night from Lions International's official statistics, with automatic retries; full import from the official portal with total checks.",
        "«La Sfida dei Leoni» (the Lions' Challenge): scoring and ranking engine across clubs, following the District's rules.",
      ],
      stack: "Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · Vercel",
    },
    education: [
      {
        title: "BA in Digital Humanities",
        org: "University of Pisa",
        period: "Nov 2018 — Apr 2023",
        grade: "98/110",
        body:
          "Thesis in Computational Linguistics: NLP analysis of a corpus of gold-medal texts in Python with NLTK (tokenisation, POS tagging, named entity recognition). Text encoding with XML, XSLT and TEI.",
      },
      {
        title: "Technical Diploma in Computer Science",
        org: "ITTS «Fedi-Fermi»",
        period: "Sep 2013 — Jun 2018",
        grade: "78/100",
        body: "Final paper: «The Digital Revolution compared with Anarchy».",
      },
    ],
    skills: [
      { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "PWA"] },
      { group: "Backend & data", items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "Node.js"] },
      { group: "Enterprise systems", items: ["Java", "DB2 on IBM i", "SQL Server", "ERP", "eVB · Windows CE"] },
      { group: "Method", items: ["Functional analysis", "Test plans", "Code review", "Documentation", "Git · Bitbucket"] },
      { group: "Tools & AI", items: ["Claude Code", "Cursor", "Docker", "Linux", "Vercel"] },
      { group: "NLP", items: ["Python", "NLTK", "XML · XSLT · TEI"] },
    ],
    languages: [
      { name: "Italian", level: "Native" },
      { name: "English", level: "B2" },
    ],
    extra: [
      "Driving licence B · Own car",
      "Volunteer: member of Vento e Vertigine APS, since 2024",
      "Competitive padel · Chess",
    ],
    privacy:
      "I authorise the processing of the personal data in this CV under EU Regulation 2016/679 (GDPR).",
  },
};
