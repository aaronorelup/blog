// npm run tea:picks -- <saved.json>: the picker's saved document (the "tea/picks" doc, as JSON) into
// src/data/tea-picks.json. Checked by the same reader the page and the checker use (src/lib/tea-picks.js), the
// owner's private notes left out, written with a fixed key order; prints what changed. --root <dir> for tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRepo } from '../check/repo.mjs';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { PICKS_FILE, picksFile, readPicks } from '../../src/lib/tea-picks.js';

const args = process.argv.slice(2);
const at = args.indexOf('--root');
const root = at < 0 ? fileURLToPath(new URL('../../', import.meta.url)) : path.resolve(args.splice(at, 2)[1]);
const [input] = args;
const stop = (reason) => { console.error(`tea:picks: ${reason}`); process.exit(1); };
if (!input) stop('name the JSON file that holds the picker\'s saved document: npm run tea:picks -- <file>');

let doc;
try { doc = JSON.parse(fs.readFileSync(input, 'utf8')); } catch (e) { stop(`${input}: ${e.code === 'ENOENT' ? 'no such file' : e.message}`); }

const repo = loadRepo(root);
const site = {
  posts: repo.posts.filter((p) => !p.yamlError).map((p) => ({ id: p.slug, data: p.data })),
  projects: new Set(repo.projects.map((p) => path.basename(p.file, '.yaml'))),
  hasMachine: (name) => repo.exists(`public/labs/teardown/${name}`),
};
let warnings;
try { ({ warnings } = readPicks(doc, TEA_CHAPTERS, site, { source: input, allowPrivate: true })); } catch (e) { stop(e.message); }

const text = picksFile(doc, TEA_CHAPTERS);
const before = repo.exists(PICKS_FILE) ? repo.read(PICKS_FILE) : null;
for (const w of warnings) console.log(`warn  ${w}`);
if (before === text) {
  console.log(`tea:picks: ${PICKS_FILE} already holds these picks, nothing changed`);
  process.exit(0);
}

// What changed, in the owner's words: the chapter order, what is hidden, and each shelf.
const old = before ? JSON.parse(before) : { order: [], hidden: {}, shelves: {} };
const now = JSON.parse(text);
const lines = [];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (!same(old.order, now.order)) lines.push(`order: ${now.order.join(' > ')}`);
for (const id of new Set([...Object.keys(old.hidden ?? {}), ...Object.keys(now.hidden)])) {
  if (!!old.hidden?.[id] !== !!now.hidden[id]) lines.push(`${id}: ${now.hidden[id] ? 'hidden' : 'shown'}`);
}
const shelf = (s) => (!s ? '(not set)' : s.auto ? `the newest ${s.count}` : s.picks.join(', ') || '(empty)');
for (const key of new Set([...Object.keys(old.shelves ?? {}), ...Object.keys(now.shelves)])) {
  if (!same(old.shelves?.[key], now.shelves[key])) lines.push(`${key}: ${shelf(old.shelves?.[key])} -> ${shelf(now.shelves[key])}`);
}
fs.writeFileSync(path.join(root, PICKS_FILE), text);
console.log(`tea:picks: wrote ${PICKS_FILE}${before ? '' : ' (new)'}`);
for (const l of lines) console.log(`  ${l}`);
