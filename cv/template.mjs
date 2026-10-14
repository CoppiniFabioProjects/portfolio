// Template HTML del CV (A4, una pagina). `fontsCss` contiene le @font-face con i
// font incorporati (Inter, JetBrains Mono, Fraunces), così il PDF non dipende
// da font di sistema né dalla rete.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const link = (l) => (l ? `<a class="link" href="${esc(l.href)}">${esc(l.label)}</a>` : "");
const bullets = (list) => (list.length ? `<ul>${list.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : "");

export function renderCv(d, fontsCss) {
  const L = d.labels;
  return `<!doctype html>
<html lang="${d.lang}">
<head>
<meta charset="utf-8" />
<title>${esc(d.title)}</title>
<style>
${fontsCss}
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  width: 210mm; height: 297mm; overflow: hidden;
  font-family: "Inter", sans-serif; font-size: 8pt; line-height: 1.38; color: #1f1d2b;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
a { color: inherit; text-decoration: none; }
.page { display: grid; grid-template-columns: 63mm 1fr; height: 297mm; }
/* min-height: 0 + overflow: le colonne non si allungano: se il testo non ci sta, si vede (e lo script se ne accorge) */
.side, main { min-height: 0; overflow: hidden; }

/* --- colonna laterale --- */
.side { background: #f6f5fb; border-right: 1px solid #e4e0f2; display: flex; flex-direction: column; }
.brand {
  background: linear-gradient(160deg, #0b0a14 0%, #1d1033 58%, #0c2a29 100%);
  color: #fff; padding: 11mm 7.5mm 7mm;
}
.brand h1 { margin: 0; font-weight: 700; font-size: 25pt; line-height: 0.95; letter-spacing: -0.02em; text-transform: uppercase; }
.brand h1 span { display: block; }
/* colore pieno, non gradiente: con background-clip:text il cognome finirebbe stampato come immagine e un ATS non lo leggerebbe */
.brand h1 .last { color: #c084fc; }
.brand .role { margin-top: 4mm; font-weight: 600; font-size: 10.5pt; }
.brand .stack { font-family: "JetBrains Mono", monospace; font-size: 7.6pt; color: #c4b5fd; margin-top: 0.6mm; }
.brand .sub { font-size: 7.6pt; color: #cbd5e1; margin-top: 2.2mm; line-height: 1.4; }
.brand .place { font-size: 7.6pt; color: #94a3b8; margin-top: 1.2mm; }
.brand .tag { font-family: "Fraunces", serif; font-size: 9.5pt; color: #e9d5ff; margin-top: 3mm; }

.side section { padding: 4.2mm 7.5mm 0; }
h2 {
  margin: 0 0 2.2mm; padding-bottom: 1.2mm; border-bottom: 1px solid #ddd6f3;
  font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 7pt;
  letter-spacing: 0.1em; text-transform: uppercase; color: #7e22ce;
}
.contacts { margin: 0; padding: 0; list-style: none; font-size: 7.4pt; }
.contacts li { margin-bottom: 1mm; }
.skill { margin-bottom: 1.6mm; }
.skill b { display: block; font-weight: 600; font-size: 7.6pt; margin-bottom: 0.9mm; }
.chip {
  display: inline-block; margin: 0 0.9mm 1mm 0; padding: 0.25mm 1.8mm;
  border: 1px solid #d9d3ef; border-radius: 99px; background: #fff; font-size: 6.9pt; color: #3f3b52;
}
.lang { display: flex; justify-content: space-between; font-size: 7.8pt; margin-bottom: 0.9mm; }
.lang em { font-style: normal; font-family: "JetBrains Mono", monospace; font-size: 7pt; color: #0f766e; }
.extra { margin: 0; padding: 0; list-style: none; font-size: 7.4pt; color: #4b4760; }
.extra li { margin-bottom: 0.8mm; }

/* --- colonna principale --- */
main { padding: 11mm 10mm 0 9mm; display: flex; flex-direction: column; }
.profile { font-size: 8.3pt; line-height: 1.48; color: #2c2a3a; margin: 0 0 3.6mm; }
main section { margin-bottom: 3mm; }
.item { margin-bottom: 2.2mm; }
.item header { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.item .title { font-weight: 600; font-size: 8.9pt; }
.item .org { color: #7e22ce; font-weight: 500; }
.item .note { color: #6b6880; font-weight: 400; font-size: 7.6pt; }
.period { font-family: "JetBrains Mono", monospace; font-size: 7pt; color: #6b6880; white-space: nowrap; }
.intro { margin: 0.6mm 0 0; color: #3a3749; }
.link { font-family: "JetBrains Mono", monospace; font-size: 7pt; color: #0f766e; }
ul { margin: 0.8mm 0 0; padding-left: 3.4mm; }
li { margin-bottom: 0.5mm; color: #3a3749; }
li::marker { color: #a855f7; }
.stackline { margin-top: 0.8mm; font-family: "JetBrains Mono", monospace; font-size: 6.9pt; color: #6b6880; }
.grade { font-weight: 600; color: #1f1d2b; }
.privacy { margin-top: auto; padding: 2mm 0 6mm; font-size: 6.2pt; color: #8a869c; }
</style>
</head>
<body>
<div class="page">
  <aside class="side">
    <div class="brand">
      <h1><span>${esc(d.name[0])}</span><span class="last">${esc(d.name[1])}</span></h1>
      <div class="role">${esc(d.role)}</div>
      <div class="stack">${esc(d.stack)}</div>
      <div class="sub">${esc(d.sub)}</div>
      <div class="place">${esc(d.place)}</div>
      <div class="tag">“${esc(d.tagline)}”</div>
    </div>

    <section>
      <h2>${esc(L.contacts)}</h2>
      <ul class="contacts">
        ${d.contacts.map((c) => `<li><a href="${esc(c.href)}">${esc(c.v).replace(".io/", ".io/<wbr>")}</a></li>`).join("")}
      </ul>
    </section>

    <section>
      <h2>${esc(L.skills)}</h2>
      ${d.skills.map((s) => `<div class="skill"><b>${esc(s.group)}</b>${s.items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>`).join("")}
    </section>

    <section>
      <h2>${esc(L.languages)}</h2>
      ${d.languages.map((l) => `<div class="lang"><span>${esc(l.name)}</span><em>${esc(l.level)}</em></div>`).join("")}
    </section>

    <section>
      <h2>${esc(L.extra)}</h2>
      <ul class="extra">${d.extra.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
    </section>
  </aside>

  <main>
    <p class="profile">${esc(d.profile)}</p>

    <section>
      <h2>${esc(L.experience)}</h2>
      ${d.experience.map((e) => `
      <div class="item">
        <header>
          <div><span class="title">${esc(e.role)}</span> · <span class="org">${esc(e.org)}</span></div>
          <span class="period">${esc(e.period)}</span>
        </header>
        <p class="intro">${esc(e.intro)} ${link(e.link)}</p>
        ${bullets(e.bullets)}
      </div>`).join("")}
    </section>

    <section>
      <h2>${esc(L.project)}</h2>
      <div class="item">
        <header>
          <div><span class="title">${esc(d.project.name)}</span> <span class="note">(${esc(d.project.note)})</span> · ${link(d.project.link)}</div>
          <span class="period">${esc(d.project.period)}</span>
        </header>
        <p class="intro">${esc(d.project.intro)}</p>
        ${bullets(d.project.bullets)}
        <div class="stackline">${esc(d.project.stack)}</div>
      </div>
    </section>

    <section>
      <h2>${esc(L.education)}</h2>
      ${d.education.map((e) => `
      <div class="item">
        <header>
          <div><span class="title">${esc(e.title)}</span> · <span class="org">${esc(e.org)}</span></div>
          <span class="period">${esc(e.period)}</span>
        </header>
        <p class="intro"><span class="grade">${esc(L.grade)} ${esc(e.grade)}.</span> ${esc(e.body)}</p>
      </div>`).join("")}
    </section>

    <p class="privacy">${esc(d.privacy)}</p>
  </main>
</div>
</body>
</html>`;
}
