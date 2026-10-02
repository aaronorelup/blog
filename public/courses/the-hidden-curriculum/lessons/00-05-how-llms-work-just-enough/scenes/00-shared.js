/* 00.05 How AI models work today: shared drawing (window.M)
   The lesson's one recurring object is "the desk under the lantern":
     the LANTERN (the course's AI lantern, K.map.lantern 0) hangs on a cord and pours a pool of light onto
     the DESK (the context window: a night-wood writing desk, drawn as a slightly foreshortened top with a front lip and
       two legs; three sizes, 2021 / standard / hall, eased between, never jumped), behind which stands
     the CLERK (the model: the sparkle tile), who only knows what lies on the desk. Along the desk's near edge runs
     the TOKEN RULER (tile squares + a mono counter). Around the desk: PAPERS and FILES that land on it, the API
     letter-slot DOOR (left), the STUDIO (right) whose square canvas WELL turns static into a picture (diffusion),
     dashed PHONE LINES (hand-offs), plus the lesson's repeated furniture: dials (08), cache layers + timer (11),
     meters (12), rooms (13, 16), myth cards and the guest lower-third (18-19), shelf chips, dated tags, badges.
   Every scene draws these through M.* and only moves, scales, dims or adds to them.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const TAU = Math.PI * 2;
  const pick = (v, d) => (v == null ? d : v);
  const c01 = (v) => K.clamp(+v || 0);
  const hex2 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgbStr = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const mixHex = (h1, h2, k) => { const a = hex2(h1), b = hex2(h2); return '#' + [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k).toString(16).padStart(2, '0')).join(''); };
  const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  // ---------------------------------------------------------------- palette, type, motion
  // One meaning per colour, the whole lesson long:
  //   gold (C.head)          = the MODEL and its light: lantern, clerk tile, pool of light, filled token squares, "warm" cache
  //   night wood             = the DESK (context window); cream paper = what is ON the desk (text, files, notes)
  //   terracotta (C.accent)  = HAND-OFFS and the outside: API door, studio, phone lines, connectors, warnings
  //   blue-grey (cold)       = an expired / cold cache, dimmed or "gone" things
  //   guest (18-19)          = brighter gold (M.tone(1)): accents switch from terracotta to C.head, lamp glow x1.4
  //   pink                   = only K.petals on 01 and 20.
  const palette = {
    model: C.head, lamp: C.head, warm: C.head, cold: '#8FA8D8', coldLine: C.line2,
    wood: '#5B3A26', woodDark: '#3F2918', beam: '#4E3120', woodHi: '#7A5236',
    paper: C.paper, paperShade: C.paperShade, ink: C.ink, inkLine: '#B9AD98',
    note: '#F6DFA8', handoff: C.accent, line: C.line2, quiet: C.quiet, label: C.strong,
    ext: { png: '#8FA8D8', jpg: '#8FA8D8', pdf: C.accent, mp3: C.gold, wav: C.gold, mp4: C.soft, md: C.body, txt: C.soft, py: C.head, json: C.gold },
    // night scene palette (brand book 1.1), used by the diffusion picture
    night: { skyTop: '#0B1030', skyLow: '#2A3157', hillBack: '#33405E', hillNear: '#243043', wall: '#424A66', lit: '#A0703A', beam: '#4E3120', roof: '#0E1019', eave: '#5B3A26', moon: C.strong, ground: '#151726' },
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },     // pills, tags, labels under things
    read: { font: 'ui', weight: 600, size: 30 },      // anything to be read
    mono: { font: 'mono', weight: 600, size: 26 },    // literal names, usage fields, counters (30 for counters)
    body: { font: 'read', size: 30 },                 // Georgia lines (myth backs, breaks line)
  };
  const motion = {
    move: 0.7,          // structural moves (papers landing, desk sliding)
    grow: 0.8,          // desk size changes (always eased, never jumped)
    land: 0.6,          // a paper slides onto the desk
    token: 0.35,        // one token square per 0.35 s when the clerk writes
    bob: { speed: 1.6, amp: 3 },   // clerk idle bob
    noiseFps: 10,       // the static in the well re-seeds 10x per second (low contrast, never flashing)
  };

  // ---------------------------------------------------------------- the desk (geometry)
  const SIZES = {
    y2021: { w: 420, h: 200 },     // 2021: one small desk, text only
    standard: { w: 1100, h: 380 },
    hall: { w: 1600, h: 520 },     // Oct 2026: fills x 160–1760
    mid: { w: 1240, h: 440 },      // hall-ish desk that leaves room for the door (left) and studio (right)
    left: { w: 1300, h: 440 },     // 06: desk at cx 820 beside the studio
  };
  const LIP = 22, LEGS = 34;
  /** desk geometry. spec: 'y2021'|'standard'|'hall'|'mid'|'left' or {w, h}; o.cx (960), o.cy (600) */
  function desk(spec, o = {}) {
    const sz = typeof spec === 'string' ? SIZES[spec] : spec || SIZES.standard;
    const cx = pick(o.cx, 960), cy = pick(o.cy, 600), w = sz.w, h = sz.h;
    const inset = Math.min(46, w * 0.035);
    return { cx, cy, w, h, inset, x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2,
      bottom: cy + h / 2 + LIP + LEGS };
  }
  /** blend two desk geometries (ease k yourself; use motion.grow for size changes) */
  function lerpDesk(a, b, k) {
    return desk({ w: K.lerp(a.w, b.w, k), h: K.lerp(a.h, b.h, k) }, { cx: K.lerp(a.cx, b.cx, k), cy: K.lerp(a.cy, b.cy, k) });
  }
  /** a point on the desk surface: u 0..1 left→right, v 0..1 far→near (v 1 stays above the ruler band) */
  function spot(D, u, v) {
    const ins = D.inset * (1 - v);
    const y = K.lerp(D.y0 + 30, D.y1 - 58, v);
    return { x: K.lerp(D.x0 + ins + 36, D.x1 - ins - 36, u), y };
  }
  function topPath(D) {
    const g = G(), r = Math.min(22, D.h * 0.12), i = D.inset;
    const P = [[D.x0 + i, D.y0], [D.x1 - i, D.y0], [D.x1, D.y1], [D.x0, D.y1]];
    g.beginPath();
    g.moveTo((P[0][0] + P[1][0]) / 2, D.y0);
    for (let k = 1; k <= 4; k++) { const a = P[k % 4], b = P[(k + 1) % 4]; g.arcTo(a[0], a[1], b[0], b[1], r); }
    g.closePath();
  }

  /** draw the desk. o: {alpha, lit 0..1 (pool of light), glow (warm rim 0..1), wash: {color, a}, floor 0..1, legs (true), guest 0..1} */
  function drawDesk(t, D, o = {}) {
    const g = G(), lit = pick(o.lit, 1), tone = M.tone(o.guest || 0);
    K.layer(pick(o.alpha, 1), () => {
      // floor line + contact shadow
      if (pick(o.floor, 0.6) > 0) K.line(D.x0 - 120, D.bottom, D.x1 + 120, D.bottom, { color: C.line2, w: 2, alpha: 0.5 * pick(o.floor, 0.6) });
      g.save();
      const sh = g.createRadialGradient(D.cx, D.bottom, 0, D.cx, D.bottom, D.w * 0.62);
      sh.addColorStop(0, 'rgba(4,5,12,.55)'); sh.addColorStop(1, 'rgba(4,5,12,0)');
      g.fillStyle = sh; g.translate(D.cx, D.bottom); g.scale(1, 0.09); g.translate(-D.cx, -D.bottom);
      g.fillRect(D.x0 - 200, D.bottom - D.w, D.w + 400, D.w * 2); g.restore();
      // legs
      if (o.legs !== false) {
        const lw = Math.max(16, D.w * 0.022), lx = [D.x0 + D.w * 0.06, D.x1 - D.w * 0.06 - lw];
        g.save(); g.fillStyle = palette.woodDark;
        lx.forEach((x) => { K.rr(x, D.y1 + LIP - 6, lw, LEGS + 6, 4); g.fill(); });
        g.restore();
      }
      // front lip (the desk's thickness)
      g.save();
      const lg = g.createLinearGradient(0, D.y1, 0, D.y1 + LIP);
      lg.addColorStop(0, palette.beam); lg.addColorStop(1, palette.woodDark);
      K.rr(D.x0, D.y1 - 8, D.w, LIP + 8, 8); g.fillStyle = lg; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.line2, 0.9); g.stroke(); g.restore();
      // top surface: far edge darker, near edge warmer
      g.save();
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
      topPath(D);
      const tg = g.createLinearGradient(0, D.y0, 0, D.y1);
      tg.addColorStop(0, palette.woodDark); tg.addColorStop(1, palette.wood);
      g.fillStyle = tg; g.fill(); g.shadowColor = 'transparent';
      g.clip();
      // grain: a few faint curved lines
      g.strokeStyle = K.rgba('#000000', 0.16); g.lineWidth = 2;
      const R = K.rng(17);
      for (let i = 1; i <= 5; i++) {
        const y = K.lerp(D.y0, D.y1, i / 6) + (R() - 0.5) * 10;
        g.beginPath(); g.moveTo(D.x0, y);
        g.bezierCurveTo(D.x0 + D.w * 0.3, y + (R() - 0.5) * 14, D.x0 + D.w * 0.7, y + (R() - 0.5) * 14, D.x1, y + (R() - 0.5) * 8);
        g.stroke();
      }
      // pool of lamplight
      if (lit > 0) {
        g.save();
        g.translate(D.cx, D.cy - D.h * 0.08); g.scale(1, D.h / D.w * 1.4);
        const pr = D.w * 0.55;
        const pg = g.createRadialGradient(0, 0, 0, 0, 0, pr);
        pg.addColorStop(0, K.rgba(tone.lamp, 0.30 * lit * tone.glowMul)); pg.addColorStop(0.6, K.rgba(tone.lamp, 0.08 * lit * tone.glowMul)); pg.addColorStop(1, K.rgba(tone.lamp, 0));
        g.fillStyle = pg; g.fillRect(-pr, -pr, pr * 2, pr * 2); g.restore();
      }
      if (o.wash && o.wash.a > 0) { g.fillStyle = K.rgba(o.wash.color || C.page, o.wash.a); g.fillRect(D.x0, D.y0, D.w, D.h); }
      g.restore();
      // rims: far edge hairline, near edge catch-light
      g.save(); topPath(D); g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.line2, 0.9); g.stroke();
      if (o.glow) { g.shadowColor = K.rgba(tone.lamp, 0.6 * o.glow); g.shadowBlur = 40; g.strokeStyle = K.rgba(tone.lamp, 0.55 * o.glow); g.lineWidth = 2.5; topPath(D); g.stroke(); }
      g.restore();
      K.line(D.x0 + 14, D.y1 - 2, D.x1 - 14, D.y1 - 2, { color: K.rgba(C.head, 0.22 * (0.4 + 0.6 * lit)), w: 2 });
    });
  }
  /** fill the desk top with a colour (dims, cold washes, "read all at once" pulses) */
  function wash(D, color, a) {
    if (a <= 0) return;
    const g = G(); g.save(); topPath(D); g.fillStyle = K.rgba(color, a); g.fill(); g.restore();
  }

  // ---------------------------------------------------------------- the lantern (lamp)
  /** the lamp over the desk. o: {x 960, y 200, s 1.3, lit 1, glowK 1.4, cordTop (y - 60), cone: D (a soft light cone onto that desk),
   *  alpha, guest 0..1}. The lantern's visual centre is (x, y + 16 s); its body spans y - 6 s .. y + 38 s. */
  function lamp(t, o = {}) {
    const x = pick(o.x, 960), y = pick(o.y, 200), s = pick(o.s, 1.3), lit = c01(pick(o.lit, 1)), a = pick(o.alpha, 1);
    const tone = M.tone(o.guest || 0);
    K.layer(a, () => {
      const top = pick(o.cordTop, y - 60);
      if (y - 6 * s > top) K.line(x, top, x, y - 6 * s, { color: C.line2, w: 2 });
      if (o.cone && lit > 0) {
        const D = o.cone, g = G(), cy = y + 40 * s;
        g.save(); g.filter = `blur(${Math.round(14 * s)}px)`;
        const cg = g.createLinearGradient(0, cy, 0, D.y0 + D.h * 0.4);
        cg.addColorStop(0, K.rgba(tone.lamp, 0.09 * lit * tone.glowMul)); cg.addColorStop(1, K.rgba(tone.lamp, 0));
        g.fillStyle = cg; g.beginPath(); g.moveTo(x - 20 * s, cy); g.lineTo(x + 20 * s, cy);
        g.lineTo(x + D.w * 0.36, D.y0 + D.h * 0.4); g.lineTo(x - D.w * 0.36, D.y0 + D.h * 0.4); g.closePath(); g.fill(); g.restore();
      }
      if (o.guest) K.glow(x, y + 16 * s, 110 * s, tone.lamp, 0.16 * o.guest * lit);
      K.map.lantern(t, 0, { x, y, s, lit, glowK: pick(o.glowK, 1.4) * tone.glowMul });
    });
  }

  // ---------------------------------------------------------------- the clerk (the model)
  /** the clerk tile. o: {s 1 (tile 104 s), bob true, label 0..1 ('the model' pill, to the right), labelText, glow 0..1, alpha, ghost (outline only)} */
  function clerk(t, x, y, o = {}) {
    const s = pick(o.s, 1), size = 104 * s, a = pick(o.alpha, 1);
    const by = o.bob === false ? 0 : K.wave(t, motion.bob.speed, motion.bob.amp * s);
    K.layer(a, () => {
      if (o.glow) K.glow(x, y + by, size * 1.1, C.head, 0.22 * o.glow);
      if (o.ghost) {
        K.card(x - size / 2, y + by - size / 2, size, size, { r: size * 0.28, fill: K.rgba(C.tile, 0.25), stroke: K.rgba(C.head, 0.5), shadow: false });
        K.icon('sparkle', x, y + by, size * 0.62, { color: C.head, alpha: 0.6 });
      } else {
        K.iconTile('sparkle', x, y + by, size, { glow: o.glow ? 0.6 * o.glow : 0, stroke: o.glow ? K.rgba(C.head, 0.7) : undefined });
      }
      const lk = c01(o.label);
      if (lk > 0) {
        const s0 = o.labelText || 'the model', w = K.measure(s0, type.label) + 26 * 1.6;
        K.layer(lk, () => K.pill(s0, x + size / 2 + 20 + w / 2 + (1 - lk) * -12, y + by, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) }));
      }
    });
  }

  /** a pen nib (the clerk writing), tip at (x, y), angled. o: {s 1, color, alpha} */
  function pen(x, y, o = {}) {
    const g = G(), s = pick(o.s, 1);
    K.layer(pick(o.alpha, 1), () => K.at(x, y, s, -0.7, () => {
      g.save(); g.fillStyle = o.color || C.head; g.strokeStyle = C.page; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-7, -14); g.lineTo(-7, -46); g.lineTo(7, -46); g.lineTo(7, -14); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -14); g.stroke();
      g.fillStyle = C.line2; K.rr(-8, -60, 16, 16, 3); g.fill();
      g.restore();
    }));
  }

  /** the clerk writes: token squares appear one at a time from (x, y) rightwards, pen at the head.
   *  o: {t0, step 0.35, n (max squares), cell 18, gap 6, color, pen true, alpha, rows (wrap after n per row: perRow)} returns count shown */
  function write(t, x, y, o = {}) {
    const step = pick(o.step, motion.token), cell = pick(o.cell, 18), gap = pick(o.gap, 6), n = pick(o.n, 12);
    const per = pick(o.perRow, n), t0 = pick(o.t0, 0);
    const shown = Math.max(0, Math.min(n, Math.floor((t - t0) / step) + 1));
    if (t < t0) return 0;
    K.layer(pick(o.alpha, 1), () => {
      for (let i = 0; i < shown; i++) {
        const r = Math.floor(i / per), c = i % per, k = K.io(t, t0 + i * step, 0.25, 'out');
        const px = x + c * (cell + gap), py = y + r * (cell + gap);
        K.layer(k, () => K.card(px, py + (1 - k) * -6, cell, cell, { r: 4, fill: o.color || C.head, stroke: false, shadow: false }));
      }
      if (o.pen !== false) {
        const i = Math.max(0, shown - 1), r = Math.floor(i / per), c = i % per;
        const done = shown >= n;
        pen(x + (c + 1) * (cell + gap) + 2, y + r * (cell + gap) + cell, { s: 0.7, alpha: done ? K.clamp(1 - (t - (t0 + n * step)) / 0.6) : 1 });
      }
    });
    return shown;
  }

  // ---------------------------------------------------------------- token ruler
  /** the ruler along the desk's near edge. o: {fill 0..1, count ('2K'), countK 0..1, countAt: 'end' (inside, right end) | 'below'
   *  (centred under the desk's legs: use it on the 2021 desk or for long counters like '~2K tokens'), cell 14, gap 6, alpha, color} */
  function ruler(t, D, o = {}) {
    const cell = pick(o.cell, 14), gap = pick(o.gap, 6), y = D.y1 - 30;
    const cnt = o.count || '', ck = pick(o.countK, cnt ? 1 : 0);
    const below = o.countAt === 'below';
    const cw = cnt ? K.measure(cnt, { font: 'mono', size: 30, weight: 600 }) + 30 * 1.6 : 0;
    const xa = D.x0 + 30, xb = D.x1 - 30 - (cnt && !below ? cw + 14 : 0);
    const n = Math.max(1, Math.floor((xb - xa + gap) / (cell + gap)));
    const filled = c01(pick(o.fill, 0)) * n;
    K.layer(pick(o.alpha, 1), () => {
      for (let i = 0; i < n; i++) {
        const f = K.clamp(filled - i);
        const x = xa + i * (cell + gap);
        K.card(x, y - cell / 2, cell, cell, { r: 3, fill: f > 0 ? K.mixColor(C.tile, o.color || C.head, 0.25 + 0.65 * f) : K.rgba(C.tile, 0.85), stroke: f > 0 ? false : K.rgba(C.line2, 0.9), shadow: false, lw: 1 });
      }
      if (cnt && ck > 0) K.layer(ck, () => K.pill(cnt, below ? D.cx : xb + 14 + cw / 2, below ? D.bottom + 44 : y - 4, { size: 30, font: 'mono', color: C.head, fill: C.page, stroke: K.rgba(C.head, 0.45) }));
    });
    return { n, y, xa, xb };
  }

  // ---------------------------------------------------------------- the whole workspace
  /** lamp + clerk + desk + ruler in the right draw order. Returns {D, clerk: {x, y}, lamp: {x, y}}.
   *  st: {desk: geometry (M.desk(...)) | size name, cx, cy, lit 1, alpha 1, guest 0..1, deskGlow,
   *       lamp: {...lamp opts} | false, clerk: {...clerk opts} | false, ruler: {...ruler opts} | false, wash}
   *  Clerk stands behind the far edge (centre y0 - 34 s, its foot hidden by the desk); lamp hangs 100 px above the clerk's head. */
  function stage(t, st = {}) {
    const D = st.desk && st.desk.x0 != null ? st.desk : desk(st.desk || 'standard', { cx: st.cx, cy: st.cy });
    const co = st.clerk === false ? null : st.clerk || {};
    const cs = co ? pick(co.s, 1) : 1;
    const cx = D.cx + (co && co.dx || 0), cy = D.y0 - 34 * cs;
    const lo = st.lamp === false ? null : st.lamp || {};
    const ls = lo ? pick(lo.s, 1.3) : 1.3;
    const ly = lo ? pick(lo.y, cy - 52 * cs - 44 - 38 * ls) : 0;
    const lit = pick(st.lit, 1), guest = st.guest || 0;
    K.layer(pick(st.alpha, 1), () => {
      if (lo) lamp(t, { lit, guest, cone: D, ...lo, x: pick(lo.x, D.cx), y: ly });
      if (co) clerk(t, cx, cy, co);
      drawDesk(t, D, { lit, guest, glow: st.deskGlow, wash: st.wash, floor: st.floor, legs: st.legs });
      if (st.ruler) ruler(t, D, st.ruler);
    });
    return { D, clerk: { x: cx, y: cy }, lamp: { x: lo ? pick(lo.x, D.cx) : D.cx, y: ly } };
  }
  /** the whole workspace as a small emblem / mini desk (rooms, end card, maps): geometry only, no labels.
   *  (x, y) = desk centre; s scales a 420x200 desk with lamp and clerk (s 0.4 ≈ 170 px wide). o: {lit, alpha, dark 0..1 (night: desk lamp off)} */
  // mini() local extent: lamp top ≈ -300, legs bottom 156 (desk centre at 0): 456 units tall, 420 wide
  const MINI = { top: -300, bottom: 156, w: 420 };
  function mini(t, x, y, s, o = {}) {
    K.layer(pick(o.alpha, 1), () => K.at(x, y, s, 0, () => {
      const lit = pick(o.lit, 1) * (1 - c01(o.dark));
      stage(t, { desk: desk('y2021', { cx: 0, cy: 0 }), lit, floor: 0, clerk: { bob: false }, lamp: { s: 1.5, lit: Math.max(0.15, lit), glowK: 1.6, cordTop: -330 } });
      if (o.dark) wash(desk('y2021', { cx: 0, cy: 0 }), C.page, 0.55 * c01(o.dark));
    }));
  }

  // ---------------------------------------------------------------- what lands on the desk
  /** a paper on the desk, centred at (x, y). o: {w 120, h 80, rot, alpha, lines 2, kind: 'text'|'note'|'summary'|'tool'|'msg',
   *   title (summary/note heading, ink 26), glow 0..1, edge (gold edge 0..1), dim 0..1, pinned (gold pin on top)} */
  function paper(x, y, o = {}) {
    const g = G(), w = pick(o.w, 120), h = pick(o.h, 80), kind = o.kind || 'text';
    const fill = kind === 'note' ? palette.note : kind === 'tool' ? '#B9B4C4' : C.paper;
    K.layer(pick(o.alpha, 1), () => K.at(x, y, 1, o.rot || 0, () => {
      if (o.glow) K.glow(0, 0, Math.max(w, h) * 0.9, C.head, 0.3 * o.glow);
      g.save();
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 22; g.shadowOffsetY = 8;
      if (kind === 'msg') {
        K.rr(-w / 2, -h / 2, w, h, 16); g.fillStyle = fill; g.fill(); g.shadowColor = 'transparent';
        g.beginPath(); g.moveTo(-w / 2 + 18, h / 2 - 2); g.lineTo(-w / 2 + 10, h / 2 + 14); g.lineTo(-w / 2 + 36, h / 2 - 2); g.closePath(); g.fill();
      } else {
        K.rr(-w / 2, -h / 2, w, h, kind === 'note' ? 4 : 8); g.fillStyle = fill; g.fill();
      }
      g.shadowColor = 'transparent';
      if (o.edge) { g.lineWidth = 4; g.strokeStyle = K.rgba(C.head, o.edge); K.rr(-w / 2, -h / 2, w, h, 8); g.stroke(); }
      g.restore();
      let y0 = -h / 2 + 22;
      if (o.title) {
        K.text(o.title, -w / 2 + 16, -h / 2 + 36, { font: 'ui', weight: 600, size: 26, color: C.ink });
        y0 = -h / 2 + 62;
      }
      if (kind === 'tool') K.icon('terminal', -w / 2 + 24, -h / 2 + 24, 26, { color: C.ink, w: 2 });
      const nl = pick(o.lines, kind === 'summary' ? 6 : 2), lh = Math.min(16, (h - (y0 + h / 2) - 10) / Math.max(1, nl));
      for (let i = 0; i < nl; i++) {
        const yy = y0 + i * lh + (o.title ? 0 : Math.max(0, (h - 44 - nl * lh) / 2));
        if (yy > h / 2 - 10) break;
        const x0 = -w / 2 + (kind === 'tool' && i === 0 && !o.title ? 46 : 16), x1 = w / 2 - 16 - (i === nl - 1 ? w * 0.25 : 0);
        K.line(x0, yy, x1, yy, { color: palette.inkLine, w: 3 });
      }
      if (o.pinned) { g.save(); g.fillStyle = C.head; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 6; g.beginPath(); g.arc(0, -h / 2 + 2, 8, 0, TAU); g.fill(); g.restore(); }
      if (o.dim) { g.save(); g.globalAlpha *= o.dim * 0.7; K.rr(-w / 2, -h / 2, w, h, 8); g.fillStyle = C.page; g.fill(); g.restore(); }
    }));
  }

  /** a file with a media glyph (png: landscape, mp4: film + play, mp3: sound wave, pdf/md/txt: lines). Same args as K.file.
   *  o: {ext, name, nameSize (≥ 26 below s 150), alpha, rot, glow} */
  function file(x, y, s, o = {}) {
    const g = G(), ext = o.ext || 'txt';
    K.layer(pick(o.alpha, 1), () => K.at(x, y, 1, o.rot || 0, () => {
      if (o.glow) K.glow(0, 0, s * 0.9, C.head, 0.3 * o.glow);
      K.file(0, 0, s, { ext, name: o.name, nameSize: pick(o.nameSize, s < 150 ? 26 : undefined) });
      const w = s * 0.78, h = s, x0 = -w / 2, y0 = -h / 2;
      const gx0 = x0 + w * 0.14, gx1 = x0 + w * 0.86, gy0 = y0 + h * 0.27, gy1 = y0 + h * 0.62;
      const media = ['png', 'jpg', 'mp4', 'mp3', 'wav'].includes(ext);
      if (media) {
        g.save(); g.fillStyle = C.paper; g.fillRect(gx0 - 4, gy0 - 6, gx1 - gx0 + 8, gy1 - gy0 + 12); g.restore();
        const gw = gx1 - gx0, gh = gy1 - gy0;
        g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
        if (ext === 'png' || ext === 'jpg') {
          K.rr(gx0, gy0, gw, gh, 4); g.fillStyle = '#C9D4E8'; g.fill();
          g.fillStyle = '#6F86B0'; g.beginPath(); g.moveTo(gx0, gy1); g.lineTo(gx0 + gw * 0.38, gy0 + gh * 0.35); g.lineTo(gx0 + gw * 0.62, gy0 + gh * 0.7); g.lineTo(gx0 + gw * 0.76, gy0 + gh * 0.55); g.lineTo(gx1, gy1); g.closePath(); g.fill();
          g.fillStyle = C.head; g.beginPath(); g.arc(gx0 + gw * 0.76, gy0 + gh * 0.28, gh * 0.13, 0, TAU); g.fill();
        } else if (ext === 'mp4') {
          K.rr(gx0, gy0, gw, gh, 4); g.fillStyle = C.ink; g.fill();
          g.fillStyle = C.paper; for (let i = 0; i < 5; i++) { g.fillRect(gx0 + 4 + i * (gw - 8) / 4.6, gy0 + 3, gw * 0.08, gh * 0.1); g.fillRect(gx0 + 4 + i * (gw - 8) / 4.6, gy1 - 3 - gh * 0.1, gw * 0.08, gh * 0.1); }
          g.fillStyle = C.head; g.beginPath(); g.moveTo(gx0 + gw * 0.42, gy0 + gh * 0.3); g.lineTo(gx0 + gw * 0.64, gy0 + gh * 0.5); g.lineTo(gx0 + gw * 0.42, gy0 + gh * 0.7); g.closePath(); g.fill();
        } else {
          g.strokeStyle = C.ink; g.lineWidth = Math.max(2.5, s * 0.03);
          const n = 9; for (let i = 0; i < n; i++) { const hh = gh * (0.2 + 0.75 * Math.abs(Math.sin(i * 1.7 + 0.6))); const xx = gx0 + (i + 0.5) * gw / n; g.beginPath(); g.moveTo(xx, gy0 + gh / 2 - hh / 2); g.lineTo(xx, gy0 + gh / 2 + hh / 2); g.stroke(); }
        }
        g.restore();
      }
      // re-tint the extension badge (same geometry as K.file) so media types read apart
      const col = palette.ext[ext];
      if (col) {
        const bs = s * 0.2, label = '.' + ext, bw = K.measure(label, { font: 'mono', size: bs, weight: 700 }) + bs * 0.9;
        g.save(); K.rr(x0 - s * 0.08, y0 + h * 0.68, bw, bs * 1.5, bs * 0.3); g.fillStyle = col; g.fill(); g.restore();
        K.text(label, x0 - s * 0.08 + bw / 2, y0 + h * 0.68 + bs * 1.1, { font: 'mono', size: bs, weight: 700, color: C.page, align: 'center' });
      }
    }));
  }

  /** land something on the desk: returns {x, y, a} for an item sliding in from (fromX, fromY) to (x, y) over motion.land from t0 */
  function land(t, t0, x, y, fromX, fromY, d) {
    const k = K.io(t, t0, pick(d, motion.land), 'out');
    return { x: K.lerp(fromX, x, k), y: K.lerp(fromY, y, k), a: K.clamp(k * 1.6), k };
  }

  /** a deterministic pile of n papers on the desk (05, 18). o: {k 0..1 (how many have landed), seed 5, w 150, h 100, rows,
   *  highlight (index: gold edge), dimMiddle 0..1, alpha}. Returns the positions [{x, y, rot}] */
  function pile(t, D, n, o = {}) {
    const R = K.rng(pick(o.seed, 5)), out = [];
    const cols = Math.ceil(Math.sqrt(n * 2.4)), rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const p = spot(D, (c + 0.5 + (R() - 0.5) * 0.5) / cols, K.clamp((r + 0.5 + (R() - 0.5) * 0.4) / rows));
      out.push({ x: p.x, y: p.y - (i / n) * 18, rot: (R() - 0.5) * 0.24 });
    }
    const shownF = c01(pick(o.k, 1)) * n;
    K.layer(pick(o.alpha, 1), () => out.forEach((p, i) => {
      const k = K.clamp(shownF - i); if (k <= 0) return;
      const mid = Math.abs(i / Math.max(1, n - 1) - 0.5) < 0.22 ? c01(o.dimMiddle) : 0;
      paper(p.x, p.y - (1 - k) * 40, { w: pick(o.w, 150), h: pick(o.h, 100), rot: p.rot, alpha: k, edge: i === o.highlight ? 1 : 0, dim: mid, lines: 3 });
    }));
    return out;
  }

  // ---------------------------------------------------------------- doors, studio, lines
  /** the A P I letter-slot door. (x, y) = top-left (layout.door: 130, 340; 170 x 420). o: {alpha, label 'API', labelK 1, glow} */
  function door(t, x, y, o = {}) {
    const w = 170, h = 420, g = G();
    K.layer(pick(o.alpha, 1), () => {
      K.card(x, y, w, h, { r: 18, fill: K.mixColor(C.tile, palette.beam, 0.35), stroke: K.rgba(C.accent, 0.55), glow: o.glow });
      for (let i = 0; i < 2; i++) K.card(x + 22, y + 34 + i * 230, w - 44, 150, { r: 10, fill: K.rgba(C.page, 0.25), stroke: K.rgba(C.line2, 0.8), shadow: false });
      K.card(x + 30, y + 196, w - 60, 16, { r: 8, fill: C.page, stroke: K.rgba(C.accent, 0.6), shadow: false });
      g.save(); g.fillStyle = C.head; g.beginPath(); g.arc(x + w - 30, y + h * 0.56, 7, 0, TAU); g.fill(); g.restore();
      const lk = pick(o.labelK, 1);
      if (lk > 0) K.pill(o.label || 'API', x + w / 2, y - 40, { size: 26, color: C.accent, stroke: K.rgba(C.accent, 0.6), alpha: lk });
    });
    return { slot: { x: x + w / 2, y: y + 204 }, x, y, w, h };
  }
  /** an envelope (filled cream), centred, s ≈ width. o: {rot, alpha} */
  function letter(x, y, s, o = {}) {
    const g = G(), w = s, h = s * 0.64;
    K.layer(pick(o.alpha, 1), () => K.at(x, y, 1, o.rot || 0, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 5;
      K.rr(-w / 2, -h / 2, w, h, 5); g.fillStyle = C.paper; g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = palette.inkLine; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2 + 3, -h / 2 + 3); g.lineTo(0, h * 0.08); g.lineTo(w / 2 - 3, -h / 2 + 3); g.stroke();
      g.fillStyle = C.accent; g.beginPath(); g.arc(0, h * 0.08, s * 0.06, 0, TAU); g.fill();
      g.restore();
    }));
  }

  /** the studio (where a separate generator model works). (x, y) top-left; 190 x 420 (layout.studio: 1610, 340).
   *  o: {open 0..1 (stroke brightens, warm inner light), show 0..1 (well: static → picture), alpha, guest, label 'STUDIO', seed}
   *  Returns {well: {x, y, s}, door: {x, y}} (door = left-middle point, where phone lines arrive) */
  function studio(t, x, y, o = {}) {
    const w = 190, h = 420, op = c01(o.open), tone = M.tone(o.guest || 0);
    const wx = x + w / 2, wy = y + 200, ws = 150;
    K.layer(pick(o.alpha, 1), () => {
      if (op > 0) K.glow(wx, wy, 220, tone.accent, 0.16 * op);
      K.card(x, y, w, h, { r: 18, fill: K.mixColor(C.tile, C.page, 0.2), stroke: K.mixColor(C.line2, tone.accent, 0.45 + 0.55 * op), lw: 1.5 + op, glow: 0 });
      K.eyebrow(o.label || 'STUDIO', wx, y + 58, { align: 'center', size: 20, color: K.mixColor(C.soft, tone.accent, op) });
      well(t, wx, wy, ws, pick(o.show, 0), { seed: pick(o.seed, 3), still: o.still });
      // easel legs under the well
      K.line(wx - 40, wy + ws / 2 + 6, wx - 58, y + h - 50, { color: C.line2, w: 3 });
      K.line(wx + 40, wy + ws / 2 + 6, wx + 58, y + h - 50, { color: C.line2, w: 3 });
      K.line(wx, wy + ws / 2 + 6, wx, y + h - 40, { color: C.line2, w: 3 });
    });
    return { well: { x: wx, y: wy, s: ws }, door: { x, y: y + h / 2 } };
  }

  /** a dashed phone line (a hand-off to another model or service). o: {k 0..1 (draws itself), color (accent), pulse (t: a dot runs along it),
   *  bend, head (false), alpha, w} */
  function phone(t, x1, y1, x2, y2, o = {}) {
    const k = c01(pick(o.k, 1)); if (k <= 0) return;
    const col = o.color || C.accent;
    K.arrow(x1, y1, x2, y2, { k, color: col, dash: [8, 8], w: pick(o.w, 3), bend: o.bend || 0, head: pick(o.head, false), alpha: pick(o.alpha, 0.9) });
    if (o.pulse && k >= 1) {
      const u = ((t * 0.5) % 1), dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, bend = o.bend || 0;
      const mx = (x1 + x2) / 2 - (dy / len) * bend, my = (y1 + y2) / 2 + (dx / len) * bend;
      const px = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, py = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2;
      K.glow(px, py, 22, col, 0.6 * pick(o.alpha, 0.9));
      const g = G(); g.save(); g.fillStyle = col; g.beginPath(); g.arc(px, py, 5, 0, TAU); g.fill(); g.restore();
    }
  }

  // ---------------------------------------------------------------- diffusion: the canvas well
  // the picture the well resolves into: a tea house at night under a moon, one lit window, one lantern (u, v in 0..1)
  const NP = {}; Object.keys(palette.night).forEach((k) => { NP[k] = hex2(palette.night[k]); });
  const GOLD = hex2(C.head);
  const roofTop = (u) => 0.4 + 0.1 * K.clamp((Math.abs(u - 0.4) - 0.1) / 0.2);
  const roofBot = (u) => 0.53 - 0.045 * Math.pow(K.clamp(Math.abs(u - 0.4) / 0.3), 3);
  function picAt(u, v) {
    let c = mix3(NP.skyTop, NP.skyLow, K.clamp(v / 0.72));
    const dm = Math.hypot(u - 0.76, v - 0.22);
    if (dm < 0.085) c = NP.moon; else if (dm < 0.2) c = mix3(c, NP.skyLow, (0.2 - dm) / 0.115 * 0.6);
    const hb = 0.6 - 0.07 * Math.sin(u * 5.2 + 0.4); if (v > hb) c = NP.hillBack;
    const hn = 0.7 - 0.05 * Math.sin(u * 7.5 + 2.1); if (v > hn) c = NP.hillNear;
    // tea house: hipped roof whose eaves flick up at the tips, then the wall
    if (u > 0.1 && u < 0.7) {
      const rt = roofTop(u), rb = roofBot(u);
      if (v > rt && v < rb) c = v > rb - 0.02 ? NP.eave : NP.roof;
    }
    if (u > 0.17 && u < 0.63 && v >= 0.52 && v < 0.84) {
      c = NP.wall;
      if (u > 0.22 && u < 0.4 && v > 0.58 && v < 0.74) c = NP.lit;                         // lit shoji window
      if ((u > 0.302 && u < 0.316) && v > 0.58 && v < 0.74) c = NP.beam;
      if (u > 0.47 && u < 0.56 && v > 0.62) c = NP.beam;                                     // door
    }
    if (v >= 0.84) c = NP.ground;
    const dl = Math.hypot(u - 0.68, (v - 0.66) * 0.8);                                       // hanging lantern
    if (dl < 0.03) c = GOLD; else if (dl < 0.1) c = mix3(c, GOLD, (0.1 - dl) / 0.07 * 0.35);
    return c;
  }
  const NOISE_LO = hex2('#1A1B2C'), NOISE_HI = hex2('#8A8070');
  /** the square canvas well: static that clears into the picture as k goes 0 → 1 (diffusion).
   *  (x, y) = centre, s = side. o: {seed 7, cells (grid size, default s/6 capped 100), still (freeze the static), frame (true), alpha,
   *  order: 'all' (diffusion: every cell at once) | 'tiles' (autoregressive: row by row, k = fraction built)} */
  function well(t, x, y, s, k, o = {}) {
    const g = G(), n = Math.round(pick(o.cells, Math.min(100, Math.max(12, s / 6)))), cs = s / n;
    const x0 = x - s / 2, y0 = y - s / 2, kk = c01(k), order = o.order || 'all';
    K.layer(pick(o.alpha, 1), () => {
      if (o.frame !== false) K.card(x0 - 8, y0 - 8, s + 16, s + 16, { r: 6, fill: C.page, stroke: C.line2, shadow: true });
      const R = K.rng(pick(o.seed, 7) * 7919 + (o.still ? 0 : Math.floor(t * motion.noiseFps)) * 104729 + 1);
      const nAmt = order === 'all' ? Math.pow(1 - kk, 1.15) : 0;
      const built = order === 'tiles' ? kk * n * n : 0;
      g.save();
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const r = R();
        let c;
        if (order === 'tiles') {
          const idx = j * n + i;
          if (idx >= built) { c = mix3(hex2(C.page), hex2(C.tile), 0.6); }
          else c = picAt((i + 0.5) / n, (j + 0.5) / n);
        } else {
          const nz = mix3(NOISE_LO, NOISE_HI, r);
          c = mix3(picAt((i + 0.5) / n, (j + 0.5) / n), nz, nAmt);
        }
        g.fillStyle = rgbStr(c);
        g.fillRect(x0 + i * cs, y0 + j * cs, cs + 0.6, cs + 0.6);
      }
      g.restore();
      // crisp finish over the last 15 % (diffusion only)
      const fin = order === 'all' ? K.seg(kk, 0.85, 1) : 0;
      if (fin > 0) K.layer(fin, () => crispPic(x0, y0, s));
    });
  }
  function crispPic(x0, y0, s) {
    const g = G(), P = (u, v) => [x0 + u * s, y0 + v * s];
    g.save(); g.beginPath(); g.rect(x0, y0, s, s); g.clip();
    const sk = g.createLinearGradient(0, y0, 0, y0 + s * 0.72); sk.addColorStop(0, palette.night.skyTop); sk.addColorStop(1, palette.night.skyLow);
    g.fillStyle = sk; g.fillRect(x0, y0, s, s);
    K.glow(...P(0.76, 0.22), s * 0.2, C.strong, 0.18);
    g.fillStyle = C.strong; g.beginPath(); g.arc(...P(0.76, 0.22), s * 0.085, 0, TAU); g.fill();
    const hill = (base, amp, f, ph, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0 + s); for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x0 + u * s, y0 + s * (base - amp * Math.sin(u * f + ph))); } g.lineTo(x0 + s, y0 + s); g.closePath(); g.fill(); };
    hill(0.6, 0.07, 5.2, 0.4, palette.night.hillBack); hill(0.7, 0.05, 7.5, 2.1, palette.night.hillNear);
    g.fillStyle = palette.night.wall; g.fillRect(...P(0.17, 0.52), s * 0.46, s * 0.32);
    g.fillStyle = palette.night.lit; g.fillRect(...P(0.22, 0.58), s * 0.18, s * 0.16);
    K.glow(...P(0.31, 0.66), s * 0.16, C.head, 0.2);
    g.fillStyle = palette.night.beam; g.fillRect(...P(0.302, 0.58), s * 0.014, s * 0.16); g.fillRect(...P(0.47, 0.62), s * 0.09, s * 0.22);
    g.fillStyle = palette.night.roof; g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = 0.1 + 0.6 * i / 40; i ? g.lineTo(...P(u, roofTop(u))) : g.moveTo(...P(u, roofTop(u))); }
    for (let i = 40; i >= 0; i--) { const u = 0.1 + 0.6 * i / 40; g.lineTo(...P(u, roofBot(u))); }
    g.closePath(); g.fill();
    g.strokeStyle = palette.night.eave; g.lineWidth = Math.max(2, s * 0.016); g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = 0.1 + 0.6 * i / 40; const q = P(u, roofBot(u) - 0.008); i ? g.lineTo(...q) : g.moveTo(...q); } g.stroke();
    g.fillStyle = palette.night.ground; g.fillRect(...P(0, 0.84), s, s * 0.16);
    K.glow(...P(0.68, 0.66), s * 0.1, C.head, 0.4);
    g.fillStyle = C.head; g.beginPath(); g.ellipse(...P(0.68, 0.66), s * 0.026, s * 0.034, 0, 0, TAU); g.fill();
    g.strokeStyle = C.line2; g.lineWidth = Math.max(1, s * 0.004); g.beginPath(); g.moveTo(...P(0.68, 0.53)); g.lineTo(...P(0.68, 0.625)); g.stroke();
    g.restore();
  }

  // ---------------------------------------------------------------- knobs, meters, timer, picker
  /** a sampling dial hanging from the lamp (08). o: {r 80, label, lit 0..1, taped 0..1 (masking-tape X over it), alpha, color} k = needle 0..1 */
  function dial(t, x, y, k, o = {}) {
    const g = G(), r = pick(o.r, 80), lit = pick(o.lit, 1), col = o.color || C.head;
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = K.lerp(a0, a1, c01(k));
    K.layer(pick(o.alpha, 1), () => {
      if (lit > 0) K.glow(x, y, r * 1.6, col, 0.12 * lit);
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = C.tile; g.fill(); g.restore();
      g.save(); g.lineWidth = 2; g.strokeStyle = K.mixColor(C.line2, col, 0.5 * lit); g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
      for (let i = 0; i <= 10; i++) { const a = K.lerp(a0, a1, i / 10), r1 = r * 0.78, r2 = r * (i % 5 === 0 ? 0.62 : 0.7); g.beginPath(); g.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); g.strokeStyle = K.rgba(C.soft, 0.8); g.lineWidth = 2; g.stroke(); }
      g.beginPath(); g.arc(x, y, r * 0.86, a0, ang); g.strokeStyle = K.rgba(col, 0.35 + 0.55 * lit); g.lineWidth = 5; g.lineCap = 'round'; g.stroke();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * r * 0.6, y + Math.sin(ang) * r * 0.6); g.strokeStyle = col; g.lineWidth = 5; g.stroke();
      g.beginPath(); g.arc(x, y, r * 0.12, 0, TAU); g.fillStyle = col; g.fill();
      g.restore();
      if (o.label) K.text(o.label, x, y + r + 44, { ...type.label, color: C.strong, align: 'center' });
      const tp = c01(o.taped);
      if (tp > 0) [[-0.62, 0], [0.62, 0.15]].forEach(([rot, d], i) => {
        const kk = K.clamp(tp * 2 - i * 0.6);
        if (kk > 0) K.layer(kk, () => K.at(x, y, 1, rot, () => {
          const L = r * 2.5 * kk, hh = r * 0.38;
          g.save(); g.fillStyle = K.rgba('#CBC0AE', 0.92); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 8;
          g.beginPath(); g.moveTo(-r * 1.25, -hh / 2);
          for (let z = 0; z <= 4; z++) g.lineTo(-r * 1.25 + L, -hh / 2 + (z * hh) / 4 + (z % 2 ? 3 : -3));
          g.lineTo(-r * 1.25, hh / 2); for (let z = 4; z >= 0; z--) g.lineTo(-r * 1.25 + (z % 2 ? 4 : 0), -hh / 2 + (z * hh) / 4); g.closePath(); g.fill();
          g.restore();
        }));
      });
    });
  }

  /** a bill meter (12): half-dial gauge with needle k 0..1. o: {r 110, label (plain words, ui 26), field (mono 26 usage field), tag (pill above), color, lit, alpha} */
  function meter(t, x, y, k, o = {}) {
    const g = G(), r = pick(o.r, 110), col = o.color || C.head, lit = pick(o.lit, 1);
    const a0 = Math.PI, a1 = TAU, ang = K.lerp(a0, a1, c01(k));
    K.layer(pick(o.alpha, 1), () => {
      K.card(x - r - 26, y - r - 26, 2 * r + 52, r + 70, { r: 24, fill: K.rgba(C.tile, 0.9), stroke: K.mixColor(C.line2, col, 0.5 * lit), glow: 0.4 * lit * (o.glow || 0) });
      g.save(); g.lineCap = 'round';
      g.beginPath(); g.arc(x, y + 14, r * 0.82, a0, a1); g.strokeStyle = C.line2; g.lineWidth = 12; g.stroke();
      g.beginPath(); g.arc(x, y + 14, r * 0.82, a0, ang); g.strokeStyle = K.rgba(col, 0.4 + 0.6 * lit); g.lineWidth = 12; g.stroke();
      for (let i = 0; i <= 8; i++) { const a = K.lerp(a0, a1, i / 8); g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.62, y + 14 + Math.sin(a) * r * 0.62); g.lineTo(x + Math.cos(a) * r * 0.68, y + 14 + Math.sin(a) * r * 0.68); g.strokeStyle = K.rgba(C.soft, 0.7); g.lineWidth = 2; g.stroke(); }
      g.beginPath(); g.moveTo(x, y + 14); g.lineTo(x + Math.cos(ang) * r * 0.7, y + 14 + Math.sin(ang) * r * 0.7); g.strokeStyle = C.strong; g.lineWidth = 4; g.stroke();
      g.beginPath(); g.arc(x, y + 14, 9, 0, TAU); g.fillStyle = col; g.fill();
      g.restore();
      if (o.label) K.text(o.label, x, y + 82, { ...type.label, color: C.strong, align: 'center' });
      if (o.field) K.text(o.field, x, y + 122, { ...type.mono, size: 26, color: C.soft, align: 'center' });
      if (o.tag) K.pill(o.tag, x, y - r - 58, { size: 26, font: 'mono', color: col, stroke: K.rgba(col, 0.5), alpha: pick(o.tagK, 1) });
    });
  }

  /** cache timer ring (11): k = time left 0..1. o: {r 56, cold 0..1, label (under, 26), alpha} */
  function timer(t, x, y, k, o = {}) {
    const g = G(), r = pick(o.r, 56), cold = c01(o.cold);
    const col = K.mixColor(C.head, palette.cold, cold);
    K.layer(pick(o.alpha, 1), () => {
      if (cold < 1) K.glow(x, y, r * 2, C.head, 0.14 * (1 - cold) * c01(k));
      g.save(); g.lineCap = 'round';
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = C.tile; g.fill(); g.strokeStyle = C.line2; g.lineWidth = 10; g.stroke();
      if (k > 0) { g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * c01(k)); g.strokeStyle = col; g.lineWidth = 10; g.stroke(); }
      g.restore();
      K.icon('clock', x, y, r * 1.1, { color: col, w: 3 });
      if (o.label) K.text(o.label, x, y + r + 46, { ...type.label, color: C.strong, align: 'center' });
    });
  }

  /** a segmented picker (effort, model · effort · speed). items: strings; sel: index (fractional slides the highlight).
   *  (x, y) = centre. o: {size 26, font 'ui', alpha, color} returns total width */
  function picker(x, y, items, sel, o = {}) {
    const size = pick(o.size, 26), to = { font: o.font || 'ui', weight: 600, size }, padX = size * 0.8, h = size * 1.9;
    const ws = items.map((s) => K.measure(s, to) + padX * 2), W = ws.reduce((a, b) => a + b, 0) + 8;
    const x0 = x - W / 2, col = o.color || C.head;
    K.layer(pick(o.alpha, 1), () => {
      K.card(x0, y - h / 2 - 4, W, h + 8, { r: (h + 8) / 2, fill: C.page, stroke: C.line2, shadow: false });
      const xs = []; let cx = x0 + 4; ws.forEach((w) => { xs.push(cx); cx += w; });
      const i0 = Math.floor(K.clamp(sel, 0, items.length - 1)), i1 = Math.min(items.length - 1, i0 + 1), f = K.clamp(sel - i0);
      const hx = K.lerp(xs[i0], xs[i1], f), hw = K.lerp(ws[i0], ws[i1], f);
      K.card(hx, y - h / 2, hw, h, { r: h / 2, fill: K.rgba(col, 0.2), stroke: col, shadow: false, glow: 0.4 });
      items.forEach((s, i) => { const on = 1 - K.clamp(Math.abs(sel - i)); K.text(s, xs[i] + ws[i] / 2, y + size * 0.34, { ...to, color: K.mixColor(C.soft, col, on), align: 'center' }); });
    });
    return W;
  }

  // ---------------------------------------------------------------- caching layout (11)
  /** the prompt laid out in cache order: bands stacked top to bottom. (x, y) = top-left, w = width.
   *  o: {names ['tools', 'system prompt', 'messages'], show (k | (i) => k), lift ((i) => 0..1: band lifts off for a rebuild),
   *  warm 0..1 (gold rim + glow; 0 = cold blue-grey), nums 0..1 (1 2 3 badges at left), h 96, gap 20, alpha, swap {i, k} (card swapped in band i)}
   *  Returns [{x, y, w, h}] per band */
  function layers(t, x, y, w, o = {}) {
    const names = o.names || ['tools', 'system prompt', 'messages'], h = pick(o.h, 96), gap = pick(o.gap, 20);
    const warm = c01(pick(o.warm, 1)), out = [];
    const show = typeof o.show === 'function' ? o.show : () => pick(o.show, 1);
    const lift = typeof o.lift === 'function' ? o.lift : () => 0;
    const edge = K.mixColor(palette.cold, C.head, warm);
    K.layer(pick(o.alpha, 1), () => {
      const g = G();
      if (warm > 0) K.glow(x + w / 2, y + (names.length * (h + gap)) / 2, w * 0.55, C.head, 0.12 * warm);
      names.forEach((nm, i) => {
        const sk = c01(show(i)), lf = c01(lift(i)); if (sk <= 0) return;
        const by = y + i * (h + gap) - lf * 50 + (1 - sk) * 20, a = sk * (1 - lf);
        out.push({ x, y: by, w, h });
        K.layer(a, () => {
          K.card(x, by, w, h, { r: 18, fill: K.mixColor(C.tile, palette.wood, 0.25), stroke: edge, lw: 2, glow: 0.5 * warm });
          K.text(nm, x + (o.nums ? 96 : 34), by + h / 2 + 11, { ...type.read, color: C.strong });
          if (o.nums) { const nk = c01(o.nums); K.layer(nk, () => { g.save(); g.fillStyle = K.rgba(C.head, 0.18); g.beginPath(); g.arc(x + 52, by + h / 2, 22, 0, TAU); g.fill(); g.restore(); K.text(String(i + 1), x + 52, by + h / 2 + 10, { font: 'mono', size: 28, weight: 700, color: C.head, align: 'center' }); }); }
          const n = Math.max(2, Math.floor((w - 420) / 110));
          for (let j = 0; j < n; j++) {
            const sw = o.swap && o.swap.i === i && j === 0 ? c01(o.swap.k) : 0;
            paper(x + w - 70 - j * 110, by + h / 2, { w: 90, h: h - 34, lines: 2, alpha: 0.9, edge: sw, kind: sw > 0.5 ? 'note' : 'text' });
          }
        });
      });
    });
    return out;
  }

  // ---------------------------------------------------------------- rooms (13, 16)
  /** a room on the floor plan: card with a title and a mini desk inside. (x, y) top-left. o: {label, lit 0..1, alpha, desk true,
   *  deskS 0.42, tag (small pill under the title), dark 0..1 (lights out: laptop asleep), stroke} */
  function room(t, x, y, w, h, o = {}) {
    const lit = pick(o.lit, 1);
    K.layer(pick(o.alpha, 1), () => {
      K.card(x, y, w, h, { r: 22, fill: K.rgba(C.tile, 0.85), stroke: o.stroke || K.mixColor(C.line2, C.head, 0.7 * lit), glow: 0.35 * lit, lw: 1.5 + lit });
      if (o.label) K.text(o.label, x + w / 2, y + 56, { font: 'head', weight: 700, size: 38, color: K.mixColor(C.soft, C.head, lit), align: 'center', tracking: -0.5 });
      if (o.tag) K.pill(o.tag, x + w / 2, y + 102, { size: 26, color: C.body, alpha: pick(o.tagK, 1) });
      if (o.desk !== false) {
        const top = y + (o.tag ? 132 : 88), bot = y + h - 22, avail = bot - top;
        const ms = Math.min(pick(o.deskS, 0.6), avail / (MINI.bottom - MINI.top), (w - 60) / MINI.w);
        mini(t, x + w / 2, top - MINI.top * ms, ms, { lit: 0.3 + 0.7 * lit, dark: o.dark });
      }
    });
  }

  // ---------------------------------------------------------------- small furniture
  /** a word-piece chip (04 tokens). (x, y) centre. o: {size 40, color, fill, alpha} returns width */
  function chip(s, x, y, o = {}) {
    const size = pick(o.size, 40), w = K.measure(s, { font: 'mono', size, weight: 600 }) + size * 0.9, h = size * 1.6;
    K.layer(pick(o.alpha, 1), () => {
      K.card(x - w / 2, y - h / 2, w, h, { r: 12, fill: o.fill || C.tile, stroke: o.stroke || K.rgba(C.head, 0.6), shadow: false });
      K.text(s, x, y + size * 0.35, { font: 'mono', size, weight: 600, color: o.color || C.strong, align: 'center' });
    });
    return w;
  }
  /** "own lesson · <district>" chip with a map icon. (x, y) = anchor; o: {align 'right' (x = right edge) | 'left' | 'center', k (alpha), prefix 'own lesson'} */
  function shelf(district, x, y, o = {}) {
    const pre = (o.prefix || 'own lesson') + ' · ';
    const to = { font: 'ui', weight: 600, size: 26 };
    const w = 26 + 36 + K.measure(pre, to) + K.measure(district, to) + 26, h = 52;
    const x0 = o.align === 'left' ? x : o.align === 'center' ? x - w / 2 : x - w;
    K.layer(pick(o.k, 1), () => {
      K.card(x0, y - h / 2, w, h, { r: h / 2, fill: C.page, stroke: K.rgba(C.head, 0.4), shadow: false });
      K.icon('map', x0 + 26 + 14, y, 30, { color: C.head, w: 2 });
      K.spans([{ s: pre, color: C.soft }, { s: district, color: C.head }], x0 + 26 + 36, y + 9, to);
    });
    return w;
  }
  /** dated tag, e.g. "Oct 2026" (mono 22, gold, with a small dot). o: {align, alpha, size 22} */
  function dated(s, x, y, o = {}) {
    const size = pick(o.size, 22), to = { font: 'mono', size, weight: 600 }, w = K.measure(s, to) + 18;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    K.layer(pick(o.alpha, 1), () => {
      const g = G(); g.save(); g.fillStyle = C.gold; g.beginPath(); g.arc(x0 + 5, y - size * 0.35, 5, 0, TAU); g.fill(); g.restore();
      K.text(s, x0 + 18, y, { ...to, color: C.gold });
    });
    return w;
  }
  /** status badge for new / uncertain things: 'BETA', 'RESEARCH PREVIEW', 'ROLLING OUT', 'REPORTED'... dashed terracotta pill, uppercase 22.
   *  (x, y) centre. o: {alpha, color} */
  function flag(s, x, y, o = {}) {
    const g = G(), to = { font: 'ui', weight: 700, size: 22, tracking: 2.5, upper: true };
    const w = K.measure(s, to) + 36, h = 40, col = o.color || C.accent;
    K.layer(pick(o.alpha, 1), () => {
      g.save(); K.rr(x - w / 2, y - h / 2, w, h, h / 2); g.fillStyle = K.rgba(col, 0.12); g.fill();
      g.setLineDash([6, 5]); g.strokeStyle = col; g.lineWidth = 2; g.stroke(); g.restore();
      K.text(s, x, y + 8, { ...to, color: col, align: 'center' });
    });
    return w;
  }
  /** "WHERE THE PICTURE BREAKS" beat: eyebrow with a crack mark + one Georgia line. (x, y) = eyebrow baseline, o: {align 'center', k, size 32} */
  function breaks(x, y, line, k, o = {}) {
    const al = o.align || 'center';
    K.layer(c01(k), () => {
      const ew = K.measure('WHERE THE PICTURE BREAKS', { font: 'ui', weight: 600, size: 22, tracking: 4 });
      const ex = al === 'center' ? x - ew / 2 : x;
      const g = G(); g.save(); g.strokeStyle = C.accent; g.lineWidth = 3; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(ex - 40, y - 22); g.lineTo(ex - 30, y - 12); g.lineTo(ex - 38, y - 6); g.lineTo(ex - 26, y + 2); g.stroke(); g.restore();
      K.eyebrow('WHERE THE PICTURE BREAKS', ex, y, { color: C.accent });
      if (line) K.text(line, al === 'center' ? x : x, y + 50, { font: 'read', size: pick(o.size, 32), color: C.strong, align: al, italic: true });
    });
  }
  /** horizontal "context used" status bar (04). (x, y) top-left, w. k = fill 0..1. o: {text (mono 26), alpha} */
  function ctxBar(x, y, w, k, o = {}) {
    const h = 64;
    K.layer(pick(o.alpha, 1), () => {
      K.card(x, y, w, h, { r: 16, fill: C.page, stroke: C.line2 });
      K.card(x + 12, y + h - 18, w - 24, 8, { r: 4, fill: C.line, stroke: false, shadow: false });
      K.card(x + 12, y + h - 18, Math.max(8, (w - 24) * c01(k)), 8, { r: 4, fill: k > 0.8 ? C.accent : C.head, stroke: false, shadow: false });
      if (o.text) K.text(o.text, x + 18, y + 34, { font: 'mono', size: 26, weight: 600, color: C.body });
    });
  }
  /** vertical quality meter (05 "accuracy"). (x, y0 top .. y1 bottom), k = level 0..1. o: {label, alpha} */
  function vbar(x, y0, y1, k, o = {}) {
    const w = 40, h = y1 - y0, lv = c01(k);
    K.layer(pick(o.alpha, 1), () => {
      K.card(x - w / 2, y0, w, h, { r: 20, fill: C.page, stroke: C.line2 });
      const fh = (h - 12) * lv;
      K.card(x - w / 2 + 6, y1 - 6 - fh, w - 12, Math.max(0, fh), { r: 14, fill: K.mixColor(C.accent, C.head, K.clamp(lv * 1.4 - 0.2)), stroke: false, shadow: false });
      if (o.label) K.text(o.label, x, y1 + 44, { ...type.label, color: C.strong, align: 'center' });
    });
  }

  // ---------------------------------------------------------------- myth cards + guest (18, 19)
  /** a myth card that flips to its true side. (x, y) centre. o: {w 560, h 300, n (myth number), front (the myth), back (the true version),
   *  flip 0..1, verdict ('WRONG' | 'MOSTLY' | 'HALF TRUE' | ...), stamp 0..1 (verdict stamp pops on the front), alpha, s} */
  function myth(t, x, y, o = {}) {
    const w = pick(o.w, 560), h = pick(o.h, 300), f = c01(o.flip), sx = Math.abs(Math.cos(f * Math.PI)), back = f > 0.5;
    const tone = M.tone(1);
    K.layer(pick(o.alpha, 1), () => K.at(x, y, pick(o.s, 1), 0, () => {
      const g = G(); g.save(); g.scale(Math.max(0.02, sx), 1 + 0.04 * (1 - sx));
      if (!back) {
        K.card(-w / 2, -h / 2, w, h, { r: 20, fill: C.tile, stroke: C.line2 });
        K.eyebrow('MYTH' + (o.n ? ' ' + o.n : ''), -w / 2 + 34, -h / 2 + 52, { color: C.soft });
        K.para('“' + (o.front || '') + '”', -w / 2 + 34, -h / 2 + 112, w - 68, { font: 'read', size: 34, color: C.strong, lh: 46 });
      } else {
        K.card(-w / 2, -h / 2, w, h, { r: 20, fill: K.mixColor(C.tile, C.head, 0.1), stroke: tone.accent, glow: 0.5, lw: 2 });
        K.icon('check', w / 2 - 50, -h / 2 + 44, 40, { color: tone.accent, w: 4 });
        K.eyebrow(o.backLabel || ('MYTH' + (o.n ? ' ' + o.n : '') + ' · WHAT IS TRUE'), -w / 2 + 34, -h / 2 + 52, { color: tone.accent });
        K.para(o.back || '', -w / 2 + 34, -h / 2 + 108, w - 68, { font: 'ui', weight: 600, size: 32, color: C.strong, lh: 44 });
      }
      g.restore();
      const st = c01(o.stamp);
      if (st > 0 && !back && o.verdict) {
        const sc = 1.35 - 0.35 * K.ease.out(st);
        K.layer(Math.min(1, st * 2) * sx, () => K.at(w / 2 - 120, h / 2 - 56, sc, -0.14, () => {
          const to = { font: 'ui', weight: 700, size: 30, tracking: 4, upper: true }, sw = K.measure(o.verdict, to) + 40;
          g.save(); K.rr(-sw / 2, -28, sw, 56, 10); g.strokeStyle = C.accent; g.lineWidth = 4; g.stroke(); g.restore();
          K.text(o.verdict, 0, 11, { ...to, color: C.accent, align: 'center' });
        }));
      }
    }));
  }
  /** the guest lower-third "guest · June" (x 80..380, y 832..920; the only element allowed that low). k 0..1 slides it in from the left */
  function guest(t, k, o = {}) {
    const kk = c01(k); if (kk <= 0) return;
    const name = o.name || 'June', x = 80 - (1 - K.ease.out(kk)) * 60, y = 832;
    K.layer(kk, () => {
      K.card(x, y, 300, 88, { r: 20, fill: K.rgba(C.page, 0.92), stroke: K.rgba(C.head, 0.7), glow: 0.5 });
      K.card(x, y + 14, 6, 60, { r: 3, fill: C.head, stroke: false, shadow: false });
      K.eyebrow('guest', x + 30, y + 36, { size: 20, color: C.head });
      K.text(name, x + 30, y + 74, { font: 'head', weight: 700, size: 32, color: C.strong });
      K.map.lantern(t, 0, { x: x + 248, y: y + 22, s: 0.8, glowK: 1.6 });
    });
  }
  /** palette accent for the guest segment: gk 0..1 (ease it in on 17's handover, out on 19's 'back').
   *  Returns {lamp (glow colour), glowMul (1 → 1.4), accent (C.accent → C.head), gk} */
  function tone(gk) {
    const k = c01(gk);
    // brighter gold for the guest; every colour returned is a #hex, so K.rgba works on it
    return { gk: k, lamp: mixHex(C.head, '#F7D88F', k), glowMul: 1 + 0.4 * k, accent: mixHex(C.accent, C.head, k) };
  }

  // ---------------------------------------------------------------- layouts
  // Placements checked against the safe area (x 80–1840, y 130–930). Pass to M.stage({ desk: M.desk(L.size, L) , ... }).
  const layout = {
    title: { size: { w: 1000, h: 260 }, cx: 960, cy: 690, lamp: { cordTop: 330 } }, // 01: under the title block (text ends y ~310); desk bottom ~880
    std: { size: 'standard', cx: 960, cy: 600 },     // desk 410..790, clerk ~376, lamp ~200
    low: { size: 'standard', cx: 960, cy: 640 },     // 04: room for the word strip at y 200
    y2021: { size: 'y2021', cx: 960, cy: 620 },      // 03 small desk
    hall: { size: 'hall', cx: 960, cy: 600 },        // x 160..1760, y 340..860 (+ lip/legs to ~916); lamp ~y 150
    mid: { size: 'mid', cx: 960, cy: 620 },          // between door (130..300) and studio (1610..1800): x 340..1580
    left: { size: 'left', cx: 820, cy: 620 },        // 06: x 170..1470, studio at right
    door: { x: 130, y: 340 },                        // API door top-left (170 x 420), pill at y 300
    studio: { x: 1610, y: 340 },                     // studio top-left (190 x 420); well centre (1705, 540) s 150
    dials: { xs: [700, 960, 1220], y: 520, r: 80 },  // 08 (labels at y + r + 44)
    meters: { xs: [330, 750, 1170, 1590], y: 330, r: 110 }, // 12 (tag y ~162, label y 412, field y 452)
    timer: { x: 1640, y: 240, r: 56 },               // 11
    layers: { x: 300, y: 330, w: 1080 },             // 11 cache bands (3 x 96 + gaps -> y 330..654)
    rooms: { y: 260, h: 300, xs: [180, 700, 1220], w: 520 }, // 13: Chat · Cowork · Code
    guest: { x: 80, y: 832, w: 300, h: 88 },         // 18-19 lower-third
    shelf: { x: 1840, y: 880 },                      // shelf chip anchor (right-aligned)
    wellBig: { x: 960, y: 530, s: 600 },             // 07 canvas well (660..1260 x 230..830)
  };
  /** M.desk from a layout entry */
  const at = (L) => desk(L.size, L);

  const M = window.M = {
    palette, type, motion, layout, SIZES,
    desk, lerpDesk, at, spot, drawDesk, wash,
    lamp, clerk, pen, write, ruler, stage, mini,
    MINI, mixHex, paper, file, land, pile, letter,
    door, studio, phone, well, picAt,
    dial, meter, timer, picker, layers, room,
    chip, shelf, dated, flag, breaks, ctxBar, vbar,
    myth, guest, tone,
  };
})();
