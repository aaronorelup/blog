// 05: Two back rooms: the project's and yours.
// The shop cross-section shrinks into the left half (M.place, layout.split.shop05). Once shrunk, its tiny in-set text
// (Explorer names, window title, sign) crossfades away: the floor keeps label-less icons and a full-size "staff only"
// plaque is drawn over the placed door. The back room gains .git .venv .vscode, named at full scale.
// The home back room builds on the right with M.home's card only (k, subK); its contents are laid out here so they
// never crowd: a door + plaque on its left edge (it is a back room too), one row (~/.config, .ssh, .claude, .codex at
// 150 px), and AppData below with its Hidden tag hung clear of the folder and three room pills.
SCENE('05', (t, S) => {
  K.bg();
  const L = M.layout, F = L.frame, P = M.palette;
  const cProject = S.cue('project-room', 0);
  const cHouse = S.cue('house-room', 9.15);
  const w = (word, n, fb) => S.find(word, n, fb);

  // ================= LEFT: the project's back room (the shop, shrunk)
  const full = { x: F.x0, y: F.y0, w: F.x1 - F.x0, h: F.y1 - F.y0 };
  const B = L.split.shop05;
  const sk = K.io(t, cProject + 0.2, 0.8);
  const box = { x: K.lerp(full.x, B.x, sk), y: K.lerp(full.y, B.y, sk), w: K.lerp(full.w, B.w, sk), h: K.lerp(full.h, B.h, sk) };
  const floorDim = 0.55 * K.io(t, w('dot', 0, 3.8) - 0.2, 0.6);
  const eyeK = 1 - sk;                       // in-set eyebrows would be ~11 px once shrunk: fade them out
  const tinyK = 1 - sk;                      // same for Explorer names, window title and the in-set sign
  M.place(box, () => {
    M.shop(t, { floorDim, eyebrowK: eyeK, explorerK: tinyK, signK: tinyK });
    // label-less file icons stay on the floor (the Explorer window and its 13 px names fade out)
    if (sk > 0) K.layer(sk * (1 - 0.6 * floorDim), () => {
      M.DEFAULT_ITEMS.forEach((it, i) => M.item(L.exCols[i], L.exRows[0], 96, { kind: it.kind, ext: it.ext, label: 'none' }));
    });
  });
  // full-size plaque over the placed door (readable 26 px), above the shelf folders
  const sp = M.placed(box, L.sign.x, L.sign.y);
  if (sk > 0) M.sign(sp.x, sp.y - 8 * sk, { size: 26, alpha: sk });

  // full-size header over the project copy (fades in as the shrink lands)
  const hk = K.io(t, cProject + 0.8, 0.6);
  if (hk > 0) K.layer(hk, () => {
    K.folder(178, 266, 56);
    K.text('my-project', 228, 278, { ...M.type.name, color: P.name });
    K.text("this project's own", 430, 278, { ...M.type.read, color: K.C.body });
  });

  // the project's back room: three dot folders on the placed shelves, names at full scale
  const dAt = w('dot', 0, 3.8);
  [['.git', 0, dAt], ['.venv', 1, dAt + 0.4], ['.vscode', 2, dAt + 0.8]].forEach(([name, i, at]) => {
    const k = K.io(t, at, 0.5);
    if (k <= 0) return;
    const p = M.placed(box, L.slotX[0], L.shelves[i]);
    const s = 50;
    M.item(p.x + 32, p.y - s * 0.45 - (1 - k) * 12, s, { kind: 'folder', name, label: 'right', size: 30, alpha: k });
  });
  const tk = K.io(t, w('travel', 0, 7.65) - 0.2, 0.6);
  const pb = M.placed(B, (F.x0 + F.x1) / 2, F.y1);
  K.pill('travels with the project', pb.x, pb.y + 52, { size: 26, alpha: tk, color: K.C.strong });

  // ================= RIGHT: the home back room
  const homeK = K.io(t, cHouse, 0.7);
  const subK = K.io(t, w('settings', 0, 12.07) - 0.2, 0.6);
  M.home(t, { k: homeK, subK });           // card, house, "~", eyebrow, subtitle only; contents laid out below

  // its door, on the card's left edge, with the same plaque: home has a back room too
  const sill = 852;
  const doorK = K.io(t, w('home', 0, 9.96) - 0.1, 0.7);
  if (doorK > 0) {
    K.line(1130, sill, 1810, sill, { color: P.floorLine, w: 2, alpha: doorK });
    M.door(1076, sill - 200, 48, 200, { k: doorK });
    M.sign(1100, sill - 200 - 44, { size: 26, alpha: doorK });
  }

  // top row: the tidy ~/.config tile, then the loose dot folders a little crooked
  const rowY = 438;
  const CF = { x: 1250, y: rowY };
  const configK = K.io(t, w('.config', 0, 15.91) - 0.3, 0.6);
  if (configK > 0) K.layer(configK, () => {
    K.card(CF.x - 95, CF.y - 62, 190, 160, { r: 14, fill: 'rgba(240,192,106,0.05)', stroke: K.C.head, shadow: false });
    M.item(CF.x, CF.y, 66, { name: '~/.config', size: 26 });
  });
  const capK = K.io(t, w('Mac', 0, 18.65) - 0.1, 0.6);
  M.caption('Linux · Mac too', CF.x, CF.y + 136, { alpha: capK });

  const pAt = w('Plenty', 0, 19.82);
  const loose = [
    { name: '.ssh', x: 1460, dy: 4, rot: -0.05, ring: w('.ssh', 0, 24.53) },
    { name: '.claude', x: 1610, dy: -6, rot: 0.04, ring: w('.claude', 0, 26.55) },
    { name: '.codex', x: 1760, dy: 6, rot: -0.03 },
  ];
  loose.forEach((l, i) => {
    const k = K.io(t, pAt + 0.3 + i * 0.7, 0.5);
    if (k <= 0) return;
    const y = rowY + l.dy;
    K.layer(k, () => K.at(l.x, y - (1 - k) * 12, 1, l.rot, () => M.item(0, 0, 60, { name: l.name, size: 26 })));
    if (l.ring != null) {
      const rk = K.io(t, l.ring - 0.05, 0.6);
      if (rk > 0) K.layer(K.clamp(rk * 3), () => {
        const tw = K.measure(l.name, { font: 'mono', size: 26, weight: 600 });
        K.ring(l.x, y + 22, Math.max(tw, 75) / 2 + 22, 72, rk, { color: P.attention, w: 4, rot: 0 });
      });
    }
  });

  // AppData (Windows): the hidden home back room, its tag hung on a peg left of the folder, three rooms
  const AD = { x: 1337, y: 728 };
  const appK = K.io(t, w('AppData', 0, 29.87) - 0.1, 0.6);
  const tagK = K.io(t, w('hidden', 0, 30.67) - 0.1, 0.6);
  if (appK > 0) {
    const it = M.item(AD.x, AD.y, 64, { name: 'AppData', size: 30, alpha: appK });
    // the tag body spans [peg-97, peg+27] (side -1): peg at icon-left - 55 leaves ~28 px clear of the folder
    // and ~25 px clear of the home door (right edge 1124)
    M.tag(AD.x - 32 - 55, AD.y - it.h / 2 - 8, { t, k: tagK, side: -1, alpha: appK });
  }
  // platform label, the twin of "Linux · Mac too" under ~/.config
  const winK = K.io(t, w('Windows', 0, 27.84) - 0.1, 0.6);
  M.caption('Windows', AD.x, AD.y + 104, { alpha: Math.min(winK, appK > 0 ? 1 : 0) });
  const roomAt = [w('Roaming', 0, 33.74), w('Local', 0, 37.67), w('LocalLow', 0, 40.19)];
  const roomsText = ['Roaming · follows a work login', 'Local · this machine', 'LocalLow · fewer permissions'];
  const RX = 1622, RY = [676, 748, 820];
  roomsText.forEach((s, i) => {
    const k = K.io(t, roomAt[i] - 0.15, 0.6);
    if (k <= 0) return;
    const pw = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
    K.arrow(AD.x + 52, AD.y - 6, RX - pw / 2 - 8, RY[i], { k, color: K.C.line2, w: 2, head: false, bend: (i - 1) * -8 });
    K.pill(s, RX, RY[i], { size: 26, alpha: k, color: K.C.strong });
  });
});
