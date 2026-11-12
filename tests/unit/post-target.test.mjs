// The element a #fragment names in a post (src/scripts/post/target.js). details.js asks it on every post's mount, so
// a fragment it can't decode (a stray %, as in /ledger/<slug>/#100%) must name no element rather than throw: the throw
// stopped views/post.js before the post's components and its Listen button were set up.
import test from 'node:test';
import assert from 'node:assert/strict';
import { targetOf } from '../../src/scripts/post/target.js';

globalThis.CSS = { escape: (s) => s.replace(/["\\]/g, '\\$&') };
// A root that holds the ids given and answers querySelector('[id="..."]') as a page would.
const root = (...ids) => ({ querySelector: (sel) => {
  const id = sel.match(/^\[id="(.*)"\]$/s)[1].replace(/\\(.)/g, '$1');
  return ids.includes(id) ? { id } : null;
} });

test('a fragment names its element, percent-encoded or not', () => {
  assert.deepEqual(targetOf(root('the-rig'), '#the-rig'), { id: 'the-rig' });
  assert.deepEqual(targetOf(root('café'), '#caf%C3%A9'), { id: 'café' });
  assert.equal(targetOf(root('the-rig'), ''), null);
  assert.equal(targetOf(root('the-rig'), '#elsewhere'), null);
});

test('a fragment that is not valid percent-encoding is read as written, and never throws', () => {
  assert.equal(targetOf(root('the-rig'), '#100%'), null);
  assert.equal(targetOf(root('the-rig'), '#%E0%A4%A'), null);
  assert.deepEqual(targetOf(root('100%'), '#100%'), { id: '100%' });
});
