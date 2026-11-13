// The tea room's tools (scripts/tools/tea/): their pure parts. The calibrated floors of differ.mjs and sweep.mjs on
// the frames of looks A and B they were measured on are in tea-calibration.test.mjs.
import assert from 'node:assert/strict';
import test from 'node:test';
import { numbers, placeOf, sizeOf, withQuery, pageKind } from '../../scripts/tools/tea/lib.mjs';
import { plan, tiles, srcsetOf } from '../../scripts/tools/tea/plates.mjs';
import { classify, tally } from '../../scripts/tools/tea/frames.mjs';
import { reelPlaces } from '../../scripts/tools/tea/reel.mjs';
import { compareGrids, verdict, gridOf } from '../../scripts/tools/tea/differ.mjs';
import { summary } from '../../scripts/tools/tea/fps.mjs';
import { BUTTONS, builtButtons, buttonsOf, lengthTable } from '../../scripts/tools/tea/length.mjs';
import { meterStats, placePx } from '../../src/scripts/tea/room/engine/meter.js';
import { loadRepo } from '../../scripts/check/repo.mjs';
import { roomChapters } from '../../scripts/check/tea-art.mjs';
import { ROOT } from '../../scripts/tools/tea/lib.mjs';

test('lib: sizes, number lists and ranges, addresses', () => {
  assert.deepEqual(sizeOf('1440x900'), { width: 1440, height: 900 });
  assert.deepEqual(sizeOf('phone'), { width: 390, height: 844 });
  assert.throws(() => sizeOf('big'));
  assert.deepEqual(numbers('0:1:0.25'), [0, 0.25, 0.5, 0.75, 1]);
  assert.deepEqual(numbers('0.1,0.5'), [0.1, 0.5]);
  assert.throws(() => numbers('a,b'));
  assert.equal(withQuery('/labs/tea-room/engine/', { still: 1, words: 0, book: false }), '/labs/tea-room/engine/?still=1&words=0');
  assert.equal(withQuery('/labs/tea-room/engine/?meter=1', { y: '0.5' }), '/labs/tea-room/engine/?meter=1&y=0.5');
  assert.equal(pageKind('/labs/tea-room/b/?y=1'), 'look-b');
  assert.equal(pageKind('/labs/tea-room/engine/'), 'room');
});

test('lib: a place is a share, a chapter\'s opening, a point into it, or its end', () => {
  const M = { vh: 100, max: 1000, sections: [{ id: 'hero', dom: 'top', top: 0, height: 300 }, { id: 'start', dom: 'start', top: 300, height: 400 }, { id: 'tv', dom: 'evening-television', top: 700, height: 400 }] };
  assert.equal(placeOf('0.37', M), 0.37);
  assert.equal(placeOf('start', M), 0.3); // entered through the door: its anchor is at its top
  assert.ok(Math.abs(placeOf('tv', M) - (700 + 52) / 1000) < 1e-9); // 0.5 vh and a hair in
  assert.equal(placeOf('tv+1.5', M), 0.85);
  assert.equal(placeOf('evening-television:end', M), 1);
  assert.throws(() => placeOf('nowhere', M), /no chapter/);
});

test('plates: two widths, never enlarged; a phone copy at 3x a 430 px phone; tiles past 4096 px', () => {
  const p = plan({ w: 2752, h: 1536 });
  assert.deepEqual(p.files.map((f) => [f.suffix, f.width]), [['', 2064], ['-l', 2752]]);
  assert.equal(srcsetOf('/tea/scenes/start/room', p.files), '/tea/scenes/start/room.webp 2064w, /tea/scenes/start/room-l.webp 2752w');
  assert.equal(plan({ w: 1000, h: 500 }, { small: 1600 }).files[0].width, 1000);
  assert.deepEqual(plan({ w: 1920, h: 1080 }, { kind: 'picture' }).files.map((f) => [f.suffix, f.width, f.height]), [['-p', 1290, 726]]);
  assert.equal(plan({ w: 960, h: 540 }, { kind: 'picture' }).files[0].width, 960);
  assert.deepEqual(plan({ w: 1536, h: 2752 }, { phone: true }).files.map((f) => f.suffix), ['-p']);
  assert.deepEqual(tiles(4096, 2000), []);
  const t = tiles(9000, 1000);
  assert.equal(t.length, 3);
  assert.ok(t.every((x) => x.width <= 4096));
  assert.equal(t.reduce((n, x) => n + x.width, 0), 9000);
  assert.equal(tiles(1000, 5000)[1].top, 2500);
});

test('frames --weigh: a response by kind and chapter, and the sums', () => {
  assert.deepEqual(classify('http://x/tea/scenes/tv/room.webp', 'image/webp'), { chapter: 'tv', kind: 'image', text: false });
  assert.equal(classify('http://x/media/tea/film/loop.mp4', 'video/mp4').kind, 'media');
  assert.equal(classify('http://x/_astro/a.css', 'text/css').text, true);
  assert.equal(classify('http://x/labs/tea-room/engine/', 'text/html').kind, 'html');
  assert.equal(classify('http://x/fonts/k.woff2', 'font/woff2').kind, 'font');
  const t = tally([{ bytes: 10, kind: 'image', chapter: 'tv', phase: 'scroll' }, { bytes: 5, kind: 'css', chapter: 'shared', phase: 'first paint' }]);
  assert.deepEqual(t, { total: 15, phase: { 'first paint': 5, scroll: 10 }, kind: { css: 5, image: 10 }, chapter: { shared: 5, tv: 10 } });
});

test('reel: every 0.25 vh from a section\'s top to its end, both ends kept', () => {
  const M = { vh: 100, max: 2000 };
  const r = reelPlaces({ top: 500, height: 260 }, M, 0.25);
  assert.deepEqual(r.map((p) => p.vh), [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.6]);
  assert.equal(r[0].y, 0.25);
  assert.equal(r.at(-1).y, 0.38);
  assert.equal(r.at(-1).n, 12);
  assert.equal(reelPlaces({ top: 1900, height: 300 }, M).at(-1).y, 1); // never past the page's end
});

test('differ: cells and mean colour on a grid; a step asks for cells, two chapters for both', () => {
  assert.deepEqual(gridOf(1440, 900), [16, 9]);
  assert.deepEqual(gridOf(390, 844), [9, 16]);
  const a = new Uint8Array(16 * 9 * 3).fill(40);
  const b = Uint8Array.from(a);
  for (let c = 0; c < 72; c++) b[c * 3] = 200; // half the cells move a long way in red
  const r = compareGrids(a, b, 16, 9, { cell: 24 });
  assert.equal(r.cells, 0.5);
  assert.ok(Math.abs(r.mean - 80) < 1e-9);
  assert.equal(compareGrids(a, a, 16, 9).cells, 0);
  assert.equal(verdict({ cells: 0.1, mean: 50 }, 'step', { cells: 0.25, mean: 8 }).ok, false);
  assert.equal(verdict({ cells: 0.6, mean: 2 }, 'step', { cells: 0.25, mean: 8 }).ok, true);
  assert.equal(verdict({ cells: 0.6, mean: 2 }, 'chapter', { cells: 0.25, mean: 8 }).ok, false);
});

test('the meter: frames in each whole second, the median, the worst, the longest frame', () => {
  const stamps = [];
  for (let t = 0; t < 1000; t += 20) stamps.push(t); // 50 in the first second
  for (let t = 1000; t < 2000; t += 40) stamps.push(t); // 25 in the second
  for (let t = 2000; t < 3000; t += 25) stamps.push(t); // 40 in the third
  stamps.push(3010); // a partial fourth second, left out
  const s = meterStats(stamps);
  assert.deepEqual(s.seconds, [50, 25, 40]);
  assert.equal(s.median, 40);
  assert.equal(s.worst, 25);
  assert.equal(s.longest, 40);
  assert.deepEqual(meterStats([]), { seconds: [], median: 0, worst: 0, longest: 0, frames: 0 });
  const page = { max: 1000, vh: 100, sections: [{ id: 'tv', top: 200, height: 400 }] };
  assert.equal(placePx('0.5', false, page), 500);
  assert.equal(placePx('tv', false, page), 200);
  assert.equal(placePx('tv', true, page), 500);
  assert.equal(placePx(null, true, page), 1000);
  assert.equal(placePx('nowhere', false, page), null);
});

test('fps: the median of three, the ratio to look B, the worst second', () => {
  const s = summary([{ median: 40, worst: 20 }, { median: 44, worst: 30 }, { median: 42, worst: 25 }], [{ median: 50, worst: 22 }, { median: 48, worst: 21 }, { median: 52, worst: 30 }]);
  assert.deepEqual(s, { room: 42, look: 50, ratio: 0.84, worstRoom: 20, worstLook: 21 });
});

test('length: the page\'s length is the tea-art note\'s, and the buttons follow the rule', () => {
  const chapters = roomChapters(loadRepo(ROOT));
  assert.ok(chapters?.length);
  const t = lengthTable(chapters);
  assert.equal(t.rows.length, chapters.length);
  assert.ok(Math.abs(t.total.d - t.rows.reduce((n, r) => n + r.d, 0)) < 1e-9);
  assert.equal(t.total.buttons, t.rows.reduce((n, r) => n + r.buttons, 0));
  const onPage = ['hero', 'start', 'tv', 'games', 'projects'];
  assert.equal(BUTTONS.tv([{ id: 'machines', keys: ['dray'] }]), 1);
  assert.equal(BUTTONS.tv([{ id: 'machines', keys: [] }]), 0);
  assert.equal(buttonsOf('games', [{ id: 'leads', keys: ['storm-bell-fighter', 'modding-megabonk'] }], onPage, {}), 1);
  assert.equal(buttonsOf('games', [{ id: 'leads', keys: ['storm-bell-fighter'] }], ['hero', 'projects'], {}), 0);
  assert.equal(buttonsOf('projects', [{ id: 'play', keys: ['a', 'b'] }, { id: 'watch', keys: ['c'] }, { id: 'read', keys: ['d'] }], onPage, {}), 3);
  assert.equal(buttonsOf('film', [], onPage, { buttons: () => 7 }), 7); // a chapter's own count wins
  assert.deepEqual(builtButtons('<section data-room-chapter="tv" x><button class="room-button a">x</button></section><section data-room-chapter="film"></section>'), { tv: 1, film: 0 });
});
