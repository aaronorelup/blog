// The owner's tea room picks (src/data/tea-picks.json, saved in the picker) read against the chapter list
// (src/data/tea-chapters.js) and the site: one reader for the page (lib/tea-chapters.js), the checker
// (scripts/check/tea-picks.mjs) and npm run tea:picks. Plain Node: no astro:content, no public/ lookups of its own.
import { PROJECT_KEYS, TOPIC_KEYS } from '../data/taxonomy.js';
import { isLive, LIVE_NOTEBOOKS } from '../data/exempt.js';
import { isListed, ledgerOrder } from './posts.js';

export const PICKS_FILE = 'src/data/tea-picks.json';
export const PICKS_VERSION = 1;
// What the picker saves for the builder's eyes only: never written into the repo.
export const PRIVATE_FIELDS = ['notes', 'general', 'savedAt'];
const FIELDS = ['v', 'order', 'hidden', 'shelves'];
const KINDS = { p: 'post', j: 'project', m: 'machine' };
const NAME = /^[a-z0-9][a-z0-9-]*$/;

// An error that names what is wrong without the file, for a caller that names the file itself (the checker).
export class PicksError extends Error {
  constructor(source, reason) {
    super(`${source}: ${reason}`);
    this.reason = reason;
  }
}

// A post entry as src/schemas/post.ts's transform hands it out, from raw frontmatter too (the checker reads files):
// a topic it doesn't know is 'agents', no project list is the live notebook's own, a date is a Date.
export function asPost({ id, data }) {
  const topic = TOPIC_KEYS.includes(data.topic) ? data.topic : 'agents';
  const project = (data.project === undefined ? LIVE_NOTEBOOKS[data.id]?.project ?? [] : [data.project].flat())
    .filter((k) => PROJECT_KEYS.includes(k));
  return { id, data: { ...data, topic, project, date: new Date(data.date) } };
}

// The listed posts an auto shelf may show, in the order the ledger and today's topic groups use, cut to count.
export function autoPosts(posts, auto, count) {
  const fits = (p) => (!auto.topic || p.data.topic === auto.topic) && (!auto.project || p.data.project.includes(auto.project));
  return ledgerOrder(posts.filter((p) => isListed(p.data)).map(asPost).filter(fits)).slice(0, count);
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const quote = (v) => JSON.stringify(v);

// Checks a picks document and works out what each visible chapter's shelves show.
// site: { posts: post entries (drafts and unlisted ones may be among them: they never come out), projects: a Set of
// project ids, hasMachine(name): whether public/labs/teardown/<name>/ is there }. allowPrivate takes the picker's
// saved document as it is (npm run tea:picks); the repo's file may not hold the private fields.
// Returns { chapters: [{ ...registry chapter, shelves: [{ ...registry shelf, auto, count, keys }] }], warnings };
// keys are post slugs, project ids or machine names. Throws a PicksError on anything the page could not show.
export function readPicks(doc, registry, site, { source = PICKS_FILE, allowPrivate = false } = {}) {
  const fail = (reason) => { throw new PicksError(source, reason); };
  if (!isObject(doc)) fail('the picks are not a JSON object');
  if (doc.v !== PICKS_VERSION) fail(`v is ${quote(doc.v)}, and this code reads only v ${PICKS_VERSION}`);
  for (const key of Object.keys(doc)) {
    if (PRIVATE_FIELDS.includes(key) && !allowPrivate) fail(`"${key}" is the owner's private note to the builder and never belongs in the repo (npm run tea:picks leaves it out)`);
    if (!FIELDS.includes(key) && !PRIVATE_FIELDS.includes(key)) fail(`"${key}" is not a field of the picks (v, order, hidden, shelves)`);
  }

  const byId = new Map(registry.map((c) => [c.id, c]));
  const known = (id, where) => { if (!byId.has(id)) fail(`${where} names chapter ${quote(id)}, which src/data/tea-chapters.js does not have`); };
  const order = doc.order ?? [];
  if (!Array.isArray(order)) fail('order is not a list of chapter ids');
  for (const id of order) known(id, 'order');
  const twice = order.find((id, i) => order.indexOf(id) !== i);
  if (twice) fail(`order names chapter "${twice}" twice`);
  const hidden = doc.hidden ?? {};
  if (!isObject(hidden)) fail('hidden is not an object of chapter ids');
  for (const [id, off] of Object.entries(hidden)) {
    known(id, 'hidden');
    if (typeof off !== 'boolean') fail(`hidden.${id} is ${quote(off)}, not true or false`);
  }

  const posts = new Map(site.posts.map((p) => [p.id, p]));
  const listed = site.posts.filter((p) => isListed(p.data));
  const shelves = doc.shelves ?? {};
  if (!isObject(shelves)) fail('shelves is not an object of "<chapter>/<shelf>" keys');
  const chosen = new Map();
  for (const [key, s] of Object.entries(shelves)) {
    const [cid, sid, extra] = key.split('/');
    known(cid, `shelf "${key}"`);
    const shelf = byId.get(cid).shelves.find((x) => x.id === sid);
    if (!shelf || extra !== undefined) fail(`shelf "${key}" is not a shelf of chapter "${cid}" (${byId.get(cid).shelves.map((x) => x.id).join(', ') || 'it has none'})`);
    if (!isObject(s)) fail(`shelf ${key} is not an object`);
    if (typeof s.auto !== 'boolean') fail(`shelf ${key}: auto is ${quote(s.auto)}, not true or false`);
    if (!Number.isInteger(s.count) || s.count < 1) fail(`shelf ${key}: count is ${quote(s.count)}, not a whole number of at least 1`);
    if (!Array.isArray(s.picks)) fail(`shelf ${key}: picks is not a list`);
    if (s.auto && !shelf.auto) fail(`shelf ${key} cannot fill itself with the newest posts: it holds ${shelf.holds}s`);
    const seen = new Set();
    chosen.set(key, { ...s, keys: s.picks.map((pick) => itemOf(pick, key, shelf, seen)) });
  }

  // One picked key: its slug, project id or machine name, or null for a machine that is not in the lab today.
  function itemOf(pick, key, shelf, seen) {
    const m = typeof pick === 'string' ? /^([pjm])-(.+)$/.exec(pick) : null;
    if (!m) fail(`${quote(pick)} in shelf ${key} is not a key (p-<post>, j-<project> or m-<machine>)`);
    const [, kind, name] = m;
    if (KINDS[kind] !== shelf.holds) fail(`"${pick}" in shelf ${key} is a ${KINDS[kind]}, and this shelf holds ${shelf.holds}s`);
    if (seen.has(pick)) fail(`"${pick}" is picked twice in shelf ${key}`);
    seen.add(pick);
    if (kind === 'p') {
      const post = posts.get(name);
      if (!post) fail(`"${pick}" in shelf ${key} is not a post: no src/content/posts/${name}.md`);
      if (post.data.draft) fail(`"${pick}" in shelf ${key} is a draft, not a listed post`);
      if (!isListed(post.data)) fail(`"${pick}" in shelf ${key} is unlisted, not a listed post`);
    } else if (kind === 'j') {
      if (!site.projects.has(name)) fail(`"${pick}" in shelf ${key} is not a project: no src/content/projects/${name}.yaml`);
    } else {
      if (!NAME.test(name)) fail(`"${pick}" in shelf ${key} is not a machine name`);
      if (!site.hasMachine(name)) return null;
    }
    return name;
  }

  const warnings = [];
  const ids = [...order, ...registry.map((c) => c.id).filter((id) => !order.includes(id))];
  const chapters = ids.filter((id) => !hidden[id]).map((id) => {
    const c = byId.get(id);
    return { ...c, shelves: c.shelves.map((shelf) => {
      const key = `${id}/${shelf.id}`;
      const s = chosen.get(key) ?? { auto: false, count: 1, picks: [], keys: [] };
      s.picks.forEach((pick, i) => s.keys[i] === null &&
        warnings.push(`shelf ${key}: "${pick}" is not in the teardown lab today (public/labs/teardown/), so it is left out`));
      const keys = s.auto ? autoPosts(listed, shelf.auto, s.count).map((p) => p.id)
        : s.keys.filter((k) => k !== null).slice(0, shelf.max);
      for (const slug of keys.filter((k) => shelf.holds === 'post' && isLive(k))) {
        warnings.push(`shelf ${key} shows the live notebook "${slug}" (src/data/exempt.js), which other sessions rewrite at any time`);
      }
      return { ...shelf, auto: s.auto, count: s.count, keys };
    }) };
  });
  return { chapters, warnings };
}

// The picks as the repo keeps them: the private fields left out, keys in a fixed order (the chapter list's for
// hidden and shelves), so the same saved document always gives the same file.
export function picksFile(doc, registry) {
  const shelfKeys = registry.flatMap((c) => c.shelves.map((s) => `${c.id}/${s.id}`));
  const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));
  const shelves = pick(doc.shelves ?? {}, shelfKeys);
  const out = {
    v: doc.v,
    order: [...(doc.order ?? [])],
    hidden: pick(doc.hidden ?? {}, registry.map((c) => c.id)),
    shelves: Object.fromEntries(Object.entries(shelves).map(([k, s]) => [k, { auto: s.auto, count: s.count, picks: [...s.picks] }])),
  };
  return JSON.stringify(out, null, 2) + '\n';
}
