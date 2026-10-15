/* site.js — theme + language, shared by the portfolio and the gallery.
   Both preferences are stored once (localStorage) so the two pages always agree.
   The inline script in each <head> has already set data-theme / lang / dir
   before first paint; this file wires the buttons and does the text swap. */

(() => {
  "use strict";

  const root = document.documentElement;
  const dict = window.I18N || { ar: {}, en: {} };

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private mode: the preference just lasts for this visit */
      }
    },
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Language ---------- */

  const originals = new WeakMap(); // el -> { html, attrs: { name: arabic value } }

  function remember(el) {
    if (originals.has(el)) return originals.get(el);
    const entry = { html: el.tagName === "TITLE" ? el.textContent : el.innerHTML, attrs: {} };
    (el.dataset.i18nAttr || "").split(";").forEach((pair) => {
      const name = pair.split(":")[0].trim();
      if (name) entry.attrs[name] = el.getAttribute(name);
    });
    originals.set(el, entry);
    return entry;
  }

  // Capture the Arabic markup before anything is swapped.
  document.querySelectorAll("[data-i18n], [data-i18n-attr]").forEach(remember);

  function pick(lang, key, fallback) {
    const value = dict[lang]?.[key];
    return value === undefined ? fallback : value;
  }

  function applyLang(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const original = remember(el);
      const value = pick(lang, el.dataset.i18n, lang === "ar" ? original.html : undefined);
      if (value === undefined) return; // missing English key: keep what is there
      if (el.tagName === "TITLE") el.textContent = value;
      else el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const original = remember(el);
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [name, key] = pair.split(":").map((part) => part.trim());
        if (!name || !key) return;
        const value = pick(lang, key, lang === "ar" ? original.attrs[name] : undefined);
        if (value !== undefined) el.setAttribute(name, value);
      });
    });

    // The language button names the language you would switch TO, in that language.
    const label = document.querySelector("#lang-toggle [data-i18n]");
    if (label) label.lang = lang === "ar" ? "en" : "ar";

    syncThemeButton();
    root.classList.remove("i18n-wait");
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function setLang(lang, { animate = false } = {}) {
    applyLang(lang);
    storage.set("fayad-lang", lang);
    if (animate && !reduceMotion.matches) {
      root.classList.add("lang-anim");
      window.setTimeout(() => root.classList.remove("lang-anim"), 360);
    }
  }

  /* ---------- Theme ---------- */

  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncThemeButton() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const theme = root.dataset.theme;
    const key = theme === "dark" ? "ui.theme.toLight" : "ui.theme.toDark";
    button.setAttribute("aria-label", pick(root.lang, key, ""));
  }

  function setTheme(theme, { animate = false } = {}) {
    if (animate && !reduceMotion.matches) {
      root.classList.add("theme-anim");
      window.setTimeout(() => root.classList.remove("theme-anim"), 450);
    }
    root.dataset.theme = theme;
    if (themeMeta) {
      const colour = theme === "dark" ? themeMeta.dataset.dark : themeMeta.dataset.light;
      if (colour) themeMeta.content = colour;
    }
    storage.set("fayad-theme", theme);
    syncThemeButton();
  }

  /* ---------- Wiring ---------- */

  document.getElementById("lang-toggle")?.addEventListener("click", () => {
    setLang(root.lang === "ar" ? "en" : "ar", { animate: true });
  });

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", { animate: true });
  });

  // Follow the OS only while the visitor has not chosen for themselves.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (storage.get("fayad-theme")) return;
    root.dataset.theme = event.matches ? "dark" : "light";
    if (themeMeta) themeMeta.content = (event.matches ? themeMeta.dataset.dark : themeMeta.dataset.light) || themeMeta.content;
    syncThemeButton();
  });

  // Keep the two open tabs / pages in step.
  window.addEventListener("storage", (event) => {
    if (event.key === "fayad-lang" && (event.newValue === "ar" || event.newValue === "en")) applyLang(event.newValue);
    if (event.key === "fayad-theme" && (event.newValue === "light" || event.newValue === "dark")) {
      root.dataset.theme = event.newValue;
      syncThemeButton();
    }
  });

  // Initial state
  if (storage.get("fayad-lang") === "en") applyLang("en");
  else syncThemeButton();
  root.classList.remove("i18n-wait");
})();
