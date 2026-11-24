// Trains the model and renders its sound, off the page's own thread so the page stays smooth.
// It posts one bar (six eighth notes) at a time: the notes, and their sound.
import * as C from './core.js';
import { createProgramme } from './programme.js';
import { createStream } from './synth.js';

let data = null;
let prog = null;
let stream = null;
let sr = 44100;
let settings = { push: 1, climb: 1.02 };
let runId = 0;
let atBreak = null;        // { checkpoint, snap } once a run has reached 20:00
const breathe = () => new Promise((r) => setTimeout(r, 0));   // lets a new message in between bars

const slim = (row) => ({ g: row.g, clock: row.clock, step: row.step, lr: row.lr, tok: row.tok, ptok: row.ptok, p: row.p,
  held: row.held, heldAcc: row.heldAcc, losses: row.losses, measured: row.measured });

async function run(id, fromBreak) {
  const bars = prog.totalNotes / 6;
  const breakBar = prog.breakNote / 6;
  const t0 = performance.now();
  let bar = 0;
  let snap = null;
  if (fromBreak) {
    prog.begin({ push: settings.push, climb: settings.climb, resume: atBreak.checkpoint });
    stream.restore(atBreak.snap);
    bar = breakBar;
  } else {
    prog.begin({ push: settings.push, climb: settings.climb });
    stream = createStream(data.P, prog.totalNotes, { lo: data.lo, sr });
  }
  const used = { push: settings.push, climb: settings.climb };
  for (; bar < bars; bar++) {
    if (bar === breakBar && !fromBreak) {
      used.push = settings.push; used.climb = settings.climb;
      prog.set(used);                               // the push as it stands when 20:00 arrives
      snap = stream.snapshot();
      postMessage({ type: 'measuring', id });
      await breathe();
      if (id !== runId) return;
    }
    const rows = [];
    for (let k = 0; k < 6; k++) rows.push(prog.next());
    if (bar === breakBar && !fromBreak) atBreak = { checkpoint: prog.checkpoint, snap };
    const audio = stream.notes(rows, bar * 6);
    postMessage({ type: 'bar', id, bar, rows: rows.map(slim), L: audio.L, R: audio.R, push: bar >= breakBar ? used.push : null, climb: bar >= breakBar ? used.climb : null,
      ms: performance.now() - t0 }, [audio.L.buffer, audio.R.buffer]);
    await breathe();
    if (id !== runId) return;
  }
  const tail = stream.tail();
  postMessage({ type: 'bar', id, bar: bars, tail: true, rows: [], L: tail.L, R: tail.R, push: used.push, climb: used.climb, ms: performance.now() - t0 }, [tail.L.buffer, tail.R.buffer]);
  postMessage({ type: 'done', id, ms: performance.now() - t0, fromBreak, push: used.push, climb: used.climb });
}

onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      data = await (await fetch(new URL('./tunes.json', import.meta.url))).json();
      prog = createProgramme(data, { ...C.DEFAULT_CFG }, { held: 3 });
      postMessage({ type: 'ready', stats: data.stats, P: data.P, lo: data.lo, params: prog.L.n, notes: prog.totalNotes, breakNote: prog.breakNote });
    } else if (m.type === 'run') {
      if (m.sr) sr = m.sr;                          // the page's audio clock, so the sound needs no resampling
      settings = { push: m.push, climb: m.climb };
      runId++;
      await run(runId, false);
    } else if (m.type === 'ending') {
      settings = { push: m.push, climb: m.climb };
      if (atBreak) {                                // already past 20:00: play the ending again from there
        runId++;
        await run(runId, true);
      }                                             // not there yet: the run under way picks the new push up at 20:00
    }
  } catch (err) {
    postMessage({ type: 'error', message: String(err && err.message || err) });
  }
};
