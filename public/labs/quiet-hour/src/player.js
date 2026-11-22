// THE QUIET HOUR: the player page (../index.html without ?render).
//
// The film itself (../film.js) is a pure function of (frame, ending) and never reads a clock. This file owns time:
//   - Sound is the master clock: one AudioContext, the ending's soundtrack decoded into a buffer and played from the
//     chosen offset. Film seconds = offset + (context time since start) - output latency.
//   - With the sound off, not loaded, or missing, time advances from requestAnimationFrame timestamps.
//   - Each animation frame draws film frame floor(seconds x 24). Frames 2160 and later are black (the coda: sound only)
//     and at 100 s it stops on a Replay card.
// Only requestAnimationFrame and the AudioContext run time here (no timers), so the site's <ao-game> frame can pause
// the page by holding the first and suspending the second.
//
// Speed: the film's canvas has a fixed internal size per film instance, so the player keeps one film per size
// (1280x720, 960x540, 640x360 draft) and swaps to a smaller or larger one when the measured time between drawn frames
// says it falls behind or has room. It drops frames rather than drift from the sound.

import { createFilm, ENDINGS } from '../film.js';
import { FPS, PROGRAMME_FRAMES, TOTAL_FRAMES, clockText } from './time.js';
import { gaugesAt, formatValue, formatReads, readable } from './ui/gauges.js';
import { marksFor, groupMarks } from './ui/marks.js';

const END_S = TOTAL_FRAMES / FPS;                        // 100 s
const TIERS = [
  { w: 1280, h: 720, quality: 'final' },
  { w: 960, h: 540, quality: 'final' },
  { w: 640, h: 360, quality: 'draft' },
];
const POSTER_FRAME = 300;
const XRAY = Object.freeze({ xray: true });     // film.renderFrame's option: the programme's own x-ray labels
const FRAME_S = 1 / FPS;
const AUDIO_NAME = (ending) => `fable-opus-quiet-hour-${ending}.mp3`;
const DEFAULT_AUDIO_BASE = '/media/three-ai-experiments/';

const $ = (id) => document.getElementById(id);

export function startPlayer() {
  const ui = {
    theatre: $('theatre'), head: document.querySelector('.head'), stage: $('stage'), poster: $('poster'), posterNote: $('posterNote'), bigPlay: $('bigPlay'),
    codaSub: $('codaSub'), bar: $('bar'), scrub: $('scrub'), marks: $('marks'), seek: $('seek'), tip: $('tip'),
    play: $('play'), progClock: $('progClock'), filmTime: $('filmTime'), sound: $('sound'), xrayBtn: $('xrayBtn'),
    xray: $('xray'), gauges: $('gauges'), status: $('status'),
    endingBtns: [...document.querySelectorAll('[data-ending]')], endingSel: $('endingSel'),
  };
  const q = new URLSearchParams(location.search);
  const audioBase = sameOriginBase(q.get('audio')) || DEFAULT_AUDIO_BASE;

  const st = {
    film: null, canvas: null, tier: 1, maxTier: 0, pending: null, badUntil: [0, 0, 0],
    ending: ENDINGS.includes(q.get('ending')) ? q.get('ending') : 'main',
    t: 0, playing: false, started: false, scrubbing: false, shown: -1, coda: null,
    soundOn: true, xrayOn: false,
    // the clock
    mode: 'raf', lastTs: null, ac: null, gain: null, src: null, srcStart: 0, srcOffset: 0,
    audio: { ending: null, buffer: null, state: 'none', token: 0 },
    // speed
    ema: null, samples: 0, drewLast: false, lastChangeTs: 0, skip: 0,
    marks: [], gaugeRows: new Map(), msgs: { audio: '', size: '' },
    endingChain: Promise.resolve(),
  };

  if (q.has('debug')) window.__qhPlayer = st;    // for the page's own tests

  // ---- can this browser draw it? ------------------------------------------------------------------------------------
  if (!hasWebGL2()) {
    showCard('This film is drawn live with WebGL 2, which this browser has turned off or does not have. The post has the rendered film.');
    disableControls();
    return;
  }

  // ---- layout ----------------------------------------------------------------------------------------------------------
  let lastMarksWidth = 0;
  function fit() {
    // the x-ray goes beside the picture on wide screens and in short landscape frames (the post's 16:9 embed), under it on phones
    const tw = ui.theatre.clientWidth;
    const wide = tw >= 960;
    const overlay = !wide && tw >= 520 && window.innerHeight < Math.max(600, tw * 0.75);
    ui.theatre.classList.toggle('wide', wide);
    ui.theatre.classList.toggle('overlay', overlay);
    ui.theatre.classList.toggle('xray-on', st.xrayOn);
    const w = ui.stage.clientWidth;
    const barH = ui.bar.offsetHeight, headH = ui.head.offsetHeight;
    const vh = window.innerHeight;
    // as large as the window allows: the title, the picture and the controls on one screen
    const h = Math.max(Math.min(160, w * 9 / 16), Math.min(w * 9 / 16, vh - barH - headH));
    ui.stage.style.height = `${Math.round(h)}px`;
    const pw = overlay && st.xrayOn ? ui.xray.offsetWidth : 0;   // the x-ray lying over the stage's right side
    if (overlay) ui.xray.style.height = `${Math.round(h)}px`; else ui.xray.style.height = '';
    ui.poster.style.right = pw ? `${pw}px` : '';
    if (st.canvas) {
      const cw = Math.min(w - pw, h * 16 / 9), ch = cw * 9 / 16;
      st.canvas.style.width = `${Math.round(cw)}px`; st.canvas.style.height = `${Math.round(ch)}px`;
    }
    ui.xray.style.maxHeight = wide && st.xrayOn ? `${Math.round(h + barH)}px` : '';
    const mw = ui.marks.clientWidth;
    if (mw && mw !== lastMarksWidth) { lastMarksWidth = mw; drawMarks(); }
  }
  window.addEventListener('resize', fit);
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => fit()).observe(ui.theatre);

  function chooseTier() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = ui.stage.clientWidth * dpr;
    let t = px >= 1100 ? 0 : px >= 760 ? 1 : 2;
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (coarse && t === 0) t = 1;                     // phones and tablets start at 960x540 at most
    st.maxTier = px >= 1100 ? 0 : px >= 760 ? 1 : 2;  // never draw more pixels than the screen shows
    return t;
  }

  // ---- films (one per size) ---------------------------------------------------------------------------------------------
  async function makeFilm(tier) {
    const T = TIERS[tier];
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'The Quiet Hour, drawn live');
    const film = await createFilm({ canvas, width: T.w, height: T.h, ending: st.ending, quality: T.quality, xrayText: readable });
    await film.ready;
    // the ending may have changed while this one was being built
    while (film.ending !== st.ending) await film.setEnding(st.ending);
    return { film, canvas, tier };
  }

  function swapIn({ film, canvas, tier }) {
    const old = st.film, oldCanvas = st.canvas;
    st.film = film; st.canvas = canvas; st.tier = tier;
    ui.stage.insertBefore(canvas, ui.stage.firstChild);
    if (oldCanvas) oldCanvas.remove();
    if (old) {
      try { old.dispose(); } catch { /* nothing to free */ }
      try { old.renderer.forceContextLoss(); } catch { /* already gone */ }
    }
    st.shown = -1; st.ema = null; st.samples = 0; st.skip = 6;
    fit();
    const T = TIERS[tier];
    st.msgs.size = `Drawn live at ${T.w} × ${T.h}${T.quality === 'draft' ? ', draft quality' : ''}.`;
    showStatus();
  }

  function changeTier(tier, ts) {
    if (st.pending || tier === st.tier || tier < st.maxTier || tier >= TIERS.length) return;
    st.lastChangeTs = ts;
    st.pending = makeFilm(tier).then((f) => { st.pending = null; swapIn(f); redraw(); })
      .catch(() => { st.pending = null; st.badUntil[tier] = Infinity; });
  }

  // ---- drawing --------------------------------------------------------------------------------------------------------
  function frameOf(t) { return Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(t * FPS + 1e-6))); }

  function draw(frame) {
    if (!st.film) return false;
    let drew = false;
    const coda = frame >= PROGRAMME_FRAMES;
    if (coda !== st.coda) { ui.stage.classList.toggle('coda', coda); st.coda = coda; }
    if (coda) {
      const sub = st.film.engine && st.film.engine.subtitleAt(frame);
      const text = sub ? sub.text : '';
      if (ui.codaSub.textContent !== text) ui.codaSub.textContent = text;
    } else {
      if (ui.codaSub.textContent) ui.codaSub.textContent = '';
      if (frame !== st.shown) { st.film.renderFrame(frame, st.xrayOn ? XRAY : undefined); st.shown = frame; drew = true; }
    }
    return drew;
  }

  function redraw() { st.shown = -1; draw(frameOf(st.t)); updateReadouts(); }

  let lastClock = '', lastFilm = '', lastSeek = -1, lastGaugeFrame = -1;
  function updateReadouts() {
    const frame = frameOf(st.t);
    const clock = clockText(Math.min(frame, PROGRAMME_FRAMES));
    const tenths = Math.floor(st.t * 10 + 1e-6);
    const film = `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
    if (clock !== lastClock) { ui.progClock.textContent = clock; lastClock = clock; }
    if (film !== lastFilm) { ui.filmTime.textContent = film; lastFilm = film; }
    if (frame !== lastSeek && !st.scrubbing) {
      ui.seek.value = String(frame); lastSeek = frame;
      ui.seek.setAttribute('aria-valuetext', `${clock} on the programme clock, ${film.slice(0, -2)} into the film`);
    }
    if (st.xrayOn && frame !== lastGaugeFrame) { lastGaugeFrame = frame; renderGauges(Math.min(frame, PROGRAMME_FRAMES - 1)); }
  }

  // ---- the clock --------------------------------------------------------------------------------------------------------
  function now() {
    if (st.mode === 'audio' && st.ac && st.src) {
      const lat = (st.ac.outputLatency || st.ac.baseLatency || 0);
      return Math.max(st.srcOffset, st.srcOffset + (st.ac.currentTime - st.srcStart) - lat);
    }
    return st.t;
  }

  function tick(ts) {
    if (!st.playing) return;
    // speed: the time between this callback and the one that drew the last frame
    if (st.drewLast && st.lastTs !== null) measure(ts - st.lastTs, ts);
    if (st.mode === 'audio') st.t = now();
    else if (st.lastTs !== null && !st.scrubbing) st.t += Math.min(1, Math.max(0, (ts - st.lastTs) / 1000));   // a held frame does not jump
    st.lastTs = ts;
    if (st.t >= END_S) { finish(); return; }
    st.drewLast = draw(frameOf(st.t));
    updateReadouts();
    requestAnimationFrame(tick);
  }

  function measure(dtMs, ts) {
    if (st.skip > 0) { st.skip--; return; }
    st.ema = st.ema === null ? dtMs : st.ema + 0.15 * (dtMs - st.ema);
    st.samples++;
    const budget = 1000 * FRAME_S;
    if (st.pending || ts - st.lastChangeTs < 4000) return;
    // far behind: step down after a few frames; a little behind: after a second's worth
    const behind = (st.ema > 2.5 * budget && st.samples >= 6) || (st.ema > 1.4 * budget && st.samples >= 24);
    if (behind && st.tier < TIERS.length - 1) {
      st.badUntil[st.tier] = ts + 30000;             // do not climb back to this size for a while
      changeTier(st.tier + 1, ts);
    } else if (st.ema < 0.55 * budget && st.samples > 72 && st.tier > st.maxTier && ts > st.badUntil[st.tier - 1]) {
      changeTier(st.tier - 1, ts);
    }
  }

  function play() {
    if (!st.film) return;
    if (st.t >= END_S - FRAME_S) st.t = 0;
    hidePoster(); st.started = true;
    st.playing = true; st.lastTs = null; st.drewLast = false;
    ensureAudioContext();
    startClock();
    setPlayLabel();
    requestAnimationFrame(tick);
  }

  function pause() {
    if (!st.playing) return;
    st.t = now();
    stopSource();
    st.playing = false; st.mode = 'raf';
    setPlayLabel(); updateReadouts();
  }

  function finish() {
    stopSource();
    st.playing = false; st.mode = 'raf'; st.t = END_S - FRAME_S / 2;
    draw(TOTAL_FRAMES - 1); updateReadouts(); setPlayLabel();
    showPoster('Replay', 'Goodnight.');
  }

  function togglePlay() { if (st.playing) pause(); else play(); }

  function seekTo(t) {
    if (!st.film) return;
    if (st.playing) { stopSource(); st.mode = 'raf'; }
    st.t = Math.max(0, Math.min(END_S - FRAME_S / 2, t));
    if (st.playing && !st.scrubbing) startClock();
    if (!st.started) hidePoster();
    if (ui.poster.dataset.kind === 'replay') hidePoster();
    draw(frameOf(st.t)); updateReadouts();
  }

  // ---- sound ------------------------------------------------------------------------------------------------------------
  function ensureAudioContext() {
    if (!st.soundOn) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { st.msgs.audio = 'This browser has no Web Audio, so the film plays silently.'; showStatus(); return null; }
    if (!st.ac) {
      try {
        st.ac = new AC();
        st.gain = st.ac.createGain(); st.gain.gain.value = 1; st.gain.connect(st.ac.destination);
      } catch { st.ac = null; st.msgs.audio = 'Sound could not start here, so the film plays silently.'; showStatus(); return null; }
    }
    if (st.ac.state === 'suspended') st.ac.resume().catch(() => {});
    return st.ac;
  }

  function loadAudio(ending) {
    if (st.audio.ending === ending && st.audio.state !== 'none') return st.audio.promise;
    const token = ++st.audio.token;
    st.audio = { ending, buffer: null, state: 'loading', token, promise: null };
    st.msgs.audio = 'Loading the sound.'; showStatus();
    const url = new URL(AUDIO_NAME(ending), new URL(audioBase, location.href)).href;
    let tail = 0;
    st.audio.promise = fetch(url)
      .then((r) => { if (!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
      .then((data) => { tail = mp3TailPadding(data); return data; })
      .then((data) => new Promise((resolve, reject) => {
        // the callback form works in old Safari too; the promise form everywhere else
        const p = st.ac.decodeAudioData(data, resolve, reject);
        if (p && typeof p.catch === 'function') p.catch(reject);
      }))
      .then((buffer) => {
        if (st.audio.token !== token) return null;
        st.audio.buffer = buffer; st.audio.lead = leadIn(buffer, tail); st.audio.state = 'ready'; st.msgs.audio = ''; showStatus();
        return buffer;
      })
      .catch(() => {
        if (st.audio.token !== token) return null;
        st.audio.state = 'failed';
        st.msgs.audio = 'The sound could not be loaded, so the film plays silently.'; showStatus();
        return null;
      });
    return st.audio.promise;
  }

  function startClock() {
    st.mode = 'raf'; st.lastTs = null;
    if (!st.soundOn || !st.ac) return;
    const ending = st.ending;
    if (st.audio.ending === ending && st.audio.state === 'ready') { startSource(st.t); return; }
    if (st.audio.ending === ending && st.audio.state === 'failed') return;
    loadAudio(ending).then((buf) => {
      if (buf && st.playing && !st.scrubbing && st.soundOn && st.ending === ending && st.mode === 'raf') startSource(st.t);
    });
  }

  function startSource(t) {
    stopSource();
    const lead = st.audio.lead || 0;
    if (!st.ac || !st.audio.buffer || t + lead >= st.audio.buffer.duration) { st.mode = 'raf'; return; }
    const src = st.ac.createBufferSource();
    src.buffer = st.audio.buffer;
    src.connect(st.gain);
    src.start(0, t + lead);
    st.src = src; st.srcStart = st.ac.currentTime; st.srcOffset = t; st.mode = 'audio';
  }

  function stopSource() {
    if (st.src) {
      if (st.mode === 'audio') st.t = now();
      try { st.src.stop(); } catch { /* not started */ }
      try { st.src.disconnect(); } catch { /* already */ }
      st.src = null;
    }
  }

  function setSound(on) {
    st.soundOn = on;
    ui.sound.setAttribute('aria-pressed', String(on));
    ui.sound.textContent = on ? 'Sound on' : 'Sound off';
    if (!on) {
      if (st.playing) { stopSource(); st.mode = 'raf'; st.lastTs = null; }
      st.msgs.audio = ''; showStatus();
    } else {
      ensureAudioContext();
      if (st.playing && !st.scrubbing) startClock();
    }
  }

  // ---- endings ----------------------------------------------------------------------------------------------------------
  function setEnding(name) {
    if (!ENDINGS.includes(name) || name === st.ending) return;
    st.ending = name;
    for (const b of ui.endingBtns) b.setAttribute('aria-pressed', String(b.dataset.ending === name));
    if (ui.endingSel.value !== name) ui.endingSel.value = name;
    // the sound of the old ending stops at once; the picture keeps time on its own until the new sound is in
    if (st.playing) { stopSource(); st.mode = 'raf'; st.lastTs = null; }
    st.audio = { ending: null, buffer: null, state: 'none', token: st.audio.token + 1 };
    st.endingChain = st.endingChain.then(async () => {
      if (!st.film || st.ending !== name) return;
      await st.film.setEnding(name);
      if (st.ending !== name) return;
      st.marks = marksFor(st.film.engine); drawMarks();
      lastGaugeFrame = -1; ui.gauges.textContent = ''; st.gaugeRows.clear();
      redraw();
      if (st.playing && !st.scrubbing) startClock();
    }).catch(() => { st.msgs.audio = 'That ending could not be loaded.'; showStatus(); });
  }

  // ---- marks on the time bar ---------------------------------------------------------------------------------------------
  let tipFor = null;
  // the programme clock under the bar: 00:00, the turn at 20:00, 30:00, then the black coda
  {
    const ticks = document.createElement('div');
    ticks.className = 'ticks'; ticks.setAttribute('aria-hidden', 'true');
    for (const [f, label] of [[0, '00:00'], [1440, '20:00'], [2160, '30:00']]) {
      const s = document.createElement('span');
      s.style.left = `${(f / (TOTAL_FRAMES - 1)) * 100}%`; s.textContent = label;
      if (f === 1440) s.className = 'turn';
      ticks.appendChild(s);
    }
    ui.scrub.appendChild(ticks);
  }
  function drawMarks() {
    const w = ui.marks.clientWidth;
    ui.marks.textContent = '';
    hideTip();
    if (!w || !st.marks.length) return;
    const minFrames = (14 / w) * (TOTAL_FRAMES - 1);
    for (const g of groupMarks(st.marks, minFrames)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `mark ${g.cls}`;
      b.style.left = `${(g.frame / (TOTAL_FRAMES - 1)) * 100}%`;
      if (g.items.length > 1) b.dataset.n = String(g.items.length);
      b.setAttribute('aria-label', g.items.map((m) => `${m.clock} ${m.label}`).join('. '));
      b.addEventListener('mouseenter', () => showTip(g, b));
      b.addEventListener('mouseleave', () => { if (document.activeElement !== b) hideTip(); });
      b.addEventListener('focus', () => showTip(g, b));
      b.addEventListener('blur', () => hideTip());
      b.addEventListener('click', () => { seekTo(g.frame / FPS); showTip(g, b); });
      ui.marks.appendChild(b);
    }
  }
  function showTip(g, el) {
    tipFor = el;
    ui.tip.textContent = '';
    const ul = document.createElement('ul');
    for (const m of g.items) {
      const li = document.createElement('li');
      const b = document.createElement('b'); b.textContent = m.clock;
      li.append(b, ' ', m.label);
      if (m.why) { const w = document.createElement('span'); w.className = 'why'; w.textContent = m.why; li.appendChild(w); }
      ul.appendChild(li);
    }
    ui.tip.appendChild(ul);
    ui.tip.hidden = false;
    // the tip opens upward over the picture: if the values would push it past the top, show the events alone
    const room = ui.scrub.getBoundingClientRect().top - ui.theatre.getBoundingClientRect().top + 50;
    if (ui.tip.offsetHeight > room) for (const w of ui.tip.querySelectorAll('.why')) w.hidden = true;
    const sw = ui.scrub.clientWidth, tw = ui.tip.offsetWidth;
    const x = el.offsetLeft + ui.marks.offsetLeft;
    ui.tip.style.left = `${Math.max(0, Math.min(sw - tw, x - tw / 2))}px`;
  }
  function hideTip() { ui.tip.hidden = true; tipFor = null; }
  document.addEventListener('pointerdown', (e) => { if (tipFor && !ui.marks.contains(e.target)) hideTip(); });

  // ---- x-ray ------------------------------------------------------------------------------------------------------------
  function renderGauges(frame) {
    if (!st.film || !st.film.engine) return;
    let list;
    try { list = gaugesAt(st.film.engine, frame); } catch { return; }
    for (const g of list) {
      let row = st.gaugeRows.get(g.id);
      if (!row) {
        const li = document.createElement('li');
        const name = document.createElement('span'); name.className = 'name'; name.textContent = g.name || g.id;
        const val = document.createElement('span'); val.className = 'val';
        const reads = document.createElement('span'); reads.className = 'reads';
        li.append(name, val, reads);
        const rule = document.createElement('span'); rule.className = 'rule'; li.appendChild(rule);
        ui.gauges.appendChild(li);
        row = { val, reads, rule, v: null, r: null, u: null };
        st.gaugeRows.set(g.id, row);
      }
      const v = formatValue(g.value), r = formatReads(g.reads);
      if (v !== row.v) { row.val.textContent = v; row.v = v; }
      if (r !== row.r) {
        // the clocks and the crank read the frame, not the log (bible 9): say so rather than show nothing
        row.reads.textContent = r ? `log: ${r}` : (g.id === 'subtitle' ? '' : 'log: none, it keeps time');
        row.r = r;
      }
      const u = g.rule ? `rule: ${g.rule}` : '';                // the maker's line changes its rule with the line
      if (u !== row.u) { row.rule.textContent = u; row.rule.hidden = !u; row.u = u; }
    }
  }
  function setXray(on) {
    st.xrayOn = on;
    ui.xrayBtn.setAttribute('aria-pressed', String(on));
    ui.xray.hidden = !on;
    fit();
    lastGaugeFrame = -1;
    if (on) renderGauges(Math.min(frameOf(st.t), PROGRAMME_FRAMES - 1));
    st.shown = -1;
    if (st.film && !st.started && !ui.poster.hidden) { draw(POSTER_FRAME); st.shown = -1; }
    else if (!st.playing && st.film) redraw();
  }

  // ---- poster, status, controls ------------------------------------------------------------------------------------------
  function showPoster(label, note) {
    ui.poster.hidden = false; ui.poster.classList.remove('card');
    ui.poster.dataset.kind = label === 'Replay' ? 'replay' : 'play';
    ui.bigPlay.querySelector('span').textContent = label;
    ui.posterNote.textContent = note;
    ui.bigPlay.disabled = false;
  }
  function hidePoster() {
    if (!ui.poster.hidden) {
      const hadFocus = ui.poster.contains(document.activeElement);
      ui.poster.hidden = true;
      if (hadFocus) ui.play.focus();
    }
  }
  function showCard(text) {
    ui.poster.hidden = false; ui.poster.classList.add('card');
    ui.posterNote.textContent = text; ui.bigPlay.hidden = true;
  }
  function disableControls() {
    for (const el of [ui.play, ui.seek, ui.sound, ui.xrayBtn, ui.endingSel, ...ui.endingBtns]) el.disabled = true;
  }
  function setPlayLabel() {
    ui.play.textContent = st.playing ? 'Pause' : (st.t >= END_S - FRAME_S ? 'Replay' : 'Play');
  }
  function showStatus() {
    ui.status.textContent = [st.msgs.audio, st.msgs.size].filter(Boolean).join(' ');
  }

  ui.play.addEventListener('click', togglePlay);
  ui.bigPlay.addEventListener('click', () => { if (ui.poster.dataset.kind === 'replay') st.t = 0; play(); });
  ui.sound.addEventListener('click', () => setSound(!st.soundOn));
  ui.xrayBtn.addEventListener('click', () => setXray(!st.xrayOn));
  for (const b of ui.endingBtns) b.addEventListener('click', () => setEnding(b.dataset.ending));
  ui.endingSel.value = st.ending;
  for (const b of ui.endingBtns) b.setAttribute('aria-pressed', String(b.dataset.ending === st.ending));
  ui.endingSel.addEventListener('change', () => setEnding(ui.endingSel.value));

  ui.seek.addEventListener('pointerdown', () => { st.scrubbing = true; if (st.playing) { stopSource(); st.mode = 'raf'; } });
  const endScrub = () => {
    if (!st.scrubbing) return;
    st.scrubbing = false;
    if (st.playing) startClock();
  };
  window.addEventListener('pointerup', endScrub);
  window.addEventListener('pointercancel', endScrub);
  ui.seek.addEventListener('input', () => seekTo(+ui.seek.value / FPS));
  ui.seek.addEventListener('change', () => { endScrub(); seekTo(+ui.seek.value / FPS); });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !st.film) return;
    const tag = e.target && e.target.tagName;
    if (e.key === ' ' || e.key === 'Spacebar') {
      if (tag === 'BUTTON' || tag === 'A' || tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type !== 'range')) return;
      e.preventDefault();
      if (!e.repeat) togglePlay();
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && tag !== 'INPUT') {
      e.preventDefault();
      seekTo(st.t + (e.key === 'ArrowLeft' ? -5 : 5));
    }
  });

  // ---- start ------------------------------------------------------------------------------------------------------------
  fit();
  drawMarks();
  st.tier = chooseTier();
  makeFilm(st.tier).then((f) => {
    swapIn(f);
    st.marks = marksFor(st.film.engine); drawMarks();
    // the poster: one frame from before the turn, drawn once; nothing moves until Play
    draw(POSTER_FRAME); st.shown = -1;
    updateReadouts();
    showPoster('Play', 'A music box learns jigs by ear. 100 seconds, with sound.');
    for (const el of [ui.play]) el.disabled = false;
    fit();
  }).catch(() => {
    showCard('This browser could not draw the film. The post has the rendered film.');
    disableControls();
  });
}

function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch { return false; }
}

/**
 * The soundtrack is exactly 100 s (4,800,000 samples at 48 kHz). An mp3 starts with the encoder's delay and ends with
 * padding; Chromium and Firefox cut both (the file's LAME/Info tag says how much), so the buffer is 100 s and starts
 * at 0. A browser that keeps them gives a longer buffer: the sound then starts `lead` seconds in, where lead is the
 * extra length less the padding at the end (read from the tag; 0 if there is none). Never more than 0.2 s.
 */
function leadIn(buffer, tailSamples) {
  const extra = buffer.duration - END_S;
  if (!(extra > 0.0005) || extra > 0.2) return 0;
  return Math.max(0, extra - tailSamples / buffer.sampleRate);
}

/** The end padding the encoder wrote in the mp3's LAME/Info tag, in samples (less the decoder's 529), or 0. */
function mp3TailPadding(data) {
  try {
    const b = new Uint8Array(data, 0, Math.min(data.byteLength, 16384));
    let i = 0;
    if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);  // ID3v2
    for (let j = i; j < b.length - 160; j++) {
      const tag = String.fromCharCode(b[j], b[j + 1], b[j + 2], b[j + 3]);
      if (tag !== 'Info' && tag !== 'Xing') continue;
      const flags = b[j + 7];
      let k = j + 8 + (flags & 1 ? 4 : 0) + (flags & 2 ? 4 : 0) + (flags & 4 ? 100 : 0) + (flags & 8 ? 4 : 0);
      k += 21;                                         // encoder string (9), revision, lowpass, replay gain (8), flags, bitrate
      if (k + 2 >= b.length) return 0;
      const pad = ((b[k + 1] & 0x0f) << 8) | b[k + 2];
      return Math.max(0, pad - 529);
    }
  } catch { /* no tag: no padding known */ }
  return 0;
}

/** The ?audio= base, only if it stays on this site (no request leaves the site). */
function sameOriginBase(v) {
  if (!v) return null;
  try {
    const u = new URL(v.endsWith('/') ? v : v + '/', location.href);
    return u.origin === location.origin ? u.pathname : null;
  } catch { return null; }
}
