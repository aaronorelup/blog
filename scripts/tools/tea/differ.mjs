// Not the frame before (1.12, item 4): one screen further on, the picture must have changed in a way you can name.
// Two frames, with every word hidden (?words=0), are compared on a coarse grid (16 x 9 cells on a desktop, 9 x 16
// on a phone, each cell the mean colour of its pixels): how many cells changed, and how far apart the two frames'
// mean colours are. FLOORS holds the floors, measured on looks A and B (docs/TEA_ROOM.md, "Calibration"; the frames
// are kept in tests/unit/fixtures/tea/differ/ and tests/unit/tea-tools.test.mjs holds them to it).
//
//   node scripts/tools/tea/differ.mjs <a.png> <b.png>             two pictures
//   node scripts/tools/tea/differ.mjs [address] [--sizes ...]      a page: every screen against the one before, and
//                                                                  (the room) each chapter's opening against the one before it
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PAGE, Usage, args, browser, hideWords, isMain, main, measure, numbers, openPage, outDir, pageKind,
  placeOf, ready, server, sizeName, sizesOf, urlOf, withQuery,
} from './lib.mjs';

// cell: a cell has changed when its mean colour moved by more than this (RGB distance, of 441), unless it is
//   darker than dark (luminance, of 255) in both frames.
// cells: a step (one screen apart) passes when at least this share of cells changed.
// mean: two chapters' opening frames must also be at least this far apart in mean colour.
// (The numbers and how they were measured: docs/TEA_ROOM.md, "Calibration".)
export const FLOORS = Object.freeze({ cell: 24, dark: 40, cells: 0.3, mean: 7 });
export const CALM = Object.freeze(['now', 'about']); // calm on purpose: exempt inside themselves (1.12)

export const gridOf = (w, h) => (h > w ? [9, 16] : [16, 9]);
const dist = (a, i, b, j) => Math.hypot(a[i] - b[j], a[i + 1] - b[j + 1], a[i + 2] - b[j + 2]);
const lum = (a, i) => 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];

// a, b: RGB bytes of two grids, gw x gh cells each (a frame downscaled by area to its grid). Pure.
export function compareGrids(a, b, gw, gh, floors = FLOORS) {
  const n = gw * gh;
  let changed = 0;
  const ma = [0, 0, 0], mb = [0, 0, 0];
  for (let c = 0; c < n; c++) {
    // a cell that is dark in both frames has not changed in a way you can name, however far its colour moved: a
    // dark field sliding over dark is B's flat dark slide, not a new picture
    const dark = Math.max(lum(a, c * 3), lum(b, c * 3)) < floors.dark;
    if (!dark && dist(a, c * 3, b, c * 3) > floors.cell) changed++;
    for (let k = 0; k < 3; k++) { ma[k] += a[c * 3 + k] / n; mb[k] += b[c * 3 + k] / n; }
  }
  return { cells: changed / n, mean: dist(ma, 0, mb, 0) };
}

// Does a pair pass? kind 'step' (one screen apart) asks for the cells; 'chapter' (two chapters' openings) for both.
export function verdict({ cells, mean }, kind = 'step', floors = FLOORS) {
  const why = [];
  if (cells < floors.cells) why.push(`only ${(cells * 100).toFixed(0)}% of cells changed (floor ${(floors.cells * 100).toFixed(0)}%)`);
  if (kind === 'chapter' && mean < floors.mean) why.push(`mean colours only ${mean.toFixed(1)} apart (floor ${floors.mean})`);
  return { ok: !why.length, why: why.join(', ') };
}

// Two pictures (PNG buffers of one size) as grids, compared.
export async function comparePictures(bufA, bufB, floors = FLOORS) {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(bufA).metadata();
  const [gw, gh] = gridOf(meta.width, meta.height);
  const grid = (buf) => sharp(buf).removeAlpha().resize(gw, gh, { fit: 'fill', kernel: 'cubic' }).raw().toBuffer();
  const [a, b] = await Promise.all([grid(bufA), grid(bufB)]);
  return compareGrids(a, b, gw, gh, floors);
}

const fmt = (r) => `cells ${(r.cells * 100).toFixed(0).padStart(3)}%  mean ${r.mean.toFixed(1).padStart(5)}`;

async function shoot(b, base, address, size, y, dir, label) {
  const q = { still: 1, words: 0, y: y.toFixed(5) };
  const page = await openPage(b, urlOf(base, withQuery(address, q)), size);
  await hideWords(page);
  await ready(page);
  const buf = await page.screenshot();
  await page.context().close();
  if (dir) fs.writeFileSync(path.join(dir, `${sizeName(size)}-${label}.png`), buf);
  return buf;
}

async function pageRun(address, values) {
  const srv = await server();
  const b = await browser();
  let bad = 0;
  try {
    for (const size of sizesOf(values.sizes)) {
      const probe = await openPage(b, urlOf(srv.base, withQuery(address, { still: 1, words: 0 })), size);
      const M = await measure(probe);
      await probe.context().close();
      const dir = values.keep ? outDir('differ', address.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''), values.out) : null;
      const share = (vh) => (M.max > 0 ? (vh * M.vh) / M.max : 0);
      const [from, to] = [placeOf(values.from, M), placeOf(values.to, M)];
      const step = share(Number(values.step));
      const at = values.at ? numbers(values.at) : null;
      const chapterOf = (y) => [...M.sections].reverse().find((s) => s.top <= y * M.max + 1)?.id;
      console.log(`\n${address} at ${sizeName(size)} (${(M.max / M.vh).toFixed(1)} screens), words hidden`);
      const pairs = [];
      if (at) for (let i = 1; i < at.length; i++) pairs.push(['chapter', at[i - 1], at[i]]);
      else {
        for (let y = from; y + step <= to + 1e-9; y += step) pairs.push(['step', y, y + step]);
        if (pageKind(address) === 'room') {
          const opens = M.sections.slice(1).map((s) => [s.id, placeOf(s.id, M)]).filter(([, y]) => y >= from && y <= to);
          for (let i = 1; i < opens.length; i++) pairs.push(['chapter', opens[i - 1][1], opens[i][1], `${opens[i - 1][0]} -> ${opens[i][0]}`]);
        }
      }
      const shots = new Map();
      const shot = async (y) => {
        const k = y.toFixed(5);
        if (!shots.has(k)) shots.set(k, await shoot(b, srv.base, address, size, y, dir, k));
        return shots.get(k);
      };
      for (const [kind, ya, yb, name] of pairs) {
        const calm = kind === 'step' && CALM.includes(chapterOf(ya)) && chapterOf(ya) === chapterOf(yb);
        const r = await comparePictures(await shot(ya), await shot(yb));
        const v = verdict(r, kind);
        if (!v.ok && !calm) bad++;
        const what = name ?? `${ya.toFixed(4)} -> ${yb.toFixed(4)}${pageKind(address) === 'room' ? ` (${chapterOf(ya)} -> ${chapterOf(yb)})` : ''}`;
        console.log(`  ${v.ok ? 'pass' : calm ? 'calm' : 'FAIL'}  ${kind.padEnd(7)} ${what.padEnd(36)} ${fmt(r)}${v.ok ? '' : `  ${v.why}`}`);
      }
      if (dir) console.log(`  frames kept in ${dir}`);
    }
  } finally {
    await b.close();
    await srv.stop();
  }
  console.log(bad ? `\n${bad} pair(s) are not different enough` : '\nevery pair differs');
  return bad ? 1 : 0;
}

if (isMain(import.meta.url)) {
  main(async () => {
    const { values, positionals } = args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/differ.mjs <a.png> <b.png> [--chapter]
node scripts/tools/tea/differ.mjs [address] [--sizes 1440x900,390x844] [--step 1] [--from 0] [--to 1] [--at <shares>]
Is a frame not the frame before? Words hidden, a 16x9 grid (9x16 on a phone): the share of cells whose colour
moved by more than ${FLOORS.cell}, and the distance between the two mean colours. A step passes at ${FLOORS.cells * 100}% of cells;
two chapters' opening frames also need their mean colours ${FLOORS.mean} apart. On a page: every pair a step apart
(in vh) from --from to --to, and on the room each chapter's opening frame against the one before; Now and About
are calm on purpose and only reported inside themselves. --at compares a list of shares in turn as chapter pairs
(for the looks, which have no chapter anchors). The address defaults to ${DEFAULT_PAGE}.`,
      flags: {
        sizes: { help: 'window sizes', default: '1440x900,390x844' },
        step: { help: 'vh between the two frames of a step', default: '1' },
        from: { help: 'first place (a share or a chapter)', default: '0' },
        to: { help: 'last place', default: '1' },
        at: { help: 'shares to compare in turn, as chapter pairs' },
        chapter: { type: 'boolean', help: 'two pictures: judge them as two chapters (cells and mean)' },
        keep: { type: 'boolean', help: 'keep the frames (captures/tea/differ/<page>)' },
        out: { help: 'folder for --keep' },
      },
    });
    if (positionals.length === 2 && positionals.every((p) => /\.(png|jpe?g|webp)$/i.test(p))) {
      const [a, b] = positionals.map((p) => { if (!fs.existsSync(p)) throw new Usage(`no such picture: ${p}`); return fs.readFileSync(p); });
      const r = await comparePictures(a, b);
      const v = verdict(r, values.chapter ? 'chapter' : 'step');
      console.log(`${v.ok ? 'pass' : 'FAIL'}  ${fmt(r)}${v.ok ? '' : `  ${v.why}`}`);
      return v.ok ? 0 : 1;
    }
    if (positionals.length > 1) throw new Usage('give two pictures, or one address');
    return pageRun(positionals[0] ?? DEFAULT_PAGE, values);
  });
}
