import { HeartHandshake, ArrowUpRight } from "lucide-react";
import { Reveal, Spotlight } from "./primitives";
import { beneficenza } from "../data/content";

export default function Beneficenza() {
  return (
    <section id="beneficenza" className="relative py-28">
      <div className="container mx-auto px-6">
        <Reveal>
          <Spotlight className="relative glass card-hover rounded-3xl overflow-hidden">
            {/* Lions accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 flex">
              <div className="flex-1 bg-lions-blue" />
              <div className="flex-1 bg-lions-gold" />
              <div className="flex-1 bg-lions-red" />
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="self-start inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-lions-gold border border-lions-gold/30 bg-lions-gold/10 px-3 py-1 rounded-full mb-5">
                  <HeartHandshake className="w-3.5 h-3.5" /> Beneficenza
                </span>
                <h2 className="font-display text-3xl md:text-5xl text-white mb-3">{beneficenza.title}</h2>
                <p className="font-display italic text-xl text-lions-gold/90 mb-4">{beneficenza.subtitle}</p>
                <p className="text-mist leading-relaxed mb-8">{beneficenza.body}</p>
                <a
                  href={beneficenza.link}
                  target="_blank"
                  rel="noreferrer"
                  className="self-start btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider"
                >
                  {beneficenza.linkLabel} <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="relative min-h-[16rem] overflow-hidden">
                <img src={beneficenza.image} alt={beneficenza.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-ink via-ink/30 to-transparent" />
              </div>
            </div>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}
