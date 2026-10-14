// Lingua della pagina: la decide l'HTML che carica l'app
// (index.html → <html lang="it">, en/index.html → <html lang="en">).
export const lang =
  typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "it";

// Indirizzi delle due versioni del sito
export const HOME = { it: "/portfolio/", en: "/portfolio/en/" };
export const SITE = {
  it: "https://coppinifabioprojects.github.io/portfolio/",
  en: "https://coppinifabioprojects.github.io/portfolio/en/",
};
