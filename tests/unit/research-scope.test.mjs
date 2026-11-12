// Research documents are published (/research/<slug>/ and its raw .md copy), so the never-publish rule and the link
// rule read them like every other content kind (ARCHITECTURE.md, "A content kind"). They used to be in neither scope.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';
import { hash } from '../../scripts/check/never-publish.mjs';

const post = (id, extra = '') => `---\nid: "${id}"\ntitle: "A post"\nsummary: "s"\ndate: 2026-11-11\ntopic: "agents"${extra}\n---\n\nText.\n`;
const doc = '---\nid: "RE-900"\ntitle: "A document"\nsummary: "s"\ndate: 2026-11-11\n---\n\n'
  + 'Fine: [listed](/ledger/listed/).\nCompiled at Zorblax.\nSee [the hidden one](/ledger/hidden/).\n';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-'));
const put = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
put('src/content/posts/listed.md', post('AO-800'));
put('src/content/posts/hidden.md', post('AO-801', '\nunlisted: true'));
put('src/content/research/a-document.md', doc);
put('src/data/media-manifest.json', '{}');
put('src/data/never-publish.json', JSON.stringify([hash('Zorblax')]));
put('public/_redirects', '');
test.after(() => fs.rmSync(root, { recursive: true }));

test('a never-publish term and a link to an unlisted post in a research document fail the deploy', () => {
  const issues = runChecks({ root, deploy: true }).filter((i) => i.file === 'src/content/research/a-document.md');
  assert.deepEqual(issues.map((i) => [i.rule, i.line, i.severity, i.message]), [
    ['never-publish', 9, 'error', '"Zorblax" is on the never-publish list (WRITING.md, "Never publish")'],
    ['links', 10, 'error', '/ledger/hidden/ is unlisted: never link it'],
  ]);
});
