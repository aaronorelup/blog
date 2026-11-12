// The tea room's scene checks (pure), run with the page engine's own layout and projection so the build and the
// page can never disagree: sharpness at the named windows (no picture above 1.25 CSS px for each of its pixels,
// and on a phone at least 1.6 plate pixels for each CSS px at rest), cover at every camera key and every window
// size, every opening's rules, the back plates' growth, and that a set piece drives nothing without a rest value.
//
// Marks are attributes on paper, so they are not known at build time. Without measured marks, each chapter's
// marks are estimated: every mark its keys name, in the order the keys name them (camera, then slots, then
// tracks), spread evenly over the stretch its paper may use. tests/unit/tea-scenes.test.mjs runs the same checks
// with the marks of the built page.
import { chapterLength, paperSpan } from '../scripts/tea/room/engine/lengths.js';
import { plan } from '../scripts/tea/room/engine/plan.js';
import { cameraAt, poseScene, slotRect } from '../scripts/tea/room/engine/pose.js';
import { compOf, coverScale, grow, holds, moved, overlap, portScale, SHARP, windowRect } from '../scripts/tea/room/engine/project.js';
import { compileRoom, roomJson, TeaSceneError } from './tea-scene.js';

// The window sizes every cover and opening is checked at (CSS px), and the ones sharpness is checked at.
export const SIZES = Object.freeze([[1920, 1080], [1536, 864], [1440, 900], [1366, 768], [1280, 800], [1280, 720], [1440, 700],
  [1024, 768], [1180, 820], [844, 390], [1024, 1024], [768, 1024], [820, 1180], [430, 932], [390, 844], [360, 740], [360, 640]]);
export const SHARP_SIZES = Object.freeze({ d: [[1920, 1080], [2560, 1440]], p: [[430, 932]] });
export const PHONE_REST = 1.6; // plate pixels for each CSS px at rest, on a phone
export const BACK_GROWTH = 1.5; // the most a back plate (r >= 1) may grow
export const NEAR_THIRD = 0.35;
const EPS = 1e-6;

// Every mark a chapter's keys name: first the order its compositions declare (`marks`: names or stems of an
// each, in page order), then any other in the order the keys name them.
function markNames(room, c, comp, n) {
  const names = [];
  for (const key of c.run) {
    for (const m of room.scenes[key][comp].marks ?? []) {
      const stem = room.scenes[key][comp].camera.concat(...room.scenes[key][comp].tracks.flatMap((t) => Object.values(t).filter(Array.isArray)))
        .some((k) => k.each === m);
      if (stem) for (let i = 1; i <= n; i++) names.push(`${m}-${i}`);
      else names.push(m);
    }
  }
  const add = (k) => {
    if (k.each) for (let i = 1; i <= n; i++) names.push(`${k.each}-${i}`);
    else if (typeof k.at === 'string') names.push(k.at);
  };
  for (const key of c.run) {
    const sc = room.scenes[key][comp];
    sc.camera.forEach(add);
    for (const s of sc.slots) s.show.filter((x) => typeof x === 'string').forEach((at) => add({ at }));
    for (const t of sc.tracks) for (const p of ['slide', 'lift', 'opacity', 'wipe']) (t[p] ?? []).forEach(add);
  }
  return [...new Set(names)];
}

// Estimated marks for one composition: { [chapter id]: { [mark]: vh } }.
export function estimateMarks(room, comp) {
  const count = room.chapters.length;
  return Object.fromEntries(room.chapters.map((c, i) => {
    const flags = { hero: c.id === 'hero', afterHero: i === 1 && room.chapters[0].id === 'hero', last: i === count - 1 };
    const len = chapterLength(c.len[comp], c.n[comp], flags);
    const [a, b] = paperSpan(len, flags) ?? [0, len];
    const names = markNames(room, c, comp, c.n[comp]);
    return [c.id, Object.fromEntries(names.map((name, j) => [name, a + ((j + 1) * (b - a)) / (names.length + 1)]))];
  }));
}

// The places in a scene's part where it is checked: its part's ends, every camera key and every track key inside
// it, and evenly spaced places between, sorted.
function placesOf(S, extra = 0) {
  const { from, to } = S.part;
  const us = [from, to, ...S.camera.map((k) => k.u)];
  for (const t of S.tracks) for (const keys of Object.values(t)) for (const k of keys ?? []) us.push(k.u);
  for (let i = 1; i < extra; i++) us.push(from + ((to - from) * i) / extra);
  return [...new Set(us.filter((u) => u >= from && u <= to))].sort((a, b) => a - b);
}

// The layouts to check: every window of a composition, with the marks given or estimated.
function layouts(room, sizes, marks) {
  return sizes.map(([w, h]) => plan(room, { w, h }, { marks: marks?.[compOf(w, h)] ?? marks?.all ?? estimateMarks(room, compOf(w, h)) }));
}

const where = (S, L, u) => `${S.key} at ${L.vw}x${L.vh}, ${u.toFixed(2)} vh into ${L.chapters[S.chapter].id}`;
const fmt = (x) => x.toFixed(2);

// Sharpness, the phone's rest density and the back plates' growth.
function sharpness(room, marks, errors, warnings) {
  for (const comp of ['d', 'p']) {
    for (const L of layouts(room, SHARP_SIZES[comp], marks)) {
      const win = windowRect(L.vw, L.vh);
      for (const key of L.sceneKeys) {
        const S = L.scenes[key];
        const places = placesOf(S, 48);
        const seen = new Map();
        places.forEach((u, j) => {
          const pose = poseScene(S, u, [0, 0], L, 0);
          const before = j > 0 ? poseScene(S, places[j - 1], [0, 0], L, 0) : null;
          S.flats.forEach((f, fi) => {
            const p = pose.placed[fi];
            if (!Number.isFinite(p.s)) return;
            const rect = { x: p.out.x, y: p.out.y, w: p.out.w, h: p.out.h };
            const hole = f.hole && moveHole(S, f, p);
            const opaqueInFrame = overlap(rect, win) && !(hole && holds(hole, win));
            const drawn = opaqueInFrame && (p.out.o > 0 || (before && before.placed[fi].out.o > 0));
            if (!drawn) return;
            if (f.px) {
              const scale = Math.max((rect.w / f.px[0]), rect.h / f.px[1]);
              if (scale > SHARP + EPS && !seen.has(`s${fi}`)) {
                seen.set(`s${fi}`, 1);
                errors.push(`${where(S, L, u)}: flat ${f.name} is drawn at ${fmt(scale)} CSS px a pixel, above ${SHARP}`);
              }
              if (comp === 'p' && u === S.part.from && scale > 1 / PHONE_REST + EPS && !seen.has(`r${fi}`)) {
                seen.set(`r${fi}`, 1);
                errors.push(`${where(S, L, u)}: flat ${f.name} rests at ${fmt(1 / scale)} pixels a CSS px, under ${PHONE_REST}`);
              }
            }
            if (f.r >= 1 && S.flats.some((g) => g.hole) && p.s > BACK_GROWTH + EPS && !seen.has(`b${fi}`)) {
              seen.set(`b${fi}`, 1);
              errors.push(`${where(S, L, u)}: back plate ${f.name} has grown ${fmt(p.s)} times, above ${BACK_GROWTH}`);
            }
          });
          S.slots.forEach((k, si) => slotSharp(S, k, si, u, j > 0 ? places[j - 1] : null, pose, L, win, seen, errors, warnings));
        });
      }
    }
  }
}

const moveHole = (S, f, p) => moved(grow(f.hole, S.fit.ax, S.fit.ay, p.s), p.dx, p.dy);
const slotOn = (S, k, u) => u !== null && u > S.part.from && u >= k.show[0] && u < k.show[1];

// A slot is checked wherever it is on, and at the end of its show (it is on just before), by its width (a picture
// is fitted to its slot's width). The picture it holds is the current item's: the item of the last `each` camera
// key at or before the place, the first item before any; with no `each` key, the narrowest it may hold. A slot inside the hole of a
// front flat whose port is fully uncovered is behind that port (front stage over slots) and not checked.
function slotSharp(S, k, si, u, prev, pose, L, win, seen, errors, warnings) {
  if (!k.px.length) {
    if (!seen.has(`n${si}`)) { seen.set(`n${si}`, 1); warnings.push(`${S.key}: slot ${k.name} names no picture size (art.js), so its sharpness is not checked`); }
    return;
  }
  if (!slotOn(S, k, u) && !slotOn(S, k, prev)) return;
  const rect = slotRect(S, k, pose.placed);
  if (!rect || !overlap(rect, win)) return;
  const f = S.flats[k.flat];
  const fp = pose.placed[k.flat];
  if (f.hole && f.front && fp.tr.wipe >= 1 && fp.tr.o >= 1 && holds(moveHole(S, f, fp), rect)) return;
  const items = S.camera.filter((c) => c.item > 0);
  const now = items.filter((c) => c.u <= u).pop() ?? items[0];
  const px = now ? k.px[Math.min(k.px.length, now.item) - 1] : k.px.reduce((a, b) => (b[0] < a[0] ? b : a));
  const scale = rect.w / px[0];
  if (scale > SHARP + EPS && !seen.has(`k${si}`)) {
    seen.set(`k${si}`, 1);
    errors.push(`${where(S, L, u)}: slot ${k.name} draws its ${px[0]}x${px[1]} picture at ${fmt(scale)} CSS px a pixel, above ${SHARP}`);
  }
}

// Some fully opaque back plate covers the window at every place checked, at every window size.
function cover(room, marks, errors) {
  for (const L of layouts(room, [...SIZES, ...SHARP_SIZES.d], marks)) {
    const win = windowRect(L.vw, L.vh);
    for (const key of L.sceneKeys) {
      const S = L.scenes[key];
      const bad = placesOf(S).find((u) => {
        const pose = poseScene(S, u, [0, 0], L, 0);
        return !S.flats.some((f, fi) => f.r >= 1 && !f.through && pose.placed[fi].out.o >= 1 &&
          Number.isFinite(pose.placed[fi].s) && holds(pose.placed[fi].out, win, 0.5));
      });
      if (bad !== undefined) errors.push(`${where(S, L, bad)}: no back plate covers the window`);
    }
  }
}

// Every opening: a hole box stands in the near third with the aim inside it; the scene behind covers every part
// of the hole inside the window from the first frame to the handover; and at the handover nothing drawn in front
// of the port is left in the window.
function openings(room, marks, errors) {
  for (const L of layouts(room, [...SIZES, ...SHARP_SIZES.d], marks)) {
    const win = windowRect(L.vw, L.vh);
    for (const key of L.sceneKeys) {
      const S = L.scenes[key];
      for (const port of S.ports) {
        const f = S.flats[port.flat];
        const T = L.scenes[port.to];
        if (!T) { errors.push(`${S.key}: its opening goes to ${port.to}, which is not on the page`); continue; }
        if (f.hole && f.r > NEAR_THIRD) errors.push(`${S.key}: flat ${f.name} has a hole and stands at ${f.r}, outside the near third (${NEAR_THIRD})`);
        if (f.hole && !Number.isFinite(coverScale(f.hole, S.fit.ax, S.fit.ay, L.vw, L.vh))) {
          errors.push(`${S.key} at ${L.vw}x${L.vh}: the aim is not inside the hole of ${f.name}, so the camera can never go through it`);
          continue;
        }
        const tp = poseScene(T, T.part.from, [0, 0], L, 0);
        const bi = T.flats.findIndex((g, gi) => g.r >= 1 && !g.through && tp.placed[gi].out.o >= 1);
        const back = bi >= 0 ? tp.flats[bi] : null;
        const bad = placesOf(S, 24).find((u) => {
          const pose = poseScene(S, u, [0, 0], L, 0);
          const p = pose.placed[port.flat];
          if (!Number.isFinite(p.s)) return true;
          // Where the port shows anything: inside the hole (once the wipe has begun), or for an open door the whole
          // window at the handover (its panels are the mask before that).
          const see = p.tr.wipe <= 0 || p.out.o <= 0 ? null : f.hole ? overlap(moveHole(S, f, p), win) : (u >= S.part.to ? win : null);
          if (!see) return false;
          if (!back) return true;
          const k = portScale(port.at, port.mh, cameraAt(S, u));
          return !holds(grow(back, S.fit.ax, S.fit.ay, k), see, 0.5);
        });
        if (bad !== undefined) errors.push(`${where(S, L, bad)}: the scene behind ${f.name} does not cover its hole (a larger at, or a hole nearer the frame's shape)`);
        const end = poseScene(S, S.part.to, [0, 0], L, 0);
        S.flats.forEach((g, gi) => {
          const inFront = gi > port.flat ? g.front === f.front || (g.front && !f.front) : g.front && !f.front;
          const self = gi === port.flat && !f.hole;
          if (!(inFront || self)) return;
          const o = end.placed[gi];
          if (Number.isFinite(o.s) && o.out.o > 0 && overlap(o.out, win)) {
            errors.push(`${where(S, L, S.part.to)}: flat ${g.name} is still in the frame at the handover, in front of the opening`);
          }
        });
      }
    }
  }
}

// A set piece drives only elements with a rest value, and only the values rest names.
function pieces(room, fns, errors) {
  for (const c of room.chapters) {
    const fn = fns?.[c.id];
    if (!fn) continue;
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const L = plan(room, { w, h }, { pieces: fns });
      const ch = L.chapters.find((x) => x.id === c.id);
      for (const u of [-1, 0, ch.len / 2, ch.len, ch.len + 1]) {
        const out = fn(u, ch.n, 12.4, [0, 0], L) ?? {};
        for (const [el, props] of Object.entries(out)) {
          if (!ch.rest[el]) { errors.push(`${c.id}: its piece drives ${el}, which has no rest value`); continue; }
          for (const p of Object.keys(props ?? {})) if (!(p in ch.rest[el])) errors.push(`${c.id}: its piece drives ${el}.${p}, which has no rest value`);
        }
      }
    }
  }
}

// Every check over a compiled room. marks: { d, p } measured marks by composition, or { all } (estimated when
// absent). fns: the set pieces by chapter id. Returns { errors, warnings }, each a list of sentences.
export function checkRoom(room, { marks = null, fns = null } = {}) {
  const errors = [], warnings = [];
  sharpness(room, marks, errors, warnings);
  cover(room, marks, errors);
  openings(room, marks, errors);
  pieces(room, fns, errors);
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

// What the build calls: compile, check, and the JSON for the page. Throws a TeaSceneError on any error.
export function buildRoom(chapters, modules, { art, night, marks, fns } = {}) {
  const { room, warnings } = compileRoom(chapters, modules, { art, night });
  const checked = checkRoom(room, { marks, fns });
  if (checked.errors.length) throw new TeaSceneError(checked.errors);
  return { room, json: roomJson(room), warnings: [...warnings, ...checked.warnings] };
}
