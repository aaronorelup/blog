// The arithmetic behind "Is it growing?", kept apart from the drawing so Node can test it.
// Nothing here touches the DOM; every function takes plain data and returns plain data.
// (calc.test.mjs exercises it: `node --test src/scripts/stats/growing/`.)

const DAY = 864e5;

/** 'YYYY-MM-DD' → whole days since 1970-01-01 (UTC). */
export const dayNum = (d) => Math.round(Date.parse(d + 'T00:00:00Z') / DAY);
/** whole days since 1970-01-01 → 'YYYY-MM-DD'. */
export const dayStr = (n) => new Date(n * DAY).toISOString().slice(0, 10);
export const addDays = (d, k) => dayStr(dayNum(d) + k);

/**
 * The long view's columns. One per day, positioned by calendar day (not by row), so a missing
 * day in the totals leaves a gap instead of quietly squeezing time. When a day column would be
 * narrower than `minPx`, days are grouped by ISO week (Monday first) and each column becomes the
 * week's average day: a week cut short at either end then stands as tall as a full one, which is
 * the honest picture for "is it growing?".
 *
 * @param {{d:string, pages:number, files:number, bytes:number}[]} rows  ascending
 * @param {number} widthPx  the plot's width
 * @returns {{binned:boolean, slots:number, cols:{i:number, from:string, to:string, days:number,
 *            pages:number, files:number, bytes:number}[]}}
 */
export function longColumns(rows, widthPx, minPx = 3) {
  if (!rows.length) return { binned: false, slots: 0, cols: [] };
  const first = dayNum(rows[0].d);
  const last = dayNum(rows[rows.length - 1].d);
  const span = last - first + 1;
  if (widthPx / span >= minPx) {
    return {
      binned: false,
      slots: span,
      cols: rows.map((r) => ({ i: dayNum(r.d) - first, from: r.d, to: r.d, days: 1, pages: r.pages, files: r.files, bytes: r.bytes })),
    };
  }
  // 1970-01-01 was a Thursday, so (n + 3) % 7 is 0 on Mondays.
  const weekOf = (n) => Math.floor((n + 3) / 7);
  const w0 = weekOf(first);
  const byWeek = new Map();
  for (const r of rows) {
    const w = weekOf(dayNum(r.d)) - w0;
    let c = byWeek.get(w);
    if (!c) byWeek.set(w, (c = { i: w, from: r.d, to: r.d, days: 0, pages: 0, files: 0, bytes: 0 }));
    c.to = r.d;
    c.days++;
    c.pages += r.pages; c.files += r.files; c.bytes += r.bytes;
  }
  const cols = [...byWeek.values()].map((c) => ({
    ...c, pages: c.pages / c.days, files: c.files / c.days, bytes: c.bytes / c.days,
  }));
  return { binned: true, slots: weekOf(last) - w0 + 1, cols };
}

/**
 * The long view's rows: Cloudflare's daily totals, except that every day the sorted chart covers
 * is drawn from the sorted sums instead. The two are counted separately (the totals are
 * Cloudflare's own page-view tally, the sorted days add up every page response the classifier
 * saw), so they differ by a few percent; showing both for one date put two numbers a screen
 * apart and made the growth answer disagree with the hero. Sorted days the totals don't have yet
 * (the totals refresh once a day) are added at the end.
 *
 * @param {{d:string, pages:number, files:number, bytes:number}[]} totals  ascending
 * @param {{d:string, pages:number, files:number, bytes:number}[]} sorted  ascending
 * @returns {{rows:{d,pages,files,bytes,sorted:boolean}[], from:string|null, both:{totals:number, sorted:number}}}
 *   `both` sums pages over the days the two sources share, for the note that says how far apart they are.
 */
export function mergeSorted(totals, sorted) {
  const by = new Map(sorted.map((x) => [x.d, x]));
  const both = { totals: 0, sorted: 0 };
  const rows = totals.map((r) => {
    const x = by.get(r.d);
    if (!x) return { ...r, sorted: false };
    by.delete(r.d);
    both.totals += r.pages; both.sorted += x.pages;
    return { d: r.d, pages: x.pages, files: x.files, bytes: x.bytes, sorted: true };
  });
  const lastT = totals.length ? totals[totals.length - 1].d : '';
  for (const x of by.values()) if (x.d > lastT) rows.push({ d: x.d, pages: x.pages, files: x.files, bytes: x.bytes, sorted: true });
  const firstSorted = rows.find((r) => r.sorted);
  return { rows, from: firstSorted ? firstSorted.d : null, both };
}

/**
 * agg.growth() takes its "now" figure (`b`) from Cloudflare's daily totals. When the sorted days
 * cover the same stretch, quote them instead, so "387 a day over the last 30 days" is the hero's
 * 30-day count divided by 30 rather than a second, slightly different tally. The ratio and the
 * lead follow the new `b` by the same rules agg.growth uses. `a` (the first month) stays on the
 * totals: nothing else covers it.
 * @param {ReturnType<import('../core/agg.js').growth>} g
 * @param {number[]} sortedPages  pages per sorted day, ascending
 */
export function growthOnSorted(g, sortedPages) {
  if (!g || g.lead === 'too-young') return g;
  const k = g.lead === 'young' ? 7 : 30;
  if (sortedPages.length < k) return g;
  const b = sortedPages.slice(-k).reduce((s, v) => s + v, 0) / k;
  const r = g.a > 0 ? b / g.a : (b > 0 ? Infinity : 1);
  let lead = g.lead;
  if (lead !== 'young') {
    const sh = g.shares || {};
    const rose = !!(sh.first && sh.second) && (sh.second.lo - sh.first.lo >= 0.03 || sh.second.hi - sh.first.hi >= 0.03);
    lead = r >= 1.15 ? (rose ? 'yes' : 'yes-machines') : r > 0.87 ? 'flat' : 'down';
  }
  return { ...g, b, r, lead };
}

/**
 * Post marks under an axis, merged where they would touch. On a phone the long view gives a day
 * about 4px, and with a post most days the dots ran into one chain of rings. A mark joins the
 * group before it while it sits closer than `minGap` to that group's centre; the group is drawn at
 * the mean x of its days as one "several posts" ring. Because a group's centre only moves right
 * as it grows, it never ends up closer than `minGap` to the group before it. x is then clamped
 * into [lo, hi] so the last ring doesn't hang past the plot.
 * @param {{d:string, x:number, y:number, posts:object[]}[]} marks
 * @returns {{d:string, x:number, y:number, posts:object[]}[]}
 */
export function clusterMarks(marks, minGap = 9, lo = -Infinity, hi = Infinity) {
  const out = [];
  for (const m of [...marks].sort((a, b) => a.x - b.x)) {
    const g = out[out.length - 1];
    if (g && m.x - g.x < minGap) {
      g.xs.push(m.x);
      g.x = g.xs.reduce((s, v) => s + v, 0) / g.xs.length;
      g.posts = g.posts.concat(m.posts);
    } else out.push({ d: m.d, x: m.x, y: m.y, xs: [m.x], posts: m.posts.slice() });
  }
  return out.map(({ xs, ...g }) => ({ ...g, x: Math.max(lo, Math.min(hi, g.x)) }));
}

/**
 * x labels for the long view: the first day, the 1st of each month, the last day. A month label
 * that would crowd an end label is dropped (the ends carry the span; months are landmarks).
 * @param {string} first @param {string} last
 * @param {(d:string)=>number} xOf  centre of that day in px
 * @returns {{d:string, x:number, anchor:'start'|'middle'|'end'}[]}
 */
export function xLabels(first, last, xOf, minGap = 46) {
  const out = [{ d: first, x: xOf(first), anchor: 'start' }];
  const end = { d: last, x: xOf(last), anchor: 'end' };
  if (last === first) return out;
  const a = dayNum(first), b = dayNum(last);
  const [y0, m0] = first.split('-').map(Number);
  for (let y = y0, m = m0 + 1; ; m++) {
    if (m > 12) { m = 1; y++; }
    const d = `${y}-${String(m).padStart(2, '0')}-01`;
    const n = dayNum(d);
    if (n >= b) break;
    if (n <= a) continue;
    const x = xOf(d);
    if (x - out[out.length - 1].x < minGap || end.x - x < minGap) continue;
    out.push({ d, x, anchor: 'middle' });
  }
  // the end label wins over a first label it would collide with
  if (end.x - out[0].x < minGap * 1.6 && out.length === 1) return [end];
  out.push(end);
  return out;
}

/** Listed posts grouped by publish date. @param {{id,slug,title,date}[]} posts */
export function postsByDay(posts) {
  const m = new Map();
  for (const p of posts || []) {
    if (!p || !p.date) continue;
    if (!m.has(p.date)) m.set(p.date, []);
    m.get(p.date).push(p);
  }
  for (const list of m.values()) list.sort((x, y) => String(x.id).localeCompare(String(y.id)));
  return m;
}

/** "AO-029", "AO-055 and AO-056", "AO-050, AO-051 and 3 more". */
export function idList(posts) {
  const ids = posts.map((p) => p.id);
  if (ids.length <= 2) return ids.join(' and ');
  return `${ids[0]}, ${ids[1]} and ${ids.length - 2} more`;
}

/**
 * ", the day AO-029 went up" or ", the day after AO-029 went up", or '' when no listed post
 * went up that day or the day before.
 */
export function postNote(d, byDay) {
  const same = byDay.get(d);
  if (same && same.length) return `, the day ${idList(same)} went up`;
  const before = byDay.get(addDays(d, -1));
  if (before && before.length) return `, the day after ${idList(before)} went up`;
  return '';
}

/** Middle value (mean of the two middles for an even count). */
export function median(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return 0;
  const h = v.length >> 1;
  return v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2;
}

// Bottom to top. People sit on the baseline (counted, then "maybe" striped above), then the
// browser-shaped machines, then programs, then the two kinds that come in waves.
export const STACK = ['person', 'stale', 'agent', 'scanner', 'bot'];

/**
 * One column's stack for the sorted chart, as segments in drawing order. In pages, people are a
 * solid `lo` and a striped `hi − lo`; in files they are one solid block (files have no range).
 * Hidden kinds stay in the list with value 0, so a tween can shrink them in place.
 * @param {{pages:object, req:object, lo:number, hi:number}} pd  one entry of perDay
 * @param {'pages'|'files'} unit
 * @param {Set<string>} hidden
 * @returns {{seg:string, kind:string, v:number}[]}  seg ∈ person-lo|person-hi|stale|agent|scanner|bot
 */
export function stackOf(pd, unit, hidden = new Set()) {
  const src = unit === 'files' ? pd.req : pd.pages;
  const on = (k) => !hidden.has(k);
  const segs = [];
  if (unit === 'files') {
    segs.push({ seg: 'person-lo', kind: 'person', v: on('person') ? src.person || 0 : 0 });
    segs.push({ seg: 'person-hi', kind: 'person', v: 0 });
  } else {
    const lo = Math.max(0, pd.lo || 0), hi = Math.max(lo, pd.hi || 0);
    segs.push({ seg: 'person-lo', kind: 'person', v: on('person') ? lo : 0 });
    segs.push({ seg: 'person-hi', kind: 'person', v: on('person') ? hi - lo : 0 });
  }
  for (const k of STACK.slice(1)) segs.push({ seg: k, kind: k, v: on(k) ? src[k] || 0 : 0 });
  return segs;
}

export const stackTotal = (segs) => segs.reduce((s, x) => s + x.v, 0);

/**
 * What the sorted chart says about its tallest column: a direct label when one kind is more than
 * half of it, and the "one wave squashes the rest" hint.
 *
 * The spec's rule for the hint is "tallest column > 2.5 × the median column". In files that
 * misses the clearest wave in the data: a scanner day of 4,159 knocks in a month whose median
 * day is about 2,000 files is a 13-fold spike for scanners, yet only 2.2 times the median
 * column, because pictures and video pad every other day. So the hint also fires when the
 * tallest column's main kind is at least 3 times its own median day (the same test as
 * agg.scannerWave) and the column is at least 1.8 times the median column.
 *
 * Computed with every layer on, so hiding the wave doesn't make the hint (and its Show button)
 * disappear from under the reader's finger.
 *
 * @param {{d:string, segs:{kind:string, v:number}[]}[]} cols  all layers on
 * @returns {null | {d:string, i:number, total:number, kind:string, n:number, share:number, label:boolean, hint:boolean}}
 */
export function tallest(cols) {
  if (!cols.length) return null;
  const totals = cols.map((c) => stackTotal(c.segs));
  const top = Math.max(...totals);
  if (!(top > 0)) return null;
  const kindsOf = (c) => {
    const by = {};
    for (const s of c.segs) by[s.kind] = (by[s.kind] || 0) + s.v;
    return by;
  };
  // The standout is the biggest single block of one kind on one day, if its column is (near
  // enough) the tallest. Two columns of almost equal height can hide a wave behind a day that
  // is merely busy all round: on the fixture, 12 Oct (4,377 files, no kind over half) edges out
  // 24 Sep (4,370, of which 4,159 scanners), and only the second is a story.
  let i = -1, kind = 'person', n = -1;
  cols.forEach((c, j) => {
    if (totals[j] < 0.75 * top) return;
    const by = kindsOf(c);
    for (const k of Object.keys(by)) if (by[k] > n) { n = by[k]; kind = k; i = j; }
  });
  const total = totals[i];
  const share = total > 0 ? n / total : 0;
  const med = median(totals);
  const kindMed = median(cols.map((c) => kindsOf(c)[kind] || 0));
  const squashes = cols.length >= 3 && med > 0 && (top > 2.5 * med || (n >= 3 * Math.max(kindMed, 1) && total >= 1.8 * med));
  return { d: cols[i].d, i, total, kind, n, share, label: share > 0.5, hint: squashes && share > 0.5 && kind !== 'person' };
}

/** The busiest day for people, by the middle of its range (ties go to the later day). */
export function peopleBusiest(perDay) {
  let best = null;
  for (const p of perDay) {
    const m = (p.lo || 0) + (p.hi || 0);
    if (!best || m >= (best.lo || 0) + (best.hi || 0)) best = p;
  }
  return best && best.hi > 0 ? best : null;
}

/**
 * Where a pointer at `x` lands among `count` evenly spaced bands that start at `x0`.
 * Clamped, so a scrub past either end holds the end column.
 */
export function bandIndex(x, x0, band, count) {
  if (count <= 0) return -1;
  const i = Math.floor((x - x0) / band);
  return Math.max(0, Math.min(count - 1, i));
}

/**
 * The answer's words, as data. `g` is agg.growth(); `shares` the people shares of the two halves
 * (0..1); `whole` the whole window's {loShare, hiShare}. Returns the lead (bold) and the rest as
 * sentence parts the caller renders. Kept here so the copy rules can be tested.
 */
export function growthWords(g, whole, f) {
  const n = g.rows;
  const per = (x) => (x < 10 ? Math.round(x * 10) / 10 : Math.round(x));
  if (g.lead === 'too-young' || n < 14) {
    return { lead: 'Too early to say;', rest: [` the site is ${f.num(n)} days old.`] };
  }
  if (g.lead === 'young' || n < 28) {
    return {
      lead: `The site is ${f.num(n)} days old:`,
      rest: [' ', { num: per(g.a), key: 'a' }, ' pages a day in its first week, ', { num: per(g.b), key: 'b' }, ' in the last.'],
    };
  }
  const LEADS = { yes: 'Yes.', 'yes-machines': 'Yes, mostly with machines.', flat: 'Not really.', down: "No, it's quieter than it was." };
  const lead = LEADS[g.lead] || 'Not really.';
  const k = Math.min(30, Math.floor(n / 2));
  const first = k >= 30 ? 'its first month' : `its first ${k} days`;
  const lastN = Math.min(30, n);
  const rest = [
    ` The site sends ${f.times(g.r)} as many pages a day as in ${first}: `,
    { num: per(g.a), key: 'a' }, ' a day then, ', { num: per(g.b), key: 'b' }, ` a day over the last ${lastN} days.`,
  ];
  const line = peopleLine(g.shares, whole, f);
  if (line) rest.push(' ' + line);
  return { lead, rest };
}

/** "People's share held at about 9 to 16%." or "People's share went from 9–16% to 12–20%." */
export function peopleLine(shares, whole, f) {
  if (!shares || !shares.first || !shares.second) return '';
  const { first: a, second: b } = shares;
  if (![a.lo, a.hi, b.lo, b.hi].every(Number.isFinite)) return '';
  const held = Math.abs(b.lo - a.lo) < 0.03 && Math.abs(b.hi - a.hi) < 0.03;
  if (held) {
    const lo = whole && Number.isFinite(whole.loShare) ? whole.loShare : (a.lo + b.lo) / 2;
    const hi = whole && Number.isFinite(whole.hiShare) ? whole.hiShare : (a.hi + b.hi) / 2;
    const loP = pctBare(lo), hiP = f.pct(hi);
    return loP === hiP.replace('%', '') ? `People's share held at about ${hiP}.` : `People's share held at about ${loP} to ${hiP}.`;
  }
  return `People's share went from ${f.pctRange(a.lo, a.hi)} to ${f.pctRange(b.lo, b.hi)}.`;
}

// "9" for 0.09; the % goes on the high end only ("about 9 to 16%").
function pctBare(x) {
  if (x > 0 && x < 0.01) return 'under 1';
  return String(Math.round(x * 100));
}
