/* 09 — The lock: your device is the key
   Same building (left layout), same lock line as 08 (tiles at y 300). Opens on 08's exit: door lock key + app, tiles
   password / text code (retired) / authenticator app, slots 4–5 dashed. On "device" tile 4 "trusts your device" rises and
   the door's lock swaps to the device; on "passkey" tile 5 rises (its own fingerprint glyph, so it never reads as the
   authenticator app's phone) and the door swaps again to the passkey (phone + key, as 10 opens).
   Right column below the tiles: a phone holding a gold key and a site window ("example.com"). The unlock pills
   face / fingerprint / PIN pop on their words under the phone; on "never sent" a dashed line leaves the phone and
   stops halfway at a small bar (nothing reaches the site); on "fake" a crooked look-alike window "examp1e-login"
   (terracotta outline) slides in, "nothing to steal" inside it. Year eyebrow "WEB STANDARD · 2019" then
   "APPLE · GOOGLE · MICROSOFT · 2022". On [[no-password]] the password tile dims to .6 (never struck: passwords are
   still everywhere) and a soft tag under it reads "still common / goal: no password". On [[required]] the diagram fades,
   the door gets a thin terracotta frame (not optional any more) and the 'GITHUB · 2021' note rises at once; the 2023
   note rises on its year; on "two factor" today's tiles light. On [[old-lock]] the line sorts itself with brackets
   ABOVE the tiles: gold "older locks" over password + text code, terracotta "today's locks" over the other three.
   Only text code carries the retired strike (from 08). */
SCENE('09', (t, S) => {
  const C = K.C, LL = M.LOCKLINE, L = M.LAYOUTS.left;

  // the passkey tile: M.lockTile's look, but a fingerprint glyph (the shared 'passkey' icon is phone + key, too close to
  // the authenticator app's phone + clock at tile size). The dashed slot stays underneath until the tile rises.
  function passkeyTile(x, y, o) {
    const g = K.ctx(), s = LL.s, k = o.k, lit = o.lit;
    K.layer(0.8, () => { g.save(); g.setLineDash([7, 8]); g.strokeStyle = C.line2; g.lineWidth = 2; K.rr(x - s / 2, y - s / 2, s, s, s * 0.28); g.stroke(); g.restore(); });
    if (k <= 0) return;
    const dy = (1 - K.ease.out(k)) * 14, cy = y + dy;
    K.layer(k, () => {
      if (lit > 0) K.glow(x, cy, s * 1.1, C.accent, 0.2 * lit);
      K.card(x - s / 2, cy - s / 2, s, s, { r: s * 0.28, fill: C.tile, stroke: K.mixColor(C.line2, C.accent, 0.25 + 0.6 * lit), shadow: false });
      g.save(); g.strokeStyle = C.accent; g.lineWidth = 3; g.lineCap = 'round';
      // a fingerprint: tall concentric ridges whose gaps wander, so it never reads as a signal icon
      const fy = cy + 1;
      [[5, 0.55, 2.25], [10.5, 0.85, 2.4], [16, 0.62, 2.12], [21.5, 0.95, 2.32], [27, 1.08, 1.98]].forEach(([r, a0, a1]) => {
        g.beginPath(); g.ellipse(x, fy, r * 0.76, r, 0, Math.PI * a0, Math.PI * a1); g.stroke();
      });
      g.restore();
      const lines = Array.isArray(o.label) ? o.label : [o.label];
      lines.forEach((ln, i) => K.text(ln, x, y + s / 2 + 38 + i * 30 + dy, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' }));
    });
  }

  // ---- times (local), all from the narration
  const tDevice = S.find('device', 0, 1.64);
  const tPasskey = S.find('passkey', 0, 4.35);
  const tSecret = S.find('secret', 0, 5.54);
  const tFace = S.find(/^face/, 0, 8.96), tFinger = S.find(/^fingerprint/, 0, 10.16), tPIN = S.find(/^PIN/, 0, 11.41);
  const tNever = S.find('never', 0, 13.43);
  const tFake = S.find('fake', 0, 15.58), tSteal = S.find(/^steal/, 0, 17.81);
  const t2019 = S.find(/^2019/, 0, 21.12), t2022 = S.find(/^2022/, 0, 22.65);
  const tNoPw = S.cue('no-password', 29.27), tNoPwWord = S.find(/^password/, 0, 29.94);
  const tReq = S.cue('required', 31.33);
  const t2023 = S.find(/^2023/, 0, 39.31), tTwo = S.find('two', 0, 42.15);
  const tOld = S.cue('old-lock', 45.58);

  K.bg({ glow: 0.16, glowX: 520, glowY: 620 });

  // ---- the building: door lock key + app -> device -> passkey
  const kDev = K.io(t, tDevice - 0.1, 0.5), kPass = K.io(t, tPasskey - 0.1, 0.5);
  let lock, lockFrom, lockK;
  if (t < tPasskey - 0.1) { lock = 'device'; lockFrom = ['key', 'app']; lockK = kDev; }
  else { lock = 'passkey'; lockFrom = 'device'; lockK = kPass; }
  const restK = K.io(t, tOld + 1.2, 1.2);
  const reqK = K.io(t, tReq + 0.2, 0.8) * (1 - 0.7 * K.io(t, tOld + 1.2, 1.2));   // eases toward 10's resting lock
  const unlockBump = Math.max(M.bump(t, tFace, 0.7), M.bump(t, tFinger, 0.7), M.bump(t, tPIN, 0.7));
  M.building(t, {
    layout: L, sign: 'Python 3.13', roofLabel: 'PYTHON · 1991',   // as 08 leaves it (dimmed while the door is the subject; back to full by the exit)
    fade: { sign: 1 - 0.45 * (1 - restK), stone: 1 - 0.3 * (1 - restK) },
    lock, lockFrom, lockK,
    lockLit: Math.max(0.25, 0.35 * unlockBump, 0.8 * reqK, 0.5 * M.bump(t, tNoPw + 0.4, 1.2)),
    doorGlow: 0.35 * reqK,
  });
  // the door frame: a thin terracotta frame drawn round the door on [[required]] (no longer optional)
  if (reqK > 0) M.inBuilding(L, () => {
    const d = M.BLD.door, g = K.ctx(), p = 10;
    g.save(); g.globalAlpha *= reqK; g.strokeStyle = K.rgba(C.accent, 0.85); g.lineWidth = 2.5;
    g.beginPath(); g.rect(d.x - p, d.y - p, d.w + 2 * p, d.h + p); g.stroke(); g.restore();
  });

  // ---- the lock line (continues from 08)
  const drop = K.io(t, tNoPwWord - 0.1, 0.6);               // "no password at all": the password tile dims and gets its tag
  const live = K.io(t, tTwo, 0.6);                          // "two factor" required -> today's locks light
  const passBack = K.io(t, tPasskey, 0.7);
  M.LOCKS.forEach((lk, i) => {
    const x = LL.xs[i];
    let k = 1, dim = 0, lit = 0, empty = false;
    let alpha = 1, label = lk.label;
    if (i === 0) alpha = 1 - 0.4 * drop;                    // dimmed, never struck: still common, the goal is no password
    if (i === 1) dim = 1;
    if (i === 2) lit = 0.6 * live;
    if (i === 3) { k = K.io(t, tDevice, 0.6); empty = true; label = ['trusts', 'your device']; lit = Math.max(0.8 * M.bump(t, tDevice + 0.3, 1.2), 0.6 * live); }
    if (i === 4) { k = passBack; empty = true; lit = Math.max(M.bump(t, tPasskey + 0.3, 1.4), 0.6 * live); }
    if (i === 4) passkeyTile(x, LL.y, { label, k, lit });
    else M.lockTile(x, LL.y, { icon: lk.icon, label, k, empty, dim, lit, alpha });
  });
  // the passkey lives ON the device: a short terracotta link joins tiles 4 and 5 into one idea on "passkey"
  const link = K.io(t, tPasskey + 0.25, 0.5);
  if (link > 0) { const a = LL.xs[3] + LL.s / 2 + 8, b = LL.xs[4] - LL.s / 2 - 8;
    K.line(a, LL.y, K.lerp(a, b, link), LL.y, { color: C.accent, w: 3, alpha: 0.75 }); }
  // the password tag (two short lines under its label)
  if (drop > 0) ['still common', 'goal: no password'].forEach((ln, j) =>
    K.text(ln, LL.xs[0], 420 + j * 30 + 8 * (1 - K.ease.out(drop)), { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: drop }));

  // ---- year eyebrow under the tiles (2019 -> 2022), gone on [[no-password]] (the password tag takes the row)
  const eyeOut = 1 - K.io(t, tNoPw - 0.1, 0.5);
  const e19 = K.io(t, t2019 - 0.1, 0.5) * (1 - K.io(t, t2022 - 0.1, 0.4));
  const e22 = K.io(t, t2022 + 0.15, 0.5);
  const eo = { size: 20, align: 'center', tracking: 4 };
  if (e19 > 0) K.eyebrow('WEB STANDARD · 2019', 1400, 486 + 8 * (1 - e19), { ...eo, alpha: e19 * eyeOut });
  if (e22 > 0) K.eyebrow('APPLE · GOOGLE · MICROSOFT · 2022', 1400, 486 + 8 * (1 - e22), { ...eo, alpha: e22 * eyeOut });

  // ---- the passkey diagram (right column, under the line); fades out on [[required]]
  const diagIn = K.io(t, tPasskey + 0.2, 0.7);
  const diagA = diagIn * (1 - K.io(t, tReq - 0.1, 0.5));
  if (diagA > 0) K.layer(diagA, () => {
    const g = K.ctx();
    const px = 1130, py = 690, ph = 300;
    const rise = 16 * (1 - K.ease.out(diagIn));
    // the site
    const sx = 1450, sy = 545 + rise, sw = 340, sh = 210;
    const site = K.win(sx, sy, sw, sh, { kind: 'browser', title: '', url: 'example.com' });
    K.line(site.x + 40, site.y + 40, site.x + sw - 120, site.y + 40, { color: C.line2, w: 6, alpha: 0.7 });
    K.line(site.x + 40, site.y + 66, site.x + sw - 180, site.y + 66, { color: C.line2, w: 6, alpha: 0.5 });

    // the phone, holding the secret (a gold key)
    const keyGlow = Math.max(M.bump(t, tSecret, 1.0), unlockBump, 0.9 * M.bump(t, tNever + 0.2, 1.2));
    M.phone(px, py + rise, ph, { lit: 0.6 * unlockBump }, (scr) => {
      K.glow(scr.cx, scr.cy, 90, C.head, 0.12 + 0.22 * keyGlow);
      K.icon('key', scr.cx, scr.cy, 64, { color: C.head, w: 4 });
    });

    // "never sent to the site": a dashed line leaves the phone and stops halfway at a small bar
    const nk = K.io(t, tNever, 0.9);
    if (nk > 0) {
      const x0 = px + ph * 0.26 + 14, x1 = sx - 14, xm = K.lerp(x0, x1, 0.5), y = py + rise - 10;
      K.line(x0, y, K.lerp(x0, xm, nk), y, { color: C.head, w: 3, dash: [9, 9] });
      const bk = K.io(t, tNever + 0.75, 0.35);
      if (bk > 0) K.line(xm + 8, y - 22 * bk, xm + 8, y + 22 * bk, { color: C.soft, w: 4 });
    }

    // the unlock pills, under the phone, on their words
    const pills = [['face', tFace], ['fingerprint', tFinger], ['PIN', tPIN]];
    let x = 1010;
    pills.forEach(([s, at]) => {
      const w = K.measure(s, { size: 26, font: 'ui', weight: 600 }) + 26 * 1.6, k = K.io(t, at - 0.05, 0.4);
      if (k > 0) K.pill(s, x + w / 2, 886 + 10 * (1 - K.ease.out(k)), { size: 26, alpha: k, color: C.strong });
      x += w + 16;
    });

    // the look-alike: a crooked window with a lookalike address, terracotta outline
    const fk = K.io(t, tFake, 0.7);
    if (fk > 0) K.layer(fk, () => {
      const fx = 1478, fy = 682, fw = 340, fh = 200, cx = fx + fw / 2, cy = fy + fh / 2;
      g.save(); g.translate(cx + 40 * (1 - K.ease.out(fk)), cy); g.rotate(-0.035); g.translate(-cx, -cy);
      const r = K.win(fx, fy, fw, fh, { kind: 'browser', title: '', url: 'examp1e-login', urlLock: false });
      g.save(); g.strokeStyle = C.accent; g.lineWidth = 2.5; K.rr(fx, fy, fw, fh, 14); g.stroke(); g.restore();
      const sk = K.io(t, tSteal - 0.3, 0.5);
      if (sk > 0) K.text('nothing to steal', r.x + r.w / 2, r.y + r.h / 2 + 10, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: sk });
      g.restore();
    });
  });

  // ---- [[required]]: the 2021 note rises at once (no caption echo), the 2023 note on its year
  const n1 = K.io(t, tReq + 0.35, 0.6), n2 = K.io(t, t2023 - 0.1, 0.6);
  if (n1 > 0) K.layer(n1, () => K.at(0, 14 * (1 - K.ease.out(n1)), 1, 0, () =>
    K.note(1010, 515, 780, 'GITHUB · 2021', 'No account passwords for git', { size: 28 })));
  if (n2 > 0) K.layer(n2, () => K.at(0, 14 * (1 - K.ease.out(n2)), 1, 0, () =>
    K.note(1010, 700, 780, 'GITHUB · 2023', 'Two factor required to contribute code', { size: 28 })));

  // ---- [[old-lock]]: the line sorts itself, old locks vs today's locks
  const ok = K.io(t, tOld + 0.1, 0.6), tk = K.io(t, tOld + 0.5, 0.6);
  const by = 226;                                            // above the tiles (tile tops at 255); the password tag owns the row below
  const bracket = (a, b, k, text, col) => {
    K.line(a, by, K.lerp(a, b, k), by, { color: col, w: 2.5 });
    K.line(a, by, a, by + 12 * k, { color: col, w: 2.5 });
    if (k > 0.95) K.line(b, by, b, by + 12, { color: col, w: 2.5 });
    K.text(text, (a + b) / 2, by - 18 + 8 * (1 - K.ease.out(k)), { font: 'ui', weight: 600, size: 26, color: col, align: 'center', alpha: k });
  };
  if (ok > 0) bracket(LL.xs[0] - 60, LL.xs[1] + 60, ok, 'older locks', C.head);
  if (tk > 0) bracket(LL.xs[2] - 60, LL.xs[4] + 60, tk, "today's locks", C.accent);
});
