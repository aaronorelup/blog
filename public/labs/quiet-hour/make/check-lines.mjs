// THE QUIET HOUR: the line schedules (bible section 7). For each ending, every line the maker speaks (engine.cues),
// with its start frame, programme clock and text, and four promises checked against the frozen voice:
//
//   node make/check-lines.mjs [--out <dir>] [--voice data/voice.json] [--plant-overlap]
//
//   1. RECORDED  every spoken text has a frozen recording in data/voice.json (same text, same line id) with a measured
//                length (a finite number of seconds above 0), and the engine scheduled it with that length
//   2. OVERLAP   no two lines overlap: each line's measured recording ends at or before the next line starts (a line
//                cut short by the next one counts as an overlap: the recording is longer than its slot)
//   3. FORMAT    every FORMAT line is spoken once in every ending, at its bible frame, with its bible words:
//                L1 frame 30, L2 the 05:00 tap (frame 360), L6a frame 1445, "Goodnight." frame 2135 (bible 7, 9)
//   4. SUBTITLE  on every frame 0..2399, engine.subtitleAt(frame) is the line being spoken (same id and text); when
//                nobody speaks it is empty or the line that just ended, for at most its 0.5 s tail, and it is empty
//                from frame 2160 (the coda is black). signals(frame).speaking and .subtitle agree with it.
// The expectations here are written from the bible's text, not read from src/rules.js: the frames and the words of the
// FORMAT lines, the grid (24 fps, clock = floor(f x 5 / 6)), the 0.5 s tail.
//
// --out <dir>      writes lines-<ending>.txt (the table) and check-lines.json there
// --voice <file>   the frozen voice table to check against (default data/voice.json)
// --plant-overlap  proof that it can fail: builds every engine with a voice table in which L1's recording is 16 s
//                  long (it would run past L2 at frame 360) and checks against that table. Must FAIL.
// Exits 1 on any failure, 2 on a usage error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine, voiceLengths } from '../src/signals.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ENDINGS = ['main', 'alone', 'x3', 'x10'];
const FPS = 24, PROGRAMME_FRAMES = 2160, TOTAL_FRAMES = 2400, TAIL_S = 0.5;
const EPS = 1e-9;
// bible 7 and 9: the FORMAT lines, their frames and their words
const BIBLE_FORMAT = [
  { id: 'L1', frame: 30, text: "Good evening. It hasn't heard a tune yet, so it plays every note at once." },
  { id: 'L2', frame: 360, text: "That's how big a step it takes after a mistake. Not too big." },
  { id: 'L6a', frame: 1445, text: "That's as big a step as it can take." },
  { id: 'GN', frame: 2135, text: 'Goodnight.' },
];

function args(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) { console.error(`check-lines: unexpected argument ${argv[i]}`); process.exit(2); }
    a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return a;
}
const a = args(process.argv.slice(2));
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const pad = (n, w) => String(n).padStart(w, '0');
const clockOf = (f) => { const s = Math.floor((f * 5) / 6); return `${pad(Math.floor(s / 60), 2)}:${pad(s % 60, 2)}`; };

let voice;
try { voice = readJson(path.resolve(typeof a.voice === 'string' ? a.voice : path.join(ROOT, 'data/voice.json'))); }
catch (e) { console.error(`check-lines: cannot read the voice table: ${e.message}`); process.exit(2); }
if (!voice || !Array.isArray(voice.lines)) { console.error('check-lines: the voice table has no lines[]'); process.exit(2); }
if (a['plant-overlap']) {
  voice = { ...voice, lines: voice.lines.map((l) => (l.id === 'L1' ? { ...l, seconds: 16 } : l)) };
}
const takes = new Map();                       // text -> [{ id, seconds }]
for (const l of voice.lines) { if (!takes.has(l.text)) takes.set(l.text, []); takes.get(l.text).push(l); }
const measured = (text) => {
  const t = takes.get(text);
  if (!t) return null;
  const s = t.find((x) => typeof x.seconds === 'number' && Number.isFinite(x.seconds) && x.seconds > 0);
  return s ? s.seconds : null;
};

const shared = readJson(path.join(ROOT, 'data/shared.json'));
const failures = [], report = { voice: voice.voice ?? null, plantOverlap: !!a['plant-overlap'], endings: {} };
const fail = (ending, what) => failures.push(`${ending}: ${what}`);
const outDir = typeof a.out === 'string' ? path.resolve(a.out) : null;
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const summary = [];

for (const ending of ENDINGS) {
  const eng = createEngine(shared, readJson(path.join(ROOT, `data/ending-${ending}.json`)), { voiceDurations: voiceLengths(voice) });
  const cues = [...eng.cues].sort((x, y) => x.frame - y.frame);
  const rows = cues.map((c) => {
    const sec = measured(c.text);
    return { id: c.id, note: c.note, frame: c.frame, clock: clockOf(c.frame), seconds: sec, engineSeconds: c.seconds,
      end: sec === null ? null : c.frame + sec * FPS, text: c.text, takeIds: (takes.get(c.text) || []).map((x) => x.id) };
  });

  // 1. recorded, with a measured length, and scheduled with it
  for (const r of rows) {
    if (!takes.has(r.text)) { fail(ending, `${r.id} at frame ${r.frame} (${r.clock}): no recording of "${r.text}" in the voice table`); continue; }
    if (r.seconds === null) { fail(ending, `${r.id} at frame ${r.frame}: the recording of "${r.text}" has no measured length`); continue; }
    if (!r.takeIds.includes(r.id)) fail(ending, `${r.id} at frame ${r.frame}: "${r.text}" is recorded only as ${r.takeIds.join(', ')}`);
    if (Math.abs(r.engineSeconds - r.seconds) > 1e-6) fail(ending, `${r.id} at frame ${r.frame}: scheduled for ${r.engineSeconds} s, the recording is ${r.seconds} s`);
  }
  // 2. no overlaps
  for (let i = 0; i + 1 < rows.length; i++) {
    const p = rows[i], n = rows[i + 1];
    const pEnd = p.end ?? p.frame + p.engineSeconds * FPS;
    if (n.frame < p.frame + 1) fail(ending, `${p.id} and ${n.id} start on the same frame ${n.frame}`);
    else if (pEnd > n.frame + EPS) fail(ending, `OVERLAP: ${p.id} (frame ${p.frame}, ${p.clock}, ${p.seconds ?? p.engineSeconds} s) runs to frame ${pEnd.toFixed(2)}, past ${n.id} at frame ${n.frame} (${n.clock})`);
  }
  // 3. the FORMAT lines at their bible frames
  for (const B of BIBLE_FORMAT) {
    const said = rows.filter((r) => r.id === B.id);
    if (said.length !== 1) { fail(ending, `${B.id} spoken ${said.length} times (the bible: once, at frame ${B.frame})`); continue; }
    if (said[0].frame !== B.frame) fail(ending, `${B.id} starts at frame ${said[0].frame} (${said[0].clock}); the bible: frame ${B.frame} (${clockOf(B.frame)})`);
    if (said[0].text !== B.text) fail(ending, `${B.id} says "${said[0].text}"; the bible: "${B.text}"`);
  }
  const atFormat = rows.filter((r) => BIBLE_FORMAT.some((B) => B.frame === r.frame) && !BIBLE_FORMAT.some((B) => B.id === r.id));
  for (const r of atFormat) fail(ending, `${r.id} starts on a FORMAT line's frame ${r.frame}`);
  // 4. the subtitle on every frame is the line being spoken
  const speakingAt = (f) => { let s = null; for (const r of rows) if (f >= r.frame && f < (r.end ?? r.frame + r.engineSeconds * FPS)) s = r; return s; };
  let subFails = 0, subFrames = 0;
  const subFail = (f, what) => { if (++subFails <= 8) fail(ending, `frame ${f} (${clockOf(Math.min(f, PROGRAMME_FRAMES - 1))}): ${what}`); };
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const sub = eng.subtitleAt(f), sp = f < PROGRAMME_FRAMES ? speakingAt(f) : null;
    if (sub) subFrames++;
    if (f >= PROGRAMME_FRAMES) { if (sub) subFail(f, `a subtitle "${sub.text}" in the black coda`); continue; }
    if (sp) {
      if (!sub) subFail(f, `${sp.id} "${sp.text}" is being spoken, no subtitle`);
      else if (sub.text !== sp.text || sub.id !== sp.id) subFail(f, `the subtitle is ${sub.id} "${sub.text}" while ${sp.id} "${sp.text}" is spoken`);
    } else if (sub) {
      const last = rows.filter((r) => r.frame <= f).at(-1);
      const lastEnd = last ? (last.end ?? last.frame + last.engineSeconds * FPS) : -Infinity;
      if (!last || sub.text !== last.text || sub.id !== last.id) subFail(f, `the subtitle "${sub.text}" shows while nobody speaks and it is not the last line`);
      else if (f >= lastEnd + TAIL_S * FPS + EPS) subFail(f, `the subtitle "${sub.text}" stays ${((f - lastEnd) / FPS).toFixed(2)} s after its line ended (tail ${TAIL_S} s)`);
    }
    const S = eng.signals(f);
    if ((S.subtitle ?? null) !== (sub ? sub.text : null)) subFail(f, `signals.subtitle "${S.subtitle}" differs from subtitleAt "${sub ? sub.text : null}"`);
    if ((S.speaking ?? null) !== (sp ? sp.id : null)) subFail(f, `signals.speaking is ${S.speaking}, the voice table says ${sp ? sp.id : 'nobody'}`);
  }
  if (subFails > 8) fail(ending, `... ${subFails - 8} more subtitle failures`);

  const table = [`THE QUIET HOUR, ending ${ending}: the maker's lines (start frame, programme clock, recorded length, end frame, subtitle to)`,
    ['id', 'note', 'frame', 'clock', 'seconds', 'ends', 'subtitle', 'text'].join('\t'),
    ...rows.map((r) => {
      const c = cues.find((x) => x.frame === r.frame);
      return [r.id, r.note, r.frame, r.clock, r.seconds ?? `EST ${r.engineSeconds}`, r.end === null ? '?' : r.end.toFixed(2), c.subtitleEnd.toFixed(2), r.text].join('\t');
    })];
  if (outDir) fs.writeFileSync(path.join(outDir, `lines-${ending}.txt`), table.join('\n') + '\n');
  report.endings[ending] = { lines: rows, subtitleFrames: subFrames };
  const gaps = rows.slice(1).map((r, i) => r.frame - (rows[i].end ?? 0));
  summary.push(`  ${ending}: ${rows.length} lines (${rows.filter((r) => r.id === 'YES').length} "Yes."), ${subFrames} subtitle frames, smallest gap between lines ${(Math.min(...gaps) / FPS).toFixed(3)} s`);
}

report.failures = failures;
report.verdict = failures.length ? 'FAIL' : 'PASS';
console.log(`line schedules: ${ENDINGS.length} endings against ${voice.lines.length} recordings${a['plant-overlap'] ? ' (PLANTED: L1 recorded 16 s long)' : ''}`);
console.log(summary.join('\n'));
for (const f of failures) console.log(`  FAIL ${f}`);
if (outDir) { fs.writeFileSync(path.join(outDir, 'check-lines.json'), JSON.stringify(report, null, 1)); console.log(`  tables: ${outDir}/lines-<ending>.txt`); }
console.log(`  ${report.verdict}`);
process.exit(failures.length ? 1 : 0);
