/* 11 — Keeping the desk warm: caching.
   The desk (moved left from 10's low standard desk) carries the prompt laid out in cache order: tools / system prompt / messages.
   Gold = warm cache, blue-grey = cold. Timer (time to live) top-right; right column holds one thing at a time:
   prefix caption -> "change early" caption -> Claude Code dated card -> the list of other cache breakers. */
SCENE('11', (t, S) => {
  K.bg();
  const P = M.palette, C = K.C;
  const cu = (n, f) => S.cue(n, f);
  const tLayout = cu('layout', 6), tOrder = cu('order', 17.9), tSwap = cu('swap', 23.3), tTimer = cu('timer', 28.5);
  const tCold = cu('cold', 46.7), tBreak = cu('breakers', 51.7), tNot = cu('not-memory', 67.9);
  const w = (re, n, f) => S.find(re, n || 0, f);

  // ---- desk: from 10's exit desk (cx 690, cy 640) to this scene's desk (left of the right column)
  const D0 = M.desk({ w: 1120, h: 380 }, { cx: 690, cy: 640 });   // 10's exit desk
  const D1 = M.desk({ w: 1120, h: 420 }, { cx: 780, cy: 610 });
  const D = M.lerpDesk(D0, D1, K.io(t, 0.2, M.motion.grow));

  // ---- the layers' geometry (on the desk top)
  const LX = 300, LY = 440, LW = 960, LH = 84, LG = 16;
  const bandY = (i) => LY + i * (LH + LG);

  // swap rebuild (bands 1, 2 lift and re-lay) and the cold rebuild (all bands)
  const tLift1 = w(/^everything/, 0, tSwap + 2), tRelay1 = w(/^laid/, 0, tSwap + 3.2);
  const tMsg2 = w(/^message$/, 0, tCold + 2.1), tLift2 = w(/^rebuilds/, 0, tCold + 3), tRelay2 = tLift2 + 0.75;
  const showBase = (i) => K.stagger(t, tLayout + 0.1, i, 0.5, 0.6);
  const show = (i) => {
    if (t >= tRelay2 - 0.05) return K.io(t, tRelay2 + i * 0.25, 0.6, 'out');
    return showBase(i);
  };
  const lift = (i) => {
    if (t >= tLift2 && t < tRelay2) return K.io(t, tLift2 + i * 0.12, 0.5);
    return 0;
  };

  // ---- the timer (time to live): k = time left
  const tReuse = w(/^reuse$/, 0, tTimer + 8.9);
  let tk = 1;
  if (t >= tTimer + 3.5 && t < tReuse) tk = 1 - 0.5 * K.seg(t, tTimer + 3.5, tReuse);
  else if (t >= tReuse && t < tCold) tk = K.lerp(0.5, 1, K.io(t, tReuse, 0.35, 'out')) - 0.25 * K.seg(t, tReuse + 0.4, tCold);
  else if (t >= tCold && t < tRelay2) tk = 0.75 * (1 - K.io(t, tCold + 0.2, 1.0, 'in'));
  else if (t >= tRelay2) tk = K.io(t, tRelay2 + 0.1, 0.8, 'out');
  const cold = t < tRelay2 ? K.io(t, tCold + 0.6, 0.7) : 1 - K.io(t, tRelay2 + 0.2, 0.9);

  // warmth of the layout: settles at layout, dips at the swap rebuild, goes cold on the long break, small dips per breaker
  const tB = [w(/^switching/, 0, tBreak + 1.7), w(/^changing/, 0, tBreak + 2.8), w(/^dropping/, 0, tBreak + 3.9), w(/^compaction/, 0, tBreak + 5.2), w(/^effort/, 0, tBreak + 8.4)];
  let warm = K.io(t, w(/^warm/, 0, 4.9) - 0.3, 1.0);
  warm *= 1 - 0.4 * (K.io(t, tLift1, 0.5) - K.io(t, tRelay1 + 0.7, 0.6));
  warm *= 1 - cold;
  tB.forEach((b) => { warm *= 1 - 0.35 * (K.io(t, b, 0.25) - K.io(t, b + 0.45, 0.5)); });
  const lit = 1 - 0.65 * cold;

  // ---- ghosts: "re-sending the whole desk" (three copies slide in from the left and merge)
  for (let g = 0; g < 3; g++) {
    const a0 = 0.35 + g * 0.95, k = K.io(t, a0, 0.85, 'out');
    if (t < a0 || k >= 1) continue;
    const Dg = M.desk({ w: D1.w, h: D1.h }, { cx: K.lerp(-700, D1.cx, k), cy: D1.cy });
    K.layer(0.4 * (1 - k * k), () => {
      M.drawDesk(t, Dg, { lit: 0.3, floor: 0 });
      [0.2, 0.45, 0.7].forEach((u, j) => { const p = M.spot(Dg, u, 0.25 + j * 0.25); M.paper(p.x, p.y, { w: 150, h: 70, alpha: 0.8 }); });
    });
  }

  // ---- the workspace
  const st = M.stage(t, { desk: D, lit, deskGlow: 0.8 * warm, wash: { color: P.cold, a: 0.16 * cold }, ruler: t < 1.2 ? { fill: 0.46, alpha: 1 - K.io(t, 0.1, 0.9) } : false });

  // reuse sweep: the next request starts the same way, the stored prefix lights up top to bottom
  const tReuseSay = w(/^reuses/, 0, 13.5);
  const sweep = K.seg(t, tReuseSay, tReuseSay + 1.6);
  if (sweep > 0 && sweep < 1) {
    const yy = K.lerp(LY - 10, bandY(2) + LH + 10, K.io(sweep, 0, 1, 'sine'));
    K.glow(LX + LW / 2, yy, 260, C.head, 0.22 * Math.sin(Math.PI * sweep));
  }

  // ---- the layers (appear on 'layout')
  const sw = { i: 0, k: K.io(t, tSwap + 0.15, 0.5) };
  const nums = K.io(t, tOrder + 0.9, 0.5);
  const R = M.layers(t, LX, LY, LW, { show, lift, warm, nums, h: LH, gap: LG, alpha: t < tLayout ? 0 : 1 });

  // the changed card: first card of the tools row (drawn here; M.layers' swap only targets the row's last card)
  const CX = LX + LW - 70 - 3 * 110;
  if (sw.k > 0 && R[0]) {
    const a0 = K.clamp(show(0)) * (1 - K.clamp(lift(0)));
    M.paper(CX, R[0].y + LH / 2, { w: 90, h: LH - 34, lines: 2, kind: 'note', edge: sw.k, alpha: sw.k * a0 });
  }

  // swap rebuild (prefix rule): everything after the changed card goes cold, sweeping DOWN from it
  // (rest of the tools row, then system prompt, then messages), then the rows are laid out again lit, top to bottom.
  const dimK = (i) => K.io(t, tLift1 + i * 0.3, 0.45) * (1 - K.io(t, tRelay1 + i * 0.35, 0.45, 'out'));
  const relit = (i) => K.env(t, tRelay1 + i * 0.35, tRelay1 + i * 0.35 + 0.9, 0.25);
  if (t > tLift1 && t < tRelay1 + 2) R.forEach((r, i) => {
    const d = dimK(i);
    if (d > 0) {
      // band 0: the changed card is the FIRST tools card; everything after it in the row goes cold
      const x0 = i === 0 ? CX + 52 : r.x;
      K.card(x0, r.y, r.x + r.w - x0, r.h, { r: 18, fill: K.rgba(C.page, 0.66 * d), stroke: K.rgba(P.cold, 0.9 * d), lw: 2, shadow: false });
    }
    const f = relit(i);
    if (f > 0) K.card(r.x - 4, r.y - 4, r.w + 8, r.h + 8, { r: 20, fill: 'rgba(0,0,0,0)', stroke: K.rgba(C.head, 0.9 * f), lw: 3, glow: 0.6 * f, shadow: false });
  });

  // name flash per band as it is said (order beat)
  const said = [w(/^tools/, 0, tOrder + 1.2), w(/^system/, 0, tOrder + 2.8), w(/^messages/, 0, tOrder + 4.2)];
  said.forEach((s0, i) => {
    const a = K.env(t, s0, s0 + 1.1, 0.3);
    if (a > 0) K.card(LX - 4, bandY(i) - 4, LW + 8, LH + 8, { r: 20, fill: 'rgba(0,0,0,0)', stroke: K.rgba(C.head, 0.9 * a), lw: 3, glow: 0.6 * a, shadow: false });
  });

  // order arrow, left of the desk
  const ak = K.io(t, tOrder, 0.8);
  if (ak > 0) {
    K.text('order', 156, LY - 16, { ...M.type.label, color: C.head, align: 'center', alpha: K.clamp(ak * 2) });
    K.arrow(156, LY + 4, 156, bandY(2) + LH, { k: ak, color: C.head, w: 3 });
  }

  // new messages landing in the messages band (each one a request that reuses the prefix)
  const band2 = () => { const sk = K.clamp(show(2)), lf = K.clamp(lift(2)); return { a: sk * (1 - lf), dy: -lf * 50 + (1 - sk) * 20 }; };
  const msgs = [{ at: tReuse - 0.45, x: 740 }, { at: tMsg2 - 0.3, x: 630 }];
  msgs.forEach((m) => {
    if (t < m.at) return;
    const b = band2(), L = M.land(t, m.at, m.x, bandY(2) + LH / 2, m.x + 40, bandY(2) - 220);
    M.paper(L.x, L.y + b.dy * L.k, { kind: 'msg', w: 90, h: 50, lines: 2, alpha: L.a * (L.k < 1 ? 1 : b.a), edge: 1 - K.io(t, m.at + 0.6, 0.8) });
  });

  // bracket marking the prefix (right of the layers)
  const bx = LX + LW + 26, pk = K.io(t, w(/^prefix/, 0, 12), 0.6);
  const capA = 1 - K.io(t, tTimer - 0.2, 0.5);
  if (pk > 0 && capA > 0) {
    K.layer(pk * capA, () => {
      K.line(bx - 12, LY, bx, LY, { color: C.head, w: 3 });
      K.line(bx, LY, bx, bandY(2) + LH, { color: C.head, w: 3, k: pk });
      K.line(bx - 12, bandY(2) + LH, bx, bandY(2) + LH, { color: C.head, w: 3 });
    });
  }

  // ---- right column
  const RX = 1390;
  // caption 1: prefix · stored by the provider ; caption 2: change early -> rebuild
  const c1 = K.io(t, w(/^stores/, 0, 8), 0.6) * (1 - K.io(t, tSwap, 0.4));
  K.layer(c1 * capA, () => {
    K.layer(pk, () => K.text('prefix', RX, 520, { font: 'mono', size: 34, weight: 600, color: C.head }));
    K.text('stored by the provider', RX, 566, { ...M.type.label, color: C.strong });
  });
  const c2 = K.io(t, tSwap + 0.3, 0.6) * capA;
  K.layer(c2, () => {
    K.text('change early', RX, 520, { ...M.type.read, color: C.accent });
    K.text('→ rebuild below it', RX, 566, { ...M.type.label, color: C.strong, alpha: K.io(t, tLift1, 0.5) });
  });

  // timer + its label (top right)
  const ta = K.io(t, tTimer, 0.6);
  if (ta > 0) {
    M.timer(t, 1640, 240, tk, { cold, alpha: ta });
    K.text('time to live', 1640, 342, { ...M.type.label, color: C.strong, align: 'center', alpha: ta });
    const fa = K.io(t, w(/^Five/, 0, tTimer + 4.3), 0.5);
    K.text('5 min · or 1 h', 1640, 382, { font: 'mono', size: 26, weight: 600, color: C.head, align: 'center', alpha: fa * ta });
    // "reuse resets": a small gold flash on the ring when a message lands
    const rf = K.env(t, tReuse, tReuse + 0.7, 0.2);
    if (rf > 0) K.glow(1640, 240, 120, C.head, 0.35 * rf);
  }
  // tea cup: the longer break
  const tea = K.io(t, w(/^break/, 0, tCold + 0.7), 0.6) * (1 - K.io(t, tRelay2, 0.6));
  if (tea > 0) K.icon('tea', 1490, 236, 64, { color: P.cold, alpha: tea, w: 3 });

  // dated card: Claude Code TTLs (on "Claude Code")
  const dk = K.io(t, w(/^Claude/, 0, tTimer + 11.8), 0.6) * (1 - K.io(t, tBreak - 0.3, 0.5));
  if (dk > 0) K.layer(dk, () => {
    const y0 = 450 + (1 - dk) * 14;
    K.card(RX, y0, 450, 236, { r: 20, fill: K.rgba(C.tile, 0.92), stroke: C.line2 });
    M.dated('Oct 2026', RX + 26, y0 + 42);
    K.text('Claude Code', RX + 26, y0 + 92, { ...M.type.read, color: C.strong });
    const r1 = K.io(t, w(/^subscription/, 0, tTimer + 14), 0.4), r2 = K.io(t, w(/^key/, 0, tTimer + 17.2) - 0.7, 0.4);
    K.text('subscription', RX + 26, y0 + 146, { ...M.type.label, color: C.body, alpha: r1 });
    K.text('1 h', RX + 424, y0 + 146, { font: 'mono', size: 26, weight: 600, color: C.head, align: 'right', alpha: r1 });
    K.text('API key', RX + 26, y0 + 196, { ...M.type.label, color: C.body, alpha: r2 });
    K.text('5 min', RX + 424, y0 + 196, { font: 'mono', size: 26, weight: 600, color: C.head, align: 'right', alpha: r2 });
  });

  // list card: other things that break the cache
  const lk = K.io(t, tBreak, 0.6);
  if (lk > 0) {
    const dimL = 1 - 0.55 * K.io(t, tNot, 0.8);
    K.layer(lk * dimL, () => {
      const y0 = 430 + (1 - lk) * 14;
      K.card(RX, y0, 450, 470, { r: 20, fill: K.rgba(C.tile, 0.92), stroke: C.line2 });
      K.eyebrow('ALSO BREAKS IT', RX + 26, y0 + 46, { color: C.accent });
      const items = ['switch model', 'tools change', 'old images dropped', 'compaction', 'effort (older models)'];
      items.forEach((s0, i) => {
        const a = K.io(t, tB[i], 0.4);
        if (a <= 0) return;
        const yy = y0 + 100 + i * 52;
        const g = K.ctx(); g.save(); g.globalAlpha *= a; g.fillStyle = C.accent; g.beginPath(); g.arc(RX + 34, yy - 9, 5, 0, Math.PI * 2); g.fill(); g.restore();
        K.text(s0, RX + 52 + (1 - a) * 10, yy, { ...M.type.label, color: C.strong, alpha: a });
      });
      // the one that does NOT break it
      const ek = K.io(t, w(/^Editing/, 0, tBreak + 10.1), 0.5);
      if (ek > 0) K.layer(ek, () => {
        const yy = y0 + 380;
        K.line(RX + 26, yy - 40, RX + 424, yy - 40, { color: C.line2, w: 1.5 });
        const tw = K.text('CLAUDE.md edit', RX + 26, yy, { font: 'mono', size: 26, weight: 600, color: C.soft });
        K.line(RX + 22, yy - 9, RX + 30 + tw, yy - 9, { color: C.soft, w: 2.5, k: K.io(t, w(/^doesn/, 0, tBreak + 11.9), 0.5) });
        K.text('waits for next session', RX + 26, yy + 44, { ...M.type.label, color: C.soft, alpha: K.io(t, w(/^waits/, 0, tBreak + 13.5), 0.5) });
      });
    });
  }

  // ---- where the picture breaks
  M.breaks(1130, 160, 'stored arithmetic, not memory', K.io(t, tNot + 2.3, 0.7));
});
