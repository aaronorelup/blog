// 12 — The surprises you'll hit
// The building, small at top centre, with "paint · every year" and "lock · fastest" beside it; a marker ring
// on the part each surprise lives in. Five surprise cards (3 + 2) rise on their cues; four live in the paint,
// the last one in the lock. Opens as 11 leaves the building (passkey on the door); on "replaced" the door lock is
// swapped for a new one (08's move, reused) and the scene ends on the passkey that 13 opens on.
SCENE('12', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg({ glow: 0.16, glowX: 960, glowY: 300 });

  const L = 'small';
  const cue = (n, f) => S.cue(n, f);
  const word = (w, nth, f) => S.find(w, nth, f);

  // ---- beats (local seconds)
  const tSpeeds = word('speeds', 0, 0.7);
  const tTut = cue('tutorial', 3.15), tFails = word('fails', 0, 4.75), tPaint = word('paint', 0, 9.07);
  const tMM = cue('master-main', 11.6), tMaster = word('master', 0, 12.65), tMain = word(/^main/, 0, 14.08);
  const tSame = word('same', 0, 15.1), tDefault = word('default', 0, 16.18);
  const tDep = cue('deprecated', 19.18), tDepWord = word('deprecated', 0, 19.7), tStill = word('still', 0, 21.08);
  const tWarn = word('warning', 0, 24.03), tPlan = word('plan', 0, 26.04);
  const tPy = cue('python-two', 27.53), tPrint = word('print', 0, 28.73), tPython = word('Python', 0, 31.15);
  const tForced = cue('forced', 33.0), tSite = word('site', 0, 34.02), tSet = word('set', 0, 37.9), tWont = word(/^won/, 0, 36.13);
  const tPasskey = word(/^passkey/, 0, 40.57), tReplaced = word(/^replaced/, 0, 45.01);
  const starts = [tTut, tMM, tDep, tPy, tForced];

  // ---- focus: which card is being talked about
  let active = -1; starts.forEach((s, i) => { if (t >= s) active = i; });
  const lockPhase = K.io(t, tForced + 0.1, 0.6);           // 0 = paint cards, 1 = the lock card

  // ---- the building, small at top centre. It opens as 11 left it and 13 takes it: passkey on the door (08–10's lock).
  // At this scale the sign is the blank pill ('small' hides small text; words here would be wider than the walls), and
  // on "the paint changed" it takes a fresh coat (the fresh-paint glow), which 13 then fills with 'Python 3.13'.
  // On "replaced" the door does 08's lock swap once: a new lock goes in, still a passkey, so 13 opens on the same lock.
  const swapK = K.io(t, tReplaced + 0.05, 0.55);
  M.building(t, {
    layout: L,
    alpha: K.io(t, -0.4, 0.6),
    detail: false, stoneLabel: '',
    lock: 'passkey',
    lockFrom: swapK > 0 && swapK < 1 ? 'passkey' : null,
    lockK: swapK > 0 && swapK < 1 ? swapK : null,
    lockShake: M.bump(t, tReplaced - 0.25, 0.5),
    lockLit: K.io(t, tReplaced, 0.5),
    doorGlow: 0.6 * K.io(t, tReplaced + 0.2, 0.6),
    sign: '', signFrom: t < tPaint ? null : '', signK: t < tPaint ? null : K.io(t, tPaint, 0.7),
  });

  // ---- the two speeds beside it (named on "speeds"; the one in play stays bright)
  const paintFocus = active < 0 ? 1 : 1 - 0.6 * lockPhase;
  const lockFocus = active < 0 ? 1 : 0.4 + 0.6 * lockPhase;
  M.speedLabel(L, 'sign', K.seg(t, tSpeeds, tSpeeds + 0.8), { text: 'paint · every year', alpha: paintFocus });
  M.speedLabel(L, 'lock', K.seg(t, tSpeeds + 0.45, tSpeeds + 1.25), { text: 'lock · fastest', alpha: lockFocus });

  // ---- the marker: a soft outline round the sign (cream, paint), that hops to the door (terracotta, lock).
  // It fades in whole (no arc being drawn across the roof) and stays inside the walls' width.
  const sign = M.at(L, 'sign'), door = M.at(L, 'door');
  const signBox = { x: sign.x, y: sign.y, w: 150 * sign.s + 18, h: 57 * sign.s + 14 };
  const doorBox = { x: door.x, y: door.y, w: door.w + 14, h: door.h + 12 };
  const mk = K.io(t, tPaint, 0.5);
  if (mk > 0) {
    const j = K.io(t, tForced + 0.1, 0.6);
    const hop = Math.sin(Math.PI * j);                         // fade through the jump so it reads as a hop, not a smear
    const bx = K.lerp(signBox.x, doorBox.x, j), by = K.lerp(signBox.y, doorBox.y, j) - 10 * hop;
    const bw = K.lerp(signBox.w, doorBox.w, j) * K.lerp(1.15, 1, K.ease.out(mk)), bh = K.lerp(signBox.h, doorBox.h, j) * K.lerp(1.15, 1, K.ease.out(mk));
    const col = K.mixColor(C.strong, C.accent, j);
    g.save(); g.globalAlpha *= mk * (1 - 0.7 * hop);
    g.lineWidth = 2.5; g.strokeStyle = col;
    K.rr(bx - bw / 2, by - bh / 2, bw, bh, Math.min(bh / 2, K.lerp(bh / 2, 10, j))); g.stroke();
    g.restore();
  }

  // ---- the five cards
  const H = 240, ROW1 = 505, ROW2 = 785;
  const cards = [
    { x: 380, y: ROW1, eyebrow: 'PAINT · AN OLD TUTORIAL', part: 'paint' },
    { x: 960, y: ROW1, eyebrow: 'PAINT · GITHUB 2020', part: 'paint' },
    { x: 1540, y: ROW1, eyebrow: 'PAINT · A WARNING', part: 'paint' },
    { x: 670, y: ROW2, eyebrow: 'PAINT · PYTHON 2', part: 'paint' },
    { x: 1250, y: ROW2, eyebrow: 'LOCK · A SITE YOU KNOW', part: 'lock' },
  ];
  const mono = (s, x, y, o = {}) => K.text(s, x, y, { font: 'mono', size: 26, weight: 500, color: C.strong, ...o });
  const draw = [
    // 1. a tutorial's command no longer works
    (r) => {
      g.save(); K.rr(r.x, r.y, r.w, r.h - 8, 14); g.fillStyle = K.mixColor(C.page, C.tile, 0.25); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 1.5; g.stroke(); g.restore();
      const cmd = '$ tool --old-flag', typed = K.typed(cmd, t, tTut + 0.35, 24);
      mono(typed, r.x + 22, r.y + 56, { size: 28 });
      if (typed.length < cmd.length || t < tFails) {
        if (K.caretOn(t)) g.save(), (g.fillStyle = C.strong), g.fillRect(r.x + 24 + K.measure(typed, { font: 'mono', size: 28, weight: 500 }), r.y + 34, 13, 28), g.restore();
      }
      const ok = K.io(t, tFails, 0.4);
      if (ok > 0) mono('unknown option --old-flag', r.x + 22, r.y + 108 + 8 * (1 - ok), { color: C.soft, alpha: ok });
    },
    // 2. master and main: the same idea, a new default name
    (r) => {
      const cy = r.y + 42;
      const a = K.io(t, tMaster, 0.45), b = K.io(t, tMain, 0.45), e = K.io(t, tSame, 0.4);
      const lit = 0.8 * K.io(t, tDefault, 0.6);
      if (a > 0) M.paint(r.x + r.w / 2 - 110, cy + 10 * (1 - a), 'master', { font: 'mono', weight: 500, color: C.soft, alpha: a });
      if (e > 0) K.text('=', r.x + r.w / 2, cy + 11, { font: 'mono', size: 34, color: C.body, align: 'center', alpha: e });
      if (b > 0) M.paint(r.x + r.w / 2 + 110, cy + 10 * (1 - b), 'main', { font: 'mono', weight: 600, color: C.head, lit, alpha: b });
      const d = K.io(t, tDefault, 0.45);
      if (d > 0) K.text('new default name', r.x + r.w / 2, r.y + 124 + 10 * (1 - d), { font: 'ui', size: 26, weight: 600, color: C.body, align: 'center', alpha: d });
    },
    // 3. deprecated: a warning, not an error
    (r) => {
      const a = K.io(t, tDepWord - 0.1, 0.45), y = r.y + 50;
      if (a > 0) {
        const o = { font: 'mono', size: 30, weight: 500 };
        const w1 = K.measure('npm ', o), w2 = K.measure('warn', o);
        K.layer(a, () => K.spans([{ s: 'npm ', color: C.soft }, { s: 'warn', color: C.head }, { s: ' deprecated', color: C.strong }], r.x + 6, y, o));
        K.mark(r.x + 6 + w1, y + 14, w2, K.io(t, tWarn, 0.5), { w: 4 });
      }
      const s1 = K.io(t, tStill, 0.45), s2 = K.io(t, tPlan, 0.45);
      const lo = { font: 'ui', size: 26, weight: 600 };
      if (s1 > 0) K.text('still works', r.x + 6, r.y + 118 + 10 * (1 - s1), { ...lo, color: C.body, alpha: s1 });
      if (s2 > 0) {
        const x2 = r.x + 6 + K.measure('still works', lo);
        K.text(' · plan to move', x2, r.y + 118 + 10 * (1 - s2), { ...lo, color: C.strong, alpha: s2 });
      }
    },
    // 4. print without parentheses is Python 2. The old form is the thing to RECOGNISE, so it arrives at full brightness
    //    and gets its name on "Python 2"; only then does the Python 3 form arrive under it, and the old line dims a little
    //    (no strike: it isn't broken, it's a different version).
    (r) => {
      const a = K.io(t, tPrint - 0.1, 0.45), n2 = K.io(t, tPython, 0.45), b = K.io(t, tPython + 0.9, 0.5);
      const o = { font: 'mono', size: 30, weight: 500 }, lo = { font: 'ui', size: 26, weight: 600, align: 'right' };
      const y1 = r.y + 44, y2 = r.y + 112;
      const oldCol = K.mixColor(C.strong, C.body, 0.6 * b), oldA = 1 - 0.2 * b;
      if (a > 0) K.text('print "hello"', r.x + 6, y1 + 8 * (1 - a), { ...o, color: oldCol, alpha: a * oldA });
      if (n2 > 0) K.text('Python 2', r.x + r.w - 6, y1 + 8 * (1 - n2), { ...lo, color: oldCol, alpha: n2 * oldA });
      if (b > 0) {
        K.text('print("hello")', r.x + 6, y2 + 10 * (1 - b), { ...o, color: C.strong, alpha: b });
        K.text('Python 3', r.x + r.w - 6, y2 + 10 * (1 - b), { ...lo, color: C.strong, alpha: b });
      }
    },
    // 5. a site you've used for years: set up an authenticator app or a passkey
    (r) => {
      const cx = r.x + r.w / 2, iy = r.y + 30;
      const shake = M.bump(t, tWont, 0.5) * Math.sin(t * 40) * 4;
      const a = K.io(t, tSite, 0.45);
      const s1 = K.io(t, tSet - 0.1, 0.5), s2 = K.io(t, tPasskey - 0.1, 0.5);
      // the icon row: your old key, swapped for the app, then app + passkey side by side
      if (a > 0) {
        if (s1 < 1) M.lockIcon('key', cx + shake, iy, 60, { alpha: a * (1 - s1), dim: 0.5 * s1 });
        if (s1 > 0) {
          const ax = K.lerp(cx, cx - 40, K.ease.io(s2));
          K.at(ax, iy, K.lerp(1.25, 1, K.ease.out(s1)), 0, () => M.lockIcon('app', 0, 0, K.lerp(60, 52, s2), { alpha: s1 }));
        }
        if (s2 > 0) K.at(cx + 40, iy, K.lerp(1.25, 1, K.ease.out(s2)), 0, () => M.lockIcon('passkey', 0, 0, 52, { alpha: s2 }));
      }
      const lo = { font: 'ui', size: 26, weight: 600, align: 'center' };
      if (s1 > 0) K.text('Set up an authenticator app', cx, r.y + 98 + 10 * (1 - s1), { ...lo, color: C.strong, alpha: s1 });
      if (s2 > 0) K.text('or a passkey to continue', cx, r.y + 134 + 10 * (1 - s2), { ...lo, color: C.body, alpha: s2 });
    },
  ];
  cards.forEach((c, i) => {
    const k = K.io(t, starts[i], 0.55);
    if (k <= 0) return;
    const next = i < 4 ? starts[i + 1] : Infinity;
    const isLast = i === 4;
    const lit = isLast ? K.io(t, starts[i] + 0.2, 0.5) * (0.6 + 0.4 * K.io(t, tReplaced, 0.5)) : K.io(t, starts[i] + 0.2, 0.5) * (1 - K.io(t, next, 0.5));
    const alpha = 1 - 0.35 * K.io(t, next, 0.5);
    M.surprise(c.x, c.y, { eyebrow: c.eyebrow, part: c.part, k, lit, h: H, alpha }, draw[i]);
  });
});
