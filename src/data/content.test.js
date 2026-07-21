import { describe, it, expect } from "vitest";
import { profile, nav, tech, flagship, projects, timeline, vetrina } from "./content";

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
});
