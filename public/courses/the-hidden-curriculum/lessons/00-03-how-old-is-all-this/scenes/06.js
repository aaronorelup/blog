/* 06 — The surprises you'll hit
   Opening: 05 hands over its 'raised' street with year-only tags. Those tags fade out WHOLE right away (no
   bare-year hold) and the lantern stack stays off (05 already faded it), while the street folds into the
   thin 'strip' along the top.
   Four surprise cards (420 × 420, centred in the frame, y 380–800) each rise (12 px) on their own cue:
   1 the C:\ prompt (MS-DOS, early 1980s) · 2 a git answer from ten years ago: "still works", "the street hasn't moved" ·
   3 Python 2 (2000 to 2020): bracketless print vs print(), labelled by comments; a gold span 2000→2020 draws on
     the strip on "Python" and the pin drops at 2020 on "2020"; status "breaks in Python 3" (clock, cream, not a cross)
     parallel to card 2's gold "still works" · 4 an AI out of date about AI: what it learned (solid) stops at
     "training ended"; a terracotta dot past the cut is "new tool".
   Pins: gold on the old street (1981, 2016, 2020), terracotta at the lantern end (2024). Each pin keeps a faint
   dashed tie to its own card once the card is up (ties land at chosen points on each card's top so none cross);
   the newest tie is brighter, and all four even out at the rule.
   The rule: gold bracket + "old street: old answers mostly hold" under cards 1–3 (card 3's "breaks" line is the
   "mostly"), terracotta bracket + "lantern: check the date" under card 4.
   Exit (last ~1.25 s before S.out): cards, pins, ties, brackets and pills fade, then the strip grows back into
   07's 'full' street (mode 'full', tags at 0.5, lantern pool light, bg glow at the lanterns). */
SCENE('06', (t, S) => {
  const C = K.C, g = K.ctx();
  // layout: M.layout.s06 is 400 × 360 at y 520; this scene uses a larger, vertically centred row
  const L = { cards: [290, 736, 1182, 1628], cardW: 420, cardH: 420, top: 380, bracketY: 830, pillY: 886 };

  // ---- times (local)
  const cDrive = S.cue('c-drive', 2.89);
  const cOld = S.cue('old-answer', 11.15);
  const cPy = S.cue('python-two', 17.58);
  const cAI = S.cue('stale-ai', 25.82);
  const cRule = S.cue('rule', 32.47);
  const tC = S.find(/^C$/, 0, cDrive + 0.2);                 // "C:\" (punctuation stripped)
  const tHabit = S.find('habit', 0, cDrive + 4.1);
  const tDos = S.find(/^DOS$/, 0, cDrive + 5.2);              // "M S DOS"
  const tEarly = S.find('early', 0, cDrive + 6.4);
  const tAgo = S.find('ago', 0, cOld + 1.9);
  const tWorks = S.find('works', 0, cOld + 2.9);
  const tStreet = S.find('street', 0, cOld + 5.0);
  const tPrint = S.find('print', 0, cPy + 1.4);
  const tPython = S.find('Python', 0, cPy + 3.0);
  const tRetired = S.find('retired', 0, cPy + 4.1);
  const t2020 = S.find(/^2020$/, 0, cPy + 4.85);
  const tSame = S.find('Same', 0, cPy + 6.1);
  const tDate = S.find('date', 0, cAI + 1.6);
  const tAbout = S.find(/^AI$/, 1, cAI + 2.3);                // "... about AI"
  const tLearned = S.find('learned', 0, cAI + 3.9);
  const tTraining = S.find('training', 0, cAI + 5.1);
  const tEnded = S.find('ended', 0, cAI + 5.55);
  const tLantern = S.find('Lantern', 0, cRule + 3.0);

  // ---- exit: everything on the cards steps away, then the strip grows back into 07's full street
  const tOut = S.out;
  const outA = 1 - K.io(t, tOut - 1.25, 0.5);                 // cards, pins, ties
  const ruleA = 1 - K.io(t, tOut - 1.1, 0.5);                 // brackets + pills, a beat later
  const xk = K.io(t, tOut - 0.9, 0.85, 'io');                 // strip → full, done just before the hand-over

  // ---- the street: 05's raised street (year tags) folds into the strip at once; the tags fade out whole
  // (S.out of 05 is local -0.4 here, so the fold starts inside the crossfade)
  const morph = K.io(t, -0.4, 0.9, 'io');
  const tagsGone = K.io(t, -0.4, 0.45);
  const gm = M.lerpGeom(M.lerpGeom('raised', 'strip', morph), 'full', xk);
  K.bg({ glow: K.lerp(0.4, 0.22, xk), glowX: K.lerp(K.W * 0.24, 1660, xk), glowY: K.lerp(K.H * 0.08, 300, xk) });
  if (xk > 0) M.light(gm, 0, { a: 0.3 * xk, h: 150 });        // 07's lantern pool, before the street
  const streetSwell = M.bump(t, tStreet - 0.1, 1.4);          // "the street hasn't moved"
  if (streetSwell > 0) M.light(gm, 1, { a: 0.2 * streetSwell, h: 46 });
  const lanternSwell = M.bump(t, tLantern - 0.1, 1.2);
  M.street(t, {
    geom: gm, mode: xk > 0 ? 'full' : 'year', lanterns: 1, lanternMode: 'year',
    // year tags leave whole at the start; 07's tags return at half strength during the exit
    itemAlpha: xk > 0 ? 0.5 : 1 - tagsGone,
    lanternTags: 0,
    lanternGlow: 1 + 0.8 * lanternSwell,
  });

  // ---- the four surprises: where each lives on the street, when its pin lands, where its tie meets the card
  const cards = [
    { at: cDrive, year: 1981, pin: tDos, color: C.head, tieX: 420 },
    { at: cOld, year: M.YEARS.oldAnswer, pin: tAgo, color: C.head, tieX: 850 },
    { at: cPy, year: M.YEARS.py2end, pin: t2020, color: C.head, tieX: 1190 },
    { at: cAI, year: 2024, pin: tAbout, color: C.accent, tieX: 1560 },
  ];
  const nextAt = (i) => (cards[i + 1] ? cards[i + 1].at : 1e9);   // not Infinity: K.io(t, Infinity) is NaN, and a NaN alpha is ignored
  const ruleK = K.io(t, cRule, 0.6);
  // the newest card is the focus; older ones settle back, and all return for the rule
  const focus = (i) => K.lerp(K.lerp(1, 0.55, K.io(t, nextAt(i) - 0.1, 0.5)), 1, ruleK);
  const top = L.top, bot = L.top + L.cardH;
  const box = (i) => ({ cx: L.cards[i], l: L.cards[i] - L.cardW / 2, t: top, w: L.cardW, h: L.cardH, b: bot });

  // Python 2's life on the street: a short gold span 2000 → 2020 under the strip's decade labels, drawn on "Python"
  if (outA > 0) M.bracket(gm, 2000, M.YEARS.py2end, { k: K.io(t, tPython - 0.1, 0.8), y: gm.y + 58, color: C.head, alpha: 0.85 * outA });

  // pins on the strip, each with a faint dashed tie to its own card (the newest tie a little brighter)
  if (outA > 0) cards.forEach((c, i) => {
    const x = M.X(c.year, gm), r = box(i);
    const k = K.io(t, Math.max(c.pin, c.at) + 0.25, 0.6);
    if (k > 0) {
      const newest = 1 - K.io(t, nextAt(i) - 0.1, 0.5);
      const a = K.lerp(K.lerp(0.4, 0.85, newest), 0.6, ruleK) * outA;
      K.arrow(x, gm.y + 76, c.tieX, r.t - 10, { k, head: false, dash: [4, 8], w: 2, color: K.mixColor(C.line2, c.color, 0.6), alpha: a });
    }
    M.marker(t, c.pin, x, gm.y - 8, { color: c.color, alpha: outA });
  });

  // rule tints: the three old-street cards warm gold, the lantern card terracotta
  const ruleNew = K.io(t, tLantern - 0.1, 0.6);
  const cardFrame = (i, fn) => {
    const c = cards[i], k = K.io(t, c.at, 0.6, 'out');
    if (k <= 0 || outA <= 0) return;
    const r = box(i), tint = i < 3 ? ruleK : ruleNew;
    K.layer(k * focus(i) * outA, () => {
      g.save(); g.translate(0, (1 - k) * 12);
      K.card(r.l, r.t, r.w, r.h, { fill: C.tile, stroke: K.mixColor(C.line2, c.color, 0.15 + 0.6 * tint) });
      fn(r);
      g.restore();
    });
  };
  // eyebrow: 26 px, shrunk only if it would not fit the card
  const eyebrow = (s, r, at, color = C.gold) => {
    let size = 26; const fit = r.w - 44;
    const wOf = (sz) => K.measure(s, { font: 'ui', weight: 600, size: sz, upper: true }) + 2 * s.length;
    while (size > 22 && wOf(size) > fit) size -= 1;
    K.eyebrow(s, r.cx, r.t + 50, { size, tracking: 2, align: 'center', color, alpha: K.io(t, at, 0.5) });
  };
  const label = (s, x, y, at, o = {}) =>
    K.text(s, x, y + (1 - K.io(t, at, 0.5)) * 10, { font: 'ui', weight: 600, size: 32, color: C.strong, align: 'center', alpha: K.io(t, at, 0.5), ...o });
  // a status line: icon + words, centred, rising on `at`
  const status = (r, y, at, icon, s, col, glow) => {
    const k = K.io(t, at - 0.1, 0.5);
    if (k <= 0) return;
    K.layer(k, () => {
      const sw = K.measure(s, { font: 'ui', weight: 600, size: 32 }), x0 = r.cx - (sw + 50) / 2;
      if (glow) K.glow(r.cx, y - 10, 160, col, 0.1 * k);
      K.icon(icon, x0 + 17, y - 11 + (1 - k) * 10, 34, { color: col, w: 3.5 });
      K.text(s, x0 + 50, y + (1 - k) * 10, { font: 'ui', weight: 600, size: 32, color: col });
    });
  };

  // 1 · the C:\ prompt: a habit from MS-DOS, early 1980s
  cardFrame(0, (r) => {
    eyebrow('Windows terminal', r, cDrive + 0.2, C.soft);
    const w = K.win(r.cx - 180, r.t + 82, 360, 176, { kind: 'terminal', title: 'Terminal', shadow: false });
    K.term(w, t, [{ at: cDrive, cmd: '' }], { prompt: 'C:\\Users\\you>', size: 32 });
    // underline the drive letter and backslash as they are said
    const px = w.x + 28, cw = K.measure('C:\\', { font: 'mono', size: 32 });
    K.mark(px, w.y + 28 + 32 + 10, cw, K.io(t, tC + 0.15, 0.5), { w: 4 });
    label('a habit from MS-DOS', r.cx, r.t + 330, tHabit);
    label('early 1980s', r.cx, r.t + 380, tEarly, { font: 'mono', weight: 600, size: 28, color: C.head });
  });

  // 2 · a git answer from ten years ago that still works
  cardFrame(1, (r) => {
    eyebrow('Answer · 10 years ago', r, cOld + 0.2);
    // a forum-style answer: an avatar and two quiet lines of prose, then the command
    const ax = r.l + 48, ay = r.t + 112;
    g.save(); g.fillStyle = C.line2; g.beginPath(); g.arc(ax, ay, 18, 0, 7); g.fill(); g.restore();
    K.line(ax + 34, ay - 8, r.l + r.w - 40, ay - 8, { color: C.line2, w: 8 });
    K.line(ax + 34, ay + 12, r.l + r.w - 126, ay + 12, { color: C.line2, w: 8 });
    K.card(r.l + 26, r.t + 160, r.w - 52, 84, { r: 12, fill: C.code, stroke: C.line, shadow: false });
    K.text('git commit -m "fix"', r.cx, r.t + 212, { font: 'mono', weight: 600, size: 30, color: C.strong, align: 'center' });
    status(r, r.t + 330, tWorks, 'check', 'still works', C.head, true);
    label("the street hasn't moved", r.cx, r.t + 380, tStreet, { size: 28, color: C.soft });
  });

  // 3 · print without parentheses is Python 2 (2000 to 2020); each line says which version it is
  cardFrame(2, (r) => {
    eyebrow('Python 2 · 2000 to 2020', r, tPython - 0.1);
    const w = K.win(r.cx - 180, r.t + 76, 360, 204, { kind: 'code', title: 'hello.py', shadow: false });
    const oldK = K.io(t, tPrint - 0.2, 0.4), verK = K.io(t, tPython - 0.1, 0.5), newK = K.io(t, tSame - 0.1, 0.6);
    const x = w.x + 26, y0 = w.y;                         // w.y is the content top (under the title bar)
    // the old answer: full at first, settles back to quiet once the newer line arrives
    K.text('# Python 2', x, y0 + 32, { font: 'mono', size: 26, color: C.soft, alpha: verK * K.lerp(1, 0.7, newK) });
    K.text('print "hello"', x, y0 + 66, { font: 'mono', size: 30, color: K.mixColor(C.strong, C.quiet, newK), alpha: oldK });
    K.text('# Python 3', x, y0 + 106 + (1 - newK) * 8, { font: 'mono', size: 26, color: C.soft, alpha: newK });
    K.text('print("hello")', x, y0 + 140 + (1 - newK) * 8, { font: 'mono', size: 30, color: C.strong, alpha: newK });
    status(r, r.t + 330, tRetired, 'clock', 'breaks in Python 3', C.strong, false);
    label('same street, older building', r.cx, r.t + 380, tSame, { size: 28, color: C.soft });
  });

  // 4 · an AI out of date about AI: what it learned stops where its training ended
  cardFrame(3, (r) => {
    eyebrow('An AI, asked about AI', r, cAI + 0.2, C.accent);
    M.brain(r.l + 80, r.t + 148, 96, { color: C.strong, w: 3 });
    // its reply, greyed
    const bk = K.io(t, tDate - 0.1, 0.5);
    K.layer(bk, () => {
      const bx = r.l + 146, by = r.t + 94, bw = r.w - 166, bh = 110;
      K.card(bx, by, bw, bh, { r: 18, fill: C.code, stroke: C.line2, shadow: false });
      g.save(); g.fillStyle = C.code; g.strokeStyle = C.line2; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(bx + 1, by + 42); g.lineTo(bx - 14, by + 54); g.lineTo(bx + 1, by + 64); g.fill(); g.stroke(); g.restore();
      K.line(bx + 1, by + 44, bx + 1, by + 62, { color: C.code, w: 3 });
      K.text("I'm not aware", bx + 18, by + 46, { font: 'mono', size: 26, color: C.quiet });
      K.text('of that tool.', bx + 18, by + 86, { font: 'mono', size: 26, color: C.quiet });
    });
    // a little timeline of what it learned: solid up to the cut, dashed after, and a new tool past it
    const ly = r.t + 312, lx0 = r.l + 36, lx1 = r.l + r.w - 32, cut = r.l + 196, dx = r.l + 334;
    const lk = K.io(t, tLearned - 0.1, 0.8);
    if (lk > 0) K.line(lx0, ly, cut, ly, { color: C.soft, w: 3, k: lk });
    const ck = K.io(t, tTraining - 0.1, 0.5);
    K.line(cut, ly - 32, cut, ly + 16, { color: C.body, w: 2, dash: [5, 6], alpha: ck });
    K.text('training ended', cut, ly + 56 + (1 - ck) * 10, { font: 'ui', weight: 600, size: 28, color: C.body, align: 'center', alpha: ck });
    const ek = K.io(t, tEnded, 0.6);
    if (ek > 0) {
      K.line(cut + 10, ly, lx1, ly, { color: C.line2, w: 2, dash: [5, 7], k: ek });
      const dk = K.io(t, tEnded + 0.2, 0.5, 'out');
      K.layer(dk, () => {
        K.glow(dx, ly, 34, M.palette.lanternGlow, 0.45 * dk);
        g.save(); g.fillStyle = C.accent; g.beginPath(); g.arc(dx, ly, 8 * K.lerp(0.6, 1, dk), 0, 7); g.fill(); g.restore();
        K.text('new tool', dx, ly - 26 + (1 - dk) * 8, { font: 'ui', weight: 600, size: 28, color: C.accent, align: 'center' });
      });
    }
  });

  // ---- the rule: old street, old answers mostly hold · lantern, check the date
  if (ruleA > 0) K.layer(ruleA, () => {
    const span = (x0, x1, y, k, col) => {
      if (k <= 0) return;
      const a = K.seg(k, 0, 0.15), b = K.seg(k, 0.1, 0.85), c = K.seg(k, 0.85, 1);   // skip zero-length dots
      if (a > 0) K.line(x0, y - 14, x0, y, { color: col, w: 2.5, k: a });
      if (b > 0) K.line(x0, y, x1, y, { color: col, w: 2.5, k: b });
      if (c > 0) K.line(x1, y, x1, y - 14 * c, { color: col, w: 2.5 });
    };
    const by = L.bracketY, py = L.pillY;
    span(box(0).l, box(2).l + L.cardW, by, K.io(t, cRule, 0.8), C.head);
    span(box(3).l, box(3).l + L.cardW, by, K.io(t, tLantern - 0.1, 0.6), C.accent);
    const p1 = K.io(t, cRule + 0.1, 0.6, 'out'), p2 = K.io(t, tLantern, 0.6, 'out');
    K.layer(p1, () => K.pill('old street: old answers mostly hold', (box(0).l + box(2).l + L.cardW) / 2, py + (1 - p1) * 16,
      { size: 30, color: C.head, stroke: K.rgba(C.head, 0.55) }));
    K.layer(p2, () => K.pill('lantern: check the date', box(3).cx, py + (1 - p2) * 16,
      { size: 30, color: C.accent, stroke: K.rgba(C.accent, 0.6) }));
  });
});
