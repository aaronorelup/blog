// The lantern door. After dark the coin's reverse is a lit andon, and the command centre's lamp is an andon too.
// Flip the coin FLIPS times running (each toss within GAP of the last one landing) and the last toss lands lamp-up,
// the lamp flares, and the door opens: /api/lantern, which the Worker sends on to the centre (worker/lantern.js), so
// its address is in no file here. Not a lock (the centre has its own passphrase): a back door only one person needs.
import { wantsNight } from './theme.js';

const FLIPS = 5;
const GAP = 3000;
let run = 0;
let landedAt = 0;

// A toss is starting: true when it is the one that opens the door.
export function tossed(now) {
  run = wantsNight() ? (now - landedAt < GAP ? run + 1 : 1) : 0;
  return run >= FLIPS;
}

// The toss has landed; a lit one flares the lamp on the coin's back and leaves.
export function landed(back, done) {
  landedAt = performance.now();
  if (run < FLIPS) return;
  run = 0;
  back.style.transition = 'box-shadow 700ms ease-out';
  back.style.boxShadow = '0 0 0 3px #FFD892, 0 0 42px 16px rgba(255,216,146,0.8)';
  // coming Back restores this page from bfcache mid-glow, so put the lamp out then
  addEventListener('pageshow', () => { back.style.boxShadow = ''; done(); }, { once: true });
  setTimeout(() => { location.href = '/api/lantern'; }, 900);
  return true;
}
