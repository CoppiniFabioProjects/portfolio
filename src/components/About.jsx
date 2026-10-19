import { DustImage } from "../dust/Dust";
import { ScrollWords, Reveal } from "./primitives";
import { profile, timeline } from "../data/content";
import { ui } from "../data/ui";

// la foto sfuma in basso: la stessa sfumatura vale per la polvere che la compone
const portraitFade = (v) => (v < 0.6 ? 1 : Math.max(0, 1 - (v - 0.6) / 0.4));

export default function About() {
  const now = timeline.filter((t) => t.current);
  return (
    <section id="about" className="gutter pt-[18vh] pb-[14vh]">
      <div className="grid md:grid-cols-12 gap-y-12 md:gap-x-6 items-start">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="label mb-5 border-t border-line pt-4 flex justify-between">
            <span>(01)</span>
            <h2>{ui.about.label}</h2>
          </div>
          <DustImage
            id="portrait"
            src="/portfolio/fabio-portrait.webp"
            alt={profile.name}
            width={1121}
            height={1100}
            loading="lazy"
            fade={portraitFade}
            interactive
            className="block w-[78%] md:w-full h-auto mx-auto [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
          />
        </div>

        <div className="md:col-span-8 lg:col-start-6 lg:col-span-7 md:pt-12">
          <ScrollWords
            text={profile.intro}
            className="text-[clamp(1.65rem,3.3vw,3.4rem)] leading-[1.12] tracking-[-0.03em] font-normal text-fg"
          />

          <Reveal className="mt-14 md:mt-20">
            <div className="label mb-4">{ui.about.now}</div>
            <ul className="border-t border-line">
              {now.map((t) => (
                <li key={t.org} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5 border-b border-line text-[15px]">
                  <span className="text-fg">{t.org}</span>
                  <span className="text-dim">{t.role}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
