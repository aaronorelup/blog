// 08 — Safe to ignore for now
// The street of years stays (07's 'full' layout), dims, and loses its year numbers ('full' → 'name' morph):
// the dates are the thing you can drop. Three quiet "ignore" pills sit in a row above it, each set aside with
// a soft strike drawn behind its words. On "Keep one question" the struck row fades away and the question
// pill "street or lantern?" rises above the row it freed (y 248, the scene's one 'back'). Under it, the way to
// answer it for something new, each half on its spoken word: "street: works the same for years" ·
// "lantern: changed this year" (the line is settled vs still changing, not age alone: VS Code 2015 is street,
// Copilot 2021 is lantern). Then its answers, two spans under the street: "street · learn it once" (gold,
// 1969–2020) and "lantern · check back often" (terracotta, 2021–2026).
SCENE('08', (t, S) => {
  const C = K.C, L = M.layout.s08;
  K.bg();

  // ---- times: every beat on the word that names it
  const tMem = S.find('memorize', 0, 0.7);                 // "You don't need to memorize a single date."
  const tDate = S.find(/^date/i, 0, 1.65);                 // year numbers fade off the tags
  const tQuiz = S.cue('no-dates', 2.24);                   // "Nobody will quiz you." strike 1
  const tWho = S.cue('no-history', 3.82);                  // "Who invented what,"
  const tWhich = S.find(/^which/i, 0, tWho + 1.37);        // "which old system won the argument,"
  const tWait = S.find(/^wait/i, 0, tWho + 3.6);           // "can wait." strikes 2 and 3
  const tKeep = S.cue('one-question', 8.32);               // "Keep one question" ignore row steps back
  const tAsk = S.find(/^is$/i, 0, tKeep + 2.6);            // "is this street, or lantern?"
  const tQStreet = S.find(/^street$/i, 0, tKeep + 3.03);   // "street," -> the street half of the test
  const tQLantern = S.find(/^lantern$/i, 0, tKeep + 3.86); // "lantern?" -> the lantern half
  const tStreet = S.find(/^street$/i, 1, tKeep + 5.06);  // "Street: learn it once."
  const tLantern = S.find(/^lantern$/i, 1, tKeep + 7.77); // "Lantern: check back often."

  // ---- the street: 07's resting street, dimmed, then names only
  const streetA = K.lerp(1, 0.5, K.io(t, 0.1, 0.9));
  const modeK = K.io(t, tDate, M.motion.draw);
  const streetGlow = M.bump(t, tStreet, 1.4);              // old tags warm briefly on "Street: learn it once"
  const lanternGlow = M.bump(t, tLantern, 1.4);            // the lanterns swell on "Lantern: check back often"
  const gm = M.street(t, {
    geom: 'full', alpha: streetA,
    mode: 'name', modeFrom: 'full', modeK,
    itemLit: 0.7 * streetGlow,
    lanternGlow: 1 + 0.8 * lanternGlow,
    tickLabels: K.lerp(1, 0.4, modeK),            // the decade numbers step back with the dates
  });
  // the lantern tags (shown since 04) lose their dates too: same shared tag, same right-aligned stack
  K.layer(streetA, () => M.LANTERNS.forEach((Ln, i) => {
    const r = M.lanternTagRect(gm, i, 'name');
    M.tag(r.x1, r.cy, M.words(Ln, 'name'), {
      size: gm.tag, tone: 'lantern', align: 'right', lit: 0.6 + 0.4 * lanternGlow,
      from: M.words(Ln, 'full'), fromK: modeK,
    });
  }));

  // ---- eyebrow: "safe to ignore" while the ignore row is up, "keep one question" once it goes
  const back = K.io(t, tKeep, 0.6);                        // the ignore row clears on "Keep one question"
  const eyeIn = K.io(t, 0, 0.6);
  K.eyebrow('Safe to ignore for now', 960, 168, { align: 'center', size: 22, alpha: eyeIn * (1 - K.clamp(back * 2)) });
  K.eyebrow('Keep one question', 960, 168, { align: 'center', size: 22, alpha: K.clamp(back * 2 - 1) });

  // ---- the three ignore pills, centred as a row at y 300 (clear of the lanterns at x > 1570)
  const pills = [
    { s: 'memorizing dates', at: tMem, strike: tQuiz },
    { s: 'who invented what', at: tWho, strike: tWait },
    { s: 'which system won', at: tWhich, strike: tWait + 0.2 },
  ];
  const size = 30, font = { size, font: 'ui', weight: 600 };
  const ws = pills.map((p) => K.measure(p.s, font) + size * 1.6), gap = 80, h = size * 1.9;
  let x = 960 - (ws.reduce((a, b) => a + b, 0) + gap * (pills.length - 1)) / 2;
  pills.forEach((p, i) => {
    const w = ws[i], cx = x + w / 2, x0 = x; x += w + gap;
    const k = K.io(t, p.at, 0.5, 'out');
    if (k <= 0 || back >= 1) return;
    const sk = K.io(t, p.strike, 0.6);
    const y = L.ignoreY + (1 - k) * 18;
    K.layer(k * K.lerp(1, 0.75, sk) * (1 - back), () => {
      K.card(x0, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: C.line2, shadow: false });
      // the soft strike sits behind the words, so they stay readable
      K.mark(x0 + size * 0.5, y - 2, w - size, sk, { color: C.quiet, w: 5, alpha: 0.85 });
      K.text(p.s, cx, y + size * 0.34, { ...font, color: C.soft, align: 'center' });
    });
  });

  // ---- the one question: the pill lands in the freed row at y 300, then its two answers under the street
  M.bracket(gm, 1969, 2020, { k: K.io(t, tStreet, M.motion.draw), color: C.head, y: L.spanY, label: 'street · learn it once', labelX: 960 });
  M.bracket(gm, 2021, 2026, { k: K.io(t, tLantern, M.motion.draw), color: C.accent, y: L.spanY, label: 'lantern · check back often', align: 'right' });

  const QY = 248, TY = 332;                               // question pill, then its sorting test (clear of the a2 tags at y ~378)
  const qk = K.io(t, tAsk, 0.6, 'back');                   // the scene's one overshoot
  if (qk > 0) {
    const qs = 34, parts = [
      { s: 'street', color: C.head }, { s: ' or ', color: C.strong },
      { s: 'lantern', color: C.accent }, { s: '?', color: C.strong },
    ].map((p) => ({ ...p, font: 'ui', weight: 600, size: qs }));
    const qw = parts.reduce((a, p) => a + K.measure(p.s, p), 0) + qs * 1.6, qh = qs * 1.9;
    const qy = QY + (1 - qk) * 26;                        // just above the row the struck pills freed
    K.layer(K.clamp(qk), () => {
      K.card(960 - qw / 2, qy - qh / 2, qw, qh, { r: qh / 2, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.4), shadow: false });
      K.spans(parts, 960, qy + qs * 0.34, { size: qs, align: 'center' });
    });
  }

  // ---- how to answer it: settled for years = street, changed this year = lantern (each half on its word)
  const ak = K.io(t, tQStreet, 0.5, 'out'), bk = K.io(t, tQLantern, 0.5, 'out');
  if (ak > 0) {
    const ts = 30, f = { font: 'ui', weight: 600, size: ts };
    const A = [{ s: 'street', color: C.head, ...f }, { s: ': works the same for years', color: C.body, ...f, weight: 500 }];
    const B = [{ s: 'lantern', color: C.accent, ...f }, { s: ': changed this year', color: C.body, ...f, weight: 500 }];
    const sep = { s: '   ·   ', color: C.quiet, ...f };
    const wA = A.reduce((a, p) => a + K.measure(p.s, p), 0), wS = K.measure(sep.s, sep);
    const wB = B.reduce((a, p) => a + K.measure(p.s, p), 0);
    const x0 = 960 - (wA + wS + wB) / 2;
    K.layer(ak, () => K.spans(A, x0, TY + (1 - ak) * 10, { size: ts }));
    K.layer(bk, () => {
      K.spans([sep], x0 + wA, TY, { size: ts });
      K.spans(B, x0 + wA + wS, TY + (1 - bk) * 10, { size: ts });
    });
  }
});
