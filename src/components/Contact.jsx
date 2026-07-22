import { useState } from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Download, Share2, Check } from "lucide-react";
import { Reveal } from "./primitives";
import { profile, interests } from "../data/content";

const SITE_URL = "https://coppinifabioprojects.github.io/portfolio/";

function Marquee() {
  const row = [...interests, ...interests];
  return (
    <div className="marquee-mask overflow-hidden py-10 border-y border-white/5">
      <div className="flex w-max animate-marquee">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8 px-8 font-display text-3xl md:text-5xl text-white/15 whitespace-nowrap">
            {w}
            <span className="text-purple/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = {
      title: "Fabio Coppini — Informatico Umanista",
      text: "Dai un'occhiata al mio portfolio 🦅",
      url: SITE_URL,
    };
    try {
      if (navigator.share) { await navigator.share(data); return; }
    } catch { /* l'utente ha annullato */ return; }
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard non disponibile */ }
  };

  return (
    <footer id="contact" className="relative bg-ink-2 overflow-hidden">
      <Marquee />

      {/* Giant watermark */}
      <div className="absolute -bottom-6 inset-x-0 text-center pointer-events-none select-none">
        <span className="font-display font-black text-[22vw] leading-none text-white/[0.03]">GARUDA</span>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
        <Reveal>
          <h2 className="font-display text-4xl md:text-7xl text-white mb-4">
            Io creo sempre qualcosa di <span className="text-gradient italic">unico</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-mist max-w-xl mx-auto mb-12">
            Il futuro lo afferro con i miei artigli.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-8">
            <a href={`mailto:${profile.email}`} className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-bold">
              <Mail className="w-4 h-4" /> {profile.email}
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-bold text-white">
              <Phone className="w-4 h-4" /> {profile.phone}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <a
              href="/portfolio/cv-fabio-coppini.pdf"
              download="CV-Fabio-Coppini.pdf"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white"
            >
              <Download className="w-4 h-4" /> Scarica il CV (PDF)
            </a>
            <button
              onClick={share}
              className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white"
            >
              {copied ? <><Check className="w-4 h-4 text-garuda" /> Link copiato!</> : <><Share2 className="w-4 h-4" /> Condividi</>}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid sm:grid-cols-3 gap-8 text-left border-t border-white/10 pt-12 max-w-4xl mx-auto text-sm">
            <div>
              <strong className="text-white flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-purple-glow" /> Location</strong>
              <p className="text-mist">{profile.location}<br />Patente B · Automunito</p>
            </div>
            <div>
              <strong className="text-white block mb-2">Social</strong>
              <div className="flex gap-3">
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 grid place-items-center rounded-xl glass text-mist hover:text-purple-glow hover:border-purple/40 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href={profile.github} target="_blank" rel="noreferrer" className="w-10 h-10 grid place-items-center rounded-xl glass text-mist hover:text-purple-glow hover:border-purple/40 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <strong className="text-white block mb-2">Privacy</strong>
              <p className="text-mist">Autorizzo il trattamento dei dati personali (art. 13 GDPR 679/16).</p>
            </div>
          </div>
        </Reveal>

        <p className="mt-14 text-xs text-white/30 font-mono">
          © {year} Fabio Coppini · Code forged in fire &amp; logic.
        </p>
      </div>
    </footer>
  );
}
