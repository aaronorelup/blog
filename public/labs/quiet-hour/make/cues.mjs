// Writes what the sound builder and the orchestrator need from the engine, for each ending:
//
//   node make/cues.mjs <out-dir> [--durations <file.json>]
//
//   <out-dir>/cues-<ending>.json   the spoken lines (with the take's variant and the log values that made each one be
//                                  said), every event, the knob turns and dial taps (frames for the foley), per-note
//                                  arrays (pick, velocity, step change, hum, tear, spoon...) and the coda's bet
//   <out-dir>/events-<ending>.md   the lines of that ending, then one table of everything that happens: note, programme
//                                  clock, film seconds, frame, and the log values that caused it
//   <out-dir>/voice-missing.json   every line text spoken in some ending that the frozen voice (data/voice.json) has no
//                                  recording of, with the ending and clock where it is spoken (its length is an
//                                  estimate until it is recorded), and the other texts that could be spoken instead
//                                  once the real lengths are known ("alternates": found by trying each missing line
//                                  at 0.6 to 1.6 times its estimate)
//
// Line lengths: data/voice.json (the frozen voice), or --durations <file> as { "<line text or id>": seconds } or
// { lines: [{ id, text, seconds }] }. A line with no recorded length lasts its words at 130 a minute plus 0.3 s.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine } from '../src/signals.js';
import { estimatedSeconds } from '../src/rules.js';
import { FPS, NOTE_FRAMES, BAR_FRAMES, PROGRAMME_FRAMES, TOTAL_FRAMES, clockText } from '../src/time.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(HERE, '../data');
const ENDINGS = ['main', 'alone', 'x3', 'x10'];

const args = process.argv.slice(2);
const outDir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--durations');
if (!outDir) { console.error('usage: node make/cues.mjs <out-dir> [--durations <file.json>]'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const di = args.indexOf('--durations');
// accepts { "<text or id>": seconds } or a voice manifest { lines: [{ id, text, seconds }] } (keyed by exact text)
function readDurations(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(j.lines)) return j;
  return Object.fromEntries(j.lines.filter((l) => l.text && l.seconds > 0).map((l) => [l.text, l.seconds]));
}
// Without --durations the frozen voice's lengths in data/voice.json are used (what the browser engine uses too).
const VOICE_FILE = path.join(DATA, 'voice.json');
const durationsFrom = di >= 0 ? args[di + 1] : fs.existsSync(VOICE_FILE) ? VOICE_FILE : null;
const voiceDurations = durationsFrom ? readDurations(durationsFrom) : undefined;

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const shared = readJson('shared.json');
const endingData = Object.fromEntries(ENDINGS.map((e) => [e, readJson(`ending-${e}.json`)]));
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
  L.push(`Built by make/cues.mjs from data/shared.json + data/ending-${ending}.json through src/signals.js (the film's own engine, bible v1.2).`);
  L.push(`Line lengths: ${voiceDurations ? `recorded (${path.basename(durationsFrom)}); a line marked EST has no recording yet and lasts its words at 130 a minute + 0.3 s` : 'estimated at 130 words a minute + 0.3 s (no recorded lengths)'}.`);
  L.push(`Clock = the clock bug at that frame, floor(frame x 5 / 6). Film s = frame / 24. FORMAT rows are keyed to the clock and the same in every ending; every other row is caused by the log values shown.`);
  L.push('');
  L.push(`Constants read from the log: limit at 20:00 = ${m.limit20} (chalked "${m.chalkText}"); error at 20:00 = ${m.err20}; best error up to 20:00 = ${m.best20} (note ${m.best20Note}); share at 20:00 = ${m.share20}; ln 32 = ${m.ln32}; the edge is lost (hatching gone for good) at ${m.edgeLostNote === null ? 'no note' : `note ${m.edgeLostNote} (${clockText(m.edgeLostNote * NOTE_FRAMES)})`}.`);
  const c = m.counts;
  L.push(`Counts: ${c.pitchPicks} pitch picks, ${c.holds} HOLD, ${c.rests} REST; ${c.outOfKeyPicks} out-of-key picks (${c.outOfKeyAfter20} after 20:00); ${c.worseThanGuessing} notes worse than guessing; ${c.stepChanges} step changes, ${c.knobTurns} knob turns; ${c.certainPicks} picks with p exactly 1; hairlines on ${c.hairlineNotes} notes, tears on ${c.tearNotes}, blocks on ${c.blockNotes}; no hatching on ${c.hatchGoneNotes}; ${c.lines} lines spoken, ${c.droppedLines} data lines never spoken.`);
  L.push('');
  L.push('## Lines');
  L.push('');
  L.push('| clock | frame | note | line | text | length | rule held from | log values |');
  L.push('|---|---:|---:|---|---|---:|---:|---|');
  for (const q of engine.cues) {
    L.push(`| ${clockText(q.frame)} | ${q.frame} | ${q.note} | ${q.id}${q.format ? ' (FORMAT)' : q.after ? ` (after ${q.after})` : ''} | "${q.text}" | ${q.seconds.toFixed(2)} s${q.recorded ? '' : ' EST'} | ${q.format || q.after ? '' : q.ruleFrom} | ${valuesText(q.values).replace(/\|/g, '/')} |`);
  }
  L.push('');
  for (const r of engine.lineReport) if (!r.spoken.length) L.push(`- ${r.id} not spoken: ${r.whyNot}.`);
  L.push('');
  L.push('## Everything, in order');
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
    if (e.kind === 'line' || e.kind === 'line-dropped') what = `${e.id}: ${what}${e.kind === 'line' && e.ruleFrom !== undefined && e.ruleFrom !== e.note && !e.format && !e.after ? ` (rule held from note ${e.ruleFrom})` : ''}`;
    L.push(`| ${note} | ${clockText(Math.min(e.frame, TOTAL_FRAMES - 1))} | ${secs(e.frame)} | ${e.frame} | ${e.format ? 'FORMAT' : ''} | ${what.replace(/\|/g, '/')} | ${valuesText(e.values).replace(/\|/g, '/')} |`);
  }
  L.push('');
  return L.join('\n');
}

const summary = [];
const engines = {};
for (const ending of ENDINGS) {
  const engine = createEngine(shared, endingData[ending], { voiceDurations });
  engines[ending] = engine;
  const pn = engine.perNote;
  const last = engine.note(431);
  const cues = {
    format: 'quiet-hour-cues/1', ending, bible: 'v1.2', fps: FPS, noteFrames: NOTE_FRAMES, barFrames: BAR_FRAMES,
    programmeFrames: PROGRAMME_FRAMES, totalFrames: TOTAL_FRAMES, samplesPerFrameAt48k: 2000,
    durations: voiceDurations ? 'recorded' : 'estimated (130 wpm + 0.3 s)',
    constants: { limit20: engine.meta.limit20, chalkText: engine.meta.chalkText, err20: engine.meta.err20,
      best20: engine.meta.best20, share20: engine.meta.share20, ln32: engine.meta.ln32, edgeLostNote: engine.meta.edgeLostNote },
    lines: engine.cues.map((c) => ({ ...c, startSeconds: c.frame / FPS, startSample48k: c.frame * 2000 })),
    dropped: engine.dropped,
    lineReport: engine.lineReport,
    knobTurns: engine.knobTurns.map((t) => ({ frame: t.start, frames: t.frames, note: t.note, from: t.from, to: t.to })),
    dialTaps: engine.dialTaps.map((t) => ({ frame: t.frame, performed: t.performed, contacts: t.performed ? t.contacts : [], reason: t.reason })),
    chalk: { frame: 1440, frames: 5, tickFrames: 2 },
    barLines: { every: BAR_FRAMES, count: PROGRAMME_FRAMES / BAR_FRAMES, note: 'wall-clock tick and crank creak on every bar line' },
    perNote: {
      about: 'index = note 0..431; note g starts at frame 5 g. velocity null = no pluck (HOLD, REST)',
      pick: pn.pick, pickKind: pn.pickKind, pickMidiSounded: pn.pickMidiSounded, pickP: pn.pickP, velocity: pn.velocity,
      stepChanged: pn.stepChanged, humOn: pn.humGate, tear: pn.tear.map(r4), spoonChatter: pn.spoonChatter,
      handsIn: pn.handsIn, windowLit: pn.windowLit, blocks: pn.blocks, hairline: pn.hairline,
      entropyN: pn.entropyN.map(r4), warmthK: pn.warmthK.map(r4), shadowSoftness: pn.shadowSoftness.map(r4),
    },
    perFrame: { about: 'index = frame 0..2159', humLevel: Array.from({ length: PROGRAMME_FRAMES }, (_, f) => r4(engine.signals(f).humLevel)) },
    coda: { note: 431, pick: last.tok, pickName: last.tokName, pickP: last.ptok, certain: last.ptok === 1,
      entropy: last.entropy, bet: last.p, about: 'the last note\'s bet, held as the pad in the coda (frames 2160..2399)' },
    events: engine.events,
  };
  fs.writeFileSync(path.join(outDir, `cues-${ending}.json`), JSON.stringify(cues));
  fs.writeFileSync(path.join(outDir, `events-${ending}.md`), table(engine, ending));
  summary.push(`${ending}: ${engine.cues.length} lines (${engine.cues.map((c) => `${c.id}@${clockText(c.frame)}${c.recorded ? '' : '*'}`).join(' ')}), never spoken: ${engine.dropped.map((d) => d.id).join(' ') || 'none'}, ${engine.events.length} events`);
}

// ---- voice-missing.json: what the frozen voice lacks, and what could be needed once it is recorded ---------------------
const missing = new Map();
for (const e of ENDINGS) {
  for (const c of engines[e].cues) {
    if (c.recorded) continue;
    if (!missing.has(c.text)) missing.set(c.text, { id: c.id, variant: c.variant, text: c.text, estimatedSeconds: Number(c.seconds.toFixed(3)), spoken: [] });
    missing.get(c.text).spoken.push({ ending: e, clock: clockText(c.frame), frame: c.frame, note: c.note });
  }
}
// alternates: try every missing line at 0.6 .. 1.6 times its estimate (one at a time, in each ending that says it), and
// list any text that is then spoken which is not spoken now and has no recording
const alternates = new Map();
const baseTexts = new Set(ENDINGS.flatMap((e) => engines[e].cues.map((c) => c.text)));
for (const m of missing.values()) {
  for (const { ending } of m.spoken) {
    for (let k = 60; k <= 160; k += 5) {
      const s = (estimatedSeconds(m.text) * k) / 100;
      const eng = createEngine(shared, endingData[ending], { voiceDurations: { ...(voiceDurations || {}), [m.text]: s } });
      for (const c of eng.cues) {
        if (baseTexts.has(c.text) || c.recorded) continue;
        if (!alternates.has(c.text)) alternates.set(c.text, { id: c.id, variant: c.variant, text: c.text, ifs: [] });
        const a = alternates.get(c.text);
        const why = `${ending}: if "${m.text}" lasts ${s.toFixed(2)} s, spoken at ${clockText(c.frame)}`;
        if (a.ifs.length < 6) a.ifs.push(why);
      }
    }
  }
}
const vm = {
  about: 'line texts spoken in at least one ending that the frozen voice (data/voice.json) has no recording of; their lengths are estimates (words at 130 a minute + 0.3 s) until recorded. alternates: texts that are not spoken now but would be if a missing line came out at another length (each missing line tried alone at 0.6 to 1.6 times its estimate); record them too, or record the missing lines first and run make/cues.mjs again',
  voice: durationsFrom ? path.relative(path.resolve(HERE, '..'), durationsFrom) : null,
  bible: 'v1.2',
  lines: [...missing.values()],
  alternates: [...alternates.values()],
};
fs.writeFileSync(path.join(outDir, 'voice-missing.json'), JSON.stringify(vm, null, 1));
console.log(summary.join('\n'));
console.log(`(* = no recording yet) voice-missing.json: ${vm.lines.length} texts${vm.lines.length ? ': ' + vm.lines.map((l) => `"${l.text}" (${l.spoken.map((s) => `${s.ending} ${s.clock}`).join(', ')})`).join('; ') : ''}`);
if (vm.alternates.length) console.log(`  alternates if lengths change: ${vm.alternates.map((a) => `"${a.text}"`).join('; ')}`);
