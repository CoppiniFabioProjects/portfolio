// Service Worker — portfolio Fabio Coppini
// Strategia: network-first per la navigazione (gli aggiornamenti vincono sempre),
// cache-first per gli asset immutabili (hashati da Vite). Fallback offline.
const CACHE = "fc-portfolio-v2";
const BASE = "/portfolio/";
const EN = BASE + "en/";
const CORE = [
  BASE,
  EN,
  BASE + "garuda.png",
  BASE + "manifest.webmanifest",
  BASE + "fabio-portrait.webp",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Navigazione (HTML): network-first, fallback cache/offline.
  // Ogni lingua ha la sua pagina: la salvo col suo indirizzo (senza #ancora né ?query).
  if (req.mode === "navigate") {
    const url = new URL(req.url);
    const page = /^\/portfolio\/en(\/|$)/.test(url.pathname) ? EN : BASE;
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && url.pathname === page) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(page, copy));
          }
          return res;
        })
        .catch(() => caches.match(page).then((r) => r || caches.match(BASE)))
    );
    return;
  }

  // Asset: cache-first con aggiornamento in background
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
