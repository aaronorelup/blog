// The leaves room (/leaves/): reads #leaves-data and the leaf's #from=x,y (then strips it), sizes the canvas (DPR
// capped at 2, 1.5 on touch), bakes the tray and cup, and runs the brew on a fixed 60 Hz step that pauses when the
// tab is hidden and stops for good at rest. Pointer and keys stir, sip and name leaves. Under reduced motion it
// brews at once and shows the still life. window.__leaves is the e2e hook (phase, state, skip, pointOf).
import { DT, POUR, W_FULL, createBrew, poke, sip, step, stir } from './brew.js';
import { bakeCup, bakeTray, lipOf, ringPath } from './cup.js';
import { FAN } from './leaves.js';
import { makeLiquid } from './liquid.js';
import { paint } from './paint.js';
import { readPalette, watch } from './palette.js';
import { daySeed } from './rng.js';
import { makeSound } from './sound.js';
import { makeSteam, stepSteam } from './steam.js';
import { fadeIn, toRest } from './still.js';
import { bindUi, tallyOf } from './ui.js';
import { bindInput } from './input.js';

export function mount() {
  const root = document.querySelector('main.lv');
  const cv = root.querySelector('.lv-canvas'), ctx = cv.getContext('2d');
  const data = JSON.parse(document.getElementById('leaves-data').textContent);
  const m = /from=([\d.]+),([\d.]+)/.exec(location.hash);
  const from = m ? [Math.min(1, +m[1]), Math.min(1, +m[2])] : null;
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const seed = daySeed();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)').matches;
  const ui = bindUi(root, data);
  const room = { s: createBrew(data, seed, { from }), steam: makeSteam(seed), pal: readPalette(), focus: null,
    running: false, raf: 0, sound: null, soundOn: true, n: touch ? 256 : 320, slow: [], v: null, L: null };

  function layout() {
    const W = root.clientWidth || innerWidth, H = root.clientHeight || innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    const short = Math.min(W, H), long = Math.max(W, H), portrait = H > W * 1.05;
    const D = Math.min(0.8 * short, 0.62 * long, 720, W - 32);
    const Ro = D / 2, Rin = Ro / 1.09;
    let cx = W / 2, cy = H / 2;
    if (portrait) cy = Math.max(Ro + 24, Math.min(H * 0.31, H * 0.62 - Ro - 8));
    else if (W - (W / 2 + Ro + 40) < 266) cx = Math.max(Ro + 16, Math.min(W / 2, W - 16 - 300 - 40 - Ro));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    room.L = { W, H, cx, cy, Ro, R: Rin, dpr };
    room.v = { w: cv.width, h: cv.height, cx: cx * dpr, cy: cy * dpr, R: Rin * dpr, Ro: Ro * dpr, dpr };
    ui.place(room.L);
    bake();
  }

  function bake() {
    const { v, pal, s } = room;
    const wall = s.wall, lip = lipOf(seed);
    const cup = bakeCup(v.R, v.dpr, pal, seed, wall);
    room.bake = { tray: bakeTray(v, pal, seed), cup, inner: ringPath(v.cx, v.cy, v.R, (a) => wall(a) - 0.002), lip, fresh: true };
    buffers(room.n);
  }

  function buffers(n) {
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = n; return c; };
    const trans = mk(), add = mk();
    room.liquid = { L: makeLiquid(n, room.s.wall), trans, add,
      tctx: trans.getContext('2d', { willReadFrequently: true }), actx: add.getContext('2d', { willReadFrequently: true }) };
  }

  const draw = () => paint(ctx, { ...room, bake: room.bake, liquid: room.liquid });

  function events() {
    const { s, sound } = room;
    for (const e of s.events) {
      if (e.type === 'slip') ui.showSlip(tallyOf(s.leaves), s.digits, seed, false);
      if (e.type === 'phase' && e.phase === 'sip') ui.hideHint();
      if (!sound) continue;
      if (e.type === 'tock') sound.tock();
      else if (e.type === 'land' && e.kind !== FAN) sound.tick(e.len);
      else if (e.type === 'sip') sound.sip(e.n);
    }
    s.events.length = 0;
    if (sound) sound.pour(s.W / W_FULL, s.t >= POUR[0] && s.t < POUR[1]);
  }

  let last = 0, acc = 0;
  function frame(now) {
    room.raf = 0;
    if (!room.running) return;
    const t0 = performance.now();
    acc += Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    let n = 0;
    while (acc >= DT && n++ < 4) { step(room.s, DT); stepSteam(room.steam, room.s, DT); acc -= DT; }
    events();
    if (room.input.dragging && room.sound) room.sound.stir(room.s.gamma);
    draw();
    watchdog(performance.now() - t0);
    if (room.s.done) { stop(); return; }
    room.raf = requestAnimationFrame(frame);
  }

  // A phone that can't keep up drops the tea's buffer to 192.
  function watchdog(ms) {
    room.slow.push(ms);
    if (room.slow.length < 30) return;
    const avg = room.slow.reduce((a, b) => a + b, 0) / room.slow.length;
    room.slow.length = 0;
    if (avg > 20 && room.n > 192) { room.n = 192; buffers(192); }
  }

  function start() {
    if (room.running || room.s.done) return;
    room.running = true; last = performance.now(); acc = 0;
    room.raf = requestAnimationFrame(frame);
  }
  function stop() {
    room.running = false;
    if (room.raf) cancelAnimationFrame(room.raf);
    room.raf = 0;
    if (room.sound) room.sound.stir(0);
  }

  // To rest at once, with the same seed: the reduced-motion still and __leaves.skip().
  function skip(quick = false) {
    stop();
    const tally = toRest(room, { data, seed, from, quick });
    ui.hideHint();
    ui.showSlip(tally, room.s.digits, seed, true);
    draw();
    return tally;
  }

  room.input = bindInput(root, cv, room, {
    stir: (turn, r, x, y) => { stir(room.s, turn, r, x, y); ui.hideHint(); },
    sip: () => { sip(room.s); }, poke: (x, y) => poke(room.s, x, y),
    label: (p, x, y) => { room.focus = p; ui.showLabel(p, x, y); if (!room.running) draw(); },
    gesture: () => { if (room.sound) room.sound.resume(); },
    leave,
  });

  function leave() {
    const ref = document.referrer && new URL(document.referrer, location.href);
    if (history.length > 1 && ref && ref.origin === location.origin && ref.pathname === '/') history.back();
    else location.assign('/');
  }
  ui.leave.addEventListener('click', leave);
  ui.sound.addEventListener('click', () => {
    room.soundOn = !room.soundOn;
    ui.setSound(room.soundOn);
    if (room.sound) { room.sound.resume(); room.sound.setOn(room.soundOn); }
  });

  layout();
  room.sound = makeSound(room.L.Ro);
  addEventListener('pagehide', () => { if (room.sound) room.sound.close(); room.sound = null; });
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    room.sound = makeSound(room.L.Ro);
    if (room.sound) room.sound.setOn(room.soundOn);
  });
  let resizeT = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { layout(); if (!room.running) draw(); }, 120);
  });
  watch((pal) => { room.pal = pal; bake(); if (!room.running) draw(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (room.running) { stop(); room.paused = true; } }
    else if (room.paused) { room.paused = false; start(); }
  });
  reduce.addEventListener?.('change', (e) => { if (e.matches && !room.s.done) skip(); });

  if (reduce.matches) {
    skip(true);
    fadeIn(cv);
  } else {
    draw();
    start();
    setTimeout(() => { if (!room.s.done && !room.input.used) ui.showHint(); }, 2600);
  }

  const css = (p) => ({ x: room.L.cx + p.x * room.L.R, y: room.L.cy + p.y * room.L.R });
  window.__leaves = {
    phase: () => room.s.phase,
    state: () => ({ phase: room.s.phase, t: room.s.t, running: room.running, next: room.s.next,
      leaves: room.s.leaves.filter((p) => p.kind !== FAN).length, buffer: room.n }),
    skip: () => { skip(false); },
    pointOf: (id) => { const p = room.s.leaves.find((q) => q.id === id); return p ? css(p) : null; },
  };
}
