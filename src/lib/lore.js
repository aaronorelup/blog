// C-02 "I Love My Evening Television": everything the lore course's pages need from the one data file.
//
// src/data/lore/lore.json is written by the series repo's `Series/lore/tools/lore.py publish --blog <this repo>`
// and never by hand. Every page of the course arranges it; no page holds a fact of its own. Change a line in the
// lore, publish, build: every page follows. The format of the lore is Series/lore/README.md in the series repo.
import LORE from '../data/lore/lore.json';

export { LORE };
export const SLUG = 'i-love-my-evening-television';
export const BASE = `/courses/${SLUG}`;
export const REPO = 'https://github.com/aaronorelup/i-love-my-evening-television';
export const REPO_BRANCH = 'main';

// ---------------------------------------------------------------- the six tiers
// Shape and line style carry the meaning, never colour alone (the same marks as the lesson engine's lorekit.js).
export const TIER_ORDER = ['steel', 'fact', 'egg', 'running', 'idea', 'open'];
export const TIERS = {
  steel: { label: 'Steel', name: 'Set in steel', line: 'double', what: 'Aaron agreed to it. Everything builds on it, and only Aaron changes it.' },
  fact: { label: 'On screen', name: 'On screen', line: 'solid', what: 'True in a made episode: shown, said or written on screen, or on its hidden page.' },
  egg: { label: 'Egg', name: 'Planted', line: 'solid', what: 'An easter egg: the object is on screen, what it means is only implied.' },
  running: { label: 'Running', name: 'Running assumption', line: 'dashed', what: 'Our current reading: crew notes, inference, timeline math. Useful, provisional, expected to move.' },
  idea: { label: 'Idea', name: 'Idea', line: 'dotted', what: 'A proposal from Aaron or an agent, not adopted. Kept so it isn’t lost.' },
  open: { label: 'Open', name: 'Open question', line: 'hollow', what: 'Deliberately unanswered, or not decided yet.' },
};
export const DECIDED = ['steel', 'fact', 'egg'];
// the weaker of two tiers (an age computed from a birth on screen and a running placement is running)
const RANK = { steel: 0, fact: 1, egg: 2, running: 3, idea: 4, open: 5 };
export const weaker = (...ts) => ts.filter(Boolean).sort((a, b) => RANK[b] - RANK[a])[0] || null;

// ---------------------------------------------------------------- episodes and their palettes
// From the design (COURSE_DESIGN §4): each episode wears its own light, only where the episode is.
export const PALETTE = {
  E1: { accent: '#C2333B', second: '#D9A441', ground: '#1A1310', day: '#A3262E', mood: 'oil on linen under gold light' },
  E2: { accent: '#7DB4E6', second: '#FFB238', ground: '#0B1A2C', day: '#2F6FA8', mood: 'Prussian-blue drafting film, her amber lamp' },
  E3: { accent: '#FFC870', second: '#A7ADB8', ground: '#07080B', day: '#A86A00', mood: 'an endless dark plane, one warm cursor' },
  E4: { accent: '#F2D49B', second: '#5E8C6A', ground: '#14100C', day: '#87642A', mood: 'a brass clock, a lamp over the board' },
};
const FALLBACK_PAL = { accent: '#A7ADB8', second: '#7FA7C9', ground: '#0A0B10', day: '#5A6270', mood: '' };
export const pal = (code) => PALETTE[code] || FALLBACK_PAL;
export const epVars = (code) => {
  const p = pal(code);
  return `--ep:${p.accent};--ep2:${p.second};--ep-ground:${p.ground};--ep-day:${p.day}`;
};

export const EPISODES = LORE.episodes;
export const UNRELEASED = new Set(LORE.unreleased || EPISODES.filter((e) => !e.released).map((e) => e.id));
export const epNumber = (code) => Number(String(code).slice(1));
export const isEpisodeCode = (s) => /^E\d+$/.test(s || '');

// ---------------------------------------------------------------- the entities and where each one lives
export const CHARACTERS = LORE.characters;
export const THINGS = LORE.things;
const DOCS = { world: 'world', timeline: 'timeline', eggs: 'eggs', threads: 'threads', questions: 'questions' };

const byId = new Map();
for (const e of EPISODES) byId.set(e.id, e);
for (const e of CHARACTERS) byId.set(e.id, e);
for (const e of THINGS) byId.set(e.id, e);
for (const e of LORE.world || []) byId.set(e.id, e);
for (const e of LORE.timeline_docs || []) byId.set(e.id, e);
export const entity = (id) => byId.get(id) || null;

export function urlOf(id) {
  const e = byId.get(id);
  if (e?.group === 'episode' || isEpisodeCode(id)) return `${BASE}/episodes/${id}/`;
  if (e?.group === 'character') return `${BASE}/characters/${id}/`;
  if (e?.group === 'thing') return `${BASE}/things/${id}/`;
  if (DOCS[id]) return `${BASE}/${DOCS[id]}/`;
  return null;
}

export const DOC_TITLES = { world: 'The world', timeline: 'Timeline', eggs: 'Egg atlas', threads: 'Threads', questions: 'Open questions' };

export function titleOf(id) {
  if (isEpisodeCode(id)) {
    const e = byId.get(id);
    return e ? `Episode ${epNumber(id)}, ${e.title}` : `Episode ${epNumber(id)}`;
  }
  return byId.get(id)?.title || DOC_TITLES[id] || id;
}

// The page a lore file is shown on: a bullet's link and anchor (#L<line>, its line in the file) follow from it.
export function pageOfFile(file) {
  const m = String(file).match(/Series\/lore\/(?:(characters|things|episodes)\/([^/]+)|([a-z]+))\.md$/);
  if (!m) return `${BASE}/`;
  if (m[1] === 'characters') return `${BASE}/characters/${m[2]}/`;
  if (m[1] === 'things') return `${BASE}/things/${m[2]}/`;
  if (m[1] === 'episodes') return `${BASE}/episodes/${m[2]}/`;
  return DOCS[m[3]] ? `${BASE}/${DOCS[m[3]]}/` : `${BASE}/`;
}
export const bulletHref = (b) => `${pageOfFile(b.file)}#L${b.line}`;
export const editHref = (fileOrB, line) => {
  const file = typeof fileOrB === 'string' ? fileOrB : fileOrB.file;
  const ln = typeof fileOrB === 'string' ? line : fileOrB.line;
  return `${REPO}/blob/${REPO_BRANCH}/${encodeURI(file)}${ln ? `#L${ln}` : ''}`;
};

// ---------------------------------------------------------------- bullets
export const allBullets = (e) => (e?.sections || []).flatMap((s) => s.bullets);
export const sectionBullets = (secs) => secs.flatMap((s) => s.bullets);

export function countTiers(list) {
  const c = Object.fromEntries(TIER_ORDER.map((t) => [t, 0]));
  for (const b of list) if (c[b.tier] != null) c[b.tier]++;
  return c;
}

/** The episodes a bullet belongs to: its own code, else the ones its source names. */
export function bulletEps(b) {
  if (b.ep) return [b.ep];
  return [...new Set(String(b.src || '').match(/\bE\d+\b/g) || [])].filter((c) => byId.has(c));
}
export const bulletEp = (b) => bulletEps(b)[0] || null;

/** Group bullets by episode code, in episode order; bullets with none go under ''. */
export function byEpisode(list) {
  const groups = new Map();
  for (const b of list) {
    const k = b.ep || '';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(b);
  }
  return [...groups.entries()].sort((a, b) => (a[0] ? epNumber(a[0]) : 1e6) - (b[0] ? epNumber(b[0]) : 1e6));
}

// ---------------------------------------------------------------- text
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { esc };
const escText = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const REF_RE = /(^|[^\w@/.])@([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)/g;

/** A lore line as HTML: `code`, *em*, **strong**, @id links (by title), bare URLs, -> as an arrow. Escaped first. */
export function md(text, { links = true } = {}) {
  const parts = String(text ?? '').split(/(`[^`]*`)/);
  return parts
    .map((p, i) => {
      if (i % 2 === 1) return `<code>${esc(p.slice(1, -1))}</code>`;
      let h = escText(p);
      h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      h = h.replace(/(^|[\s(“"'/])\*([^*\s][^*]*?)\*(?=[\s).,;:!?”"'/]|$)/g, '$1<em>$2</em>');
      h = h.replace(/(^|\s)-&gt;(?=\s|$)/g, '$1→');
      h = h.replace(/\bhttps?:\/\/[^\s<)"]+[^\s<)".,;:]/g, (u) => (links ? `<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//, '')}</a>` : u));
      h = h.replace(REF_RE, (m0, pre, id) => {
        const url = urlOf(id);
        const t = esc(titleOf(id));
        if (!url) return `${pre}${t}`;
        const ep = isEpisodeCode(id);
        return links
          ? `${pre}<a class="ref${ep ? ' ref-ep' : ''}" href="${url}"${ep ? ` style="${epVars(id)}"` : ''}>${ep ? esc(id) : t}</a>`
          : `${pre}${ep ? esc(id) : t}`;
      });
      return h;
    })
    .join('');
}

/** Plain text for search and meta descriptions. */
export const plain = (text) =>
  String(text ?? '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*?([^*]+)\*\*?/g, '$1')
    .replace(REF_RE, (m0, pre, id) => pre + (isEpisodeCode(id) ? id : titleOf(id)))
    .replace(/\s->\s/g, ' → ');

export const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[`*"“”'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section';

/** Strip markdown marks from a section title. */
export const cleanTitle = (s) => String(s).replace(/`([^`]*)`/g, '$1').replace(/\*([^*]+)\*/g, '$1');
export const mdTitle = (s) => md(s, { links: false });

// ---------------------------------------------------------------- years, ages
export const yearText = (y) => (y ? y.text : '');
export function placement(e) {
  return e?.year?.year ? { ...e.year.year, tier: e.year.tier, src: e.year.src } : null;
}

/** Age at an episode from a birth year and the episode's placement; tier = the weaker of the two. */
export function ageAt(born, ep) {
  const b = born?.year, p = placement(ep);
  if (!b || !p) return null;
  const lo = p.min - b.max, hi = p.max - b.min;
  if (hi < 0) return null; // not born yet
  const approx = b.approx || p.approx;
  // Y0 is defined as Episode 1's night (README: "Y0 is the night of Episode 1's broadcast"), so a placement at
  // exactly Y0 is the axis itself, not an assumption: an age there is as sure as the birth year
  const origin = p.min === 0 && p.max === 0 && !p.approx;
  const tier = origin ? born.tier || 'running' : weaker(born.tier || 'running', p.tier || 'running');
  const text = lo === hi ? `${approx ? 'about ' : ''}${Math.max(0, lo)}` : `${Math.max(0, lo)}–${hi}`;
  return { lo, hi, text, tier, approx };
}

/** A warped axis through the years that matter (lorekit.js L.axis): an empty stretch longer than maxGap years is
 *  drawn as `cap` years with a break, so sixty quiet years don't squeeze four episodes into one corner. */
export function axis(years, X0, X1, o = {}) {
  const maxGap = o.maxGap ?? 12, cap = o.cap ?? 7, pad = o.pad ?? 4;
  const ks = [...new Set(years.filter((y) => Number.isFinite(y)))].sort((a, b) => a - b);
  const lo = ks[0] - pad, hi = ks[ks.length - 1] + pad, keys = [lo, ...ks, hi];
  const segs = [], breaks = [];
  let acc = 0;
  // focus: spans of years that get `mul` times their width (the episodes' nights, so four nights sixty years
  // apart, three of them within a few years of each other, can all be read)
  const focus = o.focus || [], mul = o.mul ?? 1;
  const inFocus = (a, b) => focus.some(([f0, f1]) => a < f1 && b > f0);
  for (let i = 0; i + 1 < keys.length; i++) {
    const d = keys[i + 1] - keys[i], w = (d > maxGap ? cap : d) * (inFocus(keys[i], keys[i + 1]) ? mul : 1);
    if (d > maxGap) breaks.push([keys[i], keys[i + 1]]);
    segs.push({ a: keys[i], b: keys[i + 1], from: acc, w });
    acc += w;
  }
  const x = (y) => {
    const s = segs.find((q) => y >= q.a && y <= q.b) || (y < lo ? segs[0] : segs[segs.length - 1]);
    return X0 + ((s.from + ((y - s.a) / (s.b - s.a || 1)) * s.w) / acc) * (X1 - X0);
  };
  const ticks = [];
  const minGap = o.tickGap ?? 40;
  ks.forEach((y) => {
    if (!ticks.length || x(y) - x(ticks[ticks.length - 1]) > minGap || y === 0) ticks.push(y);
  });
  return { x, lo, hi, X0, X1, breaks: breaks.map(([a, b]) => ({ a, b, x0: x(a), x1: x(b) })), ticks };
}
export const fmtY = (y) => (y === 0 ? 'Y0' : y > 0 ? `Y+${y}` : `Y${y}`);

// ---------------------------------------------------------------- dates in sources (for the steel page)
export const srcDate = (src) => (String(src || '').match(/\b(20\d\d-\d\d-\d\d)\b/g) || []).sort().pop() || null;
export const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`;
};

// ---------------------------------------------------------------- kinds
export const CHARACTER_GROUPS = [
  { key: 'people', title: 'People', kinds: ['person'] },
  { key: 'machines', title: 'AIs and programs', kinds: ['ai', 'program'] },
  { key: 'robots', title: 'Robots', kinds: ['robot'] },
  { key: 'helpers', title: 'Helpers', kinds: ['helper'] },
  { key: 'presences', title: 'Presences, groups and animals', kinds: ['presence', 'group', 'animal'] },
];
export const THING_GROUPS = [
  { key: 'places', title: 'Places', kinds: ['place'] },
  { key: 'objects', title: 'Objects', kinds: ['object'] },
  { key: 'works', title: 'Works and songs', kinds: ['work', 'song'] },
  { key: 'screens', title: 'Programs, games, pages and channels', kinds: ['program', 'game', 'page', 'channel'] },
  { key: 'numbers', title: 'Numbers, sounds and events', kinds: ['number', 'sound', 'event'] },
  { key: 'orgs', title: 'Organisations', kinds: ['organisation', 'group'] },
];
export function grouped(list, groups) {
  const out = groups.map((g) => ({ ...g, items: list.filter((e) => g.kinds.includes(e.kind)) }));
  const known = new Set(groups.flatMap((g) => g.kinds));
  const rest = list.filter((e) => !known.has(e.kind));
  if (rest.length) out.push({ key: 'other', title: 'Other', kinds: [], items: rest });
  return out.filter((g) => g.items.length);
}
export const KIND_LABEL = {
  person: 'Person', ai: 'AI', program: 'Program', robot: 'Robot', helper: 'Helper', animal: 'Animal', group: 'Group',
  presence: 'Presence', object: 'Object', place: 'Place', work: 'Work', organisation: 'Organisation', song: 'Song',
  game: 'Game', page: 'Page', number: 'Number', channel: 'Channel', sound: 'Sound', event: 'Event',
};

// ---------------------------------------------------------------- references between entities
// Which other entities mention an id (by @id in a line or in their prose): the "mentioned on" list of a sheet.
const backrefs = new Map();
for (const e of [...EPISODES, ...CHARACTERS, ...THINGS, ...(LORE.world || [])]) {
  const seen = new Map();
  for (const b of allBullets(e)) for (const r of b.refs || []) seen.set(r, (seen.get(r) || 0) + 1);
  for (const r of e.refs || []) seen.set(r, (seen.get(r) || 0) + 1);
  for (const [r, n] of seen) {
    if (r === e.id) continue;
    if (!backrefs.has(r)) backrefs.set(r, []);
    backrefs.get(r).push({ id: e.id, n });
  }
}
for (const key of ['eggs', 'threads', 'questions']) {
  const seen = new Map();
  for (const s of LORE[key] || []) for (const b of s.bullets) for (const r of b.refs || []) seen.set(r, (seen.get(r) || 0) + 1);
  for (const [r, n] of seen) {
    if (!backrefs.has(r)) backrefs.set(r, []);
    backrefs.get(r).push({ id: key, n });
  }
}
export const mentionedOn = (id) => (backrefs.get(id) || []).sort((a, b) => b.n - a.n);

// ---------------------------------------------------------------- images
export const IMAGE_STATUS = {
  used: { label: 'Used', note: 'This exact look is in an episode.' },
  steel: { label: 'Steel', note: 'Aaron approved this look as canon.' },
  placeholder: { label: 'Placeholder', note: 'made as a quick reference, not in any episode yet, free to change' },
};
// thumbnails: written next to the build by scripts/lore-thumbs.mjs (560 px wide); the page falls back to the full file
export const thumbOf = (url) => (url ? url.replace(`${BASE}/media/`, `${BASE}/thumbs/`) : url);
export const firstImage = (e) => (e?.images || []).find((i) => i.url) || null;

let sharpMod;
const sizeCache = new Map();
/** The pixel size of a published picture (from the file under public/), so the page keeps its space. */
export async function imageSize(url) {
  if (!url) return null;
  if (sizeCache.has(url)) return sizeCache.get(url);
  const p = (async () => {
    try {
      const path = await import('node:path');
      const fs = await import('node:fs');
      const pub = typeof __PUBLIC_DIR__ === 'string' ? __PUBLIC_DIR__ : path.join(process.cwd(), 'public');
      const file = path.join(pub, decodeURIComponent(url));
      if (!fs.existsSync(file)) return null;
      sharpMod = sharpMod || (await import('sharp')).default;
      const m = await sharpMod(file).metadata();
      return m.width && m.height ? { w: m.width, h: m.height } : null;
    } catch (e) {
      return null;
    }
  })();
  sizeCache.set(url, p);
  return p;
}

// ---------------------------------------------------------------- counts for the whole lore
export const ALL_ENTITIES = [...EPISODES, ...CHARACTERS, ...THINGS, ...(LORE.world || []), ...(LORE.timeline_docs || [])];
export const EVERY_BULLET = [
  ...ALL_ENTITIES.flatMap(allBullets),
  ...['eggs', 'threads', 'questions'].flatMap((k) => (LORE[k] || []).flatMap((s) => s.bullets)),
];
export const TOTALS = countTiers(EVERY_BULLET);
export const STAMP = LORE.built || null;

// The lessons crew's data file (the C-01 shape: modules -> lessons), when it exists; the course works without it.
const lessonFiles = import.meta.glob('../data/courses/i-love-my-evening-television.json', { eager: true, import: 'default' });
export const LESSON_DATA = Object.values(lessonFiles)[0] || null;
// "What changed" since the previous publish, when lore.py publish writes it (COURSE_DESIGN §8)
const changeFiles = import.meta.glob('../data/lore/changes.json', { eager: true, import: 'default' });
export const CHANGES = Object.values(changeFiles)[0] || null;
