/* =========================================================
   FAYAD PORTFOLIO — SERVICE WORKER
   Fast / Safe / Cache-aware PWA
========================================================= */

"use strict";

/* =========================================================
   CACHE VERSION
========================================================= */

const CACHE_NAME = "fayad-portfolio-v3";

/* =========================================================
   STATIC ASSETS
========================================================= */

/*
   IMPORTANT:
   Every file listed here MUST actually exist.

   Current icon files:
   - icon-32.png
   - icon-180.png
   - icon-192.png
   - favicon.svg

   If you do NOT have icon-512.png,
   do NOT put it here.
*/

const STATIC_ASSETS = [
  "/",

  "/index.html",

  "/style.css",

  "/script.js",

  "/gallery.html",

  "/manifest.json",

  "/profile.jpg",

  "/icons/favicon.svg",

  "/icons/icon-32.png",

  "/icons/icon-180.png",

  "/icons/icon-192.png",
];

/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  /*
       Activate the new service worker
       immediately.
    */

  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    }),
  );

  /*
       Take control of open pages.
    */

  self.clients.claim();
});

/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  /*
       Only handle GET requests.
    */

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
       Ignore external resources.

       This means Google Fonts,
       Font Awesome CDN, analytics, etc.
       are handled normally by the browser.
    */

  if (url.origin !== self.location.origin) {
    return;
  }

  /* =====================================================
       HTML NAVIGATION
    ===================================================== */

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          /*
                 Save fresh HTML.
              */

          const cloned = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });

          return response;
        })

        .catch(() => {
          /*
                 Offline fallback.
              */

          return caches.match("/index.html");
        }),
    );

    return;
  }

  /* =====================================================
       STATIC FILES
    ===================================================== */

  event.respondWith(
    caches
      .match(request)

      .then((cachedResponse) => {
        /*
               If cached, use it immediately.
            */

        if (cachedResponse) {
          return cachedResponse;
        }

        /*
               Otherwise request it
               from the network.
            */

        return fetch(request).then((response) => {
          /*
                     Don't cache failed
                     responses.
                  */

          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const cloned = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });

          return response;
        });
      }),
  );
});
