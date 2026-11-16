// (the tea room test tests/tea-house-apart/, its js/plan.js: unchanged)
// The take-apart: where every piece of the house is at take-apart progress u (0 whole, 1 fully apart). A pure
// function of u, with nothing carried over from the last frame.
//
// The house opens like a concertina, from the top. The layers leave in order: roof, ceiling, beams, screens,
// walls, furniture, floor. When a layer's turn comes, everything above it rises to make room, and the layer's own
// pieces lift into the space one after another and slide to their places. So the drawing grows steadily upward,
// each piece rests square, and the whole of it is always one object the camera can keep in frame.
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// gap: how far the layer rises off the one below it (metres); out: how far its pieces slide away from the house;
// win: when the layer moves, as a share of the take-apart; span: how much of that window one piece takes.
export const ORDER = ['roof', 'ceiling', 'beams', 'screens', 'walls', 'furniture', 'floor'];
export const TIERS = {
  roof:      { gap: 2.5, out: 1.7, win: [0.00, 0.15], span: 0.62 },
  ceiling:   { gap: 2.3, out: 0,   win: [0.13, 0.22], span: 1 },
  beams:     { gap: 3.0, out: 1.3, win: [0.20, 0.34], span: 0.5 },
  screens:   { gap: 2.8, out: 2.9, win: [0.31, 0.55], span: 0.3 },
  walls:     { gap: 2.6, out: 2.1, win: [0.52, 0.68], span: 0.45 },
  furniture: { gap: 2.3, out: 0,   win: [0.65, 0.87], span: 0.32 },
  floor:     { gap: 1.0, out: 1.2, win: [0.84, 1.00], span: 0.42 },
};

// Works out, once per window shape, when each piece goes and how far. A tall window (a phone) stacks the layers
// higher and spreads them less. pieces: from kit.piece(); each gets t0, t1 (its own moment), rise, slide.
export function plan(pieces, tall) {
  const V = tall ? 1.3 : 1, S = tall ? 0.5 : 1;
  const byName = new Map(pieces.map(p => [p.name, p]));
  const tiers = {};
  pieces.forEach(p => { if (!p.follow) (tiers[p.tier] = tiers[p.tier] || []).push(p); });
  const lead = {};                       // how long a layer's first piece takes: the layers above rise with it
  for (const name of ORDER) {
    const T = TIERS[name], list = tiers[name] || [];
    const seqs = [...new Set(list.map(p => p.seq || 0))].sort((a, b) => a - b);
    const n = seqs.length, a = T.win[0], b = T.win[1], d = n > 1 ? (b - a) * T.span : b - a;
    lead[name] = d;
    list.forEach(p => {
      const i = seqs.indexOf(p.seq || 0);
      p.t0 = n > 1 ? a + (b - a - d) * i / (n - 1) : a;
      p.t1 = p.t0 + d;
      const dir = p.dir || [0, 0], al = p.along || [0, 0], out = (p.out !== undefined ? p.out : T.out) * S;
      p.rise = (T.gap + (p.up || 0)) * V;
      p.slide = [dir[0] * out + al[0] * S, dir[1] * out + al[1] * S];
    });
  }
  pieces.forEach(p => {
    if (p.follow) { const f = byName.get(p.follow); p.tier = f.tier; p.t0 = f.t0; p.t1 = f.t1; p.rise = f.rise; p.slide = f.slide; }
    // the lean a piece takes in mid-flight: the leading edge lifts, small things lean more
    const hl = Math.hypot(p.slide[0], p.slide[1]);
    p.tx = hl > 0.05 ? p.slide[0] / hl : 0.6; p.tz = hl > 0.05 ? p.slide[1] / hl : 0.8;
    p.lean = Math.max(p.size.x, p.size.z) > 3 ? 0.035 : 0.09;
    p.k = -1; p.c = -1;
  });
  return { V, S, lead };
}

// Puts every piece where it is at u. First a piece lifts clear, then it slides, and it rests square.
// close: 1 leaves the drawing as planned; less than 1 closes the gaps between its layers by that share (on a
// phone the finished drawing closes up a little to sit, still whole, above the card).
const carry = {};
export function pose(pieces, pl, u, close = 1) {
  let acc = 0;
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const name = ORDER[i], T = TIERS[name];
    carry[name] = acc;
    acc += T.gap * pl.V * close * io(clamp((u - T.win[0]) / pl.lead[name] * 1.22));
  }
  for (const p of pieces) {
    const k = clamp((u - p.t0) / (p.t1 - p.t0)), c = carry[p.tier];
    if (k === p.k && c === p.c && close === p.cl) continue;
    p.k = k; p.c = c; p.cl = close;
    const ky = io(clamp(k * 1.22)), kh = io(clamp((k - 0.22) / 0.78));
    p.obj.position.set(p.home.x + p.slide[0] * kh, p.home.y + c + p.rise * close * ky, p.home.z + p.slide[1] * kh);
    const a = Math.sin(Math.PI * k) * p.lean;
    p.obj.rotation.set(a * p.tz, (p.turn || 0) * kh, -a * p.tx);       // (turn: a piece that ends facing another way)
  }
  return acc;                             // how far the top of the drawing has risen
}
