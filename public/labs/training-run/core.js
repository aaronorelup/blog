// A small next-note model and its trainer. No dependencies: the same file runs in Node and in a browser.
//
// The model reads the last notes of a tune on an eighth-note grid and gives a probability to each thing that could
// come next: one of P pitches, HOLD (keep the last note ringing) or REST. It is a one-hidden-layer network with
// direct input-to-output connections (Bengio et al. 2003), trained by plain minibatch gradient descent.
//
// Every number is a 64-bit float and every exp/log/tanh below is built from + - * / only, so a run gives the same
// bits in Node, Chrome, Firefox and Safari. That is what lets a browser re-run check itself against a published log.

// ---------- deterministic maths ----------
const POW2 = new Float64Array(2200); // POW2[k + 1100] = 2^k, exact
{
  let v = 1;
  for (let k = 0; k <= 1023; k++) { POW2[k + 1100] = v; v *= 2; }
  v = 1;
  for (let k = 0; k >= -1074; k--) { POW2[k + 1100] = v; v *= 0.5; }
}
const LN2_HI = 6.93147180369123816490e-01;
const LN2_LO = 1.90821492927058770002e-10;
const INV_LN2 = 1.44269504088896338700e+00;

export function dexp(x) {
  if (x !== x) return x;
  if (x > 709.78) return Infinity;
  if (x < -745.2) return 0;
  const k = Math.round(x * INV_LN2);
  const r = (x - k * LN2_HI) - k * LN2_LO; // |r| <= ln2/2
  // Taylor to r^13: error under 1e-17 on this range
  let p = 1 / 6227020800;
  p = p * r + 1 / 479001600;
  p = p * r + 1 / 39916800;
  p = p * r + 1 / 3628800;
  p = p * r + 1 / 362880;
  p = p * r + 1 / 40320;
  p = p * r + 1 / 5040;
  p = p * r + 1 / 720;
  p = p * r + 1 / 120;
  p = p * r + 1 / 24;
  p = p * r + 1 / 6;
  p = p * r + 0.5;
  p = p * r + 1;
  p = p * r + 1;
  if (k > 1000) return p * POW2[1000 + 1100] * POW2[k - 1000 + 1100];
  if (k < -1000) return p * POW2[-1000 + 1100] * POW2[k + 1000 + 1100];
  return p * POW2[k + 1100];
}

const F64 = new Float64Array(1);
const U32 = new Uint32Array(F64.buffer);
const HI = (() => { F64[0] = 1; return U32[1] === 0x3ff00000 ? 1 : 0; })(); // which half holds the exponent

export function dlog(x) {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  let e = 0;
  if (x < 2.2250738585072014e-308) { x *= 18014398509481984; e = -54; } // subnormal: scale by 2^54
  F64[0] = x;
  e += ((U32[HI] >>> 20) & 0x7ff) - 1023;
  U32[HI] = (U32[HI] & 0x000fffff) | 0x3ff00000; // mantissa in [1, 2)
  let m = F64[0];
  if (m > 1.4142135623730951) { m *= 0.5; e += 1; }
  const s = (m - 1) / (m + 1); // |s| < 0.1716
  const s2 = s * s;
  let p = 1 / 23;
  p = p * s2 + 1 / 21;
  p = p * s2 + 1 / 19;
  p = p * s2 + 1 / 17;
  p = p * s2 + 1 / 15;
  p = p * s2 + 1 / 13;
  p = p * s2 + 1 / 11;
  p = p * s2 + 1 / 9;
  p = p * s2 + 1 / 7;
  p = p * s2 + 1 / 5;
  p = p * s2 + 1 / 3;
  p = p * s2 + 1;
  return e * LN2_HI + (2 * s * p + e * LN2_LO);
}

export function dtanh(x) {
  if (x !== x) return x;
  if (x > 20) return 1;
  if (x < -20) return -1;
  const a = x < 0 ? -x : x;
  if (a < 1e-4) return x - x * x * x / 3;
  const e = dexp(2 * a);
  const t = (e - 1) / (e + 1);
  return x < 0 ? -t : t;
}

// mulberry32: integers only, so it is the same everywhere
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- the model ----------
export const DEFAULT_CFG = {
  recent: 12,          // how many grid steps back it reads (two bars of 6/8)
  memory: [24, 48],    // it also sees what it played at this spot 4 and 8 bars ago
  hidden: 64,
  beats: 6,            // position in the bar, counted by the clock
  phrase: 8,           // which bar of an 8-bar phrase, counted by the clock
  initW1: 0.3,
};

export function layout(cfg, P) {
  const V = P + 2;          // outputs: P pitches, HOLD, REST
  const Vin = P + 3;        // inputs also have PAD (before the tune starts)
  const S = cfg.recent + cfg.memory.length;
  const F = S * Vin + cfg.beats + cfg.phrase;
  const H = cfg.hidden;
  const oW1 = 0;
  const ob1 = oW1 + F * H;
  const oW2 = ob1 + H;
  const ob2 = oW2 + V * H;
  const oW3 = ob2 + V;
  const n = oW3 + F * V;
  const lags = [];
  for (let k = 1; k <= cfg.recent; k++) lags.push(k);
  for (const m of cfg.memory) lags.push(m);
  return { P, V, Vin, S, F, H, A: S + 2, oW1, ob1, oW2, ob2, oW3, n, lags, PAD: P + 2, HOLD: P, REST: P + 1 };
}

export function initParams(L, cfg, seed) {
  const th = new Float64Array(L.n);
  const r = makeRng(seed);
  for (let i = L.oW1; i < L.ob1; i++) th[i] = (2 * r() - 1) * cfg.initW1;
  // everything else starts at zero: the first prediction is exactly uniform over the V outputs
  return th;
}

// Active input features of "predict position t of this token list, at clock position q".
export function featuresAt(L, cfg, tokens, t, q, out, o) {
  const { Vin, S, lags, PAD } = L;
  for (let s = 0; s < S; s++) {
    const j = t - lags[s];
    out[o + s] = s * Vin + (j >= 0 ? tokens[j] : PAD);
  }
  const beat = ((q % cfg.beats) + cfg.beats) % cfg.beats;
  const bar = Math.floor(q / cfg.beats);
  const ph = ((bar % cfg.phrase) + cfg.phrase) % cfg.phrase;
  out[o + S] = S * Vin + beat;
  out[o + S + 1] = S * Vin + cfg.beats + ph;
}

// One table of examples from a list of tunes: feats[N * A] and target[N].
export function buildExamples(L, cfg, tunes) {
  let N = 0;
  for (const t of tunes) N += t.tokens.length;
  const feats = new Int32Array(N * L.A);
  const target = new Int32Array(N);
  const tune = new Int32Array(N);
  let i = 0;
  for (let k = 0; k < tunes.length; k++) {
    const tk = tunes[k].tokens;
    for (let t = 0; t < tk.length; t++) {
      featuresAt(L, cfg, tk, t, tunes[k].q0 + t, feats, i * L.A);
      target[i] = tk[t];
      tune[i] = k;
      i++;
    }
  }
  return { N, feats, target, tune };
}

// Scratch buffers for one forward/backward pass.
export function makeScratch(L) {
  return { h: new Float64Array(L.H), z: new Float64Array(L.V), p: new Float64Array(L.V), dh: new Float64Array(L.H), mx: 0, sum: 0 };
}

// Probabilities for one example: fills sc.h, sc.z (logits), sc.p, sc.mx (largest logit) and sc.sum.
export function forward(L, th, feats, fo, sc) {
  const { H, V, A, oW1, ob1, oW2, ob2, oW3 } = L;
  const { h, z, p } = sc;
  for (let j = 0; j < H; j++) h[j] = th[ob1 + j];
  for (let a = 0; a < A; a++) {
    const c = oW1 + feats[fo + a] * H;
    for (let j = 0; j < H; j++) h[j] += th[c + j];
  }
  for (let j = 0; j < H; j++) h[j] = dtanh(h[j]);
  for (let v = 0; v < V; v++) {
    let s = th[ob2 + v];
    const r = oW2 + v * H;
    for (let j = 0; j < H; j++) s += th[r + j] * h[j];
    z[v] = s;
  }
  for (let a = 0; a < A; a++) {
    const c = oW3 + feats[fo + a] * V;
    for (let v = 0; v < V; v++) z[v] += th[c + v];
  }
  let mx = -Infinity;
  for (let v = 0; v < V; v++) if (z[v] > mx) mx = z[v];
  let sum = 0;
  for (let v = 0; v < V; v++) { const e = dexp(z[v] - mx); p[v] = e; sum += e; }
  for (let v = 0; v < V; v++) p[v] /= sum;
  sc.mx = mx;
  sc.sum = sum;
}

// Sum of the loss over examples idx[0..n), and (if grad is given) the summed gradient ADDED into grad.
// Returns { loss, correct, bad } where bad counts examples whose loss is not a finite number.
export function lossAndGrad(L, th, ex, idx, n, grad, sc) {
  const { H, V, A, oW1, ob1, oW2, ob2, oW3 } = L;
  const { h, z, p, dh } = sc;
  const feats = ex.feats;
  let loss = 0;
  let correct = 0;
  let bad = 0;
  for (let b = 0; b < n; b++) {
    const i = idx ? idx[b] : b;
    const fo = i * A;
    const y = ex.target[i];
    forward(L, th, feats, fo, sc);
    const li = -(z[y] - sc.mx - dlog(sc.sum));
    if (li === li && li !== Infinity) loss += li; else bad++;
    let arg = 0;
    for (let v = 1; v < V; v++) if (p[v] > p[arg]) arg = v;
    if (arg === y) correct++;
    if (!grad) continue;
    // dz = p - onehot(y)
    p[y] -= 1;
    for (let j = 0; j < H; j++) dh[j] = 0;
    for (let v = 0; v < V; v++) {
      const d = p[v];
      grad[ob2 + v] += d;
      const r = oW2 + v * H;
      for (let j = 0; j < H; j++) { grad[r + j] += d * h[j]; dh[j] += d * th[r + j]; }
    }
    for (let a = 0; a < A; a++) {
      const c = oW3 + feats[fo + a] * V;
      for (let v = 0; v < V; v++) grad[c + v] += p[v];
    }
    for (let j = 0; j < H; j++) { dh[j] *= 1 - h[j] * h[j]; grad[ob1 + j] += dh[j]; }
    for (let a = 0; a < A; a++) {
      const c = oW1 + feats[fo + a] * H;
      for (let j = 0; j < H; j++) grad[c + j] += dh[j];
    }
  }
  return { loss, correct, bad };
}

// One plain gradient-descent step on a minibatch: theta <- theta - lr * mean gradient. Returns the batch's mean loss.
export function sgdStep(L, th, ex, idx, n, lr, grad, sc) {
  grad.fill(0);
  const r = lossAndGrad(L, th, ex, idx, n, grad, sc);
  const s = lr / n;
  for (let i = 0; i < th.length; i++) th[i] -= s * grad[i];
  return r.loss / n;
}

// Mean loss and accuracy over a whole table (no gradient).
export function evaluate(L, th, ex, sc, idx, n) {
  const m = idx ? n : ex.N;
  const r = lossAndGrad(L, th, ex, idx || null, m, null, sc);
  return { loss: r.bad ? NaN : r.loss / m, acc: r.correct / m, bad: r.bad };
}

// Sharpness: the largest eigenvalue of the Hessian of the mean loss over the probe examples, by power iteration on
// Hessian-vector products (central differences of the gradient). Plain gradient descent on a quadratic bowl is stable
// only while lr < 2 / sharpness. v is the starting direction and is overwritten with the eigenvector (warm start).
export function sharpness(L, th, ex, idx, n, v, sc, work, iters = 30, tol = 2e-3) {
  const N = th.length;
  const { gp, gm, tp } = work;
  let nv = 0;
  for (let i = 0; i < N; i++) nv += v[i] * v[i];
  nv = Math.sqrt(nv);
  for (let i = 0; i < N; i++) v[i] /= nv;
  let lam = 0;
  let it = 0;
  const eps = 1e-4;
  for (it = 1; it <= iters; it++) {
    for (let i = 0; i < N; i++) tp[i] = th[i] + eps * v[i];
    gp.fill(0);
    lossAndGrad(L, tp, ex, idx, n, gp, sc);
    for (let i = 0; i < N; i++) tp[i] = th[i] - eps * v[i];
    gm.fill(0);
    lossAndGrad(L, tp, ex, idx, n, gm, sc);
    let dot = 0;
    let nn = 0;
    const k = 1 / (2 * eps * n);
    for (let i = 0; i < N; i++) { const hv = (gp[i] - gm[i]) * k; gp[i] = hv; dot += hv * v[i]; nn += hv * hv; }
    nn = Math.sqrt(nn);
    const prev = lam;
    lam = dot;
    if (!(nn > 0) || nn !== nn) break;
    for (let i = 0; i < N; i++) v[i] = gp[i] / nn;
    if (it > 2 && Math.abs(lam - prev) <= tol * Math.abs(lam)) break;
  }
  return { lambda: lam, iters: it };
}

export function makeWork(L) {
  return { gp: new Float64Array(L.n), gm: new Float64Array(L.n), tp: new Float64Array(L.n) };
}

// Pick a token from probabilities p with a given uniform number u (inverse CDF, tokens in their fixed order).
// The same u against a slowly changing p gives a slowly changing choice: the improvisation is not re-rolled.
export function pick(p, V, u) {
  let c = 0;
  for (let v = 0; v < V; v++) {
    c += p[v];
    if (u < c) return v;
  }
  // p did not sum past u: happens only when p is not made of numbers
  for (let v = 0; v < V; v++) if (!(p[v] === p[v])) return -1;
  return V - 1;
}

export function entropy(p, V) {
  let e = 0;
  for (let v = 0; v < V; v++) if (p[v] > 0) e -= p[v] * dlog(p[v]);
  return e;
}
