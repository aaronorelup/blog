/* 00.03 How old is all this? (extended rebuild) — shared drawing (window.M)
   Metaphor: "the old street under constant renovation".
   1. THE STREET OF YEARS (kept from v1, unchanged API): one long street 1965 -> 2026, a year painted on every
      building, three paper lanterns (AI) hung only over its far end. M.street / M.tag / M.lerpGeom / M.bracket ...
      New here: M.houses (v1 scene 04's little houses, moved in so 04 and 05 share them) and the 'floor' preset
      (the dim reminder strip along y 900 that 05, 10 and 13 keep under everything).
   2. THE BUILDING (new): one tea-house building lifted off the street (Python, ~1991) whose parts age at three
      speeds, with the lanterns strung over its roof:
        stone (base)  = the idea      -> barely moves      gold      (C.head)
        paint (sign)  = the version   -> every year or so  cream     (C.strong on C.tile)
        lock (door)   = security      -> fastest           terracotta(C.accent)
        lanterns      = AI            -> fastest of all    gold paper, terracotta glow
      M.building(t, o) draws it in any layout (M.LAYOUTS: full, left, title, stage, rules, small, corner) and it only
      ever MOVES between layouts (M.lerpLayout), never gets redrawn differently. M.inBuilding(layout, fn) lets a scene
      draw extra things in the building's own (full-layout) coordinates; M.at(layout, part) gives screen anchors.
   3. Recurring pieces: M.paint (a sign that repaints: old words slide up and out, new ones rise in, fresh-paint glow),
      M.lockIcon (key / text / app / device / passkey ...), M.lockTile + M.LOCKS (the 08-09 lock line), M.strike
      (the soft dashed diagonal that means "broken / retired": never red, never a cross), M.speedLabel, M.phone,
      M.gatehouse, M.stall + M.parcel, M.versionPill, M.metal, M.surprise, M.say.
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
    // 05 10 13: the dim reminder strip along the bottom (draw at alpha ~.3; tags sit ON the line, mode 'year')
    floor:  { x0: 160, x1: 1760, y: 900, a1: 0, a2: 0, b1: 0, b2: 0, tag: 26, tagA: 1, ticks: 0.6, tickLabels: 0, band: 0.6,
              cordY: 846, ls: 26, stackX: 1800, stackY: 800, stackDy: 50, node: 3.5 },
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

  // ================================================================ v1 scene 04's houses (shared now)
  // A house is the year tag's rect padded into a facade with a gable roof (~1991 web · Python · Linux: three roofs).
  // Above the street a house stands on the far kerb, below it on the near kerb; roofs always point up.
  const HOUSE = { PAD: 7, EAVE: 8, RT: 14, RH: 13 };
  function houseGeo(gm, b) {
    const r = itemRect(gm, b), above = gm[b.row || 'a1'] < 0;
    const x0 = r.x0 - HOUSE.PAD, x1 = r.x1 + HOUSE.PAD, y0 = r.y0 - HOUSE.PAD, y1 = r.y1 + HOUSE.PAD;
    return { r, above, x0, x1, y0, y1, peaks: b.key === 'web' ? 3 : 1, top: y0 - HOUSE.RT };
  }
  function houseRoofPath(h, dy) {
    const g = G(), { EAVE, RT } = HOUSE, w = (h.x1 - h.x0 + 2 * EAVE) / h.peaks, ys = h.y0 + dy;
    g.beginPath(); g.moveTo(h.x0 - EAVE, ys + 1);
    for (let p = 0; p < h.peaks; p++) { const a = h.x0 - EAVE + p * w; g.lineTo(a + w / 2, ys - RT); g.lineTo(a + w, ys + 1); }
  }
  /**
   * the little houses behind the year tags (v1 scene 04). Draw pass 'body' BEFORE M.street and pass 'roofs' AFTER it
   * (so a stem hanging to a near-side sign enters under its roof).
   * o: {pass 'body'|'roofs', rise (i)=>0..1 (house rises out of the road), named (i)=>0..1 (ghost -> lit),
   *     warm (i)=>0..1 (brief warm roof stroke), alpha, items (default BUILDINGS)}
   */
  function houses(gm, o = {}) {
    gm = asGeom(gm);
    const g = G(), { EAVE, RT, PAD, RH } = HOUSE, roadT = gm.y - RH, roadB = gm.y + RH;
    const rise = per(o.rise, 1), named = per(o.named, 1), warm = per(o.warm, 0), items = o.items || BUILDINGS;
    const roofStroke = (lk, wk) => K.mixColor(C.line2, C.head, (0.3 + 0.35 * lk) + 0.3 * wk);
    const clipSide = (h) => { g.beginPath(); if (h.above) g.rect(0, 0, K.W, roadT - 1); else g.rect(0, roadB + 1, K.W, K.H); g.clip(); };
    K.layer(o.alpha ?? 1, () => items.forEach((b, i) => {
      const h = houseGeo(gm, b), rk = clamp01(rise(i)), lk = clamp01(named(i)), wk = clamp01(warm(i));
      if (rk <= 0) return;
      const dy = h.above ? (1 - rk) * (roadT - h.top + 2) : -(1 - rk) * (h.y1 - roadB + 2);
      const a = (0.42 + 0.58 * lk) * K.clamp(rk * 3);
      if (o.pass === 'roofs') {
        if (h.above) return;
        K.layer(a, () => {
          g.save(); clipSide(h);
          g.beginPath(); g.rect(h.x0 - EAVE - 2, h.top + dy - 4, h.x1 - h.x0 + 2 * EAVE + 4, RT + 4 + PAD - 1); g.clip();
          g.fillStyle = K.mixColor(C.panel, C.tile, 0.35); g.fillRect(h.x0 + 1, h.y0 + dy + 1, h.x1 - h.x0 - 2, PAD - 2);
          houseRoofPath(h, dy); g.closePath(); g.fillStyle = K.mixColor(C.tile, C.head, 0.08 + 0.06 * lk); g.fill();
          houseRoofPath(h, dy); g.lineWidth = 1.8 + 0.6 * wk; g.lineJoin = 'round'; g.strokeStyle = roofStroke(lk, wk); g.stroke();
          g.restore();
        });
        return;
      }
      K.layer(a, () => {
        g.save(); clipSide(h);
        K.line(h.r.cx, h.above ? roadT : roadB, h.r.cx, h.above ? h.y1 + dy : h.top + dy, { color: C.line2, w: 1.5, alpha: 0.6 * (1 - lk) });
        K.rr(h.x0, h.y0 + dy, h.x1 - h.x0, h.y1 - h.y0, 6);
        g.fillStyle = K.mixColor(C.panel, C.tile, 0.35); g.fill();
        g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, 0.12 + 0.2 * lk); g.stroke();
        const dw = 16, dh = 22, dyB = h.y1 + dy;
        K.rr(h.r.cx - dw / 2, dyB - dh - 2, dw, dh + 2, [8, 8, 0, 0]); g.fillStyle = K.rgba(C.line2, 0.9); g.fill();
        houseRoofPath(h, dy); g.closePath(); g.fillStyle = K.mixColor(C.tile, C.head, 0.08 + 0.06 * lk); g.fill();
        houseRoofPath(h, dy); g.lineWidth = 1.8 + 0.6 * wk; g.lineJoin = 'round'; g.strokeStyle = roofStroke(lk, wk); g.stroke();
        g.restore();
      });
    }));
  }

  // ================================================================ THE BUILDING
  // All geometry is in "full-layout" coordinates (the building centred on x 960, as the storyboard numbers it).
  // A layout {x, y, s} puts the PIVOT (960, 505: the middle of the building's height) at screen (x, y), scaled s.
  const BLD = {
    pivot: { x: 960, y: 505 },
    stone: { x: 660, y: 700, w: 600, h: 110, r: 12 },              // the idea
    walls: { x: 700, y: 380, w: 520, h: 320, r: 24 },
    roof: { cx: 960, by: 390, peak: 300 },                          // eave tips at x 640 / 1280, y 360
    beam: 492,                                                      // the horizontal timber between sign and door
    sign: { x: 960, y: 440, size: 30 },                             // the paint
    door: { x: 900, y: 520, w: 120, h: 180 },                       // the brand's one square element
    lock: { x: 960, y: 644, s: 56, s2: 44, gap: 52 },               // the lock (one icon at 56, two at 44)
    windows: [{ x: 744, y: 522, w: 112, h: 84 }, { x: 1064, y: 522, w: 112, h: 84 }],
    poles: [676, 1244], poleTop: 176, stringY: 190, sag: 16,        // the lantern string over the roof
    lanterns: { xs: [840, 960, 1080], drop: [12, 6, 12], s: 56 },
    stoneIcons: { xs: [820, 960, 1100], y: 738, s: 34 },
    stoneLabelY: [764, 792],                                        // without / with the three stone icons
    roofLabelY: 364,
    agent: { x: 1160, y: 262 },                                      // where 13's sparkle sits (right of the lanterns)
    bounds: { x0: 640, x1: 1280, y0: 150, y1: 810 },
  };
  const LAYOUTS = {
    full:   { x: 960, y: 505, s: 1 },      // 01 (after the title moves away), 05
    left:   { x: 520, y: 574, s: 0.8 },    // 06–11: right column x 1000–1800 is free; stone top y 730
    title:  { x: 960, y: 640, s: 0.7 },    // 01 title card: string y ~427, stone bottom y ~853, clears the conclusion at y 340
    stage:  { x: 700, y: 485, s: 0.9 },    // 13: right column x 1240–1780 free; pole tops y ~189, stone bottom y ~760 (clears a line at y 820)
    rules:  { x: 640, y: 580, s: 0.8 },    // 14: under the ignore pills (string y ~332); rules at x ~1170
    small:  { x: 960, y: 250, s: 0.38 },   // 12: thumbnail at top centre (pole tops y ~125, stone bottom y ~366); cards must start at y >= 380
    corner: { x: 1620, y: 760, s: 0.4 },   // 15 end card: bottom right, y ~637–882
  };
  const lay = (L) => (typeof L === 'string' ? LAYOUTS[L] || LAYOUTS.full : L || LAYOUTS.full);
  /** morph between two layouts (k 0..1, ease it yourself) */
  function lerpLayout(a, b, k) { a = lay(a); b = lay(b); k = clamp01(k); return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k) }; }
  /** a full-layout point (x, y) -> screen {x, y} in layout L */
  function toScreen(L, x, y) { L = lay(L); return { x: L.x + (x - BLD.pivot.x) * L.s, y: L.y + (y - BLD.pivot.y) * L.s }; }
  /** run fn(s) with the canvas transformed into the building's full-layout coordinates (draw extras that ride along) */
  function inBuilding(L, fn) {
    L = lay(L); const g = G();
    g.save(); g.translate(L.x, L.y); g.scale(L.s, L.s); g.translate(-BLD.pivot.x, -BLD.pivot.y); fn(L.s); g.restore();
  }
  /** full-layout anchor of a part: {x, y, r (right edge for arrows), w, h} */
  const PART = {
    stone: { x: 960, y: 755, r: 1262, w: 600, h: 110 },
    sign: { x: 960, y: 440, r: 1222, w: 260, h: 57 },
    walls: { x: 960, y: 540, r: 1222, w: 520, h: 320 },
    door: { x: 960, y: 610, r: 1022, w: 120, h: 180 },
    lock: { x: 960, y: 644, r: 1022, w: 120, h: 120 },
    roof: { x: 960, y: 340, r: 1280, w: 640, h: 90 },
    lanterns: { x: 960, y: 240, r: 1104, w: 300, h: 80 },
    lantern0: { x: 840, y: 249, r: 860, w: 40, h: 40 },
    lantern1: { x: 960, y: 241, r: 980, w: 40, h: 40 },
    lantern2: { x: 1080, y: 249, r: 1100, w: 40, h: 40 },
    agent: { x: BLD.agent.x, y: BLD.agent.y, r: BLD.agent.x + 30, w: 60, h: 60 },
    top: { x: 960, y: 150, r: 1280, w: 640, h: 0 },
    bottom: { x: 960, y: 810, r: 1280, w: 640, h: 0 },
  };
  /** screen anchor of a part in layout L: {x, y, r, w, h, s} (w/h already scaled) */
  function at(L, part) {
    L = lay(L); const p = PART[part] || PART.walls, c = toScreen(L, p.x, p.y);
    return { x: c.x, y: c.y, r: toScreen(L, p.r, p.y).x, w: p.w * L.s, h: p.h * L.s, s: L.s };
  }

  // ---------------------------------------------------------------- the paint (a sign that repaints)
  /**
   * a pill sign. text '' or null = blank. Repaint: pass o.from (old words) and o.k 0..1 (ease it yourself, ~0.5 s):
   * old words slide up and fade (k 0–.45), the pill resizes (.25–.75), new words rise in (.45–1), a soft
   * "fresh paint" glow swells and settles (no flash).
   * o: {size 30, font 'ui'|'mono', weight 600, color (text, default C.strong), dim 0..1 (text -> C.quiet),
   *     lit 0..1 (resting warm edge), warm (glow colour, default C.head), fill, stroke, blankW, align 'center'|'left'|'right', alpha}
   * returns {x0, x1, cx, w, h}
   */
  function paint(x, y, text, o = {}) {
    const g = G(), size = o.size || 30;
    const to = { size, font: o.font || 'ui', weight: o.weight || 600 };
    const repaint = o.from != null && o.k != null;
    const k = repaint ? clamp01(o.k) : 1;
    const wOf = (s) => (s ? K.measure(s, to) + size * 1.6 : (o.blankW ?? size * 4.2));
    const w = repaint ? lerp(wOf(o.from), wOf(text), K.ease.io(K.seg(k, 0.25, 0.75))) : wOf(text), h = size * 1.9;
    const x0 = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2, cx = x0 + w / 2;
    const fresh = repaint ? Math.sin(Math.PI * K.seg(k, 0.2, 1)) : 0;
    const warm = o.warm || C.head, lit = clamp01((o.lit || 0) + 0.9 * fresh);
    const col = K.mixColor(o.color || C.strong, C.quiet, clamp01(o.dim));
    K.layer(o.alpha ?? 1, () => {
      if (lit > 0) K.glow(cx, y, w * 0.8, warm, 0.2 * lit);
      g.save();
      K.rr(x0, y - h / 2, w, h, h / 2); g.fillStyle = o.fill || C.tile; g.fill();
      g.lineWidth = 1.5 + 0.8 * lit; g.strokeStyle = K.mixColor(o.stroke || C.line2, warm, 0.75 * lit);
      if (lit > 0) { g.shadowColor = K.rgba(warm, 0.5 * lit); g.shadowBlur = 24; }
      K.rr(x0, y - h / 2, w, h, h / 2); g.stroke();
      g.restore();
      g.save(); K.rr(x0, y - h / 2, w, h, h / 2); g.clip();
      const by = y + size * 0.34;
      if (repaint && k < 0.45 && o.from) {
        const ok = K.ease.in(K.seg(k, 0, 0.45));
        K.text(o.from, cx, by - 18 * ok, { ...to, color: col, align: 'center', alpha: 1 - ok });
      }
      if (text && (!repaint || k > 0.45)) {
        const nk = repaint ? K.ease.out(K.seg(k, 0.45, 1)) : 1;
        K.text(text, cx, by + 18 * (1 - nk), { ...to, color: col, align: 'center', alpha: nk });
      }
      g.restore();
    });
    return { x0, x1: x0 + w, cx, w, h };
  }

  // ---------------------------------------------------------------- locks
  /** composite lock icons: [outer, inner] (inner drawn small inside the outer) */
  const LOCK_ICONS = {
    password: ['key'], key: ['key'], lock: ['lock'], shield: ['shield'], phone: ['phone'], laptop: ['laptop'], device: ['laptop'],
    text: ['phone', 'envelope'],   // a code by text message
    app: ['phone', 'clock'],       // authenticator app: time-based codes
    push: ['phone', 'check'],      // "was this you?"
    passkey: ['phone', 'key'],     // a secret kept on your device
  };
  /**
   * a lock icon (plain K.icon names or a composite above), centred at (x, y), size s.
   * o: {color (default C.accent), dim 0..1 (-> C.quiet, .45 alpha), turn (radians, rotates the key / inner icon), alpha, w}
   */
  function lockIcon(name, x, y, s, o = {}) {
    const g = G(), parts = LOCK_ICONS[name] || [name], dim = clamp01(o.dim);
    const col = K.mixColor(o.color || C.accent, C.quiet, dim), w = o.w || Math.max(2, s * 0.06);
    K.layer((o.alpha ?? 1) * lerp(1, 0.45, dim), () => {
      const turn = o.turn || 0;
      if (parts.length === 1) {
        g.save(); g.translate(x, y); if (turn) g.rotate(turn); K.icon(parts[0], 0, 0, s, { color: col, w }); g.restore();
        return;
      }
      K.icon(parts[0], x, y, s, { color: col, w });
      const inner = parts[1], is = s * (inner === 'key' ? 0.36 : 0.34);
      g.save(); g.translate(x, y + s * 0.0); if (turn) g.rotate(turn); K.icon(inner, 0, 0, is, { color: col, w: Math.max(1.5, w * 0.75) }); g.restore();
    });
  }
  const asLocks = (v) => (v == null ? [] : (Array.isArray(v) ? v : [v]).map((e) => (typeof e === 'string' ? { icon: e } : e)));

  // ---------------------------------------------------------------- the roof (shared by the building and the gatehouses)
  /** the tea-house roof outline in full-layout coordinates: concave slopes, short ridge, upturned eave tips */
  function roofPath() {
    const g = G();
    g.beginPath();
    g.moveTo(640, 360);
    g.quadraticCurveTo(786, 350, 900, 300);
    g.lineTo(1020, 300);
    g.quadraticCurveTo(1134, 350, 1280, 360);
    g.lineTo(1276, 372);
    g.quadraticCurveTo(1250, 390, 1222, 390);
    g.lineTo(698, 390);
    g.quadraticCurveTo(670, 390, 644, 372);
    g.closePath();
  }
  function drawRoof(lit, o = {}) {
    const g = G(), warm = clamp01(lit);
    g.save();
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
    roofPath(); g.fillStyle = K.mixColor(C.panel, C.tile, 0.55); g.fill();
    g.shadowColor = 'transparent';
    // roof tile courses: faint lines following the slope, clipped to the roof
    g.save(); roofPath(); g.clip();
    g.strokeStyle = K.rgba(C.line2, 0.55); g.lineWidth = 1.5;
    for (let j = 1; j <= 3; j++) {
      const dy = j * 19;
      g.beginPath(); g.moveTo(640, 360 + dy * 0.2); g.quadraticCurveTo(786, 350 + dy * 0.62, 900, 300 + dy); g.lineTo(1020, 300 + dy);
      g.quadraticCurveTo(1134, 350 + dy * 0.62, 1280, 360 + dy * 0.2); g.stroke();
    }
    g.restore();
    roofPath(); g.lineWidth = 2; g.lineJoin = 'round'; g.strokeStyle = K.mixColor(C.line2, C.head, 0.2 + 0.5 * warm); g.stroke();
    // ridge cap
    g.lineCap = 'round'; g.strokeStyle = K.mixColor(C.line2, C.head, 0.35 + 0.5 * warm); g.lineWidth = 6;
    g.beginPath(); g.moveTo(894, 300); g.lineTo(1026, 300); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(894, 300); g.quadraticCurveTo(886, 298, 884, 290); g.moveTo(1026, 300); g.quadraticCurveTo(1034, 298, 1036, 290); g.stroke();
    // fascia (the board along the eaves)
    g.strokeStyle = K.mixColor(C.line2, C.head, 0.15 + 0.35 * warm); g.lineWidth = 2;
    g.beginPath(); g.moveTo(668, 380); g.lineTo(1252, 380); g.stroke();
    g.restore();
  }

  // ---------------------------------------------------------------- the building
  const growParts = (v, back) => {
    if (v && typeof v === 'object') return { stone: 1, walls: 1, roof: 1, door: 1, sign: 1, poles: 1, ...v };
    const k = v == null ? 1 : clamp01(v);
    const e = (a, b, ease = 'out') => K.ease[ease](K.seg(k, a, b));
    return { stone: e(0, 0.3), walls: e(0.2, 0.6, back ? 'back' : 'out'), roof: e(0.45, 0.75), door: e(0.6, 0.85), sign: e(0.7, 0.95), poles: e(0.8, 1) };
  };
  /**
   * THE BUILDING. t drives only idle motion (lantern sway, lock shake).
   * o: {
   *   layout: name | {x, y, s}   (or a morph from M.lerpLayout)            alpha: whole building
   *   grow: 0..1 (05's build-in: stone, walls, roof, door, sign, poles, staggered) or {stone, walls, roof, door, sign, poles}
   *   growBack: true -> the walls use the scene's one 'back' overshoot
   *   detail: show small text (default: layout scale >= .6; off on 'small' and 'corner')
   *   fade: {stone, walls, roof, sign, door, lanterns} per-part alpha (e.g. dim everything but the door)
   *   // stone
   *   stoneLit 0..1 (gold edge + glow), stoneLabel (default 'STONE · THE IDEA'; '' hides), stoneIcons: [{icon, k}] (book / check /
   *   envelope on 05's "file, commit, message"; the label slides down to make room)
   *   // paint
   *   sign: words ('' = blank), signFrom + signK (repaint), signFont 'ui'|'mono', signLit 0..1, signDim 0..1
   *   roofLabel: small eyebrow under the ridge ('PYTHON · 1991'), roofLabelFrom + roofLabelK (crossfade)
   *   // lock
   *   lock: icon | [icons | {icon, dim, turn, alpha}]  (LOCK_ICONS names: key text app push device laptop passkey lock shield phone)
   *   lockFrom + lockK: swap (old icons shrink and fade, new ones grow in), lockLit 0..1 (terracotta glow), lockShake 0..1
   *   (small ±4 px shake while > 0; give it an envelope like M.bump), doorGlow 0..1 (terracotta light from the door gap)
   *   windows 0..1 (warm paper windows; default .6)
   *   // lanterns
   *   lanterns: 0..1 | (i)=> light (default 1), hang: 0..1 | (i)=> drop-in (default 1), swap: number | (i)=> (13: 1.4 = second
   *   swap at 40 %: old fades, new drops in), sway: amplitude multiplier | (i)=>, string 0..1 (poles + string; default 1),
   *   light 0..1 (13: lantern light spreading down over the building)
   * }
   * returns the resolved layout {x, y, s}
   */
  function building(t, o = {}) {
    const L = lay(o.layout), g = G(), s = L.s;
    const detail = o.detail ?? s >= 0.6;
    const gp = growParts(o.grow, o.growBack);
    const fade = { stone: 1, walls: 1, roof: 1, sign: 1, door: 1, lanterns: 1, ...(o.fade || {}) };
    const fit = (size, min) => Math.max(size, min / s);   // keep text at its screen minimum when the building is scaled down
    inBuilding(L, () => K.layer(o.alpha ?? 1, () => {
      // ---- light from the lanterns (behind everything)
      const lightK = clamp01(o.light);
      if (lightK > 0) {
        K.glow(960, 260, lerp(220, 760, lightK), palette.lanternGlow, 0.16 + 0.08 * lightK);
        K.glow(960, 560, lerp(120, 520, lightK), C.head, 0.12 * lightK);
      }
      // ---- poles and string (drawn up from the roof)
      const pk = gp.poles * clamp01(o.string ?? 1);
      if (pk > 0) K.layer(fade.lanterns, () => {
        BLD.poles.forEach((px) => {
          const y0 = 356, y1 = lerp(y0, BLD.poleTop, pk);
          K.line(px, y0, px, y1, { color: K.mixColor(C.line2, C.soft, 0.25), w: 3.5 });
          if (pk > 0.98) { g.save(); g.fillStyle = K.mixColor(C.line2, C.soft, 0.4); g.beginPath(); g.arc(px, BLD.poleTop - 2, 4.5, 0, 7); g.fill(); g.restore(); }
        });
        const sk = K.seg(pk, 0.7, 1);
        if (sk > 0) {
          g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.beginPath();
          const n = 24, a = BLD.poles[0], b = BLD.poles[1];
          for (let j = 0; j <= n * sk; j++) { const x = lerp(a, b, j / n); const y = stringY(x); j ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.stroke(); g.restore();
        }
      });
      // ---- stone
      if (gp.stone > 0 && fade.stone > 0) K.layer(fade.stone * Math.min(1, gp.stone * 1.5), () => {
        const st = BLD.stone, sl = clamp01(o.stoneLit), sx = lerp(0.3, 1, gp.stone);
        g.save(); g.translate(960, st.y + st.h); g.scale(sx, 1); g.translate(-960, -(st.y + st.h));
        if (sl > 0) K.glow(960, st.y + st.h / 2, 420, C.head, 0.14 * sl);
        K.card(st.x, st.y, st.w, st.h, { r: st.r, fill: K.mixColor(C.tile, C.panel, 0.2), stroke: K.mixColor(C.line2, C.head, 0.55 + 0.45 * sl), lw: 2, glow: 0.7 * sl });
        // masonry joints, only at the ends (the middle stays clear for the label and icons)
        g.save(); g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5;
        [[st.x + 6, 755, st.x + 104, 755], [st.x + 52, 703, st.x + 52, 755], [st.x + 80, 755, st.x + 80, 807],
         [st.x + st.w - 104, 755, st.x + st.w - 6, 755], [st.x + st.w - 52, 703, st.x + st.w - 52, 755], [st.x + st.w - 80, 755, st.x + st.w - 80, 807]]
          .forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
        g.restore();
        const icons = o.stoneIcons || [], ik = icons.length ? clamp01(icons[0].k ?? 1) : 0;
        icons.forEach((ic, i) => {
          const k = clamp01(ic.k ?? 1); if (k <= 0) return;
          K.icon(ic.icon, BLD.stoneIcons.xs[i] ?? 960, BLD.stoneIcons.y - (1 - K.ease.out(k)) * 12, BLD.stoneIcons.s, { color: C.head, alpha: k });
        });
        const label = o.stoneLabel ?? 'STONE · THE IDEA';
        if (detail && label) K.eyebrow(label, 960, lerp(BLD.stoneLabelY[0], BLD.stoneLabelY[1], K.ease.io(ik)),
          { size: fit(20, 20), align: 'center', tracking: 4, color: K.mixColor(C.soft, C.gold, 0.4 + 0.6 * sl) });
        g.restore();
      });
      // ---- walls (rise from the stone)
      if (gp.walls > 0) {
        const wl = BLD.walls, wy = wl.y + wl.h;
        g.save(); g.translate(960, wy); g.scale(1, Math.max(0.001, gp.walls)); g.translate(-960, -wy);
        K.layer(fade.walls * Math.min(1, gp.walls * 2), () => {
          K.card(wl.x, wl.y, wl.w, wl.h, { r: wl.r, fill: C.tile, stroke: C.line2 });
          // timber: two posts and the beam
          K.line(wl.x + 22, wl.y + 12, wl.x + 22, wy - 2, { color: K.rgba(C.line2, 1), w: 2 });
          K.line(wl.x + wl.w - 22, wl.y + 12, wl.x + wl.w - 22, wy - 2, { color: K.rgba(C.line2, 1), w: 2 });
          K.line(wl.x + 22, BLD.beam, wl.x + wl.w - 22, BLD.beam, { color: C.line2, w: 2 });
          // warm paper windows (shoji)
          const wk = clamp01(o.windows ?? 0.6);
          BLD.windows.forEach((w) => {
            if (wk > 0) K.glow(w.x + w.w / 2, w.y + w.h / 2, w.w * 0.85, '#F3C878', 0.14 * wk);
            const pg = g.createLinearGradient(0, w.y, 0, w.y + w.h);
            pg.addColorStop(0, K.mixColor(C.panel, '#F3C878', 0.1 + 0.42 * wk)); pg.addColorStop(1, K.mixColor(C.panel, '#D98E4E', 0.08 + 0.3 * wk));
            K.rr(w.x, w.y, w.w, w.h, 3); g.fillStyle = pg; g.fill();
            g.strokeStyle = K.mixColor(C.panel, C.line2, 0.6); g.lineWidth = 3; g.stroke();
            g.strokeStyle = K.rgba(C.panel, 0.85); g.lineWidth = 2; g.beginPath();
            for (let j = 1; j < 4; j++) { g.moveTo(w.x + (w.w * j) / 4, w.y + 2); g.lineTo(w.x + (w.w * j) / 4, w.y + w.h - 2); }
            for (let j = 1; j < 3; j++) { g.moveTo(w.x + 2, w.y + (w.h * j) / 3); g.lineTo(w.x + w.w - 2, w.y + (w.h * j) / 3); }
            g.stroke();
          });
        });
        g.restore();
      }
      // ---- door (grows down from the beam) and its lock
      if (gp.door > 0 && fade.door > 0) K.layer(fade.door * Math.min(1, gp.door * 1.5), () => {
        const d = BLD.door, dg = clamp01(o.doorGlow);
        g.save(); g.translate(960, d.y + d.h); g.scale(1, lerp(0.4, 1, gp.door)); g.translate(-960, -(d.y + d.h));
        if (dg > 0) K.glow(960, d.y + d.h / 2, 190, C.accent, 0.3 * dg);
        g.save(); g.fillStyle = K.mixColor(C.panel, C.page, 0.4); g.fillRect(d.x, d.y, d.w, d.h);
        if (dg > 0) { const gr = g.createLinearGradient(d.x, 0, d.x + d.w, 0); gr.addColorStop(0, K.rgba(C.accent, 0)); gr.addColorStop(0.5, K.rgba(C.accent, 0.45 * dg)); gr.addColorStop(1, K.rgba(C.accent, 0)); g.fillStyle = gr; g.fillRect(d.x, d.y, d.w, d.h); }
        g.strokeStyle = C.line2; g.lineWidth = 2; g.strokeRect(d.x, d.y, d.w, d.h);
        // noren: a short split curtain across the top of the door
        g.fillStyle = K.mixColor(C.tile, C.accent, 0.42);
        for (let j = 0; j < 3; j++) { K.rr(d.x + 5 + j * 37.5, d.y + 2, 35, 44, [0, 0, 4, 4]); g.fill(); }
        g.fillStyle = K.mixColor(C.tile, C.head, 0.5); g.fillRect(d.x + 2, d.y + 2, d.w - 4, 4);
        g.restore();
        g.restore();
        // the lock: one icon at 56, two side by side at 44
        const lk = clamp01(o.lockLit), shake = clamp01(o.lockShake) * Math.sin(t * 40) * 4;
        if (lk > 0) K.glow(960, BLD.lock.y, 110, C.accent, 0.26 * lk);
        const drawSet = (list, a, sc, dy) => {
          const n = list.length, size = n > 1 ? BLD.lock.s2 : BLD.lock.s;
          list.forEach((e, i) => {
            const x = 960 + (i - (n - 1) / 2) * BLD.lock.gap + shake;
            K.at(x, BLD.lock.y + dy, sc, 0, () => lockIcon(e.icon, 0, 0, size, { dim: e.dim, turn: e.turn, alpha: a * (e.alpha ?? 1) }));
          });
        };
        const to = asLocks(o.lock);
        if (o.lockFrom != null && o.lockK != null && o.lockK < 1) {
          const k = clamp01(o.lockK);
          drawSet(asLocks(o.lockFrom), 1 - K.seg(k, 0, 0.5), lerp(1, 0.7, K.ease.in(K.seg(k, 0, 0.5))), 8 * K.seg(k, 0, 0.5));
          drawSet(to, K.seg(k, 0.35, 1), lerp(1.25, 1, K.ease.out(K.seg(k, 0.35, 1))), 0);
        } else drawSet(to, 1, 1, 0);
      });
      // ---- roof (drops on)
      if (gp.roof > 0 && fade.roof > 0) K.layer(fade.roof * gp.roof, () => {
        g.save(); g.translate(0, -36 * (1 - gp.roof));
        drawRoof(o.roofLit ?? 0.3);
        if (detail && o.roofLabel) {
          const rk = o.roofLabelFrom != null && o.roofLabelK != null ? clamp01(o.roofLabelK) : 1;
          const eo = { size: fit(20, 20), align: 'center', tracking: 3, color: C.soft, font: 'mono', weight: 600, upper: true };
          if (rk < 1) K.text(o.roofLabelFrom, 960, BLD.roofLabelY, { ...eo, alpha: 1 - K.seg(rk, 0, 0.5) });
          K.text(o.roofLabel, 960, BLD.roofLabelY, { ...eo, alpha: K.seg(rk, 0.5, 1) });
        }
        g.restore();
      });
      // ---- the sign (paint), on the wall above the beam
      if (gp.sign > 0 && gp.walls > 0.6 && fade.sign > 0) {
        const txt = detail ? o.sign ?? '' : '';
        paint(BLD.sign.x, BLD.sign.y, txt, {
          size: detail ? fit(BLD.sign.size, 26) : BLD.sign.size, font: o.signFont || 'ui', from: detail ? o.signFrom : o.signFrom != null ? '' : null, k: o.signK,
          lit: o.signLit, dim: o.signDim, alpha: fade.sign * gp.sign, blankW: 150,
        });
      }
      // ---- lanterns
      if (fade.lanterns > 0 && pk > 0.6) K.layer(fade.lanterns, () => {
        const lit = per(o.lanterns, 1), hang = per(o.hang, 1), swap = per(o.swap, 0), sway = per(o.sway, 1);
        BLD.lanterns.xs.forEach((x, i) => {
          const hk = clamp01(hang(i)); if (hk <= 0) return;
          const top = stringY(x), drop = BLD.lanterns.drop[i], ls = BLD.lanterns.s;
          const sw = K.wave(t, motion.sway.speed, motion.sway.amp * sway(i), i * 1.7);
          const one = (lk, a, dy) => K.layer(a, () => K.at(x, top, 1, sw, () => {
            K.line(0, 0, 0, drop + dy, { color: C.line2, w: 1.5 });
            lantern(0, drop + dy, ls, lk);
          }));
          const v = Math.max(0, swap(i)), n = Math.floor(v), f = v - n;
          const lk = clamp01(lit(i));
          const hangDy = -50 * (1 - K.ease.out(hk)), hangA = Math.min(1, hk * 1.6);
          if (f > 0) {
            one(lk, hangA * (1 - K.seg(f, 0, 0.45)), hangDy + 10 * K.ease.in(K.seg(f, 0, 0.45)));
            const nk = K.seg(f, 0.35, 1);
            one(lk * (0.6 + 0.4 * nk), hangA * nk, hangDy - 40 * (1 - K.ease.out(nk)));
          } else one(lk, hangA, hangDy);
        });
      });
    }));
    return L;
  }
  const stringY = (x) => {
    const a = BLD.poles[0], b = BLD.poles[1];
    return BLD.stringY + BLD.sag * (1 - Math.pow((2 * (x - a)) / (b - a) - 1, 2));
  };

  // ---------------------------------------------------------------- speed labels (01, 05, 14) and rules (14)
  const SPEEDS = {
    stone: { speed: 'barely moves', rule: 'stone · learn it once', color: C.head, y: 755 },
    sign: { speed: 'every year', rule: 'paint · check the version', color: C.strong, y: 440 },
    lock: { speed: 'fastest', rule: 'lock · assume it changed', color: C.accent, y: 644 },
    lanterns: { speed: 'fastest of all', rule: 'lantern · check the date', color: C.accent, y: 246 },
  };
  /**
   * a label to the right of the building with a short arrow back to its part.
   * part 'stone'|'sign'|'lock'|'lanterns'; k 0..1 (text slides in from +16 px, then the arrow draws).
   * o: {kind 'speed'|'rule', text (override), x (left edge; default building's right edge + 70), size 30, color, alpha}
   */
  function speedLabel(L, part, k, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    L = lay(L);
    const sp = SPEEDS[part], txt = o.text || sp[o.kind || 'speed'], col = o.color || sp.color, size = o.size || 30;
    const p = toScreen(L, 0, sp.y), right = toScreen(L, BLD.bounds.x1, 0).x;
    const x = o.x ?? right + 70, tx = at(L, part === 'lanterns' ? 'lanterns' : part).r + 12;
    const tk = K.ease.out(K.seg(k, 0, 0.6)), ak = K.ease.io(K.seg(k, 0.3, 1));
    K.layer(o.alpha ?? 1, () => {
      K.text(txt, x + 16 * (1 - tk), p.y + size * 0.34, { font: 'ui', weight: 600, size, color: col, alpha: tk });
      K.arrow(x - 16, p.y, tx, p.y, { k: ak, color: K.mixColor(col, C.soft, 0.35), w: 2.5, headSize: 12 });
    });
  }

  // ---------------------------------------------------------------- broken / retired
  /** the soft dashed diagonal meaning "broken / retired" across a rect, drawn with progress k. o: {color (C.quiet), w 3, alpha} */
  function strike(x0, y0, x1, y1, k, o = {}) {
    K.line(x0, y1, x1, y0, { k: clamp01(k), color: o.color || C.quiet, w: o.w || 3, dash: [10, 9], alpha: o.alpha ?? 0.9 });
  }

  // ---------------------------------------------------------------- the lock line (08, 09)
  const LOCKS = [
    { key: 'password', icon: 'key', label: ['password'] },
    { key: 'text', icon: 'text', label: ['text code'] },
    { key: 'app', icon: 'app', label: ['authenticator', 'app'] },
    { key: 'device', icon: 'device', label: ['your', 'device'] },
    { key: 'passkey', icon: 'passkey', label: ['passkey'] },
  ];
  const LOCKLINE = { xs: [1040, 1215, 1390, 1565, 1740], y: 300, s: 90, labelY: 383 };
  /**
   * one tile of the lock line: an icon tile with a 26 px label under it.
   * o: {icon (lockIcon name), label (string | [lines]), k 0..1 reveal (rise + fade), empty (dashed slot, no icon),
   *     dim 0..1 (retired: .4 alpha, quiet colour, the dashed diagonal), lit 0..1 (terracotta edge glow), s 90, color, alpha}
   */
  function lockTile(x, y, o = {}) {
    const g = G(), s = o.s || LOCKLINE.s, k = clamp01(o.k ?? 1), dim = clamp01(o.dim), lit = clamp01(o.lit);
    if (o.empty) {
      K.layer((o.alpha ?? 1) * 0.8, () => { g.save(); g.setLineDash([7, 8]); g.strokeStyle = C.line2; g.lineWidth = 2; K.rr(x - s / 2, y - s / 2, s, s, s * 0.28); g.stroke(); g.restore(); });
      if (k <= 0) return;
    }
    if (k <= 0) return;
    const dy = (1 - K.ease.out(k)) * 14;
    K.layer((o.alpha ?? 1) * k * lerp(1, 0.42, dim), () => {
      if (lit > 0) K.glow(x, y + dy, s * 1.1, C.accent, 0.2 * lit);
      K.card(x - s / 2, y - s / 2 + dy, s, s, { r: s * 0.28, fill: C.tile, stroke: K.mixColor(C.line2, o.color || C.accent, 0.25 + 0.6 * lit), shadow: false });
      lockIcon(o.icon || 'key', x, y + dy, s * 0.6, { color: o.color || C.accent, dim });
      const lines = Array.isArray(o.label) ? o.label : o.label ? [o.label] : [];
      lines.forEach((ln, i) => K.text(ln, x, y + s / 2 + 38 + i * 30 + dy, { font: 'ui', weight: 600, size: 26, color: K.mixColor(C.strong, C.quiet, dim), align: 'center' }));
    });
    if (dim > 0) K.layer((o.alpha ?? 1) * k, () => strike(x - s / 2 - 6, y - s / 2 - 6 + dy, x + s / 2 + 6, y + s / 2 + 6 + dy, dim));
  }

  // ---------------------------------------------------------------- a phone (08 code, 08 push, 09 passkey, 12)
  /**
   * a drawn phone, centred at (x, y), height h (width .52 h). fn(rect) draws the screen content, clipped.
   * o: {alpha, lit 0..1 (terracotta edge glow), stroke}. returns the screen rect {x, y, w, h, cx, cy}
   */
  function phone(x, y, h, o = {}, fn) {
    const g = G(), w = h * 0.52, x0 = x - w / 2, y0 = y - h / 2, r = h * 0.09, lit = clamp01(o.lit);
    const scr = { x: x0 + w * 0.08, y: y0 + h * 0.11, w: w * 0.84, h: h * 0.78 };
    scr.cx = scr.x + scr.w / 2; scr.cy = scr.y + scr.h / 2;
    K.layer(o.alpha ?? 1, () => {
      if (lit > 0) K.glow(x, y, h * 0.8, C.accent, 0.2 * lit);
      K.card(x0, y0, w, h, { r, fill: C.panel, stroke: K.mixColor(o.stroke || C.line2, C.accent, 0.6 * lit), lw: 2.5 });
      K.rr(scr.x, scr.y, scr.w, scr.h, r * 0.45); g.fillStyle = K.mixColor(C.tile, C.page, 0.2); g.fill();
      K.line(x - w * 0.12, y0 + h * 0.055, x + w * 0.12, y0 + h * 0.055, { color: C.line2, w: 4 });
      g.save(); g.beginPath(); g.arc(x, y0 + h * 0.945, h * 0.022, 0, 7); g.fillStyle = C.line2; g.fill(); g.restore();
      if (fn) { g.save(); K.rr(scr.x, scr.y, scr.w, scr.h, r * 0.45); g.clip(); fn(scr); g.restore(); }
    });
    return scr;
  }

  // ---------------------------------------------------------------- a gatehouse (10): a small building for one job
  /**
   * a gatehouse card with the building's roof on top, an icon and a label: one dedicated service.
   * (x, y) = centre of the card. o: {w 440, h 300, icon 'shield', label 'logins', k 0..1 (rise + fade), lit 0..1, alpha,
   *   iconColor (C.accent), size (label px; 30, or 26 when h < 200)}
   * returns {x0, x1, y0, y1, door: {x, y}} (door = where arrows should land: the card's left-middle)
   */
  function gatehouse(x, y, o = {}) {
    const g = G(), w = o.w || 440, h = o.h || 300, k = clamp01(o.k ?? 1), lit = clamp01(o.lit);
    const x0 = x - w / 2, y0 = y - h / 2, dy = (1 - K.ease.out(k)) * 20, sc = w / 560;
    if (k > 0) K.layer((o.alpha ?? 1) * k, () => {
      g.save(); g.translate(0, dy);
      if (lit > 0) K.glow(x, y, w * 0.7, C.head, 0.12 * lit);
      K.card(x0, y0, w, h, { r: Math.min(24, h * 0.12), fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.5 * lit), glow: 0.6 * lit });
      g.save(); g.translate(x, y0 + 6 * sc); g.scale(sc, sc); g.translate(-960, -390); drawRoof(0.3 + 0.5 * lit); g.restore();
      const is = Math.min(64, h * 0.3), size = o.size || (h < 200 ? 26 : 30);
      K.icon(o.icon || 'shield', x, y - h * 0.08, is, { color: o.iconColor || C.accent, w: Math.max(2.5, is * 0.06) });
      if (o.label) K.text(o.label, x, y + h * 0.3 + size * 0.2, { font: 'ui', weight: 600, size, color: C.strong, align: 'center' });
      g.restore();
    });
    return { x0, x1: x0 + w, y0, y1: y0 + h, door: { x: x0, y } };
  }

  // ---------------------------------------------------------------- the market (07)
  /** a little parcel (a package on the market). (x, y) centre, s size. o: {tint 0..2, alpha, outline (stroke colour), label (mono 26 under)} */
  function parcel(x, y, s, o = {}) {
    const g = G(), tints = ['#CDB48C', '#B99868', '#D9C7A6'], base = tints[(o.tint ?? 0) % 3];
    const w = s, h = s * 0.78, x0 = x - w / 2, y0 = y - h / 2 + s * 0.08, top = s * 0.18;
    K.layer(o.alpha ?? 1, () => {
      g.save();
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + top, y0 - top); g.lineTo(x0 + w + top * 0.2, y0 - top); g.lineTo(x0 + w, y0); g.closePath();
      g.fillStyle = K.mixColor(base, '#FFF3DC', 0.25); g.fill();
      K.rr(x0, y0, w, h, 3); g.fillStyle = K.mixColor(base, C.panel, 0.18); g.fill();
      g.fillStyle = K.mixColor(C.gold, base, 0.35); g.fillRect(x - w * 0.08, y0, w * 0.16, h);
      if (o.outline) { g.strokeStyle = o.outline; g.lineWidth = 2.5; K.rr(x0 - 4, y0 - top - 4, w + top * 0.2 + 8, h + top + 8, 6); g.stroke(); }
      g.restore();
      if (o.label) K.text(o.label, x, y0 + h + 34, { font: 'mono', size: 26, color: o.outline || C.body, align: 'center' });
    });
  }
  /**
   * a market stall: card (x, y top-left, w 340, h 300) with a noren awning, a 20 px eyebrow, and parcels that keep
   * arriving (a pure loop of t: one every `every` s from `flow`, eight slots, the oldest fades as a new one lands).
   * o: {title 'NPM · JAVASCRIPT', k 0..1 reveal, flow (start time; Infinity = none), every 0.8, seed 7, alpha, hold (freeze the
   *     flow at this time, e.g. when the lockfile pins it)}
   */
  function stall(t, x, y, o = {}) {
    const g = G(), w = o.w || 340, h = o.h || 300, k = clamp01(o.k ?? 1);
    if (k <= 0) return;
    const dy = (1 - K.ease.out(k)) * 20;
    K.layer((o.alpha ?? 1) * k, () => {
      g.save(); g.translate(0, dy);
      K.card(x, y, w, h, { fill: C.tile });
      // noren awning: five panels, warm, with slits
      g.save(); K.rr(x, y, w, h, 24); g.clip();
      const n = 5, pw = w / n;
      for (let j = 0; j < n; j++) {
        g.fillStyle = j % 2 ? K.mixColor(C.tile, C.head, 0.34) : K.mixColor(C.tile, C.accent, 0.46);
        K.rr(x + j * pw + 2, y - 8, pw - 4, 58, [0, 0, 10, 10]); g.fill();
      }
      g.restore();
      K.line(x + 10, y + 54, x + w - 10, y + 54, { color: C.line2, w: 2 });
      if (o.title) K.eyebrow(o.title, x + w / 2, y + 92, { size: 20, align: 'center', tracking: 3 });
      // parcels: 4 x 2 slots
      const tt = Math.min(t, o.hold ?? Infinity), flow = o.flow ?? Infinity, every = o.every || 0.8;
      if (tt >= flow) {
        const rnd = K.rng(o.seed || 7), order = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
        const nmax = Math.floor((tt - flow) / every);
        for (let m = Math.max(0, nmax - 8); m <= nmax; m++) {
          const slot = order[m % 8], ta = flow + m * every, land = K.io(tt, ta, 0.5, 'out'), gone = K.io(tt, flow + (m + 8) * every, 0.35);
          if (land <= 0 || gone >= 1) continue;
          const cx = x + 52 + (slot % 4) * ((w - 104) / 3), cy = y + 150 + Math.floor(slot / 4) * 84;
          parcel(cx, cy - (1 - land) * 60, 48, { tint: m % 3, alpha: Math.min(1, land * 1.5) * (1 - gone) });
        }
      }
      g.restore();
    });
  }
  /**
   * a version number with its parts called out (07): mono pill "2.4.1" centred at (x, y).
   * o: {parts ['2','4','1'], size 40, hl (i)=>0..1 (gold glow under a part), labels [{text, color}], labelsK (i)=>0..1, alpha, ring 0..1 (gold ring: pinned)}
   * returns [{x}] centres of the parts (for your own labels)
   */
  function versionPill(x, y, o = {}) {
    const parts = o.parts || ['2', '4', '1'], size = o.size || 40, mono = { font: 'mono', weight: 600, size };
    const str = parts.join('.'), tw = K.measure(str, mono), dw = K.measure('.', mono), w = tw + size * 1.6, h = size * 1.9;
    const hl = per(o.hl, 0), lk = per(o.labelsK, 1), centres = [];
    let cx = x - tw / 2;
    parts.forEach((p, i) => { const pw = K.measure(p, mono); centres.push({ x: cx + pw / 2, w: pw }); cx += pw + (i < parts.length - 1 ? dw : 0); });
    K.layer(o.alpha ?? 1, () => {
      K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: C.line2, shadow: false });
      centres.forEach((c, i) => { const k = clamp01(hl(i)); if (k > 0) K.glow(c.x, y, size * 1.2, C.head, 0.3 * k); });
      let px = x - tw / 2;
      parts.forEach((p, i) => {
        const k = clamp01(hl(i));
        px += K.text(p, px, y + size * 0.36, { ...mono, color: K.mixColor(C.strong, C.head, k) });
        if (i < parts.length - 1) px += K.text('.', px, y + size * 0.36, { ...mono, color: C.soft });
      });
      // labels fan out under the pill (the digits are too close for labels straight below), each on a leader line
      const n = (o.labels || []).length, spread = o.spread || 210;
      (o.labels || []).forEach((lb, i) => {
        const k = clamp01(lk(i)), c = centres[i]; if (k <= 0 || !c || !lb) return;
        const lx = x + (i - (n - 1) / 2) * spread, y0 = y + h / 2 + 6, y1 = y + h / 2 + 40;
        const g = G(); g.save(); g.globalAlpha *= k; g.strokeStyle = K.mixColor(C.line2, lb.color || C.soft, 0.4); g.lineWidth = 2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(c.x, y0); g.bezierCurveTo(c.x, y0 + 20, lx, y1 - 18, lx, y1); g.stroke(); g.restore();
        K.text(lb.text, lx, y1 + 32, { font: 'ui', weight: 600, size: 26, color: lb.color || C.soft, align: 'center', alpha: k });
      });
      if (o.ring) K.ring(x, y, w / 2 + 18, h / 2 + 14, clamp01(o.ring), { color: C.head, w: 3, rot: 0 });
    });
    return centres;
  }

  // ---------------------------------------------------------------- the metal shelf (11)
  /**
   * one lock core on 11's shelf: card centred at (x, y), 260 x 150, mono 30 name, mono 22 year eyebrow above it.
   * o: {name, eyebrow ('BROKEN · 2004'), k 0..1 reveal (rise + fade), broken 0..1 (dims, eyebrow -> quiet, dashed diagonal),
   *     lit 0..1 (gold edge glow: the new metal), w 260, h 150, alpha}; fn(rect) draws extra content (TLS chips, files).
   * returns {x0, y0, w, h, cx, cy}
   */
  function metal(x, y, o = {}, fn) {
    const w = o.w || 260, h = o.h || 150, k = clamp01(o.k ?? 1), br = clamp01(o.broken), lit = clamp01(o.lit);
    if (k <= 0) return null;
    const dy = (1 - K.ease.out(k)) * 18, x0 = x - w / 2, y0 = y - h / 2 + dy;
    const top = o.name ? y0 + 100 : y0 + 60;   // content area under the eyebrow (and the name, when there is one)
    const rect = { x0, y0, w, h, cx: x, cy: y + dy, content: { x: x0 + 16, y: top, w: w - 32, h: y0 + h - 12 - top, cx: x, cy: (top + y0 + h - 12) / 2 } };
    K.layer((o.alpha ?? 1) * k, () => {
      K.layer(lerp(1, 0.45, br), () => {
        if (lit > 0) K.glow(x, y + dy, w * 0.7, C.head, 0.16 * lit);
        K.card(x0, y0, w, h, { r: 20, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.7 * lit), glow: 0.8 * lit, lw: 1.5 + lit });
        if (o.eyebrow) K.text(o.eyebrow, x, y0 + 42, { font: 'mono', weight: 600, size: 22, color: K.mixColor(lit > 0 ? C.head : C.gold, C.quiet, br), align: 'center', tracking: 2 });
        if (o.name) K.text(o.name, x, y0 + (fn ? 84 : 100), { font: 'mono', weight: 600, size: 30, color: K.mixColor(C.strong, C.quiet, br), align: 'center' });
        if (fn) fn(rect);
      });
      if (br > 0) strike(x0 + 10, y0 + 10, x0 + w - 10, y0 + h - 10, br);
    });
    return rect;
  }

  // ---------------------------------------------------------------- surprise cards (12)
  /**
   * one surprise card centred at (x, y), 500 x 230: a 20 px eyebrow top-left with a dot in the part's colour
   * (part 'paint' -> cream, 'lock' -> terracotta), then fn(rect) draws the literal form.
   * o: {eyebrow, part, k 0..1 reveal, lit 0..1, w, h, alpha}. returns the content rect {x, y, w, h} (below the eyebrow)
   */
  function surprise(x, y, o = {}, fn) {
    const g = G(), w = o.w || 500, h = o.h || 230, k = clamp01(o.k ?? 1), lit = clamp01(o.lit);
    if (k <= 0) return null;
    const dy = (1 - K.ease.out(k)) * 18, x0 = x - w / 2, y0 = y - h / 2 + dy;
    const col = o.part === 'lock' ? C.accent : C.strong;
    const rect = { x: x0 + 28, y: y0 + 64, w: w - 56, h: h - 84 };
    K.layer((o.alpha ?? 1) * k, () => {
      K.card(x0, y0, w, h, { fill: C.tile, stroke: K.mixColor(C.line2, col, 0.45 * lit), glow: 0 });
      g.save(); g.fillStyle = col; g.beginPath(); g.arc(x0 + 34, y0 + 36, 6, 0, 7); g.fill(); g.restore();
      if (o.eyebrow) K.eyebrow(o.eyebrow, x0 + 50, y0 + 43, { size: 20, tracking: 3 });
      if (fn) fn(rect);
    });
    return rect;
  }

  // ---------------------------------------------------------------- the scene sentence
  /** the scene's one sentence ('read' 32, cream, centred), rising 14 px with progress k. o: {size, color, x 960, alpha} */
  function say(text, y, k, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    K.text(text, o.x ?? 960, y + 14 * (1 - K.ease.out(k)), { font: 'read', size: o.size || 32, color: o.color || C.strong, align: o.align || 'center', alpha: k * (o.alpha ?? 1) });
  }

  window.M = {
    palette, type, motion, layout, PRESETS, BUILDINGS, LANTERNS, YEARS, STOPS, ROAD, Y0, Y1,
    geom, lerpGeom, X, yearAt, byKey, words, itemPos, itemRect, lanternAt, lanternTagRect,
    tag, tagSize, street, lanterns, lantern, lanternX, bracket, light, marker, bump, stamp,
    road, stopRect, brain,
    // v1 houses + the building and its recurring pieces (extended rebuild)
    HOUSE, houses, BLD, LAYOUTS, PART, SPEEDS, LOCK_ICONS, LOCKS, LOCKLINE,
    lerpLayout, toScreen, inBuilding, at, building, roofPath, drawRoof, stringY,
    paint, lockIcon, speedLabel, strike, lockTile, phone, gatehouse, parcel, stall, versionPill, metal, surprise, say,
  };
})();
