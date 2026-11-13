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
import { CLOSE, IN, OUT } from '../scripts/tea/room/engine/screens.js';
import { compOf, coverScale, drawScale, grow, holds, moved, overlap, portScale, SHARP, windowRect } from '../scripts/tea/room/engine/project.js';

// The window sizes every cover and opening is checked at (CSS px), and the ones sharpness is checked at.
export const SIZES = Object.freeze([[1920, 1080], [1536, 864], [1440, 900], [1366, 768], [1280, 800], [1280, 720], [1440, 700],
  [1024, 768], [1180, 820], [844, 390], [1024, 1024], [768, 1024], [820, 1180], [430, 932], [390, 844], [360, 740], [360, 640]]);
export const SHARP_SIZES = Object.freeze({ d: [[1920, 1080], [2560, 1440]], p: [[430, 932]] });
export const PHONE_REST = 1.6; // plate pixels for each CSS px at rest, on a phone
export const BACK_GROWTH = 1.5; // the most a back plate (r >= 1) may grow
export const NEAR_THIRD = 0.35;
const EPS = 1e-6;

// Every mark a chapter's keys name for a composition: first the order its scenes declare (`marks`, names or the
// stem of an `each`, in page order), then any other in the order the keys name them.
export function markNames(room, c, comp, n) {
  const names = [];
  const add = (k) => {
    if (k.each) for (let i = 1; i <= n; i++) names.push(`${k.each}-${i}`);
    else if (typeof k.at === 'string') names.push(k.at);
  };
  const scenes = c.run.map((key) => room.scenes[key][comp]);
  const keys = scenes.flatMap((sc) => [...sc.camera, ...sc.tracks.flatMap((t) => ['slide', 'lift', 'opacity', 'wipe'].flatMap((p) => t[p] ?? []))]);
  const stems = new Set(keys.filter((k) => k.each).map((k) => k.each));
  for (const sc of scenes) for (const m of sc.marks ?? []) add(stems.has(m) ? { each: m } : { at: m });
  for (const sc of scenes) {
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

// Sharpness, the phone's rest density and the back plates' growth. Each is reported once for each flat, slot and
// window, at the place where it is worst.
function sharpness(room, marks, errors, warnings) {
  for (const comp of ['d', 'p']) {
    for (const L of layouts(room, SHARP_SIZES[comp], marks)) {
      const win = windowRect(L.vw, L.vh);
      for (const key of L.sceneKeys) {
        const S = L.scenes[key];
        const places = placesOf(S, 48);
        // A chain (the walk): several back plates, each a closer view handed over by a dissolve, held by the 1.25
        // rule alone. Every other scene's back plate grows 1.5 times at most.
        const chain = S.flats.filter((g) => g.r >= 1 && !g.through && g.px).length > 1;
        const worst = new Map();
        const note = (id, value, limit, say) => { if (value > limit + EPS && !(worst.get(id)?.value >= value)) worst.set(id, { value, say }); };
        places.forEach((u, j) => {
          const pose = poseScene(S, u, [0, 0], L, 0);
          const before = j > 0 ? poseScene(S, places[j - 1], [0, 0], L, 0) : null;
          S.flats.forEach((f, fi) => {
            const p = pose.placed[fi];
            if (!Number.isFinite(p.s)) return;
            const rect = { x: p.out.x, y: p.out.y, w: p.out.w, h: p.out.h };
            const hole = f.hole && moveHole(S, f, p);
            const opaqueInFrame = overlap(rect, win) && !(hole && holds(hole, win));
            if (!(opaqueInFrame && (p.out.o > 0 || (before && before.placed[fi].out.o > 0)))) return;
            if (f.px) {
              const scale = Math.max(rect.w / f.px[0], rect.h / f.px[1]);
              note(`s${fi}`, scale, SHARP, () => `${where(S, L, u)}: flat ${f.name} is drawn at ${fmt(scale)} CSS px a pixel, above ${SHARP}`);
              if (comp === 'p' && u === S.part.from) {
                note(`r${fi}`, scale, 1 / PHONE_REST, () => `${where(S, L, u)}: flat ${f.name} rests at ${fmt(1 / scale)} pixels a CSS px, under ${PHONE_REST}`);
              }
            }
            if (f.r >= 1 && !chain) {
              note(`b${fi}`, p.s, BACK_GROWTH, () => `${where(S, L, u)}: back plate ${f.name} has grown ${fmt(p.s)} times, above ${BACK_GROWTH}`);
            }
          });
          S.slots.forEach((k, si) => slotSharp(S, k, si, u, j > 0 ? places[j - 1] : null, pose, L, win, note, warnings));
        });
        for (const { say } of worst.values()) errors.push(say());
      }
    }
  }
}

const moveHole = (S, f, p) => moved(grow(f.hole, S.fit.ax, S.fit.ay, p.s), p.dx, p.dy);
const slotOn = (S, k, u) => u !== null && u > S.part.from && u >= k.show[0] && u < k.show[1];

// A slot is checked wherever it is on, and at the end of its show (it is on just before), at the scale its picture
// is really drawn at: fitted whole inside the slot ('contain', the default, which RoomSlot draws) or covering it. The picture it holds is the current item's: the item of the last `each` camera
// key at or before the place, the first item before any, and the first picture with no `each` key (as plan.js
// fits it). A slot
// inside the hole of a front flat whose port is fully uncovered is behind that port (the front stage is over the
// slots) and is not checked.
function slotSharp(S, k, si, u, prev, pose, L, win, note, warnings) {
  if (!k.px.length) return warnings.push(`${S.key}: slot ${k.name} names no picture size (art.js), so its sharpness is not checked`);
  if (!slotOn(S, k, u) && !slotOn(S, k, prev)) return;
  const rect = slotRect(S, k, pose.placed);
  if (!rect || !overlap(rect, win)) return;
  const f = S.flats[k.flat];
  const fp = pose.placed[k.flat];
  if (f.hole && f.front && fp.tr.wipe >= 1 && fp.tr.o >= 1 && holds(moveHole(S, f, fp), rect)) return;
  const items = S.camera.filter((c) => c.item > 0);
  const now = items.filter((c) => c.u <= u).pop() ?? items[0];
  const px = k.px[Math.min(k.px.length, now?.item ?? 1) - 1];
  const scale = drawScale(rect.w, rect.h, px, k.fit);
  note(`k${si}`, scale, SHARP, () => `${where(S, L, u)}: slot ${k.name} draws its ${px[0]}x${px[1]} picture at ${fmt(scale)} CSS px a pixel (${k.fit}), above ${SHARP}`);
  return null;
}

// Some fully opaque back plate covers the window at every place checked, at every window size.
function cover(room, marks, errors) {
  for (const L of layouts(room, [...SIZES, ...SHARP_SIZES.d], marks)) {
    const win = windowRect(L.vw, L.vh);
    for (const key of L.sceneKeys) {
      const S = L.scenes[key];
      // every key, just after every key (a step), and 48 places between: a cross-fade can leave the night
      // ground showing between keys that are all covered
      const keys = placesOf(S);
      const us = [...new Set([...placesOf(S, 48), ...keys.map((u) => Math.min(S.part.to, u + 1e-4))])].sort((a, b) => a - b);
      const bad = us.find((u) => {
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
      const ch = L.chapters[S.chapter];
      if (S.part.to <= S.part.from && ch.parts[ch.parts.length - 1].key !== key) {
        errors.push(`${S.key} at ${L.vw}x${L.vh}: the scene has no part of its chapter (a mark its camera names is missing, or its keys fall before the scene before it ends), so the run skips it`);
      }
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
          // (An open door's port is clipped to the door's frame, so it never paints over the walls; before the
          // handover the walls behind the port show where the scene behind does not reach, as through a doorway.)
          const door = f.hole ? null : grow(port.door, S.fit.ax, S.fit.ay, p.s);
          if (door && u >= S.part.to && !holds(door, win, 0.5)) return true;
          const see = p.tr.wipe <= 0 || p.out.o <= 0 ? null : f.hole ? overlap(moveHole(S, f, p), win) : (u >= S.part.to ? win : null);
          if (!see) return false;
          if (!back) return true;
          const k = portScale(port.at, port.mh, cameraAt(S, u));
          return !holds(grow(back, S.fit.ax, S.fit.ay, k), see, 0.5);
        });
        if (bad !== undefined) errors.push(`${where(S, L, bad)}: the scene behind ${f.name} does not cover its hole (a larger at, or a hole nearer the frame's shape)`);
        const end = poseScene(S, S.part.to, [0, 0], L, 0);
        // The handover: the camera's last key is the through key, and there the hole is the whole frame, opaque and
        // fully uncovered (the scene is changed for the one behind only at that moment).
        if (f.hole) {
          const last = S.camera[S.camera.length - 1];
          if (!S.camera.some((k) => k.through)) errors.push(`${S.key} at ${L.vw}x${L.vh}: its through key names a mark the page does not have, so it never goes through`);
          else if (!last?.through) errors.push(`${where(S, L, last.u)}: a camera key after the through key is the scene's last key, so its handover is not at the through push`);
          const e = end.placed[port.flat];
          const hole = Number.isFinite(e.s) ? moveHole(S, f, e) : null;
          if (!hole || !holds(hole, win, 0.5) || e.out.o < 1 || e.tr.wipe < 1) {
            errors.push(`${where(S, L, S.part.to)}: at the handover the hole of ${f.name} is not the whole frame, opaque and uncovered`);
          }
        }
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
      const us = Array.from({ length: Math.ceil((ch.len + 2) / 0.05) + 1 }, (_, i) => -1 + i * 0.05);
      for (const [u, t] of us.flatMap((u) => [0, 2.5, 12.4, 30, 120].map((t) => [u, t]))) {
        let out;
        try { out = fn(u, ch.n, t, [0, 0], L) ?? {}; } catch { continue; }
        for (const [el, props] of Object.entries(out)) {
          if (!ch.rest[el]) { errors.push(`${c.id}: its piece drives ${el}, which has no rest value`); continue; }
          for (const p of Object.keys(props ?? {})) if (!(p in ch.rest[el])) errors.push(`${c.id}: its piece drives ${el}.${p}, which has no rest value`);
        }
      }
    }
  }
}

// Two screens changes never overlap: each chapter is long enough to finish opening on it before the next change
// (or the house closing) begins, in both compositions.
function spacing(room, errors) {
  for (const comp of ['d', 'p']) {
    const L = plan(room, comp === 'd' ? { w: 1440, h: 900 } : { w: 390, h: 844 });
    L.chapters.forEach((c, i) => {
      const opens = i === 0 || (i === 1 && L.chapters[0].hero) ? 0 : OUT[1];
      const next = c.last ? -CLOSE[0] : -IN[0];
      if (c.len < opens + next) errors.push(`${c.id} ${comp}: ${fmt(c.len)} vh is too short for the screens to open on it and shut after it`);
    });
  }
}

// Data-only checks: a 'fit:<slot>' key whose slot names no picture size (it would fit nothing and push to the
// cover), and a back plate that covers the board but without the 4% spare of 2.4 (a warning: the cover check is
// what fails a frame).
const SPARE = 0.04;
function data(room, errors, warnings) {
  for (const S of Object.values(room.scenes)) {
    for (const comp of ['d', 'p']) {
      const sc = S[comp];
      const [bw, bh] = comp === 'd' ? [1600, 900] : [900, 1600];
      for (const k of sc.camera) {
        if (typeof k.m === 'string' && k.m.startsWith('fit:')) {
          const slot = sc.slots.find((x) => x.name === k.m.slice(4));
          if (slot && !slot.px.length) errors.push(`${S.key} ${comp}: slot ${slot.name} is fitted by a camera key (${k.m}) and gives no picture size (art.js)`);
        }
      }
      for (const f of sc.flats) {
        const [x, y, w, h] = f.box;
        if (f.r < 1 || f.through || f.text || !(x <= 0 && y <= 0 && x + w >= bw && y + h >= bh)) continue;
        if (-x < SPARE * bw - 0.5 || -y < SPARE * bh - 0.5 || x + w - bw < SPARE * bw - 0.5 || y + h - bh < SPARE * bh - 0.5) {
          warnings.push(`${S.key} ${comp}: back plate ${f.name} covers the board with less than 4% spare on a side`);
        }
      }
    }
  }
}

// Every check over a compiled room. marks: { d, p } measured marks by composition, or { all } (estimated when
// absent). fns: the set pieces by chapter id. Returns { errors, warnings }, each a list of sentences.
export function checkRoom(room, { marks = null, fns = null } = {}) {
  const errors = [], warnings = [];
  data(room, errors, warnings);
  sharpness(room, marks, errors, warnings);
  cover(room, marks, errors);
  openings(room, marks, errors);
  pieces(room, fns, errors);
  spacing(room, errors);
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}
