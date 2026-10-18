// The thinking behind "Which machines?", with no DOM in it: which kind took the most, who the
// busiest single machine was and how to describe it in a few words, how bots group into
// companies under a purpose filter, how doors group into families. machines.js and the four
// panel modules turn these into markup; model.test.mjs checks them from Node.
//
// Everything here reads a RangeView (core/view.js) and the words dictionary, and never the raw
// days: the view has already applied the privacy and display guards, so a name that reaches this
// file is one the page may print.

export const TABS = [
  { key: 'bots', kind: 'bot', eyebrow: 'THE LIBRARY', name: 'Bots', long: 'Named bots' },
  { key: 'scanners', kind: 'scanner', eyebrow: 'THE LOCKED DOORS', name: 'Scanners', long: 'Scanners' },
  { key: 'scripts', kind: 'agent', eyebrow: 'THE WORKSHOP', name: 'Scripts', long: 'Scripts & agents' },
  { key: 'old', kind: 'stale', eyebrow: 'THE COSTUME RACK', name: 'Old browsers', long: 'Old browsers' },
];
export const TAB_KEYS = TABS.map((t) => t.key);
export const tabOf = (key) => TABS.find((t) => t.key === key) || null;
export const tabForKind = (kind) => TABS.find((t) => t.kind === kind) || TABS[0];

// The purpose filter, in the order the pills read. 'all' is the page's own; the rest are the
// keys words.purposeOf() hands back.
export const PURPOSES = [
  { key: 'all', label: 'All' },
  { key: 'ai', label: 'AI' },
  { key: 'search', label: 'Search engines' },
  { key: 'seo', label: 'SEO tools' },
  { key: 'preview', label: 'Link previews' },
  { key: 'other', label: 'Other' },
];
export const PURPOSE_KEYS = PURPOSES.map((p) => p.key);
// How strong each purpose's segment is in the split bar: AI is the story, so it's the full
// colour; the rest step down toward the quiet grey. Stepped by mixing, not by transparency: brick
// at 30% alpha on the day cream turns pale pink, and pink is the brand's decoration hue, never a
// chart's. The split's own labels are short ("SEO", not "SEO tools") because a segment holds its
// label only when it's wide enough; the pills above carry the full names.
export const PURPOSE_COLOR = {
  ai: 'var(--st-bot)',
  search: 'color-mix(in oklab, var(--st-bot) 70%, var(--pc-quiet))',
  seo: 'color-mix(in oklab, var(--st-bot) 45%, var(--pc-quiet))',
  preview: 'var(--pc-quiet)',
  other: 'var(--pc-quiet)',
};
export const PURPOSE_SHORT = { ai: 'AI', search: 'Search', seo: 'SEO', preview: 'Previews', other: 'Other' };
// A segment the filter has set aside is drawn as a 135° hatch of its own colour rather than faded,
// so it keeps its hue and still reads as "there, but not selected".
export const hatch = (color) => `repeating-linear-gradient(135deg, ${color} 0 1.5px, transparent 1.5px 4.5px)`;

/**
 * Purpose totals that add up to the pages the bots were counted with. pages.bot can be larger
 * than the named bots' sum (bots under a day's list, the Worker's own remainder); those pages go
 * to "Other", so the pills add up to All and the split's shares are of the same total.
 */
export function purposeTotalsFor(bots, pagesBot) {
  const out = purposeTotals(bots);
  const extra = Math.max(0, (pagesBot || 0) - out.all.pages);
  out.other.pages += extra;
  out.all.pages += extra;
  out.unlisted = extra;
  return out;
}

// The short tag after a bot's name on a company row ("ExaSearchBot · search engine"). The long,
// plain line lives in words.purposeOf(); this one has to fit beside a name.
const CATEGORY_TAG = {
  'AI Crawler': 'AI training',
  'AI Assistant': 'AI assistant',
  'AI Search': 'AI search',
  'Search Engine Crawler': 'search engine',
  'Search Engine Optimization': 'marketing',
  'Page Preview': 'link previews',
  'Monitoring & Analytics': 'uptime checks',
  'Feed Fetcher': 'feed reader',
  'Archiver': 'web archive',
  'Security': 'security checks',
};
// …and as a noun after a company's name: "OpenAI's assistant bot".
const CATEGORY_NOUN = {
  'AI Crawler': 'AI crawler', 'AI Assistant': 'assistant bot', 'AI Search': 'AI search crawler',
  'Search Engine Crawler': 'search crawler', 'Search Engine Optimization': 'marketing crawler',
  'Page Preview': 'link-preview bot',
};
export const categoryTag = (category) => CATEGORY_TAG[category] || 'helper';

// Rows the Worker or agg already folded; they are remainders, not names.
const FOLDED = /^other (named )?(bots|programs|old browsers)$/i;
export const isFolded = (label) => FOLDED.test(String(label || '').trim());

// "ExaSearchBot" → its company slug for the route (#/machines/bots/exa).
export const ownerSlug = (owner) => String(owner || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const UNKNOWN_OWNER = 'Unknown';
export const ownerLabel = (owner) => (owner === UNKNOWN_OWNER ? 'No company given' : owner);

/**
 * Turn a dictionary blurb into a few words that can sit after a name in a sentence:
 * "The crawler for Exa, an AI search engine…" → "the crawler for Exa";
 * "Google's search crawler: reads pages…" → "Google's search crawler";
 * "Fetches a page right then, because…" → "which fetches a page right then".
 * Returns '' when there's nothing usable, so the caller can fall back.
 */
export function appositive(blurb) {
  let s = String(blurb || '').trim();
  if (!s) return '';
  // first clause only: stop at a colon, semicolon, full stop or comma
  const cut = s.search(/[:;.]|,\s/);
  if (cut > 0) s = s.slice(0, cut);
  s = s.trim();
  if (!s) return '';
  const first = s.split(/\s+/)[0];
  if (/^(a|an|the)$/i.test(first)) return first.toLowerCase() + s.slice(first.length);
  if (/['’]s$/.test(first)) return s;        // "Google's search crawler"
  // anything else starts with a verb ("Fetches…", "Sent…", "Checks…"): make it a clause
  return 'which ' + first.charAt(0).toLowerCase() + s.slice(1);
}

// A door, described in a few words, by its family (for the chapter's answer sentence).
const FAMILY_PHRASE = {
  wordpress: 'a WordPress door',
  secrets: 'a password and settings file',
  code: 'a peek at code history',
  php: 'a leftover script',
  admin: 'a login page',
  habit: 'an icon browsers ask for by habit',
  own: 'an old address of this site',
  other: 'a door that doesn’t exist here',
};
export const familyPhrase = (key) => FAMILY_PHRASE[key] || FAMILY_PHRASE.other;

// Program names as a sentence says them: "the Claude desktop app", "unknown programs".
const PROGRAM_SAID = {
  'Claude desktop app': 'the Claude desktop app',
  'Unknown program': 'programs nobody recognises',
  'No user agent': 'programs that gave no name',
};
export const programSaid = (label) => PROGRAM_SAID[label] || label;

const sumBy = (rows, f) => rows.reduce((s, r) => s + (f(r) || 0), 0);

/** The four machine kinds by pages, largest first (ties keep station order). */
export function kindsByPages(pages) {
  return TABS.map((t, i) => ({ ...t, n: (pages && pages[t.kind]) || 0, i }))
    .sort((a, b) => b.n - a.n || a.i - b.i);
}

/** Purposes with pages and files over the range, from the view's BotRows. */
export function purposeTotals(bots) {
  const out = {};
  for (const p of PURPOSE_KEYS) out[p] = { pages: 0, files: 0 };
  for (const b of bots || []) {
    const k = out[b.purpose] ? b.purpose : 'other';
    out[k].pages += b.pages || 0;
    out[k].files += b.files || 0;
    out.all.pages += b.pages || 0;
    out.all.files += b.files || 0;
  }
  return out;
}

/**
 * Bots grouped into companies, for one purpose filter. Only displayable bots are named; the
 * rest (and the Worker's own "Other bots") are summed into `hidden`, so their numbers still
 * count and their names never print.
 * @returns {{ owners:{owner,label,slug,pages,files,bots:object[]}[], hidden:{pages,files,n} }}
 */
export function ownersFor(bots, purpose = 'all') {
  const by = new Map();
  const hidden = { pages: 0, files: 0, n: 0 };
  for (const b of bots || []) {
    if (purpose !== 'all' && b.purpose !== purpose) continue;
    if (!b.show || isFolded(b.name)) {
      hidden.pages += b.pages || 0; hidden.files += b.files || 0; hidden.n++;
      continue;
    }
    const key = b.owner || UNKNOWN_OWNER;
    let o = by.get(key);
    if (!o) by.set(key, (o = { owner: key, label: ownerLabel(key), slug: ownerSlug(key), pages: 0, files: 0, bots: [] }));
    o.pages += b.pages || 0;
    o.files += b.files || 0;
    o.bots.push(b);
  }
  const owners = [...by.values()];
  for (const o of owners) o.bots.sort((a, b) => b.pages - a.pages || b.files - a.files || a.name.localeCompare(b.name));
  owners.sort((a, b) => (a.owner === UNKNOWN_OWNER) - (b.owner === UNKNOWN_OWNER)
    || b.pages - a.pages || b.files - a.files || a.owner.localeCompare(b.owner));
  return { owners, hidden };
}

/** The company that sent the most pages, never "Unknown" unless it's the only one. */
export function topOwner(owners) {
  return owners.find((o) => o.owner !== UNKNOWN_OWNER && o.pages > 0) || null;
}

/** Programs for the Workshop: displayable labels, the rest folded into "Other programs". */
export function programRows(agents) {
  const rows = [];
  let other = 0;
  for (const a of agents || []) {
    if (!a || !(a.n > 0)) continue;
    if (a.show === false || isFolded(a.label)) other += a.n;
    else rows.push({ key: a.label, label: a.label, n: a.n });
  }
  rows.sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  if (other > 0) rows.push({ key: 'Other programs', label: 'Other programs', n: other, folded: true });
  return rows;
}

/** Old browsers for the Costume rack: labels by pages, "Other old browsers" kept last. With
 *  `total` (pages.stale), whatever the labels don't account for joins that last row. */
export function staleRows(stale, total) {
  const rows = [];
  let other = 0;
  for (const s of stale || []) {
    if (!s || !(s.n > 0)) continue;
    if (isFolded(s.label)) other += s.n;
    else rows.push({ key: s.label, label: s.label, n: s.n });
  }
  rows.sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  // pages.stale can hold more than the labels do (the Worker keeps the slices' count when a day's
  // browser list was cut short), so the rows end in whatever is left, and add up to the headline
  const gap = total == null ? 0 : total - rows.reduce((s, r) => s + r.n, 0) - other;
  if (gap > 0) other += gap;
  if (other > 0) rows.push({ key: 'Other old browsers', label: 'Other old browsers', n: other, folded: true });
  return rows;
}

/**
 * The door wall: every door grouped under its family (families ordered by the knocks they hold),
 * then at most `perFamily` doors drawn per family and `limit` in all, the most knocked first.
 * Capping per family keeps the wall about what they hoped to find: on a busy month nineteen of
 * the top twenty-four doors are spellings of .env, and one family's echo isn't the story.
 * `famOf(path)` returns {key, name, hoped, house}. A group's `n` counts all its doors, drawn or
 * not, and `hidden` how many of its doors weren't drawn. remainder = knocks the drawn doors don't
 * hold (doors not drawn, doors the display guard folded, doors under each day's top 25), rounded
 * to tens.
 */
export function doorWall(probes, knocks, famOf, limit = 24, perFamily = 6) {
  const all = ((probes && probes.rows) || []).filter((r) => r && r.n > 0)
    .sort((a, b) => b.n - a.n || a.path.localeCompare(b.path));
  const fams = new Map();
  all.forEach((r, rank) => {
    const fam = famOf(r.path) || { key: 'other', name: 'Other doors', hoped: '', house: '' };
    let g = fams.get(fam.key);
    if (!g) fams.set(fam.key, (g = { fam, n: 0, doors: [], hidden: 0, hiddenN: 0, all: [] }));
    g.n += r.n;
    g.all.push({ ...r, rank, fam });
  });
  const groups = [...fams.values()].sort((a, b) => b.n - a.n || a.all[0].rank - b.all[0].rank);
  // hand out the slots: round-robin by rank within each family's cap, busiest doors first
  let left = limit;
  const take = new Set();
  for (let rank = 0; rank < all.length; rank++) {
    if (left <= 0) break;
    const fam = famOf(all[rank].path) || { key: 'other' };
    const g = fams.get(fam.key);
    if (g.doors.length >= perFamily) continue;
    g.doors.push(g.all.find((d) => d.rank === rank));
    take.add(rank);
    left--;
  }
  for (const g of groups) {
    const rest = g.all.filter((d) => !take.has(d.rank));
    g.hidden = rest.length;
    g.hiddenN = sumBy(rest, (d) => d.n);
    delete g.all;
  }
  const drawn = groups.filter((g) => g.doors.length);
  const shown = sumBy(drawn, (g) => sumBy(g.doors, (d) => d.n));
  const rest = Math.max(0, (knocks || 0) - shown);
  // what the wall's words haven't already counted: each family heading's total includes its
  // "and N more doors like these", so the closing line must leave those out or it says them twice
  const beyond = Math.max(0, (knocks || 0) - sumBy(drawn, (g) => g.n));
  return {
    groups: drawn, top: all.length ? all[0].n : 0, shown, count: take.size,
    remainder: Math.round(rest / 10) * 10,     // knocks − drawn doors: the table twin's last row
    beyond: Math.round(beyond / 10) * 10,      // knocks − family totals: the wall's closing line
  };
}

// Files this site really serves that a scanner may still ask for. The door wall holds every
// address scanners tried, whatever the answer; a real file there failed some other way (a wrong
// method, a dropped connection), and its card must not call it a door that was never here.
// /favicon.ico has been one since 17 Oct 2026: AO-057 added it for exactly these knocks.
const SITE_FILES = new Set(['/sitemap.xml', '/rss.xml', '/robots.txt', '/favicon.svg', '/favicon.ico','/version.json', '/media-sizes.json', '/ledger/previews.json']);
export function isSitePath(path, build) {
  const p = String(path || '').split(/[?#]/)[0];
  if (SITE_FILES.has(p)) return true;
  const labels = (build && build.labels) || {};
  if (labels[p] || labels[p.endsWith('/') ? p : p + '/']) return true;
  const post = /^\/ledger\/([^/]+)\/?$/.exec(p);
  return !!(post && build && build.bySlug && build.bySlug.has(post[1].toLowerCase()));
}

/** "/wp-content/plugins/html404/xccc.php" → "/wp-content/plu…/html404/xccc.php" (30 chars). */
export function middleTruncate(s, max = 30) {
  s = String(s || '');
  if (s.length <= max) return s;
  const keepEnd = Math.ceil((max - 1) * 0.55);
  const keepStart = max - 1 - keepEnd;
  return s.slice(0, keepStart) + '…' + s.slice(s.length - keepEnd);
}

/** Countries for a "mostly from" line: real places only, the top three. */
export function topPlaces(rows, k = 3) {
  return (rows || []).filter((r) => r && r.n > 0 && r.code && r.code !== 'XX' && r.code !== 'T1').slice(0, k);
}

/** probeStatus rows → { n404, n403, other } */
export function statusSplit(rows) {
  let n404 = 0, n403 = 0, other = 0;
  for (const r of rows || []) {
    if (String(r.code) === '404') n404 += r.n;
    else if (String(r.code) === '403') n403 += r.n;
    else other += r.n;
  }
  return { n404, n403, other };
}

/**
 * The chapter's answer: which machine kind took the most pages, and the busiest single member of
 * it. Returns null when machines took no pages at all.
 * A program is counted in files and a door in knocks, never pages, so those members also carry
 * `of`: the whole kind in that same unit, for the sentence to measure the member against. Set
 * beside the kind's pages, a member's files read as bigger than the kind that holds it.
 * deps: { words, ageOf(label) → browserAge result|null, famOf(path) }
 */
export function answerModel(view, deps) {
  const kinds = kindsByPages(view.pages);
  const machineTotal = kinds.reduce((s, k) => s + k.n, 0);
  if (!machineTotal) return null;
  const top = kinds[0];
  const share = top.n / machineTotal;
  let member = null;
  const { words, ageOf, famOf } = deps;
  if (top.kind === 'bot') {
    const b = (view.bots || []).filter((x) => x.show && !isFolded(x.name) && x.pages > 0)
      .sort((a, c) => c.pages - a.pages || c.files - a.files)[0];
    if (b) {
      // a blurb that starts with a noun ("the crawler for Exa") reads well after the name; one
      // that starts with a verb ("Fetches a page right then…") doesn't, so say who runs it instead
      let say = appositive(safe(() => words.botBlurb(b.name, b.category)));
      if (!say || say.startsWith('which ')) {
        say = b.owner && b.owner !== UNKNOWN_OWNER ? `${b.owner}’s ${CATEGORY_NOUN[b.category] || 'bot'}` : 'a bot Cloudflare checked';
      }
      member = { name: b.name, say, n: b.pages, unit: 'pages' };
    }
  } else if (top.kind === 'stale') {
    const s = staleRows(view.stale)[0];
    if (s && !s.folded) {
      const age = ageOf(s.label);
      member = { name: s.label, say: age ? `a browser from about ${age.year}` : 'a browser well out of date', n: s.n, unit: 'pages' };
    }
  } else if (top.kind === 'agent') {
    const p = programRows(view.agents)[0];
    if (p && !p.folded) {
      const say = appositive(safe(() => words.programBlurb(p.label))) || 'a program, not a browser';
      member = { name: programSaid(p.label), say, n: p.n, unit: 'files', of: (view.files && view.files.agent) || 0 };
    }
  } else if (top.kind === 'scanner') {
    const rows = ((view.probes && view.probes.rows) || []).slice().sort((a, b) => b.n - a.n);
    const d = rows[0];
    if (d) {
      const fam = famOf(d.path);
      member = { name: d.path, say: familyPhrase(fam && fam.key), n: d.n, unit: 'knocks', mono: true, partial: !!d.partial, of: (view.files && view.files.scanner) || 0 };
    }
  }
  return { kind: top.kind, tab: top.key, n: top.n, share, machineTotal, member };
}

function safe(f) { try { return f(); } catch (e) { return ''; } }

/**
 * "nearly twice what search engines did" — fmt.times() for the ratio, with the two ends it
 * doesn't phrase well (about the same; a fraction) said plainly. Every answer is followed by
 * '{who} did', so each one ends in 'what' or 'as'.
 */
export function comparedTo(r, times) {
  if (!isFinite(r) || r <= 0) return null;
  if (r >= 0.9 && r <= 1.1) return 'about the same as';
  if (r < 0.4) return 'less than half what';
  // under 1, fmt.times says '0.7 times'; a share reads better, except for its own 'half'
  if (r < 0.9 && !(r >= 0.45 && r <= 0.55)) return Math.round(r * 100) + '% of what';
  return times(r) + ' what';
}
