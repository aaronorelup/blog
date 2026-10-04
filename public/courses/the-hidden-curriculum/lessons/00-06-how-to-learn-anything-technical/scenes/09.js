/* 00.06 · 09 Working with other people
   The house sits on a team's street that has a style. The crew's work drifts off it: an off-style wing,
   a fresh copy of the street's shared helper, and modules nobody on the team chose. */
SCENE('09', (t, S) => {
  const C = K.C, P = M.palette;
  K.bg({ glow: 0.32, glowX: 960, glowY: 470 });

  // ---- cue times (local seconds)
  const cStreet = S.cue('street', 0.94);
  const cNorms = S.cue('norms', 4.55);
  const tLayout = S.find('layout', 0, 5.2);
  const tErrors = S.find('errors', 0, 6.5);
  const tDrift = S.find('drift', 0, 9.7);
  const cCoders = S.cue('hand-coders', 12.7);
  const tCopy = S.find('copy', 0, 17.4);
  const cGit = S.cue('gitclear', 20.7);
  const cLibs = S.cue('other-libs', 31.0);
  const tChose = S.find('never', 0, 35.0);
  const cDisc = S.cue('disclose', 38.4);
  const tCurl = S.find('Curl', 0, 44.2);

  // ---- the street: 5 houses, ours (index 2) is present from the first frame
  const SY = 515, SS = 220, GAP = 330, N = 5;
  const xs = [...Array(N)].map((_, i) => 960 + (i - 2) * GAP);
  const g2 = M.geo(xs[2], SY, SS);
  const WING = { x0: g2.body.x1, x1: g2.body.x1 + 96, y0: g2.ground - 100, y1: g2.ground };
  WING.cx = (WING.x0 + WING.x1) / 2; WING.peak = WING.y0 - 84;
  const wingK = K.io(t, tDrift, 1.0, 'io');
  const geos = xs.map((x, i) => {
    const k = i === 2 ? 1 : K.stagger(t, cStreet, [0, 1, 0, 2, 3][i], 0.18, 0.7);
    if (k <= 0) return M.geo(x, SY, SS);
    const e = K.ease.out(k);
    if (i === 2) drawWing(M.geo(x, SY, SS), wingK); // behind our house, so its eave overlaps the wing's roof
    return M.house(t, x, SY + (1 - e) * 20, SS, {
      alpha: e * (i === 2 ? 1 : 0.72),
      lights: i === 2 ? 0.9 : 0.6,
    });
  });
  const ours = geos[2];
  const ground = ours.ground;

  // eyebrow
  K.layer(K.io(t, cStreet, 0.6), () => K.eyebrow("THE TEAM'S STREET", 960, 172, { size: 28, align: 'center', color: C.head, tracking: 4 }));

  // ---- norms: three neutral chips over the street (dim once the drift starts)
  const normDim = 1 - 0.45 * K.io(t, cCoders, 0.8);
  const norms = [['naming', 560, cNorms], ['file layout', 960, tLayout], ['error handling', 1360, tErrors]];
  K.layer(normDim, () => norms.forEach(([s, x, a]) => M.chip(s, x, 290, 'neutral', { k: K.io(t, a, 0.5, 'out') })));
  // a faint dashed rule tying the chips to the street ("a street has a style")
  K.layer(0.5 * normDim * K.io(t, cNorms, 0.8), () => K.line(420, 346, 1500, 346, { k: K.io(t, cNorms, 1.4, 'out'), color: C.line2, w: 2, dash: [6, 10] }));

  // ---- the crew: arrives as the wing drifts out, later brings the off-list modules
  const crewIn = K.io(t, tDrift - 0.4, 0.6);
  const toLibs = K.io(t, cLibs + 0.6, 0.8);
  const back = K.io(t, cDisc - 0.3, 0.8);
  const crewX = K.lerp(K.lerp(1150, 1500, toLibs), 1150, back), crewY = K.lerp(K.lerp(372, 762, toLibs), 372, back);
  if (crewIn > 0) M.crew(t, crewX, crewY, 52, { i: 1.3, alpha: crewIn });

  // ---- shared helper (cream gear on a post between houses 0 and 1) and the crew's fresh copy (in the wing)
  const helpK = K.io(t, S.find('reusing', 0, 18.5), 0.6, 'out');
  const helpX = (xs[0] + xs[1]) / 2;
  if (helpK > 0) K.layer(helpK, () => {
    K.line(helpX, ground, helpX, ground - 70, { color: P.wood, w: 6 });
    K.iconTile('gear', helpX, ground - 110, 78, { color: C.strong });
    M.label("team's helper", helpX, ground - 168, 'plain', { size: 28 });
  });
  const copyK = K.io(t, tCopy, 0.6, 'out');
  const copyX = WING.cx, copyY = WING.y0 + 46;
  if (copyK > 0 && wingK >= 1) {
    K.layer(copyK, () => {
      K.glow(copyX, copyY, 56, C.accent, 0.4);
      K.iconTile('gear', copyX, copyY, 54, { color: P.unseen });
    });
  }
  // dashed "could have reused this" route from the helper towards our house, never taken (soft gold)
  const arcA = 0.8 * K.io(t, S.find('reusing', 0, 18.5), 0.6) * (1 - K.io(t, cLibs - 0.4, 0.5));
  if (arcA > 0) K.layer(arcA, () => K.path([[helpX + 104, ground - 190], [helpX + 270, ground - 262], [ours.body.x0 - 14, ground - 150]],
    { k: K.io(t, S.find('reusing', 0, 18.5), 1.0, 'out'), color: K.mixColor(C.head, C.soft, 0.3), w: 5, dash: [10, 10], head: false }));

  // ---- hand-coders by the neighbouring houses
  const coderK = K.io(t, cStreet + 0.9, 0.7);
  const coderLab = K.io(t, cCoders, 0.6);
  const askK = K.io(t, tChose, 0.5);
  const coders = [[xs[1] - 30, 0.2], [xs[3] + 30, 2.4]];
  coders.forEach(([x, ph], j) => {
    if (coderK <= 0) return;
    const asking = j === 0 && askK > 0.5;
    M.person(t, x, ground, 118, 'coder', {
      i: ph, alpha: coderK,
      prop: asking ? 'question' : 'code', propK: asking ? K.clamp((askK - 0.5) * 2) : 1,
      label: coderLab > 0 ? 'write by hand' : null, labelSize: 26, labelColor: K.rgba(C.body, coderLab),
    });
  });
  // question colour: the question prop inherits the coder colour; add a terracotta ring so it reads as a doubt
  if (askK > 0) K.layer(askK, () => K.ring(xs[1] - 30 + 118 * 0.3, ground - 118 * 0.4, 30, 30, askK, { color: P.unseen, w: 2.5, rot: 0 }));

  // ---- lower band, one idea at a time
  const B0 = 700;
  // (a) drift label
  const driftA = K.env(t, tDrift + 0.6, cGit - 0.2, 0.5);
  if (driftA > 0) M.label("the AI's wing breaks the street's style", 960, 750, 'unseen', { alpha: driftA });

  // (b) GitClear card
  const gitA = K.env(t, cGit, cLibs - 0.3, 0.5);
  if (gitA > 0) M.dated(560, B0, 800, 'GitClear · Jan 2026', 'More copy-pasted code, less reuse, 2023 to 2026', { kind: 'unseen', k: K.io(t, cGit, 0.6, 'out'), alpha: gitA });

  // (c) the project's modules vs the crew's picks
  const libA = K.env(t, cLibs, cDisc - 0.3, 0.5);
  if (libA > 0) K.layer(libA, () => {
    K.eyebrow("THE PROJECT'S MODULES", 960, 716, { size: 26, color: C.soft, tracking: 3, align: 'center' });
    const team = [['axios', cLibs + 0.1], ['date-fns', cLibs + 0.3]];
    const ai = [['got', S.find('different', 0, 31.4)], ['dayjs', S.find('ones', 0, 31.8)]];
    const lt = { font: 'ui', weight: 600, size: 28 };
    const wTeam = K.measure('team:', lt), wAi = K.measure('AI added:', lt);
    const cw = (n) => K.measure(n, { font: 'mono', weight: 600, size: 28 }) + 48;
    const total = wTeam + 16 + cw('axios') + 20 + cw('date-fns') + 90 + wAi + 16 + cw('got') + 20 + cw('dayjs');
    let x = 960 - total / 2;
    const y = 784;
    K.text('team:', x, y + 10, { ...lt, color: C.body }); x += wTeam + 16;
    team.forEach(([n, a]) => { x += libChip(n, x, y, 'team', K.io(t, a, 0.5, 'out')) + 20; });
    x += 70;
    const aiK = K.io(t, ai[0][1], 0.5, 'out');
    K.layer(aiK, () => K.text('AI added:', x, y + 10, { ...lt, color: P.unseen })); x += wAi + 16;
    ai.forEach(([n, a]) => { x += libChip(n, x, y, 'crew', K.io(t, a, 0.5, 'out')) + 20; });
    K.layer(K.io(t, tChose, 0.6), () => M.label('parts the team never chose', 960, 880, 'unseen'));
  });

  // (d) disclosure sign + curl card
  const signK = K.io(t, cDisc, 0.6, 'out');
  if (signK > 0) K.layer(signK, () => {
    const g = K.ctx(); g.save(); g.translate(0, (1 - signK) * 18);
    K.card(250, B0, 640, 196, { r: 18 });
    K.eyebrow('MANY OPEN-SOURCE PROJECTS ASK', 290, B0 + 50, { size: 26, color: C.head, tracking: 3 });
    M.label('AI used?', 290, B0 + 110, 'plain', { size: 34, align: 'left' });
    M.label('A human read it?', 290, B0 + 160, 'plain', { size: 34, align: 'left' });
    K.icon('person', 820, B0 + 120, 64, { color: P.owner, w: 3 });
    g.restore();
  });
  const curlK = K.io(t, tCurl, 0.6, 'out');
  if (curlK > 0) M.dated(990, B0, 640, 'curl · Jan 2026', 'Ended its bug bounty over a flood of AI junk reports', { kind: 'unseen', k: curlK });

  // mono module chip with a puzzle icon: team modules in cream, the crew's picks in terracotta
  function libChip(name, x0, y, who, k) {
    const size = 28, to = { font: 'mono', weight: 600, size };
    const w = K.measure(name, to) + 48, h = 54;
    if (k <= 0) return w;
    const col = who === 'team' ? C.strong : P.unseen;
    K.layer(K.ease.out(k), () => {
      const g = K.ctx(); g.save(); g.translate(0, (1 - k) * 14);
      K.card(x0, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: who === 'team' ? C.line2 : K.mixColor(C.line2, C.accent, 0.7), shadow: false, glow: who === 'crew' ? 0.25 : 0 });
      K.text(name, x0 + 24, y + size * 0.34, { ...to, color: col });
      g.restore();
    });
    return w;
  }
  // off-style wing drawn here (not M.house's small flat wing): a tall box with a steep straight A-frame
  // (the street's roofs are low and curved), a round window, terracotta outline, a crew sparkle on the ridge.
  // Pulses once when it has finished sliding out on "drift".
  function drawWing(gm, k) {
    if (k <= 0) return;
    const g = K.ctx(), e = K.ease.out(k);
    const x0 = WING.x0, x1 = WING.x1, y0 = WING.y0, y1 = WING.y1, w = x1 - x0;
    const pulse = Math.sin(Math.PI * K.clamp((t - tDrift - 1.0) / 0.9));
    g.save();
    g.beginPath(); g.rect(gm.body.x1 - 2, 0, 1000, 1080); g.clip();
    g.translate(-(1 - e) * (w + 10), 0);
    if (pulse > 0) K.glow(WING.cx, (y0 + y1) / 2 - 20, 110, C.accent, 0.45 * pulse);
    g.fillStyle = '#2A2028'; g.fillRect(x0, y0, w, y1 - y0);
    g.strokeStyle = P.unseen; g.lineWidth = 3.5 + 2 * pulse; g.lineJoin = 'round';
    g.strokeRect(x0, y0, w, y1 - y0);
    // steep straight A-frame
    g.beginPath(); g.moveTo(x0 - 10, y0); g.lineTo(WING.cx, WING.peak); g.lineTo(x1 + 10, y0); g.closePath();
    g.fillStyle = '#241A24'; g.fill(); g.stroke();
    // round window in the gable
    g.beginPath(); g.arc(WING.cx, y0 - 26, 11, 0, 7); g.stroke();
    g.restore();
    // the crew's signature on the ridge
    if (k > 0.7) M.sparkleShape(WING.cx, WING.peak - 4, 13 + 3 * pulse, C.head, K.clamp((k - 0.7) / 0.3));
  }
});
