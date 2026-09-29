/* =========================================================
   FAYAD PORTFOLIO — SERVICE WORKER
   Fast / Safe / Update-aware / Cache-aware PWA
========================================================= */

"use strict";

/* =========================================================
   CACHE VERSION
========================================================= */

/*
   Increase this version whenever the Service Worker itself
   changes significantly.

   Old caches are automatically removed during activation.
*/

const CACHE_NAME = "fayad-portfolio-v4";

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
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((error) => {
        console.error(
          "[Service Worker] Failed to cache static assets:",
          error,
        );
      }),
  );

  /*
     Activate the new Service Worker immediately.
  */

  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
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

     Google Fonts, Font Awesome, analytics, etc.
     remain under normal browser/network handling.
  */

  if (url.origin !== self.location.origin) {
    return;
  }

  /* =======================================================
     HTML NAVIGATION
  ======================================================= */

  /*
     NETWORK FIRST

     Always try to get the newest HTML from the server.

     If the network fails, use the cached version.
  */

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clonedResponse = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, clonedResponse);
              })
              .catch(() => {});

            return response;
          }

          throw new Error("Network response was not OK.");
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/index.html");
          });
        }),
    );

    return;
  }

  /* =======================================================
     CSS / JS / MANIFEST
  ======================================================= */

  /*
     NETWORK FIRST

     These files change frequently during development.

     This prevents an old CSS or JavaScript file from
     being returned simply because it already exists
     in the cache.
  */

  const isCSS = request.destination === "style";
  const isJS = request.destination === "script";
  const isManifest = request.destination === "manifest";

  if (isCSS || isJS || isManifest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clonedResponse = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, clonedResponse);
              })
              .catch(() => {});
          }

          return response;
        })
        .catch(() => {
          return caches.match(request);
        }),
    );

    return;
  }

  /* =======================================================
     IMAGES / ICONS / OTHER STATIC FILES
  ======================================================= */

  /*
     CACHE FIRST

     Images and icons usually do not need to be downloaded
     every time.

     If they are cached, use them immediately.

     If they are not cached, download and store them.
  */

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        /*
           Don't cache failed responses.
        */

        if (
          !response ||
          response.status !== 200 ||
          response.type === "opaque"
        ) {
          return response;
        }

        const clonedResponse = response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, clonedResponse);
          })
          .catch(() => {});

        return response;
      });
    }),
  );
});