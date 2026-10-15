/* gallery.js — fullscreen viewer for the photographs.
   Without JS every frame is still a plain link to its full-size image.

   - Native <dialog>: focus trap, Escape, top-layer and dialog semantics for free.
   - Keyboard: ← → (the viewer is always left-to-right), Home / End, Escape.
   - Touch: swipe left / right.
   - History: opening pushes #N so the back button closes the viewer;
     gallery.html#12 opens the twelfth photograph directly.
   - The visible UI shows only the photograph and its position; the alt text
     reaches screen readers through the live region, never as an overlay. */

(() => {
  "use strict";

  const frames = [...document.querySelectorAll(".frame")];
  const viewer = document.getElementById("viewer");
  if (!frames.length || !(viewer instanceof HTMLDialogElement)) return;

  const root = document.documentElement;
  const stage = viewer.querySelector(".viewer-stage");
  const image = document.getElementById("viewer-image");
  const current = document.getElementById("viewer-current");
  const original = document.getElementById("viewer-original");
  const status = document.getElementById("viewer-status");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pad = (n) => String(n).padStart(2, "0");
  const wrap = (i) => (i + frames.length) % frames.length;
  const altOf = (i) => frames[i].querySelector("img").alt;

  let index = 0;
  let token = 0;
  let opener = null;
  let pushed = false;

  document.getElementById("viewer-total").textContent = pad(frames.length);

  /* ---------- Showing a photograph ---------- */

  function preload(i) {
    const img = new Image();
    img.src = frames[wrap(i)].href;
  }

  function show(i) {
    index = wrap(i);
    const frame = frames[index];
    const src = frame.href;
    const mine = ++token;

    current.textContent = pad(index + 1);
    original.href = src.replace("/full/", "/").replace(/\.webp$/, ".jpg");
    status.textContent = `${index + 1} / ${frames.length} — ${altOf(index)}`;

    // Keep the old photograph until the next one is ready, then cross-fade.
    stage.setAttribute("data-loading", "");
    const next = new Image();
    const ready = () => {
      if (mine !== token) return;
      image.classList.add("is-loading");
      const swap = () => {
        image.src = src;
        image.alt = altOf(index);
        requestAnimationFrame(() => image.classList.remove("is-loading"));
        stage.removeAttribute("data-loading");
      };
      if (reduceMotion.matches || !image.getAttribute("src")) swap();
      else window.setTimeout(swap, 120);
    };
    next.onload = ready;
    next.onerror = ready;
    next.src = src;

    history.replaceState({ viewer: index + 1 }, "", `#${index + 1}`);
    preload(index + 1);
    preload(index - 1);
  }

  /* ---------- Open / close ---------- */

  function open(i, { fromHash = false } = {}) {
    opener = frames[wrap(i)];
    image.classList.add("is-loading");
    if (!viewer.open) {
      root.classList.add("viewer-open");
      viewer.showModal();
      if (!fromHash) {
        history.pushState({ viewer: wrap(i) + 1 }, "", `#${wrap(i) + 1}`);
        pushed = true;
      }
    }
    show(i);
  }

  function closeViewer() {
    if (viewer.open) viewer.close();
  }

  viewer.addEventListener("close", () => {
    root.classList.remove("viewer-open");
    token++;
    image.removeAttribute("src");
    stage.removeAttribute("data-loading");

    // Closed with the button / Escape / backdrop: step the history entry we pushed.
    if (location.hash) {
      if (pushed) {
        pushed = false;
        history.back();
      } else {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }

    // Return focus to the frame that is now showing (it may differ from the opener)
    const target = frames[index] || opener;
    target?.focus({ preventScroll: false });
  });

  window.addEventListener("popstate", () => {
    const wanted = Number.parseInt(location.hash.slice(1), 10);
    if (viewer.open && !(wanted >= 1 && wanted <= frames.length)) {
      pushed = false;
      viewer.close();
    } else if (!viewer.open && wanted >= 1 && wanted <= frames.length) {
      open(wanted - 1, { fromHash: true });
    } else if (viewer.open) {
      show(wanted - 1);
    }
  });

  frames.forEach((frame, i) => {
    frame.addEventListener("click", (event) => {
      // Let modified clicks (new tab, etc.) behave like normal links
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
      event.preventDefault();
      open(i);
    });
  });

  document.getElementById("viewer-close").addEventListener("click", closeViewer);
  document.getElementById("viewer-prev").addEventListener("click", () => show(index - 1));
  document.getElementById("viewer-next").addEventListener("click", () => show(index + 1));

  /* A click on the empty area closes — but only if the press also began there,
     so finishing a swipe or a text selection never closes it by accident. */
  let pressTarget = null;
  viewer.addEventListener("pointerdown", (event) => {
    pressTarget = event.target;
  });
  viewer.addEventListener("click", (event) => {
    const empty = event.target === viewer || event.target === stage;
    if (empty && pressTarget === event.target) closeViewer();
  });

  /* ---------- Keyboard ---------- */

  viewer.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        show(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        show(index - 1);
        break;
      case "Home":
        event.preventDefault();
        show(0);
        break;
      case "End":
        event.preventDefault();
        show(frames.length - 1);
        break;
      default:
    }
  });

  /* ---------- Swipe ---------- */

  let startX = null;
  let startY = null;

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return; // mouse users have buttons and keys
    startX = event.clientX;
    startY = event.clientY;
  });

  stage.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    startX = null;
    startY = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    show(index + (dx < 0 ? 1 : -1));
  });

  stage.addEventListener("pointercancel", () => {
    startX = null;
    startY = null;
  });

  /* ---------- Scroll reveal for the frames ---------- */

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll(".run > li").forEach((li) => {
      if (li.getBoundingClientRect().top <= window.innerHeight) return;
      const position = [...li.parentElement.children].indexOf(li);
      li.style.setProperty("--d", `${Math.min(position, 3) * 70}ms`);
      li.classList.add("is-pending");
      reveal.observe(li);
    });
  }

  /* ---------- Deep link: gallery.html#12 ---------- */

  const wanted = Number.parseInt(location.hash.slice(1), 10);
  if (wanted >= 1 && wanted <= frames.length) open(wanted - 1, { fromHash: true });
})();
