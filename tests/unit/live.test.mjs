// AO-073 is written by a fleet of other sessions (src/data/exempt.js), so whatever they push must build. This breaks
// a copy of it the way the fleet might and runs it through every rule that could fail a build. A task that adds a
// rule adds its case here (T0.3 the checker and the media guard, T1.1 an unknown tag, T2.1 a post with no icon,
// T2.3 search's chunks and manifest, T2.7 the Ask build, W5 a render that throws).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import { LIVE_NOTEBOOKS, isLive, isLivePath } from '../../src/data/exempt.js';
import { markdownProcessor, rehypePlugins } from '../../scripts/build/markdown.mjs';
import { baselineProblems, previewsProblems, readBaseline, rssProblems, statsPagesProblems } from '../../scripts/build/contracts.mjs';
import { collections } from './content-schema.mjs';
import { docOf, manifestOf, shortVersion } from '../../src/lib/search/chunks.js';
import sharp from 'sharp';
import { renderCard } from '../../src/lib/og/card.js';
import { OG } from '../../src/data/limits.js';
import { TOPICS } from '../../src/data/taxonomy.js';

const { slug, paths } = LIVE_NOTEBOOKS['AO-073'];
const file = new URL(`../../src/content/posts/${slug}.md`, import.meta.url);
const { data: post } = matter(fs.readFileSync(file, 'utf8'));
const parse = (data) => collections.posts.schema.safeParse(data);

test('the exempt list names AO-073 by id, slug and every path its fleet writes', () => {
  assert.ok(isLive('AO-073') && isLive(slug));
  for (const p of [...paths, `/ledger/${slug}/`, '/media/teardown-lab/x.webp', '/labs/teardown/lander/']) assert.ok(isLivePath(p), p);
  assert.ok(!isLivePath('/ledger/earthlight/') && !isLivePath('/media/earthlight/x.webp'));
});

test('the schema takes AO-073 as the fleet last pushed it', () => {
  assert.ok(parse(post).success);
});

test('the schema takes a 200-character title and a renamed picture', () => {
  const broken = { ...post, title: 'T'.repeat(200), preview: { ...post.preview, image: '/media/previews/teardown-lab-renamed.webp' } };
  const r = parse(broken);
  assert.ok(r.success, r.error?.message);
});

test('the schema takes a preview with no takeaway (the v2 refinement skips live notebooks)', () => {
  const { takeaway, ...rest } = post.preview;
  assert.ok(parse({ ...post, preview: rest }).success);
});

test('the dist contracts take AO-073 missing from, or mangled in, previews.json, rss.xml and stats-pages.txt', () => {
  const listed = new Set(['earthlight', slug]);
  const card = { id: 'AO-001', title: 'A' };
  const guid = (s) => `<guid>https://aaronorelup.com/ledger/${s}/</guid>`;
  assert.deepEqual(previewsProblems({ posts: { earthlight: card } }, listed), []);
  assert.deepEqual(previewsProblems({ posts: { earthlight: card, [slug]: { title: 7 } } }, new Set(['earthlight'])), []);
  assert.deepEqual(rssProblems(guid('earthlight'), listed), []);
  assert.deepEqual(rssProblems(guid('earthlight') + guid(slug) + guid(slug), listed), []);
  assert.deepEqual(statsPagesProblems(`/ledger/earthlight/\n/ledger/${slug}/lander/`, new Set(['earthlight'])), []);
});

test('the URL baseline leaves every live path out, and never misses one', () => {
  const baseline = readBaseline();
  assert.deepEqual(baseline.filter(isLivePath), []);
  const gone = ['/ledger/teardown-lab/', '/labs/teardown/lander/', '/labs/teardown/x/'];
  assert.deepEqual(baselineProblems(gone, () => false, new Set()), []);
  assert.equal(baselineProblems(['/ledger/earthlight/'], () => false, new Set()).length, 1);
});

test('an unknown <ao-*> tag only warns in AO-073, and fails the render of any other post', async (t) => {
  const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
  const md = await createMarkdownProcessor({ rehypePlugins: rehypePlugins({ publicDir }), syntaxHighlight: false });
  // A made-up body, not AO-073's own: the fleet's real text may hold anything, and must never fail this test.
  const typo = 'The fleet wrote a paragraph.\n\n<ao-slider></ao-slider>\n\n<ao-sliderr></ao-sliderr>\n';
  const warn = t.mock.method(console, 'warn', () => {});
  const { code } = await md.render(typo, { fileURL: file, frontmatter: {} });
  assert.match(code, /<ao-sliderr><\/ao-sliderr>/);
  assert.ok(warn.mock.calls.some((c) => /<ao-sliderr> is not a post component/.test(c.arguments[0])));
  const other = new URL('../../src/content/posts/earthlight.md', import.meta.url);
  await assert.rejects(md.render(typo, { fileURL: other, frontmatter: {} }), /<ao-sliderr> is not a post component/);
});

test('a Markdown file that throws as it renders builds AO-073 blank, and fails any other post', async (t) => {
  const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
  const md = await markdownProcessor({ publicDir }).createRenderer({ syntaxHighlight: false });
  // A picture whose name holds a bare %, which no URI decodes: the kind of typo the fleet's files could carry.
  const typo = 'The fleet wrote a paragraph.\n\n<img src="/media/teardown-lab/50%.webp" alt="">\n';
  t.mock.method(console, 'error', () => {});
  const warn = t.mock.method(console, 'warn', () => {});
  const { code, metadata } = await md.render(typo, { fileURL: file, frontmatter: { title: 'T' } });
  assert.equal(code, '');
  assert.deepEqual(metadata.frontmatter, { title: 'T' });
  assert.ok(warn.mock.calls.some((c) => /teardown-lab\.md did not render; its page builds blank/.test(c.arguments[0])));
  const other = new URL('../../src/content/posts/earthlight.md', import.meta.url);
  await assert.rejects(md.render(typo, { fileURL: other, frontmatter: {} }), /URI malformed/);
});

test('AO-073 rendered blank is still a search doc; its pushes leave the search manifest v alone, its unlisting does not', () => {
  const lead = shortVersion(post.summary, post.preview ?? {});
  const doc = (s, text) => docOf({ kind: 'post', id: s === slug ? 'AO-073' : 'AO-048', slug: s, title: 'T', lead, text });
  const sections = [{ anchor: 'a', heading: 'A', text: 'The fleet wrote this.', folded: false }];
  const blank = doc(slug, undefined);
  assert.deepEqual(blank.chunks.map((c) => c.anchor), ['short']);
  const before = manifestOf([doc('earthlight', { sections }), blank]);
  const after = manifestOf([doc('earthlight', { sections }), doc(slug, { sections })]);
  assert.deepEqual(before.live, [`post:${slug}`]);
  assert.equal(after.v, before.v);
  assert.notEqual(after.docs[`post:${slug}`], before.docs[`post:${slug}`]);
  assert.notEqual(manifestOf([doc('earthlight', { sections })]).v, before.v, 'AO-073 unlisted moves v, so the sync drops it');
});

test('AO-073 has no icon, and its share card draws the topic glyph, even with a 200-character title and no topic', async () => {
  assert.ok(!fs.existsSync(new URL('../../public/media/icons/AO-073.webp', import.meta.url)));
  const topic = TOPICS[post.topic] ?? TOPICS.agents;   // what the schema's transform gives a post with no topic
  const fontfile = fileURLToPath(new URL('../../src/assets/fonts/zen-maru-gothic-700-latin.ttf', import.meta.url));
  for (const title of [post.title, 'T'.repeat(200)]) {
    const jpg = await renderCard({ fontfile, eyebrow: `AO-073 · ${topic.label}`, title, verdict: post.preview?.verdict, glyph: topic.glyph });
    const { format, width, height } = await sharp(jpg).metadata();
    assert.deepEqual([format, width, height], ['jpeg', OG.width, OG.height]);
    assert.ok(jpg.length <= OG.cap, `${jpg.length} bytes`);
  }
});

test('the Ask build takes AO-073 oversized, unrendered or with anchors its page lacks: it cuts, and only warns', async () => {
  const { assemble } = await import('../../src/lib/ask/manifest.js');
  const { askCheck } = await import('../../scripts/build/ask-dist.mjs');
  const { LIVE_CAP } = await import('../../src/lib/ask/caps.js');
  const os = await import('node:os');
  const path = await import('node:path');
  const short = { anchor: 'short', heading: 'The short version', text: post.summary };
  const base = { n: 48, slug: 'earthlight', url: '/ledger/earthlight/', title: 'E', topic: 'video', by: 'Aaron', takeaway: 'T',
    short, live: false, notes: null, sections: [{ anchor: '', heading: '', text: 'Opening.' }] };
  const live = (sections) => ({ n: 73, slug, url: `/ledger/${slug}/`, title: 'T'.repeat(200), topic: post.topic ?? 'agents',
    by: 'Aaron', takeaway: '', short, live: true, notes: null, sections });
  const huge = Array.from({ length: 300 }, (_, i) => ({ anchor: `round-${i}`, heading: `Round ${i}`, text: 'The fleet wrote this. '.repeat(200) }));
  for (const sections of [huge, []]) {
    const { manifest: m, files } = assemble([base, live(sections)], { pins: [1] });
    assert.ok(m.docs[73].tokens <= LIVE_CAP);
    if (sections.length) assert.equal(m.docs[73].cut, 'ends');
    else assert.deepEqual(m.docs[73].sections.map((s) => s[0]), ['0']);
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-live-'));
    fs.mkdirSync(path.join(dist, 'ask'));
    fs.writeFileSync(path.join(dist, 'ask/manifest.json'), JSON.stringify(m));
    for (const [f, body] of files) fs.writeFileSync(path.join(dist, 'ask', f), body);
    fs.mkdirSync(path.join(dist, 'ledger/earthlight'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'ledger/earthlight/index.html'), '<aside id="short"></aside>');
    const { problems, warnings } = askCheck(dist, new Set(['earthlight']));   // AO-073's page not even built
    assert.deepEqual(problems, []);
    assert.ok(warnings.length > 0);
  }
});
