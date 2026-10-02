/* 00.05 · 01 — The clerk at the desk (title card, noBadge).
   The workspace is assembled for the first time: lamp lights, desk rises, clerk appears, one text card lands.
   Then the three kinds of change: a png lands (what goes on the desk), a phone line to a faint studio (hand-offs),
   the desk glides along its floor line (where it sits). Finally the six districts as shelves. */
SCENE('01', (t, S) => {
  const C = K.C, L = M.layout.title;
  const cDesk = S.cue('desk', 15.4), cFills = S.cue('desk-fills', 21.9), cShelves = S.cue('shelves', 32);
  const tPut = S.find('put', 0, cFills + 4.1), tHands = S.find('hands', 0, cFills + 5.8), tSits = S.find('sits', 0, cFills + 9);
  const tOwn = S.find('own', 0, cShelves + 3.7);

  K.bg({ glow: 0.16, glowX: 960, glowY: 330 });
  if (K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.55, mask: [640, 860] });
  K.petals(t, { n: 5, avoid: [[240, 130, 1680, 330], [380, 330, 1540, 890], [1580, 320, 1840, 780], [80, 870, 1840, 940]] });

  // ---- title block (from frame 0)
  K.title('How AI models work today', 960, 190, { size: 76, align: 'center' });
  // purpose line, brightened phrase by phrase as the narrator lists them (gold underline sweep under each)
  const sub = 'What they take in, make, remember, cost, and where you meet them.';
  const so = { font: 'read', size: 30 };
  K.text(sub, 960, 252, { ...so, color: C.body, align: 'center' });
  const sx0 = 960 - K.measure(sub, so) / 2;
  const tTake = S.find('take', 0, 8.2), tMake = S.find('make', 0, 9.1), tRem = S.find('remember', 0, 10.3),
    tCost = S.find('cost', 0, 12.0), tPlaces = S.find('places', 0, 13.6);
  const phrases = [['What they take in', tTake - 0.3], ['make', tMake], ['remember', tRem], ['cost', tCost], ['where you meet them', tPlaces - 0.5]];
  phrases.forEach(([ph, t0], i) => {
    const at = sub.indexOf(ph), px = sx0 + K.measure(sub.slice(0, at), so), pw = K.measure(ph, so);
    const sweep = K.io(t, t0, 0.45);
    if (sweep <= 0) return;
    const next = i < phrases.length - 1 ? phrases[i + 1][1] : cDesk;
    const hot = sweep * (1 - 0.6 * K.io(t, next, 0.5));          // active phrase bright, then settles
    K.text(ph, px, 252, { ...so, color: C.head, alpha: hot });
    const settle = 1 - K.io(t, cDesk + 1.5, 1.2);                     // underlines clear once the desk is lit
    if (settle > 0) K.line(px, 266, px + pw * sweep, 266, { color: C.head, w: 3, alpha: (0.35 + 0.65 * hot) * settle });
  });
  K.text('A model only knows what is on its desk.', 960, 300, { font: 'ui', size: 32, weight: 600, color: C.head, align: 'center' });

  // ---- the workspace
  const base = M.at(L);
  // the empty desk rises dimly on "take", then lights fully on [[desk]]
  const rk = K.io(t, tTake, M.motion.grow, 'out');
  // "where the desk sits": glide 40 px left along the floor line, then settle back home
  const glide = -40 * (K.io(t, tSits, 1.0) - K.io(t, tSits + 1.6, 1.0));
  const D = M.desk(L.size, { cx: L.cx + glide, cy: L.cy + (1 - rk) * 30 });
  const lit = K.lerp(0.15, 0.45, K.io(t, 0, 8)) + 0.55 * K.io(t, cDesk, 0.8);   // slow warm-up, then full light
  const clerkY = base.y0 - 34, lampY = clerkY - 52 - 44 - 38 * 1.3;

  // fixed floor line the desk glides on (brightens on "sits")
  const fk = rk * (0.12 + 0.6 * K.env(t, tSits - 0.2, tSits + 2.8, 0.5));
  K.line(300, base.bottom, 1620, base.bottom, { color: C.line2, w: 2, alpha: fk });

  M.lamp(t, { x: D.cx, y: lampY, cordTop: L.lamp.cordTop, lit, cone: rk > 0 ? D : null });
  const dimK = 1 - K.io(t, cDesk, 0.8);                                 // empty desk waits in shadow until [[desk]]
  M.stage(t, { desk: D, lamp: false, lit: lit * rk, alpha: rk, floor: 0, wash: dimK > 0 ? { color: '#0B0A12', a: 0.4 * dimK } : undefined,
    clerk: { alpha: K.io(t, cDesk + 0.35, 0.6) } });

  // one text card lands at the desk cue (from the left)
  const pA = M.spot(D, 0.3, 0.42);
  const la = M.land(t, cDesk + 0.7, pA.x, pA.y, pA.x - 160, pA.y + 10);
  if (la.k > 0) M.paper(la.x, la.y, { w: 130, h: 86, rot: -0.05, alpha: la.a, lines: 3 });

  // "what gets put on that desk": a png lands (from the right)
  const pB = M.spot(D, 0.7, 0.45);
  const lb = M.land(t, tPut, pB.x, pB.y, pB.x + 170, pB.y + 10);
  if (lb.k > 0) M.file(lb.x, lb.y, 110, { ext: 'png', alpha: lb.a, rot: 0.04 });

  // "what it hands off to other models": a dashed phone line to a faint studio
  const sk = K.io(t, tHands - 0.1, 0.6);
  if (sk > 0) {
    const st = M.studio(t, M.layout.studio.x, M.layout.studio.y, { alpha: 0.4 * sk, still: true });
    M.phone(t, D.cx + 66, clerkY, st.door.x - 6, st.door.y, { k: K.io(t, tHands, 0.7), pulse: true, bend: -30 });
  }

  // ---- shelves: a quiet line, then the six districts
  const qk = K.io(t, cShelves, 0.6);
  const rowY = 906, to = { font: 'ui', weight: 600, size: 26 };
  const names = ['Machine', 'Code', 'History', 'Network', 'Trust', 'Shipping'];
  const pw = names.map((n) => K.measure(n, to) + 26 + 10 + 40);
  const quiet = 'a minute or two each · own lessons later';
  const qw = K.measure(quiet, to), gap = 12, lead = 40;
  const total = qw + lead + pw.reduce((a, b) => a + b, 0) + gap * (names.length - 1);
  let x = 960 - total / 2;
  if (qk > 0) K.text(quiet, x, rowY + 9, { ...to, color: C.soft, alpha: qk });
  x += qw + lead;
  names.forEach((n, i) => {
    const k = K.stagger(t, tOwn - 0.2, i, 0.12, 0.5);
    const w = pw[i], h = 46;
    if (k > 0) K.layer(k, () => {
      const yy = rowY + (1 - k) * 8;
      K.card(x, yy - h / 2, w, h, { r: h / 2, fill: C.page, stroke: K.rgba(C.head, 0.45), shadow: false });
      K.icon('pin', x + 20 + 13, yy, 26, { color: C.head, w: 2 });
      K.text(n, x + 20 + 26 + 10, yy + 9, { ...to, color: C.head });
    });
    x += w + gap;
  });
});
