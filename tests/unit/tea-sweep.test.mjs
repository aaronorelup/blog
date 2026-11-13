// The empty-frame sweep's floors (scripts/tools/tea/sweep.mjs) on the frames of look B they were measured on
// (tests/unit/fixtures/tea/sweep/, 96 px wide copies of /labs/tea-room/b/?y=<y>&still=1 at 1440x900 and 390x844):
// B's dead stretch and its dark phone frames fail, its dark but good desktop frames pass.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { judgePicture } from '../../scripts/tools/tea/sweep.mjs';

const frame = (name) => fs.readFileSync(new URL(`./fixtures/tea/sweep/b-${name}.png`, import.meta.url));
const judged = (name) => judgePicture(frame(name), { phone: name.startsWith('p-') });

test('the sweep fails B at 0.82 to 0.84 on a desktop and its dark phone frames, and passes its dark good frames', async () => {
  for (const name of ['d-0.82', 'd-0.83', 'd-0.84', 'p-0.45', 'p-0.5', 'p-0.55', 'p-0.6', 'p-0.83']) {
    assert.equal((await judged(name)).ok, false, `${name} should fail`);
  }
  for (const name of ['d-0.58', 'd-0.66', 'd-0.3', 'p-0.2']) {
    const r = await judged(name);
    assert.equal(r.ok, true, `${name} should pass: ${r.why}`);
  }
});
