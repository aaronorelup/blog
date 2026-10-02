/* 00.05 scene 03: Tiles, not letters.
   The desk (the context window) at its standard rect. "Explain unbelievably short words" types in ABOVE the desk
   (the desk only ever holds tokens); on "cut" gold slices cut it and the pieces drop onto the desk as tiles (M.split);
   on "Picture tiles" the tiles hop once in turn. Tiles here are 38 px mono on two rows near the desk's middle so the
   desk reads full; common words stay whole, the long word splits; [[ids]] each tile flips to show it is really a number;
   [[strawberry]] "strawberry" lands on row 2 and snaps into three tiles while the ten letters you asked about
   fade above the desk and are crossed out; [[measure]] the tiles are counted (gold) and the
   "MEASURED IN TOKENS" card rises top-right with reads / writes / costs on their spoken words.
   Exit: after "costs" the rows settle to 04's layout (30 px tiles on d.rowY(0) / d.rowY(1)), card held at 0.8. */
SCENE('03', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- timing (cues and spoken words; fallbacks are the measured local times)
  const cIds = S.cue('ids', 17.93), cStraw = S.cue('strawberry', 22.22), cMeas = S.cue('measure', 31.99);
  const wCut = S.find(/^cut$/i, 0, 2.67), wPicture = S.find(/^Picture$/i, 0, 4.27);
  const wCommon = S.find(/^common$/i, 0, 6.01), wLong = S.find(/^long$/i, 0, 9.0), wEnglish = S.find(/^In$/, 0, 13.26);
  const wThree = S.find(/^three$/i, 0, 15.66), wNumber = S.find(/^number/i, 0, 19.29), wNumbers = S.find(/^numbers/i, 0, 21.22);
  const wR = S.find(/^R$/, 0, 25.7), wStraw = S.find(/^strawberry/i, 0, 26.37);
  const wLetters = S.find(/^letters/i, 0, 23.43), wTen = S.find(/^ten$/i, 0, 30.54), wMeasured = S.find(/^measured/i, 0, 34.61);
  const wRead = S.find(/^read/i, 1, 36.45), wWrite = S.find(/^write/i, 0, 37.87), wCosts = S.find(/^costs/i, 0, 39.13);

  // ---- the desk, standard rect (same as 01's end and 04's start)
  const d = M.desk(t, M.DESK);
  M.eyebrow('TOKENS', { alpha: K.io(t, -0.4, 0.6) });

  // ---- layout: big tiles (38 px) on two rows around the desk's middle; after "costs" they settle to 04's start
  //      (30 px on d.rowY(0) / d.rowY(1)) so the crossfade into 04 shows no jump
  const settle = K.io(t, wCosts + 0.75, 0.8);
  const SZ = K.lerp(38, 30, settle);
  // the 38 px tiles stand on the desk's grooves (tile bottom = groove): row A starts on the middle groove, moves up to the
  // first groove on "strawberry" to make room, row B stands on the third groove
  const upK = K.io(t, cStraw, 0.7);
  const yA = K.lerp(K.lerp(585, 495, upK), d.rowY(0), settle), yB = K.lerp(675, d.rowY(1), settle);
  const TEXT_Y = 318;   // the raw sentence sits above the desk until it is cut

  // ---- row A: "Explain unbelievably short words" types in above the desk, then is cut into tiles that drop onto it
  const PIECES = ['Explain', ' unbeliev', 'ably', ' short', ' words'];
  const SPLIT = [1, 2];                                   // the long word's two tiles
  const IDS = (() => { const r = K.rng(503), len = [4, 5, 2, 4, 4]; return PIECES.map((p, i) => String(Math.floor(r() * 90000 + 10000)).slice(0, len[i])); })();   // arbitrary ids
  const FULL = PIECES.join(''), F = { ...M.type.tile, size: 38 };
  const T0 = 0.1, CH = 0.04;                              // typing: one character every 40 ms from 51 s
  const inK = K.io(t, T0 - 0.1, 0.4);
  const cutK = K.seg(t, wCut, wCut + 0.5);                // gold slices on "cut"
  const dropK = K.io(t, wCut + 0.4, 0.7);                 // pieces become tiles and drop onto the desk on "into tokens"
  // emphasis: "common word ... one tile" dims the split pair; "long or rare word" dims the whole words; "In English" clears
  const emCommon = K.io(t, wCommon, 0.4) * (1 - K.io(t, wLong, 0.4));
  const emLong = K.io(t, wLong, 0.4) * (1 - K.io(t, wEnglish, 0.5));
  const strawDim = K.io(t, cStraw + 0.2, 0.6) * (1 - K.io(t, cMeas, 0.6));
  const rowA = (i) => (1 - 0.6 * (SPLIT.includes(i) ? emCommon : emLong)) * (1 - 0.6 * strawDim);
  // "Picture tiles": each tile hops once, in reading order (a structural beat, not idle motion)
  const hop = (i) => 9 * Math.sin(Math.PI * K.seg(t, wPicture + 0.1 + i * 0.09, wPicture + 0.5 + i * 0.09));
  // counting on "measured": a gold glow passes over each tile in reading order (row A, then row B)
  const countGlow = (n) => { const a = wMeasured - 0.3 + n * 0.12; return 0.9 * Math.sin(Math.PI * K.seg(t, a, a + 0.5)); };

  let P0;
  if (t < wCut) {
    // typing: the plain line grows left to right, a soft caret after it (it is your text, not the model's)
    const n = Math.max(0, Math.min(FULL.length, Math.floor((t - T0) / CH)));
    const x0 = 960 - K.measure(FULL, F) / 2;
    K.layer(inK, () => {
      if (n > 0) K.text(FULL.slice(0, n), x0, TEXT_Y + 38 * 0.35, { ...F, color: C.strong, align: 'left' });
      const cx = x0 + K.measure(FULL.slice(0, n), F) + 4;
      K.line(cx, TEXT_Y - 24, cx, TEXT_Y + 22, { color: C.soft, w: 3, alpha: 1 - K.io(t, wCut - 0.3, 0.3) });
    });
  } else if (dropK < 1) {
    P0 = M.split(PIECES, 960, K.lerp(TEXT_Y, yA, dropK), dropK, { cut: cutK, size: 38 });
  } else {
    P0 = M.flow(PIECES.map((s) => s.trim()), 960, { align: 'center', size: SZ });
    P0.forEach((p, i) => {
      const fa = K.io(t, cIds + 0.05 + i * 0.08, M.motion.flip), fb = K.io(t, wNumbers + 0.45 + i * 0.08, M.motion.flip);
      const cg = countGlow(i);
      if (cg > 0.01) K.glow(p.x, yA, 100, C.head, 0.3 * cg);
      M.tile(p.s, p.x, yA - hop(i), { size: SZ, flip: fa * (1 - fb), id: IDS[i], alpha: rowA(i), glow: cg, color: cg > 0.3 ? C.head : undefined });
    });
  }

  // "one word, two tiles": a soft bracket under unbeliev|ably on "long or rare word"
  if (emLong > 0.002 && P0) {
    const a = P0[1], b = P0[2], xl = a.x - a.w / 2 + 6, xr = b.x + b.w / 2 - 6, yb = yA + 72;
    K.layer(emLong, () => {
      K.line(xl, yb - 10, xl, yb, { color: C.soft, w: 2.5 });
      K.line(xr, yb - 10, xr, yb, { color: C.soft, w: 2.5 });
      K.line(xl, yb, xr, yb, { color: C.soft, w: 2.5, k: K.io(t, wLong + 0.1, 0.5) });
      K.text('one word, two tiles', (xl + xr) / 2, yb + 44, { font: 'ui', weight: 600, size: 28, color: C.body, align: 'center', alpha: K.io(t, wLong + 0.4, 0.4) });
    });
  }

  // ---- caption pills above the desk: "≈ ¾ of a word each" on "three quarters", replaced by "the model sees numbers"
  const PILL_Y = 330;
  const pQ = K.io(t, wThree - 0.1, 0.5) * (1 - K.io(t, wNumber - 0.3, 0.4));
  const pN = K.io(t, wNumber, 0.5) * (1 - K.io(t, cStraw, 0.5));
  if (pQ > 0.002) K.at(0, (1 - pQ) * 10, () => K.pill('≈ ¾ of a word each', 960, PILL_Y, { size: 30, alpha: pQ }));
  if (pN > 0.002) K.at(0, (1 - pN) * 10, () => K.pill('the model sees numbers', 960, PILL_Y, { size: 30, stroke: C.gold, color: C.head, alpha: pN }));

  // ---- the ten letters (above the desk): appear on "letters", the r's brighten on "R", struck through on "not ten letters"
  const LET = 'strawberry'.split(''), BW = 52, BG = 10, LX0 = 960 - (LET.length * BW + (LET.length - 1) * BG) / 2, LY = 318;
  const letGone = K.io(t, cMeas, 0.6);
  const letFade = K.io(t, wTen, 0.6);
  const rK = K.io(t, wR, 0.4) * (1 - letFade);
  LET.forEach((ch, i) => {
    const k = K.stagger(t, wLetters - 0.1, i, 0.05, 0.4) * (1 - letGone);   // "never sees letters": the letters you'd expect
    if (k <= 0.002) return;
    const x = LX0 + i * (BW + BG), isR = ch === 'r';
    K.layer(k * (1 - 0.75 * letFade), () => K.at(0, (1 - k) * 10, () => {
      K.card(x, LY - BW / 2, BW, BW, { r: 10, fill: C.tile, stroke: isR ? K.mixColor(C.line2, C.strong, rK) : C.line2, lw: isR ? 1.5 + rK : 1.5, shadow: false });
      K.text(ch, x + BW / 2, LY + 12, { font: 'mono', weight: 600, size: 34, color: C.strong, align: 'center' });
    }));
  });
  const xK = K.io(t, wTen + 0.1, 0.5);
  if (xK > 0.002) {   // the ten letters struck through: not what the model sees
    const xa = LX0 - 16, xb = LX0 + LET.length * (BW + BG) - BG + 16;
    K.line(xa, LY + 2, xb, LY - 2, { color: C.soft, w: 4, k: xK, alpha: Math.min(1, xK * 3) * (1 - letGone) });
  }

  // ---- row B: "strawberry" lands as plain text on the word, then snaps into three tiles
  const S_PIECES = ['str', 'aw', 'berry'];
  const sIn = K.io(t, wStraw - 0.05, 0.5);
  const sCut = K.seg(t, wStraw + 0.6, wStraw + 1.1), sSplit = K.io(t, wStraw + 1.05, 0.6);
  let PB = null;
  if (sIn > 0.002) {
    if (sSplit < 1) M.split(S_PIECES, 960 - 30 * (1 - sIn), yB + 8 * (1 - sIn), sSplit, { cut: sCut, alpha: sIn, size: 38 });
    else {
      PB = M.flow(S_PIECES, 960, { align: 'center', size: SZ });
      PB.forEach((p, i) => {
        const cg = countGlow(PIECES.length + i);
        if (cg > 0.01) K.glow(p.x, yB, 100, C.head, 0.3 * cg);
        M.tile(p.s, p.x, yB, { size: SZ, glow: cg, color: cg > 0.3 ? C.head : undefined });
      });
    }
  }

  // ---- [[measure]]: the count, then the card with reads / writes / costs on their spoken words
  const cntK = K.io(t, wMeasured + 0.75, 0.5);
  const CNT = { x: K.lerp(1400, 1430, settle), y: yB };
  if (cntK > 0.002) K.at(0, (1 - cntK) * 10, () => K.pill('8 tokens', CNT.x, CNT.y, { size: K.lerp(30, 26, settle), stroke: C.gold, color: C.head, alpha: cntK }));
  const cardK = K.io(t, cMeas + 0.15, 0.7);
  const hold = 1 - 0.2 * K.io(t, wCosts + 0.9, 0.6);
  const MX = 1260, MY = 146, MW = 520;   // card bottom ~406, clear of the desk top (420)
  if (cardK > 0.002) {
    K.at(0, (1 - cardK) * 30, () => {
      const m = M.meter(MX, MY, MW, 'MEASURED IN TOKENS', [
        { label: 'reads', v: 0.9, k: K.io(t, wRead - 0.1, 0.7) },
        { label: 'writes', v: 0.45, k: K.io(t, wWrite - 0.1, 0.7) },
        { label: 'costs', v: 0.65, k: K.io(t, wCosts - 0.1, 0.7) },
      ], { labelW: 130, alpha: cardK * hold });
      // a thin gold thread from the counted tiles up to the card: what is counted is what is measured
      K.arrow(CNT.x + 70, CNT.y - 30, CNT.x + 150, MY + m.h + 12, { k: K.io(t, wRead - 0.3, 0.6), color: C.gold, w: 2, dash: [6, 8], alpha: 0.55 * hold, bend: -10 });
    });
  }
});
