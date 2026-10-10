// 07 — Which python actually ran?
// Several shops share one name; on this course's PC three streets carry a python, the first one wins
// (3.10, end of life this month); the Store stand-in is a signpost; since 3.14 the install manager makes
// python a signpost too; ask the shell (or Python) who wins.
SCENE('07', (t, S) => {
  const C = K.C, G3 = M.L.streets3;
  K.bg();

  // ---- cues (local seconds)
  const cMany = S.cue('many-shops', 0);
  const cObs = S.cue('observation', 14.26);
  const cCand = S.cue('candidates', 20.46);
  const cWin = S.cue('winner', 26.71);
  const cStore = S.cue('store-stub', 35.5);
  const cMgr = S.cue('install-manager', 46.75);
  const cAsk = S.cue('ask-which', 63.37);
  const w = (word, nth, fb) => S.find(word, nth, fb);

  // ================================================================ A: several shops, one name
  const aOut = 1 - K.io(t, cObs, 0.5);                       // phase A leaves on "observation"
  const shopsA = [
    { x: 760, src: 'installer', at: w('Python', 0, 3.83) + 0.1 },
    { x: 1060, src: 'conda', at: w('conda', 0, 6.21) },
    { x: 1360, src: 'uv', at: w(/^uv/i, 0, 7.04) },
    { x: 1660, src: 'Microsoft Store', at: w('stand-in', 0, 8.05), sign: true },
  ];
  const firstAt = w('first', 0, 12.04);
  const ghostAt = w('shops', 0, 1.87);                       // four dim silhouettes, already in place
  if (aOut > 0.002) K.layer(aOut, () => {
    M.eyebrow('several shops · one name', 960, 220, { alpha: K.io(t, w('several', 0, 1.41), 0.6) });
    shopsA.forEach((s, i) => {
      const g = K.stagger(t, ghostAt, i, 0.12, 0.6);
      const k = K.io(t, s.at, 0.5);
      const a = Math.max(0.24 * g, 0.24 + 0.76 * k) * (g > 0 || k > 0 ? 1 : 0);
      if (a <= 0.002) return;
      const y = 470;
      K.layer(Math.min(1, a), () => {
        if (s.sign) M.signpost(t, s.x, y - 6, 90, {});
        else {
          if (i === 0) K.glow(s.x, y, 150, C.head, 0.35 * K.io(t, firstAt - 0.1, 0.5));
          K.folder(s.x, y, 72, { color: i === 0 && t > firstAt ? K.mixColor('#C99A45', '#E0B055', K.io(t, firstAt - 0.1, 0.5)) : undefined });
        }
        K.pill('python.exe', s.x, y + 100, { font: 'mono', size: 26, icon: 'file' });
      });
      if (k > 0) K.glow(s.x, y, 120, C.line2, 0.25 * k * (1 - K.io(t, s.at + 0.5, 0.6)));
      M.label(s.src, s.x, y + 165 + (1 - k) * 10, { color: s.sign ? C.accent : C.body, size: 26, alpha: k });
    });
    // the courier takes the first
    K.arrow(390, 470, 690, 470, { k: K.io(t, w('takes', 0, 12.56), 0.7), color: C.head, dash: [10, 8], w: 3 });
  });

  // ================================================================ the courier (persists)
  // phase A: stands at (300, 470); on "observation" it steps to the start of street 1; on "winner" it walks street 1
  const start = M.streetAt(0, 0, G3);
  const walkAt = w('first', 1, cWin + 0.2);                  // "The first one won"
  const uWalk = 0.8 * K.io(t, walkAt, 0.7);
  const toGrid = K.io(t, cObs, 0.7);
  const atShop = M.streetAt(0, uWalk, G3);
  const cx = K.lerp(300, atShop.x, toGrid), cy = K.lerp(470, atShop.y, toGrid);
  const walking = (t > cObs && t < cObs + 0.7) || (t > walkAt && t < walkAt + 0.7) ? 1 : 0;

  // ================================================================ B: the observed grid (3 streets)
  // grid visibility: in from "observation", out during install-manager, back on "ask-which"
  const gridA = K.io(t, cObs, 0.6) * (1 - K.io(t, cMgr, 0.6)) + K.io(t, cAsk, 0.6) * (t > cAsk ? 1 : 0);
  // store-stub focus: rows 1 and 3 recede while row 2 is the subject
  const focus2 = K.io(t, cStore, 0.6) * (1 - K.io(t, cMgr, 0.6));
  const rowsK = [0, 1, 2].map((i) => K.stagger(t, cObs + 0.4, i, 0.15, 0.7));
  const cand = [
    { name: 'C:\\Users\\…\\Python310', state: 'idle', at: cCand },
    { name: 'C:\\Users\\…\\WindowsApps', state: 'signpost', at: w('Store', 1, 23.23) },
    { name: 'C:\\Users\\…\\miniconda3', state: 'idle', at: w('Miniconda', 0, 25.03) },
  ];
  const threeAt = w('three', 0, 18.44);                      // "had three candidates"
  const litK = K.io(t, walkAt + 0.55, 0.4);                  // row 1 lights as the courier arrives
  const dimK = K.io(t, walkAt + 0.7, 0.5);                   // the others were never visited
  // on "ask-which": every candidate shows again, in order
  const everyAt = w('every', 0, 66.09);
  const undim = (i) => K.io(t, everyAt + (i - 1) * 0.3, 0.5);

  const one = (i, row, a) => {                                // draw one street alone at alpha a
    if (a <= 0.002) return;
    const rows = [{ k: 0 }, { k: 0 }, { k: 0 }];
    rows[i] = row;
    M.streets(t, G3, { rows, alpha: a });
  };
  if (gridA > 0.002) K.layer(gridA, () => {
    [0, 1, 2].forEach((i) => {
      const rowA = i === 1 ? 1 : 1 - 0.65 * focus2;
      const c = cand[i];
      // on "three candidates" every shop drops in at 40%; each comes up to full on its own words
      const preK = K.stagger(t, threeAt, i, 0.25, 0.7);
      const fullK = K.io(t, c.at, 0.5);
      const shopK = Math.max(preK, fullK);
      const shopA = 0.4 + 0.6 * fullK;
      let dimU = i === 0 ? 0 : dimK;
      if (t > cAsk) dimU = 1 - undim(i);
      if (i === 1) dimU *= 1 - focus2;           // the signpost comes back to full for its beat
      // base street (line + number) under everything that is not dimmed
      one(i, { state: 'empty', k: rowsK[i] }, rowA * (1 - dimU));
      if (shopK > 0) {
        const lit = i === 0 ? litK : 0;
        one(i, { name: c.name, file: 'python.exe', state: c.state, k: shopK }, rowA * shopA * (1 - lit) * (1 - dimU));
        if (lit > 0) one(i, { name: c.name, file: 'python.exe', state: 'lit', k: 1 }, rowA * lit);
        if (dimU > 0) one(i, { name: c.name, file: 'python.exe', state: i === 1 ? 'signpost' : 'dim', k: 1 }, rowA * dimU * (i === 1 ? 0.32 : 1));
      }
    });
  });

  // observed eyebrow
  const eyeA = K.io(t, cObs + 0.5, 0.6) * (1 - K.io(t, cMgr, 0.6)) + K.io(t, cAsk, 0.6) * (t > cAsk ? 1 : 0);
  M.eyebrow('observed · this course’s Windows PC · 2026-10-10', 960, 190, { alpha: eyeA });

  // the courier, with the name it is looking for
  const courA = (1 - K.io(t, cMgr, 0.6) + (t > cAsk ? K.io(t, cAsk, 0.6) : 0)) * (1 - 0.65 * focus2);
  M.courier(t, cx, cy, 80, { walking, lit: litK, alpha: courA });
  const askPill = K.io(t, w('python', 0, 3.83), 0.5) * (1 - K.io(t, walkAt + 0.5, 0.4));
  if (askPill > 0.002) K.pill('python', cx, cy - 95, { font: 'mono', size: 28, alpha: askPill * courA });

  // winner: end of life + "the order did"
  const eolA = K.io(t, w('end', 0, 30.67), 0.5) * (1 - K.io(t, cMgr, 0.6)) + (t > cAsk ? K.io(t, cAsk, 0.6) : 0);
  K.pill('3.10 · end of life this month', 1000, 262, { size: 26, icon: 'clock', iconColor: C.soft, color: C.strong, alpha: eolA * (1 - 0.65 * focus2) });
  const orderA = K.io(t, w('Nobody', 0, 32.28), 0.6) * (1 - K.io(t, cStore, 0.5));
  if (orderA > 0.002) K.spans([
    { s: 'Nobody chose this. ', color: C.body },
    { s: 'The order did.', color: C.strong },
  ], 960, 810, { size: 30, font: 'ui', weight: 600, align: 'center', alpha: orderA });

  // ================================================================ store stub
  const storeA = focus2;
  if (storeA > 0.002) K.layer(storeA, () => {
    K.ring(952, 510, 300, 62, K.io(t, w('signpost', 0, 37.04), 0.7), { color: C.accent, w: 3, rot: 0 });
    M.label('on the list ≠ installed', 1190, 616, { size: 30, color: C.strong, alpha: K.io(t, w('Found', 0, 43.71), 0.5) });
    const termIn = K.io(t, w('with', 0, 38.2), 0.5);
    M.termStrip(t, [
      { at: w('with', 0, 38.2) + 0.3, cmd: 'python', cps: 16 },
      { at: w('opens', 0, 40.72), out: 'Python was not found; run without arguments to install from the Microsoft Store…', color: C.body },
    ], { x: 180, y: 760, w: 1560, h: 160, size: 26, rows: 2, alpha: termIn });
  });

  // ================================================================ C: since 3.14, install manager
  const mgrA = K.io(t, cMgr + 0.3, 0.6) * (1 - K.io(t, cAsk, 0.5));
  if (mgrA > 0.002) K.layer(mgrA, () => {
    M.eyebrow('since Python 3.14 · install manager', 960, 200);
    const signAt = w('signpost', 1, 53.19);
    const leadAt = w('pointing', 0, 54.79);
    const sk = K.io(t, cMgr + 0.7, 0.6, 'out');                 // the signpost waits on the street, dim
    const litS = K.io(t, w('real', 0, 52.06), 0.6);            // ...and lights on "the real python a signpost"
    // "Windows' recommended install manager": the tool that puts the signpost there
    const pmAt = w('install', 0, 50.5);
    const pm = K.io(t, pmAt - 0.15, 0.5);
    if (pm > 0.002) {
      K.pill('Python install manager', 760, 262 + (1 - pm) * 14, { size: 28, icon: 'gear', iconColor: C.soft, color: C.strong, alpha: pm });
      K.line(760, 296, 760, 336, { k: K.io(t, w('makes', 0, 51.54), 0.4), color: C.soft, dash: [6, 6], w: 2 });
    }
    // a street with the signpost on it, pointing at the real install
    K.line(300, 470, 1190, 470, { color: C.line2, w: 2, k: K.io(t, cMgr + 0.3, 0.8) });
    M.label('python', 560, 420, { font: 'mono', size: 30, color: C.strong, alpha: K.io(t, cMgr + 0.6, 0.5) });
    if (sk > 0) K.layer(sk * (0.4 + 0.6 * litS), () => M.signpost(t, 760, 400 - (1 - sk) * 20, 110, { point: K.io(t, leadAt, 0.8), reach: 390 }));   // one group alpha, so the dim post never shows through the board
    M.label('a signpost too', 760, 535, { color: C.accent, alpha: K.io(t, signAt, 0.5) });
    const fk = K.io(t, leadAt + 0.5, 0.5, 'out');
    if (fk > 0) K.layer(fk, () => {
      K.glow(1310, 400, 140, C.head, 0.3);
      K.folder(1310, 400, 80, { color: '#E0B055' });
      M.label('the install', 1310, 490, { font: 'mono', size: 26, color: C.head });
    });
    M.label('check where it leads', 1310, 535, { size: 30, color: C.strong, alpha: K.io(t, w('check', 0, 56.39), 0.5) });

    // the classic installer's checkbox, being retired
    const oldAt = w('classic', 0, 58.48);
    const ok = K.io(t, oldAt, 0.6);
    if (ok > 0) K.layer(ok, () => {
      M.label('classic installer', 960, 660, { color: C.soft });
      const tw = K.measure('Add python.exe to PATH', { font: 'ui', size: 30, weight: 600 });
      const bx = 960 - (tw + 54) / 2;
      const g = K.ctx();
      g.save(); g.strokeStyle = C.body; g.lineWidth = 3; K.rr(bx, 718, 34, 34, 6); g.stroke(); g.restore();
      K.text('Add python.exe to PATH', bx + 54, 746, { font: 'ui', size: 30, weight: 600, color: C.strong });
      const rk = K.io(t, w('retired', 0, 62.35) - 0.3, 0.6);
      K.line(bx - 16, 735, bx + tw + 70, 735, { k: rk, color: C.soft, w: 4 });
      M.label('being retired', 960, 820, { color: C.soft, alpha: rk });
    });
  });

  // ================================================================ D: ask who wins
  if (t > cAsk - 0.1) {
    const pills = ['where.exe python', 'which -a python', 'Get-Command python -All', 'sys.executable'];
    const to = { font: 'mono', size: 28, weight: 600 };
    const ws = pills.map((s) => K.measure(s, to) + 28 * 1.6);
    const gap = 26, sep = 70;
    const total = ws.reduce((a, b) => a + b, 0) + gap * 2 + sep;
    let x = 960 - total / 2;
    const xs = ws.map((wd, i) => { const c = x + wd / 2; x += wd + (i === 2 ? sep : gap); return c; });
    const shellAt = w('ask', 0, 64.99), pyAt = w('ask', 1, 68.34);
    const shellA = K.io(t, shellAt - 0.1, 0.5);
    M.eyebrow('ask the shell', (xs[0] + xs[2]) / 2, 812, { alpha: shellA });
    M.eyebrow('ask Python', xs[3], 812, { alpha: K.io(t, pyAt, 0.5) });
    pills.forEach((s, i) => {
      const a = i < 3 ? K.stagger(t, shellAt, i, 0.18, 0.5) : K.io(t, pyAt + 0.2, 0.5);
      const k = a;
      if (k <= 0) return;
      K.pill(s, xs[i], 868 + (1 - k) * 16, { ...to, alpha: k });
    });
  }
});
