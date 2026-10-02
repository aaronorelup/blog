// 06 — The paint: old tools, new versions
// The building slides to the 'left' layout; its sign is repainted for each tool the narration names (git, Python, VS Code),
// roof label and sign always changing together, while a dated "paint log" fills the right column (x 1000–1800) in year
// order. Each log row appears on its spoken words; names and versions change with the recurring repaint (M.paint from/k,
// ~0.5 s). Retired = dim + M.strike. Exit: the canonical building again ("PYTHON · 1991" / "Python 3.13", padlock), the
// stone lit gold, the log stepped back behind "Same stone. Fresh paint."
SCENE('06', (t, S) => {
  const C = K.C;
  K.bg({ glow: 0.16, glowX: 640, glowY: 540 });

  // ---------------------------------------------------------------- cues and spoken words (local seconds)
  const cGit = S.cue('git-paint', 1.73), cMain = S.cue('main', 15.44), cPy = S.cue('python-paint', 21.87);
  const cEd = S.cue('editor-paint', 37.2), cSame = S.cue('same-stone', 44.22);
  const w = (word, n, fb) => S.find(word, n, fb);
  const tPaint = w('paint', 0, 0.69), t2005 = w(/^2005/, 0, 2.55);
  const tShips = w('ships', 0, 4.87), tTimes = w('times', 0, 6.43);
  const t2019 = w('2019', 0, 7.85), tSwitch = w('switch', 0, 9.58), tRestore = w('restore', 0, 10.66), tCheckout = w('checkout', 0, 13.71);
  const tGitHub = w('GitHub', 0, 16.35), tMainW = w(/^main/, 0, 19.42);
  const tEvery = w('every', 0, 23.53), tOct = w(/^October/, 0, 23.84);
  const tPy2 = w('Python', 1, 24.54), tRetired = w('retired', 0, 25.65), t2020b = w(/^2020/, 1, 26.27);
  const t2024 = w(/^2024/, 0, 27.76), tPy313 = w('Python', 2, 28.91), tExp = w('experimental', 0, 31.02);
  const tThreads = w(/^threads/, 0, 33.9), tCores = w(/^cores/, 0, 35.78), tOnce = w(/^once/, 0, 36.32);
  const tMonth = w(/^month/, 0, 39.86), t2026 = w(/^2026/, 0, 40.81), tWent = w('went', 0, 42.16), tWeek = w(/^week/, 0, 43.1);
  const tFresh = w(/^Fresh/, 0, 45.58), tOver = w(/^over/, 0, 46.64);

  // ---------------------------------------------------------------- the building: slide to 'left', repaint the sign
  const L = M.lerpLayout('full', 'left', K.io(t, 0.1, 0.8));
  // the sign's paint history: each entry repaints from the one before it (same words = a fresh coat).
  // Git releases: 2.21 (Feb 2019), 2.22 (Jun 2019), 2.23 (Aug 2019, the one that added switch and restore).
  const SIGN = [
    [-Infinity, 'Python 3.13'],
    [cGit, 'git 2.21'],
    [tShips + 0.3, 'git 2.22'], [tTimes, 'git 2.23'],                   // "new versions several times a year"
    [cPy, 'Python 3.11'], [tEvery - 0.55, 'Python 3.12'], [tOct - 0.35, 'Python 3.13'],
    [cEd, 'VS Code'],
    [tFresh - 0.1, 'Python 3.13'], [tOver + 0.1, 'Python 3.13'],      // "Fresh paint, over and over": back to the home sign
  ];
  let si = 0; SIGN.forEach((e, i) => { if (t >= e[0]) si = i; });
  const sign = SIGN[si][1], signFrom = si > 0 ? SIGN[si - 1][1] : null, signK = si > 0 ? K.io(t, SIGN[si][0], 0.5) : null;

  // the roof label always changes together with the sign
  const ROOF = [[-Infinity, 'PYTHON · 1991'], [cGit, 'GIT · 2005'], [cPy, 'PYTHON · 1991'], [cEd, 'VS CODE · 2015'], [tFresh - 0.1, 'PYTHON · 1991']];
  let ri = 0; ROOF.forEach((e, i) => { if (t >= e[0]) ri = i; });
  const roofLabel = ROOF[ri][1], roofLabelFrom = ri > 0 ? ROOF[ri - 1][1] : null, roofLabelK = ri > 0 ? K.io(t, ROOF[ri][0], 0.5) : null;

  // carry 05's last lights (stone, sign, lock, door) across the crossfade, then let them settle
  const carry = 1 - K.io(t, 0.3, 1.2);
  const stoneLit = Math.max(0.55 * carry, K.io(t, cSame, 0.7));
  M.building(t, {
    layout: L,
    stoneIcons: [{ icon: 'book', k: 1 }, { icon: 'check', k: 1 }, { icon: 'envelope', k: 1 }],
    stoneLit,
    sign, signFrom, signK, signLit: Math.max(0.42 * carry, 0.35 * M.bump(t, tPaint, 1.1)),
    roofLabel, roofLabelFrom, roofLabelK,
    lock: 'lock', lockLit: 0.6 * carry, doorGlow: 0.27 * carry,
  });

  // ---------------------------------------------------------------- the paint log (right column), rows in year order
  const YX = 1096, PX = 1120, GAP = 14;             // year column right edge, first pill's left edge
  const ROWS = [270, 342, 414, 486, 558, 630, 730]; // 2005→ · 2019 · 2020 · Python cadence · 2020 · 2024 (+ cores caption) · 2015→2026
  const logA = 1 - 0.5 * K.io(t, cSame, 0.7);       // the log steps back for the closing line
  const mono = { font: 'mono', size: 26, align: 'left' };
  const fadeIn = (a, d = 0.45) => K.io(t, a, d);
  const YT = { font: 'mono', size: 26, weight: 600, color: C.head, align: 'right' };
  const year = (s, y, a) => { const k = fadeIn(a); if (k > 0) K.text(s, YX, y + 9 + 8 * (1 - k), { ...YT, alpha: k }); };
  // a year that repaints in step with its row's pill (old slides up and fades, new rises in), same rhythm as M.paint
  const yearRepaint = (from, to, y, a, rk) => {
    const k = fadeIn(a); if (k <= 0) return;
    if (rk < 0.45) { const ok = K.ease.in(K.seg(rk, 0, 0.45)); K.text(from, YX, y + 9 + 8 * (1 - k) - 18 * ok, { ...YT, alpha: k * (1 - ok) }); }
    else { const nk = K.ease.out(K.seg(rk, 0.45, 1)); K.text(to, YX, y + 9 + 18 * (1 - nk), { ...YT, alpha: nk }); }
  };
  const NOTE = { font: 'ui', weight: 500, size: 26 };
  const note = (s, x, y, a, o = {}) => { const k = fadeIn(a); if (k > 0) K.text(s, x + 14 * (1 - k), y + 9, { ...NOTE, color: o.color || C.body, align: 'left', alpha: k }); };
  // a pill that slides in from +16 px; returns its rect (drawn invisibly before it appears so the next one can chain)
  const pill = (x, y, s, a, o = {}) => {
    const k = fadeIn(a);
    return M.paint(x + 16 * (1 - K.ease.out(k)), y, s, { ...mono, ...o, alpha: k * (o.alpha ?? 1) });
  };

  K.layer(logA, () => {
    // header
    const hk = fadeIn(tPaint, 0.6);
    if (hk > 0) K.eyebrow('The paint log', 1010, 186, { size: 20, color: C.soft, alpha: hk });
    if (hk > 0) K.line(1010, 204, 1010 + 780 * K.ease.io(hk), 204, { color: C.line2, w: 1.5 });

    // row 1 — since 2005: git is born, and has kept shipping ever since
    let y = ROWS[0];
    year('2005 →', y, t2005);
    const r0 = pill(PX, y, 'git', cGit + 0.1);
    note('new versions several times a year', r0.x1 + 18, y, tShips);

    // row 2 — 2019: git switch, git restore (checkout still works: it stays, warm)
    y = ROWS[1];
    year('2019', y, t2019);
    const r1 = pill(PX, y, 'git switch', tSwitch);
    const r2 = pill(r1.x1 + GAP, y, 'git restore', tRestore);
    pill(r2.x1 + GAP, y, 'checkout', tCheckout, { color: C.body, lit: 0.6 * M.bump(t, tCheckout + 0.2, 1.4) });

    // row 3 — 2020: GitHub repaints master -> main
    y = ROWS[2];
    year('2020', y, cMain);
    const mk = fadeIn(cMain + 0.3);
    const mainK = K.io(t, tMainW - 0.2, 0.5);
    const rm = M.paint(PX + 16 * (1 - K.ease.out(mk)), y, 'main', { ...mono, from: 'master', k: mainK, alpha: mk });
    note('GitHub · new projects', Math.max(PX, rm.x1) + 18, y, tGitHub);

    // row 4 — Python's cadence: an undated rhythm row, opening the Python block
    y = ROWS[3];
    const rc = pill(PX, y, 'Python', cPy + 0.1, { font: 'ui', weight: 600 });
    note('a new version every October', rc.x1 + 18, y, tEvery - 0.1);

    // row 5 — 2020: Python 2 retired (dim + the dashed strike)
    y = ROWS[4];
    year('2020', y, t2020b);
    const dimK = K.io(t, tRetired, 0.5);
    const r4 = pill(PX, y, 'Python 2', tPy2, { dim: dimK, alpha: 1 - 0.45 * dimK });
    if (dimK > 0) M.strike(r4.x0 + 6, y - r4.h / 2 + 4, r4.x1 - 6, y + r4.h / 2 - 4, dimK);
    note('retired', r4.x1 + 18, y, tRetired + 0.15, { color: C.quiet });

    // row 6 — 2024: Python 3.13's experimental build; threads on several processor cores at once
    y = ROWS[5];
    year('2024', y, t2024);
    const r5 = pill(PX, y, 'Python 3.13', tPy313);
    note('experimental build', r5.x1 + 18, y, tExp);
    const sqK = fadeIn(tThreads, 0.5), allK = K.io(t, tOnce - 0.15, 0.5);
    if (sqK > 0) {
      const x0 = r5.x1 + 18 + K.measure('experimental build', NOTE) + 30, s = 28, step = 40;
      for (let i = 0; i < 4; i++) {
        const ki = K.ease.out(K.seg(t, tThreads + i * 0.12, tThreads + i * 0.12 + 0.4));
        if (ki <= 0) continue;
        const litK = i === 0 ? 1 : allK;
        const x = x0 + i * step, yy = y - s / 2 + 8 * (1 - ki);
        if (litK > 0) K.glow(x + s / 2, y, 32, C.head, 0.22 * litK * ki);
        K.card(x, yy, s, s, { r: 6, fill: K.mixColor(C.tile, C.head, 0.75 * litK), stroke: K.mixColor(C.line2, C.head, 0.8 * litK), alpha: ki });
      }
      // name the squares: they are processor cores (said at "processor cores")
      const ck = fadeIn(tCores - 0.1);
      if (ck > 0) K.text('cores', x0 + (3 * step + s) / 2, y + s / 2 + 34 + 6 * (1 - ck), { ...NOTE, color: C.soft, align: 'center', alpha: ck });
    }

    // row 7 — VS Code: '2015 · monthly' until the word "week", then year and cadence repaint together (2026 · weekly)
    y = ROWS[6];
    const vk = K.io(t, tWeek - 0.25, 0.5);
    yearRepaint('2015 →', '2026', y, cEd + 0.1, vk);
    const r6 = pill(PX, y, 'VS Code', cEd + 0.1, { font: 'ui', weight: 600 });
    const wk = fadeIn(tMonth - 0.3);
    M.paint(r6.x1 + GAP + 16 * (1 - K.ease.out(wk)), y, 'weekly', { ...mono, from: 'monthly', k: vk, alpha: wk });
  });

  // ---------------------------------------------------------------- the line
  // under the building: the stone it names is right above it
  const sb = M.at(L, 'bottom');
  M.say('Same stone. Fresh paint.', sb.y + 66, K.io(t, cSame + 0.1, 0.6), { size: 34, x: sb.x });
});
