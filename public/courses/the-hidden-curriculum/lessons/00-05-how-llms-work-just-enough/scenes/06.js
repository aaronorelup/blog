/* 06 — Sounding right is not being right.
   The desk rises (M.layout.high) so the floor under it shows. The floor is "what the model has" (never on the desk):
   - [[no-library]] a ghost shelf (not there), crossed out on "There isn't one"; a dashed globe on "search tool".
   - [[trained]] shelf and globe leave; gold hops draw tile to tile along the row, left to right, under the cream label
     "which tiles follow which"; pill "patterns, not a library" on "which"; then, echoing 01, a gold "sounds right"
     pill and a hollow dashed "is right?" pill whose dashed check never fills ("no built-in check").
   - [[confident]] the empty Source slot pulses ("the fact isn't on the desk"); on "lays" Smith / (2019) / p. 42 fly
     one by one out of the "sounds right" pill into the slot (04's landing motion), calm and 'hot'.
     "Often that's right": a soft floor row Capital of France: Paris with a gold tick, briefly.
     "When it isn't": a terracotta ? beside the citation; "hallucination": a terracotta pill names it over the
     citation, the three tiles turn terracotta with a hairline crack; "confident": pill "confident wrong guess" under the desk.
   - [[specifics]] four invented specimens fan out on the floor, each ringed.
   - [[cutoff]] specimens dim to 0.35; a "what training saw" timeline draws under the desk with a cutoff tick;
     past it a faded dashed "new release" tile and a terracotta ? (after the cutoff = a guess).
   No 'back' in this scene. */
SCENE('06', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- beats (local seconds; fallbacks match the narrated timings)
  const cNo = S.cue('no-library', 2.03), cTrain = S.cue('trained', 11.23), cConf = S.cue('confident', 21.2);
  const cSpec = S.cue('specifics', 37.81), cCut = S.cue('cutoff', 43.53);
  const wNone = S.find('There', 0, 4.84), wSearch = S.find('search', 0, 7.94);
  const wWhich = S.find('which', 1, 14.4), wSound = S.find('sounding', 0, 17.28), wCheck = S.find('check', 0, 19.66);
  const wFact = S.find('fact', 0, 21.58), wLays = S.find('lays', 0, 25.37);
  const wOften = S.find('Often', 0, 30.52), wIsnt = S.find("isn't", 2, 32.42), wHall = S.find(/^hallucination/i, 0, 33.83);
  const wConfW = S.find(/^confident/i, 0, 35.5);
  const wSpec = [S.find('citations', 0, 39.87), S.find('version', 0, 40.7), S.find('file', 0, 41.48), S.find('package', 0, 42.16)];
  const wTrainCut = S.find(/^cutoff/i, 0, 45.41), wSnap = S.find('snapshot', 0, 46.51), wGuess = S.find('guess', 1, 48.59);

  // ---- the desk rises from the standard spot (05's end) to the high spot
  const rise = K.io(t, 0.3, 0.8);
  const R = M.lerpRect(M.DESK, M.layout.high, rise);
  M.eyebrow('WHERE THE PICTURE BREAKS', { alpha: K.io(t, 0.2, 0.6) });

  // a hollow dashed pill: what is NOT there (soft / ghost colour)
  const ghostPill = (s, x, y, a) => {
    const size = 26, w = K.measure(s, { ...M.type.label }) + size * 1.6, h = size * 1.9, g = K.ctx();
    K.layer(a, () => {
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.setLineDash([7, 7]);
      K.rr(x - w / 2, y - h / 2, w, h, h / 2); g.fillStyle = K.rgba(C.tile, 0.5); g.fill(); g.stroke(); g.restore();
      K.text(s, x, y + size * 0.34, { ...M.type.label, color: C.soft, align: 'center' });
    });
    return w;
  };

  // ================= the floor under the desk (drawn first) =================
  const FLOOR = 800;   // specimen row
  const PILLY = 668;   // the one floor pill at a time
  // ---- the ghost library (not there): a dashed cabinet of books, then crossed out; gone once "training" is said
  const shelfK = K.io(t, cNo + 0.2, 0.7) * (1 - K.io(t, cTrain - 0.1, 0.6));
  const shelfDim = K.lerp(1, 0.4, K.io(t, wNone + 0.6, 0.8));
  if (shelfK > 0) K.layer(shelfK, () => {
    K.layer(0.55 * shelfDim, () => {
      const g = K.ctx();
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.setLineDash([8, 9]);
      K.rr(780, 728, 360, 140, 18); g.stroke(); g.restore();
      [840, 900, 960, 1020, 1080].forEach((x) => K.icon('book', x, 789, 58, { color: C.soft, w: 3 }));
      K.line(800, 831, 1120, 831, { color: C.soft, w: 3 });
    });
    const xk = K.io(t, wNone, 0.5);
    if (xk > 0) K.at(960, 798, 0.8 + 0.2 * xk, 0, () => K.icon('cross', 0, 0, 150, { color: C.soft, w: 6, alpha: xk * K.lerp(1, 0.7, K.io(t, wNone + 0.6, 0.8)) }));
  });
  // ---- a search tool: only if the app adds it (dashed, soft)
  const gk = K.io(t, wSearch, 0.6) * (1 - K.io(t, cTrain - 0.1, 0.6));
  if (gk > 0) K.layer(gk, () => K.at(0, (1 - gk) * 10, () => {
    const g = K.ctx(), s = 96, x = 1560, y = 740;
    g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.setLineDash([7, 7]);
    K.rr(x - s / 2, y - s / 2, s, s, s * 0.28); g.fillStyle = K.rgba(C.tile, 0.35); g.fill(); g.stroke(); g.restore();
    K.icon('globe', x, y, s * 0.62, { color: C.soft, w: 3 });
    K.text('only if the app adds it', x, y + 96, { ...M.type.label, color: C.soft, align: 'center' });
  }));

  // ---- floor pills, one idea at a time
  const patK = K.io(t, wWhich, 0.5) * (1 - K.io(t, wSound - 0.35, 0.4));
  if (patK > 0) K.pill('patterns, not a library', 960, PILLY + (1 - patK) * 10, { size: 26, alpha: patK, color: C.strong });
  // echo of 01: a gold "sounds right" and a hollow "is right?" whose check never fills
  // the "is right?" row is laid out as one centred group: [ ] is right?  no built-in check
  const IRW = K.measure('is right?', { ...M.type.label }) + 26 * 1.6, NCW = K.measure('no built-in check', { ...M.type.label });
  const BOX = 40, grpW = BOX + 18 + IRW + 24 + NCW, gx0 = 960 - grpW / 2;
  const SR = { x: gx0 + BOX + 18 + IRW / 2, y: PILLY }, IR = { x: SR.x, y: PILLY + 64 };
  const srK = K.io(t, wSound - 0.1, 0.5) * (1 - K.io(t, wLays + 1.3, 0.5));
  const irK = K.io(t, wSound + 0.5, 0.5) * (1 - K.io(t, cConf + 0.2, 0.5));
  if (irK > 0) {
    const iy = IR.y + (1 - irK) * 10;
    ghostPill('is right?', IR.x, iy, irK);
    // the built-in check: an empty checkbox that never gets ticked, named on "check"
    const ck = K.io(t, wCheck - 0.1, 0.5);
    if (ck > 0) K.layer(irK * ck, () => {
      const g = K.ctx(), bx = gx0 + BOX / 2;
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 3;
      K.rr(bx - BOX / 2, iy - BOX / 2, BOX, BOX, 8); g.fillStyle = K.rgba(C.tile, 0.6); g.fill(); g.stroke(); g.restore();
      K.text('no built-in check', IR.x + IRW / 2 + 24, iy + 26 * 0.34 + (1 - ck) * 6, { ...M.type.label, color: C.accent });
    });
  }
  if (srK > 0) K.pill('sounds right', SR.x, SR.y + (1 - K.io(t, wSound - 0.1, 0.5)) * 10, { size: 26, color: C.head, stroke: C.gold, alpha: srK, glow: 0.25 * K.io(t, wLays - 0.4, 0.4) });

  // "Often that's right": a quick, true pick from the same patterns, with a gold tick
  const okK = K.io(t, wOften - 0.15, 0.45) * (1 - K.io(t, wIsnt - 0.3, 0.45));
  if (okK > 0) {
    const Q = M.flow(['Capital', 'of', 'France:', 'Paris'], 940, { align: 'center' });
    K.layer(okK * 0.9, () => {
      Q.forEach((p, i) => M.tile(p.s, p.x, PILLY + 30 + (1 - okK) * 10, { tone: i === 3 ? 'hot' : 'soft', glow: i === 3 ? 0.25 : 0 }));
      const L = Q[3]; K.icon('check', L.x + L.w / 2 + 44, PILLY + 30, 44, { color: C.head, w: 5, alpha: K.io(t, wOften + 0.25, 0.4) });
    });
  }
  // the guess named: "confident wrong guess"
  const confK = K.io(t, wConfW - 0.1, 0.5) * (1 - K.io(t, cCut, 0.5));
  if (confK > 0) K.pill('confident wrong guess', 960, PILLY + (1 - confK) * 8, { size: 30, color: C.accent, stroke: C.accent, alpha: confK });

  // ---- specimens: where hallucinations show (all invented on purpose)
  const specs = ['citation', 'v4.2.1', 'C:\\project\\config.yaml', 'fastjsonx'];
  // own rings: an ellipse that clears the tile's corners even on the wide path tile
  const RY = 64, cornerY = 40;
  const ws = specs.map((s) => M.tileW(s)), rxs = ws.map((w) => Math.max(w / 2 + 24, (w / 2) / Math.sqrt(1 - (cornerY / RY) ** 2)));
  const span = rxs.reduce((p, q) => p + 2 * q, 0) + 24 * (specs.length - 1);
  let acc = 960 - span / 2;
  const SX = rxs.map((rx) => { const x = acc + rx; acc += 2 * rx + 24; return x; });
  const dimS = K.lerp(1, 0.35, K.io(t, cCut, 0.6));
  specs.forEach((s, i) => {
    const k = K.io(t, wSpec[i] - 0.1, 0.5); if (k <= 0) return;
    const rk = K.io(t, wSpec[i] + 0.35, 0.5), x = K.lerp(960, SX[i], k);
    M.tile(s, x, FLOOR, { alpha: k * dimS });
    if (rk > 0) K.layer(k * dimS, () => K.ring(x, FLOOR + 3, rxs[i], RY, rk, { color: C.accent, w: 4, rot: -0.03 }));
  });

  // ---- what training saw: a timeline under the desk with its cutoff; past it, an unseen release and a guess
  const TY = PILLY, TX0 = 380, TX1 = 1640, CX = 1220, NX = 1420, NW = M.tileW('new release');
  const tl = K.io(t, cCut + 0.3, 0.9);
  const cutK = K.io(t, wTrainCut - 0.4, 0.5), after = K.io(t, wTrainCut + 0.1, 0.6);
  const snap = K.io(t, wSnap, 0.6);
  if (tl > 0) {
    const xEnd = K.lerp(TX0, TX1, tl);
    if (snap > 0) K.glow((TX0 + CX) / 2, TY, 420, C.head, 0.07 * snap);
    K.line(TX0, TY, Math.min(xEnd, CX), TY, { color: C.gold, w: 3, alpha: 0.5 + 0.2 * snap });
    if (xEnd > CX) K.line(CX, TY, Math.min(xEnd, NX - NW / 2 - 12), TY, { color: C.gold, w: 3, alpha: K.lerp(0.5, 0.2, after), dash: after > 0 ? [6, 8] : undefined });
    K.eyebrow('what training saw', TX0, TY - 22, { size: 20, alpha: tl });
  }
  if (cutK > 0) {
    K.line(CX, TY - 28, CX, TY + 28, { color: C.head, w: 3, dash: [5, 6], k: cutK, alpha: 0.9 });
    K.text('training cutoff', CX - 16, TY - 16, { ...M.type.label, color: C.head, align: 'right', alpha: cutK });
  }
  if (after > 0) {
    M.tile('new release', NX, TY + (1 - after) * 10, { tone: 'ghost', alpha: 0.55 * after });
    const qa = K.io(t, wTrainCut + 0.5, 0.5), pulse = 1 + 0.12 * Math.sin(Math.PI * K.seg(t, wGuess, wGuess + 0.5));
    if (qa > 0) K.at(NX + NW / 2 + 46, TY, pulse, 0, () => {
      K.glow(0, 0, 36, C.accent, 0.16 * qa);
      K.icon('question', 0, 0, 40, { color: C.accent, w: 4, alpha: qa });
    });
  }

  // ================= the desk =================
  const d = M.desk(t, R, { rows: 1 });
  const y = d.rowY(1);
  const lead = ['Cite', 'your', 'source.', 'Source:'];
  const fill = ['Smith', '(2019)', 'p. 42'];
  const P = M.flow(lead, d.x0);
  const last = P[P.length - 1], slotX0 = last.x + last.w / 2 + 14;
  const F = M.flow(fill, slotX0);
  const slotW = F[F.length - 1].x + F[F.length - 1].w / 2 - slotX0, slotX = slotX0 + slotW / 2;
  const rowK = K.io(t, 0.7, 0.6);
  // lead-in tiles (the question, the answer's start)
  P.forEach((p, i) => { const k = K.clamp(rowK * 1.6 - i * 0.2); if (k > 0) M.tile(p.s, p.x, y + (1 - k) * 10, { alpha: k }); });

  // which tiles tend to follow which: bold gold hops drawn left to right, under a cream label
  const hopT = (i) => cTrain + 0.5 + i * 0.55;
  const arrA = (1 - 0.65 * K.io(t, cConf, 0.6)) * (1 - K.io(t, wOften - 0.6, 0.5));
  const hops = P.map((p, i) => [p, i < P.length - 1 ? P[i + 1] : { x: slotX0 + F[0].w / 2, w: F[0].w }]);
  if (arrA > 0) hops.forEach(([a, b], i) => {
    const k = K.io(t, hopT(i), 0.5, 'out'), lastHop = i === hops.length - 1;
    if (k > 0) K.arrow(a.x + a.w * 0.12, y - 44, b.x - b.w * 0.12, y - 44, { k, bend: -30, color: C.head, w: 3, alpha: arrA * (lastHop ? 0.75 : 1), headSize: 13, dash: lastHop ? [7, 7] : undefined });
  });
  const lblK = K.io(t, cTrain + 0.4, 0.5) * (1 - K.io(t, cConf - 0.2, 0.5));
  if (lblK > 0) K.text('which tiles follow which', (P[0].x + P[0].w * 0.12 + slotX0 + F[0].w * 0.38) / 2, y - 102 + (1 - lblK) * 8, { ...M.type.label, color: C.strong, align: 'center', alpha: lblK });

  // the empty slot: pulses when "the fact isn't on the desk", then the guess fills it
  const land = (i) => wLays - 0.4 + i * 0.5;                    // fly start of tile i (0.45 s each)
  const landed = (i) => K.io(t, land(i) + M.motion.land - 0.05, 0.1);
  const slotA = rowK * (1 - K.io(t, land(2) + 0.2, 0.3));
  const pulse = K.seg(t, wFact - 0.2, wLays - 0.4) > 0 && t < wLays - 0.4 ? Math.pow(Math.sin(Math.PI * 2 * (t - (wFact - 0.2)) / 1.5), 2) : 0;
  if (slotA > 0.01) {
    if (pulse > 0) K.glow(slotX, y, slotW * 0.42, C.strong, 0.08 * pulse);
    M.tile('', slotX, y, { tone: 'ghost', w: slotW, alpha: slotA });
    if (pulse > 0) K.layer(0.7 * pulse * slotA, () => {
      const g = K.ctx(); g.save(); g.strokeStyle = C.strong; g.lineWidth = 2.5; g.setLineDash([7, 7]);
      K.rr(slotX - slotW / 2, y - 34, slotW, 68, 12); g.stroke(); g.restore();
    });
  }
  // the guess: three calm, sure tiles ('hot' on purpose) fly out of "sounds right" into the slot
  const hk = K.io(t, wHall, 0.5);                                // named: a hallucination
  const bob = (i) => K.wave(t, M.motion.bob.speed, M.motion.bob.amp, i * 1.3) * K.io(t, land(2) + 1, 1) * (1 - hk);
  F.forEach((p, i) => {
    const u = K.seg(t, land(i), land(i) + M.motion.land);
    if (u <= 0) return;
    if (u < 1) { M.fly(p.s, SR.x, SR.y, p.x, y, u, { bend: 140, trail: 0.6, alpha: K.clamp(u / 0.2) }); return; }
    const yy = y + bob(i);
    M.tile(p.s, p.x, yy, { tone: 'hot', glow: 0.35 * (1 - hk) });
    if (hk > 0) {
      M.tile(p.s, p.x, yy, { tone: 'wrong', alpha: hk });
      // a hairline crack down the face
      const r = K.rng(31 + i), x0 = p.x + p.w / 2 - 11, pts = [];
      for (let j = 0; j <= 4; j++) pts.push([x0 + (j % 2 ? 3 : -3) + r() * 2, yy - 33 + j * 9]);
      const n = Math.max(1, Math.round(4 * K.io(t, wHall + 0.15, 0.4)));
      const g = K.ctx(); g.save(); g.strokeStyle = C.accent; g.lineWidth = 1.5; g.globalAlpha *= hk * 0.85; g.lineJoin = 'round';
      g.beginPath(); pts.slice(0, n + 1).forEach(([px, py], j) => (j ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke(); g.restore();
    }
  });
  const citeX = (F[0].x - F[0].w / 2 + F[2].x + F[2].w / 2) / 2;
  // "when it isn't": a terracotta question beside the citation
  const qk = K.io(t, wIsnt - 0.15, 0.5);
  if (qk > 0) K.at(F[2].x + F[2].w / 2 + 50, y - (1 - qk) * 8, 1, 0, () => {
    K.glow(0, 0, 44, C.accent, 0.18 * qk);
    K.icon('question', 0, 0, 52, { color: C.accent, w: 4.5, alpha: qk });
  });
  // "hallucination": the word itself, over the citation
  if (hk > 0) K.pill('hallucination', citeX, y - 92 - (1 - hk) * 10, { size: 30, color: C.accent, stroke: C.accent, alpha: hk, fill: '#2A1E22' });
});
