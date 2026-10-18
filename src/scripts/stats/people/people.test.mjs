// node --test src/scripts/stats/people/
// The pure parts of chapter 03: the hand-written geography, the projection and the map layout.
// Nothing imports this file, so it never reaches the bundle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CENTROIDS, CONTINENT_LABELS, LAND, landPoints, continentOf } from './geo.js';
import { project, fitBox, aspect } from './equal-earth.js';
import { pickMapUnit, sunflower, sunflowerRadius, relax, layoutMap, dotsFor } from './map.js';

test('geo: about 240 codes, each with a sane place and a known continent', () => {
  const codes = Object.keys(CENTROIDS);
  assert.ok(codes.length >= 235 && codes.length <= 255, `got ${codes.length}`);
  for (const [code, [lat, lon, cont]] of Object.entries(CENTROIDS)) {
    assert.match(code, /^[A-Z]{2}$/);
    assert.ok(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180, code);
    assert.ok(['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN'].includes(cont), code);
  }
  assert.equal(continentOf('DE'), 'EU');
  assert.equal(continentOf('XX'), null);
  assert.equal(continentOf('T1'), null);
  for (const k of Object.keys(CONTINENT_LABELS)) assert.ok(['NA', 'SA', 'EU', 'AF', 'AS', 'OC'].includes(k));
});

test('geo: the land mask and the country points agree (every mainland country sits on land)', () => {
  const pts = landPoints();
  assert.ok(pts.length > 1500 && pts.length < 2600, `${pts.length} land dots`);
  // Small islands may fall between 3-degree cells; anything bigger must be within one cell of land.
  const islands = new Set(['AG', 'AI', 'AS', 'AW', 'BB', 'BL', 'BM', 'BQ', 'BS', 'CC', 'CK', 'CV', 'CW', 'CX', 'DM', 'FJ', 'FK',
    'FM', 'FO', 'GD', 'GP', 'GU', 'IO', 'KI', 'KM', 'KN', 'KY', 'LC', 'MF', 'MH', 'MP', 'MQ', 'MS', 'MT', 'MU', 'MV', 'NF', 'NR',
    'NU', 'PF', 'PM', 'PN', 'PR', 'PW', 'RE', 'SB', 'SC', 'SH', 'ST', 'SX', 'TC', 'TK', 'TO', 'TT', 'TV', 'UM', 'VC', 'VG', 'VI',
    'VU', 'WF', 'WS', 'YT', 'BV', 'GS', 'HM', 'TF', 'AQ', 'SJ', 'GG', 'JE', 'IM', 'AX', 'GI', 'MC', 'VA', 'SM', 'AD', 'LI', 'BH',
    'SG', 'HK', 'MO', 'NC', 'CY', 'LK', 'JM', 'HT', 'DO', 'CU', 'IS', 'TW', 'BN', 'TL', 'QA']);
  const near = (lat, lon) => pts.some(([a, b]) => Math.abs(a - lat) <= 3.01 && Math.abs(((b - lon + 540) % 360) - 180) <= 3.01);
  const missing = Object.entries(CENTROIDS).filter(([c, [lat, lon]]) => !islands.has(c) && !near(lat, lon)).map(([c]) => c);
  assert.deepEqual(missing, []);
  assert.ok(LAND.every(([lat]) => lat % 3 === 0));
});

test('equal earth: known extents, and a fit that keeps the aspect', () => {
  const [x, y] = project(0, 180);
  assert.ok(Math.abs(x - 2.7066) < 0.001, `x ${x}`);
  assert.equal(y, 0);
  assert.ok(Math.abs(project(90, 0)[1] - 1.3173) < 0.001);
  assert.ok(project(45, 10)[0] > 0 && project(-45, -10)[1] < 0);
  const box = fitBox(600, 300, { latMin: -56, latMax: 78 });
  assert.ok(Math.abs(box.right - box.left - 600) < 1e-6, 'fills the width');
  const [, top] = box.project(78, 0), [, bot] = box.project(-56, 0);
  assert.ok(top >= -1e-6 && bot <= 300 + 1e-6 && top < bot);
  assert.ok(aspect() > 0.4 && aspect() < 0.45);
});

test('map: the unit is the smallest on the ladder that fits both limits', () => {
  assert.equal(pickMapUnit([3, 2, 1], { cap: 420, pitch: 5, maxR: 48 }), 1);
  // the fixture's people: the United States alone is about 1,100 pages
  const people = [1104, 83, 70, 68, 44, 43, 42, 30, 30, 29, 27, 23, 19, 19, 18, 17, 17, 17];
  const u = pickMapUnit(people, { cap: 420, pitch: 5, maxR: 48 - 1.8 });
  assert.equal(u, 5);
  const total = people.reduce((s, v) => s + dotsFor(v, u), 0);
  assert.ok(total <= 420);
  assert.ok(sunflowerRadius(dotsFor(1104, u), 5) <= 48);
  // a phone: fewer, bigger units
  assert.ok(pickMapUnit(people, { cap: 260, pitch: 4, maxR: 28 }) >= 10);
  // past the ladder it still answers
  assert.ok(pickMapUnit([5e7], { cap: 10, pitch: 5, maxR: 10 }) >= 5000);
});

test('map: sunflower dots never sit on top of each other', () => {
  const pts = sunflower(220, 5);
  assert.ok(Math.hypot(...pts[0]) < 5 * 0.4);
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    min = Math.min(min, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]));
  }
  assert.ok(min > 5 * 0.36 * 2, `closest pair ${min}`); // dots of radius 0.36p never touch
});

test('map: relaxation separates overlapping clusters and keeps them on the map', () => {
  const cs = [
    { x: 100, y: 100, ax: 100, ay: 100, r: 20 },
    { x: 105, y: 102, ax: 105, ay: 102, r: 12 },
    { x: 98, y: 110, ax: 98, ay: 110, r: 6 },
    { x: 2, y: 2, ax: 2, ay: 2, r: 5 },
  ];
  relax(cs, { bounds: { left: 0, top: 0, right: 300, bottom: 200 } });
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const d = Math.hypot(cs[i].x - cs[j].x, cs[i].y - cs[j].y);
    assert.ok(d >= cs[i].r + cs[j].r - 0.5, `${i}-${j} overlap by ${cs[i].r + cs[j].r - d}`);
  }
  assert.ok(cs[3].x >= 5 && cs[3].y >= 5, 'clamped inside');
  // the big one moved least
  const moved = cs.map((c) => Math.hypot(c.x - c.ax, c.y - c.ay));
  assert.ok(moved[0] < moved[1]);
});

test('map: a fixture-sized layout has no overlaps, labels that clear every cluster of dots, and the top three named', () => {
  const rows = Object.entries({
    US: 1104, DE: 83, GB: 70, IN: 68, CA: 44, BR: 43, JP: 42, AU: 30, KR: 30, NL: 29, ES: 27, FR: 23,
    PL: 19, VN: 19, SG: 18, SE: 17, IT: 17, MX: 17, ID: 11, PH: 10, PE: 10, TR: 8, NG: 6, ZA: 4,
    AR: 3, CH: 3, KZ: 3, IE: 2, NZ: 1, UZ: 1, XX: 1,
  }).map(([code, n]) => ({ code, n }));
  // labels as wide as the page's (Karla 600 11 is about 5.9px a character), with the phone's short names
  const NAMES = { US: 'United States', DE: 'Germany', GB: 'United Kingdom', IN: 'India', CA: 'Canada', BR: 'Brazil' };
  const SHORT = { US: 'US', GB: 'UK' };
  for (const [width, phone] of [[700, false], [358, true], [324, true]]) {
    const label = (c, n) => `${(phone && SHORT[c]) || NAMES[c] || c} ${n}`;
    const lay = layoutMap(rows, { width, height: Math.round(width * (phone ? 0.49 : 0.5)), phone, label, measure: (s) => s.length * 5.9 });
    assert.deepEqual(lay.unplaced.map((r) => r.code), ['XX']);
    const cs = lay.clusters;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const d = Math.hypot(cs[i].x - cs[j].x, cs[i].y - cs[j].y);
      assert.ok(d >= cs[i].r + cs[j].r - 1, `${width}: ${cs[i].code}/${cs[j].code}`);
    }
    for (const l of lay.labels) {
      for (const c of cs) {
        if (c.dots === 0) continue; // a crumb may sit under a label's halo; a cluster of dots never
        const nx = Math.max(l.rect.x, Math.min(c.x, l.rect.x + l.rect.w));
        const ny = Math.max(l.rect.y, Math.min(c.y, l.rect.y + l.rect.h));
        assert.ok(Math.hypot(c.x - nx, c.y - ny) >= c.r, `${width}: label ${l.code} touches ${c.code}`);
      }
    }
    for (const code of ['US', 'DE', 'GB']) assert.ok(lay.labels.some((l) => l.code === code), `${width}: no label for ${code}`);
  }
});
