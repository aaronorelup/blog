// The page must survive the picks (2.10): the resolver over changed picks (as saved, the other thirteen reversed,
// each hidden in turn, one item a shelf, every shelf at its maximum), compiled with the stub fixtures and with the
// real chapters' own scene.js and art.js, so a chapter whose builder has replaced its stub is held to it too.
// Moved out of tea-scenes.test.mjs whole, to keep each file under 400 lines.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { isLive } from '../../src/data/exempt.js';
import { checkRoom, compileRoom } from '../../src/lib/tea-scene.js';
import { chapterLength } from '../../src/scripts/tea/room/engine/lengths.js';
import { plan } from '../../src/scripts/tea/room/engine/plan.js';
import { STUBS } from './fixtures/tea/stubs.mjs';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
globalThis.__PUBLIC_DIR__ = path.join(REPO, 'public/');
const { resolveChapters } = await import('../../src/lib/tea-chapters.js');

// The real site, as tests/unit/tea-picks.test.mjs reads it.
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');
const names = (dir, ext) => fs.readdirSync(path.join(REPO, dir)).filter((f) => f.endsWith(ext)).sort().map((f) => f.slice(0, -ext.length));
const site = {
  // the live notebook is rewritten by other sessions at any time: a moment it can't be read never fails this file
  posts: names('src/content/posts', '.md').flatMap((id) => {
    try {
      return [{ id, data: collections.posts.schema.parse(matter(read(`src/content/posts/${id}.md`)).data) }];
    } catch (error) {
      if (isLive(id)) return [];
      throw error;
    }
  }),
  notes: new Map(),
  cards: names('src/content/projects', '.yaml').map((key) => {
    const p = matter.engines.yaml.parse(read(`src/content/projects/${key}.yaml`));
    return { key, section: p.section, main: p.main && { href: p.main.href, external: /^https?:/.test(p.main.href) }, posts: (p.posts ?? []).map((slug) => ({ slug })) };
  }),
  hasMachine: (name) => fs.existsSync(path.join(REPO, 'public/labs/teardown', name)),
  warn: () => {},
};
const shipped = JSON.parse(read('src/data/tea-picks.json'));

// The picks the page must survive: as saved, the other thirteen reversed, each hidden in turn, one item a shelf.
function variants() {
  const others = shipped.order.filter((id) => id !== 'hero');
  const one = { ...shipped, shelves: Object.fromEntries(Object.entries(shipped.shelves).map(([k, s]) => [k, { ...s, count: 1, picks: s.picks.slice(0, 1) }])) };
  return [['as saved', shipped], ['reversed', { ...shipped, order: ['hero', ...others.reverse()] }], ['one item a shelf', one],
    ...others.map((id) => [`${id} hidden`, { ...shipped, hidden: { [id]: true } }])];
}

test('the page survives the picks: any order, any chapter hidden, one item; the door opens on whichever is second', () => {
  for (const [name, doc] of variants()) {
    const chapters = resolveChapters(doc, TEA_CHAPTERS, site);
    const { room } = compileRoom(chapters, STUBS);
    assert.deepEqual(room.chapters.map((c) => c.id), chapters.map((c) => c.id), name);
    assert.equal(room.scenes['hero/main'].d.flats.find((f) => f.through).through.to, `${chapters[1].id}/main`, name);
    for (const comp of ['d', 'p']) {
      const L = plan(room, comp === 'd' ? { w: 1440, h: 900 } : { w: 390, h: 844 });
      L.chapters.forEach((c, i) => {
        const want = chapterLength(room.chapters[i].len[comp], room.chapters[i].n[comp], { afterHero: i === 1, last: i === L.chapters.length - 1 });
        assert.equal(c.len, want, `${name} ${c.id} ${comp}`);
      });
    }
    assert.deepEqual(checkRoom(room).errors, [], name);
  }
});

test('every chapter with its shelf at the maximum still checks out', () => {
  const max = structuredClone(shipped);
  for (const c of TEA_CHAPTERS) {
    for (const s of c.shelves) {
      const key = `${c.id}/${s.id}`;
      if (s.auto) max.shelves[key] = { auto: true, count: s.max, picks: [] };
    }
  }
  const chapters = resolveChapters(max, TEA_CHAPTERS, site);
  const { room } = compileRoom(chapters, STUBS);
  assert.deepEqual(checkRoom(room).errors, []);
  const tvc = room.chapters.find((c) => c.id === 'tv');
  assert.equal(tvc.n.d, chapters.find((c) => c.id === 'tv').shelves.find((s) => s.id === 'episodes').rows.length);
});


// the real chapters' scene data and the art their slots hold, as the page imports them
const REAL = {}, ART = {};
for (const c of TEA_CHAPTERS) {
  REAL[c.id] = await import(`../../src/data/tea/${c.id}/scene.js`);
  ART[c.id] = (await import(`../../src/data/tea/${c.id}/art.js`)).slots ?? {};
}

test("the real chapters' scenes survive the picks too: any order, any chapter hidden, one item, the door on whichever is second", () => {
  for (const [name, doc] of variants()) {
    const chapters = resolveChapters(doc, TEA_CHAPTERS, site);
    const { room } = compileRoom(chapters, REAL, { art: ART });
    assert.deepEqual(room.chapters.map((c) => c.id), chapters.map((c) => c.id), name);
    const door = room.scenes[room.chapters[0].run[0]].d.flats.find((f) => f.through);
    if (door) assert.equal(door.through.to, room.chapters[1].run[0], name);
    assert.deepEqual(checkRoom(room).errors, [], name);
  }
});
