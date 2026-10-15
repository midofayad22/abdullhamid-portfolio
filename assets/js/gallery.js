/* gallery.js — the photography gallery: card loading states, card reveal +
   tilt, the ambient colour that follows the photograph in view, and the
   fullscreen viewer.

   Everything here is an enhancement. Without JS every card is a plain link to
   the full-size image and every thumbnail is visible.

   Viewer: native <dialog> (focus trap, Escape, dialog semantics).
   - ← → Home End, Escape; swipe on touch; Back button closes it.
   - Opening pushes #N (N = the photograph's own number), so gallery.html#12
     opens photograph 12 and a shared link keeps working.
   - The cached thumbnail shows instantly, the full file replaces it when ready.
   - The visible UI shows the photograph and its position only; the alt text
     goes to screen readers through the live region, never as an overlay. */

(() => {
  "use strict";

  const root = document.documentElement;
  const grid = document.querySelector(".runs");
  const viewer = document.getElementById("viewer");
  const cards = grid ? [...grid.querySelectorAll(".card")] : [];
  if (!cards.length || !(viewer instanceof HTMLDialogElement)) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const pad = (n) => String(n).padStart(2, "0");
  const t = (key, vars = {}) => {
    const lang = root.lang === "en" ? "en" : "ar";
    const text = window.I18N?.[lang]?.[key] ?? "";
    return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  };

  /* Slow or data-saving connections: do not preload neighbouring photographs */
  const connection = navigator.connection;
  const saveData = () => Boolean(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "")));

  /* ==================== Loading states ==================== */

  function markLoaded(media) {
    media.classList.remove("is-error");
    media.classList.add("is-loaded");
    media.querySelector(".card-err")?.remove();
  }

  function markError(media, img) {
    const tries = Number(img.dataset.tries || 0);
    if (tries < 2) {
      // Quiet retry with a short back-off (flaky mobile connections)
      img.dataset.tries = String(tries + 1);
      window.setTimeout(() => {
        const url = new URL(img.currentSrc || img.src, location.href);
        url.searchParams.set("r", String(Date.now()));
        img.removeAttribute("srcset");
        img.src = url.pathname + url.search;
      }, 1200 * (tries + 1));
      return;
    }
    media.classList.add("is-error");
    if (!media.querySelector(".card-err")) {
      const note = document.createElement("span");
      note.className = "card-err";
      note.textContent = t("g.imgerror");
      media.append(note);
    }
  }

  cards.forEach((card) => {
    const media = card.querySelector(".card-media");
    const img = media.querySelector("img");
    img.addEventListener("load", () => markLoaded(media));
    img.addEventListener("error", () => markError(media, img));
    if (img.complete) {
      if (img.naturalWidth) markLoaded(media);
      else markError(media, img);
    }
  });

  const list = cards; // every photograph, in order (there are no categories)

  /* ==================== Ambient colour ==================== */

  const setAmbient = (card) => {
    if (!card) {
      root.style.removeProperty("--amb1");
      root.style.removeProperty("--amb2");
      return;
    }
    root.style.setProperty("--amb1", card.style.getPropertyValue("--c1"));
    root.style.setProperty("--amb2", card.style.getPropertyValue("--c2"));
  };

  /* The card nearest the middle of the screen sets the mood; on a mouse, the hovered card wins */
  let hovered = null;
  let ambFrame = 0;
  const nearestCard = () => {
    const mid = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;
    cards.forEach((card) => {
      const box = card.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const dist = Math.abs(box.top + box.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    return best;
  };
  const updateAmbient = () => {
    ambFrame = 0;
    if (viewer.open) return;
    const wall = grid.getBoundingClientRect();
    const onWall = wall.top < window.innerHeight * 0.55 && wall.bottom > window.innerHeight * 0.3;
    setAmbient(hovered || (onWall ? nearestCard() : null));
  };
  const queueAmbient = () => {
    if (!ambFrame) ambFrame = requestAnimationFrame(updateAmbient);
  };
  window.addEventListener("scroll", queueAmbient, { passive: true });
  window.addEventListener("resize", queueAmbient);
  if (canHover.matches) {
    grid.addEventListener("pointerover", (event) => {
      hovered = event.target instanceof Element ? event.target.closest(".card") : null;
      queueAmbient();
    });
    grid.addEventListener("pointerleave", () => {
      hovered = null;
      queueAmbient();
    });
  }
  grid.addEventListener("focusin", (event) => {
    hovered = event.target instanceof Element ? event.target.closest(".card") : null;
    queueAmbient();
  });
  grid.addEventListener("focusout", () => {
    hovered = null;
    queueAmbient();
  });
  updateAmbient();

  /* ==================== Card reveal ==================== */

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

    cards.forEach((card) => {
      if (card.getBoundingClientRect().top <= window.innerHeight) return;
      const col = [...card.parentElement.children].indexOf(card) % 4;
      card.style.setProperty("--d", `${col * 90}ms`);
      card.classList.add("is-pending");
      reveal.observe(card);
    });
  }

  /* ==================== Tilt (mouse only, a few degrees) ==================== */

  if (canHover.matches && !reduceMotion.matches) {
    let frame = 0;
    grid.addEventListener("pointermove", (event) => {
      const link = event.target instanceof Element ? event.target.closest(".card-link") : null;
      if (!link) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = link.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        link.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
        link.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        const media = link.querySelector(".card-media");
        media.style.setProperty("--px", `${(-x * 10).toFixed(1)}px`);
        media.style.setProperty("--py", `${(-y * 10).toFixed(1)}px`);
      });
    });
    grid.addEventListener("pointerout", (event) => {
      const link = event.target instanceof Element ? event.target.closest(".card-link") : null;
      if (!link || link.contains(event.relatedTarget)) return;
      cancelAnimationFrame(frame);
      link.style.removeProperty("--rx");
      link.style.removeProperty("--ry");
      const media = link.querySelector(".card-media");
      media.style.removeProperty("--px");
      media.style.removeProperty("--py");
    });
  }

  /* ==================== Hero: count-up + idle pause ==================== */

  const counter = document.getElementById("g-count");
  if (counter && !reduceMotion.matches) {
    const to = Number(counter.dataset.to) || cards.length;
    const start = performance.now() + 450;
    const duration = 1300;
    counter.textContent = "0";
    const tick = (now) => {
      const p = Math.min(Math.max((now - start) / duration, 0), 1);
      counter.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const hero = document.querySelector(".g-hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      hero.toggleAttribute("data-idle", !entry.isIntersecting);
    }).observe(hero);
  }

  /* ==================== Viewer ==================== */

  const stage = viewer.querySelector(".viewer-stage");
  const image = document.getElementById("viewer-image");
  const current = document.getElementById("viewer-current");
  const total = document.getElementById("viewer-total");
  const download = document.getElementById("viewer-download");
  const status = document.getElementById("viewer-status");
  const errorBox = document.getElementById("viewer-error");
  const toast = document.getElementById("viewer-toast");

  const linkOf = (card) => card.querySelector(".card-link");
  const altOf = (card) => card.querySelector("img").alt;
  const wrap = (i) => (i + list.length) % list.length;

  let pos = 0;
  let token = 0;
  let bust = "";
  let pushed = false;
  let toastTimer = 0;

  function preload(i) {
    if (saveData()) return;
    const img = new Image();
    img.src = linkOf(list[wrap(i)]).href;
  }

  function show(i, dir = 0) {
    pos = wrap(i);
    const card = list[pos];
    const link = linkOf(card);
    const n = Number(card.dataset.n);
    const mine = ++token;

    current.textContent = pad(pos + 1);
    total.textContent = pad(list.length);
    download.href = link.dataset.orig;
    download.setAttribute("download", `fayad-photo-${pad(n)}.jpg`);
    status.textContent = `${pos + 1} / ${list.length} — ${altOf(card)}`;
    errorBox.hidden = true;
    setAmbient(card);

    // Soft preview straight away (the thumbnail is already cached), then the real file
    const full = link.getAttribute("href") + bust;
    image.classList.add("is-low");
    image.alt = altOf(card);
    image.src = link.getAttribute("href").replace("/full/", "/thumb/");
    if (dir && !reduceMotion.matches) {
      image.animate(
        [{ opacity: 0, transform: `translateX(${dir * 28}px)` }, { opacity: 1, transform: "none" }],
        { duration: 340, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
      );
    }

    stage.setAttribute("data-loading", "");
    const big = new Image();
    big.onload = () => {
      if (mine !== token) return;
      image.src = full;
      image.classList.remove("is-low");
      stage.removeAttribute("data-loading");
    };
    big.onerror = () => {
      if (mine !== token) return;
      stage.removeAttribute("data-loading");
      errorBox.hidden = false;
    };
    big.src = full;

    history.replaceState({ viewer: n }, "", `#${n}`);
    preload(pos + 1);
    preload(pos - 1);
  }

  function openAt(index, { fromHash = false } = {}) {
    if (!viewer.open) {
      root.classList.add("viewer-open");
      viewer.showModal();
      if (!fromHash) {
        history.pushState({ viewer: Number(list[index].dataset.n) }, "", `#${list[index].dataset.n}`);
        pushed = true;
      }
    }
    show(index);
  }

  function openByNumber(n, opts) {
    const index = list.findIndex((card) => Number(card.dataset.n) === n);
    if (index >= 0) openAt(index, opts);
  }

  viewer.addEventListener("close", () => {
    root.classList.remove("viewer-open");
    token++;
    bust = "";
    image.removeAttribute("src");
    stage.removeAttribute("data-loading");

    if (location.hash) {
      if (pushed) {
        pushed = false;
        history.back();
      } else {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }
    linkOf(list[pos] || cards[0])?.focus();
    hovered = null;
    queueAmbient();
  });

  window.addEventListener("popstate", () => {
    const wanted = Number.parseInt(location.hash.slice(1), 10);
    const valid = wanted >= 1 && wanted <= cards.length;
    if (viewer.open && !valid) {
      pushed = false;
      viewer.close();
    } else if (!viewer.open && valid) {
      openByNumber(wanted, { fromHash: true });
    } else if (viewer.open) {
      const index = list.findIndex((card) => Number(card.dataset.n) === wanted);
      if (index >= 0) show(index);
    }
  });

  cards.forEach((card) => {
    linkOf(card).addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
      event.preventDefault();
      openAt(list.indexOf(card));
    });
  });

  const next = () => show(pos + 1, 1);
  const prev = () => show(pos - 1, -1);

  document.getElementById("viewer-close").addEventListener("click", () => viewer.close());
  document.getElementById("viewer-prev").addEventListener("click", prev);
  document.getElementById("viewer-next").addEventListener("click", next);
  document.getElementById("viewer-retry").addEventListener("click", () => {
    bust = `?r=${Date.now()}`;
    show(pos);
  });

  download.addEventListener("click", () => {
    toast.textContent = t("viewer.downloading");
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  });

  /* A click on the empty area closes — only if the press also began there, so
     finishing a swipe or a text selection never closes it by accident. */
  let pressTarget = null;
  viewer.addEventListener("pointerdown", (event) => {
    pressTarget = event.target;
  });
  viewer.addEventListener("click", (event) => {
    const emptyArea = event.target === viewer || event.target === stage;
    if (emptyArea && pressTarget === event.target) viewer.close();
  });

  viewer.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    // The viewer is always left-to-right: → is next, ← is previous.
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0, -1);
    } else if (event.key === "End") {
      event.preventDefault();
      show(list.length - 1, 1);
    }
  });

  let startX = null;
  let startY = null;
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
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
    if (dx < 0) next();
    else prev();
  });
  stage.addEventListener("pointercancel", () => {
    startX = null;
    startY = null;
  });

  /* ---------- Deep link: gallery.html#12 ---------- */

  const wanted = Number.parseInt(location.hash.slice(1), 10);
  if (wanted >= 1 && wanted <= cards.length) openByNumber(wanted, { fromHash: true });
})();
