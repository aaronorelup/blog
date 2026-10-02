// 14 — Safe to ignore for now
// The building slides from 13's 'stage' to 'rules' and becomes a sorting key. A quiet row of "ignore" pills
// sits above it (eyebrow SAFE TO IGNORE FOR NOW), each readable (C.body) as it is named. On "Security" one
// terracotta pill drops under the row and stays bright: the exception; then the three ignore pills dim together. The
// building's lock glows with it. On "Keep one question" a card rises on the right (the scene's one 'back'):
// "street or lantern?"; on "street" the stone warms, on "lantern" the lanterns swell; on "which part?" a gold
// second line, while stone, sign and lock pulse in turn. Then the four rules settle beside their parts, each
// on its spoken word (Stone / Paint / Lock / Lantern), and the part stays lit.
SCENE('14', (t, S) => {
  const C = K.C;
  K.bg({ glow: 0.16, glowX: 640, glowY: 360 });

  // ---- times: every beat on the word that names it
  const tMem = S.find('memorize', 0, 0.84);
  const tDates = S.find(/^dates/i, 0, 1.71);
  const tAlg = S.find(/^which.?$/i, 0, 2.3);                // "or which algorithm replaced which."
  const tWhich2 = S.find(/^which.?$/i, 1, 4.11);            // the second "which" closes the clause
  const tNoChase = S.cue('no-chase', 5.14);
  const tEvery = S.find(/^every$/i, 0, 6.25);             // "chase every release"
  const tNever = S.find(/^never$/i, 0, 8.49);             // "most updates will never touch you"
  const tSec = S.find(/^security$/i, 0, 10.19);           // "Security updates are the exception"
  const tTake = S.find(/^take$/i, 0, 12.76);
  const tQ = S.cue('question', 14.2);                     // "Keep one question"
  const tStreet = S.find(/^street$/i, 0, 18.12);          // "is this street,"
  const tLantern = S.find(/^lantern$/i, 0, 18.89);        // "or lantern?"
  const tPart = S.find(/^which.?$/i, 2, 20.6);              // "which part?"
  const tStone = S.find(/^stone$/i, 0, 22.11);
  const tPaint = S.find(/^paint$/i, 0, 24.99);
  const tLock = S.find(/^lock$/i, 0, 27.17);
  const tLan = S.find(/^lantern$/i, 1, 30.3);
  void tNoChase; void tDates; void tWhich2; void tNever;

  // ---- the building: 13's 'stage' slides to 'rules'; 13's spread light settles back
  const L = M.lerpLayout('stage', 'rules', K.io(t, 0, 0.8));
  const settle = K.io(t, 0, 1.2);

  // part highlights: a pulse while asked about, then a resting glow once its rule is spoken
  const kStone = K.io(t, tStone, 0.6), kPaint = K.io(t, tPaint, 0.6), kLock = K.io(t, tLock, 0.6), kLan = K.io(t, tLan, 0.6);
  const pStreet = M.bump(t, tStreet - 0.1, 0.9);
  const pLan = M.bump(t, tLantern - 0.1, 0.9);
  const pPart = (i) => M.bump(t, tPart + 0.1 + i * 0.3, 0.6);
  const secGlow = M.bump(t, tSec - 0.05, 1.1);

  M.building(t, {
    layout: L,
    sign: 'Python 3.13',
    lock: 'passkey',
    roofLabel: 'PYTHON · 1991',
    stoneLit: Math.max(0.6 * pStreet, 1.0 * pPart(0), 0.75 * kStone),
    signLit: Math.max(1.0 * pPart(1), 0.6 * kPaint),
    lockLit: Math.max(0.8 * secGlow, 1.0 * pPart(2), 0.65 * kLock),
    doorGlow: Math.max(0.35 * secGlow, 0.3 * pPart(2)),
    light: Math.max(K.lerp(1, 0, settle), 0.55 * pLan, 0.35 * kLan),
    roofLit: 0.3 + 0.3 * Math.max(pLan, kLan),
  });

  // ---- the ignore row: eyebrow + three pills, readable while named; all three step back together once
  //      the exception ('except security updates') has landed. No underline: dimming is the "set aside".
  const rowY = 195, gap = 36, size = 30;
  const items = [
    { text: 'memorizing dates', at: tMem },
    { text: 'which algorithm replaced which', at: tAlg },
    { text: 'every release', at: tEvery },
  ];
  const tw = (s) => K.measure(s, { size, font: 'ui', weight: 600 }) + size * 1.6;
  const widths = items.map((it) => tw(it.text));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  const rowBack = K.io(t, tQ, 0.8);                      // the row steps back a little more when the question arrives
  const setAside = (i) => K.io(t, tSec + 0.5 + i * 0.12, 0.7);   // after the exception pill has risen in
  K.eyebrow('safe to ignore for now', 960, 142, {
    size: 20, align: 'center', tracking: 4, color: C.soft, alpha: K.io(t, tMem - 0.35, 0.5) * K.lerp(1, 0.75, rowBack),
  });
  let x = 960 - total / 2;
  items.forEach((it, i) => {
    const w = widths[i], cx = x + w / 2; x += w + gap;
    const k = K.io(t, it.at, 0.5);
    if (k <= 0) return;
    const off = setAside(i);
    const a = k * K.lerp(1, 0.55, off);
    K.layer(a, () => K.at(0, 12 * (1 - K.ease.out(k)), 1, 0, () => {
      M.paint(cx, rowY, it.text, { size, color: C.body, dim: 0.35 * off });
    }));
  });

  // ---- the exception: security updates, bright and terracotta, under the row
  const ke = K.io(t, tSec, 0.6);
  if (ke > 0) {
    const ey = 268 + 14 * (1 - K.ease.out(ke));
    K.layer(ke * K.lerp(1, 0.9, rowBack), () => {
      M.paint(960, ey, 'except security updates: take those', {
        size, color: C.strong, stroke: C.accent, warm: C.accent, lit: 0.35 + 0.5 * M.bump(t, tTake, 1.0),
      });
    });
  }

  // ---- the question card (the scene's one 'back'), right of the rules column
  const kq = K.io(t, tQ, 0.7, 'back');
  if (kq > 0) {
    const k2 = K.io(t, tPart, 0.5);
    const qx = 1600, qy = 600, qw = 400;
    const qh = K.lerp(96, 160, k2);
    const top = qy - qh / 2 + 18 * (1 - kq);
    K.layer(Math.min(1, K.io(t, tQ, 0.45)), () => {
      K.card(qx - qw / 2, top, qw, qh, { r: 26, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.35 + 0.3 * k2), glow: 0.15 + 0.25 * k2 });
      const l1 = top + (K.lerp(96, 96, k2) / 2) + 34 * 0.34;
      K.text('street or lantern?', qx, l1, { size: 34, font: 'ui', weight: 600, color: C.strong, align: 'center' });
      // the two halves warm as they are said
      const hs = Math.max(pStreet, 0), hl = Math.max(pLan, 0);
      if (hs > 0) K.glow(qx - 80, l1 - 12, 90, C.head, 0.12 * hs);
      if (hl > 0) K.glow(qx + 80, l1 - 12, 90, C.accent, 0.12 * hl);
      if (k2 > 0) {
        K.line(qx - 120, top + 96, qx + 120, top + 96, { k: k2, color: K.rgba(C.line2, 0.9), w: 1.5 });
        K.text('which part?', qx, top + 96 + 38 + 8 * (1 - K.ease.out(k2)), { size: 30, font: 'ui', weight: 600, color: C.head, align: 'center', alpha: k2 });
      }
    });
  }

  // ---- the answers: the four rules, each beside its part, on its spoken word
  const rx = 966;
  M.speedLabel(L, 'stone', K.seg(t - tStone, 0, 0.8), { kind: 'rule', x: rx });
  M.speedLabel(L, 'sign', K.seg(t - tPaint, 0, 0.8), { kind: 'rule', x: rx });
  M.speedLabel(L, 'lock', K.seg(t - tLock, 0, 0.8), { kind: 'rule', x: rx });
  M.speedLabel(L, 'lanterns', K.seg(t - tLan, 0, 0.8), { kind: 'rule', x: rx });
});
