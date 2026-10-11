# Abdullhamid Fayad — Portfolio

Personal portfolio of Abdullhamid Fayad, Front-End Developer and Computer Engineering student.
Live: https://abdullhamid-fayad-portfolio.vercel.app

Static site (no build step). Vercel serves the folder as-is.

## Structure

```
index.html            portfolio (Arabic, RTL)
gallery.html          visual gallery (54 photos, native <dialog> lightbox)
assets/css/base.css   tokens, reset, typography, buttons — shared
assets/css/home.css   portfolio page
assets/css/gallery.css gallery page
assets/js/home.js     mobile menu, scroll-spy, scroll reveal
assets/js/gallery.js  lightbox (keyboard, swipe, deep links: gallery.html#12)
assets/js/sw-register.js
assets/images/        originals (photoN.jpg), thumb/ + full/ WebP derivatives
sw.js, manifest.json  PWA (offline support, installable)
scripts/optimize-images.py   regenerates the WebP derivatives
```

## Adding a photo

1. Put `photo55.jpg` in `assets/images/`.
2. `python3 scripts/optimize-images.py` (needs Pillow).
3. In `gallery.html` copy the last `<li>` in `.frames`, bump the numbers, write a short Arabic `alt`.
4. Update the count ("54") in `gallery.html`, and the `index.html` gallery teaser.
5. Bump `CACHE_NAME` in `sw.js` only if you add a file to its `PRECACHE` list.

## Notes

- Fonts: Noto Kufi Arabic + Plus Jakarta Sans from Google Fonts (one request, non-blocking).
- Icons are inline SVG — no icon font.
- Motion is limited to hover states and a gentle reveal on below-the-fold blocks; it is disabled
  under `prefers-reduced-motion`.
