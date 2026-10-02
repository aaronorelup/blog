/* 04 — Tokens, and a desk that grew.
   The token ruler on the desk's near edge, and the desk growing from ~2K (2020) to 1M (Oct 2026).
   Beats: tokens (un|believ|able drops onto the ruler) · all-counts (six things land, the ruler fills) ·
   growth (dated timeline, desk 420 → 800 → hall) · meter (app status bar) · compare (same sentence,
   different counts) · breaks (no clerk stays: fresh copies read the whole desk at once). */
SCENE('04', (t, S) => {
  const C = K.C, L = M.layout;
  K.bg();

  // ------------------------------------------------------------------ timing (cues + spoken words)
  const T = {
    tok: S.cue('tokens', 2.36), piece: S.find('piece', 0, 3.3), rough: S.find('roughly', 0, 4.5), billed: S.find('limited', 0, 7.4),
    all: S.cue('all-counts', 10.47), hidden: S.find('hidden', 0, 13.4), msg: S.find('message', 0, 15.5),
    files: S.find('files', 0, 17.0), images: S.find('images', 0, 17.5), tool: S.find('result', 0, 18.7), think: S.find('thinking', 0, 20.4),
    grow: S.cue('growth', 22.98), y20: S.find('About', 0, 24.65), y23: S.find('hundred', 0, 28.85),
    y24: S.find('million', 0, 32.65), y26: S.find('today', 0, 35.65),
    meter: S.cue('meter', 39.74), mword: S.find('meter', 0, 40.6), used: S.find('context', 0, 41.64), left2: S.find('context', 1, 43.34),
    cmp: S.cue('compare', 45.42), cmpWord: S.find('compare', 0, 47.85), newer: S.find('Newer', 0, 49.85), third: S.find('third', 0, 52.05),
    brk: S.cue('breaks', 54.5), clerkW: S.find('clerk', 0, 56.14), each: S.find('Each', 0, 57.45), copy: S.find('copy', 0, 58.95),
    whole: S.find('whole', 0, 60.15),
  };
  const io = K.io;

  // ------------------------------------------------------------------ the desk: hall (03's exit) → low standard → 2021 → 800 → hall
  const HALL = M.at(L.hall), LOW = M.at(L.low);
  const TINY = M.desk('y2021', { cx: 960, cy: 660 });
  const W800 = M.desk({ w: 800, h: 320 }, { cx: 960, cy: 660 });
  const HALLG = M.desk('hall', { cx: 960, cy: 660 });     // hall desk lowered under the timeline card
  const G = M.motion.grow;
  let D = M.lerpDesk(HALL, LOW, io(t, 0.2, G));
  D = M.lerpDesk(D, TINY, io(t, T.grow + 0.3, G));
  D = M.lerpDesk(D, W800, io(t, T.y23, G));
  D = M.lerpDesk(D, HALLG, io(t, T.y24, G));
  D = M.lerpDesk(D, HALL, io(t, T.meter, G));

  // growth layout factor: the timeline card shows, the lamp hangs from under it
  const gL = io(t, T.grow, 0.6) * (1 - io(t, T.meter - 0.3, 0.6));
  const clerkY = D.y0 - 34;
  const lampDef = clerkY - 52 - 44 - 38 * 1.3;
  const lampY = K.lerp(lampDef, Math.max(lampDef, 252), gL);
  const cordTop = K.lerp(lampDef - 60, 238, gL);

  // ------------------------------------------------------------------ ruler geometry (mirrors M.ruler)
  const rulerGeo = (Dd, cnt, below) => {
    const cw = cnt ? K.measure(cnt, { font: 'mono', size: 30, weight: 600 }) + 48 : 0;
    const xa = Dd.x0 + 30, xb = Dd.x1 - 30 - (cnt && !below ? cw + 14 : 0);
    return { n: Math.max(1, Math.floor((xb - xa + 6) / 20)), xa, y: Dd.y1 - 30 };
  };

  // counter: none until the 2020 tick, then the desk's capacity
  let count = '', countAt = 'end', countK = 0;
  if (t >= T.y20 && t < T.y23) { count = '~2K'; countAt = 'below'; countK = io(t, T.y20, 0.4) * (1 - io(t, T.y23 - 0.25, 0.25)); }
  else if (t >= T.y23 && t < T.y24) { count = '100K'; countK = io(t, T.y23 + 0.3, 0.4) * (1 - io(t, T.y24 - 0.25, 0.25)); }
  else if (t >= T.y24) { count = '1M'; countK = io(t, T.y24 + 0.3, 0.4); }

  // ------------------------------------------------------------------ tokens beat: un|believ|able
  const PARTS = ['un', 'believ', 'able'];
  const chipW = (s) => K.measure(s, { font: 'mono', size: 40, weight: 600 }) + 36;
  const split = io(t, T.piece, 0.5);
  const gap = 18 * split;
  const ws = PARTS.map(chipW), total = ws.reduce((a, b) => a + b, 0) + gap * 2;
  const stripX = 540, stripY = 252;
  const rg0 = rulerGeo(LOW, '', false);
  const drop0 = T.billed + 0.2;
  const chipLanded = (i) => io(t, drop0 + i * 0.15 + 0.62, 0.15);

  // ------------------------------------------------------------------ the six things on the desk
  const ITEMS = [
    { key: 'hidden', u: 0.12, v: 0.1, label: 'hidden instructions', sq: 6 },
    { key: 'msg', u: 0.5, v: 0.1, label: 'messages', sq: 6 },
    { key: 'files', u: 0.88, v: 0.1, label: 'files', sq: 9 },
    { key: 'images', u: 0.12, v: 0.62, label: 'images', sq: 7 },
    { key: 'tool', u: 0.5, v: 0.62, label: 'tool results', sq: 6 },
    { key: 'think', u: 0.88, v: 0.62, label: 'thinking + reply', sq: 6 },
  ];
  const drawItem = (key, x, y) => {
    if (key === 'hidden') M.paper(x, y, { w: 120, h: 72, kind: 'note', pinned: true, lines: 2 });
    else if (key === 'msg') { M.paper(x - 32, y - 6, { kind: 'msg', w: 100, h: 54, lines: 2 }); M.paper(x + 30, y + 10, { kind: 'msg', w: 100, h: 54, lines: 2 }); }
    else if (key === 'files') M.file(x, y, 84, { ext: 'pdf' });
    else if (key === 'images') M.file(x, y, 84, { ext: 'png' });
    else if (key === 'tool') M.paper(x, y, { kind: 'tool', w: 120, h: 72, lines: 2 });
    else if (key === 'think') {
      M.paper(x, y, { w: 120, h: 72, lines: 1 });
      for (let i = 0; i < 4; i++) K.card(x - 44 + i * 20, y + 8, 14, 14, { r: 3, fill: C.head, stroke: false, shadow: false });
      M.pen(x + 40, y + 22, { s: 0.6 });
    }
  };
  // phase A (all-counts): each lands on its word, from the nearest edge, with a label
  const itemsAOut = io(t, T.grow, 0.5);
  // phase B (meter onwards): all land together on the hall desk, no labels
  const landB = T.meter + 0.25;
  const dimK = io(t, T.cmp, 0.5) * (1 - io(t, T.brk, 0.6));

  // ruler fill
  let fillSq = 0;
  for (let i = 0; i < 3; i++) fillSq += chipLanded(i);
  ITEMS.forEach((it) => { fillSq += it.sq * io(t, T[it.key] + 0.2, 0.5); });
  let fill = (fillSq / rg0.n) * (1 - io(t, T.grow, 0.6));
  const pctB = K.lerp(38, 41, io(t, T.left2 + 0.5, 0.6));
  fill += (pctB / 100) * io(t, landB + 0.3, 0.7);

  // ------------------------------------------------------------------ breaks: ghost copies + pulses (drawn before the desk: feet hidden)
  const GH = [{ x: 720, at: T.each }, { x: 960, at: T.copy }, { x: 1200, at: T.whole }];
  let pulse = 0;
  GH.forEach((g) => {
    const a = K.env(t, g.at, g.at + 1.5, 0.3);
    if (a > 0) M.clerk(t, g.x, clerkY, { ghost: true, alpha: a });
    pulse = Math.max(pulse, io(t, g.at + 0.1, 0.25) * (1 - io(t, g.at + 0.45, 0.6)));
  });
  const clerkA = Math.max(0, 1 - io(t, T.clerkW, 0.5) + io(t, T.whole + 1.0, 0.6));

  // 2026 tick: a short warm glow on the desk
  const tickGlow = io(t, T.y26, 0.3) * (1 - io(t, T.y26 + 0.8, 1.0));

  // ------------------------------------------------------------------ the workspace
  M.stage(t, {
    desk: D,
    lamp: { y: lampY, cordTop },
    clerk: { alpha: clerkA },
    deskGlow: Math.max(tickGlow, pulse * 0.8),
    wash: pulse > 0 ? { color: C.head, a: 0.16 * pulse } : undefined,
    ruler: { fill, count, countAt, countK, alpha: 1 },
  });

  // items on the desk
  if (t < T.meter + 0.1) {
    if (itemsAOut < 1) K.layer(1 - itemsAOut, () => {
      ITEMS.forEach((it, i) => {
        const t0 = T[it.key];
        if (t < t0) return;
        const p = M.spot(D, it.u, it.v);
        const col = i % 3;
        const fx = col === 0 ? p.x - 260 : col === 2 ? p.x + 260 : p.x;
        const fy = col === 1 ? p.y + 220 : p.y;
        const L1 = M.land(t, t0, p.x, p.y, fx, fy);
        K.layer(L1.a, () => drawItem(it.key, L1.x, L1.y));
        K.text(it.label, p.x, p.y + 74, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: io(t, t0 + 0.25, 0.4) });
      });
    });
  } else {
    K.layer(1 - 0.7 * dimK, () => {
      ITEMS.forEach((it) => {
        const p = M.spot(D, it.u, it.v);
        const L1 = M.land(t, landB, p.x, p.y, p.x, p.y + 160);
        K.layer(L1.a, () => drawItem(it.key, L1.x, L1.y));
      });
      // one more message lands while the meter ticks up
      if (t >= T.left2) {
        const p = M.spot(D, 0.68, 0.92);
        const L1 = M.land(t, T.left2, p.x, p.y, p.x + 300, p.y);
        K.layer(L1.a, () => M.paper(L1.x, L1.y, { kind: 'msg', w: 110, h: 54, lines: 2 }));
      }
    });
  }

  // ------------------------------------------------------------------ tokens: the word strip, then the chips drop onto the ruler
  const stripA = io(t, T.tok, 0.5);
  if (stripA > 0 && t < drop0 + 1.5) {
    // the whole word first, then it splits into three chips
    if (split < 1) K.layer(stripA * (1 - io(t, T.piece, 0.2)), () => M.chip('unbelievable', stripX, stripY, { size: 40 }));
    let x = stripX - total / 2;
    PARTS.forEach((s, i) => {
      const cx = x + ws[i] / 2; x += ws[i] + gap;
      const k = io(t, drop0 + i * 0.15, 0.7, 'io');
      if (k >= 1) return;
      const tx = rg0.xa + i * 20 + 7, ty = rg0.y;
      const px = K.lerp(cx, tx, k), py = K.lerp(stripY, ty, k) - Math.sin(Math.PI * k) * 60;
      const sc = K.lerp(1, 0.22, k);
      K.layer(stripA * io(t, T.piece, 0.2) * (1 - K.clamp((k - 0.8) / 0.2)), () =>
        K.at(px, py, sc, 0, () => M.chip(s, 0, 0, { size: 40, fill: M.mixHex(C.tile, '#3A3020', k), stroke: K.rgba(C.head, 0.6 + 0.4 * k) })));
    });
  }
  // caption
  const capA = io(t, T.rough, 0.5) * (1 - io(t, drop0 - 0.35, 0.35));
  if (capA > 0) K.pill('≈ 4 characters of English', stripX, stripY + 92, { size: 26, color: C.body, alpha: capA });

  // ------------------------------------------------------------------ growth: the dated timeline card
  if (gL > 0) K.layer(gL, () => {
    K.card(160, 132, 1600, 104, { r: 20, fill: K.rgba(C.page, 0.94), stroke: C.line2 });
    K.eyebrow('CONTEXT WINDOW', 196, 172);
    M.dated('Oct 2026', 1724, 172, { align: 'right' });
    const TK = [
      { x: 200, s: '2020 · ~2K', at: T.y20 },
      { x: 480, s: '2023 · 100K · Claude', at: T.y23 },
      { x: 900, s: '2024 · 1M · Gemini', at: T.y24 },
      { x: 1300, s: '2026 · 1M · Claude', at: T.y26 },
    ];
    const g = K.ctx();
    TK.forEach((k, i) => {
      const on = io(t, k.at, 0.4);
      const cur = i === TK.length - 1 ? on : on * (1 - io(t, TK[i + 1].at, 0.4));
      if (cur > 0) K.glow(k.x, 208, 34, C.head, 0.5 * cur);
      g.save(); g.fillStyle = M.mixHex(C.line2, C.head, on); g.beginPath(); g.arc(k.x, 208, 7, 0, Math.PI * 2); g.fill(); g.restore();
      const col = M.mixHex(M.mixHex(C.quiet, C.body, on), C.strong, cur);
      K.text(k.s, k.x + 18, 217, { font: 'mono', size: 26, weight: 600, color: col, alpha: 0.55 + 0.45 * on });
    });
  });

  // ------------------------------------------------------------------ meter: the app's status bar
  const barK = io(t, T.mword, 0.6, 'out') * (1 - io(t, T.cmp, 0.5));
  if (barK > 0) {
    const p = Math.round(pctB);
    const txtA = io(t, T.used, 0.4);
    M.ctxBar(1240 + (1 - barK) * 80, 180, 560, (p / 100) * io(t, T.mword + 0.3, 0.8), { alpha: barK, text: txtA > 0 ? `context: ${p}% used · ${100 - p}% left` : '' });
  }

  // ------------------------------------------------------------------ compare: same sentence, different counts
  const cmpOut = io(t, T.brk, 0.6);
  if (t >= T.cmp && cmpOut < 1) K.layer(1 - cmpOut, () => {
    const card = (cx, t0, label, nFull, nExtra, tExtra) => {
      const L1 = M.land(t, t0, cx, 560, cx < 960 ? cx - 260 : cx + 260, 560);
      if (t < t0) return;
      K.layer(L1.a, () => {
        const x = L1.x, y = L1.y;
        M.paper(x, y, { w: 620, h: 240, lines: 0 });
        K.text('The desk is measured in tokens.', x, y - 56, { font: 'read', size: 30, color: C.ink, align: 'center' });
        const n = nFull + nExtra, cell = 26, gp = 8, x0 = x - (n * (cell + gp) - gp) / 2;
        for (let i = 0; i < n; i++) {
          const at = i < nFull ? t0 + 0.4 + i * 0.07 : tExtra + (i - nFull) * 0.15;
          const k = io(t, at, 0.25, 'out');
          if (k <= 0) continue;
          if (i >= nFull) K.glow(x0 + i * (cell + gp) + cell / 2, y + 2, 30, C.head, 0.5 * k * (1 - io(t, tExtra + 1.2, 0.8)));
          K.card(x0 + i * (cell + gp), y - 11 - (1 - k) * 6, cell, cell, { r: 5, fill: C.head, stroke: K.rgba(C.ink, 0.5), shadow: false, alpha: k });
        }
        K.text(label, x, y + 76, { font: 'mono', size: 26, weight: 600, color: C.ink, align: 'center', alpha: io(t, t0 + 0.5, 0.4) });
      });
    };
    card(560, T.cmp + 0.3, 'older Claude · 100 tokens', 10, 0, 0);
    card(1360, T.newer, 'newer Claude · up to ~135', 10, 3, T.third);
    K.pill("counts don't compare", 960, 770, { size: 30, color: C.accent, stroke: K.rgba(C.accent, 0.6), fill: C.page, alpha: io(t, T.cmpWord, 0.4) });
  });

  // ------------------------------------------------------------------ breaks: no clerk stays
  const bk = io(t, T.brk, 0.6) * (1 - io(t, S.dur - 0.2, 0.6));
  if (bk > 0) {
    M.breaks(200, 172, '', bk, { align: 'left' });
    K.layer(bk, () => {
      K.text('No clerk stays.', 200, 224, { font: 'read', size: 32, color: C.strong, italic: true, alpha: io(t, T.clerkW - 0.2, 0.5) });
      K.text('Each reply: a fresh copy.', 200, 272, { font: 'read', size: 32, color: C.strong, italic: true, alpha: io(t, T.each, 0.5) });
    });
  }
});
