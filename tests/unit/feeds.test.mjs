// /rss.xml, /sitemap.xml and /ledger/previews.json (src/pages/), run as they are over made-up collections: listed
// posts only, newest first in the feed, each by its /ledger/<slug>/ address, a notes page only beside its listed
// post, and never a draft, an unlisted post or a draft Now snapshot; in the sitemap too every published course lesson and
// the works listed posts link. astro-content.mjs stands in for astro:content.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setCollections } from './astro-content.mjs';
import { PROJECTS, TOPICS } from '../../src/data/taxonomy.js';
import { previewsProblems, rssProblems } from '../../scripts/build/contracts.mjs';

const HIDDEN = 'secret-unlisted-post';
const [topic] = Object.keys(TOPICS);
const [project] = Object.keys(PROJECTS);
const post = (slug, id, day, more = {}) => ({ id: slug, data: { id, title: `Title of ${slug}`, summary: `Summary of ${slug}`, date: new Date(`${day}T00:00:00Z`), topic, project: [], ...more } });
const notes = (slug) => ({ id: slug, data: { post: slug, title: `Notes on ${slug}`, summary: 's' } });
const card = { verdict: 'It works', takeaway: 'It ran.', points: ['One.'] };
// The works the posts link (pages under public/, below): only a listed post's count, and only an indexable page.
const body = (slug, text) => (entry) => (entry.id === slug ? { ...entry, body: text } : entry);
setCollections({
  posts: [post('shown', 'AO-001', '2026-10-01', { preview: card }), { ...post('newer', 'AO-003', '2026-11-01', { project: [project] }), text: { words: 460 } },
    post('same-day', 'AO-002', '2026-10-01'), post('a-draft', 'AO-004', '2026-11-02', { draft: true, preview: card }),
    post(HIDDEN, 'AO-005', '2026-11-03', { unlisted: true, preview: { ...card, takeaway: 'Nobody may read this.' } })]
    .map(body('shown', 'Play [the demo](/games/demo/) or read [the notebook](/labs/teardown/x/), or [elsewhere](https://example.com/games/other/).'))
    .map(body('newer', '<a href="https://aaronorelup.com/games/demo/index.html#top">again</a> and [a tool](/tools/noindexed/?a=1) and [a clip](/games/demo/clip.mp4).'))
    .map(body(HIDDEN, 'See [the secret game](/games/secret-game/).'))
    .map(body('a-draft', 'See [the deck](/presentations/draft-deck/).')),
  notes: [notes('shown'), notes(HIDDEN)],
  now: [{ id: '2026-10-01', data: {} }, { id: '2026-11-01', data: {} }, { id: '2026-11-05', data: { draft: true } }],
  research: [{ id: 'a-paper', data: {} }],
});
const SITE = 'https://aaronorelup.com';
// public/ as the build names it (astro.config.mjs defines __PUBLIC_DIR__): a made-up one, where one post has an icon.
const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'public-'));
test.after(() => fs.rmSync(publicDir, { recursive: true }));
fs.mkdirSync(path.join(publicDir, 'media/icons'), { recursive: true });
for (const id of ['AO-003', 'AO-005']) fs.writeFileSync(path.join(publicDir, `media/icons/${id}.webp`), '');
for (const [dir, head] of [['games/demo', ''], ['labs/teardown/x', ''], ['games/other', ''], ['games/secret-game', ''],
  ['presentations/draft-deck', ''], ['tools/noindexed', '<meta content="noindex" name="robots">']]) {
  fs.mkdirSync(path.join(publicDir, dir), { recursive: true });
  fs.writeFileSync(path.join(publicDir, dir, 'index.html'), `<!doctype html><html><head>${head}</head><body></body></html>`);
}
globalThis.__PUBLIC_DIR__ = publicDir;
const rss = await import('../../src/pages/rss.xml.js');
const previews = await import('../../src/pages/ledger/previews.json.js');
const sitemap = await import('../../src/pages/sitemap.xml.js');
const COURSES = { 'the-hidden-curriculum': (await import('../../src/data/courses/the-hidden-curriculum.json', { with: { type: 'json' } })).default,
  'i-love-my-evening-television': (await import('../../src/data/courses/i-love-my-evening-television.json', { with: { type: 'json' } })).default };
const sitemapRows = async () => [...(await (await sitemap.GET({ site: new URL(SITE) })).text())
  .matchAll(/<url><loc>([^<]*)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?<\/url>/g)].map((m) => [m[1].slice(SITE.length), m[2] ?? null]);

test('rss.xml: the listed posts, newest first, each under its own address, and no draft or unlisted post', async () => {
  const xml = await (await rss.GET({ site: new URL(SITE) })).text();
  const guids = [...xml.matchAll(/<guid[^>]*>([^<]*)<\/guid>/g)].map((m) => m[1]);
  assert.deepEqual(guids, ['newer', 'same-day', 'shown'].map((slug) => `${SITE}/ledger/${slug}/`));
  assert.deepEqual([...xml.matchAll(/<title>(Title of [^<]*)<\/title>/g)].map((m) => m[1]), ['Title of newer', 'Title of same-day', 'Title of shown']);
  assert.ok(xml.includes('<description>Summary of newer</description>'));
  assert.ok(xml.includes('<pubDate>Sun, 01 Nov 2026 00:00:00 GMT</pubDate>'));
  assert.ok(!xml.includes(HIDDEN) && !xml.includes('a-draft') && !xml.includes('Summary of a-draft'));
  assert.deepEqual(rssProblems(xml, new Set(['shown', 'newer', 'same-day'])), []);
});

test('sitemap.xml: listed posts and their notes, the Now snapshots that are out, and nothing unlisted or draft', async () => {
  const response = await sitemap.GET({ site: new URL(SITE) });
  assert.equal(response.headers.get('Content-Type'), 'application/xml; charset=utf-8');
  const xml = await response.text();
  const rows = [...xml.matchAll(/<url><loc>([^<]*)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?<\/url>/g)].map((m) => [m[1].slice(SITE.length), m[2] ?? null]);
  assert.equal(rows.length, xml.split('<url>').length - 1, 'a url could not be read');
  // The course pages come from data another repo writes (src/data/lore/): nothing is asked of them here.
  const own = rows.filter(([loc]) => !loc.startsWith('/courses/'));
  const urls = new Map(own);
  assert.equal(urls.size, own.length, 'a page appears twice');
  for (const [loc, lastmod] of [['/', '2026-11-01'], ['/ledger/', '2026-11-01'], ['/about/', null], ['/ledger/newer/', '2026-11-01'], ['/ledger/shown/', '2026-10-01'],
    ['/ledger/shown/notes/', '2026-10-01'], ['/ledger/same-day/', '2026-10-01'], ['/now/', '2026-11-01'], ['/now/2026-11-01/', '2026-11-01'], ['/now/2026-10-01/', '2026-10-01'],
    ['/research/a-paper/', null], ['/stats/', null]]) {
    assert.ok(urls.has(loc), `${loc} is missing`);
    assert.equal(urls.get(loc), lastmod, loc);
  }
  assert.deepEqual([...urls.keys()].filter((loc) => loc.startsWith('/ledger/')).sort(), ['/ledger/', '/ledger/newer/', '/ledger/same-day/', '/ledger/shown/', '/ledger/shown/notes/']);
  assert.deepEqual([...urls.keys()].filter((loc) => loc.startsWith('/now/')).sort(), ['/now/', '/now/2026-10-01/', '/now/2026-11-01/']);
  assert.ok(!xml.includes(HIDDEN) && !xml.includes('a-draft'));
  assert.ok(xml.split('<loc>').slice(1).every((part) => part.startsWith(`${SITE}/`)));
});

test('sitemap.xml: the works listed posts link, once, by their newest post, and none a draft, an unlisted post, a live notebook or noindex keeps', async () => {
  const works = (await sitemapRows()).filter(([loc]) => /^\/(games|presentations|tools|labs)\//.test(loc));
  assert.deepEqual(works, [['/games/demo/', '2026-11-01']]);
});

test('sitemap.xml: every published lesson of both courses, once, dated by its course, and nothing unpublished', async () => {
  const rows = await sitemapRows();
  const urls = new Map(rows);
  assert.equal(urls.size, rows.length, 'a page appears twice');
  let published = 0;
  for (const [slug, course] of Object.entries(COURSES)) {
    assert.match(course.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(urls.get(`/courses/${slug}/`), course.updated, slug);
    for (const lesson of course.modules.flatMap((m) => m.lessons)) {
      if (lesson.status === 'published') published += 1;
      assert.equal(urls.has(lesson.url), lesson.status === 'published' && typeof lesson.url === 'string', lesson.url ?? lesson.id);
      if (lesson.status === 'published') assert.equal(urls.get(lesson.url), course.updated, lesson.url);
    }
  }
  assert.ok(published >= 23, `${published} published lessons`);
  assert.equal(rows.filter(([loc]) => loc.includes('/lessons/')).length, published);
  assert.equal(urls.get('/courses/'), Object.values(COURSES).map((c) => c.updated).sort().at(-1));
  assert.equal(urls.get('/courses/i-love-my-evening-television/world/'), COURSES['i-love-my-evening-television'].updated);
});

test('sitemap.xml: with no site given it is aaronorelup.com', async () => {
  const xml = await (await sitemap.GET({})).text();
  assert.ok(xml.includes(`<url><loc>${SITE}/ledger/shown/</loc><lastmod>2026-10-01</lastmod></url>`));
});

test('previews.json: a card for each listed post and no other, with what the post wrote and nothing empty', async () => {
  const response = await previews.GET();
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  const text = await response.text();
  assert.deepEqual(JSON.parse(text), { posts: {
    newer: { id: 'AO-003', title: 'Title of newer', topic, mins: 2, icon: '/media/icons/AO-003-96.webp', project, projects: [project] },
    'same-day': { id: 'AO-002', title: 'Title of same-day', topic, mins: 1 },
    shown: { id: 'AO-001', title: 'Title of shown', topic, mins: 1, verdict: 'It works', takeaway: 'It ran.', points: ['One.'] },
  }, projects: Object.fromEntries(Object.entries(PROJECTS).map(([k, { label }]) => [k, label])) });
  assert.ok(!text.includes(HIDDEN) && !text.includes('AO-005') && !text.includes('Nobody may read this') && !text.includes('a-draft'));
  assert.deepEqual(previewsProblems(JSON.parse(text), new Set(['shown', 'newer', 'same-day'])), []);
});
