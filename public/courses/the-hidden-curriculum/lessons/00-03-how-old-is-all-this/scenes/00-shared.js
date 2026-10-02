/* 00.03 How old is all this? — shared drawing (window.M)
   The lesson's one recurring object is "the street of years": one long horizontal street, 1965 → 2026,
   with a year painted on every building (a tag hung on a stem from a node on the street) and three
   paper lanterns (AI) hung ONLY over its far end (2021 · 2022 · 2024). The street is drawn by
   M.street(t, {geom}) in every scene and only morphs between layouts (M.lerpGeom), dims, lights or
   loses its year numbers: no scene draws its own timeline.
   Also here: the year tag (M.tag, also used for 03's stamped years), brackets under the street (04, 08),
   the gold light spreading back along it (07), pin markers (06), and the 00.02 road (05) re-drawn to match.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now,
   no Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const lerp = K.lerp;
  const clamp01 = (v) => K.clamp(+v || 0);
  /** number | array | (i) => number  →  (i) => number (with default) */
  const per = (v, d) => (typeof v === 'function' ? (i) => v(i) : Array.isArray(v) ? (i) => (v[i] ?? d) : (i) => (v ?? d));

  // ---------------------------------------------------------------- palette, type, motion
  // One meaning per colour, the whole lesson long:
  //   gold (C.head / C.gold) = the old street: its lit line, nodes, year numbers, its brackets;
  //   terracotta (C.accent) = the lanterns' stretch: lantern tags, the 2021–2026 segment, "check the date";
  //   the lantern bodies themselves are gold paper lit warm (as on K.map), their glow leans terracotta.
  //   cream (C.strong) = names on tags; indigo tiles = tag/card fills. Pink only on 01/09 via K.petals.
  const palette = {
    street: C.head, streetDim: C.line2, band: C.line,
    lantern: C.accent, lanternBody: C.head, lanternGlow: '#E9A064',  // head/accent mix as hex (K.rgba needs hex)
    year: C.head, name: C.strong, sep: C.soft, tick: C.line2, tickLabel: C.quiet,
    detail: C.soft, quiet: C.quiet,
  };
  const type = {
    year: { font: 'mono', weight: 600 },               // size from geom (26 on every readable preset)
    name: { font: 'ui', weight: 600 },
    tickLabel: { font: 'mono', weight: 400, size: 22 }, // decorative decade labels
    bracket: { font: 'ui', weight: 600, size: 30 },
    line: { font: 'read', size: 32, color: C.strong },   // scene sentences ('read' 32–34)
  };
  const motion = {
    draw: 0.8,          // street drawing / lighting along its length
    hang: 0.6,          // a tag hanging on its stem (stem 0–.45, tag .35–1 of k)
    light: 0.6,         // a lantern lighting
    move: 0.8,          // geom morphs (04 → 05 lift)
    sway: { speed: 1.1, amp: 0.06 },   // lanterns (matches map.js / 00.02)
    bob: { speed: 2.4, amp: 4 },       // pins (matches map.js / 00.02)
  };

  // ---------------------------------------------------------------- the years
  const Y0 = 1965, Y1 = 2026;
  /** the buildings on the old street (fact-checked; see script.md notes). row: a1/a2 above, b1/b2 below */
  const BUILDINGS = [
    { key: 'unix', year: 1969, name: 'Unix', row: 'a1', icon: 'terminal' },
    { key: 'ethernet', year: 1973, name: 'Ethernet', row: 'b1', icon: 'router' },
    { key: 'msdos', year: 1981, name: 'MS-DOS', row: 'a2', icon: 'terminal' },
    { key: 'dns', year: 1983, name: 'DNS', row: 'b2', icon: 'globe' },
    { key: 'web', year: 1991, yl: '~1991', name: 'web · Python · Linux', short: 'web', row: 'a1', icon: 'globe' },
    { key: 'js', year: 1995, name: 'JavaScript', row: 'b1', icon: 'code' },
    { key: 'git', year: 2005, name: 'Git', row: 'a2', icon: 'book' },
    { key: 'github', year: 2008, name: 'GitHub', row: 'b2', icon: 'cloud' },
    { key: 'docker', year: 2013, name: 'Docker', row: 'a1', icon: 'server' },
    { key: 'vscode', year: 2015, name: 'VS Code', row: 'b1', icon: 'code' },
  ];
  /** the lanterns: only ever at the far end */
  const LANTERNS = [
    // dx nudges the lantern off its exact year (px at the 'full' scale) so the three bodies never touch;
    // the street's terracotta nodes mark the exact years
    { key: 'copilot', year: 2021, name: 'Copilot', drop: 0, dx: -16 },
    { key: 'chatgpt', year: 2022, name: 'ChatGPT', drop: 22, dx: 8 },
    { key: 'mcp', year: 2024, yl: 'Nov 2024', name: 'MCP', drop: 6, dx: 18 },
  ];
  /** other years scenes pin things to (03 tags, 06 markers, 07 agent items) */
  const YEARS = { notepad: 1985, shell: 1971, python: 1991, venv: 2012, cloudflare: 2010, stripe: 2011, py2end: 2020, oldAnswer: 2016 };

  // ---------------------------------------------------------------- layouts (geoms)
  // rows are offsets from the street's y to the tag centres; stack = the lantern tags' column (right-aligned at x).
  const PRESETS = {
    // 04 07 08: the street in full. X(year) = 160 + (year-1965) * 26.23
    full:   { x0: 160, x1: 1760, y: 560, a1: -90, a2: -160, b1: 90, b2: 160, tag: 26, tagA: 1, ticks: 1, tickLabels: 1, band: 1,
              cordY: 236, ls: 46, stackX: 1800, stackY: 370, stackDy: 60, node: 5 },
    // 01: the title-card ghost, lower and a little narrower
    title:  { x0: 280, x1: 1640, y: 650, a1: -84, a2: -150, b1: 84, b2: 150, tag: 26, tagA: 1, ticks: 1, tickLabels: 0, band: 1,
              cordY: 470, ls: 44, stackX: 1800, stackY: 700, stackDy: 58, node: 5 },
    // 05: lifted above the 00.02 road (cards at y 660); tags read best in mode 'year'
    raised: { x0: 260, x1: 1500, y: 300, a1: -56, a2: -110, b1: 56, b2: 110, tag: 26, tagA: 1, ticks: 1, tickLabels: 0, band: 0.8,
              cordY: 96, ls: 40, stackX: 1800, stackY: 214, stackDy: 58, node: 4.5 },
    // 06: a thin marker strip along the top; no tags, markers (M.marker) drop onto it
    strip:  { x0: 520, x1: 1400, y: 210, a1: -60, a2: -100, b1: 60, b2: 100, tag: 26, tagA: 0, ticks: 1, tickLabels: 1, band: 0.6,
              cordY: 100, ls: 30, stackX: 1800, stackY: 200, stackDy: 50, node: 4 },
    // 09: decorative footer under the end card (draw at alpha .4)
    footer: { x0: 560, x1: 1360, y: 880, a1: -50, a2: -90, b1: 50, b2: 90, tag: 26, tagA: 0, ticks: 1, tickLabels: 0, band: 0.6,
              cordY: 806, ls: 32, stackX: 1800, stackY: 800, stackDy: 50, node: 3.5 },
  };
  const NUM = ['x0', 'x1', 'y', 'a1', 'a2', 'b1', 'b2', 'tag', 'tagA', 'ticks', 'tickLabels', 'band', 'cordY', 'ls', 'stackX', 'stackY', 'stackDy', 'node'];
  /** a geom from a preset name, or a preset plus overrides: geom('full', {y: 600}) */
  function geom(p = 'full', over = {}) {
    const base = typeof p === 'string' ? PRESETS[p] || PRESETS.full : p;
    return { ...base, ...over };
  }
  /** morph between two geoms (k 0..1, ease it yourself) */
  function lerpGeom(a, b, k) {
    a = typeof a === 'string' ? geom(a) : a; b = typeof b === 'string' ? geom(b) : b;
    k = clamp01(k);
    const gm = {};
    NUM.forEach((n) => (gm[n] = lerp(a[n], b[n], k)));
    return gm;
  }
  const asGeom = (gm) => (typeof gm === 'string' || !gm ? geom(gm || 'full') : gm);
  /** x of a (fractional) year on the street */
  const X = (year, gm) => { gm = asGeom(gm); return gm.x0 + ((year - Y0) / (Y1 - Y0)) * (gm.x1 - gm.x0); };
  /** year at an x on the street (inverse of X) */
  const yearAt = (x, gm) => { gm = asGeom(gm); return Y0 + ((x - gm.x0) / (gm.x1 - gm.x0)) * (Y1 - Y0); };
  const byKey = (k) => BUILDINGS.find((b) => b.key === k) || LANTERNS.find((b) => b.key === k);

  // ---------------------------------------------------------------- the year tag
  /** the words a building shows in a mode: 'full' "1969 · Unix" | 'year' "1969" | 'name' "Unix" */
  function words(b, mode = 'full') {
    const yl = b.yl || String(b.year);
    if (mode === 'year') return { year: yl };
    if (mode === 'name') return { name: b.name };
    return { year: yl, name: b.name };
  }
  function tagParts(w, size, tone) {
    const parts = [];
    if (w.year) parts.push({ s: w.year, ...type.year, size, color: tone === 'lantern' ? C.accent : C.head });
    if (w.year && w.name) parts.push({ s: '  ·  ', font: 'ui', weight: 400, size, color: C.soft });
    if (w.name) parts.push({ s: w.name, ...type.name, size, color: C.strong });
    return parts;
  }
  /** pill size of a tag without drawing it → {w, h} */
  function tagSize(w, o = {}) {
    const size = o.size || 26, parts = tagParts(w, size, o.tone);
    const tw = parts.reduce((s, p) => s + K.measure(p.s, p), 0) + (o.icon ? size * 1.25 : 0);
    return { w: tw + size * 1.4, h: size * 1.85 };
  }
  /**
   * a year tag: pill with a mono year (gold, or terracotta for tone 'lantern'), a soft dot, a cream name.
   * w: {year, name} (either may be missing).  o: {size 26, tone 'street'|'lantern', lit 0..1 (warm stroke + glow),
   *   alpha, align 'center'|'right'|'left' (x is the centre / right edge / left edge), icon (K.icon name, drawn inside, left)}
   * returns {x0, x1, y0, y1, cx, w, h}
   */
  function tag(x, y, w, o = {}) {
    const g = G(), size = o.size || 26, tone = o.tone || 'street';
    const mk = o.from ? clamp01(o.fromK) : 1;            // o.from: words to morph FROM, o.fromK: 0 = from, 1 = w
    const s1 = tagSize(w, o), s0 = o.from ? tagSize(o.from, o) : s1;
    // morph in three steps so two texts never overlap: old words fade (0–.4), pill resizes (.2–.8), new words fade in (.6–1)
    const pw = lerp(s0.w, s1.w, K.ease.io(K.seg(mk, 0.2, 0.8))), h = s1.h;
    const x0 = o.align === 'right' ? x - pw : o.align === 'left' ? x : x - pw / 2;
    const lit = clamp01(o.lit), warm = tone === 'lantern' ? C.accent : C.head;
    K.layer(o.alpha ?? 1, () => {
      if (lit > 0) K.glow(x0 + pw / 2, y, pw * 0.7, warm, 0.16 * lit);
      g.save();
      K.rr(x0, y - h / 2, pw, h, h / 2); g.fillStyle = C.tile; g.fill();
      g.lineWidth = 1.5 + 0.5 * lit; g.strokeStyle = K.mixColor(C.line2, warm, 0.25 + 0.65 * lit);
      if (lit > 0) { g.shadowColor = K.rgba(warm, 0.45 * lit); g.shadowBlur = 22; }
      K.rr(x0, y - h / 2, pw, h, h / 2); g.stroke();
      g.restore();
      let tx = x0 + size * 0.7;
      if (o.icon) { K.icon(o.icon, tx + size * 0.42, y, size * 1.05, { color: warm, w: 2 }); tx += size * 1.25; }
      const textW = pw - (tx - x0) - size * 0.7, cxT = tx + textW / 2;
      g.save(); K.rr(x0, y - h / 2, pw, h, h / 2); g.clip();
      if (mk < 1) K.layer(1 - K.seg(mk, 0, 0.4), () => K.spans(tagParts(o.from, size, tone), cxT, y + size * 0.34, { size, align: 'center' }));
      if (mk > 0) K.layer(K.seg(mk, 0.6, 1), () => K.spans(tagParts(w, size, tone), cxT, y + size * 0.34, { size, align: 'center' }));
      g.restore();
    });
    return { x0, x1: x0 + pw, y0: y - h / 2, y1: y + h / 2, cx: x0 + pw / 2, w: pw, h };
  }

  // ---------------------------------------------------------------- positions (for arrows, rings, cameras)
  /** where a building's tag hangs in geom gm → {x, y (tag centre), nx, ny (its node on the street), above} */
  function itemPos(gm, b) {
    gm = asGeom(gm); if (typeof b === 'string') b = byKey(b);
    const x = X(b.year, gm), off = gm[b.row || 'a1'];
    return { x, y: gm.y + off, nx: x, ny: gm.y, above: off < 0 };
  }
  /** the rect of a building's tag in geom gm and mode → {x0, x1, y0, y1, cx, w, h} (no drawing) */
  function itemRect(gm, b, mode = 'full', o = {}) {
    gm = asGeom(gm); if (typeof b === 'string') b = byKey(b);
    const p = itemPos(gm, b), s = tagSize(words(b, mode), { size: gm.tag, icon: o.icons ? b.icon : null });
    return { x0: p.x - s.w / 2, x1: p.x + s.w / 2, y0: p.y - s.h / 2, y1: p.y + s.h / 2, cx: p.x, cy: p.y, w: s.w, h: s.h };
  }
  /** lantern i's centre (for glows, arrows) in geom gm */
  function lanternAt(gm, i, t = 0) {
    gm = asGeom(gm); const L = LANTERNS[i], x = lanternX(gm, i);
    return { x, y: cordY(gm, x) + L.drop * (gm.ls / 46) + gm.ls * 0.62 };
  }
  /** lantern i's tag rect in the right-aligned stack → {x0, x1, y0, y1, cx, cy, w, h} */
  function lanternTagRect(gm, i, mode = 'full') {
    gm = asGeom(gm); const s = tagSize(words(LANTERNS[i], mode), { size: gm.tag, tone: 'lantern' });
    const cy = gm.stackY + i * gm.stackDy;
    return { x0: gm.stackX - s.w, x1: gm.stackX, y0: cy - s.h / 2, y1: cy + s.h / 2, cx: gm.stackX - s.w / 2, cy, w: s.w, h: s.h };
  }
  const lanternX = (gm, i) => X(LANTERNS[i].year, gm) + LANTERNS[i].dx * ((gm.x1 - gm.x0) / 1600);
  // the lantern cord: from just before 2021 to just past the street's end, gentle sag
  const cordEnds = (gm) => ({ a: X(2019.4, gm) - gm.ls * 0.3, b: gm.x1 + gm.ls * 0.5 });
  function cordY(gm, x) {
    const { a, b } = cordEnds(gm), sag = 8 * (gm.ls / 46);
    return gm.cordY + sag * (1 - Math.pow((2 * (x - a)) / (b - a) - 1, 2));
  }

  // ---------------------------------------------------------------- drawing: one paper lantern
  /**
   * a chochin paper lantern hanging from (x, y) (top of its hook): s = size (46 on 'full').
   * lit 0..1: unlit = dark paper outline (ghost), lit = warm glowing paper like the plate's lanterns.
   * o: {alpha, glow (multiplier, default 1)}.  Matches the painted plate: round warm bodies, dark caps.
   */
  function lantern(x, y, s, lit = 1, o = {}) {
    const g = G(), lk = clamp01(lit), rx = s * 0.34, ry = s * 0.36, cy = y + s * 0.62;
    K.layer(o.alpha ?? 1, () => {
      if (lk > 0) K.glow(x, cy, s * 2.6, palette.lanternGlow, 0.3 * lk * (o.glow ?? 1));
      g.save(); g.lineCap = 'round';
      // hook
      g.strokeStyle = C.line2; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, cy - ry - s * 0.05); g.stroke();
      // body: ghost paper, then the lit paper on top at alpha lk
      g.beginPath(); g.ellipse(x, cy, rx, ry, 0, 0, 7);
      g.fillStyle = K.rgba(C.tile, 0.9); g.fill();
      g.lineWidth = 1.5; g.strokeStyle = C.line2; g.stroke();
      if (lk > 0) {
        g.save(); g.globalAlpha *= lk;
        const gr = g.createRadialGradient(x - rx * 0.2, cy - ry * 0.25, 0, x, cy, ry * 1.05);
        gr.addColorStop(0, '#FBEBC4'); gr.addColorStop(0.55, '#F3C878'); gr.addColorStop(1, '#D98E4E');
        g.shadowColor = K.rgba(palette.lanternGlow, 0.8); g.shadowBlur = s * 0.6;
        g.beginPath(); g.ellipse(x, cy, rx, ry, 0, 0, 7); g.fillStyle = gr; g.fill();
        g.restore();
      }
      // ribs (paper creases), clipped to the body
      g.save(); g.beginPath(); g.ellipse(x, cy, rx, ry, 0, 0, 7); g.clip();
      g.strokeStyle = lk > 0.5 ? 'rgba(150,90,40,.28)' : K.rgba(C.line2, 0.8); g.lineWidth = Math.max(1, s * 0.025);
      for (let j = -2; j <= 2; j++) { const yy = cy + j * ry * 0.38; g.beginPath(); g.moveTo(x - rx, yy); g.quadraticCurveTo(x, yy + s * 0.05, x + rx, yy); g.stroke(); }
      g.restore();
      // caps and tassel
      g.fillStyle = '#2A2632';
      K.rr(x - rx * 0.55, cy - ry - s * 0.06, rx * 1.1, s * 0.1, 2); g.fill();
      K.rr(x - rx * 0.55, cy + ry - s * 0.04, rx * 1.1, s * 0.1, 2); g.fill();
      g.strokeStyle = lk > 0.5 ? K.rgba(C.accent, 0.8) : C.line2; g.lineWidth = Math.max(1.5, s * 0.035);
      g.beginPath(); g.moveTo(x, cy + ry + s * 0.06); g.lineTo(x, cy + ry + s * 0.2); g.stroke();
      g.restore();
    });
  }

  // ---------------------------------------------------------------- drawing: the lanterns
  /**
   * the three lanterns over the far end.  o: {lit (0..1 | (i)=>), cord 0..1 (draw progress; default 1),
   *   alpha, glow (glow strength multiplier, default 1)}
   * Unlit lanterns are 0.2-alpha ghosts with no glow, as on K.map.
   */
  function lanterns(t, gm, o = {}) {
    gm = asGeom(gm);
    const g = G(), lit = per(o.lit, 1), ck = clamp01(o.cord ?? 1), s = gm.ls, gw = o.glow ?? 1;
    const { a, b } = cordEnds(gm);
    K.layer(o.alpha ?? 1, () => {
      if (ck > 0) {
        g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
        const n = 24;
        for (let j = 0; j <= n * ck; j++) { const x = lerp(a, b, j / n); j ? g.lineTo(x, cordY(gm, x)) : g.moveTo(x, cordY(gm, x)); }
        g.stroke(); g.restore();
        K.layer(ck, () => { g.save(); g.fillStyle = C.line2; [a, b].forEach((x) => { g.beginPath(); g.arc(x, cordY(gm, x), 3.5, 0, 7); g.fill(); }); g.restore(); });
      }
      LANTERNS.forEach((L, i) => {
        const lk = clamp01(lit(i)), x = lanternX(gm, i), cy = cordY(gm, x), drop = L.drop * (s / 46);
        const sway = K.wave(t, motion.sway.speed, motion.sway.amp, i * 1.7);
        K.layer(0.35 + 0.65 * lk, () => K.at(x, cy, 1, sway, () => {
          if (drop > 0) K.line(0, 0, 0, drop, { color: C.line2, w: 1.5 });
          lantern(0, drop, s, lk, { glow: gw });
        }));
      });
    });
  }

  // ---------------------------------------------------------------- drawing: the street
  /**
   * the street of years.  t drives only the lanterns' sway.
   * o: {geom (preset name or geom; default 'full'),
   *   draw: year the street is drawn up to (default 2026; 04 draws it in),  litTo: year the gold line is lit up to
   *     (default = draw; 01's ghost uses litTo < draw), ghost: alpha of the unlit part (default .45),
   *   items: building list (default BUILDINGS; pass your own [{year, name, yl, row, key}] for 01's ghost words),
   *   show (0..1 | (i)=>) each tag's hang progress (stem then tag; default 1),
   *   itemAlpha (0..1 | (i)=>) dim tags (07 at .5, 03-style focus), itemLit (0..1 | (i)=>) warm stroke + glow,
   *   mode 'full'|'year'|'name' (tag words), modeFrom + modeK: crossfade from modeFrom to mode (08: 'full' → 'name'),
   *   icons (bool): small icon inside each tag (off by default; on only where a scene has room),
   *   lanterns (0..1 | (i)=>) lantern light (default 1), cord 0..1, lanternTags (0..1 | (i)=>) the stacked
   *     terracotta lantern tags (default 0: scenes reveal them on their spoken names), lanternMode,
   *   stretch 0..1: the 2021–2026 segment turns terracotta (default = max lantern light),
   *   pre 0..1: faint dashed extension left to x 100 (05's "AI research · 1950s"),
   *   ticks / tickLabels alpha multipliers, alpha}
   * returns the geom (for M.X / itemPos / brackets).
   */
  function street(t, o = {}) {
    const gm = asGeom(o.geom);
    const g = G();
    const items = o.items || BUILDINGS;
    const show = per(o.show, 1), itemA = per(o.itemAlpha, 1), itemLit = per(o.itemLit, 0);
    const lanternK = per(o.lanterns, 1), ltag = per(o.lanternTags, 0);
    const drawY = K.clamp(o.draw ?? Y1, Y0, Y1), litY = K.clamp(o.litTo ?? drawY, Y0, drawY);
    const xd = X(drawY, gm), xl = X(litY, gm), y = gm.y;
    const maxLantern = Math.max(...LANTERNS.map((_, i) => clamp01(lanternK(i))));
    const stretch = clamp01(o.stretch ?? maxLantern);
    const ghost = o.ghost ?? 0.45;
    K.layer(o.alpha ?? 1, () => {
      // 0. pre-history: a faint dashed run off to the left (AI research 1950s), never lit
      const pre = clamp01(o.pre);
      if (pre > 0) K.line(gm.x0, y, lerp(gm.x0, 100, pre), y, { color: C.line2, w: 2, dash: [6, 10], alpha: 0.8 });
      // 1. the band: a soft lane under the line
      const band = clamp01(gm.band);
      if (band > 0 && xd > gm.x0) K.line(gm.x0, y, xd, y, { color: C.line, w: 12 * (gm.node / 5), alpha: 0.55 * band });
      // 2. decade ticks (and decorative mono labels) once the street has reached them
      const tA = clamp01(gm.ticks) * (o.ticks ?? 1), tlA = clamp01(gm.tickLabels) * (o.tickLabels ?? 1);
      for (let d = 1970; d <= 2020; d += 10) {
        const x = X(d, gm), k = K.seg(drawY, d - 0.5, d + 1.5);
        if (k <= 0 || tA <= 0) continue;
        K.line(x, y + 4, x, y + 4 + 8 * (gm.node / 5), { color: C.line2, w: 2, alpha: tA * k });
        if (tlA > 0) K.text(String(d), x, y + 40 * (gm.node / 5), { ...type.tickLabel, size: gm.node >= 5 ? 22 : 20, color: C.quiet, align: 'center', alpha: tlA * k * 0.9 });
      }
      // 3. the line: unlit part (line2, ghost), lit gold part, terracotta lantern stretch
      if (xd > xl) K.line(xl, y, xd, y, { color: C.line2, w: 2, alpha: ghost / 0.45 * 0.9 });
      if (xl > gm.x0) {
        const xs = Math.min(xl, X(2020.5, gm));
        K.line(gm.x0, y, xs, y, { color: C.head, w: 2.5 });
        if (xl > xs) K.line(xs, y, xl, y, { color: K.mixColor(C.head, C.accent, stretch), w: 2.5 });
      }
      // street ends: a small round cap at 1965; the far end is open (still being built)
      if (xd > gm.x0) { g.save(); g.fillStyle = xl > gm.x0 ? C.head : C.line2; g.beginPath(); g.arc(gm.x0, y, gm.node * 0.8, 0, 7); g.fill(); g.restore(); }
      // 4. lantern-stretch nodes (2021 / 2022 / 2024)
      LANTERNS.forEach((L, i) => {
        const x = X(L.year, gm); if (x > xd) return;
        const lk = clamp01(lanternK(i));
        g.save(); g.fillStyle = K.mixColor(C.line2, C.accent, lk); g.beginPath(); g.arc(x, y, gm.node * 0.85, 0, 7); g.fill(); g.restore();
      });
      // 5. the buildings: node, stem, tag
      const showTags = clamp01(gm.tagA);
      items.forEach((b, i) => {
        const k = clamp01(show(i)); if (k <= 0) return;
        const x = X(b.year, gm); if (x > xd + 0.5) return;
        const lit = clamp01(itemLit(i)), a = clamp01(itemA(i));
        const nodeK = K.seg(k, 0, 0.2);
        K.layer(a, () => {
          g.save(); g.fillStyle = x <= xl + 0.5 ? C.head : C.line2;
          g.beginPath(); g.arc(x, y, gm.node * (0.6 + 0.4 * nodeK), 0, 7); g.fill(); g.restore();
          if (showTags <= 0.01) return;
          const off = gm[b.row || 'a1'], dir = Math.sign(off) || -1;
          const r = itemRect(gm, b, o.mode || 'full', o);
          const stemEnd = dir < 0 ? r.y1 : r.y0;
          const sk = K.seg(k, 0, 0.45), tk = K.ease.out(K.seg(k, 0.35, 1));
          K.line(x, y + dir * gm.node, x, lerp(y + dir * gm.node, stemEnd, sk), { color: K.mixColor(C.line2, C.head, 0.35 + 0.5 * lit), w: 1.5, alpha: showTags });
          if (tk <= 0) return;
          const ty = r.cy + dir * (1 - tk) * -10;   // the tag settles 10 px toward its stem's end
          const morph = o.modeFrom && o.modeK != null && o.modeK < 1;
          tag(x, ty, words(b, o.mode || 'full'), { size: gm.tag, lit, alpha: tk * showTags, icon: o.icons ? b.icon : null,
            from: morph ? words(b, o.modeFrom) : null, fromK: o.modeK });
        });
      });
      // 6. lanterns, then their stacked tags (right-aligned at stackX)
      lanterns(t, gm, { lit: lanternK, cord: o.cord ?? 1, glow: o.lanternGlow });
      LANTERNS.forEach((L, i) => {
        const k = clamp01(ltag(i)); if (k <= 0) return;
        const r = lanternTagRect(gm, i, o.lanternMode || 'full');
        tag(r.x1, r.cy + (1 - K.ease.out(k)) * 12, words(L, o.lanternMode || 'full'), { size: gm.tag, tone: 'lantern', align: 'right', lit: clamp01(lanternK(i)) * 0.6, alpha: k });
      });
    });
    return gm;
  }

  // ---------------------------------------------------------------- brackets, light, markers
  /**
   * a bracket under (or over) a span of years, drawn from its left end with progress k, label under it.
   * o: {k, color (C.head | C.accent), y (px; default gm.y + 240), label, align 'center'|'right'|'left',
   *   labelX (default: centre of the span, or right end + 40 when align 'right'), size 30, up (ticks point up, default true), alpha}
   */
  function bracket(gm, yearA, yearB, o = {}) {
    gm = asGeom(gm);
    const k = clamp01(o.k ?? 1); if (k <= 0) return;
    const xa = X(yearA, gm), xb = X(yearB, gm), y = o.y ?? gm.y + 240, col = o.color || C.head, dir = o.up === false ? 1 : -1;
    K.layer(o.alpha ?? 1, () => {
      K.line(xa, y + dir * 14, xa, y, { color: col, w: 2.5, k: K.seg(k, 0, 0.15) });
      K.line(xa, y, xb, y, { color: col, w: 2.5, k: K.seg(k, 0.1, 0.85) });
      K.line(xb, y, xb, y + dir * 14 * K.seg(k, 0.85, 1), { color: col, w: 2.5 });
      if (o.label) {
        const al = o.align || 'center';
        const lx = o.labelX ?? (al === 'right' ? 1800 : al === 'left' ? xa : (xa + xb) / 2);
        K.text(o.label, lx, y + 44, { ...type.bracket, size: o.size || 30, color: col, align: al, alpha: K.seg(k, 0.5, 1) });
      }
    });
  }
  /**
   * soft light spreading from the lanterns back along the street (07; also any "lit" moment).
   * k 0..1: 0 = a pool at the lanterns only, 1 = reaches 1969.  o: {a (strength, default .22), h (half-height, 120), color}
   */
  function light(gm, k, o = {}) {
    gm = asGeom(gm);
    const g = G(), kk = clamp01(k), xr = X(2024, gm) + 60, xl = lerp(X(2020, gm), X(1968, gm), kk);
    const cx = (xl + xr) / 2, rx = Math.max(80, (xr - xl) / 2 + 60), ry = o.h ?? 120, col = o.color || C.head;
    g.save(); g.translate(cx, gm.y - 20); g.scale(rx / ry, 1);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, ry);
    gr.addColorStop(0, K.rgba(col, o.a ?? 0.22)); gr.addColorStop(0.6, K.rgba(col, (o.a ?? 0.22) * 0.45)); gr.addColorStop(1, K.rgba(col, 0));
    g.fillStyle = gr; g.fillRect(-ry, -ry, ry * 2, ry * 2); g.restore();
  }
  /** a pin that drops onto (x, y) (its tip) at time `at`, then bobs gently. o: {s (34), color (gold), d (.5), alpha}. No overshoot. */
  function marker(t, at, x, y, o = {}) {
    const s = o.s ?? 34, k = K.io(t, at, o.d ?? 0.5, 'out');
    if (k <= 0) return;
    const bob = K.wave(t, motion.bob.speed, motion.bob.amp * (s / 44)) * k;
    const py = y - s * 0.38 - (1 - k) * 50 + bob - Math.abs(motion.bob.amp);
    K.layer((o.alpha ?? 1) * k, () => {
      K.glow(x, y, s * 1.1, o.color || C.head, 0.22 * k);
      K.icon('pin', x, py, s, { color: o.color || C.head });
    });
  }
  /** a single gentle swell 0→1→0 over [at, at+d] (pulses; never a flash) */
  const bump = (t, at, d = 0.9) => Math.sin(Math.PI * K.seg(t, at, at + d));
  /** stamp progress for 03's year tags: scale 1.25 → 1 and fade in over .4 s; e 'back' for the first only */
  function stamp(t, at, x, y, w, o = {}) {
    const k = K.io(t, at, 0.4, o.e || 'out');
    if (k <= 0) return;
    const s = lerp(1.25, 1, k);
    K.layer(Math.min(1, k * 1.4), () => K.at(x, y, s, 0, () => tag(0, 0, w, { size: o.size || 26, lit: o.lit ?? 0.5, tone: o.tone })));
  }

  // ---------------------------------------------------------------- the 00.02 road (scene 05)
  const STOPS = [
    { label: 'your computer', icon: 'laptop' },
    { label: 'the network', icon: 'wifi' },
    { label: 'the internet', icon: 'globe' },
    { label: 'services', icon: 'server' },
    { label: 'AI', icon: 'brain' },
  ];
  const ROAD = { xs: [260, 610, 960, 1310, 1660], y: 660, w: 290, h: 210, icon: 72, label: 32 };
  /** a line-drawn brain (00.02's; reads better than K.icon('brain') at small sizes). o: {color, alpha, w} */
  function brain(x, y, s, o = {}) {
    const g = G();
    K.layer(o.alpha ?? 1, () => {
      g.save(); g.translate(x, y); g.strokeStyle = o.color || C.strong; g.lineWidth = o.w || Math.max(2, s * 0.06);
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const sx of [-1, 1]) {
        g.save(); g.scale(sx, 1);
        g.beginPath();
        g.moveTo(s * 0.03, -s * 0.33);
        g.bezierCurveTo(s * 0.16, -s * 0.42, s * 0.33, -s * 0.36, s * 0.34, -s * 0.2);
        g.bezierCurveTo(s * 0.46, -s * 0.12, s * 0.45, s * 0.08, s * 0.36, s * 0.14);
        g.bezierCurveTo(s * 0.36, s * 0.3, s * 0.2, s * 0.37, s * 0.08, s * 0.3);
        g.quadraticCurveTo(s * 0.04, s * 0.34, s * 0.03, s * 0.36);
        g.stroke();
        g.beginPath(); g.moveTo(s * 0.14, -s * 0.2); g.quadraticCurveTo(s * 0.24, -s * 0.14, s * 0.2, -s * 0.03); g.stroke();
        g.beginPath(); g.moveTo(s * 0.34, s * 0.0); g.quadraticCurveTo(s * 0.22, s * 0.04, s * 0.18, s * 0.16); g.stroke();
        g.restore();
      }
      g.beginPath(); g.moveTo(0, -s * 0.33); g.lineTo(0, s * 0.36); g.stroke();
      g.restore();
    });
  }
  /** stop card i of the road → {x, y, l, r, t, b, iconY, labelY} */
  function stopRect(i, o = {}) {
    const x = (o.xs || ROAD.xs)[i], y = o.y ?? ROAD.y, w = o.w ?? ROAD.w, h = o.h ?? ROAD.h;
    return { x, y, w, h, l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2, iconY: y - h * 0.09, labelY: y + h * 0.333 };
  }
  /**
   * the 00.02 road: five stop-cards and the arrows between them, exactly as 00.02 drew it.
   * o: {y (660), lit (0..1 | (i)=>; default 0 = ghost), ghost (.15), arrows (0..1 | (i)=>; default 1), glow ((i)=> extra), alpha}
   */
  function road(t, o = {}) {
    const g = G(), lit = per(o.lit, 0), arrows = per(o.arrows, 1), glow = per(o.glow, 0), ghost = o.ghost ?? 0.15;
    K.layer(o.alpha ?? 1, () => {
      for (let i = 0; i < 4; i++) {
        const a = stopRect(i, o), b = stopRect(i + 1, o), k = clamp01(arrows(i));
        K.line(a.r, a.y, b.l, b.y, { color: C.line, w: 30, alpha: 0.55 });   // the lane, only between cards
        if (k <= 0) continue;
        const warm = Math.min(clamp01(lit(i)), clamp01(lit(i + 1)));
        K.arrow(a.r + 8, a.y, b.l - 8, b.y, { k, color: K.mixColor(C.line2, C.head, 0.7 * warm), w: 3, headSize: 13 });
      }
      STOPS.forEach((s, i) => {
        const c = stopRect(i, o), lk = clamp01(lit(i)), gk = clamp01(glow(i)), content = lerp(ghost, 1, lk);
        if (lk > 0) K.glow(c.x, c.iconY, c.w * 0.8, C.head, 0.1 * lk + 0.12 * gk);
        K.card(c.l, c.t, c.w, c.h, { fill: K.rgba(C.tile, lerp(0.25, 1, lk)), stroke: false, shadow: lk > 0.3 });
        g.save(); g.lineWidth = 1.5 + 0.5 * lk; g.strokeStyle = K.mixColor(C.line2, C.head, 0.8 * lk);
        g.globalAlpha *= lerp(0.55, 1, lk); if (lk < 0.5) g.setLineDash([6, 7]);
        if (lk + gk > 0) { g.shadowColor = K.rgba(C.head, 0.5 * Math.min(1, lk * 0.7 + gk)); g.shadowBlur = 36; }
        K.rr(c.l, c.t, c.w, c.h, 24); g.stroke(); g.restore();
        const ic = { color: K.mixColor(C.soft, C.head, lk), alpha: lerp(ghost * 1.6, 1, lk), w: 3.6 };
        if (s.icon === 'brain') brain(c.x, c.iconY, ROAD.icon, ic); else K.icon(s.icon, c.x, c.iconY, ROAD.icon, ic);
        K.text(s.label, c.x, c.labelY, { font: 'ui', weight: 600, size: ROAD.label, color: C.strong, align: 'center', alpha: lerp(ghost * 2, 1, lk) });
        K.eyebrow('Stop ' + (i + 1), c.x, c.t + 38, { size: 20, align: 'center', tracking: 3, alpha: content, color: K.mixColor(C.soft, C.gold, lk) });
      });
    });
  }

  // ---------------------------------------------------------------- layout constants scenes share
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    // 01 title stack (centred x 960)
    s01: { eyebrowY: 170, titleY: 250, purposeY: 325, conclusionY: 380, sortY: 840, sortOldX: 760, sortNewX: 1660, stillY: 760,
           ghostItems: [
             { year: 1971, name: 'terminal', row: 'a1' }, { year: 1981, name: 'files', row: 'a2' },
             { year: 1991, name: 'the web', row: 'a1' }, { year: 2005, name: 'git', row: 'a2' },
           ] },
    // 03 objects and where their year tags stamp
    s03: { win: [200, 230, 840, 520], file: [1300, 330, 110], ghostPy: [1580, 330, 110], term: [1180, 470, 580, 190], venv: [1300, 760, 90],
           tags: { notepad: [900, 254], python: [1580, 440], shell: [1610, 494], venv: [1440, 760] }, lineY: 880 },
    // 04 brackets (gm 'full': y 800 = street + 240)
    s04: { bracketY: 800 },
    // 05: street lifted (geom 'raised'), road at y 660; age labels under the cards
    s05: { roadY: 660, ageY: 820, servicePills: [790, 838, 886], birthday: [760, 470], preLabel: [100, 404] },
    // 06: strip (geom 'strip') at y 210; four cards
    s06: { cards: [300, 740, 1180, 1620], cardY: 520, cardW: 400, cardH: 360, ruleY: 840, ruleX: [620, 1300] },
    // 07: agent under the lanterns; where its four items land (x from M.X on 'full', y below the b2 row)
    s07: { agent: [1660, 430, 64], items: { cd: [1971, 790], py: [1991, 800], venv: [2012, 800], git: [2005, 860] }, lineY: 890, pill: [960, 200] },
    // 08 ignore pills and the two spans
    s08: { ignoreY: 300, ignoreX: [480, 960, 1440], spanY: 760, questionY: 860 },
    // 09 rows and the footer street
    s09: { rowsY: [320, 500, 680], rowX: 260, paraW: 1400 },
  };

  window.M = {
    palette, type, motion, layout, PRESETS, BUILDINGS, LANTERNS, YEARS, STOPS, ROAD, Y0, Y1,
    geom, lerpGeom, X, yearAt, byKey, words, itemPos, itemRect, lanternAt, lanternTagRect,
    tag, tagSize, street, lanterns, lantern, lanternX, bracket, light, marker, bump, stamp,
    road, stopRect, brain,
  };
})();
