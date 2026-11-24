// src/data/tea/embeds.js holds every playable thing the picks name, so no chapter's builder has to write in it (2.1,
// 2.3): each film of Film's leads, each project of Projects' play and watch shelves and each machine of the
// television's, keyed by the row's own key, with a poster that exists, a kind RoomEmbed can mount and its chapter
// among those that may play it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { EMBEDS, LINK_ONLY, homeOf } from '../../src/data/tea/embeds.js';

const picks = JSON.parse(fs.readFileSync(new URL('../../src/data/tea-picks.json', import.meta.url), 'utf8'));
const rows = (shelf) => (picks.shelves[shelf]?.picks ?? []).map((k) => k.replace(/^[pjm]-/, ''));
const PLAYS = { 'film/leads': 'film', 'projects/play': 'projects', 'projects/watch': 'projects', 'tv/machines': 'tv' };

// The owner's picks can name a project nothing on the site can play (its film is on YouTube): such a row is named in
// LINK_ONLY with the reason, and is shown with its link alone. Nothing is left out without one or the other.
test('every film, project to play or watch and machine the picks name has an entry, or a reason it is a link alone', () => {
  for (const [shelf, chapter] of Object.entries(PLAYS)) {
    for (const key of rows(shelf)) {
      const e = EMBEDS[key];
      if (!e && LINK_ONLY[key]) continue;
      assert.ok(e, `${shelf}: "${key}" has no entry in embeds.js and no reason in LINK_ONLY`);
      assert.ok(e.chapters.includes(chapter), `${key}: ${chapter} may not play it`);
    }
  }
  for (const [key, why] of Object.entries(LINK_ONLY)) {
    assert.ok(!EMBEDS[key], `${key} is in LINK_ONLY and has an entry`);
    assert.ok(typeof why === 'string' && why.length > 10, `${key}: say why it is a link alone`);
  }
});

// A thing plays in the first chapter that is on the page AND shows it. The picks decide what a chapter shows.
test('the chapter that plays a thing is one that shows it, so its button never leads to a chapter without it', () => {
  const on = ['hero', 'games', 'film', 'projects'];
  const shows = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, new Set(v)]));
  // a game picked for Projects alone plays in Projects, though Games is on the page and may play it
  assert.equal(homeOf('storm-bell-fighter', on, shows({ games: ['modding-megabonk'], projects: ['storm-bell-fighter'] })), 'projects');
  // picked for both, it plays in the first and Projects' button is a link there
  assert.equal(homeOf('storm-bell-fighter', on, shows({ games: ['storm-bell-fighter'], projects: ['storm-bell-fighter'] })), 'games');
  // shown nowhere: nothing plays it
  assert.equal(homeOf('storm-bell-fighter', on, shows({ games: [], projects: [] })), null);
  // another chapter plays it under a row of another key (the songs' video is the Still on Shift post's in Film)
  assert.equal(homeOf('blackwater-songs', on, shows({ film: ['still-on-shift-music-video'], projects: ['blackwater-songs'] })), 'film');
  assert.equal(homeOf('blackwater-songs', on, shows({ film: ['bad-very-bad'], projects: ['blackwater-songs'] })), 'projects');
  // every thing the picks show is played by a chapter that shows it, on the page as the picks have it
  const order = picks.order.filter((id) => !picks.hidden?.[id]);
  const real = {};
  for (const [shelf, sh] of Object.entries(picks.shelves)) (real[shelf.split('/')[0]] ??= new Set()), sh.picks.forEach((k) => real[shelf.split('/')[0]].add(k.replace(/^[pjm]-/, '')));
  for (const shelf of Object.keys(PLAYS)) {
    for (const key of rows(shelf)) {
      if (!EMBEDS[key]) continue;
      const home = homeOf(key, order, real);
      assert.ok(home, `${key}: no chapter on the page plays it`);
      assert.ok(real[home].has(EMBEDS[key].row?.[home] ?? key), `${key}: ${home} plays it and does not show it`);
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
