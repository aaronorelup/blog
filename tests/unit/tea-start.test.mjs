// The start chapter's set piece (src/scripts/tea/room/chapters/start.js): pure, and it drives only what its scene's rest
// names. Stub (piece 1): the stub piece drives nothing. The chapter's builder replaces this file.
import assert from 'node:assert/strict';
import test from 'node:test';
import { piece } from '../../src/scripts/tea/room/chapters/start.js';

test('the start piece is pure and drives nothing its rest does not name', () => {
  assert.deepEqual(piece(1, 3, 12.4, [0, 0], {}), piece(1, 3, 12.4, [0, 0], {}));
  assert.deepEqual(piece(1, 3, 12.4, [0, 0], {}), {});
});
