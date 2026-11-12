// The tea room's frame: one pure function from the scroll position, the time, the pointer and the layout to a value
// for everything the engine writes. No DOM, no globals, no memory: the same inputs give the same frame, however
// the reader got there. apply.js writes it and is the only writer.
import { poseScene, slotRect } from './pose.js';
import { screensAt } from './screens.js';
import { hash01, within } from './tracks.js';

// What an off slot holds: opacity 0, no pointer, data-off. The same value every time, written every frame.
export const OFF = Object.freeze({ on: false, x: 0, y: 0, w: 0, h: 0, o: 0 });

const finite = (x, d) => (Number.isFinite(x) ? x : Number.isNaN(x) || x === undefined ? d : x > 0 ? 1e12 : -1e12);

// The chapter that holds y (px): the last whose section begins at or above it. Above the page, the first; below
// it (the footer), the last.
export function chapterAt(y, L) {
  let i = 0;
  for (let j = 1; j < L.chapters.length; j++) if (L.chapters[j].top <= y) i = j;
  return i;
}

// The scene that is on at y: { i, key, u }, u in vh into chapter i. Each scene holds the half-open part
// [from, to) of its chapter; a scene whose part is empty is never on.
export function sceneAt(y, L) {
  const i = chapterAt(y, L);
  const c = L.chapters[i];
  const u = (y - c.top) / L.vh;
  let part = c.parts[0];
  for (const p of c.parts) if (p.from <= u && p.to > p.from) part = p;
  return { i, key: part.key, u };
}

// Whether a chapter's section is within one screen of the frame [y, y + vh].
export const near = (c, y, L) => c.top < y + 2 * L.vh && c.top + c.len * L.vh > y - L.vh;

// A set piece's values, laid over its rest values: every element and property named in rest gets a value, a
// value the piece does not give (or gives as NaN) is the rest value, and nothing outside rest is written.
export function pieceValues(rest, out) {
  const vals = {};
  for (const [el, props] of Object.entries(rest)) {
    const got = out && typeof out === 'object' ? out[el] : null;
    vals[el] = {};
    for (const [prop, v] of Object.entries(props)) {
      const g = got && typeof got === 'object' ? got[prop] : undefined;
      vals[el][prop] = (typeof g === 'number' && Number.isFinite(g)) || (typeof g === 'string' && typeof v === 'string') ? g : v;
    }
  }
  return vals;
}

// The lantern's breath (within 6% over five seconds) and the television's flicker (an uneven step about eight
// times a second), both from the clock alone.
export const breathAt = (t) => 1 + 0.03 * Math.sin((2 * Math.PI * t) / 5);
export const flickerAt = (t) => 0.94 + 0.06 * hash01(Math.floor(t * 8));

// y: scroll position in px. t: seconds (12.4 with ?still=1). ptr: [x, y], each -1 to 1 from the window's centre.
// L: plan()'s layout. Returns { on, groups, flats, ports, slots, pieces, screens, ambient, index }: the same keys
// at every position, every slot and every piece-driven element of the page in every frame.
export function frame(y, t, ptr, L) {
  y = finite(y, 0);
  t = finite(t, 0);
  ptr = Array.isArray(ptr) ? [finite(ptr[0], 0), finite(ptr[1], 0)] : [0, 0];
  const { i, key, u } = sceneAt(y, L);
  const S = L.scenes[key];
  const pose = poseScene(S, u, ptr, L, 2);
  return {
    on: key,
    groups: L.sceneKeys.map((k) => ({ key: k, hidden: k !== key })),
    flats: pose.flats,
    ports: pose.ports,
    slots: L.slots.map((k) => slotValue(k, key, u, S, pose)),
    pieces: L.chapters.map((c) => ({ id: c.id, values: pieceValues(c.rest, c.piece && near(c, y, L) ? ask(c, y, t, ptr, L) : null) })),
    screens: screensAt(y, L),
    ambient: { scene: key, u, t, breath: breathAt(t), flicker: flickerAt(t) },
    index: { i, id: L.chapters[i].id },
  };
}

// A set piece's answer. A piece that throws gives no values, so its elements hold their rest values.
function ask(c, y, t, ptr, L) {
  try {
    return c.piece((y - c.top) / L.vh, c.n, t, ptr, L);
  } catch {
    return null;
  }
}

// One slot, on or OFF. On only while its scene is on, inside its show span, after its scene's first frame (no
// slot is on at a scene's opening frame: a port holds a copy of that frame without any real element in it), and
// while its flat is shown.
function slotValue(k, on, u, S, pose) {
  if (k.scene !== on || !within(k.show, u) || u <= S.part.from) return OFF;
  const fp = pose.placed[k.flat];
  if (!fp.out.shown) return OFF;
  const r = slotRect(S, k, pose.placed);
  return r ? { on: true, x: r.x, y: r.y, w: r.w, h: r.h, o: fp.out.o } : OFF;
}
