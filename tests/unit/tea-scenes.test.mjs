// The tea room's scene data (src/lib/tea-scene.js and its checks, src/lib/tea-scene-check.js): every rule a
// failing scene breaks and a passing one keeps (shape, sharpness at the named windows, the phone's rest density,
// cover, openings, shadows, rest values), the compact form for the page, and every mark a scene names on the built
// page. The picks in any order and with any chapter hidden: tea-scenes-picks.test.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { estimateMarks, markNames } from '../../src/lib/tea-scene-check.js';
import { buildRoom, checkRoom, compileRoom, PICKS, ROOM_BLOCK, roomJson, TeaSceneError } from '../../src/lib/tea-scene.js';
import { chapterLength, itemCount, pageLengths } from '../../src/scripts/tea/room/engine/lengths.js';
import { plan } from '../../src/scripts/tea/room/engine/plan.js';
import { poseScene } from '../../src/scripts/tea/room/engine/pose.js';
import { MARKS } from './fixtures/tea/room.mjs';
import { hero, start, startPiece, tv, tvArt } from './fixtures/tea/scenes.mjs';
import { STUBS } from './fixtures/tea/stubs.mjs';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
globalThis.__PUBLIC_DIR__ = path.join(REPO, 'public/');

const ch = (id, n = 0) => ({ id, dom: id, shelves: n ? [{ id: 'episodes', rows: Array.from({ length: n }, () => ({})) }] : [] });
const page = (id, mod, n = 2) => [[ch('hero'), ch(id, n)], { hero, [id]: mod }];
// The errors of hero + one chapter, the chapter's module changed by edit (a clone of the passing one).
function errorsOf(id, base, edit, { marks = { all: MARKS }, fns, art = { tv: tvArt } } = {}) {
  const mod = structuredClone(base);
  edit(mod);
  const [chapters, modules] = page(id, mod);
  const { room } = compileRoom(chapters, modules, { art });
  return checkRoom(room, { marks, fns }).errors;
}
const has = (errors, re) => assert.ok(errors.some((e) => re.test(e)), `no error matches ${re}:\n${errors.join('\n')}`);

test('the passing fixtures pass every check, with measured and with estimated marks; buildRoom fails the build on any', () => {
  const [chapters, modules] = page('tv', tv);
  const built = buildRoom(chapters, modules, { art: { tv: tvArt } });
  assert.deepEqual(JSON.parse(built.json), built.room);
  const blurred = structuredClone(start);
  blurred.scene.d.flats[2].px = [100, 172];
  assert.throws(() => buildRoom(...page('start', blurred)), (e) => e instanceof TeaSceneError && /lantern is drawn at/.test(e.message));
  const bare = buildRoom([ch('hero'), { ...ch('tv'), shelves: [{ id: 'episodes', rows: [] }] }], { hero, tv }, { art: { tv: tvArt } });
  assert.equal(bare.room.chapters[1].n.d, 0, 'a television with no episodes still checks out');
  for (const [id, mod] of [['start', start], ['tv', tv]]) {
    assert.deepEqual(errorsOf(id, mod, () => {}), []);
    assert.deepEqual(errorsOf(id, mod, () => {}, { marks: null }), []);
  }
  assert.deepEqual(errorsOf('start', start, () => {}, { fns: { start: startPiece } }), []);
});

test('a scene with a broken shape is refused, every problem named', () => {
  const refuse = (edit, re) => {
    const mod = structuredClone(start);
    edit(mod.scene);
    assert.throws(() => compileRoom(...page('start', mod)), (e) => e instanceof TeaSceneError && e.problems.some((p) => re.test(p)), String(re));
  };
  refuse((s) => { delete s.light; }, /light\.colour is missing/);
  refuse((s) => { s.length.p = [2.4]; }, /length\.p is not \[base, per\]/);
  refuse((s) => { s.shadow.flat = 'kettle'; }, /shadow\.flat "kettle" is not a flat/);
  refuse((s) => { s.d.flats[2].box = [0, 0, 0, 10]; }, /flat lantern: box/);
  refuse((s) => { s.d.flats[2] = { ...s.d.flats[2], src: '/x.webp' }; }, /exactly one of src, fill and text/);
  refuse((s) => { s.d.flats[0] = { name: 'room', src: '/x.webp', box: [0, 0, 1600, 900], r: 1 }; }, /a plate needs its px/);
  refuse((s) => { s.d.flats[3].name = 'lantern'; }, /twice: lantern/);
  refuse((s) => { s.d.camera.push({ at: 3, m: 'fit:nothing' }); }, /is not a push, 'through' or 'fit:<slot>'/);
  refuse((s) => { s.d.camera.push({ at: 3, m: 'through' }); }, /'through' needs a flat with a hole box/);
  refuse((s) => { s.d.camera.push({ at: 3, each: 'x', m: 0 }); }, /give at or each/);
  refuse((s) => { s.d.tracks.push({ flat: 'ghost', slide: [] }); }, /names flat "ghost"/);
  refuse((s) => { s.d.tracks[0].slide[0].v = 'left'; }, /v is not a number/);
  refuse((s) => { s.d.slots[0].flat = 'ghost'; }, /slot cup: flat "ghost"/);
  refuse((s) => { s.d.rest.coin.rise = null; }, /rest\.coin\.rise is neither/);
  refuse((s) => { s.p = undefined; }, /start\/main p: the composition is missing/);
  const run = (edit, re) => {
    const mod = structuredClone(tv);
    edit(mod.scenes);
    assert.throws(() => compileRoom(...page('tv', mod)), (e) => e.problems.some((p) => re.test(p)), String(re));
  };
  run((s) => { s.room.d.flats[1].through.to = 'g2'; }, /goes to "g2", and the run's next is "g1"/);
  run((s) => { delete s.g1.d.flats[1].through; }, /must open on the next/);
  run((s) => { s.room.d.camera.pop(); }, /ends its camera on the key m: 'through'/);
  run((s) => { s.room.d.flats[1].through.at = 0.2; }, /must stand further than the flat/);
});

test(`the hero must come first, and the build names ${PICKS}; a door with nothing behind it shows its painted state`, () => {
  assert.throws(() => compileRoom([ch('start'), ch('hero')], { hero, start }), (e) => e.message.includes(PICKS) && /hero must be the first/.test(e.message));
  const { room, warnings } = compileRoom([ch('hero')], { hero });
  assert.match(warnings.join(), /opens on the next chapter, and none comes after it/);
  assert.equal(room.scenes['hero/main'].d.flats.find((f) => f.name === 'lintel').through, undefined);
  assert.deepEqual(checkRoom(room).errors, []);
  const L = plan(room, { w: 1440, h: 900 });
  assert.equal(L.chapters[0].len, 2.4 + 1.0, 'the hero alone is also the last chapter');
});

test('sharpness: no picture above 1.25 CSS px a pixel, at 1920x1080 and at 2560x1440', () => {
  const tiny = errorsOf('start', start, (m) => { m.scene.d.flats[2].px = [100, 172]; });
  has(tiny, /1920x1080.*flat lantern is drawn at/);
  // a table sharp enough for 1920 and not for 2560
  const wide = errorsOf('start', start, (m) => { m.scene.d.flats[3].px = [640, 502]; });
  has(wide, /2560x1440.*flat table is drawn at 1\.4/);
  assert.ok(!wide.some((e) => /1920x1080/.test(e)), wide.join('\n'));
  // a slot whose picture is too small for the camera's last push
  has(errorsOf('start', start, (m) => { m.scene.d.slots[0].px = [[200, 150]]; }), /slot cup draws its 200x150 picture at/);
});

test("the phone: a plate rests at 1.6 of its pixels a CSS px or more, at 430x932", () => {
  has(errorsOf('start', start, (m) => { m.scene.p.flats[2].px = [150, 87]; }), /430x932.*flat lantern rests at 1\.36 pixels a CSS px, under 1\.6/);
});

test("'fit:<slot>' stops where the slot's picture would pass 1.25, and covers the window where it would not", () => {
  const [chapters, modules] = page('tv', tv);
  const { room } = compileRoom(chapters, modules, { art: { tv: tvArt } });
  for (const [w, h, item, full] of [[1920, 1080, 1, true], [2560, 1440, 1, false], [1920, 1080, 2, false]]) {
    const L = plan(room, { w, h }, { marks: MARKS });
    const S = L.scenes['tv/room'];
    const key = S.camera.find((k) => k.item === item);
    const s = S.flats[1].r / (S.flats[1].r - key.v);
    const glass = S.slots[0].rest.w * s;
    if (full) assert.ok(glass >= w - 0.01, `${w}: the glass fills the frame`);
    else assert.ok(Math.abs(glass - 1.25 * tvArt.glass[item - 1][0]) < 0.01, `${w}: stopped at 1.25 (${glass})`);
  }
});

test('cover: a back plate covers the window at every key and every one of 17 window sizes', () => {
  has(errorsOf('start', start, (m) => { m.scene.d.flats[0].box = [200, 0, 1400, 900]; }), /no back plate covers the window/);
  has(errorsOf('start', start, (m) => { m.scene.d.tracks.push({ flat: 'room', slide: [{ at: 'sheet-2', v: 0 }, { at: 'sheet-3', v: 0.3 }] }); }),
    /no back plate covers the window/);
});

test('openings: the near third, the aim inside the hole, the scene behind covering the hole, a clear handover', () => {
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.flats[1].r = 0.5; }), /outside the near third/);
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.aim = [300, 507]; }), /the aim is not inside the hole of face/);
  has(errorsOf('tv', tv, (m) => { m.scenes.g1.d.flats[1].through.at = 0.31; }), /the scene behind set does not cover its hole/);
  has(errorsOf('tv', tv, (m) => { Object.assign(m.scenes.g1.d.flats[1], { r: 0.35 }); m.scenes.g1.d.flats[1].through.hole = [160, 120, 40, 30]; }),
    /back plate garden has grown 1\.5\d times/);
  // the hero's panels left standing in the doorway at the handover
  const mod = structuredClone(hero);
  mod.scene.d.tracks = mod.scene.d.tracks.filter((t) => t.flat !== 'panel-l');
  const { room } = compileRoom([ch('hero'), ch('start', 3)], { hero: mod, start });
  has(checkRoom(room, { marks: { all: MARKS } }).errors, /1440x900.*flat panel-l is still in the frame at the handover/);
});

test('a set piece drives only what its scene gives a rest value', () => {
  const stray = { start: (u, n, t) => ({ ...startPiece(u, n, t), lamp: { glow: 1 } }) };
  has(errorsOf('start', start, () => {}, { fns: stray }), /drives lamp, which has no rest value/);
  const prop = { start: () => ({ coin: { rise: 1, spin: 2 } }) };
  has(errorsOf('start', start, () => {}, { fns: prop }), /drives coin\.spin/);
});

test('the compact form survives JSON whole, and refuses what JSON would lose', () => {
  const [chapters, modules] = page('tv', tv);
  const { room } = compileRoom(chapters, modules, { art: { tv: tvArt } });
  const json = roomJson(room);
  assert.deepEqual(JSON.parse(json), room);
  assert.doesNotMatch(json, /\n/);
  assert.equal(room.chapters[1].run.join(), 'tv/room,tv/g1,tv/g2');
  assert.equal(room.scenes['hero/main'].d.flats.find((f) => f.through).through.to, 'tv/room');
  assert.throws(() => roomJson({ ...room, night: Infinity }), TeaSceneError);
  assert.throws(() => roomJson({ ...room, x: undefined }), TeaSceneError);
});

test('lengths: base + per x n, known before layout; the chapter after the hero and the last one', () => {
  const shelves = [{ id: 'play', rows: [1, 2, 3, 4] }, { id: 'watch', rows: [1, 2, 3, 4] }, { id: 'download', rows: [1, 2, 3] },
    { id: 'read', rows: [1, 2, 3] }, { id: 'stopped', rows: [] }];
  assert.equal(itemCount(shelves, { pair: ['download', 'read', 'stopped'] }), 12);
  assert.equal(itemCount(shelves, {}), 14);
  assert.equal(itemCount([{ id: 'episodes', rows: [1, 2, 3, 4, 5] }, { id: 'machines', rows: [1, 2] }], { shelves: ['episodes'] }), 5);
  assert.ok(Math.abs(chapterLength([1.8, 0.8], 12) - 11.4) < 1e-9);
  assert.equal(chapterLength([2.4, 0.7], 3, { afterHero: true }), 2.4 + 2.1 - 0.2);
  assert.equal(chapterLength([1.8, 0], 0, { afterHero: true, last: true }), 1.8 - 0.2 + 1.0);
  const { chapters, total } = pageLengths([{ id: 'hero', len: { d: [2.4, 0] }, n: { d: 0 } }, { id: 'a', len: { d: [2.4, 0.7] }, n: { d: 3 } },
    { id: 'b', len: { d: [1.8, 1] }, n: { d: 4 } }], 'd');
  assert.deepEqual(chapters.map((c) => [c.top, c.len].map((x) => Math.round(x * 100) / 100)), [[0, 2.4], [2.4, 4.3], [6.7, 6.8]]);
  assert.equal(Math.round(total * 100) / 100, 13.5);
});

test('a chapter too short for its screens to open on it and shut after it is refused', () => {
  const short = structuredClone(STUBS.now);
  short.scene.length = { d: [0.9, 0], p: [1.8, 0] };
  const chapters = [ch('hero'), ch('start'), ch('now'), ch('about')];
  // the scene data's own rule refuses it first (finding 10: a base is never under 1.8)...
  assert.throws(() => compileRoom(chapters, { hero, start: STUBS.start, now: short, about: STUBS.about }),
    (e) => e instanceof TeaSceneError && e.problems.some((p) => /now: length\.d starts at 0\.9 vh, under 1\.8/.test(p)));
  // ...and the spacing check still holds for a compiled room whose length came out short
  const { room } = compileRoom(chapters, { hero, start: STUBS.start, now: STUBS.now, about: STUBS.about });
  room.chapters[2].len.d = [0.9, 0];
  assert.deepEqual(checkRoom(room).errors, ['now d: 0.90 vh is too short for the screens to open on it and shut after it']);
});

test('two neighbours with one phone layout are named in a warning', () => {
  const twin = structuredClone(STUBS.film);
  twin.scene.p.layout = 'sheets';
  const { warnings } = compileRoom([ch('hero'), ch('start'), ch('film')], { hero, start: STUBS.start, film: twin });
  assert.match(warnings.join(), /start and film are neighbours with the same phone layout "sheets"/);
});

// Every mark the page's scenes name that its own chapter's section does not carry, as "<chapter>: <mark>".
function marksMissing(html) {
  const block = new RegExp(`<script[^>]*id="${ROOM_BLOCK}"[^>]*>([\\s\\S]*?)</script>`).exec(html);
  if (!block) return [`the page carries no #${ROOM_BLOCK}`];
  const room = JSON.parse(block[1]);
  const sections = html.split(/(?=<section[^>]*data-room-chapter=")/);
  return room.chapters.flatMap((c) => {
    const own = sections.find((s) => new RegExp(`^<section[^>]*data-room-chapter="${c.id}"`).test(s)) ?? '';
    const named = new Set(['d', 'p'].flatMap((comp) => markNames(room, c, comp, c.n[comp])));
    return [...named].filter((m) => !own.includes(`data-room-mark="${m}"`)).map((m) => `${c.id}: ${m}`);
  });
}

test('the marks check finds a mark missing from its chapter, and one that is in another chapter', () => {
  const { room } = compileRoom(...page('start', start, 3));
  const sheets = (ids) => ids.map((m) => `<p data-room-mark="${m}"></p>`).join('');
  const html = (a, b) => `<script type="application/json" id="${ROOM_BLOCK}">${roomJson(room)}</script>` +
    `<section data-room-chapter="hero"></section><section data-room-chapter="start">${a}</section>${b}`;
  assert.deepEqual(marksMissing(html(sheets(['sheet-1', 'sheet-2', 'sheet-3']), '')), []);
  assert.deepEqual(marksMissing(html(sheets(['sheet-1', 'sheet-3']), '<section data-room-chapter="x">' + sheets(['sheet-2']))), ['start: sheet-2']);
  assert.deepEqual(marksMissing('<html></html>'), [`the page carries no #${ROOM_BLOCK}`]);
  assert.deepEqual(Object.keys(estimateMarks(room, 'd').start), ['sheet-1', 'sheet-2', 'sheet-3']);
});

test('every mark a scene names is on the built page, in its own chapter', (t) => {
  const file = path.join(REPO, 'dist/tea-next/index.html');
  if (!fs.existsSync(file)) return t.skip('no dist/tea-next/index.html yet: npm run build makes it once the page exists');
  assert.deepEqual(marksMissing(fs.readFileSync(file, 'utf8')), []);
});

// ---------------------------------------------------------------- what the adversarial review of the engine found
// (each of these was green before its fix, and is named by the review's finding number)

test('finding 1: a box-hole handover that does not cover the frame is refused, whatever moved the hole', () => {
  // (a) a numeric key authored before the through key, placed after it once the marks fall
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.camera.splice(3, 0, { at: 4.6, m: 0.05 }); }), /tv\/room.*(handover|last key)/);
  // (b) the set lifted at the handover
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.tracks.push({ flat: 'face', lift: [{ at: 'fall-1', off: -0.6, v: 0 }, { at: 'fall-1', v: 0.3 }] }); }),
    /tv\/room.*handover/);
  // (c) the set half faded at the handover
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.tracks.push({ flat: 'face', opacity: [{ at: 'fall-1', off: -0.5, v: 1 }, { at: 'fall-1', v: 0.5 }] }); }),
    /tv\/room.*handover/);
  // (d) the wipe still running at the handover
  has(errorsOf('tv', tv, (m) => { m.scenes.room.d.tracks[0].wipe[1] = { at: 'fall-1', off: 0.5, v: 1 }; }), /tv\/room.*handover/);
  // and the marks of the television falling so that twenty + 0.4 lands after fall-1
  const marks = { all: { ...MARKS, tv: { ...MARKS.tv, twenty: 4.2 } } };
  has(errorsOf('tv', tv, () => {}, { marks }), /tv\/room.*(handover|last key)/);
});

test('finding 2: cover is checked between keys and just after a step, and a step at the first key steps', () => {
  const mod = structuredClone(hero);
  const at = (u) => u;
  mod.scene.d.tracks = mod.scene.d.tracks.filter((t) => t.flat !== 'near' && t.flat !== 'wide');
  mod.scene.d.tracks.push({ flat: 'near', opacity: [{ at: at(0.88), v: 0 }, { at: at(1.28), v: 1 }, { at: 1.65, v: 1 }, { at: 1.65, v: 0 }] },
    { flat: 'wide', opacity: [{ at: at(1.08), v: 1 }, { at: at(1.08), v: 0 }] });
  const { room } = compileRoom([ch('hero'), ch('start', 3)], { hero: mod, start });
  has(checkRoom(room, { marks: { all: MARKS } }).errors, /hero\/main.*no back plate covers the window/);
  // a cross-fade whose keys are all covered, with the night ground showing between them
  const fade = structuredClone(hero);
  fade.scene.d.tracks = fade.scene.d.tracks.filter((t) => t.flat !== 'near' && t.flat !== 'wide');
  fade.scene.d.tracks.push({ flat: 'near', opacity: [{ at: 0.8, v: 0 }, { at: 1.2, v: 1 }, { at: 1.65, v: 1 }, { at: 1.65, v: 0 }] },
    { flat: 'wide', opacity: [{ at: 0.8, v: 1 }, { at: 1.2, v: 0 }] });
  const faded = compileRoom([ch('hero'), ch('start', 3)], { hero: fade, start }).room;
  has(checkRoom(faded, { marks: { all: MARKS } }).errors, /hero\/main.*no back plate covers the window/);
});

test('finding 4: a scene of a run left with no part, or a through key whose mark is missing, is refused', () => {
  const marks = { all: { ...MARKS, tv: Object.fromEntries(Object.entries(MARKS.tv).filter(([k]) => k !== 'fall-2')) } };
  has(errorsOf('tv', tv, () => {}, { marks }), /tv\/g1.*(no part|through)/);
});

test('finding 5: a back plate may grow 1.5 times at most in every scene but a chain', () => {
  has(errorsOf('start', start, (m) => { m.scene.d.camera = [{ at: 0, m: 0 }, { at: 'sheet-3', m: 0.36 }]; m.scene.d.flats[3].r = 0.5; m.scene.d.flats[2].r = 0.7; m.scene.d.flats[1].r = 0.8; }),
    /start\/main.*back plate room has grown/);
});

test('finding 6: a scene that an opening shows needs its still for d and for p', () => {
  const mod = structuredClone(tv);
  delete mod.scenes.g2.still;
  assert.throws(() => compileRoom(...page('tv', mod)), (e) => e instanceof TeaSceneError && e.problems.some((p) => /tv\/g2.*still/.test(p)));
});

test('finding 7: an open door clips its port to the door frame, so the scene behind never paints over the walls', () => {
  for (const at of [1.3, 2, 4]) {
    const mod = structuredClone(hero);
    mod.scene.d.flats[3].through.at = at;
    mod.scene.p.flats[3].through.at = at;
    const { room } = compileRoom([ch('hero'), ch('start', 3)], { hero: mod, start });
    for (const [w, h] of [[1440, 900], [390, 844], [2560, 1440]]) {
      const L = plan(room, { w, h }, { marks: MARKS });
      const S = L.scenes['hero/main'];
      const comp = L.comp;
      const box = comp === 'd' ? [462.5, 260.2, 675, 380] : [260.2, 462.5, 380, 675];
      for (let u = 0; u < S.part.to; u += 0.02) {
        const pose = poseScene(S, u, [0, 0], L, 1);
        const p = pose.ports[0];
        if (!p.shown) continue;
        assert.ok(p.clip, `${at} ${w}x${h} ${u}: an open door has a clip`);
        const s = 1 / (1 - pose.m);
        const door = { x: S.fit.ax + (S.fit.ox + box[0] * S.fit.c - S.fit.ax) * s, y: S.fit.ay + (S.fit.oy + box[1] * S.fit.c - S.fit.ay) * s,
          w: box[2] * S.fit.c * s, h: box[3] * S.fit.c * s };
        for (const k of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(p.clip[k] - door[k]) < 0.01, `${at} ${w}x${h} ${u.toFixed(2)} clip.${k}: ${p.clip[k]} vs ${door[k]}`);
      }
    }
  }
});

test('finding 10: a fit slot needs its picture size, a piece is sampled over the chapter and the clock, a formula is 1.8 or more', () => {
  has(errorsOf('tv', tv, () => {}, { art: {} }), /slot glass.*fit.*picture size/);
  const ghost = { start: (u, n, t) => ({ ...startPiece(u, n, t), ...(u > 1.0 && u < 1.1 ? { ghost: { a: 1 } } : {}) }) };
  has(errorsOf('start', start, () => {}, { fns: ghost }), /drives ghost/);
  const late = { start: (u, n, t) => ({ ...startPiece(u, n, t), ...(t > 20 ? { ghost2: { a: 1 } } : {}) }) };
  has(errorsOf('start', start, () => {}, { fns: late }), /drives ghost2/);
  assert.throws(() => compileRoom(...page('start', { scene: { ...structuredClone(start.scene), length: { d: [1.0, 0], p: [2.4, 0.9] } } })),
    (e) => e instanceof TeaSceneError && e.problems.some((p) => /length\.d.*1\.8/.test(p)));
  // a back plate that covers the board with no spare is named in a warning
  const mod = structuredClone(start);
  mod.scene.d.flats[0].box = [0, 0, 1600, 900];
  const { room } = compileRoom(...page('start', mod));
  assert.ok(checkRoom(room, { marks: { all: MARKS } }).warnings.some((w) => /start\/main.*room.*spare/.test(w)));
});

test('finding 12: a slot says how its picture is fitted, and is judged by the scale it is really drawn at', () => {
  // the cup (4:3) holds a very wide 16:3 picture: fitted whole it is sharp, fitted to cover it is not
  const wide = (fit) => errorsOf('start', start, (m) => { Object.assign(m.scene.d.slots[0], { px: [[640, 120]], fit }); });
  assert.deepEqual(wide('contain'), []);
  has(wide('cover'), /slot cup draws its 640x120 picture at 1\.\d+ CSS px a pixel \(cover\), above 1\.25/);
  // a 'fit:<slot>' push stops where the picture, fitted as the slot says, reaches 1.25
  for (const mode of ['contain', 'cover']) {
    const mod = structuredClone(tv);
    mod.scenes.room.d.slots[0].fit = mode;
    const { room } = compileRoom(...page('tv', mod), { art: { tv: tvArt } });
    const L = plan(room, { w: 2560, h: 1440 }, { marks: MARKS });
    const S = L.scenes['tv/room'];
    const key = S.camera.find((k) => k.item === 1);
    const s = S.flats[1].r / (S.flats[1].r - key.v);
    const r = S.slots[0].rest;
    const drawn = mode === 'cover' ? Math.max((r.w * s) / 1600, (r.h * s) / 900) : Math.min((r.w * s) / 1600, (r.h * s) / 900);
    assert.ok(Math.abs(drawn - 1.25) < 1e-6, `${mode}: ${drawn}`);
  }
  assert.throws(() => compileRoom(...page('tv', (() => { const m = structuredClone(tv); m.scenes.room.d.slots[0].fit = 'stretch'; return m; })())),
    (e) => e instanceof TeaSceneError && e.problems.some((p) => /slot glass: fit/.test(p)));
});
