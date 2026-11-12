// Contenuti del CV di Fabio Coppini, in italiano e in inglese.
// Fonte: i testi del profilo LinkedIn approvati da Fabio (ottobre 2026), in registro professionale.
// Le due lingue devono avere la stessa struttura: lo verifica cv/content.test.mjs.
// Per rigenerare i PDF: `npm run cv` (vedi cv/build-cv.mjs). La foto è cv/foto.jpg.

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
    sub: "Co-founder di spostiamoci · Informatico Umanista (Università di Pisa)",
    labels: {
      contacts: "Contatti", skills: "Competenze tecniche", languages: "Lingue", extra: "Informazioni aggiuntive",
      experience: "Esperienza professionale", project: "Progetti", education: "Istruzione e formazione",
      grade: "Votazione",
    },
    place: "Pistoia / Quarrata (PT)",
    contacts: contacts("https://coppinifabioprojects.github.io/portfolio/"),
    profile:
      "Full-Stack Developer con esperienza nello sviluppo di applicazioni web e PWA (React, Next.js, Supabase) e di sistemi gestionali ERP (Java, DB2 su IBM i). Laureato in Informatica Umanistica all'Università di Pisa, con una tesi in linguistica computazionale (NLP in Python). Seguo l'intero ciclo di vita del software, dall'analisi funzionale al rilascio, con documentazione tecnica, piani di test e manuali utente. Utilizzo strumenti di AI (Claude Code, Cursor) a supporto di analisi e sviluppo, restando responsabile delle scelte tecniche.",
    experience: [
      {
        role: "Co-founder & Full-Stack Developer",
        org: "spostiamoci",
        period: "Giu 2026 — oggi",
        link: { label: "spostiamoci.vercel.app", href: "https://spostiamoci.vercel.app" },
        intro:
          "Carpooling basato sulla fiducia: si viaggia solo con la propria rete di contatti (gli «amoci»), fino al terzo grado. Progetto ideato da Valentina Elisa Camponovo; responsabile di architettura e sviluppo, dal database al prodotto installabile. In produzione.",
        bullets: [
          "Frontend: Next.js 15 e React 19; PWA con notifiche Web Push e mappe Leaflet e Mapbox.",
          "Backend: Supabase con PostgreSQL e PostGIS (oltre 150 migrazioni); matching per corridoi di viaggio, grafo di fiducia protetto da Row Level Security su tutte le tabelle, assegnazione equa del guidatore, promemoria pianificati con pg_cron.",
          "samo: assistente AI con function calling lato server, in grado di eseguire azioni nell'applicazione oltre a rispondere alle richieste.",
        ],
      },
      {
        role: "Sviluppatore Full-Stack (apprendistato)",
        org: "01 INFORMATICA S.r.l.",
        period: "Mag 2025 — oggi",
        intro:
          "Sviluppo e assistenza su Codice01, il gestionale ERP aziendale (Java, DB2 su IBM i), dall'analisi al rilascio. Siti web e supporto ai clienti (WordPress, PHP).",
        bullets: [
          "Sviluppo di nuove funzionalità per ordini, bolle fornitore, spedizioni, etichette e fatturazione: riallineamento automatico dell'abbinamento ordine-bolla, carrellizzazione con secchi misti, scorporo IVA sulle autofatture attivabile da configurazione.",
          "Ottimizzazione delle prestazioni SQL: riscrittura di query con predicati non sargable e spostamento della logica di stagionalità da SQL a Java.",
          "Tentata vendita: correzione e rilascio dell'app legacy in eMbedded Visual Basic per Windows CE (build ricostruita in VM), avvio presso un cliente e analisi degli errori dei terminali.",
          "j01modula: web app di integrazione tra il gestionale e i magazzini automatici (DB2 e SQL Server), che resta operativa anche quando uno dei due database non è disponibile.",
          "Metodo di lavoro: oltre 30 documenti tra analisi funzionali, piani di test e manuali utente e circa 40 note tecniche; un branch per ticket, pull request e code review su Bitbucket; redazione di una guida interna di 12 pagine sull'uso di Claude Code nell'analisi dei ticket.",
        ],
      },
      {
        role: "Educatore di Robotica e Informatica",
        org: "Scienza Ludica APS",
        period: "Set 2024 — oggi",
        intro:
          "Conduzione di laboratori di robotica educativa e programmazione nelle scuole primarie e secondarie di Prato e Pistoia, con LEGO Spike, Ozobot e Scratch. Socio dell'associazione.",
        bullets: [],
      },
    ],
    project: {
      name: "DigitaLions",
      note: "già ServiceScore",
      period: "Mar 2026 — oggi",
      link: { label: "digitalions108la.it", href: "https://digitalions108la.it" },
      intro:
        "Piattaforma del Distretto Lions 108 LA (Toscana), progettata e sviluppata interamente in autonomia: database, modello dei permessi, interfaccia e messa in produzione. Circa 3.000 soci, 92 club e oltre 7.000 attività di service registrate.",
      bullets: [
        "Permessi per ruolo e pagina applicati dal database (Row Level Security, privilegi di colonna): ogni officer accede ai dati del proprio club, della propria zona o dell'intero distretto.",
        "Dashboard aggiornata ogni notte dalle statistiche ufficiali di Lions International, con retry automatico; importazione completa dal portale ufficiale con verifica dei totali.",
        "«La Sfida dei Leoni»: motore di calcolo dei punteggi e della classifica tra i club, conforme al regolamento distrettuale.",
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
          "Tesi in Linguistica Computazionale: analisi NLP di un corpus di testi delle medaglie d'oro, in Python con NLTK (tokenizzazione, POS tagging, named entity recognition). Codifica dei testi con XML, XSLT e TEI.",
      },
      {
        title: "Diploma di Perito Informatico",
        org: "ITTS «Fedi-Fermi»",
        period: "Set 2013 — Giu 2018",
        grade: "78/100",
        body: "",
      },
    ],
    skills: [
      { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "PWA"] },
      { group: "Backend e database", items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "Node.js"] },
      { group: "Sistemi gestionali (ERP)", items: ["Java", "DB2 su IBM i", "SQL Server", "eVB · Windows CE"] },
      { group: "Metodologia", items: ["Analisi funzionale", "Piani di test", "Code review", "Documentazione tecnica", "Git · Bitbucket"] },
      { group: "Strumenti e AI", items: ["Claude Code", "Cursor", "Docker", "Linux", "Vercel"] },
      { group: "NLP e Digital Humanities", items: ["Python", "NLTK", "XML · XSLT · TEI"] },
    ],
    languages: [
      { name: "Italiano", level: "Madrelingua" },
      { name: "Inglese", level: "B2" },
    ],
    extra: [
      "Patente B, automunito",
      "Volontariato: socio di Vento e Vertigine APS dal 2024",
      "Interessi: padel a livello agonistico, scacchi",
    ],
    privacy:
      "Autorizzo il trattamento dei dati personali contenuti nel presente curriculum vitae ai sensi del D.Lgs. 196/2003 e del Regolamento UE 2016/679 (GDPR).",
  },

  en: {
    lang: "en",
    file: "cv-fabio-coppini-en.pdf",
    title: "Fabio Coppini — Curriculum Vitae",
    name: ["Fabio", "Coppini"],
    role: "Full-Stack Developer",
    stack: "React · Next.js · Supabase",
    sub: "Co-founder of spostiamoci · Digital Humanities graduate (University of Pisa)",
    labels: {
      contacts: "Contact", skills: "Technical skills", languages: "Languages", extra: "Additional information",
      experience: "Professional experience", project: "Projects", education: "Education",
      grade: "Final grade",
    },
    place: "Pistoia / Quarrata, Italy",
    contacts: contacts("https://coppinifabioprojects.github.io/portfolio/en/"),
    profile:
      "Full-Stack Developer experienced in building web applications and PWAs (React, Next.js, Supabase) and enterprise ERP systems (Java, DB2 on IBM i). Digital Humanities graduate from the University of Pisa, with a thesis in computational linguistics (NLP in Python). I manage the full software lifecycle, from functional analysis to release, including technical documentation, test plans and user manuals. I use AI tools (Claude Code, Cursor) to support analysis and development, while retaining ownership of technical decisions.",
    experience: [
      {
        role: "Co-founder & Full-Stack Developer",
        org: "spostiamoci",
        period: "Jun 2026 — present",
        link: { label: "spostiamoci.vercel.app", href: "https://spostiamoci.vercel.app" },
        intro:
          "Trust-based carpooling: users travel only with their own network of contacts (the «amoci»), up to the third degree. Conceived by Valentina Elisa Camponovo; responsible for architecture and development, from database to installable product. Live in production.",
        bullets: [
          "Frontend: Next.js 15 and React 19; PWA with Web Push notifications, Leaflet/Mapbox maps.",
          "Backend: Supabase with PostgreSQL and PostGIS (150+ migrations); travel-corridor matching, a trust graph secured by Row Level Security on every table, fair driver assignment, scheduled reminders with pg_cron.",
          "samo: AI assistant with server-side function calling, able to perform actions within the app as well as answer requests.",
        ],
      },
      {
        role: "Full-Stack Developer (apprenticeship)",
        org: "01 INFORMATICA S.r.l.",
        period: "May 2025 — present",
        intro:
          "Development and support for Codice01, the company's ERP system (Java, DB2 on IBM i), from analysis through to release. Websites and customer support (WordPress, PHP).",
        bullets: [
          "Developed new features for orders, supplier delivery notes, shipping, labels and invoicing: self-realigning order/delivery-note matching, trolley loading with mixed buckets, configurable VAT separation on self-invoices.",
          "SQL performance optimisation: rewrote queries with non-sargable predicates, moving the seasonality logic from SQL to Java.",
          "Van sales: fixed and released the legacy eMbedded Visual Basic app for Windows CE (build environment rebuilt in a VM), rolled it out at a customer's site and analysed terminal errors.",
          "j01modula: web application integrating the ERP with automated warehouses (DB2 and SQL Server), which remains operational when either database is unavailable.",
          "Working method: 30+ documents including functional analyses, test plans and user manuals, plus around 40 technical notes; one branch per ticket, pull requests and code review on Bitbucket; authored a 12-page internal guide on using Claude Code for ticket analysis.",
        ],
      },
      {
        role: "Robotics & Computer Science Educator",
        org: "Scienza Ludica APS",
        period: "Sep 2024 — present",
        intro:
          "Educational robotics and programming workshops in primary and secondary schools in Prato and Pistoia, using LEGO Spike, Ozobot and Scratch. Member of the association.",
        bullets: [],
      },
    ],
    project: {
      name: "DigitaLions",
      note: "formerly ServiceScore",
      period: "Mar 2026 — present",
      link: { label: "digitalions108la.it", href: "https://digitalions108la.it" },
      intro:
        "Platform for Lions District 108 LA (Tuscany), designed and developed entirely by me: database, permission model, user interface and production deployment. Around 3,000 members, 92 clubs and over 7,000 recorded service activities.",
      bullets: [
        "Role- and page-based permissions enforced by the database (Row Level Security, column privileges): each officer accesses data for their own club, zone or the entire district.",
        "Dashboard refreshed nightly from Lions International's official statistics, with automatic retries; full import from the official portal with total reconciliation.",
        "«La Sfida dei Leoni» (The Lions' Challenge): scoring and club-ranking engine compliant with the District's regulations.",
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
          "Thesis in Computational Linguistics: NLP analysis of a corpus of gold-medal texts, in Python with NLTK (tokenisation, POS tagging, named entity recognition). Text encoding with XML, XSLT and TEI.",
      },
      {
        title: "Technical Diploma in Computer Science",
        org: "ITTS «Fedi-Fermi»",
        period: "Sep 2013 — Jun 2018",
        grade: "78/100",
        body: "",
      },
    ],
    skills: [
      { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "PWA"] },
      { group: "Backend & databases", items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "Node.js"] },
      { group: "Enterprise systems (ERP)", items: ["Java", "DB2 on IBM i", "SQL Server", "eVB · Windows CE"] },
      { group: "Methodology", items: ["Functional analysis", "Test plans", "Code review", "Technical documentation", "Git · Bitbucket"] },
      { group: "Tools & AI", items: ["Claude Code", "Cursor", "Docker", "Linux", "Vercel"] },
      { group: "NLP & Digital Humanities", items: ["Python", "NLTK", "XML · XSLT · TEI"] },
    ],
    languages: [
      { name: "Italian", level: "Native" },
      { name: "English", level: "B2" },
    ],
    extra: [
      "Full driving licence (B), own car",
      "Volunteer: member of Vento e Vertigine APS since 2024",
      "Interests: competitive padel, chess",
    ],
    privacy:
      "I authorise the processing of the personal data contained in this CV in accordance with EU Regulation 2016/679 (GDPR).",
  },
};
