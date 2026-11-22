// THE QUIET HOUR: the flash check (bible section 10). Glitches are displacement, tearing and blocks, never strobing:
// at most 3 full-frame light changes a second and no red flashes (bible 1.5).
//
//   node make/check-flash.mjs --in <render dir | video file> [--out report.json] [--svg chart.svg]
//   node make/check-flash.mjs --selftest <dir>      builds strobe clips with ffmpeg in <dir> and proves they are caught
//
// A render dir is what make/render.mjs writes (log.json + lossless segments; frame numbers start at its `from`).
// A video file starts at frame 0. Exits 1 if the picture fails, 2 on a usage or decode error.
//
// Definitions (the spirit of WCAG 2.3.1 general and red flash thresholds; numbers are the defaults, all in the report):
//   - Frames are decoded through ffmpeg, area-scaled to 320x180, sRGB. Each pixel is linearised (IEC 61966-2-1) and its
//     relative luminance is L = 0.2126 R + 0.7152 G + 0.0722 B (0..1). The picture is cut into a 32 x 18 grid of
//     regions (each 1/576 of the picture, 10 x 10 decoded pixels); a region's luminance is the mean L of its pixels.
//     Area is counted in whole regions, so a region the edge of a flashing patch crosses counts whole when its own mean
//     swings enough: the area can be over-estimated by one ring of regions, never under-estimated.
//   - A transition is one swing of a series between two turning points of at least 0.1 (10% of the maximum relative
//     luminance), where the darker end is below 0.80. Turning points come from a zigzag with a 0.1 reversal threshold,
//     so a fast swing and a slow one are the same swing; a transition is dated at the frame its far end is reached.
//   - Area: a frame holds an area transition when regions covering a quarter or more of the picture complete a
//     transition in the same direction within +/- 1 frame of it (runs of such frames count once).
//     The whole picture's own mean L is also run through the same zigzag ("full-frame light changes").
//   - A flash is a pair of opposing transitions. A one-second window is any 24 consecutive frames. FAIL if any window
//     holds more than 6 transitions (more than 3 flashes), by area or full-frame.
//   - Red: a pixel is saturated red when R / (R + G + B) >= 0.8 (linear); its red value is max(0, R - G - B) x 320, and
//     0 for any other pixel. A region's red value is the mean over its pixels. A red transition is a zigzag swing of 20
//     or more on that scale. FAIL on any pair of opposing red transitions within one second whose regions cover a
//     quarter or more of the picture. The largest red area is reported even when it is smaller.
//   - Cuts: a frame whose mean absolute change of encoded luma from the frame before is 0.06 or more. Reported with
//     whether it is on a bar line (frame % 30 = 0) and against the film's own cut list (src/shots.js). A cut is one
//     transition; it is a flash only if the picture swings back.

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FPS = 24;
const DEF = {
  width: 320, height: 180, gridX: 32, gridY: 18,
  lumSwing: 0.1, darkBelow: 0.8, areaShare: 0.25, coincidence: 1,
  windowFrames: FPS, maxTransitionsPerWindow: 6,
  redSat: 0.8, redScale: 320, redSwing: 20, cutLuma: 0.06, barFrames: 30,
};

// ---- args ------------------------------------------------------------------------------------------------------------
function args(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    a[k.slice(2)] = v;
  }
  return a;
}

// ---- decode ------------------------------------------------------------------------------------------------------------
function niceFfmpeg(ffArgs) {
  return spawn('nice', ['-n', '5', 'ffmpeg', '-nostdin', '-v', 'error', ...ffArgs], { stdio: ['ignore', 'pipe', 'pipe'] });
}

/** What to decode: { inputArgs, from, frames (expected or null), label, film (bool) } */
function source(input, workDir) {
  const st = fs.statSync(input);
  if (st.isDirectory()) {
    const log = JSON.parse(fs.readFileSync(path.join(input, 'log.json'), 'utf8'));
    const chunks = [...log.chunks].sort((a, b) => a.from - b.from);
    for (let i = 1; i < chunks.length; i++) {
      if (chunks[i].from !== chunks[i - 1].to + 1) throw new Error(`render dir: chunk gap between ${chunks[i - 1].to} and ${chunks[i].from}`);
    }
    fs.mkdirSync(workDir, { recursive: true });
    const list = path.join(workDir, `concat-${path.basename(path.resolve(input))}.txt`);
    fs.writeFileSync(list, chunks.map((c) => `file '${path.resolve(input, c.file).replace(/'/g, "'\\''")}'`).join('\n') + '\n');
    return { inputArgs: ['-f', 'concat', '-safe', '0', '-i', list], from: log.from, frames: log.to - log.from + 1,
      label: `${input} (${log.ending}, frames ${log.from}..${log.to}, ${log.width}x${log.height}, ${log.format})`,
      film: true, ending: log.ending, digest: log.source?.digest ?? null };
  }
  return { inputArgs: ['-i', input], from: 0, frames: null, label: input, film: /quiet|animatic|main|alone|x3|x10/i.test(path.basename(input)) };
}

const LIN = new Float64Array(256);
for (let i = 0; i < 256; i++) { const c = i / 255; LIN[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }

/** Decode and measure every frame. Returns per-frame series. */
async function measure(src, o) {
  const W = o.width, H = o.height, GX = o.gridX, GY = o.gridY, NC = GX * GY;
  const frameBytes = W * H * 3;
  const cellOf = new Int32Array(W * H), cellN = new Float64Array(NC);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = Math.min(GY - 1, Math.floor((y * GY) / H)) * GX + Math.min(GX - 1, Math.floor((x * GX) / W));
    cellOf[y * W + x] = c; cellN[c]++;
  }
  const whole = [], cells = [], reds = [], cutScore = [], wholeRedMax = [];
  let prevLuma = null;
  const ff = niceFfmpeg(['-threads', '2', ...src.inputArgs, '-vf', `scale=${W}:${H}:flags=area,format=rgb24`, '-f', 'rawvideo', 'pipe:1']);
  let errText = '';
  ff.stderr.on('data', (d) => { errText += d; });
  let buf = Buffer.alloc(0);
  const onFrame = (fr) => {
    const L = new Float64Array(NC), Rv = new Float64Array(NC);
    const luma = new Float32Array(W * H);
    let sumL = 0, cut = 0;
    for (let i = 0, p = 0; i < W * H; i++, p += 3) {
      const r8 = fr[p], g8 = fr[p + 1], b8 = fr[p + 2];
      const r = LIN[r8], g = LIN[g8], b = LIN[b8];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const c = cellOf[i];
      L[c] += l; sumL += l;
      const s = r + g + b;
      if (s > 0 && r / s >= o.redSat) Rv[c] += Math.max(0, r - g - b) * o.redScale;
      const y = (0.2126 * r8 + 0.7152 * g8 + 0.0722 * b8) / 255;
      luma[i] = y;
      if (prevLuma) cut += Math.abs(y - prevLuma[i]);
    }
    let rm = 0;
    for (let c = 0; c < NC; c++) { L[c] /= cellN[c]; Rv[c] /= cellN[c]; if (Rv[c] > rm) rm = Rv[c]; }
    whole.push(sumL / (W * H)); cells.push(L); reds.push(Rv); wholeRedMax.push(rm);
    cutScore.push(prevLuma ? cut / (W * H) : 0);
    prevLuma = luma;
  };
  await new Promise((resolve, reject) => {
    ff.stdout.on('data', (d) => {
      buf = buf.length ? Buffer.concat([buf, d]) : d;
      while (buf.length >= frameBytes) { onFrame(buf.subarray(0, frameBytes)); buf = buf.subarray(frameBytes); }
    });
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${errText.trim().slice(0, 400)}`))));
  });
  if (buf.length) throw new Error(`decode: ${buf.length} stray bytes at the end`);
  return { whole, cells, reds, cutScore, wholeRedMax, NC };
}

// ---- analysis ------------------------------------------------------------------------------------------------------------
/** Zigzag swings of a series with reversal threshold h. Returns [{ from, to, fromV, toV, dir }] (frames are indices). */
export function swings(x, h) {
  const out = [];
  if (x.length < 2) return out;
  let dir = 0, pivot = x[0], pivotT = 0, ext = x[0], extT = 0, hi = x[0], hiT = 0, lo = x[0], loT = 0;
  for (let t = 1; t < x.length; t++) {
    const v = x[t];
    if (dir === 0) {
      if (v > hi) { hi = v; hiT = t; }
      if (v < lo) { lo = v; loT = t; }
      if (hi - lo >= h) {
        if (hiT > loT) { pivot = lo; pivotT = loT; dir = 1; ext = hi; extT = hiT; }
        else { pivot = hi; pivotT = hiT; dir = -1; ext = lo; extT = loT; }
      }
    } else if (dir === 1) {
      if (v > ext) { ext = v; extT = t; }
      else if (ext - v >= h) {
        out.push({ from: pivotT, to: extT, fromV: pivot, toV: ext, dir: 1 });
        pivot = ext; pivotT = extT; dir = -1; ext = v; extT = t;
      }
    } else {
      if (v < ext) { ext = v; extT = t; }
      else if (v - ext >= h) {
        out.push({ from: pivotT, to: extT, fromV: pivot, toV: ext, dir: -1 });
        pivot = ext; pivotT = extT; dir = 1; ext = v; extT = t;
      }
    }
  }
  if (dir !== 0 && Math.abs(ext - pivot) >= h) out.push({ from: pivotT, to: extT, fromV: pivot, toV: ext, dir, open: true });
  return out;
}

/** Transitions of every region -> area transitions: frames where >= areaShare of the picture swings the same way. */
function areaTransitions(perCellSwings, n, NC, o) {
  const area = [new Float64Array(n), new Float64Array(n)];            // [down, up]: share completing at frame t +/- tol
  const share = 1 / NC;
  for (const sw of perCellSwings) {
    for (const s of sw) {
      const d = s.dir > 0 ? 1 : 0;
      for (let t = Math.max(0, s.to - o.coincidence); t <= Math.min(n - 1, s.to + o.coincidence); t++) area[d][t] += share;
    }
  }
  const out = [];
  for (const d of [0, 1]) {
    let run = null;
    for (let t = 0; t <= n; t++) {
      const a = t < n ? area[d][t] : 0;
      if (a >= o.areaShare - 1e-9) {
        if (!run) run = { at: t, area: a, dir: d ? 1 : -1 };
        else if (a > run.area) { run.at = t; run.area = a; }
      } else if (run) { out.push(run); run = null; }
    }
  }
  out.sort((a, b) => a.at - b.at);
  return { list: out, area };
}

/** Sliding one-second windows over dated transitions: the worst window and every window over the cap. */
function windows(times, n, o) {
  const sorted = [...times].sort((a, b) => a - b);
  let worst = { count: 0, start: 0 };
  const over = [];
  let j = 0;
  for (let s = 0; s < n; s++) {
    while (j < sorted.length && sorted[j] < s) j++;
    let k = j, c = 0;
    while (k < sorted.length && sorted[k] < s + o.windowFrames) { k++; c++; }
    if (c > worst.count) worst = { count: c, start: s };
    if (c > o.maxTransitionsPerWindow) over.push({ start: s, end: s + o.windowFrames - 1, transitions: c });
  }
  // merge overlapping flagged windows into ranges
  const ranges = [];
  for (const w of over) {
    const r = ranges.at(-1);
    if (r && w.start <= r.end + 1) { r.end = Math.max(r.end, w.end); r.transitions = Math.max(r.transitions, w.transitions); }
    else ranges.push({ ...w });
  }
  return { worst, flaggedRanges: ranges };
}

export function analyse(m, from, o, expectedCuts) {
  const n = m.whole.length;
  const f = (i) => from + i;
  const dark = (s) => Math.min(s.fromV, s.toV) < o.darkBelow;
  // full-frame
  const wholeSw = swings(m.whole, o.lumSwing).filter(dark);
  const wholeWin = windows(wholeSw.map((s) => s.to), n, o);
  // regions
  const cellSeries = Array.from({ length: m.NC }, (_, c) => m.cells.map((L) => L[c]));
  const cellSw = cellSeries.map((x) => swings(x, o.lumSwing).filter(dark));
  const at = areaTransitions(cellSw, n, m.NC, o);
  const areaWin = windows(at.list.map((s) => s.at), n, o);
  // red
  const redSeries = Array.from({ length: m.NC }, (_, c) => m.reds.map((R) => R[c]));
  const redSw = redSeries.map((x) => swings(x, o.redSwing));
  // red flash pairs: opposing red swings of one region within a second; area = regions doing that around the same time
  const redPairArea = new Float64Array(n);
  let redPairs = 0;
  redSw.forEach((sw) => {
    const covered = new Uint8Array(n);                                 // a region counts once per frame
    for (let i = 1; i < sw.length; i++) {
      if (sw[i].dir !== sw[i - 1].dir && sw[i].to - sw[i - 1].to < o.windowFrames) {
        redPairs++;
        for (let t = sw[i - 1].to; t <= sw[i].to; t++) covered[t] = 1;
      }
    }
    for (let t = 0; t < n; t++) if (covered[t]) redPairArea[t] += 1 / m.NC;
  });
  let redMax = { area: 0, frame: null };
  for (let t = 0; t < n; t++) if (redPairArea[t] > redMax.area) redMax = { area: redPairArea[t], frame: f(t) };
  const redFlagged = [];
  for (let t = 0; t < n; t++) if (redPairArea[t] >= o.areaShare - 1e-9) redFlagged.push(f(t));
  const redAny = redSw.reduce((s, sw) => s + sw.length, 0);
  // steps
  let maxStep = { delta: 0, frame: null }, maxCellStep = { delta: 0, frame: null, region: null };
  for (let t = 1; t < n; t++) {
    const d = m.whole[t] - m.whole[t - 1];
    if (Math.abs(d) > Math.abs(maxStep.delta)) maxStep = { delta: d, frame: f(t), from: m.whole[t - 1], to: m.whole[t] };
    for (let c = 0; c < m.NC; c++) {
      const dc = m.cells[t][c] - m.cells[t - 1][c];
      if (Math.abs(dc) > Math.abs(maxCellStep.delta)) maxCellStep = { delta: dc, frame: f(t), region: `${c % o.gridX},${Math.floor(c / o.gridX)}` };
    }
  }
  // cuts
  const cuts = [];
  for (let t = 1; t < n; t++) if (m.cutScore[t] >= o.cutLuma) cuts.push({ frame: f(t), score: +m.cutScore[t].toFixed(4), onBarLine: f(t) % o.barFrames === 0, lumStep: +(m.whole[t] - m.whole[t - 1]).toFixed(4) });
  const cutSet = new Set(cuts.map((c) => c.frame));
  const exp = expectedCuts ? expectedCuts.filter((c) => c > from && c < from + n) : null;
  const near = (t, set) => set.has(t) || set.has(t - 1) || set.has(t + 1);
  const cutReport = {
    detected: cuts,
    offBarLine: cuts.filter((c) => !c.onBarLine).map((c) => c.frame),
    expected: exp,
    expectedNotDetected: exp ? exp.filter((c) => !cutSet.has(c)) : null,
    detectedNotExpected: exp ? cuts.map((c) => c.frame).filter((c) => !exp.includes(c)) : null,
    closestGapFrames: cuts.length > 1 ? Math.min(...cuts.slice(1).map((c, i) => c.frame - cuts[i].frame)) : null,
  };
  const dated = (s) => ({ frame: f(s.to), from: f(s.from), dir: s.dir > 0 ? 'up' : 'down', fromL: +s.fromV.toFixed(4), toL: +s.toV.toFixed(4), atCut: near(f(s.to), cutSet) });
  const fail = [];
  if (wholeWin.flaggedRanges.length) fail.push(`full-frame: ${wholeWin.worst.count} light changes in one second at frames ${f(wholeWin.worst.start)}..${f(wholeWin.worst.start) + o.windowFrames - 1} (cap ${o.maxTransitionsPerWindow}, i.e. 3 flashes)`);
  if (areaWin.flaggedRanges.length) fail.push(`area: ${areaWin.worst.count} transitions over a quarter of the picture in one second at frames ${f(areaWin.worst.start)}..${f(areaWin.worst.start) + o.windowFrames - 1}`);
  if (redFlagged.length) fail.push(`red: a saturated-red flash pair over ${(redMax.area * 100).toFixed(0)}% of the picture at frame ${redMax.frame}`);
  return {
    verdict: fail.length ? 'FAIL' : 'PASS', failures: fail,
    frames: n, firstFrame: from, lastFrame: from + n - 1,
    fullFrame: { transitions: wholeSw.map(dated), worstWindow: { start: f(wholeWin.worst.start), transitions: wholeWin.worst.count, flashes: Math.floor(wholeWin.worst.count / 2) }, flagged: wholeWin.flaggedRanges.map((r) => ({ ...r, start: f(r.start), end: f(r.end) })) },
    area: { transitions: at.list.map((a) => ({ frame: f(a.at), dir: a.dir > 0 ? 'up' : 'down', area: +a.area.toFixed(3), atCut: near(f(a.at), cutSet) })), worstWindow: { start: f(areaWin.worst.start), transitions: areaWin.worst.count, flashes: Math.floor(areaWin.worst.count / 2) }, flagged: areaWin.flaggedRanges.map((r) => ({ ...r, start: f(r.start), end: f(r.end) })), regionTransitions: cellSw.reduce((s, x) => s + x.length, 0) },
    red: { regionSwings: redAny, opposingPairs: redPairs, largestPairArea: +redMax.area.toFixed(3), largestPairFrame: redMax.frame, flaggedFrames: redFlagged.length, peakRegionRedValue: +Math.max(...m.wholeRedMax).toFixed(2) },
    largestStep: { fullFrame: { ...maxStep, delta: +maxStep.delta.toFixed(4) }, region: { ...maxCellStep, delta: +maxCellStep.delta.toFixed(4) } },
    cuts: cutReport,
    series: { lum: m.whole.map((v) => +v.toFixed(4)) },
  };
}

// ---- chart --------------------------------------------------------------------------------------------------------------
function chart(rep, m, title) {
  const W = 1200, H = 320, padL = 44, padR = 12, padT = 28, padB = 30;
  const n = rep.frames, x = (i) => padL + ((W - padL - padR) * i) / Math.max(1, n - 1), y = (v) => padT + (H - padT - padB) * (1 - v);
  const fx = (fr) => x(fr - rep.firstFrame);
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="monospace" font-size="11">`);
  parts.push(`<rect width="${W}" height="${H}" fill="#fbfaf7"/>`);
  for (const r of [...rep.fullFrame.flagged, ...rep.area.flagged]) parts.push(`<rect x="${fx(r.start)}" y="${padT}" width="${Math.max(2, fx(r.end) - fx(r.start))}" height="${H - padT - padB}" fill="#e6a23c" opacity="0.35"/>`);
  for (const c of rep.cuts.detected) parts.push(`<line x1="${fx(c.frame)}" x2="${fx(c.frame)}" y1="${padT}" y2="${H - padB}" stroke="${c.onBarLine ? '#9aa' : '#c33'}" stroke-dasharray="3 3"/>`);
  for (const v of [0, 0.2, 0.4, 0.6, 0.8, 1]) parts.push(`<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="#ddd"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end" fill="#666">${v.toFixed(1)}</text>`);
  for (let s = 0; s <= n / FPS; s += 10) parts.push(`<text x="${x(s * FPS)}" y="${H - 10}" text-anchor="middle" fill="#666">${rep.firstFrame + s * FPS}</text>`);
  // region max / min band
  const mx = [], mn = [];
  for (let i = 0; i < n; i++) { let a = 1, b = 0; for (const v of m.cells[i]) { if (v < a) a = v; if (v > b) b = v; } mn.push(a); mx.push(b); }
  parts.push(`<path d="M${mx.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('L')}L${mn.map((v, i) => `${x(n - 1 - i).toFixed(1)},${y(mn[n - 1 - i]).toFixed(1)}`).join('L')}Z" fill="#7a8fb3" opacity="0.18"/>`);
  parts.push(`<path d="M${m.whole.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('L')}" fill="none" stroke="#223" stroke-width="1.2"/>`);
  for (const t of rep.fullFrame.transitions) parts.push(`<circle cx="${fx(t.frame)}" cy="${y(t.toL)}" r="3" fill="${t.dir === 'up' ? '#d17a00' : '#2a6fb0'}"/>`);
  for (const t of rep.area.transitions) parts.push(`<rect x="${fx(t.frame) - 2}" y="${padT - 8}" width="4" height="6" fill="${t.dir === 'up' ? '#d17a00' : '#2a6fb0'}"/>`);
  parts.push(`<text x="${padL}" y="16" fill="#222">${esc(title)}: mean relative luminance (line), region min..max (band), full-frame transitions (dots), area transitions (top ticks), cuts (dashed; red = off a bar line), flagged 1 s windows (orange). ${rep.verdict}</text>`);
  parts.push('</svg>');
  return parts.join('\n');
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- expected cuts from the film's own shot table ---------------------------------------------------------------------
async function filmCuts() {
  try {
    const { shotAt } = await import(pathToFileURL(path.join(ROOT, 'src/shots.js')).href);
    const out = []; let prev = null;
    for (let f = 0; f < 2160; f++) { const s = shotAt(f); const k = `${s.index}|${s.viewName}`; if (prev !== null && k !== prev) out.push(f); prev = k; }
    out.push(2160);                                                    // the cut to black
    return out;
  } catch { return null; }
}

// ---- run ------------------------------------------------------------------------------------------------------------------
export async function checkFlash(input, opts = {}) {
  const o = { ...DEF, ...opts };
  const workDir = opts.workDir || path.dirname(path.resolve(opts.out || path.join(process.cwd(), 'x')));
  const src = source(input, workDir);
  const m = await measure(src, o);
  if (src.frames !== null && m.whole.length !== src.frames) throw new Error(`decoded ${m.whole.length} frames, the render log says ${src.frames}`);
  const expected = opts.noFilmCuts ? null : src.film ? await filmCuts() : null;
  const rep = analyse(m, src.from, o, expected);
  rep.input = src.label; rep.definitions = o; rep.renderDigest = src.digest ?? null;
  return { rep, m };
}

function summary(rep) {
  const L = [];
  L.push(`flash check: ${rep.input}`);
  L.push(`  frames ${rep.firstFrame}..${rep.lastFrame} (${rep.frames})`);
  L.push(`  full-frame light changes: ${rep.fullFrame.transitions.length}; worst 1 s window ${rep.fullFrame.worstWindow.transitions} transitions (${rep.fullFrame.worstWindow.flashes} flashes) from frame ${rep.fullFrame.worstWindow.start}`);
  L.push(`  area transitions (>= 25% of the picture): ${rep.area.transitions.length}; worst 1 s window ${rep.area.worstWindow.transitions} (${rep.area.worstWindow.flashes} flashes) from frame ${rep.area.worstWindow.start}`);
  L.push(`  red: ${rep.red.regionSwings} region swings, ${rep.red.opposingPairs} opposing pairs, largest pair area ${(rep.red.largestPairArea * 100).toFixed(1)}%${rep.red.largestPairFrame !== null ? ` at frame ${rep.red.largestPairFrame}` : ''}; peak region red value ${rep.red.peakRegionRedValue}`);
  const s = rep.largestStep;
  L.push(`  largest frame-to-frame step: full frame ${s.fullFrame.delta} at frame ${s.fullFrame.frame}; one region ${s.region.delta} at frame ${s.region.frame} (region ${s.region.region})`);
  L.push(`  cuts detected: ${rep.cuts.detected.map((c) => c.frame + (c.onBarLine ? '' : '!')).join(' ') || 'none'}${rep.cuts.offBarLine.length ? `  (off a bar line: ${rep.cuts.offBarLine.join(' ')})` : ''}`);
  if (rep.cuts.expected) L.push(`  cuts in src/shots.js not detected: ${rep.cuts.expectedNotDetected.join(' ') || 'none'}; detected but not in the shot table: ${rep.cuts.detectedNotExpected.join(' ') || 'none'}`);
  for (const t of rep.fullFrame.transitions) L.push(`    full-frame ${t.dir} ${t.fromL} -> ${t.toL} frames ${t.from}..${t.frame}${t.atCut ? ' (at a cut)' : ''}`);
  L.push(`  ${rep.verdict}${rep.failures.length ? ': ' + rep.failures.join('; ') : ''}`);
  return L.join('\n');
}

// ---- self-test: the tool must be able to fail ---------------------------------------------------------------------------
async function selftest(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const W = 320, H = 180;
  // linear luminance 0.85 grey is sRGB 238; pure red is luminance 0.2126
  const clips = [
    { name: 'strobe-4hz-full', expr: (v) => `if(mod(floor(N/3),2),${v},0)`, rgb: [255, 255, 255], expect: 'FAIL', why: 'black/white every 3 frames: 8 changes a second' },
    { name: 'strobe-3hz-full', expr: (v) => `if(mod(floor(N/4),2),${v},0)`, rgb: [255, 255, 255], expect: 'PASS', why: 'black/white every 4 frames: 6 changes = 3 flashes a second, the limit' },
    // regions strobing between black and linear 0.30 grey (sRGB 149): the whole picture's mean moves under 0.1, so only
    // the area rule can catch them
    { name: 'strobe-4hz-30pct', expr: (v) => `if(lt(X,0.30*W)*mod(floor(N/3),2),${v},0)`, rgb: [149, 149, 149], expect: 'FAIL', why: '30% of the picture strobing black/grey 0.30 (the area rule alone)' },
    { name: 'strobe-4hz-20pct', expr: (v) => `if(lt(X,0.20*W)*mod(floor(N/3),2),${v},0)`, rgb: [149, 149, 149], expect: 'PASS', why: 'only 20% of the picture strobing (under a quarter)' },
    { name: 'strobe-4hz-20pct-w', expr: (v) => `if(lt(X,0.20*W)*mod(floor(N/3),2),${v},0)`, rgb: [255, 255, 255], expect: 'FAIL', why: '20% strobing black/white: the whole picture swings 0.2 (the full-frame rule)' },
    { name: 'red-2hz-full', expr: (v) => `if(mod(floor(N/6),2),${v},0)`, rgb: [255, 0, 0], expect: 'FAIL', why: 'black/saturated red every 6 frames: 2 flashes a second, all red' },
    { name: 'bright-4hz-full', expr: (v) => `if(mod(floor(N/3),2),${v},238)`, rgb: [255, 255, 255], expect: 'PASS', why: 'grey 0.85 / white every 3 frames: the darker state is above 0.80' },
    { name: 'cut-and-hold', expr: (v) => `if(gte(N,24),${v},0)`, rgb: [255, 255, 255], expect: 'PASS', why: 'one hard cut to white: one transition, not a flash' },
  ];
  const results = [];
  for (const c of clips) {
    const file = path.join(dir, `${c.name}.mkv`);
    const geq = `geq=r='${c.expr(c.rgb[0], 'x')}':g='${c.expr(c.rgb[1], 'x')}':b='${c.expr(c.rgb[2], 'x')}'`;
    const r = spawnSync('nice', ['-n', '5', 'ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=black:s=${W}x${H}:r=${FPS}:d=2,format=gbrp,${geq}`, '-c:v', 'ffv1', '-pix_fmt', 'gbrp', file], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`ffmpeg (${c.name}): ${r.stderr}`);
    const { rep } = await checkFlash(file, { workDir: dir, noFilmCuts: true });
    const ok = rep.verdict === c.expect;
    results.push({ clip: file, why: c.why, expect: c.expect, got: rep.verdict, ok, failures: rep.failures, fullFrameWorst: rep.fullFrame.worstWindow, areaWorst: rep.area.worstWindow, red: { pairs: rep.red.opposingPairs, area: rep.red.largestPairArea } });
    console.log(`${ok ? 'ok  ' : 'BAD '} ${c.name.padEnd(18)} expect ${c.expect} got ${rep.verdict}  (${c.why})${rep.failures.length ? '\n       ' + rep.failures.join('\n       ') : ''}`);
  }
  return results;
}

// ---- main -----------------------------------------------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args(process.argv.slice(2));
  try {
    if (a.selftest) {
      const dir = path.resolve(a.selftest === true ? '.' : a.selftest);
      const results = await selftest(dir);
      const bad = results.filter((r) => !r.ok);
      if (a.out) fs.writeFileSync(a.out, JSON.stringify({ selftest: results, pass: !bad.length }, null, 1));
      console.log(bad.length ? `SELFTEST FAIL: ${bad.length} clip(s) judged wrongly` : `SELFTEST PASS: ${results.length} clips judged as expected`);
      process.exit(bad.length ? 1 : 0);
    }
    if (!a.in) { console.error('usage: node make/check-flash.mjs --in <render dir | video> [--out report.json] [--svg chart.svg] | --selftest <dir>'); process.exit(2); }
    const { rep, m } = await checkFlash(a.in, { out: a.out });
    console.log(summary(rep));
    if (a.out) fs.writeFileSync(a.out, JSON.stringify(rep, null, 1));
    const svg = a.svg === true ? null : a.svg || (a.out ? a.out.replace(/\.json$/, '') + '.svg' : null);
    if (svg) { fs.writeFileSync(svg, chart(rep, m, path.basename(String(a.in)))); console.log(`  chart: ${svg}`); }
    process.exit(rep.verdict === 'PASS' ? 0 : 1);
  } catch (e) {
    console.error(`check-flash: ${e.message}`);
    process.exit(2);
  }
}
