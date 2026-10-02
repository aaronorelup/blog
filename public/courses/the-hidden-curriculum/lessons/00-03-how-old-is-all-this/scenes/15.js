/* 15 — Keep this (end card, noBadge)
   Opens on 14's last frame: the building in the 'rules' layout (sign "Python 3.13", passkey lock, lit parts), so the
   crossfade shows one building, not two. 14's text (rules, question card, stone label) leaves with the crossfade; the
   building then slides to the 'corner' (0.8 s, while "Three things to keep" is said), settles to 0.6 alpha and lets
   its roof eyebrow go (too crowded at that size). Ground bookends 01: night bg plus only the lowest band of the painted plate; petals.
   Three rows, left-aligned (numbers x 200, text x 260, paragraphs 1120 wide so they clear the building at x >= 1492).
   Each bold lead is the ACTION (it mirrors 14's rule: stone learn it once, paint check the version, lock assume it has
   changed, lantern check the date); the grey line under it is the reason.
   - [[keep-1]] "Learn the old ideas once." The small building's stone warms gold on "old" and stays lit; rest on "Files".
   - [[keep-2]] "Check the version." The sign repaints "Python 3.13" -> "3.14" on "version" (the repaint move, ~0.5 s;
     the shorter pill fits the small wall). "Assume the lock has changed." joins the lead on "assume", and the door lock
     is swapped on "lock" (passkey out, a fresh passkey in: the lock-swap move) with a terracotta glow; rest on "Versions".
   - [[keep-3]] "Check the date on anything AI tells you." The three lanterns brighten left to right on "AI" and their
     light spreads down; rest on "It".
   Exit: three rows held, the small building lit at bottom right, petals drifting. No 'back' overshoot here.
   Pure function of t. */
SCENE('15', (t, S) => {
  const C = K.C;

  // ---- times (local)
  const k1 = S.cue('keep-1', 1.52), k2 = S.cue('keep-2', 8.12), k3 = S.cue('keep-3', 16.86);
  const tOld = S.find(/^old$/i, 0, 2.0);
  const tFiles = S.find(/^files/i, 0, 3.76);
  const tVersion = S.find(/^version\W*$/i, 0, 8.54);
  const tAssume = S.find(/^assume$/i, 0, 9.42);
  const tLock = S.find(/^lock$/i, 0, 9.91);
  const tVersions = S.find(/^versions$/i, 0, 11.49);
  const tAI = S.find(/^AI$/i, 0, 18.2);
  const tIt = S.find(/^it$/i, 0, 19.47);

  // ---- ground: as 01 (the lesson is bookended): night bg, then only the plate's lowest band
  const morph = K.io(t, 0.1, 0.8);
  K.bg({ glow: 0.16, glowX: K.lerp(640, 760, morph), glowY: K.lerp(360, 420, morph) });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.55, mask: [840, 1010], alpha: K.io(t, 0, 1.2) });
  K.petals(t, { n: 5, seed: 3, alpha: 0.45 * K.io(t, 0.2, 1.2) });

  // ---- the building: 'rules' (14's last frame) -> 'corner'
  const L = M.lerpLayout('rules', 'corner', morph);
  const kStone = K.io(t, tOld - 0.1, 0.7);
  const kRepaint = K.io(t, tVersion - 0.1, 0.5);
  const kLock = K.io(t, tLock - 0.05, 0.5);
  const lockFlash = M.bump(t, tLock - 0.05, 1.1);
  const lamp = (i) => K.stagger(t, tAI - 0.05, i, 0.18, 0.7);
  const kLight = K.io(t, tAI, 1.2);
  const fromRules = 1 - morph;                                  // 14's resting highlights settle during the slide
  M.building(t, {
    layout: L,
    alpha: K.lerp(1, 0.6, morph),
    detail: true,                                               // keep the sign's words (26 px on screen) at corner size
    stoneLabel: '',
    roofLabel: '', roofLabelFrom: 'PYTHON · 1991', roofLabelK: K.io(t, 0.05, 0.5),   // too crowded at corner size
    stoneLit: Math.max(0.75 * fromRules, 0.25, kStone),
    sign: '3.14', signFrom: 'Python 3.13', signK: kRepaint,
    signLit: Math.max(0.6 * fromRules, 0.45 * kRepaint),
    lock: 'passkey', lockFrom: 'passkey', lockK: kLock < 1 && kLock > 0 ? kLock : null,
    lockLit: Math.max(0.65 * fromRules, 0.2, 0.9 * lockFlash, 0.55 * kLock),
    doorGlow: 0.4 * lockFlash,
    lanterns: (i) => K.lerp(0.55, 1, lamp(i)),
    light: Math.max(0.35 * fromRules, 0.15, 0.7 * kLight),
    roofLit: Math.max(0.6 * fromRules, 0.3 + 0.35 * kLight),
    windows: K.lerp(0.6, 0.8, kLight),
  });
  // the warmth of each beat, drawn at full strength outside the building's 0.6 alpha so it reads at this size
  {
    const st = M.at(L, 'stone'), sw = M.bump(t, tOld - 0.1, 1.4);
    if (sw > 0) K.glow(st.x, st.y + 6, 130, C.head, 0.22 * sw);
    const sg = M.at(L, 'sign'), pw = M.bump(t, tVersion - 0.1, 1.2);
    if (pw > 0) K.glow(sg.x, sg.y, 110, C.strong, 0.12 * pw);
    const lk = M.at(L, 'lock');
    if (lockFlash > 0) K.glow(lk.x, lk.y, 90, C.accent, 0.2 * lockFlash);
    const ln = M.at(L, 'lanterns'), lw = M.bump(t, tAI, 1.6);
    if (lw > 0) K.glow(ln.x, ln.y, 140, M.palette.lanternGlow, 0.22 * lw);
  }

  // ---- eyebrow
  K.eyebrow('Keep this', 200, 196, { size: 22, alpha: K.io(t, 0.2, 0.6) });

  // ---- the three rows: lead (Zen Maru 40, all gold: one skim set, the lesson's keep), rest (Georgia 30) on its word
  const NX = 200, X0 = 260, PW = 1120, ROWS = [292, 472, 652];
  const LEAD = { font: 'head', size: 40, weight: 700, color: C.head };
  const REST = { font: 'read', size: 30, color: C.body, lh: 42 };
  const NUMC = [C.head, C.strong, C.accent];                    // stone · paint (and lock) · lantern
  // lead: [text, at] pieces on one line, each rising when it is said
  const row = (i, leads, restAt, rest) => {
    const y = ROWS[i];
    let x = X0;
    leads.forEach(([txt, at], j) => {
      const xi = x;
      K.rise(t, at - 0.1, () => {
        if (j === 0) K.text(String(i + 1).padStart(2, '0'), NX, y, { font: 'mono', size: 26, weight: 600, color: NUMC[i], alpha: 0.85 });
        K.text(txt, xi, y, LEAD);
      }, 16);
      x += K.measure(txt + ' ', LEAD);
    });
    K.rise(t, restAt - 0.15, () => K.para(rest, X0, y + 58, PW, REST), 14);
  };
  row(0, [['Learn the old ideas once.', k1]], tFiles,
    'Files, the shell, the web and git had decades to settle.');
  row(1, [['Check the version.', k2], ['Assume the lock has changed.', tAssume]], tVersions,
    'Versions move every year, and security moves faster still.');
  row(2, [['Check the date on anything AI tells you.', k3]], tIt,
    'It is the newest and fastest of all, especially about versions and locks.');
});
