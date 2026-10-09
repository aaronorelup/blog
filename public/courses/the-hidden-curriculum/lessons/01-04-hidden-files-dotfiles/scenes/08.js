// 08: Where the picture breaks.
// The whole shop dims except the wall, door and sign. The two signs of hiding (a gold dot, a Hidden tag) show up as
// "only a display choice" while the door loses its paint (dotted outline) and the wall turns dashed. Then a program,
// a script, an agent and a piece of malware walk straight through the dotted door; the porter alone stays on the
// floor ("the tour skips it"). Last, three real locks rise in the back room with their lesson numbers.
SCENE('08', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C;
  const cBreak = S.cue('break', 0);
  const cWalk = S.cue('walk-in', 10.17);
  const cLocks = S.cue('real-locks', 20.04);
  const w = (word, n, fb) => S.find(word, n, fb);

  // --- beat 1: dim everything but wall, door and sign
  const dimK = K.io(t, cBreak + 0.4, 0.7);
  const tStaff = w('staff', 0, 2.6);                 // "a real staff only sign"
  const tDot = w('dot', 0, 6.08);                    // "A dot,"
  const tFlag = w('flag', 0, 7.4);                   // "a Hidden flag,"
  const tDisplay = w('display', 0, 8.6);             // "only a display choice"
  const paintOff = K.io(t, tDisplay, 0.8);           // door paint 1 -> 0 with the wall going dashed
  const ringK = K.io(t, tStaff, 0.6) * (1 - K.io(t, tDisplay, 0.6));

  // --- beat 2: the porter faces the door and gets his caption on "tour that skips it"
  const tTour = w('tour', 0, 19.5);
  const capK = K.io(t, tTour - 0.1, 0.5);

  M.shop(t, {
    floorDim: dimK, roomDim: dimK,
    wallDash: paintOff,
    door: { paint: 1 - paintOff, open: 0 },
    sign: { dim: 0.55 * paintOff },
    porter: { face: t >= cWalk ? 1 : -1, caption: capK > 0 ? 'the tour skips it' : null, captionK: capK },
  });

  // gold attention ring on the sign while "a real staff only sign is a rule" is said
  if (ringK > 0) K.layer(ringK, () => K.ring(L.sign.x, L.sign.y, 118, 44, K.io(t, tStaff, 0.6), { color: C.head, w: 3, rot: 0 }));

  // --- the two signs of hiding, top of the back room, then "only a display choice"
  const rowOut = 1 - K.io(t, cLocks, 0.6);
  const dotK = K.io(t, tDot, 0.5), flagK = K.io(t, tFlag, 0.5), dispK = K.io(t, tDisplay, 0.6);
  if (rowOut > 0) K.layer(rowOut, () => {
    if (dotK > 0) M.dotName('.env', 1250, 330, { size: 44, alpha: dotK, dotK: K.io(t, tDot + 0.15, 0.5), glow: dotK });
    if (flagK > 0) {
      K.text('or', 1450, 326, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: flagK });
      M.tag(1570, 274, { t, k: flagK, side: 1 });
    }
    if (dispK > 0) K.text('only a display choice', 1500, 460, { ...M.type.read, color: C.head, align: 'center', alpha: dispK });
  });

  // --- beat 3: four things walk straight through the dotted door
  const walkers = [
    { label: 'program', icon: 'code', at: w('program', 0, cWalk + 0.3) },
    { label: 'script', icon: 'terminal', at: w('script', 0, cWalk + 1.5) },
    { label: 'agent', icon: 'staff', at: w('agent', 0, cWalk + 2.6) },
    { label: 'malware', icon: 'warning', at: w('malware', 0, cWalk + 4.1) },
  ];
  // first in walks farthest, so no one walks over someone already standing; the path runs high (y 630, labels at 686)
  // so it clears the porter's head (top ~785) by ~100 px, then drops to the room floor once through the doorway
  const destX = [1765, 1595, 1425, 1255], wy = 790, walkY = 630, startX = 640, walkD = 2.4;
  const walkDim = 1 - 0.45 * K.io(t, cLocks, 0.6);
  walkers.forEach((it, i) => {
    const a0 = it.at - 0.1;
    const fin = K.io(t, a0, 0.35);
    if (fin <= 0) return;
    const u = K.io(t, a0, walkD, 'io');
    const x = K.lerp(startX, destX[i], u);
    const moving = Math.sin(Math.PI * K.clamp(u));
    const drop = K.clamp((x - 1080) / 170);   // descends to the room floor after the doorway
    const y = K.lerp(walkY, wy, K.io(drop, 0, 1)) - Math.abs(K.wave(t, 9, 4, i)) * moving;
    K.layer(fin * walkDim, () => {
      const col = it.icon === 'warning' ? P.danger : C.strong;
      if (it.icon === 'staff') M.staff(x, y, 48, { t, i: 1 });
      else {
        K.glow(x, y, 60, col, 0.14);
        K.icon(it.icon, x, y, 50, { color: col, w: 3.2 });
      }
      K.text(it.label, x, y + 56, { ...M.type.label, color: C.body, align: 'center' });
    });
  });

  // --- beat 4: real locks rise in the back room (permissions, encryption, secrets manager)
  const locks = [
    { text: 'file permissions', num: '01.07', at: w('permissions', 0, cLocks + 2.4) - 0.5 },
    { text: 'encryption', num: '15.05', at: w('encryption', 0, cLocks + 3.4) },
    { text: 'secrets manager', num: '15.07', at: w('secrets', 0, cLocks + 4.6) },
  ];
  const lockY = [320, 455, 630], cx = 1500;
  locks.forEach((lk, i) => {
    const k = K.io(t, lk.at, 0.6);
    if (k <= 0) return;
    const ft = { font: 'ui', weight: 600, size: 30 }, fn = { font: 'mono', weight: 600, size: 26 };
    const tw = K.measure(lk.text, ft), nw = lk.num ? K.measure(lk.num, fn) + 22 : 0;
    const cw = 40 + 44 + 16 + tw + nw + 34, ch = 66;
    const x0 = cx - cw / 2, y = lockY[i] + (1 - k) * 22;
    K.layer(k, () => {
      K.card(x0, y - ch / 2, cw, ch, { r: ch / 2, fill: C.tile, stroke: K.rgba(C.head, 0.7), shadow: true });
      K.glow(x0 + 50, y, 40, C.head, 0.18);
      K.icon('lock', x0 + 50, y, 34, { color: C.head, w: 3 });
      K.text(lk.text, x0 + 84, y + 11, { ...ft, color: C.strong });
      if (lk.num) K.text(lk.num, x0 + 84 + tw + 22, y + 9, { ...fn, color: C.head });
    });
  });
});
