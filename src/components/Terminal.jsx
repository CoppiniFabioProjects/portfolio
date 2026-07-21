import { useState, useRef, useEffect, useCallback } from "react";
import { profile, flagship, projects, timeline, tech, vetrina } from "../data/content";

const openable = [...flagship, ...projects].filter((p) => p.link);

// Link cliccabile nell'output del terminale
const L = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-garuda-glow underline decoration-garuda/40 hover:decoration-garuda">
    {children}
  </a>
);

function banner() {
  return [
    <span key="b1" className="text-purple-glow">Benvenuto nel terminale di Fabio. 🦅</span>,
    <span key="b2" className="text-mist">Scrivi <b className="text-white">help</b> per i comandi disponibili, oppure prova <b className="text-white">whoami</b>.</span>,
  ];
}

const COMMANDS = {
  help: () => [
    <span key="h" className="text-mist">Comandi disponibili:</span>,
    <div key="grid" className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5 mt-1">
      {[
        ["whoami", "chi sono"],
        ["about", "presentazione"],
        ["skills", "stack tecnologico"],
        ["projects", "i miei progetti"],
        ["apri <n>", "apri un progetto"],
        ["experience", "il mio percorso"],
        ["tesi", "la tesi NLP 🎓"],
        ["neofetch", "il mio sistema"],
        ["contact", "come contattarmi"],
        ["social", "LinkedIn & GitHub"],
        ["cv", "scarica il CV"],
        ["padel", "🎾 ?"],
        ["clear", "pulisci schermo"],
      ].map(([c, d]) => (
        <div key={c}><span className="text-garuda">{c}</span> <span className="text-mist/60">— {d}</span></div>
      ))}
    </div>,
  ],
  whoami: () => [
    <span key="w1" className="text-white">{profile.name} — {profile.role} 🦅</span>,
    <span key="w2" className="text-mist">Full-Stack Developer · {profile.location}</span>,
  ],
  about: () => [<span key="a" className="text-mist">{profile.intro}</span>],
  chi: () => COMMANDS.about(),
  presentazione: () => COMMANDS.about(),
  skills: () =>
    tech.flatMap((g) => [
      <span key={g.title} className="text-purple-glow mt-1 block">▸ {g.title}</span>,
      <span key={g.title + "i"} className="text-mist">  {g.items.join(" · ")}</span>,
    ]),
  stack: () => COMMANDS.skills(),
  competenze: () => COMMANDS.skills(),
  projects: () => [
    <span key="p0" className="text-mist">I miei progetti — scrivi <b className="text-white">apri &lt;numero&gt;</b> per visitarli:</span>,
    ...openable.map((p, i) => (
      <div key={p.title}>
        <span className="text-garuda">[{i + 1}]</span>{" "}
        <span className="text-white">{p.title}</span>
        {p.status && <span className="text-purple-glow/70 text-xs"> · {p.status}</span>}
        <span className="text-mist/70"> — {p.tagline || (p.tags ? p.tags.join(", ") : "")}</span>
      </div>
    )),
  ],
  progetti: () => COMMANDS.projects(),
  experience: () =>
    timeline.map((t) => (
      <div key={t.org + t.period}>
        <span className="text-garuda">{t.period}</span>{" "}
        <span className="text-white">{t.org}</span>
        <span className="text-mist"> — {t.role}</span>
      </div>
    )),
  esperienza: () => COMMANDS.experience(),
  timeline: () => COMMANDS.experience(),
  neofetch: () => [
    <span key="n1" className="text-mist">OS: <span className="text-white">Garuda Linux (Arch)</span></span>,
    <span key="n2" className="text-mist">WM: <span className="text-white">Hyprland (Wayland)</span></span>,
    <span key="n3" className="text-mist">Shell: <span className="text-white">zsh + oh-my-zsh</span></span>,
    <span key="n4" className="text-mist">Editor: <span className="text-white">Cursor / Claude Code</span></span>,
    <span key="n5" className="text-mist">Uptime: <span className="text-white">sempre in apprendimento</span></span>,
  ],
  linux: () => COMMANDS.neofetch(),
  contact: () => [
    <span key="c1" className="text-mist">Email: <L href={`mailto:${profile.email}`}>{profile.email}</L></span>,
    <span key="c2" className="text-mist">Tel: <L href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</L></span>,
  ],
  contatti: () => COMMANDS.contact(),
  social: () => [
    <span key="s1" className="text-mist">LinkedIn: <L href={profile.linkedin}>in/coppinifabio</L></span>,
    <span key="s2" className="text-mist">GitHub: <L href={profile.github}>CoppiniFabioProjects</L></span>,
  ],
  cv: () => [<span key="cv" className="text-mist">📄 <L href="/portfolio/cv-fabio-coppini.pdf">Scarica il CV in PDF</L></span>],
  tesi: () => [
    <span key="t1" className="text-purple-glow">🎓 Tesi — Linguistica Computazionale (NLP)</span>,
    <span key="t2" className="text-mist">Analisi dei testi delle medaglie d'oro in <span className="text-white">Python + NLTK</span>: tokenizzazione, POS tagging, named entity recognition.</span>,
    <span key="t3" className="text-mist">Laurea in Informatica Umanistica @ Università di Pisa · <span className="text-white">98/110</span></span>,
    <span key="t4" className="text-mist">→ <L href={vetrina.main.link.href}>{vetrina.main.link.label}</L></span>,
  ],
  nlp: () => COMMANDS.tesi(),
  thesis: () => COMMANDS.tesi(),
  padel: () => [<span key="pd" className="text-garuda-glow">🎾 Livello: agonistico. Importante quanto il codice. Non giudicare. 😎</span>],
  assumimi: () => [<span key="hire" className="text-purple-glow">Ottima scelta. 😏 Scrivimi qui → <L href={`mailto:${profile.email}`}>{profile.email}</L></span>],
  hire: () => COMMANDS.assumimi(),
  ls: () => [<span key="ls" className="text-mist">progetti/  skills.json  cv.pdf  garuda.png  <span className="text-purple-glow/70">padel.secret</span></span>],
  sudo: () => [<span key="su" className="text-lions-red">Nice try. 😏 Non ti serve sudo per assumermi — basta un'email.</span>],
  // --- easter egg nascosti (non in help) ---
  matrix: () => [<span key="mx" className="text-garuda-glow">01001100 01101001 01100010 01100101 01110010 — wake up, Neo. 🕶️ Sei nella Matrix di Fabio.</span>],
  coffee: () => [
    <span key="cf1" className="text-mist">      ( (</span>,
    <span key="cf2" className="text-mist">       ) )</span>,
    <span key="cf3" className="text-mist">    ........</span>,
    <span key="cf4" className="text-mist">    |      |]  ☕ Il carburante di ogni deploy.</span>,
    <span key="cf5" className="text-mist">    \\      /</span>,
    <span key="cf6" className="text-mist">     `----'</span>,
  ],
  fortune: () => {
    const q = [
      "«Non chiedo più potenza. Tolgo peso.» — Colin Chapman",
      "«L'unico modo per liberarsi di una tentazione è cedervi.» — Oscar Wilde",
      "«E il naufragar m'è dolce in questo mare.» — Leopardi",
      "«Talk is cheap. Show me the code.» — Linus Torvalds",
      "«Prima risolvi il problema. Poi scrivi il codice.» — John Johnson",
    ];
    return [<span key="fr" className="text-purple-glow italic">{q[Math.floor(Math.random() * q.length)]}</span>];
  },
  konami: () => [<span key="kn" className="text-garuda">Suggerimento: ↑ ↑ ↓ ↓ ← → ← → B A … prova sulla pagina. 🦅</span>],
  "42": () => [<span key="42" className="text-mist">La risposta a tutto. Ma qual era la domanda? 🤔</span>],
};

export default function Terminal() {
  const [lines, setLines] = useState([{ output: banner() }]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const run = useCallback((raw) => {
    const input = raw.trim();
    if (!input) { setLines((l) => [...l, { cmd: "" }]); return; }
    setHist((h) => [...h, input]);
    setHi(-1);
    const [cmd, ...args] = input.split(/\s+/);
    const c = cmd.toLowerCase();

    if (c === "clear" || c === "cls") { setLines([]); return; }

    let output;
    if (c === "apri" || c === "open") {
      const n = parseInt(args[0], 10);
      const p = openable[n - 1];
      if (p) {
        window.open(p.link, "_blank", "noopener");
        output = [<span key="o" className="text-mist">Apro <span className="text-white">{p.title}</span>… 🚀 <span className="text-mist/60">(se non si apre, controlla il blocco popup)</span></span>];
      } else {
        output = [<span key="e" className="text-lions-red">Progetto {args[0] || "?"} non trovato. Scrivi <b className="text-white">projects</b>.</span>];
      }
    } else if (c === "echo") {
      output = [<span key="ec" className="text-mist">{args.join(" ")}</span>];
    } else if (COMMANDS[c]) {
      output = COMMANDS[c]();
    } else {
      output = [<span key="nf" className="text-lions-red">comando non trovato: {cmd}. Scrivi <b className="text-white">help</b>.</span>];
    }
    setLines((l) => [...l, { cmd: input, output }]);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Enter") { run(value); setValue(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      const ni = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(ni); setValue(hist[ni]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < 0) return;
      const ni = hi + 1;
      if (ni >= hist.length) { setHi(-1); setValue(""); }
      else { setHi(ni); setValue(hist[ni]); }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault(); setLines([]);
    }
  };

  return (
    <div
      className="glass rounded-2xl overflow-hidden max-w-3xl cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* barra finestra */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-lions-red/80" />
        <span className="w-3 h-3 rounded-full bg-lions-gold/80" />
        <span className="w-3 h-3 rounded-full bg-garuda/80" />
        <span className="ml-3 text-xs font-mono text-mist">fabio@garuda ~ zsh</span>
        <span className="ml-auto text-[10px] font-mono text-mist/50 hidden sm:inline">interattivo · scrivi «help»</span>
      </div>

      {/* corpo */}
      <div ref={scrollRef} className="p-5 font-mono text-sm leading-relaxed h-80 overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            {line.cmd !== undefined && (
              <div className="flex gap-2">
                <span className="text-garuda shrink-0">➜</span>
                <span className="text-purple-glow shrink-0">~</span>
                <span className="text-white break-all">{line.cmd}</span>
              </div>
            )}
            {line.output && <div className="mt-0.5 space-y-0.5">{line.output.map((o, j) => <div key={j}>{o}</div>)}</div>}
          </div>
        ))}

        {/* riga input */}
        <div className="flex gap-2 items-center">
          <span className="text-garuda shrink-0">➜</span>
          <span className="text-purple-glow shrink-0">~</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminale interattivo: scrivi un comando e premi Invio"
            className="flex-1 bg-transparent outline-none text-white caret-garuda placeholder:text-mist/40"
            placeholder="help"
          />
        </div>
      </div>
    </div>
  );
}
