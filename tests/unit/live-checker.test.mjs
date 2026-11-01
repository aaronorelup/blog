// The checker never fails on a live notebook, at either level, while the same breakage in any other file fails at
// the rule's level; and a fleet-style page with an mp4 under public/labs/teardown/ passes the media guard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks, ROOT } from '../../scripts/check/run.mjs';
import { hash } from '../../scripts/check/never-publish.mjs';
import { belongsInR2 } from '../../scripts/media/files.mjs';

// What the fleet might push: a 200-character title, prose the voice rules refuse, a made-up never-publish term,
// links to a missing and an unlisted post, a renamed preview picture and a video that never went to R2.
const BREAKAGE = `
The lab — it turns out; Zorblax rules here. See [it](/ledger/no-such-post/) and [this](/ledger/hidden/).
<video src="/media/teardown-lab/never-pushed.mp4"></video>
`;
const breakFrontmatter = (raw, { id, topic }) => raw
  .replace(/^id: .*$/m, `id: "${id}"`)
  .replace(/^title: .*$/m, `title: "${'T'.repeat(200)}"`)
  .replace(/^ {2}image: .*$/m, '  image: "/media/previews/renamed-by-the-fleet.webp"')
  .replace(/^date: /m, topic ? `topic: "${topic}"\ndate: ` : 'date: ');

function seed() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checker-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  const live = fs.readFileSync(path.join(ROOT, 'src/content/posts/teardown-lab.md'), 'utf8');
  put('src/content/posts/teardown-lab.md', breakFrontmatter(live, { id: 'AO-073' }) + BREAKAGE);
  put('src/content/posts/control.md', breakFrontmatter(live, { id: 'AO-999', topic: 'agents' }) + BREAKAGE);
  put('src/content/posts/hidden.md', '---\nid: "AO-998"\ntitle: "Hidden"\nsummary: "s"\ndate: 2026-11-01\nunlisted: true\n---\n');
  put('src/content/notes/control.md', '---\npost: "someone-else"\ntitle: "t"\nsummary: "s"\n---\n');
  put('src/components/Seeded.astro', '<div style="color:red"></div>\n');
  put('src/lib/long.js', 'export const x = 1;\n'.repeat(401));
  put('src/elements/ao-seeded/element.js', '');
  put('src/data/media-manifest.json', '{}');
  put('src/data/never-publish.json', JSON.stringify([hash('Zorblax')]));
  put('public/_redirects', '');
  return root;
}

const root = seed();
test.after(() => fs.rmSync(root, { recursive: true }));
const rulesFailing = (deploy, file) => new Set(runChecks({ root, deploy })
  .filter((i) => i.file === file && i.severity === 'error').map((i) => i.rule));

test('a broken live notebook is only ever warned about', () => {
  for (const deploy of [false, true]) {
    const issues = runChecks({ root, deploy }).filter((i) => i.file === 'src/content/posts/teardown-lab.md');
    assert.deepEqual(issues.filter((i) => i.severity === 'error'), []);
    assert.deepEqual(new Set(issues.map((i) => i.rule)), new Set(['frontmatter', 'prose', 'never-publish', 'links', 'assets']));
  }
});

test('the same breakage elsewhere fails each rule at its level', () => {
  assert.deepEqual(rulesFailing(true, 'src/content/posts/control.md'), new Set(['never-publish', 'links', 'assets']));
  assert.deepEqual(rulesFailing(false, 'src/content/posts/control.md'), new Set(['never-publish', 'links', 'assets', 'prose']));
  assert.deepEqual(rulesFailing(true, 'src/content/notes/control.md'), new Set(['frontmatter']));
  for (const file of ['src/components/Seeded.astro', 'src/lib/long.js', 'src/elements/ao-seeded']) {
    assert.deepEqual(rulesFailing(true, file), new Set(), file);
    assert.equal(rulesFailing(false, file).size, 1, file);
  }
});

test("a fleet page's video under public/labs/teardown/ stays in git", () => {
  assert.equal(belongsInR2('/labs/teardown/x/clip.mp4'), false);
  assert.equal(belongsInR2('/media/teardown-lab/clip.mp4'), false);
  assert.equal(belongsInR2('/media/some-post/clip.mp4'), true);
});
