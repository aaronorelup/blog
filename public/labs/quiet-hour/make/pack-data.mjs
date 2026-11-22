// Packs the verified training-run log into the small files the film loads.
//
//   node make/pack-data.mjs <runs-dir>      (or set QH_RUNS=<runs-dir>)
//
// <runs-dir> holds the verified run files (shared-0-287.json and ending-<name>.json, rebuilt from Fable 5.2's
// published training run: aaronorelup/blog, public/labs/training-run/, commit 0ce66154). This script writes
//
//   data/shared.json        notes 0 to 287 (00:00 to 19:56), the same in all four endings
//   data/ending-<name>.json notes 288 to 431 (20:00 to 29:56) for main, alone, x3, x10
//
// and prints the sha256 of every file it read and wrote, so the packing can be repeated and checked.
//
// What is kept, and how:
//   - every scalar of the log at full precision (JSON numbers print the shortest text that reads back as the
//     same double); a value that is not a finite number is written as the string "NaN", "Infinity" or
//     "-Infinity", never dropped; null means "not applicable" (as in the log)
//   - the 32 probabilities of each bet rounded to 5 decimals, except that an exact 0 and an exact 1 stay exact,
//     a non-zero value that would round to 0 keeps 3 significant figures (1e-94 stays 1e-94, not 0), and a value
//     below 1 that would round to 1 keeps its full precision. So "exactly certain" and "exactly impossible"
//     survive packing, and nothing becomes certain or impossible by rounding.
//   - things the film derives by rule (the pluck velocity, the clock text, the token names) are NOT stored:
//     src/signals.js computes them, once, and make/test-engine.mjs checks them against the run files.
// Dropped: the per-step batch losses after each note (the film only shows how many steps ran).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../data');
const RUNS = process.argv[2] || process.env.QH_RUNS;
if (!RUNS) {
  console.error('usage: node make/pack-data.mjs <runs-dir>   (the folder with shared-0-287.json and ending-*.json)');
  process.exit(2);
}
const ENDINGS = ['main', 'alone', 'x3', 'x10'];
const FORMAT = 'quiet-hour-notes/1';

// The scalar columns kept from each note row, in this order (meanings: src/signals.js, "row").
const COLS = ['step', 'lr', 'tok', 'ptok', 'entropy', 'zsd', 'held', 'heldAcc', 'train', 'wnorm', 'sharp',
  'sharpIters', 'ratio', 'stepsAfter', 'massInKey', 'massOutKey', 'massHold', 'massRest'];

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const hashes = { read: {}, wrote: {} };
function readJson(file) {
  const buf = fs.readFileSync(path.join(RUNS, file));
  hashes.read[file] = sha(buf);
  return JSON.parse(buf.toString('utf8'));
}

// A log value as JSON: finite numbers as they are, non-finite as explicit strings, null stays null.
function scalar(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    if (v === 'NaN' || v === 'Infinity' || v === '-Infinity') return v;
    throw new Error(`unexpected string value ${v}`);
  }
  if (typeof v !== 'number') throw new Error(`unexpected value ${v}`);
  if (Number.isNaN(v)) return 'NaN';
  if (v === Infinity) return 'Infinity';
  if (v === -Infinity) return '-Infinity';
  return v;
}

// One probability, rounded as described at the top.
function prob(v) {
  const x = scalar(v);
  if (typeof x === 'string' || x === null) return x;
  if (x === 0 || x === 1) return x;
  const r = Math.round(x * 1e5) / 1e5;
  if (r === 0) return Number(x.toPrecision(3));
  if (r === 1) return x;
  return r;
}

function pack(rows, g0, extra) {
  const cols = Object.fromEntries(COLS.map((k) => [k, []]));
  const p = [];
  rows.forEach((r, i) => {
    if (r.g !== g0 + i) throw new Error(`note ${g0 + i}: found g=${r.g}`);
    for (const k of COLS) {
      if (!(k in r)) throw new Error(`note ${r.g}: no field ${k}`);
      cols[k].push(scalar(r[k]));
    }
    if (!Array.isArray(r.p) || r.p.length !== 32) throw new Error(`note ${r.g}: bet is not 32 values`);
    p.push(r.p.map(prob));
  });
  return { format: FORMAT, ...extra, g0, count: rows.length, columns: COLS, cols, p };
}

function write(file, obj) {
  const text = JSON.stringify(obj);
  fs.writeFileSync(path.join(OUT, file), text);
  hashes.wrote[file] = sha(Buffer.from(text));
  return text.length;
}

const shared = readJson('shared-0-287.json');
const m = shared.meta;
const meta = {
  P: m.P, lo: m.lo, HOLD: m.HOLD, REST: m.REST, V: m.V, dMajorPitchClasses: m.dMajorPitchClasses,
  tokens: m.tokens.map((t) => ({ tok: t.tok, name: t.name, midi: t.midi ?? null, midiSounded: t.midiSounded ?? null,
    inKey: t.inDMajor ?? null })),
  totalNotes: m.totalNotes, breakNote: m.breakNote, lr0: m.lr0, batch: m.batch,
  stepsRule: m.stepsRule,
};
const source = {
  run: 'Fable 5.2 training run, AO-087 "A training run you can hear: Fable 5.2\'s version"',
  repo: m.source.repo, commit: m.source.commit, path: m.source.path, codeSha256: m.source.sha256,
};

const sizes = {};
const sharedRows = shared.notes;
if (sharedRows.length !== 288) throw new Error('shared part must hold notes 0..287');
sizes['shared.json'] = write('shared.json', pack(sharedRows, 0, {
  part: 'notes 0 to 287 (00:00 to 19:56), the same in all four endings', meta, source,
  sourceFile: { name: 'shared-0-287.json', sha256: hashes.read['shared-0-287.json'] },
}));

for (const e of ENDINGS) {
  const file = `ending-${e}.json`;
  const run = readJson(file);
  if (run.meta.ending !== e) throw new Error(`${file} says it is ${run.meta.ending}`);
  const rows = run.notes;
  if (rows.length !== 144) throw new Error(`${file}: expected notes 288..431`);
  const measured20 = rows[0].measured20;
  if (!measured20) throw new Error(`${file}: note 288 carries no measured20`);
  sizes[file] = write(file, pack(rows, 288, {
    part: `ending ${e}: notes 288 to 431 (20:00 to 29:56)`, ending: e,
    // what the run did at 20:00 (for the x-ray and the honest list; no rule of the film reads these)
    push: run.meta.push, climb: run.meta.climb, rule: run.meta.rule,
    // the limit measured at 20:00 (note 288), as the run measured it: limit = 2 / lambda
    measured20: { limit: scalar(measured20.limit), lambda: scalar(measured20.lambda), iters: measured20.iters },
    sourceFile: { name: file, sha256: hashes.read[file] },
  }));
}

console.log('read (sha256):');
for (const [f, h] of Object.entries(hashes.read)) console.log(`  ${h}  ${f}`);
console.log('wrote (sha256, bytes):');
for (const [f, h] of Object.entries(hashes.wrote)) console.log(`  ${h}  ${f}  ${sizes[f]}`);
