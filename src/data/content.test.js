import { describe, it, expect } from "vitest";
import { profile, nav, tech, techOrbit, flagship, projects, timeline, vetrina } from "./content";

describe("content — integrità dei dati", () => {
  it("il profilo ha i campi essenziali", () => {
    expect(profile.name).toBe("Fabio Coppini");
    expect(profile.email).toMatch(/@/);
    expect(profile.linkedin).toMatch(/^https:\/\//);
    expect(profile.github).toMatch(/^https:\/\//);
  });

  it("la navigazione ha id univoci e non vuoti", () => {
    const ids = nav.map((n) => n.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toBeTruthy());
  });

  it("ogni gruppo tech ha titolo, icona e almeno 3 tecnologie", () => {
    expect(tech.length).toBeGreaterThanOrEqual(4);
    tech.forEach((g) => {
      expect(g.title).toBeTruthy();
      expect(g.icon).toBeTruthy();
      expect(g.items.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("lo stack include tecnologie chiave del profilo full-stack + NLP", () => {
    const all = tech.flatMap((g) => g.items).join(" ").toLowerCase();
    ["react", "next.js", "supabase", "vercel", "python", "nltk", "xml"].forEach((t) =>
      expect(all).toContain(t)
    );
  });

  it("l'orbita 3D ha al massimo 3 anelli, con colore e almeno 3 tecnologie", () => {
    expect(techOrbit.length).toBeGreaterThan(0);
    expect(techOrbit.length).toBeLessThanOrEqual(3); // la scena ha 3 raggi/inclinazioni
    techOrbit.forEach((ring) => {
      expect(ring.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(ring.items.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("i progetti di punta hanno link validi e status", () => {
    expect(flagship.length).toBeGreaterThanOrEqual(2);
    flagship.forEach((p) => {
      expect(p.title).toBeTruthy();
      expect(p.link).toMatch(/^https:\/\//);
      expect(p.status).toBeTruthy();
    });
  });

  it("i link esterni dei progetti sono ben formati", () => {
    projects.filter((p) => p.link).forEach((p) => expect(p.link).toMatch(/^https?:\/\//));
  });

  it("la timeline è ordinata e la voce universitaria cita la tesi NLP", () => {
    expect(timeline.length).toBeGreaterThan(0);
    const uni = timeline.find((t) => /pisa/i.test(t.org));
    expect(uni).toBeTruthy();
    expect(uni.body.toLowerCase()).toMatch(/nlp|nltk/);
  });

  it("la vetrina evidenzia la tesi in Python/NLTK", () => {
    expect(vetrina.main.body.toLowerCase()).toContain("nltk");
  });

  it("ogni storia della vetrina ha titolo, lezione e link al post LinkedIn", () => {
    expect(vetrina.stories.length).toBeGreaterThanOrEqual(3);
    vetrina.stories.forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.body).toBeTruthy();
      expect(s.lesson).toBeTruthy();
      expect(s.href).toMatch(/^https:\/\/www\.linkedin\.com\/feed\/update\/urn:li:activity:\d+\/$/);
    });
    const links = vetrina.stories.map((s) => s.href);
    expect(new Set(links).size).toBe(links.length);
  });

  it("lo stack include anche il lavoro sul gestionale", () => {
    const all = tech.flatMap((g) => g.items).join(" ").toLowerCase();
    ["java", "db2", "code review"].forEach((t) => expect(all).toContain(t));
  });
});
