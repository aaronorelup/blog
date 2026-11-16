// npm run check (scripts/check/index.mjs), run as it is on a copy of the checker in a temporary folder with made-up
// posts: what it prints, what it exits with, and what --deploy, --strict and path arguments change. A check-level
// rule fails npm run check and only warns in the deploy build; --strict fails on a warning too, except one a live
// notebook or a HELD post may keep; paths narrow both the report and the exit code.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { HELD } from '../../src/data/exempt.js';
import { TEXT } from '../../src/data/limits.js';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
// index.mjs and everything it imports, but picks.js: Start here names real posts, and these are made up.
const CHECKER = [...fs.readdirSync(path.join(REPO, 'scripts/check')).map((f) => `scripts/check/${f}`), 'scripts/media/files.mjs',
  'src/data/banned-phrases.js', 'src/data/exempt.js', 'src/data/limits.js', 'src/lib/dates.js', 'src/lib/posts.js', 'src/schemas/strict.js',
  'src/data/tea.js', 'src/data/tea-chapters.js', 'src/data/taxonomy.js', 'src/lib/tea-picks.js',
  // the rebuilt tea room's chapters (tea.js gathers their copy; the tea-art rule reads their scenes and art)
  ...fs.readdirSync(path.join(REPO, 'src/data/tea'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => `src/data/tea/${f}`),
  'src/lib/tea-scene.js', 'src/lib/tea-scene-check.js',
  ...fs.readdirSync(path.join(REPO, 'src/scripts/tea/room/engine')).map((f) => `src/scripts/tea/room/engine/${f}`)];

const post = (id, { title = 'A post', extra = '', body = 'Text.' } = {}) =>
  `---\nid: "${id}"\ntitle: "${title}"\nsummary: "s"\ndate: 2026-11-01\ntopic: "agents"\npreview:\n  verdict: "Works"\n  takeaway: "It ran."${extra}\n---\n\n${body}\n`;
const lineOf = (text, needle) => text.slice(0, text.indexOf(needle)).split('\n').length;
const longTitle = 'T'.repeat(TEXT.titleTarget + 5);
const POSTS = {
  clean: post('AO-600'),
  'a-draft': post('AO-601', { extra: '\ndraft: true' }),
  'long-title': post('AO-602', { title: longTitle }),
  'prose-only': post('AO-603', { body: 'An em dash — here.' }),
  'links-bad': post('AO-604', { body: 'See [it](/ledger/a-draft/).' }),
  'teardown-lab': post('AO-073', { title: longTitle, body: 'An em dash — here, and [a draft](/ledger/a-draft/).' }),
};
const held = Object.values(HELD)[0];
if (held) POSTS[held] = post('AO-605', { body: 'An em dash — here.' });

function sandbox(t, slugs) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'check-cli-')));
  t.after(() => fs.rmSync(root, { recursive: true }));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  for (const rel of CHECKER) put(rel, fs.readFileSync(path.join(REPO, rel)));
  put('src/data/picks.js', 'export const START_HERE = [];\n');
  put('package.json', '{ "type": "module" }\n');
  put('src/data/media-manifest.json', '{}');
  put('src/data/never-publish.json', '[]');
  put('public/_redirects', '');
  for (const slug of slugs) put(`src/content/posts/${slug}.md`, POSTS[slug]);
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  // One run of the CLI: { status, stderr, issues: the lines before the count, summary: the count without its time }.
  const check = (args = [], cwd = '.') => new Promise((resolve) => {
    execFile(process.execPath, [path.join(root, 'scripts/check/index.mjs'), ...args], { cwd: path.join(root, cwd) }, (error, stdout, stderr) => {
      const lines = stdout.trimEnd().split('\n');
      resolve({ status: error ? error.code : 0, stderr, issues: lines.slice(0, -1), summary: lines.at(-1).replace(/ \(\d+ ms\)$/, '') });
    });
  });
  // Several runs at once, answered in the order asked.
  return { root, check, all: (...runs) => Promise.all(runs.map((args) => check(args))) };
}
const file = (slug) => `src/content/posts/${slug}.md`;
const TARGET = `title is ${longTitle.length} characters, past the ${TEXT.titleTarget} target (WRITING.md)`;
const longTitleLine = (severity) => `${severity.padEnd(5)} ${file('long-title')}:3  ${TARGET}  [prose]`;
const emDashLine = (severity) => `${severity.padEnd(5)} ${file('prose-only')}:${lineOf(POSTS['prose-only'], 'An em dash')}  an em dash  [prose]`;
const draftLinkLine = `error ${file('links-bad')}:${lineOf(POSTS['links-bad'], 'See [it]')}  /ledger/a-draft/ is a draft: never link it  [links]`;

test('a clean repo: nothing printed but the count, exit 0, at every level', async (t) => {
  const { all } = sandbox(t, ['clean', 'a-draft']);
  const levels = [[], ['--deploy'], ['--strict'], ['--deploy', '--strict']];
  const runs = await all(...levels);
  runs.forEach((run, i) => {
    const flags = levels[i].map((flag) => ` ${flag}`).join('');
    assert.deepEqual(run, { status: 0, stderr: '', issues: [], summary: `check${flags}: 0 errors, 0 warnings` });
  });
});

test('a check-level rule fails npm run check, and in the deploy build is only counted', async (t) => {
  const { all } = sandbox(t, ['clean', 'a-draft', 'long-title', 'prose-only']);
  const [plain, deploy] = await all([], ['--deploy']);
  assert.equal(plain.status, 1);
  assert.deepEqual(plain.issues, [longTitleLine('warn'), emDashLine('error')]);
  assert.equal(plain.summary, 'check: 1 errors, 1 warnings');
  assert.equal(deploy.status, 0);
  assert.deepEqual(deploy.issues, ['warn  prose: 2 in 2 files (npm run check lists them)']);
  assert.equal(deploy.summary, 'check --deploy: 0 errors, 2 warnings');
});

test('a deploy-level rule fails the deploy build too, and its line is printed there', async (t) => {
  const { all } = sandbox(t, ['clean', 'a-draft', 'long-title', 'links-bad']);
  const [deploy, plain] = await all(['--deploy'], []);
  assert.equal(deploy.status, 1);
  assert.deepEqual(deploy.issues, [draftLinkLine, 'warn  prose: 1 in 1 files (npm run check lists them)']);
  assert.equal(deploy.summary, 'check --deploy: 1 errors, 1 warnings');
  assert.equal(plain.status, 1);
  assert.deepEqual(plain.issues, [draftLinkLine, longTitleLine('warn')]);
});

test('--strict fails on a warning too', async (t) => {
  const { all } = sandbox(t, ['clean', 'a-draft', 'long-title']);
  const [plain, strict, both] = await all([], ['--strict'], ['--deploy', '--strict']);
  assert.equal(plain.status, 0);
  assert.equal(plain.summary, 'check: 0 errors, 1 warnings');
  assert.equal(strict.status, 1);
  assert.deepEqual(strict.issues, [longTitleLine('error')]);
  assert.equal(strict.summary, 'check --strict: 1 errors, 0 warnings');
  assert.equal(both.status, 1);
});

test('--strict never fails on a live notebook or a HELD post, at either level', async (t) => {
  const { all } = sandbox(t, ['clean', 'a-draft', 'teardown-lab', ...(held ? [held] : [])]);
  const levels = [[], ['--strict'], ['--deploy'], ['--deploy', '--strict']];
  const runs = await all(...levels);
  runs.forEach((run, i) => {
    assert.equal(run.status, 0, levels[i].join(' '));
    assert.match(run.summary, /: 0 errors, [1-9]\d* warnings$/, levels[i].join(' '));
    assert.deepEqual(run.issues.filter((line) => !line.startsWith('warn  ')), [], levels[i].join(' '));
  });
  const listed = runs[1].issues;
  assert.ok(listed.some((line) => line.startsWith(`warn  ${file('teardown-lab')}:`) && line.endsWith('is a draft: never link it  [links]')));
  if (held) assert.ok(listed.includes(`warn  ${file(held)}:${lineOf(POSTS[held], 'An em dash')}  an em dash  [prose]`));
});

test("--strict never fails on the tea room's warnings about the live notebook, and does fail on its other warnings", async (t) => {
  const { root, all } = sandbox(t, ['clean']);
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  for (const m of ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']) put(`public/labs/teardown/${m}/index.html`, '');
  const picks = (machines) => put('src/data/tea-picks.json', JSON.stringify({ v: 1, order: [], hidden: {},
    shelves: { 'tv/machines': { auto: false, count: 1, picks: machines.map((m) => `m-${m}`) } } }));
  const gone = 'warn  src/data/tea-picks.json  shelf tv/machines: "m-gone" is not in the teardown lab today (public/labs/teardown/), so it is left out  [tea-picks]';
  picks(['gone', 'm1']);
  const levels = [['--strict'], ['--deploy', '--strict']];
  const live = await all(...levels);
  live.forEach((run, i) => assert.deepEqual([run.status, run.summary], [0, `check ${levels[i].join(' ')}: 0 errors, 1 warnings`]));
  assert.deepEqual(live[0].issues, [gone]);
  // six picks on a shelf that shows five: the sixth is left out, a warning --strict fails
  picks(['m1', 'm2', 'm3', 'm4', 'm5', 'm6']);
  const [plain, strict] = await all([], ['--strict']);
  assert.deepEqual([plain.status, plain.summary], [0, 'check: 0 errors, 1 warnings']);
  assert.deepEqual([strict.status, strict.summary], [1, 'check --strict: 1 errors, 0 warnings']);
  assert.deepEqual(strict.issues, ['error src/data/tea-picks.json  shelf tv/machines shows at most 5 picks, so "m-m6" is left out  [tea-picks]']);
});

test('paths narrow the report and the exit code, however they are spelled', async (t) => {
  const { root, check, all } = sandbox(t, ['clean', 'a-draft', 'long-title', 'prose-only', 'links-bad']);
  const everything = [draftLinkLine, longTitleLine('warn'), emDashLine('error')];
  const [whole, failing, folder, slashed, src, two, prefix, deployCheckLevel, deployDeployLevel, strict] = await all(
    [], [file('prose-only')], ['src/content/posts'], ['src/content/posts/'], ['src'], [file('long-title'), file('links-bad')],
    ['src/content/posts/long'], ['--deploy', file('prose-only')], ['--deploy', file('links-bad')], [file('long-title'), '--strict']);
  assert.deepEqual(whole.issues, everything);
  assert.equal(whole.summary, 'check: 2 errors, 1 warnings');

  // One file, by a relative path, a dotted one, an absolute one, and from another folder.
  const spelled = await Promise.all([check([file('long-title')]), check([`./${file('long-title')}`]), check([path.join(root, file('long-title'))]),
    check(['long-title.md'], 'src/content/posts')]);
  for (const one of spelled) assert.deepEqual(one, { status: 0, stderr: '', issues: [longTitleLine('warn')], summary: 'check: 0 errors, 1 warnings' });
  assert.equal(failing.status, 1);
  assert.deepEqual(failing.issues, [emDashLine('error')]);

  // A folder takes everything under it, two paths take both, and a path is never a prefix of a name.
  for (const run of [folder, slashed, src]) assert.deepEqual(run.issues, everything);
  assert.deepEqual(two.issues, [draftLinkLine, longTitleLine('warn')]);
  assert.deepEqual(prefix, { status: 0, stderr: '', issues: [], summary: 'check: 0 errors, 0 warnings' });

  // With the flags: a path that holds only a check-level error passes the deploy level, and --strict fails its warning.
  assert.equal(deployCheckLevel.status, 0);
  assert.equal(deployDeployLevel.status, 1);
  assert.equal(strict.status, 1);
});
