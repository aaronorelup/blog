// Tests the engine (src/signals.js + src/rules.js) against the bible (v1.2) and the verified run files.
//
//   node make/test-engine.mjs [<runs-dir>]      (or QH_RUNS=<runs-dir>)
//
// Exits non-zero if anything fails. Without <runs-dir> the checks against the run files are skipped (and said so).
// What it checks:
//   1. the clock text on every frame
//   2. frames 0..1439 give deep-equal signals in all four endings (and the endings part exactly at frame 1440)
//   3. signals(frame) and gauges(frame) are the same whatever order frames are asked in, and on a second engine
//   4. every signal on every frame of every ending is a finite number, a boolean, a string, null or a container of
//      these, with the same keys on every frame; the same for the x-ray's gauges
//   5. no rule reads the ending's name (main's data under other labels gives identical everything; the source has no
//      ending names, clocks, timers or Math.random)
//   6. the packed data equals the run files (scalars exactly; probabilities within 5e-6 with exact 0 and 1 kept)
//   7. every bible rule checked against values computed here, independently, from the run files: most of them on
//      every note or frame; the line schedule against a second scheduler written here from the bible's text
//   8. FORMAT events are the only ones at fixed frames: the same frames in all endings, and in a log where nothing
//      ever changes every other event is caused on note 0 or not at all

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
// one check over many notes or frames: fn(i) returns true, or a description of what is wrong
function all(count, fn, msg) {
  let bad = null;
  for (let i = 0; i < count && bad === null; i++) { const r = fn(i); if (r !== true) bad = `${i}${typeof r === 'string' ? ': ' + r : ''}`; }
  return ok(bad === null, `${msg} (first failure at ${bad})`);
}

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
const voice = fs.existsSync(voiceFile) ? readJson(voiceFile) : null;
const voiceDurations = voiceLengths(voice);
const engines = Object.fromEntries(ENDINGS.map((e) => [e, createEngine(shared, endingData[e], { voiceDurations })]));
const seq = Object.fromEntries(ENDINGS.map((e) => [e, Array.from({ length: F }, (_, f) => canon(engines[e].signals(f)))]));
const GAUGE_FRAMES = Array.from({ length: F }, (_, f) => f).filter((f) => f % 7 === 0 || (f >= 1435 && f <= 1460) || f > 2120);

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
  let first = -1;
  for (let f = 0; f < F; f++) if (seq[e][f] !== seq.main[f]) { first = f; break; }
  ok(first === 1440, `${e} first differs from main at frame ${first} (expected 1440: the endings part at 20:00)`);
  ok(canon(engines[e].cues.filter((c) => c.frame < 1440)) === canon(engines.main.cues.filter((c) => c.frame < 1440)), `${e}: the lines before 20:00 differ from main's`);
  ok(canon(engines[e].events.filter((x) => x.frame < 1440)) === canon(engines.main.events.filter((x) => x.frame < 1440)), `${e}: the events before 20:00 differ from main's`);
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
  const forward = GAUGE_FRAMES.map((f) => canon(engines[e].gauges(f)));
  let gbad = -1;
  for (let i = GAUGE_FRAMES.length - 1; i >= 0; i--) if (canon(fresh.gauges(GAUGE_FRAMES[i])) !== forward[i]) { gbad = GAUGE_FRAMES[i]; break; }
  ok(gbad < 0, `${e}: gauges(${gbad}) differs on a fresh engine asked in reverse order`);
}

// ---- 4. finite or null, same keys -----------------------------------------------------------------------------------
section('4 every signal finite or null, same keys on every frame; the gauges well formed');
// walks a value: flags non-finite numbers and undefined, and records the key set of every object at every path
// (array elements share their array's path), so frames can be compared: an object may be null on some frames, but
// whenever it is there it has the same keys
function shape(v, where, bad, keysAt, at = '') {
  if (v === null || typeof v === 'boolean' || typeof v === 'string') return;
  if (typeof v === 'number') { if (!Number.isFinite(v)) bad.push(`${where} = ${v}`); return; }
  if (v === undefined) { bad.push(`${where} undefined`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => shape(x, `${where}[${i}]`, bad, keysAt, at + '[]')); return; }
  if (typeof v === 'object') {
    const ks = Object.keys(v).sort().join(',');
    if (keysAt.has(at) && keysAt.get(at) !== ks) bad.push(`${where}: keys ${ks} vs ${keysAt.get(at)}`);
    keysAt.set(at, ks);
    for (const k of Object.keys(v)) shape(v[k], `${where}.${k}`, bad, keysAt, `${at}.${k}`);
    return;
  }
  bad.push(`${where}: ${typeof v}`);
}
// the keys the picture builders code against (bible v1): none may ever go away
const V1_KEYS = ('frame note noteFrame phase bar barFrame barPhase isNoteStart isBarLine clockSeconds clock filmSeconds row rowNonFinite p pick '
  + 'pickName pickKind pickP pickInKey pluck pluckVel entropy entropyN err share train worse meanRow spread stylusRow stylusWander punch '
  + 'stripColumns lr stepChanged needle needleU needleOffScale knobAngle knobTurning knobClick sharp limit hatchU hatchGone ratio '
  + 'lrOverLimit20 limit20 chalk chalkU chalkText flagsUp flagsPrevUp flagsT shareDrum shareDrumText steps stepsText cardsThisNote '
  + 'crankAngle warmthK warmth hairline tear tearBands blocks blockShare blockTiles handsIn handsPresent hands titleSlide titleVisible '
  + 'lidClosed windowLit humGate humLevel shadowRadius dustDrift dustOpacity teaRings spoonChatter wallMinutes wallClock minuteAngle '
  + 'hourAngle subtitle subtitleId subtitleStart speaking').split(' ');
const GAUGE_IDS = ['haze', 'hole', 'stylus', 'needle', 'hatching', 'chalk', 'flags', 'drum', 'lessons', 'warmth', 'tears', 'hands', 'window',
  'hum', 'dust', 'shadow', 'tea', 'wallClock', 'subtitle'];
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
  const S0 = engines[e].signals(0);
  ok(V1_KEYS.every((k) => k in S0), `${e}: a v1 signal key is gone: ${V1_KEYS.filter((k) => !(k in S0))}`);
  ok(['present', 'left', 'right', 'fingerLift', 'fingerTap', 'dialTap', 'dialTapContact', 'gripping'].every((k) => k in S0.hands), `${e}: a v1 hands key is gone`);
  // gauges
  const logFields = new Set([...Object.keys(engines[e].note(0)), 'measured20.limit']);
  const gbad = [];
  let ids = null;
  for (const f of GAUGE_FRAMES) {
    const G = engines[e].gauges(f);
    const these = G.map((x) => x.id).join();
    if (ids === null) ids = these; else if (these !== ids) gbad.push(`@${f}: gauge ids changed`);
    for (const x of G) {
      if (typeof x.id !== 'string' || typeof x.name !== 'string' || !x.name || typeof x.value !== 'string' || !x.value || typeof x.rule !== 'string') gbad.push(`@${f} ${x.id}: not { id, name, reads, rule, value }`);
      if (!Array.isArray(x.reads) || !x.reads.every((r) => logFields.has(r))) gbad.push(`@${f} ${x.id}: reads ${x.reads} are not all log fields`);
      if (/NaN|undefined|null|Infinity|not a number|\[object/.test(x.value)) gbad.push(`@${f} ${x.id}: value "${x.value}"`);
    }
  }
  ok(gbad.length === 0, `${e}: ${gbad.length} bad gauges, first ${gbad.slice(0, 3).join(' | ')}`);
  ok(GAUGE_IDS.every((id) => ids.split(',').includes(id)), `${e}: gauges missing ${GAUGE_IDS.filter((id) => !ids.split(',').includes(id))}`);
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
  ok(canon(relabelled.lineReport) === canon(engines.main.lineReport), `main's data labelled ${label}: line report differs`);
  ok([0, 700, 1440, 1443, 1900, 2159].every((f) => canon(relabelled.gauges(f)) === canon(engines.main.gauges(f))), `main's data labelled ${label}: gauges differ`);
  ok(relabelled.meta.ending === label, 'the label is kept as a label');
}
for (const f of ['src/signals.js', 'src/rules.js', 'src/time.js', 'src/rng.js']) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/['"`](main|alone|x3|x10)['"`]/.test(code), `${f} names an ending in its code`);
  ok(!/\b(Date|performance|requestAnimationFrame|setTimeout|setInterval)\b|Math\.random/.test(code), `${f} uses a clock, a timer or Math.random`);
}

// ---- 6 + 7. against the run files -----------------------------------------------------------------------------------
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
  'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numberText = (n) => (n < 20 ? WORDS[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + WORDS[n % 10] : ''));
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const median = (v) => { const s = [...v].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

if (!RUNS) {
  warnings.push('no <runs-dir> given: the checks against the run files (6, 7) were skipped');
} else {
  section('6 packed data equals the run files');
  const runShared = readJson(path.join(RUNS, 'shared-0-287.json')).notes;
  const runs = Object.fromEntries(ENDINGS.map((e) => [e, runShared.concat(readJson(path.join(RUNS, `ending-${e}.json`)).notes)]));
  const COLS = shared.columns;
  for (const e of ENDINGS) {
    const eng = engines[e];
    const bad = [], pBad = [];
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

  section('7 bible rules (v1.1 and v1.2) against values computed from the run files');
  for (const e of ENDINGS) {
    const eng = engines[e], R = runs[e];
    const Sc = new Map();
    const S = (f) => { if (!Sc.has(f)) Sc.set(f, eng.signals(f)); return Sc.get(f); };
    const held = R.map((r) => r.held), acc = R.map((r) => r.heldAcc), lr = R.map((r) => r.lr), sharpR = R.map((r) => r.sharp);
    const limit20 = R[288].measured20.limit;
    const best20 = Math.min(...held.slice(0, 289));

    // ---- the strip
    all(432, (g) => {
      const col = S(g * 5 + 2).stripColumns.at(-1), p = R[g].p;
      if (col.g !== g || col.x !== -0.4) return 'newest column';
      for (let i = 0; i < 32; i++) if (!near(col.haze[i], 0.85 * Math.sqrt(p[i]), 2e-3)) return `haze row ${i}`;
      return near(col.holeR, 0.25 + 0.75 * R[g].ptok, 1e-15) || 'hole radius';
    }, `${e}: haze = 0.85 sqrt(p), hole radius = 0.25 + 0.75 p(pick), on every note`);
    ok(S(1437).stripColumns.at(-2).x === -1.4 && S(1437).stripColumns.length === 64 && S(1437).stripColumns[0].g === 287 - 63, `${e}: strip scroll and history`);
    for (const g of [0, 100, 288, 300, 431]) {
      const p = R[g].p, sum = p.reduce((a, b) => a + b, 0), m = p.reduce((a, x, i) => a + x * i, 0) / sum;
      const sd = Math.sqrt(p.reduce((a, x, i) => a + x * (i - m) ** 2, 0) / sum);
      ok(near(S(g * 5).meanRow, m, 1e-4) && near(S(g * 5).spread, sd, 1e-3), `${e}: note ${g} mean row ${S(g * 5).meanRow} vs ${m}, spread`);
    }
    all(432, (g) => near(S(g * 5).entropyN, Math.min(1, R[g].entropy / LN32), 1e-15), `${e}: H / ln 32 on every note`);
    // the stylus: on the bet's mean row once its glide is done, wandering by at most spread x H / ln 32
    const reach = R.map((r, g) => { const s0 = S(g * 5); return (s0.spread ?? 0) * s0.entropyN; });
    all(F, (f) => {
      const s = S(f), g = s.note;
      if (!(s.stylusRow >= -0.5 && s.stylusRow <= 31.5)) return 'out of range';
      if (Math.abs(s.stylusWander) > Math.max(reach[g], reach[Math.max(0, g - 1)]) + 1e-12) return `wander ${s.stylusWander}`;
      if (s.noteFrame >= 2 && s.stylusRow > -0.5 && s.stylusRow < 31.5 && !near(s.stylusRow - s.stylusWander, s.meanRow, 1e-9)) return 'not on the mean row';
      return true;
    }, `${e}: the stylus sits on the bet's mean row and wanders by at most spread x H / ln 32`);
    ok(R.every((r, g) => g === 0 || reach[g] > 1e-6 || reach[g - 1] > 1e-6 || [0, 1, 2, 3, 4].every((i) => Math.abs(S(g * 5 + i).stylusWander) <= 1e-6)), `${e}: the stylus is still when H is 0`);

    // ---- the dial (v1.1): median of the last 3 readings, the latch, ratio now, hairlines
    const med = sharpR.map((_, g) => median(sharpR.slice(Math.max(0, g - 2), g + 1)));
    const lostAt = sharpR.findIndex((s, g) => g > 288 && !(s > 0));
    const limitT = med.map((m, g) => ((lostAt >= 0 && g >= lostAt) || !(m > 0) ? null : 2 / m));
    const ratioT = limitT.map((l, g) => (l === null ? null : (lr[g] * med[g]) / 2));
    all(432, (g) => {
      const s = S(g * 5);
      if (s.limit !== limitT[g]) return `limit ${s.limit} vs ${limitT[g]}`;
      if (s.hatchGone !== (limitT[g] === null)) return 'hatchGone';
      if (s.hatchGoneSince !== (lostAt >= 0 && g >= lostAt ? lostAt : null)) return 'hatchGoneSince';
      if (s.sharp !== sharpR[g] || s.sharpMedian3 !== med[g]) return 'sharp / median';
      if (s.ratioNow !== ratioT[g]) return `ratioNow ${s.ratioNow} vs ${ratioT[g]}`;
      if ((s.hairline !== null) !== (ratioT[g] !== null && ratioT[g] > 1)) return 'hairline';
      if (s.hairline && !(s.hairline.y >= 0.04 && s.hairline.y <= 0.96 && [1, 2, 3].includes(Math.abs(s.hairline.shiftPx)))) return 'hairline place';
      if (limitT[g] !== null && !near(s.hatchU, Math.min(1, Math.max(0, Math.log(limitT[g] / 0.03) / Math.log(1000))), 1e-12)) return 'hatchU';
      return near(R[g].ratio, (lr[g] * sharpR[g]) / 2, 1e-9) && s.ratio === R[g].ratio || "the log's own ratio";
    }, `${e}: limit now = 2 / median of the last 3 readings, latched off after 20:00; hairlines iff ratio now > 1 while the hatching exists`);
    ok(eng.meta.hatchLostAt === (lostAt >= 0 ? lostAt : null), `${e}: the hatching goes for good at note ${lostAt}`);
    ok(eng.events.filter((x) => x.kind === 'hatch-gone').length === (lostAt >= 0 ? 1 : 0) && !eng.events.some((x) => x.kind === 'hatch-back'), `${e}: the hatching never flickers`);

    // ---- warmth (mean of 6), tears (best so far), blocks
    let best = Infinity;
    all(432, (g) => {
      const w = held.slice(Math.max(0, g - 5), g + 1), e6 = w.reduce((a, b) => a + b, 0) / w.length;
      best = Math.min(best, held[g]);
      const s = S(g * 5 + 3);
      const k = Math.min(1, Math.max(0, (LN32 - e6) / (LN32 - best20)));
      if (!near(s.err6, e6, 1e-12) || !near(s.warmthK, k, 1e-12) || !near(s.warmth, 0.15 + 0.85 * k, 1e-12)) return `warmth ${s.warmthK} vs ${k}`;
      const tg = Math.min(1, Math.max(0, Math.log(held[g] / best) / Math.log(250)));
      if (s.bestErrSoFar !== best || !near(s.tear, tg, 1e-12) || s.tearBands.length !== Math.floor(8 * s.tear)) return `tear ${s.tear} vs ${tg}`;
      if (!s.tearBands.every((b) => Math.abs(b.dxPx) <= 24 * tg + 0.5 && b.y0 >= 0 && b.y1 <= 1 && b.y1 > b.y0)) return 'tear band';
      if (s.blocks !== (held[g] > 10 * LN32) || (!s.blocks && s.blockTiles.length) || !s.blockTiles.every((t) => Number.isInteger(t) && t >= 0 && t < 192)) return 'blocks';
      return s.blocks ? near(s.blockShare, 0.5 * tg, 1e-12) || 'block share' : s.blockShare === 0 || 'block share';
    }, `${e}: warmth from the mean error of 6 notes, tears from the best error so far, blocks above 10 ln 32, on every note`);
    ok(!eng.events.some((x) => x.kind === 'tears-on' && x.note < 288), `${e}: nothing tears while it is learning`);

    // ---- counters, crank, clocks, card
    all(432, (g) => {
      const s = S(g * 5 + 3);
      return s.flagsUp === Math.round(10 * acc[g - (g % 6)]) && s.shareDrum === Math.round(100 * acc[g]) && s.steps === R[g].step
        && s.cardsThisNote === R[g].stepsAfter && s.stepsText === String(R[g].step).padStart(6, '0');
    }, `${e}: flags, drum counter and LESSONS on every note`);
    ok(near(S(15).crankAngle, Math.PI, 1e-15) && S(30).crankAngle === 0 && near(S(29).crankAngle, (2 * Math.PI * 29) / 30, 1e-15), `${e}: crank one turn per bar`);
    ok(S(0).wallClock === '23:30' && S(1440).wallClock === '23:50' && S(2159).wallClock === '23:59', `${e}: wall clock`);
    ok(S(0).titleSlide === 0 && S(89).titleSlide === 0 && S(119).titleSlide === 1 && S(100).titleSlide > 0, `${e}: title card slides over 90..119`);

    // ---- 20:00 (v1.1): the tick 1440-1441, the number 1440-1444, the turn 1442-1444
    ok(S(1439).chalk === 0 && S(1439).chalkTick === 0 && near(S(1440).chalk, 0.2) && S(1440).chalkTick === 0.5 && S(1441).chalkTick === 1
      && near(S(1443).chalk, 0.8) && S(1444).chalk === 1 && S(1440).chalkText === '0.98', `${e}: chalk tick over 1440..1441, number over 1440..1444, "0.98"`);
    all(F, (f) => S(f).chalk === S(f).chalkNumber, `${e}: chalk and chalkNumber agree`);
    ok(S(1440).clock === '20:00' && S(1440).needle === lr[287] && S(1441).needle === lr[287] && S(1440).chalkTick > 0, `${e}: frame 1440 shows the needle (still on the old step), the chalk and 20:00`);
    ok(S(1444).needle === lr[288], `${e}: at frame 1444 the needle stands on the step size of note 288`);
    if (lr[288] === limit20) ok(S(1444).needleU === S(1444).chalkU, `${e}: the needle sits exactly on the chalk mark at frame 1444`);
    // the knob on every note
    all(432, (g) => {
      const changed = g > 0 && lr[g] !== lr[g - 1], t0 = g === 288 ? 1442 : g * 5;
      for (let f = g * 5; f < g * 5 + 5; f++) {
        const s = S(f), inTurn = changed && f >= t0 && f < t0 + 3;
        if (s.knobTurning !== inTurn || s.knobClick !== (changed && f === t0)) return `frame ${f} turning`;
        const want = !changed || f >= t0 + 2 ? lr[g] : f < t0 ? lr[g - 1] : null;
        if (want !== null ? s.needle !== want : !(s.needle > Math.min(lr[g], lr[g - 1]) && s.needle < Math.max(lr[g], lr[g - 1]))) return `frame ${f} needle ${s.needle}`;
        if (s.stepChanged !== changed) return 'stepChanged';
      }
      return true;
    }, `${e}: a 3-frame knob turn on every note whose step size changed (frames 1442..1444 at 20:00), none otherwise`);
    ok(eng.knobTurns.length === lr.filter((v, g) => g > 0 && v !== lr[g - 1]).length, `${e}: one knob turn per step change`);
    // the left hand at 20:00
    ok([1416, 1430, 1440, 1441].every((f) => S(f).hands.left.chalk === 1), `${e}: the left hand holds the chalk from the pick-up to the end of the tick`);
    if (lr[288] !== lr[287]) {
      ok(S(1442).hands.gripping && S(1443).hands.left.grip === 1 && S(1444).hands.left.grip === 1 && S(1444).handsPresent === 1, `${e}: the left hand is on the knob for the 20:00 turn`);
    } else {
      ok([1442, 1443, 1444, 1445, 1449].every((f) => !S(f).hands.gripping && S(f).hands.left.grip === 0) && S(1447).hands.left.rest === 1, `${e}: the step did not change, so the hand goes back to rest`);
    }
    all(F, (f) => { const h = S(f).hands; return near(Object.values(h.left).reduce((a, b) => a + b, 0), 1, 1e-12) && h.right.crank === 1 && h.present === S(f).handsPresent; }, `${e}: pose weights sum to 1, right hand on the crank`);

    // ---- hands rule 1 and the window (the same switch), with the 1e-9 tolerance
    let state = true, good = 0;
    const outs = [], backs = [], inAt = [];
    for (let g = 0; g < 432; g++) {
      const worse = !(held[g] <= LN32 + 1e-9);
      if (state) { if (worse) { state = false; good = 0; outs.push(g); } } else { good = worse ? 0 : good + 1; if (good >= 6) { state = true; backs.push(g); } }
      inAt.push(state);
    }
    all(432, (g) => { const s = S(g * 5 + 1); return s.handsIn === inAt[g] && s.windowLit === inAt[g] && s.worse === !(held[g] <= LN32 + 1e-9); }, `${e}: hands and window state on every note`);
    const notesOf = (kind) => eng.events.filter((x) => x.kind === kind).map((x) => x.note);
    ok(canon(notesOf('hands-out')) === canon(outs) && canon(notesOf('window-dark')) === canon(outs), `${e}: hands out and window dark at ${outs}`);
    ok(canon(notesOf('hands-back')) === canon(backs) && canon(notesOf('window-lit')) === canon(backs), `${e}: hands back and window lit at ${backs}`);
    for (const g of outs) {
      if (inAt.slice(g, g + 6).some((x) => x)) continue;           // only when they stay out for the whole bar
      ok(S(g * 5).handsPresent < 1 && S(g * 5).handsPresent > 0.99 && S(g * 5 + 28).handsPresent > 0 && S(g * 5 + 29).handsPresent === 0, `${e}: hands slide out over one bar from note ${g}`);
    }
    for (const g of backs) ok(S(g * 5 + 19).handsPresent === 1 && S(g * 5).handsPresent < 0.05, `${e}: hands back over 20 frames from note ${g}`);
    ok(S(0).handsIn && S(0).windowLit && !S(0).worse, `${e}: at note 0 (err = ln 32 to the last bits) the hands are in and the window lit`);

    // ---- taps, lid
    for (const F0 of [360, 720, 1080, 1800]) {
      const dec = S(F0 - 8), performed = dec.handsIn && !dec.hands.gripping;
      const evt = eng.events.find((x) => x.kind === 'dial-tap' && x.frame === F0);
      ok(evt.values.performed === performed && S(F0).hands.dialTapContact === performed && S(F0 + 6).hands.dialTapContact === performed
        && (S(F0).hands.left.tap === 1) === performed && (S(F0).hands.dialTap === 1) === performed, `${e}: five-minute tap at frame ${F0} ${performed ? 'happens' : 'is skipped'}`);
    }
    ok((S(2159).lidClosed === 1) === inAt[426] && (S(2130).lidClosed > 0) === inAt[426] && S(2129).lidClosed === 0, `${e}: the lid closes over the last bar iff the hands are in`);

    // ---- the room: hum, dust, shadow, tea, spoon
    let last = -1e9, humOk = true;
    for (let g = 0; g < 432; g++) {
      const ch = g > 0 && lr[g] !== lr[g - 1];
      if (ch) last = g;
      const want = !ch && g - last >= 7;
      if (S(g * 5).humGate !== want) humOk = false;
      if (ch && S(g * 5).humLevel !== 0) humOk = false;
    }
    ok(humOk, `${e}: hum off on step changes, back after 6 still notes`);
    let drift = 0;
    for (let f = 0; f < 700; f++) drift += Math.min(1, R[Math.floor(f / 5)].entropy / LN32) / 24;
    ok(near(S(700).dustDrift, drift, 1e-9), `${e}: dust drift = running sum of H / ln 32`);
    all(432, (g) => near(S(g * 5).shadowRadius, 1 + (5 * Math.min(1, R[g].entropy / LN32)), 1e-12) && near(S(g * 5).dustOpacity, 0.25 + 0.75 * Math.min(1, R[g].entropy / LN32), 1e-12), `${e}: shadow radius and dust opacity on every note`);
    const f9 = 1200 + 7, rings = S(f9).teaRings;
    ok(rings.length > 0 && rings.every((rg) => R[rg.note].pluckVel !== null && near(rg.size, R[rg.note].pluckVel ** 2, 1e-15) && rg.age === f9 - rg.note * 5 && rg.age < 36), `${e}: tea rings sized by velocity squared`);
    all(432, (g) => { let sum = 0; for (let j = Math.max(0, g - 5); j <= g; j++) sum += R[j].pluckVel ?? 0; return S(g * 5).spoonChatter === (sum / 6 >= 0.95); }, `${e}: spoon chatter when the mean velocity of the last 6 notes >= 0.95`);

    // ---- the lines (v1.1): a second scheduler, written here from the bible's text
    const secondsOf = (id, text) => (voiceDurations && (voiceDurations[text] ?? voiceDurations[id])) || text.trim().split(/\s+/).length * 60 / 130 + 0.3;
    const returned = []; { let st = true, was = false; for (let g = 0; g < 432; g++) { if (outs.includes(g)) { st = false; was = false; } if (backs.includes(g)) { st = true; was = true; } returned.push(st && was); } }
    const n100 = (g) => Cap(numberText(Math.round(100 * acc[g])));
    const times = lr[288] / limit20;
    const TABLE = {
      L10: [(g) => returned[g], () => 'There you are.'],
      L3: [(g) => R[g].massInKey >= 0.95, () => "It's found the key. Nobody told it one."],
      L4: [(g) => acc[g] >= 0.5, () => "Every second note right. On tunes it's never heard."],
      L5: [(g) => ratioT[g] !== null && ratioT[g] >= 0.25, () => "A quarter of the way to the edge now. Nobody's touched it."],
      // (v1.2) a reassurance needs somebody there: only while the hands are on the bench
      L7: [(g) => g > 288 && acc[g] <= acc[288] - 0.05 && acc[g] >= acc[288] / 2 && inAt[g], (g) => `${n100(g)} in a hundred. It'll find it again.`],
      L8: [(g) => g > 288 && limitT[g] !== null && limitT[g] >= 1.8 * limit20, () => "It's made itself room."],
      L9: [(g) => g > 288 && acc[g] < acc[288] / 2, (g) => `${n100(g)} in a hundred.`],
    };
    const FORMAT_LINES = [['L1', 30, "Good evening. It hasn't heard a tune yet, so it plays every note at once."],
      ['L2', 360, "That's how big a step it takes after a mistake. Not too big."], ['L6a', 1445, "That's as big a step as it can take."], ['GN', 2135, 'Goodnight.']];
    const l6b = lr[288] === lr[287] ? "We'll leave it where it is." : Math.abs(times - 1) < 1e-9 ? "So that's where we'll put it." : `We'll give it ${numberText(Math.round(times))} times that.`;
    const want = [];
    {
      let busyUntil = 0, lastYes = -1e9, l6bDue = false;
      const said = new Set();
      const say = (id, g, text) => { want.push(`${id}@${g}:${text}`); busyUntil = g * 5 + secondsOf(id, text) * 24; };
      for (let g = 0; g < 432; g++) {
        const f = g * 5, fmt = FORMAT_LINES.find((x) => x[1] === f);
        if (fmt) { say(fmt[0], g, fmt[2]); l6bDue = fmt[0] === 'L6a'; if (fmt[0] === 'GN') break; continue; }
        if (busyUntil > f) continue;
        if (l6bDue) { say('L6b', g, l6b); l6bDue = false; continue; }
        const nextFormat = FORMAT_LINES.find((x) => x[1] > f)[1];
        let spoke = false;
        for (const [id, [holds, text]] of Object.entries(TABLE)) {
          if (said.has(id) || !holds(g) || f + secondsOf(id, text(g)) * 24 > nextFormat) continue;
          say(id, g, text(g)); said.add(id); spoke = true; break;
        }
        if (!spoke && R[g].ptok >= 0.95 && g - lastYes >= 24 && f + secondsOf('YES', 'Yes.') * 24 <= nextFormat) { say('YES', g, 'Yes.'); lastYes = g; }
      }
    }
    const got = eng.cues.map((c) => `${c.id}@${c.note}:${c.text}`);
    ok(canon(got) === canon(want), `${e}: the spoken lines differ from the reference schedule:\n   engine    ${got.filter((x) => !want.includes(x)).join(' | ')}\n   reference ${want.filter((x) => !got.includes(x)).join(' | ')}`);
    const cs = eng.cues;
    ok(cs.every((c) => c.frame % 5 === 0 && c.frame === c.note * 5), `${e}: every line starts on a note boundary`);
    ok(cs.every((c, i) => i === 0 || c.frame >= cs[i - 1].endFrame), `${e}: lines never overlap`);
    ok(FORMAT_LINES.every(([id, f]) => cs.filter((c) => c.id === id).length === 1 && cs.find((c) => c.id === id).frame === f), `${e}: FORMAT lines start at their frames (L1 30, L2 360, L6a 1445, GN 2135)`);
    ok(cs.every((c) => c.format || c.endFrame <= (FORMAT_LINES.find((x) => x[1] > c.frame)?.[1] ?? Infinity)), `${e}: every data line finishes before the next FORMAT line is due`);
    ok(['L3', 'L4', 'L5', 'L6b', 'L7', 'L8', 'L9', 'L10'].every((id) => cs.filter((c) => c.id === id).length <= 1), `${e}: each data line at most once`);
    const yes = cs.filter((c) => c.id === 'YES').map((c) => c.note);
    ok(yes.every((g, i) => R[g].ptok >= 0.95 && (i === 0 || g - yes[i - 1] >= 24)), `${e}: "Yes." only on p(pick) >= 0.95, at least 24 notes apart`);
    ok(cs.at(-1).id === 'GN' && cs.at(-1).frame === 2135, `${e}: "Goodnight." is the last word, at frame 2135`);
    ok(cs.filter((c) => c.id === 'L7').every((c) => inAt[c.note] && S(c.frame).handsIn), `${e}: L7 is only said while the hands are on the bench`);
    for (const c of cs.filter((x) => x.id === 'L7' || x.id === 'L9')) {
      ok(c.text.startsWith(n100(c.note) + ' in a hundred.') && c.text.startsWith(Cap(numberText(S(c.frame).shareDrum))), `${e}: ${c.id} says the drum counter's number at the note it is spoken on: ${c.text}`);
    }
    // subtitles
    all(F, (f) => {
      let hit = null;
      for (const c of cs) if (f >= c.frame && f < Math.min(c.frame + (c.seconds + 0.5) * 24, cs[cs.indexOf(c) + 1]?.frame ?? Infinity, 2160)) hit = c;
      const s = S(f), speaking = cs.find((c) => f >= c.frame && f < c.frame + c.seconds * 24);
      return s.subtitle === (hit ? hit.text : null) && s.subtitleId === (hit ? hit.id : null) && s.speaking === (speaking ? speaking.id : null) || `subtitle "${s.subtitle}"`;
    }, `${e}: the subtitle shows each line from its start for its length plus half a second`);
    ok(cs.every((c) => c.subtitleEnd <= 2160) && S(2159).subtitle === 'Goodnight.', `${e}: "Goodnight." shows to frame 2159 and no subtitle runs past it`);
    all(240, (i) => eng.subtitleAt(2160 + i) === null, `${e}: no subtitle in the black coda`);
    ok(cs.every((c) => c.recorded === !!(voice && voice.lines.some((l) => l.text === c.text))), `${e}: the recorded flag matches data/voice.json`);
    for (const c of cs.filter((x) => !x.recorded)) warnings.push(`${e}: no recording yet for ${c.id} "${c.text}" (${clockText(c.frame)}); its length ${c.seconds.toFixed(2)} s is an estimate`);
    for (const r of eng.lineReport.filter((x) => !x.format && !x.spoken.length && x.heldNotes > 0)) warnings.push(`${e}: ${r.id} is never spoken: ${r.reason}`);

    // ---- the x-ray reads the same numbers
    const G = (f) => Object.fromEntries(eng.gauges(f).map((x) => [x.id, x]));
    ok(G(1439).chalk.value.startsWith('not drawn yet') && G(1440).chalk.value.startsWith('"0.98"') && G(1440).needle.value.startsWith('0.3') && G(1440).clock.value === '20:00', `${e}: gauges at 20:00`);
    ok(G(700).drum.value.startsWith(S(700).shareDrumText) && G(700).lessons.value.startsWith(S(700).stepsText) && G(700).wallClock.value === S(700).wallClock && G(700).flags.value.startsWith(`${S(700).flagsUp} of ten`), `${e}: counter gauges read the signals`);
    ok(G(2100).hands.value.startsWith(inAt[420] ? 'on the bench' : 'gone since') && G(2100).window.value.startsWith(inAt[420] ? 'lit' : 'dark since'), `${e}: hands and window gauges`);
    ok(G(2100).hatching.value.startsWith(lostAt >= 0 ? `gone since ${clockText(lostAt * 5)}` : 'starts at'), `${e}: hatching gauge`);
    ok(G(35).subtitle.value.startsWith('"Good evening.') && G(0).subtitle.value === 'nothing is being said', `${e}: subtitle gauge`);
  }
}

// ---- 8. FORMAT events are the only ones at fixed frames ------------------------------------------------------------
section('8 FORMAT events');
{
  const key = (x) => `${x.kind}|${x.id ?? ''}`;
  const fmtFrames = (eng) => eng.events.filter((x) => x.format).map((x) => `${key(x)}@${x.frame}`).join(' ');
  for (const e of ENDINGS.slice(1)) ok(fmtFrames(engines[e]) === fmtFrames(engines.main), `${e}: FORMAT events at different frames from main`);
  for (const e of ENDINGS) {
    const off = engines[e].events.filter((x) => x.format && !FORMAT_FRAMES.includes(x.frame));
    ok(off.length === 0, `${e}: FORMAT events off the FORMAT frames: ${off.map((x) => key(x) + '@' + x.frame)}`);
  }
  ok(canon([...FORMAT_FRAMES]) === canon([0, 30, 90, 360, 720, 1080, 1410, 1440, 1445, 1800, 2130, 2135, 2160]), `the FORMAT frames are ${FORMAT_FRAMES}`);
  // a log in which nothing ever changes (every note is note 287): only FORMAT events, and things caused on note 0
  // (a line's cause is the first note its rule held on: the voice may get to it later; L6b follows L6a)
  const flatPart = (part, n) => ({ ...part,
    cols: Object.fromEntries(part.columns.map((k) => [k, Array(n).fill(shared.cols[k][287])])), p: Array(n).fill(shared.p[287]) });
  const flat = createEngine(flatPart(shared, 288), { ...flatPart(endingData.main, 144), measured20: endingData.main.measured20 }, { voiceDurations });
  const late = flat.events.filter((x) => !x.format && !x.after && (x.firstHeldNote ?? x.note) > 0);
  ok(late.length === 0, `a log that never changes still has ${late.length} non-FORMAT events caused after note 0: ${late.slice(0, 3).map((x) => x.kind + '@' + x.note).join(' ')}`);
  ok(fmtFrames(flat) === fmtFrames(engines.main), 'a log that never changes keeps every FORMAT event at its frame');
}

console.log(`\nline lengths: ${voiceDurations ? 'recorded (data/voice.json)' : 'estimated'}`);
console.log(`${checks} checks, ${failures} failed`);
if (warnings.length) { console.log(`${warnings.length} notes:`); for (const w of warnings) console.log(`  NOTE ${w}`); }
process.exit(failures ? 1 : 0);
