// The still life: the brew run to rest at once with the same seed (reduced motion, and __leaves.skip()), so the
// frame painted once is the room's last one, never a stopped animation: the empty cup with its wet film, the leaves
// reading the number, one thread of steam, the slip and its seal already set down. It fades in over 200 ms.
import { createBrew, runToRest } from './brew.js';
import { stillThread } from './steam.js';
import { tallyOf } from './ui.js';

// Brings room.s to rest; a fresh quick brew when `quick` (a still made at load), else the one in progress.
export function toRest(room, { data, seed, quick }) {
  if (quick) room.s = createBrew(data, seed, { quick: true });
  runToRest(room.s);
  stillThread(room.steam);
  return tallyOf(room.s.leaves);
}

export function fadeIn(cv) {
  cv.classList.add('lv-fade');
  requestAnimationFrame(() => requestAnimationFrame(() => cv.classList.add('lv-in')));
}
