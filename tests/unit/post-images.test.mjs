// rehype-post-images through Astro's own Markdown processor: every post picture but the first loads lazily, a loading
// the post wrote wins, and a live notebook (AO-073) gets no loading attribute at all.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypePostImages from '../../scripts/build/rehype-post-images.mjs';

const ROOT = new URL('../../', import.meta.url);
const publicDir = fileURLToPath(new URL('public/', ROOT));
const BODY = [
  '<img src="/media/earthlight/desk.webp" alt="one">',
  '',
  '<figure><img src="/media/earthlight/dinner.webp" alt="two"></figure>',
  '',
  '<img src="/media/earthlight/dray.webp" alt="three" loading="eager">',
  '',
  '<ao-slider><img src="/media/earthlight/chaos.webp" alt="a"><img src="/media/earthlight/crack.webp" alt="b"></ao-slider>',
].join('\n');

const md = await createMarkdownProcessor({ rehypePlugins: [[rehypePostImages, { publicDir }]], syntaxHighlight: false });
const imgs = (html) => [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const loadingOf = (tag) => tag.match(/ loading="([^"]*)"/)?.[1] ?? null;
// Read only for its path: this test never opens or edits the notebook.
const render = (file) => md.render(BODY, { fileURL: new URL(file, ROOT), frontmatter: {} });

test('the first picture is left as written, the rest load lazily, an explicit loading wins', async () => {
  const tags = imgs((await render('src/content/posts/a-test-post.md')).code);
  assert.equal(tags.length, 5);
  assert.deepEqual(tags.map(loadingOf), [null, 'lazy', 'eager', 'lazy', 'lazy']);
  for (const t of tags) assert.match(t, / width="\d+" height="\d+"/);
});

test('a live notebook gets no loading attribute', async () => {
  const tags = imgs((await render('src/content/posts/teardown-lab.md')).code);
  assert.equal(tags.length, 5);
  assert.deepEqual(tags.map(loadingOf), [null, null, 'eager', null, null]);
  for (const t of tags) assert.match(t, / width="\d+" height="\d+"/);
});
