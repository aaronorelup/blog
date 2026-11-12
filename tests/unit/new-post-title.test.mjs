// npm run new-post with a backslash in the title, run on a copy of the script in a temporary folder so this repo's
// posts are never written: the title is read back as it was typed. It used to be written into the double-quoted YAML
// as it came, where \n is a line break, \q is no escape at all and a last \ swallows the closing quote.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const REPO = fileURLToPath(new URL('../../', import.meta.url));

test('a backslash in the title is kept, and the new post still parses', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'new-post-title-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  for (const rel of ['scripts/tools/new-post.mjs', 'src/data/taxonomy.js']) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.copyFileSync(path.join(REPO, rel), path.join(root, rel));
  }
  fs.writeFileSync(path.join(root, 'package.json'), '{ "type": "module" }\n');
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  const posts = path.join(root, 'src/content/posts');
  fs.mkdirSync(posts, { recursive: true });

  const titles = { 'the-new-folder': 'The \\new folder', 'a-quirk-in-paths': 'A \\quirk in paths', 'ends-with-a-slash': 'Ends with a slash\\', 'he-said-go': 'He said \\"go\\"' };
  for (const [slug, title] of Object.entries(titles)) {
    const made = spawnSync(process.execPath, [path.join(root, 'scripts/tools/new-post.mjs'), title], { encoding: 'utf8' });
    assert.equal(made.status, 0, made.stderr);
    const { data } = matter(fs.readFileSync(path.join(posts, `${slug}.md`), 'utf8'));
    assert.equal(data.title, title);
    assert.equal(data.draft, true);
  }
  // Each post was readable to the next run, so the ids ran on.
  assert.equal(matter(fs.readFileSync(path.join(posts, 'he-said-go.md'), 'utf8')).data.id, 'AO-004');
});
