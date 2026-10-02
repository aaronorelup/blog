/* 00.03 · 05 — Stone, paint and lock
   The mental model, drawn. The building is born from the street:
   - opens on 04's exit (full street, houses, brackets, lanterns); brackets and lantern tags fade at once.
   - "Every year on that street": every year tag warms in a left-to-right wave. "birthday": the pill
     "a birthday, not a finish line" rises at (960, 200).
   - "finish line": the street slides down to the dim 'floor' strip (alpha .3) with the houses riding it as they fade,
     only "~1991" left on it; a gold ring passes over "~1991" as the slide lands.
   - just before [[building]] "Look closely at one" (so the frame never empties): the building grows out of that pill into
     the 'full' layout (stone, walls with the scene's one 'back', roof, door, sign, poles, lanterns).
   - [[stone]] the stone lights gold; book / check / envelope on "file", "commit", "message"; "barely moves".
   - [[paint]] the carved roof year (gold, the stone's colour) steps back; the blank sign paints "Python 3.12" on "version",
     pulses on "the number on the sign", repaints to "Python 3.13" on "redone"; "every year".
   - [[lock]] the lock grows onto the door; a key slides into it on "prove", turns on "scrambled";
     on "replaced" the lock is swapped for a new one (the key goes with the old); "fastest"; a shake on "burglars".
   Exit: one lit building, three speed labels, the dim street strip with "~1991". */
SCENE('05', (t, S) => {
  const M = window.M, C = K.C, g = K.ctx();

  // ---- cues and spoken words (local seconds; fallbacks from the narration timing)
  const cBuilding = S.cue('building', 4.35), cStone = S.cue('stone', 9.68), cPaint = S.cue('paint', 17.9), cLock = S.cue('lock', 25.13);
  const tEvery = S.find('year', 0, 0.38);            // "Every year on that street"
  const tBirthday = S.find(/^birthday/, 0, 1.94);
  const tFinish = S.find('finish', 0, 3.11);
  const tFile = S.find(/^file/, 0, 11.74), tCommit = S.find(/^commit/, 0, 12.62), tMessage = S.find('message', 0, 13.83);
  const tBarely = S.find('barely', 0, 16.59);
  const tNumber = S.find(/^number/, 0, 20.58), tSignW = S.find(/^sign/, 0, 21.25);
  const tVersion = S.find(/^version/, 0, 19.66), tRedone = S.find('redone', 0, 22.76), tEveryYear = S.find('every', 1, 23.46);
  const tLockW = S.find(/^lock$/, 0, 25.5), tDoor = S.find(/^door/, 0, 26.1), tSecurity = S.find(/^security/, 0, 26.89);
  const tProve = S.find('prove', 0, 28.57), tScrambled = S.find(/^scrambled/, 0, 30.72);
  const tReplaced = S.find('replaced', 0, 32.69), tFastest = S.find(/^fastest/, 0, 33.25), tBurglars = S.find('burglars', 0, 34.89);

  // ================================================================ the street: 04's exit -> the floor strip
  const PY = 4;                                   // index of "~1991 · web · Python · Linux" in M.BUILDINGS
  const slideA = tFinish;                         // the street slides down on "finish line"
  const slideK = K.io(t, slideA, 0.9, 'io');
  const gm = M.lerpGeom('full', 'floor', slideK);
  const houseK = 1 - K.io(t, tFinish - 0.15, 0.55);
  const othersK = 1 - K.io(t, tFinish - 0.1, 0.55);         // the other year tags leave with them
  const bracketK = 1 - K.io(t, 0, 0.6);                     // 04's brackets and lantern tags leave at once
  // "Every year on that street": every tag warms in a gentle left-to-right wave
  const itemLit = (i) => 0.7 * M.bump(t, tEvery + 0.1 + 0.11 * i, 1.1);

  const glowY = K.lerp(560, 520, slideK);
  K.bg({ glow: 0.15, glowX: 960, glowY });

  if (houseK > 0) M.houses('full', { pass: 'body', alpha: houseK });
  M.street(t, {
    geom: gm,
    alpha: K.lerp(1, 0.3, slideK),
    show: 1,
    itemAlpha: (i) => (i === PY ? 1 : othersK),
    itemLit: (i) => (i === PY ? itemLit(i) : itemLit(i) * othersK),
    mode: 'year', modeFrom: 'full', modeK: K.io(t, slideA + 0.2, 0.6),
    lanterns: 1 - K.io(t, slideA, 0.7), cord: 1 - K.io(t, slideA, 0.7),
    lanternTags: bracketK,
    tickLabels: 0,
  });
  if (houseK > 0) M.houses('full', { pass: 'roofs', alpha: houseK });
  // 04's 26 px decade labels, leaving with the houses
  const decK = 1 - K.io(t, tFinish - 0.2, 0.45);
  if (decK > 0) for (let d = 1970; d <= 2020; d += 10) {
    K.text(String(d), M.X(d, 'full'), 560 + 42, { font: 'mono', weight: 500, size: 26, color: C.soft, align: 'center', alpha: 0.85 * decK });
  }
  // 04's brackets, fading at once
  if (bracketK > 0) {
    const by = M.layout.s04.bracketY;
    M.bracket('full', 1969, 2020, { k: 1, color: C.head, y: by, label: '50+ years of street', alpha: bracketK });
    M.bracket('full', 2021, 2026, { k: 1, color: C.accent, y: by, label: 'a few years of lanterns', align: 'right', alpha: bracketK });
  }

  // ---- "~1991" on the strip: a bright copy over the dim one while the building is born from it
  const pillX = M.X(1991, gm), pillY = gm.y;      // rides the sliding street, lands on the floor strip
  const growA = tFinish + 0.45;                   // the building sprouts from the pill while the street is still settling,
                                                  // so the frame never empties between 'finish line' and 'Look closely'
  const pillK = K.io(t, slideA + 0.4, 0.35) * (1 - 0.55 * K.io(t, growA + 1.2, 0.8));   // settles to a quiet reminder
  if (pillK > 0) M.tag(pillX, pillY, { year: '~1991' }, { size: 26, lit: (0.4 + 0.6 * M.bump(t, slideA + 0.75, 1.2)) * (1 - K.io(t, growA + 1.2, 0.8)), alpha: pillK });
  // "Look closely at one": a soft gold ring passes over it
  const ringK = K.io(t, slideA + 0.45, 0.7, 'io');
  if (ringK > 0) K.layer(1 - K.io(t, growA + 0.6, 0.6), () => K.ring(pillX, pillY, 74, 34, ringK, { color: C.head, w: 2.5, rot: 0 }));

  // ---- "a birthday, not a finish line"
  const bdK = K.io(t, tBirthday, 0.6) * (1 - K.io(t, cBuilding, 0.5));
  if (bdK > 0) K.pill('a birthday, not a finish line', 960, 200 + 14 * (1 - K.ease.out(K.io(t, tBirthday, 0.6))), { size: 30, color: C.head, alpha: bdK });

  // ================================================================ the building
  // it grows out of the "~1991" pill: the layout starts tiny with its stone's foot on the pill, and lands on 'full'
  const s0 = 0.12;
  const from = { x: pillX, y: pillY - 18 - (M.BLD.stone.y + M.BLD.stone.h - M.BLD.pivot.y) * s0, s: s0 };
  const L = M.lerpLayout(from, 'full', K.io(t, growA, 1.1, 'io'));
  const grow = {
    stone: K.io(t, growA, 0.55, 'out'),
    walls: K.io(t, growA + 0.4, 0.8, 'back'),       // the scene's one overshoot
    roof: K.io(t, growA + 0.85, 0.5, 'out'),
    door: K.io(t, growA + 1.15, 0.4, 'out'),
    sign: K.io(t, growA + 1.35, 0.4, 'out'),
    poles: K.io(t, growA + 1.5, 0.45, 'out'),
  };
  const hang = (i) => K.io(t, growA + 1.75 + 0.12 * i, 0.5, 'out');

  if (grow.stone > 0) {
    // stone: lit on [[stone]], settles a little once the paint is being talked about
    const stoneLit = K.io(t, cStone, 0.6) * (1 - 0.45 * K.io(t, cPaint, 0.6));
    const iconK = [tFile, tCommit, tMessage].map((a) => K.io(t, a, 0.45, 'out'));
    // paint: blank, then "Python 3.12" on "version", repainted to "Python 3.13" on "redone"
    let sign = '', signFrom = null, signK = null;
    if (t >= tRedone) { sign = 'Python 3.13'; signFrom = 'Python 3.12'; signK = K.io(t, tRedone, 0.5); }
    else if (t >= tVersion) { sign = 'Python 3.12'; signFrom = ''; signK = K.io(t, tVersion, 0.5); }
    // "the number on the sign": the version pill pulses while the roof's carved year steps back
    const signLit = Math.min(1, 0.7 * K.io(t, cPaint, 0.6) * (1 - 0.4 * K.io(t, cLock, 0.6)) + 0.3 * M.bump(t, tNumber - 0.1, 1.5));
    // lock: grows onto the door on "lock"; swapped for a new one on "replaced"
    let lock = [], lockFrom = null, lockK = null;
    if (t >= tReplaced) { lock = 'lock'; lockFrom = 'lock'; lockK = K.io(t, tReplaced, 0.5); }
    else if (t >= tLockW) { lock = 'lock'; lockFrom = []; lockK = K.io(t, tLockW, 0.5); }
    const lockLit = 0.85 * K.io(t, tSecurity, 0.6) * (1 - 0.3 * K.io(t, tBurglars + 0.6, 0.8));
    const doorGlow = 0.45 * K.io(t, tDoor, 0.6) * (1 - 0.4 * K.io(t, tBurglars + 0.6, 0.8));

    M.building(t, {
      layout: L, grow,
      stoneLit, stoneLabel: '', stoneIcons: [{ icon: 'book', k: iconK[0] }, { icon: 'check', k: iconK[1] }, { icon: 'envelope', k: iconK[2] }],
      sign, signFrom, signK, signLit,
      roofLabel: '',                                // drawn below at 26 px with a knock-out (the shared one is 20 px over the tile lines)
      lock, lockFrom, lockK, lockLit, doorGlow,
      lockShake: M.bump(t, tBurglars, 0.45),
      lanterns: 1, hang,
    });

    // the roof label, 26 px C.soft on a roof-coloured knock-out so the tile lines stop at the text;
    // rides with the roof's drop-on (same -36 px offset and alpha as the shared roof)
    if (grow.roof > 0) M.inBuilding(L, () => {
      const ro = { font: 'mono', weight: 600, size: 26, tracking: 3, upper: true };
      const txt = 'PYTHON · 1991', w = K.measure(txt, ro) + 28, dy = -36 * (1 - grow.roof), cy = 352 + dy;
      // the birth year is carved, not painted: drawn in the stone's gold so it reads with the stone, and it steps
      // back while the paint (the version on the front) is being explained, so "the number on the sign" is 3.12
      const plaqueA = grow.roof * (1 - 0.62 * K.io(t, cPaint - 0.1, 0.5) + 0.4 * K.io(t, cLock, 0.7));
      const carved = K.mixColor(C.soft, C.gold, 0.35 + 0.4 * K.io(t, cStone, 0.6) * (1 - 0.5 * K.io(t, cPaint, 0.6)));
      K.layer(plaqueA, () => {
        K.card(960 - w / 2, cy - 17, w, 34, { r: 6, fill: K.mixColor(C.panel, C.tile, 0.55), stroke: false, shadow: false });
        K.text(txt, 960, cy + 26 * 0.34, { ...ro, color: carved, align: 'center' });
      });
    });

    // the stone's eyebrow, faded in on [[stone]] (sliding down as the icons arrive, like the building's own label)
    const labK = K.io(t, cStone, 0.5);
    if (labK > 0) M.inBuilding(L, () => K.eyebrow('STONE · THE IDEA', 960, K.lerp(M.BLD.stoneLabelY[0], M.BLD.stoneLabelY[1], K.ease.io(iconK[0])),
      { size: 20, align: 'center', tracking: 4, color: K.mixColor(C.soft, C.gold, 0.4 + 0.6 * stoneLit), alpha: labK }));

    // the key: slides into the lock on "prove who you are", turns on "scrambled", leaves with the old lock on "replaced"
    const keyIn = K.io(t, tProve, 0.55, 'out');
    const keyA = keyIn * (1 - K.io(t, tReplaced, 0.3));
    if (keyA > 0) M.inBuilding(L, () => {
      // drawn beside the lock (tip at the lock body's right edge) so the two never tangle at this size
      const ks = 46, tip = { x: 960 + M.BLD.lock.s * 0.3 + 3, y: M.BLD.lock.y + M.BLD.lock.s * 0.16 };
      const turn = -0.6 * K.io(t, tScrambled, 0.6, 'io');
      K.layer(keyA, () => K.at(tip.x, tip.y, 1, turn, () =>
        K.at(0.42 * ks + 22 * (1 - keyIn), 0, 1, Math.PI, () => K.icon('key', 0, 0, ks, { color: K.mixColor(C.accent, C.strong, 0.35), w: 3 }))));
    });
  }

  // ---- the three parts, named, then their speeds (each on its spoken words), in scene 14's form:
  //      'stone · barely moves' / 'paint · every year' / 'lock · fastest', with 26 px soft second lines
  const LX = M.toScreen('full', M.BLD.bounds.x1, 0).x + 70;     // speedLabel's default text x (1350)
  const wordO = { font: 'ui', weight: 600, size: 30 };
  const part = (pt, word, aWord, suffix, aSuf, sub, aSub) => {
    M.speedLabel('full', pt, K.io(t, aWord, 0.9), { text: word });
    const y = M.toScreen('full', 0, M.SPEEDS[pt].y).y, col = M.SPEEDS[pt].color;
    const sk = K.io(t, aSuf, 0.5);
    if (sk > 0) K.text(suffix, LX + K.measure(word, wordO) + 12 * (1 - K.ease.out(sk)), y + 30 * 0.34, { ...wordO, color: col, alpha: sk });
    if (sub) {
      const bk = K.io(t, aSub, 0.5);
      if (bk > 0) K.text(sub, LX + 12 * (1 - K.ease.out(bk)), y + 48, { font: 'ui', weight: 500, size: 26, color: C.soft, alpha: bk });
    }
  };
  part('stone', 'stone', cStone, ' · barely moves', tBarely);
  part('sign', 'paint', cPaint, ' · every year', tEveryYear, 'the version', tVersion);
  part('lock', 'lock', tLockW, ' · fastest', tFastest, 'security', tSecurity);
});
