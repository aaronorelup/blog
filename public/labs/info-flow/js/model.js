// The rules of the grid, written once. Every mode asks this file; nothing else decides
// what can reach what.
//
// Layers l = 1..L (1 at the bottom). Positions p = 0..P-1 (left to right).
// A "cell" (l, p) is one layer at one position: its K/V dot, its attention, its MLP.
//
// The precision rule, after janus's diagram but kept exactly true to the architecture:
//   - the K/V at (l, q) is computed from the residual stream ENTERING layer l at q,
//     i.e. from the output of cell (l-1, q);
//   - attention at (l, p) reads the K/V of every q <= p at layer l;
//   - attention's output joins p's residual after layer l's K/V were computed, so it can
//     only be passed sideways again from layer l+1.
// So the direct inputs of cell (l, p) are the outputs of (l-1, q) for every q <= p.

export const key = (l, p) => l + ',' + p;
export const unkey = (k) => k.split(',').map(Number);

// ---------------------------------------------------------------------------------------
// Reach: the past and future of one cell, as a whole block.
// Returned sets hold keys; every cell is in at most one of them.
//   "full"  = up and to the right, through the residual and K/V streams
//   "kv"    = same layer, linked directly only through K/V (reading a prompt)
//   "both"  = same layer while generating: linked directly through K/V AND, in full, through a
//             sampled token (up one column, down through the token, then up and right)
//   "token" = linked only through a sampled token (generating)
export function reach(L, P, l, p, generating) {
  const past = { full: new Set(), kv: new Set(), both: new Set(), token: new Set() };
  const future = { full: new Set(), kv: new Set(), both: new Set(), token: new Set() };
  for (let ll = 1; ll <= L; ll++) {
    for (let q = 0; q < P; q++) {
      if (ll === l && q === p) continue;
      const k = key(ll, q);
      // past
      if (ll < l && q <= p) past.full.add(k);
      else if (ll === l && q < p) (generating ? past.both : past.kv).add(k);
      else if (generating && q < p) past.token.add(k);
      // future
      if (ll > l && q >= p) future.full.add(k);
      else if (ll === l && q > p) (generating ? future.both : future.kv).add(k);
      else if (generating && q > p) future.token.add(k);
    }
  }
  const size = (s) => s.full.size + s.kv.size + s.both.size + s.token.size;
  return { past, future, pastCount: size(past), futureCount: size(future) };
}
// Is key k anywhere in one side (past or future) of a reach() result?
export const inCone = (side, k) => side.full.has(k) || side.kv.has(k) || side.both.has(k) || side.token.has(k);

// Can block (l1, p1) influence block (l2, p2)?  'yes' | 'no' | 'token'
export function canReach(L, P, from, to, generating) {
  const [l1, p1] = from, [l2, p2] = to;
  if (l1 === l2 && p1 === p2) return 'yes';
  if (p2 < p1) return 'no';
  if (l2 > l1 || (l2 === l1 && p2 > p1)) return 'yes';
  // to is lower and to the right (or same column, lower)
  if (generating && p2 > p1) return 'token';
  return 'no';
}

// ---------------------------------------------------------------------------------------
// Paths: from A = the K/V dot at (la, pa) to B = the attention input at (lb, pb).
// A route is an order of n UP moves and m RIGHT positions, where a run of rights inside one
// layer is a single attention hop. Equivalently: split m into n+1 groups g0..gn (each >= 0);
// group k is the hop at layer la+k. That gives exactly C(m+n, n) routes.

export function binom(n, k) {
  if (k < 0 || n < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function binomBig(n, k) {
  n = BigInt(n); k = BigInt(k);
  if (k < 0n || n < 0n || k > n) return 0n;
  if (n - k < k) k = n - k;
  let r = 1n;
  for (let i = 1n; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export function displacement(A, B) {
  return { n: B.l - A.l, m: B.p - A.p };
}

export function routeCount(A, B) {
  const { n, m } = displacement(A, B);
  if (n < 0 || m < 0) return 0;
  return binom(m + n, n);
}

// number of ways to split r into k groups (each >= 0)
const comps = (r, k) => (k <= 0 ? (r === 0 ? 1 : 0) : binom(r + k - 1, k - 1));

// The k-th route (0-based) in janus's order: g0 ascending, then g1, ...
// Her example (n=1, m=2): [0,2] "UP 1, RIGHT 2", [1,1] "RIGHT 1, UP 1, RIGHT 1", [2,0] "RIGHT 2, UP 1".
export function unrankRoute(n, m, k) {
  const groups = [];
  let r = m;
  for (let i = 0; i <= n; i++) {
    const left = n - i; // groups after this one
    if (left === 0) { groups.push(r); break; }
    for (let g = 0; g <= r; g++) {
      const c = comps(r - g, left);
      if (k < c) { groups.push(g); r -= g; break; }
      k -= c;
    }
  }
  return groups;
}

export function allRoutes(n, m, limit = Infinity) {
  const total = binom(m + n, n);
  const out = [];
  for (let k = 0; k < Math.min(total, limit); k++) out.push(unrankRoute(n, m, k));
  return out;
}

// "UP 1, RIGHT 2" — her notation. Consecutive ups merge into "UP 2".
export function routeString(groups) {
  const parts = [];
  let ups = 0;
  groups.forEach((g, i) => {
    if (g > 0) {
      if (ups) { parts.push('UP ' + ups); ups = 0; }
      parts.push('RIGHT ' + g);
    }
    if (i < groups.length - 1) ups++;
  });
  if (ups) parts.push('UP ' + ups);
  return parts.length ? parts.join(', ') : 'no moves: A feeds B directly';
}

// The waypoints of one route, as drawing segments:
//   {t:'hop', l, from, to}  attention at layer l reads the K/V at `from` into position `to`
//   {t:'rise', l, p}        attention's result at (l, p) joins the residual and rises to (l+1, p)
export function routeSegments(A, groups) {
  const segs = [];
  let x = A.p;
  groups.forEach((g, i) => {
    const l = A.l + i;
    segs.push({ t: 'hop', l, from: x, to: x + g });
    x += g;
    if (i < groups.length - 1) segs.push({ t: 'rise', l, p: x });
  });
  return segs;
}

// How many routes use each segment (for the "all at once" view). Exact, no enumeration.
export function segmentUsage(A, B) {
  const { n, m } = displacement(A, B);
  const use = new Map();
  if (n < 0 || m < 0) return use;
  for (let i = 0; i <= n; i++) {
    const l = A.l + i;
    for (let x = A.p; x <= B.p; x++) {
      const toKv = i === 0 ? (x === A.p ? 1 : 0) : comps(x - A.p, i); // ways to reach kv(l, x)
      if (!toKv) continue;
      for (let y = x; y <= B.p; y++) {
        const fromAtt = i === n ? (y === B.p ? 1 : 0) : comps(B.p - y, n - i); // ways from att(l, y) to B
        if (!fromAtt) continue;
        use.set(`hop:${l}:${x}:${y}`, toKv * fromAtt);
      }
    }
    if (i < n) {
      for (let y = A.p; y <= B.p; y++) {
        const toAtt = comps(y - A.p, i + 1);
        const fromKv = comps(B.p - y, n - i);
        if (toAtt && fromKv) use.set(`rise:${l}:${y}`, toAtt * fromKv);
      }
    }
  }
  return use;
}

// ---------------------------------------------------------------------------------------
// Big numbers for "scale it up".
export function bigInfo(n, m) {
  const v = binomBig(m + n, n);
  const s = v.toString();
  const digits = s.length;
  const lead = parseFloat(s.slice(0, 1) + '.' + (s.slice(1, 16) || '0'));
  const log10 = digits - 1 + Math.log10(lead);
  return { value: v, str: s, digits, mantissa: lead, exp: digits - 1, log10 };
}

// Smallest m with C(m+n, n) > 10^e (exact, BigInt binary search).
export function crossing(n, e = 80) {
  const target = 10n ** BigInt(e);
  if (n <= 0) return null;
  let hi = 1n;
  while (binomBig(hi + BigInt(n), n) <= target) hi *= 2n;
  let lo = hi / 2n;
  while (lo + 1n < hi) {
    const mid = (lo + hi) / 2n;
    if (binomBig(mid + BigInt(n), n) > target) hi = mid; else lo = mid;
  }
  return hi;
}

// ---------------------------------------------------------------------------------------
// Time slices. A schedule maps every cell to a step (1-based).
export const schedules = {
  layer: { steps: (L) => L, step: (l) => l },
  diagonal: { steps: (L, P) => L + P - 1, step: (l, p) => l + p },
  column: { steps: (L, P) => L * P, step: (l, p, L) => p * L + l },
};

// Direct inputs of cell (l, p), as keys. In generating mode the bottom of column p also
// needs the token sampled at the top of column p-1.
export function inputsOf(L, P, l, p, generating) {
  const ins = [];
  if (l > 1) for (let q = 0; q <= p; q++) ins.push(key(l - 1, q));
  if (generating && l === 1 && p > 0) ins.push(key(L, p - 1));
  return ins;
}

// Is a full assignment cell -> step legal?
export function legalSchedule(L, P, stepOf, generating) {
  for (let l = 1; l <= L; l++) for (let p = 0; p < P; p++) {
    const s = stepOf(l, p);
    for (const k of inputsOf(L, P, l, p, generating)) {
      const [il, ip] = unkey(k);
      if (!(stepOf(il, ip) < s)) return false;
    }
  }
  return true;
}

export const fewestSteps = (L, P, generating) => (generating ? L * P : L);
