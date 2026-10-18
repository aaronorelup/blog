// The merge and derive layer: everything the page says is computed here from the snapshot's
// days, in plain functions over plain data (no DOM), so Node tests can hold it to account.
// DESIGN.md §D.3–§D.4 is the spec; the units below are pinned there.
//
//   pages.*   pages              req.*   files           bytes.*  bytes
//   bots[i]   [name, owner, category, files, pages]
//   agents    files, top 20 + "Other programs" (sums to req.agent)
//   stale     pages, top 20 + "Other old browsers" (sums to pages.stale)
//   probes    files ("knocks"), top 25 a day
//   people.*  pages; may sum to less than pages.person, so callers must cope
//   rum.*     page loads, Cloudflare's sampled estimates
//   totals    requests (files), pages, bytes by column NAME; `uniques` is never read
//
// The privacy guards live here as well as in the Worker: a path naming a post that isn't
// listed never leaves this file (isPublicPath), and names the server sends that nobody can vouch
// for (a made-up bot, an odd referrer host, a one-off program) only print once they have been
// seen often enough (displayable). Everything else is counted under "other", nameless.
import {
  KIND_ORDER, purposeOf, PURPOSE_KEYS, probeFamily, referrerLabel, normHost, pathLabel,
  isKnownBot, isKnownProgram, PROGRAM_SHOWN,
} from './words.js';

export const LADDER = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];

const KIND_SET = new Set(KIND_ORDER);
const num0 = (v) => (Number.isFinite(+v) ? +v : 0);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const map0 = (m) => {
  const out = {};
  if (isObj(m)) for (const [k, v] of Object.entries(m)) out[k] = num0(v);
  return out;
};
const pairs = (a) => (Array.isArray(a) ? a.filter((r) => Array.isArray(r) && r.length >= 2).map((r) => [String(r[0]), num0(r[1])]) : []);

// ---------- normalize ----------

function normDay(raw) {
  const d = raw || {};
  const people = d.people || {};
  const hours = Array.from({ length: 24 }, (_, i) => num0(Array.isArray(people.hours) ? people.hours[i] : 0));
  const rum = isObj(d.rum)
    ? {
        loads: num0(d.rum.loads), visits: num0(d.rum.visits),
        paths: pairs(d.rum.paths), referrers: pairs(d.rum.referrers),
        countries: map0(d.rum.countries), devices: map0(d.rum.devices),
      }
    : null;
  return {
    d: String(d.d || '').slice(0, 10),
    req: map0(d.req), pages: map0(d.pages), bytes: map0(d.bytes),
    bots: Array.isArray(d.bots)
      ? d.bots.filter(Array.isArray).map((b) => [String(b[0] ?? ''), String(b[1] ?? 'Unknown') || 'Unknown', String(b[2] ?? ''), num0(b[3]), num0(b[4])])
      : [],
    agents: pairs(d.agents), stale: pairs(d.stale), probes: pairs(d.probes),
    probeStatus: map0(d.probeStatus), probeCountries: map0(d.probeCountries), botCountries: map0(d.botCountries),
    people: {
      countries: map0(people.countries), devices: map0(people.devices), browsers: map0(people.browsers),
      os: map0(people.os), hours, paths: pairs(people.paths),
    },
    rum,
    reads: pairs(d.reads),
  };
}

/** @returns {import('./types.js').Snap} */
export function normalize(json, now = Date.now()) {
  const j = json || {};
  const cols = Array.isArray(j.totals?.cols) ? j.totals.cols.map(String) : [];
  const rows = Array.isArray(j.totals?.rows) ? j.totals.rows.filter(Array.isArray) : [];
  const colIndex = new Map(cols.map((c, i) => [c, i]));
  const days = (Array.isArray(j.days) ? j.days : []).map(normDay).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.d));
  days.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  const dIdx = colIndex.has('d') ? colIndex.get('d') : 0;
  rows.sort((a, b) => String(a[dIdx]).localeCompare(String(b[dIdx])));
  const builtAt = String(j.builtAt || '');
  const t = Date.parse(builtAt);
  const cov = j.coverage || {};
  return {
    v: j.v,
    site: String(j.site || 'aaronorelup.com'),
    builtAt,
    through: String(j.through || (days.length ? days[days.length - 1].d : '')),
    coverage: {
      days: num0(cov.days ?? days.length), wanted: num0(cov.wanted ?? 30) || 30,
      first: cov.first ?? (days[0]?.d || null), totalsFirst: cov.totalsFirst ?? (rows[0] ? String(rows[0][dIdx]) : null),
    },
    run: {
      queries: num0(j.run?.queries),
      lastError: isObj(j.run?.lastError) ? { at: String(j.run.lastError.at || ''), message: String(j.run.lastError.message || '') } : null,
    },
    vitals: isObj(j.vitals) ? j.vitals : null,
    totals: { cols, rows, col: (name) => (colIndex.has(name) ? colIndex.get(name) : -1) },
    days,
    ageHours: Number.isFinite(t) ? (now - t) / 3.6e6 : 0,
  };
}

// ---------- ranges ----------

export function rangeDays(snap, range) {
  if (!snap || !range) return [];
  if (range.kind === 'day') return snap.days.filter((d) => d.d === range.d);
  const n = Math.max(0, Math.floor(range.n || 0));
  return n ? snap.days.slice(-n) : [];
}

export function clampRange(snap, range) {
  const len = snap?.days?.length || 0;
  if (range?.kind === 'day') {
    return snap.days.some((d) => d.d === range.d) ? { kind: 'day', d: range.d } : { kind: 'last', n: Math.min(1, len) };
  }
  const n = Math.floor(range?.n || 30);
  return { kind: 'last', n: Math.max(Math.min(1, len), Math.min(n, len)) };
}

export const rangeKey = (range) => (range?.kind === 'day' ? 'd:' + range.d : String(range?.n ?? 0));

// ---------- sums ----------

/** @returns {import('./types.js').KindSums} */
export function kindSums(days, measure = 'pages') {
  const out = { bot: 0, scanner: 0, agent: 0, stale: 0, person: 0, total: 0 };
  for (const d of days || []) {
    const m = d[measure] || {};
    for (const k of KIND_ORDER) out[k] += num0(m[k]);
  }
  out.total = out.bot + out.scanner + out.agent + out.stale + out.person;
  return out;
}

// The honest people count is a range: Cloudflare's counter (rum.loads) is the low end, pages
// that passed every question (pages.person) the high end. Per day, the lower of the two is the
// low end, so a day where the counter's estimate came out above the server's count still gives
// a range that runs low to high (a "swapped" day). Additive, so any range is a sum of days.
// `loExact` says whether the low end is a count rather than an estimate: true when none of it
// came from the counter (every day swapped, or no counter), so fmt.range() prints it as it is
// instead of rounding the server's exact 127 up to "130".
export function peopleRange(days) {
  let lo = 0, hi = 0, loRaw = 0, hiRaw = 0, swappedDays = 0, rumMissingDays = 0, loRum = 0;
  const perDay = [];
  for (const d of days || []) {
    const person = num0(d.pages?.person);
    const loads = d.rum ? num0(d.rum.loads) : 0;
    if (!d.rum) rumMissingDays++;
    if (d.rum && loads > person) swappedDays++;
    const l = Math.min(loads, person), h = Math.max(loads, person);
    const fromRum = d.rum && loads < person ? loads : 0;
    lo += l; hi += h; loRaw += loads; hiRaw += person; loRum += fromRum;
    perDay.push({ d: d.d, lo: l, hi: h, loExact: fromRum === 0 });
  }
  return { lo, hi, loRaw, hiRaw, swappedDays, rumMissingDays, perDay, loExact: loRum === 0 };
}

// The verdict reads both ends of the range, so "Mostly people" is only said when even the low end
// says so.
export function verdict(lo, hi, total) {
  if (!(total > 0)) return 'none';
  if (!(hi > 0)) return 'machines-all';
  const loS = lo / total, hiS = hi / total;
  if (hiS < 0.45) return 'machines';
  if (loS > 0.55) return 'people';
  if (loS >= 0.35 && hiS <= 0.65) return 'half';
  return 'unclear';
}

// Integers that sum to exactly `target`, as close to proportional as rounding allows. Every
// non-zero value keeps at least one when there are enough to go round, so a small pile never
// vanishes from the gate (it takes the dot from the largest).
export function largestRemainder(values, target) {
  const v = (values || []).map((x) => Math.max(0, num0(x)));
  const T = Math.max(0, Math.round(target || 0));
  const sum = v.reduce((a, b) => a + b, 0);
  const out = v.map(() => 0);
  if (!(sum > 0) || T === 0) return out;
  const quotas = v.map((x) => (x / sum) * T);
  let given = 0;
  quotas.forEach((q, i) => { out[i] = Math.floor(q); given += out[i]; });
  const order = quotas.map((q, i) => [q - Math.floor(q), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; given < T; k = (k + 1) % order.length) { out[order[k][1]]++; given++; }
  const nonZero = v.filter((x) => x > 0).length;
  if (T >= nonZero) {
    for (let i = 0; i < v.length; i++) {
      if (v[i] > 0 && out[i] === 0) {
        let j = -1;
        for (let k = 0; k < out.length; k++) if (out[k] > 1 && (j < 0 || out[k] > out[j])) j = k;
        if (j < 0) break;
        out[j]--; out[i]++;
      }
    }
  }
  return out;
}

export function pickUnit(maxValue, capacity, ladder = LADDER) {
  for (const u of ladder) if (Math.ceil(num0(maxValue) / u) <= capacity) return u;
  return ladder[ladder.length - 1];
}

const sortRows = (a, b) => b.n - a.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

/** Sum a map field across days. @returns {import('./types.js').Row[]} */
export function mergeMap(days, pick) {
  const acc = new Map();
  for (const d of days || []) {
    const m = pick(d);
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) acc.set(k, (acc.get(k) || 0) + num0(v));
  }
  return [...acc].map(([key, n]) => ({ key, n })).filter((r) => r.n > 0).sort(sortRows);
}

// Sum top-N lists across days. A row is `partial` when some day's list was full (it hit the
// cap) and didn't include it: that day it may have had some, below the cut, so its sum is
// "at least".
export function mergeTop(days, pick, cap = Infinity) {
  const acc = new Map();
  const lists = [];
  for (const d of days || []) {
    const list = pick(d) || [];
    const keys = new Set();
    for (const [k, v] of list) {
      acc.set(k, (acc.get(k) || 0) + num0(v));
      keys.add(k);
    }
    lists.push({ full: list.length >= cap, keys });
  }
  return [...acc].map(([key, n]) => ({
    key, n, partial: lists.some((l) => l.full && !l.keys.has(key)),
  })).filter((r) => r.n > 0).sort(sortRows);
}

// ---------- display guards ----------

// "Seen often enough": at least `min` in all, on at least two days of the range.
function seenEnough(days, listOf, key, min) {
  let total = 0, daysSeen = 0;
  for (const d of days || []) {
    let n = 0;
    for (const r of listOf(d) || []) if (r[0] === key) n += num0(r[1]);
    if (n > 0) { daysSeen++; total += n; }
  }
  return total >= min && daysSeen >= 2;
}

export function displayable(kind, row, days) {
  if (!row) return false;
  if (kind === 'program') {
    const label = row.label ?? row.key;
    if (isKnownProgram(label)) return true;
    if (row.n != null && row.daysSeen != null) return row.n >= 10 && row.daysSeen >= 2;
    return seenEnough(days, (d) => d.agents, label, 10);
  }
  if (kind === 'bot') {
    if (row.owner && row.owner !== 'Unknown') return true;
    if (isKnownBot(row.name)) return true;
    if (row.files != null && row.daysSeen != null) return row.files >= 10 && row.daysSeen >= 2;
    return seenEnough(days, (d) => d.bots.map((b) => [b[0], b[3]]), row.name, 10);
  }
  if (kind === 'host') {
    const host = row.host ?? row.key;
    if (referrerLabel(host)) return true;
    return seenEnough(days, (d) => (d.rum ? d.rum.referrers : []), host, 3);
  }
  if (kind === 'probe') {
    const path = row.path ?? row.key;
    if (probeFamily(path).key !== 'other') return true;
    return seenEnough(days, (d) => d.probes, path, 5);
  }
  return false;
}

// Could this path be printed? Short, plain characters, no query, and if it names a post (or a
// post's media folder) the post must be listed. A rejected path is dropped without a trace.
//
// The checks run on the path as a server would read it: decoded (up to three times, so %256C
// can't hide an l), runs of slashes collapsed, lower-cased, since /LEDGER/x/, //ledger/x/ and
// /%6Cedger/x/ all name the same post. Then every word shaped like a post slug (three or more
// hyphenated words) must be a listed post or a word the site's own pages use (build.words, made
// at build time from the games, labs, courses and research folders), as the Worker's wordsOk in
// worker/stats-shape.js does. This is the second defence; the Worker's is the first.
const FIXED_PUBLIC = new Set(['/ledger/', '/ledger/previews.json']);
const SLUGGY = /^[a-z0-9]+(?:-[a-z0-9]+){2,}$/;
const wordSets = new WeakMap();
export function isPublicPath(path, build) {
  const p = String(path ?? '');
  if (!p || p.length > 120) return false;
  if (p.includes('?') || p.includes('#')) return false;
  if (!/^[A-Za-z0-9/_.~%-]+$/.test(p)) return false;
  let d = p;
  for (let i = 0; i < 3 && d.includes('%'); i++) {
    try { d = decodeURIComponent(d); } catch (e) { return false; }
  }
  if (d.includes('%') || !/^[A-Za-z0-9/_.~-]+$/.test(d)) return false;
  const low = d.replace(/\/{2,}/g, '/').toLowerCase();
  if (low.split('/').some((s) => s === '..' || s === '.')) return false;
  if (FIXED_PUBLIC.has(low)) return true;
  const listed = build?.bySlug;
  const bare = (s) => s.replace(/\.[a-z0-9]+$/i, '');
  const m = /^\/(ledger|posts|media)\/([^/]+)(?:\/([^/]+))?/.exec(low);
  if (m) {
    // /media/previews/<slug>.webp: a hover card's picture, named after its post
    const slug = m[1] === 'media' && m[2] === 'previews' ? (m[3] ? bare(m[3]) : null) : bare(m[2]);
    if (slug != null && !listed?.has(slug)) return false;
  }
  if (build?.words) {
    let ok = wordSets.get(build);
    if (!ok) { ok = new Set(build.words); wordSets.set(build, ok); }
    for (let w of low.split(/[^a-z0-9-]+/)) {
      w = w.replace(/^-+|-+$/g, '');
      if (SLUGGY.test(w) && !listed?.has(w) && !ok.has(w)) return false;
    }
  }
  return true;
}

// ---------- bots ----------

/** @returns {import('./types.js').BotRow[]} */
export function botsMerged(days) {
  const acc = new Map();
  for (const d of days || []) {
    const seen = new Set();
    for (const [name, owner, category, files, pages] of d.bots) {
      let r = acc.get(name);
      if (!r) { r = { name, owner, category, purpose: 'other', files: 0, pages: 0, daysSeen: 0, show: false }; acc.set(name, r); }
      // days run oldest to newest, so the last write is the newest day's owner and category
      r.owner = owner || 'Unknown';
      r.category = category;
      r.files += files;
      r.pages += pages;
      if (!seen.has(name)) { seen.add(name); r.daysSeen++; }
    }
  }
  const rows = [...acc.values()];
  for (const r of rows) {
    r.purpose = purposeOf(r.category).key;
    // "Other bots" is the Worker's remainder of small ones, not a bot: it counts, but is never
    // named or counted as one (as "Other programs" is folded in agentsMerged)
    r.show = r.name !== 'Other bots' && displayable('bot', r, days);
  }
  return rows.sort((a, b) => b.pages - a.pages || b.files - a.files || a.name.localeCompare(b.name));
}

// Companies, biggest first. Only displayable bots are named; the rest stay in the kind's total
// and show up as "Other named bots" wherever a list is drawn. Owner "Unknown" goes last.
export function ownersMerged(bots) {
  const acc = new Map();
  for (const b of bots || []) {
    if (!b.show) continue;
    let o = acc.get(b.owner);
    if (!o) { o = { owner: b.owner, pages: 0, files: 0, bots: [] }; acc.set(b.owner, o); }
    o.pages += b.pages; o.files += b.files; o.bots.push(b);
  }
  return [...acc.values()].sort((a, b) =>
    (a.owner === 'Unknown') - (b.owner === 'Unknown') || b.pages - a.pages || b.files - a.files || a.owner.localeCompare(b.owner));
}

export function purposeSums(bots) {
  const out = {};
  for (const k of PURPOSE_KEYS) out[k] = { pages: 0, files: 0 };
  for (const b of bots || []) {
    const o = out[b.purpose] || out.other;
    o.pages += b.pages; o.files += b.files;
  }
  return out;
}

// ---------- per day ----------

export function perDay(days) {
  return (days || []).map((d) => {
    const p = peopleRange([d]);
    return { d: d.d, pages: kindSums([d], 'pages'), req: kindSums([d], 'req'), lo: p.lo, hi: p.hi, loExact: p.loExact, rum: d.rum ? d.rum.loads : null };
  });
}

export function totalsSeries(snap, col) {
  const i = snap?.totals?.col(col) ?? -1;
  const di = snap?.totals?.col('d') ?? 0;
  if (i < 0) return [];
  return snap.totals.rows.map((r) => ({ d: String(r[di < 0 ? 0 : di]), v: num0(r[i]) }));
}

export function trailingMean(series, n = 7) {
  const v = (series || []).map((x) => (typeof x === 'number' ? x : num0(x?.v)));
  const out = new Array(v.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < v.length; i++) {
    s += v[i];
    if (i >= n) s -= v[i - n];
    if (i >= n - 1) out[i] = s / n;
  }
  return out;
}

export function busiestDay(days, measure = 'pages') {
  let best = null;
  for (const d of days || []) {
    const k = kindSums([d], measure);
    if (!best || k.total > best.total) best = { d: d.d, total: k.total, k };
  }
  return best;
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// A day when scanners asked for at least three times their usual (median) day. Over every day
// gathered, whatever range is picked.
export function scannerWave(snap) {
  const days = snap?.days || [];
  if (days.length < 3) return null;
  const vals = days.map((d) => num0(d.req.scanner));
  const med = median(vals);
  let best = 0;
  for (let i = 1; i < vals.length; i++) if (vals[i] > vals[best]) best = i;
  const n = vals[best];
  if (!(n > 0) || n < 3 * med) return null;
  return { d: days[best].d, n, median: med, times: med > 0 ? n / med : Infinity };
}

// ---------- hours in the reader's clock ----------

const fmtCache = new Map();
function zoneFormatter(tz) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }));
  }
  return fmtCache.get(tz);
}
// Minutes the zone is ahead of UTC at instant t.
function offsetAt(f, t) {
  const p = {};
  for (const x of f.formatToParts(new Date(t))) p[x.type] = x.value;
  const wall = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  return Math.round((wall - Math.floor(t / 60000) * 60000) / 60000);
}

const pad2 = (n) => String(n).padStart(2, '0');
const clockLabel = (minuteOfDay) => {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  if (m === 0) return 'midnight';
  if (m === 720) return 'noon';
  const h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12;
  return `${mm ? h12 + ':' + pad2(mm) : h12} ${h < 12 ? 'am' : 'pm'}`;
};
const clockSpan = (start) => {
  const a = ((start % 1440) + 1440) % 1440, b = (a + 60) % 1440;
  const plain = (m) => m !== 0 && m !== 720;
  const short = (m) => { const h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12; return mm ? h12 + ':' + pad2(mm) : String(h12); };
  if (plain(a) && plain(b) && (a < 720) === (b < 720)) return `${short(a)}–${short(b)} ${b < 720 ? 'am' : 'pm'}`;
  return `${clockLabel(a)}–${clockLabel(b)}`;
};

/**
 * People's pages by hour of the reader's own clock. The shift is worked out per day and per
 * hour with Intl, so a range that crosses a daylight-saving change puts each day's hours where
 * they really fell. A zone with a half-hour offset keeps the UTC hour edges and relabels them.
 */
export function hoursLocal(days, tz, through) {
  const bins = new Array(24).fill(0);
  let total = 0;
  if (!tz || tz === 'utc' || tz === 'UTC') {
    for (const d of days || []) for (let h = 0; h < 24; h++) { bins[h] += d.people.hours[h]; total += d.people.hours[h]; }
    return {
      bins, offsetMin: 0, fractional: false, total,
      label: (j) => clockLabel(j * 60), span: (j) => clockSpan(j * 60), utcOf: (j) => j,
    };
  }
  let f;
  try { f = zoneFormatter(tz); } catch (e) { return hoursLocal(days, 'utc', through); }
  const ref = String(through || (days?.length ? days[days.length - 1].d : '1970-01-01'));
  const [ry, rm, rd] = ref.split('-').map(Number);
  const refOff = offsetAt(f, Date.UTC(ry, rm - 1, rd, 12, 0));
  const fractional = refOff % 60 !== 0;
  for (const d of days || []) {
    const [y, m, dd] = d.d.split('-').map(Number);
    // most days have one offset all day: check both ends and only go hour by hour when they differ
    const o0 = offsetAt(f, Date.UTC(y, m - 1, dd, 0, 30)), o23 = offsetAt(f, Date.UTC(y, m - 1, dd, 23, 30));
    for (let h = 0; h < 24; h++) {
      const v = d.people.hours[h];
      if (!v) continue;
      const off = o0 === o23 ? o0 : offsetAt(f, Date.UTC(y, m - 1, dd, h, 30));
      if (!fractional) bins[Math.floor(((((h * 60 + 30 + off) % 1440) + 1440) % 1440) / 60)] += v;
      else bins[(((h + Math.round((off - refOff) / 60)) % 24) + 24) % 24] += v;
      total += v;
    }
  }
  if (fractional) {
    return {
      bins, offsetMin: refOff, fractional, total,
      label: (j) => clockLabel(j * 60 + refOff), span: (j) => clockSpan(j * 60 + refOff), utcOf: (j) => j,
    };
  }
  const shiftH = refOff / 60;
  return {
    bins, offsetMin: refOff, fractional, total,
    label: (j) => clockLabel(j * 60), span: (j) => clockSpan(j * 60),
    utcOf: (j) => (((j - shiftH) % 24) + 24) % 24,
  };
}

// Average people pages per weekday, Monday first, by UTC weekday.
export function weekdayMeans(days) {
  const sums = new Array(7).fill(0), counts = new Array(7).fill(0);
  for (const d of days || []) {
    const [y, m, dd] = d.d.split('-').map(Number);
    const i = (new Date(Date.UTC(y, m - 1, dd)).getUTCDay() + 6) % 7;
    sums[i] += num0(d.pages.person);
    counts[i]++;
  }
  return { means: sums.map((s, i) => (counts[i] ? s / counts[i] : 0)), counts };
}

// ---------- growth ----------

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// The pages-per-day series growth is read from: Cloudflare's daily totals, except that every
// day the detail days cover is counted from them instead (the sum of the five kinds), and
// detail days newer than the last totals row are added at the end. The two tallies differ by a
// few percent; reading "now" from the totals made the Questions sheet say 379 a day while the
// growing chapter and the hero, which count the detail days, said 387. The first month stays on
// the totals: no detail day reaches back that far. Same merge as growing/calc.js mergeSorted().
function growthSeries(snap, days) {
  const totals = totalsSeries(snap, 'pages');
  const by = new Map((days || []).map((d) => [d.d, kindSums([d], 'pages').total]));
  const out = totals.map((r) => {
    if (!by.has(r.d)) return r.v;
    const v = by.get(r.d);
    by.delete(r.d);
    return v;
  });
  const last = totals.length ? totals[totals.length - 1].d : '';
  for (const [d, v] of [...by].sort((x, y) => (x[0] < y[0] ? -1 : 1))) if (d > last) out.push(v);
  return out;
}

export function growth(snap, days) {
  const series = growthSeries(snap, days);
  const n = series.length;
  let a = 0, b = 0, lead;
  if (n < 14) {
    a = mean(series); b = a; lead = 'too-young';
  } else if (n < 28) {
    a = mean(series.slice(0, 7)); b = mean(series.slice(-7)); lead = 'young';
  } else {
    a = mean(series.slice(0, Math.min(30, Math.floor(n / 2))));
    b = mean(series.slice(-30));
  }
  const r = a > 0 ? b / a : (b > 0 ? Infinity : 1);
  // people's share in the first and second half of the detail days
  const det = days || [];
  const half = Math.floor(det.length / 2);
  const share = (ds) => {
    const p = peopleRange(ds), t = kindSums(ds, 'pages').total;
    return { lo: t ? p.lo / t : 0, hi: t ? p.hi / t : 0 };
  };
  // Under two detail days (the first minutes of a backfill) one half is empty: there is no
  // "before" to compare, so no shares, and the lead comes from the totals alone. An empty half
  // read as 0% said "People's share went from 0% to 9–21%" and a false "Yes."
  if (half < 1) {
    if (!lead) lead = r >= 1.15 ? 'yes-machines' : r > 0.87 ? 'flat' : 'down';
    return { a, b, r, rows: n, lead, shares: null };
  }
  const first = share(det.slice(0, half)), second = share(det.slice(half));
  if (!lead) {
    const rose = second.lo - first.lo >= 0.03 || second.hi - first.hi >= 0.03;
    lead = r >= 1.15 ? (rose ? 'yes' : 'yes-machines') : r > 0.87 ? 'flat' : 'down';
  }
  return { a, b, r, rows: n, lead, shares: { first, second } };
}

// ---------- places ----------

export function countryRows(map) {
  return Object.entries(map || {}).map(([code, n]) => ({ code, n: num0(n) })).filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n || a.code.localeCompare(b.code));
}

export function continentRollup(rows, lookup) {
  const get = typeof lookup === 'function' ? lookup : (c) => lookup?.[c];
  const acc = new Map();
  for (const r of rows || []) {
    let k = get(r.code);
    if (Array.isArray(k)) k = k[2];
    if (!k) k = 'XX';
    acc.set(k, (acc.get(k) || 0) + r.n);
  }
  return [...acc].map(([key, n]) => ({ key, n })).sort((a, b) => (a.key === 'XX') - (b.key === 'XX') || b.n - a.n);
}

// ---------- pages people read ----------

const normPath = (p) => {
  const s = String(p || '');
  if (!s.startsWith('/')) return s;
  return s.endsWith('/') || /\.[a-z0-9]+$/i.test(s.split('/').pop()) ? s : s + '/';
};
const normList = (list) => {
  const m = new Map();
  for (const [k, v] of list || []) { const p = normPath(k); m.set(p, (m.get(p) || 0) + v); }
  return [...m];
};

/** @returns {import('./types.js').PathRow[]} */
export function pathsPeople(days, build) {
  const rows = mergeTop(days, (d) => normList(d.people.paths), 40);
  const out = [];
  for (const r of rows) {
    if (!isPublicPath(r.key, build)) continue;
    const l = pathLabel(r.key, build);
    out.push({ path: r.key, n: r.n, partial: r.partial, ...l });
  }
  return out;
}

// One path's people pages per day. null means the path wasn't in that day's top-40 list, so the
// day may have had a few below the cut; a day whose list was shorter than 40 really had none.
export function pathDaily(days, path) {
  const want = normPath(path);
  return (days || []).map((d) => {
    const list = normList(d.people.paths);
    const hit = list.find(([k]) => k === want);
    if (hit) return { d: d.d, n: hit[1] };
    return { d: d.d, n: d.people.paths.length >= 40 ? null : 0 };
  });
}

export function referrersMerged(days) {
  let none = 0, total = 0;
  const byHost = new Map();
  for (const d of days || []) {
    for (const [host, n] of d.rum ? d.rum.referrers : []) {
      total += n;
      if (!host) { none += n; continue; }
      byHost.set(host, (byHost.get(host) || 0) + n);
    }
  }
  const byLabel = new Map();
  let shown = 0;
  for (const [host, n] of byHost) {
    if (!displayable('host', { host, n }, days)) continue;
    const label = referrerLabel(host) || normHost(host);
    const cur = byLabel.get(label) || { host: normHost(host), label, n: 0 };
    cur.n += n;
    byLabel.set(label, cur);
    shown += n;
  }
  const rows = [...byLabel.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  return { none, total, rows, other: Math.max(0, total - none - shown) };
}

export function probesMerged(days, build) {
  const merged = mergeTop(days, (d) => d.probes, 25);
  const rows = [];
  let shown = 0;
  for (const r of merged) {
    if (!isPublicPath(r.key, build)) continue;
    if (!displayable('probe', { path: r.key, n: r.n }, days)) continue;
    rows.push({ path: r.key, n: r.n, partial: r.partial, family: probeFamily(r.key).key });
    shown += r.n;
  }
  const total = (days || []).reduce((s, d) => s + num0(d.req.scanner), 0);
  return { rows, shown, total };
}

// Programs, biggest first. Names below the display threshold fold into "Other programs" (which
// the server already uses for its own long tail), so their files still count.
export function agentsMerged(days) {
  const merged = mergeMap(days, (d) => Object.fromEntries(d.agents.reduce((m, [k, v]) => m.set(k, (m.get(k) || 0) + v), new Map())));
  const out = [];
  let other = 0;
  for (const r of merged) {
    if (r.key === 'Other programs') { other += r.n; continue; }
    // the label as the page says it: §C.2 keeps "user agent" off the page
    if (displayable('program', { label: r.key }, days)) out.push({ label: PROGRAM_SHOWN[r.key] || r.key, n: r.n, show: true });
    else other += r.n;
  }
  if (other > 0) out.push({ label: 'Other programs', n: other, show: true });
  return out;
}

export function staleMerged(days) {
  const merged = mergeMap(days, (d) => Object.fromEntries(d.stale.reduce((m, [k, v]) => m.set(k, (m.get(k) || 0) + v), new Map())));
  const rest = merged.filter((r) => r.key === 'Other old browsers');
  return [...merged.filter((r) => r.key !== 'Other old browsers'), ...rest].map((r) => ({ label: r.key, n: r.n }));
}

export { KIND_SET };
