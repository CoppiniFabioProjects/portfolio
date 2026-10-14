// Contenuti nella lingua della pagina: italiano (content.it.js) o inglese (content.en.js).
// I componenti importano sempre da qui.
import * as it from "./content.it.js";
import * as en from "./content.en.js";
import { lang } from "../i18n";

const c = lang === "en" ? en : it;

export const {
  profile, nav, vetrina, tech, linux, timeline, flagship, projects, interests,
} = c;
