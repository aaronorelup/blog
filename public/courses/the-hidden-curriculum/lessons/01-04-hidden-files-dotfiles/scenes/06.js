// 06 — What's on the project's shelves
// The project's back room, shelf by shelf: .git (the logbook), .venv (the private toolbox, which now ignores
// itself), the .gitignore list taped to the wall with the commit van on the floor, and .vscode (editor settings).
// Camera stays wide (no punch-in): the shop floor dims while the back room talks.
SCENE('06', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C;

  // ---- beats (cues + spoken words, local seconds)
  const cTool = S.cue('toolbox', 13.71), cSelf = S.cue('self-ignore', 28.65);
  const cIgn = S.cue('gitignore', 35.11), cEd = S.cue('editor-settings', 45.77);
  // first spoken word matching rx at or after local time a (S.words may hold the spoken forms, e.g. 'dot')
  const after = (rx, a, fb) => {
    const w = (S.words || []).find((q) => q[1] - S.start >= a - 0.05 && rx.test(String(q[0]).replace(/[^\w'.-]/g, '')));
    return w ? w[1] - S.start : fb;
  };
  const tLedger = S.find(/^(logbook|ledger)/i, 0, 2.91);   // 'logbook' (renamed from 'ledger': 01.02's porter owns the ledger)
  const tGit = S.find('dot', 0, 4.41);
  const tEvery = S.find('every', 0, 5.93);
  const tDelete = S.find('Delete', 0, 8.28);
  const tFiles = S.find('files', 0, 9.96);
  const tHistory = S.find('history', 0, 11.70);
  const tToolbox = S.find('toolbox', 0, 15.31);
  const tVenv = after(/^(dot|\.venv)/i, cTool, 16.31);
  const tPointer = S.find('pointer', 0, 18.82);
  const tAaron = S.find('Aaron', 0, 22.44);
  const tIgnSelf = after(/^tells/i, cSelf, 33.06);
  const tDotIgn = after(/^(dot|\.git)/i, cIgn, cIgn + 1.69);
  const tVan = after(/^names/i, cIgn, cIgn + 3.38);
  const tHides = after(/^hides/i, cIgn, cIgn + 6.42);
  const tVs = after(/^like/i, cEd, cEd + 1.88);

  // ---- no punch-in: the whole set stays wide (room, door, porter all inside the safe area). Focus is carried by
  // dimming the shop floor while the back room talks, and lifting it for the delete beat and the commit van.
  const floorFocus = Math.max(
    K.io(t, tDelete - 0.3, 0.6) * (1 - K.io(t, cTool - 0.6, 0.6)),
    K.io(t, tVan - 0.3, 0.6) * (1 - K.io(t, cEd - 0.2, 0.6)));
  const floorDim = K.io(t, 0.3, 0.7) * (1 - floorFocus);

  // ---- the delete beat: .git lifts off and fades, comes back as the camera returns (a "what if")
  const del = K.io(t, tDelete, 0.7) * (1 - K.io(t, cTool - 0.6, 0.7));
  const filesRing = K.io(t, tFiles, 0.6) * (1 - K.io(t, cTool - 0.9, 0.5));

  // ---- focus: each shelf item waits dim until it is named; the gitignore beat dims the shelves
  const ignDim = K.io(t, cIgn, 0.6) * (1 - K.io(t, cEd, 0.6));
  const edFocus = K.io(t, cEd, 0.6);
  const lit = (a) => (0.32 + 0.68 * K.io(t, a, 0.6)) * (1 - 0.6 * ignDim);
  const older = (a) => lit(a) * (1 - 0.5 * edFocus);   // .git / .venv step back when .vscode is named

  const shelfLabel = (icon, label, x, y, k, a) => {
    if (k <= 0) return;
    K.layer(k * a, () => K.at(x, y + (1 - k) * 14, 1, 0, () => {
      K.glow(0, 0, 60, C.head, 0.12);
      K.icon(icon, 0, 0, 60, { color: C.head, w: 3.5 });
      K.text(label, 50, 30 * 0.36, { ...M.type.read, color: C.strong });
    }));
  };

  {
    M.shop(t, {
      floorDim,
      items: M.DEFAULT_ITEMS.map((it) => ({ ...it, glow: filesRing })),
    });

    // ===================== top shelf: .git, the logbook
    const sGit = M.slot(0, 0);
    const gitA = older(tGit) * (1 - 0.92 * del);
    const gitLift = -34 * del;
    // five versions peeking out of the folder, one per past version
    for (let i = 0; i < 5; i++) {
      const gone = K.io(t, tDelete + 0.15 + i * 0.06, 0.5) * (1 - K.io(t, cTool - 0.6 + i * 0.05, 0.5));
      const k = K.stagger(t, tEvery, i, 0.12, 0.5) * (1 - gone);
      const kk = K.clamp(k);
      if (kk <= 0) continue;
      const px = sGit.x - 30 + i * 9, py = sGit.y - 30 - i * 3 + gitLift - (1 - kk) * 10 - del * 30;
      const dimC = (c) => K.mixColor(c, P.room, 0.62 * ignDim);   // dim by colour: stacked pages stay opaque
      K.layer(kk, () => {
        K.card(px - 26, py - 20, 52, 40, { r: 4, fill: dimC(P.paper), stroke: dimC(P.paperShade), shadow: false });
        K.line(px - 16, py - 6, px + 14, py - 6, { color: dimC(P.inkSoft), w: 2, alpha: 0.6 });
        K.line(px - 16, py + 4, px + 8, py + 4, { color: dimC(P.inkSoft), w: 2, alpha: 0.6 });
      });
    }
    const gitRing = K.io(t, tGit, 0.6) * (1 - K.io(t, tDelete - 0.3, 0.5));
    M.item(sGit.x, sGit.y + gitLift, 80, { kind: 'folder', name: '.git', label: 'right', alpha: gitA, ring: gitRing });
    shelfLabel('book', 'logbook', 1545, M.slot(0, 1, 64).y, K.io(t, tLedger, 0.6), (1 - 0.6 * ignDim) * (1 - 0.5 * edFocus) * (1 - 0.92 * del));
    // "history gone" under the top shelf (wide camera)
    K.text('history gone', 1500, 434, { ...M.type.read, align: 'center', color: C.strong, alpha: K.io(t, tHistory, 0.5) * (1 - K.io(t, cTool - 0.9, 0.5)) });
    // "files stay" in the Explorer, under the floor items
    K.text('files stay', 500, 600, { ...M.type.read, align: 'center', color: C.strong, alpha: K.io(t, tFiles, 0.5) * (1 - K.io(t, cTool - 0.9, 0.5)) });

    // ===================== middle shelf: .venv, the private toolbox
    const sVenv = M.slot(1, 0);
    const venvRing = K.io(t, tVenv, 0.6) * (1 - K.io(t, cIgn, 0.5));
    M.item(sVenv.x, sVenv.y, 80, { kind: 'folder', name: '.venv', label: 'right', alpha: older(tVenv), ring: venvRing });
    shelfLabel('puzzle', 'toolbox', 1545, M.slot(1, 1, 64).y, K.io(t, tToolbox, 0.6), (1 - 0.6 * ignDim) * (1 - 0.5 * edFocus));
    // self-ignore: a tiny .gitignore pops inside the .venv folder, with a gold check
    const selfK = K.io(t, tIgnSelf - 0.2, 0.5, 'back');
    if (selfK > 0) K.layer(K.clamp(selfK) * (1 - 0.6 * ignDim), () => K.at(sVenv.x + 4, sVenv.y + 8, 0.6 + 0.4 * selfK, 0, () => {
      K.file(0, 0, 40, {});
      K.glow(26, -22, 26, C.head, 0.35);
      K.icon('check', 26, -22, 30, { color: C.head, w: 4 });
    }));

    // the line under the middle shelf: one note at a time
    const lineY = 602;
    const ptrA = K.io(t, tPointer, 0.5) * (1 - K.io(t, tAaron - 0.3, 0.4));
    if (ptrA > 0) K.spans([
      { s: 'points to ', color: C.soft, weight: 400 },
      { s: 'your Python', color: C.strong },
      { s: '  +  ', color: C.soft, weight: 400 },
      { s: 'its own packages', color: C.strong },
    ], 1500, lineY, { align: 'center', size: 26, weight: 600, alpha: ptrA });
    const aaA = K.io(t, tAaron, 0.5) * (1 - K.io(t, cSelf - 0.3, 0.4));
    if (aaA > 0) K.layer(aaA, () => {
      const lab = { ...M.type.label }, soft = { ...M.type.label, weight: 400 }, mono = { font: 'mono', size: 26, weight: 600 };
      const parts = [['IT degree', lab], ['·  still puzzled by', soft], ['.venv', mono]];
      const gap = 12, capW = 56;
      const tot = capW + parts.reduce((p, [s, f]) => p + K.measure(s, f) + gap, -gap);
      let x = 1500 - tot / 2;
      K.icon('cap', x + 22, lineY - 9, 44, { color: C.strong, w: 3 }); x += capW;
      parts.forEach(([s, f], k) => {
        if (k === 2) M.dotName(s, x, lineY, { size: 26 });
        else K.text(s, x, lineY, { ...f, color: k === 0 ? C.strong : C.soft });
        x += K.measure(s, f) + gap;
      });
    });
    const selfA = K.io(t, cSelf, 0.5) * (1 - K.io(t, cIgn - 0.1, 0.5));
    if (selfA > 0) K.layer(selfA, () => {
      // "a new .venv tells git to ignore itself": the dot-name leads, painted like every other dot-name
      const mono = { font: 'mono', size: 26, weight: 600 }, lab = { ...M.type.label }, soft = { ...M.type.label, weight: 400 };
      const a = '.venv', b = 'ignores itself', c = '·  Python 3.13+  ·  uv', gap = 12;
      const tot = K.measure(a, mono) + K.measure(b, lab) + K.measure(c, soft) + 2 * gap;
      let x = 1500 - tot / 2;
      M.dotName(a, x, lineY, { size: 26 }); x += K.measure(a, mono) + gap;
      K.text(b, x, lineY, { ...lab, color: C.strong }); x += K.measure(b, lab) + gap;
      K.text(c, x, lineY, { ...soft, color: C.soft });
    });

    // ===================== the .gitignore list, taped to the wall
    const noteX = 1120, noteY = 300;
    const noteK = K.io(t, tDotIgn - 0.3, 0.6);
    M.note('.gitignore', noteX, noteY, { k: noteK, ring: K.io(t, tDotIgn, 0.6) * (1 - K.io(t, cEd, 0.6)) });
    // its two lines hang off the note, under the top shelf
    // the moving van = a commit headed for GitHub, parked on the shop floor; what .gitignore lists stays behind
    const vanA = K.io(t, tVan - 0.1, 0.6) * (1 - K.io(t, cEd - 0.2, 0.6));
    if (vanA > 0) {
      const fy = L.floorY, vx = 330 - 40 * (1 - vanA);
      K.layer(vanA, () => {
        const bw = 250, bh = 80, by = fy - 20 - bh;
        const cx = vx + bw - 2;                                     // cab, flush against the box
        K.card(cx, by + 24, 84, bh - 24, { r: 10, fill: C.tile, stroke: C.line2, shadow: false });
        K.card(cx + 40, by + 32, 32, 24, { r: 5, fill: K.rgba(C.head, 0.25), stroke: C.head, shadow: false });
        K.card(vx, by, bw, bh, { r: 8, fill: P.paper, stroke: P.paperShade, shadow: false });
        K.text('commit', vx + bw / 2, by + 34, { font: 'ui', weight: 600, size: 26, color: P.ink, align: 'center' });
        K.text('→ GitHub', vx + bw / 2, by + 66, { font: 'ui', weight: 600, size: 26, color: P.inkSoft, align: 'center' });
        [vx + 50, vx + bw - 50, cx + 52].forEach((wx) => K.card(wx - 14, fy - 28, 28, 28, { r: 14, fill: P.ink, stroke: C.line2, shadow: false }));
      });
      // the row of what gets packed; the two names .gitignore lists slide off and fade
      const off = K.io(t, tVan + 0.9, 0.7);
      const mono = { font: 'mono', weight: 600, size: 26 };
      let x = vx;
      [['src', 0], ['app.py', 0], ['README.md', 0], ['.venv', 1], ['.env', 1]].forEach(([n, ig]) => {
        const w = K.measure(n, mono);
        const a = vanA * (ig ? 1 - off : 1);
        if (a > 0) M.dotName(n, x + (ig ? 50 * off : 0), fy - 114, { size: 26, alpha: a, color: C.strong });
        x += w + 24;
      });
    }
    const hidA = K.io(t, tHides, 0.5) * (1 - K.io(t, cEd, 0.5));
    if (hidA > 0) K.spans([
      { s: 'hides nothing', color: C.strong },
      { s: '  ·  only tells git what not to pack', color: C.soft, weight: 400 },
    ], 1210, 432, { align: 'left', size: 26, weight: 600, alpha: hidA });

    // ===================== bottom shelf: .vscode, editor settings
    const sVs = M.slot(2, 0);
    M.item(sVs.x, sVs.y, 80, { kind: 'folder', name: '.vscode', label: 'right', alpha: lit(cEd), ring: K.io(t, cEd + 0.1, 0.6) * (1 - K.io(t, S.dur - 0.6, 0.6)) });
    shelfLabel('gear', 'editor settings', 1545, M.slot(2, 1, 64).y, K.io(t, cEd + 0.1, 0.6), 1);
  }
});
