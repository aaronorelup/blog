/* 00.06 How to learn anything technical: shared drawing (window.M)
   The lesson's one recurring object is THE CASE FILE: a night-manila folder with a cream case sheet inside and
   FIVE TABS along its top edge (Clue, Search, Rulebook, Briefing, Experiment). It never gets redrawn from scratch:
   scenes move / scale it with M.geo() and light one tab at a time. Around it:
     YOU      (cream person, solid cream lines = your work, your signature),
     the CLERK (00.05's sparkle tile in gold glow, dashed gold lines = its legwork), optionally at a low DESK or on a
              witness STAND,
     the RULEBOOK (official docs window with version pills and a slim /llms.txt edition),
     EVIDENCE cards (error / versions / command / file), CLAIM cards with a verdict, ticks / crosses, the CLOSED stamp.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no Math.random,
   no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const pick = (v, d) => (v == null ? d : v);
  const c01 = (v) => K.clamp(+v || 0);
  // hex-in, hex-out colour mix (K.mixColor returns rgb(), which cannot be mixed again)
  const hx = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (h1, h2, k) => { const a = hx(h1), b = hx(h2), q = K.clamp(k); return '#' + [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * q).toString(16).padStart(2, '0')).join(''); };

  // ---------------------------------------------------------------- palette, type, motion
  // One meaning per colour, the whole lesson long:
  //   gold (C.head)        = lit tab, the clerk and its legwork (dashed gold lines), the lantern
  //   cream (C.strong)     = YOU and your work (solid cream lines, your tick, your signature)
  //   terracotta (C.accent)= warnings, crosses, the CLOSED stamp, attackers. Never decoration.
  //   manila (folder)      = the case file; quiet greys (line2/soft) = unworked tabs, paraphrases, old/dim things
  //   pink                 = K.petals on 01 and 08 only.
  const palette = {
    folder: '#2C2633', folderLow: '#231F2C', tabOff: '#2A2532', folderEdge: '#8C6E45', sheet: '#3A3340', sheetLine: K.rgba(C.paper, 0.10),
    clerk: C.head, you: C.strong, warn: C.accent, stamp: C.accent, off: C.line2, offIcon: '#A89D8B', done: K.rgba(C.head, 0.55),
    wood: '#5B3A26', woodDark: '#3F2918', beam: '#4E3120',
    youDash: null, clerkDash: [12, 11],
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },
    read: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 26 },
    body: { font: 'read', size: 30 },
  };
  const motion = { move: 0.7, light: 0.45, land: 0.6, bob: { speed: 1.5, amp: 3 } };

  // ---------------------------------------------------------------- tabs
  const TABS = [
    { id: 'clue', label: 'Clue', icon: 'warning' },
    { id: 'search', label: 'Search', icon: 'globe' },
    { id: 'rulebook', label: 'Rulebook', icon: 'book' },
    { id: 'briefing', label: 'Briefing', icon: 'chat' },
    { id: 'experiment', label: 'Experiment', icon: 'check' },
  ];
  const TAB_INDEX = { clue: 0, search: 1, rulebook: 2, briefing: 3, experiment: 4 };
  const idx = (i) => (typeof i === 'string' ? TAB_INDEX[i] : i);

  // ---------------------------------------------------------------- file geometry
  const BODY = { w: 800, h: 530 };
  const TAB = { w: 154, h: 92, gap: 6, overlap: 10 };
  // named positions from the storyboard (cx, cy = centre of the folder BODY; tabs sit above it)
  const POS = {
    home: { cx: 960, cy: 595, s: 1 },        // 03: x 560–1360, y 330–860, tabs y ~256–330
    title: { cx: 1440, cy: 560, s: 0.6 },    // 01: x 1200–1680
    room: { cx: 530, cy: 610, s: 0.82 },     // 02: centre-left case room, x 200–860
    side: { cx: 340, cy: 470, s: 0.55 },     // 04: top-left x 120–560
    left: { cx: 530, cy: 610, s: 0.96 },     // 05: x 146–914 (in-tab labels still 26 px)
    corner: { cx: 300, cy: 800, s: 0.45 },   // 06: bottom-left x 120–480
    bench: { cx: 700, cy: 595, s: 1 },       // 07: x 300–1100
    shelf: { cx: 1490, cy: 600, s: 0.5 },    // 08: under the lantern
  };

  /** geometry of the file at (cx, cy) scale s, in SCREEN coords. Pass a POS name or {cx, cy, s}.
   *  returns {cx, cy, s, w, h, x0, y0, x1, y1, tabTop, tabs:[{x, y, w, h, cx, cy, top, label, icon, id}],
   *           sheet:{x, y, w, h}, sign:{x0, x1, y}, stamp:{x, y}, inner:{x, y, w, h}} */
  function geo(a, b, c) {
    let cx, cy, s;
    if (typeof a === 'string') ({ cx, cy, s } = POS[a]);
    else if (typeof a === 'object') ({ cx, cy, s } = a);
    else { cx = a; cy = b; s = pick(c, 1); }
    const w = BODY.w * s, h = BODY.h * s, x0 = cx - w / 2, y0 = cy - h / 2;
    const tw = TAB.w * s, th = TAB.h * s, gap = TAB.gap * s, row = 5 * tw + 4 * gap;
    const tabTop = y0 - th + TAB.overlap * s;
    const tabs = TABS.map((T, i) => {
      const x = cx - row / 2 + i * (tw + gap);
      return { ...T, i, x, y: tabTop, w: tw, h: th, cx: x + tw / 2, cy: tabTop + (th - TAB.overlap * s) / 2, top: tabTop };
    });
    const sheet = { x: x0 + 34 * s, y: y0 + 30 * s, w: w - 68 * s, h: h - 58 * s };
    return {
      cx, cy, s, w, h, x0, y0, x1: x0 + w, y1: y0 + h, tabTop, tabs, sheet,
      inner: { x: sheet.x + 40 * s, y: sheet.y + 70 * s, w: sheet.w - 80 * s, h: sheet.h - 170 * s },
      sign: { x0: sheet.x + 50 * s, x1: sheet.x + sheet.w * 0.52, y: sheet.y + sheet.h - 62 * s },
      stamp: { x: sheet.x + sheet.w - 170 * s, y: sheet.y + sheet.h - 92 * s },
    };
  }
  /** blend two geometries (ease k yourself; motion.move for slides) */
  function lerpGeo(A, B, k) {
    const a = typeof A === 'string' ? POS[A] : A, b = typeof B === 'string' ? POS[B] : B;
    return geo(K.lerp(a.cx, b.cx, k), K.lerp(a.cy, b.cy, k), K.lerp(a.s, b.s, k));
  }

  // tab state value v: 0 = off (unworked), 1 = lit (being worked), 2 = done (worked, keeps a gold tick).
  // Fractions blend (0→1 lights, 1→2 settles). Build it as K.io(t, a) + K.io(t, b).
  function tabLook(v) {
    const lit = v <= 1 ? c01(v) : c01(2 - v); // 0..1..0
    const done = c01(v - 1);
    return { lit, done };
  }

  function tabPath(x, y, w, h, s) {
    const g = G(), r = 14 * s, sl = 6 * s;
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x + sl, y + r);
    g.quadraticCurveTo(x + sl + 2 * s, y, x + sl + r, y);
    g.lineTo(x + w - sl - r, y);
    g.quadraticCurveTo(x + w - sl - 2 * s, y, x + w - sl, y + r);
    g.lineTo(x + w, y + h);
    g.closePath();
  }

  /** one tab at its geometry T (from geo().tabs). v: state value (see tabLook). o: {reveal 0..1, label bool, s, flash 0..1} */
  function drawTab(t, T, v, o = {}) {
    const g = G(), s = o.s || 1, rv = c01(pick(o.reveal, 1));
    if (rv <= 0) return;
    const { lit, done } = tabLook(v), flash = c01(o.flash);
    const rise = (1 - rv) * T.h * 0.7;
    K.layer(rv, () => {
      g.save();
      // glow behind a lit tab
      const glowA = Math.max(lit, flash * 0.8);
      if (glowA > 0) K.glow(T.cx, T.y + T.h * 0.45 + rise, T.w * 0.85, C.head, 0.30 * glowA);
      tabPath(T.x, T.y + rise, T.w, T.h, s);
      const fill = mix(mix(palette.tabOff, '#3A3128', done), '#5E4826', Math.max(lit * 0.95, flash * 0.75));
      g.fillStyle = fill; g.fill();
      g.lineWidth = Math.max(1.5, 2 * s);
      g.strokeStyle = mix(mix('#5A536A', '#9C8455', done), C.head, Math.max(lit, flash));
      g.stroke();
      g.restore();
      // icon + label
      const showLabel = o.label !== false && s >= 0.95;
      const iy = T.y + rise + (showLabel ? 27 * s : (T.h - TAB.overlap * s) / 2);
      const icol = mix(mix(palette.offIcon, C.strong, done * 0.7), C.head, Math.max(lit, flash));
      K.icon(T.icon, T.cx, iy, (showLabel ? 32 : 40) * s, { color: icol, w: Math.max(2, 2.6 * s) });
      if (showLabel) {
        const lc = mix(mix(palette.offIcon, C.strong, done * 0.7), C.head, Math.max(lit, flash));
        K.text(T.label, T.cx, T.y + rise + 70 * s, { font: 'ui', weight: 600, size: Math.max(26, 26 * s), color: lc, align: 'center', tracking: -0.4 });
      }
      // done tick: a small gold disc on the tab's upper right corner
      if (done > 0) {
        const bx = T.x + T.w - 16 * s, by = T.y + rise + 6 * s, br = Math.max(11, 14 * s);
        K.layer(done, () => {
          g.save(); g.beginPath(); g.arc(bx, by, br, 0, 7); g.fillStyle = C.head; g.fill();
          g.lineWidth = 2; g.strokeStyle = C.page; g.stroke(); g.restore();
          K.icon('check', bx, by + 1, br * 1.5, { color: C.page, w: Math.max(2.5, 3 * s) });
        });
      }
    });
  }

  /** the CASE FILE. F = geo(...). o:
   *   tabs: [v0..v4] or {clue: v, ...} or a number for all (state values, see tabLook); default 0
   *   reveal: number | [k0..k4]  tabs pop up (0 hidden .. 1 shown); default 1
   *   flash: [f0..f4]            a one-off glow on a tab (keep-this beats), 0..1
   *   labels: 'auto' | 'in' | 'none' | 'above'   in-tab labels need s >= 0.92 ('auto' does that); 'above' adds a
   *            26 px pill over every LIT tab (use at small scales, one or two at a time)
   *   sheet: 0..1 (the cream case sheet inside; default 1), caseNo: 'CASE 00.06' eyebrow (s >= 0.8 only)
   *   sign: 0..1 signature line draws; signed: 0..1 your scribble; signLabel: 0..1 "you" under the line
   *   stamp: 0..1 CLOSED stamp lands (ease it 'back' for the scene's one overshoot)
   *   glow: 0..1 warm rim, dim: 0..1 (wash it back), alpha
   *   content: fn(F) draws inside the sheet (clipped to it) */
  function drawFile(t, F, o = {}) {
    const g = G(), s = F.s;
    const tv = (i) => {
      const v = o.tabs;
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      if (Array.isArray(v)) return pick(v[i], 0);
      return pick(v[TABS[i].id], 0);
    };
    const rv = (i) => (Array.isArray(o.reveal) ? pick(o.reveal[i], 0) : pick(o.reveal, 1));
    const fl = (i) => (Array.isArray(o.flash) ? pick(o.flash[i], 0) : 0);
    const labels = o.labels || 'auto';
    const inTab = labels === 'in' || (labels === 'auto' && s >= 0.92);
    K.layer(pick(o.alpha, 1), () => {
      // contact shadow
      g.save();
      const sh = g.createRadialGradient(F.cx, F.y1 + 10 * s, 0, F.cx, F.y1 + 10 * s, F.w * 0.6);
      sh.addColorStop(0, 'rgba(4,5,12,.5)'); sh.addColorStop(1, 'rgba(4,5,12,0)');
      g.translate(F.cx, F.y1 + 10 * s); g.scale(1, 0.08); g.translate(-F.cx, -(F.y1 + 10 * s));
      g.fillStyle = sh; g.fillRect(F.x0 - 100, F.y1 - F.w, F.w + 200, F.w * 2); g.restore();
      // back panel (tabs belong to it)
      F.tabs.forEach((T, i) => drawTab(t, T, tv(i), { s, reveal: rv(i), label: inTab, flash: fl(i) }));
      // body
      g.save();
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 70 * s; g.shadowOffsetY = 24 * s;
      K.rr(F.x0, F.y0, F.w, F.h, 22 * s);
      const bg = g.createLinearGradient(0, F.y0, 0, F.y1);
      bg.addColorStop(0, palette.folder); bg.addColorStop(1, palette.folderLow);
      g.fillStyle = bg; g.fill(); g.restore();
      if (o.glow) { g.save(); g.shadowColor = K.rgba(C.head, 0.55 * o.glow); g.shadowBlur = 50 * s; K.rr(F.x0, F.y0, F.w, F.h, 22 * s); g.strokeStyle = K.rgba(C.head, 0.5 * o.glow); g.lineWidth = 3; g.stroke(); g.restore(); }
      g.save(); K.rr(F.x0, F.y0, F.w, F.h, 22 * s); g.lineWidth = Math.max(1.5, 2 * s); g.strokeStyle = K.rgba(C.head, 0.55); g.stroke(); g.restore();
      // the case sheet
      const sk = c01(pick(o.sheet, 1));
      if (sk > 0) {
        const S = F.sheet;
        K.layer(sk, () => {
          g.save();
          g.translate(S.x + S.w / 2, S.y + S.h / 2); g.rotate(-0.006); g.translate(-(S.x + S.w / 2), -(S.y + S.h / 2));
          K.rr(S.x, S.y, S.w, S.h, 10 * s); g.fillStyle = palette.sheet; g.fill();
          g.lineWidth = 1.2; g.strokeStyle = K.rgba(C.paper, 0.14); g.stroke();
          g.save(); K.rr(S.x, S.y, S.w, S.h, 10 * s); g.clip();
          // ruled lines + margin
          for (let y = S.y + 64 * s; y < S.y + S.h - 16 * s; y += 44 * s) K.line(S.x + 18 * s, y, S.x + S.w - 18 * s, y, { color: palette.sheetLine, w: Math.max(1, 1.4 * s) });
          K.line(S.x + 36 * s, S.y + 8 * s, S.x + 36 * s, S.y + S.h - 8 * s, { color: K.rgba(C.accent, 0.16), w: Math.max(1, 1.4 * s) });
          if (o.content) o.content(F);
          g.restore();
          g.restore();
          // case number eyebrow and paperclip
          if (s >= 0.8 && o.caseNo !== false) K.eyebrow(o.caseNo || 'CASE 00.06', S.x + 56 * s, S.y + 46 * s, { size: 22, color: K.rgba(C.head, 0.75) });
          clip(S.x + S.w - 70 * s, S.y - 14 * s, s);
        });
      }
      // signature
      const sg = c01(o.sign), sd = c01(o.signed), sl = c01(pick(o.signLabel, s >= 0.7 ? o.sign : 0));
      if (sg > 0) {
        K.line(F.sign.x0, F.sign.y, F.sign.x1, F.sign.y, { k: sg, color: C.strong, w: Math.max(2, 2.5 * s), alpha: 0.9 });
        K.text('×', F.sign.x0 - 4 * s, F.sign.y - 10 * s, { font: 'ui', size: Math.max(22, 30 * s), color: K.rgba(C.strong, 0.8 * sg), align: 'right' });
      }
      if (sd > 0) scribble(F.sign.x0 + 20 * s, F.sign.y - 10 * s, (F.sign.x1 - F.sign.x0) * 0.62, s, sd);
      if (sl > 0) K.text('you', F.sign.x0, F.sign.y + 38 * s, { font: 'ui', weight: 600, size: Math.max(26, 28 * s), color: K.rgba(C.strong, 0.85 * sl) });
      // stamp
      if (o.stamp != null && o.stamp > 0) stamp(F.stamp.x, F.stamp.y, o.stamp, { s });
      // dim wash
      if (o.dim) { g.save(); g.globalAlpha *= 0.6 * c01(o.dim); g.fillStyle = C.page; K.rr(F.x0 - 4, F.tabTop - 4, F.w + 8, F.y1 - F.tabTop + 8, 22 * s); g.fill(); g.restore(); }
      // callout labels over lit tabs
      if (labels === 'above') F.tabs.forEach((T, i) => {
        const { lit } = tabLook(tv(i)); const a = Math.min(lit, rv(i));
        if (a > 0.02) K.pill(T.label, T.cx, T.top - 30 - (1 - a) * 8, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.6), alpha: a });
      });
    });
  }

  function clip(x, y, s) {
    const g = G();
    g.save(); g.strokeStyle = '#B9AD98'; g.lineWidth = Math.max(2, 3 * s); g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x, y + 60 * s); g.lineTo(x, y + 10 * s); g.arc(x + 10 * s, y + 10 * s, 10 * s, Math.PI, 0); g.lineTo(x + 20 * s, y + 66 * s);
    g.arc(x + 6 * s, y + 66 * s, 14 * s, 0, Math.PI); g.lineTo(x - 8 * s, y + 18 * s);
    g.stroke(); g.restore();
  }

  /** your handwritten signature, drawn left→right with progress k */
  function scribble(x, y, w, s, k) {
    const g = G(); if (k <= 0) return;
    g.save(); g.strokeStyle = C.strong; g.lineWidth = Math.max(2, 3 * s); g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    const n2 = 140, loops = 6, r = 13 * s;
    for (let i = 0; i <= n2 * k; i++) {
      const u = i / n2, ph = u * loops * Math.PI * 2, amp = (0.7 + 0.45 * Math.sin(u * 9.1 + 0.6)) * (u < 0.12 ? 1.25 : 1);
      const px = x + w * u - Math.sin(ph) * r * 0.95;
      const py = y - (1 - Math.cos(ph)) * r * amp + u * 8 * s;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke(); g.restore();
  }

  /** the terracotta CLOSED stamp centred at (x, y). k: land progress (0 = in the air, 1 = landed; 'back' easing ok).
   *  o: {s 1, rot -0.14, text 'CLOSED', alpha} */
  function stamp(x, y, k, o = {}) {
    const g = G(), s = pick(o.s, 1); if (k <= 0) return;
    const sc = s * K.lerp(1.6, 1, Math.min(1.2, k)), a = c01(k * 1.6) * pick(o.alpha, 1);
    const txt = o.text || 'CLOSED', size = 52;
    K.layer(a, () => K.at(x, y, sc, pick(o.rot, -0.14), () => {
      const w = K.measure(txt, { font: 'ui', weight: 700, size, tracking: 8 }) + 64, h = 96;
      g.save();
      g.strokeStyle = C.accent; g.lineWidth = 5; K.rr(-w / 2, -h / 2, w, h, 16); g.stroke();
      g.lineWidth = 2; K.rr(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 10); g.stroke();
      g.restore();
      K.text(txt, 4, 18, { font: 'ui', weight: 700, size, color: C.accent, align: 'center', tracking: 8 });
      // ink wear: a few page-coloured nicks (deterministic)
      const R = K.rng(606);
      g.save(); g.fillStyle = K.rgba(palette.sheet, 0.55);
      for (let i = 0; i < 18; i++) { g.beginPath(); g.arc((R() - 0.5) * w * 0.95, (R() - 0.5) * h * 0.9, 1.5 + R() * 3, 0, 7); g.fill(); }
      g.restore();
    }));
  }

  // ---------------------------------------------------------------- figures
  /** YOU: cream person at (x, y) (centre), size px (120 standard, 90 small). o: {alpha, label 0..1 ('you'), bob, glow} */
  function you(t, x, y, size, o = {}) {
    const g = G(), sz = pick(size, 120);
    const by = o.bob === false ? 0 : K.wave(t, 1.1, 2, 1.3);
    K.layer(pick(o.alpha, 1), () => {
      g.save(); g.fillStyle = 'rgba(4,5,12,.45)'; g.beginPath(); g.ellipse(x, y + sz * 0.5, sz * 0.42, sz * 0.07, 0, 0, 7); g.fill(); g.restore();
      if (o.glow) K.glow(x, y, sz * 0.9, C.strong, 0.12 * o.glow);
      K.icon('person', x, y + by, sz, { color: C.strong, w: Math.max(3, sz * 0.045) });
      const lk = c01(o.label);
      if (lk > 0) K.text(o.labelText || 'you', x, y + sz * 0.5 + 40, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.strong, 0.9 * lk), align: 'center' });
    });
  }

  /** the CLERK (00.05's model): sparkle tile in a soft gold glow, centre (x, y). size px (96 standard, 72 small).
   *  o: {alpha, glow 0..1 (default .8), bob, label 0..1 + labelText ('the clerk'), labelSide 'below'|'right',
   *      ghost (outline only), desk 0..1 (thin desk sliver under it), stand 0..1 (witness stand rises under it), confident 0..1} */
  function clerk(t, x, y, size, o = {}) {
    const sz = pick(size, 96), gl = pick(o.glow, 0.8), conf = c01(o.confident);
    const st = c01(o.stand), lift = st * sz * 0.55;
    const by = (o.bob === false ? 0 : K.wave(t, motion.bob.speed, motion.bob.amp)) - lift;
    K.layer(pick(o.alpha, 1), () => {
      if (st > 0) {
        // witness stand: a small podium whose top meets the clerk's base as it rises
        const g = G(), ground = y + sz * 0.62, top = y + sz * 0.5 - lift + 8, tw = sz * 1.5, bw = sz * 1.9;
        g.save();
        g.beginPath(); g.moveTo(x - tw / 2, top); g.lineTo(x + tw / 2, top); g.lineTo(x + bw / 2, ground); g.lineTo(x - bw / 2, ground); g.closePath();
        const sg = g.createLinearGradient(0, top, 0, ground); sg.addColorStop(0, '#3A3040'); sg.addColorStop(1, '#231F2C');
        g.fillStyle = sg; g.fill(); g.lineWidth = 2; g.strokeStyle = K.rgba(C.head, 0.35 + 0.35 * conf); g.stroke();
        g.restore();
        K.line(x - tw / 2 - 8, top, x + tw / 2 + 8, top, { color: K.rgba(C.head, 0.6 + 0.3 * conf), w: 4 });
      }
      if (o.desk) deskSliver(x - sz * 1.3, y + sz * 0.62, sz * 2.6, { alpha: c01(o.desk) });
      if (gl > 0) K.glow(x, y + by, sz * (1.35 + 0.5 * conf), C.head, (0.22 + 0.12 * conf) * gl);
      if (o.ghost) {
        K.card(x - sz / 2, y + by - sz / 2, sz, sz, { r: sz * 0.28, fill: K.rgba(C.tile, 0.25), stroke: K.rgba(C.head, 0.5), shadow: false });
        K.icon('sparkle', x, y + by, sz * 0.62, { color: C.head, alpha: 0.6 });
      } else {
        K.iconTile('sparkle', x, y + by, sz, { glow: gl * (0.6 + 0.4 * conf), stroke: K.rgba(C.head, 0.55 + 0.3 * conf) });
      }
      const lk = c01(o.label);
      if (lk > 0) {
        const s0 = o.labelText || 'the clerk';
        if (o.labelSide === 'right') K.text(s0, x + sz / 2 + 20, y + by + 10, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.head, lk) });
        else K.text(s0, x, y + sz * 0.5 + 44 + (st > 0 ? sz * 0.12 : 0) + (o.desk ? 56 : 0), { font: 'ui', weight: 600, size: 28, color: K.rgba(C.head, lk), align: 'center' });
      }
    });
  }

  function deskSliver(x, y, w, o = {}) {
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      g.save();
      const lg = g.createLinearGradient(0, y, 0, y + 22);
      lg.addColorStop(0, palette.wood); lg.addColorStop(1, palette.woodDark);
      K.rr(x, y, w, 18, 6); g.fillStyle = lg; g.fill();
      g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5; g.stroke();
      K.line(x + 10, y + 2, x + w - 10, y + 2, { color: K.rgba(C.head, 0.25), w: 2 });
      g.fillStyle = palette.woodDark; K.rr(x + w * 0.08, y + 16, 12, 30, 3); g.fill(); K.rr(x + w * 0.92 - 12, y + 16, 12, 30, 3); g.fill();
      g.restore();
    });
  }

  /** the clerk's DESK, a long low night-wood desk whose surface holds evidence cards. (x, y) = top-left of the surface,
   *  w, h = surface size (h ≥ 120). o: {alpha, lit 0..1 (lamp pool), legs (true)}. returns surface rect {x, y, w, h} */
  function desk(x, y, w, h, o = {}) {
    const g = G(), lip = 20, inset = Math.min(30, w * 0.03), lit = pick(o.lit, 0.8);
    K.layer(pick(o.alpha, 1), () => {
      g.save();
      if (o.legs !== false) { g.fillStyle = palette.woodDark; K.rr(x + w * 0.05, y + h + lip - 4, 16, 34, 4); g.fill(); K.rr(x + w * 0.95 - 16, y + h + lip - 4, 16, 34, 4); g.fill(); }
      const lg = g.createLinearGradient(0, y + h, 0, y + h + lip);
      lg.addColorStop(0, palette.beam); lg.addColorStop(1, palette.woodDark);
      K.rr(x, y + h - 6, w, lip + 6, 8); g.fillStyle = lg; g.fill();
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 50; g.shadowOffsetY = 16;
      g.beginPath(); g.moveTo(x + inset, y); g.lineTo(x + w - inset, y); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath();
      const tg = g.createLinearGradient(0, y, 0, y + h);
      tg.addColorStop(0, palette.woodDark); tg.addColorStop(1, palette.wood);
      g.fillStyle = tg; g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5; g.stroke();
      g.clip();
      if (lit > 0) {
        g.translate(x + w / 2, y + h * 0.45); g.scale(1, (h / w) * 1.6);
        const pg = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.55);
        pg.addColorStop(0, K.rgba(C.head, 0.24 * lit)); pg.addColorStop(1, K.rgba(C.head, 0));
        g.fillStyle = pg; g.fillRect(-w, -w, w * 2, w * 2);
      }
      g.restore();
      K.line(x + 12, y + h - 2, x + w - 12, y + h - 2, { color: K.rgba(C.head, 0.25), w: 2 });
    });
    return { x: x + inset, y, w: w - 2 * inset, h };
  }

  // ---------------------------------------------------------------- lines of work
  /** the clerk's legwork: dashed gold hops over the tops of tabs. F = geo(); upto: last tab index (0..4) or id;
   *  k 0..1 progress over the whole path. o: {from: {x, y} (start, e.g. the clerk), first (0), lift (px, 46*s), alpha, color, dash, w, dots true} */
  function legwork(F, k, o = {}) { hops(F, k, { color: C.head, dash: palette.clerkDash, ...o }); }
  /** your work: same path, solid cream */
  function yourwork(F, k, o = {}) { hops(F, k, { color: C.strong, dash: null, ...o }); }
  function hops(F, k, o) {
    const g = G(); k = c01(k); if (k <= 0) return;
    const first = idx(pick(o.first, 0)), last = idx(pick(o.upto, 4)), lift = pick(o.lift, 40 * F.s);
    const pts = [], dir = last >= first ? 1 : -1;
    if (o.from) pts.push([o.from.x, o.from.y]);
    for (let i = first; dir > 0 ? i <= last : i >= last; i += dir) pts.push([F.tabs[i].cx - 14 * F.s, F.tabs[i].top - 18 * F.s]);
    // sample a chain of arcs (the leg from `from` bends gently, the hops between tabs arc by `lift`)
    const P = [];
    for (let j = 0; j < pts.length - 1; j++) {
      const [x1, y1] = pts[j], [x2, y2] = pts[j + 1];
      const far = o.from && j === 0, cx = (x1 + x2) / 2, cy = far ? Math.min(y1, y2) - 30 : Math.min(y1, y2) - lift;
      for (let i = 0; i <= 24; i++) { const u = i / 24; if (j && !i) continue; P.push([(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2, j + u]); }
    }
    if (P.length < 2) return;
    const nShow = Math.max(2, Math.round(P.length * k));
    K.layer(pick(o.alpha, 1), () => {
      g.save(); g.strokeStyle = o.color; g.lineWidth = o.w || 3; g.lineCap = 'round'; g.lineJoin = 'round';
      if (o.dash) g.setLineDash(o.dash);
      g.beginPath(); for (let i = 0; i < nShow; i++) i ? g.lineTo(P[i][0], P[i][1]) : g.moveTo(P[i][0], P[i][1]);
      g.stroke(); g.restore();
      if (o.dots !== false) {
        const reached = P[nShow - 1][2];
        pts.forEach(([x, y], j) => { if (j === 0 && o.from) return; if (reached >= j - 0.001) { g.save(); g.fillStyle = o.color; g.beginPath(); g.arc(x, y, Math.max(4, 6 * F.s), 0, 7); g.fill(); g.restore(); } });
      }
    });
  }

  /** a dashed gold line from the clerk to (x2, y2) (k = progress). o: K.arrow opts (bend, head, alpha) */
  function clerkLine(x1, y1, x2, y2, k, o = {}) { K.arrow(x1, y1, x2, y2, { k, color: C.head, w: 3, dash: palette.clerkDash, headSize: 14, ...o }); }
  /** a solid cream line of yours */
  function youLine(x1, y1, x2, y2, k, o = {}) { K.arrow(x1, y1, x2, y2, { k, color: C.strong, w: 3, headSize: 14, ...o }); }

  /** the loop arrow: Experiment back over the top to Clue (k = progress). o: {lift (px above tab tops, 120*s), alpha} */
  function loop(F, k, o = {}) {
    const a = F.tabs[4], b = F.tabs[0], lift = pick(o.lift, 120 * F.s);
    K.arrow(a.cx, a.top - 10, b.cx, b.top - 10, { k, bend: lift * 2, color: K.rgba(C.head, 0.85), w: 3, headSize: 15, alpha: pick(o.alpha, 1) });
  }

  /** a tick you draw (cream by default) at (x, y), size px, progress k. o: {color, w, disc (filled backing)} */
  function tick(x, y, size, k, o = {}) {
    const g = G(); k = c01(k); if (k <= 0) return;
    const s = size, col = o.color || C.strong;
    if (o.disc) { g.save(); g.globalAlpha *= Math.min(1, k * 2); g.beginPath(); g.arc(x, y, s * 0.55, 0, 7); g.fillStyle = K.rgba(col, 0.14); g.fill(); g.strokeStyle = K.rgba(col, 0.6); g.lineWidth = 2; g.stroke(); g.restore(); }
    const P = [[x - s * 0.3, y], [x - s * 0.08, y + s * 0.22], [x + s * 0.32, y - s * 0.22]];
    const L1 = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), L2 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]);
    const d = k * (L1 + L2);
    g.save(); g.strokeStyle = col; g.lineWidth = o.w || Math.max(3, s * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(P[0][0], P[0][1]);
    if (d <= L1) g.lineTo(K.lerp(P[0][0], P[1][0], d / L1), K.lerp(P[0][1], P[1][1], d / L1));
    else { g.lineTo(P[1][0], P[1][1]); g.lineTo(K.lerp(P[1][0], P[2][0], (d - L1) / L2), K.lerp(P[1][1], P[2][1], (d - L1) / L2)); }
    g.stroke(); g.restore();
  }
  /** a terracotta cross at (x, y), size px, progress k (two strokes). o: {color, w, disc} */
  function cross(x, y, size, k, o = {}) {
    const g = G(); k = c01(k); if (k <= 0) return;
    const s = size * 0.28, col = o.color || C.accent;
    if (o.disc) { g.save(); g.globalAlpha *= Math.min(1, k * 2); g.beginPath(); g.arc(x, y, size * 0.55, 0, 7); g.fillStyle = K.rgba(col, 0.14); g.fill(); g.strokeStyle = K.rgba(col, 0.6); g.lineWidth = 2; g.stroke(); g.restore(); }
    const k1 = c01(k * 2), k2 = c01(k * 2 - 1);
    K.line(x - s, y - s, x + s, y + s, { k: k1, color: col, w: o.w || Math.max(3, size * 0.1) });
    K.line(x + s, y - s, x - s, y + s, { k: k2, color: col, w: o.w || Math.max(3, size * 0.1) });
  }

  // ---------------------------------------------------------------- evidence, claims, rulebook
  const EVID = {
    error: { icon: 'warning', eyebrow: 'the exact error', color: C.accent },
    versions: { icon: 'gear', eyebrow: 'your versions', color: C.head },
    command: { icon: 'terminal', eyebrow: 'the command', color: C.head },
    file: { icon: null, eyebrow: 'the file', color: C.head },
    note: { icon: 'chat', eyebrow: 'note', color: C.head },
  };
  /** an EVIDENCE card, top-left (x, y). o: {kind 'error'|'versions'|'command'|'file'|'note', text (mono), eyebrow,
   *  w (360), alpha, lit 0..1 (gold rim), rot}. Height 112. returns {w, h} */
  function evidence(x, y, o = {}) {
    const E = EVID[o.kind || 'note'], h = 112;
    const w = Math.max(pick(o.w, 300), K.measure(o.text || '', type.mono) + 116, K.measure((o.eyebrow || E.eyebrow).toUpperCase(), { font: 'ui', weight: 600, size: 20, tracking: 4 }) + 116);
    K.layer(pick(o.alpha, 1), () => K.at(x + w / 2, y + h / 2, 1, pick(o.rot, 0), () => {
      const X = -w / 2, Y = -h / 2, lit = c01(o.lit);
      K.card(X, Y, w, h, { r: 16, fill: '#262333', stroke: mix(C.line2, C.head, lit * 0.8), glow: lit * 0.5 });
      if (E.icon) K.icon(E.icon, X + 44, Y + h / 2, 40, { color: E.color });
      else K.file(X + 44, Y + h / 2, 52, { ext: 'py' });
      K.eyebrow(o.eyebrow || E.eyebrow, X + 84, Y + 40, { size: 20 });
      const tw = w - 104;
      K.text(o.text || '', X + 84, Y + 82, { font: 'mono', weight: 600, size: 26, color: C.strong, maxW: tw });
    }));
    return { w, h };
  }

  /** a CLAIM card (06's confident answers), top-left (x, y). o: {text (mono 28), label (Karla 26 soft, under),
   *  w (480), verdict 'cross'|'check'|'warn', vk 0..1 (verdict draws), alpha, textColor}. Height 128 with label, 84 without. */
  function claim(x, y, o = {}) {
    const w = pick(o.w, 480), h = o.label ? 128 : 84;
    K.layer(pick(o.alpha, 1), () => {
      const vk = c01(o.vk), bad = o.verdict === 'cross' || o.verdict === 'warn';
      K.card(x, y, w, h, { r: 18, fill: '#242130', stroke: mix(C.line2, bad ? C.accent : C.head, vk * 0.7) });
      K.text(o.text || '', x + 28, y + 52, { font: 'mono', weight: 600, size: 28, color: o.textColor || C.strong, maxW: w - 110 });
      if (o.label) K.text(o.label, x + 28, y + 98, { font: 'ui', weight: 600, size: 26, color: C.soft });
      const vx = x + w - 46, vy = y + h / 2;
      if (o.verdict === 'cross') cross(vx, vy, 52, vk, { disc: true });
      else if (o.verdict === 'check') tick(vx, vy, 52, vk, { disc: true, color: C.head });
      else if (o.verdict === 'warn' && vk > 0) K.icon('warning', vx, vy, 46, { color: C.accent, alpha: vk });
    });
    return { w, h };
  }

  /** the RULEBOOK: the official docs window for your version. (x, y, w, h) like K.win. o: {t, url ('docs.example.dev/v3'),
   *  versions (['v2.x', 'v3.x']), current (index lit, default last), litK 0..1 (current version glows), title ('Official docs'),
   *  edition 0..1 (slim /llms.txt edition slides out from behind the right edge), alpha, focus, lines 0..1 (text bars draw)}
   *  returns {content, edition:{x, y, w, h} (the slim book's rect, for arrows)} */
  function rulebook(x, y, w, h, o = {}) {
    const ed = c01(o.edition);
    let rect = null;
    // the slim /llms.txt edition: a thin book lying flat that slides DOWN out from behind the window's bottom edge
    const ew = 300, eh = 66, ex = x + 36, ey = y + h - eh - 6 + ed * (eh + 18);
    K.layer(pick(o.alpha, 1), () => {
      if (ed > 0) {
        K.card(ex, ey, ew, eh, { r: 12, fill: '#2E2838', stroke: K.rgba(C.head, 0.8), glow: 0.4 * ed, shadow: false });
        K.line(ex + 18, ey + 12, ex + 18, ey + eh - 12, { color: K.rgba(C.head, 0.5), w: 3 });
        K.line(ex + 28, ey + 12, ex + 28, ey + eh - 12, { color: K.rgba(C.head, 0.25), w: 2 });
        K.text('/llms.txt', ex + 46, ey + eh / 2 + 10, { font: 'mono', weight: 600, size: 28, color: C.head });
        K.icon('sparkle', ex + ew - 34, ey + eh / 2, 30, { color: C.head, alpha: 0.85 });
      }
      rect = K.win(x, y, w, h, { kind: 'browser', title: o.title || 'Official docs', titleSize: 26, url: o.url || 'docs.example.dev/v3', focus: o.focus });
      const R = rect, vs = o.versions || ['v2.x', 'v3.x'], cur = pick(o.current, vs.length - 1), lk = c01(pick(o.litK, 1));
      const narrow = R.w < 620;
      K.icon('book', R.x + 46, R.y + 50, 52, { color: C.head });
      K.text(o.heading || 'Reference', R.x + 90, R.y + 62, { font: 'head', weight: 700, size: 34, color: C.head });
      // version pills: right of the heading, or on their own row in a narrow window
      let px = R.x + R.w - 30; const py = narrow ? R.y + 116 : R.y + 50;
      if (narrow) px = R.x + 34 + vs.reduce((a2, v) => a2 + K.measure(v, { font: 'mono', size: 26, weight: 600 }) + 48, -12);
      for (let i = vs.length - 1; i >= 0; i--) {
        const pw = K.measure(vs[i], { font: 'mono', size: 26, weight: 600 }) + 36;
        const on = i === cur ? lk : 0;
        K.pill(vs[i], px - pw / 2, py, { size: 26, font: 'mono', color: mix(C.soft, C.page, on), fill: mix(C.tile, C.head, on), stroke: mix(C.line2, C.head, on), glow: on * 0.5 });
        px -= pw + 12;
      }
      const lines = c01(pick(o.lines, 1)), ws = [0.86, 0.72, 0.8, 0.55, 0.78, 0.66], l0 = narrow ? 176 : 112;
      for (let i = 0; i < ws.length; i++) {
        const ly = R.y + l0 + i * 34; if (ly > R.y + R.h - 24) break;
        K.line(R.x + 34, ly, R.x + 34 + (R.w - 68) * ws[i], ly, { k: c01(lines * 1.4 - i * 0.08), color: K.rgba(C.body, 0.28), w: 10 });
      }
    });
    return { content: rect, edition: { x: ex, y: ey, w: ew, h: eh, cx: ex + ew / 2, cy: ey + eh / 2 } };
  }

  /** a dated chip (sources and versions on screen): mono 26 gold-ish pill centred at (x, y). o: {alpha, color} returns width */
  function dated(s, x, y, o = {}) {
    return K.pill(s, x, y, { size: 26, font: 'mono', color: o.color || C.head, stroke: K.rgba(C.head, 0.45), fill: '#1C1B2A', alpha: o.alpha });
  }

  /** a vertical legend of the five tabs (for small-scale files, e.g. the title card): rows of icon + label at (x, y),
   *  states like drawFile's tabs. o: {gap 54, size 30, alpha, reveal} */
  function tabLegend(x, y, tabs, o = {}) {
    const gap = pick(o.gap, 54), size = pick(o.size, 30);
    K.layer(pick(o.alpha, 1), () => TABS.forEach((T, i) => {
      const v = Array.isArray(tabs) ? pick(tabs[i], 0) : (typeof tabs === 'number' ? tabs : 0);
      const rv = Array.isArray(o.reveal) ? pick(o.reveal[i], 0) : pick(o.reveal, 1);
      if (rv <= 0) return;
      const { lit, done } = tabLook(v), col = mix(mix(C.soft, C.body, done), C.head, lit);
      K.layer(rv, () => {
        K.icon(T.icon, x + 18, y + i * gap - size * 0.32, size * 1.1, { color: col });
        K.text(T.label, x + 50, y + i * gap, { font: 'ui', weight: 600, size, color: col });
      });
    }));
  }

  const M = {
    palette, type, motion, TABS, TAB_INDEX, POS, BODY, TAB,
    geo, lerpGeo, tabLook, drawFile, drawTab, stamp, scribble,
    you, clerk, desk, deskSliver,
    legwork, yourwork, clerkLine, youLine, loop, tick, cross,
    evidence, claim, rulebook, dated, tabLegend,
    layout: POS,
  };
  window.M = M;
})();
