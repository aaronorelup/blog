/* 05 — The door labels are fading
   The three door pills fuse into one 'Claude' door (S102, 2026-09-16); you type into one box and Claude works out
   whether you need a quick answer or a task. The quick answer stays at the counter; the task arrow leaves the house
   for the faint vendor building at the right edge (the ghost from 03), because new Cowork tasks on Pro and Max run
   on Anthropic's servers (06 tells that story), and the 'Allow this action?' chip sits on that arrow. Then the
   vendor fades, the camera settles on the wide street's house position and the inside walls draw again through a
   translucent front wall: one door, three rooms behind it. Ends on the house at (110, 250, s 1), where 06 picks
   the street up (vendor lot empty, as 06 expects). */
SCENE('05', (t, S) => {
  K.bg();
  const C = K.C;
  const cOne = S.cue('one-door', 10.77), cAsk = S.cue('asks', 17.01), cRooms = S.cue('still-rooms', 21.73);
  const wMerging = S.find('merging', 0, 3.74), wClaude = S.find('Claude', 0, 6.1), wRolling = S.find('rolling', 0, 7.4);
  const wQuick = S.find('quick', 0, 14.27), wTask = S.find('task', 0, 15.7), wAsks = S.find('asks', 0, 19.03);
  const wThree = S.find('three', 0, 22.9), wBox = S.find('box', 1, 24.8), wBehind = S.find('rooms', 0, 26.2);

  // ---- where the house sits: left beside the card (as 04 left it) -> on the front wall -> the wide street
  const A = { x: 90, y: 330, s: 0.85 }, B = { x: 100, y: 240, s: 1.05 }, Cw = { x: 110, y: 250, s: 1 };
  const k1 = K.io(t, cOne - 0.9, 1.1), k2 = K.io(t, cRooms - 0.1, 1.3);
  const lerpP = (p, q, k) => ({ x: K.lerp(p.x, q.x, k), y: K.lerp(p.y, q.y, k), s: K.lerp(p.s, q.s, k) });
  const place = lerpP(lerpP(A, B, k1), Cw, k2);

  // ---- house state
  const merge = K.io(t, wMerging + 0.6, 1.9, 'lin');                 // pills slide (eased inside), fuse at 0.5-0.7
  const front = K.io(t, cOne - 0.9, 0.8) - 0.45 * K.io(t, cRooms + 0.6, 1.0);   // opaque wall, then translucent
  const walls = 1 - K.io(t, cOne - 0.9, 0.6) + K.io(t, cRooms + 1.0, 1.2);      // hidden behind it, then drawn again
  const roomLit = (i) => 0.8 + 0.2 * K.stagger(t, wBehind, i, 0.25, 0.6);
  const h = M.house(t, { ...place, merge, front: K.clamp(front), walls: K.clamp(walls),
    rooms: { chat: roomLit(0), cowork: roomLit(1), code: roomLit(2) } });
  // the fused door glows once as it lands
  const fuse = K.io(t, wClaude - 0.2, 0.5, 'out') * (1 - K.io(t, wClaude + 0.8, 1.2));
  if (fuse > 0) K.glow(h.door.x, h.door.y, 200 * h.s, C.head, 0.28 * fuse);

  // ---- [[merge]] the dated announcement, right column
  const aOut = 1 - K.io(t, cOne - 1.3, 0.6);
  const dA = K.io(t, 0.25, 0.6, 'out') * aOut;
  if (dA > 0) {
    K.layer(dA, () => {
      const pw = M.pillL('2026-09-16', 1000, 330, { size: 30, font: 'mono', color: C.page, fill: C.head, stroke: C.head });
      M.label('announced', 1000 + pw + 18, 340, { align: 'left', color: C.body });
    });
  }
  const cA = K.io(t, 1.7, 0.7, 'out') * aOut;
  const cardH = M.dated(1000, 400, 800, { eyebrow: 'Anthropic · Claude blog', body: 'Claude Cowork and chat are merging into one Claude.', quote: true, size: 34, measure: true });
  if (cA > 0) K.layer(cA, () => K.at(0, (1 - cA) * 16, 1, 0, () =>
    M.dated(1000, 400, 800, { eyebrow: 'Anthropic · Claude blog', body: 'Claude Cowork and chat are merging into one Claude.', quote: true, size: 34 })));
  const rA = K.io(t, wRolling - 0.1, 0.6, 'out') * aOut;
  if (rA > 0) M.pillL('rolling out · Pro and Max first', 1000, 400 + cardH + 50, { size: 30, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.6), alpha: rA });
  if (rA > 0) M.label('more plans to follow', 1000, 400 + cardH + 120, { align: 'left', color: C.soft, italic: true, weight: 400, alpha: rA });

  // ---- [[one-door]] .. [[asks]]: one box at the door, a request, two routes (drawn on the closed front wall)
  const bOut = 1 - K.io(t, cRooms - 0.5, 0.5);
  const at = (lx, ly) => h.at(lx, ly);
  const boxA = K.io(t, cOne - 0.1, 0.6, 'out') * bOut;
  const boxW = 680 * h.s / 1.2, boxH = 84 * h.s / 1.2, [bx, by] = at(470, 460);
  if (boxA > 0) {
    K.layer(boxA, () => {
      K.card(bx - boxW / 2, by - boxH / 2, boxW, boxH, { r: 20, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.55), lw: 2 });
      const tx = bx - boxW / 2 + 34;
      K.text('Ask or give a task', tx + 8, by + 10, { font: 'ui', size: 30, color: C.soft });
      if (K.caretOn(t - cOne)) K.line(tx, by - 18, tx, by + 18, { color: C.head, w: 3 });
    });
  }
  // the request chip rises out of the box to the fork
  const fork = at(470, 350);
  const rk = K.io(t, cOne + 1.4, 0.9);
  const reqA = K.io(t, cOne + 1.3, 0.4, 'out') * bOut;
  if (reqA > 0) {
    const ry = K.lerp(by, fork[1], rk);
    K.pill('request', bx, ry, { size: 28, color: C.page, fill: C.head, stroke: C.head, alpha: reqA, glow: 0.4 });
  }
  // the vendor's building, ghosted at the right edge (as in 03): where a task goes on Pro and Max
  const vA = K.io(t, cOne - 0.5, 0.7) * bOut;
  const V = M.vendor(t, { x: 1450, y: 300, s: 0.78, alpha: 0.42 * vA, doors: false, slots: 1 });
  const hR = h.x + h.w;
  if (vA > 0) M.road(t, { x0: hR, x1: 1840, y: h.y + h.h - 12, alpha: 0.6 * vA, label: false });
  // two routes: quick answer (the counter, in your house) / task (out of the house, to the vendor's building)
  const qDest = at(155, 230), tDest = [V.office.cx, V.office.cy];
  const tPts = [[fork[0] + 50, fork[1] - 12], at(905, 330), [V.office.cx - 92, V.office.cy]];
  const qk = K.io(t, wQuick - 0.6, 0.8), tk = K.io(t, wTask - 0.7, 0.9);
  if (bOut > 0) {
    K.layer(bOut, () => {
      if (qk > 0) K.path([[fork[0] - 70, fork[1] - 8], [K.lerp(fork[0], qDest[0], 0.55), fork[1] - 30], [qDest[0] + 40, qDest[1] + 40]], { k: qk, color: C.head, w: 4, headSize: 16 });
      if (tk > 0) K.path(tPts, { k: tk, color: C.head, w: 4, headSize: 16, tension: 0.3 });
    });
    const qa = K.io(t, wQuick - 0.1, 0.5, 'out') * bOut, ta = K.io(t, wTask - 0.1, 0.5, 'out') * bOut;
    if (qa > 0) K.pill('quick answer', qDest[0], qDest[1], { size: 28, icon: 'chat', iconColor: C.head, color: C.strong, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.6), alpha: qa });
    if (ta > 0) K.pill('task', tDest[0] + 8, tDest[1], { size: 28, icon: 'clock', iconColor: C.head, color: C.strong, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.6), alpha: ta });
  }
  // [[asks]] the chip sits ON the task arrow, in the gap between the buildings (the scene's one 'back' overshoot)
  const askK = K.io(t, cAsk + 0.15, 0.6, 'back'), askA = K.clamp(K.io(t, cAsk + 0.15, 0.3)) * bOut;
  if (askA > 0) {
    const gx = (hR + V.x) / 2, gk = K.clamp((gx - tPts[1][0]) / (tPts[2][0] - tPts[1][0]));
    const ap = [gx, K.lerp(tPts[1][1], tPts[2][1], gk)];
    K.layer(askA, () => K.at(ap[0], ap[1], 0.7 + 0.3 * askK, 0, () =>
      K.pill('Allow this action?', 0, 0, { size: 26, icon: 'question', iconColor: C.head, color: C.strong, fill: C.panel, stroke: C.head, glow: 0.35 })));
    const la = K.io(t, wAsks - 0.2, 0.5, 'out') * bOut;
    if (la > 0) {
      M.label('merged Claude', ap[0], ap[1] + 74, { color: C.body, alpha: la });
      M.label('asks by default', ap[0], ap[1] + 108, { color: C.body, alpha: la });
    }
  }

  // ---- [[still-rooms]] three tabs or one box; the side card
  const sx = 1120, sw = 700;
  const tabA = K.io(t, wThree - 0.2, 0.5, 'out');
  if (tabA > 0) {
    K.layer(tabA, () => {
      M.label('your app may show', sx, 178, { align: 'left', color: C.soft, italic: true, weight: 400 });
      let x = sx;
      for (const s of ['Chat', 'Cowork', 'Code']) x += M.pillL(s, x, 232, { size: 28, color: C.strong, fill: C.panel, stroke: C.line2 }) + 10;
    });
  }
  const orA = K.io(t, wBox - 0.9, 0.5, 'out');
  if (orA > 0) {
    K.layer(orA, () => {
      M.label('or', sx + 412, 242, { align: 'left', color: C.soft, italic: true, weight: 400 });
      K.card(sx + 456, 205, 244, 56, { r: 16, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.55), lw: 2 });
      K.text('one box', sx + 486, 242, { font: 'ui', size: 28, color: C.soft });
    });
  }
  const sideA = K.io(t, wThree + 0.6, 0.7, 'out');
  if (sideA > 0) {
    K.layer(sideA, () => K.at(0, (1 - sideA) * 16, 1, 0, () => {
      const y0 = 310;
      const hh = M.dated(sx, y0, sw, {
        eyebrow: 'Anthropic · Claude blog · 2026-09-16',
        body: 'Rolling out on Pro and Max; Team and Free “will follow soon”, no date yet.',
        size: 30, footer: true,
      });
      const y1 = y0 + hh + 24;
      const h2 = M.dated(sx, y1, sw, {
        eyebrow: 'Anthropic · desktop docs · read 2026-10-14',
        body: 'The desktop quickstart still shows three tabs; the 2026-10-08 changelog labels Unified Claude “(beta)”.',
        size: 30,
      });
      M.pillL('tabs may be gone by the time you watch', sx, y1 + h2 + 40, { size: 26, color: C.head, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.6) });
    }));
  }
});
