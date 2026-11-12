// npm run new-post (scripts/tools/new-post.mjs), run as it is on a copy in a temporary folder, so this repo's posts
// are never written: the next id is one past the highest AO-### of any post (drafts count), the slug comes from the
// title, the new post is a draft with no hover card, and an existing post is never overwritten.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const today = () => new Date().toISOString().slice(0, 10);

// A folder shaped like the repo: the script, the one file it imports, this repo's packages and made-up posts.
function sandbox(t, ids = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'new-post-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  for (const rel of ['scripts/tools/new-post.mjs', 'src/data/taxonomy.js']) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.copyFileSync(path.join(REPO, rel), path.join(root, rel));
  }
  fs.writeFileSync(path.join(root, 'package.json'), '{ "type": "module" }\n');
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  const posts = path.join(root, 'src/content/posts');
  fs.mkdirSync(posts, { recursive: true });
  for (const [name, frontmatter] of Object.entries(ids)) fs.writeFileSync(path.join(posts, name), `---\n${frontmatter}\n---\n\nText.\n`);
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/tools/new-post.mjs'), ...args], { encoding: 'utf8' });
  return { posts, run, files: () => fs.readdirSync(posts).sort(), read: (slug) => matter(fs.readFileSync(path.join(posts, `${slug}.md`), 'utf8')) };
}

test('a new post takes the next id after every post, drafts included, and starts as a draft with no card', (t) => {
  const { run, read, files } = sandbox(t, {
    'older.md': 'id: "AO-007"\ntitle: "Older"', 'a-draft.md': 'id: "AO-041"\ntitle: "A draft"\ndraft: true', 'short.md': 'id: "AO-9"\ntitle: "Short"',
    'odd.md': 'id: "DRAFT-900"\ntitle: "Odd"', 'none.md': 'title: "No id"', 'notes.txt': 'id: "AO-500"',
  });
  const before = today();
  const made = run("Hello, World: It's 2026!");
  assert.equal(made.status, 0, made.stderr);
  assert.equal(made.stdout, 'Created src/content/posts/hello-world-it-s-2026.md as AO-042\n');
  const { data, content } = read('hello-world-it-s-2026');
  assert.equal(data.id, 'AO-042');
  assert.equal(data.title, "Hello, World: It's 2026!");
  assert.equal(data.draft, true);
  assert.equal(data.topic, '');
  assert.deepEqual(data.project, []);
  assert.equal(data.preview, undefined);
  assert.ok([before, today()].includes(data.date.toISOString().slice(0, 10)));
  assert.equal(content.trim(), 'Start writing here.');
  assert.equal(files().length, 7);

  // The words of the title are joined, quotes survive, and the id moves on.
  const next = run('He', 'said', '"go"');
  assert.equal(next.stdout, 'Created src/content/posts/he-said-go.md as AO-043\n');
  assert.equal(read('he-said-go').data.title, 'He said "go"');
  assert.equal(read('he-said-go').data.draft, true);
});

test('an existing post is never overwritten, and a missing title makes nothing', (t) => {
  const { posts, run, files } = sandbox(t, { 'taken.md': 'id: "AO-001"\ntitle: "Taken"' });
  const was = fs.readFileSync(path.join(posts, 'taken.md'), 'utf8');
  for (const title of ['Taken', '  TAKEN!  ', 'taken']) {
    const again = run(title);
    assert.equal(again.status, 1, title);
    assert.match(again.stderr, /^Already exists: .*taken\.md\n$/);
  }
  for (const args of [[], ['   '], ['', '']]) {
    const none = run(...args);
    assert.equal(none.status, 1);
    assert.match(none.stderr, /^Usage: npm run new-post "Title of the post"\n$/);
  }
  assert.equal(fs.readFileSync(path.join(posts, 'taken.md'), 'utf8'), was);
  assert.deepEqual(files(), ['taken.md']);
});

test('a title with no letter or digit to name the file after makes nothing (it used to make ".md")', (t) => {
  const { run, files } = sandbox(t, { 'taken.md': 'id: "AO-001"\ntitle: "Taken"' });
  for (const title of ['!!!', '—', '東京', '- -']) {
    const none = run(title);
    assert.equal(none.status, 1, title);
    assert.equal(none.stdout, '');
    assert.match(none.stderr, /^The file is named after the title, which needs a letter \(a to z\) or a digit in it\n$/);
  }
  assert.deepEqual(files(), ['taken.md']);
  assert.equal(run('2026').stdout, 'Created src/content/posts/2026.md as AO-002\n');
});

test('the first post is AO-001, and the id after AO-999 is AO-1000', (t) => {
  const empty = sandbox(t);
  assert.equal(empty.run('First').stdout, 'Created src/content/posts/first.md as AO-001\n');
  const full = sandbox(t, { 'last.md': 'id: "AO-999"\ntitle: "Last"' });
  assert.equal(full.run('Next').stdout, 'Created src/content/posts/next.md as AO-1000\n');
  assert.equal(full.read('next').data.id, 'AO-1000');
});
