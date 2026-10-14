import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as itContent from "./content.it.js";
import * as enContent from "./content.en.js";
import { uiDict } from "./ui.js";

// "Forma" di un valore: stesse chiavi e stessa lunghezza delle liste, a ogni livello
const shape = (v) =>
  Array.isArray(v)
    ? v.map(shape)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]))
      : typeof v;

// Tutti i link (http, mailto, tel, /portfolio/…) contenuti in un valore
const links = (v) =>
  JSON.stringify(v).match(/"(https?:\/\/|mailto:|tel:|\/portfolio\/)[^"]*"/g) ?? [];

describe("versione inglese — stessa struttura dell'italiano", () => {
  it("content.en.js esporta le stesse sezioni di content.it.js", () => {
    expect(Object.keys(enContent).sort()).toEqual(Object.keys(itContent).sort());
  });

  it.each(Object.keys(itContent))("la sezione %s ha la stessa forma nelle due lingue", (key) => {
    expect(shape(enContent[key])).toEqual(shape(itContent[key]));
  });

  it("i link sono gli stessi nelle due lingue (si traduce il testo, non le destinazioni)", () => {
    expect(links(enContent)).toEqual(links(itContent));
  });

  it("il dizionario dell'interfaccia ha la stessa forma nelle due lingue", () => {
    expect(shape(uiDict.en)).toEqual(shape(uiDict.it));
  });

  it("ogni lingua scarica il suo CV, e il PDF esiste", () => {
    expect(uiDict.it.cv.href).toBe("/portfolio/cv-fabio-coppini.pdf");
    expect(uiDict.en.cv.href).toBe("/portfolio/cv-fabio-coppini-en.pdf");
    for (const d of Object.values(uiDict)) {
      expect(existsSync(resolve("public", d.cv.href.replace("/portfolio/", "")))).toBe(true);
    }
  });

  it("il selettore di lingua punta all'altra versione", () => {
    expect(uiDict.it.langSwitch.label).toBe("EN");
    expect(uiDict.en.langSwitch.label).toBe("IT");
    expect(uiDict.en.contact.siteUrl).toMatch(/\/portfolio\/en\/$/);
  });
});
