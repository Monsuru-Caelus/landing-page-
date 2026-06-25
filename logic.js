/* =========================================================
   CAELUS INDUSTRIES — Landing page logic (vanilla JS)

   Three jobs:
     1. STARFIELD  — animated particle field on the top canvas
                     (drifting "stars" up high, current "streaks" low),
                     with subtle pointer parallax.
     2. OCEAN LOOP — two stacked <video> layers cross-dissolve so the
                     clip's loop seam is never visible (endless ocean).
     3. PLAYBACK   — keep muted/audio-less video from being throttled
                     to a standstill by the browser's power saver.
   ========================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. STARFIELD
     ---------------------------------------------------------- */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, dpr, parts = [];
  let mx = 0, my = 0, tmx = 0, tmy = 0; // smoothed + target pointer

  const DENSITY = 250;                  // particle count
  const rnd = (a, b) => a + Math.random() * (b - a);

  function build(n) {
    parts = [];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random(),
        y: Math.random(),
        s: rnd(0.4, 1.9),
        spd: rnd(0.4, 1.2),
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  // a smooth, looping flow field that steers each particle
  function flow(x, y, t) {
    return Math.sin(x * 3.1 + t * 0.00026) * 1.2
         + Math.cos(y * 4.0 - t * 0.00019) * 1.0
         + Math.sin((x + y) * 2.2 + t * 0.0004) * 0.7;
  }

  // colour by height: teal low (ocean) → blue mid → violet high (space)
  function colorFor(o) {
    if (o > 0.58) return '126,198,214';
    if (o > 0.34) return '150,178,214';
    return '197,191,232';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, W, H);
  }

  function parallax() {
    canvas.style.transform =
      'scale(1.08) translate(' + (-mx * 12).toFixed(1) + 'px,' + (-my * 8).toFixed(1) + 'px)';
  }

  function tick(t) {
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;
    parallax();

    ctx.fillStyle = 'rgba(5,7,10,0.11)'; // motion trails
    ctx.fillRect(0, 0, W, H);

    for (const p of parts) {
      const o = p.y;
      const px = p.x * W, py = p.y * H;
      const ang = flow(p.x, p.y, t);
      const sp = (0.0004 + o * o * 0.0016) * p.spd;
      let nx = p.x + Math.cos(ang) * sp * (0.5 + o);
      let ny = p.y + Math.sin(ang) * sp * 0.5 - (1 - o) * 0.00018;
      if (nx < 0) nx += 1; else if (nx > 1) nx -= 1;
      if (ny < 0) ny += 1; else if (ny > 1) ny -= 1;
      p.x = nx; p.y = ny;

      const npx = nx * W, npy = ny * H;
      const col = colorFor(o);

      if (o > 0.5) {
        // lower half: draw flowing "current" streaks
        const dx = npx - px, dy = npy - py;
        if (Math.abs(dx) < W * 0.25 && Math.abs(dy) < H * 0.25) {
          ctx.strokeStyle = 'rgba(' + col + ',' + (0.07 + 0.33 * o).toFixed(3) + ')';
          ctx.lineWidth = 0.6 + p.s * 0.55;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(npx, npy);
          ctx.stroke();
        }
      } else {
        // upper half: twinkling "stars"
        const tw = 0.5 + 0.5 * Math.sin(t * 0.0021 * p.spd + p.ph);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + col + ',' + (0.1 + 0.42 * tw).toFixed(3) + ')';
        ctx.arc(npx, npy, p.s * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    tmx = (e.clientX / window.innerWidth) * 2 - 1;
    tmy = (e.clientY / window.innerHeight) * 2 - 1;
  });

  build(DENSITY);
  resize();
  requestAnimationFrame(tick);


  /* ----------------------------------------------------------
     2 + 3.  OCEAN — seamless loop + anti-throttle playback
     ---------------------------------------------------------- */
  const vA = document.getElementById('ocean-a'); // bottom layer
  const vB = document.getElementById('ocean-b'); // top layer (fades)
  const videos = [vA, vB];
  const SPEED = 0.5;                              // 0.5 = slow-mo, 1 = real-time
  const rvfc = new Set();

  // Continuously request the next video frame → signals ongoing frame
  // demand so the browser is less likely to throttle muted playback.
  function loopRVFC(el) {
    if (!el || !el.requestVideoFrameCallback || rvfc.has(el)) return;
    rvfc.add(el);
    const cb = () => {
      if (el.requestVideoFrameCallback) el.requestVideoFrameCallback(cb);
      else rvfc.delete(el);
    };
    el.requestVideoFrameCallback(cb);
  }

  function startVideo(el) {
    el.muted = true;
    el.defaultMuted = true;
    el.playbackRate = SPEED;
    const play = () => {
      el.playbackRate = SPEED;
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
      loopRVFC(el);
    };
    play();
    el.addEventListener('loadeddata', play);
    el.addEventListener('canplay', play);
    el.addEventListener('pause', () => { if (!document.hidden) play(); });
  }

  videos.forEach(startVideo);

  // Re-kick on focus / interaction / visibility.
  const kick = () => {
    if (document.hidden) return;
    for (const el of videos) {
      el.playbackRate = SPEED;
      if (el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
      loopRVFC(el);
    }
  };
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('pointerdown', kick);
  window.addEventListener('focus', kick);
  setInterval(kick, 1500);

  // Conservative un-freeze watchdog: only intervene after a sustained
  // (~1.5s) stall where currentTime stops advancing but paused is false.
  let lastT = null, stallN = 0;
  setInterval(() => {
    if (document.hidden) return;
    for (const el of videos) {
      if (el.readyState >= 2 && el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    }
    if (!vA.paused && vA.readyState >= 2) {
      const t = vA.currentTime;
      if (lastT != null && Math.abs(t - lastT) < 0.001) {
        if (++stallN >= 3) { const p = vA.play(); if (p && p.catch) p.catch(() => {}); stallN = 0; }
      } else stallN = 0;
      lastT = t;
    }
  }, 500);

  // Cross-dissolve: vB is kept half a clip ahead of vA and its opacity
  // follows a cosine so each layer's loop seam is hidden by the other.
  function fade() {
    if (isFinite(vA.duration) && vA.duration > 0) {
      const D = vA.duration;
      const p1 = (vA.currentTime % D) / D;
      const op = 0.5 + 0.5 * Math.cos(2 * Math.PI * p1);
      vB.style.opacity = op.toFixed(3);

      const desired = (vA.currentTime + D / 2) % D;
      let diff = Math.abs(vB.currentTime - desired);
      diff = Math.min(diff, D - diff);
      // only re-sync vB while it is invisible, so the seek is never seen
      if (op < 0.12 && diff > 0.2) { try { vB.currentTime = desired; } catch (e) {} }
    }
    requestAnimationFrame(fade);
  }
  requestAnimationFrame(fade);

  // Optional: drag any video file onto the page to swap the footage.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
    const file = files.find((f) => f.type.indexOf('video') === 0);
    if (!file) return;
    const url = URL.createObjectURL(file);
    videos.forEach((el) => { el.src = url; el.load(); startVideo(el); });
  });
})();
