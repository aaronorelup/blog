// src/data/tea/embeds.js holds every playable thing the picks name, so no chapter's builder has to write in it (2.1,
// 2.3): each film of Film's leads, each project of Projects' play and watch shelves and each machine of the
// television's, keyed by the row's own key, with a poster that exists, a kind RoomEmbed can mount and its chapter
// among those that may play it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { EMBEDS, homeOf } from '../../src/data/tea/embeds.js';

const picks = JSON.parse(fs.readFileSync(new URL('../../src/data/tea-picks.json', import.meta.url), 'utf8'));
const rows = (shelf) => (picks.shelves[shelf]?.picks ?? []).map((k) => k.replace(/^[pjm]-/, ''));
const PLAYS = { 'film/leads': 'film', 'projects/play': 'projects', 'projects/watch': 'projects', 'tv/machines': 'tv' };

test('every film, project to play or watch and machine the picks name has an entry', () => {
  for (const [shelf, chapter] of Object.entries(PLAYS)) {
    for (const key of rows(shelf)) {
      const e = EMBEDS[key];
      assert.ok(e, `${shelf}: "${key}" has no entry in embeds.js`);
      assert.ok(e.chapters.includes(chapter), `${key}: ${chapter} may not play it`);
    }
  }
});

test('every entry can be mounted, has a poster on disk and says what a press costs or that it is not measured', () => {
  for (const [key, e] of Object.entries(EMBEDS)) {
    assert.ok(['film', 'game', 'machine'].includes(e.kind), key);
    assert.ok(['window', 'sheet'].includes(e.in), key);
    if (e.kind === 'machine') assert.equal(e.in, 'sheet', `${key}: a machine takes the wheel, so it runs in a sheet`);
    assert.ok(e.mb === null || e.mb > 0, key);
    assert.ok(fs.existsSync(new URL(`../../public${e.poster.src}`, import.meta.url)), `${key}: ${e.poster.src}`);
    assert.ok(e.poster.w > 0 && e.poster.h > 0 && e.poster.alt, key);
  }
  assert.equal(homeOf('blackwater-songs', ['projects', 'film']), 'film');
  assert.equal(homeOf('blackwater-songs', ['projects']), 'projects');
});
