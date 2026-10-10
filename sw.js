const CACHE = "formwheel-hub-v2-profile-20261010";
const APP_SHELL = [
  "/Formwheel/",
  "/Formwheel/index.html",
  "/Formwheel/profile.html",
  "/Formwheel/manifest.json",
  "/Formwheel/assets/styles.css",
  "/Formwheel/assets/home.css",
  "/Formwheel/assets/app.js",
  "/Formwheel/assets/home.js",
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
    }).catch(() => caches.match(request).then(cached => cached || caches.match("/Formwheel/index.html"))));
  }
});
