/* 01.05 scene 14 — The surprises you'll hit.
   Six small cards fill a 2x3 grid, one per spoken surprise. The card being described is full
   opacity with a soft gold outline; earlier cards rest at 50 %. Each card: a tiny courier / street
   vignette on the left, the literal form (mono) and its meaning on the right. Exit: all six even. */
SCENE('14', (t, S) => {
  K.bg();
  const C = K.C;
  const io = K.io;
  const f = (w, n, fb, o) => S.find(w, n, fb, o);

  // ---- beats (local seconds; fallbacks from cues.json)
  const cue = [
    S.cue('same-terminal', 0), S.cue('store-opens', 9.0), S.cue('py-vs-python', 15.1), S.cue('mac-python3', 19.0),
    S.cue('pip-import', 29.2), S.cue('export-stick', 35.83),
  ];
  const B = {
    c1in: f('install', 0, 2.3),
    c1err: f('recognized', 0, 6.1),
    c1new: f('Open', 0, 7.6),
    c2py: f('python', 0, 9.6),
    c2store: f('Microsoft', 0, 11.2),
    c2won: f('stand-in', 0, 13.6),
    c3py: f('P', 0, 15.72, { whole: true }),
    c3two: f('different', 0, 17.2),
    c4err: f('found', 0, 20.7),
    c4ok: f('python3', 0, 21.8),
    c4brew: f('brew', 0, 24.8),
    c4home: f("Homebrew", 0, 26.1),
    c5pip: f('Pip', 0, 29.2),
    c5imp: f('import', 0, 30.8),
    c5pkg: f('package', 0, 32.5),
    c6exp: f('export', 0, 37.6),
    c6fresh: f('each', 0, 42.0),
  };
  const even = Math.min(S.dur - 1.0, B.c6fresh + 1.4);  // all six cards settle to one opacity

  // ---- grid
  const W = 760, H = 180, PAD = 15;                   // content sits 15 px lower inside the taller card
  const slots = [
    [160, 240], [1000, 240], [160, 460], [1000, 460], [160, 680], [1000, 680],
  ];

  // eyebrow + faint empty slots (calm first frame)
  const eb = io(t, -0.4, 0.8);
  M.eyebrow("the surprises you'll hit", 960, 186, { alpha: eb });

  const card = (i, draw) => {
    const [x, y] = slots[i];
    const a0 = cue[i] + (i === 0 ? 1.3 : 0);           // card 1 lands after "The surprises you'll hit."
    const kin = io(t, a0, 0.5);
    // empty slot outline until the card arrives
    const slotA = 0.22 * eb * (1 - kin);
    if (slotA > 0.003) {
      const g = K.ctx(); g.save(); g.globalAlpha *= slotA; g.setLineDash([10, 10]); g.lineWidth = 2; g.strokeStyle = C.line2;
      K.rr(x, y, W, H, 20); g.stroke(); g.restore();
    }
    if (kin <= 0) return;
    const next = i < 5 ? cue[i + 1] : Infinity;
    const rest = io(t, next, 0.5);                       // this card hands focus to the next
    const settle = io(t, even, 0.8);
    let a = kin * K.lerp(1, 0.5, rest);
    a = K.lerp(a, 0.82, settle * (kin >= 1 ? 1 : 0));
    const focus = (1 - rest) * (1 - settle);
    const dy = (1 - kin) * 24;
    K.layer(a, () => {
      K.card(x, y + dy, W, H, { r: 20, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.75 * focus), glow: 0.35 * focus, shadow: true });
      // card number
      K.text(String(i + 1), x + 22, y + dy + 40 + PAD, { font: 'mono', weight: 700, size: 26, color: K.mixColor(C.soft, C.head, focus) });
      draw(x, y + dy + PAD, x + 165, y + dy + PAD + 78, x + 300);
    });
  };
  const line = (s, x, y, o = {}) => K.text(s, x, y, { font: o.font || 'ui', weight: o.weight || 600, size: o.size || 28, color: o.color || C.body, alpha: o.alpha });
  const mono = (s, x, y, o = {}) => line(s, x, y, { font: 'mono', color: C.strong, ...o });
  const sp = (parts, x, y, o = {}) => K.spans(parts, x, y, { font: 'ui', weight: 600, size: o.size || 28, color: C.body, alpha: o.alpha });

  // 1 — same terminal still says "not recognized" -> open a new one
  card(0, (x, y, vx, vy, tx) => {
    const err = io(t, B.c1err, 0.5), nu = io(t, B.c1new, 0.6);
    M.courier(t, vx - 52, vy - 8, 60, { icon: 'terminal', dim: 0.6 * nu });
    M.cross(vx - 52, vy - 8, 60, io(t, B.c1err + 0.2, 0.45));
    M.courier(t, vx + 70, vy - 8, 60, { icon: 'terminal', lit: nu, alpha: nu });
    mono(K.typed("'tool' is not recognized…", t, B.c1err, 40), tx, y + 62, { alpha: err });
    sp([{ s: 'same terminal → ' }, { s: 'open a new one', color: C.head }], tx, y + 114, { alpha: nu });
  });

  // 2 — python opens the Microsoft Store: the stand-in won
  card(1, (x, y, vx, vy, tx) => {
    const pk = io(t, B.c2py, 0.4), st = io(t, B.c2store, 0.5), won = io(t, B.c2won, 0.5);
    M.signpost(t, vx - 30, vy - 14, 80, { point: io(t, B.c2store, 0.7), reach: 80 });
    sp([{ s: 'python', font: 'mono', color: C.strong }, { s: ' → Microsoft Store opens', alpha: st }], tx, y + 62, { alpha: pk });
    sp([{ s: 'the stand-in won', color: C.accent }], tx, y + 114, { alpha: won });
  });

  // 3 — python and py can start two different Pythons
  card(2, (x, y, vx, vy, tx) => {
    const a1 = io(t, cue[2] + 0.3, 0.5), a2 = io(t, B.c3py, 0.5), two = io(t, B.c3two, 0.5);
    const rows = [[vy - 30, a1, 'python'], [vy + 34, a2, 'py']];
    rows.forEach(([ry, k, nm]) => {
      if (k <= 0) return;
      K.pill(nm, vx - 52, ry, { font: 'mono', size: 26, w: 118, alpha: k });
      K.arrow(vx + 12, ry, vx + 56, ry, { k, color: C.body, w: 2.5 });
      K.folder(vx + 92, ry, 40, { alpha: k });
    });
    sp([{ s: 'python', font: 'mono', color: C.strong }, { s: '  and  ' }, { s: 'py', font: 'mono', color: C.strong }], tx, y + 62, { alpha: a2 });
    line('two different Pythons', tx, y + 114, { alpha: two });
  });

  // 4 — Mac: python not found, python3 is; brew not found until Homebrew's folder joins PATH
  card(3, (x, y, vx, vy, tx) => {
    const e1 = io(t, B.c4err - 0.5, 0.5), ok = io(t, B.c4ok, 0.5), br = io(t, B.c4brew, 0.5), hb = io(t, B.c4home, 0.5);
    K.pill('python', vx - 34, vy - 30, { font: 'mono', size: 26, w: 150, alpha: e1 });
    M.cross(vx + 76, vy - 30, 56, io(t, B.c4err, 0.45));
    K.pill('python3', vx - 34, vy + 34, { font: 'mono', size: 26, w: 150, alpha: ok, stroke: C.head });
    K.icon('check', vx + 76, vy + 34, 40, { color: C.head, alpha: ok, w: 4 });
    mono('command not found: python', tx, y + 46, { size: 26, alpha: e1 });
    mono('command not found: brew', tx, y + 88, { size: 26, alpha: br });
    sp([{ s: "until Homebrew's folder joins " }, { s: 'PATH', font: 'mono', color: C.head }], tx, y + 130, { size: 26, alpha: hb });
  });

  // 5 — pip install worked, import fails: a different Python
  card(4, (x, y, vx, vy, tx) => {
    const p = io(t, B.c5pip, 0.6), im = io(t, B.c5imp, 0.6), pk = io(t, B.c5pkg, 0.5);
    const ax = vx - 50, bx = vx + 70, fy = vy + 34;
    K.folder(ax, fy, 44, { alpha: p });
    K.folder(bx, fy, 44, { alpha: im });
    K.text('pip', ax, vy - 30, { font: 'mono', weight: 600, size: 26, color: C.strong, align: 'center', alpha: p });
    K.arrow(ax, vy - 20, ax, fy - 26, { k: p, color: C.body, w: 2.5 });
    K.text('import', bx, vy - 30, { font: 'mono', weight: 600, size: 26, color: C.strong, align: 'center', alpha: im });
    K.arrow(bx, vy - 20, bx, fy - 26, { k: im, color: C.soft, w: 2.5, dash: [6, 6] });
    M.cross(bx, fy, 56, io(t, B.c5imp + 0.4, 0.45));
    mono('ModuleNotFoundError', tx, y + 62, { alpha: im });
    line('it went to a different Python', tx, y + 114, { alpha: pk, size: 26 });
  });

  // 6 — an agent's export / activate didn't stick: each command, a fresh shell
  card(5, (x, y, vx, vy, tx) => {
    const ag = io(t, cue[5], 0.5), ex = io(t, B.c6exp, 0.5), fr = io(t, B.c6fresh, 0.5);
    M.courier(t, vx - 62, vy - 2, 56, { icon: 'sparkle', lantern: 1, alpha: ag });
    [0, 1, 2].forEach((j) => {
      const k = K.stagger(t, B.c6fresh, j, 0.25, 0.5);
      const sy = vy - 44 + j * 44;
      K.line(vx - 10, vy + 10, vx + 60, sy, { k, color: C.soft, w: 2, dash: [5, 6] });
      M.satchel(t, vx + 92, sy, 46, { strap: 'none', alpha: k, names: false });
    });
    sp([{ s: 'export', font: 'mono', color: C.strong }, { s: ' · ' }, { s: 'activate', font: 'mono', color: C.strong }, { s: '  didn’t stick' }], tx, y + 62, { alpha: ex });
    line('each command, a fresh shell', tx, y + 114, { alpha: fr });
  });
});
