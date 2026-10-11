/* FAYAD portfolio — service worker
   - HTML, CSS, JS and the manifest: network first, cached copy when offline
   - images, icons and everything else same-origin: cache first
   Bump CACHE_NAME whenever the list below changes; old caches are removed on activate. */

"use strict";

const CACHE_NAME = "fayad-portfolio-v6";

/* Every file listed here must exist, or install fails. */
const PRECACHE = [
  "/",
  "/gallery.html",
  "/manifest.json",
  "/assets/css/base.css",
  "/assets/css/home.css",
  "/assets/css/gallery.css",
  "/assets/js/home.js",
  "/assets/js/gallery.js",
  "/assets/js/sw-register.js",
  "/assets/images/profile-640.webp",
  "/assets/images/profile-960.webp",
  "/icons/favicon.svg",
  "/icons/icon-32.png",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch((error) => console.error("[sw] precache failed:", error))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

function store(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") return;
  const copy = response.clone();
  caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, copy))
    .catch(() => {});
}

function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      store(request, response);
      return response;
    })
    .catch(() =>
      caches.match(request).then((hit) => hit || (fallbackUrl ? caches.match(fallbackUrl) : Response.error()))
    );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Vercel's own endpoints (analytics) must never be served from cache.
  if (url.pathname.startsWith("/_vercel/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/"));
    return;
  }

  if (["style", "script", "manifest"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          store(request, response);
          return response;
        })
    )
  );
});
