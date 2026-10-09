// 10: Then and now: from notes to orders.
// Two copies of the door + back room side by side, cropped from the standing set at 0.88 scale so their labels read
// near full size: "2021" on the left (plain notes for tools: .vscode, .git, .gitignore, and the .env drawer), "NOW"
// on the right (hidden until [[now-orders]]), where the instruction files are pinned on the wall and turn into
// orders (terracotta edge + terminal glyph). On [[strangers-note]] the NOW copy's transform eases to identity, so it
// lands at true layout coordinates; a stranger's note (a real file, with a "from a cloned repo" pill) comes in
// through the door and is obeyed. The dated cases stack as full-scale lines on the left: strangers' notes, malware,
// the leak figure. The left column clears just before the crossfade into 11.
SCENE('10', (t, S) => {
  K.bg();
  const C = K.C, L = M.layout, P = M.palette;
  const w = (word, n, fb) => S.find(word, n, fb);
  const cThen = S.cue('then', 0);
  const cNow = S.cue('now-orders', 10.22);
  const cStr = S.cue('strangers-note', 17.53);
  const cMal = S.cue('malware', 38.41);
  const cLeak = S.cue('leak-figure', 48.89);

  // ---------------------------------------------------------------- the two copies: door + back room, cropped
  const CROP = { x0: 1000, y0: 200, x1: 1840, y1: 890 };
  const s0 = 0.88, cw = (CROP.x1 - CROP.x0) * s0, gap = 48;
  const bx0 = (1920 - (2 * cw + gap)) / 2, by0 = 236;
  const TL0 = { x: bx0 - CROP.x0 * s0, y: by0 - CROP.y0 * s0 };
  const TR0 = { x: bx0 + cw + gap - CROP.x0 * s0, y: TL0.y };

  // ---------------------------------------------------------------- timings
  const nowK = K.io(t, cNow, 0.7);                                          // the NOW copy appears
  const zk = K.io(t, cStr, 1.1);                                            // NOW copy grows to full size
  const leftA = 1 - K.io(t, cStr, 0.6);                                     // the 2021 side leaves
  const sN = K.lerp(s0, 1, zk), TN = { x: K.lerp(TR0.x, 0, zk), y: K.lerp(TR0.y, 0, zk) };
  const toScreen = (x, y) => ({ x: x * sN + TN.x, y: y * sN + TN.y });
  const toLeft = (x, y) => ({ x: x * s0 + TL0.x, y: y * s0 + TL0.y });
  const g = K.ctx();
  const copy = (T, s, fn) => {
    g.save(); g.translate(T.x, T.y); g.scale(s, s);
    g.beginPath(); g.rect(CROP.x0, CROP.y0, CROP.x1 - CROP.x0, CROP.y1 - CROP.y0); g.clip();
    fn(); g.restore();
  };

  // stranger's note, malware, drawer
  const strIn = K.io(t, cStr + 1.0, 1.2);                                   // travels in through the door
  const strObey = K.io(t, w('obeyed', 0, 19.8) - 0.1, 0.6);
  const malIn = K.io(t, cMal + 0.2, 1.0);
  const malStaff = K.io(t, w('ran', 0, 43.5) - 0.1, 0.6);
  const drawerOpen = K.io(t, w('search', 0, 46.3) - 0.5, 0.7);
  const malKey = K.io(t, w('search', 0, 46.3), 0.7);
  const D = L.drawer;
  const staffPos = [{ x: 1250, y: 650 }, { x: 1750, y: 650 }];

  // 2021: notes for tools on the shelves, no staff
  const shelfItems = [
    { name: '.vscode', i: 0, at: w('settings', 0, 3.2) },
    { name: '.git', i: 1, at: w('history', 0, 4.0) },
    { name: '.gitignore', i: 2, kind: 'file', at: w('list', 0, 4.9) },
  ];
  const leftIn = K.io(t, cThen - 0.2, 0.6);
  if (leftA > 0 && leftIn > 0) K.layer(leftA * leftIn, () => copy(TL0, s0, () => {
    M.shop(t, { floorK: 0, eyebrowK: 1, roomEyebrow: 'BACK ROOM · 2021', door: { open: 0 }, wallDash: 0, porter: false, sign: { size: 28 / s0 } });
    shelfItems.forEach((it) => {
      const k = K.io(t, it.at - 0.15, 0.5);
      if (k <= 0) return;
      const p = M.slot(it.i, 0, 80);
      M.item(p.x, p.y - (1 - k) * 14, 80, { kind: it.kind || 'folder', name: it.name, label: 'right', size: 30 / s0, alpha: k });
    });
    M.drawer(D.x, D.y, D.w, D.h, { open: K.io(t, w('committing', 0, 8.0) - 0.2, 0.6), key: 1 });
  }));
  // NOW: the same room, later (hidden until [[now-orders]])
  if (nowK > 0) K.layer(nowK, () => copy(TN, sN, () => {
    M.shop(t, {
      floorK: 0, eyebrowK: 1, roomEyebrow: 'BACK ROOM · NOW', shelvesK: 0,
      door: { open: 0.35 + 0.25 * strIn * (1 - K.io(t, cMal + 1.2, 0.8)) }, wallDash: 0.35,
      porter: false, sign: { size: 28 / sN },
    });
    M.drawer(D.x, D.y, D.w, D.h, { open: drawerOpen, key: malKey });
    staffPos.forEach((p, i) => M.staff(p.x, p.y, 64, { t, i }));
  }));

  // ---------------------------------------------------------------- phase A headings
  const head = (year, line, x, y, a) => {
    if (a <= 0) return;
    const yw = K.text(year, x, y, { font: 'head', size: 48, weight: 700, color: C.head, alpha: a });
    K.text(line, x + yw + 22, y - 4, { ...M.type.read, color: C.body, alpha: a });
  };
  head('2021', 'notes for tools', bx0 + 6, 206, leftIn * leftA);
  head('NOW', 'since 2025: some notes are orders', bx0 + cw + gap + 6, 206, nowK * (1 - K.io(t, cStr, 0.5)));

  // the classic mistake: '.env' committed (pill under the 2021 drawer)
  if (leftA > 0) {
    const mk = K.io(t, w('worst', 0, 6.8) - 0.1, 0.6) * leftA;
    if (mk > 0) {
      const dp = toLeft(D.x + D.w / 2, D.y + D.h + 44);
      const cx = bx0 + cw / 2 - 40, cy = 886;
      K.arrow(dp.x, dp.y, cx + 150, cy - 26, { k: mk, color: P.danger, w: 3, bend: -20 });
      // pill drawn by hand so '.env' keeps its painted gold dot (colour law)
      const f26 = { font: 'ui', weight: 600, size: 26 }, rest = ' committed · the classic mistake';
      const ew = K.measure('.env', { font: 'mono', weight: 600, size: 26 }), rw = K.measure(rest, f26);
      const pw = ew + rw + 26 * 1.6, ph = 26 * 1.9;
      K.card(cx - pw / 2, cy - ph / 2, pw, ph, { r: ph / 2, fill: C.tile, stroke: P.danger, shadow: false, alpha: mk });
      M.dotName('.env', cx - pw / 2 + 20.8, cy + 9, { size: 26, alpha: mk });
      K.text(rest, cx - pw / 2 + 20.8 + ew, cy + 9, { ...f26, color: C.strong, alpha: mk });
    }
  }

  // ---------------------------------------------------------------- the order notes, pinned on the NOW wall
  const notes = [
    { name: 'CLAUDE.md', wall: [1310, 300] },
    { name: 'AGENTS.md', wall: [1590, 300] },
    { name: '.cursor/rules/', wall: [1345, 405] },
    { name: '.mcp.json', wall: [1680, 405] },
  ];
  const orderK = K.io(t, w('orders', 0, 13.2) - 0.35, 0.8);
  notes.forEach((n, i) => {
    const k = K.io(t, cNow + 0.4 + i * 0.25, 0.6) * nowK;
    if (k <= 0) return;
    const wp = toScreen(n.wall[0], n.wall[1]);
    M.note(n.name, wp.x, wp.y, { kind: 'order', orderK, k });
  });

  // ---------------------------------------------------------------- phase B: inside the NOW room
  // the stranger's note: a real file from someone else's repo, in from the shop floor through the open door.
  const SP = { x: 1500, y: 505 };
  if (strIn > 0) {
    const u = strIn, x0 = 930, y0 = 760, cx = 1150, cy = 720;
    const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * SP.x;
    const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * SP.y;
    const sa = K.clamp(u * 3);
    const nm = M.note('.claude/settings.json', x, y, { kind: 'stranger', alpha: sa });
    K.pill('from a cloned repo', x, y + nm.h / 2 + 24, { size: 26, color: C.strong, stroke: P.danger, alpha: sa * K.io(t, cStr + 1.6, 0.5) });
    // the staff obey it
    if (strObey > 0) staffPos.forEach((p, i) => {
      const sx = SP.x + (i ? 1 : -1) * (nm.w / 2 - 4);
      K.arrow(sx, SP.y + 4, p.x + (i ? 6 : -6), p.y - 52, { k: strObey, color: P.danger, w: 3, bend: i ? -22 : 22, alpha: 1 - 0.5 * K.io(t, cMal, 0.6) });
    });
  }
  // malware walks in through the door and sets the staff on the key drawer
  if (malIn > 0) {
    const u = malIn, x = K.lerp(1000, 1500, u), y = K.lerp(720, 660, u) - Math.sin(u * Math.PI) * 30;
    K.layer(K.clamp(u * 3), () => {
      K.glow(x, y, 70, P.danger, 0.25);
      K.icon('warning', x, y, 56, { color: P.danger, w: 4 });
    });
    if (malStaff > 0) staffPos.forEach((p, i) => {
      K.arrow(1500 + (i ? 44 : -44), 664, p.x + (i ? -44 : 44), p.y + 6, { k: malStaff, color: P.danger, w: 3 });
    });
    const rk = K.io(t, w('search', 0, 46.3), 0.7);
    if (rk > 0) {
      const kx = D.x + D.w / 2, ky = D.y + 40 - 34;
      staffPos.forEach((p, i) => {
        K.arrow(p.x + (i ? -10 : 10), p.y + 40, kx + (i ? 46 : -46), ky + 4, { k: rk, color: P.danger, w: 3, dash: [8, 8], bend: i ? -40 : 40 });
      });
    }
  }

  // ---------------------------------------------------------------- phase B: the dated cases, left column
  const X0 = 150;
  const pillL = (s, y, o = {}) => {
    const pw = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
    K.pill(s, (o.x || X0) + pw / 2, y, { size: 26, color: C.strong, ...o });
    return pw;
  };
  const dimMal = 1 - 0.3 * K.io(t, cMal, 0.6);
  const dimLeak = 1 - 0.3 * K.io(t, cLeak, 0.6);
  // the left column clears just before the crossfade into 11, so two text layouts never blend
  const endA = 1 - K.io(t, S.dur - 0.7, 0.7);

  // strangers' notes
  const gA0 = K.io(t, cStr + 1.0, 0.6) * endA;
  const gA = gA0 * dimMal;
  if (gA0 > 0) {
    const r1 = 'invisible instructions in a rules file · Mar 2025', r2 = "a repo's own Claude settings ran commands";
    K.eyebrow("a stranger's note", X0, 268, { alpha: gA });
    const c1 = K.io(t, w('March', 0, 21.5) - 0.1, 0.6) * gA;
    if (c1 > 0) pillL(r1, 324, { alpha: c1 });
    const c2 = K.io(t, w('Others', 0, 27.1) - 0.1, 0.6) * gA;
    if (c2 > 0) pillL(r2, 400, { alpha: c2 });
    const c3 = K.io(t, w('opened', 0, 32.9), 0.6) * gA;
    if (c3 > 0) M.caption('CVE-2025-59536 · CVE-2026-21852', X0 + 24, 456, { align: 'left', alpha: c3 });
    const fx = K.io(t, w('fixed', 0, 34.6) - 0.1, 0.6) * gA;
    if (fx > 0) {
      ['research demo', 'fixed'].forEach((s, i) => {
        const base = K.measure(i ? r2 : r1, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        pillL(s, i ? 400 : 324, { x: X0 + base + 14, alpha: fx * 0.8, color: C.strong, fill: 'rgba(0,0,0,0)' });
      });
    }
    const code = K.io(t, w('these', 0, 36.5) - 0.1, 0.6) * gA0;   // the beat's main line: never dimmed
    if (code > 0) K.text('these files are code', X0, 528, { font: 'head', size: 40, weight: 700, color: C.head, alpha: code });
  }

  // malware
  const gB = malIn * dimLeak * endA;
  if (gB > 0) {
    K.eyebrow('malware', X0, 610, { alpha: gB });
    K.icon('warning', X0 + 26, 664, 44, { color: P.danger, w: 3.5, alpha: gB });
    pillL('poisoned package · Aug 2025', 664, { x: X0 + 66, alpha: gB, stroke: P.danger });
    const cap = K.io(t, w('ran', 0, 43.5) - 0.1, 0.6) * gB;
    if (cap > 0) M.caption("ran its victims' own AI tools to hunt keys", X0 + 66, 722, { align: 'left', alpha: cap });
  }

  // the leak figure
  const gC = K.io(t, cLeak, 0.6) * endA;
  if (gC > 0) {
    K.eyebrow('leaked keys', X0, 790, { alpha: gC });
    const fig = K.io(t, w('eighty', 0, 54.8) - 0.2, 0.6) * endA;
    const fw = K.text('~80%', X0, 876, { font: 'head', size: 68, weight: 700, color: C.head, alpha: fig });
    K.text('more AI-service key leaks · 2025 vs 2024', X0 + fw + 28, 842, { ...M.type.read, color: C.strong, alpha: gC });
    M.caption('GitGuardian · vendor figure', X0 + fw + 28, 884, { align: 'left', alpha: gC });
  }
});
