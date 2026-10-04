/* 03 — A string of beads with a tag
   The string of beads appears at full size for the first time (layout.standard): cord draws, beads drop,
   "1 byte = 0 to 255". On "everything" the SAME string shrinks into the bottom slot of a four-row list
   (photo.jpg, song.mp3, budget.xlsx, then itself), and on "Python script" its own tag appears: hello.py.
   Before [[tag]] the other rows fade and that one string grows back to layout.standard carrying its tag;
   on "Tied" the tag gives a small wiggle and glow, "name" and "extension" are pointed out, then the computer
   carries the string without understanding it. Exit: pills, mark and caption fade so the last frame is the bare
   layout.standard string with tag hello.py, which is what 04 opens on. */
SCENE('03', (t, S) => {
  const C = K.C, L = M.layout.standard;
  const OUT = S.out || 27.97;
  const endK = K.io(t, OUT - 1.0, 0.7);          // everything but the string fades before the hand-over
  K.bg({ glow: K.lerp(0.4, 0.45, endK), glowX: 960, glowY: K.lerp(520, 440, endK) });   // ends on 04's background

  // ---- cues (local seconds) and the words they hang on
  const cBeads = S.cue('beads', 0);
  const cEvery = S.cue('everything', 7.6);
  const cTag = S.cue('tag', 14.28);
  const cCarry = S.cue('carry', 22.52);
  const wByte = S.find('byte', 0, 3.6);            // "one byte"
  const wBead = S.find('bead', 0, 2.76);           // "Each bead"
  const wPhoto = S.find('photo', 0, 7.77);
  const wSong = S.find('song', 0, 8.56);
  const wSheet = S.find('spreadsheet', 0, 9.17);
  const wPy = S.find('Python', 0, 10.65);
  const wOrder = S.find('order', 0, 13.28);
  const wName = S.find("file's", 0, 17.6);
  const wDot = S.find('dot', 0, 20.19);
  const wExt = S.find('extension', 0, 20.87);
  const wMoves = S.find('moves', 0, 23.85);
  const wNever = S.find('never', 0, 25.15);

  // tag sway phase matched to 04's local clock, so the tag hangs at the same angle through the crossfade
  const tSway = t - OUT;

  // ---- carry: the whole string slides right 120 px and back, as if carried
  const carryX = 120 * (K.io(t, wMoves - 0.3, 0.8) - K.io(t, wMoves + 0.7, 0.8));

  // ---- eyebrow (gone before the list takes the frame)
  const ebA = K.env(t, cBeads - 0.2, cEvery - 0.4, 0.5);
  if (ebA > 0) K.eyebrow('ONE FILE', 960, 300, { align: 'center', alpha: ebA });

  // ---- the list: four whole files, each its own string with its own tag. Row 4 IS the main string.
  const MS = 0.55, MX = 1091, TAGW = 250, SLOT = 715;
  const files = [
    { name: 'photo.jpg', bytes: [255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1], at: wPhoto, y: 265 },
    { name: 'song.mp3', bytes: [73, 68, 51, 4, 0, 0, 0, 0, 0, 35, 84, 83], at: wSong, y: 415 },
    { name: 'budget.xlsx', bytes: [80, 75, 3, 4, 20, 0, 6, 0, 8, 0, 0, 0], at: wSheet, y: 565 },
  ];

  // ---- the one string's pose: u = 0 at layout.standard, u = 1 in the list's bottom slot
  const uOut = K.io(t, cEvery - 0.45, 0.75);
  const uIn = K.io(t, cTag - 0.85, 0.8);
  const u = uOut - uIn;
  const X = K.lerp(L.x, MX, u) + carryX, Y = K.lerp(L.y, SLOT, u), Sc = K.lerp(L.s, MS, u);
  // numbers ride on top of a label-less copy: they fade out as it leaves, back in as it lands
  const numA = 1 - K.io(t, cEvery - 0.45, 0.3) + K.io(t, cTag - 0.25, 0.4);

  // tag: appears on "Python script" while in the slot; size and width morph between list and standard
  const tagName = 'hello.py';
  const wMain = Math.max(220, K.measure(tagName, { font: 'mono', weight: 600, size: 34 }) + 26 * 2 + 40);
  const tagPx = K.lerp(34, 52 * MS, u);
  const tagK = K.io(t, wPy, 0.4);
  // [[tag]]: "Tied to the string" -> a small wiggle, decaying (no overshoot easing)
  const dt = t - cTag;
  const wig = dt > 0 ? 0.11 * Math.sin(dt * 9) * Math.exp(-dt * 2.6) : 0;
  const markK = K.io(t, wDot - 0.1, 0.6) * (1 - endK);
  // bead 0 ringed while "one byte" is said, undrawn before the list
  const ring0 = K.io(t, wBead, 0.6) - K.io(t, cEvery - 0.8, 0.4);

  // ---- "beads, in order": a gold glow runs along every row (under the beads)
  const sweep = K.seg(t, wOrder - 0.9, wOrder + 0.6);
  const filesOut = K.io(t, cTag - 0.95, 0.5);
  const sweepRow = (fy, a) => {
    if (!(sweep > 0 && sweep < 1) || a <= 0) return;
    const g0 = M.geo(MX, fy, MS);
    const sx = K.lerp(g0.x0 - 40, g0.x1 + 40, K.ease.io(sweep));
    const fade = Math.min(1, sweep * 6, (1 - sweep) * 6);
    K.glow(sx, fy, 80, C.head, 0.32 * fade * a);
  };

  files.forEach((f) => {
    const a = K.io(t, f.at - 0.15, 0.4) * (1 - filesOut);
    if (a <= 0) return;
    sweepRow(f.y, a);
    M.drawString(MX, f.y, MS, {
      t, bytes: f.bytes, labels: 'none', alpha: a,
      cordK: K.io(t, f.at - 0.15, 0.5),
      beadK: (i) => K.stagger(t, f.at - 0.1, i, M.motion.beadStep, 0.4),
      tag: { name: f.name, size: 52, w: TAGW }, tagK: K.io(t, f.at, 0.4),
    });
  });
  if (u > 0.98) sweepRow(SLOT, 1);

  // ---- the one string (hello.py: print("hi") + newline)
  const tagOpt = { name: tagName, size: tagPx / Sc, w: K.lerp(wMain, TAGW, u), rot: -0.06 + wig, mark: markK };
  const base = {
    t: tSway, preset: 'py',
    cordK: K.io(t, cBeads, 0.8),
    beadK: (i) => K.stagger(t, cBeads + 0.6, i, M.motion.beadStep, 0.4),
    tag: tagK > 0 ? tagOpt : false, tagK,
    ringBeads: { 0: ring0 },
  };
  // tag glow on "Tied" (behind everything of the string)
  const tagPulse = dt > 0 && dt < 1.4 ? Math.sin(Math.PI * dt / 1.4) : 0;
  if (tagPulse > 0) {
    const ex = M.geo(X, Y, Sc).eye.x;
    K.glow(ex - wMain / 2 - 10, Y, 190, C.head, 0.22 * tagPulse);
  }
  let G;
  if (numA < 1) G = M.drawString(X, Y, Sc, { ...base, labels: 'none' });
  if (numA > 0) G = M.drawString(X, Y, Sc, { ...base, alpha: numA });

  // ---- "1 byte = 0 to 255" under bead 0
  const b0 = M.geo(L.x, L.y, L.s).beads[0];
  const byteA = 1 - K.io(t, cEvery - 0.6, 0.4);
  if (byteA > 0) K.layer(byteA, () => K.rise(t, wByte - 0.1, () => K.pill('1 byte = 0 to 255', b0.x + 40, 650, { size: 30 })));

  // ---- name (above the tag) and extension (under it)
  const tg = G && G.tag;
  if (tg && u < 0.02) {
    const tcx = (tg.x0 + tg.x1) / 2;
    const nameA = K.env(t, wName - 0.1, cCarry - 0.2, 0.45);
    if (nameA > 0) K.pill('name', tcx - 10, 420, { size: 26, alpha: nameA });
    const extA = (t >= wExt - 0.1 ? 1 : 0) * (1 - endK);
    if (extA > 0) K.layer(extA, () => K.rise(t, wExt - 0.1, () => K.pill('extension', tg.ext.cx, 620, { size: 26, color: C.head })));
  }

  // ---- "It never knows what they mean"
  const qA = K.io(t, wNever - 0.2, 0.6) * (1 - endK);
  if (qA > 0) {
    const p = K.seg(t, wNever - 0.1, wNever + 0.7), pulse = Math.sin(Math.PI * p);   // one pulse on "never knows"
    const qx = 960 + carryX;
    K.glow(qx, 395, 70, C.strong, 0.12 * pulse * qA);
    K.icon('question', qx, 395, 60 * (1 + 0.22 * pulse), { color: C.strong, w: 3.5, alpha: 0.9 * qA });
    K.rise(t, wNever - 0.2, () => K.text('stored, moved, never understood', 960, 770, { size: 30, font: 'ui', weight: 600, color: C.strong, align: 'center', alpha: qA }));
  }
});
