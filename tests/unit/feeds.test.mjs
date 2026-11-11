// /rss.xml and /sitemap.xml (src/pages/), run as they are over made-up collections: listed posts only, newest first,
// each by its /ledger/<slug>/ address, a notes page only beside its listed post, and never a draft, an unlisted post
// or a draft Now snapshot. astro:content is stood in for by a loader (as worker-env.mjs does for .sql), and a JSON
// file under src/ is imported the way the build imports it.
import assert from 'node:assert/strict';
import { register } from 'node:module';
import test from 'node:test';
import { PROJECTS, TOPICS } from '../../src/data/taxonomy.js';
import { rssProblems } from '../../scripts/build/contracts.mjs';

register('data:text/javascript,' + encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  export async function resolve(specifier, context, next) {
    return specifier === 'astro:content' ? { url: 'stub:astro-content', shortCircuit: true } : next(specifier, context);
  }
  export async function load(url, context, next) {
    if (url === 'stub:astro-content') {
      return { format: 'module', shortCircuit: true, source: 'export const getCollection = async (name) => [...(globalThis.COLLECTIONS[name] ?? [])];'
        + 'export const render = async () => ({ remarkPluginFrontmatter: {} });' };
    }
    if (url.startsWith('file:') && url.includes('/src/data/') && url.endsWith('.json') && context.importAttributes?.type !== 'json') {
      return { format: 'module', shortCircuit: true, source: 'export default ' + await readFile(new URL(url), 'utf8') };
    }
    return next(url, context);
  }`));

const HIDDEN = 'secret-unlisted-post';
const [topic] = Object.keys(TOPICS);
const [project] = Object.keys(PROJECTS);
const post = (slug, id, day, more = {}) => ({ id: slug, data: { id, title: `Title of ${slug}`, summary: `Summary of ${slug}`, date: new Date(`${day}T00:00:00Z`), topic, project: [], ...more } });
const notes = (slug) => ({ id: slug, data: { post: slug, title: `Notes on ${slug}`, summary: 's' } });
globalThis.COLLECTIONS = {
  posts: [post('shown', 'AO-001', '2026-10-01'), post('newer', 'AO-003', '2026-11-01', { project: [project] }), post('same-day', 'AO-002', '2026-10-01'),
    post('a-draft', 'AO-004', '2026-11-02', { draft: true }), post(HIDDEN, 'AO-005', '2026-11-03', { unlisted: true })],
  notes: [notes('shown'), notes(HIDDEN)],
  now: [{ id: '2026-10-01', data: {} }, { id: '2026-11-01', data: {} }, { id: '2026-11-05', data: { draft: true } }],
  research: [{ id: 'a-paper', data: {} }],
};
const SITE = 'https://aaronorelup.com';
const rss = await import('../../src/pages/rss.xml.js');
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
