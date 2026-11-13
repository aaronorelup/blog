// The pure half of the tea room's layout: the compiled room (src/lib/tea-scene.js) laid out for one window. Every
// key is placed (marks measured on paper become vh), every named push becomes a number for this window, every
// scene gets its part of its chapter. frame() reads the result and nothing else. layout.js (the impure half)
// measures the marks and the sections and calls plan() again when they change.
import { chapterLength } from './lengths.js';
import { cameraAt } from './pose.js';
import { compOf, fitBoard, fitPush, rectOf, throughPush } from './project.js';
import { keyPlace, placeKeys } from './tracks.js';

const PROPS = ['slide', 'lift', 'opacity', 'wipe'];

// The layout for one window.
// room: the compiled room. view: { w, h } in CSS px (h from a 100lvh element, so the address bar is no resize).
// marks: { [chapter id]: { [mark]: vh into the chapter } }, as measured (missing marks drop the keys that name them).
// lens: optional measured section heights in vh, by chapter index (a section whose paper is taller grew).
// pieces: { [chapter id]: piece(u, n, t, ptr, L) } for the set pieces that have loaded. lean: 0 as built.
export function plan(room, view, { marks = {}, lens = null, pieces = {}, lean = 0 } = {}) {
  // A window not laid out yet can measure 0: it is drawn as 1 px, never as a division by zero.
  const side = (x) => (Number.isFinite(x) && x >= 1 ? x : 1);
  const vw = side(view.w), vh = side(view.h);
  const comp = compOf(vw, vh);
  const count = room.chapters.length;
  const L = { vw, vh, comp, lean, night: room.night, total: 0, chapters: [], scenes: {}, sceneKeys: [], slots: [] };
  let top = 0;
  room.chapters.forEach((c, i) => {
    const hero = c.id === 'hero', afterHero = i === 1 && room.chapters[0].id === 'hero', last = i === count - 1;
    const formula = chapterLength(c.len[comp], c.n[comp], { afterHero, last });
    const measured = lens?.[i];
    const len = Number.isFinite(measured) && measured > formula ? measured : formula;
    L.chapters.push({
      id: c.id, index: i, top: top * vh, len, n: c.n[comp], marks: marks[c.id] ?? {}, hero, afterHero, last,
      light: c.light, layout: c.layout ?? null, parts: [], rest: c.rest?.[comp] ?? {}, piece: pieces[c.id] ?? null,
      shadow: null,
    });
    top += len;
  });
  L.total = top * vh;

  // Every scene laid out, in page order; its part of the chapter follows its camera.
  room.chapters.forEach((c, i) => {
    const ch = L.chapters[i];
    let from = 0;
    c.run.forEach((key, j) => {
      const S = sceneLayout(room.scenes[key], key, i, ch, L);
      const lastKey = S.camera.length ? S.camera[S.camera.length - 1].u : from;
      const to = j === c.run.length - 1 ? ch.len : Math.min(ch.len, Math.max(from, lastKey));
      S.part = { from, to };
      ch.parts.push({ key, from, to });
      L.scenes[key] = S;
      L.sceneKeys.push(key);
      from = to;
    });
  });

  // The handover push of each opening, now that every part is known.
  for (const key of L.sceneKeys) {
    const S = L.scenes[key];
    for (const p of S.ports) p.mh = cameraAt(S, S.part.to);
  }

  // The shadow on the screens before each chapter: which flat of its first scene it stands for. screens.js places
  // it from that flat's own pose on every frame, so shadow and object never part.
  room.chapters.forEach((c, i) => {
    if (!c.shadow) return;
    const S = L.scenes[c.run[0]];
    const fi = S.flats.findIndex((f) => f.name === c.shadow.flat);
    if (fi >= 0) L.chapters[i].shadow = { src: c.shadow.src, key: c.run[0], flat: fi };
  });
  // Frozen whole: frame() and the set pieces it asks can read the layout and never change it. A new measurement
  // makes a new layout.
  return freeze(L);
}

function freeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) freeze(v);
  }
  return o;
}

// One scene for this window: its fit, its flats at rest, its keys placed, its named pushes as numbers.
function sceneLayout(scene, key, index, ch, L) {
  const sc = scene[L.comp];
  const fit = fitBoard(L.vw, L.vh, L.comp, sc.aim);
  const flats = sc.flats.map((f) => ({
    name: f.name, r: f.r, front: Boolean(f.front), px: f.px ?? null, src: f.src ?? null, fill: f.fill ?? null,
    text: Boolean(f.text), through: f.through ?? null, rest: rectOf(f.box, fit),
    hole: f.through && Array.isArray(f.through.hole)
      ? rectOf([f.box[0] + f.through.hole[0], f.box[1] + f.through.hole[1], f.through.hole[2], f.through.hole[3]], fit) : null,
  }));
  const byName = new Map(flats.map((f, i) => [f.name, i]));
  // Two entries for the same flat and property are one track: their keys are placed together.
  const raw = flats.map(() => ({}));
  for (const t of sc.tracks ?? []) {
    const fi = byName.get(t.flat);
    if (fi === undefined) continue;
    for (const prop of PROPS) if (t[prop]) raw[fi][prop] = [...(raw[fi][prop] ?? []), ...t[prop]];
  }
  const tracks = raw.map((r) => Object.fromEntries(PROPS.map((prop) => [prop,
    r[prop] ? placeKeys(r[prop], ch.marks, ch.n).map(({ u, key: k }) => ({ u, v: k.v })) : null])));
  const slots = (sc.slots ?? []).map((s) => ({
    key: `${key}/${s.name}`, chapter: index, scene: key, name: s.name, flat: byName.get(s.flat) ?? -1,
    rest: rectOf(s.box, fit), px: s.px ?? [], fit: s.fit === 'cover' ? 'cover' : 'contain',
    show: [keyPlace(s.show[0], ch.marks) ?? Infinity, keyPlace(s.show[1], ch.marks) ?? Infinity],
  })).filter((s) => s.flat >= 0);
  const S = { key, chapter: index, fit, flats, tracks, slots, ports: [], camera: [], part: null, still: scene.still?.[L.comp] ?? null };
  // A 'fit' key outside an `each` fits the current item's picture: the item of the last `each` key before it.
  let current = 1;
  S.camera = placeKeys(sc.camera, ch.marks, ch.n).map(({ u, key: k, item }) => {
    if (item > 0) current = item;
    return { u, v: pushOf(k.m, item || current, S, L), item, ...(k.m === 'through' && { through: true }) };
  });
  S.ports = flats.map((f, fi) => (f.through ? { flat: fi, to: f.through.to, hole: f.hole, door: f.hole ? null : doorOf(flats, fi), at: f.through.at, mh: 0 } : null))
    .filter(Boolean);
  L.slots.push(...slots);
  return S;
}

// An open door's frame at rest: the box round the flat with the opening and every flat drawn in front of it in
// its layer (the lintel and the panels). The port is clipped to it, grown with the camera but never slid, so the
// scene behind shows only between the panels as they part, and never over the walls beside them.
function doorOf(flats, fi) {
  const mine = flats.filter((g, gi) => gi >= fi && g.front === flats[fi].front).map((g) => g.rest);
  const x = Math.min(...mine.map((r) => r.x)), y = Math.min(...mine.map((r) => r.y));
  return { x, y, w: Math.max(...mine.map((r) => r.x + r.w)) - x, h: Math.max(...mine.map((r) => r.y + r.h)) - y };
}

// A camera key's push as a number for this window. 'through': the push at which the scene's (first) box hole
// covers the window. 'fit:<slot>': as far as the slot's item-th picture allows (the first, with no `each` key).
// A push that cannot be had (an aim outside the hole) stops just short of the flat, and tea-scene.js fails it.
function pushOf(m, item, S, L) {
  if (typeof m === 'number') return m;
  if (m === 'through') {
    const fi = S.flats.findIndex((f) => f.hole);
    if (fi < 0) return 0;
    const f = S.flats[fi];
    const push = throughPush(f.hole, f.r, S.fit, L.vw, L.vh);
    return Number.isFinite(push) ? push : f.r * 0.99;
  }
  if (typeof m === 'string' && m.startsWith('fit:')) {
    const slot = S.slots.find((s) => s.name === m.slice(4));
    if (!slot) return 0;
    const px = slot.px[Math.max(0, Math.min(slot.px.length - 1, item - 1))];
    return fitPush(slot.rest, S.flats[slot.flat].r, px ?? null, slot.fit, S.fit, L.vw, L.vh);
  }
  return 0;
}
