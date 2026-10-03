/* 00.06 · 01 — The point (title card, noBadge).
   Text block left from frame 0 (eyebrow, title, purpose line, conclusion pill). The case file rises in at the
   'title' position (s .6, icon-only tabs) on "unstuck" and opens with 'CASE 00.06' and a first line on its sheet;
   [[five-tabs]] each tab lights gold on its verb (error, search, docs, ask, test) and stays lit; at the same moment a
   row appears under the pill: the spoken verb (state colour) plus the tab's name in grey ('Read the error · Clue').
   [[clerk]] the clerk rises at the file's left edge; its dashed legwork hops over the first four tabs, which settle
   to done as it reaches them; on "your job" you appear right of the file; on "verdict" your cream line lands a
   tick on Experiment (done). [[every-district]] six gold dots under the file, a soft glow walks across them. */
SCENE('01', (t, S) => {
  const C = K.C;
  const cTabs = S.cue('five-tabs', 12.06), cClerk = S.cue('clerk', 22.23), cDist = S.cue('every-district', 27.95);
  const tUnstuck = S.find(/^unstuck/i, 0, 3.84);
  const verbs = [
    S.find(/^error/i, 0, cTabs + 0.45), S.find(/^search/i, 0, cTabs + 1.4), S.find(/^docs/i, 0, cTabs + 4.0),
    S.find(/^ask/i, 0, cTabs + 4.8), S.find(/^test/i, 0, cTabs + 8.6),
  ];
  const tLeg = S.find(/^legwork/i, 0, cClerk + 1.7), tClues = S.find(/^clues/i, 0, cClerk + 3.9);
  const tYour = S.find(/^your$/i, 0, cClerk + 2.7), tVerdict = S.find(/^verdict/i, 0, cClerk + 4.8);
  const tAll = S.find(/^all$/i, 0, cDist + 3.0);

  K.bg({ glow: 0.4, glowX: 1440, glowY: 560 });
  if (K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.5, mask: [800, 1000] });
  K.petals(t, { n: 6, seed: 6, avoid: [[120, 120, 1180, 530], [120, 530, 720, 830], [1060, 280, 1840, 900]] });

  // ---- text block (all visible from frame 0)
  const X = 160;
  K.eyebrow('ORIENTATION · 00.06', X, 170, { size: 22 });
  K.title('How to learn anything technical', X, 250, { size: 72 });
  K.para('A five-step habit for getting unstuck, and what AI changed about who does each step.', X, 322, 960,
    { font: 'read', size: 34, color: C.body });
  const pillTxt = 'AI does the legwork · you give clues, check the verdict';
  const pw = K.measure(pillTxt, { font: 'ui', weight: 600, size: 30 }) + 48;
  K.pill(pillTxt, X + pw / 2, 466, { size: 30, color: C.head, stroke: K.rgba(C.head, 0.55), fill: '#1C1B2A' });

  // ---- tab states: lit on its verb (0 -> 1), done as the clerk's legwork reaches it (1 -> 2).
  // Experiment stays lit: its verdict is your cream tick above it, not a clerk's done disc.
  const legA = tLeg - 0.6, legD = 2.0;                       // legwork draws across the four tabs over ~2 s
  const reachAt = (i) => legA + legD * ((i + 1) / 4) - 0.15;  // with `from`, tab i is reached after leg i+1 of 4
  const tickAt = tVerdict + 0.15;
  const v = verbs.map((at, i) => K.io(t, at - 0.1, M.motion.light) + (i < 4 ? K.io(t, reachAt(i), 0.4) : 0));
  const flash = [K.env(t, tClues - 0.1, tClues + 0.9, 0.35), 0, 0, 0, 0];

  // legend (left column): each row names the spoken VERB in the tab's state colour, then its tab name in quiet grey
  // (scene 03 will work the tabs by those names). A row appears as its verb is said, alongside its tab lighting.
  const hx = (h) => [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16));
  const mixHex = (a, b, k) => { const A = hx(a), B = hx(b); return '#' + A.map((c, i) => Math.round(K.lerp(c, B[i], k)).toString(16).padStart(2, '0')).join(''); };
  const verbTxt = ['Read the error', 'Search the exact words', 'Check the official docs', 'Ask AI with the evidence', 'Settle it with a tiny test'];
  const LX = X, LY = 600, LG = 54, LS = 30;
  M.TABS.forEach((T, i) => {
    const rv = K.io(t, verbs[i] - 0.15, M.motion.light);
    if (rv <= 0) return;
    const { lit, done } = M.tabLook(v[i]);
    const col = mixHex(mixHex(C.soft, C.body, done), C.head, lit);
    const y = LY + i * LG, dx = (1 - rv) * -14;
    K.layer(rv, () => {
      K.icon(T.icon, LX + 18 + dx, y - LS * 0.32, LS * 1.1, { color: col });
      K.text(verbTxt[i], LX + 50 + dx, y, { font: 'ui', weight: 600, size: LS, color: col });
      const vw = K.measure(verbTxt[i], { font: 'ui', weight: 600, size: LS });
      K.text('· ' + T.label, LX + 50 + dx + vw + 14, y, { font: 'ui', weight: 600, size: 26, color: C.soft });
    });
  });

  // ---- the case file: rises in on "unstuck", then a slow 2% scale drift for the rest of the card
  const fileK = K.io(t, tUnstuck - 0.15, M.motion.move, 'out');
  const P = M.POS.title, drift = 1 + 0.02 * K.ease.io(K.seg(t, tUnstuck, tUnstuck + 26));
  const F = M.geo(P.cx, P.cy + (1 - fileK) * 30, P.s * drift);
  // the sheet's first entries (the case number is only drawn by drawFile at s >= .8, so write it here)
  const lineK = (at) => K.io(t, at, 0.5);
  const sheetContent = (G) => {
    const x = G.inner.x + 22, y = G.inner.y;
    const k1 = lineK(tUnstuck + 0.5), k2 = lineK(tUnstuck + 1.1);
    if (k1 > 0) K.text('CASE 00.06', x, y + 40, { font: 'ui', weight: 600, size: 26, color: K.rgba(C.head, 0.9 * k1), tracking: 2 });
    if (k2 > 0) K.text('Stuck on an error.', x, y + 96, { font: 'read', italic: true, size: 30, color: K.rgba(C.strong, 0.9 * k2) });
    const k3 = lineK(tVerdict + 0.6);  // after your tick lands: the verdict is yours
    if (k3 > 0) K.text('Verdict: checked by you.', x, y + 202, { font: 'read', italic: true, size: 30, color: K.rgba(C.strong, 0.9 * k3) });
  };
  // every-district: the file's warm rim comes up as the dots appear
  const glowK = 0.15 + 0.85 * K.io(t, cDist, 0.8);
  M.drawFile(t, F, { tabs: v, flash, labels: 'none', glow: glowK * fileK, alpha: fileK, content: sheetContent });

  // the clerk rises at the file's left edge on [[clerk]]
  const ck = K.io(t, cClerk, M.motion.land, 'out');
  const clx = F.x0 - 62, cly = F.tabTop + 70 + (1 - ck) * 26;
  if (ck > 0) M.clerk(t, clx, cly, 72, { alpha: ck });
  // its legwork: dashed gold hops from the clerk over Clue..Briefing
  const lk = K.seg(t, legA, legA + legD);
  if (lk > 0) M.legwork(F, lk, { first: 0, upto: 3, from: { x: clx + 20, y: cly - 40 }, lift: 26 });

  // you, right of the file, on "your job"; your solid line lands a tick on Experiment on "verdict"
  const yk = K.io(t, tYour - 0.2, M.motion.land, 'out');
  const yx = 1772, yy = 600;
  if (yk > 0) M.you(t, yx, yy + (1 - yk) * 20, 90, { alpha: yk, label: yk, labelText: 'you' });
  const E = F.tabs[4];
  const yLineK = K.seg(t, tVerdict - 0.55, tVerdict + 0.05);
  if (yLineK > 0) M.youLine(yx - 6, yy - 64, E.cx + 34, E.top - 46, yLineK, { bend: 46, head: false });
  M.tick(E.cx + 4, E.top - 50, 52, K.seg(t, tickAt, tickAt + 0.45), { disc: true });

  // ---- every district: six small gold dots with a faint linking line under the file; a glow walks across them
  const dk = K.io(t, cDist, 0.6);
  if (dk > 0) {
    const n = 6, dy = 806, dx0 = F.x0 + 40, dx1 = F.x1 - 40;
    const xs = Array.from({ length: n }, (_, i) => K.lerp(dx0, dx1, i / (n - 1)));
    K.line(dx0, dy, dx1, dy, { k: K.io(t, cDist, 1.0), color: K.rgba(C.head, 0.35), w: 2 });
    const walk = K.lerp(-0.5, n - 0.5, K.seg(t, cDist + 0.6, tAll + 0.4)); // the glow's position along the dots
    xs.forEach((x, i) => {
      const a = K.stagger(t, cDist, i, 0.12, 0.45);
      const near = Math.max(0, 1 - Math.abs(walk - i) * 1.1);
      const touched = walk >= i ? 1 : 0;
      K.glow(x, dy, 34, C.head, (0.12 + 0.3 * near + 0.08 * touched) * a);
      K.layer(a, () => {
        K.ring(x, dy, 9 + 3 * near, 9 + 3 * near, 1, { color: K.rgba(C.head, 0.5 + 0.5 * near), w: 2, rot: 0 });
        const g = K.ctx(); g.save(); g.fillStyle = C.head; g.beginPath(); g.arc(x, dy, 5 + near, 0, 7); g.fill(); g.restore();
      });
    });
    K.text('every district ahead', F.cx, dy + 56, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center', alpha: dk });
  }
});
