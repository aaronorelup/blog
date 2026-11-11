// /rss.xml, /sitemap.xml and /ledger/previews.json (src/pages/), run as they are over made-up collections: listed
// posts only, newest first in the feed, each by its /ledger/<slug>/ address, a notes page only beside its listed
// post, and never a draft, an unlisted post or a draft Now snapshot. astro-content.mjs stands in for astro:content.
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
setCollections({
  posts: [post('shown', 'AO-001', '2026-10-01', { preview: card }), { ...post('newer', 'AO-003', '2026-11-01', { project: [project] }), text: { words: 460 } },
    post('same-day', 'AO-002', '2026-10-01'), post('a-draft', 'AO-004', '2026-11-02', { draft: true, preview: card }),
    post(HIDDEN, 'AO-005', '2026-11-03', { unlisted: true, preview: { ...card, takeaway: 'Nobody may read this.' } })],
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
globalThis.__PUBLIC_DIR__ = publicDir;
const rss = await import('../../src/pages/rss.xml.js');
const previews = await import('../../src/pages/ledger/previews.json.js');
const sitemap = await import('../../src/pages/sitemap.xml.js');

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
    ['/research/a-paper/', null]]) {
    assert.ok(urls.has(loc), `${loc} is missing`);
    assert.equal(urls.get(loc), lastmod, loc);
  }
  assert.deepEqual([...urls.keys()].filter((loc) => loc.startsWith('/ledger/')).sort(), ['/ledger/', '/ledger/newer/', '/ledger/same-day/', '/ledger/shown/', '/ledger/shown/notes/']);
  assert.deepEqual([...urls.keys()].filter((loc) => loc.startsWith('/now/')).sort(), ['/now/', '/now/2026-10-01/', '/now/2026-11-01/']);
  assert.ok(!xml.includes(HIDDEN) && !xml.includes('a-draft'));
  assert.ok(xml.split('<loc>').slice(1).every((part) => part.startsWith(`${SITE}/`)));
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
    newer: { id: 'AO-003', title: 'Title of newer', topic, mins: 2, icon: '/media/icons/AO-003-96.webp' },
    'same-day': { id: 'AO-002', title: 'Title of same-day', topic, mins: 1 },
    shown: { id: 'AO-001', title: 'Title of shown', topic, mins: 1, verdict: 'It works', takeaway: 'It ran.', points: ['One.'] },
  } });
  assert.ok(!text.includes(HIDDEN) && !text.includes('AO-005') && !text.includes('Nobody may read this') && !text.includes('a-draft'));
  assert.deepEqual(previewsProblems(JSON.parse(text), new Set(['shown', 'newer', 'same-day'])), []);
});
