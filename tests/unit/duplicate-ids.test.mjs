// Two posts with one id fail npm run check and the deploy build, a draft included (new-post counts drafts), and the
// message names the other file. A post that shares the live notebook's id fails too, while the notebook is only
// warned about. A unique id is never reported.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';

const post = (id, extra = '') => `---\nid: "${id}"\ntitle: "A post"\nsummary: "s"\ndate: 2026-11-11\ntopic: "agents"${extra}\n---\n\nText.\n`;

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ids-'));
const put = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
put('src/content/posts/first.md', post('AO-500'));
put('src/content/posts/second.md', post('AO-500', '\ndraft: true'));
put('src/content/posts/unique.md', post('AO-501'));
put('src/content/posts/teardown-lab.md', post('AO-073'));
put('src/content/posts/clash-with-lab.md', post('AO-073'));
put('src/data/media-manifest.json', '{}');
put('src/data/never-publish.json', '[]');
put('public/_redirects', '');
test.after(() => fs.rmSync(root, { recursive: true }));

const idIssues = (deploy, file) => runChecks({ root, deploy })
  .filter((i) => i.rule === 'frontmatter' && i.file === `src/content/posts/${file}.md` && /is also the id of/.test(i.message));

test('two posts with one id both fail, at either level, each naming the other', () => {
  for (const deploy of [false, true]) {
    for (const [file, other] of [['first', 'second'], ['second', 'first']]) {
      const issues = idIssues(deploy, file);
      assert.equal(issues.length, 1, `${file} (deploy ${deploy})`);
      assert.equal(issues[0].severity, 'error');
      assert.equal(issues[0].line, 2);
      assert.match(issues[0].message, new RegExp(`id: AO-500 is also the id of src/content/posts/${other}\\.md`));
    }
  }
});

test('a unique id is never reported', () => {
  for (const deploy of [false, true]) assert.deepEqual(idIssues(deploy, 'unique'), []);
});

test("a post taking the live notebook's id fails, the notebook is only warned", () => {
  for (const deploy of [false, true]) {
    assert.deepEqual(idIssues(deploy, 'clash-with-lab').map((i) => i.severity), ['error']);
    assert.deepEqual(idIssues(deploy, 'teardown-lab').map((i) => i.severity), ['warn']);
  }
});
