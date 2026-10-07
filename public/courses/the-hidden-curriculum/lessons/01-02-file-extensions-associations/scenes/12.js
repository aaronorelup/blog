/* 12 — The surprises you'll hit.
   Six small vignettes on a 3 x 2 grid of cards, one per surprise, each built from the lesson's own objects
   (string + tag, mini ledger row, porter, pen + glass, a door). The card being spoken about is lit (gold
   frame); finished cards stay, quieter; at the end all six settle evenly. No red, no sirens, no flashing. */
SCENE('12', (t, S) => {
  K.bg();
  const g = K.ctx(), C = K.C;
  const cue = (n, f) => S.cue(n, f);
  const c = [cue('flash', 0), cue('how-open', 11.45), cue('no-ext', 15.99), cue('doesnt-stick', 20.86),
    cue('wont-open', 29.98), cue('costume', 36.13)];
  const w = (word, nth, fb) => S.find(word, nth, fb);
  const CW = 540, CH = 350;
  const XS = [110, 690, 1270], YS = [150, 560];
  const pos = (i) => ({ x0: XS[i % 3], y0: YS[Math.floor(i / 3)] });
  const settle = K.io(t, (c[5] + 8.6), 0.8);                       // after "...covers that one": all six even
  const caption = (s, x0, y0, a) => K.text(s, x0 + CW / 2, y0 + 318, { font: 'ui', weight: 600, size: 28, color: C.strong, align: 'center', alpha: a });
  const soft = (s, x, y, a, o = {}) => K.text(s, x, y, { font: 'ui', weight: 600, size: 28, color: C.soft, align: 'center', alpha: a, ...o });

  // card 1 opens alone, 1.4x in the middle of the frame, and settles into its slot as card 2 arrives
  const hero = 1 - K.io(t, c[1] - 0.35, 0.9);
  // no placeholder outlines: each card slides into its own slot when its cue lands
  // a card frame + its content; focus while it is the one being spoken about
  const card = (i, fn) => {
    const a0 = c[i];
    const inK = i === 0 ? 1 : K.io(t, a0, 0.6, 'out');
    if (inK <= 0) return;
    const next = i < 5 ? c[i + 1] : Infinity;
    const foc = (i === 0 ? 1 : K.io(t, a0, 0.5)) * (1 - K.io(t, next - 0.1, 0.6)) * (1 - settle);
    const past = K.io(t, next - 0.1, 0.6) * (1 - settle);
    const { x0, y0 } = pos(i);
    K.layer(inK, () => {
      g.save(); g.translate(0, (1 - inK) * 24);
      if (i === 0 && hero > 0) {        // centre-scale while it is the only card
        const sc = 1 + 0.4 * hero, scx = x0 + CW / 2, scy = y0 + CH / 2;
        const hx = K.lerp(scx, 960, hero), hy = K.lerp(scy, 530, hero);
        g.translate(hx, hy); g.scale(sc, sc); g.translate(-scx, -scy);
      }
      K.card(x0, y0, CW, CH, { r: 22, fill: C.tile, stroke: K.mixColor(C.line2, C.head, foc), lw: 1.5 + foc, glow: foc * 0.5 });
      K.layer(1 - 0.15 * past, () => fn(x0, y0));
      g.restore();
    });
  };
  // a ledger row with no door: cream paper, dark ink label, a full-strength terracotta '?'
  const noRow = (label, x, y, a) => {
    if (a <= 0) return;
    K.layer(a, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      K.rr(x, y, 300, 70, 12); g.fillStyle = M.palette.paper; g.fill(); g.restore();
      K.line(x + 18, y + 8, x + 18, y + 62, { color: K.rgba(C.accent, 0.45), w: 1.5 });
      K.text(label, x + 32, y + 45, { font: 'mono', weight: 700, size: 28, color: M.palette.ink });
      K.text('→', x + 190, y + 45, { font: 'mono', weight: 400, size: 28, color: M.palette.inkSoft });
      K.text('?', x + 240, y + 47, { font: 'mono', weight: 700, size: 36, color: '#B4472A' });
    });
  };

  // ---------------------------------------------------------------- 1 · flash: it ran, then closed
  // drawn last so the shrinking hero card stays above the cards fading in beside it
  const card0 = () => card(0, (x0, y0) => {
    const cx = x0 + 336, cy = y0 + 82;
    const st = M.drawString(cx, cy, 0.3, { t, preset: 'py', n: 6, tagS: 0.77, tag: { name: 'script.py' } });
    // double-click: two soft gold ripples round the tag
    [0.25, 0.55].forEach((a) => {
      const p = K.seg(t, a, a + 0.55); if (p <= 0 || p >= 1) return;
      const tg = st.tag; if (!tg) return;
      K.layer(1 - p, () => K.ring((tg.x0 + tg.x1) / 2, cy, tg.w / 2 + 10 + 30 * p, 44 + 18 * p, 1, { color: C.head, w: 3, rot: 0 }));
    });
    soft('depends on the machine', x0 + CW / 2, y0 + 168, K.io(t, w('depends', 0, 2.9), 0.5));
    // a tiny terminal pops in, prints 'hi', then collapses flat (scaleY -> 0) on "closes": the console that flashed
    const ww = 300, wh = 100, wx = x0 + (CW - ww) / 2, wy = y0 + 188, wcx = wx + ww / 2, wcy = wy + wh / 2;
    const tRun = w('runs', 0, 5.4), tClose = w('closes', 0, 6.5);
    const open = K.io(t, tRun - 0.2, 0.35, 'out'), shut = K.io(t, tClose, 0.4);
    if (open > 0 && shut < 1) K.layer(open, () => {
      g.save(); g.translate(wcx, wcy); g.scale(0.94 + 0.06 * open, (0.94 + 0.06 * open) * (1 - shut)); g.translate(-wcx, -wcy);
      const r = K.win(wx, wy, ww, wh, { kind: 'terminal', title: 'python', titleSize: 26, shadow: false });
      K.term(r, t, [{ at: tRun, out: 'hi' }], { size: 26, pad: 14, rows: 1, idle: false });
      g.restore();
    });
    // what is left: a faint flat line where the window was, which the label then replaces
    const gone = K.io(t, tClose + 0.25, 0.3), lab = K.io(t, w('ran', 0, 8.6) - 0.2, 0.5);
    if (gone * (1 - lab) > 0) K.line(wx + 10, wcy, wx + ww - 10, wcy, { color: K.rgba(C.soft, 0.5 * gone * (1 - lab)), w: 2.5 });
    K.text('ran, then closed', wcx, wcy + 10, { font: 'ui', weight: 600, size: 28, color: C.body, align: 'center', alpha: lab });
    caption("it didn't open for editing", x0, y0, K.io(t, w('editing', 0, 10.5) - 0.5, 0.5));
  });

  // ---------------------------------------------------------------- 2 · how-open: the label has no row
  card(1, (x0, y0) => {
    const a = c[1];
    const dk = K.io(t, w('box', 0, a + 0.2), 0.5);
    K.layer(dk, () => {
      K.card(x0 + 70, y0 + 30, 400, 110, { r: 14, fill: C.code, stroke: C.line2, shadow: false });
      K.text('Select an app to open', x0 + 96, y0 + 76, { font: 'mono', weight: 600, size: 26, color: C.strong });
      K.spans([{ s: 'this ', color: C.strong }, { s: '.xyz', color: C.accent }, { s: ' file', color: C.strong }],
        x0 + 96, y0 + 116, { size: 26, font: 'mono' });
    });
    const lk = K.io(t, w('label', 0, a + 3.0) - 0.1, 0.5);
    const qk = K.io(t, w('row', 0, a + 3.8) - 0.2, 0.5);
    M.porter(x0 + 112, y0 + 228, 100, { t, alpha: K.io(t, a + 0.4, 0.5), question: qk, look: -0.4 * lk });
    noRow('.xyz', x0 + 210, y0 + 196, lk);
    caption('the label has no row', x0, y0, qk);
  });

  // ---------------------------------------------------------------- 3 · no-ext: blank icon, same question
  card(2, (x0, y0) => {
    const a = c[2];
    const cx = x0 + 340, cy = y0 + 82;
    const st = M.drawString(cx, cy, 0.3, { t, preset: 'notes', n: 6, tagS: 0.77, tag: { name: 'notes' } });
    // the empty slot where a label would be
    const ek = K.io(t, w('extension', 0, a + 0.9), 0.5);
    if (st.tag && ek > 0) {
      const fx = st.tag.x0 + 26 * 0.77 + K.measure('notes', { font: 'mono', weight: 600, size: 34 * 0.77 }) + 6;
      K.layer(ek, () => {
        g.save(); g.setLineDash([5, 5]); g.strokeStyle = C.accent; g.lineWidth = 2.5;
        K.rr(fx, cy - 17, 44, 34, 6); g.stroke(); g.restore();
      });
    }
    const bk = K.io(t, w('blank', 0, a + 2.3) - 0.1, 0.5);
    K.icon('file', x0 + 112, y0 + 222, 92, { color: C.soft, alpha: bk, w: 3 });
    const qk = K.io(t, w('same', 0, a + 3.5) - 0.1, 0.5);
    noRow('(none)', x0 + 210, y0 + 196, qk);
    caption('no label: blank icon, same question', x0, y0, bk);
  });

  // ---------------------------------------------------------------- 4 · doesnt-stick: the stroke fades back
  card(3, (x0, y0) => {
    const a = c[3];
    const lx = x0 + 30, ly = y0 + 40, lw = 340;
    const wr0 = w('default', 0, a + 0.7), up = w('upgrade', 0, a + 2.0);
    const toK = 0.72 * K.io(t, wr0, 1.1) * (1 - K.io(t, up + 0.15, 0.9));
    const L = M.ledger(lx, ly, lw, { title: false, alpha: K.io(t, a, 0.5), rows: [{ label: '.pdf', door: 'Browser', to: 'PDF app', toK, glass: 1 }] });
    // the pen: crosses out, starts writing, then lifts away as the update lands
    const f = { font: 'ui', weight: 600, size: L.size };
    const prog = toK < 0.5 ? K.measure('Browser', f) * K.clamp(toK * 2) : K.measure('PDF app', f) * K.clamp((toK - 0.5) * 2);
    const pa = K.env(t, wr0 - 0.3, up - 0.1, 0.35);
    if (pa > 0) M.pen(L.doorX + prog, L.rowY(0) + 4, 120, { t, alpha: pa, writing: K.env(t, wr0, up - 0.3, 0.2) });
    // the update arrives
    const hk = K.io(t, up - 0.1, 0.5);
    M.hand('clock', 'update', x0 + 466, y0 + 82, lx + lw + 6, L.rowY(0), { alpha: hk, k: K.io(t, up + 0.1, 0.5) });
    K.text("won't stick after an upgrade", x0 + CW / 2, y0 + 208, { font: 'ui', weight: 600, size: 28, color: C.strong, align: 'center', alpha: K.io(t, w('stick', 0, a + 1.3) - 0.1, 0.5) });
    soft('side effect of the locked record', x0 + CW / 2, y0 + 254, K.io(t, w('side', 0, a + 3.4), 0.5));
    const rk = K.io(t, w('resetting', 0, a + 6.3), 0.5);
    if (rk > 0) K.pill('reset defaults · usually fixes it', x0 + CW / 2, y0 + 308, { size: 28, color: C.head, stroke: K.rgba(C.gold, 0.7), alpha: rk });
  });

  // ---------------------------------------------------------------- 5 · wont-open: new door can't read these beads
  card(4, (x0, y0) => {
    const a = c[4];
    const ren = w('changed', 0, a + 0.7), renamed = w('rename', 0, a + 1.5);
    const strike = K.io(t, ren, 0.4), toK = K.io(t, renamed - 0.2, 0.6);
    const hold = K.io(t, ren, 0.6);
    // the icon follows the new label
    const ik = K.io(t, renamed - 0.2, 0.5);
    K.file(x0 + 140, y0 + 100, 130, { ext: 'txt', alpha: 1 - ik });
    K.file(x0 + 140, y0 + 100, 130, { ext: 'png', alpha: ik });
    const mk = K.io(t, w(/^won.?t/, 1, a + 2.7) - 0.4, 0.5);
    M.drawString(x0 + 303, y0 + 232, 0.3, { t, preset: 'notes', n: 4, tagS: 0.77, hold,
      tag: { name: 'notes.txt', to: 'notes.png', k: toK, strike, mark: mk } });
    const door = w(/^won.?t/, 1, a + 2.7), cant = w(/^can.?t/, 0, a + 4.6);
    const fk = K.io(t, door, 0.5) * (1 - K.io(t, cant, 0.5));
    M.door(x0 + 455, y0 + 36, 140, 250, { name: 'Photos', focus: fk, cross: K.io(t, cant, 0.5) });
    caption("new door can't read these beads", x0, y0, K.io(t, cant, 0.5));
  });

  // ---------------------------------------------------------------- 6 · costume: a program in a costume
  card(5, (x0, y0) => {
    const a = c[5];
    const folded = w('folded', 0, a + 3.3), prog = w('program', 0, a + 5.3), trust = w('Trust', 0, a + 7.1);
    const fold = K.io(t, folded - 0.1, 0.6) * (1 - K.io(t, prog - 0.2, 0.6));
    const unf = K.io(t, prog - 0.2, 0.6);
    const st = M.drawString(x0 + 419, y0 + 92, 0.3, { t, bytes: [77, 90, 144, 0], tint: '#3C2C2A', n: 4, tagS: 0.77,
      tag: { name: 'invoice.pdf.exe', fold, extColor: unf > 0.3 ? C.accent : undefined } });
    if (st.tag && unf > 0) {
      const ex = st.tag.ext;
      K.icon('gear', ex.cx, y0 + 170, 52, { color: C.accent, alpha: unf, w: 3 });
    }
    if (trust < Infinity) {
      const tk = K.io(t, trust - 0.1, 0.5);
      if (tk > 0) K.pill('covered in the Trust district', x0 + CW / 2, y0 + 246, { size: 28, color: C.head, stroke: K.rgba(C.gold, 0.7), alpha: tk });
    }
    caption('a program in a costume', x0, y0, unf);
  });
  card0();
});
