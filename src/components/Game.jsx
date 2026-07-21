import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Gamepad2, Volume2, VolumeX } from "lucide-react";
import { SectionHeader } from "./primitives";

// Dimensioni logiche del campo di gioco (il canvas viene scalato al contenitore)
const W = 760;
const H = 460;
const GRAVITY = 0.52;
const FLAP = -8.4;
const SPEED = 3.0;
const GAP = 178;
const COL_W = 66;
const SPAWN_DX = 300;
const BIRD_X = 150;
const BIRD_R = 20;

const TECHS = ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "PostgreSQL", "Vercel", "Docker", "Linux", "Python", "NLTK", "Prisma"];
const HS_KEY = "garuda-highscore";

export default function Game() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef(null);
  const imgRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const m = localStorage.getItem("garuda-muted") === "1";
    setMuted(m); mutedRef.current = m;
  }, []);

  const toggleMute = useCallback((e) => {
    e?.stopPropagation();
    setMuted((m) => {
      const nm = !m;
      mutedRef.current = nm;
      localStorage.setItem("garuda-muted", nm ? "1" : "0");
      return nm;
    });
  }, []);

  // effetti sonori sintetizzati (WebAudio)
  const sfx = useCallback((type) => {
    if (mutedRef.current) return;
    try {
      let ctx = audioRef.current;
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); audioRef.current = ctx; }
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime;
      if (type === "flap") {
        o.type = "square"; o.frequency.setValueAtTime(480, t); o.frequency.exponentialRampToValueAtTime(640, t + 0.05);
        g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09); o.start(t); o.stop(t + 0.1);
      } else if (type === "coin") {
        o.type = "sine"; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + 0.1);
        g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.start(t); o.stop(t + 0.16);
      } else if (type === "hit") {
        o.type = "sawtooth"; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.3);
        g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32); o.start(t); o.stop(t + 0.33);
      }
    } catch { /* audio non disponibile */ }
  }, []);

  // record salvato in locale
  useEffect(() => {
    const h = parseInt(localStorage.getItem(HS_KEY) || "0", 10);
    if (!Number.isNaN(h)) setHigh(h);
  }, []);

  // preload aquila
  useEffect(() => {
    const img = new Image();
    img.src = "/portfolio/garuda.png";
    imgRef.current = img;
  }, []);

  const resetState = useCallback(() => {
    stateRef.current = {
      birdY: H / 2,
      vel: 0,
      cols: [],
      pops: [],
      nextSpawnX: W + 120,
      score: 0,
      rot: 0,
      last: 0,
    };
    setScore(0);
  }, []);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (status === "playing") { s.vel = FLAP; sfx("flap"); }
  }, [status, sfx]);

  const start = useCallback(() => {
    resetState();
    setStatus("playing");
    stateRef.current.vel = FLAP;
    wrapRef.current?.focus();
  }, [resetState]);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    setStatus("over");
    setHigh((prev) => {
      const nh = Math.max(prev, s?.score || 0);
      localStorage.setItem(HS_KEY, String(nh));
      return nh;
    });
  }, []);

  // canvas resize per densità pixel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let mounted = true;

    const loop = (t) => {
      if (!mounted) return;
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / rect.width;
      const sx = canvas.width / W;
      const sy = canvas.height / H;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(sx, 0, 0, sy, 0, 0);

      if (s) {
        let dt = 1;
        if (status === "playing") {
          dt = s.last ? Math.min(Math.max((t - s.last) / 16.67, 0.5), 2.2) : 1;
        }
        s.last = t;

        // --- update ---
        if (status === "playing") {
          s.vel += GRAVITY * dt;
          s.birdY += s.vel * dt;
          s.rot = Math.max(-0.5, Math.min(1.1, s.vel / 12));

          for (const c of s.cols) c.x -= SPEED * dt;

          // spawn colonne
          if (!s.cols.length || W - s.cols[s.cols.length - 1].x >= SPAWN_DX) {
            const gapY = 90 + Math.random() * (H - GAP - 180);
            s.cols.push({
              x: W + COL_W,
              gapY,
              passed: false,
              token: Math.random() < 0.72 ? { label: TECHS[Math.floor(Math.random() * TECHS.length)], got: false } : null,
            });
          }
          s.cols = s.cols.filter((c) => c.x > -COL_W - 10);

          // punteggio + collisioni
          for (const c of s.cols) {
            if (!c.passed && c.x + COL_W < BIRD_X) {
              c.passed = true;
              s.score += 1;
              setScore(s.score);
            }
            // collisione colonna
            const withinX = BIRD_X + BIRD_R > c.x && BIRD_X - BIRD_R < c.x + COL_W;
            if (withinX) {
              if (s.birdY - BIRD_R < c.gapY || s.birdY + BIRD_R > c.gapY + GAP) {
                return endLoop();
              }
            }
            // token
            if (c.token && !c.token.got) {
              const tx = c.x + COL_W / 2;
              const ty = c.gapY + GAP / 2;
              if (Math.hypot(tx - BIRD_X, ty - s.birdY) < BIRD_R + 20) {
                c.token.got = true;
                s.score += 3;
                setScore(s.score);
                sfx("coin");
                s.pops.push({ x: tx, y: ty, text: "+3 " + c.token.label, life: 1 });
              }
            }
          }

          // bordi
          if (s.birdY + BIRD_R > H || s.birdY - BIRD_R < 0) return endLoop();

          // popup
          for (const p of s.pops) { p.y -= 0.7 * dt; p.life -= 0.018 * dt; }
          s.pops = s.pops.filter((p) => p.life > 0);
        }

        // --- draw ---
        drawScene(ctx, s, status);
      }

      rafRef.current = requestAnimationFrame(loop);

      function endLoop() {
        drawScene(ctx, s, "over");
        sfx("hit");
        endGame();
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, endGame]);

  const drawScene = (ctx, s, st) => {
    // colonne
    for (const c of s.cols) {
      roundedCol(ctx, c.x, 0, COL_W, c.gapY);
      roundedCol(ctx, c.x, c.gapY + GAP, COL_W, H - (c.gapY + GAP));
      // token
      if (c.token && !c.token.got) {
        const tx = c.x + COL_W / 2;
        const ty = c.gapY + GAP / 2;
        ctx.save();
        ctx.font = "600 13px 'Space Grotesk', sans-serif";
        const tw = ctx.measureText(c.token.label).width + 20;
        ctx.fillStyle = "rgba(45,212,191,0.14)";
        ctx.strokeStyle = "rgba(94,234,212,0.7)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, tx - tw / 2, ty - 12, tw, 24, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#5eead4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.token.label, tx, ty + 1);
        ctx.restore();
      }
    }

    // popup punti
    for (const p of s.pops) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = "#c084fc";
      ctx.font = "700 15px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }

    // aquila
    const img = imgRef.current;
    ctx.save();
    ctx.translate(BIRD_X, s.birdY);
    ctx.rotate(s.rot);
    ctx.shadowColor = "rgba(168,85,247,0.8)";
    ctx.shadowBlur = 18;
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, -26, -26, 52, 52);
    } else {
      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const onKey = (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (status === "idle" || status === "over") start();
      else flap();
    }
  };
  const onPointer = () => {
    if (status === "idle" || status === "over") start();
    else flap();
  };

  return (
    <section id="gioca" className="relative py-20 md:py-28 overflow-hidden">
      <div className="blob bg-garuda w-[30rem] h-[30rem] -left-40 top-1/2 opacity-15" />
      <div className="container mx-auto px-6 relative">
        <SectionHeader
          index="06"
          eyebrow="🎮 Pausa"
          title="Fai volare il Garuda"
          sub="Un attimo di leggerezza: schiva le colonne e raccogli le tecnologie che uso. Clicca, tocca o premi Spazio."
        />

        <div className="max-w-3xl mx-auto">
          <div
            ref={wrapRef}
            tabIndex={0}
            onKeyDown={onKey}
            onMouseDown={onPointer}
            onTouchStart={(e) => { e.preventDefault(); onPointer(); }}
            role="application"
            aria-label="Mini-gioco: fai volare l'aquila premendo spazio o toccando"
            className="group relative w-full rounded-3xl glass overflow-hidden cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-glow"
            style={{ aspectRatio: `${W} / ${H}` }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* HUD */}
            <div className="absolute top-4 left-5 z-10 flex items-center gap-2 font-mono text-sm text-white/90">
              <span className="text-purple-glow font-bold text-lg">{score}</span>
              <span className="text-mist/60 text-xs">punti</span>
            </div>
            <div className="absolute top-3 right-4 z-20 flex items-center gap-3">
              <button
                onClick={toggleMute}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={muted ? "Attiva audio" : "Disattiva audio"}
                className="w-8 h-8 grid place-items-center rounded-lg glass text-mist hover:text-white transition-colors"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="flex items-center gap-1.5 font-mono text-xs text-mist">
                <Trophy className="w-3.5 h-3.5 text-garuda" /> {high}
              </span>
            </div>

            {/* Overlay idle / game over */}
            {status !== "playing" && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-ink/50 backdrop-blur-[2px]">
                <div className="text-center px-6">
                  {status === "idle" ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl grid place-items-center btn-primary">
                        <Gamepad2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl text-white mb-2">Pronto a volare?</h3>
                      <p className="text-mist text-sm mb-5">Clicca, tocca o premi <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">Spazio</kbd></p>
                      <span className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                        <Play className="w-4 h-4" /> Inizia
                      </span>
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-3xl md:text-4xl text-white mb-1">
                        {score > 0 && score >= high ? "Nuovo record! 🎉" : "Game Over"}
                      </h3>
                      <p className="text-mist mb-1">Punteggio: <span className="text-purple-glow font-bold">{score}</span></p>
                      <p className="text-xs text-mist/70 mb-5 flex items-center justify-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-garuda" /> Record: {high}
                      </p>
                      <span className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                        <RotateCcw className="w-4 h-4" /> Riprova
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-mist/50 mt-4 font-mono">
            +1 per ogni colonna · +3 per ogni tecnologia raccolta
          </p>
        </div>
      </div>
    </section>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function roundedCol(ctx, x, y, w, h) {
  if (h <= 0) return;
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "rgba(168,85,247,0.10)");
  g.addColorStop(1, "rgba(168,85,247,0.22)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(192,132,252,0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
