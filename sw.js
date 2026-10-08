const CACHE = "formwheel-hub-v1";
const APP_SHELL = ["/Formwheel/", "/Formwheel/index.html", "/Formwheel/manifest.json", "/Formwheel/assets/formwheel-favicon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.mode !== "navigate" || request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/Formwheel/")) return;
  event.respondWith(fetch(request).catch(() => caches.match(request).then(cached => cached || caches.match("/Formwheel/"))));
});
