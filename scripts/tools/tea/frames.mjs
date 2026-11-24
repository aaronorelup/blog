// Frames of the tea room (4.3 "How you work"): stills at given places and sizes, each loaded directly with ?y= and
// ?still=1, optionally laid out as a contact sheet; and with --weigh, the bytes a stretch of the page loads, beside
// the targets in 2.9. Works on /labs/tea-room/engine/ and on the two looks (/labs/tea-room/a/, /labs/tea-room/b/).
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PAGE, Usage, args, browser, contactSheet, gzipSize, hideWords, isMain, kb, lpad, main, measure, numbers,
  openPage, outDir, pad, pageKind, placeOf, ready, scrollToShare, server, sizeName, sizesOf, urlOf, withQuery,
} from './lib.mjs';

const USAGE = `node scripts/tools/tea/frames.mjs [address] [--at <places>] [--sizes <sizes>] [--words 0] [--sheet]
node scripts/tools/tea/frames.mjs [address] --weigh [--from <place>] [--to <place>] [--sizes <sizes>]

Stills: each place is loaded directly at ?y=<share>&still=1 and saved as a PNG. A place is a share of the page
(0.37), a chapter's opening frame (tv), a point in vh into its section (tv+1.5) or its last frame (tv:end).
The address defaults to ${DEFAULT_PAGE}; a path is served from the last build (npm run build).
  e.g. node scripts/tools/tea/frames.mjs --at start+2,tv+3 --sizes 1440x900 --sheet
       node scripts/tools/tea/frames.mjs /labs/tea-room/b/ --at 0.2,0.5 --sizes 390x844
--weigh: the bytes the page fetches (text as gzip, everything else as sent): at first paint, in the two seconds
after it, and over a scroll from --from to --to in half screens, by chapter (its /tea/scenes/<id>/ and
/media/tea/<id>/ files) and by kind, beside the targets of 2.9. Targets are reported, never failed (exit 0).`;

const FLAGS = {
  at: { help: 'places, comma separated, or a range of shares from:to:step', default: '0.1,0.5' },
  sizes: { help: 'window sizes: 1440x900, 390x844, desktop, phone', default: '1440x900,390x844' },
  words: { help: '0 hides every word (?words=0; on a look, by a style)' },
  sheet: { type: 'boolean', help: 'also write one contact sheet of all the frames' },
  cols: { help: 'columns of the contact sheet', default: '4' },
  dpr: { help: 'device pixels per CSS pixel', default: '1' },
  book: { type: 'boolean', help: 'book mode (?book=1)' },
  out: { help: 'folder for the pictures (default captures/tea/frames/<page>)' },
  weigh: { type: 'boolean', help: 'weigh a stretch of the page instead of taking stills' },
  from: { help: 'with --weigh: where the scroll starts (a place)', default: '0' },
  to: { help: 'with --weigh: where it ends (a place)', default: '1' },
};

// The targets of 2.9, in bytes (gzip for text). Reported beside what was measured.
export const TARGETS = Object.freeze({
  firstPaint: 800 * 1024, afterFirstPaint: 700 * 1024,
  scene: { d: 900 * 1024, p: 600 * 1024 }, still: 250 * 1024,
  page: { d: 26 * 1024 * 1024, p: 15 * 1024 * 1024 },
});

const TEXT = /^(text\/|application\/(javascript|json|xml|manifest)|image\/svg)/;
// What a response is: its kind and the chapter it belongs to (or 'shared').
export function classify(url, type = '') {
  const p = new URL(url, 'http://x').pathname;
  const chapter = /^\/(?:tea\/scenes|media\/tea)\/([^/]+)\//.exec(p)?.[1] ?? 'shared';
  const ext = path.extname(p).toLowerCase();
  const kind = /\.(woff2?|ttf|otf)$/.test(ext) || /font/.test(type) ? 'font'
    : /\.(mp4|webm|mov|m4v|mp3|ogg|wav)$/.test(ext) || /^(video|audio)\//.test(type) ? 'media'
      : /\.(webp|avif|png|jpe?g|gif|svg)$/.test(ext) || /^image\//.test(type) ? 'image'
        : /\.css$/.test(ext) || /css/.test(type) ? 'css'
          : /\.m?js$/.test(ext) || /javascript/.test(type) ? 'js'
            : /\.(glb|gltf|bin)$/.test(ext) ? 'model'
              : /html/.test(type) || p.endsWith('/') ? 'html' : 'other';
  return { chapter, kind, text: TEXT.test(type) || ['html', 'css', 'js'].includes(kind) };
}

// Sums [{ url, bytes, kind, chapter, phase }] by phase, kind and chapter.
export function tally(entries) {
  const sum = (xs) => xs.reduce((n, e) => n + e.bytes, 0);
  const by = (key, xs) => Object.fromEntries([...new Set(xs.map((e) => e[key]))].sort().map((k) => [k, sum(xs.filter((e) => e[key] === k))]));
  return { total: sum(entries), phase: by('phase', entries), kind: by('kind', entries), chapter: by('chapter', entries) };
}

async function stills(b, base, address, places, sizes, values) {
  const dir = outDir('frames', address.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'page', values.out);
  const shots = [];
  for (const size of sizes) {
    const q = { still: 1, ...(values.words === '0' ? { words: 0 } : {}), ...(values.book ? { book: 1 } : {}) };
    const probe = await openPage(b, urlOf(base, withQuery(address, q)), size, { dpr: Number(values.dpr) });
    const M = await measure(probe);
    await probe.context().close();
    for (const spec of places) {
      const y = placeOf(spec, M);
      const page = await openPage(b, urlOf(base, withQuery(address, { ...q, y: y.toFixed(5) })), size, { dpr: Number(values.dpr) });
      if (values.words === '0') await hideWords(page);
      await ready(page);
      const buf = await page.screenshot();
      const file = path.join(dir, `${sizeName(size)}-${String(spec).replace(/[^a-z0-9.+-]+/gi, '_')}.png`);
      fs.writeFileSync(file, buf);
      shots.push({ size, buf, label: `${sizeName(size)} ${spec} (y=${y.toFixed(3)})`, file });
      console.log(`${file}  ${sizeName(size)} ${spec} y=${y.toFixed(4)}`);
      await page.context().close();
    }
  }
  if (values.sheet) {
    // one sheet for each size, so frames of one shape share a row
    for (const size of sizes) {
      const mine = shots.filter((s) => s.size === size);
      const file = path.join(dir, `sheet-${sizeName(size)}.jpg`);
      const portrait = size.height > size.width;
      fs.writeFileSync(file, await contactSheet(mine, { cols: Number(values.cols) * (portrait ? 2 : 1), w: portrait ? 240 : 480 }));
      console.log(`${file}  contact sheet of ${mine.length} frames`);
    }
  }
  return 0;
}

async function weigh(b, base, address, sizes, values) {
  for (const size of sizes) {
    const comp = size.height > size.width ? 'p' : 'd';
    const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1, isMobile: comp === 'p', hasTouch: comp === 'p' });
    const page = await ctx.newPage();
    const entries = [];
    const missing = [];
    let phase = 'first paint';
    const pending = new Set();
    page.on('response', (r) => {
      const at = phase;
      const job = (async () => {
        if (r.status() >= 400) { missing.push(`${r.status()} ${r.url()}`); return; }
        if (r.status() >= 300 || r.request().method() !== 'GET') return;
        const type = r.headers()['content-type'] ?? '';
        let body;
        try { body = await r.body(); } catch { return; }
        const c = classify(r.url(), type);
        entries.push({ url: r.url(), bytes: c.text ? gzipSize(body) : body.length, ...c, phase: at });
      })();
      pending.add(job);
      job.finally(() => pending.delete(job));
    });
    const drain = async () => { while (pending.size) await Promise.all([...pending]); };
    await page.goto(urlOf(base, withQuery(address, { still: 1 })), { waitUntil: 'load' });
    await ready(page);
    await drain();
    phase = 'after first paint';
    await page.waitForTimeout(2000);
    await drain();
    const M = await measure(page);
    const [from, to] = [placeOf(values.from, M), placeOf(values.to, M)];
    phase = 'scroll';
    const step = M.max > 0 ? (0.5 * M.vh) / M.max : 1;
    const n = Math.max(1, Math.ceil(Math.abs(to - from) / step));
    for (let i = 0; i <= n; i++) await scrollToShare(page, from + ((to - from) * i) / n);
    await page.waitForTimeout(1000);
    await drain();
    await ctx.close();
    const t = tally(entries);
    const line = (label, bytes, target) => `  ${pad(label, 30)}${lpad(kb(bytes), 12)}${target ? `   target ${kb(target)}${bytes > target ? '  OVER' : ''}` : ''}`;
    console.log(`\n${address} at ${sizeName(size)}, scrolled from ${values.from} to ${values.to} (${n + 1} stops)`);
    console.log(line('first paint', t.phase['first paint'] ?? 0, TARGETS.firstPaint));
    console.log(line('straight after first paint', t.phase['after first paint'] ?? 0, TARGETS.afterFirstPaint));
    console.log(line('during the scroll', t.phase.scroll ?? 0));
    console.log(line('all', t.total, from === 0 && to === 1 ? TARGETS.page[comp] : undefined));
    console.log('  by kind:    ' + Object.entries(t.kind).map(([k, v]) => `${k} ${kb(v)}`).join(', '));
    console.log('  by chapter (its scene and media folders; the scene target is for plates and still):');
    for (const [c, v] of Object.entries(t.chapter)) {
      const img = entries.filter((e) => e.chapter === c && e.kind === 'image').reduce((s, e) => s + e.bytes, 0);
      console.log(line(c, v, c === 'shared' ? undefined : TARGETS.scene[comp]) + (c === 'shared' ? '' : `   (pictures ${kb(img)})`));
    }
    if (missing.length) console.log(`  not served here (${missing.length}; clips live in R2, the e2e suite fetches them from the live site):\n    ${[...new Set(missing)].slice(0, 12).join('\n    ')}`);
  }
  return 0;
}

if (isMain(import.meta.url)) {
  main(async () => {
    const { values, positionals } = args(process.argv.slice(2), { usage: USAGE, flags: FLAGS });
    const address = positionals[0] ?? DEFAULT_PAGE;
    if (positionals.length > 1) throw new Usage('one address at a time');
    const sizes = sizesOf(values.sizes);
    const places = /^[\d.]+:[\d.]+:[\d.]+$/.test(values.at) ? numbers(values.at) : String(values.at).split(',').filter(Boolean);
    const srv = await server();
    const b = await browser();
    try {
      if (pageKind(address) !== 'room' && values.book) throw new Usage('--book is for the room: the looks have no book mode switch');
      return values.weigh ? await weigh(b, srv.base, address, sizes, values) : await stills(b, srv.base, address, places, sizes, values);
    } finally {
      await b.close();
      await srv.stop();
    }
  });
}
