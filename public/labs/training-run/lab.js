// The page: it starts the worker that trains the model, plays each bar of sound as it arrives, draws what the model
// believes, and checks every number against the published run. The training is in core.js and programme.js, the
// sound in synth.js. Nothing here decides a note.

const $ = (id) => document.getElementById(id);
const app = $('app');
const canvas = $('roll');
const playBtn = $('play');
const clockEl = $('clock');
const statusEl = $('status');

const NOTES = 432;                 // eighth notes in the programme
const BREAK = 288;                 // the note that starts at 20:00
const BARS = 72;
const BREAK_BAR = 48;
const BAR_S = 1.25;                // seconds of sound per bar
const PROGRAMME_S = 90;
const TAIL_S = 2.5;                // ring-out after 30:00
const TOTAL_S = PROGRAMME_S + TAIL_S;
const NOTE_S = PROGRAMME_S / NOTES;
const GUESS = Math.log(32);        // the error of guessing among the 32 choices
const PUBLISHED = { push: 1, climb: 1.02 };

const state = {
  ready: false,
  started: false,
  finished: false,
  P: 30,
  notes: new Array(NOTES).fill(null),
  buffers: new Array(BARS + 1).fill(null),     // the sound of each bar; the last one is the ring-out
  sources: new Map(),
  settings: { ...PUBLISHED },
  playing: false,
  waiting: false,                              // playing, but the training hasn't made the next bar yet
  need: null,
  pos: 0,                                      // seconds into the sound, while not playing
  origin: 0,                                   // audio-clock time of second 0, while playing
  limit: null,
  published: null,
  trainedMs: 0,
  measuring: false,
  error: null,
};
const audit = { steps: 0, same: 0, picks: 0, picksSame: 0, first: null, limit: null, endSteps: 0, endSame: 0, endPicks: 0, endPicksSame: 0, endFirst: null };

let ctx = null;
let out = null;
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ type: 'init' });
fetch(new URL('./published.json', import.meta.url)).then((r) => r.json()).then((p) => { state.published = p; redraw(); showAudit(); }).catch(() => {});

const fmtClock = (sec) => {
  const s = Math.max(0, Math.min(1800, Math.round(sec / PROGRAMME_S * 1800)));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};
const isPublished = (s) => s.push === PUBLISHED.push && s.climb === PUBLISHED.climb;
const say = (text) => { if (statusEl.textContent !== text) statusEl.textContent = text; };

// ---------- the worker's messages ----------
worker.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'ready') {
    state.ready = true;
    state.P = m.P;
    playBtn.disabled = false;
    app.dataset.state = 'ready';
    say('Ready. The training starts when you press Play.');
  } else if (m.type === 'measuring') {
    state.measuring = true;
  } else if (m.type === 'bar') {
    const ending = m.bar >= BREAK_BAR;
    if (ending && (m.push !== state.settings.push || m.climb !== state.settings.climb)) return;   // an ending nobody wants any more
    if (!ending && state.buffers[m.bar]) return;
    state.measuring = false;
    for (const row of m.rows) { state.notes[row.g] = row; check(row); if (row.measured) state.limit = row.measured.limit; }
    const buf = ctx.createBuffer(2, m.L.length, ctx.sampleRate);
    buf.copyToChannel(m.L, 0);
    buf.copyToChannel(m.R, 1);
    state.buffers[m.bar] = buf;
    state.trainedMs = Math.max(state.trainedMs, m.ms || 0);
    paintBar(m.bar);
    // After a wait, carry on only with a few bars in hand, so a slow device stops once and not at every bar.
    if (state.playing && state.waiting) { if (madeUntil() - state.pos >= Math.min(4 * BAR_S, TOTAL_S - state.pos)) startFrom(state.pos); }
    else schedule();
    showAudit();
  } else if (m.type === 'done') {
    if (m.push !== state.settings.push || m.climb !== state.settings.climb) return;
    state.finished = true;
    if (!m.fromBreak) state.fullMs = m.ms;
    showAudit();
  } else if (m.type === 'error') {
    state.error = m.message;
    say('Something went wrong: ' + m.message);
  }
};
worker.onerror = (e) => { state.error = e.message || 'the worker failed to start'; say('This browser could not start the training: ' + state.error); };

// ---------- checking against the published run ----------
function check(row) {
  const pub = state.published;
  if (!pub) return;
  const ending = row.g >= BREAK;
  if (ending && !isPublished(state.settings)) return;
  for (let i = 0; i < row.losses.length; i++) {
    const want = pub.stepLoss[row.step + i];
    const ok = row.losses[i] === want;
    if (ending) { audit.endSteps++; if (ok) audit.endSame++; else if (!audit.endFirst) audit.endFirst = { step: row.step + i + 1, yours: row.losses[i], published: want }; }
    else { audit.steps++; if (ok) audit.same++; else if (!audit.first) audit.first = { step: row.step + i + 1, yours: row.losses[i], published: want }; }
  }
  const okPick = row.tok === pub.picks[row.g];
  if (ending) { audit.endPicks++; if (okPick) audit.endPicksSame++; } else { audit.picks++; if (okPick) audit.picksSame++; }
  if (row.measured) audit.limit = { yours: row.measured.limit, published: pub.limit, same: row.measured.limit === pub.limit };
}
function recheck() {
  Object.assign(audit, { steps: 0, same: 0, picks: 0, picksSame: 0, first: null, limit: null, endSteps: 0, endSame: 0, endPicks: 0, endPicksSame: 0, endFirst: null });
  for (const row of state.notes) if (row) check(row);
}
const n = (x) => x.toLocaleString('en-US');
function showAudit() {
  const box = $('audit');
  const list = $('auditList');
  const line = $('auditLine');
  if (!state.published) { line.textContent = 'the published numbers did not load'; return; }
  if (!state.started) { line.textContent = 'waiting for the run'; list.replaceChildren(); return; }
  const bad = audit.first || audit.endFirst || (audit.limit && !audit.limit.same) || audit.picks !== audit.picksSame || audit.endPicks !== audit.endPicksSame;
  const total = audit.steps + audit.endSteps;
  const all = state.finished && isPublished(state.settings) && total === 6144;
  box.dataset.ok = bad ? 'no' : total ? 'yes' : '';
  line.textContent = bad ? 'your browser differs, see below'
    : all ? 'all 6,144 training steps and 432 notes are identical'
    : audit.steps === 6000 && !isPublished(state.settings) ? 'identical up to 20:00, and the ending is your own push'
    : `${n(audit.same + audit.endSame)} of ${n(total)} training steps identical so far`;
  const items = [];
  const li = (html) => { const el = document.createElement('li'); el.innerHTML = html; items.push(el); };
  li(`<b>Training steps before 20:00.</b> ${n(audit.same)} of ${n(audit.steps)} gave exactly the published error${audit.steps < 6000 ? ' so far (6,000 in all)' : ''}.`);
  li(`<b>Notes it picked before 20:00.</b> ${n(audit.picksSame)} of ${n(audit.picks)} are the published notes${audit.picks < BREAK ? ' so far (288 in all)' : ''}.`);
  if (audit.limit) li(`<b>The limit at 20:00.</b> Yours is <code>${audit.limit.yours}</code>, published <code>${audit.limit.published}</code>: ${audit.limit.same ? 'the same number' : 'different'}.`);
  else li('<b>The limit at 20:00.</b> Not measured yet.');
  if (!isPublished(state.settings)) li('<b>After 20:00.</b> This is your own push, so there is no published run to compare it with.');
  else li(`<b>After 20:00.</b> ${n(audit.endSame)} of ${n(audit.endSteps)} training steps and ${n(audit.endPicksSame)} of ${n(audit.endPicks)} notes are identical${audit.endSteps < 144 ? ' so far (144 of each in all)' : ''}.`);
  const d = audit.first || audit.endFirst;
  if (d) li(`<b>First difference.</b> Step ${n(d.step)}: yours <code>${d.yours}</code>, published <code>${d.published}</code>.`);
  list.replaceChildren(...items);
}

// ---------- sound ----------
function makeContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  let c;
  try { c = new AC({ sampleRate: 44100 }); } catch (e) { c = new AC(); }
  out = c.createGain();
  out.gain.value = 1;
  out.connect(c.destination);
  return c;
}
const barAt = (pos) => (pos >= PROGRAMME_S ? BARS : Math.max(0, Math.floor(pos / BAR_S)));
const barStart = (bar) => bar * BAR_S;
const now = () => (state.playing && !state.waiting && ctx ? Math.min(TOTAL_S, Math.max(0, ctx.currentTime - state.origin)) : state.pos);
function stopSources() {
  for (const s of state.sources.values()) { s.onended = null; try { s.stop(); } catch (e) { /* not started */ } }
  state.sources.clear();
}
function startFrom(pos) {
  stopSources();
  state.pos = pos;
  state.need = null;
  if (!state.buffers[barAt(pos)]) { state.waiting = true; return; }
  state.waiting = false;
  state.origin = ctx.currentTime + 0.06 - pos;
  schedule();
}
function schedule() {
  if (!state.playing || state.waiting || !ctx) return;
  const t = now();
  state.need = null;
  for (let bar = barAt(t); bar <= BARS && barStart(bar) < t + 2.6; bar++) {
    if (state.sources.has(bar)) continue;
    const buf = state.buffers[bar];
    if (!buf) { state.need = bar; break; }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(out);
    const offset = Math.max(0, t - barStart(bar));
    src.start(state.origin + barStart(bar) + offset, offset);
    src.onended = () => { if (state.sources.get(bar) === src) state.sources.delete(bar); };
    state.sources.set(bar, src);
  }
}
function play() {
  if (state.pos >= TOTAL_S - 0.05) state.pos = 0;
  state.playing = true;
  startFrom(state.pos);
}
function pause() {
  state.pos = now();
  stopSources();
  state.playing = false;
  state.waiting = false;
}
// The furthest point there is sound for.
function madeUntil() {
  let bar = 0;
  while (bar <= BARS && state.buffers[bar]) bar++;
  return bar > BARS ? TOTAL_S : barStart(bar);
}
function seek(pos) {
  const p = Math.max(0, Math.min(pos, Math.max(0, madeUntil() - 0.05)));
  if (state.playing) startFrom(p); else state.pos = p;
  frame();
}

playBtn.addEventListener('click', async () => {
  if (!state.ready) return;
  if (!ctx) ctx = makeContext();
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { /* stays suspended until the next press */ } }
  if (!state.started) {
    state.started = true;
    app.dataset.state = 'running';
    worker.postMessage({ type: 'run', sr: ctx.sampleRate, push: state.settings.push, climb: state.settings.climb });
    showAudit();
  }
  if (state.playing) pause(); else play();
  frame();
});

// ---------- the push at 20:00 ----------
const pushIn = $('pushIn');
const climbIn = $('climbIn');
const chips = [...document.querySelectorAll('.chip')];
function showSettings() {
  const s = state.settings;
  const alone = s.push === 0;
  $('pushVal').textContent = alone ? '0.31' : s.push.toFixed(1);
  $('climbVal').textContent = alone ? '0.0' : ((s.climb - 1) * 100).toFixed(1);
  for (const f of document.querySelectorAll('.field')) f.setAttribute('aria-disabled', String(alone));
  $('pushHint').textContent = isPublished(s)
    ? 'The limit is measured in your browser when the run reaches 20:00. Change the push any time: after 20:00 the ending is trained again and plays from 19:35.'
    : alone ? 'Left alone, the step size stays at 0.30 to the end. The grey line is the published ending.'
    : 'Green is your ending and grey is the published one. Both start from the same model at 20:00.';
  for (const c of chips) {
    const p = Number(c.dataset.push);
    const k = Number(c.dataset.climb) === 2 ? 1.02 : 1 + Number(c.dataset.climb) / 100;
    c.setAttribute('aria-pressed', String(p === s.push && (p === 0 || k === s.climb)));
  }
}
let pending = null;
function setSettings(push, climb, soon) {
  const same = push === state.settings.push && climb === state.settings.climb;
  state.settings = { push, climb };
  showSettings();
  if (same) return;
  state.finished = false;                         // the ending on screen is no longer the one asked for
  clearTimeout(pending);
  pending = setTimeout(applySettings, soon ? 0 : 280);
}
function applySettings() {
  if (!state.started) return;                     // the run takes the push as it stands when it starts
  // forget the ending already made, and ask for the new one
  for (let bar = BREAK_BAR; bar <= BARS; bar++) {
    state.buffers[bar] = null;
    const s = state.sources.get(bar);
    if (s) { s.onended = null; try { s.stop(); } catch (e) { /* not started */ } state.sources.delete(bar); }
  }
  for (let g = BREAK; g < NOTES; g++) state.notes[g] = null;
  recheck();
  redraw();
  showAudit();
  worker.postMessage({ type: 'ending', push: state.settings.push, climb: state.settings.climb });
  if (now() >= barStart(BREAK_BAR) - 0.001) {     // already past 20:00: go back to 19:35 and hear the new ending arrive
    const p = barStart(BREAK_BAR - 1);
    if (state.playing) startFrom(p); else state.pos = p;
  }
  frame();
}
for (const c of chips) {
  c.addEventListener('click', () => {
    const p = Number(c.dataset.push);
    const pct = Number(c.dataset.climb);
    if (p > 0) { pushIn.value = String(p); climbIn.value = String(pct); }
    setSettings(p, pct === 2 ? 1.02 : 1 + pct / 100, true);
  });
}
const fromSliders = () => {
  const pct = Number(climbIn.value);
  setSettings(Number(pushIn.value), pct === 2 ? 1.02 : 1 + pct / 100, false);
};
pushIn.addEventListener('input', fromSliders);
climbIn.addEventListener('input', fromSliders);

// ---------- the picture ----------
const g2d = canvas.getContext('2d');
let layer = document.createElement('canvas');     // everything but the playhead
let W = 0;
let H = 0;
let dpr = 1;
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
let ramp = () => '#000';
function makeRamp() {
  const day = document.documentElement.dataset.mode === 'day';
  const surface = hex(css('--surface'));
  const stops = day
    ? [[0, surface], [0.3, hex('#cde2fb')], [0.6, hex('#6da7ec')], [0.8, hex('#2a78d6')], [1, hex('#0d366b')]]
    : [[0, surface], [0.3, hex('#104281')], [0.6, hex('#256abf')], [0.8, hex('#5598e7')], [1, hex('#cde2fb')]];
  ramp = (t) => {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        const a = stops[i - 1][1];
        const b = stops[i][1];
        const k = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
        return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
      }
    }
    return '#fff';
  };
}
const geo = () => {
  const rollTop = 6;
  const rollH = Math.round(H * 0.6);
  const rows = state.P + 1;
  const gap = 4;
  const rowH = (rollH - gap) / rows;
  const errTop = rollTop + rollH + 14;
  const errH = H - errTop - 18;
  return { rollTop, rollH, rows, gap, rowH, errTop, errH };
};
const xOfNote = (g) => g / NOTES * W;
const yOfTok = (q, tok) => (tok === state.P ? q.rollTop : q.rollTop + q.gap + (q.rows - 1 - tok) * q.rowH);
const yOfErr = (q, v) => q.errTop + q.errH - Math.log(Math.max(1, Math.min(600, v))) / Math.log(600) * q.errH;

function paintNotes(c, from, to) {
  const q = geo();
  const cw = W / NOTES;
  const orange = css('--orange');
  for (let g = from; g < to; g++) {
    const row = state.notes[g];
    c.fillStyle = css('--surface');
    c.fillRect(xOfNote(g), q.rollTop, cw + 0.5, q.rollH);
    if (!row) continue;
    for (let i = 0; i <= state.P; i++) {
      const p = row.p[i];
      if (!(p > 0.003)) continue;
      c.fillStyle = ramp(Math.sqrt(p));
      c.fillRect(xOfNote(g), yOfTok(q, i), cw + 0.5, q.rowH + 0.5);
    }
    if (row.tok >= 0 && row.tok <= state.P) {
      c.fillStyle = orange;
      const ph = Math.max(1.5, q.rowH * 0.45);
      c.fillRect(xOfNote(g), yOfTok(q, row.tok) + (q.rowH - ph) / 2, Math.max(1, cw), ph);
    }
  }
}
function paintCurves(c) {
  const q = geo();
  c.fillStyle = css('--surface');
  c.fillRect(0, q.errTop - 12, W, H - q.errTop + 12);
  c.lineWidth = 1;
  c.strokeStyle = css('--line2');
  c.beginPath(); c.moveTo(0, yOfErr(q, GUESS)); c.lineTo(W, yOfErr(q, GUESS)); c.stroke();
  c.font = '11px system-ui, sans-serif';
  c.fillStyle = css('--muted');
  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';
  c.fillText('above this line: worse than guessing', 6, yOfErr(q, GUESS) - 4);
  for (const m of [0, 10, 30]) {
    c.textAlign = m === 0 ? 'left' : m === 30 ? 'right' : 'center';
    c.fillText(String(m).padStart(2, '0') + ':00', m === 0 ? 4 : m === 30 ? W - 4 : m / 30 * W, H - 5);
  }
  const curve = (get, color, width, from) => {
    c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.beginPath();
    let pen = false;
    for (let g = from; g < NOTES; g++) {
      const v = get(g);
      if (v === null || v === undefined || v !== v) continue;
      const x = xOfNote(g + 0.5);
      const y = yOfErr(q, v);
      if (pen) c.lineTo(x, y); else c.moveTo(x, y);
      pen = true;
    }
    c.stroke();
  };
  // grey: the published ending, when yours is a different push
  if (state.published && !isPublished(state.settings)) curve((g) => state.published.held[g], css('--muted'), 1.5, BREAK - 1);
  curve((g) => (state.notes[g] ? state.notes[g].held : null), css('--aqua'), 2, 0);
}
function paintBreak(c) {
  const x = xOfNote(BREAK);
  c.strokeStyle = css('--critical'); c.lineWidth = 2;
  c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
  const q = geo();
  c.font = '600 12px system-ui, sans-serif';
  c.fillStyle = css('--text');
  c.textAlign = 'right';
  c.fillText('20:00', x - 5, q.errTop + 4);
}
function redraw() {
  if (!W) return;
  const c = layer.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = css('--surface');
  c.fillRect(0, 0, W, H);
  makeRamp();
  paintNotes(c, 0, NOTES);
  paintCurves(c);
  paintBreak(c);
  frame();
}
function paintBar(bar) {
  if (!W || bar >= BARS) return;
  const c = layer.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintNotes(c, bar * 6, bar * 6 + 6);
  paintCurves(c);
  paintBreak(c);
}
function resize() {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  dpr = Math.min(2.5, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  for (const cv of [canvas, layer]) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  redraw();
}
new ResizeObserver(resize).observe(canvas);

// ---------- every frame ----------
let lastNote = -1;
function readout(t) {
  const g = Math.max(0, Math.min(NOTES - 1, Math.floor(t / NOTE_S)));
  clockEl.textContent = fmtClock(Math.min(t, PROGRAMME_S));
  canvas.setAttribute('aria-valuenow', String(Math.round(Math.min(t, PROGRAMME_S) / PROGRAMME_S * 1800)));
  canvas.setAttribute('aria-valuetext', fmtClock(Math.min(t, PROGRAMME_S)));
  if (g === lastNote) return;
  lastNote = g;
  const row = state.notes[g];
  if (!row) return;
  let h = row;
  for (let k = g; k >= 0 && (h.held === undefined || h.held === null); k--) h = state.notes[k] || h;
  $('rSteps').textContent = n(row.step);
  if (h.held !== undefined && h.held !== null) {
    $('rErr').textContent = h.held >= 100 ? h.held.toFixed(0) : h.held.toFixed(2);
    $('rAcc').textContent = Math.round(h.heldAcc * 100) + '%';
  }
  const lim = state.limit;
  $('rLr').innerHTML = row.lr.toFixed(2) + (lim ? `<small>${(row.lr / lim).toFixed(2)}x its limit at 20:00</small>` : '<small>limit not measured yet</small>');
}
function status() {
  if (state.error) return;
  if (!state.started) return;
  const made = madeUntil();
  if (state.playing && state.waiting) say(state.measuring ? '20:00 reached. Measuring the limit.' : 'Waiting for the training to catch up.');
  else if (made < TOTAL_S) say(state.measuring ? `Trained up to 20:00. Measuring the limit.` : `Training. It has reached ${fmtClock(Math.min(made, PROGRAMME_S))} of the programme.`);
  else say(state.fullMs ? `Trained in ${Math.round(state.fullMs / 1000)} seconds in your browser. Change the push and the ending plays again.` : 'Trained. Change the push and the ending plays again.');
}
function frame() {
  if (!W) return;
  const t = now();
  g2d.setTransform(1, 0, 0, 1, 0, 0);
  g2d.drawImage(layer, 0, 0);
  g2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  const x = Math.min(W - 1, Math.min(t, PROGRAMME_S) / PROGRAMME_S * W);
  g2d.fillStyle = css('--head');
  g2d.fillRect(x - 1, 0, 2, H);
  readout(t);
  const label = state.playing ? 'Pause' : state.pos >= TOTAL_S - 0.05 ? 'Play again' : 'Play';
  if (playBtn.textContent !== label) playBtn.textContent = label;
}
function tick() {
  if (state.playing && !state.waiting) {
    const t = now();
    if (t >= TOTAL_S - 0.01) { state.playing = false; state.pos = TOTAL_S; stopSources(); }
    else if (state.need !== null && t >= barStart(state.need) - 0.03) { state.pos = barStart(state.need); state.waiting = true; stopSources(); }
    else schedule();
  }
  status();
}
setInterval(tick, 50);
(function loop() { frame(); requestAnimationFrame(loop); })();

// ---------- moving through it ----------
let dragging = false;
const seekTo = (e) => { const r = canvas.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * PROGRAMME_S); };
canvas.addEventListener('pointerdown', (e) => { if (!state.started) return; dragging = true; canvas.setPointerCapture(e.pointerId); seekTo(e); });
canvas.addEventListener('pointermove', (e) => { if (dragging) seekTo(e); });
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });
canvas.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); if (state.started) seek(now() + (e.key === 'ArrowLeft' ? -BAR_S * 2 : BAR_S * 2)); }
  else if (e.key === ' ') { e.preventDefault(); playBtn.click(); }
  else if (e.key === 'Home') { e.preventDefault(); if (state.started) seek(0); }
});

// ---------- day and night ----------
const modeBtn = $('modeBtn');
const showMode = () => { modeBtn.textContent = document.documentElement.dataset.mode === 'day' ? 'Night' : 'Day'; };
modeBtn.addEventListener('click', () => {
  document.documentElement.dataset.mode = document.documentElement.dataset.mode === 'day' ? 'night' : 'day';
  showMode();
  redraw();
});
showMode();
showSettings();

// For tests: what the page knows, without touching how it runs.
window.trainingRun = { state, audit, now, madeUntil };
