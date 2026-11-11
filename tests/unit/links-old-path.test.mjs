// A link through the old address /posts/<slug>/ is a link to /ledger/<slug>/: public/_redirects sends every one
// there. So the link rule reads it like a /ledger/ link, and an unlisted post or a draft can't be linked that way.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';

const post = (id, extra = '', body = 'Text.') =>
  `---\nid: "${id}"\ntitle: "A post"\nsummary: "s"\ndate: 2026-11-11\ntopic: "agents"${extra}\n---\n\n${body}\n`;

const body = [
  '[hidden](/posts/hidden/)',
  '[draft](https://aaronorelup.com/posts/a-draft)',
  '<a href="/posts/hidden/#part">hidden</a>',
  '[gone](/posts/no-such-post/)',
  '[fine](/posts/listed/)',
  'The files are in src/content/posts/hidden.md, and `/posts/hidden/` in code is an example.',
].join('\n');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'old-path-'));
const put = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
put('src/content/posts/listed.md', post('AO-700'));
put('src/content/posts/hidden.md', post('AO-701', '\nunlisted: true'));
put('src/content/posts/a-draft.md', post('AO-702', '\ndraft: true'));
put('src/content/posts/linker.md', post('AO-703', '', body));
put('src/data/media-manifest.json', '{}');
put('src/data/never-publish.json', '[]');
put('public/_redirects', '/posts/:slug /ledger/:slug/ 301\n/posts/:slug/ /ledger/:slug/ 301\n');
test.after(() => fs.rmSync(root, { recursive: true }));

test('a /posts/<slug>/ link to an unlisted post, a draft or no post fails the deploy like its /ledger/ link', () => {
  const issues = runChecks({ root, deploy: true }).filter((i) => i.rule === 'links' && i.file === 'src/content/posts/linker.md');
  assert.deepEqual(issues.map((i) => [i.line, i.severity, i.message]), [
    [9, 'error', '/posts/hidden/ is unlisted: never link it'],
    [10, 'error', '/posts/a-draft is a draft: never link it'],
    [11, 'error', '/posts/hidden/ is unlisted: never link it'],
    [12, 'error', '/posts/no-such-post/: there is no post no-such-post'],
  ]);
});
