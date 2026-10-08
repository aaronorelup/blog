/* 01.03 section 06 · The same name, two places
   Local cue times (from cues.json, section start 194.564):
     works-on-my-machine 0.00 · two-places 9.74 · same-name 23.05
   Word anchors used (local): "script" 4.45, "data" 6.19, "Run" 9.74 (first), "finds" 12.41,
   "another" 16.23, "looks" 19.12, "nothing" 21.09, "fails" 22.05, "friend" 26.45.
   Each card carries its run label on top: left "run from the project folder" (said at 9.74),
   right "run from another folder" (said at 16.23). The friend's label sits on the right card's
   lower edge when the narration says whose project it is.
   One script.py, two folders: the same icon sits at the same offset from each dot. The left copy
   fades in with the word "script"; the right copy arrives with the second folder ("another").
   The same relative arrow reaches the same offset from each dot; on the right it ends at empty
   ground, a terracotta X marks the stop, and a "data.csv not found" marker sits on the panel.
   No data.csv icon is drawn on the right. */

SCENE('06', (t, S) => {
  const { P, L } = M;
  K.bg();

  // a terracotta X drawn as two strokes, the first drawn in over k 0..0.5, the second over 0.5..1
  const stopX = (x, y, s, k, color) => {
    const k1 = K.clamp(k * 2), k2 = K.clamp(k * 2 - 1);
    K.line(x - s, y - s, x + s, y + s, { k: k1, color, w: 6 });
    K.line(x + s, y - s, x - s, y + s, { k: k2, color, w: 6 });
  };

  const tScript = S.find('script', 0, 4.45);
  const tData = S.find('data', 0, 6.19);
  const tRun = S.cue('two-places', 9.74);
  const tFinds = S.find('finds', 0, 12.41);
  const tAnother = S.find('another', 0, 16.23);
  const tLooks = S.find('looks', 0, 19.12);
  const tNothing = S.find('nothing', 0, 21.09);
  const tFails = S.find('fails', 0, 22.05);
  const tSame = S.cue('same-name', 23.05);
  const tFriend = S.find('friend', 0, 26.45);

  // both maps hold from the first frame, easing in from a slightly smaller size
  const grow = K.io(t, -0.3, 0.7, 'out');
  M.framePair(t, { grow, leftDot: true, rightDot: false, glow: 0.35 });

  // the dot labels: each dot says what it is
  const aLabel = K.io(t, -0.3, 0.6);
  M.dotLabel('working directory', L.dotL.x, L.dotL.y + 62, { alpha: aLabel });

  // the run labels on top of each card: which folder the run starts from
  const cxL = L.left.x + L.left.w / 2, cxR = L.right.x + L.right.w / 2;   // 490, 1430
  const aRunL = K.io(t, tRun, 0.5);
  if (aRunL > 0.001) M.label('run from the project folder', cxL, 182, { color: P.ink, alpha: aRunL });
  const aRunR = K.io(t, tAnother, 0.5);
  if (aRunR > 0.001) M.label('run from another folder', cxR, 182, { color: P.ink, alpha: aRunR });

  // the same offset from each dot: script.py sits up and to the left of it, in that folder
  const SCRIPT_DX = -190, SCRIPT_DY = -140, SCRIPT_S = 120;
  const sxL = L.dotL.x + SCRIPT_DX, syL = L.dotL.y + SCRIPT_DY;   // (300, 380)
  const sxR = L.dotR.x + SCRIPT_DX, syR = L.dotR.y + SCRIPT_DY;   // (1240, 380)

  // left folder: script.py appears as the word "script" is said
  const aScriptL = K.io(t, tScript, 0.5);
  if (aScriptL > 0.001) {
    M.file(sxL, syL, SCRIPT_S, 'script.py', 'py', { alpha: aScriptL, nameSize: 26 });
    M.pill('same script.py', sxL, syL - 92, { mono: true, color: P.ink, alpha: aScriptL });
  }

  // left folder: data.csv is in the project folder; the run from there finds it
  const aData = K.io(t, tData, 0.5);
  if (aData > 0.001) M.file(650, 400, 160, 'data.csv', 'csv', { alpha: aData });
  // the arrow is measured from the dot: the same offsets are used on the right (+955 on x)
  M.route([[505, 505], [545, 465], [585, 425]], { k: K.io(t, tRun, 1.2) });
  const aFound = K.io(t, tFinds, 0.4);
  if (aFound > 0.001) M.pill('found', 800, 400, { lit: true, color: P.root, alpha: aFound });

  // right folder: the second run starts from another folder; the dot slides in from the middle,
  // and the same script.py is already sitting in this folder, at the same offset
  const kA = K.io(t, tAnother, 0.8, 'out');
  if (kA > 0.001) {
    const rx = 960 + (L.dotR.x - 960) * kA;
    M.dot(t, rx, L.dotR.y, { alpha: Math.min(1, kA * 4) });
    M.dotLabel('working directory', rx, L.dotR.y + 62, { alpha: kA });
  }
  const aScriptR = K.io(t, tAnother + 0.3, 0.5);
  if (aScriptR > 0.001) {
    M.file(sxR, syR, SCRIPT_S, 'script.py', 'py', { alpha: aScriptR, nameSize: 26 });
    M.pill('same script.py', sxR, syR - 92, { mono: true, color: P.ink, alpha: aScriptR });
  }

  // the same relative arrow reaches for the same offset (where data.csv would be), and stops at empty ground
  M.route([[1445, 505], [1485, 465], [1525, 425]], { k: K.io(t, tLooks, 1.4) });
  const kN = K.io(t, tNothing, 0.5);
  stopX(1545, 425, 20, kN, P.miss);

  // the failure on the right: a red marker, no data.csv icon there
  const aMiss = K.io(t, tFails, 0.4);
  if (aMiss > 0.001) M.pill('data.csv not found', 1430, 690, { mono: true, color: P.miss, stroke: P.miss, alpha: aMiss });

  // the friend's project, named on the right card's lower edge
  const aFriend = K.io(t, tFriend, 0.5);
  if (aFriend > 0.001) M.label("a friend's project", cxR, 856, { color: P.body, alpha: aFriend });

  // the lesson's summary line for this section, held through the end
  const aEye = K.io(t, tSame, 0.6);
  if (aEye > 0.001) M.eyebrow('same words, two dots', 960, 150, { alpha: aEye });
});
