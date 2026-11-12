// The tea room's engine (src/scripts/tea/room/engine/): frame() is a pure function of scroll, time, pointer and
// layout, and gives a value to everything the engine writes on every frame. Proved on fixture scenes of plain
// coloured flats (tests/unit/fixtures/tea/): the hero's chain and open door, a screens change with a shadow,
// three scenes one inside the next, and a chapter with twelve items, at six window sizes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { clockOf, pointerOf, STILL_T } from '../../src/scripts/tea/room/engine/clock.js';
import { frame, OFF, near, sceneAt } from '../../src/scripts/tea/room/engine/frame.js';
import { holds, windowRect } from '../../src/scripts/tea/room/engine/project.js';
import { CLOSE, closeAt, shutAt } from '../../src/scripts/tea/room/engine/screens.js';
import { stateOf } from '../../src/scripts/tea/room/engine/state.js';
import { ease, easeEnds, placeKeys, valueAt } from '../../src/scripts/tea/room/engine/tracks.js';
import { CHAPTERS, fixtureLayout, leaves, seeded, VIEWS } from './fixtures/tea/room.mjs';
import { startPiece } from './fixtures/tea/scenes.mjs';

const ENGINE = new URL('../../src/scripts/tea/room/engine/', import.meta.url);
const PURE = ['frame.js', 'tracks.js', 'project.js', 'screens.js', 'pose.js', 'plan.js', 'lengths.js', 'state.js', 'clock.js'];
const L0 = fixtureLayout([1440, 900], { pieces: { start: startPiece } });

// 1,000 positions over the whole page and beyond it: fractional, out of range, repeated, a few not numbers.
function positions(L, seed = 7) {
  const r = seeded(seed);
  const out = [];
  for (let i = 0; i < 1000; i++) {
    const k = r();
    if (i % 97 === 0) out.push([NaN, Infinity, -Infinity][i % 3]);
    else if (k < 0.08) out.push(-r() * L.total);
    else if (k < 0.16) out.push(L.total * (1 + r()));
    else if (k < 0.24 && out.length) out.push(out[Math.floor(r() * out.length)]);
    else out.push(r() * L.total);
  }
  return out;
}
const at = (L, y, t = STILL_T, ptr = [0, 0]) => frame(y, t, ptr, L);

test('the pure modules hold no state and read no clock, no random and no page', async () => {
  for (const file of PURE) {
    const src = fs.readFileSync(fileURLToPath(new URL(file, ENGINE)), 'utf8');
    const code = src.replace(/\/\/.*$/gm, '');
    for (const bad of [/\bDate\b/, /Math\.random/, /\bdocument\b/, /\bwindow\b/, /\bglobalThis\b/, /\bperformance\b/,
      /requestAnimationFrame/, /localStorage|sessionStorage/, /\bfetch\(/]) assert.doesNotMatch(code, bad, `${file}: ${bad}`);
    assert.doesNotMatch(code, /^(?:export\s+)?(?:let|var)\s/m, `${file}: a module-level let or var`);
    assert.doesNotMatch(code, /^(?:export\s+)?const\s+\w+\s*=\s*new\s/m, `${file}: a module-level object made with new`);
    for (const [, from] of code.matchAll(/from\s+'([^']+)'/g)) assert.match(from, /^\.\/[a-z]+\.js$/, `${file} imports ${from}`);
    for (const [name, v] of Object.entries(await import(new URL(file, ENGINE)))) {
      if (v && typeof v === 'object') assert.ok(Object.isFrozen(v), `${file}: ${name} is an object anyone could change`);
    }
  }
});

test('the same inputs give the same frame, in any order of 1,000 positions, and frame() writes to nothing', () => {
  for (const [view, lean] of [[[1440, 900], 0], [[390, 844], 0], [[1920, 1080], 1]]) {
    const L = fixtureLayout(view, { pieces: { start: startPiece }, lean }); // frozen: a write would throw
    const ys = positions(L);
    const r = seeded(11);
    const input = ys.map((y) => [y, r() * 100, [r() * 2 - 1, r() * 2 - 1]]);
    const run = (order) => {
      const got = new Map();
      for (const i of order) got.set(i, JSON.stringify(frame(input[i][0], input[i][1], input[i][2], L)));
      return input.map((_, i) => got.get(i));
    };
    const idx = input.map((_, i) => i);
    const up = run([...idx].sort((a, b) => (input[a][0] || 0) - (input[b][0] || 0)));
    const down = run([...idx].sort((a, b) => (input[b][0] || 0) - (input[a][0] || 0)));
    const shuffled = [...idx];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    assert.deepEqual(down, up);
    assert.deepEqual(run(shuffled), up);
    for (const i of [0, 5, 500]) assert.deepEqual(frame(...input[i], L), frame(...input[i], L));
  }
});

test('every frame: one scene on, the same keys, every slot and every piece element valued, nothing NaN or missing', () => {
  for (const view of VIEWS) {
    const L = fixtureLayout(view, { pieces: { start: startPiece } });
    const keys = Object.keys(at(L, 0)).sort();
    for (const y of positions(L, view[0])) {
      const f = at(L, y);
      assert.deepEqual(Object.keys(f).sort(), keys);
      assert.equal(f.groups.length, L.sceneKeys.length);
      assert.deepEqual(f.groups.filter((g) => !g.hidden).map((g) => g.key), [f.on]);
      assert.equal(f.flats.length, L.scenes[f.on].flats.length);
      assert.equal(f.slots.length, L.slots.length);
      L.slots.forEach((k, i) => { if (k.scene !== f.on) assert.deepEqual(f.slots[i], OFF, k.key); });
      assert.deepEqual(f.pieces.map((p) => p.id), L.chapters.map((c) => c.id));
      const yy = Number.isNaN(y) ? 0 : Math.max(-1e12, Math.min(1e12, y));
      L.chapters.forEach((c, i) => {
        assert.deepEqual(Object.keys(f.pieces[i].values), Object.keys(c.rest));
        if (!near(c, yy, L) || !c.piece) assert.deepEqual(f.pieces[i].values, c.rest, `${c.id} at ${y}`);
      });
      for (const [path, v] of leaves(f)) {
        assert.notEqual(v, undefined, path);
        if (typeof v === 'number') assert.ok(Number.isFinite(v), `${path} is ${v} at y ${y}`);
      }
    }
  }
});

test('small pages hold every rule too: a television with no episodes, the hero alone, the hero and one chapter', () => {
  const tvBare = CHAPTERS.map((c) => (c.id === 'tv' ? { ...c, shelves: [{ id: 'episodes', rows: [] }] } : c));
  for (const chapters of [tvBare, CHAPTERS.slice(0, 1), CHAPTERS.slice(0, 2)]) {
    for (const view of VIEWS) {
      const L = fixtureLayout(view, { chapters });
      for (const y of positions(L, 3).slice(0, 300)) {
        const f = at(L, y);
        assert.deepEqual(f.groups.filter((g) => !g.hidden).map((g) => g.key), [f.on]);
        for (const [path, v] of leaves(f)) if (typeof v === 'number') assert.ok(Number.isFinite(v), `${path} at ${y}`);
      }
      const last = L.chapters[L.chapters.length - 1];
      assert.equal(at(L, last.top + (last.len - 1) * L.vh).screens.shut, 1, 'the house closes whichever chapter is last');
    }
  }
  const one = fixtureLayout([1440, 900], { chapters: CHAPTERS.slice(0, 2) });
  assert.equal(one.chapters[1].len, 2.4 + 0.7 * 3 - 0.2 + 1.0, 'after the hero and last at once');
});

test('a set piece is asked within a screen of its section, and its values lie over its rest values', () => {
  const L = L0;
  const c = L.chapters.find((x) => x.id === 'start');
  const f = at(L, c.top + 2 * L.vh, 3);
  assert.deepEqual(f.pieces[1].values, { coin: { rise: 1, turn: 90 }, clock: { label: '19:40' } });
  assert.deepEqual(at(L, c.top - 0.9 * L.vh).pieces[1].values.coin, { rise: 0, turn: (STILL_T * 30) % 360 });
  assert.deepEqual(at(L, c.top - 2.1 * L.vh).pieces[1].values, c.rest);
  const odd = { start: () => { throw new Error('a piece that breaks'); }, tv: () => ({ clock: { minute: NaN }, extra: { x: 1 } }) };
  const L2 = fixtureLayout([1440, 900], { pieces: odd });
  assert.deepEqual(at(L2, c.top + L2.vh).pieces[1].values, L2.chapters[1].rest);
  const tv = L2.chapters[2];
  assert.deepEqual(at(L2, tv.top + L2.vh).pieces[2].values, { clock: { minute: 0 } });
});

test('a slot is on only in its scene, inside its show, after the scene\'s first frame, and rides its flat', () => {
  const L = L0;
  const tv = L.chapters[2];
  const glass = L.slots.findIndex((s) => s.key === 'tv/room/glass');
  const y = (u) => tv.top + u * L.vh;
  assert.deepEqual(at(L, y(1.1)).slots[glass], OFF);
  assert.deepEqual(at(L, y(3.4)).slots[glass], OFF);
  const f = at(L, y(1.6));
  assert.equal(f.slots[glass].on, true);
  const face = f.flats.find((x) => x.name === 'face');
  const S = L.scenes['tv/room'];
  // the slot's box is the hole's box on the face: it stands where the face puts it, at the face's scale
  assert.ok(Math.abs(f.slots[glass].w - S.slots[0].rest.w * face.k) < 1e-6);
  assert.ok(Math.abs(f.slots[glass].x - (face.x + (S.slots[0].rest.x - S.flats[1].rest.x) * face.k)) < 1e-6);
  const film = L.chapters[3];
  const machine = L.slots.findIndex((s) => s.key === 'tv/g2/machine');
  assert.equal(at(L, y(5.41)).slots[machine].on, true);
  const cloth = L.slots.findIndex((s) => s.key === 'film/main/film');
  assert.deepEqual(at(L, film.top).slots[cloth], OFF);
  assert.equal(at(L, film.top + 5 * L.vh).slots[cloth].on, true);
});

// The three handovers of the fixture page: the hero's door (open), the room's glass and the first garden's set.
function handovers(L) {
  return L.sceneKeys.flatMap((key) => L.scenes[key].ports.map((p) => ({ S: L.scenes[key], to: p.to })));
}

test('at every handover the frame on both sides is the same picture, at six window sizes, with the lean on too', () => {
  for (const [view, lean, ptr] of [...VIEWS.map((v) => [v, 0, [0, 0]]), ...VIEWS.map((v) => [v, 1, [1, -1]])]) {
    const L = fixtureLayout(view, { lean });
    const hs = handovers(L);
    assert.equal(hs.length, 3);
    const win = windowRect(L.vw, L.vh);
    for (const { S, to } of hs) {
      const yh = L.chapters[S.chapter].top + S.part.to * L.vh;
      const before = at(L, yh - 0.01, STILL_T, ptr), after = at(L, yh, STILL_T, ptr);
      assert.equal(before.on, S.key);
      assert.equal(after.on, to);
      const port = before.ports[0];
      assert.equal(port.shown, true, `${S.key} ${view}`);
      assert.equal(port.o, 1);
      assert.equal(port.wipe, 1);
      if (port.clip) assert.ok(holds(port.clip, win, 0.01), `${S.key}: the hole covers the window`);
      const fi = S.flats.findIndex((f) => f.through);
      before.flats.forEach((f, i) => {
        const inFront = i > fi ? S.flats[i].front === S.flats[fi].front || S.flats[i].front : S.flats[i].front && !S.flats[fi].front;
        if (inFront || (i === fi && !port.clip)) assert.equal(f.shown, false, `${S.key}: ${f.name} still in the frame`);
      });
      before.slots.forEach((s) => assert.deepEqual(s, OFF));
      after.slots.forEach((s) => assert.deepEqual(s, OFF, 'no slot is on at a scene\'s first frame'));
      const near = (a, b, what) => assert.ok(Math.abs(a - b) < 0.01, `${S.key} ${view} ${what}: ${a} vs ${b}`);
      port.inner.flats.forEach((g, i) => {
        const h = after.flats[i];
        assert.equal(g.name, h.name);
        assert.equal(g.shown, h.shown);
        near(port.x + port.k * g.x, h.x, `${g.name}.x`); near(port.y + port.k * g.y, h.y, `${g.name}.y`);
        near(port.k * g.w, h.w, `${g.name}.w`); near(port.k * g.h, h.h, `${g.name}.h`);
      });
      port.inner.ports.forEach((q, i) => {
        const r = after.ports[i];
        near(port.k * q.k, r.k, 'inner k');
        near(port.x + port.k * q.x, r.x, 'inner x'); near(port.y + port.k * q.y, r.y, 'inner y');
        if (q.clip) for (const p of ['x', 'y']) near(port[p] + port.k * q.clip[p], r.clip[p], `clip ${p}`);
        // the still two deep stands where the scene behind's own back plate does
        const back = r.inner.flats.find((g) => L.scenes[r.to].flats.find((x) => x.name === g.name).r >= 1);
        if (q.still) near(port.x + port.k * (q.x + q.k * q.still.x), r.x + r.k * back.x, 'still x');
      });
    }
  }
});

test('the screens: in from -0.5 to -0.1 vh at an even pace, shut to +0.1, out by +0.5, none at the door', () => {
  assert.equal(shutAt(-0.5), 0);
  assert.equal(shutAt(-0.1), 1);
  assert.equal(shutAt(0), 1);
  assert.equal(shutAt(0.1), 1);
  assert.equal(shutAt(0.5), 0);
  const d = [-0.38, -0.3, -0.22].map(shutAt);
  assert.ok(Math.abs((d[1] - d[0]) - (d[2] - d[1])) < 1e-9, 'an even pace in the middle');
  assert.ok(shutAt(-0.48) < 0.01 && shutAt(-0.45) > 0, 'eased at the ends, and moving');
  for (const view of VIEWS) {
    const L = fixtureLayout(view);
    L.chapters.forEach((c, i) => {
      if (i === 0) return;
      const shut = at(L, c.top).screens.shut;
      if (i === 1) assert.equal(shut, 0, 'the door after the hero is no screens change');
      else assert.equal(shut, 1, `shut at the boundary before ${c.id}`);
      if (i > 1) {
        assert.equal(at(L, c.top - TAIL_LEAVES * L.vh).screens.shut, 0, 'the tail: the last paper has left before the screens move');
        assert.ok(1 - at(L, c.top + 0.2 * L.vh).screens.shut >= 0.15, 'the head: open by a sixth when the first paper rises');
      }
    });
  }
});
const TAIL_LEAVES = 0.6;

test('the house closes after the last chapter: dark, no shadow, shut before the footer rises, for good', () => {
  for (const view of VIEWS) {
    const L = fixtureLayout(view);
    const last = L.chapters[L.chapters.length - 1];
    const end = last.top + last.len * L.vh;
    assert.equal(at(L, end + CLOSE[0] * L.vh).screens.shut, 0);
    assert.equal(at(L, end + CLOSE[1] * L.vh).screens.shut, 1);
    for (const u of [-1, -0.5, 0, 0.7, 3]) {
      const s = at(L, end + u * L.vh).screens;
      assert.equal(s.shut, 1);
      assert.equal(s.field, L.night);
      assert.equal(s.shadow, null);
    }
    assert.ok(closeAt(-1.3) > 0 && closeAt(-1.3) < 1);
  }
});

test("the screens show the coming chapter's light and shadow, where its object stands, and change them only while open", () => {
  for (const view of VIEWS) {
    for (const chapters of [CHAPTERS, CHAPTERS.filter((c) => c.id !== 'start')]) {
      const L = fixtureLayout(view, { chapters });
      L.chapters.forEach((c, i) => {
        if (i < 1 || (i === 1 && L.chapters[0].hero)) return;
        const f = at(L, c.top);
        assert.equal(f.screens.field, c.light);
        const named = { start: 'lantern', tv: 'face', film: 'cloth' }[c.id];
        const obj = f.flats.find((x) => x.name === named);
        for (const p of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(f.screens.shadow[p] - obj[p]) < 1e-9, `${c.id} ${view} ${p}`);
        const s = at(L, c.top - 0.3 * L.vh).screens;
        assert.ok(Math.abs(s.shadow.lx - (s.shadow.x - s.left)) < 1e-9 && Math.abs(s.shadow.rx - (s.shadow.x - (L.vw - s.width) - s.right)) < 1e-9);
      });
      // Where the coming chapter changes, find the exact place: the screens are open there, on both sides.
      let prev = -L.vh;
      for (let y = -L.vh; y < L.total + 2 * L.vh; y += L.vh / 50) {
        if (at(L, y).screens.into !== at(L, prev).screens.into) {
          let [a, b] = [prev, y];
          while (b - a > 1e-6) { const m = (a + b) / 2; if (at(L, m).screens.into === at(L, a).screens.into) a = m; else b = m; }
          assert.equal(at(L, b).screens.shut, 0, `switched while shut at ${b}`);
          assert.ok(at(L, a).screens.shut < 1e-6, `switched while shut just before ${b}`);
        }
        prev = y;
      }
    }
  }
});

test('tracks hold their first value before their keys and their last after, and keys at one place step', () => {
  const keys = [{ u: 1, v: 0 }, { u: 2, v: 10 }, { u: 2, v: 20 }, { u: 3, v: 30 }];
  assert.equal(valueAt(keys, -100), 0);
  assert.equal(valueAt(keys, 1e9), 30);
  assert.equal(valueAt(keys, 1.5), 5);
  assert.equal(valueAt(keys, 2), 20);
  assert.equal(valueAt([], 1, 7), 7);
  assert.equal(ease(0.5), 0.5);
  assert.equal(easeEnds(0.5), 0.5);
  const placed = placeKeys([{ at: 'b', v: 1 }, { at: 'a', v: 2 }, { at: 'gone', v: 3 }, { each: 'x', v: 4 }], { a: 1, b: 2, 'x-1': 0.5, 'x-2': 3 }, 2);
  assert.deepEqual(placed.map((k) => [k.u, k.key.v, k.item]), [[0.5, 4, 1], [1, 2, 0], [2, 1, 0], [3, 4, 2]]);
  const L = L0;
  const hero = L.scenes['hero/main'];
  const wide = (u) => at(L, u * L.vh).flats.find((f) => f.name === 'wide');
  assert.equal(wide(-3).o, 1);
  assert.equal(wide(2.39).o, 0);
  assert.equal(at(L, -5 * L.vh).flats[0].k, 1, 'the camera holds its first push above the page');
  assert.equal(sceneAt(-5 * L.vh, L).key, hero.key);
});

test('twelve items: twelve camera keys and a slot over the whole run of them', () => {
  const L = L0;
  const film = L.chapters[3];
  assert.equal(film.n, 12);
  assert.equal(film.len, 1.8 + 12 + 1);
  assert.equal(L.scenes['film/main'].camera.length, 13);
  const s = L.slots.find((x) => x.key === 'film/main/film');
  assert.deepEqual(s.show, [1.2, 12.2]);
});

test('the lean is 0 as built; at 1 it moves near flats at most 8 px and never a back plate', () => {
  const L = L0;
  const L1 = fixtureLayout([1440, 900], { pieces: { start: startPiece }, lean: 1 });
  const y = L.chapters[1].top + 1.5 * L.vh;
  assert.deepEqual(at(L, y, 1, [1, -1]), at(L, y, 1, [0, 0]));
  const a = at(L1, y, 1, [1, 1]), b = at(L1, y, 1, [0, 0]);
  a.flats.forEach((f, i) => {
    const dx = f.x - b.flats[i].x;
    if (L1.scenes[a.on].flats[i].r >= 1) assert.equal(dx, 0);
    else assert.ok(dx > 0 && dx <= 8);
  });
});

test('the clock and the pointer as the engine takes them, and the state as the page reports it', () => {
  assert.equal(clockOf({ now: 5000 }), 5);
  assert.equal(clockOf({ now: 5000, still: true }), STILL_T);
  assert.equal(clockOf({ now: 5000, reduced: true }), STILL_T);
  assert.deepEqual(pointerOf({ x: 300, y: 0, vw: 400, vh: 300, moved: true }), [0.5, -1]);
  assert.deepEqual(pointerOf({ x: 300, y: 0, vw: 400, vh: 300, moved: true, touch: true }), [0, 0]);
  assert.deepEqual(pointerOf({ x: 300, y: 0, vw: 400, vh: 300 }), [0, 0]);
  const s = stateOf(at(L0, 1234.5678));
  assert.equal(s.ambient, undefined);
  assert.deepEqual(stateOf(s), s);
  for (const [, v] of leaves(s)) if (typeof v === 'number') assert.equal(Math.round(v * 100) / 100, v);
});
