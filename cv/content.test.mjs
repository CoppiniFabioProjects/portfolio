import { describe, it, expect } from "vitest";
import { cv } from "./content.mjs";

// "Forma" di un valore: stesse chiavi e stessa lunghezza delle liste, a ogni livello
const shape = (v) =>
  Array.isArray(v)
    ? v.map(shape)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]))
      : typeof v;

describe("CV — contenuti italiano e inglese", () => {
  it("le due lingue hanno la stessa struttura", () => {
    expect(shape(cv.en)).toEqual(shape(cv.it));
  });

  it("ogni lingua ha il suo PDF e i link sono assoluti", () => {
    expect(cv.it.file).toBe("cv-fabio-coppini.pdf");
    expect(cv.en.file).toBe("cv-fabio-coppini-en.pdf");
    for (const d of Object.values(cv)) {
      d.contacts.forEach((c) => expect(c.href).toMatch(/^(https:\/\/|mailto:|tel:)/));
    }
  });

  it("il CV inglese rimanda al portfolio in inglese", () => {
    expect(cv.en.contacts.some((c) => c.href.endsWith("/portfolio/en/"))).toBe(true);
  });

  it("nessun link al codice aziendale di 01 Informatica", () => {
    expect(JSON.stringify(cv)).not.toMatch(/github\.com\/[^"]*j01modula/i);
  });
});
