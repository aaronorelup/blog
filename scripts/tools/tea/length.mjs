// How long the tea room is, and how many things on it can be played or watched (2.10, question 9). For the picks
// as saved: each chapter's length in screens (vh) on a desktop and on a phone, the totals, and the play and watch
// buttons in each chapter. The lengths are the page's own formula (base + per x n from each chapter's scene data,
// lengths.js), the same numbers the tea-art rule prints as a note in npm run check.
//
// The buttons are counted from the picks by one rule per chapter (BUTTONS below), because a stub draws none: the
// television's one machine button, a button for each film, a game's where embeds.js can play it, and Projects'
// play and watch shelves. A chapter's scene.js may export buttons(shelves, { embeds, onPage }) to count its own,
// which then wins. With --built, the buttons on the last build's page are counted too (class room-button inside
// each section), as a check on the rule.
//
//   node scripts/tools/tea/length.mjs [--json] [--built]
import fs from 'node:fs';
import path from 'node:path';
import { loadRepo } from '../../check/repo.mjs';
import { SCENES, roomChapters, roomLengths } from '../../check/tea-art.mjs';
import { EMBEDS, homeOf } from '../../../src/data/tea/embeds.js';
import { ROOT, args, isMain, lpad, main, pad } from './lib.mjs';

const rows = (shelves, id) => shelves.find((s) => s.id === id)?.keys ?? [];
// The default count of a chapter's play and watch buttons, from its shelves ([{ id, keys }]) and the chapters on
// the page. Section 3 of the brief is the source: tv 3.3 (one button, the first machine), film 3.4 (a play button
// on each film's card), games 3.5 (the play button where there is one: a game embeds.js plays here), projects 3.11
// (Play it here and Watch: one each; Download and Read about it are links).
export const BUTTONS = {
  tv: (s) => (rows(s, 'machines').length ? 1 : 0),
  film: (s) => rows(s, 'leads').length,
  games: (s, { onPage }) => rows(s, 'leads').filter((k) => EMBEDS[k] && homeOf(k, onPage) === 'games').length,
  projects: (s) => rows(s, 'play').length + rows(s, 'watch').length,
};

export function buttonsOf(id, shelves, onPage, scene = SCENES[id]) {
  const own = scene?.buttons;
  if (typeof own === 'function') return own(shelves, { embeds: EMBEDS, onPage });
  return BUTTONS[id]?.(shelves, { onPage }) ?? 0;
}

// The table: [{ id, d, p, buttons, built? }], totals.
export function lengthTable(chapters, { built } = {}) {
  const onPage = chapters.map((c) => c.id);
  const { chapters: lens, total } = roomLengths(chapters);
  const out = lens.map((c) => ({ id: c.id, d: c.vh.d, p: c.vh.p, n: c.n, buttons: buttonsOf(c.id, c.shelves, onPage), ...(built ? { built: built[c.id] ?? 0 } : {}) }));
  return { rows: out, total: { ...total, buttons: out.reduce((n, r) => n + r.buttons, 0), ...(built ? { built: out.reduce((n, r) => n + (r.built ?? 0), 0) } : {}) } };
}

// Buttons in each section of a built page's HTML: { chapterId: count }.
export function builtButtons(html) {
  const out = {};
  const parts = html.split(/<section\b/).slice(1);
  for (const part of parts) {
    const id = /data-room-chapter="([^"]+)"/.exec(part.slice(0, part.indexOf('>')))?.[1];
    if (!id) continue;
    out[id] = (part.split('</section>')[0].match(/class="[^"]*\broom-button\b/g) ?? []).length;
  }
  return out;
}

export function format({ rows: r, total }) {
  const head = `${pad('chapter', 10)}${lpad('desktop vh', 11)}${lpad('phone vh', 10)}${lpad('items d/p', 11)}${lpad('buttons', 9)}${total.built !== undefined ? lpad('on page', 9) : ''}`;
  const line = (x) => `${pad(x.id, 10)}${lpad(x.d.toFixed(1), 11)}${lpad(x.p.toFixed(1), 10)}${lpad(`${x.n.d}/${x.n.p}`, 11)}${lpad(x.buttons, 9)}${x.built !== undefined ? lpad(x.built, 9) : ''}`;
  return [head, ...r.map(line), `${pad('page', 10)}${lpad(total.d.toFixed(1), 11)}${lpad(total.p.toFixed(1), 10)}${lpad('', 11)}${lpad(total.buttons, 9)}${total.built !== undefined ? lpad(total.built, 9) : ''}`,
    '', `The tea room is ${total.d.toFixed(1)} screens long on a desktop and ${total.p.toFixed(1)} on a phone, with ${total.buttons} play or watch buttons, for the picks as saved.`].join('\n');
}

if (isMain(import.meta.url)) {
  main(async () => {
    const { values } = args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/length.mjs [--json] [--built]
The tea room's length in screens on a desktop and a phone, per chapter and in all, and its play and watch buttons,
for the picks in src/data/tea-picks.json. Reads files only: no server, no browser.`,
      flags: {
        json: { type: 'boolean', help: 'print JSON instead of the table' },
        built: { type: 'boolean', help: 'also count the buttons on the last build (dist/labs/tea-room/engine/index.html)' },
      },
    });
    const chapters = roomChapters(loadRepo(ROOT));
    if (!chapters) { console.error('the picks cannot be read, or the rebuilt page is not in this checkout (npm run check says why)'); return 2; }
    let built;
    if (values.built) {
      const file = path.join(ROOT, 'dist', 'labs', 'tea-room', 'engine', 'index.html');
      if (!fs.existsSync(file)) { console.error('no build: run npm run build first'); return 2; }
      built = builtButtons(fs.readFileSync(file, 'utf8'));
    }
    const t = lengthTable(chapters, { built });
    console.log(values.json ? JSON.stringify(t, null, 2) : format(t));
    return 0;
  });
}
