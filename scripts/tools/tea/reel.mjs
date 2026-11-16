// The reel for the reviewer (1.12): a chapter's frames every 0.25 vh, words hidden, held still (?still=1&words=0),
// at 1440x900 and 390x844, numbered and laid out as one strip a size. The reviewer gets the strips, the garden plate,
// the reference sheets and section 1 of the brief, and answers with frame numbers.
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PAGE, Usage, args, browser, contactSheet, isMain, main, measure, openPage, outDir, ready, server, sizeName,
  sizesOf, urlOf, withQuery,
} from './lib.mjs';

// The places of a reel: every step vh from the section's top to its end, where the screens are shut on the next
// chapter (the scroll range of a section is its height: its part of the world runs until the next section's top
// reaches the top of the window), both ends kept, as [{ n, vh, y }] with y a share of the page. Pure.
export function reelPlaces(sec, M, step = 0.25) {
  const last = Math.max(0, sec.height / M.vh);
  const out = [];
  for (let i = 0; i * step <= last + 1e-9; i++) out.push(i * step);
  if (last - out.at(-1) > 1e-6) out.push(last);
  return out.map((vh, i) => ({ n: i + 1, vh: Math.round(vh * 100) / 100, y: M.max > 0 ? Math.min(1, (sec.top + vh * M.vh) / M.max) : 0 }));
}

if (isMain(import.meta.url)) {
  main(async () => {
    const { values, positionals } = args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/reel.mjs --chapter <id> [address] [--step 0.25] [--sizes 1440x900,390x844]
A chapter's frames every --step vh, from its section's top to its end (the screens shut on the next), with ?still=1&words=0, at each size;
one numbered strip a size (captures/tea/reel/<id>/strip-<size>.jpg) and every frame as a PNG beside it. The
address defaults to ${DEFAULT_PAGE}.`,
      flags: {
        chapter: { help: 'the chapter\'s id (tv, film, 3d ...)' },
        step: { help: 'vh between frames', default: '0.25' },
        sizes: { help: 'window sizes', default: '1440x900,390x844' },
        cols: { help: 'columns of a desktop strip (a phone strip has twice as many)', default: '4' },
        out: { help: 'folder (default captures/tea/reel/<id>)' },
      },
    });
    if (!values.chapter) throw new Usage('--chapter <id> is needed');
    const address = positionals[0] ?? DEFAULT_PAGE;
    const step = Number(values.step);
    if (!(step > 0)) throw new Usage('--step takes a number above 0');
    const dir = outDir('reel', values.chapter, values.out);
    const srv = await server();
    const b = await browser();
    try {
      for (const size of sizesOf(values.sizes)) {
        const q = { still: 1, words: 0 };
        const probe = await openPage(b, urlOf(srv.base, withQuery(address, q)), size);
        const M = await measure(probe);
        await probe.context().close();
        const sec = M.sections.find((s) => s.id === values.chapter || s.dom === values.chapter);
        if (!sec) throw new Usage(`no chapter "${values.chapter}" on ${address} (it has ${M.sections.map((s) => s.id).join(', ')})`);
        const shots = [];
        for (const p of reelPlaces(sec, M, step)) {
          const page = await openPage(b, urlOf(srv.base, withQuery(address, { ...q, y: p.y.toFixed(6) })), size);
          await ready(page);
          const buf = await page.screenshot();
          await page.context().close();
          const file = path.join(dir, `${sizeName(size)}-${String(p.n).padStart(3, '0')}.png`);
          fs.writeFileSync(file, buf);
          shots.push({ buf, label: `${p.n}  ${values.chapter}+${p.vh.toFixed(2)}` });
        }
        const portrait = size.height > size.width;
        const strip = path.join(dir, `strip-${sizeName(size)}.jpg`);
        fs.writeFileSync(strip, await contactSheet(shots, { cols: Number(values.cols) * (portrait ? 2 : 1), w: portrait ? 240 : 480 }));
        console.log(`${strip}  ${shots.length} frames, ${values.chapter} at ${sizeName(size)}, every ${step} vh`);
      }
    } finally {
      await b.close();
      await srv.stop();
    }
    return 0;
  });
}
