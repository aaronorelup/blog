// 14 — The old rule, adapted: the rule as a plaque above the house; the house splits into
// "the agent verifies" (gold, left) and "you, or an expert" (terracotta, right).
SCENE('14', (t, S) => {
  const P = M.palette, C = K.C;
  const cRule = S.cue('the-rule', 1.85);
  const cYounger = S.cue('younger', 8.67);
  const cAdapted = S.cue('adapted', 16.59);
  const cAgent = S.cue('agent-side', 21.49);
  const cYour = S.cue('your-side', 25.8);
  const cPicture = S.find('picture', 0, cAgent - 1.4);

  K.bg({ glow: 0.4, glowX: 960, glowY: 560 });

  // ---- the house, split in two halves that tint on their own cues
  const HX = 960, HY = 680, HS = 300;
  const gm = M.geo(HX, HY, HS);
  const bx = K.lerp(gm.bounds.x0, gm.bounds.x1, 0.5);
  const kL = K.io(t, cAgent, 0.8, 'io');
  const kR = K.io(t, cYour, 0.8, 'io');
  const g = K.ctx();
  if (kL <= 0 && kR <= 0) {
    M.house(t, HX, HY, HS);
  } else {
    g.save(); g.beginPath(); g.rect(0, 0, bx, 1080); g.clip();
    M.house(t, HX, HY, HS, { split: { k: kL, at: 0.5 } });
    g.restore();
    g.save(); g.beginPath(); g.rect(bx, 0, 1920 - bx, 1080); g.clip();
    M.house(t, HX, HY, HS, { split: { k: kR, at: 0.5 } });
    g.restore();
  }

  // ---- the plaque: the rule
  const kPl = K.io(t, cRule, 0.7, 'out');
  M.plaque('Trust only what can be verified', 960, 215, 880, { k: kPl, size: 44 });

  // ---- the adapted line types under the plaque
  const adapted = "Don't rely on an answer you can't check.";
  const kAd = K.io(t, S.find('Adapted', 0, cAdapted - 1.2), 0.5, 'out');
  if (kAd > 0) {
    K.eyebrow('Adapted for AI', 960, 332, { size: 26, color: C.head, tracking: 4, align: 'center', alpha: kAd });
    const af = { font: 'read', size: 36, italic: true, color: C.strong };
    const ax = 960 - K.measure(adapted, af) / 2;
    K.text(K.typed(adapted, t, cAdapted, 30), ax, 382, af);
  }

  // ---- the source card: Irving Younger, 1975 (fades as "one picture" begins)
  const kYo = K.io(t, cYounger, 0.6, 'out') * (1 - K.io(t, cPicture, 0.6, 'io'));
  if (kYo > 0) {
    M.dated(110, 430, 600, 'Irving Younger · 1975',
      "Cross-examination rule for trial lawyers: don't ask a question you don't know the answer to.",
      { k: K.io(t, cYounger, 0.6, 'out'), alpha: 1 - K.io(t, cPicture, 0.6, 'io') });
  }

  // ---- left: the agent verifies
  const LX = 620;
  ['crashes', 'builds', 'tests'].forEach((s, i) => {
    M.chip(s, LX, 600 + i * 80, 'machine', { k: K.io(t, cAgent + 0.15 + i * 0.35, 0.5, 'out') });
  });
  const kCrew = K.io(t, cAgent + 0.1, 0.6, 'out');
  if (kCrew > 0) M.crew(t, 430, 680, 80, { i: 0.7, alpha: kCrew });
  M.label('the agent verifies', 555, 870, 'machine', { alpha: K.io(t, cAgent + 1.1, 0.6, 'out') });

  // ---- right: you, or an expert
  const RX = 1320;
  ['security', 'team fit', 'dependencies', 'deploys'].forEach((s, i) => {
    M.chip(s, RX, 570 + i * 76, 'unseen', { k: K.io(t, cYour + 0.15 + i * 0.4, 0.5, 'out') });
  });
  const kOw = K.io(t, cYour + 1.9, 0.6, 'out');
  if (kOw > 0) {
    M.person(t, 1570, 800, 130, 'owner', { alpha: kOw, i: 0.3 });
    M.person(t, 1700, 800, 130, 'inspector', { alpha: K.io(t, cYour + 2.4, 0.6, 'out'), i: 1.1 });
  }
  M.label('you, or an expert', 1640, 870, 'unseen', { alpha: K.io(t, cYour + 2.6, 0.6, 'out') });
});
