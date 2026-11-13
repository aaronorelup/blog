// The floors of differ.mjs and sweep.mjs held to the frames of looks A and B they were measured on (docs/TEA_ROOM.md,
// "Calibration"). differ's frames are a sixth of 1440x900 and 390x844 (results within two points of full size), with
// every word hidden; the sweep's are 96 px wide, words shown, as tea-sweep.test.mjs's are.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { comparePictures, verdict } from '../../scripts/tools/tea/differ.mjs';
import { judgePicture } from '../../scripts/tools/tea/sweep.mjs';

const pic = (dir, name) => fs.readFileSync(new URL(`./fixtures/tea/${dir}/${name}.png`, import.meta.url));
const differ = async (a, b, kind) => verdict(await comparePictures(pic('differ', a), pic('differ', b)), kind);

test('differ: the opening frames of neighbouring chapters in A and B pass, desktop and phone', async () => {
  for (const [a, b] of [['b-d-0.16', 'b-d-0.36'], ['b-p-0.18', 'b-p-0.37'], ['a-d-0.2', 'a-d-0.5'], ['a-p-0.2', 'a-p-0.5']]) {
    const v = await differ(a, b, 'chapter');
    assert.equal(v.ok, true, `${a} -> ${b}: ${v.why}`);
  }
});

test('differ: two frames of one held picture 0.1 vh apart fail', async () => {
  for (const [a, b] of [['b-d-0.16', 'b-d-0.16485'], ['b-d-0.36', 'b-d-0.36485'], ['b-p-0.37', 'b-p-0.37489'], ['a-d-0.46', 'a-d-0.46488'], ['a-p-0.46', 'a-p-0.46488']]) {
    assert.equal((await differ(a, b, 'step')).ok, false, `${a} -> ${b} should fail`);
  }
});

test('differ: B\'s flat dark slide between the television and film fails', async () => {
  for (const [a, b] of [['b-d-0.82', 'b-d-0.84'], ['b-d-0.83', 'b-d-0.85'], ['b-p-0.82', 'b-p-0.83']]) {
    assert.equal((await differ(a, b, 'step')).ok, false, `${a} -> ${b} should fail`);
  }
});

test('sweep: B\'s dead stretch on a desktop (0.82 to 0.86) and its television chapter on a phone fail', async () => {
  for (const name of ['d-0.82', 'd-0.83', 'd-0.84', 'd-0.85', 'd-0.86', 'p-0.4', 'p-0.45', 'p-0.48', 'p-0.5', 'p-0.52', 'p-0.55', 'p-0.58', 'p-0.6', 'p-0.62', 'p-0.66', 'p-0.72', 'p-0.8', 'p-0.83']) {
    assert.equal((await judgePicture(pic('sweep', `b-${name}`), { phone: name.startsWith('p-') })).ok, false, `${name} should fail`);
  }
});

test('sweep: B\'s dark but good frames, its lit television room and the film garden on a phone pass', async () => {
  for (const name of ['d-0.3', 'd-0.56', 'd-0.58', 'd-0.66', 'p-0.2', 'p-0.38', 'p-0.86']) {
    const r = await judgePicture(pic('sweep', `b-${name}`), { phone: name.startsWith('p-') });
    assert.equal(r.ok, true, `${name} should pass: ${r.why}`);
  }
});
