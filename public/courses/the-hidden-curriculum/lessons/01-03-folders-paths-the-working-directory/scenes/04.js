/* 01.03 scene 04 · Absolute paths: the full address
   Metaphor: THE MAP. The gold root edge is the start point; an absolute route is drawn from it to a target.
   The route ends at the file it names (data.csv), which arrives when the narration says "the file".
   The dot dims to 0.4 and stays on the map (the relative routes come in 05). */
SCENE('04', (t, S) => {
  const { P, T, L } = M;
  const C = K.C;
  K.bg();

  // cue times (local seconds into this section)
  const A = S.cue('absolute', 0);
  const W = S.cue('windows-form', 13.9);
  const U = S.cue('unix-form', 23.35);
  const SP = S.cue('separators', 33.9);
  // word times inside the beats, so each part lights as it is said
  const tColon = S.find('colon', 0, W + 4.8);
  const tFolder = S.find('folder', 0, W + 7.0);
  const tFile = S.find('file', 0, W + 8.2);
  const tSlash = S.find('forward', 0, U + 3.0);
  const tBack = S.find('backslash', 1, SP + 0.1);
  const tFwd = S.find('forward', 1, SP + 3.0);
  // the drive pill appears as "C colon backslash" is said (the "C" starts about 0.5 s before "colon")
  const tDrive = tColon - 0.5;

  // THE MAP, with the dot dimmed (it is still the working directory, just not the start of this route)
  const dotA = 1 - 0.6 * K.io(t, 0, 0.8);
  M.frame(t, { dotAlpha: dotA });

  // the absolute route: from the root edge down to the file it names, counted from the edge.
  // The file sits centred at (fileX, fileY) with its top edge just above the arrow tip.
  const fileX = 1300, fileY = 603, fileS = 150;
  const target = { x: fileX, y: fileY - fileS / 2 - 8 };
  M.route([[L.root.x, L.root.y], [target.x, target.y]], { k: K.io(t, A, 1.4) });
  M.label('counted from the root', 1262, 430,{ align: 'left', alpha: K.io(t, A + 0.6, 0.6) });

  // the target marker stands in for the file until the file is named, then the file takes its place
  const fileA = K.io(t, tFile - 0.3, 0.5);
  M.tick(target.x, target.y + 8, { k: K.io(t, A + 1.1, 0.4) * (1 - fileA), alpha: 1 });
  M.file(fileX, fileY, fileS, 'data.csv', 'csv', { alpha: fileA });

  // drive pill (Windows) and root pill (macOS, Linux): each lights at its own cue
  const cLit = t >= tDrive && t < U;
  const cGlow = K.io(t, tDrive, 0.6) * (1 - 0.7 * K.io(t, U, 0.5));
  M.addressPill('C:\\', L.pillDrive.x, L.pillDrive.y, {
    alpha: K.io(t, tDrive - 0.2, 0.5), lit: cLit, glow: cGlow, color: cLit ? P.root : P.ink,
  });
  const sLit = t >= tSlash - 0.4;
  M.addressPill('/', L.pillSlash.x, L.pillSlash.y, {
    alpha: K.io(t, tSlash - 0.6, 0.5), lit: sLit, glow: K.io(t, tSlash - 0.4, 0.6), color: sLit ? P.root : P.ink,
  });

  // literal paths, one segment at a time: the gold overlay sits exactly over the cream glyphs
  const drawSegs = (segs, x0, y, litK, alpha) => {
    const full = segs.join('');
    K.text(full, x0, y, { ...T.mono, color: P.ink, align: 'left', alpha });
    let acc = '';
    segs.forEach((s, i) => {
      const xi = x0 + K.measure(acc, T.mono);
      if (litK[i] > 0.01) K.text(s, xi, y, { ...T.mono, color: P.root, align: 'left', alpha: alpha * litK[i] });
      acc += s;
    });
  };

  // Windows form: drive first, then the folder names, then the file
  const wSegs = ['C:\\', 'Users\\', 'you\\', 'project\\', 'data.csv'];
  const wX = 960 - K.measure(wSegs.join(''), T.mono) / 2;
  drawSegs(wSegs, wX, 812, [
    K.io(t, tColon, 0.4), K.io(t, tFolder, 0.4), K.io(t, tFolder, 0.4), K.io(t, tFolder, 0.4), K.io(t, tFile, 0.4),
  ], K.io(t, W, 0.5));

  // Unix form: one root slash, then the same kind of path, appearing under the first line
  const uSegs = ['/', 'home/', 'you/', 'project/', 'data.csv'];
  const uX = 960 - K.measure(uSegs.join(''), T.mono) / 2;
  drawSegs(uSegs, uX, 862, [K.io(t, tSlash, 0.4), 0, 0, 0, 0], K.io(t, U, 0.5));

  // separators: backslash and forward slash, joined to the root label by hairlines (no command text)
  const bkA = K.io(t, SP, 0.5);
  const fwA = K.io(t, tFwd, 0.5);
  K.line(960, 182, 600, 316, { k: K.io(t, SP, 0.6), color: C.body, w: 2.5, alpha: 0.7 });
  K.line(960, 182, 1230, 316, { k: K.io(t, tFwd, 0.6), color: C.body, w: 2.5, alpha: 0.7 });
  M.pill('backslash', 560, 330, { alpha: bkA, color: P.ink });
  M.pill('forward slash', 1330, 330, { alpha: fwA, color: P.ink });
  M.label('Windows habit', 560, 386, { alpha: K.io(t, tBack, 0.5) });
  M.label('Unix habit', 1330, 386, { alpha: fwA });
});
