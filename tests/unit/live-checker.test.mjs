// The checker never fails on a live notebook, at either level, while the same breakage in any other file (a post, a
// notes page, a Now snapshot, code) fails at the rule's level; and a fleet-style page with an mp4 under
// public/labs/teardown/ passes the media guard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';
import { hash } from '../../scripts/check/never-publish.mjs';
import { belongsInR2 } from '../../scripts/media/files.mjs';
import { STRICT } from '../../src/schemas/strict.js';

// What the fleet might push: a 200-character title, prose the voice rules refuse, a made-up never-publish term,
// links to a missing and an unlisted post, a renamed preview picture and a video that never went to R2. Made up
// here, not copied from teardown-lab.md, so the fleet's own edits to that file can never break this test.
const broken = ({ id, topic }) => `---
id: "${id}"
title: "${'T'.repeat(200)}"
summary: "What the fleet wrote."
date: 2026-10-31${topic ? `\ntopic: "${topic}"` : ''}
preview:
  takeaway: "Running."
  image: "/media/previews/renamed-by-the-fleet.webp"
---

The lab — it turns out; Zorblax rules here. See [it](/ledger/no-such-post/) and [this](/ledger/hidden/).
<video src="/media/teardown-lab/never-pushed.mp4"></video>
`;

function seed() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checker-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('src/content/posts/teardown-lab.md', broken({ id: 'AO-073' }));
  put('src/content/posts/control.md', broken({ id: 'AO-999', topic: 'agents' }));
  put('src/content/posts/hidden.md', '---\nid: "AO-998"\ntitle: "Hidden"\nsummary: "s"\ndate: 2026-11-01\nunlisted: true\n---\n');
  put('src/content/notes/control.md', '---\npost: "someone-else"\ntitle: "t"\nsummary: "s"\n---\n');
  put('src/content/now/2026-11-01.md', '---\nsummary: "s"\n---\n\nZorblax, and [this](/ledger/hidden/).\n');
  put('src/components/Seeded.astro', '<div style="color:red"></div>\n');
  put('src/lib/long.js', 'export const x = 1;\n'.repeat(401));
  put('src/elements/ao-seeded/element.js', '');
  put('src/data/media-manifest.json', '{}');
  put('src/data/never-publish.json', JSON.stringify([hash('Zorblax')]));
  put('public/_redirects', '');
  // A demo's recorded runs: a never-publish term at the start of a line of an answer, an unlisted post and a draft in
  // its map.
  put('src/content/posts/not-yet.md', '---\nid: "AO-996"\ntitle: "Not yet"\nsummary: "s"\ndate: 2026-11-01\ndraft: true\n---\n');
  put('src/elements/ao-demo/demos/seeded/runs/run.json', `${JSON.stringify({ posts: [[998, 'hidden', 'Hidden'], [996, 'not-yet', 'Not yet']],
    answer: 'First line.\nZorblax at a line start.' })}\n`);
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
  // The 200-character title breaks a v2 rule (src/schemas/strict.js), which fails the deploy build once STRICT is on.
  assert.deepEqual(rulesFailing(true, 'src/content/posts/control.md'),
    new Set(['never-publish', 'links', 'assets', ...(STRICT ? ['frontmatter'] : [])]));
  assert.deepEqual(rulesFailing(false, 'src/content/posts/control.md'), new Set(['never-publish', 'links', 'assets', 'prose', 'frontmatter']));
  assert.deepEqual(rulesFailing(true, 'src/content/notes/control.md'), new Set(['frontmatter']));
  // The Now page is public too: its snapshots are read for never-publish terms and links to unlisted posts.
  assert.deepEqual(rulesFailing(true, 'src/content/now/2026-11-01.md'), new Set(['never-publish', 'links']));
  for (const file of ['src/components/Seeded.astro', 'src/lib/long.js', 'src/elements/ao-seeded']) {
    assert.deepEqual(rulesFailing(true, file), new Set(), file);
    assert.equal(rulesFailing(false, file).size, 1, file);
  }
});

test("a demo's recorded runs fail the deploy on a never-publish term, even after a line break, an unlisted post and a draft", () => {
  const file = 'src/elements/ao-demo/demos/seeded/runs/run.json';
  assert.deepEqual(rulesFailing(true, file), new Set(['never-publish', 'links']));
  assert.deepEqual(runChecks({ root, deploy: true }).filter((i) => i.rule === 'links' && i.file === file).map((i) => i.message).sort(), [
    '"hidden" is unlisted: a demo\'s recorded runs never name it (record them again)',
    '"not-yet" is a draft: a demo\'s recorded runs never name it (record them again)']);
});

test("a fleet page's video under public/labs/teardown/ stays in git", () => {
  assert.equal(belongsInR2('/labs/teardown/x/clip.mp4'), false);
  assert.equal(belongsInR2('/media/teardown-lab/clip.mp4'), false);
  assert.equal(belongsInR2('/media/some-post/clip.mp4'), true);
});
