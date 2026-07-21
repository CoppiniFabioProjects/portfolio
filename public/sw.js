// Service Worker — portfolio Fabio Coppini
// Strategia: network-first per la navigazione (gli aggiornamenti vincono sempre),
// cache-first per gli asset immutabili (hashati da Vite). Fallback offline.
const CACHE = "fc-portfolio-v1";
const BASE = "/portfolio/";
const CORE = [
  BASE,
  BASE + "index.html",
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

  // Navigazione (HTML): network-first, fallback cache/offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(BASE + "index.html", copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(BASE + "index.html")))
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
