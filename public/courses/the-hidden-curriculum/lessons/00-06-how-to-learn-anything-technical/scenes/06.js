/* 00.06 scene 06: The confident witness.
   The clerk steps up on a witness stand, confident and almost right. Two dated survey cards, then three claim cards
   (the three ways it goes wrong), each checked by a dashed line against the rulebook (or the package index), which
   answers with a cross / warning. At [[saw-nothing]] the stand sinks back to an ordinary clerk at its desk and the
   check-lines brighten together. File small, bottom-left, tabs [2, 2, 2, 2, 0].
   Opening continues 05's last frame: file at 'left', the clerk at its long desk with the four evidence cards. Over
   ~1 s the cards clear, the file slides and shrinks to the corner, and the clerk moves left while its desk shrinks
   into the thin sliver, which the witness stand then replaces at 'confident'. */
SCENE('06', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg();

  const cue = (n, f) => S.cue(n, f);
  const w = (word, nth, f) => S.find(word, nth, f);
  const tWit = cue('witness', 0), tSur = cue('survey', 5.72), tOld = cue('shape-old', 19.49);
  const tFlag = cue('shape-flag', 25.86), tPkg = cue('shape-package', 28.79), tShop = cue('fake-shop', 36.86);
  const tSaw = cue('saw-nothing', 41.9);

  // ---------------------------------------------------------------- the file: from 05's 'left' to the corner
  const fk = K.io(t, 0.6, M.motion.move);
  const F = M.lerpGeo('left', 'corner', fk);
  const tChk0 = S.find('Checking', 0, 48.72);
  // the Rulebook tab flashes as 'Checking matters more' lands: this scene's argument is that tab
  M.drawFile(t, F, { tabs: [2, 2, 2, 2, 0], caseNo: false, flash: [0, 0, K.env(t, tChk0, Infinity, 0.6), 0, 0] });

  // ---------------------------------------------------------------- the rulebook (referee), from 05's spot to the right
  // 05 ended with the docs window faded out behind its study card, so the rulebook fades back in at its own spot
  const rbIn = K.io(t, 0.7, 0.6);
  const RB = { x: 1420, y: 200 + (1 - rbIn) * 18, w: 420, h: 320 };
  const tCheck = w('Checking', 0, 48.72);
  const bright = K.io(t, tCheck, 0.6);
  if (rbIn > 0) M.rulebook(RB.x, RB.y, RB.w, RB.h, { alpha: rbIn, litK: 1, lines: 1, focus: bright > 0.5 });

  // ---------------------------------------------------------------- the witness
  const cx = 520, cy = 430, csz = 110;
  const tConf = w('confident', 0, 2.32);
  const up = K.io(t, tConf, 0.7) * (1 - K.io(t, tSaw, 0.7));
  // travel: 05's spot (1745, 585, size 96, long desk) -> the witness spot; the desk shrinks into M.clerk's own sliver
  const mk = K.io(t, 0.6, 1.0);   // one ease for the clerk and its desk, so the clerk rides the desk
  const csz2 = K.lerp(96, csz, mk);
  const SL = { x: cx - csz * 1.3, y: cy + csz * 0.62, w: csz * 2.6 };
  const DK0 = { x: 945, y: 618, w: 895, h: 248 };
  const dk = mk;
  const deskX = K.lerp(DK0.x, SL.x, dk), deskW = K.lerp(DK0.w, SL.w, dk), deskY = K.lerp(DK0.y, SL.y, dk);
  const ccx = deskX + deskW / 2 + K.lerp(1745 - (DK0.x + DK0.w / 2), 0, mk), ccy = deskY + K.lerp(585 - DK0.y, cy - SL.y, mk);
  const deskA = 1 - K.io(t, 1.6, 0.25);
  if (deskA > 0) K.layer(deskA, () => {
    const x = K.lerp(DK0.x, SL.x, dk), y = K.lerp(DK0.y, SL.y, dk), ww = K.lerp(DK0.w, SL.w, dk), h = K.lerp(DK0.h, 0, dk);
    const lip = 18, ins = 22 * (1 - dk), legY = y + h + lip - 2;
    K.card(x + ww * K.lerp(0.06, 0.08, dk), legY, 14, 30, { r: 3, fill: M.palette.woodDark, shadow: false });
    K.card(x + ww * K.lerp(0.94, 0.92, dk) - 14, legY, 14, 30, { r: 3, fill: M.palette.woodDark, shadow: false });
    if (h > 1) {
      g.save(); g.beginPath(); g.moveTo(x + ins, y); g.lineTo(x + ww - ins, y); g.lineTo(x + ww, y + h); g.lineTo(x, y + h); g.closePath();
      g.fillStyle = '#211F2C'; g.fill(); g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5; g.stroke(); g.restore();
      K.line(x + ins, y, x + ww - ins, y, { color: K.rgba(C.head, 0.6 * (1 - dk)), w: 2.5 });
    }
    K.card(x, y + h, ww, lip, { r: 6, fill: M.palette.wood, stroke: K.rgba(C.line2, 0.9), shadow: false });
    K.line(x + 10, y + h + 2, x + ww - 10, y + h + 2, { color: K.rgba(C.head, 0.25), w: 2 });
  });
  // 05's four evidence cards on the desk (same layout as 05): they clear first
  const evOut = 1 - K.io(t, 0.15, 0.45);
  if (evOut > 0) {
    const evW = (o) => {
      const E = { error: 'the exact error', versions: 'your versions', command: 'the command', file: 'the file' }[o.kind];
      return Math.max(o.w || 300, K.measure(o.text, M.type.mono) + 116, K.measure((o.eyebrow || E).toUpperCase(), { font: 'ui', weight: 600, size: 20, tracking: 4 }) + 116);
    };
    const ev = [
      { kind: 'error', text: "NameError: name 'pirnt' is not defined" },
      { kind: 'versions', text: 'Python 3.14', eyebrow: 'versions', w: 1 },
      { kind: 'command', text: 'python app.py', w: 1 },
      { kind: 'file', text: 'app.py', w: 1 },
    ];
    const deskCx = DK0.x + DK0.w / 2, gap = 10;
    ev[0].x = deskCx - evW(ev[0]) / 2 - 85; ev[0].y = 630;
    const row2 = evW(ev[1]) + evW(ev[2]) + evW(ev[3]) + 2 * gap;
    ev[1].x = deskCx - row2 / 2; ev[1].y = 750;
    ev[2].x = ev[1].x + evW(ev[1]) + gap; ev[2].y = 750;
    ev[3].x = ev[2].x + evW(ev[2]) + gap; ev[3].y = 750;
    K.layer(evOut, () => ev.forEach((e, i) => M.evidence(e.x, e.y + (1 - evOut) * 16, { kind: e.kind, text: e.text, eyebrow: e.eyebrow, w: e.w, rot: i % 2 ? 0.006 : -0.006, lit: i ? 1 : 0 })));
  }
  const sliverK = mk >= 1 ? K.io(t, 1.55, 0.3) * (1 - K.io(t, tConf, 0.5)) + K.io(t, tSaw + 0.3, 0.6) : 0;
  M.clerk(t, ccx, ccy, csz2, { stand: up, confident: up, desk: sliverK, glow: 0.8 });
  const lift = up * csz * 0.55;

  // speech card "Here's the fix." with its 'almost right' warning
  const spK = K.io(t, w('witness', 0, 2.88), 0.5);
  const spDim = 1 - 0.6 * K.io(t, tSaw, 0.7);
  const tailK = 1 - K.io(t, tSaw, 0.5);
  if (spK > 0) K.layer(spK * spDim, () => {
    const x = 300, y = 140 + (1 - spK) * 16, W = 400, H = 124;
    // tail toward the clerk (fades as the stand sinks)
    if (tailK > 0) { g.save(); g.globalAlpha *= tailK; g.fillStyle = '#262333'; g.strokeStyle = K.rgba(C.head, 0.55); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(cx - 26, y + H - 2); g.lineTo(cx - 4, cy - csz / 2 - lift - 14); g.lineTo(cx + 14, y + H - 2); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    K.card(x, y, W, H, { r: 20, fill: '#262333', stroke: K.rgba(C.head, 0.55) });
    if (tailK > 0) { g.save(); g.globalAlpha *= tailK; g.fillStyle = '#262333'; g.fillRect(cx - 24, y + H - 4, 36, 6); g.restore(); }
    K.text("Here's the fix.", x + 32, y + 56, { font: 'read', italic: true, size: 40, color: C.strong });
    K.text('almost right', x + 32, y + 100, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.accent, 0.95 * K.io(t, w('almost', 0, 4.31), 0.5)) });
  });

  // under the clerk: 'a confident witness' -> 'saw nothing · predicts'
  const labA = K.io(t, w('witness', 0, 2.88), 0.5) * (1 - K.io(t, tSaw, 0.5));
  const labB = K.io(t, w('saw', 0, 44.4), 0.5);
  if (labA > 0) K.text('a confident witness', cx, 590, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.head, labA), align: 'center' });
  if (labB > 0) K.text('saw nothing · predicts', cx, 590, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.head, labB), align: 'center' });

  // ---------------------------------------------------------------- survey (middle column, gone before the claims)
  const colX = 720, colW = 620;
  const surOut = 1 - K.io(t, tOld, 0.5);
  const chipK = K.io(t, w('Stack', 0, 5.94), 0.5) * surOut;
  if (chipK > 0) M.dated('Stack Overflow · 2025 survey', colX + colW / 2, 180, { alpha: chipK });
  const stat = (y, k, big, bigK, l1, l2, l2K) => {
    if (k <= 0) return;
    K.layer(k * surOut, () => {
      const yy = y + (1 - k) * 20, H = 150;
      K.card(colX, yy, colW, H, { r: 20, fill: '#242130', stroke: K.rgba(C.head, 0.35) });
      if (bigK > 0) K.text(big, colX + 100, yy + H / 2 + 24, { font: 'head', weight: 700, size: 66, color: K.rgba(C.head, bigK), align: 'center' });
      K.text(l1, colX + 200, yy + H / 2 - 8, { font: 'ui', weight: 600, size: 30, color: C.strong });
      if (l2K > 0) K.text(l2, colX + 200, yy + H / 2 + 36, { font: 'ui', weight: 600, size: 30, color: K.rgba(C.soft, l2K) });
    });
  };
  stat(240, K.io(t, w('almost-right', 0, 8.81), M.motion.land), '2/3', K.io(t, w('two-thirds', 0, 12.91), 0.5),
    'top frustration:', "'almost right' answers", K.io(t, w('almost-right', 0, 8.81) + 0.3, 0.5));
  stat(410, K.io(t, w('Only', 0, 14.29), M.motion.land), '~3%', K.io(t, w('three', 0, 15.02), 0.5),
    'highly trust AI answers', 'yet most use them', K.io(t, w('yet', 0, 17.96) - 0.1, 0.4));

  // ---------------------------------------------------------------- the three claims + check-lines
  const lineAlpha = 0.75 + 0.25 * bright, lineW = 3 + 1.5 * bright;
  const chk = (x1, y1, x2, y2, a, d, bend) => {
    const k = K.io(t, a, d, 'io');
    if (k <= 0) return;
    if (bright > 0) K.layer(bright, () => K.arrow(x1, y1, x2, y2, { k, bend, color: K.rgba(C.head, 0.25), w: 12, head: false }));
    M.clerkLine(x1, y1, x2, y2, k, { bend, alpha: lineAlpha, w: lineW });
  };

  // claim card: M.claim's layout with a 28 px label (M.claim's 26 px Karla reads small beside the 28 px mono line)
  const claim = (x, y, o) => {
    const h = 128;
    K.layer(o.alpha, () => {
      K.card(x, y, o.w, h, { r: 18, fill: '#242130', stroke: K.mixColor(C.line2, C.accent, o.vk * 0.7) });
      K.text(o.text, x + 28, y + 52, { font: 'mono', weight: 600, size: 28, color: o.textColor || C.strong });
      K.text(o.label, x + 28, y + 100, { font: 'ui', weight: 600, size: 28, color: C.soft });
      M.cross(x + o.w - 46, y + h / 2, 52, o.vk, { disc: true });
    });
  };

  // claim 1: renamed or retired
  const c1y = 170, c1K = K.io(t, w('Functions', 0, 21.25), M.motion.land);
  const c1L = w('models', 0, 23.51), c1V = w('code', 0, 24.9);
  if (c1K > 0) claim(colX, c1y + (1 - c1K) * 18, { w: colW, text: 'DeprecationWarning', textColor: C.accent, label: 'renamed or retired', vk: K.io(t, c1V, 0.5), alpha: c1K });
  chk(colX + colW, c1y + 64, RB.x, 300, c1L, 1.2, -20);

  // claim 2: flags that don't exist
  const c2y = 318, c2K = K.io(t, w('Command', 0, 25.86), M.motion.land);
  const c2L = w('sound', 0, 26.89), c2V = w('exist.', 0, 27.86);
  if (c2K > 0) claim(colX, c2y + (1 - c2K) * 18, { w: colW, text: '--turbo', label: 'unknown flag', vk: K.io(t, c2V, 0.5), alpha: c2K });
  chk(colX + colW, c2y + 64, RB.x, 430, c2L, 0.9, 10);

  // claim 3: packages that don't exist. One tall card holds the command AND pip's output, like rows 1 and 2.
  const c3y = 466, c3H = 186, c3K = K.io(t, w('packages', 0, 29.05), M.motion.land);
  const c3V = K.io(t, w('register', 0, 37.52), 0.5);
  const errAt = w('exist', 1, 30.1), okAt = w('install', 0, 39.17);
  if (c3K > 0) K.layer(c3K, () => {
    const y = c3y + (1 - c3K) * 18;
    K.card(colX, y, colW, c3H, { r: 18, fill: '#242130', stroke: K.mixColor(C.line2, C.accent, c3V * 0.7) });
    K.text('pip install fastjson-utils', colX + 28, y + 52, { font: 'mono', weight: 600, size: 28, color: C.strong });
    if (c3V > 0) K.icon('warning', colX + colW - 46, y + 42, 46, { color: C.accent, alpha: c3V });
    // divider between the command and its output
    const dk = K.io(t, errAt, 0.4);
    if (dk > 0) K.line(colX + 28, y + 76, colX + 28 + (colW - 56) * dk, y + 76, { color: K.rgba(C.line2, 0.9), w: 1.5 });
    const errS = 'ERROR: No matching distribution', okS = 'Successfully installed fastjson-utils';
    const errOut = 1 - K.io(t, okAt - 0.35, 0.3);
    if (t > errAt && errOut > 0) K.text(K.typed(errS, t, errAt, 40), colX + 24, y + 116, { font: 'mono', weight: 600, size: 26, color: K.rgba(C.soft, errOut) });
    if (t > okAt) K.text(K.typed(okS, t, okAt, 40), colX + 24, y + 116, { font: 'mono', weight: 600, size: 26, color: C.strong });
    const atkK = K.io(t, w('their', 0, 40.31), 0.5);
    if (atkK > 0) K.text("installs fine, attacker's code", colX + 28, y + 162, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.accent, atkK) });
  });

  // dated chip for the package study: directly under the pip card, left-aligned with it
  const stK = K.io(t, w('study', 0, 32.44), 0.5);
  const stS = '~5% of answers · 2026 preprint';
  if (stK > 0) M.dated(stS, colX + (K.measure(stS, { font: 'mono', size: 26, weight: 600 }) + 36) / 2, c3y + c3H + 44, { alpha: stK });

  // the package index slot under the rulebook: empty outline -> attacker's shop front
  const PX = 1420, PY = 570, PW = 420, PH = 196;
  const slotK = K.io(t, errAt, 0.5);
  if (slotK > 0) K.layer(slotK, () => {
    K.card(PX, PY, PW, PH, { r: 18, fill: '#1F1D2A', stroke: K.rgba(C.line2, 0.9), shadow: false });
    K.icon('server', PX + 38, PY + 36, 30, { color: C.soft });
    K.text('package index', PX + 64, PY + 46, { font: 'ui', weight: 600, size: 28, color: C.soft });
    const shop = K.io(t, w('register', 0, 37.52), 0.6);
    const ix = PX + 26, iy = PY + 72, iw = PW - 52, ih = 72;
    // empty slot: dashed outline
    if (shop < 1) K.layer(1 - shop, () => {
      g.save(); g.setLineDash([10, 9]); g.strokeStyle = K.rgba(C.soft, 0.6); g.lineWidth = 2; K.rr(ix, iy, iw, ih, 12); g.stroke(); g.restore();
      K.text('no such package', ix + iw / 2, iy + ih / 2 + 10, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.soft, 0.75), align: 'center' });
    });
    if (shop > 0) K.layer(shop, () => {
      K.card(ix, iy, iw, ih, { r: 12, fill: '#2B2230', stroke: K.rgba(C.accent, 0.8), shadow: false });
      K.icon('warning', ix + 36, iy + ih / 2, 36, { color: C.accent });
      K.text('fastjson-utils', ix + 70, iy + ih / 2 + 10, { font: 'mono', weight: 600, size: 28, color: C.strong });
    });
    const rk2 = K.io(t, w('names', 0, 38.21), 0.5);
    if (rk2 > 0) K.text('attackers register the name', PX + 26, PY + PH - 20, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.accent, rk2) });
  });
  // claim 3's check-line goes to the package index
  chk(colX + colW, c3y + 42, PX, PY + 108, errAt + 0.2, 0.9, -60);

  // ---------------------------------------------------------------- the lesson of it
  const pK = K.io(t, tCheck + 0.2, 0.5);
  if (pK > 0) K.pill('check against the rulebook', 1615, 840, { size: 30, color: C.head, fill: '#1C1B2A', stroke: K.rgba(C.head, 0.6), alpha: pK });
});
