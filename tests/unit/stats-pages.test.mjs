// stats-pages.txt (scripts/build/stats-pages.mjs) is the list of pages /api/stats may name, built on a made-up dist/:
// every public page by the address it answers at, never an unlisted post, a page whose path carries its slug, or
// anything deeper than a listed post and its notes. The Worker reads the file back to the same listed posts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import statsPages, { listPages } from '../../scripts/build/stats-pages.mjs';
import { makeSite, safePath } from '../../worker/stats/shape.js';

const HIDDEN = 'secret-unlisted-post';
function seed(posts = { shown: { id: 'AO-001', title: 'Shown' } }) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
  const put = (rel, text = '<!doctype html>') => {
    fs.mkdirSync(path.dirname(path.join(dist, rel)), { recursive: true });
    fs.writeFileSync(path.join(dist, rel), text);
  };
  put('ledger/previews.json', JSON.stringify({ posts }));
  for (const page of ['', 'about/', 'ledger/', 'ledger/shown/', 'ledger/shown/notes/', 'ledger/shown/deeper/', `ledger/${HIDDEN}/`, `ledger/${HIDDEN}/notes/`,
    `labs/${HIDDEN}/`, `LABS/${HIDDEN.toUpperCase()}/x/`, '_astro/chunk/', '.well-known/x/', 'a page/', `${'x'.repeat(170)}/`]) put(`${page}index.html`);
  put('404.html');
  put('research/a-paper.html');
  put(`talks/${HIDDEN}.html`);
  put(`talks/about.${HIDDEN}.html`);
  put('rss.xml', '<rss/>');
  return dist;
}

test('the list holds every public page by its address, and never an unlisted post or a page named after one', (t) => {
  const dist = seed();
  t.after(() => fs.rmSync(dist, { recursive: true }));
  const pages = listPages(dist);
  assert.deepEqual(pages, ['/', '/about/', '/ledger/', '/ledger/shown/', '/ledger/shown/notes/', '/research/a-paper']);
  assert.ok(!pages.join('\n').toLowerCase().includes(HIDDEN));
});

test('a build whose previews.json lists no posts fails, rather than naming every page', (t) => {
  const dist = seed({});
  t.after(() => fs.rmSync(dist, { recursive: true }));
  assert.throws(() => listPages(dist), /previews\.json lists no posts/);
});

test('the build writes the file, and the Worker reads it back to the same listed posts', (t) => {
  const dist = seed();
  t.after(() => fs.rmSync(dist, { recursive: true }));
  const said = [];
  statsPages().hooks['astro:build:done']({ dir: pathToFileURL(dist + path.sep), logger: { info: (line) => said.push(line) } });
  const text = fs.readFileSync(path.join(dist, 'stats-pages.txt'), 'utf8');
  assert.match(text, /^# [^\n]+\n\/\n\/about\/\n/);
  assert.deepEqual(said, ['stats-pages.txt: 6 pages']);
  const site = makeSite(text);
  assert.deepEqual([...site.listed], ['shown']);
  assert.equal(safePath('/ledger/shown', site), '/ledger/shown/');
  assert.equal(safePath('/research/a-paper/', site), '/research/a-paper');
  assert.equal(safePath(`/ledger/${HIDDEN}/`, site), null);
  assert.equal(safePath(`/labs/${HIDDEN}/`, site), null);
});
