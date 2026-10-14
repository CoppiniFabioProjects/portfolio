import { useState, useRef, useEffect, useCallback } from "react";
import { profile, flagship, projects, timeline, tech } from "../data/content";
import { ui } from "../data/ui";

const T = ui.terminal;

const openable = [...flagship, ...projects].filter((p) => p.link);
const thesis = timeline.find((t) => t.thesis);

// Link cliccabile nell'output del terminale
const L = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-garuda-glow underline decoration-garuda/40 hover:decoration-garuda">
    {children}
  </a>
);

function banner() {
  return [
    <span key="b1" className="text-purple-glow">{T.banner}</span>,
    <span key="b2" className="text-mist">{T.bannerHelp[0]}<b className="text-white">{T.bannerHelp[1]}</b>{T.bannerHelp[2]}<b className="text-white">{T.bannerHelp[3]}</b>{T.bannerHelp[4]}</span>,
  ];
}

const COMMANDS = {
  help: () => [
    <span key="h" className="text-mist">{T.helpTitle}</span>,
    <div key="grid" className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5 mt-1">
      {T.help.map(([c, d]) => (
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
    <span key="p0" className="text-mist">{T.projectsIntro[0]}<b className="text-white">{T.projectsIntro[1]}</b>{T.projectsIntro[2]}</span>,
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
    <span key="n5" className="text-mist">Uptime: <span className="text-white">{T.uptime}</span></span>,
  ],
  linux: () => COMMANDS.neofetch(),
  contact: () => [
    <span key="c1" className="text-mist">Email: <L href={`mailto:${profile.email}`}>{profile.email}</L></span>,
    <span key="c2" className="text-mist">{T.phone}: <L href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</L></span>,
  ],
  contatti: () => COMMANDS.contact(),
  social: () => [
    <span key="s1" className="text-mist">LinkedIn: <L href={profile.linkedin}>in/coppinifabio</L></span>,
    <span key="s2" className="text-mist">GitHub: <L href={profile.github}>CoppiniFabioProjects</L></span>,
  ],
  cv: () => [<span key="cv" className="text-mist">📄 <L href={ui.cv.href}>{T.cv}</L></span>],
  tesi: () => [
    <span key="t1" className="text-purple-glow">{T.thesisTitle}</span>,
    <span key="t2" className="text-mist">{T.thesisBody[0]}<span className="text-white">{T.thesisBody[1]}</span>{T.thesisBody[2]}</span>,
    <span key="t3" className="text-mist">{T.thesisDegree[0]}<span className="text-white">{T.thesisDegree[1]}</span></span>,
    <span key="t4" className="text-mist">→ <L href={thesis.link}>{thesis.linkLabel}</L></span>,
  ],
  nlp: () => COMMANDS.tesi(),
  thesis: () => COMMANDS.tesi(),
  padel: () => [<span key="pd" className="text-garuda-glow">{T.padel}</span>],
  assumimi: () => [<span key="hire" className="text-purple-glow">{T.hire}<L href={`mailto:${profile.email}`}>{profile.email}</L></span>],
  hire: () => COMMANDS.assumimi(),
  ls: () => [<span key="ls" className="text-mist">{T.ls}<span className="text-purple-glow/70">padel.secret</span></span>],
  sudo: () => [<span key="su" className="text-lions-red">{T.sudo}</span>],
  // --- easter egg nascosti (non in help) ---
  matrix: () => [<span key="mx" className="text-garuda-glow">{T.matrix}</span>],
  coffee: () => [
    <span key="cf1" className="text-mist">      ( (</span>,
    <span key="cf2" className="text-mist">       ) )</span>,
    <span key="cf3" className="text-mist">    ........</span>,
    <span key="cf4" className="text-mist">    |      |]  {T.coffee}</span>,
    <span key="cf5" className="text-mist">    \\      /</span>,
    <span key="cf6" className="text-mist">     `----'</span>,
  ],
  fortune: () => {
    const q = T.fortunes;
    return [<span key="fr" className="text-purple-glow italic">{q[Math.floor(Math.random() * q.length)]}</span>];
  },
  konami: () => [<span key="kn" className="text-garuda">{T.konami}</span>],
  "42": () => [<span key="42" className="text-mist">{T.answer42}</span>],
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
        output = [<span key="o" className="text-mist">{T.opening[0]}<span className="text-white">{p.title}</span>{T.opening[1]}<span className="text-mist/60">{T.opening[2]}</span></span>];
      } else {
        output = [<span key="e" className="text-lions-red">{T.projectNotFound[0]}{args[0] || "?"}{T.projectNotFound[1]}<b className="text-white">{T.projectNotFound[2]}</b>{T.projectNotFound[3]}</span>];
      }
    } else if (c === "echo") {
      output = [<span key="ec" className="text-mist">{args.join(" ")}</span>];
    } else if (COMMANDS[c]) {
      output = COMMANDS[c]();
    } else {
      output = [<span key="nf" className="text-lions-red">{T.commandNotFound[0]}{cmd}{T.commandNotFound[1]}<b className="text-white">{T.commandNotFound[2]}</b>{T.commandNotFound[3]}</span>];
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
        <span className="ml-auto text-[10px] font-mono text-mist/50 hidden sm:inline">{T.windowHint}</span>
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
            aria-label={T.inputAria}
            className="flex-1 bg-transparent outline-none text-white caret-garuda placeholder:text-mist/40"
            placeholder="help"
          />
        </div>
      </div>
    </div>
  );
}
