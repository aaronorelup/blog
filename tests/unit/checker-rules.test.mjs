// Each checker rule on a seeded repo, with the file, line, message and level it reports and what it must leave
// alone: links (a draft, an unlisted post, a missing one, a redirect, a hidden page, a project card), prose (code,
// tags and entities are not prose; a HELD post only warns), frontmatter (broken YAML, notes, the v2 rules, v1
// fields), code (the Worker never reads a visitor's IP) and never-publish (every public file, once a term a file).
// live-checker.test.mjs holds the live notebook's side and duplicate-ids.test.mjs the id rule.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';
import { hash, SALT, termKey } from '../../scripts/check/never-publish.mjs';
import { HELD } from '../../src/data/exempt.js';
import { PHRASES } from '../../src/data/banned-phrases.js';
import { STRICT } from '../../src/schemas/strict.js';

const banned = PHRASES.find((p) => /^[a-z ]+$/.test(p));
const card = '\npreview:\n  verdict: "Works"\n  takeaway: "It ran."';
const post = (id, { title = 'A post', extra = `\ntopic: "agents"${card}`, body = 'Text.' } = {}) =>
  `---\nid: "${id}"\ntitle: "${title}"\nsummary: "s"\ndate: 2026-11-01${extra}\n---\n\n${body}\n`;

const linker = post('AO-603', { body: [
  '[ok](/ledger/listed/) and [its notes](/ledger/listed/notes/).',
  '[draft](/ledger/a-draft/)',
  '[unlisted](/ledger/hidden/)',
  '[gone](/ledger/no-such-post/)',
  '[moved](/ledger/old-name/)',
  '[deep](/ledger/listed/extra/)',
  '[egg](/ledger/listed/egg/)',
  '[full](https://aaronorelup.com/ledger/a-draft/#top)',
  'In code it is only an example: `/ledger/a-draft/`.',
].join('\n') });

const proseBody = [
  'An em dash — here.',
  'A range 1 – 2 here, and 1–2 is fine.',
  'A semicolon; here.',
  `${banned[0].toUpperCase()}${banned.slice(1)} fine.`,
  'Inline `a — b; c` is code.',
  '',
  '```js',
  `const a = 1; // — ${banned}`,
  '```',
  '',
  '<span title="a; b">Tagged</span> &amp; done.',
].join('\n');
const prosePost = (id) => post(id, { title: 'One; two', extra: '\ntopic: "agents"\npreview:\n  verdict: "Works"\n  takeaway: "One. Two. Three."', body: proseBody });
const held = Object.values(HELD)[0];

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-'));
const put = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
put('src/content/posts/listed.md', post('AO-600'));
put('src/content/posts/a-draft.md', post('AO-601', { extra: '\ntopic: "agents"\ndraft: true' }));
put('src/content/posts/hidden.md', post('AO-602', { extra: '\ntopic: "agents"\nunlisted: true' }));
put('src/content/posts/linker.md', linker);
put('src/content/posts/prose.md', prosePost('AO-604'));
if (held) put(`src/content/posts/${held}.md`, prosePost('AO-605'));
put('src/content/posts/bad-yaml.md', '---\nid: "AO-606"\ntitle: "unclosed\n---\n\nText.\n');
put('src/content/posts/no-topic.md', post('AO-607', { extra: '' }));
put('src/content/posts/v1.md', post('AO-608', { extra: `\ntopic: "agents"\nseries: "s"\nstatus: "done"\ntags: ["x"]${card}` }));
put('src/content/posts/teardown-lab.md', post('AO-073', { extra: `\ntags: ["x"]${card}` }));
put('src/content/posts/terms.md', post('AO-609', { body: 'zorblax and ZORBLAX are not it.\nZorblax is.\nZorblax again, at https://hq.secret.example.dev/api.' }));
put('src/content/notes/listed.md', '---\npost: "listed"\ntitle: "t"\nsummary: "s"\n---\n');
put('src/content/notes/a-draft.md', '---\npost: "a-draft"\ntitle: "t"\nsummary: "s"\n---\n');
put('src/content/projects/card.yaml', 'name: "P"\nposts: [listed, hidden, a-draft, nope]\n');
put('src/content/projects/bad.yaml', 'name: "unclosed\n');
put('src/content/projects/terms.yaml', 'name: "P"\nline: "Made at Zorblax."\n');
put('src/components/about/Bio.astro', '<p>\n  Before.\n  I worked at Zorblax.\n</p>\n');
put('src/data/site.js', "export const A = 1;\nexport const HOST = 'secret.example.dev';\n");
put('public/ledger/listed/egg/index.html', '<p>found</p>');
put('public/_redirects', '/ledger/old-name /ledger/listed/ 301\n');
put('src/data/media-manifest.json', '{}');
put('src/data/never-publish.json', JSON.stringify([hash('Zorblax'), hash(termKey('https://secret.example.dev/'))]));
// Code.
put('worker/peek.js', "export const who = (request) => request.headers.get('CF-Connecting-IP');\n");
put('worker/lib/verify.js', "export const form = (f, ip) => f.set('remoteip', ip);\n");
put('worker/clean.js', "export const country = (request) => request.cf?.country;\n");
put('public/someone/page.js', "fetch('/x', { headers: { 'CF-Connecting-IP': '' } });\n");
put('src/scripts/styled.js', "import './styled.css';\n");
put('src/scripts/plain.js', "import { a } from './a.js';\nexport const b = a;\n");
put('src/pages/direct.astro', "---\nimport { getCollection } from 'astro:content';\n---\n");
put('src/lib/content.js', "export { getCollection } from 'astro:content';\n");
put('src/schemas/post.ts', "import { z } from 'astro:content';\n");
put('src/lib/at-the-ceiling.js', 'export const x = 1;\n'.repeat(400));
put('src/components/Classed.astro', '<div class="a" data-style="b"></div>\n');
put('src/pages/courses/theirs.astro', '<div style="color:red"></div>\n');
test.after(() => fs.rmSync(root, { recursive: true }));

const runs = { check: runChecks({ root }), deploy: runChecks({ root, deploy: true }) };
const of = (rule, file, level = 'check') => runs[level].filter((i) => i.rule === rule && i.file === file);
const lineOf = (text, needle) => text.slice(0, text.indexOf(needle)).split('\n').length;
const shape = (issues) => issues.map((i) => [i.line, i.severity, i.message]).sort((a, b) => a[0] - b[0] || a[2].localeCompare(b[2]));

test('links: a draft, an unlisted post, a missing one and a hidden page fail the deploy; a redirect warns', () => {
  const at = (needle) => lineOf(linker, needle);
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(shape(of('links', 'src/content/posts/linker.md', level)), [
      [at('[draft]'), 'error', '/ledger/a-draft/ is a draft: never link it'],
      [at('[unlisted]'), 'error', '/ledger/hidden/ is unlisted: never link it'],
      [at('[gone]'), 'error', '/ledger/no-such-post/: there is no post no-such-post'],
      [at('[moved]'), 'warn', '/ledger/old-name/ redirects to /ledger/listed/: link that'],
      [at('[deep]'), 'error', '/ledger/listed/extra/: no such page (a post has only /ledger/<slug>/ and, with notes, /notes/)'],
      [at('[egg]'), 'error', '/ledger/listed/egg/ is a hidden page under public/ledger/: never link it'],
      [at('[full]'), 'error', '/ledger/a-draft/ is a draft: never link it'],
    ], level);
  }
});

test('links: a project card may name only listed posts', () => {
  assert.deepEqual(shape(of('links', 'src/content/projects/card.yaml', 'deploy')), [
    [2, 'error', 'posts: "a-draft" is not listed: a card links only listed posts'],
    [2, 'error', 'posts: "hidden" is not listed: a card links only listed posts'],
    [2, 'error', 'posts: "nope" is no post: a card links only listed posts'],
  ]);
});

test('prose: each voice rule once, at its line, and never in code, a tag, an attribute or an entity', () => {
  const raw = prosePost('AO-604');
  const expected = (severity) => [
    [lineOf(raw, 'title:'), severity, 'title: a semicolon'],
    [lineOf(raw, 'takeaway:'), severity, 'takeaway: one or two short sentences (PREVIEWS.md)'],
    [lineOf(raw, 'An em dash'), severity, 'an em dash'],
    [lineOf(raw, 'A range'), severity, 'an en dash used as a dash'],
    [lineOf(raw, 'A semicolon'), severity, 'a semicolon'],
    [lineOf(raw, 'A semicolon') + 1, severity, `the banned phrase "${banned}"`],
  ];
  assert.deepEqual(shape(of('prose', 'src/content/posts/prose.md')), expected('error'));
  // The voice rules never stop a deploy: there they are printed.
  assert.deepEqual(shape(of('prose', 'src/content/posts/prose.md', 'deploy')), expected('warn'));
  assert.deepEqual(of('prose', 'src/content/posts/listed.md'), []);
});

test('prose: a HELD post is only warned about', { skip: !held && 'no post is held' }, () => {
  const issues = of('prose', `src/content/posts/${held}.md`);
  assert.equal(issues.length, 6);
  assert.deepEqual(issues.filter((i) => i.severity !== 'warn'), []);
});

// gray-matter keeps a file it failed to parse and hands it back blank the next time it is asked. The second run
// here (deploy) once saw bad-yaml.md as a post with no frontmatter at all, and its YAML error went unreported.
test('frontmatter: broken YAML fails the deploy, in a post and in a project file, on every run in one process', () => {
  for (const [file, message] of [['src/content/posts/bad-yaml.md', /^the frontmatter isn't valid YAML: /], ['src/content/projects/bad.yaml', /^this isn't valid YAML: /]]) {
    for (const again of [runs.check, runs.deploy, runChecks({ root }), runChecks({ root, deploy: true })]) {
      const issues = again.filter((i) => i.rule === 'frontmatter' && i.file === file);
      assert.equal(issues.length, 1, file);
      assert.equal(issues[0].severity, 'error');
      assert.match(issues[0].message, message);
    }
  }
});

test('frontmatter: notes need a post that is built', () => {
  assert.deepEqual(of('frontmatter', 'src/content/notes/listed.md', 'deploy'), []);
  assert.deepEqual(shape(of('frontmatter', 'src/content/notes/a-draft.md', 'deploy')),
    [[1, 'error', 'no built post src/content/posts/a-draft.md for these notes']]);
});

test('frontmatter: the v2 rules ask a listed post for a topic and a verdict, and nothing of a draft or unlisted one', () => {
  const messages = (file, level) => of('frontmatter', `src/content/posts/${file}.md`, level).map((i) => `${i.severity} ${i.message}`).sort();
  const strict = STRICT ? 'error' : 'warn';
  assert.deepEqual(messages('no-topic', 'check'), ['error preview: a listed post needs a verdict (PREVIEWS.md)', 'error topic: topic is required (WRITING.md)']);
  assert.deepEqual(messages('no-topic', 'deploy'), [`${strict} preview: a listed post needs a verdict (PREVIEWS.md)`, `${strict} topic: topic is required (WRITING.md)`]);
  for (const file of ['listed', 'a-draft', 'hidden']) assert.deepEqual(messages(file, 'check'), [], file);
});

test('frontmatter: a v1 field is reported on a post, never on a live notebook', () => {
  const raw = fs.readFileSync(path.join(root, 'src/content/posts/v1.md'), 'utf8');
  assert.deepEqual(shape(of('frontmatter', 'src/content/posts/v1.md')), ['series', 'status', 'tags'].map((key) =>
    [lineOf(raw, `${key}:`), 'error', `${key}: a v1 field; leave it out (WRITING.md lists the frontmatter)`]));
  assert.deepEqual(of('frontmatter', 'src/content/posts/teardown-lab.md').filter((i) => /v1 field/.test(i.message)), []);
});

test("code: a Worker file that reads the visitor's IP is reported, whichever way it spells it", () => {
  const ip = [[null, 'error', "reads the visitor's IP address: never key anything on it"]];
  assert.deepEqual(shape(of('code', 'worker/peek.js')), ip);
  assert.deepEqual(shape(of('code', 'worker/lib/verify.js')), ip);
  assert.deepEqual(of('code', 'worker/clean.js'), []);
  // public/ holds other people's pages: the code rules never read it.
  assert.deepEqual(runs.check.filter((i) => i.file.startsWith('public/')), []);
});

test('code: CSS in browser JS, astro:content outside its three homes and style= are reported; the ceiling is 400 lines', () => {
  const messages = (file) => of('code', file).map((i) => i.message);
  assert.deepEqual(messages('src/scripts/styled.js'), ['browser JS imports CSS: link it from the page, or inline it into the article (ARCHITECTURE.md)']);
  assert.deepEqual(messages('src/pages/direct.astro'), ['imports astro:content: go through src/lib/content.js']);
  for (const file of ['src/scripts/plain.js', 'src/lib/content.js', 'src/schemas/post.ts', 'src/lib/at-the-ceiling.js',
    'src/components/Classed.astro', 'src/pages/courses/theirs.astro']) assert.deepEqual(messages(file), [], file);
  // Code rules fail npm run check only: the deploy build prints them.
  assert.deepEqual(runs.deploy.filter((i) => i.rule === 'code' && i.severity === 'error'), []);
});

test('never-publish: a term is reported once a file, at its first line, in every kind of public file', () => {
  const word = '"Zorblax" is on the never-publish list (WRITING.md, "Never publish")';
  const host = '"secret.example.dev" is on the never-publish list (WRITING.md, "Never publish")';
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(shape(of('never-publish', 'src/content/posts/terms.md', level)), [[lineOf(post('AO-609'), 'Text.') + 1, 'error', word], [lineOf(post('AO-609'), 'Text.') + 2, 'error', host]], level);
    assert.deepEqual(shape(of('never-publish', 'src/content/projects/terms.yaml', level)), [[2, 'error', word]]);
    assert.deepEqual(shape(of('never-publish', 'src/components/about/Bio.astro', level)), [[3, 'error', word]]);
    assert.deepEqual(shape(of('never-publish', 'src/data/site.js', level)), [[2, 'error', host]]);
  }
  assert.deepEqual(of('never-publish', 'src/content/posts/listed.md'), []);
});

test('never-publish: the hash is salted sha256, and the repo holds hashes only', () => {
  assert.equal(hash('Zorblax'), crypto.createHash('sha256').update(SALT + 'Zorblax').digest('hex'));
  assert.notEqual(hash('Zorblax'), crypto.createHash('sha256').update('Zorblax').digest('hex'));
  const stored = JSON.parse(fs.readFileSync(new URL('../../src/data/never-publish.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(stored));
  for (const entry of stored) assert.match(entry, /^[0-9a-f]{64}$/, 'an entry that is not a hash');
});
