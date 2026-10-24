/* 01.03 Git without typing it — shared drawing (window.M)
   The lesson's one metaphor: A HAND-DRAWN TRAIL MAP that the GUIDE (the agent) draws on and the WALKER (you) reads.
     - the MAP SHEET (M.sheet): a warm sheet with grain, two fold creases, a printed double frame, hairline contours;
     - the PATH (M.trail): `main` is a gold dashed path at y 560; side trails are cream dashed; a pull request is a
       grey pencilled stretch; copies at the station are thin dashed gold;
     - STONES (M.stone) are commits: gold ring on a tile disc, the real short ID (mono) under it, an optional lock
       seal ("add new, don't edit old"); M.back draws the thin arrow to the parent stone;
     - SIGNPOSTS (M.signpost) are branches: a post and a SQUARE plank (the brand's square element) with a mono name;
     - the LANTERN (M.lantern) marks the live branch; it hangs on a signpost's arm and is "set outside the map";
     - the GUIDE (M.guide, gold sparkle tile with a pen or eraser) draws; the WALKER (M.walker, cream person tile)
       reads, with a dashed sight-line (M.sight);
     - the VALLEY (M.valley) and the RANGER STATION (M.station) across it are the remote ("REMOTE · E.G. GITHUB");
     - FOOTPRINTS (M.prints / M.step) stamped `verb → target`; terracotta when aimed at something never named;
     - TRACING PAPER (M.tracing + M.diff) is the diff; the NOTICEBOARD (M.board) is a public remote;
     - the guide's ERASER (M.eraser) is checkpoints; speech BUBBLES (M.bubble) are what the walker asks;
     - small MAP GLYPHS (M.miniMap, M.emblem) for the title card, the burnt second map, the pinned copy, the end card;
     - dated source cards (M.dated), "where the picture breaks" (M.breaks), pointer chips (M.pointer), the terminal
       window for the captures (M.term), the real commit IDs read from the captures (M.ids), credits and keep rows.
   Every scene draws these with the functions below so the map looks identical from scene to scene.

   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no Math.random,
   no state between frames: grain and jitter come from K.rng with fixed seeds). K.ctx() is read on every call.
   Coordinates are WORLD coordinates (= screen at camera z 1). Under K.withCam with z < 1, pass ts: 1 / cam.z (or
   M.ts(cam)) to every function that draws text, so labels stay at least 26 px on screen.
   Colours: gold (C.head / C.gold) = path, stones, lantern, the guide; cream (C.strong) = signposts, the walker, text;
   terracotta (C.accent) = "never named", stray files, where the picture breaks; C.line2 = the station; C.soft = dim,
   pencil. Pink is never used here (petals on the title and end cards only, drawn by the scene with K.petals). */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);

  // ---------------------------------------------------------------- palette and type
  const P = {
    sheet: K.mixColor(K.mixColor(C.tile, C.paper, 0.08), C.head, 0.035),   // the map sheet: tile + paper .08, a touch warmer
    sheetEdge: K.mixColor(C.line2, C.paper, 0.18),
    crease: K.mixColor(C.tile, C.page, 0.55),
    contour: C.line,
    path: C.head, stone: C.gold, stoneFill: C.tile,
    side: C.strong,                                      // side trails and signposts: cream
    pencil: C.soft,
    station: C.line2, stationFill: K.mixColor(C.tile, '#5C6688', 0.06),
    valley: K.mixColor(C.page, C.tile, 0.35),
    never: C.accent, dim: C.soft, text: C.strong, label: C.body,
    plank: K.mixColor(C.tile, C.paper, 0.14),
  };
  const T = {
    label: { font: 'ui', weight: 600, size: 26 },
    labelBig: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 26 },
    eyebrow: { font: 'ui', weight: 600, size: 24, tracking: 3, upper: true },
    read: { font: 'read', size: 30 },
  };
  const READ = 'read 2026-10-23';
  const MOVES = 'read 2026-10-23 · this moves monthly';

  // ---------------------------------------------------------------- layout (world px; safe x 80-1840, y 130-930)
  const L = {
    safe: { x0: 80, y0: 130, x1: 1840, y1: 930 },
    sheet: { x: 120, y: 170, w: 1680, h: 740 },
    pathY: 560, pathX0: 220, pathX1: 1180,
    stoneX: [300, 520, 740], mergeX: 960,
    stoneR: 26,
    // the side trail of scene 05: leaves stone 2, runs at y 420, rejoins main at the merge stone
    side: [[520, 560], [575, 468], [650, 420], [870, 420], [928, 466], [960, 560]],
    sideStones: [[650, 420], [870, 420]],
    signH: 130,                                          // post height above the ground point (M.signFor: ground = stone + (44, -30))
    valley: { x0: 1250, x1: 1330 },
    station: { x: 1380, y: 300, w: 380, h: 420 },
    guide: [380, 760], walker: [1540, 760],
    term: { x: 980, y: 200, w: 820, h: 660 },
    cards: { x: 1180, y: 150, w: 620, y1: 330 },          // top-right band for source cards
    road: 840,                                           // the public road of scene 10
    board: { x: 1480, y: 560, w: 260, h: 200 },
  };
  // camera framings for K.cam (x, y = world point at the screen centre)
  const VIEW = {
    full: { x: 960, y: 540, z: 1 },
    // the map's content (world x 160-1200: path, stones, signposts) in the left half (screen x ~20-940) while the
    // terminal (M.term, x 980-1800) fills the right. z .85 keeps every label legible (ts 1.18); the sheet's right
    // part runs on under the terminal window. (The storyboard's z .55 would shrink 26 px labels to 14 px.)
    left: { x: 680 + (960 - 490) / 0.85, y: 480, z: 0.85 },
    // the whole sheet, small, on the left (only for a glance; IDs and names then need ts 1.82)
    leftWide: { x: 960 + (960 - 500) / 0.55, y: 540, z: 0.55 },
    station: { x: 1060, y: 540, z: 1 },                  // pan right +100: valley and station in view, the sheet's right edge on screen
  };
  /** text scale for a camera: 1 / z (never below 1), so labels drawn in world space stay 26 px on screen */
  const ts = (cam) => Math.max(1, 1 / ((cam && cam.z) || 1));
  /** world point -> screen point through a K.cam camera */
  const toScreen = (cam, x, y) => (cam ? [(x - cam.x) * cam.z + 960, (y - cam.y) * cam.z + 540] : [x, y]);

  // ---------------------------------------------------------------- small helpers
  function label(s, x, y, o = {}) {
    const sz = (o.size || 26) * pick(o.ts, 1);
    return K.text(s, x, y, { font: o.font || 'ui', weight: o.weight || 600, size: sz, color: o.color || P.label, align: o.align || 'center', alpha: o.alpha, italic: o.italic, tracking: o.tracking, upper: o.upper });
  }
  /** pill whose LEFT edge is at x (K.pill is centred); o.align 'center' | 'right' too; returns its width */
  function pillL(s, x, y, o = {}) {
    const size = o.size || 26;
    const to = { size, font: o.font || 'ui', weight: o.weight || 600, tracking: o.tracking, upper: o.upper };
    const is = o.icon ? size * 1.05 : 0, gap = o.icon ? size * 0.4 : 0;
    const w = Math.max(K.measure(s, to) + is + gap + size * 1.6, o.w || 0);
    const al = o.align || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    K.pill(s, x0 + w / 2, y, o);
    return w;
  }
  /** point and direction at progress k (0..1, by length) along a polyline */
  function along(pts, k) {
    k = clamp01(k);
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let l = tot * k;
    for (let i = 0; i < seg.length; i++) {
      if (l <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? K.clamp(l / seg[i]) : 1, a = pts[i], b = pts[i + 1];
        return { x: K.lerp(a[0], b[0], f), y: K.lerp(a[1], b[1], f), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      l -= seg[i];
    }
    const n = pts.length - 1; return { x: pts[n][0], y: pts[n][1], ang: 0 };
  }
  /** a dashed ring (a copy, an empty slot) */
  function dashedCircle(x, y, r, o = {}) {
    const g = G(); g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.fill) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = o.fill; g.fill(); }
    g.setLineDash(o.dash || [6, 6]); g.lineWidth = o.w || 2.5; g.strokeStyle = o.color || C.head; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.restore();
  }

  // ---------------------------------------------------------------- the map sheet
  /** the map sheet. o: {x, y, w, h (default L.sheet), unfold 0..1 (scaleY about its centre; creases show while it
   *  opens), contours 0..1 (the hairline contours draw themselves), alpha, grain (default true), frame (the printed
   *  double frame, default true), compass 0..1 (a tiny north mark in the lower-left corner; default 1)}.
   *  Draws nothing else: the path, stones and signposts go on top. Returns the sheet rect. */
  function sheet(t, o = {}) {
    const r = { x: pick(o.x, L.sheet.x), y: pick(o.y, L.sheet.y), w: pick(o.w, L.sheet.w), h: pick(o.h, L.sheet.h) };
    const a = clamp01(pick(o.alpha, 1)), u = clamp01(pick(o.unfold, 1));
    if (a <= 0.002 || u <= 0.002) return r;
    const g = G(), cy = r.y + r.h / 2;
    K.layer(a, () => {
      g.save(); g.translate(0, cy); g.scale(1, Math.max(0.02, K.ease.out(u))); g.translate(0, -cy);
      K.card(r.x, r.y, r.w, r.h, { r: 24, fill: P.sheet, stroke: P.sheetEdge, lw: 1.5 });
      g.save(); K.rr(r.x, r.y, r.w, r.h, 24); g.clip();
      // warm wash toward the centre, like lamplight on paper
      const gr = g.createRadialGradient(r.x + r.w * 0.45, r.y + r.h * 0.45, 40, r.x + r.w * 0.45, r.y + r.h * 0.45, r.w * 0.7);
      gr.addColorStop(0, K.rgba(C.paper, 0.045)); gr.addColorStop(1, K.rgba(C.page, 0.12));
      g.fillStyle = gr; g.fillRect(r.x, r.y, r.w, r.h);
      if (o.grain !== false) {
        const rnd = K.rng(3103);
        for (let i = 0; i < 420; i++) {
          const px = r.x + rnd() * r.w, py = r.y + rnd() * r.h, s = 1 + rnd() * 1.6, lt = rnd() > 0.5;
          g.fillStyle = lt ? K.rgba(C.paper, 0.05 + rnd() * 0.05) : K.rgba(C.page, 0.12 + rnd() * 0.1);
          g.fillRect(px, py, s, s);
        }
      }
      // fold creases (thirds), stronger while unfolding
      const cr = 0.35 + 0.65 * (1 - u);
      for (let i = 1; i < 3; i++) {
        const cx = r.x + (r.w * i) / 3;
        K.line(cx, r.y + 6, cx, r.y + r.h - 6, { color: P.crease, w: 3, alpha: 0.55 * cr });
        K.line(cx + 2, r.y + 6, cx + 2, r.y + r.h - 6, { color: C.paper, w: 1, alpha: 0.05 * cr });
      }
      K.line(r.x + 6, cy, r.x + r.w - 6, cy, { color: P.crease, w: 2, alpha: 0.35 * cr });
      // hairline contours
      const ck = clamp01(pick(o.contours, 1));
      if (ck > 0) {
        const c1 = [], c2 = [], c3 = [];
        for (let i = 0; i <= 16; i++) {
          const f = i / 16, x = r.x + 40 + f * (r.w - 80);
          c1.push([x, r.y + r.h * 0.2 + Math.sin(f * 5.1 + 0.6) * 26 + Math.sin(f * 11.3) * 8]);
          c2.push([x, r.y + r.h * 0.27 + Math.sin(f * 5.1 + 0.9) * 30 + Math.sin(f * 9.7 + 1) * 7]);
          c3.push([x, r.y + r.h * 0.86 + Math.sin(f * 4.3 + 2.2) * 22 + Math.sin(f * 13.1) * 6]);
        }
        [c1, c2, c3].forEach((c, i) => K.path(c, { k: K.clamp(ck * 1.2 - i * 0.1), head: false, color: C.line2, w: 1.5, alpha: 0.45 }));
      }
      g.restore();
      if (o.frame !== false) {
        g.save(); g.lineWidth = 1.2; g.strokeStyle = K.rgba(C.paper, 0.1);
        K.rr(r.x + 16, r.y + 16, r.w - 32, r.h - 32, 14); g.stroke();
        g.strokeStyle = K.rgba(C.paper, 0.06); K.rr(r.x + 24, r.y + 24, r.w - 48, r.h - 48, 10); g.stroke(); g.restore();
      }
      const cp = clamp01(pick(o.compass, 1));
      if (cp > 0) compass(r.x + 70, r.y + r.h - 74, 30, { alpha: 0.7 * cp, ts: o.ts });
      g.restore();
    });
    return r;
  }
  /** tiny north mark: a needle and an N (decoration) */
  function compass(x, y, s, o = {}) {
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      g.save(); g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.28, y); g.lineTo(x, y + s * 0.5); g.lineTo(x - s * 0.28, y); g.closePath();
      g.fillStyle = K.rgba(C.head, 0.35); g.fill(); g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.head, 0.7); g.stroke();
      g.beginPath(); g.arc(x, y, s * 0.9, 0, 7); g.strokeStyle = K.rgba(C.paper, 0.14); g.stroke(); g.restore();
      label('N', x, y - s - 12, { size: 20, color: C.soft, ts: o.ts });
    });
  }

  // ---------------------------------------------------------------- trails
  const MAIN = [[L.pathX0, L.pathY], [L.pathX1, L.pathY]];
  /** a trail through pts ([[x, y], ...], smooth). kind: 'main' (gold dashed, default) | 'side' (cream dashed) |
   *  'pencil' (grey, finer: a pull request, proposed) | 'copy' (thin gold dashed: the station's replica) | 'never'
   *  (terracotta). o: {k (draws by length), alpha, w, tension, ink 0..1 (pencil -> gold: the PR merged)} */
  function trail(pts, o = {}) {
    const kind = o.kind || 'main', k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1));
    if (k <= 0 || a <= 0.002) return;
    const ink = clamp01(o.ink);
    const st = {
      main: { color: P.path, w: 5, dash: [20, 12] },
      side: { color: P.side, w: 4, dash: [14, 12] },
      pencil: { color: K.mixColor(P.pencil, P.path, ink), w: K.lerp(3, 5, ink), dash: ink > 0.5 ? [20, 12] : [6, 7] },
      copy: { color: P.path, w: 3, dash: [10, 9] },
      never: { color: P.never, w: 4, dash: [14, 10] },
    }[kind] || {};
    // soft ground under the main path
    if (kind === 'main') K.path(pts, { k, head: false, color: K.rgba(C.head, 0.07), w: 22, tension: o.tension, alpha: a });
    K.path(pts, { k, head: false, color: o.color || st.color, w: o.w || st.w, dash: o.dash || st.dash, tension: o.tension, alpha: a });
  }
  /** the main path at its standard place (x 220-1180, y 560); o as trail; o.x1 to end it elsewhere */
  function mainPath(o = {}) { trail([[pick(o.x0, L.pathX0), L.pathY], [pick(o.x1, L.pathX1), L.pathY]], { ...o, kind: o.kind || 'main' }); }

  // ---------------------------------------------------------------- stones (commits)
  /** a stone centred at (x, y). o: {id (short ID, mono under it; read it with M.ids, never type one in), k (0..1:
   *  settles from scale .6 and fades), state: 'solid' (default) | 'copy' (dashed, at the station) | 'empty'
   *  (dashed outline with '?') | 'outline' (dashed, a stone not made yet) | 'torn' (terracotta), seal 0..1 (the lock
   *  seal), glow 0..1, glyph (text inside, e.g. '↺'), color (override stroke), bg (fill behind a dashed state, default
   *  the sheet colour so the path does not show through), idColor, idAlpha, idSide 'below' |
   *  'above', r (26), ts, alpha}. Returns {x, y, r, idY}. */
  function stone(x, y, o = {}) {
    const r = o.r || L.stoneR, k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * Math.min(1, k * 1.6);
    const idY = o.idSide === 'above' ? y - r - 18 * pick(o.ts, 1) : y + r + 34 * pick(o.ts, 1);
    const geo = { x, y, r, idY };
    if (a <= 0.002) return geo;
    const g = G(), st = o.state || 'solid', s = 0.6 + 0.4 * K.ease.out(k);
    const col = o.color || (st === 'torn' ? C.accent : P.stone);
    K.layer(a, () => {
      K.at(x, y, s, 0, () => {
        if (clamp01(o.glow) > 0) K.glow(0, 0, r * 3.2, C.head, 0.28 * clamp01(o.glow));
        if (st === 'copy' || st === 'empty' || st === 'outline') {
          dashedCircle(0, 0, r, { color: col, w: 2.5, fill: st === 'copy' ? K.mixColor(C.tile, C.head, 0.1) : (o.bg || P.sheet), alpha: st === 'outline' ? 0.7 : 1 });
          if (st === 'empty') K.text('?', 0, 10, { font: 'ui', weight: 600, size: 28, color: C.head, align: 'center' });
        } else {
          g.save(); g.beginPath(); g.ellipse(0, r * 0.95, r * 0.9, r * 0.22, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.28)'; g.fill();
          g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = P.stoneFill; g.fill();
          g.lineWidth = 3.5; g.strokeStyle = col; g.stroke();
          // a little highlight: the stone's worn top
          g.beginPath(); g.arc(0, 0, r * 0.62, Math.PI * 1.1, Math.PI * 1.55); g.lineWidth = 2.5; g.strokeStyle = K.rgba(col, 0.45); g.lineCap = 'round'; g.stroke();
          g.beginPath(); g.arc(0, 0, r * 0.18, 0, 7); g.fillStyle = K.rgba(col, 0.75); g.fill();
          g.restore();
        }
        if (o.glyph) K.text(o.glyph, 0, 10, { font: 'ui', weight: 600, size: 28, color: col, align: 'center' });
      });
      const sl = clamp01(o.seal);
      if (sl > 0) K.layer(sl, () => {
        const sx = x + r * 0.85, sy = y - r * 0.85 - (1 - K.ease.out(sl)) * 14;
        g.save(); g.beginPath(); g.arc(sx, sy, 17, 0, 7); g.fillStyle = C.page; g.fill(); g.lineWidth = 2; g.strokeStyle = C.head; g.stroke(); g.restore();
        K.icon('lock', sx, sy, 22, { color: C.head, w: 2 });
      });
    });
    if (o.id) label(o.id, x, idY, { ...T.mono, color: o.idColor || C.body, alpha: a * pick(o.idAlpha, 1), ts: o.ts });
    return geo;
  }
  /** the thin back-arrow from a stone to its parent: from (x2, y2) back to (x1, y1), stopping at the rings.
   *  o: {k, alpha, color (C.quiet), r (26), bend} */
  function back(x1, y1, x2, y2, o = {}) {
    const r = (o.r || L.stoneR) + 8, d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    K.arrow(x2 - ux * r, y2 - uy * r, x1 + ux * r, y1 + uy * r, { k: pick(o.k, 1), color: o.color || C.body, w: 2.5, headSize: 13, bend: pick(o.bend, -30), alpha: pick(o.alpha, 0.75) });
  }

  // ---------------------------------------------------------------- signposts (branches) and the lantern
  /** a signpost planted at ground point (x, y) (usually just above-left of a stone). name in mono 26 on a square
   *  plank. o: {k (0..1 plants it: the post grows, then the plank), h (post height, L.signH), side 'right' (plank
   *  sticks out right, default) | 'left' | 'center', color (C.strong cream; C.accent for a warning), dim 0..1,
   *  lantern 0..1 (the lantern swings in under the plank's far end; M.lantern with t), t (for the lantern's sway),
   *  sway (default 1), dip (0..1, the lantern dims), lanternS (54), alpha, ts}. Returns {x, y, top, plank: {x, y, w, h}, hook: [x, y]}. */
  function signpost(name, x, y, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)), tsc = pick(o.ts, 1), h = o.h || L.signH;
    const size = 26 * tsc, tw = K.measure(name, { ...T.mono, size }), pw = tw + 36 * tsc, ph = 48 * tsc;
    const top = y - h, side = o.side || 'right';
    const px = side === 'left' ? x + 14 - pw : side === 'center' ? x - pw / 2 : x - 14, py = top - ph + 10;
    const hook = side === 'left' ? [px + 22, py + ph] : [px + pw - 22, py + ph];   // the lantern hangs from the plank's far end
    const geo = { x, y, top, plank: { x: px, y: py, w: pw, h: ph }, hook };
    if (a <= 0.002 || k <= 0) return geo;
    const col = K.mixColor(o.color || P.side, C.soft, clamp01(o.dim)), postK = K.clamp(k / 0.55), plankK = K.clamp((k - 0.4) / 0.6);
    K.layer(a, () => {
      const g = G();
      g.save(); g.beginPath(); g.ellipse(x, y + 2, 16, 4, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); g.restore();
      K.line(x, y, x, K.lerp(y, top, K.ease.out(postK)), { color: K.mixColor(C.soft, col, 0.25), w: 6 });
      if (plankK > 0) K.layer(plankK, () => K.at(px + pw / 2, py + ph / 2, 0.9 + 0.1 * K.ease.out(plankK), 0, () => {
        K.card(-pw / 2, -ph / 2, pw, ph, { r: 6, fill: P.plank, stroke: col, lw: 2, shadow: false });
        // two nail heads
        g.save(); g.fillStyle = K.rgba(col, 0.5); [-pw / 2 + 10, pw / 2 - 10].forEach((nx) => { g.beginPath(); g.arc(nx, -ph / 2 + 10, 2.5, 0, 7); g.fill(); }); g.restore();
        K.text(name, 0, size * 0.36, { ...T.mono, size, color: col, align: 'center' });
      }));
      const lk = clamp01(o.lantern);
      if (lk > 0 && plankK > 0) lantern(pick(o.t, 0), hook[0], hook[1], { k: lk, sway: o.sway, dip: o.dip, s: o.lanternS });
    });
    return geo;
  }
  /** the standard place for a branch's signpost: beside its newest stone at (sx, sy) (ground = stone + (44, -30),
   *  plank to the right, the lantern under the plank's end). Ease sx between stones to make the signpost slide.
   *  Same o and return as M.signpost. */
  function signFor(name, sx, sy, o = {}) { return signpost(name, sx + 44, sy - 30, o); }
  /** the lantern hanging from (hx, hy). o: {k (0..1 swings in from the side and lights), sway (idle sway amount, 1),
   *  dip (0..1 dims to .6: the title card's single dip), s (54), alpha, label, labelColor, ts}. Returns its centre. */
  function lantern(t, hx, hy, o = {}) {
    const k = clamp01(pick(o.k, 1)), s = o.s || 54, a = clamp01(pick(o.alpha, 1)) * Math.min(1, k * 2);
    const len = s * 0.45, cx = hx, cy = hy + len + s * 0.5;
    if (a <= 0.002) return [cx, cy];
    const rot = (1 - K.ease.out(k)) * 0.9 + K.wave(t, 1.3, 0.05 * pick(o.sway, 1));
    const lit = (1 - 0.4 * clamp01(o.dip)) * K.clamp(k * 1.5 - 0.3);
    K.layer(a, () => {
      K.at(hx, hy, 1, rot, () => {
        K.line(0, 0, 0, len, { color: C.soft, w: 2 });
        if (lit > 0) { K.glow(0, len + s * 0.5, s * 2.4, C.head, 0.32 * lit); K.glow(0, len + s * 0.5, s * 0.9, C.head, 0.35 * lit); }
        K.icon('lantern', 0, len + s * 0.5, s, { color: C.head, alpha: 0.55 + 0.45 * lit, w: 2.6 });
      });
      if (o.label) label(o.label, cx, cy + s * 0.9 + 22 * pick(o.ts, 1), { color: o.labelColor || C.head, ts: o.ts });
    });
    return [cx, cy];
  }
  /** visitors: a dotted line of tiny walker icons moving along pts toward its end ('visitors go here').
   *  o: {k (fades in), speed (px/s, 60), gap (px between walkers, 70), alpha, color} */
  function visitors(t, pts, o = {}) {
    const a = clamp01(pick(o.k, 1)) * clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const gap = o.gap || 70, off = ((t * (o.speed || 60)) % gap + gap) % gap;
    K.layer(a, () => {
      K.path(pts, { head: false, color: C.head, w: 2, dash: [2, 10], alpha: 0.45 });
      for (let d = off; d < tot; d += gap) {
        const p = along(pts, d / tot), edge = Math.min(1, d / 60, (tot - d) / 60);
        K.icon('person', p.x, p.y - 18 + K.wave(t * 6 + d, 1, 2), 30, { color: o.color || C.head, alpha: 0.8 * edge, w: 2 });
      }
    });
  }

  // ---------------------------------------------------------------- the guide (the agent) and the walker (you)
  /** the guide: a gold sparkle tile holding a pen (or the eraser). o: {s (84), alpha, dim 0..1 (greys to .3 look),
   *  tool: 'pen' (default) | 'eraser' | 'none', penTo [x, y] (aims the pen's tip at a point; else a resting angle),
   *  scribble 0..1 (small writing motion of the tip), bob (default true), label (under it, e.g. 'draws'), badge
   *  (a pill above it), badgeColor}. Returns {x, y, tip: [x, y], top, bottom}. */
  function guide(t, x, y, o = {}) {
    const s = o.s || 84, a = clamp01(pick(o.alpha, 1)), dim = clamp01(o.dim);
    const bob = o.bob === false ? 0 : K.wave(t, 2.1, s * 0.035);
    const hx = x + s * 0.42, hy = y - bob + s * 0.18;                 // the hand: tile's right edge
    let ang = -0.75;
    if (o.penTo) ang = Math.atan2(o.penTo[1] - hy, o.penTo[0] - hx);
    const sc = clamp01(o.scribble), len = s * 0.95;
    const jx = sc * K.wave(t, 19, 5), jy = sc * K.wave(t, 13, 3, 1);
    const tip = [hx + Math.cos(ang) * len + jx, hy + Math.sin(ang) * len + jy];
    const geo = { x, y, tip, top: y - s / 2, bottom: y + s / 2 };
    if (a <= 0.002) return geo;
    const g = G(), col = K.mixColor(C.head, C.soft, dim);
    K.layer(a * (1 - 0.6 * dim), () => {
      g.save(); g.beginPath(); g.ellipse(x, y + s * 0.62, s * 0.38, s * 0.07, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.32)'; g.fill(); g.restore();
      K.glow(x, y - bob, s * 1.2, C.head, 0.12 * (1 - dim));
      K.iconTile('sparkle', x, y - bob, s, { color: col, stroke: K.mixColor(C.line2, C.head, 0.45 * (1 - dim)) });
      const tool = o.tool || 'pen';
      if (tool === 'pen') {
        const bx = tip[0] - Math.cos(ang) * len, by = tip[1] - Math.sin(ang) * len;
        K.line(bx, by, tip[0] - Math.cos(ang) * 14, tip[1] - Math.sin(ang) * 14, { color: col, w: 8 });
        K.line(bx, by, bx + Math.cos(ang) * 16, by + Math.sin(ang) * 16, { color: C.page, w: 3, alpha: 0.6 });
        g.save(); g.translate(tip[0], tip[1]); g.rotate(ang); g.beginPath(); g.moveTo(0, 0); g.lineTo(-16, -5); g.lineTo(-16, 5); g.closePath();
        g.fillStyle = K.mixColor(C.paper, C.soft, dim); g.fill(); g.restore();
      } else if (tool === 'eraser') {
        eraser(tip[0], tip[1], { ang, s: 1, dim });
      }
      if (o.label) label(o.label, x, y + s / 2 + 48, { color: dim > 0.5 ? C.soft : C.head, ts: o.ts });
      if (o.badge) K.pill(o.badge, x, y - bob - s / 2 - 34, { size: 26, color: o.badgeColor ? o.badgeColor : C.page, fill: o.badgeColor ? C.tile : C.head, stroke: o.badgeColor || C.head });
    });
    return geo;
  }
  /** the walker: a cream person tile. o: {s (84), alpha, dim, label, look [x, y] (draws M.sight from its eyes),
   *  sightK, sightAlpha (.4 resting; 1 when reading), bob}. Returns {x, y, eye: [x, y]} */
  function walker(t, x, y, o = {}) {
    const s = o.s || 84, a = clamp01(pick(o.alpha, 1)), dim = clamp01(o.dim);
    const bob = o.bob === false ? 0 : K.wave(t, 1.7, s * 0.025, 1.3);
    const eye = [x, y - bob - s * 0.2];
    if (a <= 0.002) return { x, y, eye };
    const g = G(), col = K.mixColor(C.strong, C.soft, dim);
    K.layer(a * (1 - 0.6 * dim), () => {
      if (o.look) sight(eye[0], eye[1], o.look[0], o.look[1], { k: pick(o.sightK, 1), alpha: pick(o.sightAlpha, 0.4) });
      g.save(); g.beginPath(); g.ellipse(x, y + s * 0.62, s * 0.38, s * 0.07, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.32)'; g.fill(); g.restore();
      K.iconTile('person', x, y - bob, s, { color: col, stroke: K.mixColor(C.line2, C.strong, 0.3 * (1 - dim)) });
      if (o.label) label(o.label, x, y + s / 2 + 48, { color: dim > 0.5 ? C.soft : C.strong, ts: o.ts });
    });
    return { x, y, eye };
  }
  /** the walker's dashed sight-line, ending in a small open circle. o: {k, alpha (.4), color (cream), end (true)} */
  function sight(x1, y1, x2, y2, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 0.4)); if (k <= 0 || a <= 0.002) return;
    const col = o.color || C.strong;
    K.line(x1, y1, x2, y2, { k, color: col, w: 2.5, dash: [4, 9], alpha: a });
    if (o.end !== false && k > 0.95) { const g = G(); g.save(); g.globalAlpha *= a; g.beginPath(); g.arc(x2, y2, 9, 0, 7); g.lineWidth = 2.5; g.strokeStyle = col; g.stroke(); g.restore(); }
  }
  /** a speech bubble centred at (x, y) with a tail toward o.tail [x, y]. o: {k (rises 14 px and fades), size (28),
   *  font ('mono'), color, maxW (620, wraps), stroke, alpha, from: 'walker' (cream, default) | 'guide' (gold)}.
   *  Returns {w, h}. */
  function bubble(text, x, y, o = {}) {
    const size = o.size || 28, font = o.font || 'mono', to = { font, size, weight: font === 'mono' ? 400 : 600 };
    const lines = K.wrap(text, (o.maxW || 620) - 48, to), lh = size * 1.35;
    const w = Math.max(...lines.map((l) => K.measure(l, to))) + 48, h = lines.length * lh - (lh - size) + 36;
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * k;
    if (a <= 0.002) return { w, h };
    const g = G(), col = o.from === 'guide' ? C.head : C.strong, dy = (1 - K.ease.out(k)) * 14;
    K.layer(a, () => {
      g.save(); g.translate(0, dy);
      const x0 = x - w / 2, y0 = y - h / 2;
      if (o.tail) {
        const tx = o.tail[0], ty = o.tail[1] - dy, bx = K.clamp(tx, x0 + 30, x0 + w - 30), by = ty > y ? y0 + h - 2 : y0 + 2;
        g.beginPath(); g.moveTo(bx - 14, by); g.lineTo(tx, ty); g.lineTo(bx + 14, by); g.closePath();
        g.fillStyle = C.tile; g.fill(); g.lineWidth = 2; g.strokeStyle = o.stroke || K.rgba(col, 0.7); g.stroke();
      }
      K.card(x0, y0, w, h, { r: Math.min(26, h / 2), fill: C.tile, stroke: o.stroke || K.rgba(col, 0.7), lw: 2 });
      if (o.tail) { const tx = o.tail[0], ty = o.tail[1] - dy, bx = K.clamp(tx, x0 + 30, x0 + w - 30), by = ty > y ? y0 + h - 2 : y0 + 2; g.beginPath(); g.moveTo(bx - 12, by); g.lineTo(bx + 12, by); g.lineWidth = 4; g.strokeStyle = C.tile; g.stroke(); }
      lines.forEach((ln, i) => K.text(ln, x, y0 + 18 + size * 0.82 + i * lh, { ...to, color: o.color || C.strong, align: 'center' }));
      g.restore();
    });
    return { w, h };
  }

  // ---------------------------------------------------------------- the valley and the ranger station (the remote)
  /** the valley between your map and the station (x 1250-1330 on the sheet): two hatched edges and a darker gap.
   *  o: {k (draws top to bottom), y0, y1 (the sheet's inside), alpha} */
  function valley(o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)); if (k <= 0 || a <= 0.002) return;
    const y0 = pick(o.y0, L.sheet.y + 28), y1 = pick(o.y1, L.sheet.y + L.sheet.h - 28), x0 = L.valley.x0, x1 = L.valley.x1;
    const edge = (bx, sgn, ph) => { const pts = []; for (let i = 0; i <= 12; i++) { const f = i / 12; pts.push([bx + sgn * (Math.sin(f * 7 + ph) * 7 + Math.sin(f * 17 + ph) * 3), K.lerp(y0, y1, f)]); } return pts; };
    const e0 = edge(x0, 1, 0.3), e1 = edge(x1, -1, 2.1), g = G();
    K.layer(a, () => {
      g.save(); g.beginPath(); g.rect(x0 - 20, y0, x1 - x0 + 40, (y1 - y0) * k); g.clip();
      g.beginPath(); e0.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); [...e1].reverse().forEach((p) => g.lineTo(p[0], p[1])); g.closePath();
      const vg = g.createLinearGradient(x0, 0, x1, 0); vg.addColorStop(0, K.rgba(C.page, 0.12)); vg.addColorStop(0.5, K.rgba(C.page, 0.38)); vg.addColorStop(1, K.rgba(C.page, 0.12)); g.fillStyle = vg; g.fill();
      // hachures down each edge
      for (let i = 0; i < 26; i++) {
        const f = (i + 0.5) / 26, p0 = along(e0, f), p1 = along(e1, f);
        K.line(p0.x, p0.y, p0.x + 14, p0.y + 8, { color: C.line2, w: 1.5, alpha: 0.6 });
        K.line(p1.x, p1.y, p1.x - 14, p1.y + 8, { color: C.line2, w: 1.5, alpha: 0.6 });
      }
      g.restore();
      K.path(e0, { k, head: false, color: C.line2, w: 2, tension: 0.5 });
      K.path(e1, { k, head: false, color: C.line2, w: 2, tension: 0.5 });
    });
  }
  /** the ranger station: a card (default L.station) with a roof, a house icon and the eyebrow 'REMOTE · E.G. GITHUB',
   *  and inside a dashed replica of the path at y 560 holding copies of the pushed stones.
   *  o: {k (draws: card, roof, eyebrow, inner path), stones: [{id, state: 'copy' | 'solid' | 'empty', k, glow}]
   *  (slots left to right; 'empty' = an unpushed stone's place, a dashed '?'), solid 0..1 (the replica turns solid:
   *  'every copy is full and equal'), door: 'shield' | 'lock' | null, doorK, eyebrow (text), x, y, w, h, alpha, ts,
   *  dim}. Returns {x, y, w, h, slots: [[x, y], ...], door: [x, y], pathY}. */
  function station(t, o = {}) {
    const r = { x: pick(o.x, L.station.x), y: pick(o.y, L.station.y), w: pick(o.w, L.station.w), h: pick(o.h, L.station.h) };
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)), tsc = pick(o.ts, 1);
    const pathY = r.y + r.h * 0.62, n = Math.max(2, (o.stones || []).length);
    const slots = []; for (let i = 0; i < n; i++) slots.push([r.x + 80 + (i * (r.w - 160)) / (n - 1), pathY]);
    const door = [r.x + r.w / 2, r.y + r.h - 46];
    const geo = { ...r, slots, door, pathY };
    if (a <= 0.002 || k <= 0) return geo;
    const g = G(), kc = K.clamp(k / 0.45), kr = K.clamp((k - 0.3) / 0.35), kp = K.clamp((k - 0.55) / 0.45), sol = clamp01(o.solid);
    const edge = K.mixColor(P.station, C.head, 0.15 * sol);
    K.layer(a * (1 - 0.5 * clamp01(o.dim)), () => {
      K.layer(kc, () => K.card(r.x, r.y, r.w, r.h, { r: 24, fill: P.stationFill, stroke: edge, lw: 2 }));
      // roof: a shallow gable over the card
      if (kr > 0) {
        const rx0 = r.x - 18, rx1 = r.x + r.w + 18, ry = r.y + 4, apex = r.y - 58;
        K.layer(kr, () => { g.save(); g.beginPath(); g.moveTo(rx0, ry); g.lineTo(r.x + r.w / 2, apex); g.lineTo(rx1, ry); g.closePath(); g.fillStyle = P.stationFill; g.fill(); g.restore(); });
        K.path([[rx0, ry], [r.x + r.w / 2, apex], [rx1, ry]], { k: kr, head: false, tension: 0, color: K.mixColor(edge, C.body, 0.3), w: 3 });
        K.layer(kr, () => {
          K.icon('house', r.x + 44, r.y + 50, 40, { color: C.body, w: 2.4 });
          K.text(pick(o.eyebrow, 'remote · e.g. GitHub').toUpperCase(), r.x + 76, r.y + 58, { ...T.eyebrow, size: 22 * Math.min(tsc, 1.6), tracking: 2, color: C.head });
        });
      }
      if (kp > 0) {
        trail([[r.x + 36, pathY], [r.x + r.w - 36, pathY]], { kind: 'copy', k: kp, alpha: 1, w: K.lerp(3, 5, sol), dash: sol > 0.5 ? [20, 12] : [10, 9] });
        (o.stones || []).forEach((s, i) => {
          const st = s.state || 'copy';
          stone(slots[i][0], slots[i][1], { id: s.id, state: st === 'copy' && sol > 0.5 ? 'solid' : st, k: pick(s.k, kp), glow: s.glow, r: 22, ts: tsc, bg: P.stationFill, idSide: n >= 3 && i % 2 ? 'above' : 'below' });
        });
      }
      const dk = clamp01(pick(o.doorK, 1));
      if (o.door && dk > 0) K.layer(dk, () => {
        const dy = (1 - K.ease.out(dk)) * -18;
        g.save(); g.beginPath(); g.arc(door[0], door[1] + dy, 30, 0, 7); g.fillStyle = C.page; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.head; g.stroke(); g.restore();
        K.icon(o.door, door[0], door[1] + dy, 36, { color: C.head, w: 2.6 });
      });
    });
    return geo;
  }

  // ---------------------------------------------------------------- footprints: the verb and the target
  /** a pair of footprints at (x, y), walking at angle ang (radians, 0 = to the right). o: {k (stamps: drops from
   *  1.25x and settles), color (C.head; C.accent for 'never named'), s (1.25: about 80 x 45 px), alpha} */
  function prints(x, y, o = {}) {
    o = { s: 1.25, ...o };
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * Math.min(1, k * 2); if (a <= 0.002) return;
    const col = o.color || C.head, s = (o.s || 1) * (1.25 - 0.25 * K.ease.out(k)), g = G();
    // a boot sole: a rounded forefoot and a separate heel, pointing along +x (the walking direction)
    const foot = (dx, dy, mirror) => {
      g.save(); g.translate(dx, dy); if (mirror) g.scale(1, -1); g.rotate(-0.08);
      g.beginPath(); g.moveTo(-2, -8); g.bezierCurveTo(10, -12, 24, -10, 25, -1); g.bezierCurveTo(26, 8, 12, 10, -2, 7); g.bezierCurveTo(-6, 4, -6, -5, -2, -8); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(-16, -0.5, 7.5, 6.8, 0, 0, 7); g.fill();
      g.restore();
    };
    K.layer(a, () => K.at(x, y, s, o.ang || 0, () => {
      g.fillStyle = K.rgba(col, 0.88); foot(-18, -11, false); foot(18, 11, true);
    }));
  }
  /** one step of the trail: prints at (x, y) plus its words. A verb pill (Karla 26) sits above the prints; an
   *  arrow runs from it to a mono target pill at o.targetAt (default 150 px above). Or o.compact: one pill
   *  'verb → target' above the prints. o: {verb, target, k (prints), verbK, targetK (arrow + target), off (all
   *  terracotta), ang, targetAt [x, y], bend (arrow bend), ts, alpha, ring 0..1 (a terracotta circle round the
   *  print)}. Returns {verb: [x, y], target: [x, y]} */
  function step(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)), tsc = pick(o.ts, 1), col = o.off ? C.accent : C.head;
    const vy = y - 62 * tsc, tg = o.targetAt || [x, y - 150 * tsc];
    const geo = { verb: [x, vy], target: tg };
    if (a <= 0.002) return geo;
    K.layer(a, () => {
      prints(x, y, { k: pick(o.k, 1), color: col, ang: o.ang });
      const rk = clamp01(o.ring); if (rk > 0) K.ring(x, y, 74, 48, rk, { color: C.accent, w: 3 });
      if (o.compact) {
        const vk = clamp01(pick(o.verbK, 1));
        if (vk > 0) K.layer(vk, () => K.pill(`${o.verb || ''} → ${o.target || ''}`, x, vy - (1 - K.ease.out(vk)) * 10, { size: 26 * tsc, color: o.off ? C.accent : C.strong, stroke: o.off ? C.accent : C.line2 }));
        return;
      }
      const vk = clamp01(pick(o.verbK, 1)), tk = clamp01(pick(o.targetK, 1));
      if (o.verb && vk > 0) K.layer(vk, () => K.pill(o.verb, x, vy - (1 - K.ease.out(vk)) * 10, { size: 26 * tsc, color: o.off ? C.accent : C.strong, stroke: o.off ? C.accent : C.line2 }));
      if (o.target && tk > 0) {
        const up = tg[1] < vy, sy0 = vy + (up ? -26 : 26) * tsc, sy1 = tg[1] + (up ? 26 : -26) * tsc;
        K.arrow(x, sy0, tg[0], sy1, { k: K.clamp(tk * 1.6), color: col, w: 2.5, headSize: 11, bend: pick(o.bend, 0) });
        K.layer(K.clamp(tk * 2 - 0.8), () => K.pill(o.target, tg[0], tg[1], { size: 26 * tsc, font: 'mono', color: o.off ? C.accent : C.head, stroke: o.off ? C.accent : K.mixColor(C.line2, C.head, 0.4) }));
      }
    });
    return geo;
  }

  // ---------------------------------------------------------------- tracing paper (the diff), the eraser, the board
  /** a sheet of tracing paper over (x, y, w, h). o: {k (lowers 40 px and fades in; 1 = resting), alpha (.25),
   *  label (eyebrow, top-left), lift 0..1 (lifts away up-right)} */
  function tracing(x, y, w, h, o = {}) {
    const k = clamp01(pick(o.k, 1)), lift = clamp01(o.lift), a = clamp01(pick(o.alpha, 1)) * k * (1 - lift);
    if (a <= 0.002) return;
    const g = G(), dy = -(1 - K.ease.out(k)) * 40 - lift * 60, dx = lift * 60, fold = 46;
    K.layer(a, () => {
      g.save(); g.translate(dx, dy);
      g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 50; g.shadowOffsetY = 16;
      g.beginPath(); g.moveTo(x + 18, y); g.lineTo(x + w - 18, y); g.quadraticCurveTo(x + w, y, x + w, y + 18); g.lineTo(x + w, y + h - fold);
      g.lineTo(x + w - fold, y + h); g.lineTo(x + 18, y + h); g.quadraticCurveTo(x, y + h, x, y + h - 18); g.lineTo(x, y + 18); g.quadraticCurveTo(x, y, x + 18, y); g.closePath();
      g.fillStyle = K.rgba(C.paper, 0.11); g.fill();
      g.shadowColor = 'transparent'; g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.paper, 0.4); g.stroke();
      g.save(); g.clip(); g.strokeStyle = K.rgba(C.paper, 0.06); g.lineWidth = 1;   // a faint drafting grid
      for (let gx = x + 40; gx < x + w; gx += 40) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
      for (let gy = y + 40; gy < y + h; gy += 40) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
      g.restore(); g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.paper, 0.4);
      // the curled corner
      g.beginPath(); g.moveTo(x + w, y + h - fold); g.quadraticCurveTo(x + w - fold * 0.8, y + h - fold * 0.8, x + w - fold, y + h); g.closePath();
      g.fillStyle = K.rgba(C.paper, 0.32); g.fill(); g.stroke();
      if (o.label) K.text(o.label.toUpperCase(), x + 30, y + 44, { ...T.eyebrow, color: C.paper, alpha: 0.85 });
      g.restore();
    });
  }
  /** a diff mark drawn on the tracing paper: '+' (gold, added), '-' (terracotta, removed), 'square' (a terracotta
   *  square: a changed file you never asked about). o: {k (pops), s (34), alpha, label} */
  function diff(kind, x, y, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * Math.min(1, k * 2); if (a <= 0.002) return;
    const s = (o.s || 34) * (0.7 + 0.3 * K.ease.out(k)), col = kind === '+' ? C.head : C.accent, g = G();
    K.layer(a, () => {
      g.save(); g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = Math.max(4, s * 0.16);
      if (kind === 'square') { g.fillStyle = K.rgba(col, 0.14); g.beginPath(); g.rect(x - s / 2, y - s / 2, s, s); g.fill(); g.lineWidth = 3; g.stroke(); }
      else { g.beginPath(); g.moveTo(x - s / 2, y); g.lineTo(x + s / 2, y); if (kind === '+') { g.moveTo(x, y - s / 2); g.lineTo(x, y + s / 2); } g.stroke(); }
      g.restore();
      if (o.label) label(o.label, x, y + s / 2 + 34 * pick(o.ts, 1), { color: col, ts: o.ts });
    });
  }
  /** the guide's eraser: a cream block with a tile-coloured sleeve, at (x, y) (its rubbing end), angle ang.
   *  o: {ang, s (1), rub 0..1 (rubs back and forth; pass t-driven motion through x yourself, rub adds crumbs),
   *  t, dim, alpha} */
  function eraser(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    const s = o.s || 1, g = G(), dim = clamp01(o.dim), ang = pick(o.ang, -0.75);
    K.layer(a, () => {
      K.at(x, y, s, ang, () => {
        // body extends back from the rubbing end (local -x)
        K.card(-74, -17, 74, 34, { r: 9, fill: K.mixColor(C.paper, C.soft, 0.15 + dim * 0.4), stroke: K.mixColor(C.paperShade, C.soft, 0.4), lw: 1.5, shadow: false });
        g.save(); g.fillStyle = K.mixColor(C.tile, C.head, 0.25); g.fillRect(-60, -17, 22, 34); g.restore();
        K.line(-60, -17, -60, 17, { color: C.line2, w: 1.5 }); K.line(-38, -17, -38, 17, { color: C.line2, w: 1.5 });
      });
      const rub = clamp01(o.rub);
      if (rub > 0) {
        const rnd = K.rng(77 + Math.floor(pick(o.t, 0) * 6));
        for (let i = 0; i < 6; i++) { g.save(); g.globalAlpha *= 0.7 * rub; g.fillStyle = C.paperShade; g.beginPath(); g.ellipse(x + (rnd() - 0.5) * 50, y + 12 + rnd() * 18, 3 + rnd() * 3, 1.6 + rnd() * 1.5, rnd() * 3, 0, 7); g.fill(); g.restore(); }
      }
    });
  }
  /** the noticeboard by the road (a public remote): a SQUARE board on two legs, terracotta frame, with a small copy
   *  of the map pinned on it. o: {k (draws), x, y, w, h (L.board), pinned 0..1, tag (text on a hanging tag, e.g.
   *  'public' or '?'), tagColor, tagK, t, alpha}. Returns {x, y, w, h, tag: [x, y]} */
  function board(t, o = {}) {
    const r = { x: pick(o.x, L.board.x), y: pick(o.y, L.board.y), w: pick(o.w, L.board.w), h: pick(o.h, L.board.h) };
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)), tagP = [r.x + r.w / 2, r.y + r.h + 44];
    const geo = { ...r, tag: tagP };
    if (a <= 0.002 || k <= 0) return geo;
    const g = G();
    K.layer(a, () => {
      const lk = K.clamp(k / 0.4), bk = K.clamp((k - 0.25) / 0.5);
      [r.x + 40, r.x + r.w - 40].forEach((lx) => K.line(lx, r.y + r.h, lx, K.lerp(r.y + r.h, r.y + r.h + 80, lk), { color: C.soft, w: 6 }));
      K.layer(bk, () => {
        K.card(r.x, r.y, r.w, r.h, { r: 4, fill: K.mixColor(C.tile, C.head, 0.06), stroke: C.accent, lw: 3 });
        g.save(); g.strokeStyle = K.rgba(C.accent, 0.3); g.lineWidth = 1; g.strokeRect(r.x + 10, r.y + 10, r.w - 20, r.h - 20); g.restore();
      });
      const pk = clamp01(pick(o.pinned, 1)) * bk;
      if (pk > 0) miniMap(t, r.x + r.w / 2 - 80, r.y + 36, 160, 110, { k: pk, rot: -0.04, pin: true });
      const tk = clamp01(pick(o.tagK, 1)) * bk;
      if (o.tag && tk > 0) K.layer(tk, () => K.at(tagP[0], r.y + r.h, 1, K.wave(pick(o.t, t), 1.1, 0.04), () => {
        K.line(0, 0, 0, 22, { color: C.soft, w: 2 });
        K.pill(o.tag, 0, 44, { size: 26, color: o.tagColor || C.accent, stroke: o.tagColor || C.accent, fill: C.tile });
      }));
    });
    return geo;
  }

  // ---------------------------------------------------------------- small map glyphs
  /** a small map (x, y, w, h): sheet, a gold path, 3 stones, a signpost; for the burnt second map, the pinned copy,
   *  the Lovable card, the end card. o: {k (fades/scales in), stones (3), sign (true: a tiny signpost), lantern 0..1,
   *  grey 0..1 (greys out), curl 0..1 (the lower-right corner curls up and burns), rot, pin (a pushpin on top),
   *  label (mono under it), labelAlpha, alpha} */
  function miniMap(t, x, y, w, h, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * k; if (a <= 0.002) return;
    const g = G(), grey = clamp01(o.grey), curl = clamp01(o.curl);
    const gold = K.mixColor(C.head, C.soft, grey), sheetC = K.mixColor(P.sheet, C.panel, grey * 0.5);
    K.layer(a, () => K.at(x + w / 2, y + h / 2, 0.9 + 0.1 * K.ease.out(k), o.rot || 0, () => {
      const x0 = -w / 2, y0 = -h / 2, c = Math.min(w, h) * 0.42 * curl;
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
      g.beginPath(); g.moveTo(x0 + 8, y0); g.lineTo(x0 + w - 8, y0); g.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + 8); g.lineTo(x0 + w, y0 + h - c);
      g.lineTo(x0 + w - c, y0 + h); g.lineTo(x0 + 8, y0 + h); g.quadraticCurveTo(x0, y0 + h, x0, y0 + h - 8); g.lineTo(x0, y0 + 8); g.quadraticCurveTo(x0, y0, x0 + 8, y0); g.closePath();
      g.fillStyle = sheetC; g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 1.5; g.strokeStyle = K.mixColor(P.sheetEdge, C.accent, curl * 0.6); g.stroke(); g.restore();
      if (curl > 0) {   // the curled, scorched corner
        g.save(); g.beginPath(); g.moveTo(x0 + w, y0 + h - c); g.quadraticCurveTo(x0 + w - c * 1.1, y0 + h - c * 1.1, x0 + w - c, y0 + h); g.closePath();
        g.fillStyle = K.mixColor(C.tile, C.accent, 0.25); g.fill(); g.strokeStyle = K.rgba(C.accent, 0.7); g.lineWidth = 2; g.stroke(); g.restore();
      }
      const py = y0 + h * 0.62, n = o.stones || 3, pts = [[x0 + w * 0.12, py], [x0 + w * 0.88, py]];
      K.path(pts, { head: false, color: gold, w: 3, dash: [8, 6] });
      for (let i = 0; i < n; i++) {
        const sx = x0 + w * (0.24 + (0.52 * i) / Math.max(1, n - 1));
        g.save(); g.beginPath(); g.arc(sx, py, Math.max(5, h * 0.07), 0, 7); g.fillStyle = C.tile; g.fill(); g.lineWidth = 2; g.strokeStyle = gold; g.stroke(); g.restore();
      }
      if (o.sign !== false) {
        const sx = x0 + w * 0.76 - 10;
        K.line(sx, py - 6, sx, py - h * 0.36, { color: K.mixColor(C.soft, C.strong, 0.3 * (1 - grey)), w: 2.5 });
        g.save(); g.fillStyle = P.plank; g.strokeStyle = K.mixColor(C.strong, C.soft, grey); g.lineWidth = 1.5;
        g.beginPath(); g.rect(sx - 4, py - h * 0.36 - 12, w * 0.2, 14); g.fill(); g.stroke(); g.restore();
        const lk = clamp01(o.lantern);
        if (lk > 0) lantern(t, sx - 16, py - h * 0.36 + 2, { k: lk, s: Math.max(18, h * 0.22) });
      }
      if (o.pin) { g.save(); g.beginPath(); g.arc(0, y0 + 2, 7, 0, 7); g.fillStyle = C.accent; g.fill(); g.restore(); }
    }));
    if (o.label) label(o.label, x + w / 2, y + h + 36, { ...T.mono, color: K.mixColor(C.body, C.soft, grey), alpha: a * pick(o.labelAlpha, 1) });
  }
  /** the title-card emblem, centred at (cx, cy), scale s (1 = about 360 x 150): a short gold path, three stones
   *  (o.stonesK(i) or o.k), a signpost with the lantern. o: {k, stonesK: (i) => 0..1, run 0..1 (a small gold
   *  arrow runs along the path), dip 0..1 (the lantern dims once), lantern 0..1, alpha} */
  function emblem(t, cx, cy, o = {}) {
    const s = o.s || 1, a = clamp01(pick(o.alpha, 1)) * clamp01(pick(o.k, 1)); if (a <= 0.002) return;
    K.layer(a, () => K.at(cx, cy, s, 0, () => {
      const pts = [[-210, 30], [-90, 22], [30, 32], [150, 26]];
      trail(pts, { kind: 'main', w: 4 });
      [[-160, 27], [-50, 25], [60, 31]].forEach((p, i) => stone(p[0], p[1], { r: 17, k: o.stonesK ? o.stonesK(i) : 1 }));
      const run = clamp01(o.run);
      if (run > 0 && run < 1) { const p = along(pts, run); K.at(p.x, p.y - 34, 1, 0, () => K.arrow(-22, 0, 10, 0, { color: C.head, w: 3, headSize: 10 })); }
      signpost('main', 96, 4, { h: 92, lantern: pick(o.lantern, 1), dip: o.dip, lanternS: 44, t, k: 1 });
    }));
  }

  // ---------------------------------------------------------------- captures
  /** the terminal window for the three captures (Git Bash · demo-site) at L.term. o: {alpha, title, x, y, w, h,
   *  k (0..1 opens: rises 20 px and fades)}. Returns the content rect for K.termReplay. */
  function term(o = {}) {
    const r = { x: pick(o.x, L.term.x), y: pick(o.y, L.term.y), w: pick(o.w, L.term.w), h: pick(o.h, L.term.h) };
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)) * k;
    const dy = (1 - K.ease.out(k)) * 20;
    return K.win(r.x, r.y + dy, r.w, r.h, { kind: 'terminal', title: o.title || 'Git Bash · demo-site', titleSize: 26, alpha: a, focus: o.focus });
  }
  /** the 7-character short ID printed by command `item` of capture `name` (the first output line matching `match`,
   *  a string or RegExp; default any line with an ID). '' when the capture is missing. */
  function capId(name, item, match) {
    const c = K.capture(name), cmd = c && c.commands && c.commands[item];
    if (!cmd) return '';
    for (const ln of cmd.out || []) {
      const s = Array.isArray(ln) ? ln[1] : ln.s;
      if (match && !(match instanceof RegExp ? match.test(s) : s.indexOf(match) >= 0)) continue;
      const m = /\b([0-9a-f]{7,})\b/.exec(s); if (m) return m[1].slice(0, 7);
    }
    return '';
  }
  /** the real short IDs of this lesson's commits, read from the captures (they change on every re-record):
   *  save-points: home, about (main), contact, phone (feature/contact), merge; copy-elsewhere: first, second;
   *  changed-files: was, fix. */
  function ids() {
    return {
      home: capId('save-points', 3), about: capId('save-points', 6), contact: capId('save-points', 10), phone: capId('save-points', 12),
      merge: capId('save-points', 15, 'HEAD -> main'),
      first: capId('copy-elsewhere', 3), second: capId('copy-elsewhere', 10),
      was: capId('changed-files', 4), fix: capId('changed-files', 8),
    };
  }
  /** a gold link from a map stone to a terminal mark (screen coordinates: convert with M.toScreen). o: {k, alpha} */
  function link(x1, y1, x2, y2, o = {}) {
    const k = clamp01(pick(o.k, 1)); if (k <= 0) return;
    K.line(x1, y1, x2, y2, { k, color: C.head, w: 2, alpha: pick(o.alpha, 0.8) });
    const g = G(); g.save(); g.globalAlpha *= pick(o.alpha, 0.8); g.fillStyle = C.head;
    g.beginPath(); g.arc(x1, y1, 4.5, 0, 7); g.fill(); if (k >= 1) { g.beginPath(); g.arc(x2, y2, 4.5, 0, 7); g.fill(); } g.restore();
  }

  // ---------------------------------------------------------------- dated cards and chips
  /** a dated source card: eyebrow = who · when (gold), body = their words (Georgia 30, quoted when o.quote), optional
   *  mono footer pill (footer: true = 'read 2026-10-23 · this moves monthly'). o: {eyebrow, body, size (30), quote,
   *  italic, footer, alpha, never (terracotta outline), glow, measure (only return the height)}. Default place: the
   *  top-right band (M.L.cards). Returns the height. */
  function dated(x, y, w, o = {}) {
    const size = o.size || 30, pad = 30, lh = size * 1.36;
    const body = o.body == null ? '' : o.quote ? '“' + o.body + '”' : o.body;
    const eb = o.eyebrow ? K.wrap(String(o.eyebrow).toUpperCase(), w - pad * 2, T.eyebrow) : [];
    const lines = body ? K.wrap(body, w - pad * 2, { ...T.read, size, italic: o.italic }) : [];
    const footer = o.footer === true ? MOVES : o.footer;
    const ebH = eb.length ? eb.length * 32 + 12 : 0, bodyH = lines.length ? lines.length * lh - (lh - size) : 0;
    const h = pad * 2 + ebH + bodyH + (footer ? 66 : 0);
    if (o.measure) return h;
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return h;
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 24, glow: o.glow, stroke: o.never ? C.accent : C.line2, lw: o.never ? 2.5 : 1.5 });
      eb.forEach((ln, i) => K.text(ln, x + pad, y + pad + 20 + i * 32, { ...T.eyebrow, color: C.head }));
      lines.forEach((ln, i) => K.text(ln, x + pad, y + pad + ebH + size * 0.8 + i * lh, { ...T.read, size, italic: o.italic, color: C.strong }));
      if (footer) pillL(footer, x + pad, y + pad + ebH + bodyH + 40, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel });
    });
    return h;
  }
  /** a small dated pill ('2026-09-25 · auto mode'), left edge at x; o: {alpha, align, color, glow}; returns width */
  function chip(text, x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    return pillL(text, x, y, { size: 26, font: 'mono', weight: 400, color: o.color || C.body, fill: C.panel, stroke: o.color || C.line2, alpha: a, align: o.align, glow: o.glow });
  }
  /** terracotta eyebrow 'WHERE THE PICTURE BREAKS' with a warning glyph; o: {alpha, align 'center', text}; width */
  function breaks(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    const s = o.text || 'where the picture breaks', tw = K.measure(s.toUpperCase(), { ...T.eyebrow, size: 26 }), w = tw + 44;
    const x0 = o.align === 'center' ? x - w / 2 : x;
    K.icon('warning', x0 + 15, y - 9, 30, { color: C.accent, alpha: a, w: 2.6 });
    K.text(s, x0 + 44, y, { ...T.eyebrow, size: 26, color: C.accent, alpha: a });
    return w;
  }
  /** pointer chip to the lesson that owns a topic: '→ the lesson on keys' (by what it teaches, never a number).
   *  o: {alpha, align}; returns its width */
  function pointer(text, x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    return pillL('→ ' + text, x, y, { size: 26, color: C.body, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.3), alpha: a, align: o.align });
  }
  /** a column of short rows (scene 13): eyebrow head, then rows of Karla 30 text with a small gold tick; o: {k:
   *  (i) => 0..1 per row (head is row -1), color, head, size (30), gap (18), icon (per-row K.icon name or null),
   *  headColor}. Returns the total height. */
  function rows(x, y, w, items, o = {}) {
    const size = o.size || 30, lh = size * 1.32, gap = o.gap == null ? 18 : o.gap, kf = o.k || (() => 1);
    let yy = y;
    if (o.head) { const hk = clamp01(kf(-1)); if (hk > 0) K.text(o.head.toUpperCase(), x, yy + 22, { ...T.eyebrow, size: 26, color: o.headColor || C.head, alpha: hk }); yy += 56; }
    items.forEach((it, i) => {
      const lines = K.wrap(it, w - 44, { font: 'ui', size, weight: 400 }), h = lines.length * lh;
      const k = clamp01(kf(i));
      if (k > 0) K.layer(k, () => {
        const dx = (1 - K.ease.out(k)) * 14;
        K.icon(o.icon === undefined ? 'check' : o.icon || 'check', x + 14 + dx, yy + size * 0.5, 24, { color: o.color || C.head, alpha: o.icon === null ? 0 : 1, w: 3 });
        lines.forEach((ln, j) => K.text(ln, x + 44 + dx, yy + size * 0.85 + j * lh, { font: 'ui', size, weight: 400, color: C.strong }));
      });
      yy += h + gap;
    });
    return yy - y;
  }

  // ---------------------------------------------------------------- title card and end card
  const lessonDef = () => window.__lesson || {};
  // the end card's rows (storyboard 14); lesson.js keep[i][1] is the page's longer wording (o.full)
  const KEEP = [
    'Commits are save points, branches are names on them, a remote is the copy elsewhere; you know which branch is live.',
    'Ask about anything aimed at something you never named.',
    'Find the file you never asked about; have it show what it ran and what came back.',
  ];
  const groupName = (who) => { const m = /^(.*?) \((.*)\)$/.exec(who); return m ? [m[1], m[2]] : [who, null]; };
  /** the credit line, built from lesson.js credits. o: {preset: 'title' (default: 'Built on Anthropic, Best practices
   *  for Claude Code · Lovable, Git sync docs') | 'end' ('Built on Anthropic (Claude Code docs) · Lovable (Git sync
   *  docs) · Aaron Orelup (AO-043)'), ids (credit ids to name instead), lead ('Built on'), more (true on 'end':
   *  '· all N sources and dates on the lesson page'), align 'left' | 'center', size (26), color (C.soft), alpha,
   *  measure}. Returns the height of the wrapped line(s). */
  function credits(x, y, w, o = {}) {
    const cr = lessonDef().credits || [], preset = o.preset || 'title';
    const find = (id) => cr.find((e) => e.id === id);
    let parts;
    if (o.ids) {
      const seen = {}; parts = [];
      o.ids.forEach((id) => { const c = find(id); if (!c) return; const [base, sub] = groupName(c.who); const key = base + (sub ? ' (' + sub + ')' : ''); if (!seen[key]) { seen[key] = 1; parts.push(key); } });
    } else if (preset === 'end') {
      const ao = find('S026'), ln = find('S212');
      const aoNum = ao && /AO-\d+/.exec(ao.title);
      parts = ['Anthropic (Claude Code docs)', ln ? `${ln.who} (${ln.title} docs)` : null, ao ? `${ao.who}${aoNum ? ' (' + aoNum[0] + ')' : ''}` : null].filter(Boolean);
    } else {
      const bp = find('S117'), ln = find('S212');
      parts = [bp ? `${groupName(bp.who)[0]}, ${bp.title}` : null, ln ? `${ln.who}, ${ln.title} docs` : null].filter(Boolean);
    }
    let s = `${pick(o.lead, 'Built on')} ${parts.join(' · ')}`;
    if (pick(o.more, preset === 'end') && cr.length) s += ` · all ${cr.length} sources and dates on the lesson page`;
    const to = { font: 'ui', weight: 400, size: o.size || 26 }, lh = (o.size || 26) * 1.4;
    const lines = K.wrap(s, w, to);
    if (o.measure) return lines.length * lh;
    const a = clamp01(pick(o.alpha, 1));
    if (a > 0.002) lines.forEach((ln, i) => K.text(ln, o.align === 'center' ? x + w / 2 : x, y + i * lh, { ...to, color: o.color || C.soft, align: o.align === 'center' ? 'center' : 'left', alpha: a }));
    return lines.length * lh;
  }
  /** every credit in lesson.js as a compact list in `cols` columns (who · date, mono date): an optional full roll
   *  for the end card. o: {cols (2), size (26), alpha, k: (i) => 0..1, gap (40)}. Returns the height. */
  function creditRoll(x, y, w, o = {}) {
    const cr = lessonDef().credits || [], cols = o.cols || 2, size = o.size || 26, lh = size * 1.45, gap = o.gap || 40;
    const cw = (w - gap * (cols - 1)) / cols, per = Math.ceil(cr.length / cols), kf = o.k || (() => 1), a = clamp01(pick(o.alpha, 1));
    if (a > 0.002) cr.forEach((c, i) => {
      const col = Math.floor(i / per), row = i % per, k = clamp01(kf(i)); if (k <= 0) return;
      const xx = x + col * (cw + gap), yy = y + row * lh, dw = K.measure(c.date, { font: 'mono', size: size - 2 });
      const who = groupName(c.who)[0] === 'Anthropic' ? `Anthropic · ${c.title}` : c.who.replace(/,? repl(y|ies) by .*$/, '').replace(/ \(.*\)$/, '');
      const lines = K.wrap(who, cw - dw - 24, { font: 'ui', size });
      K.text(lines[0] + (lines.length > 1 ? '…' : ''), xx, yy, { font: 'ui', size, color: C.body, alpha: a * k });
      K.text(c.date, xx + cw, yy, { font: 'mono', size: size - 2, color: C.soft, align: 'right', alpha: a * k });
    });
    return per * lh;
  }
  /** one keep-this row (storyboard 14): bold lead Karla 34 C.head from lesson.js keep[i][0], body Georgia 30 cream
   *  (M.KEEP[i]; o.full: lesson.js keep[i][1]; o.lead / o.body override). o: {k (rises 16 px and fades), glyph
   *  (draws at the left: 'stone' | 'step' | 'tracing'), glyphX (x - 90), t, gap (30)}. Returns its height. */
  function keep(i, x, y, w, o = {}) {
    const kp = (lessonDef().keep || [])[i] || ['', ''];
    const lead = pick(o.lead, kp[0]), body = pick(o.body, o.full ? kp[1] : KEEP[i] || kp[1]);
    const k = clamp01(pick(o.k, 1));
    const lines = K.wrap(body, w, { ...T.read, size: 30 });
    const h = 46 + lines.length * 42 + (o.gap == null ? 30 : o.gap);
    if (k <= 0.002) return h;
    K.layer(k, () => K.at(0, (1 - K.ease.out(k)) * 16, 1, 0, () => {
      K.text(lead, x, y + 34, { font: 'ui', weight: 600, size: 34, color: C.head });
      lines.forEach((ln, j) => K.text(ln, x, y + 46 + 32 + j * 42, { ...T.read, size: 30, color: C.strong }));
      const gx = pick(o.glyphX, x - 90), gy = y + 50;
      if (o.glyph === 'stone') { K.line(gx - 40, gy + 22, gx + 40, gy + 22, { color: C.head, w: 3, dash: [9, 7] }); stone(gx, gy + 22, { r: 18 }); lantern(pick(o.t, 0), gx + 30, gy - 44, { s: 34 }); }
      else if (o.glyph === 'step') prints(gx, gy + 6, { color: C.head, ang: -0.3, s: 1.1 });
      else if (o.glyph === 'tracing') { const g = G(); g.save(); g.fillStyle = K.rgba(C.paper, 0.18); g.strokeStyle = K.rgba(C.paper, 0.45); g.lineWidth = 1.5; g.fillRect(gx - 32, gy - 30, 64, 64); g.strokeRect(gx - 32, gy - 30, 64, 64); g.restore(); diff('square', gx + 8, gy + 8, { s: 22 }); diff('+', gx - 12, gy - 10, { s: 20 }); }
    }));
    return h;
  }

  window.M = {
    P, T, L, VIEW, KEEP, READ, MOVES,
    ts, toScreen,
    sheet, compass, trail, mainPath, MAIN,
    stone, back, signpost, signFor, lantern, visitors,
    guide, walker, sight, bubble,
    valley, station,
    prints, step,
    tracing, diff, eraser, board,
    miniMap, emblem,
    term, capId, ids, link,
    dated, chip, breaks, pointer, rows,
    credits, creditRoll, keep,
    along, pillL, label, dashedCircle,
  };
})();
