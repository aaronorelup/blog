/* 03 — The desk, five years ago and now.
   The same desk eases from its standard size down to the tiny 2021 desk (text cards, ~2K tokens, one API letter slot),
   then up to the hall (photos, recordings, rooms, phone lines, a studio). Two things that did not change: the clerk
   writes one piece at a time, and nothing stays overnight (papers slide off, then are all handed back at once). */
SCENE('03', (t, S) => {
  const C = K.C, L = M.layout, COLD = M.palette.cold;
  K.bg({ glowX: 960, glowY: 220 });

  // ---------------------------------------------------------------- timing
  const cSmall = S.cue('small-desk', 5.26), cNow = S.cue('now', 21.06), cSame = S.cue('same', 29.25), cOver = S.cue('overnight', 36.69);
  const tModel = S.find('model', 0, 0.24);
  const tText = S.find('Text', 0, 9.85), tTwo = S.find('two', 0, 11.33), tThou = S.find('thousand', 0, 11.58);
  const tSlot = S.find('letter', 0, 13.79), tApi = S.find('API', 0, 15.78), tProg = S.find('programmers', 0, 16.55);
  const tNoGpt = S.find('ChatGPT', 0, 18.14), tNoMem = S.find('memory', 0, 19.26), tNoTools = S.find('tools', 0, 19.83);
  const tPhotos = S.find('photos', 0, 23.31), tRec = S.find('recordings', 0, 23.82);
  const tRooms = S.find('rooms', 0, 24.82), tPhone = S.find('phone', 0, 26.08), tStudio = S.find('studio', 0, 27.37);
  const tWrites = S.find('writes', 0, 32.54), tPiece = S.find('piece', 0, 33.6);
  const tEvery = S.find('Every', 0, 39.03), tStarts = S.find('starts', 0, 39.83), tHanded = S.find('handed', 0, 42.53);

  // ---------------------------------------------------------------- the desk: standard -> 2021 -> hall
  const Dstd = M.at(L.std), D21 = M.at(L.y2021), DH = M.at(L.hall);
  const k1 = K.io(t, cSmall, M.motion.grow), k2 = K.io(t, cNow, M.motion.grow);
  const D = k2 > 0 ? M.lerpDesk(D21, DH, k2) : M.lerpDesk(Dstd, D21, k1);

  // night: the lamp dims and a moon passes, then a new request relights it
  const night = K.io(t, cOver + 0.15, 0.8) * (1 - K.io(t, tEvery, 0.8));
  const sameK = K.io(t, cSame, 0.6);                      // "two things did not change": the rest dims
  const surK = K.io(t, cNow + 0.2, 0.6);                  // surroundings of the hall exist only after 'now'
  const surA = (1 - 0.7 * sameK) * (1 - K.io(t, cOver, 0.6));

  // ---------------------------------------------------------------- year tag (top-left)
  const y21 = K.io(t, cSmall, 0.5) * (1 - K.io(t, cNow, 0.4));
  const y26 = K.io(t, cNow + 0.3, 0.5);
  if (y21 > 0) M.dated('autumn 2021', 110, 182 - (1 - y21) * 8, { size: 34, alpha: y21 });
  if (y26 > 0) M.dated('Oct 2026', 110, 182 - (1 - y26) * 8, { size: 34, alpha: y26 });

  // ---------------------------------------------------------------- the 2021 API door (left; gone before the hall desk reaches it)
  const doorA = K.io(t, tSlot - 0.2, 0.6) * (1 - K.io(t, cNow, 0.45));
  let slot = { x: L.door.x + 85, y: L.door.y + 204 };
  if (doorA > 0) slot = M.door(t, L.door.x, L.door.y, { alpha: doorA, labelK: K.io(t, tApi - 0.1, 0.5) }).slot;

  // ---------------------------------------------------------------- the hall's surroundings (top band), drawn behind the workspace
  const clerkX = D.cx, clerkY = D.y0 - 34;
  if (surK > 0 && surA > 0) K.layer(surK * surA, () => {
    // rooms: two dashed room outlines, each holding a tiny workspace
    const rk = K.io(t, tRooms - 0.1, 0.6);
    if (rk > 0) K.layer(rk, () => {
      K.text('rooms', 635, 168, { ...M.type.label, color: C.soft, align: 'center' });
      [470, 650].forEach((x, i) => {
        const g = K.ctx(), y = 186 + (1 - rk) * 10;
        g.save(); K.rr(x, y, 150, 120, 16); g.fillStyle = K.rgba(C.tile, 0.6); g.fill();
        g.setLineDash([7, 6]); g.strokeStyle = K.rgba(C.head, 0.55); g.lineWidth = 2; g.stroke(); g.restore();
        M.mini(t, x + 75, y + 76, 0.2, { lit: 0.8, alpha: K.io(t, tRooms + i * 0.15, 0.5) });
      });
    });
    // tools: the far end of the first phone line
    const tk = K.io(t, tPhone + 0.5, 0.5);
    if (tk > 0) K.layer(tk, () => {
      K.text('tools', 1330, 166, { ...M.type.label, color: C.soft, align: 'center' });
      K.iconTile('terminal', 1330, 218, 72, { stroke: K.rgba(C.accent, 0.6) });
    });
    // studio: a small room with a square canvas that slowly resolves
    const sk = K.io(t, tStudio - 0.3, 0.6);
    if (sk > 0) K.layer(sk, () => {
      K.card(1560, 150, 240, 172, { r: 18, fill: K.mixColor(C.tile, C.page, 0.2), stroke: K.rgba(C.accent, 0.75), lw: 2, glow: 0.2 });
      K.eyebrow('STUDIO', 1626, 182, { size: 20, color: C.accent });
      M.well(t, 1680, 252, 104, K.io(t, tStudio + 0.2, 4, 'io'), { cells: 26, seed: 3 });
    });
    // phone lines: the clerk hands off to tools and to the studio
    M.phone(t, clerkX + 56, clerkY - 12, 1288, 226, { k: K.io(t, tPhone, 0.7), bend: -20, pulse: true });
    M.phone(t, clerkX + 56, clerkY + 14, 1556, 262, { k: K.io(t, tPhone + 0.35, 0.8), bend: 46, pulse: true });
  });

  // ---------------------------------------------------------------- the workspace
  const rulerFill = k2 > 0 ? K.lerp(1, 0.1, k2) : K.io(t, tTwo, 1.2);
  const countK = K.io(t, tThou, 0.5) * (1 - K.io(t, cNow, 0.4));
  const st = M.stage(t, {
    desk: D, lit: 1 - 0.65 * night,
    wash: night > 0 ? { color: M.mixHex(C.page, COLD, 0.25), a: 0.4 * night } : undefined,
    lamp: { cordTop: 100 },
    clerk: { label: K.io(t, tModel, 0.5) * (1 - K.io(t, cNow - 0.3, 0.4)), glow: K.io(t, 0, 0.8) * (1 - 0.6 * K.io(t, cSmall, 1)) },
    ruler: { fill: rulerFill, count: '~2K tokens', countAt: 'below', countK },
  });

  // ---------------------------------------------------------------- papers and files (positions ride the desk: standard / 2021 / hall)
  const tOff = tStarts, tBack = tHanded - 0.25;
  const offK = K.io(t, tOff, 0.6, 'in'), backK = K.io(t, tBack, 0.6, 'out');
  const uvAt = (P) => {
    const a = P[0] || P[1], b = P[1], c = P[2];
    const u = k2 > 0 ? K.lerp(b[0], c[0], k2) : K.lerp(a[0], b[0], k1);
    const v = k2 > 0 ? K.lerp(b[1], c[1], k2) : K.lerp(a[1], b[1], k1);
    return M.spot(D, u, v);
  };
  const items = [
    { id: 'A', kind: 'paper', P: [null, [0.12, 0.5], [0.08, 0.45]], t0: tText, from: -150, rot: -0.05 },
    { id: 'B', kind: 'paper', P: [[0.5, 0.55], [0.5, 0.55], [0.48, 0.62]], t0: -99, from: 0, rot: 0.03, keep: true },
    { id: 'L', kind: 'letter', P: [null, [0.88, 0.5], [0.82, 0.62]], t0: tProg, rot: 0.06 },
    { id: 'png', kind: 'file', ext: 'png', P: [null, null, [0.25, 0.3]], t0: tPhotos, from: -160, rot: -0.06 },
    { id: 'pdf', kind: 'file', ext: 'pdf', P: [null, null, [0.66, 0.35]], t0: tPhotos + 0.3, from: 160, rot: 0.05 },
    { id: 'mp3', kind: 'file', ext: 'mp3', P: [null, null, [0.95, 0.4]], t0: tRec, from: 160, rot: 0.04 },
  ];
  items.forEach((it) => {
    if (t < it.t0) return;
    let p;
    if (!it.P[1]) p = M.spot(DH, it.P[2][0], it.P[2][1]);
    else p = uvAt(it.P);
    let x = p.x, y = p.y, a = 1;
    if (it.kind === 'letter') {
      // through the API slot, across to the desk
      const k = K.io(t, it.t0, 0.9, 'out');
      x = K.lerp(slot.x, p.x, k); y = K.lerp(slot.y, p.y, k) - Math.sin(k * Math.PI) * 40; a = K.clamp(k * 4);
    } else if (it.t0 > -50) {
      const k = K.io(t, it.t0, M.motion.land, 'out');
      x += it.from * (1 - k); a = K.clamp(k * 1.6);
    }
    // the rest dims while the two constants are shown
    if (!it.keep) a *= 1 - 0.65 * sameK * (1 - backK);
    // overnight: everything slides off, then is handed back together from the left
    if (t < tBack) { y += 60 * offK; a *= 1 - offK; }
    else { x -= 170 * (1 - backK); a = backK; }
    if (a <= 0.001) return;
    if (it.kind === 'paper') M.paper(x, y, { alpha: a, rot: it.rot, glow: it.keep ? 0.5 * sameK * (1 - offK) : 0 });
    else if (it.kind === 'letter') M.letter(x, y, k2 > 0 ? K.lerp(64, 84, k2) : 64, { alpha: a, rot: it.rot });
    else M.file(x, y, 104, { ext: it.ext, alpha: a, rot: it.rot });
  });

  // ---------------------------------------------------------------- "BUILDS ON 00.04" (first beat only)
  const nk = K.io(t, 0.5, 0.5) * (1 - K.io(t, 4, 0.6));
  if (nk > 0) K.note(1300, 160, 480, 'BUILDS ON 00.04', 'model · app · agent', { size: 30, alpha: nk });

  // ---------------------------------------------------------------- 2021: what did not exist yet
  [['ChatGPT', tNoGpt], ['memory', tNoMem], ['tools', tNoTools]].forEach(([s, t0], i) => {
    const k = K.io(t, t0, 0.5) * (1 - K.io(t, cNow, 0.45));
    if (k <= 0) return;
    const y = 400 + i * 84, to = { ...M.type.label }, tw = K.measure(s, to), w = tw + 26 + 14 + 48, x0 = 1400 + (1 - k) * 16;
    K.layer(k, () => {
      K.card(x0, y - 27, w, 54, { r: 27, fill: C.page, stroke: K.rgba(COLD, 0.7), shadow: false });
      K.icon('cross', x0 + 34, y, 26, { color: COLD, w: 3 });
      const tx = x0 + 34 + 13 + 14;
      K.text(s, tx, y + 9, { ...to, color: COLD });
      K.line(tx - 4, y, tx - 4 + (tw + 8) * K.io(t, t0 + 0.25, 0.4), y, { color: COLD, w: 3 });
    });
  });

  // ---------------------------------------------------------------- constant 1: one piece at a time
  const wA = sameK * (1 - offK);
  if (wA > 0 && t >= tWrites) {
    const n = 10, cell = 18, gap = 6, x0 = D.cx - (n * (cell + gap) - gap) / 2;
    M.write(t, x0, D.y0 + 44, { t0: tWrites, n, cell, gap, alpha: wA });
  }
  const pk = K.io(t, tPiece, 0.5) * (1 - K.io(t, cOver, 0.5));
  if (pk > 0) K.pill('one piece at a time', D.cx, D.y0 + 128, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5), fill: C.page, alpha: pk });

  // ---------------------------------------------------------------- constant 2: nothing stays overnight
  if (night > 0) {
    const g = K.ctx(), mx = 1690, my = 222, r = 44;
    K.layer(night, () => {
      K.glow(mx, my, 150, COLD, 0.22);
      g.save();
      g.beginPath(); g.rect(mx - 100, my - 100, 200, 200); g.arc(mx + 20, my - 14, r * 0.9, 0, Math.PI * 2, true); g.clip();
      g.beginPath(); g.arc(mx, my, r, 0, Math.PI * 2); g.fillStyle = M.mixHex(COLD, '#F2ECE0', 0.4); g.fill();
      g.restore();
    });
  }
  const hk = K.io(t, tHanded, 0.5);
  if (hk > 0) K.pill('handed over every time', 1480, 236, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5), fill: C.page, alpha: hk });
});
