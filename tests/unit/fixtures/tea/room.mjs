// Helpers for the tea room's engine tests: a page of fixture chapters as the resolver would hand it over, the
// marks its paper would carry, a seeded random source and a deep freeze (frame() must not write to its inputs).
import { compileRoom } from '../../../../src/lib/tea-scene.js';
import { plan } from '../../../../src/scripts/tea/room/engine/plan.js';
import { MODULES, tvArt } from './scenes.mjs';

const DOM = { hero: 'top', start: 'start', tv: 'evening-television', film: 'topic-video' };
const rows = (n, kind = 'post') => Array.from({ length: n }, (_, i) => ({ kind, slug: `item-${i + 1}` }));
// The resolver's chapters for the fixture page: start shows 3 leads, the television 2 episodes and 4 machines
// (only episodes count), film 12 leads.
export const CHAPTERS = [
  { id: 'hero', dom: DOM.hero, shelves: [] },
  { id: 'start', dom: DOM.start, shelves: [{ id: 'leads', rows: rows(3) }] },
  { id: 'tv', dom: DOM.tv, shelves: [{ id: 'episodes', rows: rows(2) }, { id: 'machines', rows: rows(4, 'machine') }] },
  { id: 'film', dom: DOM.film, shelves: [{ id: 'leads', rows: rows(12) }] },
];

// Where each mark stands, in vh into its chapter (as layout.js would measure it).
export const MARKS = {
  start: { 'sheet-1': 1.4, 'sheet-2': 1.9, 'sheet-3': 2.6 },
  tv: { dial: 1.2, 'ep-1': 1.6, 'ep-2': 2.6, twenty: 3.4, 'fall-1': 4.4, 'fall-2': 5.4, moon: 6.4 },
  film: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`item-${i + 1}`, 1.2 + i])),
};

export const fixtureRoom = (chapters = CHAPTERS) => compileRoom(chapters, MODULES, { art: { tv: tvArt } });

export function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

// The fixture page laid out for a window, frozen.
export function fixtureLayout([w, h], { chapters, pieces, lean } = {}) {
  const { room } = fixtureRoom(chapters);
  return deepFreeze(plan(deepFreeze(room), { w, h }, { marks: MARKS, pieces, lean }));
}

// A seeded random source (mulberry32): the same seed gives the same numbers.
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Every number inside a value, with its path, for the "nothing undefined or NaN" checks.
export function leaves(v, path = '', out = []) {
  if (Array.isArray(v)) v.forEach((x, i) => leaves(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) leaves(x, `${path}.${k}`, out);
  else out.push([path, v]);
  return out;
}

export const VIEWS = [[1440, 900], [1920, 1080], [2560, 1440], [390, 844], [430, 932], [844, 390]];
