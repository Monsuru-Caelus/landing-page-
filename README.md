# Caelus Industries — Landing Page Source

The languages used to build this landing page, separated into one file each.

## Files

| File | Language | What it does |
|------|----------|--------------|
| `index.html` | **HTML** | Page structure — the two stacked containers (space on top, ocean below), header, headline, contact, and the `<canvas>` + `<video>` elements. |
| `styles.css` | **CSS** | All visual styling — layout (flexbox), the colour palette, the Ojuju + monospace type, the gradient fades that blend space into ocean, and the pulsing "In Stealth" dot (`@keyframes`). |
| `logic.js` | **JavaScript** | All motion — the animated starfield on the canvas (with pointer parallax), and the ocean video: the two-layer cross-dissolve for a seamless loop plus the playback safeguards that stop the browser throttling muted video. |

So: **three languages — HTML, CSS, and JavaScript.**

## Asset (not included)

The ocean footage is **not bundled here** — the 4K file is too large to zip.
`index.html` references it at:

```
uploads/7031309_Close_up_Slow_Motion_3840x2160.mp4
```

Create an `uploads/` folder next to `index.html` and drop your clip in with
that name (or drag any video file onto the running page to swap it live).

## Running it

Open `index.html` in a browser. Because it loads a video file, serve the
folder over a local web server rather than opening the file directly, e.g.

```
python3 -m http.server
```

then visit `http://localhost:8000`.

## Notes

- The Ojuju typeface loads from Google Fonts (needs an internet connection).
- `index.html` here is a clean, framework-free version of the design for
  readability. The live editable version in the project is a single
  self-contained Design Component (`CAELUS Industries.dc.html`) that bundles
  the same HTML, CSS, and JavaScript together.
