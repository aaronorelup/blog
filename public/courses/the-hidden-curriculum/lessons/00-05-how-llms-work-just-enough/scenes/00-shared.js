/* 00.05 How LLMs work (just enough) — shared drawing (window.M)
   The lesson's one recurring object is "the tile desk":
     the ENGINE (from 00.04, the model): the same gold-lined block with two truly meshing gears, now with a LID that
       hinges up and, inside, a glimpse of tiles instead of gears (01, 02);
     the DESK (the context window): a low tea-house table seen from the front: surface, front lip with a gold hairline,
       two short legs, a floor shadow; three faint grooves where tile rows sit;
     a TILE (a token): a mono word piece on a small rounded tile; gold outline when it is the model's pick;
     the TRAY (the next-tile pick): candidates with likelihood bars that really follow a softmax of the temperature;
     the TEMPERATURE SLIDER, and a few repeated cards (chat window, usage meter, per-turn bars, error card).
   Every scene draws these through M.* and only moves, scales, dims or adds to them, so nothing is redrawn differently.
   Tile text never drops below 26 screen px: M.tile enlarges its own font when the desk is drawn scaled down.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);
  const TAU = Math.PI * 2;
  /** current uniform scale of the context (camera x K.at), so hairlines and type stay legible at any size */
  const scaleNow = () => { const m = G().getTransform(); return Math.hypot(m.a, m.b) || 1; };
  const px = (n) => n / scaleNow();
  const LW = (base, minPx = 1.5) => Math.max(base, px(minPx));

  // ---------------------------------------------------------------- palette, type, motion
  // One meaning per colour, the whole lesson long:
  //   cream text on indigo tiles (C.strong on C.tile)  = TOKENS sitting on the desk (what the model can see)
  //   gold (C.head / C.gold)  = the MODEL'S PICK: the chosen tile, likelihood bars, the sweep that scores, counted tokens
  //   terracotta (C.accent)   = WRONG or FULL: the hallucinated guess, errors, an overfull desk outline, rings on specimens
  //   soft / quiet            = GHOSTS: what is not there (no library, the empty slot, "stop"), dimmed history
  //   pink: only K.petals on 01 and 09.
  const palette = {
    token: C.strong, tileFill: C.tile, tileLine: C.line2,
    pick: C.head, pickLine: C.gold, wrong: C.accent, ghost: C.soft, quiet: C.quiet,
    deskFill: K.rgba(C.tile, 0.82), deskLine: C.line2, deskLip: '#1A1928', deskLeg: '#252334', back: C.code,
  };
  const type = {
    tile: { font: 'mono', weight: 600, size: 30 },    // a token on a tile (never under 26 on screen)
    label: { font: 'ui', weight: 600, size: 26 },     // pills, tray labels, axis labels
    read: { font: 'ui', weight: 600, size: 30 },      // meter rows, anything to be read
    chat: { font: 'read', weight: 400, size: 30 },    // chat replies (Georgia)
  };
  const motion = {
    move: 0.7,        // structural moves (desk shifting, tray rising)
    morph: 0.8,       // engine card -> desk (01 [[hood]])
    lid: 0.7,         // lid hinge (01, the scene's one 'back')
    land: 0.45,       // a tile flying into its slot (M.fly u over this)
    stagger: 0.1,     // tiles appearing in a row
    flip: 0.32,       // one tile flip to its number (03 [[ids]])
    sweep: 0.8,       // the scoring sweep (04 [[score]]; faster repeats 0.5)
    turn: 0.8,        // idle gear speed of the 00.04 engine (rad/s)
    bob: { speed: 1.4, amp: 2 },   // idle bob of a resting picked tile (keep tiny)
  };

  // ---------------------------------------------------------------- layout (checked against x 80–1840, y 130–930)
  const DESK = { x: 260, y: 420, w: 1400, h: 340 };
  const layout = {
    desk: DESK,                                    // standard (01 end, 03, 05, 08, 09): surface 260..1660 x 420..760, legs to 840
    narrow: { x: 120, y: 420, w: 1240, h: 340 },   // 04: room for the tray at x 1440..1820
    high: { x: 260, y: 230, w: 1400, h: 300 },     // 06: desk raised, space under it y ~600..900 (legs end ~ 600)
    small: { x: 540, y: 660, w: 840, h: 180 },     // 07: bottom band (surface 660..840, legs to ~882); use one row, tile size 26
    rowsX: [300, 1620],                            // inner span for rows on the standard desk
    tray: { x: 1440, y: 200, w: 380, h: 520 },     // 04 candidates
    slider: { x0: 560, x1: 1360, y: 880 },         // 04 temperature
    engineTitle: { x: 960, y: 590, s: 1.4 },       // 01 engine under the title block (card 820..1100 x 492..688)
    engineMap: { s: 0.4 },                         // 02 tiny engine in a lantern's place
    eyebrowY: 170,
  };
  /** centre y of row r (0, 1, 2) on desk rect R: 23.5 %, 50 %, 76.5 % of its height (500 / 590 / 680 on the standard desk) */
  const rowY = (R, r) => R.y + R.h * (0.235 + 0.265 * r);
  /** inner left x of rows on rect R */
  const rowX0 = (R) => R.x + 40 * (R.h / 340);
  const lerpRect = (a, b, k) => ({ x: K.lerp(a.x, b.x, k), y: K.lerp(a.y, b.y, k), w: K.lerp(a.w, b.w, k), h: K.lerp(a.h, b.h, k) });

  // ---------------------------------------------------------------- tiles (tokens)
  /** font px a tile actually uses: at least 26 screen px whatever the transform */
  const tileSize = (size) => Math.max(size || 30, 26 / scaleNow());
  /** width of a tile showing s at size (default 30) in the current transform */
  function tileW(s, size) {
    const sz = tileSize(size);
    return K.measure(String(s).trim(), { ...type.tile, size: sz }) + sz * 1.2;
  }
  /**
   * M.tile(s, x, y, o) — one token, centred at (x, y). Returns its width.
   * o.size  font px (default 30; 26 for the small desk); tile height = 2.27 * size (68 at 30)
   * o.tone  'plain' (cream on indigo, default) | 'hot' (the pick: gold outline + glow) | 'wrong' (terracotta outline)
   *         | 'soft' (dimmed, soft text: "stop", old history) | 'ghost' (dashed outline, soft text: hidden / missing)
   * o.glow  0..1 extra gold glow (default 0.35 for 'hot')
   * o.flip  0..1 flips the tile about its horizontal axis (0 front, 1 back); o.id: the back face (mono gold number)
   * o.pin   0..1 small gold pin at the tile's top-left (the pinned instructions in 05)
   * o.ring  0..1 a terracotta circle draws around it (specimens in 06)
   * o.rot   tilt in rad; o.alpha; o.w fixed width (e.g. an empty dashed slot: M.tile('', x, y, {tone:'ghost', w:220}))
   * o.color text colour override
   */
  function tile(s, x, y, o = {}) {
    const a = pick(o.alpha, 1);
    const str = String(s).trim(), sz = tileSize(o.size);
    const f = { ...type.tile, size: sz };
    const w = o.w || K.measure(str, f) + sz * 1.2, h = sz * 2.27, r = sz * 0.4;
    if (a <= 0.002) return w;
    const tone = o.tone || 'plain', g = G();
    const flip = clamp01(o.flip), back = flip > 0.5, sy = Math.max(0.02, Math.abs(Math.cos(Math.PI * flip)));
    const stroke = { plain: C.line2, hot: C.gold, wrong: C.accent, soft: C.line, ghost: C.soft }[tone] || C.line2;
    const text = o.color || { plain: C.strong, hot: C.strong, wrong: C.strong, soft: C.soft, ghost: C.soft }[tone] || C.strong;
    const glow = pick(o.glow, tone === 'hot' ? 0.35 : 0);
    K.layer(a, () => K.at(x, y, 1, o.rot || 0, () => {
      g.save(); g.scale(1, sy);
      if (tone === 'ghost' && !back) {
        g.save(); g.strokeStyle = stroke; g.lineWidth = LW(2, 1.5); g.setLineDash([px(7), px(7)]);
        K.rr(-w / 2, -h / 2, w, h, r); g.fillStyle = K.rgba(C.tile, 0.35); g.fill(); g.stroke(); g.restore();
      } else {
        // thickness: a darker slab under the face, so a tile reads as a small solid piece (mahjong / scrabble), not an outline
        const th = sz * 0.17;
        g.save(); K.rr(-w / 2, -h / 2 + th, w, h, r); g.fillStyle = tone === 'hot' ? '#3A3020' : tone === 'wrong' ? '#3A2420' : '#15141E';
        g.globalAlpha *= tone === 'soft' ? 0.6 : 1; g.fill(); g.strokeStyle = back ? C.gold : stroke; g.globalAlpha *= 0.55; g.lineWidth = LW(1.5, 1); g.stroke(); g.restore();
        K.card(-w / 2, -h / 2, w, h, { r, fill: back ? palette.back : (tone === 'soft' ? '#1C1B26' : C.tile), stroke: back ? C.gold : stroke, glow, shadow: false, lw: LW(tone === 'hot' || tone === 'wrong' ? 2.5 : 1.8, 1.5) });
        // a hairline highlight along the top edge of the face
        K.line(-w / 2 + r, -h / 2 + 2.5, w / 2 - r, -h / 2 + 2.5, { color: C.strong, w: LW(1.5, 1), alpha: 0.12 });
      }
      if (back) K.text(String(o.id ?? ''), 0, sz * 0.35, { ...f, color: C.head, align: 'center' });
      else if (str) K.text(str, 0, sz * 0.35, { ...f, color: text, align: 'center' });
      g.restore();
      const pn = clamp01(o.pin);
      if (pn > 0) K.icon('pin', -w / 2 + 4, -h / 2 + 2, Math.max(30, px(30)), { color: C.head, alpha: pn });
      const rk = clamp01(o.ring);
      if (rk > 0) K.ring(0, 0, w / 2 + 22, h / 2 + 18, rk, { color: C.accent, w: LW(4, 2), rot: w > 300 ? -0.015 : -0.05 });
    }));
    return w;
  }
  /**
   * M.flow(strs, x0, o) — lay tiles left to right from x0 (left edge). Returns [{s, x (centre), w}] (no drawing).
   * o.gap (default 14), o.size; o.align 'left' | 'center' (then x0 is the row's centre).
   */
  function flow(strs, x0, o = {}) {
    const gap = pick(o.gap, 14), ws = strs.map((s) => tileW(s, o.size));
    const total = ws.reduce((p, q) => p + q, 0) + gap * Math.max(0, strs.length - 1);
    let x = o.align === 'center' ? x0 - total / 2 : x0;
    return strs.map((s, i) => { const r = { s, x: x + ws[i] / 2, w: ws[i] }; x += ws[i] + gap; return r; });
  }
  /**
   * M.row(t, strs, x0, y, o) — draw a row of tiles (uses M.flow). Returns the flow positions.
   * o.k: number | (i) => 0..1 per-tile appear (fade + 10 px rise); o.tone: string | (i) => tone; o.size, o.gap, o.align, o.alpha
   */
  function row(t, strs, x0, y, o = {}) {
    const P = flow(strs, x0, o);
    P.forEach((p, i) => {
      const k = clamp01(typeof o.k === 'function' ? o.k(i) : pick(o.k, 1)); if (k <= 0) return;
      tile(p.s, p.x, y + (1 - k) * 10, { size: o.size, tone: typeof o.tone === 'function' ? o.tone(i) : o.tone, alpha: k * pick(o.alpha, 1) });
    });
    return P;
  }
  /**
   * M.split(pieces, cx, y, k, o) — text being cut into tokens. pieces keep their real spacing (" short").
   * k 0: one plain mono line (no tile boxes), centred on cx;  k 1: separate tiles laid with M.flow (gap 14), centred on cx.
   * o.cut 0..1 — gold slice marks flash at each boundary (peak at 0.5; run it just before k);  o.size; o.alpha; o.tone (string | (i)=>tone)
   * Returns the final tile positions [{s, x, w}].
   */
  function split(pieces, cx, y, k, o = {}) {
    k = clamp01(k);
    const sz = tileSize(o.size), f = { ...type.tile, size: sz }, a = pick(o.alpha, 1);
    const full = pieces.join(''), x0 = cx - K.measure(full, f) / 2;
    const P = flow(pieces.map((s) => s.trim()), cx, { size: o.size, align: 'center', gap: pick(o.gap, 14) });
    let acc = 0;
    const starts = pieces.map((s) => { const lead = K.measure(s.match(/^\s*/)[0], f), w = K.measure(s.trim(), f); const c = x0 + acc + lead + w / 2; acc += K.measure(s, f); return c; });
    const ke = K.ease.io(k);
    K.layer(a, () => {
      pieces.forEach((s, i) => {
        const x = K.lerp(starts[i], P[i].x, ke);
        const tone = typeof o.tone === 'function' ? o.tone(i) : o.tone;
        if (ke > 0.01) K.layer(ke, () => tile('', x, y, { size: o.size, tone, w: P[i].w }));
        K.text(s.trim(), x, y + sz * 0.35, { ...f, align: 'center', color: tone === 'soft' || tone === 'ghost' ? C.soft : C.strong });
      });
      const ck = clamp01(o.cut); if (ck <= 0 || ck >= 1) return;
      const fl = Math.sin(Math.PI * ck);
      for (let i = 1; i < pieces.length; i++) {
        const bx = K.lerp((starts[i - 1] + starts[i]) / 2 + (K.measure(pieces[i - 1].trim(), f) - K.measure(pieces[i].trim(), f)) / 4, (P[i - 1].x + P[i - 1].w / 2 + P[i].x - P[i].w / 2) / 2, ke);
        K.glow(bx, y, 46, C.head, 0.35 * fl);
        K.line(bx, y - sz * 1.3, bx, y + sz * 1.3, { color: C.head, w: LW(3, 2), alpha: fl, k: clamp01(ck * 2.2) });
      }
    });
    return P;
  }
  /**
   * M.fly(s, x1, y1, x2, y2, u, o) — a tile travelling on an arc (the pick landing in its slot). u 0..1 (ease it yourself
   * or pass raw: it is eased 'io' inside). o.bend (px, default -140 = arcs upward), o.trail 0..1 faint gold arc behind it,
   * o.tone (default 'hot'), o.size. Returns {x, y}.
   */
  function fly(s, x1, y1, x2, y2, u, o = {}) {
    const e = K.ease.io(clamp01(u));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, bend = pick(o.bend, -140);
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    const P = (v) => [(1 - v) * (1 - v) * x1 + 2 * (1 - v) * v * cx + v * v * x2, (1 - v) * (1 - v) * y1 + 2 * (1 - v) * v * cy + v * v * y2];
    const [x, y] = P(e);
    const tr = clamp01(o.trail);
    if (tr > 0 && e > 0.02) {
      const g = G(); g.save(); g.strokeStyle = C.gold; g.lineWidth = LW(2, 1.5); g.setLineDash([px(6), px(8)]); g.globalAlpha *= 0.5 * tr;
      g.beginPath(); for (let i = 0; i <= 30; i++) { const [qx, qy] = P(e * i / 30); i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); } g.stroke(); g.restore();
    }
    tile(s, x, y, { tone: o.tone || 'hot', size: o.size, alpha: o.alpha, rot: Math.sin(Math.PI * e) * pick(o.spin, -0.06) });
    return { x, y };
  }
  /**
   * M.offEdge(x, y, edgeX, floorY, u) — where a tile is while it slides off the desk's left edge and drops (05, 08).
   * u 0..1: 0..0.45 slides left to just past edgeX, then falls to floorY, tilting and fading. Returns {x, y, rot, alpha}.
   */
  function offEdge(x, y, edgeX, floorY, u) {
    u = clamp01(u);
    const s1 = K.ease.io(clamp01(u / 0.45)), s2 = clamp01((u - 0.45) / 0.55);
    const xs = K.lerp(x, edgeX - 70, s1);
    return { x: xs - 50 * s2, y: y + (floorY - y) * s2 * s2, rot: -0.7 * s2, alpha: 1 - clamp01((s2 - 0.35) / 0.65) };
  }

  // ---------------------------------------------------------------- the desk (the context window)
  /**
   * M.desk(t, R, o) — the low table. R {x, y, w, h} is the SURFACE rect (default M.layout.desk). Proportions scale with R.h / 340.
   * o.legs  0..1 lip + legs + floor shadow (default 1; 0 while it is still the engine card in 01's morph)
   * o.heat  0..1 outline warms line2 -> terracotta (05 [[full]])
   * o.edge  0..1 a soft gold pass along the left edge (05 [[edge]], 07 [[forgot]]: drive it 0 -> 1 -> 0 once, no strobe)
   * o.grooves 0..1 the three faint row grooves (default 1); o.rows: how many grooves (default 3; 1 for the high desk)
   * o.lamp  0..1 warm gold glow on the surface (title / end cards)
   * o.r     corner radius override (01 morph: lerp from 24 * 1.4 card to the desk's own)
   * o.alpha, o.fill (default palette.deskFill)
   * Returns R with helpers: {..R, rowY(r), x0, x1, edge, front}.
   */
  function desk(t, R, o = {}) {
    R = R || DESK;
    const u = R.h / 340, a = pick(o.alpha, 1), g = G();
    const legs = clamp01(pick(o.legs, 1)), heat = clamp01(o.heat);
    const info = { ...R, rowY: (r) => rowY(R, r), x0: rowX0(R), x1: R.x + R.w - 40 * u, edge: R.x, front: R.y + R.h };
    if (a <= 0.002) return info;
    K.layer(a, () => {
      const lip = 22 * u, legH = 62 * u, bottom = R.y + R.h + lip;
      if (legs > 0) K.layer(legs, () => {
        // floor shadow
        g.save(); g.fillStyle = 'rgba(4,5,12,.5)'; g.beginPath(); g.ellipse(R.x + R.w / 2, bottom + legH + 6 * u, R.w * 0.5, 16 * u, 0, 0, TAU); g.fill(); g.restore();
        // legs: short, tea-house table (chabudai) legs, slightly tapered
        [R.x + 70 * u, R.x + R.w - 70 * u].forEach((lx) => {
          const tw = 24 * u, bw = 18 * u, top = bottom - 2, bot = top + legH * legs;
          g.save(); g.beginPath(); g.moveTo(lx - tw / 2, top); g.lineTo(lx + tw / 2, top); g.lineTo(lx + bw / 2, bot - 4 * u); g.quadraticCurveTo(lx + bw / 2, bot, lx + bw / 2 - 4 * u, bot); g.lineTo(lx - bw / 2 + 4 * u, bot); g.quadraticCurveTo(lx - bw / 2, bot, lx - bw / 2, bot - 4 * u); g.closePath();
          g.fillStyle = palette.deskLeg; g.fill(); g.strokeStyle = C.line2; g.lineWidth = LW(1.5, 1); g.stroke(); g.restore();
        });
        // front lip: the table's thickness, a gold hairline along its top
        g.save(); K.rr(R.x + 8 * u, R.y + R.h - 10 * u, R.w - 16 * u, lip + 10 * u, Math.min(14 * u, 12)); g.fillStyle = palette.deskLip; g.fill();
        g.strokeStyle = C.line2; g.lineWidth = LW(1.5, 1); g.stroke(); g.restore();
      });
      // surface
      if (o.lamp) K.glow(R.x + R.w / 2, R.y + R.h * 0.45, R.w * 0.55, C.head, 0.12 * clamp01(o.lamp));
      const stroke = heat > 0 ? K.mixColor(C.line2, C.accent, heat) : palette.deskLine;
      K.card(R.x, R.y, R.w, R.h, { r: pick(o.r, 24 * Math.max(0.6, u)), fill: o.fill || palette.deskFill, stroke, lw: LW(1.5 + heat * 1.5, 1.5), shadow: true });
      // top highlight + gold front hairline (the "front edge")
      K.line(R.x + 30 * u, R.y + 2.5, R.x + R.w - 30 * u, R.y + 2.5, { color: C.strong, w: LW(1.5, 1), alpha: 0.07 });
      K.line(R.x + 24 * u, R.y + R.h, R.x + R.w - 24 * u, R.y + R.h, { color: C.gold, w: LW(2, 1.2), alpha: 0.4 * Math.max(legs, 0.3) });
      // grooves where rows sit
      const gr = clamp01(pick(o.grooves, 1)) * (1 - 0.6 * heat), nrows = pick(o.rows, 3);
      if (gr > 0) for (let i = 0; i < nrows; i++) {
        const yy = (nrows === 1 ? rowY(R, 1) : rowY(R, i)) + 38 * u;
        K.line(info.x0, yy, info.x1, yy, { color: C.line2, w: LW(1.5, 1), alpha: 0.35 * gr, dash: [px(2), px(10)] });
      }
      const ed = clamp01(o.edge);
      if (ed > 0) {
        K.glow(R.x, R.y + R.h / 2, R.h * 0.75, C.head, 0.32 * ed);
        K.line(R.x, R.y + 18 * u, R.x, R.y + R.h - 18 * u, { color: C.head, w: LW(4, 2), alpha: ed });
      }
    });
    return info;
  }

  // ---------------------------------------------------------------- the engine (00.04's model, now with a lid)
  // Same meshing gears as 00.04 (12 and 8 teeth, phase-locked). Local frame: card -100..100 x -70..70, ports at x ±100.
  const GEAR = { big: { x: -24, y: 8, rp: 37.5, n: 12 }, small: { rp: 25, n: 8 }, theta: -0.42, add: 5 };
  GEAR.small.x = GEAR.big.x + Math.cos(GEAR.theta) * (GEAR.big.rp + GEAR.small.rp);
  GEAR.small.y = GEAR.big.y + Math.sin(GEAR.theta) * (GEAR.big.rp + GEAR.small.rp);
  const RATIO = GEAR.big.n / GEAR.small.n;
  const PHI = (1 + RATIO) * GEAR.theta + Math.PI - (TAU / GEAR.small.n) / 2;
  function gearPath(cx, cy, rp, n, ang) {
    const g = G(), p = TAU / n, ro = rp + GEAR.add, ri = rp - GEAR.add;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const c = ang + i * p;
      [[ri, c - 0.5 * p], [ri, c - 0.3 * p], [ro, c - 0.15 * p], [ro, c + 0.15 * p], [ri, c + 0.3 * p], [ri, c + 0.5 * p]]
        .forEach(([r, q], j) => { const X = cx + Math.cos(q) * r, Y = cy + Math.sin(q) * r; (i === 0 && j === 0) ? g.moveTo(X, Y) : g.lineTo(X, Y); });
    }
    g.closePath();
  }
  function drawGear(cx, cy, rp, n, ang, color, lw, big) {
    const g = G();
    g.save(); gearPath(cx, cy, rp, n, ang); g.fillStyle = C.tile; g.fill();
    g.strokeStyle = color; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.arc(cx, cy, rp * 0.26, 0, TAU); g.stroke();
    g.globalAlpha *= 0.55;
    if (big) {
      g.beginPath(); g.arc(cx, cy, rp * 0.62, 0, TAU); g.stroke();
      for (let i = 0; i < 4; i++) { const q = ang + i * TAU / 4 + 0.4; g.beginPath(); g.moveTo(cx + Math.cos(q) * rp * 0.26, cy + Math.sin(q) * rp * 0.26); g.lineTo(cx + Math.cos(q) * rp * 0.62, cy + Math.sin(q) * rp * 0.62); g.stroke(); }
    } else { g.beginPath(); g.moveTo(cx + Math.cos(ang) * rp * 0.26, cy + Math.sin(ang) * rp * 0.26); g.lineTo(cx + Math.cos(ang) * rp * 0.6, cy + Math.sin(ang) * rp * 0.6); g.stroke(); }
    g.restore();
  }
  /**
   * M.engine(t, x, y, s, o) — 00.04's engine. s 1.4 under the 01 title, 0.4 in a lantern's place (02).
   * o.lid    0..1 the lid (top 28 px strip) hinges up about its left corner (~70° at 1; ease with 'back' in 01 only)
   * o.gears  0..1 gear opacity (default 1; fade to 0 as the inside shows)
   * o.inside 0..1 tiles visible inside the open engine (three little rows of cream tiles; "a desk covered in tiles")
   * o.lit    0..1 gold outline + glow (default 1); o.glow extra 0..1; o.turn big-gear angle (default 0.8 * t)
   * o.label  pill under it (fixed 26 px); o.labelK; o.alpha; o.shadow
   */
  function engine(t, x, y, s, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0.002) return;
    const lit = clamp01(pick(o.lit, 1)), turn = pick(o.turn, motion.turn * t), lid = clamp01(o.lid);
    const ge = clamp01(pick(o.gears, 1)), ins = clamp01(o.inside);
    const line = K.mixColor(C.line2, C.gold, lit), gearCol = K.mixColor(C.soft, C.head, lit);
    K.layer(a, () => K.at(x, y, s, 0, () => {
      const g = G();
      if (lit > 0 || o.glow) K.glow(0, 0, 170, C.head, 0.16 * lit + 0.3 * clamp01(o.glow));
      K.card(-100, -70, 200, 140, { r: 24, fill: C.tile, stroke: line, glow: 0.25 * lit + 0.75 * clamp01(o.glow), shadow: o.shadow, lw: LW(2, 1.5) });
      g.save(); g.strokeStyle = line; g.lineWidth = LW(2, 1.5); g.fillStyle = C.page;
      [-1, 1].forEach((sd) => { K.rr(sd * 100 - 6, -18, 12, 36, 5); g.fill(); g.stroke(); }); g.restore();
      // inside: a tiny desk of tiles (drawn under the gears; revealed as the gears fade)
      if (ins > 0) K.layer(ins, () => {
        g.save(); K.rr(-90, -40, 180, 102, 14); g.fillStyle = K.rgba(C.code, 0.9); g.fill(); g.clip();
        const r = K.rng(55);
        g.lineWidth = LW(1.6, 1);
        for (let rw = 0; rw < 3; rw++) {
          const ws = []; let tot = 0;
          while (true) { const w = 20 + r() * 30; if (tot + w > 160) break; ws.push(w); tot += w + 6; }
          let xx = -80;
          ws.forEach((w, i) => {
            const hot = rw === 2 && i === ws.length - 1;   // the newest tile, gold: the one it just laid
            K.rr(xx, -30 + rw * 30 + 3, w, 19, 5); g.fillStyle = hot ? '#3A3020' : '#15141E'; g.fill();
            K.rr(xx, -30 + rw * 30, w, 19, 5); g.fillStyle = C.tile; g.fill(); g.strokeStyle = hot ? C.head : K.rgba(C.strong, 0.6); g.stroke();
            K.line(xx + 6, -30 + rw * 30 + 9.5, xx + w - 6, -30 + rw * 30 + 9.5, { color: hot ? C.head : C.body, w: LW(2.4, 1), alpha: 0.7 });
            xx += w + 6;
          });
        }
        g.restore();
      });
      if (ge > 0) K.layer(ge, () => {
        const glw = LW(2.4, 1.5);
        drawGear(GEAR.big.x, GEAR.big.y, GEAR.big.rp, GEAR.big.n, turn, gearCol, glw, true);
        drawGear(GEAR.small.x, GEAR.small.y, GEAR.small.rp, GEAR.small.n, -RATIO * turn + PHI, gearCol, glw, false);
      });
      // the lid: closed it is the card's top strip (a quiet seam); open it swings up about the top-left corner
      g.save(); g.translate(-100, -42); g.rotate(-1.2 * lid);
      K.rr(0, -28, 200, 28, [24, 24, 6, 6]); g.fillStyle = lid > 0 ? '#2A2838' : C.tile; g.fill();
      g.strokeStyle = line; g.lineWidth = LW(2, 1.5); g.stroke();
      K.line(84, -14, 116, -14, { color: line, w: LW(4, 2), alpha: 0.8 });   // handle
      g.restore();
      if (lid < 0.05) K.line(-96, -42, 96, -42, { color: line, w: LW(1.2, 1), alpha: 0.35 });
    }));
    if (o.label) K.pill(o.label, x, y + 106 * s, { size: 26, stroke: C.gold, color: C.head, alpha: a * pick(o.labelK, 1) });
  }
  /** the engine card's rect in world space for an engine at (x, y, s): feed it to M.lerpRect for the 01 morph */
  const engineRect = (x, y, s) => ({ x: x - 100 * s, y: y - 70 * s, w: 200 * s, h: 140 * s });

  // ---------------------------------------------------------------- the tray (the next-tile pick) and temperature
  /** softmax of scores at temperature temp (0..1 -> T 0.25 .. 2.0, mid ~0.7). Pure; returns probabilities. */
  function probs(scores, temp) {
    const T = 0.25 * Math.pow(8, clamp01(temp));
    const m = Math.max(...scores), e = scores.map((v) => Math.exp((v - m) / T)), s = e.reduce((p, q) => p + q, 0);
    return e.map((v) => v / s);
  }
  const SCORES = [2.2, 1.4, 1.2, 0.8, 0.5];
  /**
   * M.tray(t, cands, o) — the candidates card. cands: strings, likeliest first (bars follow M.probs, so keep that order).
   * o.rect  default M.layout.tray (1440..1820 x 200..720); o.k 0..1 card rises in; o.fill: number | (i) => 0..1 per-candidate appear
   * o.temp  0..1 temperature (default 0.5): reshapes the bars; low dims the unlikely tiles, high brightens them
   * o.scores (default M.SCORES);  o.pick index of the chosen tile (gold 'hot');  o.lift 0..1 that tile has left (hide it: draw M.fly)
   * o.eyebrow (default 'NEXT TILE?');  o.alpha
   * Returns [{s, x, y, p}] tile centres (x is the tile centre at its left-aligned spot) for flights out.
   */
  function tray(t, cands, o = {}) {
    const R = o.rect || layout.tray, k = clamp01(pick(o.k, 1)), a = pick(o.alpha, 1) * k;
    const sc = o.scores || SCORES.slice(0, cands.length), p = probs(sc, pick(o.temp, 0.5));
    const top = R.y + 122, step = Math.min(80, (R.h - 160) / Math.max(1, cands.length - 0.5));
    const out = cands.map((s, i) => ({ s, x: R.x + 40 + tileW(s, 26) / 2, y: top + i * step - 6, p: p[i] }));
    if (a <= 0.002) return out;
    K.layer(a, () => K.at(0, (1 - k) * 30, () => {
      K.card(R.x, R.y, R.w, R.h, { r: 24 });
      K.eyebrow(o.eyebrow || 'NEXT TILE?', R.x + 40, R.y + 52, { size: 20 });
      out.forEach((c, i) => {
        const fk = clamp01(typeof o.fill === 'function' ? o.fill(i) : pick(o.fill, 1)); if (fk <= 0) return;
        const picked = o.pick === i, gone = picked ? clamp01(o.lift) : 0;
        const vis = 0.3 + 0.7 * clamp01(c.p * 4);           // unlikely tiles dim at low temperature
        const bw = (R.w - 80) * Math.max(0.03, Math.min(1, c.p * 1.5));
        K.layer(fk, () => {
          if (gone < 1) tile(c.s, c.x, c.y, { tone: picked ? 'hot' : 'plain', alpha: (picked ? 1 : vis) * (1 - gone), size: 26 });
          K.line(R.x + 40, c.y + 44, R.x + 40 + bw * fk, c.y + 44, { color: C.gold, w: 10, alpha: picked ? 1 : 0.4 + 0.6 * vis });
        });
      });
    }));
    return out;
  }
  /**
   * M.slider(t, k, o) — the temperature dial. k 0..1 knob position (0 low, 0.5 mid, 1 high).
   * o.x0, o.x1, o.y (default M.layout.slider: 560..1360 at 880); o.draw 0..1 the track draws; o.knob 0..1 the knob appears
   * (pop it with 'back' in 04 only); o.labels 0..1 'low' / 'high' at the track's ends (outside it); o.alpha.
   * The knob is the pill 'temperature' (26 px); its centre runs x0 + 110 .. x1 - 110. Returns {x, y} of the knob.
   */
  function slider(t, k, o = {}) {
    const L = { ...layout.slider, ...o }, a = pick(o.alpha, 1);
    const x = K.lerp(L.x0 + 110, L.x1 - 110, clamp01(k));
    K.layer(a, () => {
      const d = clamp01(pick(o.draw, 1));
      K.line(L.x0, L.y, L.x1, L.y, { color: C.line2, w: 6, k: d });
      // the track warms from left to right: a gold fill up to the knob
      K.line(L.x0, L.y, x, L.y, { color: C.gold, w: 6, alpha: 0.6 * clamp01(o.knob) * d });
      const lb = clamp01(pick(o.labels, 1));
      if (lb > 0) {
        K.text('low', L.x0 - 26, L.y + 9, { ...type.label, color: C.soft, align: 'right', alpha: lb });
        K.text('high', L.x1 + 26, L.y + 9, { ...type.label, color: C.soft, align: 'left', alpha: lb });
      }
      const kn = clamp01(o.knob);
      if (kn > 0) K.at(x, L.y, 0.6 + 0.4 * kn, 0, () => K.pill('temperature', 0, 0, { size: 26, stroke: C.gold, color: C.head, alpha: Math.min(1, kn * 1.5) }));
    });
    return { x, y: L.y };
  }
  /** a gold scoring pass over a band (04 [[score]]): u 0..1 moves the glow from x0 to x1 at row y; fades in and out at the ends */
  function sweep(x0, x1, y, u, o = {}) {
    u = clamp01(u); if (u <= 0 || u >= 1) return;
    const x = K.lerp(x0, x1, K.ease.sine(u)), f = Math.sin(Math.PI * u);
    K.glow(x, y, pick(o.r, 170), C.head, 0.34 * f * pick(o.alpha, 1));
  }

  // ---------------------------------------------------------------- recurring cards
  /**
   * M.chat(t, x, y, w, h, msgs, o) — chat window (K.win browser, title 'chat' 26 px) with bubbles.
   * msgs: [{s, who: 'you' | 'ai', k (0..1 appear), stream (local time words start landing), step (s per word, default 0.25)}]
   * A streaming ai bubble shows a blinking caret until the last word lands. o: {title, size (default 30), alpha, focus, stroke}
   * Returns the content rect.
   */
  function chat(t, x, y, w, h, msgs, o = {}) {
    const size = o.size || 30, f = { ...type.chat, size };
    const cr = K.win(x, y, w, h, { title: o.title ?? 'chat', titleSize: 26, kind: 'browser', alpha: o.alpha, focus: o.focus, stroke: o.stroke });
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      g.save(); K.rr(cr.x, cr.y, cr.w, cr.h, 0); g.clip();
      let yy = cr.y + 16;
      (msgs || []).forEach((m) => {
        const k = clamp01(pick(m.k, 1)); if (k <= 0) return;
        const words = m.s.split(' ');
        const n = m.stream != null ? K.clamp(Math.floor((t - m.stream) / (m.step || 0.25)) + 1, 0, words.length) : words.length;
        const lines = K.wrap(m.s, w - 110, f), shown = K.wrap(words.slice(0, n).join(' '), w - 110, f);
        const bw = Math.max(...lines.map((ln) => K.measure(ln, f))) + 40, bh = lines.length * size * 1.3 + 24;
        const you = m.who === 'you', bx = you ? cr.x + cr.w - 18 - bw : cr.x + 18;
        K.layer(k, () => {
          g.save(); g.translate(0, (1 - k) * 10);
          K.card(bx, yy, bw, bh, { r: 18, shadow: false, fill: you ? K.rgba(C.head, 0.14) : C.tile, stroke: you ? K.rgba(C.head, 0.55) : (m.stroke || C.line2), lw: 1.5 });
          let lx = 0;
          shown.forEach((ln, i) => { lx = K.text(ln, bx + 20, yy + 12 + size * 0.95 + i * size * 1.3, { ...f, color: you ? C.strong : C.body }); });
          const streaming = m.stream != null && n < words.length;
          if (streaming && n > 0 && K.caretOn(t)) { const li = shown.length - 1; g.fillStyle = C.head; g.fillRect(bx + 24 + lx, yy + 12 + size * 0.2 + li * size * 1.3, size * 0.12, size * 0.95); }
          g.restore();
        });
        yy += bh + 12;
      });
      g.restore();
    });
    return cr;
  }
  /**
   * M.meter(x, y, w, eyebrow, rows, o) — card with horizontal gold bars (03 "MEASURED IN TOKENS", 07 "USAGE").
   * rows: [{label, v (0..1 final length), k (0..1 growth)}]; label 'ui' 30 left, bar to its right.
   * o.labelW (default 190), o.alpha, o.k card appear. Returns {h, bars: [{x0, x1, y}]} (x1 = current bar end).
   */
  function meter(x, y, w, eyebrow, rows, o = {}) {
    const h = 74 + rows.length * 56 + 18, lw = pick(o.labelW, 190), a = pick(o.alpha, 1) * clamp01(pick(o.k, 1));
    const bars = rows.map((r, i) => { const yy = y + 74 + 18 + i * 56, x0 = x + 36 + lw, max = w - 72 - lw; return { x0, x1: x0 + max * clamp01(pick(r.v, 1)) * clamp01(pick(r.k, 1)), y: yy }; });
    if (a <= 0.002) return { h, bars };
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 24 });
      K.eyebrow(eyebrow, x + 36, y + 50, { size: 20 });
      rows.forEach((r, i) => {
        const b = bars[i], rk = clamp01(pick(r.k, 1));
        K.text(r.label, x + 36, b.y + 10, { ...type.read, color: C.strong, alpha: pick(r.alpha, Math.max(0.35, Math.min(1, rk * 3))) });
        K.line(b.x0, b.y, b.x0 + (w - 72 - lw), b.y, { color: C.line, w: 10 });
        K.line(b.x0, b.y, b.x1, b.y, { color: C.gold, w: 10, k: rk > 0 ? 1 : 0 });
      });
    });
    return { h, bars };
  }
  /**
   * M.turns(x, y, w, h, eyebrow, bars, o) — card with vertical gold bars growing turn by turn (05 "TOKENS SENT").
   * bars: [{label, v (0..1 of max height), k (0..1 growth)}]; labels 'ui' 26 under each bar. o.alpha. Returns bar tops [{x, y}].
   */
  function turns(x, y, w, h, eyebrow, bars, o = {}) {
    const a = pick(o.alpha, 1), base = y + h - 46, maxH = h - 120, n = bars.length, colW = (w - 72) / n;
    const tops = bars.map((b, i) => ({ x: x + 36 + colW * (i + 0.5), y: base - maxH * clamp01(pick(b.v, 1)) * clamp01(pick(b.k, 1)) }));
    if (a <= 0.002) return tops;
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 24 });
      K.eyebrow(eyebrow, x + 36, y + 46, { size: 20 });
      K.line(x + 36, base, x + w - 36, base, { color: C.line2, w: 2 });
      bars.forEach((b, i) => {
        const bk = clamp01(pick(b.k, 1)), cx = tops[i].x, bw = Math.min(46, colW * 0.42);
        if (bk > 0) { const g = G(); g.save(); g.fillStyle = K.rgba(C.gold, 0.85); K.rr(cx - bw / 2, tops[i].y, bw, base - tops[i].y, [8, 8, 0, 0]); g.fill(); g.restore(); }
        K.text(b.label, cx, base + 34, { ...type.label, size: 26, color: C.body, align: 'center', alpha: Math.max(0.35, Math.min(1, bk * 3)) });
      });
    });
    return tops;
  }
  /**
   * M.alert(x, y, w, text, o) — error card: terracotta warning icon + mono line (07 "context window exceeded", 08 the pasted error).
   * o.size mono px (default 30; 28 for long errors), o.k 0..1 appear (rise 12 px), o.alpha, o.calm true = soft line2 outline
   * (an error you hand over as a fact, 08) instead of terracotta. Height 100. Returns {w, h}.
   */
  function alert(x, y, w, text, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = pick(o.alpha, 1) * k, size = o.size || 30, h = 100;
    if (a <= 0.002) return { w, h };
    K.layer(a, () => K.at(0, (1 - k) * 12, () => {
      K.card(x, y, w, h, { r: 18, fill: C.code, stroke: o.calm ? C.line2 : K.rgba(C.accent, 0.8), lw: 2 });
      K.icon('warning', x + 52, y + h / 2, 40, { color: C.accent, w: 3 });
      const g = G(); g.save(); K.rr(x + 90, y, w - 110, h, 0); g.clip();
      K.text(text, x + 92, y + h / 2 + size * 0.35, { font: 'mono', size, weight: 600, color: C.strong });
      g.restore();
    }));
    return { w, h };
  }
  /** eyebrow centred at the lesson's standard spot (960, 170) or (x, y). o: K.eyebrow opts + alpha. */
  const eyebrow = (s, o = {}) => K.eyebrow(s, pick(o.x, 960), pick(o.y, layout.eyebrowY), { size: 20, align: 'center', ...o });

  window.M = {
    palette, type, motion, layout, DESK, SCORES, GEAR,
    rowY, rowX0, lerpRect,
    tile, tileW, tileSize, flow, row, split, fly, offEdge,
    desk, engine, engineRect,
    probs, tray, slider, sweep,
    chat, meter, turns, alert, eyebrow,
  };
})();
