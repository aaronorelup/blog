// Today's /tea/ is untouched until the swap (2.1, 5.4): every file it is served by, tested by or documented in is
// held here to the bytes it had on the base the rebuild started from (tests/unit/fixtures/tea/today.json). A
// builder of the new page who writes over one of them (as the hero chapter's stub once wrote over
// tests/unit/tea-hero.test.mjs, because 2.1's tea-<id> name for id 'hero' is that file) fails here. And no chapter's
// own test may take a name that is one of today's files: the hero's is tests/unit/tea-room-hero.test.mjs.
// The swap (6a) and the removal (6b) are the only pieces that change this list, with this file.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';

const TODAY = JSON.parse(fs.readFileSync(new URL('./fixtures/tea/today.json', import.meta.url), 'utf8'));
const root = new URL('../../', import.meta.url);
const sha = (rel) => crypto.createHash('sha256').update(fs.readFileSync(new URL(rel, root))).digest('hex');

test("every file of today's /tea/ is byte for byte what it was before the rebuild", () => {
  const changed = Object.entries(TODAY).filter(([rel, h]) => !fs.existsSync(new URL(rel, root)) || sha(rel) !== h).map(([rel]) => rel);
  assert.deepEqual(changed, [], `today's /tea/ was changed: ${changed.join(', ')}. Restore it from the base; only pieces 6a and 6b may change it`);
});

test("no chapter's own unit test is one of today's files", () => {
  const own = (id) => (id === 'hero' ? 'tests/unit/tea-room-hero.test.mjs' : `tests/unit/tea-${id}.test.mjs`);
  const clash = TEA_CHAPTERS.map((c) => own(c.id)).filter((rel) => rel in TODAY);
  assert.deepEqual(clash, []);
  assert.ok(fs.existsSync(new URL('tests/unit/tea-room-hero.test.mjs', root)), "the hero chapter's unit test has its own name");
});
