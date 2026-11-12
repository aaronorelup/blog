// The tea room's scene data at build time (pure): each chapter's src/data/tea/<id>/scene.js read, checked for its
// shape, its openings joined up for the picks as saved, and compiled into the one compact JSON block the page's
// engine reads. lib/tea-scene-check.js then checks what can be checked from the data (sharpness, cover, openings,
// rest values) with the engine's own projection; buildRoom() does both and fails the build on any error.
//
// A chapter module exports `scene` (one scene) or `scenes` (by name) and `run` (their order). The chapter's own
// fields are read from its first scene: light { colour, name }, shadow { src, flat } (the flat of the first scene
// whose place the shadow on the screens takes), still { d, p }, length { d: [base, per], p: [base, per] } and
// count (which shelves make n: { shelves, pair }, or { d, p } of those). Each scene has a composition d and p:
// { aim, layout (p), flats, slots, camera, tracks, rest } in board units (src/scripts/tea/room/engine/project.js).
import { itemCount } from '../scripts/tea/room/engine/lengths.js';

export const ROOM_VERSION = 1;
export const NIGHT = '#101220'; // the night ground: tokens' --night-page
export const PICKS = 'src/data/tea-picks.json';
// The id of the <script type="application/json"> that carries roomJson() in the page.
export const ROOM_BLOCK = 'tea-room-scenes';
const COMPS = ['d', 'p'];
const PROPS = ['slide', 'lift', 'opacity', 'wipe'];

export class TeaSceneError extends Error {
  constructor(problems) {
    super(`the tea room's scenes do not check out:\n  ${problems.join('\n  ')}`);
    this.problems = problems;
  }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const box4 = (b) => Array.isArray(b) && b.length === 4 && b.every(num) && b[2] > 0 && b[3] > 0;
const size2 = (s) => Array.isArray(s) && s.length === 2 && s.every((x) => Number.isInteger(x) && x > 0);
const place = (at) => num(at) || (typeof at === 'string' && at.length > 0);

// A chapter module as a run: [{ name, scene }].
export function runOf(mod) {
  if (mod?.scene) return [{ name: 'main', scene: mod.scene }];
  if (isObj(mod?.scenes) && Array.isArray(mod.run)) return mod.run.map((name) => ({ name, scene: mod.scenes[name] }));
  return [];
}

// Every shape problem of one chapter's scenes, each naming where it is.
export function shapeProblems(id, mod) {
  const out = [];
  const run = runOf(mod);
  if (!run.length) return [`${id}: its scene.js exports neither scene nor scenes and run`];
  const first = run[0].scene ?? {};
  if (typeof first.light?.colour !== 'string') out.push(`${id}: light.colour is missing`);
  for (const c of COMPS) {
    const l = first.length?.[c];
    if (!(Array.isArray(l) && l.length === 2 && l.every(num) && l[0] > 0 && l[1] >= 0)) out.push(`${id}: length.${c} is not [base, per]`);
  }
  if (first.shadow !== undefined && first.shadow !== null) {
    if (typeof first.shadow.src !== 'string') out.push(`${id}: shadow.src is not a path`);
    for (const c of COMPS) {
      if (!first[c]?.flats?.some((f) => f.name === first.shadow.flat)) out.push(`${id}: shadow.flat "${first.shadow.flat}" is not a flat of its first scene's ${c}`);
    }
  }
  const names = run.map((s) => s.name);
  run.forEach(({ name, scene }, j) => {
    const at = `${id}/${name}`;
    if (!isObj(scene)) return out.push(`${at}: the run names a scene that does not exist`);
    for (const c of COMPS) out.push(...compProblems(`${at} ${c}`, scene[c], { names, j, last: j === run.length - 1 }));
  });
  return out;
}

function compProblems(at, sc, { names, j, last }) {
  if (!isObj(sc)) return [`${at}: the composition is missing`];
  const out = [];
  const say = (m) => out.push(`${at}: ${m}`);
  if (!(Array.isArray(sc.aim) && sc.aim.length === 2 && sc.aim.every(num))) say('aim is not [x, y]');
  if (!Array.isArray(sc.flats) || !sc.flats.length) return [...out, `${at}: it has no flats`];
  const flats = new Set();
  for (const f of sc.flats) {
    if (typeof f.name !== 'string' || flats.has(f.name)) say(`a flat's name is missing or twice: ${f.name}`);
    flats.add(f.name);
    if (!box4(f.box)) say(`flat ${f.name}: box is not [x, y, w, h]`);
    if (!(num(f.r) && f.r > 0)) say(`flat ${f.name}: r is not a distance above 0`);
    if ([f.src, f.fill, f.text].filter(Boolean).length !== 1) say(`flat ${f.name}: give exactly one of src, fill and text`);
    if (f.px !== undefined && !size2(f.px)) say(`flat ${f.name}: px is not [width, height] in pixels`);
    if (f.src && f.px === undefined) say(`flat ${f.name}: a plate needs its px`);
    if (f.through) {
      const t = f.through;
      if (typeof t.to !== 'string') say(`flat ${f.name}: through.to is missing`);
      if (!(t.hole === 'open' || box4(t.hole))) say(`flat ${f.name}: through.hole is neither a box nor 'open'`);
      if (!(num(t.at) && t.at > f.r)) say(`flat ${f.name}: through.at must stand further than the flat (above r ${f.r})`);
      const want = last ? 'next' : names[j + 1];
      if (t.to !== want) say(`flat ${f.name}: its opening goes to "${t.to}", and the run's next is "${want}"`);
    }
  }
  if (sc.marks !== undefined && !(Array.isArray(sc.marks) && sc.marks.every((m) => typeof m === 'string' && m))) say('marks is not a list of mark names');
  const holes = sc.flats.filter((f) => f.through);
  if (holes.length > 1) say('a scene has one opening at most');
  if (!last && !holes.length) say('a scene that is not the last of its run must open on the next');
  const slots = new Set();
  for (const s of sc.slots ?? []) {
    if (typeof s.name !== 'string' || slots.has(s.name)) say(`a slot's name is missing or twice: ${s.name}`);
    slots.add(s.name);
    if (!flats.has(s.flat)) say(`slot ${s.name}: flat "${s.flat}" does not exist`);
    if (!box4(s.box)) say(`slot ${s.name}: box is not [x, y, w, h]`);
    if (!(Array.isArray(s.show) && s.show.length === 2 && s.show.every(place))) say(`slot ${s.name}: show is not [from, to]`);
  }
  const key = (k, what) => {
    if (!isObj(k) || (k.each === undefined) === (k.at === undefined)) return say(`${what}: give at or each`);
    if (k.at !== undefined && !place(k.at)) say(`${what}: at is neither vh nor a mark`);
    if (k.each !== undefined && !(typeof k.each === 'string' && k.each)) say(`${what}: each is not a mark's stem`);
    if (k.off !== undefined && !num(k.off)) say(`${what}: off is not vh`);
  };
  const camera = sc.camera ?? [];
  camera.forEach((k, i) => {
    key(k, `camera key ${i}`);
    const ok = (num(k.m) && k.m >= 0) || k.m === 'through' || (typeof k.m === 'string' && k.m.startsWith('fit:') && slots.has(k.m.slice(4)));
    if (!ok) say(`camera key ${i}: m ${JSON.stringify(k.m)} is not a push, 'through' or 'fit:<slot>'`);
    if (k.m === 'through' && !holes.some((f) => Array.isArray(f.through.hole))) say(`camera key ${i}: 'through' needs a flat with a hole box`);
  });
  if (holes.some((f) => Array.isArray(f.through.hole)) && camera[camera.length - 1]?.m !== 'through') {
    say("a scene with a hole ends its camera on the key m: 'through'");
  }
  for (const t of sc.tracks ?? []) {
    if (!flats.has(t.flat)) say(`a track names flat "${t.flat}", which does not exist`);
    const props = PROPS.filter((p) => t[p] !== undefined);
    if (!props.length) say(`the track of ${t.flat} has none of ${PROPS.join(', ')}`);
    for (const p of props) {
      if (!Array.isArray(t[p])) { say(`the ${p} track of ${t.flat} is not a list of keys`); continue; }
      t[p].forEach((k, i) => { key(k, `the ${p} track of ${t.flat}, key ${i}`); if (!num(k.v)) say(`the ${p} track of ${t.flat}, key ${i}: v is not a number`); });
    }
  }
  if (sc.rest !== undefined) {
    if (!isObj(sc.rest)) say('rest is not an object of elements');
    else for (const [el, props] of Object.entries(sc.rest)) {
      if (!isObj(props)) { say(`rest.${el} is not an object of values`); continue; }
      for (const [p, v] of Object.entries(props)) if (!num(v) && typeof v !== 'string') say(`rest.${el}.${p} is neither a number nor a string`);
    }
  }
  return out;
}

const slotPx = (s, art) => {
  const px = art?.[s.name] ?? s.px ?? [];
  return size2(px) ? [px] : px.filter(size2);
};

// The room as the page reads it. chapters: teaChapters() (the visible chapters in page order, with their shelves'
// rows). modules: { [chapter id]: its scene.js }. art: { [chapter id]: { [slot]: [[w, h], ...] } }, the pixel
// sizes of the pictures each slot may hold, in item order. Throws a TeaSceneError naming every problem. Returns
// { room, warnings }.
export function compileRoom(chapters, modules, { art = {}, night = NIGHT } = {}) {
  if (chapters[0]?.id !== 'hero') {
    throw new TeaSceneError([`${PICKS}: the hero must be the first chapter, and the first is "${chapters[0]?.id}"`]);
  }
  const problems = chapters.flatMap((c) => shapeProblems(c.id, modules[c.id]));
  if (problems.length) throw new TeaSceneError(problems);
  const warnings = [];
  const room = { v: ROOM_VERSION, night, chapters: [], scenes: {} };
  chapters.forEach((c, i) => {
    const run = runOf(modules[c.id]);
    const first = run[0].scene;
    const keyOf = (name) => `${c.id}/${name}`;
    const nextKey = chapters[i + 1] ? `${chapters[i + 1].id}/${runOf(modules[chapters[i + 1].id])[0].name}` : null;
    const rules = first.count?.d || first.count?.p ? first.count : { d: first.count, p: first.count };
    room.chapters.push({
      id: c.id, dom: c.dom, light: first.light.colour, layout: first.p.layout ?? null,
      shadow: first.shadow ? { src: first.shadow.src, flat: first.shadow.flat } : null,
      len: { d: [...first.length.d], p: [...first.length.p] },
      n: { d: itemCount(c.shelves ?? [], rules.d ?? {}), p: itemCount(c.shelves ?? [], rules.p ?? {}) },
      run: run.map((s) => keyOf(s.name)),
      rest: Object.fromEntries(COMPS.map((k) => [k, Object.assign({}, ...run.map((s) => s.scene[k].rest ?? {}))])),
    });
    for (const { name, scene } of run) {
      const out = { key: keyOf(name), chapter: c.id, name, still: scene.still ? { d: scene.still.d ?? null, p: scene.still.p ?? null } : null };
      for (const k of COMPS) {
        const sc = scene[k];
        const flats = sc.flats.map((f) => {
          const g = { name: f.name, box: [...f.box], r: f.r };
          for (const p of ['src', 'fill', 'text', 'front']) if (f[p]) g[p] = f[p];
          if (f.px) g.px = [...f.px];
          if (!f.through) return g;
          const to = f.through.to === 'next' ? nextKey : keyOf(f.through.to);
          if (!to) {
            warnings.push(`${out.key} ${k}: flat ${f.name} opens on the next chapter, and none comes after it, so it shows its painted state`);
            return g;
          }
          return { ...g, through: { to, hole: Array.isArray(f.through.hole) ? [...f.through.hole] : 'open', at: f.through.at } };
        });
        out[k] = {
          aim: [...sc.aim], flats,
          slots: (sc.slots ?? []).map((s) => ({ name: s.name, flat: s.flat, box: [...s.box], show: [...s.show], px: slotPx(s, art[c.id]) })),
          camera: (sc.camera ?? []).map((key) => ({ ...key })),
          tracks: (sc.tracks ?? []).map((t) => Object.fromEntries(Object.entries(t).map(([p, v]) => [p, Array.isArray(v) ? v.map((x) => ({ ...x })) : v]))),
        };
        if (sc.ambient) out[k].ambient = [...sc.ambient];
        if (sc.marks) out[k].marks = [...sc.marks];
      }
      room.scenes[out.key] = out;
    }
  });
  room.chapters.forEach((c, i) => {
    const next = room.chapters[i + 1];
    if (next && c.layout && c.layout === next.layout) warnings.push(`${c.id} and ${next.id} are neighbours with the same phone layout "${c.layout}"`);
  });
  return { room, warnings };
}

// The compact JSON block for the page. Refuses a value JSON would not carry (Infinity, NaN, undefined, a function).
export function roomJson(room) {
  return JSON.stringify(room, (k, v) => {
    if (typeof v === 'number' && !Number.isFinite(v)) throw new TeaSceneError([`${k} is ${v}, which JSON cannot carry`]);
    if (typeof v === 'function' || v === undefined) throw new TeaSceneError([`${k} is not data`]);
    return v;
  });
}
