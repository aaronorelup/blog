// The Questions index: every question a newcomer asked in testing (DESIGN §B.2), where its answer
// lives on the page, and a live one-line answer computed from whatever range the bar is set to.
// Pure (no DOM): questions.js draws the sheet, Node tests the sentences.
//
// Each answer is plain text. A template that can't be filled (no bots in a one-day range, no
// speed numbers in the filing) says so in words rather than printing a zero or a dash, and one
// that throws is caught by the caller, so a single odd day can't take the whole sheet down.
//
// An answer that has a chapter behind it computes its number the way that chapter does, with
// the chapter's own function, so a reader who taps through finds the same figure there: the
// growth answer's "now" comes from growthOnSorted (chapter 02), the weekday answer from the
// people range per weekday (the rhythm row), never a third tally of its own.
import { readYou, classifyYou } from '../core/browser.js';
import { growthOnSorted } from '../growing/calc.js';
import { weekdayRange } from '../rhythm/geom.js';

export const GROUPS = ['People', 'Machines', 'Time', 'Place', 'Speed', 'This page'];

const UNPLACED = new Set(['XX', 'T1', '']);
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VERDICT = {
  'machines-all': 'All machines', machines: 'Mostly machines', people: 'Mostly people',
  half: 'About half and half', unclear: 'Hard to call',
};
const FAMILY_WORDS = {
  wordpress: 'WordPress setup pages', secrets: 'password files', code: 'code history',
  php: 'leftover scripts', admin: 'login pages',
};
const GROWTH_LEAD = {
  yes: 'Yes', 'yes-machines': 'Yes, mostly with machines', flat: 'Not really', down: "No, it's quieter than it was",
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const famKey = (f) => (typeof f === 'string' ? f : f && f.key) || 'other';

// "about 1,030" for estimates of 100 or more, the exact number below that (DESIGN §D.5).
const about = (fmt, n) => (n < 100 ? fmt.num(n) : 'about ' + fmt.approx(n));
// "1 page", "12 pages": a count the reader sees with its noun, never "1 pages".
const pg = (fmt, n) => `${fmt.num(n)} ${fmt.plural(Math.round(n), 'page', 'pages')}`;
// An average day's people range, rounded the way the rhythm chapter's weekday row rounds it
// (one decimal under 10), so "78 to 112" here is "78–112" there.
const perDayN = (n) => (n < 10 ? String(Math.round(n * 10) / 10) : Math.round(n).toLocaleString('en-US'));
const dayRange = (lo, hi) => (perDayN(lo) === perDayN(hi) ? perDayN(hi) : `${perDayN(lo)} to ${perDayN(hi)}`);

function peopleLine(c, view, tail) {
  const { fmt } = c;
  const p = view.people;
  if (!view.pages.total) return `No pages at all ${view.phrase.long}.`;
  if (!p.loRaw) return `Up to ${pg(fmt, p.hi)}${tail}; Cloudflare's counter heard from no one.`;
  if (p.lo === p.hi) return `${cap(about(fmt, p.hi))} ${fmt.plural(Math.round(p.hi), 'page', 'pages')}${tail}.`;
  // The low end is rounded only when it is the counter's estimate (fmt.lowSpoken reads loExact):
  // on a day the counter came out higher, the low end is the server's exact 127, never "about 130".
  // When rounding makes the two ends meet, fmt says one number, and so does this line.
  const span = fmt.rangeSpoken(p);
  if (!span.includes(' to ')) return `${p.loExact ? '' : 'About '}${span} ${fmt.plural(Math.round(p.hi), 'page', 'pages')}${tail}.`;
  return `Between ${fmt.lowSpoken(p)} and ${fmt.num(p.hi)} pages${tail}.`;
}

// The busiest day for people, by the high end, then the low end.
function peopleBusiest(view) {
  let best = null;
  for (const r of view.perDay || []) {
    if (!best || r.hi > best.hi || (r.hi === best.hi && r.lo > best.lo)) best = r;
  }
  return best;
}

function postNear(c, d) {
  const posts = (c.build && c.build.posts) || [];
  const on = posts.find((p) => p.date === d);
  if (on) return `, the day ${on.id} went up`;
  const prev = new Date(Date.parse(d + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
  const after = posts.find((p) => p.date === prev);
  if (after) return `, the day after ${after.id} went up`;
  return null;
}

const placedPeople = (view) => ((view.countries && view.countries.people) || []).filter((r) => r.n > 0 && !UNPLACED.has(r.code));
const notFound = (view) => ((view.probeStatus || []).find((r) => String(r.code) === '404') || { n: 0 }).n;
const findBot = (view, name) => (view.bots || []).find((b) => b.name === name);
const findOwner = (view, owner) => (view.owners || []).find((o) => String(o.owner).toLowerCase() === owner);

function speedLead(vt) {
  const devs = [vt.desktop, vt.mobile].filter((d) => d && d.n > 0);
  if (!devs.length) return null;
  let misses = 0;
  for (const d of devs) misses += (d.lcp > 2500) + (d.inp > 200) + (d.cls > 0.1);
  if (devs.every((d) => d.lcp > 2500)) return 'Slow';
  if (misses === 0) return 'Fast';
  if (misses === 1) return 'Mostly fast';
  return 'Slower than it should be';
}

const youVerdict = {
  person: 'as probably a person',
  agent: 'with scripts and agents',
  stale: 'on the costume rack, with the old browsers',
};

// Every question: n (its number in §B.2), group, the question, tags (extra words the filter
// should find it by), where it lands, and the live answer. q and route may be functions when they
// depend on the data (the second country, the busiest day).
export const QUESTIONS = [
  { n: 1, group: 'People', q: 'How many people read this site?', tags: ['visitors', 'readers', 'humans', 'count', 'aaron', 'who', 'real', 'views', 'pageviews', 'hits', 'audience', 'visits'],
    route: () => '#/top', a: (c, v) => peopleLine(c, v, ', Aaron included') },
  { n: 2, group: 'Machines', q: 'Is it mostly bots?', tags: ['machines', 'robots', 'bot', 'crawler', 'hits', 'requests', 'real'],
    route: () => '#/top/bot',
    a: (c, v) => {
      const { fmt } = c;
      if (!v.pages.total) return `No pages at all ${v.phrase.long}.`;
      const word = VERDICT[v.verdict] || 'Hard to call';
      // The low end is exact (everything minus the most people could be); the high end leans on
      // the counter's estimate, so only it is rounded, and not even it when the people range's low
      // end is an exact count (a day the counter came out higher): then 708 - 127 is 581, not 580.
      // Compared as printed, so a one-page gap never reads "120 to 120".
      const mh = v.machines.hi;
      const lo = fmt.num(v.machines.lo), hi = mh < 100 || v.people.loExact ? fmt.num(mh) : fmt.approx(mh);
      const span = lo === hi ? lo : `${lo} to ${hi}`;
      return `${word}: ${span} of ${pg(fmt, v.pages.total)}.`;
    } },
  { n: 3, group: 'This page', q: 'Why is the people number a range?', tags: ['range', 'estimate', 'counter', 'blockers', 'accuracy'],
    route: () => '#/how/range',
    a: () => "Cloudflare's counter misses ad-blocked people; the server's count includes bots in costume." },
  { n: 4, group: 'This page', q: 'How do you tell people from bots?', tags: ['sorting', 'questions', 'method', 'classify', 'sieve', 'bot'],
    route: () => '#/how', a: () => 'Four questions in order; the first yes decides.' },
  { n: 5, group: 'Machines', q: 'Does AI read this site?', tags: ['ai', 'chatgpt', 'openai', 'claude', 'perplexity', 'crawler', 'bot', 'llm'],
    route: () => '#/machines/bots/ai',
    a: (c, v) => {
      const { fmt } = c;
      const ai = v.purposes.ai.pages, search = v.purposes.search.pages;
      if (!ai) return `Not ${v.phrase.long}: no AI bots came.`;
      if (!search) return `Yes: AI bots fetched ${pg(fmt, ai)}, and search engines none.`;
      return `Yes: AI bots fetched ${pg(fmt, ai)}, ${fmt.times(ai / search)} what search engines did.`;
    } },
  { n: 6, group: 'Machines', q: 'Does ChatGPT visit?', tags: ['chatgpt', 'openai', 'gpt', 'gptbot', 'ai'],
    route: () => '#/machines/bots/openai',
    a: (c, v) => {
      const o = findOwner(v, 'openai');
      if (!o || !o.pages) return `No OpenAI bots fetched a page ${v.phrase.long}.`;
      return `OpenAI's bots fetched ${pg(c.fmt, o.pages)}; ChatGPT-User fetches a page when someone asks ChatGPT something.`;
    } },
  { n: 7, group: 'Machines', q: 'Does Google visit?', tags: ['google', 'googlebot', 'search', 'seo'],
    route: () => '#/machines/bots/google',
    a: (c, v) => {
      const b = findBot(v, 'Googlebot');
      if (!b || !(b.pages || b.files)) return `Googlebot didn't come ${v.phrase.long}.`;
      return `Googlebot came on ${b.daysSeen} of ${v.n} ${c.fmt.plural(v.n, 'day', 'days')}: ${pg(c.fmt, b.pages)}.`;
    } },
  { n: 8, group: 'Machines', q: 'What are scanners looking for?', tags: ['scanner', 'wordpress', 'env', 'probe', 'hack', '404', 'doors'],
    route: () => '#/machines/scanners',
    a: (c, v) => {
      const { fmt } = c;
      const knocks = v.files.scanner;
      if (!knocks) return `Nobody tried the wrong doors ${v.phrase.long}.`;
      const by = new Map();
      for (const r of (v.probes && v.probes.rows) || []) {
        const k = famKey(r.family);
        if (FAMILY_WORDS[k]) by.set(k, (by.get(k) || 0) + r.n);
      }
      const top = [...by].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => FAMILY_WORDS[k]);
      const what = top.length ? `Mostly ${fmt.list(top)}` : 'Pages that were never here';
      // Most knocks, not all: some get a refusal or an error, and a few ask for files the site
      // really has (/favicon.ico, /sitemap.xml), so the count of 'not found' is said as it is.
      const n404 = notFound(v);
      const doors = n404 >= knocks ? "all on doors that don't exist" : `mostly on doors that don't exist (${fmt.num(n404)} got 'not found')`;
      return `${what}: ${fmt.num(knocks)} knocks, ${doors}.`;
    } },
  { n: 9, group: 'Machines', q: 'Is anyone attacking the site?', tags: ['attack', 'hack', 'security', 'scanner', 'safe', 'threat'],
    route: () => '#/machines/scanners',
    a: (c, v) => {
      const n404 = notFound(v);
      if (!v.files.scanner) return `No scanners ${v.phrase.long}.`;
      return `Scanners try doors; ${c.fmt.num(n404)} got 'not found'. There's no WordPress here to break into.`;
    } },
  { n: 10, group: 'Machines', q: 'What are "old browsers"?', tags: ['stale', 'outdated', 'costume', 'disguise', 'version'],
    route: () => '#/top/stale',
    a: (c, v) => `${pg(c.fmt, v.pages.stale)} to browsers over a year out of date, most of them probably bots in costume.` },
  { n: 11, group: 'People', q: 'How much of this is Aaron?', tags: ['aaron', 'owner', 'himself', 'me', 'agents'],
    route: () => '#/top/person',
    a: (c, v) => `His own browsing is inside 'people', and his agents are mostly under scripts (${c.fmt.num(v.files.agent)} files).` },
  { n: 12, group: 'Time', q: 'Is it growing?', tags: ['growing', 'growth', 'trend', 'traffic', 'more', 'month'],
    route: () => '#/growing',
    a: (c) => {
      const { fmt } = c;
      // As chapter 02 does it: the totals' growth, with "now" taken from the sorted days when
      // they cover the stretch, so this says the same "a day now" as the chapter's answer.
      const all = c.views && c.views.all ? c.views.all() : null;
      const raw = c.agg.growth(c.snap, (all && all.days) || c.snap.days);
      const g = all ? growthOnSorted(raw, (all.perDay || []).map((pd) => pd.pages.total)) : raw;
      const days = g.rows && g.rows.length != null ? g.rows.length : g.rows;
      if (g.lead === 'too-young') return `Too early to say; the site is ${days} days old.`;
      if (g.lead === 'young') return `The site is ${days} days old: ${fmt.num(g.a)} pages a day in its first week, ${fmt.num(g.b)} in the last.`;
      return `${GROWTH_LEAD[g.lead] || 'Not really'}: ${fmt.num(g.a)} pages a day in its first month, ${fmt.num(g.b)} now.`;
    } },
  { n: 13, group: 'Time', q: 'What was the busiest day?', tags: ['busiest', 'peak', 'record', 'most'],
    route: (c, v) => (v.busiest && v.busiest.d ? `#/growing/day/${v.busiest.d}` : '#/growing'),
    a: (c, v) => {
      const { fmt } = c;
      const b = v.busiest;
      if (!b || !b.total) return `No pages at all ${v.phrase.long}.`;
      if (v.n === 1) return `There's one day here: ${fmt.day(b.d, 'short')}, ${pg(fmt, b.total)}.`;
      const p = peopleBusiest(v);
      const people = p ? ` For people it was ${fmt.day(p.d, 'short')} (${fmt.rangeSpoken(p)}).` : '';
      return `${fmt.day(b.d, 'short')}: ${pg(fmt, b.total)}.${people}`;
    } },
  { n: 14, group: 'Time', q: 'What happened on the scanner spike?', tags: ['wave', 'spike', 'burst', 'scanner', 'attack'],
    route: (c) => { const w = c.agg.scannerWave(c.snap); return w ? `#/top/replay?d=${w.d}&u=files` : '#/growing'; },
    a: (c) => {
      const w = c.agg.scannerWave(c.snap);
      if (!w) return 'No scanner wave stood out in these days.';
      return `On ${c.fmt.day(w.d, 'short')} scanners asked for ${c.fmt.num(w.n)} files.`;
    } },
  { n: 15, group: 'Time', q: 'Did a new post bring readers?', tags: ['post', 'new', 'launch', 'readers', 'spike'],
    route: (c, v) => { const p = peopleBusiest(v); return p ? `#/growing/day/${p.d}` : '#/growing'; },
    a: (c, v) => {
      const p = peopleBusiest(v);
      if (!p || !p.hi) return `No people to count ${v.phrase.long}.`;
      const near = postNear(c, p.d);
      return `The busiest day for people was ${c.fmt.day(p.d, 'short')}${near || ''}${near ? '.' : '; no post went up that day or the day before.'}`;
    } },
  { n: 16, group: 'People', q: 'Which post is most read?', tags: ['post', 'article', 'popular', 'read', 'top'],
    route: () => '#/read',
    a: (c, v) => {
      const post = (v.paths || []).find((r) => r.kind === 'post');
      if (!post) return 'No single post stood out; people mostly opened the homepage.';
      return `${post.id || post.label}, with ${post.partial ? 'at least ' : ''}${pg(c.fmt, post.n)} by people.`;
    } },
  { n: 17, group: 'People', q: 'How do people find the site?', tags: ['referrer', 'source', 'link', 'search', 'google', 'come'],
    route: () => '#/read/sources',
    a: (c, v) => {
      const { fmt } = c;
      const r = v.referrers;
      if (!r || !r.total) return `Cloudflare's counter heard of no arrivals from outside the site ${v.phrase.long}.`;
      const top = (r.rows || [])[0];
      const lead = `${cap(fmt.frac(r.none / r.total))} came with no link`;
      return top ? `${lead}; ${top.label} sent ${fmt.approx(top.n)}.` : `${lead}.`;
    } },
  { n: 18, group: 'Place', q: 'Where are readers from?', tags: ['country', 'world', 'map', 'where', 'location', 'usa', 'us', 'america', 'states', 'nation'],
    route: () => '#/where',
    a: (c, v) => {
      const { fmt } = c;
      const rows = placedPeople(v);
      if (!rows.length) return `No people to place ${v.phrase.long}.`;
      if (rows.length === 1) return `Everyone who read was in ${fmt.countryIn(rows[0].code)}.`;
      const all = ((v.countries && v.countries.people) || []).reduce((s, r) => s + r.n, 0) || 1;
      // A tie at the top has no leader; say so, as the map's own answer does.
      if (rows[1].n === rows[0].n) return `${rows.length} countries, none ahead of the rest.`;
      return `${rows.length} countries; ${fmt.countryIn(rows[0].code)} leads with ${fmt.frac(rows[0].n / all)}.`;
    } },
  { n: 19, group: 'Place', tags: ['country', 'abroad', 'germany', 'europe'],
    q: (c, v) => { const r = placedPeople(v)[1]; return r ? `Does anyone read from ${c.fmt.countryIn(r.code)}?` : 'Does anyone read from abroad?'; },
    route: (c, v) => { const r = placedPeople(v)[1]; return r ? `#/where/${r.code}` : '#/where'; },
    a: (c, v) => {
      const rows = placedPeople(v);
      if (rows.length < 2) return rows.length ? `Not ${v.phrase.long}: everyone was in ${c.fmt.countryIn(rows[0].code)}.` : `No people to place ${v.phrase.long}.`;
      return `Yes: ${pg(c.fmt, rows[1].n)} from ${c.fmt.countryIn(rows[1].code)}.`;
    } },
  { n: 20, group: 'Place', q: 'Where do the bots come from?', tags: ['bot', 'datacenter', 'server', 'country', 'where'],
    route: () => '#/where/bots',
    a: (c, v) => {
      const rows = (v.botCountries || []).filter((r) => r.n > 0 && !UNPLACED.has(r.code));
      if (!rows.length) return `No named bots to place ${v.phrase.long}.`;
      const then = rows.slice(1, 3).map((r) => c.fmt.country(r.code));
      return `Data centres, mostly in ${c.fmt.countryIn(rows[0].code)}${then.length ? `, then ${c.fmt.list(then)}` : ''}.`;
    } },
  { n: 21, group: 'People', q: 'Phones or computers?', tags: ['phone', 'mobile', 'desktop', 'computer', 'device', 'tablet'],
    route: () => '#/top/person',
    a: (c, v) => {
      const get = (k) => ((v.devices || []).find((r) => r.key === k) || { n: 0 }).n;
      const total = (v.devices || []).reduce((s, r) => s + r.n, 0);
      if (!total) return `No people's devices to count ${v.phrase.long}.`;
      const d = get('desktop') / total, m = get('mobile') / total;
      return d >= m
        ? `Computers: ${c.fmt.pct(d)} of people's pages; phones ${c.fmt.pct(m)}.`
        : `Phones: ${c.fmt.pct(m)} of people's pages; computers ${c.fmt.pct(d)}.`;
    } },
  { n: 22, group: 'Time', q: 'What time do people read?', tags: ['time', 'hour', 'clock', 'night', 'when', 'day'],
    route: () => '#/when',
    a: (c, v) => {
      const utc = c.tzMode === 'utc';
      const h = c.agg.hoursLocal(v.days, utc ? 'utc' : c.zone, c.snap.through);
      if (!h.total) return `No people to time ${v.phrase.long}.`;
      if (h.total < 24) return `Only ${c.fmt.num(h.total)} pages: too few to see a pattern.`;
      let j = 0;
      for (let i = 1; i < 24; i++) if (h.bins[i] > h.bins[j]) j = i;
      return `Most around ${h.label(j)} ${utc ? 'UTC' : 'your time'}.`;
    } },
  { n: 23, group: 'Time', q: 'Is it busier on weekends?', tags: ['weekend', 'weekday', 'saturday', 'sunday', 'week'],
    route: () => '#/when/weekdays',
    a: (c, v) => {
      if (v.n < 14) return 'Two weeks of days are needed to tell; pick 30 days.';
      // The rhythm row's figures: each weekday's people range (the mean of its low ends and of
      // its high ends), the busiest being the first with the highest high end, as the row says.
      const w = weekdayRange(v.people.perDay);
      const j = w.hi.indexOf(Math.max(...w.hi));
      // Weekends against weekdays at both ends; "Yes" or "No" only when both ends agree.
      const ratio = (a) => {
        const wd = (a[0] + a[1] + a[2] + a[3] + a[4]) / 5, we = (a[5] + a[6]) / 2;
        return wd > 0 ? we / wd : 1;
      };
      const rLo = ratio(w.lo), rHi = ratio(w.hi);
      const lead = rLo >= 1.15 && rHi >= 1.15 ? 'Yes' : rLo <= 0.87 && rHi <= 0.87 ? 'No, quieter' : 'Not really';
      if (!(w.hi[j] > 0)) return `No people to count ${v.phrase.long}.`;
      return `${lead}: busiest on ${WEEKDAYS[j]}s, about ${dayRange(w.lo[j], w.hi[j])} pages on an average ${WEEKDAYS[j]}.`;
    } },
  { n: 24, group: 'Speed', q: 'Is the site fast?', tags: ['fast', 'speed', 'slow', 'load', 'performance'],
    route: () => '#/speed',
    a: (c) => {
      const vt = c.snap.vitals;
      const lead = vt && speedLead(vt);
      if (!lead) return "Speed numbers aren't in this filing.";
      const parts = [];
      if (vt.desktop && vt.desktop.n) parts.push(`${c.fmt.secs(vt.desktop.lcp)} on computers`);
      if (vt.mobile && vt.mobile.n) parts.push(`${c.fmt.secs(vt.mobile.lcp)} on phones`);
      return `${lead}: the main content showed in ${parts.join(', ')}.`;
    } },
  { n: 25, group: 'Speed', q: 'Is it fast on my phone?', tags: ['phone', 'mobile', 'fast', 'speed', 'slow'],
    route: () => '#/speed/mobile',
    a: (c) => {
      const m = c.snap.vitals && c.snap.vitals.mobile;
      if (!m || !m.n) return 'No phone visits were measured in this filing.';
      return `${c.fmt.secs(m.lcp)} for 3 visits in 4, from ${c.fmt.num(m.n)} measured ${c.fmt.plural(m.n, 'visit', 'visits')}.`;
    } },
  { n: 26, group: 'People', q: 'Am I in here? Would I count as a person?', tags: ['me', 'my', 'myself', 'you', 'browser', 'person'],
    route: () => '#/top/you',
    a: (c) => `Your browser would be counted ${youVerdict[c.you().kind] || youVerdict.person}.` },
  { n: 27, group: 'Time', q: 'How many people on the latest day?', tags: ['latest', 'today', 'yesterday', 'day'],
    route: () => '#/top?r=1',
    a: (c) => {
      const v1 = c.views.get({ kind: 'last', n: 1 });
      return peopleLine(c, v1, ` on ${c.fmt.day(v1.to || (v1.days[0] && v1.days[0].d), 'short')}`);
    } },
  { n: 28, group: 'Time', q: 'How many in the last week?', tags: ['week', 'seven', '7', 'days'],
    route: () => '#/top?r=7',
    a: (c) => peopleLine(c, c.views.get({ kind: 'last', n: 7 }), '') },
  { n: 29, group: 'This page', q: 'When was this updated?', tags: ['updated', 'filed', 'fresh', 'date', 'snapshot'],
    route: () => '#/how/filed', a: (c) => `Filed ${c.fmt.localStamp(c.snap.builtAt)}.` },
  { n: 30, group: 'Time', q: 'How much data does the site send?', tags: ['data', 'bytes', 'bandwidth', 'mb', 'gb', 'video'],
    route: () => '#/growing/data', a: (c, v) => `${c.fmt.bytes(v.bytes.total)} ${v.phrase.long}.` },
  { n: 31, group: 'This page', q: "What can't these numbers see?", tags: ['blind', 'privacy', 'clicks', 'search', 'identity', 'track'],
    route: () => '#/how/blind', a: () => 'Clicks, searches, and who anyone is.' },
  { n: 32, group: 'This page', q: 'What is a "page" versus a "file"?', tags: ['page', 'file', 'request', 'definition'],
    route: () => '#/top', term: 'page',
    a: () => 'A page is one web page; a file is anything the site sends.' },
];

// Words are compared lower-cased, without punctuation, plurals trimmed, so "phones" finds
// "phone" and "Googlebot's" finds "googlebot".
export function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
export function tokens(s) {
  return String(s).toLowerCase().replace(/['’]s\b/g, '').split(/[^a-z0-9.]+/).map((t) => t.replace(/^\.+|\.+$/g, '')).filter(Boolean).map(stem);
}

// words.SYNONYMS may be { word: 'other' | ['a', 'b'] } or [[from, to], ...] with either side a
// word or a list. Either way it becomes word -> the words it should also find.
//
// The table runs one way (phone -> iphone, android), but a reader types whichever word is theirs,
// so each one-word target also finds its key and the key's other targets: "iphone" finds what
// "phone" finds, "anthropic" what "ai" finds. A phrase target ("latest day") isn't reversed, or
// typing "day" would pull in every question the phrase's key does.
export function synonymMap(raw) {
  const map = new Map();
  const put = (k, words) => {
    if (!k) return;
    if (!map.has(k)) map.set(k, new Set());
    for (const w of words) if (w !== k) map.get(k).add(w);
  };
  const add = (from, to) => {
    const targets = [].concat(to).map((t) => String(t));
    const toks = targets.flatMap((t) => tokens(t));
    for (const f of [].concat(from)) {
      const k = stem(String(f).toLowerCase());
      put(k, toks);
      for (const t of targets) {
        const tt = tokens(t);
        if (tt.length !== 1) continue;
        put(tt[0], [k, ...toks]);
      }
    }
  };
  if (Array.isArray(raw)) for (const [from, to] of raw) add(from, to);
  else if (raw && typeof raw === 'object') for (const k of Object.keys(raw)) add(k, raw[k]);
  return map;
}

// Fills every question for the current range. A broken template gives a gentle line instead.
export function questionList(ctx) {
  const state = ctx.store.get();
  const v = ctx.views.get(state.range);
  let you = null;
  const c = {
    ctx, fmt: ctx.fmt, agg: ctx.agg, snap: ctx.snap, build: ctx.build, views: ctx.views,
    zone: (ctx.tz && ctx.tz.zone) || 'UTC', tzMode: state.tz,
    you: () => (you = you || classifyYou(readYou(), ctx.snap.through)),
  };
  return QUESTIONS.map((def) => {
    const pick = (f, fallback) => { try { return typeof f === 'function' ? f(c, v) : f; } catch { return fallback; } };
    const q = pick(def.q, 'A question');
    const a = pick(def.a, 'Open it to see.');
    const route = pick(def.route, '#/top');
    return { n: def.n, group: def.group, q, a, route, term: def.term || null, words: new Set([...tokens(q), ...tokens(a), ...def.tags.map(stem)]) };
  });
}

// True when every word typed finds something: the word itself, or one of its synonyms, as the
// start of a word in the question, its answer or its tags.
export function matches(item, query, syn) {
  const qs = tokens(query);
  if (!qs.length) return true;
  const words = [...item.words];
  return qs.every((qt) => {
    const alts = new Set([qt]);
    for (const [k, set] of syn) {
      if (k === qt || (qt.length >= 3 && k.startsWith(qt))) for (const s of set) alts.add(s);
    }
    // What was typed matches as the start of a word; a synonym of one or two letters ("i" for
    // "you", "mb" for "data") only as a whole word, or "you" would find every "is" and "in".
    for (const alt of alts) {
      const whole = alt !== qt && alt.length < 3;
      if (words.some((w) => (whole ? w === alt : w.startsWith(alt)))) return true;
    }
    return false;
  });
}
