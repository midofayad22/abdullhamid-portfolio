/* gallery.js — lightbox for the contact sheet.
   Without JS every frame is still a plain link to its full-size image. */

(() => {
  "use strict";

  const frames = [...document.querySelectorAll(".frame")];
  const viewer = document.getElementById("viewer");
  if (!frames.length || !(viewer instanceof HTMLDialogElement)) return;

  const image = document.getElementById("viewer-image");
  const caption = document.getElementById("viewer-caption");
  const current = document.getElementById("viewer-current");
  const status = document.getElementById("viewer-status");
  const root = document.documentElement;

  const pad = (n) => String(n).padStart(2, "0");
  let index = 0;

  document.getElementById("viewer-total").textContent = pad(frames.length);

  const wrap = (i) => (i + frames.length) % frames.length;

  function preload(i) {
    new Image().src = frames[wrap(i)].href;
  }

  function show(i) {
    index = wrap(i);
    const frame = frames[index];
    const alt = frame.querySelector("img").alt;

    image.classList.add("is-loading");
    image.src = frame.href;
    image.alt = alt;
    caption.textContent = alt;
    current.textContent = pad(index + 1);
    status.textContent = `${index + 1} / ${frames.length} — ${alt}`;
    history.replaceState(null, "", `#${index + 1}`);

    preload(index + 1);
    preload(index - 1);
  }

  image.addEventListener("load", () => image.classList.remove("is-loading"));
  image.addEventListener("error", () => image.classList.remove("is-loading"));

  function open(i) {
    show(i);
    root.classList.add("viewer-open");
    if (!viewer.open) viewer.showModal();
  }

  frames.forEach((frame, i) => {
    frame.addEventListener("click", (event) => {
      event.preventDefault();
      open(i);
    });
  });

  viewer.addEventListener("close", () => {
    root.classList.remove("viewer-open");
    history.replaceState(null, "", location.pathname + location.search);
  });

  document.getElementById("viewer-close").addEventListener("click", () => viewer.close());
  document.getElementById("viewer-prev").addEventListener("click", () => show(index - 1));
  document.getElementById("viewer-next").addEventListener("click", () => show(index + 1));

  // A click on the empty dark area (not the image, caption or buttons) closes the viewer.
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target.classList.contains("viewer-stage")) viewer.close();
  });

  // The dialog is always left-to-right, so → is "next" and ← is "previous".
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") show(index + 1);
    else if (event.key === "ArrowLeft") show(index - 1);
  });

  // Swipe
  let startX = null;
  image.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  image.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 45) return;
    show(index + (dx < 0 ? 1 : -1));
  });
  image.addEventListener("pointercancel", () => {
    startX = null;
  });

  // Deep link: gallery.html#12 opens the twelfth frame.
  const wanted = Number.parseInt(location.hash.slice(1), 10);
  if (wanted >= 1 && wanted <= frames.length) open(wanted - 1);
})();
