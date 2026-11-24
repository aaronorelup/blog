// Step 3. Run the programme and write every note and every training step to out/<name>.json.
//
//   node 3-run.mjs main      the published programme: at 20:00 the step size is set to its limit, then +2% a note
//   node 3-run.mjs alone     the same model with the step size left alone     (needs main first: it starts at 20:00)
//   node 3-run.mjs x3        held at 3 times the limit
//   node 3-run.mjs x10       held at 10 times the limit
//
// Each run also measures the error on training notes and the sharpness at every note, which is what takes the time
// (about 7 minutes for main). FAST=1 skips those and takes under a minute.
import fs from 'node:fs';
import * as C from '../core.js';
import { runProgramme } from '../programme.js';

const ENDINGS = { main: [1, 1.02], alone: [0, 1], x3: [3, 1], x10: [10, 1] };
const name = process.argv[2] || 'main';
if (!ENDINGS[name]) throw new Error('one of: ' + Object.keys(ENDINGS).join(', '));
const [push, climb] = ENDINGS[name];
const data = JSON.parse(fs.readFileSync(new URL('../tunes.json', import.meta.url), 'utf8'));
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
const ckPath = new URL('./out/checkpoint.json', import.meta.url);
const resume = name === 'main' ? undefined : JSON.parse(fs.readFileSync(ckPath, 'utf8'));
const t0 = performance.now();
const r = runProgramme(data, { ...C.DEFAULT_CFG }, { push, climb, track: !process.env.FAST, resume },
  (row) => { if (row.g % 24 === 0) console.error(name, row.clock, 'step', row.step, 'error on unseen tunes', row.held.toFixed(3)); });
if (name === 'main') fs.writeFileSync(ckPath, JSON.stringify(r.checkpoint));
const out = { name, push, climb, limit: r.limit, sharpness: r.lambdaBreak, powerIterations: r.breakIters, seconds: (performance.now() - t0) / 1000,
  P: data.P, lo: data.lo, V: r.L.V, weights: r.L.n, breakNote: r.o.breakBar * 6, notes: r.notes, steps: r.steps };
fs.writeFileSync(new URL(`./out/${name}.json`, import.meta.url), JSON.stringify(out));
console.error(name, 'done in', out.seconds.toFixed(0), 's. Limit at 20:00:', r.limit);
