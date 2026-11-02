// RAG Goobie's build (src/lib/ask/, scripts/build/ask-dist.mjs): text.full (everything a reader sees, split at the
// same h2s as text.sections, which with the rest of `text` stays as it was), section numbering, the DOC_CAP and
// LIVE_CAP cuts, fragments, whole and split mode with pinned ranges, the manifest's v, the dist checks, the caps' sums.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import { rehypePlugins } from '../../scripts/build/markdown.mjs';
import { askCheck } from '../../scripts/build/ask-dist.mjs';
import { sha256hex, short } from '../../src/lib/text/hash.js';
import { BUDGET, sums } from '../../src/lib/ask/caps.js';
import { numbered, sized } from '../../src/lib/ask/corpus.js';
import { docBlock } from '../../src/lib/ask/blocks.js';
import { packsOf } from '../../src/lib/ask/packs.js';
import { built, doc, DOCS } from './ask-fixture.mjs';

const ROOT = new URL('../../', import.meta.url);
const md = await createMarkdownProcessor({ rehypePlugins: rehypePlugins({ publicDir: path.join(ROOT.pathname, 'public/') }), syntaxHighlight: false });
const render = async (body, slug = 'x') => (await md.render(body, { fileURL: new URL(`src/content/posts/${slug}.md`, ROOT), frontmatter: {} }))
  .metadata.frontmatter.text;

test('text.full holds what a reader sees: table rows, code (cut at 2,000), captions, folded text, lists', async () => {
  const code = 'x'.repeat(2500);
  const text = await render(['Opening with `code/x.js` in it.', '## Facts', '| Model | Time |\n|---|---|\n| H3 | 5 min |',
    '1. one\n2. two', `\`\`\`\n${code}\n\`\`\``, '<figure><img src="/x.webp" alt="a picture"><figcaption>A caption.</figcaption></figure>',
    '<details><summary>More</summary>\n\nFolded words.\n\n</details>', '<div aria-hidden="true">Hidden.</div>', '## End', 'Last.'].join('\n\n'));
  assert.deepEqual(text.full.map((s) => [s.anchor, s.heading]), text.sections.map((s) => [s.anchor, s.heading]));
  assert.equal(text.full[0].text, 'Opening with code/x.js in it.');
  assert.equal(text.full[1].text, `Model | Time\nH3 | 5 min\n\n1. one\n2. two\n\n${'x'.repeat(2000)} (cut)\n\nA caption.\n\nMore\n\nFolded words.`);
  assert.ok(!JSON.stringify(text.full).includes('a picture') && !JSON.stringify(text.full).includes('Hidden.'));
});

// `text` without full, as origin/main's extraction made it before T2.7 (hashes taken from that plugin).
const BEFORE = { 'blackwater-weekend': 'a8b255e8', 'claude-text-watermark': '759f3b5c', 'the-naughty-list': 'f2006023',
  'the-thought-it-denied': 'acd9eae7', 'touch-move': '26d5db54' };
test('everything else the extraction writes is unchanged on the five archived posts, and full splits where sections do', async () => {
  for (const [slug, hash] of Object.entries(BEFORE)) {
    const file = new URL(`archive/2026-10-29-before-rework/posts/${slug}.md`, ROOT);
    const r = await md.render(matter(fs.readFileSync(file, 'utf8')).content.trim(), { fileURL: file, frontmatter: {} });
    const { full, ...rest } = r.metadata.frontmatter.text;
    assert.equal(short(sha256hex(JSON.stringify(rest))), hash, slug);
    assert.deepEqual(full.map((s) => s.anchor), rest.sections.map((s) => s.anchor), slug);
  }
});

test('sections are numbered 0 (the short version), 1 (the opening), then each h2; a notes page N0 (summary and opening), N1...', () => {
  const d = numbered(DOCS[5]);
  assert.deepEqual(d.parts.map((p) => [p.s, p.kind, p.anchor]), [['0', 'post', 'short'], ['1', 'post', ''], ['2', 'post', 'first'],
    ['3', 'post', 'second'], ['N0', 'notes', ''], ['N1', 'notes', 'what-went-wrong']]);
  assert.equal(d.parts[4].text, 'The whole run.\n\nNotes opening.');
  assert.deepEqual(numbered(doc(9, { sections: [] })).parts.map((p) => p.s), ['0'], 'a notebook that did not render: its short version');
  const block = docBlock(d);
  assert.match(block, /^<doc n="6" url="\/ledger\/post-6\/" title="Title 6" topic="agents" by="Claude">/);
  assert.match(block, /\[6\.2\] First \(Claude's own account\)\nPost 6 measured 60 seconds\./);
  assert.match(block, /<notes title="Post 6: the making-of notes" url="\/ledger\/post-6\/notes\/" by="Claude">\n\n\[6\.N0\] \(opening\)/);
  assert.doesNotMatch(docBlock(numbered(DOCS[0])), /Claude's own account/);
});

const long = (n, sections, extra = {}) => numbered(doc(n, { sections: Array.from({ length: sections }, (_, i) => (
  { anchor: `s${i}`, heading: `S${i}`, text: `${'word '.repeat(700)}${i}` })), ...extra }));
test('a doc over DOC_CAP keeps its top; the live notebooks over LIVE_CAP keep their top half and newest end, marks kept', () => {
  const top = sized(long(3, 20), 60000, 5000);
  assert.equal(top.cut, 'top');
  assert.ok(top.tokens <= 5000);
  assert.deepEqual(top.parts.map((p) => p.s), top.parts.map((_, i) => String(i)));
  assert.match(docBlock(top), / cut="the rest is on its page">/);
  // A cut that keeps some of a notes page counts its <notes> lines too (over DOC_CAP, verify-dist fails the deploy).
  for (let len = 200; len < 5400; len += 13) {
    const notes = { title: 'N'.repeat(80), url: '/ledger/post-3/notes/', by: 'Aaron', summary: 'The run.',
      sections: Array.from({ length: 40 }, (_, i) => ({ anchor: `n${i}`, heading: `N${i}`, text: 'w'.repeat(len) })) };
    const cut = sized(numbered(doc(3, { sections: [], notes })), 60000, 2000);
    assert.ok(cut.parts.some((p) => p.kind === 'notes') && cut.tokens <= 2000, `${len}: ${cut.tokens}`);
  }
  const live = sized(long(7, 40, { live: true }), 8000);
  assert.ok(live.tokens <= 8000);
  assert.equal(live.cut, 'ends');
  const marks = live.parts.map((p) => Number(p.s));
  assert.equal(marks[0], 0);
  assert.equal(marks.at(-1), 40, 'the newest section kept');
  const block = docBlock(live);
  assert.match(block, / live="a notebook other agents update all day" cut="the middle is on its page">/);
  assert.match(block, new RegExp(`\\(Sections 7\\.${live.gap.from.split('.')[1]} to 7\\.${live.gap.to.split('.')[1]} are on its page\\.\\)`));
});

test('every file is a JSON string\'s body; whole mode is one pack, the live notebook out of it', () => {
  const { manifest: m, files } = built();
  for (const [name, body] of files) assert.equal(JSON.stringify(JSON.parse(`"${body}"`)).slice(1, -1), body, name);
  assert.equal(m.mode, 'whole');
  assert.deepEqual(m.packs.map((p) => p.docs), [[1, 2, 3, 4, 5, 6]]);
  assert.deepEqual(Object.keys(m.live), ['7']);
  assert.equal(m.docs[7].pack, null);
  assert.match(JSON.parse(`"${files.get(m.catalog.file)}"`), /\n\[7\] live-lab \| video \| a live notebook other agents update all day\n/);
});

test('split mode keeps pinned ranges: a doc that grows changes only its own pack, a new post lands in the last', () => {
  const docs = (sizes) => sizes.map((tokens, i) => ({ n: i + 1, tokens }));
  const opts = { pins: [1], whole: 0, pack: 100, catalogTokens: 0 };
  const first = packsOf(docs([40, 40, 40, 40, 40, 40]), opts);
  assert.deepEqual(first.packs, [[1, 2], [3, 4], [5, 6]]);
  const pinned = { ...opts, pins: first.starts };
  assert.deepEqual(first.starts, [1, 3, 5]);
  assert.deepEqual(packsOf(docs([40, 70, 40, 40, 40, 40]), pinned).packs, [[1], [2], [3, 4], [5, 6]], 'only its own range');
  assert.deepEqual(packsOf(docs([40, 40, 40, 40, 40, 40, 10]), pinned).packs, [[1, 2], [3, 4], [5, 6, 7]]);
  assert.equal(packsOf(docs([40, 40]), { ...opts, whole: 80 }).mode, 'whole');
});

test('v moves with a stable post and the listed set, never with a live notebook\'s text or title', () => {
  const v = (docs) => built(docs).manifest.v;
  const base = v(DOCS);
  assert.equal(v(DOCS.map((d) => (d.live ? { ...d, title: 'Pushed', sections: [{ anchor: 'r', heading: 'R', text: 'new' }] } : d))), base);
  assert.notEqual(v(DOCS.map((d) => (d.n === 2 ? { ...d, takeaway: 'Edited.' } : d))), base);
  assert.notEqual(v(DOCS.filter((d) => d.n !== 4)), base, 'a post unlisted');
});

function distOf({ manifest, files }, pages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-dist-'));
  fs.mkdirSync(path.join(dir, 'ask'));
  fs.writeFileSync(path.join(dir, 'ask/manifest.json'), JSON.stringify(manifest));
  for (const [f, body] of files) fs.writeFileSync(path.join(dir, 'ask', f), body);
  for (const [slug, html] of Object.entries(pages)) {
    fs.mkdirSync(path.join(dir, 'ledger', slug, 'notes'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'ledger', slug, 'index.html'), html);
    fs.writeFileSync(path.join(dir, 'ledger', slug, 'notes', 'index.html'), '<h2 id="what-went-wrong">');
  }
  return dir;
}
const pageOf = '<aside id="short"></aside><h2 id="first"></h2><h2 id="second"></h2>';

test('the dist checks: listed docs only, sections that resolve, a live notebook only ever warned about', () => {
  const blog = built();
  const pages = Object.fromEntries(DOCS.map((d) => [d.slug, pageOf]));
  const listed = new Set(DOCS.map((d) => d.slug));
  const ok = askCheck(distOf(blog, pages), listed);
  assert.deepEqual(ok.problems, []);
  assert.match(ok.lines[0], /^ask: whole, 1 pack, 7 posts \+ 1 notes, \d+k est\. tokens .* pins: ok$/);
  const unlisted = askCheck(distOf(blog, pages), new Set([...listed].filter((s) => s !== 'post-3')));
  assert.ok(unlisted.problems.some((p) => /doc 3 \(post-3\) is not a listed post/.test(p)));
  assert.ok(unlisted.problems.some((p) => /holds doc 3 \(post-3\), which is not listed/.test(p)));
  const broken = askCheck(distOf(blog, { ...pages, 'post-2': '<aside id="short"></aside>', 'live-lab': '' }), listed);
  assert.ok(broken.problems.some((p) => /2\.2 links to #first/.test(p)));
  assert.ok(!broken.problems.some((p) => /live-lab|7\./.test(p)));
  assert.ok(broken.warnings.some((w) => /7\.\d links to #/.test(w)));
});

test('the caps\' sums hold: whole mode under the budget, and split mode leaves room for 6 focus docs at their caps', () => {
  const s = sums();
  assert.ok(s.whole <= BUDGET, `${s.whole}`);
  assert.ok(s.room >= s.focus, `${s.room} < ${s.focus}`);
});
