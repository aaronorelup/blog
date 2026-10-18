// The arithmetic behind chapter 04, kept apart from the DOM so node --test can check it:
// where each hour sits on the Lantern Clock, which wedge a finger is on, how the speed verdict
// is worded, and where the ruler's ticks go. Pure; no window, no document.

export const C = 150;            // the dial's centre in its 300 × 300 viewBox
export const R = 140;            // the dial's radius
export const R0 = 0.28 * R;      // the zero ring every wedge grows out of
export const RMAX = 0.95 * R;    // how far the busiest hour reaches
const GAP = 0.75;                // half the 1.5px surface gap between neighbouring wedges

const mod = (a, n) => ((a % n) + n) % n;

// Where bin j starts, in minutes after midnight on the clock being shown. Whole-hour zones
// re-bin into local hours, so bin j is simply j o'clock. Zones a half hour off keep the UTC
// edges (agg.hoursLocal, DESIGN §D.4), so bin j starts at UTC hour j plus the offset: 5:30, 6:30…
export const binStart = (j, hours) => (hours.fractional ? mod(j * 60 + hours.offsetMin, 1440) : j * 60);

// Degrees clockwise from the top, 15° an hour, so midnight is up and noon is down.
export const angleOf = (minuteOfDay) => mod(minuteOfDay, 1440) / 4;

const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};
const f = (n) => Math.round(n * 100) / 100;

// One wedge: an annular sector from a0° to a0+15°, from the zero ring out to r. Its two straight
// sides are pushed 0.75px inwards (parallel to the radius, not by an angle), so the gap between
// two wedges is the same 1.5px at the hub and at the rim.
export function wedgePath(a0, r, span = 15) {
  if (!(r > R0 + 0.5)) return '';
  const a1 = a0 + span;
  const side = (deg, rad, sign) => {
    const [x, y] = pt(deg, rad);
    const t = (deg * Math.PI) / 180;
    // the unit normal to the radius at deg, pointing clockwise
    return [x + sign * GAP * Math.cos(t), y + sign * GAP * Math.sin(t)];
  };
  const i0 = side(a0, R0, 1), o0 = side(a0, r, 1), o1 = side(a1, r, -1), i1 = side(a1, R0, -1);
  return `M${f(i0[0])} ${f(i0[1])}L${f(o0[0])} ${f(o0[1])}A${f(r)} ${f(r)} 0 0 1 ${f(o1[0])} ${f(o1[1])}`
    + `L${f(i1[0])} ${f(i1[1])}A${f(R0)} ${f(R0)} 0 0 0 ${f(i0[0])} ${f(i0[1])}Z`;
}

// A ring segment (the night wash): from a0° clockwise to a1°, between radii ri and ro.
export function ringPath(a0, a1, ri, ro) {
  let sweep = mod(a1 - a0, 360);
  if (sweep === 0) sweep = 360;
  if (sweep >= 359.99) sweep = 359.99;
  const b = a0 + sweep, large = sweep > 180 ? 1 : 0;
  const [x0, y0] = pt(a0, ro), [x1, y1] = pt(b, ro), [x2, y2] = pt(b, ri), [x3, y3] = pt(a0, ri);
  return `M${f(x0)} ${f(y0)}A${ro} ${ro} 0 ${large} 1 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${ri} ${ri} 0 ${large} 0 ${f(x3)} ${f(y3)}Z`;
}

export const point = (deg, r) => pt(deg, r).map(f);

// A wedge's outer radius for v pages, linear, the busiest hour at RMAX.
export const radiusFor = (v, max) => (max > 0 && v > 0 ? R0 + (RMAX - R0) * (v / max) : R0);

// Which bin a point in viewBox units is on. The whole sector counts, from the hub to just past
// the rim, so a thumb anywhere in the slice lands on it. Returns -1 off the dial.
export function binAt(x, y, hours, slack = 10) {
  const dx = x - C, dy = y - C;
  if (Math.hypot(dx, dy) > R + slack) return -1;
  const deg = mod((Math.atan2(dx, -dy) * 180) / Math.PI, 360);
  for (let j = 0; j < 24; j++) {
    const a0 = angleOf(binStart(j, hours));
    if (mod(deg - a0, 360) < 15) return j;
  }
  return -1;
}

// The busiest and quietest bins. Ties go to the earlier hour of the day on the clock shown.
export function peakQuiet(bins, hours) {
  const order = [...bins.keys()].sort((a, b) => binStart(a, hours) - binStart(b, hours));
  let peak = order[0], quiet = order[0];
  for (const j of order) {
    if (bins[j] > bins[peak]) peak = j;
    if (bins[j] < bins[quiet]) quiet = j;
  }
  return { peak, quiet };
}

// The share of pages in bins that start between midnight and 6 am on the clock shown.
export function nightShare(bins, hours) {
  let n = 0, total = 0;
  bins.forEach((v, j) => { total += v; if (binStart(j, hours) < 360) n += v; });
  return total > 0 ? n / total : 0;
}

// "+5:30", "−4:00": the reader's clock against UTC, for the half-hour note.
export function offsetText(min) {
  const s = min < 0 ? '−' : '+', a = Math.abs(Math.round(min));
  return `${s}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
}
// "half past", "quarter to": where each hour starts in a zone that isn't a whole hour off.
export function startsAt(min) {
  const m = mod(Math.round(min), 60);
  if (m === 30) return 'half past';
  if (m === 15) return 'quarter past';
  if (m === 45) return 'quarter to';
  return `${m} minutes past`;
}

// Google's "good" lines for the three speed numbers.
export const GOOD = { lcp: 2500, inp: 200, cls: 0.1 };
const has = (d) => !!(d && d.n > 0);

// "Fast." when every number is good on both devices, "Slow." when the main content was slow on
// both, "Mostly fast." for anything in between. A device nobody measured doesn't vote.
export function speedLead(vitals) {
  const devs = ['desktop', 'mobile'].map((k) => vitals && vitals[k]).filter(has);
  if (!devs.length) return null;
  const misses = devs.reduce((n, d) => n + (d.lcp > GOOD.lcp) + (d.inp > GOOD.inp) + (d.cls > GOOD.cls), 0);
  if (devs.every((d) => d.lcp > GOOD.lcp)) return 'Slow.';
  return misses === 0 ? 'Fast.' : 'Mostly fast.';
}

// A layout-shift score as people would write it: 0, 0.007, 0.02, 0.15.
export function clsText(v) {
  if (!(v > 0)) return '0';
  if (v < 0.01) return String(Math.round(v * 1000) / 1000);
  return String(Math.round(v * 100) / 100);
}

// The ruler runs to at least 3 s, and far enough past the slower device that its stamp isn't on
// the end, rounded up to a half second so the last tick has a label.
export function rulerMax(vitals) {
  const l = ['desktop', 'mobile'].map((k) => (has(vitals?.[k]) ? vitals[k].lcp : 0));
  return Math.ceil(Math.max(3000, 1.3 * Math.max(...l)) / 500) * 500;
}
export function rulerTicks(max) {
  const out = [];
  for (let t = 0; t <= max + 1; t += 500) out.push(t);
  return out;
}
// "0", "0.5", "1", … "3 s": the last one carries the unit.
export const tickLabel = (t, last) => (t === 0 ? '0' : String(t / 1000)) + (last ? ' s' : '');

// How much pages moved while loading, in words rather than a shift score nobody knows the unit
// of: "barely moved" inside Google's 0.1, "jumped" past it, "well inside" under half of it. The
// score itself stays in the device card and the table. A device nobody measured doesn't count.
export function movedText(vitals) {
  const on = { desktop: 'on a computer', mobile: 'on a phone' };
  const live = ['desktop', 'mobile'].filter((k) => has(vitals?.[k]));
  if (!live.length) return '';
  const bad = live.filter((k) => vitals[k].cls > GOOD.cls);
  const both = live.length === 2;
  if (!bad.length) {
    const worst = Math.max(...live.map((k) => vitals[k].cls));
    return `pages barely moved while loading${both ? ' on either' : ''} (${worst <= GOOD.cls / 2 ? 'well inside' : 'inside'} Google's “good”)`;
  }
  if (bad.length === live.length) return `pages jumped while loading${both ? ' on both' : ''} (past Google's “good”)`;
  const ok = live.find((k) => !bad.includes(k));
  return `pages barely moved while loading ${on[ok]} but jumped ${on[bad[0]]} (past Google's “good”)`;
}

// The people range for an average day of the week, Monday first, by UTC weekday (the days
// agg.weekdayMeans counts): the mean of each day's low end and of its high end. The clock's hours
// only exist for the high end, but a day has both, so the weekday row can be honest about it.
export function weekdayRange(perDay) {
  const lo = new Array(7).fill(0), hi = new Array(7).fill(0), counts = new Array(7).fill(0);
  for (const p of perDay || []) {
    const [y, m, d] = String(p.d).split('-').map(Number);
    const i = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    lo[i] += p.lo || 0;
    hi[i] += p.hi || 0;
    counts[i]++;
  }
  const avg = (a) => a.map((s, i) => (counts[i] ? s / counts[i] : 0));
  return { lo: avg(lo), hi: avg(hi), counts };
}
