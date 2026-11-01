// The copy the read-aloud voice reads (sections.js at build time, worker/read/ at run time). Numbers, money, units,
// ids, dates, ranges and times are spelled out, since Flash reads digits as it likes and only Enterprise can turn its
// own normaliser on. The screen never changes: the map ties each spoken run back to the display run it came from.
const ONES = ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen '
  + 'seventeen eighteen nineteen').split(' ');
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand'], [100, 'hundred']];
const MONTHS = 'January February March April May June July August September October November December'.split(' ');
const MONTH = MONTHS.map((m) => m.slice(0, 3) + (m.length > 3 ? `(?:${m.slice(3)})?` : '')).join('|'); // Oct, October
const UNITS = { '%': 'percent', x: 'times', ms: 'millisecond', s: 'second', min: 'minute', h: 'hour', KB: 'kilobyte',
  MB: 'megabyte', GB: 'gigabyte', TB: 'terabyte', Hz: 'hertz', kHz: 'kilohertz', MHz: 'megahertz', GHz: 'gigahertz',
  px: 'pixel', fps: 'frames per second' };
const BIG = { K: 'thousand', M: 'million', B: 'billion' };
const ORDINAL = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth',
  twelve: 'twelfth' };

function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  const [v, name] = SCALES.find(([v]) => n >= v);
  return words(Math.floor(n / v)) + ' ' + name + (n % v ? ' ' + words(n % v) : '');
}
// 2026 "twenty twenty-six", 1080 "ten eighty", 1900 "nineteen hundred", 2005 "two thousand five", 720 "seven twenty".
const pairs = (n) => (n % 1000 === 0 || (n >= 2000 && n < 2010) ? words(n) : words(Math.floor(n / 100))
  + (n % 100 === 0 ? ' hundred' : n % 100 < 10 ? ' oh ' + ONES[n % 100] : ' ' + words(n % 100)));
const digits = (s) => [...s].map((d) => ONES[d]).join(' ');
const ordinal = (w) => w.replace(/[a-z]+$/, (x) => ORDINAL[x] || x.replace(/y$/, 'ie') + 'th');
const count = (n, unit) => `${words(n)} ${unit}${n === 1 ? '' : 's'}`;
const plural = (w) => w.replace(/[a-z]+$/, (x) => x.replace(/y$/, 'ie') + 's');
const COUNTED = /^\w*(second|minute|hour|byte|pixel)$/; // a unit said in the plural: not percent, times, hertz, fps
const unit = (u, n) => (n === '1' || !COUNTED.test(UNITS[u]) ? UNITS[u] : UNITS[u] + 's');
const month = (m) => MONTHS.find((full) => full.startsWith(m.slice(0, 3)));

// A written number: 1,308 in full, a bare four-digit one in pairs (years, model numbers), a leading zero digit by
// digit.
function number(s) {
  const [int, frac] = s.replace(/,/g, '').split('.');
  const whole = /^0\d/.test(int) || int.length > 12 ? digits(int)
    : !s.includes(',') && int.length === 4 ? pairs(Number(int)) : words(Number(int));
  return frac === undefined ? whole : `${whole} point ${digits(frac)}`;
}
function money({ cash, big, dash }) {
  const [int, frac = ''] = cash.replace(/,/g, '').split('.');
  const d = Number(int), c = Number(frac.padEnd(2, '0'));
  const said = big || frac.length > 2 ? `${number(cash)}${big ? ' ' + BIG[big] : ''} dollars`
    : [d || !c ? `${words(d)} dollar${d === 1 ? '' : 's'}` : '', c ? `${words(c)} cent${c === 1 ? '' : 's'}` : '']
      .filter(Boolean).join(' and ');
  return said + (dash ? ' ' : '');
}

// A number and its unit, trailing zeros dropped: 15.8 s "fifteen point eight seconds", 20.000 s "twenty seconds".
function measure(written, u) {
  const n = written.includes('.') ? written.replace(/\.?0+$/, '') : written;
  return `${number(n)} ${unit(u, n)}`;
}
// A clock time: 9:30 "nine thirty", 9:05 "nine oh five", 10:00 "ten o'clock", 20:00 "twenty hundred", 00:42 "twelve
// forty-two", 00:00 "midnight", 05:37:28 "five thirty-seven and twenty-eight seconds".
function clock(h, m, s) {
  const n = Number(h);
  const said = m !== '00' ? `${words(n || 12)} ${m[0] === '0' ? 'oh ' + ONES[m[1]] : words(Number(m))}`
    : n === 0 ? 'midnight' : `${words(n)} ${n <= 12 ? "o'clock" : 'hundred'}`;
  return s === undefined || s === '00' ? said : `${said} and ${count(Number(s), 'second')}`;
}
// A length, or a place in a recording: 1:02:03 "one hour, two minutes and three seconds", 30:00.000 "thirty minutes",
// 00:05 "five seconds", 0:12.9 "twelve point nine seconds".
function duration(h, m, s, f = '') {
  const frac = f.replace(/0+$/, '');
  const parts = [[h, 'hour'], [m, 'minute']].filter(([v]) => Number(v)).map(([v, u]) => count(Number(v), u));
  if (Number(s) || frac || !parts.length) {
    parts.push(frac ? `${words(Number(s))} point ${digits(frac)} seconds` : count(Number(s), 'second'));
  }
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
}
// A written time with nothing around it to say which it is goes by its shape. A fraction of a second, a first field
// no clock has (30:20, 79:32), a one-digit hour before minutes and seconds (1:02:03), a zero hour (00:05, 0:59) or an
// afternoon hour on the hour (20:00: in the posts a clock on the hour carries its zone, a film's twentieth minute
// doesn't) make it a length or a place in a recording; the rest reads as a clock, which is also how a person says a
// song is 2:45.
function timeOf(a, b, c, f) {
  const length = f !== undefined || Number(a) >= 24
    || (c === undefined ? Number(a) === 0 || (Number(a) > 12 && b === '00') : a.length === 1);
  if (!length) return clock(a, b, c);
  return c === undefined ? duration(undefined, a, b, f) : duration(a, b, c, f);
}

const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
const UNIT = String.raw`%|ms|min|s|h|[KMGT]B|[kMG]?Hz|px|fps|x`;
const FREE = String.raw`(?<![\w.,:$])`; // not the tail of a word, a decimal, a time or a price
const END = String.raw`(?!\w|[.,]\d)`; // nor the head of one (a version number like 4.1.2 is left as written)
const TIME_END = String.raw`(?!\w|[.,:]\d)`;
// A time is a clock's after a date (26 Sep 18:11; 20 Oct 2026, 23:36 to 00:10) or before a time zone, its own or its
// range's (00:30 UTC; 19:00 to midnight UTC).
const AFTER_DATE = String.raw`(?<=\b\d{1,2} (?:${MONTH})(?: \d{4})?,? (?:\d{1,2}:\d\d(?: to |[-–]))?)`;
const ZONE = String.raw`(?=\d{1,2}:\d\d(?::\d\d)?(?:(?: to |[-–])(?:\d{1,2}:\d\d|midnight|noon))? ?(?:UTC|GMT)\b)`;
const CLOCK_SIGN = String.raw`(?:${AFTER_DATE}|${ZONE})`;
const RULES = [
  [String.raw`${FREE}(?<Y>\d{4})-(?<Mo>0[1-9]|1[0-2])-(?<D>0[1-9]|[12]\d|3[01])${END}`,
    (g) => `${MONTHS[g.Mo - 1]} ${ordinal(words(Number(g.D)))}, ${pairs(Number(g.Y))}`],
  [String.raw`${FREE}(?<dm>[1-9]|[12]\d|3[01]) (?<mon>${MONTH})\b`,
    (g) => `the ${ordinal(words(Number(g.dm)))} of ${month(g.mon)}`],
  [String.raw`\b(?<mon2>${MONTH}) (?<md>[1-9]|[12]\d|3[01])${END}`,
    (g) => `${month(g.mon2)} ${ordinal(words(Number(g.md)))}`],
  [String.raw`\bAO-(?<ao>\d{1,4})\b`, (g) => `A O ${words(Number(g.ao))}`],
  [String.raw`\$(?<cash>${NUM})(?<big>[KMB](?!\w))?(?<dash>-(?=[A-Za-z]))?`, money],
  [String.raw`${FREE}(?<a>${NUM})[-–](?<b>${NUM})(?:\s?(?<ru>${UNIT}))?${END}`,
    (g) => `${number(g.a)} to ${number(g.b)}${g.ru ? ' ' + unit(g.ru, g.b) : ''}`],
  [String.raw`${FREE}(?<res>\d{3,4})p${END}`, (g) => `${pairs(Number(g.res))} p`],
  [String.raw`${FREE}(?<dec>[2-9]0|1[89]\d0|20\d0)s${END}`, (g) => plural(number(g.dec))],
  [String.raw`${FREE}(?<ord>\d+)(?:st|nd|rd|th)${END}`, (g) => ordinal(words(Number(g.ord)))],
  [String.raw`${FREE}${CLOCK_SIGN}(?<ch>[01]?\d|2[0-3]):(?<cm>[0-5]\d)(?::(?<cs>[0-5]\d))?${TIME_END}`,
    (g) => clock(g.ch, g.cm, g.cs)],
  [String.raw`${FREE}(?<th>\d{1,3}):(?<tm>[0-5]\d)(?::(?<ts>[0-5]\d))?(?:\.(?<tf>\d+))?${TIME_END}`,
    (g) => timeOf(g.th, g.tm, g.ts, g.tf)],
  [String.raw`${FREE}(?<dh>\d+)h(?<dn>[0-5]?\d)m${END}`, (g) => duration(g.dh, g.dn, '0')], // 8h39m
  [String.raw`${FREE}(?<ra>\d+(?:\.\d+)?):(?<rb>\d)${TIME_END}`, (g) => `${number(g.ra)} to ${words(Number(g.rb))}`],
  [String.raw`${FREE}(?<n>${NUM})\s?(?<u>${UNIT})${END}`, (g) => measure(g.n, g.u)],
  [String.raw`${FREE}(?<plain>${NUM})${END}`, (g) => number(g.plain)],
];
const RE = new RegExp(RULES.map(([r], i) => `(?<r${i}>${r})`).join('|'), 'g');

// One display text → { text, map }: map holds [spokenStart, spokenLength, displayStart, displayLength] runs.
export function say(display) {
  let text = '', at = 0;
  const map = [];
  const put = (spoken, d, dl) => { map.push([text.length, spoken.length, d, dl]); text += spoken; };
  for (const m of display.matchAll(RE)) {
    if (m.index > at) put(display.slice(at, m.index), at, m.index - at);
    const rule = RULES.find((_, i) => m.groups['r' + i] !== undefined)[1];
    put(rule(m.groups), m.index, m[0].length);
    at = m.index + m[0].length;
  }
  if (display.length > at) put(display.slice(at), at, display.length - at);
  return { text, map };
}

// A section's blocks [[r, kind, text]] → the text sent, blocks apart by a blank line, a heading or list item without
// its own closing punctuation ended with a full stop.
// map: [spokenStart, spokenLength, block, displayStart, displayLength].
export function spoken(blocks) {
  let text = '';
  const map = [];
  blocks.forEach(([, kind, display], j) => {
    if (j) text += '\n\n';
    const s = say(display);
    for (const [s0, sl, d0, dl] of s.map) map.push([text.length + s0, sl, j, d0, dl]);
    text += s.text + ((kind === 'h' || kind === 'li') && !/[.!?:;…]["'”’)\]]*$/.test(display) ? '.' : '');
  });
  return { text, map };
}

// Where spoken character k came from: [block, display offset], spread evenly across a spelled-out run, or null for
// what the copy added (the gaps between blocks, a full stop).
export function toDisplay(map, k) {
  let lo = 0, hi = map.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [s0, sl, j, d0, dl] = map[mid];
    if (k < s0) hi = mid - 1;
    else if (k >= s0 + sl) lo = mid + 1;
    else return [j, d0 + Math.floor(((k - s0) * dl) / sl)];
  }
  return null;
}
