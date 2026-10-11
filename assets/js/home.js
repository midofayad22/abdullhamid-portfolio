/* home.js — mobile menu, active-section highlight, scroll reveal.
   Everything here is an enhancement: the page is fully usable without it. */

(() => {
  "use strict";

  const button = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 56rem)");

  /* ---------- Mobile menu ---------- */

  function setMenu(open, restoreFocus = false) {
    if (!button || !nav) return;
    button.setAttribute("aria-expanded", String(open));
    nav.toggleAttribute("data-open", open);
    if (!open && restoreFocus) button.focus();
  }

  const menuIsOpen = () => nav?.hasAttribute("data-open");

  button?.addEventListener("click", () => setMenu(!menuIsOpen()));

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen()) setMenu(false, true);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!menuIsOpen() || !(event.target instanceof Node)) return;
    if (!nav.contains(event.target) && !button.contains(event.target)) setMenu(false);
  });

  desktop.addEventListener("change", () => {
    if (desktop.matches) setMenu(false);
  });

  /* ---------- Active section in the nav ---------- */

  if (nav && "IntersectionObserver" in window) {
    // Sections that have no nav item of their own highlight their neighbour.
    const alias = { education: "about", approach: "capabilities" };

    const links = new Map(
      [...nav.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute("href").slice(1), a])
    );

    const setCurrent = (id) => {
      const target = alias[id] ?? id;
      links.forEach((link, key) => {
        if (key === target) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    document.querySelectorAll("main > section[id]").forEach((section) => spy.observe(section));
  }

  /* ---------- Scroll reveal ----------
     Only blocks that start below the fold are hidden (never anything the
     visitor can already see), and never when reduced motion is requested. */

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-pending");
          reveal.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    document
      .querySelectorAll(".section-head, .project, .cap, .steps li, .strip, .cta, .channels li")
      .forEach((el) => {
        if (el.getBoundingClientRect().top <= window.innerHeight) return;
        el.classList.add("reveal-ready", "is-pending");
        reveal.observe(el);
      });
  }
})();
