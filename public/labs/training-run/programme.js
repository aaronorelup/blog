// The programme: 72 bars of 6/8 (432 eighth notes) on a 30:00 clock. At every eighth note the model, as it is at
// that moment, gives its probabilities for the next note and one is picked. Between notes it trains.
// Up to 20:00 the step size (learning rate) is constant. At 20:00 the stability limit is measured and the step size
// is set against it. The same file made the published run (in Node) and runs in this page's worker.
import * as C from './core.js';

export const DEFAULTS = {
  bars: 72,
  breakBar: 48,            // 20:00 of 30:00
  stepsBeforeBreak: 6000,
  gamma: 3,                // training steps so far at note g, before the break: steps * (g / breakNote)^gamma
  stepsPerNoteAfter: 1,
  batch: 256,
  lr: 0.3,
  push: 1,                 // at 20:00 the step size is set to push * (2 / sharpness at 20:00). 0 = leave it alone
  climb: 1.02,             // and then multiplied by this at every note after that (1 = hold it there)
  probe: 4096,             // training examples used to measure sharpness
  seedInit: 20,
  seedBatch: 2000,
  seedProbe: 99,
  seedPick: 30,
  track: false,            // measure the error on training notes and the sharpness at every note (slow)
  held: 1,                 // measure the error on the unseen tunes every this many notes before 20:00 (0 = never)
  sharpEvery: 1,           // with track on: how often to measure sharpness before 20:00
};

export function clockOf(g, totalNotes) {
  const sec = Math.round((g / totalNotes) * 1800);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export function stepsSoFar(o, g) {
  const breakNote = o.breakBar * 6;
  if (g <= breakNote) {
    const x = g / breakNote;
    let y = 1;
    for (let k = 0; k < o.gamma; k++) y *= x;      // a whole-number power by multiplying, so every engine rounds alike
    return Math.round(o.stepsBeforeBreak * y);
  }
  return o.stepsBeforeBreak + (g - breakNote) * o.stepsPerNoteAfter;
}

// Builds the tables once. begin() starts a run (from the first note, or from a saved 20:00 state), and next()
// plays one note and then trains until the following one.
export function createProgramme(data, cfg, baseOpts) {
  const base = { ...DEFAULTS, ...baseOpts };
  const L = C.layout(cfg, data.P);
  const ex = C.buildExamples(L, cfg, data.train);
  const exH = C.buildExamples(L, cfg, data.held);
  const sc = C.makeScratch(L);
  const work = C.makeWork(L);
  const grad = new Float64Array(L.n);
  const idx = new Int32Array(base.batch);
  const totalNotes = base.bars * 6;
  const breakNote = base.breakBar * 6;
  const probe = new Int32Array(base.probe);
  { const r = C.makeRng(base.seedProbe); for (let i = 0; i < base.probe; i++) probe[i] = Math.floor(r() * ex.N); }
  const us = new Float64Array(totalNotes);
  { const r = C.makeRng(base.seedPick); for (let g = 0; g < totalNotes; g++) us[g] = r(); }
  const feats = new Int32Array(L.A);

  let o = base;
  let th = null;
  let played = null;
  let batchRng = null;
  let v = null;
  let step = 0;
  let g = 0;
  let lr = 0;
  let limit = null;
  let lambdaBreak = null;
  let breakIters = 0;
  let checkpoint = null;
  let resumed = false;

  function begin(runOpts = {}) {
    o = { ...base, ...runOpts };
    v = new Float64Array(L.n);
    { const r = C.makeRng(o.seedProbe + 1); for (let i = 0; i < L.n; i++) v[i] = r() - 0.5; }
    played = new Int32Array(totalNotes).fill(L.PAD);
    lr = o.lr;
    limit = null;
    lambdaBreak = null;
    if (o.resume) {
      th = Float64Array.from(o.resume.theta);
      for (let k = 0; k < breakNote; k++) played[k] = o.resume.played[k];
      if (o.resume.v) v.set(o.resume.v);
      step = o.stepsBeforeBreak;
      g = breakNote;
      resumed = true;
    } else {
      th = C.initParams(L, cfg, o.seedInit);
      batchRng = C.makeRng(o.seedBatch);
      step = 0;
      g = 0;
      resumed = false;
      checkpoint = null;
    }
  }

  // One note. Returns its row, or null when the programme is over.
  function next() {
    if (g >= totalNotes) return null;
    let measured = null;
    if (g === breakNote) {
      // 20:00. The stability limit of plain gradient descent here is 2 / (largest Hessian eigenvalue), found by
      // power iteration, always from the same starting direction so it depends only on the weights at 20:00.
      if (resumed && o.resume.lambda) {
        lambdaBreak = o.resume.lambda;             // the same weights give the same answer: no need to measure twice
        breakIters = o.resume.iters;
      } else {
        const vb = new Float64Array(L.n);
        { const r = C.makeRng(o.seedProbe + 2); for (let i = 0; i < L.n; i++) vb[i] = r() - 0.5; }
        const sh = C.sharpness(L, th, ex, probe, o.probe, vb, sc, work, 300, 1e-6);
        lambdaBreak = sh.lambda;
        breakIters = sh.iters;
      }
      limit = 2 / lambdaBreak;
      measured = { limit, lambda: lambdaBreak, iters: breakIters };
      if (!resumed) checkpoint = { theta: Array.from(th), played: Array.from(played), v: Array.from(v), lambda: lambdaBreak, iters: breakIters };
      batchRng = C.makeRng(o.seedBatch + 7919);     // the ending draws its batches from its own stream
      if (o.push > 0) lr = o.push * limit;
    } else if (g > breakNote && o.push > 0) {
      lr *= o.climb;
    }
    // what the model believes right now, and the note it picks
    C.featuresAt(L, cfg, played, g, g, feats, 0);
    C.forward(L, th, feats, 0, sc);
    let ok = true;
    for (let k = 0; k < L.V; k++) if (!(sc.p[k] === sc.p[k])) ok = false;
    const tok = ok ? C.pick(sc.p, L.V, us[g]) : -1;
    played[g] = tok >= 0 ? tok : L.REST;
    let zmean = 0;
    for (let k = 0; k < L.V; k++) zmean += sc.z[k];
    zmean /= L.V;
    let zsd = 0;
    for (let k = 0; k < L.V; k++) zsd += (sc.z[k] - zmean) * (sc.z[k] - zmean);
    zsd = Math.sqrt(zsd / L.V);
    const row = {
      g, clock: clockOf(g, totalNotes), step, lr, tok, p: Array.from(sc.p), entropy: ok ? C.entropy(sc.p, L.V) : NaN,
      ptok: tok >= 0 ? sc.p[tok] : NaN, zsd,
    };
    if (measured) row.measured = measured;
    const wantHeld = o.track || (o.held > 0 && (g >= breakNote || g % o.held === 0));
    if (wantHeld) { const he = C.evaluate(L, th, exH, sc); row.held = he.loss; row.heldAcc = he.acc; }
    if (o.track) {
      const tr = C.evaluate(L, th, ex, sc, probe, o.probe);
      row.train = tr.loss;
      let wn = 0;
      for (let i = 0; i < L.n; i++) wn += th[i] * th[i];
      row.wnorm = Math.sqrt(wn);
      const doSharp = g >= breakNote || g % o.sharpEvery === 0;
      if (!doSharp) { /* skipped at this note */ } else if (wn === wn && wn !== Infinity) {
        const sh = C.sharpness(L, th, ex, probe, o.probe, v, sc, work, g === breakNote ? 200 : 60, g === breakNote ? 1e-5 : 2e-3);
        row.sharp = sh.lambda; row.sharpIters = sh.iters; row.ratio = lr * sh.lambda / 2;
      } else { row.sharp = NaN; row.ratio = NaN; }
    }
    // train until the next note
    const until = stepsSoFar(o, g + 1);
    const losses = [];
    while (step < until) {
      for (let i = 0; i < o.batch; i++) idx[i] = Math.floor(batchRng() * ex.N);
      losses.push(C.sgdStep(L, th, ex, idx, o.batch, lr, grad, sc));
      step++;
    }
    row.losses = losses;
    g++;
    return row;
  }

  return {
    L, totalNotes, breakNote, begin, next,
    set(patch) { o = { ...o, ...patch }; },      // change the push before 20:00 arrives
    get opts() { return o; },
    get limit() { return limit; },
    get lambdaBreak() { return lambdaBreak; },
    get breakIters() { return breakIters; },
    get checkpoint() { return checkpoint; },
    get theta() { return th; },
  };
}

// The whole programme in one call. onNote(row) is called once per eighth note.
export function runProgramme(data, cfg, opts, onNote) {
  const prog = createProgramme(data, cfg, opts);
  prog.begin(opts && opts.resume ? { resume: opts.resume } : {});
  const notes = [];
  const steps = [];
  let s = prog.opts.resume ? prog.opts.stepsBeforeBreak : 0;
  for (let row = prog.next(); row; row = prog.next()) {
    for (const loss of row.losses) steps.push({ step: ++s, lr: row.lr, loss });
    notes.push(row);
    if (onNote) onNote(row);
  }
  return { o: prog.opts, L: prog.L, notes, steps, limit: prog.limit, lambdaBreak: prog.lambdaBreak, breakIters: prog.breakIters, checkpoint: prog.checkpoint };
}
