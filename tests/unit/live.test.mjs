// AO-073 is written by a fleet of other sessions (src/data/exempt.js), so whatever they push must build. This breaks
// a copy of it the way the fleet might and runs it through every rule that could fail a build. A task that adds a
// rule adds its case here (T0.3 the checker and the media guard, T1.1 an unknown tag, T2.1 a post with no icon).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import { LIVE_NOTEBOOKS, isLive, isLivePath } from '../../src/data/exempt.js';
import { rehypePlugins } from '../../scripts/build/markdown.mjs';
import { baselineProblems, previewsProblems, readBaseline, rssProblems, statsPagesProblems } from '../../scripts/build/contracts.mjs';
import { collections } from './content-schema.mjs';

const { slug, paths } = LIVE_NOTEBOOKS['AO-073'];
const file = new URL(`../../src/content/posts/${slug}.md`, import.meta.url);
const { data: post, content: body } = matter(fs.readFileSync(file, 'utf8'));
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
  const typo = `${body}\n\n<ao-sliderr></ao-sliderr>\n`;
  const warn = t.mock.method(console, 'warn', () => {});
  const { code } = await md.render(typo, { fileURL: file, frontmatter: {} });
  assert.match(code, /<ao-sliderr><\/ao-sliderr>/);
  assert.ok(warn.mock.calls.some((c) => /<ao-sliderr> is not a post component/.test(c.arguments[0])));
  const other = new URL('../../src/content/posts/earthlight.md', import.meta.url);
  await assert.rejects(md.render(typo, { fileURL: other, frontmatter: {} }), /<ao-sliderr> is not a post component/);
});
