// 05 — A fuller desk is a worse desk
// The hall desk fills with a pile, accuracy falls well before the ruler is full (context rot); the middle of the
// pile gets missed; then the tidy-up tools: compaction (one summary page), tool results swept off, a sub-agent's
// own fresh desk, and "context engineering". Ends on the 'left' desk (06's opening layout) with a dimmed sub-agent.
SCENE('05', (t, S) => {
  const C = K.C, L = M.layout;
  K.bg();

  // ---- cues (local seconds)
  const cPile = S.cue('pile', 0), cMiddle = S.cue('middle', 15.3), cCompact = S.cue('compact', 19.56);
  const cSweep = S.cue('sweep', 33.47), cSub = S.cue('second-clerk', 36.57), cEng = S.cue('context-eng', 43.48);
  const wWorse = S.find('worse', 1, 4.66), wChroma = S.find('Chroma', 0, 8.48), wRot = S.find('rot', 0, 14.3);
  const wBuried = S.find('buried', 0, 15.8), wMissed = S.find('missed', 0, 18.0);
  const wComp = S.find('Compaction', 0, 22.55), wCode = S.find('Code', 0, 27.4);
  const wAuto = S.find(/auto-compact/i, 0, 29.1), wSlash = S.find('slash', 0, 31.5);
  const wFresh = S.find('fresh', 0, 38.4), wHands = S.find('hands', 0, 41.2);
  const wCtx = S.find('context', 1, 45.85), wLesson = S.find('lesson', 0, 51.0);

  // ---- the desk: hall, shrinking to 06's 'left' layout when the sub-agent's desk needs room
  const kD = K.io(t, cSub, M.motion.grow);
  const D = M.lerpDesk(M.at(L.hall), M.at(L.left), kD);

  // ---- the pile: 30 papers, three of them grey tool results in the left column
  const N = 30, COLS = 10, ROWS = Math.ceil(N / COLS), R = K.rng(5);
  const TOOLS = [0, 10, 20], HI = 15;
  const P = [];
  for (let i = 0; i < N; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    const u = (c + 0.5 + (R() - 0.5) * 0.5) / COLS, v = K.clamp((r + 0.5 + (R() - 0.5) * 0.4) / ROWS);
    P.push({ u, v, rot: (R() - 0.5) * 0.24, lift: (i / N) * 18 });
  }
  const growT0 = cPile + 0.5, growT1 = cPile + 7.0;   // the pile builds while "as it fills ... well before it's full"
  const shownF = K.clamp((t - growT0) / (growT1 - growT0)) * N;
  // compaction: every text paper flies into the summary page, staggered
  const sumAt = (DD) => M.spot(DD, 0.5, 0.42);
  const compT = wComp + 0.1;
  const sumK = K.io(t, compT + 1.0, 0.6, 'out');
  // the middle beat
  const hiK = K.io(t, wBuried, 0.5);
  const ringK = K.io(t, wBuried + 0.2, 0.7) * (1 - K.io(t, wMissed - 0.4, 0.8));
  const dimMid = K.io(t, wMissed - 0.4, 0.8) * (1 - K.io(t, compT - 0.3, 0.5));
  const scan = K.io(t, cMiddle + 0.9, 0.5) * (1 - K.io(t, cMiddle + 2.6, 0.7));

  // ---- ruler and accuracy: the meter falls well before the ruler is full; both recover after compaction
  const pileFrac = K.clamp((t - growT0) / (growT1 - growT0));
  const rulerFill = K.lerp(0.08, 0.46, pileFrac) * (1 - K.io(t, compT, 1.2)) + 0.06 * K.io(t, compT, 1.2);
  const acc = 1 - 0.68 * K.io(t, wWorse - 0.7, 3.2, 'io') + 0.6 * K.io(t, compT + 0.8, 1.2);

  // ---- clerk light: a touch dimmer while the desk is crowded
  const lit = 1 - 0.25 * K.io(t, wWorse - 0.5, 2) + 0.25 * K.io(t, compT + 0.8, 1);

  const st = M.stage(t, { desk: D, lit, ruler: { fill: rulerFill, count: '1M' } });

  // tool-result cards: sweep off the left edge
  const sweepK = (j) => K.io(t, cSweep + 0.9 + j * 0.18, 0.9, 'in');

  // draw the pile (text papers first collapse into the summary)
  for (let i = 0; i < N; i++) {
    const k = K.clamp(shownF - i); if (k <= 0) continue;
    const p = P[i], base = M.spot(D, p.u, p.v);
    let x = base.x, y = base.y - p.lift - (1 - k) * 40, a = k, s = 1, rot = p.rot;
    const isTool = TOOLS.includes(i);
    if (isTool) {
      const sk = sweepK(TOOLS.indexOf(i));
      x = K.lerp(x, D.x0 - 160, sk); a *= 1 - K.clamp((sk - 0.45) / 0.55);
      if (a <= 0) continue;
      M.paper(x, y, { w: 150, h: 100, rot, alpha: a, kind: 'tool', lines: 2 });
      continue;
    }
    const ck = K.io(t, compT + (i / N) * 0.6, 0.7, 'io');
    if (ck > 0) {
      const sp = sumAt(D);
      x = K.lerp(x, sp.x, ck); y = K.lerp(y, sp.y, ck); s = 1 - 0.45 * ck; rot *= 1 - ck;
      a *= 1 - K.clamp((ck - 0.7) / 0.3);
      if (a <= 0) continue;
    }
    const mid = Math.floor(i / COLS) === 1;   // the middle row is the middle of the pile
    const edge = i === HI ? hiK * (1 - 0.6 * dimMid) * (1 - K.io(t, compT - 0.9, 0.5)) : 0;
    const dim = mid ? dimMid * 0.85 : 0;
    K.at(x, y, s, 0, () => M.paper(0, 0, { w: 150, h: 100, rot, alpha: a, edge, dim: i === HI ? dimMid * 0.6 : dim, lines: 3 }));
  }
  // the scan band: the clerk reads the whole pile at once (a soft gold wash), the middle stays dark
  if (scan > 0) M.wash(D, C.head, 0.10 * scan);
  // ring + label on the buried card
  {
    const p = P[HI], b = M.spot(D, p.u, p.v), hx = b.x, hy = b.y - p.lift;
    if (ringK > 0) K.layer(ringK, () => K.ring(hx, hy, 118, 84, K.io(t, wBuried + 0.2, 0.7), { color: C.accent, w: 5 }));
    const lk = K.io(t, wBuried + 0.6, 0.5) * (1 - K.io(t, compT - 0.4, 0.5));
    if (lk > 0) K.pill('lost in the middle', hx, hy - 128, { size: 30, color: C.strong, fill: C.page, stroke: K.rgba(C.accent, 0.7), alpha: lk });
  }

  // the summary page
  if (sumK > 0) {
    const sp = sumAt(D);
    K.at(sp.x, sp.y, 0.85 + 0.15 * sumK, 0, () => M.paper(0, 0, { kind: 'summary', title: 'summary', w: 240, h: 300, alpha: sumK, glow: 0.5 * K.io(t, compT + 1.0, 0.6) * (1 - K.io(t, compT + 2.4, 1)), lines: 6 }));
  }

  // ---- labels, top left: the research tag, then "tidying the desk"
  const outRot = 1 - K.io(t, cCompact - 0.3, 0.5);
  {
    const ek = K.io(t, wChroma - 0.2, 0.5) * outRot;
    if (ek > 0) K.layer(ek, () => K.eyebrow('CHROMA · 2025 · 18 MODELS', 200, 196, { color: C.soft }));
    const pk = K.io(t, wRot - 0.5, 0.5) * outRot;
    if (pk > 0) {
      const w = K.measure('context rot', { font: 'ui', weight: 600, size: 34 }) + 34 * 1.6;
      K.layer(pk, () => K.pill('context rot', 200 + w / 2, 258, { size: 34, color: C.accent, fill: C.page, stroke: K.rgba(C.accent, 0.7) }));
    }
  }
  const tidyK = K.io(t, cCompact, 0.5) * (1 - K.io(t, cEng - 0.4, 0.5));
  if (tidyK > 0) K.layer(tidyK, () => K.eyebrow('TIDYING THE DESK', 200, 196, { color: C.head }));
  // compaction tag under the eyebrow
  const compLab = K.io(t, wComp - 0.1, 0.5) * (1 - K.io(t, cSweep - 0.3, 0.5));
  if (compLab > 0) K.layer(compLab, () => K.text('compaction', 200, 254, { font: 'ui', weight: 600, size: 34, color: C.strong }));
  const sweepLab = K.io(t, cSweep, 0.5) * (1 - K.io(t, cSub - 0.3, 0.5));
  if (sweepLab > 0) K.layer(sweepLab, () => K.text('old tool results swept off', 200, 254, { font: 'ui', weight: 600, size: 34, color: C.strong }));

  const subLab = K.io(t, cSub + 0.2, 0.5) * (1 - K.io(t, cEng - 0.4, 0.5));
  if (subLab > 0) K.layer(subLab, () => K.text('a sub-agent gets a fresh desk', 200, 254, { font: 'ui', weight: 600, size: 34, color: C.strong }));

  // ---- Claude Code terminal strip (top right)
  const termK = K.io(t, wCode - 0.3, 0.5) * (1 - K.io(t, cSweep - 0.2, 0.5));
  if (termK > 0) K.layer(termK, () => {
    const r = K.win(1100, 192, 600, 146, { kind: 'terminal', title: 'claude', titleSize: 26 });
    K.term(r, t, [
      { at: wAuto - 0.1, out: 'auto-compact', color: C.head },
      { at: wSlash - 0.15, cmd: '/compact', cps: 16 },
    ], { prompt: '> ', size: 26, lh: 34, pad: 14, rows: 2 });
  });

  // ---- accuracy meter (right edge, clear of the desk)
  const vk = K.io(t, wWorse - 1.0, 0.5);
  if (vk > 0) K.layer(vk, () => {
    M.vbar(1808, 236, 640, acc, {});
    K.text('accuracy', 1840, 202, { ...M.type.label, color: C.strong, align: 'right' });
  });

  // ---- the sub-agent: its own small fresh desk at right
  const subK = K.io(t, wFresh - 0.5, 0.6) * (1 - 0.5 * K.io(t, cEng + 1.0, 0.8));
  const mx = 1640, my = 690, ms = 0.45;
  if (subK > 0) {
    M.mini(t, mx, my, ms, { alpha: subK });
    K.layer(subK, () => K.text('sub-agent', mx, my + M.MINI.bottom * ms + 52, { ...M.type.label, color: C.strong, align: 'center' }));
  }
  // task out, report back
  const from = M.spot(D, 0.88, 0.38), to = { x: mx - 110, y: my - 20 };
  const lineK = K.io(t, wFresh + 0.4, 0.6) * (1 - K.io(t, cEng, 0.6));
  if (lineK > 0) M.phone(t, from.x + 40, from.y, to.x, to.y, { k: lineK, bend: -30, alpha: 0.9 });
  const goK = K.io(t, wFresh + 0.9, 0.9);
  if (goK > 0 && goK < 1) {
    const x = K.lerp(from.x, mx, goK), y = K.lerp(from.y, my - 30, goK) - Math.sin(goK * Math.PI) * 60;
    M.paper(x, y, { kind: 'note', title: 'task', w: 110, h: 72, alpha: K.clamp(goK * 5) * K.clamp((1 - goK) * 5), lines: 0 });
  }
  const backK = K.io(t, wHands - 0.2, 0.9, 'out');
  if (backK > 0) {
    const land = M.spot(D, 0.8, 0.5);
    const x = K.lerp(mx, land.x, backK), y = K.lerp(my - 30, land.y, backK) - Math.sin(backK * Math.PI) * 70;
    M.paper(x, y, { kind: 'text', title: 'report', w: 160, h: 110, alpha: K.clamp(backK * 4), edge: 0.8 * K.io(t, wHands + 0.6, 0.4) * (1 - K.io(t, cEng, 0.8)), lines: 2 });
  }

  // ---- prompt engineering → context engineering
  const ek = K.io(t, cEng - 0.1, 0.5);
  if (ek > 0) {
    const sw = K.io(t, wCtx - 0.2, 0.6);
    const sz = 34, to2 = { font: 'ui', weight: 600, size: sz };
    const wA = K.measure('prompt engineering', to2) + sz * 1.6, wB = K.measure('context engineering', to2) + sz * 1.6;
    const w = K.lerp(wA, wB, sw);
    K.layer(ek, () => {
      K.card(200, 230, w, sz * 1.9, { r: sz * 0.95, fill: C.page, stroke: K.rgba(C.head, 0.3 + 0.4 * sw), shadow: false, glow: 0.4 * sw });
      K.text('prompt engineering', 200 + w / 2, 230 + sz * 0.95 + sz * 0.34, { ...to2, color: C.soft, align: 'center', alpha: 1 - sw });
      K.text('context engineering', 200 + w / 2, 230 + sz * 0.95 + sz * 0.34, { ...to2, color: C.head, align: 'center', alpha: sw });
      K.layer(K.io(t, wCtx + 1.6, 0.6), () => K.eyebrow('choosing what goes on the desk', 200, 196, { color: C.soft }));
    });
  }
  const shK = K.io(t, wLesson - 0.6, 0.6);
  if (shK > 0) M.shelf('The Machine', L.shelf.x, L.shelf.y, { k: shK });
});
