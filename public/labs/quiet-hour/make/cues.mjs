// Writes what the sound builder and the orchestrator need from the engine, for each ending:
//
//   node make/cues.mjs <out-dir> [--durations <file.json>]
//
//   <out-dir>/cues-<ending>.json   the scheduled lines, every event, the knob turns and dial taps (frames for the foley),
//                                  per-note arrays (pick, velocity, step change, hum, tear, spoon...) and the coda's bet
//   <out-dir>/events-<ending>.md   one table of everything that happens in that ending: note, programme clock, film
//                                  seconds, frame, and the log values that caused it
//
// Line lengths: data/voice.json (the frozen voice), or --durations <file> as { "<line text or id>": seconds } or
// { lines: [{ id, text, seconds }] }. A line with no recorded length lasts its words at 130 a minute plus 0.3 s.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine } from '../src/signals.js';
import { FPS, NOTE_FRAMES, BAR_FRAMES, PROGRAMME_FRAMES, TOTAL_FRAMES, clockText } from '../src/time.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(HERE, '../data');
const ENDINGS = ['main', 'alone', 'x3', 'x10'];

const args = process.argv.slice(2);
const outDir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--durations');
if (!outDir) { console.error('usage: node make/cues.mjs <out-dir> [--durations <file.json>]'); process.exit(2); }
const di = args.indexOf('--durations');
// accepts { "<text or id>": seconds } or a voice manifest { lines: [{ id, text, seconds }] } (keyed by exact text)
function readDurations(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(j.lines)) return j;
  return Object.fromEntries(j.lines.filter((l) => l.text && l.seconds > 0).map((l) => [l.text, l.seconds]));
}
// Without --durations the frozen voice's lengths in data/voice.json are used (what the browser engine uses too).
const VOICE_FILE = path.join(DATA, 'voice.json');
const voiceDurations = di >= 0 ? readDurations(args[di + 1])
  : fs.existsSync(VOICE_FILE) ? readDurations(VOICE_FILE) : undefined;

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const shared = readJson('shared.json');
const r4 = (x) => (typeof x === 'number' ? Math.round(x * 1e4) / 1e4 : x);
const secs = (frame) => (frame / FPS).toFixed(3);

function valuesText(v) {
  return Object.entries(v).map(([k, x]) => `${k} ${Array.isArray(x) ? '[' + x.join(', ') + ']' : x}`).join('; ');
}

// Runs of the same per-note event on consecutive notes (the knob turning every note) are shown as one row.
function compress(events) {
  const out = [];
  let run = null;
  for (const e of events) {
    if (e.kind !== 'knob-turn') { out.push({ ...e, count: 1 }); continue; }
    if (run && e.note === run.lastNote + 1) {
      run.lastNote = e.note; run.count++; run.lastTo = e.values.to; run.lastFrame = e.frame; continue;
    }
    run = { ...e, lastNote: e.note, count: 1, lastTo: e.values.to, lastFrame: e.frame };
    out.push(run);
  }
  return out;
}

function table(engine, ending) {
  const m = engine.meta;
  const L = [];
  L.push(`# The Quiet Hour, ending \`${ending}\`: everything that happens`);
  L.push('');
  L.push(`Built by make/cues.mjs from data/shared.json + data/ending-${ending}.json through src/signals.js (the film's own engine).`);
  L.push(`Line lengths: ${voiceDurations ? 'recorded (the frozen voice: data/voice.json or --durations)' : 'estimated at 130 words a minute + 0.3 s (no recorded lengths)'}.`);
  L.push(`Clock = the clock bug at that frame, floor(frame x 5 / 6). Film s = frame / 24. FORMAT rows are keyed to the clock and the same in every ending; every other row is caused by the log values shown.`);
  L.push('');
  L.push(`Constants read from the log: limit at 20:00 = ${m.limit20} (chalked "${m.chalkText}"); error at 20:00 = ${m.err20}; best error up to 20:00 = ${m.best20} (note ${m.best20Note}); share at 20:00 = ${m.share20}; ln 32 = ${m.ln32}.`);
  const c = m.counts;
  L.push(`Counts: ${c.pitchPicks} pitch picks, ${c.holds} HOLD, ${c.rests} REST; ${c.outOfKeyPicks} out-of-key picks (${c.outOfKeyAfter20} after 20:00); ${c.worseThanGuessing} notes worse than guessing; ${c.stepChanges} step changes, ${c.knobTurns} knob turns; ${c.certainPicks} picks with p exactly 1; hairlines on ${c.hairlineNotes} notes, tears on ${c.tearNotes}, blocks on ${c.blockNotes}; hatching gone on ${c.hatchGoneNotes}; ${c.lines} lines spoken, ${c.droppedLines} dropped.`);
  L.push('');
  L.push('| note | clock | film s | frame | | event | log values |');
  L.push('|---:|---|---:|---:|---|---|---|');
  for (const e of compress(engine.events)) {
    let what = e.what;
    let note = String(e.note);
    if (e.kind === 'knob-turn' && e.count > 1) {
      what = `knob turned every note, ${e.count} turns (frames ${e.frame}-${e.lastFrame}), ${e.values.from} -> ${e.lastTo}`;
      note = `${e.note}-${e.lastNote}`;
    }
    if (e.kind === 'line' || e.kind === 'line-dropped') what = `${e.id}: ${what}${e.triggerNote !== e.note ? ` (fired at note ${e.triggerNote})` : ''}`;
    L.push(`| ${note} | ${clockText(Math.min(e.frame, TOTAL_FRAMES - 1))} | ${secs(e.frame)} | ${e.frame} | ${e.format ? 'FORMAT' : ''} | ${what.replace(/\|/g, '/')} | ${valuesText(e.values).replace(/\|/g, '/')} |`);
  }
  L.push('');
  return L.join('\n');
}

const summary = [];
for (const ending of ENDINGS) {
  const engine = createEngine(shared, readJson(`ending-${ending}.json`), { voiceDurations });
  const pn = engine.perNote;
  const last = engine.note(431);
  const cues = {
    format: 'quiet-hour-cues/1', ending, fps: FPS, noteFrames: NOTE_FRAMES, barFrames: BAR_FRAMES,
    programmeFrames: PROGRAMME_FRAMES, totalFrames: TOTAL_FRAMES, samplesPerFrameAt48k: 2000,
    durations: voiceDurations ? 'recorded' : 'estimated (130 wpm + 0.3 s)',
    constants: { limit20: engine.meta.limit20, chalkText: engine.meta.chalkText, err20: engine.meta.err20,
      best20: engine.meta.best20, share20: engine.meta.share20, ln32: engine.meta.ln32 },
    lines: engine.cues.map((c) => ({ ...c, startSeconds: c.frame / FPS, startSample48k: c.frame * 2000 })),
    dropped: engine.dropped,
    knobTurns: engine.knobTurns.map((t) => ({ frame: t.start, frames: t.frames, note: t.note, from: t.from, to: t.to })),
    dialTaps: engine.dialTaps.map((t) => ({ frame: t.frame, performed: t.performed, contacts: t.performed ? t.contacts : [], reason: t.reason })),
    chalk: { frame: 1440, frames: 5 },
    barLines: { every: BAR_FRAMES, count: PROGRAMME_FRAMES / BAR_FRAMES, note: 'wall-clock tick and crank creak on every bar line' },
    perNote: {
      about: 'index = note 0..431; note g starts at frame 5 g. velocity null = no pluck (HOLD, REST)',
      pick: pn.pick, pickKind: pn.pickKind, pickMidiSounded: pn.pickMidiSounded, pickP: pn.pickP, velocity: pn.velocity,
      stepChanged: pn.stepChanged, humOn: pn.humGate, tear: pn.tear.map(r4), spoonChatter: pn.spoonChatter,
      handsIn: pn.handsIn, windowLit: pn.windowLit, blocks: pn.blocks, hairline: pn.hairline,
      entropyN: pn.entropyN.map(r4), warmthK: pn.warmthK.map(r4),
    },
    perFrame: { about: 'index = frame 0..2159', humLevel: Array.from({ length: PROGRAMME_FRAMES }, (_, f) => r4(engine.signals(f).humLevel)) },
    coda: { note: 431, pick: last.tok, pickName: last.tokName, pickP: last.ptok, certain: last.ptok === 1,
      entropy: last.entropy, bet: last.p, about: 'the last note\'s bet, held as the pad in the coda (frames 2160..2399)' },
    events: engine.events,
  };
  fs.writeFileSync(path.join(outDir, `cues-${ending}.json`), JSON.stringify(cues));
  fs.writeFileSync(path.join(outDir, `events-${ending}.md`), table(engine, ending));
  summary.push(`${ending}: ${engine.cues.length} lines (${engine.cues.map((c) => `${c.id}@${c.note}`).join(' ')}), dropped ${engine.dropped.map((d) => d.id).join(' ') || 'none'}, ${engine.events.length} events`);
}
console.log(summary.join('\n'));
