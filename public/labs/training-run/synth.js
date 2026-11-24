// Turns the programme's notes into sound. Nothing here knows about training: it only reads, for each eighth note,
// the token the model picked, the probability it gave that pick, and its probabilities for every pitch.
//
// Three fixed rules (the designed part):
//   1. The picked pitch is plucked on a music-box voice, one octave up.
//   2. It is plucked harder the more probability the model gave it (soft when it is guessing, loud when it is sure).
//   3. Under it a quiet pad sounds every pitch at once, each with energy equal to the probability the model gives it.
// HOLD and REST pluck nothing. If the probabilities are not numbers, nothing sounds.
//
// render() makes a whole run at once (the published MP3s). createStream() makes the same sound a few notes at a
// time, so the page can play a run while it is still being trained.

export const SYNTH_DEFAULTS = {
  sr: 44100,
  seconds: 90,        // the programme
  tail: 2.5,          // ring-out after 30:00
  lo: 57,             // MIDI number of token 0
  melodyUp: 12,
  halo: 0.3,          // pad level against the plucks
  master: 0.5,
};

const TAU = 2 * Math.PI;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// The pluck of one note, as numbers the two renderers share.
function pluckOf(o, row, P) {
  if (!(row.tok >= 0) || row.tok >= P) return null;
  const f = hz(o.lo + row.tok + o.melodyUp);
  const sure = row.ptok === row.ptok ? Math.min(1, Math.max(0, row.ptok)) : 0;
  const vel = (0.25 + 0.75 * sure) * (o.plucks === undefined ? 1 : o.plucks);
  if (vel === 0) return null;
  const tau = 0.5 * Math.pow(440 / f, 0.3);                 // low notes ring a little longer
  return {
    w: TAU * f / o.sr,
    len: Math.round(7 * tau * o.sr),
    env: vel * 0.8,
    b2: 0.22 * vel,                                          // a harder pluck is brighter
    b3: 0.07 * vel * vel,
    tink: f * 5.4 < 0.42 * o.sr ? 0.05 * vel : 0,            // the short metallic partial of a music-box tine
    dTink: Math.exp(-1 / (0.03 * o.sr)),
    d: Math.exp(-1 / (tau * o.sr)),
  };
}

export function render(notes, P, opts = {}) {
  const o = { ...SYNTH_DEFAULTS, ...opts };
  const sr = o.sr;
  const n = Math.round((o.seconds + o.tail) * sr);
  const step = o.seconds / notes.length;          // seconds per eighth note
  const L = new Float32Array(n);
  const R = new Float32Array(n);

  // --- 3. the pad: every pitch, energy = probability
  const ramp = Math.round(0.03 * sr);
  for (let i = 0; i < P; i++) {
    const f = hz(o.lo + i);
    const w = TAU * f / sr;
    const pan = -0.7 + 1.4 * (i / (P - 1));
    const gl = Math.cos((pan + 1) * Math.PI / 4) * o.halo;
    const gr = Math.sin((pan + 1) * Math.PI / 4) * o.halo;
    let prev = 0;
    let ph = 0;
    for (let g = 0; g <= notes.length; g++) {
      const p = g < notes.length ? notes[g].p[i] : 0;                 // fades out after the last note
      const target = p === p && p > 0 ? Math.sqrt(p) : 0;
      const s0 = Math.round(g * step * sr);
      const s1 = Math.min(n, g < notes.length ? Math.round((g + 1) * step * sr) : s0 + Math.round(0.6 * sr));
      const rl = g < notes.length ? ramp : s1 - s0;
      if (prev === 0 && target === 0) { ph += w * (s1 - s0); continue; }
      for (let s = s0; s < s1; s++) {
        const k = s - s0;
        const a = k < rl ? prev + (target - prev) * (k / rl) : target;
        ph += w;
        const x = a * (Math.sin(ph) + 0.12 * Math.sin(2 * ph));
        L[s] += gl * x;
        R[s] += gr * x;
      }
      prev = target;
    }
  }

  // --- 1 and 2. the plucks
  const att = Math.round(0.003 * sr);
  for (let g = 0; g < notes.length; g++) {
    const pl = pluckOf(o, notes[g], P);
    if (!pl) continue;
    const s0 = Math.round(g * step * sr);
    const len = Math.min(n - s0, pl.len);
    let env = pl.env;
    let et = pl.tink;
    for (let k = 0; k < len; k++) {
      const a = k < att ? 0.5 - 0.5 * Math.cos(Math.PI * k / att) : 1;
      const ph = pl.w * k;
      const x = a * (env * (Math.sin(ph) + pl.b2 * Math.sin(2 * ph) + pl.b3 * Math.sin(3 * ph)) + et * Math.sin(5.4 * ph));
      L[s0 + k] += x * 0.7071;
      R[s0 + k] += x * 0.7071;
      env *= pl.d;
      et *= pl.dTink;
    }
  }

  // one fixed gain and a soft ceiling; no automatic levelling, so quiet stays quiet and loud stays loud
  for (let s = 0; s < n; s++) {
    L[s] = Math.tanh(L[s] * o.master);
    R[s] = Math.tanh(R[s] * o.master);
  }
  return { L, R, sr, seconds: n / sr };
}

// The same sound in pieces. notes(rows, g0) renders the notes g0, g0+1, ... and returns their samples; tail() renders
// the ring-out after the last note. snapshot() and restore() let an ending be played again from the same moment.
export function createStream(P, totalNotes, opts = {}) {
  const o = { ...SYNTH_DEFAULTS, ...opts };
  const sr = o.sr;
  const step = o.seconds / totalNotes;
  const ramp = Math.round(0.03 * sr);
  const att = Math.round(0.003 * sr);
  const at = (g) => Math.round(g * step * sr);
  const pad = [];
  for (let i = 0; i < P; i++) {
    const pan = -0.7 + 1.4 * (i / (P - 1));
    pad.push({ w: TAU * hz(o.lo + i) / sr, gl: Math.cos((pan + 1) * Math.PI / 4) * o.halo, gr: Math.sin((pan + 1) * Math.PI / 4) * o.halo });
  }
  const ring = Math.ceil(7 * 0.5 * sr) + 16;         // the longest a pluck rings
  let prev = new Float64Array(P);
  let ph = new Float64Array(P);
  let carryL = new Float32Array(ring);               // pluck tails that reach past the piece being rendered
  let carryR = new Float32Array(ring);

  function open(n) {
    const L = new Float32Array(n);
    const R = new Float32Array(n);
    const m = Math.min(n, ring);
    L.set(carryL.subarray(0, m));
    R.set(carryR.subarray(0, m));
    carryL.copyWithin(0, m); carryL.fill(0, ring - m);
    carryR.copyWithin(0, m); carryR.fill(0, ring - m);
    return { L, R };
  }
  function close(buf) {
    for (let s = 0; s < buf.L.length; s++) { buf.L[s] = Math.tanh(buf.L[s] * o.master); buf.R[s] = Math.tanh(buf.R[s] * o.master); }
    return buf;
  }
  function padSegment(buf, i, target, s0, s1, rl) {
    const v = pad[i];
    if (prev[i] === 0 && target === 0) { ph[i] += v.w * (s1 - s0); return; }
    let p = ph[i];
    const from = prev[i];
    for (let s = s0; s < s1; s++) {
      const k = s - s0;
      const a = k < rl ? from + (target - from) * (k / rl) : target;
      p += v.w;
      const x = a * (Math.sin(p) + 0.12 * Math.sin(2 * p));
      buf.L[s] += v.gl * x;
      buf.R[s] += v.gr * x;
    }
    ph[i] = p;
    prev[i] = target;
  }

  function notes(rows, g0) {
    const start = at(g0);
    const n = at(g0 + rows.length) - start;
    const buf = open(n);
    for (let j = 0; j < rows.length; j++) {
      const s0 = at(g0 + j) - start;
      const s1 = at(g0 + j + 1) - start;
      for (let i = 0; i < P; i++) {
        const p = rows[j].p[i];
        padSegment(buf, i, p === p && p > 0 ? Math.sqrt(p) : 0, s0, s1, ramp);
      }
      const pl = pluckOf(o, rows[j], P);
      if (!pl) continue;
      let env = pl.env;
      let et = pl.tink;
      for (let k = 0; k < pl.len; k++) {
        const a = k < att ? 0.5 - 0.5 * Math.cos(Math.PI * k / att) : 1;
        const q = pl.w * k;
        const x = a * (env * (Math.sin(q) + pl.b2 * Math.sin(2 * q) + pl.b3 * Math.sin(3 * q)) + et * Math.sin(5.4 * q)) * 0.7071;
        const s = s0 + k;
        if (s < n) { buf.L[s] += x; buf.R[s] += x; } else if (s - n < ring) { carryL[s - n] += x; carryR[s - n] += x; }
        env *= pl.d;
        et *= pl.dTink;
      }
    }
    return close(buf);
  }

  function tail() {
    const n = Math.round(o.tail * sr);
    const buf = open(n);
    const fade = Math.min(n, Math.round(0.6 * sr));
    for (let i = 0; i < P; i++) padSegment(buf, i, 0, 0, fade, fade);
    return close(buf);
  }

  return {
    sr, step,
    notes, tail,
    snapshot: () => ({ prev: prev.slice(), ph: ph.slice(), carryL: carryL.slice(), carryR: carryR.slice() }),
    restore: (s) => { prev = s.prev.slice(); ph = s.ph.slice(); carryL = s.carryL.slice(); carryR = s.carryR.slice(); },
  };
}

export function wavBytes(L, R, sr) {
  const n = L.length;
  const buf = new ArrayBuffer(44 + n * 4);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 4, Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), true);
    v.setInt16(46 + i * 4, Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), true);
  }
  return new Uint8Array(buf);
}
