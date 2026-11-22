// Tests the engine (src/signals.js + src/rules.js) against the bible (v1.2) and the verified run files.
//
//   node make/test-engine.mjs [<runs-dir>]      (or QH_RUNS=<runs-dir>)
//
// Exits non-zero if anything fails. Without <runs-dir> the checks against the run files are skipped (and said so).
// Every expectation in sections 6, 7 and 9 is recomputed HERE from the run files (the log as published), by code
// written from the bible's text, not from the engine's: the engine is only asked for its answers.
// What it checks:
//   1. the clock text on every frame
//   2. frames 0..1439 give deep-equal signals and gauges in all four endings; they part at frame 1440
//   3. signals(frame) and gauges(frame) are the same whatever order frames are asked in, and on a second engine
//   4. every signal on every frame of every ending is a finite number, a boolean, a string, null or a container of
//      these, with the same keys on every frame; every key of the first engine's signals is still there with the same
//      type (the picture, the lab page and the sound read them), and so is every engine member and cue field
//   5. no rule reads the ending's name (main's data under other labels gives identical everything; the source has no
//      ending names, clocks, timers or Math.random)
//   6. the packed data equals the run files (scalars exactly; probabilities within 5e-6 with exact 0 and 1 kept)
//   7. every bible rule, v1.2 included, on every note and frame of all four endings, against values computed here
//   8. FORMAT events are the only ones at fixed frames: the same frames in all endings, and in a log where nothing
//      ever changes nothing happens after note 0 but FORMAT
//   9. the lines: a second scheduler written here from bible 7 gives the same lines on the same frames with the
//      same words in all four endings; no overlaps; every data line finishes before the next FORMAT line; at most
//      once each except "Yes."; "Goodnight." last, its subtitle gone by frame 2159
//  10. the x-ray (engine.gauges): the gauges a viewer can see, each with plain words, real log fields, a short value

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
const firstBad = (n, pred) => { for (let i = 0; i < n; i++) if (!pred(i)) return i; return -1; };

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
const gseq = Object.fromEntries(ENDINGS.map((e) => [e, Array.from({ length: F }, (_, f) => canon(engines[e].gauges(f)))]));

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
for (const e of ENDINGS.slice(1)) {
  const d = firstBad(1440, (f) => seq[e][f] === seq.main[f]);
  ok(d < 0, `${e} signals differ from main at frame ${d}`);
  const dg = firstBad(1440, (f) => gseq[e][f] === gseq.main[f]);
  ok(dg < 0, `${e} gauges differ from main at frame ${dg}`);
  let p = -1;
  for (let f = 1440; f < F; f++) if (seq[e][f] !== seq.main[f]) { p = f; break; }
  ok(p === 1440, `${e} first differs from main at ${p} (expected 1440: the endings part at 20:00)`);
  // the lines, events and per-note values that fall before 20:00 are the same too
  const before = (eng) => canon(eng.cues.filter((c) => c.frame < 1440).map((c) => [c.id, c.frame, c.text, c.endFrame]));
  ok(before(engines[e]) === before(engines.main), `${e}: lines before 20:00 differ from main`);
  const evBefore = (eng) => canon(eng.events.filter((x) => x.frame < 1440));
  ok(evBefore(engines[e]) === evBefore(engines.main), `${e}: events before 20:00 differ from main`);
}

// ---- 3. order independence -----------------------------------------------------------------------------------------
section('3 order independence');
for (const e of ENDINGS) {
  const fresh = createEngine(shared, endingData[e], { voiceDurations });
  const order = Array.from({ length: F }, (_, f) => f).sort((a, b) => hash01(77, a) - hash01(77, b));
  let bad = -1, badG = -1;
  for (const f of order) {
    if (bad < 0 && canon(fresh.signals(f)) !== seq[e][f]) bad = f;
    if (badG < 0 && canon(fresh.gauges(f)) !== gseq[e][f]) badG = f;
  }
  ok(bad < 0, `${e}: frame ${bad} differs when frames are asked in shuffled order`);
  ok(badG < 0, `${e}: gauges of frame ${badG} differ when frames are asked in shuffled order`);
  ok(canon(fresh.signals(1500)) === canon(fresh.signals(1500)), `${e}: the same frame twice`);
  ok(canon(fresh.events) === canon(engines[e].events) && canon(fresh.cues) === canon(engines[e].cues), `${e}: a second engine has the same events and lines`);
}

// ---- 4. finite or null, same keys; the first engine's keys and types kept -----------------------------------------
section('4 every signal finite or null, same keys on every frame, nothing renamed or removed');
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
// every key of the first engine's signals (the engine before v1.1, as the picture, the lab page and the sound were
// written against it) with the types it ever had, over every frame of the four endings
const V1_TYPES = {"frame":"number","note":"number","noteFrame":"number","phase":"number","bar":"number","barFrame":"number","barPhase":"number","isNoteStart":"boolean","isBarLine":"boolean","clockSeconds":"number","clock":"string","filmSeconds":"number","row":"object","row.g":"number","row.logClock":"string","row.step":"number","row.lr":"number","row.tok":"number","row.tokName":"string","row.ptok":"number","row.entropy":"number","row.zsd":"number","row.held":"number","row.heldAcc":"number","row.train":"number","row.wnorm":"number","row.sharp":"number","row.sharpIters":"number","row.ratio":"number","row.stepsAfter":"number","row.massInKey":"number","row.massOutKey":"number","row.massHold":"number","row.massRest":"number","row.lrOverLimit20":"number","row.pickInKey":"boolean|null","row.midiSounded":"null|number","row.pluckVel":"null|number","row.pExactOne":"number","row.pNaN":"boolean","rowNonFinite":"array","p":"array","pick":"number","pickName":"string","pickKind":"string","pickP":"number","pickInKey":"boolean|null","pluck":"boolean","pluckVel":"null|number","entropy":"number","entropyN":"number","err":"number","share":"number","train":"number","worse":"boolean","meanRow":"number","spread":"number","stylusRow":"number","stylusWander":"number","punch":"number","stripColumns":"array","lr":"number","stepChanged":"boolean","needle":"number","needleU":"number","needleOffScale":"boolean","knobAngle":"number","knobTurning":"boolean","knobClick":"boolean","sharp":"number","limit":"null|number","hatchU":"null|number","hatchGone":"boolean","ratio":"number","lrOverLimit20":"number","limit20":"number","chalk":"number","chalkU":"number","chalkText":"string","flagsUp":"number","flagsPrevUp":"number","flagsT":"number","shareDrum":"number","shareDrumText":"string","steps":"number","stepsText":"string","cardsThisNote":"number","crankAngle":"number","warmthK":"number","warmth":"number","hairline":"null|object","tear":"number","tearBands":"array","blocks":"boolean","blockShare":"number","blockTiles":"array","handsIn":"boolean","handsPresent":"number","hands":"object","hands.present":"number","hands.left":"object","hands.right":"object","hands.fingerLift":"number","hands.fingerTap":"boolean","hands.dialTap":"number","hands.dialTapContact":"boolean","hands.gripping":"boolean","titleSlide":"number","titleVisible":"boolean","lidClosed":"number","windowLit":"boolean","humGate":"boolean","humLevel":"number","shadowRadius":"number","dustDrift":"number","dustOpacity":"number","teaRings":"array","spoonChatter":"boolean","wallMinutes":"number","wallClock":"string","minuteAngle":"number","hourAngle":"number","subtitle":"null|string","subtitleId":"null|string","subtitleStart":"null|number","speaking":"null|string","hairline.y":"number","hairline.shiftPx":"number"};
// new in v1.1 / v1.2 (added, never replacing): their types
const NEW_TYPES = { err6: 'null|number', bestErrSoFar: 'null|number', knobTurnFrom: 'null|number', knobTurnTo: 'null|number',
  sharpMedian3: 'null|number', hatchGoneSince: 'null|number', ratioNow: 'null|number', chalkTick: 'number',
  chalkNumber: 'number', shadowSoftness: 'number' };
const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const getPath = (o, p) => p.split('.').reduce((x, k) => (x === null || x === undefined ? undefined : x[k]), o);
for (const e of ENDINGS) {
  const bad = [], keysAt = new Map(), typeBad = new Set();
  const top = Object.keys(engines[e].signals(0)).sort().join();
  let diffKeys = -1;
  for (let f = 0; f < F; f++) {
    const S = engines[e].signals(f);
    shape(S, `${e}@${f}`, bad, keysAt);
    if (Object.keys(S).sort().join() !== top && diffKeys < 0) diffKeys = f;
    for (const [k, t] of Object.entries({ ...V1_TYPES, ...NEW_TYPES })) {
      const parent = k.includes('.') ? getPath(S, k.split('.')[0]) : S;
      if (parent === null) continue;                                    // a nullable object (the hairline) not there
      const v = getPath(S, k);
      if (!t.split('|').includes(typeOf(v))) typeBad.add(`${k}: ${typeOf(v)} at frame ${f}, was ${t}`);
    }
  }
  ok(bad.length === 0, `${e}: ${bad.length} non-finite, undefined or reshaped values, first ${bad.slice(0, 3).join(' | ')}`);
  ok(diffKeys < 0, `${e}: frame ${diffKeys} has different keys from frame 0`);
  ok(typeBad.size === 0, `${e}: keys missing or retyped: ${[...typeBad].slice(0, 4).join(' | ')}`);
}
{
  const eng = engines.main;
  for (const k of ['meta', 'signals', 'cues', 'dropped', 'events', 'perNote', 'knobTurns', 'dialTaps', 'note', 'subtitleAt', 'gauges'])
    ok(k in eng, `engine member ${k} is missing`);
  for (const k of ['id', 'text', 'note', 'frame', 'seconds', 'endFrame', 'subtitleEnd', 'triggerNote', 'waitedNotes', 'format', 'after', 'cutAt'])
    ok(eng.cues.every((c) => k in c), `cue field ${k} is missing`);
  for (const k of ['pick', 'pickKind', 'pickP', 'pickInKey', 'pickMidiSounded', 'velocity', 'stepChanged', 'lr', 'humGate', 'handsIn', 'worse',
    'windowLit', 'tear', 'blocks', 'spoonChatter', 'meanVel6', 'flagsUp', 'shareDrum', 'warmthK', 'entropyN', 'err', 'share', 'limitNow', 'hairline'])
    ok(Array.isArray(eng.perNote[k]) && eng.perNote[k].length === 432, `perNote.${k} is missing`);
  for (const k of ['start', 'end', 'frames', 'from', 'to', 'fromLn', 'toLn', 'note']) ok(eng.knobTurns.every((t) => k in t), `knobTurns field ${k} is missing`);
  for (const k of ['frame', 'decidedAt', 'performed', 'reason', 'contacts']) ok(eng.dialTaps.every((t) => k in t), `dialTaps field ${k} is missing`);
}

// ---- 5. no rule reads the ending's name -----------------------------------------------------------------------------
section("5 no rule reads the ending's name");
for (const label of ['alone', 'x3', 'x10', 'zz']) {
  const relabelled = createEngine(shared, { ...endingData.main, ending: label }, { name: label, voiceDurations });
  let bad = -1;
  for (let f = 0; f < F; f++) if (canon(relabelled.signals(f)) !== seq.main[f] || canon(relabelled.gauges(f)) !== gseq.main[f]) { bad = f; break; }
  ok(bad < 0, `main's data labelled ${label}: signals or gauges differ at frame ${bad}`);
  for (const k of ['cues', 'events', 'perNote', 'dropped', 'lineReport', 'knobTurns', 'dialTaps'])
    ok(canon(relabelled[k]) === canon(engines.main[k]), `main's data labelled ${label}: ${k} differ`);
  ok(relabelled.meta.ending === label, 'the label is kept as a label');
}
for (const f of ['src/signals.js', 'src/rules.js', 'src/time.js', 'src/rng.js']) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/['"`](main|alone|x3|x10)['"`]/.test(code), `${f} names an ending in its code`);
  ok(!/\b(Date|performance|requestAnimationFrame|setTimeout|setInterval)\b|Math\.random/.test(code), `${f} uses a clock, a timer or Math.random`);
}

// ---- the bible's rules, recomputed here from a log (used by 7, 8 and 9) ----------------------------------------------
// R: the 432 note rows (run-file names: held, heldAcc, lr, sharp, ptok, massInKey, entropy, pluckVel ...); limit20:
// the limit measured at 20:00. Written from the bible's text, independently of src/.
const VOICE_BY_TEXT = voiceDurations || {};
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
function bibleModel(R, limit20) {
  const N = 432, B = 288;
  const held = R.map((r) => r.held), acc = R.map((r) => r.heldAcc), lr = R.map((r) => r.lr), sharp = R.map((r) => r.sharp);
  const worse = held.map((e) => !(e <= LN32 + 1e-9));                                       // bible 3 hands rule 1 (v1.1)
  // hands: out at the first worse note; back once 6 notes in a row are at or below ln 32
  const handsIn = [], outs = [], backs = [], backSince = [];
  let state = true, run = 0, back = false;
  for (let g = 0; g < N; g++) {
    if (state && worse[g]) { state = false; run = 0; back = false; outs.push(g); }
    else if (!state) { run = worse[g] ? 0 : run + 1; if (run === 6) { state = true; back = true; backs.push(g); } }
    handsIn.push(state); backSince.push(state && back);
  }
  // hatching: 2 / median of the last 3 readings; gone for good from the first reading after 20:00 not above 0
  let lost = Infinity;
  for (let g = B + 1; g < N; g++) if (!(sharp[g] > 0)) { lost = g; break; }
  const median3 = sharp.map((_, g) => { const w = sharp.slice(Math.max(0, g - 2), g + 1).sort((a, b) => a - b); return w[(w.length - 1) >> 1]; });
  const limitNow = median3.map((m, g) => (g >= lost || !(m > 0) ? null : 2 / m));
  const ratioNow = limitNow.map((L, g) => (L === null ? null : lr[g] / L));
  // means of the last 6 (fewer at the start)
  const mean6 = (arr, g) => { const w = arr.slice(Math.max(0, g - 5), g + 1); return w.reduce((s, x) => s + x, 0) / w.length; };
  const err6 = held.map((_, g) => mean6(held, g));
  let best20 = Infinity; for (let g = 0; g <= B; g++) best20 = Math.min(best20, held[g]);
  const bestSoFar = []; { let b = Infinity; for (let g = 0; g < N; g++) { b = Math.min(b, held[g]); bestSoFar.push(b); } }
  const hN = R.map((r) => Math.min(1, r.entropy / LN32));
  // the knob: turns on every note whose step size differs from the note before, its first 3 frames, at 20:00 after
  // the chalk tick (frames 1442..1444)
  const turns = [];
  for (let g = 1; g < N; g++) if (lr[g] !== lr[g - 1]) { const s = g === B ? 1442 : 5 * g; turns.push({ g, frames: [s, s + 1, s + 2], from: lr[g - 1], to: lr[g] }); }
  // the lines (bible 7)
  const share20 = acc[B];
  const rule = {
    L3: (g) => R[g].massInKey >= 0.95, L4: (g) => acc[g] >= 0.5, YES: (g) => R[g].ptok >= 0.95,
    L5: (g) => ratioNow[g] !== null && ratioNow[g] >= 0.25,
    L7: (g) => g > B && share20 - acc[g] >= 0.05 - 1e-15 && acc[g] >= share20 / 2 && handsIn[g],
    L8: (g) => g > B && limitNow[g] !== null && limitNow[g] >= 1.8 * limit20,
    L9: (g) => g > B && acc[g] < share20 / 2, L10: (g) => backSince[g],
  };
  const n288 = lr[B] / limit20;
  const L6b = lr[B] === lr[B - 1] ? "We'll leave it where it is." : Math.abs(n288 - 1) < 1e-9 ? "So that's where we'll put it."
    : `We'll give it ${words(Math.round(n288))} times that.`;
  const text = { L1: "Good evening. It hasn't heard a tune yet, so it plays every note at once.", L2: "That's how big a step it takes after a mistake. Not too big.",
    L3: "It's found the key. Nobody told it one.", L4: "Every second note right. On tunes it's never heard.", YES: 'Yes.',
    L5: "A quarter of the way to the edge now. Nobody's touched it.", L6a: "That's as big a step as it can take.", L6b, L8: "It's made itself room.",
    L10: 'There you are.', GN: 'Goodnight.' };
  const textAt = (id, g) => (id === 'L7' ? `${Cap(words(Math.round(100 * acc[g])))} in a hundred. It'll find it again.`
    : id === 'L9' ? `${Cap(words(Math.round(100 * acc[g])))} in a hundred.` : text[id]);
  const secondsOf = (t) => VOICE_BY_TEXT[t] ?? (t.trim().split(/\s+/).length * 60) / 130 + 0.3;
  const FORMAT_LINES = { 30: 'L1', 360: 'L2', 1445: 'L6a', 2135: 'GN' };
  const formatFrames = Object.keys(FORMAT_LINES).map(Number);
  const lines = [];
  let freeAt = 0, saidOnce = new Set(), lastYes = -1e9, l6bNext = false, over = false;
  for (let g = 0; g < N; g++) {
    const f = 5 * g;
    if (FORMAT_LINES[f]) {
      const id = FORMAT_LINES[f], t = textAt(id, g);
      lines.push({ id, frame: f, text: t }); freeAt = f + 24 * secondsOf(t);
      if (id === 'L6a') l6bNext = true;
      if (id === 'GN') over = true;
      continue;
    }
    if (over || freeAt > f) continue;
    if (l6bNext) { lines.push({ id: 'L6b', frame: f, text: L6b }); freeAt = f + 24 * secondsOf(L6b); l6bNext = false; continue; }
    const next = Math.min(...formatFrames.filter((x) => x > f));
    for (const id of ['L10', 'L3', 'L4', 'YES', 'L5', 'L7', 'L8', 'L9']) {
      if (!rule[id](g)) continue;
      if (id === 'YES' ? g - lastYes < 24 : saidOnce.has(id)) continue;
      const t = textAt(id, g), end = f + 24 * secondsOf(t);
      if (end > next) continue;
      lines.push({ id, frame: f, text: t }); freeAt = end; saidOnce.add(id); if (id === 'YES') lastYes = g;
      break;
    }
  }
  return { held, acc, lr, sharp, worse, handsIn, outs, backs, backSince, lost, median3, limitNow, ratioNow, err6, best20, bestSoFar, hN, turns, rule, lines, secondsOf, L6b };
}

// ---- 6 + 7 + 9. against the run files -------------------------------------------------------------------------------
const LOG_KEYS = new Set(['err', 'errLast6', 'err6', 'share', 'shareBarBefore', 'share20', 'ptok', 'pick', 'entropy', 'massInKey', 'lr', 'lrBefore', 'lrLast7',
  'lr287', 'lr288', 'sharp', 'median3', 'limit', 'limitNow', 'ratioNow', 'meanVel6', 'from', 'to', 'chalk', 'limit20', 'times', 'bestSoFar', 'g']);
if (!RUNS) {
  warnings.push('no <runs-dir> given: the checks against the run files (6, 7, 9 lines) were skipped');
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

  section('7 bible rules (v1.2) against values computed from the run files');
  for (const e of ENDINGS) {
    const eng = engines[e], R = runs[e];
    const S = (f) => eng.signals(f);
    const X = bibleModel(R, R[288].measured20.limit);
    const { held, acc, lr } = X;
    const allNotes = (pred) => firstBad(432, pred);
    const allFrames = (pred) => firstBad(F, pred);
    // section 3 table: the strip
    const g0 = 287, f0 = g0 * 5 + 2, s = S(f0);
    ok(near(s.stripColumns.at(-1).haze[17], 0.85 * Math.sqrt(R[g0].p[17]), 1e-5), `${e}: haze alpha = 0.85 sqrt(p)`);
    ok(near(s.stripColumns.at(-1).holeR, 0.25 + 0.75 * R[g0].ptok, 1e-15), `${e}: hole radius = 0.25 + 0.75 p(pick)`);
    ok(s.stripColumns.at(-1).x === -0.4 && s.stripColumns.at(-2).x === -1.4, `${e}: strip scroll x = (g - note) - phase`);
    for (const g of [0, 100, 288, 300, 431]) {
      const p = R[g].p, sum = p.reduce((a, b) => a + b, 0), m = p.reduce((a, x, i) => a + x * i, 0) / sum;
      const sd = Math.sqrt(p.reduce((a, x, i) => a + x * (i - m) ** 2, 0) / sum);
      ok(near(S(g * 5).meanRow, m, 1e-4) && near(S(g * 5).spread, sd, 1e-3), `${e}: note ${g} mean row ${S(g * 5).meanRow} vs ${m}, spread`);
      const fl = Math.round(10 * acc[g - (g % 6)]);
      ok(S(g * 5 + 3).flagsUp === fl && S(g * 5).shareDrum === Math.round(100 * acc[g]), `${e}: note ${g} flags ${fl} and drum`);
      ok(S(g * 5).steps === R[g].step && S(g * 5).cardsThisNote === R[g].stepsAfter, `${e}: note ${g} LESSONS`);
    }
    ok(allNotes((g) => near(S(g * 5).entropyN, Math.min(1, R[g].entropy / LN32), 1e-15)) < 0, `${e}: H / ln 32 on every note`);
    ok(allNotes((g) => near(R[g].ratio, R[g].lr * R[g].sharp / 2, 1e-9) && S(g * 5).ratio === R[g].ratio) < 0, `${e}: the log's ratio = lr sharp / 2, carried as ratio`);
    // (v1.1) worse than guessing = err > ln 32 + 1e-9; note 0's error is ln 32 to the last bits and is not worse
    ok(Math.abs(held[0] - LN32) < 1e-12 && !S(0).worse && S(0).handsIn, `${e}: note 0 (err ${held[0]}) is not worse than guessing`);
    ok(allNotes((g) => S(g * 5).worse === X.worse[g]) < 0, `${e}: worse = err > ln 32 + 1e-9 on every note`);
    // (v1.1) warmth from the mean error of the last 6 notes
    let wb = allNotes((g) => { const k = Math.min(1, Math.max(0, (LN32 - X.err6[g]) / (LN32 - X.best20)));
      return near(S(g * 5 + 1).warmthK, k, 1e-12) && near(S(g * 5 + 1).warmth, 0.15 + 0.85 * S(g * 5 + 1).warmthK, 1e-15) && near(S(g * 5).err6, X.err6[g], 1e-12); });
    ok(wb < 0, `${e}: warmth k from err6 at note ${wb}`);
    // (v1.1) tears from the best error so far: floor(8 g) bands within 24 g px; none while it learns (before 20:00)
    wb = allNotes((g) => { const tg = Math.min(1, Math.max(0, Math.log(held[g] / X.bestSoFar[g]) / Math.log(250)));
      const Sg = S(g * 5 + 2);
      return near(Sg.tear, tg, 1e-12) && Sg.tearBands.length === Math.floor(8 * tg) && Sg.tearBands.every((b) => Math.abs(b.dxPx) <= 24 * tg + 0.5)
        && Sg.bestErrSoFar === X.bestSoFar[g]; });
    ok(wb < 0, `${e}: tears from the best error so far, note ${wb}`);
    ok(allFrames((f) => f >= 1440 || S(f).tearBands.length === 0) < 0, `${e}: nothing tears before 20:00`);
    ok(allNotes((g) => S(g * 5 + 4).blocks === (held[g] > 10 * LN32) && (S(g * 5).blocks || S(g * 5).blockTiles.length === 0)) < 0, `${e}: blocks when err > 10 ln 32`);
    // (v1.1) hatching: median of 3, the latch after 20:00
    wb = allNotes((g) => { const Sg = S(g * 5 + 3), L = X.limitNow[g];
      return (L === null ? Sg.limit === null && Sg.hatchU === null && Sg.hatchGone : near(Sg.limit, L, 1e-12) && !Sg.hatchGone
        && near(Sg.hatchU, Math.min(1, Math.max(0, Math.log(L / 0.03) / Math.log(1000))), 1e-12))
        && Sg.sharpMedian3 === X.median3[g] && Sg.hatchGoneSince === (g >= X.lost ? X.lost : null); });
    ok(wb < 0, `${e}: hatching = 2 / median of the last 3 readings, latched off after 20:00, note ${wb}`);
    const gone = eng.events.filter((x) => x.kind === 'hatch-gone'), backH = eng.events.filter((x) => x.kind === 'hatch-back');
    ok(X.lost === Infinity ? gone.length === 0 : gone.length === 1 && gone[0].note === X.lost && gone[0].values.sharp === Number(R[X.lost].sharp.toPrecision(6)),
      `${e}: one hatch-gone event at the latch note ${X.lost} (got ${gone.map((x) => x.note)})`);
    ok(backH.every((x) => x.note < X.lost), `${e}: the hatching never comes back after the latch`);
    // (v1.1) hairlines only while the hatching exists, on ratio now > 1; L5's ratio is the same smoothed one
    wb = allNotes((g) => { const Sg = S(g * 5 + 1), rn = X.ratioNow[g];
      return (Sg.hairline !== null) === (rn !== null && rn > 1) && (rn === null ? Sg.ratioNow === null : near(Sg.ratioNow, rn, 1e-12)); });
    ok(wb < 0, `${e}: hairlines on ratio now > 1 with the hatching there, note ${wb}`);
    // the clocks and the crank (FORMAT)
    ok(near(S(15).crankAngle, Math.PI, 1e-15) && S(30).crankAngle === 0 && near(S(29).crankAngle, 2 * Math.PI * 29 / 30, 1e-15), `${e}: crank one turn per bar`);
    ok(S(0).wallClock === '23:30' && S(1440).wallClock === '23:50' && S(2159).wallClock === '23:59', `${e}: wall clock`);
    ok(S(0).titleSlide === 0 && S(89).titleSlide === 0 && S(119).titleSlide === 1 && S(100).titleSlide > 0, `${e}: title card slides over 90..119`);
    // (v1.1) the 20:00 choreography: tick 1440..1441, number 1440..1444, the knob 1442..1444 if the step changed
    ok(S(1439).chalkTick === 0 && S(1440).chalkTick === 0.5 && S(1441).chalkTick === 1 && S(1444).chalkTick === 1 && S(2159).chalkTick === 1, `${e}: chalk tick drawn over frames 1440..1441`);
    ok(S(1439).chalk === 0 && near(S(1440).chalk, 0.2) && near(S(1442).chalk, 0.6) && S(1444).chalk === 1 && S(1444).chalkNumber === 1 && S(1440).chalkText === R[288].measured20.limit.toFixed(2) && S(1440).chalkText === '0.98',
      `${e}: the number chalked over frames 1440..1444, "0.98" read from the data`);
    ok(S(1440).clock === '20:00' && S(1440).needle === lr[287] && S(1440).chalkTick > 0, `${e}: frame 1440 shows the needle, the chalk and 20:00`);
    const changed288 = lr[288] !== lr[287];
    ok(S(1441).needle === lr[287] && !S(1441).knobTurning && S(1444).needle === lr[288] && S(1442).knobTurning === changed288 && S(1442).knobClick === changed288 && S(1445).knobTurning === (lr[289] !== lr[288]),
      `${e}: at 20:00 the knob turns over frames 1442..1444 (only if the step changed) and the needle lands inside the 20:00 note`);
    // (v1.1) the knob on every later step change: the note's first 3 frames; needle on the step size when still
    const turnFrame = new Map();
    for (const t of X.turns) for (const f of t.frames) turnFrame.set(f, t);
    wb = allFrames((f) => S(f).knobTurning === turnFrame.has(f) && S(f).knobClick === (turnFrame.get(f)?.frames[0] === f)
      && (turnFrame.has(f) ? (f === turnFrame.get(f).frames[2] ? S(f).needle === turnFrame.get(f).to : true) && S(f).knobTurnTo === turnFrame.get(f).to
        : S(f).needle === lr[Math.floor(f / 5) - (f < 1442 && f >= 1440 ? 1 : 0)] && S(f).knobTurnTo === null));
    ok(wb < 0, `${e}: knob turns on the first 3 frames of every note with a new step size (1442..1444 at 20:00), frame ${wb}`);
    ok(eng.knobTurns.length === X.turns.length && eng.knobTurns.every((t, i) => t.start === X.turns[i].frames[0] && t.frames === 3 && t.from === X.turns[i].from && t.to === X.turns[i].to),
      `${e}: ${X.turns.length} knob turns, the same as the log's step changes`);
    // (v1.1) the left hand grips while turns keep coming (to the end of each turn's note), only with the hands there
    wb = allFrames((f) => { let want = false;
      for (let k = 0; k <= 2; k++) if (turnFrame.has(f - k) && (k === 0 || turnFrame.get(f - k).frames[2] === f - k)) want = true;
      want = want && X.handsIn[Math.floor(f / 5)];
      const pose = f >= 2130 && X.handsIn[426] ? 'lid' : f >= 80 && f <= 124 ? 'card' : f >= 1410 && f <= 1441 ? 'chalk' : null;
      return S(f).hands.gripping === (pose === null && want); });
    ok(wb < 0, `${e}: the left hand grips the knob while turns keep coming, frame ${wb}`);
    if (changed288 && X.handsIn[288]) ok(S(1443).hands.left.grip === 1 && S(1442).hands.left.grip === 0.5, `${e}: the left hand reaches the knob by frame 1443 for the 20:00 turn`);
    else ok(!S(1442).hands.gripping && S(1447).hands.left.rest > S(1442).hands.left.rest, `${e}: no 20:00 turn: the left hand goes back to rest after the chalk`);
    ok(allFrames((f) => near(Object.values(S(f).hands.left).reduce((a, b) => a + b, 0), 1, 1e-12)) < 0, `${e}: the left hand's pose weights sum to 1`);
    // hands rule 1 and (v1.1) the window on the same switch
    ok(canon(eng.events.filter((x) => x.kind === 'hands-out').map((x) => x.note)) === canon(X.outs), `${e}: hands out at ${X.outs}`);
    ok(canon(eng.events.filter((x) => x.kind === 'hands-back').map((x) => x.note)) === canon(X.backs), `${e}: hands back at ${X.backs}`);
    for (const g of X.outs) {
      if (X.handsIn.slice(g, g + 6).some((x) => x)) continue;           // only when they stay out for the whole bar
      ok(S(g * 5).handsPresent < 1 && S(g * 5).handsPresent > 0.99 && S(g * 5 + 28).handsPresent > 0 && S(g * 5 + 29).handsPresent === 0,
        `${e}: hands slide out over one bar from note ${g}`);
    }
    for (const g of X.backs) ok(S(g * 5 + 19).handsPresent === 1 && S(g * 5).handsPresent < 0.05, `${e}: hands back over 20 frames from note ${g}`);
    ok(allFrames((f) => S(f).windowLit === X.handsIn[Math.floor(f / 5)] && S(f).handsIn === X.handsIn[Math.floor(f / 5)]) < 0, `${e}: the window and the hands on one switch (6-note hysteresis)`);
    ok(canon(eng.events.filter((x) => x.kind === 'window-dark').map((x) => x.note)) === canon(X.outs)
      && canon(eng.events.filter((x) => x.kind === 'window-lit').map((x) => x.note)) === canon(X.backs), `${e}: window events with the hands'`);
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
    // (v1.2) the shadow: 1 + 14 x mean H / ln 32 of the last 6 notes
    wb = allNotes((g) => { const soft = X.hN.slice(Math.max(0, g - 5), g + 1).reduce((a, b) => a + b, 0) / Math.min(6, g + 1);
      return near(S(g * 5 + 4).shadowSoftness, soft, 1e-12) && near(S(g * 5 + 4).shadowRadius, 1 + 14 * soft, 1e-12); });
    ok(wb < 0, `${e}: shadow softness and radius at note ${wb}`);
    ok(near(S(0).shadowRadius, 15, 1e-12), `${e}: the shadow is at its softest (15) when the bet is even`);
    // dust, tea, spoon
    let drift = 0;
    for (let f = 0; f < 700; f++) drift += Math.min(1, R[Math.floor(f / 5)].entropy / LN32) / 24;
    ok(near(S(700).dustDrift, drift, 1e-9), `${e}: dust drift = running sum of H / ln 32`);
    ok(near(S(0).dustOpacity, 0.25 + 0.75 * R[0].entropy / LN32, 1e-12), `${e}: dust opacity`);
    const f9 = 1200 + 7, rings = S(f9).teaRings;
    ok(rings.length > 0 && rings.every((rg) => R[rg.note].pluckVel !== null && near(rg.size, R[rg.note].pluckVel ** 2, 1e-15) && rg.age === f9 - rg.note * 5 && rg.age < 36), `${e}: tea rings sized by velocity squared`);
    let spoonOk = true;
    for (let g = 0; g < 432; g++) {
      let sum = 0;
      for (let j = Math.max(0, g - 5); j <= g; j++) sum += R[j].pluckVel ?? 0;
      if (S(g * 5).spoonChatter !== (sum / 6 >= 0.95)) spoonOk = false;
    }
    ok(spoonOk, `${e}: spoon chatter when the mean velocity of the last 6 notes >= 0.95`);
    // every event carries the log values that caused it; grip, hum-on and the knob checked against the run file
    const noValues = eng.events.filter((x) => !x.format && !Object.keys(x.values).some((k) => LOG_KEYS.has(k) || /^lr\d+$/.test(k)));
    ok(noValues.length === 0, `${e}: ${noValues.length} non-FORMAT events carry no log value: ${noValues.slice(0, 3).map((x) => x.kind).join(' ')}`);
    const v6 = (x) => Number(x.toPrecision(6));
    for (const x of eng.events.filter((y) => y.kind === 'grip-on' || y.kind === 'grip-off')) {
      ok(x.values.lr === v6(lr[x.note]) && x.values.lrBefore === v6(lr[x.note - 1]) && x.values.handsIn === X.handsIn[x.note]
        && (x.kind === 'grip-on' ? lr[x.note] !== lr[x.note - 1] : lr[x.note] === lr[x.note - 1] || !X.handsIn[x.note]), `${e}: ${x.kind} at frame ${x.frame} carries its cause`);
    }
    for (const x of eng.events.filter((y) => y.kind === 'hum-on')) {
      const w = lr.slice(x.note - 6, x.note + 1);
      ok(canon(x.values.lrLast7) === canon(w.map(v6)) && w.every((v) => v === w[0]), `${e}: hum-on at note ${x.note} carries 7 equal step sizes`);
    }
    for (const x of eng.events.filter((y) => y.kind === 'knob-turn')) ok(x.values.to === v6(lr[x.note]) && x.values.lrBefore === v6(lr[x.note - 1]), `${e}: knob-turn at note ${x.note} carries its step sizes`);
    for (const x of eng.events.filter((y) => y.kind === 'hairlines-on' || y.kind === 'hairlines-off'))
      ok((x.kind === 'hairlines-on') === (X.ratioNow[x.note] !== null && X.ratioNow[x.note] > 1) && (x.values.ratioNow === null ? X.ratioNow[x.note] === null : near(x.values.ratioNow, X.ratioNow[x.note], 1e-5)), `${e}: ${x.kind} at note ${x.note}`);
    for (const x of eng.events.filter((y) => y.kind === 'tears-on' || y.kind === 'tears-off'))
      ok(x.values.err === v6(held[x.note]) && x.values.bestSoFar === v6(X.bestSoFar[x.note]), `${e}: ${x.kind} at note ${x.note} carries err and the best so far`);

    // ---- 9 (with the run file): the lines --------------------------------------------------------------------------
    const got = eng.cues.map((c) => `${c.id}@${c.frame}:${c.text}`), want = X.lines.map((c) => `${c.id}@${c.frame}:${c.text}`);
    const d = firstBad(Math.max(got.length, want.length), (i) => got[i] === want[i]);
    ok(d < 0, `${e}: the lines differ from bible 7 at line ${d}: engine ${got[d]} vs here ${want[d]}`);
    for (const c of eng.cues) {
      if (c.format || c.after) continue;
      ok(X.rule[c.id](c.note), `${e}: ${c.id} spoken at note ${c.note} where its rule does not hold`);
      ok(c.triggerNote === c.note && c.ruleFrom <= c.note && c.waitedNotes === c.note - c.ruleFrom
        && Array.from({ length: c.note - c.ruleFrom + 1 }, (_, i) => X.rule[c.id](c.ruleFrom + i)).every(Boolean), `${e}: ${c.id} held from note ${c.ruleFrom} to ${c.note}`);
      if (c.id === 'L7' || c.id === 'L9') ok(c.text.toLowerCase().startsWith(words(Math.round(100 * acc[c.note]))) && c.values.share === v6(acc[c.note]),
        `${e}: ${c.id} reads its number at the note it is spoken on: ${c.text}`);
      ok(c.seconds === X.secondsOf(c.text), `${e}: ${c.id} length ${c.seconds}`);
    }
    ok(eng.cues.some((c) => c.id === 'L6b' && c.text === X.L6b), `${e}: L6b says ${X.L6b}`);
    const l6b = { main: "So that's where we'll put it.", alone: "We'll leave it where it is.", x3: "We'll give it three times that.", x10: "We'll give it ten times that." }[e];
    ok(X.L6b === l6b, `${e}: L6b by the run's step size at 20:00 is the expected "${l6b}"`);
    for (const x of eng.dropped) ok(X.rule[x.id](x.trigger) && !eng.cues.some((c) => c.id === x.id), `${e}: never-spoken ${x.id} held at note ${x.trigger}`);
    for (const id of ['L3', 'L4', 'L5', 'L7', 'L8', 'L9', 'L10']) {
      const held_ = Array.from({ length: 432 }, (_, g) => X.rule[id](g)).some(Boolean), said = eng.cues.some((c) => c.id === id);
      ok(held_ === (said || eng.dropped.some((x) => x.id === id)), `${e}: ${id} is either spoken, listed as never spoken, or its rule never held`);
    }
    for (const c of eng.cues) {
      const mid = Math.min(c.frame + 1, F - 1);
      ok(S(mid).subtitle === c.text && S(mid).subtitleId === c.id, `${e}: subtitle shows ${c.id}`);
    }
  }
}

// ---- 8. FORMAT events are the only ones at fixed frames ------------------------------------------------------------
section('8 FORMAT events');
{
  const key = (x) => `${x.kind}|${x.id ?? ''}`;
  const fmtFrames = (eng) => eng.events.filter((x) => x.format).map((x) => `${key(x)}@${x.frame}`).join(' ');
  for (const e of ENDINGS.slice(1)) ok(fmtFrames(engines[e]) === fmtFrames(engines.main), `${e}: FORMAT events at different frames from main`);
  for (const e of ENDINGS) {
    for (const x of engines[e].events.filter((y) => y.format)) ok(FORMAT_FRAMES.includes(x.frame), `${e}: FORMAT event ${key(x)} at frame ${x.frame}, not a FORMAT frame`);
    ok(engines[e].events.filter((x) => x.kind === 'line' && x.format).map((x) => `${x.id}@${x.frame}`).join(' ') === 'L1@30 L2@360 L6a@1445 GN@2135', `${e}: FORMAT lines at 30, 360, 1445, 2135`);
    // nothing else is keyed to the frame: every non-FORMAT event's frame comes from its note (a knob turn and the grip
    // from the turn's frames, which are its note's first 3 or, at 20:00, the 3 after the chalk tick)
    for (const x of engines[e].events.filter((y) => !y.format)) {
      if (x.kind === 'knob-turn' || x.kind.startsWith('grip')) continue;
      ok(x.frame === x.note * 5 || (x.kind === 'line' && x.after), `${e}: ${key(x)} at frame ${x.frame} is not on its note ${x.note}`);
    }
  }
  // a log in which nothing ever changes (every note is note 287): only FORMAT events after note 0
  const flatPart = (part, n) => ({ ...part,
    cols: Object.fromEntries(part.columns.map((k) => [k, Array(n).fill(shared.cols[k][287])])), p: Array(n).fill(shared.p[287]) });
  const flat = createEngine(flatPart(shared, 288), { ...flatPart(endingData.main, 144), measured20: endingData.main.measured20 }, { voiceDurations });
  // (a line's cause is the note its rule started holding: the voice may make it wait)
  const late = flat.events.filter((x) => !x.format && !x.after && (x.kind === 'line' ? x.ruleFrom : x.triggerNote ?? x.note) > 0);
  ok(late.length === 0, `a log that never changes still has ${late.length} non-FORMAT events caused after note 0: ${late.slice(0, 3).map((x) => `${x.kind}${x.id ? ':' + x.id : ''}@${x.note}`).join(' ')}`);
  ok(flat.knobTurns.length === 0 && flat.events.every((x) => !/^(hands|window|grip|tears|blocks|hatch|hum)/.test(x.kind) || x.note === 0), 'a log that never changes: no knob, no hands, no window, no glitches');
  const fmtAt = (eng) => eng.events.filter((x) => x.format).map((x) => `${key(x)}@${x.frame}`).sort().join(' ');
  ok(fmtAt(flat) === fmtAt(engines.main), 'a log that never changes keeps every FORMAT event at its frame');
  // (v1.1) worse than guessing is err > ln 32 + 1e-9. In this data note 0's error is 4.5e-14 under ln 32, so the
  // tolerance is proved on a log whose first 13 notes sit 1e-12 over ln 32 (not worse) or 1e-8 over (worse)
  const nudged = (dx) => createEngine({ ...shared, cols: { ...shared.cols, held: shared.cols.held.map((x, g) => (g <= 12 ? LN32 + dx : x)) } },
    endingData.alone, { voiceDurations });
  const nOk = nudged(1e-12), nWorse = nudged(1e-8);
  ok(!nOk.signals(0).worse && nOk.signals(0).handsIn && nOk.signals(0).windowLit && !nOk.events.some((x) => x.kind === 'hands-out'),
    'err = ln 32 + 1e-12 is not worse than guessing (the hands stay)');
  ok(nWorse.signals(0).worse && !nWorse.signals(0).handsIn && !nWorse.signals(0).windowLit && nWorse.events.some((x) => x.kind === 'hands-out' && x.note === 0),
    'err = ln 32 + 1e-8 is worse than guessing (the hands leave at note 0)');
  const fs1 = flat.signals(1700), fs2 = flat.signals(2000);
  ok(fs1.warmth === fs2.warmth && fs1.shadowRadius === fs2.shadowRadius && fs1.hairline === null === (fs2.hairline === null) && fs1.windowLit && fs2.windowLit,
    'a log that never changes: the picture and the room hold still');
}

// ---- 9. the lines, without the run files --------------------------------------------------------------------------------
section('9 lines');
for (const e of ENDINGS) {
  const eng = engines[e], cs = eng.cues;
  const fmtLines = cs.filter((c) => c.format);
  ok(cs.every((c) => c.frame % 5 === 0), `${e}: every line starts on a note boundary`);
  ok(cs.every((c, i) => i === 0 || c.frame >= cs[i - 1].endFrame), `${e}: lines never overlap`);
  for (const c of cs.filter((x) => !x.format && !x.after)) {
    const next = fmtLines.find((x) => x.frame > c.frame);
    ok(!next || c.endFrame <= next.frame, `${e}: ${c.id} at ${c.frame} ends at ${c.endFrame}, after the next FORMAT line (${next && next.frame})`);
  }
  const ids = cs.map((c) => c.id).filter((id) => id !== 'YES');
  ok(ids.length === new Set(ids).size, `${e}: a line other than "Yes." spoken twice: ${ids.join(' ')}`);
  const yes = cs.filter((c) => c.id === 'YES').map((c) => c.note);
  ok(yes.every((g, i) => i === 0 || g - yes[i - 1] >= 24), `${e}: "Yes." at least 24 notes apart`);
  const l6a = cs.find((c) => c.id === 'L6a'), l6b = cs.find((c) => c.id === 'L6b');
  ok(l6a && l6a.frame === 1445 && l6b && l6b.frame === Math.ceil(l6a.endFrame / 5) * 5 && cs[cs.indexOf(l6a) + 1] === l6b, `${e}: L6a at 1445, L6b directly after it`);
  ok(cs.at(-1).id === 'GN' && cs.at(-1).frame === 2135 && cs.filter((c) => c.id === 'GN').length === 1, `${e}: "Goodnight." is the last word, at frame 2135`);
  ok(cs.every((c) => c.subtitleEnd <= 2160) && eng.subtitleAt(2159)?.id === 'GN' && eng.subtitleAt(2160) === null && eng.subtitleAt(2399) === null,
    `${e}: the "Goodnight." subtitle ends by frame 2159`);
  ok(cs.every((c) => c.waitedNotes >= 0) && eng.dropped.every((d) => !cs.some((c) => c.id === d.id)), `${e}: never-spoken lines are not spoken`);
  for (const d of eng.dropped) warnings.push(`${e}: ${d.id} never spoken: ${d.reason}`);
  for (const c of cs) if (!c.recorded) warnings.push(`${e}: "${c.text}" (${c.id}, ${clockText(c.frame)}) has no recording yet: its length is an estimate`);
}

// ---- 10. the x-ray --------------------------------------------------------------------------------------------------------
section('10 gauges');
{
  const IDS = ['clock', 'haze', 'hole', 'stylus', 'needle', 'hatching', 'chalk', 'knob', 'flags', 'drum', 'lessons', 'crank', 'warmth',
    'hairlines', 'tears', 'blocks', 'hands', 'window', 'hum', 'dust', 'shadow', 'tea', 'wallClock', 'subtitle'];
  const FIELDS = new Set([...shared.columns, 'p', 'measured20.limit']);
  for (const e of ENDINGS) {
    const eng = engines[e];
    let bad = [];
    for (const f of [0, 360, 1439, 1440, 1442, 1445, 1600, 1800, 1950, 2135, 2159]) {
      const G = eng.gauges(f), S = eng.signals(f);
      if (canon(G.map((x) => x.id)) !== canon(IDS)) bad.push(`${f}: ids ${G.map((x) => x.id)}`);
      for (const x of G) {
        if (typeof x.name !== 'string' || !x.name || x.name.includes(':')) bad.push(`${f} ${x.id}: name`);
        if (!Array.isArray(x.reads) || !x.reads.every((r) => FIELDS.has(r))) bad.push(`${f} ${x.id}: reads ${x.reads}`);
        if (typeof x.value !== 'string' || !x.value || (x.id !== 'subtitle' && x.value.length > 56)) bad.push(`${f} ${x.id}: value ${x.value}`);
        if (typeof x.rule !== 'string' || !x.rule) bad.push(`${f} ${x.id}: rule`);
        if (/\b(model|network|train(ing)?|loss|learning|gradient|neural|lr)\b/i.test(x.name + ' ' + x.value)) bad.push(`${f} ${x.id}: a word the film never says`);
      }
      const by = Object.fromEntries(G.map((x) => [x.id, x.value]));
      if (by.clock !== S.clock || by.wallClock !== S.wallClock || by.drum !== S.shareDrumText || by.lessons !== S.stepsText) bad.push(`${f}: clock / drum / lessons values`);
      if (by.window !== (S.windowLit ? 'lit' : 'dark')) bad.push(`${f}: window`);
      if ((by.chalk === 'not yet') !== (f < 1440)) bad.push(`${f}: chalk`);
      if (by.subtitle !== (S.subtitle ?? 'nothing')) bad.push(`${f}: subtitle`);
      if (!by.needle.startsWith(String(Number(S.needle.toPrecision(3))))) bad.push(`${f}: needle ${by.needle} vs ${S.needle}`);
      if ((S.hatchGone && !/^(gone|none)/.test(by.hatching)) || (!S.hatchGone && /^(gone|none)/.test(by.hatching))) bad.push(`${f}: hatching ${by.hatching}`);
    }
    ok(bad.length === 0, `${e}: gauges: ${bad.slice(0, 4).join(' | ')}`);
  }
}

console.log(`\nline lengths: ${voiceDurations ? 'recorded (data/voice.json)' : 'estimated'}`);
console.log(`${checks} checks, ${failures} failed`);
if (warnings.length) { console.log(`${warnings.length} warnings (the bible's rules as written; see the report):`); for (const w of warnings) console.log(`  WARN ${w}`); }
process.exit(failures ? 1 : 0);
