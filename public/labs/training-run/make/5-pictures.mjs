// Step 5. Pictures of a run, drawn as SVG and turned into PNG with sharp (npm install sharp).
//
//   node 5-pictures.mjs strip main      out/main-strip.png   the wide strip under the player in the post
//   node 5-pictures.mjs strip x3        an ending that starts at 20:00 (borrows the first 20:00 from main)
//   node 5-pictures.mjs chart main      out/main-chart.png   the chart with axes (uses out/alone.json for the grey line, if there)
import fs from 'node:fs';
import sharp from 'sharp';

const [kind, name = 'main'] = process.argv.slice(2);
const read = (n) => JSON.parse(fs.readFileSync(new URL(`./out/${n}.json`, import.meta.url), 'utf8'));
const has = (n) => fs.existsSync(new URL(`./out/${n}.json`, import.meta.url));
const run = read(name);
let notes = run.notes;
if (notes[0].g !== 0) notes = read('main').notes.slice(0, notes[0].g).concat(notes);
if (kind === 'chart') {
  if (has('alone')) run.alone = read('alone').notes;
  // The milestones marked under the top panel are read off the run itself.
  const first = (f, from = 0) => notes.find((n) => n.g >= from && f(n));
  const SCALE = new Set([2, 4, 6, 7, 9, 11, 1]);
  const inKey = (n) => { let x = 0, y = 0; for (let i = 0; i < run.P; i++) { y += n.p[i]; if (SCALE.has((run.lo + i) % 12)) x += n.p[i]; } return x / y; };
  const stays = (f) => { for (let g = 0; g < run.breakNote; g++) { let ok = true; for (let h = g; h < Math.min(run.breakNote, g + 24); h++) if (!f(notes[h])) { ok = false; break; } if (ok) return notes[g]; } return null; };
  const marks = [];
  const add = (n, text, o) => { if (n) marks.push({ g: n.g, label: n.clock + ' ' + text, ...o }); };
  add(first((n) => n.held < 2.0075), 'beats a table of which note follows which', { row: 2 });
  add(stays((n) => inKey(n) >= 0.95), '95% of its bets are in the key', { row: 1 });
  add(first((n) => n.heldAcc >= 0.5), 'half its guesses right', { row: 0 });
  add(notes[run.breakNote], 'step size set to its limit', { strong: true, row: 3, anchor: 'end' });
  add(first((n) => n.held > Math.log(run.V), run.breakNote), 'falls apart', { strong: true, row: 0, anchor: 'end' });
  run.marks = marks;
}
const outPath = new URL(`./out/${name}-${kind}.png`, import.meta.url);
const P = run.P, LO = run.lo, V = run.V;
const N = notes.length;                    // 432
const SECONDS = 90, TAIL = 2.5;
const BREAK = run.breakNote;
const GUESS = Math.log(V);

// sequential ramp on a dark surface: nothing -> surface, certain -> lightest blue
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
function ramp(surface) {
  const stops = [[0, hex(surface)], [0.3, hex('#104281')], [0.6, hex('#256abf')], [0.8, hex('#5598e7')], [1, hex('#cde2fb')]];
  return (t) => {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return css(mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    return css(stops[stops.length - 1][1]);
  };
}
const C = { blue: '#3987e5', orange: '#d95926', aqua: '#199e70', yellow: '#c98500', critical: '#d03b3b', text: '#f0efec', text2: '#c3c2b7', muted: '#8f8e86' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// the belief roll: rows are tokens (pitches low to high, then HOLD on top), columns are notes
function roll(x0, w, y0, rowH, surface, withHold, pickH) {
  const col = ramp(surface);
  const cw = w / N;
  const rows = withHold ? P + 1 : P;
  const gap = withHold ? rowH * 0.9 : 0;                    // a little air between the HOLD row and the pitches
  const yOf = (tok) => (tok === P ? y0 : y0 + gap + (rows - 1 - tok) * rowH);   // 0..P-1 pitches (low at the bottom), P = HOLD on top
  let s = '';
  for (let g = 0; g < N; g++) {
    const n = notes[g];
    const x = (x0 + g * cw).toFixed(2);
    for (let i = 0; i < rows; i++) {
      const p = n.p[i];
      if (!(p > 0.003)) continue;
      s += `<rect x="${x}" y="${yOf(i).toFixed(2)}" width="${(cw + 0.3).toFixed(2)}" height="${(rowH + 0.3).toFixed(2)}" fill="${col(Math.sqrt(p))}"/>`;
    }
  }
  for (let g = 0; g < N; g++) {
    const n = notes[g];
    if (!(n.tok >= 0) || n.tok >= rows) continue;
    s += `<rect x="${(x0 + g * cw).toFixed(2)}" y="${(yOf(n.tok) + (rowH - pickH) / 2).toFixed(2)}" width="${cw.toFixed(2)}" height="${pickH.toFixed(2)}" fill="${C.orange}"/>`;
  }
  return { svg: s, yOf, rows, height: rows * rowH + gap };
}
const logY = (v, lo, hi, y0, h) => y0 + h - (Math.log(Math.max(lo, Math.min(hi, v)) / lo) / Math.log(hi / lo)) * h;
function line(xs, ys, color, width = 2, extra = '') {
  let d = '';
  let pen = false;
  for (let i = 0; i < xs.length; i++) {
    if (ys[i] === null || ys[i] !== ys[i]) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + xs[i].toFixed(1) + ' ' + ys[i].toFixed(1);
    pen = true;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}
const clock = (min) => `${String(min).padStart(2, '0')}:00`;

let svg = '';
let W, H;
if (kind === 'strip') {
  W = 1800; H = 320;
  const surface = '#120d1c';
  const pw = W * SECONDS / (SECONDS + TAIL);          // the programme's share of the clip; the rest is ring-out
  const r = roll(0, pw, 5, 6.1, surface, true, 2.8);
  const ly0 = 218, lh = 94, hiL = 600;
  const xs = notes.map((n, g) => (g + 0.5) * pw / N);
  const held = notes.map((n) => (n.held === null || n.held === undefined ? null : logY(n.held, 1, hiL, ly0, lh)));
  const bx = BREAK * pw / N;
  svg += `<rect width="${W}" height="${H}" fill="${surface}"/>`;
  svg += r.svg;
  svg += `<line x1="0" x2="${pw}" y1="${logY(GUESS, 1, hiL, ly0, lh)}" y2="${logY(GUESS, 1, hiL, ly0, lh)}" stroke="#5a5468" stroke-width="2"/>`;
  svg += line(xs, held, C.aqua, 4);
  svg += `<line x1="${bx}" x2="${bx}" y1="0" y2="${H}" stroke="${C.critical}" stroke-width="4"/>`;
  svg += `<text x="${bx - 14}" y="${ly0 + 40}" text-anchor="end" font-family="Inter" font-size="42" font-weight="600" fill="${C.text}">20:00</text>`;
} else {
  // Drawn 1280 wide for a 640 px column: every label is twice the size it shows at.
  W = 1280; H = 1322;
  const surface = '#1a1a19';
  const x0 = 78, pw = W - x0 - 22;
  const xOf = (g) => x0 + g * pw / N;
  const grid = '#32322f';
  const T = (x, y, txt, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'start'}" font-family="Inter" font-size="${o.size || 21}" font-weight="${o.bold ? 600 : 400}" fill="${o.fill || C.text2}">${esc(txt)}</text>`;
  svg += `<rect width="${W}" height="${H}" fill="${surface}"/>`;
  // panel 1: belief roll
  const y1 = 92, rowH = 11;
  const r = roll(x0, pw, y1, rowH, surface, true, 4.2);
  const h1 = r.height;
  svg += T(x0, 36, 'What the model believes, and what it plays', { size: 28, bold: true, fill: C.text });
  svg += T(x0, 70, 'brighter blue = more probability on that note', { size: 21 });
  svg += `<rect x="${x0 + 520}" y="56" width="24" height="8" fill="${C.orange}"/>` + T(x0 + 554, 70, 'the note it picked', { size: 21 });
  svg += r.svg;
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (let i = 0; i < P; i++) {
    const m = LO + i;
    if (m % 12 === 2) svg += T(x0 - 10, r.yOf(i) + rowH + 2, NAMES[m % 12] + (Math.floor(m / 12) - 1), { anchor: 'end', size: 19 });
  }
  svg += T(x0 - 10, r.yOf(P) + rowH, 'hold', { anchor: 'end', size: 19 });
  // milestones, under the roll
  const ym = y1 + h1;
  for (const a of run.marks || []) {
    const x = xOf(a.g);
    const yy = ym + 30 + (a.row || 0) * 29;
    svg += `<line x1="${x}" x2="${x}" y1="${ym + 3}" y2="${yy - 16}" stroke="${C.muted}" stroke-width="1.5"/>`;
    svg += T(x + (a.anchor === 'end' ? -8 : 8), yy, a.label, { anchor: a.anchor || 'start', fill: a.strong ? C.text : C.text2, bold: !!a.strong });
  }
  // panel 2: error
  const y2 = ym + 202, h2 = 300, lo2 = 1, hi2 = 600;
  svg += T(x0, y2 - 52, 'Error on the next note', { size: 28, bold: true, fill: C.text });
  svg += T(x0, y2 - 20, 'lower is better. Log scale, so each gridline is a big jump', { size: 21 });
  for (const t of [1, 2, 5, 10, 30, 100, 300]) {
    const y = logY(t, lo2, hi2, y2, h2);
    svg += `<line x1="${x0}" x2="${x0 + pw}" y1="${y}" y2="${y}" stroke="${grid}" stroke-width="1"/>` + T(x0 - 10, y + 7, String(t), { anchor: 'end', size: 19 });
  }
  const xs = notes.map((n, g) => xOf(g + 0.5));
  for (const [v, label, dy] of [[GUESS, 'guessing: 3.47', -8], [run.bigram || 2.0075, 'a table of which note follows which: 2.01', -8]]) {
    const y = logY(v, lo2, hi2, y2, h2);
    svg += `<line x1="${x0}" x2="${x0 + pw}" y1="${y}" y2="${y}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="7 6"/>`;
    svg += T(x0 + pw * 0.3, y + dy, label, { size: 19 });
  }
  if (run.alone) {      // the same model and the same batches with the step size left alone: the counterfactual
    const ys = run.alone.map((n) => logY(n.held, lo2, hi2, y2, h2));
    svg += line(run.alone.map((n) => xOf(n.g + 0.5)), ys, C.muted, 2.5);
    svg += T(x0 + pw - 4, ys[ys.length - 1] + 30, 'same model, step size left alone', { anchor: 'end', size: 19 });
  }
  svg += line(xs, notes.map((n) => (n.train === null ? null : logY(n.train, lo2, hi2, y2, h2))), C.blue, 2.5);
  svg += line(xs, notes.map((n) => (n.held === null ? null : logY(n.held, lo2, hi2, y2, h2))), C.aqua, 2.5);
  const lgx = x0 + 20, lgy = y2 + 32;
  svg += `<line x1="${lgx}" x2="${lgx + 36}" y1="${lgy}" y2="${lgy}" stroke="${C.blue}" stroke-width="4"/>` + T(lgx + 46, lgy + 7, 'on tunes it trains on', { fill: C.text });
  svg += `<line x1="${lgx}" x2="${lgx + 36}" y1="${lgy + 32}" y2="${lgy + 32}" stroke="${C.aqua}" stroke-width="4"/>` + T(lgx + 46, lgy + 39, 'on the 68 tunes it never sees', { fill: C.text });
  // panel 3: step size against the limit
  const y3 = y2 + h2 + 112, h3 = 190, lo3 = 0.03, hi3 = 30;
  svg += T(x0, y3 - 52, 'Step size ÷ its own limit', { size: 28, bold: true, fill: C.text });
  svg += T(x0, y3 - 20, 'its limit is 2 ÷ sharpness, measured at every note. Over 1x it overshoots', { size: 21 });
  for (const t of [0.1, 0.3, 1, 3, 10, 30]) {
    const y = logY(t, lo3, hi3, y3, h3);
    svg += `<line x1="${x0}" x2="${x0 + pw}" y1="${y}" y2="${y}" stroke="${t === 1 ? C.muted : grid}" stroke-width="${t === 1 ? 1.5 : 1}" ${t === 1 ? 'stroke-dasharray="7 6"' : ''}/>` + T(x0 - 10, y + 7, t + 'x', { anchor: 'end', size: 19 });
  }
  svg += line(xs, notes.map((n) => (n.ratio === null || n.ratio === undefined || !(n.ratio > 0) ? null : logY(n.ratio, lo3, hi3, y3, h3))), C.yellow, 2.5);
  // x axis
  const ya = y3 + h3;
  for (let m = 0; m <= 30; m += 5) {
    const x = xOf(m / 30 * N);
    svg += `<line x1="${x}" x2="${x}" y1="${ya}" y2="${ya + 8}" stroke="${C.muted}" stroke-width="1"/>` + T(x, ya + 32, clock(m), { anchor: m === 0 ? 'start' : m === 30 ? 'end' : 'middle', size: 20 });
  }
  svg += T(x0 + pw / 2, ya + 66, 'programme clock (30:00 is squeezed into 90 seconds of sound)', { anchor: 'middle', size: 20 });
  // the break, through every panel
  const bx = xOf(BREAK);
  svg += `<line x1="${bx}" x2="${bx}" y1="${y1 - 8}" y2="${ya}" stroke="${C.critical}" stroke-width="2.5"/>`;
}
const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
await sharp(Buffer.from(doc)).png().toFile(outPath.pathname);
console.error('wrote', outPath.pathname, W + 'x' + H);
