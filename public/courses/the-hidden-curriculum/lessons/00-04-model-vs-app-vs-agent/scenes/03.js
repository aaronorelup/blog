/* 00.04 scene 03: The engine: the model.
   The engine alone on its stand (M.layout.solo, the same drawing 04 picks up), before any car exists.
   Beats: lantern from 02 dissolves into the engine; [[engine]] it lights, a weights file slides out of it;
   "trains" a stream of text pages pours into the weights file and fills it; "runs ... servers" a faint server rack
   draws behind the engine; [[labs]] the engine splits into three engines, one under each lab card, each wired to
   its own card; [[words]] they merge back into the one engine: text in (terracotta, parked on the in-arrow),
   more text out (gold); [[stand]] three crossed ghosts of what an engine lacks: seats, wheel, memory. */
SCENE('03', (t, S) => {
  const C = K.C, L = M.layout.solo, g = K.ctx();
  // fixed "weights" digits for the texture drawn over the engine (deterministic)
  const DIG = (() => { const r = K.rng(404), out = []; for (let i = 0; i < 40; i++) { const v = r() * 2.4 - 1.2; out.push((v < 0 ? '−' : '') + Math.abs(v).toFixed(r() < 0.5 ? 2 : 3)); } return out; })();
  K.bg({ glow: 0.2, glowX: 960, glowY: 520 });

  // ---- timing (cues and spoken words)
  const cE = S.cue('engine', 1.43), cLabs = S.cue('labs', 10.43), cWords = S.cue('words', 16.85), cStand = S.cue('stand', 19.8);
  const wWeights = S.find('weights', 0, 3.66);
  const wTrains = S.find('trains', 0, 6.25), wRuns = S.find('runs', 0, 8.75), wServers = S.find(/^servers/i, 0, 9.49);
  const labT = [S.find('OpenAI', 0, 10.43), S.find('Anthropic', 0, 13.28), S.find('Google', 0, 15.16)];
  const famT = [S.find(/^G(PT)?$/, 0, 11.68), S.find('Claude', 0, 14.32), S.find('Gemini', 0, 15.89)];
  const wText = S.find(/^text$/i, 1, 17.61), wIn = S.find(/^in,?$/i, 1, 18.01), wMore = S.find('more', 0, 18.5);
  const gT = [S.find(/^seats/i, 0, 21.64), S.find(/^wheel/i, 0, 22.49), S.find(/^memory/i, 0, 23.41)];
  const standDim = K.io(t, cStand, 0.6);
  const kSplit = K.io(t, cLabs, 0.7);           // the one engine shrinks to the centre lab slot
  const kMerge = K.io(t, cWords, 0.65);         // and comes back to the stand on [[words]]
  const kLabs = kSplit - kMerge;                // 1 while the three engines are out

  // ---- 02's lantern dissolves into the engine
  const lanA = 0.6 * (1 - K.io(t, -0.35, 0.55));
  if (lanA > 0.002) K.layer(lanA, () => { K.glow(960, 520, 220, C.head, 0.25); K.icon('lantern', 960, 520, 120, { color: C.head }); });

  // ---- eyebrow (gone before the lab cards take the top band)
  K.eyebrow('The model', 960, 152, { align: 'center', alpha: K.io(t, -0.1, 0.6) * (1 - K.io(t, cLabs - 0.5, 0.4)) });

  // ---- "runs it on its servers": a faint rack outline draws behind the engine, gone before the labs
  const rk = K.io(t, wRuns, 0.8) * (1 - K.io(t, cLabs - 0.2, 0.5));
  if (rk > 0.002) K.layer(0.55 * rk, () => {
    const x0 = 712, y0 = 330, w = 496, h = 372;
    K.card(x0, y0, w, h, { r: 18, fill: K.rgba(C.tile, 0.35), stroke: C.line2, shadow: false });
    for (let i = 1; i < 8; i++) {                       // rack units
      const yy = y0 + i * (h / 8);
      K.line(x0 + 14, yy, x0 + w - 14, yy, { color: C.line2, w: 1.5, k: K.clamp(rk * 1.6 - i * 0.07) });
    }
    for (let i = 0; i < 8; i++) {                       // status lights, gold (the lab's machines are on)
      const yy = y0 + (i + 0.5) * (h / 8), on = K.clamp(rk * 2 - i * 0.1);
      g.save(); g.globalAlpha *= on; g.fillStyle = C.gold;
      g.beginPath(); g.arc(x0 + w - 30, yy, 5, 0, Math.PI * 2); g.arc(x0 + 30, yy, 5, 0, Math.PI * 2); g.fill(); g.restore();
    }
    K.text('servers', 960, y0 - 22, { font: 'mono', size: 26, color: C.body, align: 'center', alpha: K.io(t, wServers - 0.1, 0.4) });
  });

  // ---- lab cards along the top, each on its spoken lab; the family name and an arrow to ITS OWN engine on the family name
  const LABS = [['OpenAI', 'GPT'], ['Anthropic', 'Claude'], ['Google', 'Gemini']];
  const SLOT = [0, 1, 2].map((i) => ({ x: 520 + i * 440, y: 500, s: 1.0 }));
  LABS.forEach(([lab, fam], i) => {
    const cx = SLOT[i].x, k = K.io(t, labT[i], 0.6, 'out');
    if (k <= 0) return;
    const dimK = 1 - 0.4 * standDim, fk = K.io(t, famT[i], 0.5);
    // a short straight wire from this card down to this lab's engine; it leaves when the engines merge
    const ak = K.io(t, famT[i], 0.6), wa = (1 - kMerge) * Math.min(1, ak * 4);
    if (wa > 0.002) K.arrow(cx, 272, cx, SLOT[i].y - 70 - 12, { k: ak, color: C.gold, w: 2.5, headSize: 12, alpha: 0.8 * wa });
    K.layer(dimK, () => K.rise(t, labT[i], () => {
      K.card(cx - 170, 170, 340, 90, { r: 22, fill: C.tile, stroke: K.mixColor(C.line2, C.gold, fk * 0.7), shadow: false, glow: 0.25 * fk * (1 - kMerge) });
      const f = { font: 'ui', weight: 600, size: 30 };
      const wl = K.measure(lab, f), wf = K.measure(fam, f), gap = 16, aw = 30, total = wl + gap + aw + gap + wf;
      const x0 = cx - total / 2, by = 226;
      K.text(lab, x0, by, { ...f, color: C.body });
      K.arrow(x0 + wl + gap, by - 10, x0 + wl + gap + aw, by - 10, { k: fk, color: C.soft, w: 2.5, headSize: 10, alpha: Math.min(1, fk * 4) });
      K.text(fam, x0 + wl + gap * 2 + aw, by, { ...f, color: C.head, alpha: fk });
    }));
  });

  // ---- text in, more text out (drawn before the engine so the chips slide into / out of it)
  const pIn = M.ept(L.x, L.y, L.s, 'in'), pOut = M.ept(L.x, L.y, L.s, 'out');
  const flowA = 1 - standDim;
  if (flowA > 0.002 && t > cWords) {
    K.arrow(445, pIn.y, pIn.x - 4, pIn.y, { k: K.io(t, cWords + 0.35, 0.6), color: C.accent, w: 2.5, alpha: 0.6 * flowA });
    K.arrow(pOut.x + 4, pOut.y, 1580, pOut.y, { k: K.io(t, wMore - 0.1, 0.7), color: C.gold, w: 2.5, alpha: 0.6 * flowA });
    // a terracotta pulse carries the text along the arrow into the port on "in" ...
    const uIn = K.seg(t, wIn - 0.1, wIn + 0.55);
    if (uIn > 0 && uIn < 1) {
      const px = K.lerp(620, pIn.x - 6, K.ease.io(uIn)), pa = flowA * Math.min(1, uIn * 6) * (1 - K.seg(uIn, 0.8, 1));
      K.glow(px, pIn.y, 26, C.accent, 0.5 * pa);
      g.save(); g.globalAlpha *= pa; g.fillStyle = C.accent; g.beginPath(); g.arc(px, pIn.y, 7, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // ... while the "text" chip itself stays parked on the in-arrow, so the rest frame reads text -> engine -> more text
    const pk = K.io(t, wText - 0.15, 0.35, 'out');
    if (pk > 0) M.chip('text', 560, pIn.y - 8 * (1 - pk), { kind: 'in', alpha: flowA * pk });
    const uOut = K.ease.out(K.seg(t, wMore - 0.05, wMore + 0.85));
    if (uOut > 0) M.chip('more text', K.lerp(1040, 1450, uOut), pOut.y, { kind: 'out', alpha: flowA });
  }

  // ---- "a huge set of numbers": a legible row of weights under the engine on "numbers" (26 px, ~.75 alpha), held
  //      through "called weights", then on "files" each number flies right into the .bin file (rightmost first)
  const wNums = S.find(/^numbers/i, 0, 2.82), wFiles = S.find(/^files/i, 0, 4.73);
  {
    const NUMS = ['0.021', '−1.07', '0.83', '−0.54', '1.19', '0.36', '−0.92'];
    const f = { font: 'mono', weight: 600, size: 26 }, gap = 30;
    const ws = NUMS.map((n) => K.measure(n, f));
    const total = ws.reduce((a, b) => a + b, 0) + gap * (NUMS.length - 1);
    const rowY = 812, x0 = 960 - total / 2;
    // ellipses at both ends: the row is a tiny window into billions of them
    const ea = 0.7 * K.io(t, wNums + 0.35, 0.4) * (1 - K.io(t, wFiles - 0.1, 0.4));
    if (ea > 0.002) [x0 - gap - 14, x0 + total + gap + 14].forEach((ex) => {
      g.save(); g.globalAlpha *= ea; g.fillStyle = C.soft;
      for (let d = -1; d <= 1; d++) { g.beginPath(); g.arc(ex + d * 11, rowY - 9, 3.2, 0, Math.PI * 2); g.fill(); }
      g.restore();
    });
    let x = x0;
    NUMS.forEach((n, i) => {
      const cx = x + ws[i] / 2; x += ws[i] + gap;
      const a = K.io(t, wNums - 0.1 + i * 0.05, 0.35);
      if (a <= 0) return;
      const t0 = wFiles + (NUMS.length - 1 - i) * 0.06, u = K.seg(t, t0, t0 + 0.8);
      if (u >= 1) return;
      const e = K.ease.io(u);
      // a curve that stays clear of the engine and its stand; drawn before the file, so each number slips in behind it
      // (a cubic: right along the row, up at x 1210 (low enough to pass under the model pill), then in from the file's left side above its .bin badge and label)
      const q = 1 - e, b0 = q * q * q, b1 = 3 * q * q * e, b2 = 3 * q * e * e, b3 = e * e * e;
      const px = b0 * cx + (b1 + b2) * 1210 + b3 * 1400, py = (b0 + b1) * rowY + b2 * 680 + b3 * 528;
      K.text(n, px, py, { ...f, color: C.head, align: 'center', alpha: 0.8 * a * (1 - K.seg(u, 0.7, 1)) });
    });
  }

  // ---- the weights file: slides out of the engine on "weights"; text pages pour into it on "trains" and it fills;
  //      it slides back into the engine after "servers", before the labs
  const fo = K.io(t, wWeights, 0.7), fb = K.io(t, wServers + 0.45, 0.55);
  const FX = 1400, FS = 150, NP = 6, STEP = 0.28;
  if (fo > 0 && fb < 1) {
    const fx = K.lerp(L.x, FX, fo - fb), fa = Math.min(1, fo * 3) * (1 - fb), fs = FS * (1 - 0.35 * fb);
    // pages first, so they disappear behind the file as they land
    for (let j = 0; j < NP; j++) {
      const t0 = wTrains + j * STEP, u = K.seg(t, t0, t0 + 0.95);
      if (u <= 0 || u >= 1) continue;
      const e = K.ease.io(u), p0 = { x: 1790, y: 300 + (j % 2) * 26 }, c = { x: 1610, y: 250 }, p1 = { x: FX, y: L.y - 10 };
      const bx = (1 - e) * (1 - e) * p0.x + 2 * (1 - e) * e * c.x + e * e * p1.x;
      const by = (1 - e) * (1 - e) * p0.y + 2 * (1 - e) * e * c.y + e * e * p1.y;
      K.file(bx, by, K.lerp(80, 44, e), { alpha: fa * Math.min(1, u * 5) * (1 - K.seg(u, 0.8, 1)) });
    }
    K.file(fx, L.y, fs, { ext: 'bin', alpha: fa });
    // fill level: rises a step as each page lands
    let fill = 0;
    for (let j = 0; j < NP; j++) fill += K.io(t, wTrains + j * STEP + 0.8, 0.3) / NP;
    if (fill > 0.002) {
      const w = fs * 0.78, h = fs, x0 = fx - w / 2, y0 = L.y - h / 2, top = y0 + h - fill * h * 0.9;
      g.save(); g.globalAlpha *= fa;
      K.rr(x0, y0, w, h, 10); g.clip();
      g.fillStyle = K.rgba(C.gold, 0.42); g.fillRect(x0, top, w, y0 + h - top);
      g.fillStyle = C.gold; g.fillRect(x0, top - 1.5, w, 3);
      g.restore();
    }
    const na = fa * K.clamp((fx - 1210) / 120);
    if (na > 0.002) K.text('weights', fx, L.y + 75 + 42, { font: 'mono', size: 26, color: C.body, align: 'center', alpha: na });
  }

  // ---- the engines
  const turn = M.spin(t, [{ at: wIn - 0.1, rate: M.motion.busy, d: 0.4 }, { at: wIn + 0.9, rate: M.motion.turn, d: 0.6 }]);
  const lit = 0.3 + 0.7 * K.io(t, cE, 0.6);
  const glow = 0.45 * K.io(t, cE, 0.5) * (1 - 0.55 * K.io(t, cE + 1.6, 1.2))
    + 0.3 * (K.io(t, wIn - 0.1, 0.4) - K.io(t, wIn + 0.9, 0.6));
  // the centre engine: solo -> centre lab slot -> solo
  const kc = K.ease.io(K.clamp(kLabs));
  const P = M.lerpPlace(L, SLOT[1], kc);
  // the two other labs' engines come out from behind it on their lab's name, and slide back behind it on [[words]]
  [0, 2].forEach((i) => {
    const ko = K.io(t, labT[i], 0.8);
    if (ko <= 0 || kMerge >= 1) return;
    const out = M.lerpPlace(P, SLOT[i], ko * (1 - kMerge));
    M.engine(t, out.x, out.y, out.s, {
      turn: turn + i * 0.9, lit, stand: 1,
      alpha: Math.min(1, ko * 2.5) * (1 - kMerge),
    });
  });
  const digK = K.io(t, wWeights, 0.8) * (1 - 0.4 * K.io(t, cWords + 0.6, 0.6)) * (1 - kc);
  M.engine(t, P.x, P.y, P.s, {
    turn, lit, glow: glow * (1 - kc), digits: 0,
    stand: K.io(t, -0.1, 0.8),
    label: 'model', labelK: K.io(t, cE + 0.2, 0.5) * (1 - kc),
    alpha: K.io(t, -0.1, 0.8),
  });
  weights(t, P.x, P.y, P.s, digK);
  // each lab's engine carries its own family name (gold = model) while the three are out
  LABS.forEach(([, fam], i) => {
    const pa = K.io(t, famT[i] + 0.2, 0.5) * (1 - kMerge);
    if (pa > 0.002) K.pill(fam, SLOT[i].x, SLOT[i].y + 136 * SLOT[i].s, { size: 26, stroke: C.gold, color: C.head, alpha: pa });
  });

  // ---- what an engine on its own does not have
  const GH = [['seat', 'seats', 540, 650], ['wheel', 'wheel', 1380, 650], ['memory', 'memory', 960, 846]];
  GH.forEach(([kind, label, x, y], i) => {
    const k = K.io(t, gT[i] - 0.15, 0.5, 'out');
    if (k <= 0) return;
    M.ghost(kind, x, y, {
      k, label,
      cross: K.ease.io(K.seg(t, gT[i] + 0.2, gT[i] + 0.75)),
      alpha: K.lerp(0.85, 0.55, K.io(t, gT[i] + 1.2, 0.8)),
    });
  });

  // Scrolling weights texture drawn over the engine card (M.engine's own o.digits is clipped hard at the card edge and
  // runs under the gears): each glyph fades out near the card edges and around both gears, so nothing is half-cut.
  function weights(t, x, y, s, k) {
    if (k <= 0.002) return;
    const f = { font: 'mono', size: 15 }, cw = K.measure('0', f);
    const BIG = { x: -24, y: 8, r: 46 }, SMALL = { x: 33.3, y: -17.5, r: 34 };   // gear centres (00-shared GEAR) + ~4 px clearance
    const off = (t * 14) % 20, base = Math.floor(t * 14 / 20);
    K.at(x, y, s, 0, () => {
      [[-86, 0], [-32, 2], [30, 1]].forEach(([cx0, col]) => {
        for (let i = 0; i < 9; i++) {
          const yy = -60 + i * 20 - off + 20, cy = yy - 5;
          const str = DIG[(i * [1, 7, 3][col] + col * 5 + base) % DIG.length];
          // a number shows whole or not at all: its alpha is the weakest of its glyphs (edges and gear clearance)
          let a = K.clamp((54 - Math.abs(cy)) / 10);
          for (let c = 0; c < str.length; c++) {
            const gx = cx0 + c * cw + cw / 2;
            a = Math.min(a, K.clamp((84 - Math.abs(gx)) / 6),
              K.clamp((Math.hypot(gx - BIG.x, cy - BIG.y) - BIG.r) / 6),
              K.clamp((Math.hypot(gx - SMALL.x, cy - SMALL.y) - SMALL.r) / 6));
          }
          if (a > 0.01) K.text(str, cx0, yy, { ...f, color: C.soft, alpha: 0.34 * k * a });
        }
      });
    });
  }
});
