const CACHE = "formwheel-hub-v7-offline-ping-20261029";
const APP_SHELL = [
  "/Formwheel/",
  "/Formwheel/index.html",
  "/Formwheel/offline.html",
  "/Formwheel/profile.html",
  "/Formwheel/manifest.json",
  "/Formwheel/assets/styles.css",
  "/Formwheel/assets/app.js",
  "/Formwheel/assets/hub-visit-bridge.js",
  "/Formwheel/assets/home.css",
  "/Formwheel/assets/home.js",
  "/Formwheel/assets/spotlight.js",
  "/Formwheel/assets/random-match.js",
  "/Formwheel/assets/id-core.js",
  "/Formwheel/assets/profile.js",
  "/Formwheel/assets/formwheel-favicon.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("formwheel-hub-") && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/Formwheel/")) return;
  // Network first keeps deployed assets fresh; cache fallback makes saved pages usable offline.
  // Restrict this to static assets; never cache Firebase/API responses.
  if (request.mode !== "navigate" && /^\/Formwheel\/(assets|shared)\/.+\.(js|css|svg|png|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE).catch(() => null);
      try {
        const response = await fetch(request);
        if (response.ok && cache) {
          const copy = response.clone();
          event.waitUntil(cache.put(request, copy).catch(() => {}));
        }
        return response;
      } catch (error) {
        const cached = cache && (await cache.match(request) ||
          (APP_SHELL.includes(url.pathname) ? await cache.match(url.pathname) : undefined));
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy).catch(() => {})));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (url.pathname === "/Formwheel/" || url.pathname === "/Formwheel/index.html") {
        const home = await caches.match("/Formwheel/index.html");
        if (home) return home;
      }
      const offline = await caches.match('/Formwheel/offline.html');
      if (offline) return offline;
      return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연결 확인 | Formwheel</title><h1>인터넷 연결을 확인해 주세요</h1><p>이 페이지는 아직 기기에 저장되지 않았어요. 연결 후 다시 시도해 주세요.</p><button onclick="location.reload()">다시 시도</button> <a href="/Formwheel/">허브로 이동</a></html>', {
        status: 503,
        headers: {"Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store"}
      });
    }));
  }
});
