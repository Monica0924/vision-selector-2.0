// BGR NEO Vision Selector — Interactive Machine Vision Particle Background
// Prominent rich black / dark charcoal line art on the light theme: floating
// particle network with connected nodes, smoothly rotating camera lens aperture
// rings, and fine optical crosshairs — all reacting to mouse movement.

(() => {
  'use strict';
  const cv = document.getElementById('bg');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palette (RGB triplets) — rich black / dark charcoal for strong contrast on the light theme
  const INK = '15, 23, 42';        // Rich charcoal (#0F172A)
  const INK_DEEP = '2, 6, 23';     // Near-black (#020617)
  const INK_SOFT = '30, 41, 59';   // Slate-800 accent (#1E293B)

  let w = 0, h = 0, dpr = 1, run = true, t = 0;
  let nodes = [];
  let apertures = [];
  let crosshairs = [];
  const mouse = { x: -9999, y: -9999, active: false, rx: -9999, ry: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.width = window.innerWidth * dpr;
    h = cv.height = window.innerHeight * dpr;
    cv.style.width = window.innerWidth + 'px';
    cv.style.height = window.innerHeight + 'px';
    init();
  }

  function init() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Floating particle nodes (density scales with viewport area)
    const nodeCount = Math.min(110, Math.max(44, Math.floor((vw * vh) / 15000)));
    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.26 * dpr,
      vy: (Math.random() - 0.5) * 0.26 * dpr,
      r: (1.3 + Math.random() * 1.7) * dpr,
      phase: Math.random() * Math.PI * 2,
      accent: Math.random() < 0.16
    }));

    // Rotating industrial camera lens aperture rings
    const aptCount = Math.min(4, Math.max(2, Math.floor(vw / 620)));
    apertures = Array.from({ length: aptCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 40 + 50) * dpr,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.0038,
      iris: Math.random() * Math.PI * 2,
      irisSpeed: 0.005 + Math.random() * 0.008,
      blades: Math.floor(Math.random() * 3) + 8,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.2 * dpr,
      vy: (Math.random() - 0.5) * 0.2 * dpr
    }));

    // Fine optical crosshairs
    const chCount = Math.min(5, Math.max(3, Math.floor(vw / 520)));
    crosshairs = Array.from({ length: chCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: (Math.random() * 13 + 20) * dpr,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.006,
      vx: (Math.random() - 0.5) * 0.2 * dpr,
      vy: (Math.random() - 0.5) * 0.2 * dpr,
      phase: Math.random() * Math.PI * 2,
      accent: i % 3 === 0
    }));
  }

  // --- Particle network: proximity links + interactive cursor links ----------
  function updateAndDrawNetwork(mx, my, mouseOn) {
    const LINK = 155 * dpr;
    const LINK2 = LINK * LINK;
    const MREACH = 200 * dpr;
    const MREACH2 = MREACH * MREACH;

    // 1. Integrate motion + gentle cursor repulsion
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (mouseOn) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < MREACH) {
          const f = (1 - dist / MREACH) * 0.6 * dpr;
          n.x += (dx / dist) * f;
          n.y += (dy / dist) * f;
        }
      }

      const pad = 30 * dpr;
      if (n.x < -pad) n.x = w + pad; else if (n.x > w + pad) n.x = -pad;
      if (n.y < -pad) n.y = h + pad; else if (n.y > h + pad) n.y = -pad;
    }

    // 2. Sleek charcoal proximity links
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK2) {
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.42;
          ctx.strokeStyle = `rgba(${INK}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 3. Interactive links radiating from the cursor to nearby nodes
    if (mouseOn) {
      ctx.lineWidth = 1.1 * dpr;
      for (const n of nodes) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MREACH2) {
          const alpha = (1 - Math.sqrt(d2) / MREACH) * 0.62;
          ctx.strokeStyle = `rgba(${INK_DEEP}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
    }

    // 4. Node dots
    for (const n of nodes) {
      const pulse = 0.68 + Math.sin(t * 0.03 + n.phase) * 0.22;
      ctx.fillStyle = n.accent
        ? `rgba(${INK_SOFT}, ${0.78 * pulse})`
        : `rgba(${INK}, ${0.78 * pulse})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Rotating camera lens aperture ring ------------------------------------
  function drawAperture(ap) {
    ctx.save();
    ctx.translate(ap.x, ap.y);
    ctx.rotate(ap.rot);
    const op = 0.28 + Math.sin(ap.phase) * 0.07;
    const irisR = ap.r * (0.32 + Math.sin(ap.iris) * 0.08);

    // Outer lens barrel ring
    ctx.strokeStyle = `rgba(${INK}, ${op})`;
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.arc(0, 0, ap.r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner element ring
    ctx.strokeStyle = `rgba(${INK}, ${op * 0.75})`;
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    ctx.arc(0, 0, ap.r * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Animated iris opening
    ctx.strokeStyle = `rgba(${INK}, ${op * 0.9})`;
    ctx.beginPath();
    ctx.arc(0, 0, irisR, 0, Math.PI * 2);
    ctx.stroke();

    // Calibration ticks
    const ticks = 16;
    for (let i = 0; i < ticks; i++) {
      const a = (i * Math.PI * 2) / ticks;
      const major = i % 4 === 0;
      const len = major ? 6 * dpr : 3 * dpr;
      ctx.strokeStyle = major
        ? `rgba(${INK_DEEP}, ${op * 1.5})`
        : `rgba(${INK}, ${op * 0.95})`;
      ctx.lineWidth = major ? 1.4 * dpr : 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (ap.r - len), Math.sin(a) * (ap.r - len));
      ctx.lineTo(Math.cos(a) * ap.r, Math.sin(a) * ap.r);
      ctx.stroke();
    }

    // Iris blade chords
    ctx.strokeStyle = `rgba(${INK}, ${op})`;
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < ap.blades; i++) {
      const a1 = (i * Math.PI * 2) / ap.blades;
      const a2 = a1 + (Math.PI / ap.blades) * 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a1) * irisR, Math.sin(a1) * irisR);
      ctx.lineTo(Math.cos(a2) * ap.r * 0.7, Math.sin(a2) * ap.r * 0.7);
      ctx.stroke();
    }

    // Center pupil core
    ctx.fillStyle = `rgba(${INK_DEEP}, ${op * 1.1})`;
    ctx.beginPath();
    ctx.arc(0, 0, ap.r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Optical tracking grid: faint calibration mesh + cursor-tracked lines ---
  const GRID = 92; // logical grid spacing (px)
  function drawGrid(mx, my, mouseOn) {
    const step = GRID * dpr;

    // Base faint calibration grid
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = `rgba(${INK}, 0.055)`;
    ctx.beginPath();
    for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    if (!mouseOn) return;

    // Grid column / row that snaps to and tracks the cursor
    const gx = Math.round(mx / step) * step;
    const gy = Math.round(my / step) * step;

    ctx.strokeStyle = `rgba(${INK}, 0.15)`;
    ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath();
    ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
    ctx.moveTo(0, gy); ctx.lineTo(w, gy);
    ctx.stroke();

    // Optical tracking reticle spanning the viewport
    ctx.strokeStyle = `rgba(${INK_DEEP}, 0.26)`;
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(mx - 26 * dpr, my); ctx.lineTo(mx + 26 * dpr, my);
    ctx.moveTo(mx, my - 26 * dpr); ctx.lineTo(mx, my + 26 * dpr);
    ctx.stroke();

    // Precision corner brackets at the tracked intersection
    const b = 16 * dpr;
    const c = b * 0.6;
    ctx.strokeStyle = `rgba(${INK_SOFT}, 0.40)`;
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(gx - b, gy - b + c); ctx.lineTo(gx - b, gy - b); ctx.lineTo(gx - b + c, gy - b);
    ctx.moveTo(gx + b - c, gy - b); ctx.lineTo(gx + b, gy - b); ctx.lineTo(gx + b, gy - b + c);
    ctx.moveTo(gx + b, gy + b - c); ctx.lineTo(gx + b, gy + b); ctx.lineTo(gx + b - c, gy + b);
    ctx.moveTo(gx - b + c, gy + b); ctx.lineTo(gx - b, gy + b); ctx.lineTo(gx - b, gy + b - c);
    ctx.stroke();
  }

  // --- Fine optical crosshair ------------------------------------------------
  function drawCrosshair(ch) {
    ctx.save();
    ctx.translate(ch.x, ch.y);
    ctx.rotate(ch.rot);
    const op = 0.32 + Math.sin(ch.phase) * 0.10;
    const col = ch.accent ? INK_SOFT : INK;
    ctx.strokeStyle = `rgba(${col}, ${op})`;
    ctx.lineWidth = 1.1 * dpr;
    const r = ch.size;

    // Outer + inner reticle circles
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair lines with a clean center gap
    const gap = 4 * dpr;
    ctx.beginPath();
    ctx.moveTo(-r - 8 * dpr, 0); ctx.lineTo(-gap, 0);
    ctx.moveTo(gap, 0); ctx.lineTo(r + 8 * dpr, 0);
    ctx.moveTo(0, -r - 8 * dpr); ctx.lineTo(0, -gap);
    ctx.moveTo(0, gap); ctx.lineTo(0, r + 8 * dpr);
    ctx.stroke();

    // Center precision dot
    ctx.fillStyle = `rgba(${INK_DEEP}, ${op * 1.4})`;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function frame() {
    if (!run) return;
    t += 1;
    ctx.clearRect(0, 0, w, h);

    const mouseOn = mouse.active && !RM;
    const mx = mouse.x * dpr;
    const my = mouse.y * dpr;
    if (mouseOn) {
      if (mouse.rx === -9999) { mouse.rx = mx; mouse.ry = my; }
      mouse.rx += (mx - mouse.rx) * 0.15;
      mouse.ry += (my - mouse.ry) * 0.15;
    }

    // Optical tracking grid (base backdrop layer)
    drawGrid(mouseOn ? mouse.rx : -9999, mouseOn ? mouse.ry : -9999, mouseOn);

    // Rotating aperture rings (behind the network)
    for (const ap of apertures) {
      ap.phase += 0.02;
      ap.iris += ap.irisSpeed;
      ap.rot += ap.rs;
      ap.x += ap.vx;
      ap.y += ap.vy;
      if (ap.x < -ap.r) ap.x = w + ap.r; else if (ap.x > w + ap.r) ap.x = -ap.r;
      if (ap.y < -ap.r) ap.y = h + ap.r; else if (ap.y > h + ap.r) ap.y = -ap.r;
      drawAperture(ap);
    }

    // Interactive particle network
    updateAndDrawNetwork(mouseOn ? mouse.rx : -9999, mouseOn ? mouse.ry : -9999, mouseOn);

    // Fine optical crosshairs (in front)
    for (const ch of crosshairs) {
      ch.phase += 0.028;
      ch.rot += ch.rs;
      ch.x += ch.vx;
      ch.y += ch.vy;
      if (ch.x < 0 || ch.x > w) ch.vx *= -1;
      if (ch.y < 0 || ch.y > h) ch.vy *= -1;
      drawCrosshair(ch);
    }

    if (!RM) requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', resize);

  document.addEventListener('visibilitychange', () => {
    run = !document.hidden;
    if (run && !RM) frame();
  });

  resize();
  frame();
})();
