/* Registers the service worker (offline support / installable PWA). */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Optional enhancement: the site works the same without it. */
    });
  });
}
