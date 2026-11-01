// The text extraction (scripts/build/rehype-post-text.mjs) through Astro's own Markdown processor, on five real posts
// frozen in archive/ so the numbers hold while the live posts are rewritten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import { rehypePlugins } from '../../scripts/build/markdown.mjs';
import rehypePostImages from '../../scripts/build/rehype-post-images.mjs';
import { sha256hex, short } from '../../src/lib/text/hash.js';

const ROOT = new URL('../../', import.meta.url);
const publicDir = fileURLToPath(new URL('public/', ROOT));
const POSTS = ['blackwater-weekend', 'claude-text-watermark', 'the-naughty-list', 'the-thought-it-denied', 'touch-move'];
const fileOf = (slug) => new URL(`archive/2026-10-29-before-rework/posts/${slug}.md`, ROOT);
const bodyOf = (slug) => matter(fs.readFileSync(fileOf(slug), 'utf8')).content.trim();
const processor = (plugins) => createMarkdownProcessor({ rehypePlugins: plugins, syntaxHighlight: false });
const render = async (md, slug, body = bodyOf(slug)) => md.render(body, { fileURL: fileOf(slug), frontmatter: {} });

const ours = await processor(rehypePlugins({ publicDir }));

// The count previews.json.js turns into minutes today (before rounding): the Markdown with its tags stripped.
function oldWords(body) {
  const prose = body.replace(/<(table|pre|ao-series)\b[\s\S]*?<\/\1>/gi, ' ').replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '').replace(/&[a-z]+;|&#\d+;/g, ' ');
  return prose.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
}

test('two runs give the same text, and block i is the element stamped data-r="i"', async () => {
  const again = await processor(rehypePlugins({ publicDir }));
  for (const slug of POSTS) {
    const [a, b] = [await render(ours, slug), await render(again, slug)];
    const hash = (r) => short(sha256hex(JSON.stringify(r.metadata.frontmatter.text)));
    assert.equal(hash(a), hash(b), slug);
    const stamps = [...a.code.matchAll(/ data-r="(\d+)"/g)].map((m) => Number(m[1]));
    assert.deepEqual(stamps, a.metadata.frontmatter.text.read.blocks.map((_, i) => i), slug);
  }
});

test('the word count is within 5% of the reading-time count it replaces', async () => {
  for (const slug of POSTS) {
    const { words } = (await render(ours, slug)).metadata.frontmatter.text;
    const old = oldWords(bodyOf(slug));
    assert.ok(Math.abs(words - old) <= old * 0.05, `${slug}: ${words} words, ${old} before`);
  }
});

test('every heading keeps the id Astro gave it', async () => {
  const astro = await processor([[rehypePostImages, { publicDir }]]);
  for (const slug of POSTS) {
    const ids = async (md) => (await render(md, slug)).metadata.headings.map((h) => h.slug);
    assert.deepEqual(await ids(ours), await ids(astro), slug);
  }
});

test('a heading that would take an id the page uses gets -1', async () => {
  const { metadata } = await render(ours, POSTS[0], '## Contents\n\n## Scene 2\n\n## Contents');
  assert.deepEqual(metadata.headings.map((h) => h.slug), ['contents-1', 'scene-2-1', 'contents-2']);
});
