const CACHE = "formwheel-hub-v5-audit-20261022";
const APP_SHELL = [
  "/Formwheel/",
  "/Formwheel/index.html",
  "/Formwheel/profile.html",
  "/Formwheel/manifest.json",
  "/Formwheel/assets/styles.css",
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
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (url.pathname === "/Formwheel/" || url.pathname === "/Formwheel/index.html") {
        const home = await caches.match("/Formwheel/index.html");
        if (home) return home;
      }
      return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연결 확인 | Formwheel</title><h1>인터넷 연결을 확인해 주세요</h1><p>이 페이지는 아직 기기에 저장되지 않았어요. 연결 후 다시 시도해 주세요.</p><button onclick="location.reload()">다시 시도</button> <a href="/Formwheel/">허브로 이동</a></html>', {
        status: 503,
        headers: {"Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store"}
      });
    }));
  }
});
