# Abdullhamid Fayad — Portfolio

Personal portfolio of Abdullhamid Fayad — Front-End Developer, photographer and Computer Engineering student.
Live: https://abdullhamid-fayad-portfolio.vercel.app

Static site (no build step). Vercel serves the folder as-is.

## Design: "Horizon Line"

The horizon is the line that holds a photograph together and the line a layout hangs from. Deep field-teal is
the ground, gold is the sun, thin wires and rules connect code and light. The portfolio and the gallery share
the brand (type, gold/teal, motion) but have their own atmosphere: the portfolio is a warm paper / night-field
page; the gallery is a neutral exhibition room (gallery wall / near-black) so the photographs carry all colour.

- Type: Fraunces (Latin display), Plus Jakarta Sans (Latin UI), IBM Plex Sans Arabic (Arabic), system mono for labels.
- Themes: light "Dawn paper" and dark "Night field", set with `<html data-theme>`. All colours are tokens in `base.css`.
- Languages: Arabic (default, RTL) and English (LTR). Everything directional uses CSS logical properties.
- Motion: one set of durations/easings (`--t-1…--t-4`, `--ease`); transform/opacity only; fully off under
  `prefers-reduced-motion`.

## Structure

```
index.html              portfolio (Arabic is the source markup; English is swapped in by JS)
gallery.html            photography gallery (54 photos, native <dialog> viewer)
assets/css/base.css     tokens (both themes), reset, type, buttons, header controls — shared
assets/css/home.css     portfolio page
assets/css/gallery.css  gallery page + viewer
assets/js/i18n.js       English strings (data-i18n keys) + English alt text for every photograph
assets/js/site.js       theme + language switching, shared by both pages (localStorage)
assets/js/home.js       mobile menu, header state, scroll-spy, scroll reveal
assets/js/gallery.js    viewer (keyboard, swipe, history, deep links: gallery.html#12), frame reveal
assets/js/sw-register.js
assets/images/          originals (photoN.jpg), thumb/ + full/ WebP derivatives
icons/                  favicon.svg (A monogram + horizon bar) and PNG sizes (?v=2 busts old caches)
sw.js, manifest.json    PWA (offline support, installable)
scripts/optimize-images.py   regenerates the WebP derivatives
```

## Language & theme

- Arabic text lives in the HTML (that is what search engines and no-JS visitors get). Each translatable element
  has `data-i18n="key"` (or `data-i18n-attr="alt:key;aria-label:key"`); `site.js` remembers the Arabic markup and
  swaps in `window.I18N.en[key]`. Missing English keys leave the Arabic in place.
- A tiny inline script in each `<head>` sets `data-theme`, `lang` and `dir` before first paint (no flash).
- Preferences are stored as `fayad-theme` / `fayad-lang` and shared by both pages.
- Note: the language switch is client-side. There are no separate indexable English URLs, so no `hreflang` is emitted.

## Adding a photo

1. Put `photo55.jpg` in `assets/images/`.
2. `python3 scripts/optimize-images.py` (needs Pillow).
3. In `gallery.html` add a `<li><a class="frame">…</a></li>` to the run you want (copy any existing one, bump the
   number, write an accurate Arabic `alt` and a `data-i18n-attr="alt:a55"` key).
4. Add `"a55"` with the English alt text to `assets/js/i18n.js`.
5. Update the count ("54") in `gallery.html`, `index.html`, `og`/meta descriptions and `i18n.js`.
6. Bump `CACHE_NAME` in `sw.js` only if you add a file to its `PRECACHE` list.

Gallery runs (`.run--a/b/c/d`) are laid out in `gallery.css`; photographs are never cropped differently from their
3:4 originals — variety comes from scale and rhythm.

## Notes

- Fonts load from Google Fonts in one non-blocking request.
- Icons are an inline SVG sprite (UI icons + brand marks for GitHub, LinkedIn, Instagram, YouTube, TikTok, WhatsApp).
- The gallery shows no captions over or under photographs; alt text is for assistive technology only.
- Project "plates" in the portfolio are typographic previews built from each project's real wording — they are
  not screenshots. Replace them with real screenshots when you have them.
