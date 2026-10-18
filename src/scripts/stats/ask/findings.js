// "Noticed this month": the few things in the filing a newcomer wouldn't think to ask about.
// Pure (no DOM), so Node can test it: give it the page's ctx and it returns the rules that
// apply, in priority order. Noticed shows the first three (two on a phone); Surprise me walks
// the whole list.
//
// The rules always look at every day in the filing (the last 30, or all of them while the
// backfill is young), whatever range the bar is set to: a finding shouldn't vanish because the
// reader picked "7 days".
//
// A sentence is a list of parts: plain strings, and { b } for the numbers worth bolding. The
// page writes them with textContent, so nothing from the server is ever parsed as HTML.
import { browserAge } from '../core/browser.js';

const AI_OVER_SEARCH = 1.3;     // AI pages at least this many times search pages
const COSTUME_SHARE = 0.15;     // one old-browser label is at least this share of old-browser pages
const AGENT_SHARE = 0.10;       // scripts and agents took at least this share of pages
const SHARE_MOVE = 3;           // percentage points either people bound moved between the halves
const FAR_COUNTRIES = 5;        // people in at least this many countries
const UNPLACED = new Set(['XX', 'T1', '']);

// Programs that read better with a few words after them. Anything else prints its own label.
const PROGRAM_PHRASE = {
  'Claude desktop app': "the Claude desktop app, which Aaron's agents use to check posts",
  'Claude Code': "Claude Code, Anthropic's coding agent, usually Aaron's own",
  curl: "curl, the command-line tool Aaron's agents use to check that a post went live",
  'Headless Chrome': 'a headless Chrome, a real browser with no screen, driven by a script',
};

// n / median as words: "12 times" once it's big, the formatter's softer words below that.
export function timesWord(r, fmt) {
  if (!Number.isFinite(r)) return 'many times';
  if (r >= 3.5) return `${Math.round(r)} times`;
  return fmt.times(r);
}

// People's share of pages, low and high, as whole percentages, over a run of days.
function shares(days, agg) {
  const total = agg.kindSums(days, 'pages').total;
  if (!total) return null;
  const p = agg.peopleRange(days);
  return { lo: Math.round((p.lo / total) * 100), hi: Math.round((p.hi / total) * 100) };
}

/** @returns {{key:string, eyebrow:string, parts:(string|{b:string})[], route:string}[]} */
export function findings(ctx) {
  const { snap, agg, fmt } = ctx;
  const v = ctx.views.all();
  const out = [];
  const nDays = v.days.length;
  // Every sentence here is about the whole filing, in pages, so its Show me pins both: a reader who
  // has picked one day, or switched to files, would otherwise land on a page that contradicts the
  // sentence that sent them (AI 89 to search 23 on one day, against 2,234 to 1,225 for the month).
  const whole = (route) => `${route}?r=${nDays}&u=pages`;

  // SCANNER WAVE: one day of scanners far above a normal day.
  const wave = agg.scannerWave(snap);
  if (wave && wave.n > 0) {
    const r = wave.median > 0 ? wave.n / wave.median : Infinity;
    // Most of what they ask for isn't here, but not all: some knocks get a refusal or an error
    // instead, so the day's own 'not found' count is what the sentence claims.
    const day = snap.days.find((d) => d.d === wave.d);
    const n404 = Math.min(wave.n, Number(day && day.probeStatus && day.probeStatus['404']) || 0);
    const tail = n404 >= wave.n ? ' None of them exist here.'
      : n404 > 0 ? ` ${fmt.num(n404)} of them got 'not found'.` : '';
    out.push({
      key: 'wave',
      eyebrow: 'Scanner wave',
      parts: [`On ${fmt.day(wave.d, 'short')}, scanners asked for `, { b: fmt.num(wave.n) },
        ` files in one day, ${timesWord(r, fmt)} a normal day.${tail}`],
      route: `#/top/replay?d=${wave.d}&u=files`,
    });
  }

  // AI OR SEARCH: AI bots out-fetching search engines.
  const ai = (v.purposes && v.purposes.ai && v.purposes.ai.pages) || 0;
  const search = (v.purposes && v.purposes.search && v.purposes.search.pages) || 0;
  if (ai > 0 && ai >= AI_OVER_SEARCH * search) {
    out.push({
      key: 'ai',
      eyebrow: 'AI or search',
      parts: search > 0
        ? ['AI bots fetched ', { b: fmt.num(ai) }, ` pages, ${fmt.times(ai / search)} what search engines did (${fmt.num(search)}).`]
        : ['AI bots fetched ', { b: fmt.num(ai) }, ' pages; search engines fetched none.'],
      route: whole('#/machines/bots/ai'),
    });
  }

  // IN COSTUME: one old browser doing far more than its share.
  const staleTotal = v.pages.stale || 0;
  const topStale = (v.stale || []).find((r) => r.label && !/^Other /.test(r.label));
  if (staleTotal > 0 && topStale && topStale.n >= COSTUME_SHARE * staleTotal) {
    const age = browserAge(topStale.label, snap.through);
    out.push({
      key: 'costume',
      eyebrow: 'In costume',
      parts: [`One kind of out-of-date browser, ${topStale.label}${age ? ` (${age.text})` : ''}, fetched `,
        { b: fmt.num(topStale.n) }, ' pages. People do run old browsers; not this many, this often.'],
      route: whole('#/machines/old'),
    });
  }

  // MOST READ: the listed post people opened most.
  const post = (v.paths || []).find((r) => r.kind === 'post' && r.slug);
  if (post) {
    out.push({
      key: 'read',
      eyebrow: 'Most read',
      parts: [`The most-read post: ${post.id || post.label}, with `, { b: (post.partial ? 'at least ' : '') + fmt.num(post.n) },
        ' pages by people.'],
      route: whole(`#/read/${post.slug}`),
    });
  }

  // AARON'S AGENTS: scripts and agents taking a real slice of the pages.
  const pagesTotal = v.pages.total || 0;
  if (pagesTotal > 0 && v.pages.agent >= AGENT_SHARE * pagesTotal) {
    const top = (v.agents || []).find((r) => r.show !== false && r.label && !/^Other /.test(r.label));
    const who = top ? (PROGRAM_PHRASE[top.label] || top.label) : null;
    out.push({
      key: 'agents',
      eyebrow: "Aaron's agents",
      parts: [`Scripts and agents took `, { b: fmt.frac(v.pages.agent / pagesTotal) }, ' pages',
        who ? `; the busiest was ${who}.` : '.'],
      route: whole('#/machines/scripts'),
    });
  }

  // PEOPLE'S SHARE: either bound moved between the two halves of the filing.
  if (nDays >= 4) {
    const half = Math.floor(nDays / 2);
    const a = shares(v.days.slice(0, half), agg);
    const b = shares(v.days.slice(nDays - half), agg);
    if (a && b && (Math.abs(b.lo - a.lo) >= SHARE_MOVE || Math.abs(b.hi - a.hi) >= SHARE_MOVE)) {
      out.push({
        key: 'share',
        eyebrow: "People's share",
        parts: ["People's share went from ", { b: `${a.lo}–${a.hi}%` }, ' to ', { b: `${b.lo}–${b.hi}%` },
          nDays >= 28 ? ' over the month.' : ` over these ${nDays} days.`],
        route: whole('#/growing'),
      });
    }
  }

  // FAR AWAY: people reading from many countries.
  const placed = ((v.countries && v.countries.people) || []).filter((r) => r.n > 0 && !UNPLACED.has(r.code));
  if (placed.length >= FAR_COUNTRIES) {
    const [first, second] = placed;
    const firstShort = first.code === 'US' ? 'the US' : fmt.countryIn(first.code);
    out.push({
      key: 'far',
      eyebrow: 'Far away',
      parts: ['People in ', { b: fmt.num(placed.length) }, ` countries read something; outside ${firstShort}, ${fmt.countryIn(second.code)} leads.`],
      route: whole('#/where'),
    });
  }

  return out;
}

export const plainText = (parts) => parts.map((p) => (typeof p === 'string' ? p : p.b)).join('');
