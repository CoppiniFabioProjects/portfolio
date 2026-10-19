// ============================================================
//  ENGLISH CONTENT — Fabio Coppini Portfolio
//  Same structure as content.it.js (enforced by content.en.test.js).
//  Translate the meaning, not the words. Links stay the same: posts and the
//  thesis are in Italian, and the copy says so where it matters.
// ============================================================

export const profile = {
  name: "Fabio Coppini",
  role: "Digital Humanist",
  location: "Pistoia / Quarrata, Italy",
  email: "coppinifabio99@gmail.com",
  phone: "+39 334 923 5662",
  linkedin: "https://www.linkedin.com/in/coppinifabio/",
  linkedinFollowers: "7.7k",
  github: "https://github.com/CoppiniFabioProjects/",
  tagline: "Free as an eagle.",
  headline: "Full-Stack Developer",
  stack: "React · Next.js · Supabase",
  intro:
    "Not your typical developer. A Digital Humanities graduate from the University of Pisa, I work where few do: between the cold precision of algorithms and the chaotic beauty of human culture.",
};

export const nav = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "From the field" },
  { id: "experience", label: "Path" },
  { id: "skills", label: "Toolkit" },
  { id: "contact", label: "Contact" },
];

export const vetrina = {
  // Stories from work: each one comes from a LinkedIn post (in Italian)
  stories: [
    {
      icon: "GitPullRequest",
      tag: "Method · Code review",
      title: "I never make mistakes. Then I made one.",
      body:
        "A change that was right for one customer, written in the class shared by every printout: weights on delivery notes and invoices lost their decimals for everyone. I wrote down what happened and what changes from that day on.",
      lesson: "A comment is not a condition.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7508933285134372865/",
      accent: "purple",
    },
    {
      icon: "Lock",
      tag: "Security · Supabase",
      title: "Login protects pages, not data.",
      body:
        "A BaaS anon key is public: a REST call reaches the database without going through your code. The defence is RLS policies and, for public pages, a SECURITY DEFINER function that answers yes or no without exposing the rows.",
      lesson: "With personal data, the «minimal» SELECT is already the problem.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7485423343811227649/",
      accent: "garuda",
    },
    {
      icon: "History",
      tag: "Legacy · Windows CE",
      title: "2003. A handheld. 15,000 lines, no tests.",
      body:
        "A van-sales app in eMbedded Visual Basic was recording invoices nobody had chosen. Two patches, eleven lines, the build environment rebuilt in a virtual machine and the release on the devices, in the field.",
      lesson: "Old code isn't dead code: it has worked harder than you.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7502766993562025987/",
      accent: "purple",
    },
    {
      icon: "Gauge",
      tag: "Performance · SQL on DB2",
      title: "I removed one line of SQL and the page flies.",
      body:
        "A seasonality filter written as a CASE in the WHERE clause kept the database from using its indexes. I moved the rule to Java, leaving the query a key equality, and compared the results over 53 weeks: zero differences.",
      lesson: "The condition that's easiest to write is often the most expensive to run.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7503489910654349312/",
      accent: "garuda",
    },
    {
      icon: "Radio",
      tag: "Realtime · spostiamoci",
      title: "Live location worked. Except when it mattered.",
      body:
        "Whoever waited, standing still at the meeting point, vanished from the map. Three bugs from the same family: I broadcast before listening, a still GPS goes silent, broadcast channels keep no history. I found them with two phones in my hands.",
      lesson: "If state depends on events, you have to design the silence too.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7487143100046327808/",
      accent: "purple",
    },
    {
      icon: "Scale",
      tag: "Data · DigitaLions",
      title: "A scoring engine for 92 Lions Clubs.",
      body:
        "The rules award points across 16 activity types; the official portal exposes 4. A person assigns the type: until they do, the score isn't zero, it's missing. And the competition data is protected by the database, column by column.",
      lesson: "On an official ranking, a guessed value is worse than a missing one.",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7502685882110500865/",
      accent: "garuda",
    },
  ],
  cards: [
    {
      icon: "Trophy",
      title: "Padel Player",
      body:
        "Competitive play. Discipline, strategy and reflexes carried from the court to the code.",
      link: { href: "https://app.playtomic.io/", label: "Playtomic" },
      image: "/portfolio/padel.webp",
      accent: "garuda",
    },
    {
      icon: "Bot",
      title: "Robotics Teacher",
      body:
        "With Scienza Ludica APS I teach robotics and coding in schools around Prato and Pistoia: Lego Spike, Ozobot and Scratch.",
      link: { href: "https://scienzaludica.org/", label: "Scienza Ludica" },
      image: "/portfolio/scienzaludica.webp",
      accent: "purple",
    },
    {
      icon: "Sprout",
      title: "Vento e Vertigine",
      body:
        "Volunteering focused on ethical innovation, sustainability and a mindful use of language.",
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
    items: ["Supabase", "PostgreSQL", "PostGIS", "Row Level Security", "SECURITY DEFINER functions", "Realtime & pg_cron", "Edge Functions", "Node.js"],
  },
  {
    title: "Enterprise Systems",
    icon: "Factory",
    accent: "purple",
    items: ["Java", "DB2 on IBM i", "SQL Server", "Spring Boot", "ERP", "SQL optimisation", "Legacy: eVB · Windows CE", "Warehouse integrations"],
  },
  {
    title: "Method & Quality",
    icon: "ClipboardCheck",
    accent: "garuda",
    items: ["Functional analysis", "Technical notes", "Test plans", "Code review", "Git · Bitbucket · GitHub", "CI/CD with GitHub Actions", "User manuals", "Customer go-lives"],
  },
  {
    title: "NLP & Text Encoding",
    icon: "ScrollText",
    accent: "purple",
    items: ["Python", "NLTK", "Tokenisation", "POS Tagging", "Named Entity Recognition", "XML", "XSLT", "TEI"],
  },
  {
    title: "AI, Cloud & Tooling",
    icon: "Cloud",
    accent: "garuda",
    items: ["Claude Code", "Cursor", "Parallel agents", "Vercel", "Docker", "Linux", "Vite", "GitHub Pages"],
  },
];

export const linux = {
  distro: "Garuda Linux",
  points: [
    { icon: "Terminal", title: "Terminal & Shell", body: "Zsh + oh-my-zsh, Hyprland (Wayland). A tailor-made setup, fast and minimal." },
    { icon: "Container", title: "Docker & Deploy", body: "Containerisation, GitHub CI/CD pipelines, Vercel deploys of React/Supabase web apps." },
    { icon: "Cpu", title: "Hardware & Networking", body: "PC building, hardware troubleshooting, networking and advanced debugging." },
    { icon: "Users", title: "Community", body: "Open source, documentation, knowledge sharing and mentorship." },
  ],
};

export const timeline = [
  {
    period: "Jun 2026 — present",
    org: "spostiamoci",
    role: "Co-founder & Full-Stack Developer",
    body: "Conception and full-stack development of the trust-based social mobility platform: Next.js, React, Supabase, PostGIS. From architecture to installable product (PWA), with samo, the assistant that keeps rides fair.",
    link: "https://spostiamoci.vercel.app",
    linkLabel: "Open the app",
    current: true,
  },
  {
    period: "May 2025 — present",
    org: "01Informatica",
    role: "Full-Stack Developer (Apprentice)",
    body: "Development and support on Codice01, the company's ERP system (Java, DB2): I take work from analysis to release, including customer go-lives and legacy code. Mentored by Michele.",
    current: true,
  },
  {
    period: "Sep 2024 — present",
    org: "Scienza Ludica",
    role: "Robotics & Computing Educator",
    body: "Teaching in primary and secondary schools in Prato and Pistoia.",
    current: true,
  },
  {
    period: "Nov 2023",
    org: "Madilo SRL (DHL)",
    role: "Logistics & Distribution",
    body: "Operational role in logistics and distribution.",
  },
  {
    period: "2018 — 2023",
    org: "University of Pisa",
    role: "BA in Digital Humanities",
    body: "Grade 98/110. Thesis in Computational Linguistics: NLP analysis in Python/NLTK of gold-medal texts. Text encoding with XML/XSLT/TEI.",
    link: "https://drive.google.com/drive/folders/171K8z4jlj_PbVp7bJ7IUweG75Hj5ZixM?usp=sharing",
    linkLabel: "Read the thesis (IT)",
    thesis: true, // the thesis: the terminal's «thesis» command links it too
  },
  {
    period: "2013 — 2018",
    org: "ITTS Silvano Fedi",
    role: "Technical Diploma in Computer Science",
    body: 'Final paper: "The Digital Revolution compared with Anarchy".',
    link: "https://drive.google.com/file/d/1TUFOxMBUeuC53R0BwsnYKp5MsOFMxeO6/view?usp=sharing",
  },
];

// The two flagship projects — full-bleed cinematic blocks
export const flagship = [
  {
    index: "01",
    title: "spostiamoci",
    tagline: "The LinkedIn of everyday commuting",
    body:
      "Carpooling between strangers never takes off: trust is missing. With spostiamoci you only travel with your own network, the «amoci» up to the 3rd degree. samo, the assistant, fairly picks who drives, splits the costs and finds companions along real routes, with real-time chat.",
    metrics: [
      { value: "33", label: "Early amoci in the network" },
      { value: "up to €103", label: "Monthly savings / user" },
      { value: "−69 kg", label: "CO₂ per month / user" },
    ],
    tags: ["Next.js 15", "React 19", "Supabase", "PostGIS", "Realtime", "PWA"],
    image: "/portfolio/spostiamoci-poster.webp",
    link: "https://spostiamoci.vercel.app",
    linkLabel: "Open the app",
    status: "Live",
    accent: "garuda",
  },
  {
    index: "02",
    title: "DigitaLions",
    tagline: "Technology in the service of good",
    body:
      "The management system of the Lions Clubs of District 108 LA (Tuscany): members log their service activities, senior members and presidents validate them through a hierarchy of roles. Dashboards and statistics update every night from Lions International's official data.",
    metrics: [
      { value: "3,000", label: "Members" },
      { value: "7,000+", label: "Activities managed" },
      { value: "108 LA", label: "Tuscany District" },
    ],
    tags: ["Next.js 16", "React 19", "TypeScript", "Supabase", "RLS", "Vercel"],
    image: "/portfolio/digitalions.webp",
    link: "https://digitalions108la.it",
    linkLabel: "Visit DigitaLions",
    status: "Live",
    accent: "lions",
  },
];

export const projects = [
  {
    title: "Logistics Middleware",
    body: "Web app connecting the ERP to automated warehouses (DB2 and SQL Server), still working when one of the two databases is down. A 01 Informatica company project: proprietary code, not public.",
    tags: ["React", "ERP", "Hardware"],
    // on the 3D screen, a diagram of how it works (no internal names: the code is proprietary)
    screen: { diagram: { from: ["ERP", "DB2 on IBM i"], via: "Middleware", to: ["Automated warehouse", "SQL Server"], note: "keeps working with one database down" } },
  },
  {
    title: "First Lego League USA",
    body: "Team leader and scientific coordination for the international robotics competition.",
    tags: ["Robotics", "Team Lead"],
    image: "/portfolio/CHALLENGE_2.webp",
    link: "https://www.youtube.com/watch?v=S2FbYDwy31o",
    linkLabel: "Watch the video",
  },
];

export const interests = [
  "Leopardi", "Chess", "Oscar Wilde", "Pavarotti",
  "Fromm", "Bel Canto", "Padel", "Gaming", "Linux",
];
