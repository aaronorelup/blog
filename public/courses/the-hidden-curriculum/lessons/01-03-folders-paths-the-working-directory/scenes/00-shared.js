/* 01.03 Folders, paths & the working directory — shared drawing (window.M)
   The lesson's one recurring object is THE MAP:
     the disk is a large indigo card (K.card) with a gold ROOT edge along its top (the hairline at y 200),
     a "root" label above it, "the disk" in its top-left corner;
     the working directory is the gold YOU-ARE-HERE DOT (K.glow, radius 22) on the map.
   Every scene draws the same card at the same spot (M.frame), so the dot is what moves.
   Two-map scenes (06, 10) use M.framePair: the same card shape, left and right, with a dot on each.
   The agent (10) gets its own copy of the card and a lantern above it (M.agentLantern).
   Smaller variants: M.band (the map shrunk to a thin strip for section 09), M.dotCopies (the dot splits, 07).

   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call because the runtime swaps canvases.
   Colours: gold (C.head) = the dot, the root edge and every path; cream (C.strong) = labels and literal text;
   terracotta (C.accent) = a miss, an error, the agent; C.soft / C.line2 = dimmed or sandboxed things.
   Pink is never used here (decoration only, on the title and end cards). */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const TAU = Math.PI * 2;
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);
  const G = () => K.ctx();

  // ---------------------------------------------------------------- palette and type
  const P = {
    dot: C.head,            // the working directory
    dotRing: C.gold,
    root: C.head,           // the root edge, root label, the disk-label eyebrow
    card: C.panel,          // the map card fill (#15172A on the #101220 page)
    cardLine: C.line2,
    ink: C.strong,          // labels, literal text, commands
    body: C.body,           // secondary labels
    dim: C.soft,            // ghosts, dimmed things, the crossed-out dashed line
    quiet: C.quiet,
    path: C.head,           // every route on the map is gold
    pathDim: C.soft,
    miss: C.accent,         // "no such file", error marks, the crossed-out file
    agent: C.accent,        // the agent's lantern and its tools
    pillFill: C.tile,
    pillLine: C.line2,
    codeFill: C.code,       // error cards and terminal bodies
  };
  // sizes: 26 px labels (minimum), 30 px for anything read; mono for literal names, paths and errors
  const T = {
    label: { font: 'ui', weight: 600, size: 26 },
    labelBig: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 30 },
    monoSm: { font: 'mono', weight: 600, size: 26 },
    eyebrow: { font: 'ui', weight: 600, size: 26, tracking: 3, upper: true },
    read: { font: 'read', weight: 400, size: 30 },
  };

  // ---------------------------------------------------------------- layout (canvas 1920x1080)
  const L = {
    card: { x: 380, y: 200, w: 1160, h: 690 },   // the single map, centre of the frame
    left: { x: 80, y: 200, w: 820, h: 690 },     // two maps side by side (06, 10)
    right: { x: 1020, y: 200, w: 820, h: 690 },
    band: { x: 380, y: 160, w: 1160, h: 70 },    // the map shrunk to a strip (09)
    dot: { x: 960, y: 520 },                     // the dot on the single map
    dotL: { x: 490, y: 520 },                    // the dot on the left map
    dotR: { x: 1430, y: 520 },                   // the dot on the right map
    root: { x: 960, y: 200 },                    // the root edge's centre
    rootLabel: { x: 960, y: 170 },
    diskLabel: { x: 420, y: 240 },               // "the disk", top-left inside the card
    pillDrive: { x: 650, y: 240 },               // "C:\" pill: moved right of "the disk" label (storyboard's 560 overlaps it)
    pillSlash: { x: 1300, y: 240 },              // "/" pill, top right of the card
    term: { x: 80, y: 780, w: 900, h: 130 },     // the PowerShell strip (05)
    safe: { x0: 80, y0: 130, x1: 1840, y1: 930 },
  };

  // ---------------------------------------------------------------- primitives
  /** a pill label centred at (x, y). o: {size, mono, color, fill, stroke, glow (0..1 gold), lit (gold outline), alpha}
   *  returns its width (use it for layout) */
  function pill(s, x, y, o = {}) {
    const size = o.size || 26;
    const to = o.mono ? { font: 'mono', weight: 600, size } : { font: 'ui', weight: 600, size };
    const w = K.measure(s, to) + size * 1.6, h = size * 1.9;
    K.layer(clamp01(pick(o.alpha, 1)), () => {
      K.card(x - w / 2, y - h / 2, w, h, {
        r: h / 2, fill: o.fill || P.pillFill, stroke: o.stroke || (o.lit ? P.path : P.pillLine),
        glow: clamp01(o.glow), shadow: false,
      });
      K.text(s, x, y + size * 0.34, { ...to, color: o.color || P.ink, align: 'center' });
    });
    return w;
  }
  /** literal address or path in a mono pill (30 px), e.g. "C:\" or "/" */
  const addressPill = (s, x, y, o = {}) => pill(s, x, y, { ...o, mono: true, size: pick(o.size, 30) });

  /** a single-line label centred or left at (x, y), 26 px ui by default; returns width */
  function label(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.label, color: o.color || P.body, align: o.align || 'center', alpha: o.alpha, weight: o.weight || 600, size: o.size || 26, font: o.font || 'ui' });
  }
  /** a 26 px gold eyebrow (upper case), centred by default */
  function eyebrow(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.eyebrow, color: o.color || P.root, align: o.align || 'center', alpha: o.alpha });
  }
  /** a literal line in mono 30 px (paths, commands, errors); align 'left' by default, pass 'center' for centred */
  function mono(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.mono, color: o.color || P.ink, align: o.align || 'left', alpha: o.alpha, size: o.size || 30 });
  }
  /** a reading line (Georgia 30 px); the closing line of 10, the definitions of 02 */
  function line30(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.read, color: o.color || C.strong, align: o.align || 'center', alpha: o.alpha });
  }

  /** a gold route through waypoints (K.path, self-drawing). k 0..1 progress. o: {k, color, w, dash, head, alpha} */
  function route(pts, o = {}) {
    return K.path(pts, { k: pick(o.k, 1), color: o.color || P.path, w: o.w || 3, dash: o.dash, alpha: o.alpha, head: pick(o.head, true), headSize: o.headSize });
  }
  /** a dashed grey route (the crossed-out path in 05) */
  const dashedRoute = (pts, o = {}) => route(pts, { ...o, color: o.color || P.pathDim, dash: o.dash || [12, 12], head: pick(o.head, false), w: o.w || 2.5 });
  /** a short gold tick (target marker on a map), centred at (x, y), k 0..1 */
  function tick(x, y, o = {}) {
    K.line(x, y - 14, x, y + 14, { k: pick(o.k, 1), color: o.color || P.path, w: o.w || 4, alpha: o.alpha });
  }
  /** a hand-drawn cross-out (K.mark) of width w at (x, y), k 0..1; the "not here" stroke */
  function cross(x, y, w, k, o = {}) {
    K.mark(x, y, w, clamp01(pick(k, 1)), { color: o.color || P.miss, w: o.lw || 6, alpha: o.alpha });
  }

  // ---------------------------------------------------------------- the map (metaphor object)
  /** THE MAP: the disk as a card. o: {grow (0..1, scales 0.9 -> 1 about its centre), alpha, dim (alias for alpha),
   *  glow (0..1 gold glow, default .35), rootLabel ('root' or null), edgeK (0..1 progress of the gold root edge, default 1),
   *  disk ('the disk' or null), box (default L.card), stroke} */
  function card(t, o = {}) {
    const box = o.box || L.card;
    const a = clamp01(pick(o.alpha, pick(o.dim, 1)));
    if (a <= 0.002) return;
    const sc = 0.9 + 0.1 * clamp01(pick(o.grow, 1));
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    K.layer(a, () => K.zoomAt(cx, cy, sc, () => {
      K.card(box.x, box.y, box.w, box.h, { r: 24, fill: P.card, stroke: o.stroke || P.cardLine, glow: pick(o.glow, 0.35) });
      K.line(box.x + 2, box.y, box.x + box.w - 2, box.y, { k: clamp01(pick(o.edgeK, 1)), color: P.root, w: 3 });
      if (o.rootLabel !== null) K.text(pick(o.rootLabel, 'root'), cx, box.y - 30, { font: 'ui', weight: 600, size: 30, color: P.root, align: 'center' });
      if (o.disk !== null) K.text(pick(o.disk, 'the disk'), box.x + 40, box.y + 40, { ...T.label, color: P.body, align: 'left' });
    }));
  }

  /** THE DOT: the working directory. o: {r (22), k (0..1 pop-in, default 1), alpha, pulse (0..1 idle glow breathing),
   *  ring (0..1 faint gold ring around it, for "a program started here"), glowK (0..1 default 1)} */
  function dot(t, x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1));
    const k = clamp01(pick(o.k, 1));
    if (a <= 0.002 || k <= 0.002) return;
    const r = pick(o.r, 22);
    const sc = K.ease.out(k);
    const wv = K.wave(t, 1.6, 0.5 * clamp01(pick(o.pulse, 0.6)), 0);
    const gk = clamp01(pick(o.glowK, 1));
    K.layer(a, () => K.zoomAt(x, y, sc, () => {
      K.glow(x, y, r * 2.8 * (1 + 0.06 * wv), P.dot, (0.42 + 0.12 * wv) * gk);
      const g = G();
      g.save();
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = P.dot; g.fill();
      g.restore();
      if (o.ring) K.ring(x, y, r + 14, r + 14, clamp01(o.ring), { color: P.dotRing, w: 2.5, rot: 0 });
    }));
  }
  /** the 26 px label under a dot, e.g. "working directory" (centred at x, y) */
  const dotLabel = (s, x, y, o = {}) => label(s, x, y, { ...o, color: o.color || P.ink });

  /** the shared single-map frame used from section 03 on: map card (with root label and disk label) + the dot.
   *  o: {grow, alpha, dot (true; false hides the dot), dotAlpha, dotPulse, dotK, edgeK, glow, label (true: "working directory" under the dot)} */
  function frame(t, o = {}) {
    card(t, { grow: o.grow, alpha: o.alpha, glow: o.glow, edgeK: o.edgeK, rootLabel: o.rootLabel, disk: o.disk });
    if (o.dot !== false) {
      dot(t, L.dot.x, L.dot.y, { alpha: pick(o.dotAlpha, pick(o.alpha, 1)), pulse: o.dotPulse, k: o.dotK, ring: o.ring });
      if (o.label) dotLabel('working directory', L.dot.x, L.dot.y + 62, { alpha: pick(o.alpha, 1) });
    }
  }

  /** two maps side by side (06 the same name, two places; 10 the agent's copy). o: {leftAlpha, rightAlpha,
   *  leftDot, rightDot (default true), dotK (0..1 pop-in of the right dot), grow, glow} */
  function framePair(t, o = {}) {
    card(t, { box: L.left, grow: o.grow, alpha: pick(o.leftAlpha, 1), glow: o.glow, rootLabel: null, disk: 'the disk' });
    card(t, { box: L.right, grow: o.grow, alpha: pick(o.rightAlpha, 1), glow: o.glow, rootLabel: null, disk: 'the disk' });
    if (o.leftDot !== false) dot(t, L.dotL.x, L.dotL.y, { alpha: pick(o.leftAlpha, 1), pulse: o.dotPulse });
    if (o.rightDot !== false) dot(t, L.dotR.x, L.dotR.y, { alpha: pick(o.rightAlpha, 1), k: o.dotK, pulse: o.dotPulse });
  }

  /** the map shrunk to a thin strip at the top (y 160-230) with the dot as a small gold tick at centre (09).
   *  o: {alpha}. Returns nothing; the error cards go below it at y >= 270. */
  function band(t, o = {}) {
    const a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return;
    K.layer(a, () => {
      K.card(L.band.x, L.band.y, L.band.w, L.band.h, { r: 24, fill: P.card, stroke: P.cardLine, glow: 0.2 });
      K.line(L.band.x + 2, L.band.y, L.band.x + L.band.w - 2, L.band.y, { color: P.root, w: 3 });
      dot(t, 960, 195, { r: 8, pulse: 0.4, glowK: 0.5 });
    });
  }

  /** the dot splits into n small copies in a row (07 "one dot per running program").
   *  o: {at (start time, default 0), gap (70), r (16), y (L.dot.y), cx (960), alpha} — each copy staggers 0.12 s */
  function dotCopies(t, o = {}) {
    const n = pick(o.n, 3), cx = pick(o.cx, 960), cy = pick(o.y, L.dot.y), gap = pick(o.gap, 70), r = pick(o.r, 16);
    const g = G();
    for (let i = 0; i < n; i++) {
      const k = K.stagger(t, pick(o.at, 0), i, 0.12, 0.6);
      if (k <= 0.002) continue;
      const x = cx + (i - (n - 1) / 2) * gap;
      K.layer(clamp01(pick(o.alpha, 1)) * k, () => {
        g.save();
        g.beginPath(); g.arc(x, cy, r, 0, TAU); g.fillStyle = P.card; g.fill();
        g.lineWidth = 2.5; g.strokeStyle = P.dotRing; g.stroke();
        g.beginPath(); g.arc(x, cy, r * 0.42, 0, TAU); g.fillStyle = P.dot; g.fill();
        g.restore();
      });
    }
  }

  // ---------------------------------------------------------------- files, folders, icons
  /** a document icon with its name under it at 26 px (small icons get 26 px names automatically) */
  function file(x, y, s, name, ext, o = {}) {
    K.file(x, y, s, { ext, name, nameSize: pick(o.nameSize, 26), alpha: o.alpha, color: o.color });
  }
  /** a folder icon, name under it at 26 px */
  function folder(x, y, s, name, o = {}) {
    K.folder(x, y, s, { name, nameSize: pick(o.nameSize, 26), alpha: o.alpha, color: o.color });
  }
  /** a line icon (K.icon names: house, terminal, lantern, sparkle, warning, file, folder-less set...). */
  function icon(name, x, y, s, o = {}) {
    K.icon(name, x, y, s, { color: o.color || P.ink, alpha: o.alpha, w: o.w });
  }
  /** the lantern over a map (the AI): gold when lit. Sits above a card's top edge, centred at (x, y) */
  function lantern(t, x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return;
    const lit = clamp01(pick(o.lit, 1));
    if (lit > 0.01) K.glow(x, y, 80, P.root, 0.32 * lit * a);
    K.icon('lantern', x, y, pick(o.s, 60), { color: lit > 0.5 ? P.root : P.body, w: 3, alpha: a });
  }
  /** the agent's lantern above the right-hand map (10): centred on the card's middle, 62 px above its top edge */
  function agentLantern(t, box, o = {}) {
    lantern(t, box.x + box.w / 2, box.y - 70, { lit: pick(o.lit, 1), alpha: o.alpha, s: pick(o.s, 72) });
  }

  // ---------------------------------------------------------------- terminal strip and prompt
  /** the PowerShell window strip at the bottom (05, 09). Returns the content rect {x, y, w, h}.
   *  o: {title ('PowerShell'), focus, alpha} */
  function terminal(t, o = {}) {
    const r = L.term;
    return K.win(r.x, r.y, r.w, r.h, { title: pick(o.title, 'PowerShell'), kind: 'terminal', titleSize: 22, focus: o.focus, alpha: o.alpha });
  }
  /** a prompt line in a rect (from terminal()). text: literal, e.g. 'PS C:\\Users\\you\\project>'.
   *  o: {caret (true, blinking), color, alpha, lit (gold), size (26)} */
  function prompt(t, rect, text, o = {}) {
    const size = pick(o.size, 26);
    const to = { font: 'mono', weight: 600, size };
    const x = rect.x + 28, y = rect.y + rect.h / 2 + size * 0.36;
    const w = K.text(text, x, y, { ...to, color: o.lit ? P.root : (o.color || P.ink), alpha: o.alpha });
    if (o.caret !== false && K.caretOn(t)) {
      K.layer(clamp01(pick(o.alpha, 1)), () => { G().fillStyle = P.ink; G().fillRect(x + w + 6, y - size * 0.8, size * 0.5, size * 0.95); });
    }
    return w;
  }

  // ---------------------------------------------------------------- error cards (09)
  /** a code-style card with literal lines (mono 30 px). Returns its height.
   *  o: {x, y (top), w (default 1400), eyebrow ('macOS, Linux, Git Bash'), lines: [..] (or pass as 2nd arg),
   *      alpha, lh (44), pad (28), mark: {line: index, text: 'data.csv'} draws a cross-out underline under that text} */
  function errorCard(t, x, y, w, lines, o = {}) {
    const lh = pick(o.lh, 44), pad = pick(o.pad, 28);
    const top = pad + (o.eyebrow ? 46 : 0);
    const h = top + lines.length * lh + pad;
    const a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return h;
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 24, fill: P.codeFill, stroke: o.stroke || P.cardLine, glow: 0, shadow: false });
      if (o.eyebrow) K.text(o.eyebrow, x + pad, y + pad + 22, { ...T.eyebrow, color: P.root, align: 'left' });
      lines.forEach((ln, i) => {
        const base = y + top + i * lh + 30;
        K.text(ln, x + pad, base, { ...T.mono, color: P.ink, align: 'left' });
        if (o.mark && o.mark.line === i) {
          const idx = ln.indexOf(o.mark.text);
          if (idx >= 0) {
            const xo = K.measure(ln.slice(0, idx), T.mono), wd = K.measure(o.mark.text, T.mono);
            K.mark(x + pad + xo, base + 10, wd, clamp01(pick(o.mark.k, 1)), { color: P.root, w: 4 });
          }
        }
      });
    });
    return h;
  }

  // ---------------------------------------------------------------- expose
  window.M = {
    P, T, L,
    // primitives
    pill, addressPill, label, eyebrow, mono, line30, route, dashedRoute, tick, cross,
    // the map
    card, dot, dotLabel, frame, framePair, band, dotCopies,
    // icons, files, the agent
    file, folder, icon, lantern, agentLantern,
    // terminal
    terminal, prompt,
    // errors
    errorCard,
  };
})();
