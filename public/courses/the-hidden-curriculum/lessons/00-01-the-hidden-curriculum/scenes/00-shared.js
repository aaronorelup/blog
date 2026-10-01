/* 00.01 The hidden curriculum — shared drawing (window.M)
   The lesson's recurring objects, drawn one way in every scene:
     - the four question tags (Aaron's loose questions) and their stacked chip
     - the folded map tile (the course map in miniature; pins land on it)
     - the degree card, the hanging lantern (AI), script.txt, the halls, the "just" bubbles
     - the shelving move that files a tag into a row of the full course map (K.map)
   Only functions and constants: no SCENE() calls. Every function is a pure function of its
   arguments (no Date.now, no Math.random, no state between frames). Read K.ctx() on every
   call, never cache it: the runtime swaps canvases during crossfades. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const lerp = K.lerp;
  const clamp01 = (v) => K.clamp(+v || 0);

  // ---------------------------------------------------------------- palette & type
  // Colour carries one meaning each, across the whole lesson:
  //   terracotta = an open question / a "just" / an error;  gold = known, shelved, lit, AI.
  //   cream = a physical paper thing (script.txt, the folded map); indigo cards = everything else.
  const palette = {
    open: C.accent,        // question icon, "just" pins, the you-are-here pin, error text
    known: C.head,         // shelved check, shelved pins, highlighted map rows, lantern light
    tagFill: C.tile, tagStroke: C.line2,
    label: C.strong,       // anything to be read
    caption: C.soft,       // supporting captions (Karla 28)
    quiet: C.quiet,
    paper: C.paper, paperShade: C.paperShade, ink: C.ink,
    dayGold: '#BE7A10',    // brand day-mode heading gold: gold that reads on cream paper
  };
  const type = {
    tag: { font: 'mono', weight: 600, size: 30 },          // compact tags use 26
    label: { font: 'ui', weight: 600, size: 30 },          // pills, tile captions
    caption: { font: 'ui', weight: 400, size: 28, color: C.soft },
    quote: { font: 'read', italic: true, size: 34, color: C.body },
  };
  const motion = {
    glide: 0.7,        // a tag flying between homes (arc, 'io')
    rise: 0.6,         // K.rise for cards and text
    fade: 0.5,         // structural fades
    collapse: 0.35,    // a tag squashing into its map row
    bob: { speed: 2.4, amp: 4 },          // pins, the floating "?" (matches map.js's pin)
    sway: { speed: 1.1, amp: 0.06 },      // lanterns (matches map.js)
  };

  // ---------------------------------------------------------------- layout
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    col: 140,                                         // title / end card left column (01, 08)
    tray: { x: 1360, ys: [270, 366, 462, 558], right: 1800, cx: 1580, glow: [1580, 420, 260], caption: [1580, 690] },
    gap: { x: 790, ys: [200, 266, 332], edges: [735, 1185], top: 180, bottom: 650, cx: 960 },
    stack: { x: 1696, y: 846, w: 140, h: 70 },         // 05: the four tags as one chip
    degree: { card: [140, 712], chip: [1360, 150] },
    tile: {                                           // mapTile(x, y, s) per scene
      s01: [188, 620, 96], s06: [1440, 400, 240], corner: [1700, 220, 130], s07: [1560, 430, 220], s08: [960, 240, 110],
    },
  };
  // the four loose questions, in order, with the map module each one is shelved on
  const TAGS = [
    { label: '.txt → .py', mod: '01' },
    { label: 'cd', mod: '02' },
    { label: '.venv', mod: '05' },
    { label: 'service account', mod: '14' },
  ];
  const traySlot = (i) => ({ x: layout.tray.x, y: layout.tray.ys[i] });
  const gapSlot = (i) => ({ x: layout.gap.x, y: layout.gap.ys[i], compact: 1 });

  // ---------------------------------------------------------------- paths & motion helpers
  /** point k (0..1) along a gentle arc from a to b; bow px, bowing upward (sideways for vertical moves) */
  function arc(a, b, k, bow = 50) {
    const ax = a.x ?? a[0], ay = a.y ?? a[1], bx = b.x ?? b[0], by = b.y ?? b[1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len, ny = dx / len;
    if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    const cx = (ax + bx) / 2 + nx * bow, cy = (ay + by) / 2 + ny * bow, u = 1 - k;
    return { x: u * u * ax + 2 * u * k * cx + k * k * bx, y: u * u * ay + 2 * u * k * cy + k * k * by };
  }
  /** same as K.map.draw's lit(): the alpha a district (and anything drawn on it) should have */
  function litAlpha(id, focus, focusK = 1, dim = 0.7) {
    if (!focus) return 1;
    const f = K.map.district(focus) ? focus : (K.map.districtOf(focus) || {}).id;
    return !f || id === f ? 1 : 1 - dim * focusK;
  }

  // ---------------------------------------------------------------- question tags
  const SIZE = {
    full: { w: 440, h: 76, r: 20, icon: 40, font: 30, pad: 22 },
    compact: { w: 340, h: 56, r: 16, icon: 30, font: 26, pad: 16 },
  };
  function geom(c) {
    const a = SIZE.full, b = SIZE.compact, m = {};
    Object.keys(a).forEach((k) => (m[k] = lerp(a[k], b[k], c)));
    m.notch = m.h * 0.12;
    return m;
  }
  /** ticket outline: rounded rect with two half-moon notches where the stub's perforation runs */
  function tagPath(x, y, w, h, r, nx, nr) {
    const g = G();
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(nx - nr, y); g.arc(nx, y, nr, Math.PI, 0, true);
    g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(nx + nr, y + h); g.arc(nx, y + h, nr, 0, Math.PI, true);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r);
    g.closePath();
  }
  function labelParts(label) {
    const i = label.indexOf('→');
    if (i < 0) return [{ s: label, color: C.strong }];
    return [{ s: label.slice(0, i), color: C.strong }, { s: '→', color: C.soft }, { s: label.slice(i + 1), color: C.strong }];
  }
  function drawTag(label, x, y, m, o) {
    const g = G();
    const sh = clamp01(o.shelved), glow = o.glow || 0, lift = o.lift || 0, stub = m.h, nx = x + stub;
    // body with a soft shadow that deepens while the tag is in the air
    g.save();
    g.shadowColor = `rgba(0,0,0,${0.36 + 0.14 * lift})`; g.shadowBlur = 26 + 30 * lift; g.shadowOffsetY = 9 + 18 * lift;
    tagPath(x, y, m.w, m.h, m.r, nx, m.notch); g.fillStyle = o.fill || palette.tagFill; g.fill();
    g.restore();
    // stub tint: terracotta while open, gold once shelved
    g.save(); tagPath(x, y, m.w, m.h, m.r, nx, m.notch); g.clip();
    if (sh < 1) { g.fillStyle = K.rgba(C.accent, 0.14 * (1 - sh)); g.fillRect(x, y, stub, m.h); }
    if (sh > 0) { g.fillStyle = K.rgba(C.head, 0.16 * sh); g.fillRect(x, y, stub, m.h); }
    g.restore();
    K.line(nx, y + m.notch + 6, nx, y + m.h - m.notch - 6, { color: C.line2, w: 1.5, dash: [2, 5] });
    // hairline, warming to gold as it is shelved or glows
    g.save();
    if (glow > 0) { g.shadowColor = K.rgba(C.head, 0.6 * glow); g.shadowBlur = 36; }
    g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, Math.max(0.5 * sh, 0.7 * glow));
    tagPath(x, y, m.w, m.h, m.r, nx, m.notch); g.stroke();
    g.restore();
    // icon: the "?" shrinks away, then the check grows in (never both at once)
    const ix = x + stub / 2, iy = y + m.h / 2, qa = 1 - K.seg(sh, 0, 0.5), ca = K.seg(sh, 0.5, 1);
    if (qa > 0) K.at(ix, iy + m.icon * 0.03, 0.6 + 0.4 * qa, 0, () => K.icon('question', 0, 0, m.icon, { color: C.accent, alpha: qa, w: Math.max(2.6, m.icon * 0.085) }));
    if (ca > 0) K.at(ix, iy + m.icon * 0.02, 0.6 + 0.4 * K.ease.out(ca), 0, () => K.icon('check', 0, 0, m.icon, { color: C.head, alpha: ca, w: Math.max(2.8, m.icon * 0.09) }));
    K.spans(labelParts(label), nx + m.pad, iy + m.font * 0.36, { font: 'mono', size: m.font, weight: 600 });
  }
  /** size of a tag: compact 0 (full) .. 1 (compact) */
  const tagBox = (compact = 0) => { const m = geom(clamp01(compact)); return { w: m.w, h: m.h }; };
  /**
   * one question tag, top-left at (x, y). o: {compact 0..1|bool, shelved 0..1, glow 0..1, alpha,
   * lift 0..1 (in the air: deeper shadow), scale, rot, squash 0..1}. Scale/rot/squash pivot on the centre.
   * Returns its box {x, y, w, h, cx, cy}.
   */
  function tag(label, x, y, o = {}) {
    const m = geom(clamp01(o.compact));
    const box = { x, y, w: m.w, h: m.h, cx: x + m.w / 2, cy: y + m.h / 2 };
    const a = o.alpha ?? 1; if (a <= 0.002) return box;
    const sc = o.scale ?? 1, sq = o.squash || 0;
    K.layer(a, () => {
      const g = G(); g.save();
      g.translate(box.cx, box.cy); if (o.rot) g.rotate(o.rot);
      g.scale(sc * (1 + 0.05 * sq), sc * (1 - 0.32 * sq)); g.translate(-box.cx, -box.cy);
      drawTag(label, x, y, m, o);
      g.restore();
    });
    return box;
  }
  /**
   * a tag gliding on an arc between two states over [t0, t0 + d]. from / to:
   * {x, y, compact, shelved, glow, alpha, scale}. Before t0 it rests at `from`, after at `to`.
   * o: {ease 'io', bow 50, tilt 0.035}. Returns {k, x, y, box}.
   */
  function tagMove(label, t, t0, d, from, to, o = {}) {
    const k = K.io(t, t0, d, o.ease || 'io');
    const p = arc(from, to, k, o.bow ?? 50), lift = Math.sin(Math.PI * k);
    const side = Math.sign((to.x ?? 0) - (from.x ?? 0)) || 1;
    const mix = (key, def) => lerp(+(from[key] ?? def), +(to[key] ?? def), k);
    const box = tag(label, p.x, p.y, {
      compact: mix('compact', 0), shelved: mix('shelved', 0), glow: mix('glow', 0), alpha: mix('alpha', 1),
      lift, scale: mix('scale', 1) * (1 + 0.035 * lift), rot: (o.tilt ?? 0.035) * lift * side,
    });
    return { k, x: p.x, y: p.y, box };
  }
  /** 05: the remaining tags as one stacked chip, top-left (x, y), 140 × 70. n <= 0 draws nothing. */
  function stack(x, y, n = 4, o = {}) {
    const m = { w: 140, h: 70, r: 18, icon: 34, font: 28, pad: 14, notch: 8 };
    if (n <= 0) return { x, y, w: m.w, h: m.h };
    K.layer(o.alpha ?? 1, () => {
      const g = G();
      for (let i = Math.min(n, 4) - 1; i >= 1; i--) {
        const ox = 5 * i, oy = -7 * i;
        g.save(); g.globalAlpha *= 0.85 - 0.18 * i;
        tagPath(x + ox, y + oy, m.w, m.h, m.r, x + ox + m.h, m.notch);
        g.fillStyle = palette.tagFill; g.fill(); g.lineWidth = 1.5; g.strokeStyle = C.line2; g.stroke();
        g.restore();
      }
      drawTag('×' + n, x, y, m, { glow: o.glow, shelved: o.shelved });
    });
    return { x, y, w: m.w, h: m.h };
  }
  /** the `from` state for a compact tag leaving the stack: centred on it, scaled to its footprint */
  function stackFrom(x = layout.stack.x, y = layout.stack.y) {
    return { x: x + 70 - 170, y: y + 35 - 28, compact: 1, scale: 0.42 };
  }

  // ---------------------------------------------------------------- the course map, shelving
  /** top-left for a compact tag sitting on module `mod`'s row of the full K.map */
  function rowTag(mod) { const c = K.map.chipPos(mod); return { x: c.x - 18, y: c.y - 28, compact: 1 }; }
  /**
   * a row of the full map lit as "shelved": gold wash, re-inked text, gold check (map.js geometry).
   * k 0..1 is the reveal. o.alpha: pass litAlpha(district, focus, focusK, dim) when the map is focused.
   */
  function shelveRow(mod, k, o = {}) {
    if (k <= 0) return;
    const c = K.map.chipPos(mod), g = G(), by = c.y + 9;
    K.layer((o.alpha ?? 1), () => {
      K.layer(Math.min(1, k * 1.4), () => {
        // opaque underlay hides map.js's regular-weight text, so the bold re-ink never ghosts
        K.rr(c.x - 18, c.y - 19, c.w + 36, 38, 19); g.fillStyle = K.mixColor(C.page, C.tile, 0.94); g.fill();
        K.rr(c.x - 18, c.y - 19, c.w + 36, 38, 19); g.fillStyle = K.rgba(C.head, 0.15); g.fill();
        K.text(mod, c.x, by, { font: 'mono', size: 22, color: C.head, weight: 600 });
        K.text(K.map.MODULES[mod], c.x + 44, by, { size: 25, color: C.strong, weight: 600 });
      });
      const kc = K.seg(k, 0.35, 1);
      if (kc > 0) K.at(c.x + c.w - 6, c.y - 1, 0.55 + 0.45 * K.ease.out(kc), 0, () => K.icon('check', 0, 0, 28, { color: C.head, alpha: kc, w: 3 }));
    });
  }
  /**
   * the whole filing move (05): nothing before tLeave (the stack stands in for the tag); the tag
   * flies from `from` and lands on its map row at tLand; its "?" snaps to a check on touchdown and it
   * squashes into the row while shelveRow() fades up beneath it. from: {x, y, compact, scale}
   * (e.g. stackFrom()). o: {alpha: the row's lit alpha, bow 90}. Returns 0..1 "filed" progress.
   */
  function shelve(label, mod, t, tLeave, tLand, from, o = {}) {
    const to = { ...rowTag(mod), shelved: from.shelved ?? 0, scale: 1 };
    const d = Math.max(0.3, tLand - tLeave);
    const kc = K.seg(t, tLand, tLand + motion.collapse), ke = K.ease.out(kc);
    shelveRow(mod, K.io(t, tLand + 0.05, 0.5, 'out'), { alpha: o.alpha });
    if (t < tLeave || kc >= 1) return kc;
    if (t < tLand) tagMove(label, t, tLeave, d, { compact: 1, ...from }, to, { bow: o.bow ?? 90 });
    else tag(label, to.x, to.y, { compact: 1, shelved: Math.max(to.shelved, K.seg(t, tLand, tLand + 0.12)), squash: ke, alpha: (1 - ke) * (1 - ke), glow: 0.5 * (1 - kc) });
    return kc;
  }

  // ---------------------------------------------------------------- pins
  /** map pin with its tip at (x, y), dark-outlined so it reads on any ground. o: {color, k (landing 0..1), glow, alpha, outline} */
  function pin(x, y, size, o = {}) {
    const k = o.k ?? 1; if (k <= 0) return;
    const g = G(), drop = (1 - k) * size * 1.1, sc = 0.55 + 0.45 * k, col = o.color || C.head, ink = o.outline || C.page;
    K.layer((o.alpha ?? 1) * Math.min(1, k * 1.6), () => {
      g.save(); g.fillStyle = `rgba(4,5,12,${0.4 * k})`;
      g.beginPath(); g.ellipse(x, y + 1, size * 0.17 * sc, size * 0.06 * sc, 0, 0, 7); g.fill(); g.restore();
      if (o.glow) K.glow(x, y - size * 0.5, size * 0.9, col, 0.35 * o.glow);
      K.at(x, y - drop, sc, 0, () => {
        g.save(); g.lineJoin = 'round';
        g.beginPath(); g.arc(0, -size * 0.5, size * 0.2, Math.PI * 0.85, Math.PI * 2.15); g.lineTo(0, 0); g.closePath();
        g.strokeStyle = ink; g.lineWidth = Math.max(2, size * 0.1); g.stroke();
        g.fillStyle = col; g.fill();
        g.beginPath(); g.arc(0, -size * 0.5, size * 0.072, 0, 7); g.fillStyle = ink; g.fill();
        g.restore();
      });
    });
  }

  // ---------------------------------------------------------------- the folded map tile
  // Flat-paper coordinates in units of the tile size s, origin at the tile centre.
  // Three fold panels = the course map's three columns; two rows of districts; lanterns on top.
  const P = { W: 0.39, H: 0.275, slope: 0.24 };
  P.panel = (2 * P.W) / 3;
  const panelX0 = (i) => -P.W + i * P.panel;
  const panelXC = (i) => -P.W + (i + 0.5) * P.panel;
  const slopeOf = (i) => (i === 1 ? P.slope : -P.slope);
  const ROWS = { top: [-0.135, 0.15], bottom: [0.06, 0.18] };
  const PATH_Y = 0.0375;
  const MINI = { machine: [0, 'top'], code: [1, 'top'], history: [2, 'top'], shipping: [0, 'bottom'], trust: [1, 'bottom'], network: [2, 'bottom'] };
  const ROW_LEN = [0.8, 0.58, 0.7, 0.5, 0.64];
  const PIN_U = [0.24, 0.76, 0.5, 0.86, 0.14];
  const THEME = {
    // cream: a physical folded paper map (default; legible down to s 96)
    cream: {
      paper: C.paper, back: C.paperShade, block: 'rgba(58,58,66,0.07)', blockStroke: 'rgba(58,58,66,0.55)',
      focusFill: 'rgba(190,122,16,0.18)', focusStroke: '#BE7A10', tick: '#BE7A10', row: 'rgba(58,58,66,0.32)', pinned: '#BE7A10',
      string: 'rgba(58,58,66,0.5)', lantern: '#E9A23B', lanternInk: 'rgba(58,58,66,0.75)', halo: 0.3, path: 'rgba(168,94,43,0.65)',
      edge: 'rgba(58,58,66,0.45)', valley: 'rgba(120,88,48,', light: 'rgba(255,255,255,0.22)', gate: C.paper, gateInk: 'rgba(58,58,66,0.7)', pinInk: C.ink,
    },
    // night: the big map's own colours (indigo ground, tile districts) for when the tile sits on cream
    night: {
      paper: '#14162A', back: '#1A1928', block: C.tile, blockStroke: C.line2,
      focusFill: K.mixColor(C.tile, C.head, 0.12), focusStroke: C.head, tick: C.head, row: K.rgba(C.body, 0.35), pinned: C.head,
      string: K.rgba(C.soft, 0.55), lantern: C.head, lanternInk: null, halo: 0.4, path: K.rgba(C.head, 0.45),
      edge: C.line2, valley: 'rgba(0,0,0,', light: 'rgba(255,240,220,0.03)', gate: C.tile, gateInk: C.line2, pinInk: C.page,
    },
  };
  function miniBlock(id) {
    const [c, r] = MINI[id], [y0, h] = ROWS[r];
    return { x: panelX0(c) + 0.028, y: y0, w: P.panel - 0.056, h, col: c };
  }
  const ROW_Y = (b, j) => b.y + 0.064 + j * 0.0235;
  /** panel fold progress (0 folded .. 1 flat) for overall open k: the left panel unfolds first */
  const panelOpen = (i, open) => (i === 1 ? 1 : i === 0 ? K.ease.io(K.seg(open, 0, 0.62)) : K.ease.io(K.seg(open, 0.38, 1)));
  const panelSx = (i, open) => (i === 1 ? 1 : Math.cos(Math.PI * (1 - panelOpen(i, open))));
  const hingeOf = (i) => (i === 0 ? panelX0(1) : panelX0(2));
  /** flat paper point → tile-local unit point (through shear and hinge) + how visible it is */
  function paperXY(u, v, open = 1) {
    const i = u < panelX0(1) ? 0 : u < panelX0(2) ? 1 : 2;
    const vv = v + slopeOf(i) * (u - panelXC(i));
    const s0 = panelSx(0, open), s2 = panelSx(2, open);
    if (i === 1) {
      // hidden where a folded-over outer panel lies on top of the middle one
      const coverL = s0 < 0 && u < panelX0(1) + -s0 * P.panel, coverR = s2 < 0 && u > panelX0(2) - -s2 * P.panel;
      return { u, v: vv, i, vis: coverL || coverR ? 0 : 1 };
    }
    const sx = i === 0 ? s0 : s2, h = hingeOf(i);
    return { u: h + (u - h) * sx, v: vv, i, vis: K.clamp(sx * 2.5) };
  }
  /** flat paper coordinates of a pin spec */
  function pinUV(p) {
    if (typeof p === 'string') p = { mod: p };
    if (p.mod === '00') return { u: -P.W, v: PATH_Y - 0.04 };
    const d = K.map.DISTRICTS.find((dd) => dd.mods.includes(p.mod));
    if (!d) return { u: 0.2, v: -0.21 };            // not in a district (the lanterns have no modules now): on the string
    const b = miniBlock(d.id), j = d.mods.indexOf(p.mod);
    return { u: b.x + b.w * PIN_U[j % PIN_U.length], v: ROW_Y(b, j) + 0.004 };
  }
  /**
   * screen point of a pin on a tile at (x, y) size s. p: '05' | {mod} | {dx, dy} (offset from the
   * tile centre in units of s: storyboard pixel offsets at s 220 → divide by 220). Returns {x, y, vis}.
   */
  function tilePt(x, y, s, p, open = 1) {
    const yc = y + s * 0.012;
    if (p && typeof p === 'object' && p.dx != null) return { x: x + p.dx * s, y: yc + p.dy * s, vis: 1 };
    const uv = pinUV(p), q = paperXY(uv.u, uv.v, open);
    return { x: x + q.u * s, y: yc + q.v * s, vis: q.vis };
  }
  function drawPanel(i, s, sx, o, pinnedMods, T) {
    const g = G(), x0 = panelX0(i), x1 = x0 + P.panel, px = 1 / s;
    g.save();
    if (i !== 1) { const h = hingeOf(i); g.translate(h, 0); g.scale(sx, 1); g.translate(-h, 0); }
    g.transform(1, slopeOf(i), 0, 1, 0, -slopeOf(i) * panelXC(i));
    g.save();
    g.beginPath(); g.rect(x0, -P.H, P.panel, 2 * P.H); g.clip();
    if (sx < 0) {
      // the back of a folded panel: plain paper with two faint creases
      g.fillStyle = T.back; g.fillRect(x0, -P.H, P.panel, 2 * P.H);
      g.strokeStyle = T.edge; g.lineWidth = 1.2 * px;
      [-0.08, 0.1].forEach((yy) => { g.beginPath(); g.moveTo(x0 + 0.03, yy); g.lineTo(x1 - 0.03, yy); g.stroke(); });
    } else {
      g.fillStyle = T.paper; g.fillRect(x0, -P.H, P.panel, 2 * P.H);
      const lit = o.lit ?? 0;
      // lantern string and its six lanterns (AI over every district; one per district, like map.js)
      g.strokeStyle = T.string; g.lineWidth = 1.3 * px;
      g.beginPath(); g.moveTo(-0.35, -0.245); g.quadraticCurveTo(0, -0.165, 0.35, -0.245); g.stroke();
      for (let n = 0; n < 6; n++) {
        const uu = (n + 0.5) / 6, lx = 0.35 * (2 * uu - 1), ly = (1 - uu) * (1 - uu) * -0.245 + 2 * uu * (1 - uu) * -0.165 + uu * uu * -0.245 + 0.027;
        if (lx < x0 - 0.03 || lx > x1 + 0.03) continue;
        K.glow(lx, ly, 0.05 + 0.025 * lit, C.head, T.halo + 0.4 * lit);
        g.beginPath(); g.ellipse(lx, ly, 0.013, 0.017, 0, 0, 7); g.fillStyle = T.lantern; g.fill();
        if (T.lanternInk) { g.strokeStyle = T.lanternInk; g.lineWidth = Math.max(1, s * 0.005) * px; g.stroke(); }
      }
      // garden path in the gap between the rows
      g.save(); g.strokeStyle = T.path; g.lineWidth = Math.max(1.6, s * 0.008) * px; g.setLineDash([0.006, 0.022]); g.lineCap = 'round';
      g.beginPath(); g.moveTo(-P.W, PATH_Y); g.lineTo(P.W - 0.03, PATH_Y); g.stroke(); g.restore();
      // the two districts of this column
      K.map.DISTRICTS.forEach((d) => {
        const b = miniBlock(d.id); if (b.col !== i) return;
        const focus = o.focus === d.id;
        K.rr(b.x, b.y, b.w, b.h, 0.022); g.fillStyle = focus ? T.focusFill : T.block; g.fill();
        g.lineWidth = (focus ? 2.2 : 1.3) * px; g.strokeStyle = focus ? T.focusStroke : T.blockStroke; g.stroke();
        g.lineCap = 'round';
        g.strokeStyle = T.tick; g.lineWidth = Math.max(2, s * 0.01) * px;
        g.beginPath(); g.moveTo(b.x + 0.026, b.y + 0.034); g.lineTo(b.x + 0.026 + b.w * 0.5, b.y + 0.034); g.stroke();
        d.mods.forEach((m, j) => {
          const ry = ROW_Y(b, j); if (ry > b.y + b.h - 0.012) return;
          const pinned = pinnedMods.includes(m);
          if (!pinned && s < 150) return;
          g.strokeStyle = pinned ? T.pinned : T.row; g.lineWidth = (pinned ? Math.max(2, s * 0.009) : Math.max(1.3, s * 0.005)) * px;
          g.beginPath(); g.moveTo(b.x + 0.026, ry); g.lineTo(b.x + 0.026 + (b.w - 0.052) * ROW_LEN[j], ry); g.stroke();
        });
      });
      // fold shading: the middle panel is the valley; outer panels darken as they turn edge-on
      const turn = 1 - Math.abs(sx);
      const gr = g.createLinearGradient(x0, 0, x1, 0);
      if (i === 1) { gr.addColorStop(0, T.valley + '0.22)'); gr.addColorStop(0.5, T.valley + '0.05)'); gr.addColorStop(1, T.valley + '0.22)'); }
      else if (i === 0) { gr.addColorStop(0, T.light); gr.addColorStop(1, T.valley + (0.1 + 0.45 * turn) + ')'); }
      else { gr.addColorStop(0, T.valley + (0.1 + 0.45 * turn) + ')'); gr.addColorStop(1, T.light); }
      g.fillStyle = gr; g.fillRect(x0, -P.H, P.panel, 2 * P.H);
    }
    g.restore();
    g.strokeStyle = T.edge; g.lineWidth = 1.3 * px;
    g.strokeRect(x0, -P.H, P.panel, 2 * P.H);
    // the gate (Start) hangs off the map's left edge, drawn only with the you-are-here pin
    if (i === 0 && sx > 0.05 && o.here) {
      g.beginPath(); g.arc(-P.W, PATH_Y, 0.034, 0, 7); g.fillStyle = T.gate; g.fill();
      g.lineWidth = Math.max(1.6, s * 0.009) * px; g.strokeStyle = C.accent; g.stroke();
    }
    g.restore();
  }
  /**
   * the folded map tile, centred at (x, y), size s (a square tile, like K.iconTile).
   * pins: ['01', {mod:'05', k, color}, {dx, dy, color, k, size}] — module pins sit on that module's
   *   row of its mini district (gold by default, and the row turns gold); {dx, dy} are free offsets in units of s.
   * o: {t (bob), open 0..1 (0 = folded shut), here 0..1|bool (terracotta you-are-here pin on the gate),
   *     lit 0..1 (lanterns brighten), focus (district id outlined), theme 'cream'|'night', glow, alpha, shadow}
   * Returns {x, y, s, pt(p)} — pt gives the screen point of any pin spec, for flights that land on the tile.
   */
  function mapTile(x, y, s, pins = [], o = {}) {
    const g = G(), open = o.open ?? 1, t = o.t ?? 0, T = THEME[o.theme || 'cream'];
    const specs = (pins || []).map((p) => (typeof p === 'string' ? { mod: p } : p));
    const pinnedMods = specs.filter((p) => p.mod && (p.k ?? 1) > 0.5).map((p) => p.mod);
    const ps = Math.max(20, s * 0.14);
    K.layer(o.alpha ?? 1, () => {
      K.card(x - s / 2, y - s / 2, s, s, { r: s * 0.24, fill: C.tile, glow: o.glow, shadow: o.shadow });
      g.save(); g.translate(x, y + s * 0.012); g.scale(s, s);
      [1, 2, 0].forEach((i) => { const sx = panelSx(i, open); if (Math.abs(sx) > 0.01) drawPanel(i, s, sx, o, pinnedMods, T); });
      g.restore();
      specs.forEach((p) => {
        const q = tilePt(x, y, s, p, open);
        if (q.vis <= 0) return;
        pin(q.x, q.y, p.size ? p.size * s : ps, { color: p.color || C.head, k: p.k ?? 1, glow: p.glow, alpha: q.vis, outline: T.pinInk });
      });
      const here = o.here === true ? 1 : +o.here || 0;
      if (here > 0) {
        const q = tilePt(x, y, s, '00', open);
        if (q.vis > 0) pin(q.x, q.y + K.wave(t, motion.bob.speed, Math.max(1.5, s * 0.014)), ps * 1.2, { color: C.accent, k: here, alpha: q.vis, outline: T.pinInk });
      }
    });
    return { x, y, s, pt: (p) => tilePt(x, y, s, p, open) };
  }
  /**
   * 06: the full course map shrinks toward (x, y) and fades while the tile settles in its place.
   * k 0..1 (drive it with K.io). o: {map: K.map.draw options, tile: mapTile options, scaleTo (default s/1333)}
   */
  function foldMap(t, k, x, y, s, pins = [], o = {}) {
    const mk = K.clamp(k), z = lerp(1, o.scaleTo ?? s / 1333, mk);
    if (mk < 1) K.layer(1 - mk, () => K.at(lerp(960, x, mk), lerp(540, y, mk), z, 0, () => { G().translate(-960, -540); K.map.draw(t, o.map || {}); }));
    if (mk > 0) K.at(x, y, lerp(1.35, 1, K.ease.out(mk)), 0, () => {
      G().translate(-x, -y);
      mapTile(x, y, s, pins, { t, ...(o.tile || {}), alpha: mk * ((o.tile || {}).alpha ?? 1) });
    });
  }

  // ---------------------------------------------------------------- cards & furniture
  /** card with an icon and one label, vertically centred. o: {iconSize, iconX, size, weight, color, iconColor, tilt, glow, alpha, r} */
  function iconCard(x, y, w, h, icon, label, o = {}) {
    const is = o.iconSize ?? Math.round(h * 0.54), size = o.size ?? 32;
    const icx = x + (o.iconX ?? h * 0.5 + 8), icy = y + h / 2, tx = icx + is / 2 + 24;
    K.layer(o.alpha ?? 1, () => {
      K.card(x, y, w, h, { r: o.r ?? 24, glow: o.glow, fill: o.fill, shadow: o.shadow, stroke: o.stroke });
      K.at(icx, icy, 1, o.tilt || 0, () => K.icon(icon, 0, 0, is, { color: o.iconColor || C.head }));
      K.text(label, tx, icy + size * 0.36, { size, weight: o.weight ?? 600, color: o.color || C.strong, font: 'ui' });
    });
    return { x, y, w, h, icx, icy, tx };
  }
  /** the degree: full card 700×104 (01) or compact chip 440×76 (02). o: {compact, tilt (rad), alpha, glow} */
  function degree(x, y, o = {}) {
    return o.compact
      ? iconCard(x, y, 440, 76, 'cap', 'Information Systems', { size: 28, weight: 400, color: C.soft, iconSize: 40, iconX: 45, tilt: o.tilt, alpha: o.alpha, glow: o.glow })
      : iconCard(x, y, 700, 104, 'cap', 'Information Systems', { size: 32, weight: 600, color: C.strong, iconSize: 56, iconX: 60, tilt: o.tilt, alpha: o.alpha, glow: o.glow });
  }
  /** a hall of study (03): card + eyebrow + title. o: {titleSize 48, alpha, glow} */
  function hall(x, y, w, h, eyebrow, title, o = {}) {
    K.layer(o.alpha ?? 1, () => {
      K.card(x, y, w, h, { glow: o.glow });
      K.eyebrow(eyebrow, x + 50, y + 56);
      K.title(title, x + 50, y + 120, { size: o.titleSize ?? 48 });
    });
    return { x, y, w, h, cx: x + w / 2 };
  }
  /**
   * a hanging paper lantern (AI), body centred at (x, y), size s, swaying from its hook.
   * o: {string px above the hook, lit (glow strength, default 1), phase, still, alpha}
   */
  function lantern(t, x, y, s, o = {}) {
    const L = o.string ?? 0, sway = o.still ? 0 : K.wave(t, motion.sway.speed, motion.sway.amp, o.phase ?? 0);
    const ay = y - s * 0.48 - L;
    K.layer(o.alpha ?? 1, () => K.at(x, ay, 1, sway, () => {
      if (L > 0) K.line(0, 0, 0, L, { color: K.rgba(C.soft, 0.6), w: 1.5 });
      K.glow(0, L + s * 0.5, s * 1.35, C.head, 0.22 * (o.lit ?? 1));
      K.icon('lantern', 0, L + s * 0.48, s, { color: C.head, w: Math.max(2, s * 0.05) });
    }));
  }
  /** a lantern inside a soft tile (the AI as a source: 06, 07). o: {glow, lit, phase, alpha} */
  function lanternTile(t, x, y, s, o = {}) {
    K.layer(o.alpha ?? 1, () => {
      K.card(x - s / 2, y - s / 2, s, s, { r: s * 0.28, glow: o.glow });
      const g = G(); g.save(); K.rr(x - s / 2, y - s / 2, s, s, s * 0.28); g.clip();
      lantern(t, x, y + s * 0.02, s * 0.6, { lit: o.lit ?? 1.3, phase: o.phase });
      g.restore();
    });
  }
  /** script.txt (02, 07). o: {ext 'txt', name, alpha} */
  function script(x, y, s, o = {}) {
    const ext = o.ext ?? 'txt';
    K.file(x, y, s, { ext, name: o.name ?? 'script.' + ext, alpha: o.alpha });
  }
  /**
   * left-aligned row of pills (01's five topics), first pill's left edge at x, centred on y.
   * o: {size 30, gap 22, ks: per-pill reveal 0..1 (rise + fade), color, glow}. Returns [{x, w, left}].
   */
  function pillRow(labels, x, y, o = {}) {
    const size = o.size ?? 30, gap = o.gap ?? 22, out = [];
    let left = x;
    labels.forEach((s, i) => {
      const w = K.measure(s, { size, font: 'ui', weight: 600 }) + size * 1.6, k = o.ks ? clamp01(o.ks[i]) : 1;
      out.push({ x: left + w / 2, w, left });
      if (k > 0) K.layer(k, () => K.pill(s, left + w / 2, y + (1 - k) * 24, { size, color: o.color, glow: o.glow }));
      left += w + gap;
    });
    return out;
  }
  /**
   * a "just" speech bubble (07): top-left (x, y), width w, height 96. The gold "just" is drawn at
   * alpha o.just (1 → 0 as it lifts off as a pin). Returns {jx, jy} centre of the word "just".
   */
  function bubble(x, y, w, rest, o = {}) {
    const h = 96, size = 30, tx = x + 100, by = y + h / 2 + size * 0.36;
    const jw = K.measure('just', { font: 'mono', size, weight: 700 });
    K.layer(o.alpha ?? 1, () => {
      K.card(x, y, w, h, { r: 48, glow: o.glow });
      K.icon('chat', x + 50, y + h / 2, 44, { color: C.soft });
      K.text('just', tx, by, { font: 'mono', size, weight: 700, color: C.head, alpha: o.just ?? 1 });
      K.text(' ' + rest, tx + jw, by, { font: 'mono', size, weight: 400, color: C.strong });
    });
    return { jx: tx + jw / 2, jy: y + h / 2, x, y, w, h };
  }

  window.M = {
    palette, type, motion, layout, TAGS, SIZE,
    traySlot, gapSlot, arc, litAlpha,
    tag, tagBox, tagMove, stack, stackFrom,
    rowTag, shelveRow, shelve,
    pin, mapTile, tilePt, foldMap,
    iconCard, degree, hall, lantern, lanternTile, script, pillRow, bubble,
  };
})();
