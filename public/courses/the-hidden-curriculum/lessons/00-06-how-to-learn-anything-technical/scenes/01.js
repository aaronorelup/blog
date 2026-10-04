/* 00.06 · 01 — The point (title card, noBadge).
   The house (the lesson's one metaphor object) is already standing, small and finished, with its crew and owner.
   Purpose line on [[purpose]], the conclusion pill on [[conclusion]], the three checkers as each is named,
   the hand-off on [[hand-off]], then the lights come on ("runs") and a terracotta leak trickles out ("leaks"). */
SCENE('01', (t, S) => {
  const C = K.C, P = M.palette, L = M.layout.title;
  const cPurpose = S.cue('purpose', 5.57), cConcl = S.cue('conclusion', 9.75),
    cHand = S.cue('hand-off', 21.26), cLeaks = S.cue('leaks', 23.25);
  const tWrites = S.find('writes', 0, 2.66), tYou = S.find(/^you$/, 0, 4.79);
  const tMachine = S.find('machine', 0, 13.53), tYou2 = S.find(/^you$/, 2, 14.38),
    tSomeone = S.find('someone', 0, 15.71), tLearn = S.find('learn', 1, 19.91);
  const tRuns = S.find('runs', 1, 23.87), tLeak = S.find('leaks', 0, 24.49);

  // ---- ground: night bg, painted plate only in the lower band behind the house
  K.bg({ glow: 0.4, glowX: L.x, glowY: L.y });
  if (K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.62, mask: [740, 940] });
  K.petals(t, { n: 6, seed: 6, avoid: [[300, 150, 1620, 580], [560, 560, 1440, 880], [80, 880, 1840, 960]] });

  // ---- title block (eyebrow + title from frame 0)
  K.eyebrow('00.06 · ORIENTATION', 960, 196, { align: 'center', size: 22 });
  K.title('Trust what you can verify', 960, 286, { size: 84, align: 'center' });

  // purpose line rises in on [[purpose]]
  const pk = K.io(t, cPurpose, 0.7, 'out');
  if (pk > 0) K.text('Judging what you can’t see. Above all: is it safe?', 960, 372 + (1 - pk) * 18,
    { font: 'read', size: 34, color: C.body, align: 'center', alpha: pk, italic: true });

  // conclusion pill on [[conclusion]]
  const ck = K.io(t, cConcl, 0.6, 'out');
  M.chip('Trust only what can be verified', 960, 452, 'machine', { k: ck, glow: 0.25 * ck });

  // three checkers, each as it is named: a machine · you · someone who knows
  const row = [
    { s: 'a machine', kind: 'machine', at: tMachine },
    { s: 'you', kind: 'machine', at: tYou2 },
    { s: 'someone who knows', kind: 'neutral', at: tSomeone, icon: 'person' },
  ];
  const gap = 64, ws = row.map((r) => M.chip(r.s, 0, 0, r.kind, { k: 0, icon: r.icon }));
  let x = 960 - (ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1)) / 2;
  const cy = 530, pos = [];
  row.forEach((r, i) => { pos.push(x + ws[i] / 2); x += ws[i] + gap; });
  // "learn to check" brightens you; [[hand-off]] passes it on to someone who knows (gold arrow, gold glow)
  const youGlow = K.env(t, tLearn - 0.1, cHand, 0.4);
  const handK = K.io(t, cHand, 0.6);
  row.forEach((r, i) => {
    const k = K.io(t, r.at - 0.05, 0.5, 'out');
    const glow = i === 1 ? 0.35 * youGlow : i === 2 ? 0.35 * handK : 0;
    M.chip(r.s, pos[i], cy, i === 2 && handK > 0.5 ? 'machine' : r.kind, { k, icon: r.icon, glow });
  });
  if (handK > 0) {
    const ax0 = pos[1] + ws[1] / 2 + 2, ax1 = pos[2] - ws[2] / 2 - 2;
    K.arrow(ax0 + 8, cy, ax1 - 8, cy, { k: handK, bend: 0, color: P.machine, w: 3, alpha: 1 - K.io(t, cLeaks, 0.6) * 0.6 });
  }

  // ---- the house: present and finished from frame 0; lights on "runs", leak on "leaks"
  const lit = 0.12 + 0.88 * K.io(t, tRuns - 0.25, 0.55, 'out');
  const leak = K.io(t, tLeak - 0.15, M.motion.leak, 'lin');
  const gm = M.house(t, L.x, L.y, L.s, { lights: lit, leak });

  // crew beside it (fade in as "AI writes"), owner on "for you"
  const crewK = K.io(t, tWrites - 0.2, 0.7);
  M.crew(t, gm.bounds.x1 + 70, L.y - 60, 56, { i: 0.3, alpha: crewK });
  M.crew(t, gm.bounds.x1 + 150, L.y - 5, 48, { i: 1.7, alpha: crewK });
  M.person(t, gm.bounds.x0 - 90, gm.ground, 120, 'owner', { alpha: K.io(t, tYou - 0.1, 0.7), i: 0.5 });

  // beside the right wall, part of the house picture: in by ~0.6 s after "leaks"
  const lk = K.io(t, tLeak + 0.05, 0.55, 'out');
  if (lk > 0) M.label('runs… and leaks', gm.body.x1 + 30, 752 + (1 - lk) * 10, 'unseen', { alpha: lk, align: 'left', size: 30 });
});
