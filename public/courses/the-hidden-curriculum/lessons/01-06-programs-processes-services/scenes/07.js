// 07 — Closing the window isn't ending the process
// The door (window) and the cook behind it. Four beats on one kitchen counter:
//   door    : Ollama's window closes; its cook stays at the counter, still working  -> "window ≠ process"
//   outlive : three kinds keep working: tray app (that same cook), a service (never had a door), a child whose parent went away
//   no-tree : a parent ends, its three children keep running; a second family boxed as a "job object" clears together
//   tm-bug  : Task Manager's own window closes, its cook stays and hidden copies pile up; fixed in November
//             (end state held: ghosted Taskmgr.exe + 'fixed' label; Ollama never returns after tm-bug)
SCENE('07', (t, S) => {
  K.bg();
  const C = K.C, L = M.L, g = K.ctx();
  const io = (a, d = 0.5) => K.io(t, a, d);
  const out = (a, d = 0.5) => 1 - K.io(t, a, d);

  // ---- cues (words fall back to their measured times)
  const tClose = S.find('Close', 0, 3.2), tStill = S.find('still', 0, 4.7);
  const tOut = S.cue('outlive', 6.38), tTray = S.find('tray', 0, 8.3), tSvc = S.find('services', 0, 10.2);
  const tKids = S.find('children', 0, 12.9), tParent = S.find('parent', 0, 13.55), tWent = S.find('went', 0, 13.9);
  const tTree = S.cue('no-tree', 15.21), tEnding = S.find('ending', 0, 16.1), tAuto = S.find('automatically', 0, 17.3);
  const tTools = S.find('Tools', 0, 19.5), tGroup = S.find('group', 0, 22.2), tFirst = S.find('first', 0, 23.4);
  const tBug = S.cue('tm-bug', 24.39), tTask = S.find('Task', 0, 27.3), tClosed = S.find('closed', 0, 29.5);
  const tFixed = S.find('fixed', 0, 31.1);

  // ---- layout
  const DOOR = { x: 140, y: 150, w: 580, h: 400 };
  const LABEL_Y = 870;                       // label row under the counter
  const X = (i) => M.cookAt(i).x;            // stretch centres: 0:242 1:447 2:652 3:857 4:1062 5:1267 6:1472 7:1677
  const Y = L.cookY;

  // phase envelopes
  const kAB = out(tTree - 0.55, 0.55);                       // door + outlive (A/B)
  const kC1 = io(tTree - 0.2, 0.6) * out(tBug - 0.45, 0.45);       // family 1 (parent ended, children stay)
  const kC2 = io(tTools - 0.1, 0.6) * out(tBug + 0.3, 0.6);  // family 2 (job object), held until tm-bug
  const kD = io(tBug, 0.6);                                  // Task Manager bug

  // ---- the counter (always there; washes show who is working)
  const lit = {};
  const kTM = kD * io(tTask - 0.1, 0.5) * out(tFixed + 0.3, 0.5);
  lit[3] = Math.max(kAB, kTM);
  lit[5] = kAB * io(tSvc, 0.5);
  lit[6] = kAB * io(tKids - 0.3, 0.5) * out(tParent, 0.5);
  lit[7] = kAB * io(tKids - 0.3, 0.5);
  [0, 1, 2].forEach((i) => { lit[i] = Math.max(lit[i] || 0, kC1 * io(tAuto, 0.5)); });
  [5, 6, 7].forEach((i) => { lit[i] = Math.max(lit[i] || 0, kC2 * 0.6); });
  const threads = {};
  if (kAB > 0.01) threads[3] = { n: 3, k: kAB };
  if (kD > 0.01 && kTM > 0.01) threads[3] = { n: 3, k: kTM };
  M.counter(t, { lit, threads });

  // ======================================================== A/B: the Ollama door and what outlives a window
  if (kAB > 0.002) K.layer(kAB, () => {
    const close = K.io(t, tClose, 0.6);
    // the dashed link door -> cook (the door leads to the cook), gone with the door
    K.line(DOOR.x + DOOR.w + 8, DOOR.y + 250, X(3) - 60, Y + 8, { color: C.body, w: 3, dash: [8, 8], alpha: 0.9 * (1 - close) });
    M.doorWin(t, {
      ...DOOR, title: 'Ollama', kind: 'browser', close, focus: true,
      inner: (r) => {
        // a chat app's window: two bubbles and the input bar
        K.icon('brain', r.x + 50, r.y + 52, 40, { color: C.head, w: 2.5 });
        K.card(r.x + 90, r.y + 26, 300, 56, { r: 18, fill: C.tile, stroke: C.line2, shadow: false });
        K.line(r.x + 112, r.y + 54, r.x + 340, r.y + 54, { color: C.line2, w: 8 });
        K.card(r.x + r.w - 330, r.y + 112, 300, 56, { r: 18, fill: K.mixColor(C.tile, C.head, 0.18), stroke: K.rgba(C.head, 0.6), shadow: false });
        K.line(r.x + r.w - 306, r.y + 140, r.x + r.w - 110, r.y + 140, { color: K.rgba(C.head, 0.55), w: 8 });
        K.card(r.x + 24, r.y + r.h - 82, r.w - 48, 58, { r: 29, fill: C.page, stroke: C.line2, shadow: false });
        K.text('Send a message', r.x + 54, r.y + r.h - 44, { font: 'ui', size: 26, color: C.soft });
      },
    });
    // "window ≠ process"
    const lk = io(tStill - 0.3, 0.5);
    M.label('window ≠ process', DOOR.x + DOOR.w / 2, LABEL_Y, { size: 30, color: C.head, alpha: lk });

    // highlight-in-turn: each kind is 'named' while it is talked about
    const nTray = io(tTray, 0.45) * out(tSvc, 0.45);
    const nSvc = io(tSvc, 0.45) * out(tKids, 0.45);
    const nOrph = io(tParent, 0.45);

    // 1. the Ollama cook: an app cook that turns out to be a tray app (clock badge) on 'tray'
    M.cook(t, X(3), Y, 96, {
      kind: t >= tTray ? 'tray' : 'app', pid: 1168, name: 'ollama app.exe', satchel: true,
      lit: 0.6 * (1 - nTray) * K.io(t, tClose + 0.4, 0.5) * out(tOut, 0.5), named: nTray,
    });
    const tag = (s, x, a0, hi) => M.label(s, x, LABEL_Y, { alpha: a0, color: hi > 0.5 ? C.strong : C.body });
    tag('tray app (Ollama)', X(3), io(tTray, 0.5), nTray);

    // 2. a service: night staff, never had a door
    const sk = io(tSvc - 0.1, 0.5);
    if (sk > 0) {
      M.cook(t, X(5), Y + (1 - K.ease.out(sk)) * 16, 96, { kind: 'service', alpha: sk, named: nSvc });
      tag('service: never had a door', X(5), sk, nSvc);
    }

    // 3. a child whose parent went away: the parent (stretch 6) fades to a ghost on "parent",
    //    the child (stretch 7) keeps glowing at the counter
    const ck = io(tKids - 0.35, 0.45), gone = K.io(t, tParent, 0.5);
    if (ck > 0) {
      const pa = ck * (1 - gone);
      M.parentLink(X(6) + 10, Y - 92, X(7) - 10, Y - 92, { k: K.io(t, tKids - 0.2, 0.5), bend: -50, label: null, alpha: 1 - gone });
      M.cook(t, X(6), Y + (1 - K.ease.out(ck)) * 16, 96, { alpha: pa, named: K.io(t, tKids, 0.3) * (1 - gone) });
      // where the parent stood: a dashed ghost outline
      if (gone > 0) M.cook(t, X(6), Y, 96, { kind: 'ghost', alpha: 0.75 * gone, hat: false });
      M.cook(t, X(7), Y + (1 - K.ease.out(ck)) * 16, 96, { alpha: ck, lit: 0.8 * gone, named: nOrph });
      tag('child: parent gone', X(7), io(tParent, 0.5), nOrph);
    }
  });

  // ======================================================== C: no automatic tree kill; the job object
  const PY = 250, KS = 80;
  const family = (xs, px, o) => {
    // o: {parentA, parentNamed, kidLit, linkA}
    xs.forEach((cx, j) => M.parentLink(px + (j - 1) * 18, PY + KS / 2 + 8, cx, Y - KS / 2 - 52, { k: o.linkK, label: null, bend: (j - 1) * 10, alpha: o.linkA }));
    M.cook(t, px, PY, KS, { alpha: o.parentA, named: o.parentNamed, hat: true });
    xs.forEach((cx, j) => M.cook(t, cx, Y, KS, { lit: o.kidLit, phase: j * 1.7 }));
  };
  if (kC1 > 0.002) K.layer(kC1, () => {
    const endK = K.io(t, tEnding + 0.5, 0.45);         // End task: the parent fades
    family([X(0), X(1), X(2)], X(1), {
      parentA: 1 - endK, parentNamed: K.io(t, tEnding, 0.35), kidLit: 0.7 * io(tAuto, 0.5),
      linkK: K.io(t, tTree + 0.2, 0.6), linkA: 1 - endK,
    });
    if (endK > 0) M.cook(t, X(1), PY, KS, { kind: 'ghost', alpha: 0.6 * endK, hat: false });
    M.label('children keep running', X(1), LABEL_Y, { size: 30, color: C.head, alpha: io(tAuto, 0.5) });
  });
  if (kC2 > 0.002) K.layer(kC2, () => {
    family([X(5), X(6), X(7)], X(6), { parentA: 1, parentNamed: 0, kidLit: 0, linkK: K.io(t, tTools, 0.6), linkA: 1 });
    // the group: a dashed rounded box that draws itself around the whole family
    const bk = K.io(t, tGroup, 0.7);
    const bx = M.stretchAt(5).x + 10, bw = M.stretchAt(7).x + M.stretchAt(7).w - 10 - bx, by = 150, bh = 370, r = 28;
    if (bk > 0) {
      const pts = [[bx + r, by], [bx + bw - r, by], [bx + bw, by + r], [bx + bw, by + bh - r], [bx + bw - r, by + bh], [bx + r, by + bh], [bx, by + bh - r], [bx, by + r], [bx + r, by]];
      K.path(pts, { k: bk, color: C.strong, w: 3, dash: [14, 10], head: false, tension: 0.25, alpha: 0.85 });
    }
    // the label sits BELOW the box (never on the dashed line), solid, held at full strength until tm-bug
    const pk = K.io(t, tGroup, 0.35);
    if (pk > 0) K.pill('job object', bx + bw / 2, by + bh + 44, { font: 'mono', size: 30, fill: C.panel, stroke: C.strong, color: C.strong, alpha: pk });
  });

  // ======================================================== D: Task Manager's own window
  if (kD > 0.002) K.layer(kD, () => {
    const close = K.io(t, tClosed - 0.1, 0.6);
    const fix = K.io(t, tFixed + 0.3, 0.6);
    K.line(DOOR.x + DOOR.w + 8, DOOR.y + 250, X(3) - 60, Y + 8, { color: C.body, w: 3, dash: [8, 8], alpha: 0.9 * (1 - close) * io(tTask, 0.5) });
    M.doorWin(t, {
      ...DOOR, title: 'Task Manager', kind: 'explorer', close, focus: true,
      inner: (r) => {
        // a tiny staff board: rows as bars, unreadable on purpose
        const rnd = K.rng(7);
        for (let i = 0; i < 6; i++) {
          const ry = r.y + 40 + i * 54, svc = i >= 4;
          g.save(); g.beginPath(); g.arc(r.x + 44, ry, 7, 0, Math.PI * 2); g.fillStyle = svc ? C.soft : C.head; g.fill(); g.restore();
          K.line(r.x + 70, ry, r.x + 70 + (r.w - 220) * (0.45 + 0.5 * rnd()), ry, { color: svc ? C.line2 : C.body, w: 8, alpha: svc ? 0.9 : 0.55 });
          K.line(r.x + r.w - 110, ry, r.x + r.w - 40, ry, { color: C.line2, w: 8 });
        }
      },
    });
    // when it happened
    M.label('late 2025 · a Windows update', DOOR.x + DOOR.w / 2, LABEL_Y, { color: C.body, alpha: io(tBug + 0.2, 0.5) });

    // the Task Manager cook: appears when it's named, stays after the close, leaves once fixed
    const ck = io(tTask - 0.1, 0.5);
    M.cook(t, X(3), Y + (1 - K.ease.out(ck)) * 16, 96, {
      name: 'Taskmgr.exe', alpha: ck * (1 - fix), named: K.io(t, tClosed + 0.3, 0.4) * (1 - fix),
    });
    // hidden copies pile up (leftovers: ghosts), then go with the fix
    [4, 5, 6].forEach((i, j) => {
      const gk = K.io(t, tClosed + 0.6 + j * 0.3, 0.4) * (1 - K.io(t, tFixed + 0.1 + j * 0.1, 0.5));
      if (gk > 0) M.cook(t, X(i), Y + (1 - K.ease.out(gk)) * 12, 96, { kind: 'ghost', alpha: gk, name: 'Taskmgr.exe', hat: false });
    });
    const hk = K.io(t, tClosed + 0.8, 0.5) * out(tFixed, 0.4);
    M.label('each close left a copy running', X(5), LABEL_Y, { color: C.strong, alpha: hk });
    // fixed
    const fk = K.io(t, tFixed, 0.5);
    if (fk > 0) K.layer(fk, () => {
      const s = 'fixed in November 2025', tw = K.measure(s, M.T.labelBig), x0 = X(5) - (tw + 50) / 2;
      K.icon('check', x0 + 18, LABEL_Y - 10, 36 * (0.85 + 0.15 * K.ease.out(fk)), { color: C.head, w: 3.5 });
      K.text(s, x0 + 50, LABEL_Y, { ...M.T.labelBig, color: C.head });
    });
    // exit (held to the last frame): the leftover Taskmgr.exe is now an ended process, a ghost at its stretch
    if (fix > 0) M.cook(t, X(3), Y, 96, { kind: 'ghost', alpha: 0.75 * fix, name: 'Taskmgr.exe', hat: false });
  });
});
