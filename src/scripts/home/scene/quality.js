// What the scene may cost on this machine. It is cheap in draw calls (25) and triangles (37k) but pays per pixel, per
// light and per frame, and those are the three dials, in the order it is worth giving them up: petals decide whether
// we redraw *at all* when the visitor is still, lamps decide how many lights every fragment shader loops over, and
// dpr decides how many fragments there are. sampleQuality steps down a rung when the frames that drew are slow, and
// back up when they are quick; below the bottom rung the page falls back to the flat document. ?tier= pins a rung.
import { cardState, disableStage, measureCards } from './cards.js';
import { unbindInput } from './camera.js';
import { fit } from './renderer.js';
import { syncLamps } from './world/lamps.js';
import { setPetals } from './world/petals.js';

export const QUALITY = [
  // 'static' keeps the tea house on screen but stops animating it: the page
  // scrolls like an ordinary document and the scene cuts to the frame for
  // whichever section you are next to. Losing the ride is a far smaller loss
  // than losing the art, so this rung comes before giving up altogether.
  { name: 'static', dpr: 1.0,  petals: 0,    lamps: 0, reduced: true },
  { name: 'low',    dpr: 1.0,  petals: 0,    lamps: 0 },
  { name: 'medium', dpr: 1.25, petals: 0.45, lamps: 3 },
  { name: 'high',   dpr: 1.5,  petals: 1,    lamps: 99 },
];

// The top rung, or the one ?tier=low|medium|high|static pins, so a slow machine can be diagnosed on the machine
// that is slow.
export function pickTier(s, query) {
  const pinned = QUALITY.findIndex(t => t.name === query.get('tier'));
  s.pinned = pinned >= 0;
  s.tier = s.pinned ? pinned : QUALITY.length - 1;
  s.quality = QUALITY[s.tier].name;
  s.dpr = QUALITY[s.tier].dpr;
}

export function applyTier(s) {
  const q = QUALITY[s.tier];
  s.quality = q.name;
  s.dpr = q.dpr;
  fit(s);
  setPetals(s, q.petals);
  s.lampBudget = q.lamps;
  s.lampsOn = undefined;      // force syncLamps to re-evaluate the budget
  syncLamps(s);
  if (q.reduced && !s.reduced) enterReduced(s);
}

// Hand the page back to the browser: native scrolling, every section in flow
// and fully visible, no per-frame card cross-fade. The canvas stays, and the
// frame loop keeps cutting it to whichever section you are beside.
function enterReduced(s) {
  s.reduced = true;
  unbindInput(s);
  disableStage(s);
  s.cards.forEach(c => cardState(c.el, 1, 0, 0));
  measureCards(s);
  s.lastProgress = undefined;
}

// Only frames that actually drew are sampled: at the bottom tier the petals are
// gone, so a still visitor renders nothing and the rAF gap would otherwise read
// as a healthy 16ms forever. What matters is how fast the scene moves *when it
// is moving*, which is exactly when the visitor is looking at it.
// True when even the static frame is too slow: the scene should bail.
export function sampleQuality(s, nowMs) {
  if (s.pinned) return false;
  const prev = s.lastDrawTs;
  s.lastDrawTs = nowMs;
  if (!prev || nowMs - prev > 200) return false;        // a gap means it was idle, not slow
  const f = (s.fts = s.fts || []);
  f.push(nowMs - prev);
  if (f.length < 45) return false;
  const med = f.slice().sort((a, b) => a - b)[f.length >> 1];
  f.length = 0;
  if (med > 45 && s.tier === 0) return true;
  if (med > 22 && s.tier > 0) {
    s.tierFloor = Math.min(s.tierFloor ?? Infinity, s.tier);
    s.tier--;
    applyTier(s);
  } else if (med < 13 && s.tier < QUALITY.length - 1 && s.tier + 1 < (s.tierFloor ?? Infinity)) {
    s.tier++;
    applyTier(s);
  }
  return false;
}
