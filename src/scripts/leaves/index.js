// The leaves room (/leaves/): reads #leaves-data and the word-leaf's #from=x,y,angle,size (then strips it), sizes
// the canvas (DPR capped at 2, 1.5 on touch), paints the ground and the word-leaf where the homepage left it at once,
// bakes the tray and the cup in the next frame, then runs the brew on a fixed 60 Hz step held to the wall clock (a
// slow frame takes as many steps as it needs; a slow device shades less, it never brews slower). It pauses while
// the tab is hidden and stops for good at rest. Pointer and keys stir, sip and name leaves. Under reduced motion
// it brews at once and shows the still life. window.__leaves is the e2e hook (phase, state, skip, pointOf).
import { DT, POUR, W_FULL, createBrew, poke, sip, step, stir } from './brew.js';
import { bakeCup, bakeTray, lipOf, ringPath } from './cup.js';
import { FAN, WORD } from './leaves.js';
import { makeLiquid } from './liquid.js';
import { paint, paintEarly } from './paint.js';
import { readPalette, watch } from './palette.js';
import { daySeed } from './rng.js';
import { makeSound } from './sound.js';
import { makeSteam, stepSteam } from './steam.js';
import { fadeIn, toRest } from './still.js';
import { bindUi, tallyOf } from './ui.js';
import { bindInput } from './input.js';

const MAX_STEPS = 30;                 // a frame catches up to half a second of brew; a longer stall is let go
const TIERS = [320, 256, 192, 160];   // the tea's buffer, stepped down when frames run long
const SLIP_H = 150;                   // room kept under a portrait cup for the slip, in CSS px

function parseFrom(hash) {
  const m = /from=([\d.]+),([\d.]+)(?:,(-?[\d.]+),([\d.]+))?/.exec(hash);
  if (!m) return null;
  return { x: Math.min(1, +m[1]), y: Math.min(1, +m[2]), a: (+(m[3] || 17) * Math.PI) / 180, size: +(m[4] || 0) };
}

export function mount() {
  const root = document.querySelector('main.lv');
  const cv = root.querySelector('.lv-canvas'), ctx = cv.getContext('2d');
  const data = JSON.parse(document.getElementById('leaves-data').textContent);
  const from = parseFrom(location.hash);
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const seed = daySeed();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)').matches;
  const ui = bindUi(root, data);
  const room = { s: createBrew(data, seed), steam: makeSteam(seed), pal: readPalette(), focus: null, from, ready: false,
    running: false, raf: 0, sound: null, soundOn: true, tier: touch ? 1 : 0, thin: false, slow: [], v: null, L: null,
    reduce: reduce.matches, labelAt: null };

  function layout() {
    const W = root.clientWidth || innerWidth, H = root.clientHeight || innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    const portrait = H > W * 1.05;
    let Ro, cx = W / 2, cy = H / 2, beside = false, slipW = 0;
    if (portrait) {
      // the cup nearly fills the width; below it, room for the slip and the pills
      Ro = Math.min(W - 32, 0.62 * H, 720) / 2;
      cy = 16 + Math.max(0, (H - 2 * Ro - SLIP_H - 76 - 16) / 2) + Ro;
    } else {
      Ro = Math.min(0.8 * H, 0.62 * W, 720, W - 32) / 2;
      // the cup and the slip, one still life: centred together, the slip 40 px off the rim
      slipW = Math.min(330, W - 32 - 2 * Ro - 40);
      if (slipW >= 250) { beside = true; cx = (W - (2 * Ro + 40 + slipW)) / 2 + Ro; }
    }
    const Rin = Ro / 1.09;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    room.L = { W, H, cx, cy, Ro, R: Rin, dpr, portrait, beside, slipW };
    room.v = { w: cv.width, h: cv.height, cx: cx * dpr, cy: cy * dpr, R: Rin * dpr, Ro: Ro * dpr, dpr };
    ui.place(room.L);
    if (room.ready) bake();
  }

  function bake() {
    const { v, pal, s } = room;
    const wall = s.wall, lip = lipOf(seed);
    const cup = bakeCup(v.R, v.dpr, pal, seed, wall);
    room.bake = { tray: bakeTray(v, pal, seed), cup, inner: ringPath(v.cx, v.cy, v.R, (a) => wall(a) - 0.002), lip, fresh: true };
    buffers(TIERS[room.tier]);
  }

  function buffers(n) {
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = n; return c; };
    const trans = mk(), add = mk(), L = makeLiquid(n, room.s.wall);
    // the image data wraps the shaded arrays (no copy), so each frame only puts them
    room.liquid = { L, trans, add, shaded: false, timg: new ImageData(L.trans, n, n), aimg: new ImageData(L.add, n, n),
      tctx: trans.getContext('2d', { willReadFrequently: true }), actx: add.getContext('2d', { willReadFrequently: true }) };
  }

  // Everything the frame needs, baked once; the frame before it is the ground and the leaf alone.
  function ready() {
    if (room.ready) return;
    room.ready = true;
    bake();
  }
  const draw = () => (room.ready ? paint(ctx, room) : paintEarly(ctx, room));

  function events() {
    const { s, sound } = room;
    for (const e of s.events) {
      if (e.type === 'slip') ui.showSlip(tallyOf(s.leaves), s.digits, seed, false);
      if (e.type === 'phase' && e.phase === 'sip') ui.hideHint();
      if (!sound) continue;
      if (e.type === 'tock') sound.tock();
      else if (e.type === 'land' && e.kind === WORD) sound.plip();
      else if (e.type === 'land' && e.kind !== FAN) sound.tick(e.len, e.newest);
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
    acc += Math.min(0.5, Math.max(0, (now - last) / 1000));
    last = now;
    // the brew keeps to the wall clock: as many steps as the time since the last frame holds
    let n = 0;
    while (acc >= DT && n < MAX_STEPS) { step(room.s, DT); stepSteam(room.steam, room.s, DT); acc -= DT; n++; }
    if (n === MAX_STEPS) acc = Math.min(acc, DT);
    events();
    if (room.input.dragging && room.sound) room.sound.stir(room.s.gamma);
    draw();
    watchdog(performance.now() - t0);
    if (room.s.done) { stop(); finish(); return; }
    room.raf = requestAnimationFrame(frame);
  }

  // The last frame stays on screen, so it is painted once more at the tea's full buffer, however slow the device.
  function finish() {
    const base = touch ? 1 : 0;
    if (room.tier === base && !room.thin) return;
    room.tier = base; room.thin = false;
    buffers(TIERS[base]);
    draw();
  }

  // A device that can't keep up gets a smaller tea buffer, a tier at a time, and at the last tier the tea is
  // shaded every other frame. The brew's own pace never changes.
  function watchdog(ms) {
    room.slow.push(ms);
    if (room.slow.length < 24) return;
    const avg = room.slow.reduce((a, b) => a + b, 0) / room.slow.length;
    room.slow.length = 0;
    if (avg <= 22) return;
    if (room.tier < TIERS.length - 1) { room.tier++; buffers(TIERS[room.tier]); } else room.thin = true;
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
    ready();
    const tally = toRest(room, { data, seed, quick });
    ui.hideHint();
    ui.showSlip(tally, room.s.digits, seed, true);
    draw();
    return tally;
  }

  const name = (p, x, y) => { room.focus = p; room.labelAt = ui.showLabel(p, x, y); if (!room.running) draw(); };
  room.input = bindInput(root, cv, room, {
    stir: (turn, r, x, y) => { stir(room.s, turn, r, x, y); ui.hideHint(); },
    sip: () => { sip(room.s); }, poke: (x, y) => poke(room.s, x, y),
    label: name,
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
  watch((pal) => { room.pal = pal; if (room.ready) bake(); if (!room.running) draw(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (room.running) { stop(); room.paused = true; } }
    else if (room.paused) { room.paused = false; start(); }
  });
  reduce.addEventListener?.('change', (e) => { if (e.matches && !room.s.done) skip(); });

  // the page's own copy of the leaf, hanging where the homepage let go of it (the inline script), sways on the
  // compositor while the bakes hold the main thread; the canvas takes it over from its pose of the moment
  const word = document.querySelector('.lv-word'), hanging = !!word && !word.hasAttribute('hidden');
  const takeOver = () => {
    if (!hanging || word.hasAttribute('hidden')) return;
    const cs = getComputedStyle(word), [tx = 0, ty = 0] = (cs.translate || '').split(' ').map(parseFloat);
    if (room.from) {
      room.from.x += (tx || 0) / room.L.W; room.from.y += (ty || 0) / room.L.H;
      room.from.a += ((parseFloat(cs.rotate) || 0) * Math.PI) / 180;
    }
    word.setAttribute('hidden', '');
  };
  if (reduce.matches) {
    room.sound = makeSound(room.L.Ro);
    skip(true);
    word?.setAttribute('hidden', '');
    fadeIn(cv);
  } else {
    // the ground now (and the leaf, if the page has no copy of it); the bakes once this frame is on screen, and
    // the brew's clock starts when they are done
    paintEarly(ctx, room, !hanging);
    requestAnimationFrame(() => setTimeout(() => {
      ready();
      takeOver();
      if (!room.s.done) { draw(); start(); }
      // the sound is made after the first frame of the brew: it waits on a gesture to play anyway
      setTimeout(() => { if (!room.sound) { room.sound = makeSound(room.L.Ro); room.sound?.setOn(room.soundOn); } }, 60);
      setTimeout(() => { if (!room.s.done && !room.input.used) ui.showHint(); }, 2600);
    }, 0));
  }

  const css = (p) => ({ x: room.L.cx + p.x * room.L.R, y: room.L.cy + p.y * room.L.R });
  window.__leaves = {
    phase: () => room.s.phase,
    state: () => ({ phase: room.s.phase, t: room.s.t, running: room.running, next: room.s.next, ready: room.ready,
      leaves: room.s.leaves.filter((p) => p.kind !== FAN).length, buffer: TIERS[room.tier], thin: room.thin }),
    skip: () => { takeOver(); skip(false); },
    pointOf: (id) => { const p = room.s.leaves.find((q) => q.id === id); return p ? css(p) : null; },
  };
}
