/* 01.01 · scene 02 — Where it lives: a dot T X T
   The course map (pin on 01, District 1 The Machine), then Aaron's true story: Python typed in Notepad,
   saved as hello.txt, renamed to hello.py (the same hello.* file the string carries from 03). The bead string waits off-screen and returns in 03.
   Beats (local seconds, cues.json):
     - [[pin]] 0      the map assembles (map.js stagger); on "District One" the pin drops on row 01 (the
                      scene's one 'back'), the camera eases toward The Machine; its question stays lit.
     - [[notepad]]    camera eases back, map dims, a Notepad window rises on "Aaron" and the cap tile + "IT
                      degree" pill arrive from the right with it; "wrote Python" types print("hi"); "saved" draws a gold arrow
                      to the file icon, which lands on "dot T X T" as hello.txt.
     - [[rename]]     on "renaming" / "dot P Y" only the ending crossfades txt -> py (badge and name; "hello."
                      never moves) and a gold underline marks the ending; "Only the label" adds the pill.
     - [[missing]]    story stays, dims to 35%, lifts 70 px and slowly pushes in (z 1.03); cream "Nobody handed
                      you this part." (44 px) then gold "a missing semester" + underline on "missing".
   Exit: dimmed Notepad + hello.py under the cream line and the gold 'a missing semester'; map gone. */
SCENE('02', (t, S) => {
  const C = K.C, g = K.ctx();

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 0);
  const tDist = S.find('District', 0, 2.74);
  const tAsks = S.find('asks', 0, 5.39);
  const tNote = S.cue('notepad', 7.8);
  const tDeg = S.find('degree', 0, 10.18);
  const tIT = tNote + 0.45;                                  // badge lands on "Aaron", on screen before "I T degree"
  const tWrote = S.find('wrote', 0, 11.47);
  const tSaved = S.find('saved', 0, 13.52);
  const tTXT = S.find('dot', 0, 14.86);                      // "dot T X T"
  const tRen = S.cue('rename', 17.24);
  const tPY = S.find('dot', 1, 19.18);                       // "dot P Y"
  const tOnly = S.find('Only', 0, 23.24);
  const tMiss = S.cue('missing', 25.17);
  const tSem = S.find('missing', 0, 29.78);                 // "a missing semester" lands on "missing"

  K.bg({ glow: 0.45 });

  // ------------------------------------------------------------------ the map (full canvas, then faint)
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    { at: tDist, x: 700, y: 440, z: 1.2, d: 0.8 },
    { at: tNote, x: 960, y: 540, z: 1, d: 0.8 },
  ]);
  const mapA = (1 - 0.97 * K.io(t, tNote - 0.1, 0.45)) * (1 - K.io(t, tMiss, 0.8));         // map all but gone behind the story (<= 3%)
  K.layer(mapA, () => K.withCam(cam, () => K.map.draw(t, {
    t0: tPin,
    focus: 'machine',
    focusK: K.io(t, tDist, 0.6),
    dim: 0.97,                                             // other districts fade to ~3% before the push, so edge-clipped cards never read
    pin: '01',
    pinK: K.io(t, tDist, 0.25),
    pinDrop: K.io(t, tDist, 0.7, 'back'),
    pinGlowK: K.io(t, tDist + 0.4, 0.6),
    lanterns: 0.5,
  })));
  // "which asks what's on your computer": a soft gold underline under District 1's question
  {
    const d = K.map.district('machine');
    const qk = K.io(t, tAsks + 0.3, 0.6) * (1 - K.io(t, tNote, 0.5));
    if (qk > 0) K.withCam(cam, () => K.mark(d.x + 40, d.y + K.map.ROW.q + 8, K.measure(d.q, { font: 'ui', size: K.map.TYPE.q }) + 6, qk, { alpha: 0.8, w: 3 }));
  }

  // ------------------------------------------------------------------ Notepad story (fades out on [[missing]])
  // [[missing]]: the story stays, dims to ~35%, lifts a little and slowly pushes in under the line
  const missK = K.io(t, tMiss, 0.9);
  const push = Math.max(0, Math.min(1, (t - tMiss) / 6.6));
  const storyA = 1 - 0.65 * missK;
  const storyCam = { x: 960, y: 540 + 70 * missK, z: 1 + 0.03 * push };
  K.layer(storyA, () => K.withCam(storyCam, () => {
  const winK = K.io(t, tNote + 0.25, 0.6);
  if (winK > 0) {
    K.layer(winK, () => {
      const wy = 220 + (1 - winK) * 40;
      const r = K.win(260, wy, 820, 520, { kind: 'notepad', title: t < tTXT - 0.15 ? 'Untitled - Notepad' : t < tPY - 0.1 ? 'hello.txt - Notepad' : 'hello.py - Notepad', titleSize: 26 });
      K.editor(r, t, ['print("hi")'], { syntax: 'py', size: 36, typeAt: tWrote, cps: 14 });
    });
  }

  // the IT degree: cap tile + pill arrive from the right
  const capK = K.io(t, tIT, 0.6);
  if (capK > 0) {
    K.layer(capK, () => {
      const dx = (1 - capK) * 60;
      K.iconTile('cap', 1400 + dx, 260, 90);
      K.pill('IT degree', 1400 + dx, 350, { size: 26 });
    });
  }

  // saved as hello.txt: arrow from the window to the file
  const arrK = K.io(t, tSaved, 0.8);
  const fx = 1400, fy = 540, fs = 180;
  K.arrow(1100, 470, 1280, 530, { k: arrK, bend: -40, color: C.head, w: 3 });
  const fileK = K.io(t, tTXT - 0.15, 0.5);
  if (fileK > 0) {
    const renK = K.io(t, tPY - 0.1, 0.6);                  // ending crossfade, on "dot P Y"
    K.layer(fileK, () => {
      const y = fy + (1 - fileK) * 30;
      if (renK < 1) K.file(fx, y, fs, { ext: 'txt' });
      if (renK > 0) K.file(fx, y, fs, { ext: 'py', alpha: renK });
      // the name: "hello" stays put, only the ending crossfades
      const ny = y + fs / 2 + 58, size = 30, fo = { font: 'mono', size, color: C.body };
      const stem = 'hello', ws = K.measure(stem, fo);
      const wt = K.measure('.txt', fo), wp = K.measure('.py', fo);
      const ew = K.lerp(wt, wp, renK);
      const x0 = fx - (ws + ew) / 2;
      K.text(stem, x0, ny, fo);
      K.text('.txt', x0 + ws, ny, { ...fo, alpha: 1 - renK });
      K.text('.py', x0 + ws, ny, { ...fo, alpha: renK, color: C.strong });
      // gold underline under only the ending
      const ringK = K.io(t, tPY + 0.35, 0.7) * (1 - K.io(t, tMiss, 0.6));
      if (ringK > 0) K.mark(x0 + ws, ny + 12, wp, ringK, { alpha: 0.95, w: 4 });   // gold underline of only the ending (a ring grazed the "o")
    });
  }

  // "Only the label." pill
  const onlyK = K.io(t, tOnly, 0.5) * (1 - K.io(t, tMiss, 0.6));
  if (onlyK > 0) K.layer(onlyK, () => K.pill('only the label changed', fx, 790 - onlyK * 10, { size: 26, color: C.head }));

  }));

  // [[missing]]: the story clears; a quiet line, then the gold one on "semester"
  const nbK = K.io(t, tMiss + 0.2, 0.8);
  if (nbK > 0) K.text('Nobody handed you this part.', 960, 790 - nbK * 8, { font: 'ui', size: 44, weight: 600, color: C.strong, align: 'center', alpha: nbK });
  const semK = K.io(t, tSem - 0.15, 0.7);
  if (semK > 0) {
    const so = { font: 'ui', size: 52, weight: 600, color: C.head, align: 'center' };
    K.text('a missing semester', 960, 868 - semK * 8, { ...so, alpha: semK });
    const w = K.measure('a missing semester', so);
    K.mark(960 - w / 2, 888, w, K.io(t, tSem + 0.3, 0.7), { alpha: 0.85, w: 3 });
  }
});
