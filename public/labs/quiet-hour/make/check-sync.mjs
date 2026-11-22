// THE QUIET HOUR: the sync check (bible 2, 5.6, 10) on a finished film file.
//
//   node make/check-sync.mjs --video <film.mp4> [--out report.json]
//
// Exits 1 on any failure, 2 on a usage or decode error. Checks:
//   1. the container: exactly 2400 video frames at 24 fps, video and audio streams both 100.000 s, audio 48 kHz and
//      4,800,000 samples once decoded (+/- one AAC frame of 1024, reported)
//   2. the coda: frames 2160 to 2399 are black (decoded luma at most 20 of 255 anywhere in the frame)
//   3. picture-to-sound sync: the soundtrack's bar-line ticks (the wall clock ticks on every bar line, bible 5.4) and
//      punch ticks (one per note, bible 5.3) must sit within half a frame (1,000 samples) of frame x 2,000 samples.
//      Onsets: the decoded mono audio is high-passed at 3 kHz (two RBJ biquads), its energy taken in 1 ms hops (48
//      samples), and the onset strength is the rise of that energy in dB. That is cross-correlated with a pulse train
//      at the bar lines (frames 0, 30, 60 ... 2370) and, separately, at the note starts of the programme (every 5
//      frames to 2155), over lags of -4,000..4,000 samples. The best lag must be within 1,000 samples, and the train
//      must stand out (its peak at least 3 times the median correlation over all lags), or the sync is unproven.
//      Per bar line, the strongest onset within +/- 2,000 samples of the best lag is also reported (median, spread).

import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const FPS = 24, SR = 48000, SPF = SR / FPS, FRAMES = 2400, PROG = 2160, HOP = 48, HALF_FRAME = SPF / 2;

function args(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  return a;
}

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries',
    'stream=index,codec_type,codec_name,nb_read_packets,duration,r_frame_rate,sample_rate,channels,width,height,pix_fmt', '-of', 'json', file], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe: ${r.stderr}`);
  return JSON.parse(r.stdout).streams;
}

function pipe(ffArgs, onData) {
  return new Promise((resolve, reject) => {
    const ff = spawn('nice', ['-n', '5', 'ffmpeg', '-nostdin', '-v', 'error', ...ffArgs], { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    ff.stderr.on('data', (d) => { err += d; });
    ff.stdout.on('data', onData);
    ff.on('error', reject);
    ff.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg exited ${c}: ${err.slice(0, 300)}`))));
  });
}

async function codaBlack(file) {
  const W = 160, H = 90, size = W * H;
  const maxes = [];
  let buf = Buffer.alloc(0);
  await pipe(['-i', file, '-an', '-vf', `select='gte(n\\,${PROG - 1})',scale=${W}:${H}:flags=area,format=gray`, '-vsync', '0', '-f', 'rawvideo', 'pipe:1'], (d) => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= size) { let m = 0; for (let i = 0; i < size; i++) if (buf[i] > m) m = buf[i]; maxes.push(m); buf = buf.subarray(size); }
  });
  // maxes[0] is frame 2159 (the last programme frame, for contrast); maxes[1..] are 2160..
  const coda = maxes.slice(1);
  const bad = coda.map((m, i) => ({ frame: PROG + i, maxLuma: m })).filter((x) => x.maxLuma > 20);
  return { frames: coda.length, lastProgrammeMaxLuma: maxes[0], codaMaxLuma: coda.length ? Math.max(...coda) : null, notBlack: bad.slice(0, 10), notBlackCount: bad.length };
}

async function decodeAudio(file) {
  const chunks = [];
  await pipe(['-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le', 'pipe:1'], (d) => chunks.push(d));
  const b = Buffer.concat(chunks);
  return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
}

function biquadHighpass(x, f0, q = Math.SQRT1_2) {
  const w = (2 * Math.PI * f0) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

function onsets(x) {
  const hp = biquadHighpass(biquadHighpass(x, 3000), 3000);
  const m = Math.floor(hp.length / HOP), db = new Float64Array(m), o = new Float64Array(m);
  for (let h = 0; h < m; h++) { let s = 0; for (let i = h * HOP; i < (h + 1) * HOP; i++) s += hp[i] * hp[i]; db[h] = 10 * Math.log10(s / HOP + 1e-12); }
  for (let h = 1; h < m; h++) o[h] = Math.max(0, db[h] - db[h - 1]);
  return o;
}

/** Correlate onset strength with pulses at the given sample positions over lags; refine per pulse. */
function syncTo(o, positions, label) {
  const lags = [];
  for (let L = -4000; L <= 4000; L += HOP) {
    let s = 0;
    for (const p of positions) { const h = Math.round((p + L) / HOP); if (h > 0 && h < o.length) s += o[h] + 0.5 * (o[h - 1] + o[h + 1]); }
    lags.push({ L, s });
  }
  const best = lags.reduce((a, b) => (b.s > a.s ? b : a));
  const med = [...lags].sort((a, b) => a.s - b.s)[lags.length >> 1].s;
  // per pulse: the strongest onset within +/- 2000 samples of the best lag, at hop resolution
  const offs = [];
  for (const p of positions) {
    const c = Math.round((p + best.L) / HOP);
    let bh = -1, bv = 0;
    for (let h = c - 42; h <= c + 42; h++) if (h > 0 && h < o.length && o[h] > bv) { bv = o[h]; bh = h; }
    if (bh >= 0 && bv > 3) offs.push(bh * HOP - p);
  }
  offs.sort((a, b) => a - b);
  const q = (f) => (offs.length ? offs[Math.min(offs.length - 1, Math.floor(f * offs.length))] : null);
  const stands = med > 0 ? best.s / med : best.s > 0 ? Infinity : 0;
  const ok = Math.abs(best.L) <= HALF_FRAME && stands >= 3;
  return { train: label, pulses: positions.length, bestLagSamples: best.L, bestLagMs: +(best.L / SR * 1000).toFixed(2), peakOverMedian: +stands.toFixed(2),
    perPulse: { found: offs.length, medianOffsetSamples: q(0.5), p10: q(0.1), p90: q(0.9), withinHalfFrame: offs.filter((x) => Math.abs(x) <= HALF_FRAME).length },
    ok, why: ok ? null : Math.abs(best.L) > HALF_FRAME ? `best lag ${best.L} samples is more than half a frame (${HALF_FRAME})` : `no clear tick train (peak only ${stands.toFixed(2)} x the median)` };
}

export async function checkSync(file) {
  const fail = [];
  const st = probe(file);
  const v = st.find((s) => s.codec_type === 'video'), au = st.find((s) => s.codec_type === 'audio');
  const container = { video: v ? { codec: v.codec_name, frames: +v.nb_read_packets, fps: v.r_frame_rate, duration: +v.duration, size: `${v.width}x${v.height}`, pix_fmt: v.pix_fmt } : null,
    audio: au ? { codec: au.codec_name, sampleRate: +au.sample_rate, channels: au.channels, duration: +au.duration } : null };
  if (!v) fail.push('no video stream'); if (!au) fail.push('no audio stream');
  if (v) {
    if (+v.nb_read_packets !== FRAMES) fail.push(`video has ${v.nb_read_packets} frames, not ${FRAMES}`);
    if (v.r_frame_rate !== '24/1') fail.push(`video frame rate ${v.r_frame_rate}, not 24/1`);
    if (Math.abs(+v.duration - 100) > 0.0005) fail.push(`video stream lasts ${v.duration} s, not 100.000`);
  }
  if (au) {
    if (+au.sample_rate !== SR) fail.push(`audio at ${au.sample_rate} Hz, not 48000`);
    if (Math.abs(+au.duration - 100) > 0.0005) fail.push(`audio stream lasts ${au.duration} s, not 100.000`);
  }
  const coda = v ? await codaBlack(file) : null;
  if (coda && coda.frames !== FRAMES - PROG) fail.push(`decoded ${coda.frames} coda frames, not ${FRAMES - PROG}`);
  if (coda && coda.notBlackCount) fail.push(`${coda.notBlackCount} coda frames are not black (first: frame ${coda.notBlack[0].frame}, max luma ${coda.notBlack[0].maxLuma})`);
  let audio = null, sync = [];
  if (au) {
    const x = await decodeAudio(file);
    audio = { decodedSamples: x.length, expected: 4800000, diff: x.length - 4800000 };
    if (Math.abs(audio.diff) > 1024) fail.push(`decoded ${x.length} samples, not 4,800,000`);
    const o = onsets(x);
    const bars = Array.from({ length: FRAMES / 30 }, (_, b) => b * 30 * SPF);
    const notes = Array.from({ length: PROG / 5 }, (_, g) => g * 5 * SPF);
    sync = [syncTo(o, bars, 'bar lines (wall-clock ticks)'), syncTo(o, notes, 'note starts (punch ticks, plucks)')];
    if (!sync.some((s) => s.ok)) fail.push(`sync unproven: ${sync.map((s) => `${s.train}: ${s.why}`).join('; ')}`);
    for (const s of sync) if (s.ok === false && Math.abs(s.bestLagSamples) > HALF_FRAME && s.peakOverMedian >= 3) fail.push(`${s.train} sit ${s.bestLagSamples} samples off the picture`);
  }
  return { input: file, container, coda, audio, sync, failures: fail, verdict: fail.length ? 'FAIL' : 'PASS' };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args(process.argv.slice(2));
  if (!a.video) { console.error('usage: node make/check-sync.mjs --video <film.mp4> [--out report.json]'); process.exit(2); }
  try {
    const r = await checkSync(a.video);
    const L = [`sync check: ${r.input}`];
    if (r.container.video) L.push(`  video: ${r.container.video.codec} ${r.container.video.size} ${r.container.video.frames} frames @ ${r.container.video.fps}, ${r.container.video.duration} s`);
    if (r.container.audio) L.push(`  audio: ${r.container.audio.codec} ${r.container.audio.sampleRate} Hz x${r.container.audio.channels}, ${r.container.audio.duration} s; decoded ${r.audio.decodedSamples} samples (${r.audio.diff >= 0 ? '+' : ''}${r.audio.diff})`);
    if (r.coda) L.push(`  coda: ${r.coda.frames} frames, max luma ${r.coda.codaMaxLuma} (frame 2159: ${r.coda.lastProgrammeMaxLuma})`);
    for (const s of r.sync) L.push(`  ${s.train}: best lag ${s.bestLagSamples} samples (${s.bestLagMs} ms), peak ${s.peakOverMedian} x median; per pulse median ${s.perPulse.medianOffsetSamples} (p10 ${s.perPulse.p10}, p90 ${s.perPulse.p90}), ${s.perPulse.withinHalfFrame}/${s.pulses} within half a frame${s.ok ? '' : '  <- ' + s.why}`);
    L.push(`  ${r.verdict}${r.failures.length ? ': ' + r.failures.join('; ') : ''}`);
    console.log(L.join('\n'));
    if (a.out) fs.writeFileSync(a.out, JSON.stringify(r, null, 1));
    process.exit(r.failures.length ? 1 : 0);
  } catch (e) { console.error(`check-sync: ${e.message}`); process.exit(2); }
}
