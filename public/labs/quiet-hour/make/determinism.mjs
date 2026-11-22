#!/usr/bin/env node
// Same frame, same bytes (bible section 10). Renders the same 12 frames
//   A: in a fresh browser, in order;
//   B: in a second fresh browser, in reverse order;
//   C: split over two more browsers ("shards") in a shuffled order, each shard first drawing some
//      unrelated frames, so any state carried between frames would show;
// and compares sha256 of the raw RGBA of every frame. Then (unless --no-endings) it checks that frames
// before 20:00 are identical in all four endings. Prints PASS or FAIL and exits 0 or 1.
//
//   node make/determinism.mjs [--ending main] [--width 960 --height 540] [--frames 0,119,...] [--mount ...]

import path from 'node:path';
import { parseArgs, loadPlaywright, startServer, openFilm, CAPTURE_IN_PAGE, flipRows, sha256 } from './render.mjs';
import { parseFrames } from './contact.mjs';

const DEFAULT_FRAMES = '0,119,361,600,905,1260,1439,1440,1444,1800,2000,2159';
const ENDINGS = ['main', 'alone', 'x3', 'x10'];
let sinkId = 0;

async function hashes(chromium, server, opts, order, warm = []) {
  const w = await openFilm(chromium, server.url, opts);
  const out = {};
  let got = null;
  const id = `det${++sinkId}`;
  server.sinks.set(id, async (buf) => { got = buf; });
  for (const f of warm) await w.page.evaluate(CAPTURE_IN_PAGE, [f, null]);
  for (const f of order) {
    const [W, H] = await w.page.evaluate(CAPTURE_IN_PAGE, [f, `/frame?chunk=${id}&f=${f}`]);
    out[f] = sha256(flipRows(got, W, H));
  }
  await w.browser.close(); server.sinks.delete(id);
  return out;
}

export async function determinism(o) {
  const W = +(o.width || 960), H = +(o.height || 540), ending = o.ending || 'main';
  const frames = parseFrames(o.frames || DEFAULT_FRAMES);
  const { chromium } = loadPlaywright();
  const server = await startServer({ mounts: o.mount || [] });
  const opts = { width: W, height: H, ending, quality: o.quality || 'final' };
  const t0 = Date.now();
  const A = await hashes(chromium, server, opts, frames);
  const B = await hashes(chromium, server, opts, [...frames].reverse());
  // two shards, shuffled (fixed permutation), each warmed up on other frames first
  const shuffled = frames.map((f, i) => [f, (i * 7 + 3) % frames.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const [C1, C2] = await Promise.all([
    hashes(chromium, server, opts, shuffled.filter((_, i) => i % 2 === 0), [2100, 50, 1700]),
    hashes(chromium, server, opts, shuffled.filter((_, i) => i % 2 === 1), [1441, 7]),
  ]);
  const C = { ...C1, ...C2 };
  let ok = true;
  const rows = frames.map((f) => {
    const same = A[f] === B[f] && A[f] === C[f];
    ok &&= same;
    return `${String(f).padStart(5)}  ${A[f].slice(0, 16)}  ${same ? 'same' : `DIFF B ${B[f].slice(0, 16)} C ${C[f].slice(0, 16)}`}`;
  });
  console.log(`frames of ${ending} at ${W}x${H}: launch A (in order) vs B (reversed) vs C (2 shards, shuffled, warmed)`);
  console.log(rows.join('\n'));

  if (!o['no-endings']) {
    const pre = frames.filter((f) => f < 1440);
    const per = {};
    for (const e of ENDINGS) per[e] = e === ending ? A : await hashes(chromium, server, { ...opts, ending: e }, pre);
    const bad = pre.filter((f) => ENDINGS.some((e) => per[e][f] !== per[ending][f]));
    console.log(`frames before 20:00 (${pre.join(', ')}) in all four endings: ${bad.length ? 'DIFFER at ' + bad.join(', ') : 'identical'}`);
    ok &&= !bad.length;
    const post = frames.filter((f) => f >= 1445);
    if (post.length) {
      const per2 = {};
      for (const e of ENDINGS) per2[e] = e === ending ? A : await hashes(chromium, server, { ...opts, ending: e }, post);
      const differ = post.filter((f) => new Set(ENDINGS.map((e) => per2[e][f])).size > 1);
      console.log(`frames after 20:00 (${post.join(', ')}) that differ between endings: ${differ.join(', ') || 'none'} (expected: most)`);
    }
  }
  await server.close();
  console.log(`${ok ? 'PASS' : 'FAIL'} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  return ok;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  determinism(parseArgs(process.argv.slice(2))).then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error(e); process.exit(1); });
}
