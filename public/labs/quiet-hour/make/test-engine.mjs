// Tests the engine (src/signals.js + src/rules.js) against the bible and the verified run files.
//
//   node make/test-engine.mjs [<runs-dir>]      (or QH_RUNS=<runs-dir>)
//
// Exits non-zero if anything fails. Without <runs-dir> the checks against the run files are skipped (and said so).
// What it checks:
//   1. the clock text on every frame
//   2. frames 0..1439 give deep-equal signals in all four endings
//   3. signals(frame) is the same object whatever order frames are asked in, and on a second engine
//   4. every signal on every frame of every ending is a finite number, a boolean, a string, null or a container of
//      these, with the same keys on every frame
//   5. no rule reads the ending's name (main's data under other labels gives identical everything; the source has no
//      ending names, clocks, timers or Math.random)
//   6. the packed data equals the run files (scalars exactly; probabilities within 5e-6 with exact 0 and 1 kept)
//   7. every bible rule spot-checked against values computed here, independently, from the run files
//   8. FORMAT events are the only ones at fixed frames: the same frames in all endings, and in a log where nothing
//      ever changes every other event happens on note 0 or not at all
//   9. the line queue: note boundaries, no overlaps, drops only after 2 bars

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine, FORMAT_FRAMES, voiceLengths } from '../src/signals.js';
import { clockText, PROGRAMME_FRAMES, TOTAL_FRAMES } from '../src/time.js';
import { hash01 } from '../src/rng.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(ROOT, 'data');
const RUNS = process.argv[2] || process.env.QH_RUNS || null;
const ENDINGS = ['main', 'alone', 'x3', 'x10'];
const LN32 = Math.log(32);
const F = PROGRAMME_FRAMES;

let failures = 0, checks = 0;
const warnings = [];
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.log(`FAIL ${msg}`); }
  return cond;
}
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
function section(name) { console.log(`-- ${name}`); }

// canonical text of a value (sorted keys; NaN, Infinity and undefined spelled out so they cannot hide)
function canon(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'number') return Number.isFinite(v) ? JSON.stringify(v) : String(v);
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v) || ArrayBuffer.isView(v)) return '[' + Array.from(v, canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const shared = readJson(path.join(DATA, 'shared.json'));
const endingData = Object.fromEntries(ENDINGS.map((e) => [e, readJson(path.join(DATA, `ending-${e}.json`))]));
// the film's own line lengths when they exist (data/voice.json), as loadEngine uses them
const voiceFile = path.join(DATA, 'voice.json');
const voiceDurations = fs.existsSync(voiceFile) ? voiceLengths(readJson(voiceFile)) : undefined;
const engines = Object.fromEntries(ENDINGS.map((e) => [e, createEngine(shared, endingData[e], { voiceDurations })]));
const seq = Object.fromEntries(ENDINGS.map((e) => [e, Array.from({ length: F }, (_, f) => canon(engines[e].signals(f)))]));

// ---- 1. the clock ---------------------------------------------------------------------------------------------------
section('1 clock');
for (let f = 0; f < TOTAL_FRAMES; f++) {
  const s = Math.floor((f * 5) / 6), want = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  if (!ok(clockText(f) === want, `clockText(${f}) = ${clockText(f)}, want ${want}`)) break;
  if (f < F && !ok(engines.main.signals(f).clock === want, `signals(${f}).clock`)) break;
}
ok(clockText(1440) === '20:00' && clockText(2159) === '29:59' && clockText(360) === '05:00', 'clock landmarks');

// ---- 2. frames 0..1439 the same in all endings --------------------------------------------------------------------
section('2 frames 0..1439 identical across endings');
{
  let firstDiff = {};
  for (const e of ENDINGS.slice(1)) {
    for (let f = 0; f < 1440; f++) if (seq[e][f] !== seq.main[f]) { firstDiff[e] = f; break; }
    ok(firstDiff[e] === undefined, `${e} differs from main at frame ${firstDiff[e]}`);
    let d = -1;
    for (let f = 1440; f < F; f++) if (seq[e][f] !== seq.main[f]) { d = f; break; }
    ok(d === 1440, `${e} first differs from main at ${d} (expected 1440: the endings part at 20:00)`);
  }
}

// ---- 3. order independence -----------------------------------------------------------------------------------------
section('3 order independence');
for (const e of ENDINGS) {
  const fresh = createEngine(shared, endingData[e], { voiceDurations });
  const order = Array.from({ length: F }, (_, f) => f).sort((a, b) => hash01(77, a) - hash01(77, b));
  let bad = -1;
  for (const f of order) if (canon(fresh.signals(f)) !== seq[e][f]) { bad = f; break; }
  ok(bad < 0, `${e}: frame ${bad} differs when frames are asked in shuffled order`);
  ok(canon(fresh.signals(1500)) === canon(fresh.signals(1500)), `${e}: the same frame twice`);
}

// ---- 4. finite or null, same keys -----------------------------------------------------------------------------------
section('4 every signal finite or null, same keys on every frame');
// walks a value: flags non-finite numbers and undefined, and records the key set of every object at every path
// (array elements share their array's path), so frames can be compared: an object may be null on some frames, but
// whenever it is there it has the same keys
function shape(v, where, bad, keysAt, path = '') {
  if (v === null || typeof v === 'boolean' || typeof v === 'string') return;
  if (typeof v === 'number') { if (!Number.isFinite(v)) bad.push(`${where} = ${v}`); return; }
  if (v === undefined) { bad.push(`${where} undefined`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => shape(x, `${where}[${i}]`, bad, keysAt, path + '[]')); return; }
  if (typeof v === 'object') {
    const ks = Object.keys(v).sort().join(',');
    if (keysAt.has(path) && keysAt.get(path) !== ks) bad.push(`${where}: keys ${ks} vs ${keysAt.get(path)}`);
    keysAt.set(path, ks);
    for (const k of Object.keys(v)) shape(v[k], `${where}.${k}`, bad, keysAt, `${path}.${k}`);
    return;
  }
  bad.push(`${where}: ${typeof v}`);
}
for (const e of ENDINGS) {
  const bad = [], keysAt = new Map();
  const top = Object.keys(engines[e].signals(0)).sort().join();
  let diffKeys = -1;
  for (let f = 0; f < F; f++) {
    const S = engines[e].signals(f);
    shape(S, `${e}@${f}`, bad, keysAt);
    if (Object.keys(S).sort().join() !== top && diffKeys < 0) diffKeys = f;
  }
  ok(bad.length === 0, `${e}: ${bad.length} non-finite, undefined or reshaped values, first ${bad.slice(0, 3).join(' | ')}`);
  ok(diffKeys < 0, `${e}: frame ${diffKeys} has different keys from frame 0`);
}

// ---- 5. no rule reads the ending's name -----------------------------------------------------------------------------
section("5 no rule reads the ending's name");
for (const label of ['alone', 'x3', 'x10', 'zz']) {
  const relabelled = createEngine(shared, { ...endingData.main, ending: label }, { name: label, voiceDurations });
  let bad = -1;
  for (let f = 0; f < F; f++) if (canon(relabelled.signals(f)) !== seq.main[f]) { bad = f; break; }
  ok(bad < 0, `main's data labelled ${label}: signals differ at frame ${bad}`);
  ok(canon(relabelled.cues) === canon(engines.main.cues), `main's data labelled ${label}: cues differ`);
  ok(canon(relabelled.events) === canon(engines.main.events), `main's data labelled ${label}: events differ`);
  ok(canon(relabelled.perNote) === canon(engines.main.perNote), `main's data labelled ${label}: per-note arrays differ`);
  ok(relabelled.meta.ending === label, 'the label is kept as a label');
}
for (const f of ['src/signals.js', 'src/rules.js', 'src/time.js', 'src/rng.js']) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/['"`](main|alone|x3|x10)['"`]/.test(code), `${f} names an ending in its code`);
  ok(!/\b(Date|performance|requestAnimationFrame|setTimeout|setInterval)\b|Math\.random/.test(code), `${f} uses a clock, a timer or Math.random`);
}

// ---- 6 + 7. against the run files -----------------------------------------------------------------------------------
if (!RUNS) {
  warnings.push('no <runs-dir> given: the checks against the run files (6, 7) were skipped');
} else {
  section('6 packed data equals the run files');
  const runShared = readJson(path.join(RUNS, 'shared-0-287.json')).notes;
  const runs = Object.fromEntries(ENDINGS.map((e) => [e, runShared.concat(readJson(path.join(RUNS, `ending-${e}.json`)).notes)]));
  const COLS = shared.columns;
  for (const e of ENDINGS) {
    const eng = engines[e];
    let bad = [], pBad = [];
    for (let g = 0; g < 432; g++) {
      const r = runs[e][g], n = eng.note(g);
      for (const k of COLS) if (!Object.is(n[k], r[k])) bad.push(`${g}.${k} ${n[k]} vs ${r[k]}`);
      for (let i = 0; i < 32; i++) {
        const a = n.p[i], b = r.p[i];
        if (Math.abs(a - b) > 5e-6 || (b === 0) !== (a === 0) || (b === 1) !== (a === 1)) pBad.push(`${g}.p${i} ${a} vs ${b}`);
      }
      if (n.pluckVel !== r.pluckVel) bad.push(`${g}.pluckVel ${n.pluckVel} vs ${r.pluckVel}`);
      if (n.pickInKey !== r.pickInKey) bad.push(`${g}.pickInKey`);
      if (n.tokName !== r.tokName) bad.push(`${g}.tokName ${n.tokName} vs ${r.tokName}`);
      if (n.logClock !== r.clock) bad.push(`${g}.clock ${n.logClock} vs ${r.clock}`);
      if (n.pExactOne !== r.pExactOne) bad.push(`${g}.pExactOne`);
      if (!near(n.lrOverLimit20, r.lrOverLimit20)) bad.push(`${g}.lrOverLimit20`);
      if (n.midiSounded !== r.midiSounded) bad.push(`${g}.midiSounded`);
    }
    ok(bad.length === 0, `${e}: ${bad.length} log values differ, first ${bad.slice(0, 3).join(' | ')}`);
    ok(pBad.length === 0, `${e}: ${pBad.length} probabilities off, first ${pBad.slice(0, 3).join(' | ')}`);
    ok(eng.meta.limit20 === runs[e][288].measured20.limit, `${e}: limit at 20:00`);
  }

  section('7 bible rules against values computed from the run files');
  for (const e of ENDINGS) {
    const eng = engines[e], R = runs[e];
    const S = (f) => eng.signals(f);
    const held = R.map((r) => r.held), acc = R.map((r) => r.heldAcc), lr = R.map((r) => r.lr);
    const best20 = Math.min(...held.slice(0, 289)), err20 = held[288];
    // section 3 table
    const g0 = 287, f0 = g0 * 5 + 2, s = S(f0);
    ok(near(s.stripColumns.at(-1).haze[17], 0.85 * Math.sqrt(R[g0].p[17]), 1e-5), `${e}: haze alpha = 0.85 sqrt(p)`);
    ok(near(s.stripColumns.at(-1).holeR, 0.25 + 0.75 * R[g0].ptok, 1e-15), `${e}: hole radius = 0.25 + 0.75 p(pick)`);
    ok(s.stripColumns.at(-1).x === -0.4 && s.stripColumns.at(-2).x === -1.4, `${e}: strip scroll x = (g - note) - phase`);
    for (const g of [0, 100, 288, 300, 431]) {
      const p = R[g].p, sum = p.reduce((a, b) => a + b, 0), m = p.reduce((a, x, i) => a + x * i, 0) / sum;
      const sd = Math.sqrt(p.reduce((a, x, i) => a + x * (i - m) ** 2, 0) / sum);
      ok(near(S(g * 5).meanRow, m, 1e-4) && near(S(g * 5).spread, sd, 1e-3), `${e}: note ${g} mean row ${S(g * 5).meanRow} vs ${m}, spread`);
      ok(near(S(g * 5).entropyN, Math.min(1, R[g].entropy / LN32), 1e-15), `${e}: note ${g} H / ln 32`);
      const lim = R[g].sharp > 0 ? 2 / R[g].sharp : null;
      ok(S(g * 5).limit === lim, `${e}: note ${g} limit now = 2 / sharpness`);
      ok(near(R[g].ratio, R[g].lr * R[g].sharp / 2, 1e-9), `${e}: note ${g} ratio = lr sharp / 2 in the log`);
      const k = Math.min(1, Math.max(0, (LN32 - held[g]) / (LN32 - best20)));
      ok(S(g * 5).warmthK === k && near(S(g * 5).warmth, 0.15 + 0.85 * k, 1e-15), `${e}: note ${g} warmth`);
      const tg = Math.min(1, Math.max(0, Math.log(held[g] / err20) / Math.log(250)));
      ok(S(g * 5).tear === tg && S(g * 5).tearBands.length === Math.floor(8 * tg), `${e}: note ${g} tear g and band count`);
      ok(S(g * 5).tearBands.every((b) => Math.abs(b.dxPx) <= 24 * tg + 0.5), `${e}: note ${g} band shifts within 24 g px`);
      ok(S(g * 5).blocks === (held[g] > 10 * LN32), `${e}: note ${g} blocks`);
      ok((S(g * 5).hairline !== null) === (R[g].ratio > 1), `${e}: note ${g} hairline`);
      const fl = Math.round(10 * acc[g - (g % 6)]);
      ok(S(g * 5 + 3).flagsUp === fl && S(g * 5).shareDrum === Math.round(100 * acc[g]), `${e}: note ${g} flags ${fl} and drum`);
      ok(S(g * 5).steps === R[g].step && S(g * 5).cardsThisNote === R[g].stepsAfter, `${e}: note ${g} LESSONS`);
    }
    ok(near(S(15).crankAngle, Math.PI, 1e-15) && S(30).crankAngle === 0 && near(S(29).crankAngle, 2 * Math.PI * 29 / 30, 1e-15), `${e}: crank one turn per bar`);
    ok(S(0).wallClock === '23:30' && S(1440).wallClock === '23:50' && S(2159).wallClock === '23:59', `${e}: wall clock`);
    ok(S(1439).chalk === 0 && near(S(1440).chalk, 0.2) && S(1444).chalk === 1 && S(1440).chalkText === '0.98', `${e}: chalk over frames 1440..1444, "0.98"`);
    ok(S(1440).clock === '20:00' && S(1440).needle === 0.3 && S(1440).chalk > 0, `${e}: frame 1440 shows the needle, the chalk and 20:00`);
    ok(S(0).titleSlide === 0 && S(89).titleSlide === 0 && S(119).titleSlide === 1 && S(100).titleSlide > 0, `${e}: title card slides over 90..119`);

    // hands rule 1, computed here from the run file
    let state = true, good = 0, outs = [], backs = [];
    const inAt = [];
    for (let g = 0; g < 432; g++) {
      const worse = !(held[g] <= LN32);
      if (state) { if (worse) { state = false; good = 0; outs.push(g); } }
      else { good = worse ? 0 : good + 1; if (good >= 6) { state = true; backs.push(g); } }
      inAt.push(state);
    }
    ok(canon(eng.events.filter((x) => x.kind === 'hands-out').map((x) => x.note)) === canon(outs), `${e}: hands out at ${outs}`);
    ok(canon(eng.events.filter((x) => x.kind === 'hands-back').map((x) => x.note)) === canon(backs), `${e}: hands back at ${backs}`);
    for (const g of outs) {
      if (inAt.slice(g, g + 6).some((x) => x)) continue;           // only when they stay out for the whole bar
      ok(S(g * 5).handsPresent < 1 && S(g * 5).handsPresent > 0.99 && S(g * 5 + 28).handsPresent > 0 && S(g * 5 + 29).handsPresent === 0,
        `${e}: hands slide out over one bar from note ${g}`);
    }
    for (const g of backs) ok(S(g * 5 + 19).handsPresent === 1 && S(g * 5).handsPresent < 0.05, `${e}: hands back over 20 frames from note ${g}`);
    ok(R.every((r, g) => S(g * 5 + 2).windowLit === (r.held <= LN32)), `${e}: window lit iff err <= ln 32`);
    // hum, computed here
    let last = -1e9, humOk = true;
    for (let g = 0; g < 432; g++) {
      const ch = g > 0 && lr[g] !== lr[g - 1];
      if (ch) last = g;
      const want = !ch && g - last >= 7;
      if (S(g * 5).humGate !== want) humOk = false;
      if (ch && S(g * 5).humLevel !== 0) humOk = false;
    }
    ok(humOk, `${e}: hum off on step changes, back after 6 still notes`);
    // dust, shadows, tea, spoon
    let drift = 0;
    for (let f = 0; f < 700; f++) drift += Math.min(1, R[Math.floor(f / 5)].entropy / LN32) / 24;
    ok(near(S(700).dustDrift, drift, 1e-9), `${e}: dust drift = running sum of H / ln 32`);
    ok(near(S(0).shadowRadius, 1 + 5 * R[0].entropy / LN32, 1e-12) && near(S(0).dustOpacity, 0.25 + 0.75 * R[0].entropy / LN32, 1e-12), `${e}: shadow radius and dust opacity`);
    const f9 = 1200 + 7, rings = S(f9).teaRings;
    ok(rings.length > 0 && rings.every((rg) => R[rg.note].pluckVel !== null && near(rg.size, R[rg.note].pluckVel ** 2, 1e-15) && rg.age === f9 - rg.note * 5 && rg.age < 36), `${e}: tea rings sized by velocity squared`);
    let spoonOk = true;
    for (let g = 0; g < 432; g++) {
      let sum = 0;
      for (let j = Math.max(0, g - 5); j <= g; j++) sum += R[j].pluckVel ?? 0;
      if (S(g * 5).spoonChatter !== (sum / 6 >= 0.95)) spoonOk = false;
    }
    ok(spoonOk, `${e}: spoon chatter when the mean velocity of the last 6 notes >= 0.95`);
    // the knob: the needle rests on the log's step size between turns
    let needleOk = true;
    for (let g = 1; g < 432; g++) { const s4 = S(g * 5 + 4); if (!s4.knobTurning && s4.needle !== lr[g] && g * 5 + 4 >= 1445) needleOk = false; }
    ok(needleOk, `${e}: the needle stands on the step size whenever no turn is in progress`);
    ok(S(1444).needle === 0.3 && !S(1444).knobTurning, `${e}: the knob does not turn while the chalk is drawn`);
    // lines, computed here
    const cueNotes = (id) => eng.cues.filter((c) => c.id === id).map((c) => c.triggerNote);
    const dropNotes = (id) => eng.dropped.filter((c) => c.id === id).map((c) => c.trigger);
    const fired = (id) => cueNotes(id).concat(dropNotes(id));
    ok(canon(fired('L3')) === canon([R.findIndex((r) => r.massInKey >= 0.95)]), `${e}: L3 fires at the first note with 95% in key`);
    ok(canon(fired('L4')) === canon([R.findIndex((r) => r.heldAcc >= 0.5)]), `${e}: L4 fires at the first share >= 0.5`);
    ok(canon(fired('L5')) === canon([R.findIndex((r) => r.ratio >= 0.25)]), `${e}: L5 fires at the first ratio >= 0.25`);
    const after = (pred) => { const g = R.findIndex((r, i) => i > 288 && pred(r)); return g < 0 ? [] : [g]; };
    ok(canon(fired('L7')) === canon(after((r) => r.heldAcc <= acc[288] - 0.05)), `${e}: L7 trigger`);
    ok(canon(fired('L9')) === canon(after((r) => r.heldAcc < acc[288] / 2)), `${e}: L9 trigger`);
    ok(canon(fired('L8')) === canon(after((r) => r.sharp > 0 && 2 / r.sharp >= 1.8 * R[288].measured20.limit)), `${e}: L8 trigger`);
    ok(canon(fired('L10')) === canon(backs), `${e}: L10 fires when the hands come back`);
    ok(eng.cues.filter((c) => c.id === 'YES').every((c) => R[c.note].ptok >= 0.95), `${e}: every "Yes." on p(pick) >= 0.95`);
    const yes = cueNotes('YES');
    ok(yes.every((g, i) => i === 0 || g - yes[i - 1] >= 24), `${e}: "Yes." at least 24 notes apart`);
    const l6b = { main: "So that's where we'll put it.", alone: "We'll leave it where it is.", x3: "We'll give it three times that.", x10: "We'll give it ten times that." }[e];
    ok(eng.cues.some((c) => c.id === 'L6b' && c.text === l6b), `${e}: L6b says ${l6b}`);
    for (const c of eng.cues.filter((x) => x.id === 'L7' || x.id === 'L9')) {
      ok(c.text.toLowerCase().startsWith(numberText(Math.round(100 * acc[c.triggerNote]))), `${e}: ${c.id} number from the triggering note: ${c.text}`);
    }
    for (const c of eng.cues) {
      const mid = Math.floor(c.frame + 1);
      ok(S(Math.min(mid, F - 1)).subtitle === c.text || c.frame >= F, `${e}: subtitle shows ${c.id}`);
    }
  }
}
function numberText(n) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  return n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
}

// ---- 8. FORMAT events are the only ones at fixed frames ------------------------------------------------------------
section('8 FORMAT events');
{
  const key = (x) => `${x.kind}|${x.id ?? ''}`;
  const fmtFrames = (eng) => eng.events.filter((x) => x.format).map((x) => `${key(x)}@${x.frame}`).join(' ');
  for (const e of ENDINGS.slice(1)) ok(fmtFrames(engines[e]) === fmtFrames(engines.main), `${e}: FORMAT events at different frames from main`);
  for (const e of ENDINGS) {
    for (const x of engines[e].events.filter((y) => y.format)) {
      if (x.kind === 'line-dropped') { warnings.push(`${e}: FORMAT line ${x.id} dropped`); continue; }
      const onGrid = FORMAT_FRAMES.includes(x.frame);
      if (!onGrid && x.kind === 'line') warnings.push(`${e}: FORMAT line ${x.id} starts at frame ${x.frame}, not its FORMAT frame (it waited ${x.values.waitedNotes} notes for the line before it)`);
      else ok(onGrid, `${e}: FORMAT event ${key(x)} at frame ${x.frame}, not a FORMAT frame`);
    }
  }
  // a log in which nothing ever changes (every note is note 287): only FORMAT events after note 0
  const flatPart = (part, n) => ({ ...part,
    cols: Object.fromEntries(part.columns.map((k) => [k, Array(n).fill(shared.cols[k][287])])), p: Array(n).fill(shared.p[287]) });
  const flat = createEngine(flatPart(shared, 288), { ...flatPart(endingData.main, 144), measured20: endingData.main.measured20 }, { voiceDurations });
  // (a line's cause is its trigger note: the queue may start or drop it later)
  const late = flat.events.filter((x) => !x.format && !x.after && (x.triggerNote ?? x.note) > 0);
  ok(late.length === 0, `a log that never changes still has ${late.length} non-FORMAT events caused after note 0: ${late.slice(0, 3).map((x) => x.kind + '@' + x.note).join(' ')}`);
  const fmtTriggers = (eng) => eng.events.filter((x) => x.format)
    .map((x) => `${x.kind === 'line-dropped' ? 'line|' + x.id : key(x)}@${x.kind.startsWith('line') ? x.triggerNote * 5 : x.frame}`).sort().join(' ');
  ok(fmtTriggers(flat) === fmtTriggers(engines.main), 'a log that never changes keeps every FORMAT event at its frame');
  for (const e of ENDINGS) ok(fmtTriggers(engines[e]).split(' ').every((x) => FORMAT_FRAMES.includes(Number(x.split('@')[1]))), `${e}: FORMAT events fire at FORMAT frames`);
}

// ---- 9. the line queue -------------------------------------------------------------------------------------------------
section('9 line queue');
for (const e of ENDINGS) {
  const cs = engines[e].cues;
  ok(cs.every((c) => c.frame % 5 === 0), `${e}: every line starts on a note boundary`);
  ok(cs.every((c, i) => i === 0 || c.frame >= cs[i - 1].endFrame), `${e}: lines never overlap`);
  ok(cs.every((c) => c.waitedNotes <= 12), `${e}: no line waited more than 2 bars`);
  ok(engines[e].dropped.every((d) => d.reason !== 'waited 2 bars' || d.note - d.trigger === 13), `${e}: drops after 2 bars`);
  ok(cs.at(-1).id === 'GN' && cs.at(-1).frame === 2135, `${e}: "Goodnight." is the last word, at frame 2135`);
  for (const d of engines[e].dropped) warnings.push(`${e}: ${d.id} dropped (${d.reason}), fired at note ${d.trigger}`);
}

console.log(`\nline lengths: ${voiceDurations ? 'recorded (data/voice.json)' : 'estimated'}`);
console.log(`${checks} checks, ${failures} failed`);
if (warnings.length) { console.log(`${warnings.length} warnings (the bible's rules as written; see the report):`); for (const w of warnings) console.log(`  WARN ${w}`); }
process.exit(failures ? 1 : 0);
