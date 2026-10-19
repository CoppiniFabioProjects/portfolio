import { useState } from "react";
import { ArrowUpRight, ArrowDown, Copy, Check } from "lucide-react";
import { Reveal, Words, smooth } from "./primitives";
import { openPanel } from "./Panels";
import { profile, interests } from "../data/content";
import { ui } from "../data/ui";

const C = ui.contact;

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { label: "LinkedIn", note: `${profile.linkedinFollowers} ${C.followers}`, href: profile.linkedin, external: true },
    { label: "GitHub", note: "CoppiniFabioProjects", href: profile.github, external: true },
    { label: C.cv, note: `PDF · ${ui.cv.file}`, href: ui.cv.href, download: ui.cv.file },
    { label: C.phone, note: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  ];

  return (
    <footer id="contact" className="gutter pt-[14vh] pb-6 min-h-[100svh] flex flex-col">
      <Reveal y={12} className="label border-t border-line pt-4 flex justify-between">
        <span>(07)</span>
        <h2>{C.label}</h2>
      </Reveal>

      <div className="flex-1 flex flex-col justify-center py-[10vh]">
        <p className="text-[clamp(1.6rem,3.6vw,3.6rem)] leading-[1.08] tracking-[-0.035em]">
          <Words text={C.headline[0]} className="block text-fg" />
          <Words text={C.headline[1]} className="block text-dim" delay={0.25} />
        </p>

        <Reveal delay={0.2} className="mt-10 md:mt-16">
          <div className="flex items-end gap-3 md:gap-6 flex-wrap">
            <a
              href={`mailto:${profile.email}`}
              className="u-link text-[clamp(1.55rem,7.1vw,8.4rem)] font-medium leading-[0.95] tracking-[-0.05em] text-fg break-all md:break-normal"
            >
              {profile.email}
            </a>
            <button
              type="button"
              onClick={copy}
              className="mb-1 md:mb-4 inline-flex items-center gap-2 rounded-full btn-ghost px-4 py-2 text-[12px] text-fg"
              aria-live="polite"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-violet" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? C.copied : C.copy}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-14 md:mt-20">
          <ul className="grid grid-cols-2 md:grid-cols-4 border-t border-line dim-others">
            {links.map((l) => (
              <li key={l.label} className="border-b border-line odd:border-r md:border-b-0 md:border-r md:last:border-r-0">
                <a
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  {...(l.download ? { download: l.download } : {})}
                  className="group flex items-start justify-between gap-3 p-4 md:p-6 h-full"
                >
                  <span>
                    <span className="block text-[17px] md:text-xl tracking-[-0.02em] text-fg">{l.label}</span>
                    <span className="block mt-1 text-[12px] text-dim">{l.note}</span>
                  </span>
                  {l.download ? (
                    <ArrowDown className="w-4 h-4 mt-1 text-dim group-hover:text-fg transition-colors" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 mt-1 text-dim group-hover:text-fg transition-[color,transform] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="label normal-case tracking-normal text-[12px] grid gap-3 md:grid-cols-12 md:gap-6 border-t border-line pt-5">
        <p className="md:col-span-4 text-fg/80">
          © {new Date().getFullYear()} {profile.name} · <span className="serif-i text-[14px] text-fg">{C.signature}</span>
        </p>
        <p className="md:col-span-4">{interests.join(" · ")}</p>
        <p className="md:col-span-2">{profile.location} · {C.driving}</p>
        <div className="md:col-span-2 flex md:justify-end gap-4">
          <button type="button" onClick={() => openPanel("game")} className="u-link text-fg/80">{ui.panel.game}</button>
          <button type="button" onClick={() => smooth.to("hero")} className="u-link text-fg/80">{C.top} ↑</button>
        </div>
        <p className="md:col-span-12 text-dim/70 text-[11px]">{C.privacyText}</p>
      </div>
    </footer>
  );
}
