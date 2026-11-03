// The search box's merge (src/scripts/search/merge.js): the words half's pages lead, a page both halves found rises
// among them, the meaning half's own pages follow in its order, and each page shows once with the words' passage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { merge } from '../../src/scripts/search/merge.js';

const hit = (path, from) => ({ path, from });

test('the words half leads; the meaning half only adds pages after it, and lifts the ones it shares', () => {
  const words = [hit('/a/', 'w'), hit('/b/', 'w'), hit('/c/', 'w')];
  const meaning = [hit('/off-topic/', 'm'), hit('/c/', 'm'), hit('/c/', 'm'), hit('/d/', 'm')];
  assert.deepEqual(merge(words, meaning).map((h) => [h.path, h.from]),
    [['/c/', 'w'], ['/a/', 'w'], ['/b/', 'w'], ['/off-topic/', 'm'], ['/d/', 'm']]);
});

test('either half alone keeps its own order', () => {
  const list = [hit('/a/'), hit('/b/'), hit('/a/'), hit('/c/')];
  for (const [w, m] of [[list, []], [[], list]]) assert.deepEqual(merge(w, m).map((h) => h.path), ['/a/', '/b/', '/c/']);
});
