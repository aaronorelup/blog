// The tea room's shaping (src/lib/tea.js) and its copy and SEO switch (src/data/tea.js), over the real posts, notes
// and lore read the way the build reads them: every listed post shows once, under its topic; counts, numerals and
// dates come out right; a project card gets its one link; teaSeo() gives the table below for each value of the
// switch, and 'pending' is what ships until Aaron decides.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';
import { PHRASES } from '../../src/data/banned-phrases.js';
import { TOPICS } from '../../src/data/taxonomy.js';
import { CHAPTERS, COPY, TEA_CANONICAL_TWIN, TEA_PAGE, TEA_SEO, teaSeo } from '../../src/data/tea.js';
import { isListed, ledgerOrder } from '../../src/lib/posts.js';

// src/lib/paths.js reads the __PUBLIC_DIR__ define Astro gives the build; tea.js reaches it through icons.js.
globalThis.__PUBLIC_DIR__ = fileURLToPath(new URL('../../public/', import.meta.url));
const { counterLine, ledgerByTopic, loreHub, plural, postRow, projectHref, roman } = await import('../../src/lib/tea.js');

// Posts as lib/content.js hands them out: the file name is the id, the frontmatter through the schema.
const dir = (d) => new URL(`../../src/content/${d}/`, import.meta.url);
const names = (d) => fs.readdirSync(dir(d)).filter((f) => f.endsWith('.md')).sort().map((f) => f.slice(0, -3));
const posts = names('posts').map((id) => ({
  id,
  data: collections.posts.schema.parse(matter(fs.readFileSync(new URL(`${id}.md`, dir('posts')), 'utf8')).data),
}));
const listed = posts.filter((p) => isListed(p.data));
const notes = new Map(names('notes').map((id) => [id, { id }]));
const pictured = (p) => !!p.data.preview?.image;

// A made-up post, for the cases the real ones may not hold today.
let n = 0;
const fake = (topic, date, preview) => ({ id: `fake-${++n}`, data: { id: `AO-9${String(n).padStart(2, '0')}`,
  title: `Fake ${n}`, summary: 'A made-up post.', date: new Date(date), topic, project: [], preview } });
const pic = { takeaway: 'x', points: [], image: '/media/previews/x.webp' };

test('roman numerals for the chapters and the breaths between them', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 19, 24, 39].map(roman),
    ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XIV', 'XIX', 'XXIV', 'XXXIX']);
  assert.equal(roman(0), '');
  const all = CHAPTERS.map((c, i) => roman(i + 1));
  assert.equal(new Set(all).size, CHAPTERS.length);
});

test('plural: the count with its word, one or many, thousands with a comma', () => {
  assert.equal(plural(0, COPY.postCount), '0 posts');
  assert.equal(plural(1, COPY.postCount), '1 post');
  assert.equal(plural(2, COPY.projectCount), '2 projects');
  assert.equal(plural(1234, COPY.postCount), '1,234 posts');
});

test("counterLine: the hero's one line, each count with its own word, in the order given", () => {
  assert.equal(counterLine({ posts: 73, projects: 41, courses: 2 }, COPY.counter), '73 posts · 41 projects · 2 courses');
  assert.equal(counterLine({ posts: 1, projects: 1, courses: 1 }, COPY.counter), '1 post · 1 project · 1 course');
  assert.equal(counterLine({ courses: 2, posts: 0 }, COPY.counter), '2 courses · 0 posts');
});

test('postRow: every listed post as its cards and rows show it', () => {
  for (const post of listed) {
    const r = postRow(post, notes);
    const { id, title, summary, date, topic, preview, icon } = post.data;
    assert.deepEqual([r.slug, r.id, r.title, r.summary], [post.id, id, title, summary]);
    assert.equal(r.href, `/ledger/${post.id}/`);
    assert.equal(r.notesHref, notes.has(post.id) ? `/ledger/${post.id}/notes/` : null);
    assert.equal(r.iso, date.toISOString().slice(0, 10));
    assert.deepEqual([r.topic, r.topicLabel, r.glyph], [topic, TOPICS[topic].label, TOPICS[topic].glyph]);
    assert.equal(r.verdict, preview?.verdict ?? null);
    assert.deepEqual(r.image, preview?.image ? { src: preview.image, alt: preview.alt ?? '' } : null);
    // its own icon when public/ has the file, else null and the page draws the topic's glyph
    const s256 = icon ?? `/media/icons/${id}.webp`;
    const has = fs.existsSync(new URL(`../../public${s256}`, import.meta.url));
    assert.deepEqual(r.icon, has ? { s256, s96: s256.replace(/\.webp$/, '-96.webp') } : null, post.id);
  }
  assert.ok(listed.some((p) => notes.has(p.id)), 'some listed post has notes');
});

test('postRow: dates in UTC, and a post with no card, no picture or no notes', () => {
  const r = postRow(fake('video', '2026-10-01', undefined));
  assert.deepEqual([r.day, r.date, r.iso], ['Oct 1', 'Oct 01, 2026', '2026-10-01']);
  assert.deepEqual([r.verdict, r.image, r.notesHref], [null, null, null]);
  const card = postRow(fake('art', '2026-11-30', { ...pic, verdict: 'It held up' }), new Map());
  assert.deepEqual([card.verdict, card.image, card.notesHref], ['It held up', { src: pic.image, alt: '' }, null]);
});

test('ledgerByTopic: every listed post once, under its topic, biggest topic first, the first two pictured as cards', () => {
  const topics = ledgerByTopic(listed, notes);
  const shown = topics.flatMap((t) => [...t.features, ...t.rows].map((r) => r.slug));
  assert.equal(new Set(shown).size, shown.length);
  assert.deepEqual([...shown].sort(), listed.map((p) => p.id).sort());
  assert.deepEqual(topics.map((t) => t.key).sort(), [...new Set(listed.map((p) => p.data.topic))].sort());
  const order = Object.keys(TOPICS);
  for (const [a, b] of topics.slice(1).map((t, i) => [topics[i], t])) {
    assert.ok(a.count > b.count || (a.count === b.count && order.indexOf(a.key) < order.indexOf(b.key)), `${a.key}, ${b.key}`);
  }
  for (const t of topics) {
    const mine = ledgerOrder(listed.filter((p) => p.data.topic === t.key));
    const cards = mine.filter(pictured).slice(0, 2).map((p) => p.id);
    assert.deepEqual([t.anchor, t.label, t.glyph, t.count], [`topic-${t.key}`, TOPICS[t.key].label, TOPICS[t.key].glyph, mine.length]);
    assert.deepEqual(t.features.map((r) => r.slug), cards);
    assert.deepEqual(t.rows.map((r) => r.slug), mine.map((p) => p.id).filter((id) => !cards.includes(id)));
  }
});

test('ledgerByTopic on made-up posts: ties keep the taxonomy order, features is a cap, unpictured posts stay rows', () => {
  const few = [fake('site', '2026-10-02', pic), fake('site', '2026-10-03'), fake('video', '2026-10-01'),
    fake('video', '2026-10-05', pic), fake('games', '2026-10-04', pic)];
  const topics = ledgerByTopic(few);
  assert.deepEqual(topics.map((t) => [t.key, t.count]), [['video', 2], ['site', 2], ['games', 1]]);
  assert.deepEqual(topics[1].features.map((r) => r.slug), [few[0].id]);
  assert.deepEqual(topics[1].rows.map((r) => r.slug), [few[1].id]);
  assert.deepEqual(ledgerByTopic(few, undefined, 0).flatMap((t) => t.features), []);
  assert.deepEqual(ledgerByTopic([]), []);
});

test("loreHub: the lore course's sections in COPY.hub order, each with what the lore data holds", () => {
  const lore = JSON.parse(fs.readFileSync(new URL('../../src/data/lore/lore.json', import.meta.url), 'utf8'));
  const hub = loreHub(lore, '/courses/c', COPY.hub);
  assert.deepEqual(hub.map((h) => h.key), Object.keys(COPY.hub));
  for (const h of hub) {
    assert.deepEqual([h.label, h.href], [COPY.hub[h.key], `/courses/c/${h.key}/`]);
    // the world and set-in-steel pages hold no one list, so they show no count
    assert.equal(h.count, ['world', 'steel'].includes(h.key) ? null : lore[h.key].length, h.key);
  }
  assert.deepEqual(loreHub({}, '/c', { timeline: 'T', world: 'W', other: 'O' }).map((h) => h.count), [0, null, null]);
});

test("projectHref: a card's main link (an anchor on /projects/ from here), else its first write-up, else its section", () => {
  assert.deepEqual(projectHref({ main: { href: '#proj-reel', external: false }, section: 'watch' }),
    { href: '/projects/#proj-reel', external: false });
  assert.deepEqual(projectHref({ main: { href: 'https://example.com/x', external: true }, posts: [{ slug: 'a' }] }),
    { href: 'https://example.com/x', external: true });
  assert.deepEqual(projectHref({ main: { href: '/games/x/', external: false } }), { href: '/games/x/', external: false });
  assert.deepEqual(projectHref({ posts: [{ slug: 'a' }, { slug: 'b' }], section: 'read' }), { href: '/ledger/a/', external: false });
  assert.deepEqual(projectHref({ main: null, posts: [], section: 'stopped' }), { href: '/projects/#proj-stopped', external: false });
});

// The four policies Aaron chooses from: canonical null is the Head's default (the page itself); a path is named
// instead, against the site, so canonical-main's '/' is https://aaronorelup.com/.
const TABLE = {
  pending: { noindex: false, canonical: null, inSitemap: false },
  'canonical-main': { noindex: false, canonical: '/', inSitemap: false },
  noindex: { noindex: true, canonical: null, inSitemap: false },
  index: { noindex: false, canonical: null, inSitemap: true },
};

test('teaSeo(): each value of the switch gives exactly its row of the table, and no other value is taken', () => {
  for (const [policy, row] of Object.entries(TABLE)) assert.deepEqual(teaSeo(policy), row, policy);
  assert.equal(TEA_CANONICAL_TWIN, TABLE['canonical-main'].canonical);
  assert.deepEqual(teaSeo('canonical-main', '/ledger/'), { ...TABLE['canonical-main'], canonical: '/ledger/' });
  for (const bad of ['', 'Pending', 'canonical', 'none', null]) {
    assert.throws(() => teaSeo(bad), /not one of pending, canonical-main, noindex, index/, String(bad));
  }
});

test("the switch ships as 'pending' until Aaron decides: what any new page gets, and no sitemap entry", () => {
  assert.equal(TEA_SEO, 'pending');
  assert.deepEqual(teaSeo(), TABLE.pending);
});

// Every string of the tea room's own copy; the copy's functions are called with sample numbers.
const strings = (v) => (typeof v === 'string' ? [v] : typeof v === 'function' ? strings(v(3, 5))
  : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);

test("the tea room's own copy keeps WRITING.md's rules a script can see", () => {
  const phrase = new RegExp(`\\b(?:${PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'i');
  const rules = [[/—/, 'an em dash'], [/\s–\s/, 'a spaced en dash'], [/;/, 'a semicolon'],
    [/!/, 'an exclamation mark'], [/[‘’“”]/, 'a curly quote'], [phrase, 'a banned phrase']];
  const all = strings([TEA_PAGE, CHAPTERS, COPY]);
  assert.ok(all.length > 50);
  assert.deepEqual(all.flatMap((s) => rules.filter(([re]) => re.test(s)).map(([, what]) => `${what}: ${s}`)), []);
});

// ---------------------------------------------------------------- the rebuilt page (/labs/tea-room/engine/ until the swap)
const ROOM_IDS = ['hero', 'start', 'tv', 'film', 'games', 'art', '3d', 'agents', 'learning', 'site', 'projects', 'courses', 'now', 'about'];
const roomScene = async (id) => (await import(`../../src/data/tea/${id}/scene.js`));
const roomFirst = (mod) => mod.scene ?? mod.scenes[mod.run[0]];

test("every chapter's copy: its title is the registry's, its giant word's lines read the title, it has a short name", async () => {
  const { TEA_CHAPTERS } = await import('../../src/data/tea-chapters.js');
  for (const id of ROOM_IDS) {
    const c = COPY.room.chapters[id];
    assert.ok(c, `${id}: COPY.room.chapters.${id}`);
    assert.equal(c.title, TEA_CHAPTERS.find((x) => x.id === id).title, `${id}: the title is the registry's`);
    assert.equal([c.small, ...c.lines].filter(Boolean).join(' '), c.title, `${id}: small + lines read the title`);
    assert.equal(typeof c.short, 'string');
    assert.equal(typeof c.approved, 'boolean');
  }
});

test("every chapter's css gives the scroll length and the light its scene.js gives (they are kept in two places)", async () => {
  for (const id of ROOM_IDS) {
    const first = roomFirst(await roomScene(id));
    const css = fs.readFileSync(new URL(`../../src/styles/tea/room/chapters/${id}.css`, import.meta.url), 'utf8');
    const [d, p] = [...css.matchAll(/--base: ([\d.]+); --per: ([\d.]+);/g)].map((m) => [Number(m[1]), Number(m[2])]);
    assert.deepEqual(d, first.length.d, `${id}: d`);
    assert.deepEqual(p, first.length.p, `${id}: p`);
    assert.equal(/--light: (#[0-9A-Fa-f]{6})/.exec(css)?.[1], first.light.colour, `${id}: light`);
  }
});

test('the approved test (turned on by the swap, piece 6a): every chapter\'s copy has the owner\'s yes', { skip: 'until the swap (6a)' }, () => {
  for (const id of ROOM_IDS) assert.equal(COPY.room.chapters[id].approved, true, id);
});
