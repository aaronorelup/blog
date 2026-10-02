/* 08 — The lock: from passwords to codes.
   The building (left layout) keeps its stone and paint but the light goes to the door: its lock is replaced step by step
   (key -> key + phone -> key + text code -> key + authenticator app). The lock line (M.LOCKLINE, y 300) starts here
   with five empty slots and fills its first three tiles; 09 fills the last two. Under the tiles, one small diagram per beat:
   a leaked key copied onto many doors, know + have, the SIM swap, the authenticator code, the push prompt. */
SCENE('08', (t, S) => {
  const C = K.C;
  const L = 'left';

  // ---- timing (local seconds; fallbacks are the narrated times)
  const cPass = S.cue('password', 2.9), cTwo = S.cue('two-factor', 8.07), cSms = S.cue('sms', 13.34);
  const cApp = S.cue('app', 36.47), cPush = S.cue('push', 49.32);
  const tLocks = S.find('locks', 0, 0.42);
  const tPassword = S.find('password', 0, 3.71);
  const tLeaked = S.find('leaked', 0, 6.52), tReused = S.find('reused', 0, 7.19);
  const tTwo = S.find('two', 0, 9.0);
  const tKnow = S.find('something', 0, 10.26), tHave = S.find('something', 1, 11.82);
  const tCode = S.find('code', 0, 15.64), tText = S.find('text', 0, 16.58);
  const tSim = S.find('SIM', 0, 20.77), tMoving = S.find('moving', 1, 23.98), tCodes = S.find('codes', 0, 26.56);
  const t2017 = S.find('2017', 0, 28.48), tRestr = S.find('restricted', 0, 34.09);
  const tAuth = S.find('authenticator', 0, 37.83);
  const tGoogle = S.find('Google', 0, 39.38), tMs = S.find('Microsoft', 0, 40.84), tAuthy = S.find('Authy', 0, 43.01);
  const tThirty = S.find('thirty', 0, 45.46), t2011 = S.find('2011', 0, 47.87);
  const tThis = S.find('this', 0, 52.12);

  K.bg({ glow: 0.16, glowX: 520, glowY: 640 });

  // ================================================================ the building: light on the door
  // Opens on 07's exit (sign "my-app 1.0", roof "YOUR PROJECT", lock: key) and hands 09 its opening frame
  // (sign "Python 3.13", roof "PYTHON · 1991", lock key + app): the sign is repainted back once, quietly, as the
  // scene opens on "the locks"; then stone and paint step back while the door carries the scene, and return at the end.
  const back = K.io(t, 0.25, 0.55);                         // the one repaint back to our building
  const fk = K.io(t, 0.9, 0.8) * (1 - K.io(t, S.dur - 0.7, 0.8));
  const dimText = K.io(t, tRestr, 0.7);
  const swaps = [
    { at: tTwo, to: ['key', 'phone'] },
    { at: tText, to: ['key', { icon: 'text', dim: dimText }] },
    { at: tAuth, to: ['key', 'app'] },
  ];
  let lock = 'key', lockFrom = null, lockK = null;
  swaps.forEach((sw, i) => {
    if (t >= sw.at) { lockFrom = i ? swaps[i - 1].to : 'key'; lock = sw.to; lockK = K.io(t, sw.at, 0.5); }
  });
  const bumps = [tPassword, ...swaps.map((sw) => sw.at)].reduce((a, at) => a + 0.8 * M.bump(t, at, 1.1), 0);
  const lockLit = Math.min(1, 0.25 + bumps);
  M.building(t, {
    layout: L,
    sign: back > 0 ? 'Python 3.13' : 'my-app 1.0', signFrom: back > 0 && back < 1 ? 'my-app 1.0' : null, signK: back > 0 && back < 1 ? back : null,
    roofLabel: back > 0 ? 'PYTHON · 1991' : 'YOUR PROJECT', roofLabelFrom: 'YOUR PROJECT', roofLabelK: back > 0 && back < 1 ? back : null,
    fade: { sign: 1 - 0.45 * fk, stone: 1 - 0.3 * fk },
    lock, lockFrom, lockK, lockLit,
    lockShake: M.bump(t, tLeaked, 0.45),
    doorGlow: 0.3 * fk + 0.25 * M.bump(t, tLocks, 1.2),
  });

  // ================================================================ the lock line (tiles 1–3 filled here; 4–5 wait for 09)
  const LL = M.LOCKLINE;
  const reveal = [tPassword, tCode, tAuth];
  M.LOCKS.forEach((lk, i) => {
    const slotA = K.io(t, tLocks + i * 0.1, 0.6);
    const k = i < 3 ? K.io(t, reveal[i], 0.6) : 0;
    M.lockTile(LL.xs[i], LL.y, {
      empty: true, alpha: slotA, k, icon: lk.icon, label: lk.label,
      dim: i === 1 ? dimText : 0,
      lit: i < 3 ? 0.8 * M.bump(t, reveal[i], 1.4) : 0,
    });
  });

  // ================================================================ beat 1: one password, many doors (leaked + reused)
  const leakOut = 1 - K.io(t, tTwo - 0.2, 0.5);
  if (t > tLeaked - 0.1 && leakOut > 0) K.layer(leakOut, () => {
    const src = M.at(L, 'lock');
    const doors = [1180, 1390, 1600];
    doors.forEach((dx, i) => {
      const a = tLeaked + i * 0.22, dk = K.io(t, a - 0.1, 0.5), kk = K.io(t, a, 0.8);
      const land = K.seg(t, a + 0.7, a + 1.1);
      // a plain square door (the building's door, small): another site
      K.layer(dk, () => {
        const g = K.ctx(), w = 70, h = 104, y0 = 540;
        if (land > 0) K.glow(dx, y0 + h / 2, 90, C.accent, 0.18 * land);
        g.save(); g.fillStyle = K.mixColor(C.panel, C.page, 0.4); g.fillRect(dx - w / 2, y0, w, h);
        g.strokeStyle = K.mixColor(C.line2, C.accent, 0.5 * land); g.lineWidth = 2; g.strokeRect(dx - w / 2, y0, w, h);
        g.fillStyle = K.mixColor(C.tile, C.accent, 0.42);
        for (let j = 0; j < 3; j++) { K.rr(dx - w / 2 + 3 + j * 21.5, y0 + 2, 20, 24, [0, 0, 3, 3]); g.fill(); }
        g.restore();
      });
      // a faint copy of the door's key arcs over and lands on it
      if (kk > 0) {
        const ex = dx, ey = 610, cx = (src.x + ex) / 2, cy = Math.min(src.y, ey) - 150;
        const u = K.ease.io(kk), x = (1 - u) * (1 - u) * src.x + 2 * (1 - u) * u * cx + u * u * ex;
        const y = (1 - u) * (1 - u) * src.y + 2 * (1 - u) * u * cy + u * u * ey;
        M.lockIcon('key', x, y, 44, { alpha: 0.35 + 0.5 * kk });
      }
    });
    M.say('same password, many doors', 712, K.io(t, tReused, 0.6), { font: 'ui', x: 1390 });
  });

  // ================================================================ beat 2: two factor = something you know + something you have
  const tfOut = 1 - K.io(t, cSms - 0.1, 0.5);
  if (t > tTwo - 0.1 && tfOut > 0) K.layer(tfOut, () => {
    const ek = K.io(t, tTwo, 0.5);
    K.eyebrow('two factor', 1100, 520 + 8 * (1 - ek), { size: 22, color: C.accent, alpha: ek });
    const row = (y, icon, txt, a) => {
      const k = K.io(t, a, 0.6); if (k <= 0) return;
      const dy = 12 * (1 - K.ease.out(k));
      K.layer(k, () => {
        M.lockIcon(icon, 1140, y + dy, 64, {});
        K.text(txt, 1210, y + dy + 11, { font: 'ui', weight: 600, size: 32, color: C.strong });
      });
    };
    row(600, 'key', 'something you know', tKnow);
    const pk = K.io(t, tHave - 0.2, 0.4);
    K.text('+', 1140, 672, { font: 'ui', weight: 600, size: 32, color: C.soft, align: 'center', alpha: pk });
    row(740, 'phone', 'something you have', tHave);
  });

  // ================================================================ beat 3: the text code and the SIM swap
  const smsOut = 1 - K.io(t, cApp - 0.1, 0.5);
  if (t > tCode - 0.2 && smsOut > 0) K.layer(smsOut, () => {
    const PA = { x: 1180, y: 690 }, PB = { x: 1600, y: 690 }, ph = 250;
    const aK = K.io(t, tCode, 0.6), bK = K.io(t, tSim, 0.6);
    const go = K.io(t, tCodes, 0.9);                       // the codes follow the number
    const stolen = K.seg(go, 0.6, 1);
    const msg = (scr, a, lit) => K.layer(a, () => {
      if (lit) K.glow(scr.cx, scr.cy, 80, C.accent, 0.18 * lit);
      K.icon('envelope', scr.cx, scr.cy - 26, 48, { color: C.accent });
      K.text('code', scr.cx, scr.cy + 46, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
    });
    K.layer(aK, () => M.phone(PA.x, PA.y + 12 * (1 - K.ease.out(aK)), ph, {}, (scr) => msg(scr, 1 - 0.75 * K.seg(go, 0, 0.4), 0)));
    if (bK > 0) K.layer(bK, () => M.phone(PB.x, PB.y + 12 * (1 - K.ease.out(bK)), ph, { lit: 0.5 * stolen }, (scr) => msg(scr, stolen, stolen)));
    const lab = { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' };
    K.text('your phone', PA.x, PA.y + ph / 2 + 44, { ...lab, alpha: bK });
    K.text('their phone', PB.x, PB.y + ph / 2 + 44, { ...lab, color: C.accent, alpha: bK });
    // "your number" is moved onto their phone
    const mk = K.io(t, tMoving, 1.2);
    const ax0 = 1268, ax1 = 1512, ay = 610;
    K.arrow(ax0, ay, ax1, ay, { k: mk, bend: -40, color: C.accent, w: 3, dash: [10, 9] });
    if (mk > 0) {
      const u = K.ease.io(mk), px = K.lerp(1335, 1465, u);
      K.pill('your number', px, 520, { size: 26, color: C.strong, stroke: C.accent, alpha: Math.min(1, mk * 3) });
    }
    // and the codes go with it
    if (go > 0 && go < 1) {
      const u = K.ease.io(go), ex = K.lerp(PA.x + 40, PB.x - 40, u);
      K.icon('envelope', ex, PA.y + 20 - 26 * Math.sin(Math.PI * u), 36, { color: C.accent, alpha: Math.sin(Math.PI * Math.min(1, go * 1.4)) });
    }
    // NIST, 2017: text codes restricted (the tile above dims and takes the strike on "restricted")
    const nk = K.io(t, t2017, 0.6);
    K.eyebrow('NIST · 2017', LL.xs[1], 462 + 8 * (1 - nk), { size: 22, color: C.accent, align: 'center', alpha: nk });
  });

  // ================================================================ beat 4: the authenticator app (and beat 5: the push prompt)
  if (t > tAuth - 0.5) {
    const pk = K.io(t, tAuth - 0.4, 0.6), PX = 1150, PY = 700, PH = 420;
    const pushK = K.io(t, cPush, 0.5);
    const yes = M.bump(t, tThis, 1.0);
    K.layer(pk, () => M.phone(PX, PY + 14 * (1 - K.ease.out(pk)), PH, { lit: 0.25 + 0.5 * yes }, (scr) => {
      // the code view: a fresh code every 30 s (shown sped up: one roll every 3 s), a draining bar
      const codeA = 1 - pushK;
      if (codeA > 0) K.layer(codeA, () => {
        K.icon('clock', scr.cx, scr.y + 58, 42, { color: C.accent });
        const P = 3, t0 = tAuth, el = Math.max(0, t - t0), n = Math.floor(el / P), f = (el - n * P) / P;
        const codeOf = (i) => {
          if (i <= 0) return '482 913';
          const r = K.rng(8000 + i * 37); let s = '';
          for (let j = 0; j < 6; j++) { s += Math.floor(r() * 10); if (j === 2) s += ' '; }
          return s;
        };
        const mono = { font: 'mono', weight: 600, size: 40, color: C.strong, align: 'center' };
        const sw = n > 0 ? K.ease.io(K.seg(f, 0, 0.1)) : 1;   // the roll: old code slides up and out, new one rises
        if (sw < 1) K.text(codeOf(n - 1), scr.cx, scr.cy + 14 - 16 * sw, { ...mono, alpha: 1 - sw });
        K.text(codeOf(n), scr.cx, scr.cy + 14 + 16 * (1 - sw), { ...mono, alpha: sw });
        const bx0 = scr.x + 22, bw = scr.w - 44, by = scr.cy + 52;
        K.line(bx0, by, bx0 + bw, by, { color: C.line2, w: 5 });
        K.line(bx0, by, bx0 + bw * (1 - f), by, { color: C.accent, w: 5 });
      });
      // the push view: no code, just a question
      if (pushK > 0) K.layer(pushK, () => {
        const dy = 14 * (1 - K.ease.out(pushK));
        K.icon('check', scr.cx, scr.y + 58 + dy, 42, { color: C.accent });
        K.text('Was this', scr.cx, scr.cy - 34 + dy, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
        K.text('you?', scr.cx, scr.cy + 4 + dy, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
        if (yes > 0) K.glow(scr.cx, scr.cy + 66 + dy, 90, C.head, 0.28 * yes);
        K.pill('Yes', scr.cx, scr.cy + 66 + dy, { size: 26, color: C.head, stroke: K.mixColor(C.line2, C.head, 0.4 + 0.6 * yes), glow: yes });
        K.pill('No', scr.cx, scr.cy + 126 + dy, { size: 26, color: C.soft });
      });
    }));

    // right column: the apps that make the codes, on their names
    const colA = 1 - 0.6 * pushK;
    K.layer(colA, () => {
      const pillL = (s, y, a) => {
        const k = K.io(t, a, 0.5); if (k <= 0) return;
        const w = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        K.pill(s, 1320 + w / 2 + 14 * (1 - K.ease.out(k)), y, { size: 26, color: C.strong, alpha: k });
      };
      pillL('Google Authenticator', 560, tGoogle);
      pillL('Microsoft Authenticator', 630, tMs);
      pillL('Authy', 700, tAuthy);
    });
    // the 30-second rule, then (on push) what replaces it
    const rk = K.io(t, tThirty, 0.6) * (1 - pushK);
    if (rk > 0) K.text('new code every 30 s', 1320 + 14 * (1 - K.ease.out(rk)), 800, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: rk });
    const qk = K.io(t, cPush + 0.3, 0.6);
    if (qk > 0) K.text('no code, just a tap', 1320 + 14 * (1 - K.ease.out(qk)), 800, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: qk });
    // the standard's year, under its tile
    const sk = K.io(t, t2011, 0.6);
    K.eyebrow('standard · 2011', LL.xs[2], 462 + 8 * (1 - sk), { size: 22, color: C.accent, align: 'center', alpha: sk });
  }
});
