/* 07 — The surprises you'll hit
   The tile desk shrinks from 06's raised spot to the bottom band (M.layout.small, one row, tiles 26). Four surprise
   screens appear above it, two columns (left: chat, error; right: terminal, usage), each on its spoken words, and each
   points back to the desk, which acts out the cause:
   - [[letters]] chat "How many r's in strawberry?" / "There are 2 r's in strawberry." ("2" lands on "two"; "2 r's" underlined in terracotta);
     an arrow drops from the "2" to the desk, where "strawberry" is cut into str | aw | berry. Pill "tiles, not letters".
   - [[forgot]] the desk fills with a conversation (heat rises); the first tile "use Python" (your own first instruction,
     a solid user tile: never 05's pinned hidden "Be brief.", which stays) slides off the left edge on "first instructions" (one soft gold edge pass); then on "error" the card "context window
     exceeded". Pill "the desk filled up".
   - [[fake]] the model lays "fast" "json" "x" (gold: its confident pick) and the terminal runs pip install fastjsonx,
     which fails; on "function" it lays "parse" "_fast" and the terminal calls json.parse_fast(data), which fails too;
     on "doesn't exist" each guessed name gets a terracotta ring and an arrow from the terminal. Pill "a plausible guess".
   - [[bill]] a USAGE card; "input tokens" grows on "input", "output tokens" on "output"; on "re-sent" the whole
     conversation slides back onto the desk, a gold sweep counts it, an arrow carries it up to "input tokens", which grows.
     Pill "the re-sent desk".
   Earlier cards dim to 0.6 while a new one speaks; after the last word all four settle at 0.85. No overshoot. */
SCENE('07', (t, S) => {
  const C = K.C;
  const w = (re, fb) => S.find(re, 0, fb);

  // ---- times (local)
  const cL = S.cue('letters', 2.26), cF = S.cue('forgot', 9.88), cK = S.cue('fake', 18.02), cB = S.cue('bill', 26.03);
  const tTwo = w(/^two/i, 6.44), tTiles = w(/^tiles/i, 7.6);
  const tFirst = w(/^first/i, 11.33), tError = w(/^error/i, 13.24), tDesk = w(/^desk/i, 16.74);
  const tPkg = w(/^package/i, 19.12), tFn = w(/^function/i, 21.12), tDoesnt = w(/^doesn/i, 21.9);
  const tExist = w(/^exist/i, 22.22), tConf = w(/^confident/i, 23.44);
  const tInput = w(/^input/i, 29.04), tOutput = w(/^output/i, 29.63), tResent = w(/^re-?sent/i, 31.36), tCounted = S.find(/^counted/i, 1, 32.76);  // 2nd "counted": "the re-sent desk, counted"
  const tEnd = S.dur || 33.76;

  K.bg();

  // ---- card alphas: full while speaking, 0.6 while a later one speaks, all 0.85 at the end
  const settle = K.io(t, tEnd - 0.7, 0.7);
  const focus = (next) => K.lerp(K.lerp(1, 0.6, K.io(t, next, 0.5)), 0.85, settle);

  M.eyebrow("Surprises you'll hit", { alpha: K.io(t, 0.3, 0.6) });

  // ---- the desk: 06's raised desk moves down into the bottom band
  const R = M.lerpRect(M.layout.high, M.layout.small, K.io(t, 0.15, 0.8));
  // forgot: heat rises as the conversation fills it, eases off when the next surprise starts
  const heat = 0.7 * K.io(t, cF + 0.5, 1.2) * (1 - K.io(t, cK, 0.8));
  const tOff = tFirst + 0.1;                        // "use Python" leaves on "first instructions"
  const edge = Math.sin(Math.PI * K.seg(t, tOff + 0.25, tOff + 0.85));
  const d = M.desk(t, R, { rows: 1, heat, edge, alpha: 0.9 });
  const Y = d.rowY(1), SZ = 26, TOP = Y - SZ * 2.27 / 2;   // tile row centre and top edge

  // ===================================================== 1. letters (left column, top): chat
  const chatA = K.io(t, cL, 0.5) * focus(cF);
  const CH = { x: 120, y: 205, w: 780, h: 240 };
  const reply = 'There are 2 r\'s in strawberry.';
  const tStream = tTwo - 0.55;                    // "2" (third word, 0.25 s per word) lands on "two"
  const cr = M.chat(t, CH.x, CH.y, CH.w, CH.h, [
    { s: 'How many r\'s in strawberry?', who: 'you', k: K.io(t, cL + 0.25, 0.4) },
    { s: reply, who: 'ai', k: K.io(t, tStream - 0.3, 0.3), stream: tStream },
  ], { size: 28, alpha: chatA });
  // where the "2" sits in the ai bubble (see M.chat: bubble 1 is one line, 28 px)
  const cf = { font: 'read', weight: 400, size: 28 };
  const bub2 = cr.y + 16 + (28 * 1.3 + 24) + 12;
  const claimW = K.measure("2 r's", cf);           // the wrong claim "2 r's"
  const twoX = cr.x + 18 + 20 + K.measure('There are ', cf) + claimW / 2, twoY = bub2 + 12 + 28 * 0.95 - 10;
  const letA = K.env(t, cL, cF + 0.1, 0.4);       // the desk's strawberry + arrow live only during this beat
  // a terracotta underline marks the wrong claim (a ring would cut the neighbouring words: the spaces are narrow)
  K.layer(chatA, () => K.mark(twoX - claimW / 2 - 4, twoY + 22, claimW + 8, K.io(t, tTwo + 0.05, 0.45), { color: C.accent, w: 4, alpha: 1 }));
  const SX = 760;
  K.layer(letA, () => {
    K.arrow(twoX + 6, twoY + 36, SX - 40, TOP - 14, { k: K.io(t, tTwo + 0.45, 0.6), bend: 70, color: C.body, w: 2.5, alpha: 0.75 });
    const sk = K.io(t, tTwo + 0.8, 0.4);
    M.split(['str', 'aw', 'berry'], SX, Y, K.io(t, tTiles + 0.5, 0.6), { size: SZ, cut: K.seg(t, tTiles, tTiles + 0.5), alpha: sk });
  });

  // ===================================================== 2. forgot (left column, bottom): the desk fills, an error
  const CONV = ['use Python', 'hi', 'sure', 'step', 'two', 'and', 'then'];
  const AFTER = CONV.slice(1).concat(['next']);
  const fA = K.env(t, cF + 0.4, cK, 0.4);
  if (fA > 0) K.layer(fA, () => {
    const P0 = M.flow(CONV, d.x0, { size: SZ }), P1 = M.flow(AFTER, d.x0, { size: SZ });
    const uOff = K.seg(t, tOff, tOff + 1.3), shift = K.io(t, tOff + 0.55, 0.6);
    // the first instruction slides off the left edge and drops
    const o = M.offEdge(P0[0].x, Y, d.edge, Y + 150, uOff);
    const k0 = K.io(t, cF + 0.5, 0.35);
    M.tile(CONV[0], o.x, o.y + (1 - k0) * 10, { size: SZ, rot: o.rot, alpha: o.alpha * k0 });
    for (let i = 1; i < CONV.length; i++) {
      const k = K.stagger(t, cF + 0.5, i, 0.1, 0.35);
      M.tile(CONV[i], K.lerp(P0[i].x, P1[i - 1].x, shift), Y + (1 - k) * 10, { size: SZ, alpha: k });
    }
    const kn = K.io(t, tOff + 0.95, 0.4);           // the newest message keeps coming in at the right
    M.tile(AFTER[AFTER.length - 1], P1[P1.length - 1].x, Y + (1 - kn) * 10, { size: SZ, alpha: kn });
  });
  M.alert(120, 490, 780, 'context window exceeded', { k: K.io(t, tError, 0.5), alpha: focus(cK) });

  // ===================================================== 3. fake (right column, top): terminal
  // drawn here rather than with K.term: four rows (two calls, two errors) at 26 px need a 32 px line height
  const tmA = K.io(t, cK, 0.5) * focus(cB);
  const TM = { x: 1020, y: 205, w: 780, h: 205 };
  const tr = K.win(TM.x, TM.y, TM.w, TM.h, { kind: 'terminal', title: 'terminal', titleSize: 26, alpha: tmA });
  const tCmd = w(/^installs/i, 18.55), tPipErr = tPkg + 0.45, tFnErr = tDoesnt;
  const TROWS = [
    { at: tCmd, prompt: 'C:\\Users\\you>', cmd: 'pip install fastjsonx', cps: 30 },
    { at: tPipErr, out: 'ERROR: No matching distribution found' },
    { at: tFn - 0.05, prompt: '>>> ', cmd: 'json.parse_fast(data)', cps: 40 },
    { at: tFnErr, out: 'AttributeError: parse_fast' },
  ];
  K.layer(tmA, () => {
    const TS = 26, LH = 32, tx = tr.x + 28;
    const caret = (x, y) => { const g = K.ctx(); g.fillStyle = C.strong; g.fillRect(x + 4, y - TS * 0.8, TS * 0.55, TS); };
    const vis = TROWS.filter((r) => t >= r.at);
    if (!vis.length) {                               // an idle prompt waits for the first command
      const px = tx + K.text(TROWS[0].prompt, tx, tr.y + 40, { font: 'mono', size: TS, color: C.head });
      if (K.caretOn(t)) caret(px, tr.y + 40);
    }
    vis.forEach((r, i) => {
      const y = tr.y + 40 + i * LH;
      if (r.out != null) { K.text(r.out, tx, y, { font: 'mono', size: TS, color: C.accent }); return; }
      let x = tx + K.text(r.prompt, tx, y, { font: 'mono', size: TS, color: C.head });
      x += K.text(K.typed(r.cmd, t, r.at, r.cps), x, y, { font: 'mono', size: TS, color: C.strong });
      const typing = !K.typedDone(r.cmd, t, r.at, r.cps), last = i === vis.length - 1;
      if ((typing || last) && K.caretOn(t)) caret(x, y);
    });
  });
  // on the desk: the model's confident (gold) guesses, each a made-up name built from likely pieces
  const G1 = ['fast', 'json', 'x'], G2 = ['parse', '_fast'];
  const kA = K.env(t, cK + 0.2, cB, 0.4);
  if (kA > 0) K.layer(kA, () => {
    const A = M.flow(G1, 0, { size: SZ }), B = M.flow(G2, 0, { size: SZ });
    const wA = A[2].x + A[2].w / 2, wB = B[1].x + B[1].w / 2, GAP = 110, x0 = 960 - (wA + GAP + wB) / 2;
    M.row(t, G1, x0, Y, { size: SZ, tone: 'hot', k: (i) => K.stagger(t, tCmd + 0.1, i, 0.22, 0.4) });
    M.row(t, G2, x0 + wA + GAP, Y, { size: SZ, tone: 'hot', k: (i) => K.stagger(t, tFn - 0.05, i, 0.22, 0.4) });
    const ring = (gx0, gx1, at, ax) => {
      const gcx = (gx0 + gx1) / 2;
      K.ring(gcx, Y + 2, (gx1 - gx0) / 2 + 36, 52, K.io(t, at, 0.55), { color: C.accent, w: 4, rot: -0.015 });
      K.arrow(ax, TM.y + TM.h + 8, gcx + 30, TOP - 26, { k: K.io(t, at + 0.4, 0.6), bend: -40, color: C.body, w: 2.5, alpha: 0.75 });
    };
    ring(x0, x0 + wA, tDoesnt, 1090);
    ring(x0 + wA + GAP, x0 + wA + GAP + wB, tExist, 1250);
  });

  // ===================================================== 4. bill (right column, bottom): usage meter
  const mA = focus(Infinity);
  const inK = K.lerp(0.6 * K.io(t, tInput, 0.6), 1, K.io(t, tCounted - 0.2, 0.6));
  const MT = { x: 1020, y: 446, w: 780 };          // ~27 px under the terminal's pill (was 2 px)
  const mt = M.meter(MT.x, MT.y, MT.w, 'USAGE', [
    { label: 'input tokens', v: 0.85, k: inK },
    { label: 'output tokens', v: 0.22, k: K.io(t, tOutput, 0.6) },
  ], { labelW: 230, k: K.io(t, cB, 0.5), alpha: mA });
  // the re-sent desk: the whole conversation slides back on, a sweep counts it (gold), it flows up to "input tokens"
  const rA = K.io(t, tResent - 0.6, 0.3);
  if (rA > 0) {
    const P = M.flow(AFTER, d.x0, { size: SZ });
    const sw0 = tResent + 0.35, sw1 = sw0 + 0.8;
    P.forEach((p, i) => {
      const k = K.stagger(t, tResent - 0.5, i, 0.07, 0.45);
      const swx = K.lerp(P[0].x - 60, P[P.length - 1].x + 60, K.ease.sine(K.seg(t, sw0, sw1)));
      const counted = t > sw0 && swx >= p.x;
      M.tile(p.s, p.x + (1 - k) * 60, Y, { size: SZ, alpha: k, tone: counted ? 'hot' : 'plain', glow: counted ? 0.12 : undefined });
    });
    M.sweep(P[0].x - 60, P[P.length - 1].x + 60, Y, K.seg(t, sw0, sw1), { r: 150 });
    // routed outside the card's left edge, ending at the 'input tokens' label (never across the bars)
    const src = P[3];
    K.arrow(src.x + 10, TOP - 8, MT.x + 24, mt.bars[0].y, { k: K.io(t, sw1 - 0.2, 0.6), bend: -46, color: C.head, w: 2.5, alpha: 0.8 * K.lerp(1, 0.7, settle) });
  }

  // ---- pills: each surprise named by the part of the desk that explains it, tagged on its card's bottom-right edge
  const pill = (s, card, a, k) => {
    if (a * k <= 0.002) return;
    const pw = K.measure(s, { font: 'ui', size: 26, weight: 600 }) + 26 * 1.6;
    const below = card.below ? 34 : 0;              // 'below' hangs the pill fully under the card instead of on its edge
    K.layer(a * k, () => K.pill(s, card.x + card.w - 28 - pw / 2, card.y + card.h + below + (1 - k) * 8, { size: 26 }));
  };
  pill('tiles, not letters', CH, focus(cF), K.io(t, tTiles, 0.45));
  pill('the desk filled up', { x: 120, y: 490, w: 780, h: 100 }, focus(cK), K.io(t, tDesk - 0.1, 0.45));
  pill('a plausible guess', TM, focus(cB), K.io(t, tConf, 0.45));
  // hangs fully below its card: it sits right of the desk (x > 1380), where the band is free
  pill('the re-sent desk', { x: MT.x, y: MT.y, w: MT.w, h: mt.h, below: true }, mA, K.io(t, tResent, 0.45));
});
