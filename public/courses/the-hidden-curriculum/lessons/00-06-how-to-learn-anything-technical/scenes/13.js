/* 13 — What AI can verify, today
   The boundary picture: left column "pass or fail" (gold checks, what a machine can measure), right column
   "no clean pass or fail" (terracotta questions). Headers dim at start; the divider grows in; at [[pass-fail]]
   a big check / cross pair holds the left column until the "builds" chip replaces it. At [[checkers]] both
   lists dim and the checkers card straddles the divider in the centre (help on both sides, not the answer to
   the right column); at [[human-yes]] a gold person marks the end of every row and the owner by the house is
   labelled "a human still reviews". */
SCENE('13', (t, S) => {
  K.bg({ glow: 0.3, glowX: 520, glowY: 760 });
  const C = K.C, P = M.palette;

  // ---- cue times (local seconds)
  const cPF = S.cue('pass-fail', 3.63);
  const cWeak = S.cue('weak', 17.23);
  const cCheck = S.cue('checkers', 26.78);
  const cHuman = S.cue('human-yes', 42.2);

  // ---- the house group, bottom-left under the measured column
  const hx = 390, hy = 770, hs = 240;
  const gm = M.house(t, hx, hy, hs, { lights: 0.85 });
  M.crew(t, 150, 742, 64, { i: 1 });
  const ox = 700, oy = gm.ground;
  const ownerGlow = K.io(t, cHuman, 0.7);
  if (ownerGlow > 0) K.glow(ox, oy - 60, 100, C.head, 0.3 * ownerGlow);
  const op = M.person(t, ox, oy, 120, 'owner', { i: 2 });
  const hk = K.io(t, S.find('human', 0, 46.82) - 0.2, 0.6, 'out');
  if (hk > 0) M.label('a human still reviews', ox, op.top - 26, 'machine', { alpha: hk });

  // ---- the two columns (headers present from frame 0, brighten on their cues)
  const LX = 130, RX = 1010, EY = 170, R0 = 262, RS = 64, CS = 28;
  K.line(975, 150, 975, 640, { k: K.io(t, 0.3, 2.2, 'io'), color: C.line2, w: 2 });
  const dimK = K.io(t, cCheck - 0.2, 0.7);       // lists step back when the checkers card arrives
  const listA = 1 - 0.85 * dimK;
  const head = (s, x, color, a) => K.text(s, x, EY, { font: 'ui', weight: 700, size: 30, color, upper: true, tracking: 4, alpha: a });
  head('Pass or fail', LX, P.machine, 0.45 + 0.55 * K.io(t, cPF, 0.6));
  head('No clean pass or fail', RX, P.unseen, 0.45 + 0.55 * K.io(t, cWeak, 0.6));
  const sk = K.io(t, cPF + 0.2, 0.6);
  if (sk > 0) M.label('if the check itself is sound', LX, EY + 42, 'note', { align: 'left', italic: true, size: 26, alpha: sk });

  // big check / cross pair: holds the left column from [[pass-fail]] until the first chip lands
  const tBuilds = S.find('builds', 0, 8.46);
  const gk = K.io(t, cPF + 0.3, 0.6, 'out') * (1 - K.io(t, tBuilds - 0.3, 0.5));
  if (gk > 0) K.layer(gk, () => {
    K.icon('check', 400, 400, 120, { color: P.machine, w: 8 });
    K.text('/', 520, 440, { font: 'ui', weight: 300, size: 110, color: C.soft, align: 'center' });
    K.icon('cross', 640, 400, 120, { color: P.unseen, w: 8 });
  });

  // left-aligned chip: measure first (k 0 draws nothing), then centre it
  const chipL = (s, x, y, kind, k) => {
    const w = M.chip(s, 0, 0, kind, { k: 0, size: CS });
    M.chip(s, x + w / 2, y, kind, { k, size: CS });
  };
  [
    ['builds', tBuilds],
    ['given tests pass', S.find('tests', 0, 9.32)],
    ['linter + types clean', S.find('linter', 0, 11.25)],
    ['known pattern flagged', S.find('scanner', 0, 14.0)],
    ['page loads', S.find('page', 0, 16.16)],
  ].forEach(([s, a], i) => K.layer(listA, () => chipL(s, LX, R0 + i * RS, 'machine', K.io(t, a, 0.5))));
  [
    ['right tests?', S.find('Whether', 0, 18.56)],
    ['what you meant?', S.find('Whether', 1, 20.74)],
    ['who sees what?', S.find('Who', 0, 22.23)],
    ['threats newer than the model', S.find('threats', 0, 24.59)],
  ].forEach(([s, a], i) => K.layer(listA, () => chipL(s, RX, R0 + i * RS, 'ask', K.io(t, a, 0.5))));

  // ---- the checkers card, centred over the divider (it helps both sides)
  const ck = K.io(t, cCheck, 0.7, 'out');
  if (ck > 0) {
    const W = 840, X0 = 960 - W / 2, Y0 = 268, TOP = 76, RH = 46, ROW0 = Y0 + TOP + RH / 2;
    const rows = [
      { name: '/security-review', mono: true, date: 'Aug 2025', at: S.find('security', 0, 29.95) },
      { name: 'security-guidance', mono: true, date: 'May 2026', at: S.find('plugin', 0, 32.14) - 0.4 },
      { name: 'Claude Security', date: 'Apr 2026', badge: 'beta', at: S.find('Anthropic', 0, 33.02) },
      { name: 'OpenAI Codex Security', date: 'Mar 2026', badge: 'preview', at: S.find('OpenAI', 0, 33.88) },
      { name: 'Google CodeMender', date: 'Jul 2026', badge: 'preview', at: S.find('Google', 0, 34.75) },
      { name: 'GitHub Copilot autofix', date: 'Jul 2026', badge: 'preview', at: S.find('GitHub', 0, 35.41) },
      { name: 'review agents', date: 'Mar 2026', at: S.find('review', 1, 39.69) },
    ];
    const shown = rows.reduce((a, r) => a + K.io(t, r.at - 0.1, 0.5), 0);
    const H = TOP + Math.max(0.5, shown) * RH + 14;
    const badgeK = K.io(t, S.find('preview', 0, 37.59), 0.5);
    const asofK = K.io(t, S.find('October', 0, 42.58), 0.6, 'out');
    K.layer(ck, () => {
      const g = K.ctx(); g.save(); g.translate(0, (1 - ck) * 20);
      K.card(X0, Y0, W, H, { r: 20 });
      K.text('Checkers that exist now', X0 + 30, Y0 + 48, { font: 'ui', weight: 700, size: 26, color: C.head, upper: true, tracking: 3 });
      if (asofK > 0) {
        const tw = M.tag('As of Oct 2026', 0, 0, 'asof', { size: 22, alpha: 0 });
        K.layer(asofK, () => M.tag('As of Oct 2026', X0 + W - 28 - tw / 2, Y0 + 39, 'asof', { size: 22 }));
      }
      g.save(); g.beginPath(); g.rect(X0, Y0, W, TOP + Math.max(0.5, shown) * RH + 2); g.clip();
      rows.forEach((r, i) => {
        const k = K.io(t, r.at, 0.5, 'out');
        if (k <= 0) return;
        const y = ROW0 + i * RH;
        K.layer(k, () => {
          g.save(); g.translate((1 - k) * -14, 0);
          K.line(X0 + 24, y - RH / 2, X0 + W - 24, y - RH / 2, { color: C.line, w: 1.5 });
          K.text(r.name, X0 + 30, y + 10, r.mono ? { font: 'mono', weight: 600, size: 27, color: C.strong } : { font: 'ui', weight: 600, size: 28, color: C.strong });
          M.tag(r.date, X0 + 452, y, 'date', { size: 22 });
          g.restore();
        });
        if (r.badge && badgeK > 0) K.layer(badgeK * k, () => M.tag(r.badge, X0 + 606, y, r.badge, { size: 22 }));
        // the human at the end of every row
        const pk = K.io(t, cHuman + 0.35 + i * 0.12, 0.5, 'out');
        if (pk > 0) K.layer(pk, () => K.icon('person', X0 + W - 52, y + 2, 30, { color: C.head, w: 3 }));
      });
      g.restore();
      g.restore();
    });
  }
});
