// How every number and date on /stats is written. Pure (no DOM), en-US, and dates are UTC unless
// the function's name says "local": the snapshot's days run midnight to midnight UTC, and a
// reader west of UTC would otherwise see every day labelled a day early (the same trap the
// ledger fell into, see CLAUDE.md "Post dates are formatted in UTC on purpose").
//
// Plain-English rounding, the rules the copy relies on:
// - exact counts print exactly; estimates (Cloudflare's counter) go through approx() and the
//   caller writes "about";
// - shares under 1% say "under 1%", and shares are never forced to sum to 100;
// - sentences use frac() ("2 in 3"), charts use pct().

const NF = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const NF1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

const finite = (n) => (Number.isFinite(n) ? n : 0);

export const num = (n) => NF.format(Math.round(finite(n)));

// Estimates are rounded to tens from 100 up, so "about 1,030" never pretends to know the 1,027.
export const approx = (n) => {
  const v = finite(n);
  return Math.abs(v) < 100 ? num(v) : num(Math.round(v / 10) * 10);
};

// Axis ticks only: 950, 1.2K, 11K, 1.3M.
export const compact = (n) => {
  const v = finite(n), a = Math.abs(v);
  const one = (x) => NF1.format(Math.round(x * 10) / 10);
  if (a < 1000) return num(v);
  if (a < 10_000) return one(v / 1000) + 'K';
  if (a < 1_000_000) return num(v / 1000) + 'K';
  if (a < 10_000_000) return one(v / 1e6) + 'M';
  if (a < 1e9) return num(v / 1e6) + 'M';
  return one(v / 1e9) + 'B';
};

export const pct = (x) => {
  const v = finite(x);
  if (v <= 0) return '0%';
  if (v < 0.01) return 'under 1%';
  return Math.round(v * 100) + '%';
};

export const pctRange = (a, b) => {
  const lo = Math.round(finite(a) * 100), hi = Math.round(finite(b) * 100);
  return lo === hi ? lo + '%' : `${lo}–${hi}%`;
};

// The simplest fraction within two points, in the order a person would reach for them.
const FRACS = [
  [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [1, 10], [1, 20],
];
export const frac = (x) => {
  const v = finite(x);
  if (v >= 0.45 && v <= 0.55) return 'about half';
  for (const [a, b] of FRACS) if (Math.abs(v - a / b) <= 0.02 + 1e-9) return `${a} in ${b}`;
  return pct(v);
};

// A people range's low end is usually Cloudflare's counter, an estimate, so it is rounded like
// one (approx): the sorted chart's chip must say 1,080 where the hero does, not 1,079. But on a
// "swapped" day the counter came out above the server's count, and the low end IS the server's
// count, exact: 127 must print as 127, or the page says "127 passed" and "130 to 165" about one
// day. So both calls take either two numbers (lo is then an estimate) or a range from agg
// (peopleRange, perDay, a view's people), whose `loExact` says which it is:
//   range(1079, 1767) -> "1,080–1,767"     range({ lo: 127, hi: 165, loExact: true }) -> "127–165"
// Rounding the low end can carry it past the high end when the two counts nearly agree (105 and
// 108 would print "110–108"), so the rounded low end never goes above the high one, and when
// they meet it is one number.
const lowOf = (lo, exact) => {
  const l = Math.round(finite(lo));
  return exact || l < 100 ? l : Math.round(finite(lo) / 10) * 10;
};
function rangeParts(a, b) {
  const r = a && typeof a === 'object' ? a : { lo: a, hi: b, loExact: false };
  const h = Math.round(finite(r.hi));
  const l = Math.min(h, lowOf(r.lo, !!r.loExact));
  return l === h ? { one: num(h) } : { lo: num(l), hi: num(h) };
}
export const range = (a, b) => { const p = rangeParts(a, b); return p.one ?? `${p.lo}–${p.hi}`; };
export const rangeSpoken = (a, b) => { const p = rangeParts(a, b); return p.one ?? `${p.lo} to ${p.hi}`; };
// The low end alone, for sentences that put words between the two ends: "about 1,080" when it is
// the counter's estimate (from 100 up), the plain count when it is exact. Takes a range from agg.
export const lowSpoken = (r) => {
  const exact = !!(r && r.loExact);
  const l = lowOf(r?.lo, exact);
  return exact || l < 100 ? num(l) : 'about ' + num(l);
};

// Decimal units, as Cloudflare reports them. One decimal under 10 of a unit, and for gigabytes
// under 100 too ("12.4 GB": a whole gigabyte is too coarse for a month of this site).
export const bytes = (b) => {
  const v = finite(b);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0, x = Math.abs(v);
  while (x >= 1000 && i < units.length - 1) { x /= 1000; i++; }
  if (i === 0) return num(v) + ' B';
  const s = x < 10 || (i >= 3 && x < 100) ? NF1.format(Math.round(x * 10) / 10) : num(x);
  return (v < 0 ? '-' : '') + s + ' ' + units[i];
};

export const secs = (msv) => {
  const s = finite(msv) / 1000;
  if (s < 1) return String(parseFloat(s.toFixed(2))) + ' s'; // 0.68 s, but 0.8 s, not 0.80
  return (Math.round(s * 10) / 10).toString() + ' s';
};
export const ms = (n) => num(n) + ' ms';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const parseDay = (d) => {
  const [y, m, dd] = String(d).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, dd || 1));
};

export const day = (d, style = 'short') => {
  const t = parseDay(d);
  const wd = t.getUTCDay(), dd = t.getUTCDate(), mo = t.getUTCMonth();
  if (style === 'long') return `${WDL[wd]} ${dd} ${MOL[mo]}`;
  if (style === 'axis') return `${dd} ${MO[mo]}`;
  if (style === 'eyebrow') return `${WD[wd]} ${dd} ${MO[mo]}`.toUpperCase();
  return `${WD[wd]} ${dd} ${MO[mo]}`;
};

export const span = (from, to) => (from === to ? day(to, 'axis') : `${day(from, 'axis')}–${day(to, 'axis')}`);

export const times = (r) => {
  const v = finite(r);
  if (v >= 0.45 && v <= 0.55) return 'half';
  if (v >= 1.75 && v < 1.9) return 'nearly twice';
  if (v >= 1.9 && v <= 2.1) return 'about twice';
  if (v > 2.1 && v <= 2.25) return 'more than twice';
  if (v >= 2.9 && v <= 3.1) return 'about three times';
  return (Math.round(v * 10) / 10).toString() + ' times';
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
// Rounded to the nearest half year: "a year", "a year and a half", "seven years".
export const yearsWord = (n) => {
  const h = Math.round(finite(n) * 2) / 2;
  if (h <= 0) return 'under half a year';
  if (h === 0.5) return 'half a year';
  if (h === 1) return 'a year';
  if (h === 1.5) return 'a year and a half';
  const whole = Math.floor(h), half = h !== whole;
  const w = whole <= 20 ? WORDS[whole] : num(whole);
  return half ? `${w} and a half years` : `${w} years`;
};

let regionNames = null;
const countryCache = new Map();
export const country = (code) => {
  const c = String(code || '').toUpperCase();
  if (!c || c === 'XX') return 'Unknown';
  if (c === 'T1') return 'Tor network';
  if (countryCache.has(c)) return countryCache.get(c);
  let name = c;
  try {
    regionNames = regionNames || new Intl.DisplayNames(['en'], { type: 'region' });
    name = regionNames.of(c) || c;
  } catch (e) { name = c; }
  countryCache.set(c, name);
  return name;
};
const THE = new Set(['US', 'GB', 'NL', 'AE', 'PH', 'DO', 'BS', 'GM', 'CF', 'KM', 'MV', 'SC', 'SB', 'MH', 'VA', 'CD', 'CG']);
export const countryIn = (code) => (THE.has(String(code || '').toUpperCase()) ? 'the ' : '') + country(code);

export const list = (items) => {
  const a = (items || []).filter((x) => x != null && x !== '');
  if (a.length <= 1) return a.join('');
  return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
};

export const plural = (n, one, many) => (n === 1 ? one : many);

// Clock labels in plain words: midnight, noon, 8 pm, 5:30 am.
const clock = (minuteOfDay, withMeridiem = true) => {
  const m = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440;
  if (m === 0) return 'midnight';
  if (m === 720) return 'noon';
  const h = Math.floor(m / 60), mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const t = mm ? `${h12}:${String(mm).padStart(2, '0')}` : String(h12);
  return withMeridiem ? `${t} ${h < 12 ? 'am' : 'pm'}` : t;
};
export const hourLabel = (minuteOfDay) => clock(minuteOfDay);
export const hourSpan = (startMin) => {
  const a = ((Math.round(startMin) % 1440) + 1440) % 1440, b = (a + 60) % 1440;
  const special = (m) => m === 0 || m === 720;
  const merA = a < 720 ? 'am' : 'pm', merB = b < 720 ? 'am' : 'pm';
  if (!special(a) && !special(b) && merA === merB) return `${clock(a, false)}–${clock(b, false)} ${merB}`;
  return `${clock(a)}–${clock(b)}`;
};

// "Sun 18 Oct, 2:24 am your time", in the reader's own zone.
export const localStamp = (iso, timeZone) => {
  const t = new Date(iso);
  if (isNaN(t)) return '';
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(t);
  } catch (e) {
    return utcStamp(iso);
  }
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const mins = (Number(p.hour) % 24) * 60 + Number(p.minute);
  return `${p.weekday} ${p.day} ${p.month}, ${clock(mins)} your time`;
};

export const utcStamp = (iso) => {
  const t = new Date(iso);
  if (isNaN(t)) return '';
  const hh = String(t.getUTCHours()).padStart(2, '0'), mm = String(t.getUTCMinutes()).padStart(2, '0');
  return `${WD[t.getUTCDay()]} ${t.getUTCDate()} ${MO[t.getUTCMonth()]}, ${hh}:${mm} UTC`.toUpperCase();
};

export const tzZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; }
};
export const tzCity = (zone = tzZone()) => {
  if (!zone || zone === 'UTC' || zone === 'Etc/UTC' || zone === 'Etc/GMT') return 'UTC';
  const last = zone.split('/').pop() || 'UTC';
  return last.replace(/_/g, ' ');
};

// What time it is where the reader is when a UTC day starts: "8 pm".
export const utcMidnightLocal = (timeZone, at = new Date()) => {
  const t = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(t);
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    return clock((Number(p.hour) % 24) * 60 + Number(p.minute));
  } catch (e) {
    return 'midnight';
  }
};

// Round axis ticks from zero, the same step rule as <ao-series> in post-components.js.
const niceStep = (v) => {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
};
export const niceTicks = (max, count = 3) => {
  const m = finite(max);
  if (m <= 0) return [0, 1];
  const step = niceStep(m / Math.max(1, count - 1));
  const top = Math.max(step, Math.ceil(m / step - 1e-9) * step);
  const out = [];
  for (let v = 0; v <= top + step / 1000; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
};
