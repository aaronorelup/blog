/* 12 — The eraser: checkpoints are not git
   The map at full view, the station across the valley. [[eraser]] the guide draws a fresh squiggle, swaps its pen
   for the eraser (rewind, built on checkpoints) and rubs the squiggle out. [[only]] two marks: Claude's file edit
   (gold, the guide's ink) and a file only Bash or another program touched (cream, drawn by a separate terminal
   hand). The S117 card (three sentences) covers the station's place while the eraser wipes the first mark and
   passes over the second, which stays; at "replacement for git" the stones glow. [[remote]] the card leaves, the
   station returns with a database chip and a deployment chip, the guide carries the eraser to the valley edge and
   it stops there; the S101 card sits bottom-left. Exit: eraser resting at the valley edge, station unchanged. */
SCENE('12', (t, S) => {
  const C = K.C, L = M.L, Y = L.pathY, MX = L.mergeX, [X1, X2] = L.stoneX, [c1, c2] = L.sideStones;
  const fw = (w, fb, n = 0) => S.find(w, n, fb);
  const cEr = S.cue('eraser', 0), cOnly = S.cue('only', 5.48), cRem = S.cue('remote', 19.68);
  const tBuilt = fw('built', cEr + 1.8), tPencil = fw('pencil', cEr + 3.7);
  const tTrack = fw('track', cOnly + 3.7), tBash = fw('Bash', cOnly + 8.5), tCapt = fw('captured', cOnly + 10.9);
  const tRepl = fw('replacement', cOnly + 12.5);
  const tRemS = fw('remote', cRem + 1.24), tDep = fw('deployment', cRem + 3), tPush = fw('push', cRem + 3.8);
  const tRub = fw('rubbed', cRem + 4.7);
  const id = M.ids();

  // ---------------------------------------------------------------- where the guide works (its pen / eraser tip)
  // the guide stands at (wx - 115, wy + 20) so its 80 px tool reaches the work point from the left (the tool lies
  // beside the tile, not over it); at rest that is M.L.guide.
  const OX = 115, OY = 20, R = [L.guide[0] + OX, L.guide[1] - OY];   // rest work point (495, 740)
  const SQ = []; for (let i = 0; i <= 16; i++) SQ.push([515 + i * 7.5, 740 + Math.sin(i * 1.25) * 15 - i * 0.6]);
  const A = [640, 750], B = [920, 750], V = [1218, 830];   // mark A (file edit), mark B (Bash), the valley edge
  const drawK = K.seg(t, cEr + 0.15, cEr + 1.55);        // the squiggle is drawn
  const rub0 = K.seg(t, tPencil - 0.45, tPencil + 1.15);  // the squiggle is rubbed out
  const rubA = K.seg(t, tTrack + 0.75, tTrack + 2.9);     // the eraser wipes the file edit
  const rubB = K.seg(t, tBash - 0.45, tCapt - 0.25);      // it passes over the Bash change
  const toolEraser = t >= tBuilt + 0.15;
  function work() {
    // strokes override the waypoints while they run
    if (t >= cEr + 0.15 && t <= cEr + 1.55) { const p = M.along(SQ, drawK); return [p.x, p.y]; }
    if (t >= tPencil - 0.45 && t <= tPencil + 1.15) return [K.lerp(505, 640, K.ease.io(rub0)) + K.wave(t, 9, 11), 740 + K.wave(t, 9, 6, 1.4)];
    if (t >= tTrack + 0.75 && t <= tTrack + 2.9) return [K.lerp(A[0] - 32, A[0] + 42, K.ease.io(rubA)) + K.wave(t, 9, 10), A[1] + K.wave(t, 9, 6, 1.4)];
    if (t >= tBash - 0.45 && t <= tCapt - 0.25) return [K.lerp(B[0] - 32, B[0] + 36, K.ease.io(rubB)) + K.wave(t, 9, 10), B[1] + K.wave(t, 9, 6, 1.4)];
    const rubV = K.env(t, tRub - 0.5, tRub + 0.6, 0.25);
    const wp = [
      [cEr + 1.55, SQ[16][0], SQ[16][1]], [cEr + 1.55 + 0.7, R[0], R[1] + 6],
      [tPencil - 1.05, R[0], R[1] + 6], [tPencil - 0.45, 505, 740],
      [tPencil + 1.15, 640, 740], [tPencil + 1.75, R[0] + 30, R[1] + 6],
      [tTrack + 0.15, R[0] + 30, R[1] + 6], [tTrack + 0.75, A[0] - 32, A[1]],
      [tTrack + 2.9, A[0] + 42, A[1]], [tTrack + 3.4, A[0] + 60, A[1] + 12],
      [tBash - 1.05, A[0] + 80, A[1] + 12], [tBash - 0.45, B[0] - 32, B[1]],
      [tCapt - 0.25, B[0] + 36, B[1]], [tCapt + 0.3, B[0] + 40, B[1] + 16],
      [cRem + 0.5, B[0] + 40, B[1] + 16], [cRem + 1.7, V[0], V[1]],
    ];
    if (t < wp[0][0]) return [R[0], R[1]];
    for (let i = 0; i < wp.length - 1; i++) {
      const a = wp[i], b = wp[i + 1];
      if (t >= a[0] && t < b[0]) { const k = K.io(t, a[0], b[0] - a[0], 'io'); return [K.lerp(a[1], b[1], k), K.lerp(a[2], b[2], k)]; }
    }
    // at the valley edge: rubs against the edge and stops; never past it
    return [Math.min(V[0] - 10 + K.wave(t, 9, 12) * rubV + 10 * (1 - rubV), V[0] + 4), V[1] + K.wave(t, 9, 5, 1.4) * rubV];
  }
  const W = work();
  const rubbing = (t >= tPencil - 0.45 && t <= tPencil + 1.15) || (t >= tTrack + 0.75 && t <= tTrack + 2.9) ||
    (t >= tBash - 0.45 && t <= tCapt - 0.25) || K.env(t, tRub - 0.5, tRub + 0.6, 0.25) > 0.3;

  // ---------------------------------------------------------------- beats
  const card1 = K.io(t, cOnly + 0.15, 0.6, 'out') * (1 - K.io(t, cRem - 0.35, 0.5));   // S117 card
  const stationA = 1 - K.clamp(card1 * 1.4);                                             // station hides under it
  const markA = K.io(t, cOnly + 0.35, 0.6, 'out');
  const handK = K.io(t, cOnly + 0.9, 0.6, 'out') * (1 - K.io(t, cRem - 0.4, 0.5));
  const markB = K.seg(t, cOnly + 1.5, cOnly + 2.4);
  const aGone = K.io(t, tTrack + 2.7, 0.4);            // A wiped: the check appears
  const aOut = K.io(t, cRem - 0.4, 0.5);                 // A's leftovers leave before the S101 card
  const bRing = K.io(t, tCapt - 0.1, 0.6, 'out');
  const gitGlow = K.env(t, tRepl - 0.2, cRem - 0.2, 0.4);
  const card2 = K.io(t, cRem + 0.6, 0.6, 'out');
  const dbK = K.io(t, tRemS - 0.1, 0.5, 'out'), depK = K.io(t, tDep - 0.1, 0.5, 'out');
  const pushGlow = K.env(t, tPush - 0.1, tPush + 1.6, 0.4);
  const rewindLbl = K.io(t, tBuilt, 0.5) * (1 - K.io(t, cOnly + 0.2, 0.5));

  K.bg();
  M.sheet(t);
  M.valley({ alpha: 0.4 + 0.6 * stationA });
  M.mainPath();
  M.trail(L.side, { kind: 'side' });
  M.back(X1, Y, X2, Y, { alpha: 0.6 });
  M.back(X2, Y, MX, Y, { alpha: 0.6, bend: -46 });
  M.stone(X1, Y, { id: id.home, glow: 0.7 * gitGlow });
  M.stone(X2, Y, { id: id.about, glow: 0.7 * gitGlow });
  M.stone(c1[0], c1[1], { id: id.contact, idSide: 'above', glow: 0.7 * gitGlow });
  M.stone(c2[0], c2[1], { id: id.phone, idSide: 'above', glow: 0.7 * gitGlow });
  M.stone(MX, Y, { id: id.merge, glow: 0.7 * gitGlow });
  M.signFor('feature/contact', c2[0], c2[1], { h: 96 });
  M.signFor('main', MX, Y, { lantern: 1, t });

  // the station across the valley (the git remote: pushed stones only; the eraser never reaches it). While the S117
  // card covers it, the station is re-laid compact (same width, shorter, roof inside the sheet) so the remote
  // systems get their own boxes under it, apart from the git remote.
  const compact = t >= cOnly + 1;
  const st = M.station(t, {
    alpha: stationA, solid: 1, ...(compact ? { y: 250, h: 250 } : {}),
    stones: [{ id: id.home, glow: pushGlow }, { id: id.about, glow: pushGlow }, { id: id.merge, glow: pushGlow }],
  });
  // remote systems: a database and a deployment, each in its own small box, NOT inside the git remote's card
  const RS = { y: 566, h: 104, boxes: [[1384, 150, 'database', 'server', dbK], [1592, 168, 'deployment', 'globe', depK]] };
  const rsHit = K.env(t, tRub - 0.3, tRub + 1.0, 0.3);   // they stay lit while the eraser is stopped at the edge
  if (compact && stationA > 0.01) {
    K.layer(stationA * dbK, () => K.text('REMOTE SYSTEMS', 1570, RS.y - 22, { font: 'ui', weight: 600, size: 26, tracking: 2, color: C.strong, align: 'center' }));
    RS.boxes.forEach(([bx, bw, lbl, ic, k]) => {
      if (k <= 0.002) return;
      K.layer(stationA * k, () => K.at(0, (1 - K.ease.out(k)) * 10, 1, 0, () => {
        K.card(bx, RS.y, bw, RS.h, { r: 16, fill: K.mixColor(C.tile, C.head, 0.05 * rsHit), stroke: K.mixColor(C.line2, C.head, 0.5 * rsHit), glow: 0.4 * rsHit });
        K.icon(ic, bx + bw / 2, RS.y + 34, 34, { color: C.strong, w: 2.4 });
        K.text(lbl, bx + bw / 2, RS.y + 82, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
      }));
    });
  }

  // ---------------------------------------------------------------- the squiggle (drawn, then rubbed out)
  const g = K.ctx();
  const ex0 = rub0 > 0 ? K.lerp(505, 640, K.ease.io(rub0)) + 6 : -1;
  if (drawK > 0 && ex0 < 655) {
    g.save(); g.beginPath(); g.rect(ex0, 0, 2000, 1080); g.clip();
    K.path(SQ, { k: drawK, head: false, color: C.head, w: 4, tension: 0.5 });
    g.restore();
  }

  // ---------------------------------------------------------------- mark A: Claude's file edit (gold ink)
  if (markA > 0) {
    const exA = rubA > 0 ? K.lerp(A[0] - 32, A[0] + 42, K.ease.io(rubA)) + 4 : -1;
    K.layer(markA * (1 - aOut), () => {
      if (exA < A[0] + 42) {
        g.save(); g.beginPath(); g.rect(exA, 0, 2000, 1080); g.clip();
        K.icon('file', A[0], A[1], 56, { color: C.head, w: 2.8 });
        K.line(A[0] - 14, A[1] + 2, A[0] + 12, A[1] + 2, { color: C.head, w: 3 });
        K.line(A[0] - 14, A[1] + 12, A[0] + 6, A[1] + 12, { color: C.head, w: 3 });
        g.restore();
      }
      if (aGone > 0) K.layer(aGone, () => K.icon('check', A[0], A[1], 40, { color: C.head, w: 3.4 }));
      K.text("Claude's file edits", A[0], A[1] - 56, { font: 'ui', weight: 600, size: 26, color: C.head, align: 'center', alpha: 1 - 0.35 * aGone });
    });
  }

  // ---------------------------------------------------------------- mark B: a file only Bash / another program touched
  const H = [1110, 852];                                  // the other hand: a terminal tile
  if (handK > 0) K.layer(handK, () => {
    K.at(0, (1 - K.ease.out(handK)) * 30, 1, 0, () => K.iconTile('terminal', H[0], H[1], 64, { color: C.strong, stroke: C.line2 }));
  });
  if (markB > 0 || handK > 0) {
    const drawLine = K.env(t, cOnly + 1.3, cOnly + 3.0, 0.3) * handK;
    if (drawLine > 0) K.line(H[0] - 22, H[1] - 30, B[0] + 22, B[1] + 22, { k: K.seg(t, cOnly + 1.2, cOnly + 1.6), color: C.strong, w: 2.5, dash: [5, 8], alpha: 0.6 * drawLine });
    K.layer(K.clamp(markB * 1.5), () => {
      g.save(); g.beginPath(); g.rect(B[0] - 40, B[1] - 40, 80 * markB, 80); g.clip();
      K.icon('file', B[0], B[1], 56, { color: C.strong, w: 2.8 });
      K.line(B[0] - 14, B[1] + 2, B[0] + 12, B[1] + 2, { color: C.strong, w: 3 });
      K.line(B[0] - 14, B[1] + 12, B[0] + 6, B[1] + 12, { color: C.strong, w: 3 });
      g.restore();
      K.text('a file only Bash or', B[0], B[1] - 86, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
      K.text('another program touched', B[0], B[1] - 54, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
    });
    if (bRing > 0) K.ring(B[0], B[1], 42, 42, bRing, { color: C.strong, w: 2.5, rot: 0 });
  }

  // ---------------------------------------------------------------- the guide with its pen, then the eraser
  // the eraser is drawn here at 1.5x (M.guide's built-in eraser is fixed at s 1 and read too small next to the
  // tile); the guide steps back 36 px so the longer block still runs from its hand to the work point.
  const ES = 1.5, back = 36 * K.io(t, tBuilt, 0.4);
  const gx = W[0] - OX - back, gy = W[1] + OY;
  const gd = M.guide(t, gx, gy, {
    tool: toolEraser ? 'none' : 'pen', penTo: [W[0], W[1]], scribble: t >= cEr + 0.15 && t <= cEr + 1.55 ? 1 : 0, bob: false,
  });
  if (toolEraser) {
    const hx = gx + 84 * 0.42, hy = gy + 84 * 0.18;
    M.eraser(W[0], W[1], { ang: Math.atan2(W[1] - hy, W[0] - hx), s: ES });
  }
  const tip = toolEraser ? W : gd.tip;
  if (rubbing) {                                          // eraser crumbs under the rubbing end
    const rnd = K.rng(77 + Math.floor(t * 6));
    g.save(); g.fillStyle = C.paperShade;
    for (let i = 0; i < 9; i++) { g.globalAlpha = 0.65; g.beginPath(); g.ellipse(tip[0] + (rnd() - 0.5) * 80, tip[1] + 22 + rnd() * 28, 3.5 + rnd() * 4, 2.2 + rnd() * 2, rnd() * 3, 0, 7); g.fill(); }
    g.restore();
  }
  if (rewindLbl > 0) K.layer(rewindLbl, () => K.pill('rewind · checkpoints', L.guide[0] + 205, 843, { size: 26, color: C.head, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.5) }));

  // the walker: reads what the eraser could not take, then the station
  const lookB = K.io(t, tCapt - 0.3, 0.5) * (1 - K.io(t, cRem + 0.4, 0.5));
  const lookS = K.io(t, cRem + 1.0, 0.6);
  const look = lookS > 0.01 ? [st.slots[1][0], st.slots[1][1] + 30] : [B[0] + 30, B[1] + 30];
  M.walker(t, L.walker[0], L.walker[1], {
    look, sightK: lookS > 0.01 ? 0 : lookB, sightAlpha: 0.4 + 0.5 * lookB,   // no sight line through the remote-systems boxes
  });

  // the eraser meets the valley edge and stops: a short stop bar at the edge, pulsing when it rubs there
  const stopK = K.io(t, cRem + 1.6, 0.4, 'out'), stopP = K.env(t, tRub - 0.5, tRub + 0.6, 0.25);
  if (stopK > 0) {
    const sx = V[0] + 30;
    K.line(sx, V[1] - 44, sx, V[1] + 44, { k: stopK, color: C.accent, w: 4, alpha: 0.55 + 0.45 * stopP });
    if (stopP > 0) K.layer(0.45 * stopP, () => K.ring(sx, V[1], 34, 52, 1, { color: C.accent, w: 2, rot: 0 }));
  }

  // ---------------------------------------------------------------- cards
  if (card1 > 0.002) K.layer(card1, () => K.at(0, (1 - K.ease.out(K.io(t, cOnly + 0.15, 0.6))) * 16, 1, 0, () => {
    M.dated(L.cards.x, L.cards.y, L.cards.w, {
      eyebrow: 'Anthropic · Best practices for Claude Code · ' + M.READ, quote: true, size: 28,
      body: "Checkpoints only track changes made through Claude's file editing tools. Changes made through Bash commands or external processes are not captured. This isn't a replacement for git.",
    });
  }));
  if (card2 > 0.002) K.layer(card2, () => K.at(0, (1 - K.ease.out(card2)) * 16, 1, 0, () => {
    M.dated(150, 640, 600, {
      eyebrow: 'Anthropic · How Claude Code works · ' + M.READ, quote: true, size: 28,
      body: "Actions that affect remote systems (databases, APIs, deployments) can't be checkpointed",
    });
  }));
});
