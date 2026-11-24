// The side studies behind the post's folded numbers. Each starts from tunes.json and the same seeds as the run.
//
//   node 6-studies.mjs holds     from the 20:00 state (out/checkpoint.json), hold the step size at 0.31x to 10x its limit
//   node 6-studies.mjs seeds     the whole programme with five other sets of random numbers: when does it fall apart?
//   node 6-studies.mjs inputs    the same training with one input taken away at a time
//   node 6-studies.mjs novelty   how much of what it improvised (out/main.json) is copied from a training tune
import fs from 'node:fs';
import * as C from '../core.js';
import { runProgramme } from '../programme.js';

const what = process.argv[2];
const data = JSON.parse(fs.readFileSync(new URL('../tunes.json', import.meta.url), 'utf8'));
const read = (n) => JSON.parse(fs.readFileSync(new URL(`./out/${n}.json`, import.meta.url), 'utf8'));
const GUESS = Math.log(data.P + 2);
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

if (what === 'holds') {
  const resume = read('checkpoint');
  for (const push of [0, 0.5, 0.8, 1, 1.2, 1.5, 2, 3, 4, 5, 6, 7, 8, 10]) {
    const r = runProgramme(data, { ...C.DEFAULT_CFG }, { push, climb: 1, resume });
    const peak = r.notes.reduce((m, n) => (n.held > m.held ? n : m), r.notes[0]);
    const tail = r.notes.slice(-24);
    console.log(JSON.stringify({ heldAt: push === 0 ? 'left alone (0.31x)' : push + 'x', worstError: +peak.held.toFixed(2), at: peak.clock,
      notesWorseThanGuessing: r.notes.filter((n) => n.held > GUESS).length, errorAtTheEnd: +mean(tail.map((n) => n.held)).toFixed(3), rightAtTheEnd: +mean(tail.map((n) => n.heldAcc)).toFixed(3) }));
  }
} else if (what === 'seeds') {
  const SCALE = new Set([2, 4, 6, 7, 9, 11, 1]);
  for (let k = 0; k <= 5; k++) {
    const seeds = k === 0 ? {} : { seedInit: 20 + k, seedBatch: 2000 + k, seedPick: 30 + k };
    const r = runProgramme(data, { ...C.DEFAULT_CFG }, seeds);
    const cliff = r.notes.find((n) => n.g >= 288 && n.held > GUESS);
    const before = r.notes.filter((n) => n.g >= 144 && n.g < 288);
    console.log(JSON.stringify({ seeds: k === 0 ? 'the published ones' : 'other set ' + k, limit: +r.limit.toFixed(4), errorAt2000: +r.notes[288].held.toFixed(4),
      worseThanGuessingFrom: cliff ? cliff.clock : 'never', atTimesTheLimit: cliff ? +(cliff.lr / r.limit).toFixed(2) : null,
      notesOutsideTheKeyFrom1000To2000: before.filter((n) => n.tok < data.P && !SCALE.has((n.tok + data.lo) % 12)).length }));
  }
} else if (what === 'inputs') {
  const variants = { 'everything': {}, 'no memory of 4 and 8 bars ago': { memory: [] }, 'no beat and bar counter': { beats: 1, phrase: 1 }, 'one bar of context, not two': { recent: 6 }, 'a hidden layer of 4, not 64': { hidden: 4 } };
  for (const [name, patch] of Object.entries(variants)) {
    const cfg = { ...C.DEFAULT_CFG, ...patch };
    const L = C.layout(cfg, data.P), ex = C.buildExamples(L, cfg, data.train), exH = C.buildExamples(L, cfg, data.held), sc = C.makeScratch(L);
    const th = C.initParams(L, cfg, 20), g = new Float64Array(L.n), rng = C.makeRng(2000), idx = new Int32Array(256);
    for (let s = 0; s < 6000; s++) { for (let i = 0; i < 256; i++) idx[i] = Math.floor(rng() * ex.N); C.sgdStep(L, th, ex, idx, 256, 0.3, g, sc); }
    const h = C.evaluate(L, th, exH, sc);
    console.log(JSON.stringify({ model: name, weights: L.n, errorOnUnseenTunes: +h.loss.toFixed(4), nextNotesRight: +h.acc.toFixed(4) }));
  }
} else if (what === 'novelty') {
  const main = read('main');
  const train = data.train.map((t) => t.tokens);
  const index = new Map();
  train.forEach((s, ti) => { for (let i = 0; i + 4 <= s.length; i++) { const k = s.slice(i, i + 4).join(','); if (!index.has(k)) index.set(k, []); index.get(k).push([ti, i]); } });
  const longest = (seq) => { let best = 0; for (let i = 0; i + 4 <= seq.length; i++) for (const [ti, p] of index.get(seq.slice(i, i + 4).join(',')) || []) { let l = 4; const s = train[ti]; while (i + l < seq.length && p + l < s.length && seq[i + l] === s[p + l]) l++; if (l > best) best = l; } return best; };
  const played = main.notes.filter((n) => n.g >= 144 && n.g < 288).map((n) => n.tok);
  const real = data.held.map((t) => longest(t.tokens)).sort((a, b) => a - b);
  console.log(JSON.stringify({ longestRunItSharesWithATrainingTune: longest(played), ofNotes: played.length, sameForTheRealUnseenTunes: { median: real[Math.floor(real.length / 2)], most: real[real.length - 1] } }));
} else {
  console.error('one of: holds, seeds, inputs, novelty');
}
