// Frame rate on an agent's machine (2.9): a tripwire, not a gate. Runs a time-driven scroll at 540 px a second
// over a stretch of the room (through its own meter, ?meter=1) and over look B (the meter's same code, run on B),
// three times each, taking turns, at 1440x900 and 390x844 in one session; prints each run, the medians, the ratio
// of the room's median to B's, and the worst second. The gate is the owner's own machine.
import {
  DEFAULT_PAGE, Usage, args, browser, isMain, main, measure, openPage, pageKind, placeOf, ready, server, sizeName,
  sizesOf, urlOf, withQuery,
} from './lib.mjs';
import { SPEED, meterStats, scrollRun } from '../../../src/scripts/tea/room/engine/meter.js';

export const CAVEAT = 'This box has no graphics card: Chromium draws in software, so these numbers measure the machine as much as the page. They are a tripwire for a change that makes the page much slower, never a gate. The gate is ?meter=1 on the owner\'s laptop and phone (a median of 60 and no second under 50 on a laptop, 50 on a phone).';
export const RATIO_FLOOR = 0.8;

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

// Three runs of each, as [{ median, worst, longest }]: the median of the medians, the worst second of all, the ratio.
export function summary(room, look) {
  const m = median(room.map((r) => r.median)), mb = median(look.map((r) => r.median));
  return { room: m, look: mb, ratio: mb ? m / mb : 0, worstRoom: Math.min(...room.map((r) => r.worst)), worstLook: Math.min(...look.map((r) => r.worst)) };
}

// A place on a page as px of scroll: placeOf() (a share or a chapter) times the scroll range; as the end of a
// stretch a bare chapter id means its last frame.
const px = (spec, M, end) => {
  const s = String(spec);
  const share = end && /^[a-z0-9-]+$/i.test(s) && !/^[\d.]+$/.test(s) ? placeOf(`${s}:end`, M) : placeOf(s, M);
  return Math.round(share * M.max);
};

async function run(b, base, address, size, from, to, gl0) {
  const room = pageKind(address) === 'room';
  const q = room ? { meter: 1, ...(gl0 ? { gl: 0 } : {}) } : {};
  const page = await openPage(b, urlOf(base, withQuery(address, q)), size);
  const M = await measure(page);
  const [a, z] = [px(from, M, false), px(to, M, true)];
  console.log(`    ${address}: ${(Math.abs(z - a) / SPEED).toFixed(0)} s of scroll at ${SPEED} px a second...`);
  await page.evaluate((y) => scrollTo(0, y), a);
  await ready(page);
  await page.waitForTimeout(800);
  let stats;
  if (room && await page.locator('[data-room-meter] button').count()) {
    // the room's own meter: its button, with the stretch in the address it reads
    await page.goto(urlOf(base, withQuery(address, { ...q, from: (a / M.max).toFixed(6), to: (z / M.max).toFixed(6) })), { waitUntil: 'load' });
    await ready(page);
    await page.evaluate((y) => scrollTo(0, y), a);
    await ready(page);
    await page.waitForTimeout(800);
    await page.locator('[data-room-meter] button').click();
    await page.waitForFunction(() => document.querySelector('[data-room-meter]')?.dataset.result, null, { timeout: 600_000, polling: 500 });
    stats = JSON.parse(await page.locator('[data-room-meter]').getAttribute('data-result'));
  } else {
    stats = meterStats(await page.evaluate(`(${scrollRun.toString()})(${a}, ${z}, ${SPEED})`));
  }
  const renderer = await page.evaluate(() => {
    const c = document.createElement('canvas').getContext('webgl');
    const e = c?.getExtension('WEBGL_debug_renderer_info');
    return c ? (e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown') : 'no webgl';
  });
  await page.context().close();
  return { ...stats, px: Math.abs(z - a), renderer };
}

if (isMain(import.meta.url)) {
  main(async () => {
    const { values, positionals } = args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/fps.mjs [address] [--from <place>] [--to <place>] [--runs 3] [--sizes 1440x900,390x844]
The frame rate of a time-driven scroll at ${SPEED} px a second, through the room's own meter (?meter=1), and of look B
by the same code, --runs times each, taking turns, at each size. A place is a share of the page or a chapter's id
(as --to, the chapter's end). Prints the runs, both medians, their ratio and the worst second. Exit 1 when the
room's median is under ${RATIO_FLOOR} of B's at any size (2.9: find out why before you land). The address defaults
to ${DEFAULT_PAGE}; the 3D chapter is measured on its posters (?gl=0).
  e.g. node scripts/tools/tea/fps.mjs --from start --to tv`,
      flags: {
        from: { help: 'where the stretch starts', default: '0' },
        to: { help: 'where it ends', default: '1' },
        runs: { help: 'runs of each page at each size', default: '3' },
        sizes: { help: 'window sizes', default: '1440x900,390x844' },
        against: { help: 'the page to compare with', default: '/labs/tea-room/b/' },
        'against-from': { help: 'where its stretch starts', default: '0' },
        'against-to': { help: 'where it ends', default: '1' },
      },
    });
    const address = positionals[0] ?? DEFAULT_PAGE;
    if (positionals.length > 1) throw new Usage('one address at a time');
    const runs = Number(values.runs);
    if (!(runs >= 1)) throw new Usage('--runs takes a number from 1');
    console.log(`CAVEAT: ${CAVEAT}\n`);
    if (String(values.from) === '0' && String(values.to) === '1') {
      console.log(`The whole page, ${runs} run(s) of it and of look B at each size: on this box about 3 minutes for one run of both\nat one size, so about ${runs * sizesOf(values.sizes).length * 3} minutes in all. One stretch is quicker: --from start --to tv.\n`);
    }
    const srv = await server();
    const b = await browser();
    let low = false;
    try {
      for (const size of sizesOf(values.sizes)) {
        const room = [], look = [];
        console.log(`${sizeName(size)}, device pixel ratio 1`);
        for (let i = 0; i < runs; i++) {
          for (const [list, addr, from, to] of [[room, address, values.from, values.to], [look, values.against, values['against-from'], values['against-to']]]) {
            const r = await run(b, srv.base, addr, size, from, to, true);
            list.push(r);
            const secs = (r.px / SPEED).toFixed(0);
            console.log(`  run ${i + 1}  ${addr.padEnd(20)} ${secs.padStart(3)} s  median ${String(r.median).padStart(3)}  worst second ${String(r.worst).padStart(3)}  longest frame ${r.longest} ms${Number(secs) < 10 ? '  (under 10 s: too short for a median of seconds)' : ''}`);
          }
        }
        const s = summary(room, look);
        if (s.ratio < RATIO_FLOOR) low = true;
        console.log(`  => ${sizeName(size)}: room median ${s.room}, look B median ${s.look}, ratio ${s.ratio.toFixed(2)}${s.ratio < RATIO_FLOOR ? `  UNDER ${RATIO_FLOOR}: find out why` : ''}; worst second ${s.worstRoom} (B ${s.worstLook}), reported, not acted on. Renderer: ${room[0].renderer}\n`);
      }
    } finally {
      await b.close();
      await srv.stop();
    }
    return low ? 1 : 0;
  });
}
