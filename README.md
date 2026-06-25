# Caelus Industries — Landing Page Source

The languages used to build this landing page, separated into one file each.

## Files

| File | Language | What it does |
|------|----------|--------------|
| `index.html` | **HTML** | Page structure — the two stacked containers (space on top, ocean below), header, headline, contact, and the `<canvas>` + `<video>` elements. |
| `styles.css` | **CSS** | All visual styling — layout (flexbox), the colour palette, the Ojuju + monospace type, the gradient fades that blend space into ocean, and the pulsing "In Stealth" dot (`@keyframes`). |
| `logic.js` | **JavaScript** | All motion — the animated starfield on the canvas (with pointer parallax), and the ocean video: the two-layer cross-dissolve for a seamless loop plus the playback safeguards that stop the browser throttling muted video. |

So: **three languages — HTML, CSS, and JavaScript.**

## Adding the ocean video (required for the footage to show)

The page references the clip by a relative path:

```
uploads/ocean.mp4
```

GitHub Pages can only serve a file that is actually committed to the repo, and
GitHub **rejects any single file over 100 MB**. The original 4K clip is far too
large, so commit a **compressed, web-optimised** version instead (this also
makes playback smooth):

1. Make an `uploads/` folder next to `index.html`.
2. Compress your clip to 1080p (or 720p) MP4 and save it as `uploads/ocean.mp4`.
   With [ffmpeg](https://ffmpeg.org):

   ```
   # 1080p, well-compressed, web-streamable (usually a few MB)
   ffmpeg -i source-4k.mp4 -vf "scale=-2:1080" -c:v libx264 -crf 26 \
          -preset slow -movflags +faststart -an uploads/ocean.mp4
   ```

   Use `scale=-2:720` for an even smaller 720p file. `-an` drops the audio
   (the page plays it muted anyway).
3. Commit `uploads/ocean.mp4` along with the other files and push.

### Alternative: host the video elsewhere

If you'd rather not commit the file, upload it anywhere that serves a direct
`.mp4` URL (a GitHub *Release* asset, Cloudflare R2, S3, etc.) and point the
two `<video src="…">` tags in `index.html` at that URL.

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
