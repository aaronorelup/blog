// THE QUIET HOUR, the programme on the TV (programme-art): cut paper and gouache under one warm bench lamp.
//
//   const programme = createProgramme({ engine });
//   programme.draw(ctx, S, view)        // ctx: the 1280x960 programme canvas's 2D context
//                                       // S: engine.signals(frame) (typedef at the top of ../signals.js)
//                                       // view: a rectangle in bench units from ../layout.js VIEWS
//   programme.drawXray(ctx, S, view)    // the lab page's x-ray: a plain label beside each gauge. Never in the film.
//
// How it is drawn. Everything that never moves (baize, lamp pool, wood, the paper with its ruled rows, the dial's face
// and engraving, the box, the rails and plates) is painted once per view into an offscreen canvas when the programme
// is created (fixed seeds, so the same pixels every time), and each frame starts by copying it. Then only what S
// moves is drawn on top, in bench units through the view's transform: the strip's history (bar lines, sprocket holes,
// the pencil haze, the holes), the punch, the stylus, the hatching, the chalk, the needle, the knob, the flags, the
// counters, the box's cylinder and lid, the crank, the title card, the hands (./hands.js, hands-builder's). Last, in
// programme pixels, the picture's condition (warmth, hairline, tears, blocks) and the clock bug.
//
// Rules kept: every value drawn is read from S; nothing reads the frame number to make something happen, nor the
// ending; no clocks, no Math.random (texture is hash01 with fixed seeds); nothing is carried from one frame to the
// next (scratch canvases are overwritten before they are read; the per-view caches are pure functions of the view).

import * as LAYOUT from '../layout.js';
import {
  PROGRAMME_W as PW, PROGRAMME_H as PH, VIEWS, WOOD_EDGE, LAMP, LIGHT_DIR, STRIP, rowY, rowYf, PUNCH, PUNCH_BRIDGE,
  LIGHTBOX, HOLE_R, STYLUS, ROLL, DIAL, CHALK_TEXT, DIAL_CHALK, KNOB, FLAGS, SHARE_DRUM, LESSONS, BOX, CRANK, TITLE_CARD,
} from '../layout.js';
import { hash01, hashSigned, noise1 } from '../rng.js';
import { createHands } from './hands.js';

const FONT_SERIF = '"QH Serif"', FONT_MONO = '"QH Mono"', FONT_HAND = '"QH Hand"';
const D_MAJOR = [1, 2, 4, 6, 7, 9, 11];                    // pitch classes; row 0 is A3 (MIDI 57)
const inKeyRow = (r) => r < 30 && D_MAJOR.includes((57 + r) % 12);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const angleAtU = (u) => DIAL.a0 + clamp(u, 0, 1) * (DIAL.a1 - DIAL.a0);   // dial position 0..1 -> canvas angle
const TAU = Math.PI * 2;

// the palette: small and warm. No red anywhere.
const C = {
  baize: '#173023', baizeDeep: '#0b1a12',
  walnut: '#4a2d1b', walnutDark: '#2a180e', walnutLight: '#74502f',
  brass: '#b38e4b', brassLight: '#e6c886', brassDark: '#6d5226',
  iron: '#2b2d2a', ironLight: '#55574f',
  cream: '#eee2c3', creamShade: '#d9c9a2', ink: '#4f4232',
  graphite: [46, 46, 52],
  amber: '#ffb33e', amberCore: '#ffe3a1',
  chalk: '#f5f2e9', velvet: '#13261b', steel: '#9ea3a0',
  hole: '#0f1d15',
};
// fixed seeds for the static texture and the cut edges (AUTHORED)
const SEED = { felt: 7101, mottle: 7102, paper: 7103, pencil: 7104, chalk: 7105, wood: 7106, cut: 7200, pins: 7107 };

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---- hand-cut shapes: straight edges with a little seeded wobble, as if cut with scissors ----------------------
function cutRect(x, y, w, h, seed, amp = 1.1, step = 22) {
  const p = new Path2D(); let first = true;
  const edge = (x0, y0, x1, y1, e) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / step));
    const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    for (let i = 0; i < n; i++) {
      const t = i / n, d = hashSigned(seed, e, i) * amp * (i === 0 ? 0.4 : 1);
      const px = x0 + (x1 - x0) * t + nx * d, py = y0 + (y1 - y0) * t + ny * d;
      if (first) { p.moveTo(px, py); first = false; } else p.lineTo(px, py);
    }
  };
  edge(x, y, x + w, y, 0); edge(x + w, y, x + w, y + h, 1); edge(x + w, y + h, x, y + h, 2); edge(x, y + h, x, y, 3);
  p.closePath();
  return p;
}
function cutCircle(cx, cy, r, seed, amp = 0.9) {
  const p = new Path2D(), n = clamp(Math.round(r / 3), 20, 180);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, rr = r + amp * (0.6 * noise1(seed, 0, i, 7) + 0.4 * hashSigned(seed, 1, i));
    if (i === 0) p.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  p.closePath();
  return p;
}

// ---- textures, built once from fixed seeds (tiles at 2 px per bench unit) --------------------------------------
function noiseTile(size, fn) {
  const c = canvas(size, size), x = c.getContext('2d'), im = x.createImageData(size, size), d = im.data;
  for (let y = 0; y < size; y++) for (let i = 0; i < size; i++) {
    const [r, g, b, a] = fn(i, y), o = (y * size + i) * 4;
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a;
  }
  x.putImageData(im, 0, 0);
  return c;
}
function buildTextures() {
  const felt = noiseTile(256, (i, y) => {           // baize: fine fibre speckle, light and dark
    const n = (hash01(SEED.felt, i, y) - 0.5) * 0.75 + (hash01(SEED.felt + 1, i >> 1, y >> 2) - 0.5) * 0.5
      + (hash01(SEED.felt + 2, (i + y) >> 2, (i - y) & 255) - 0.5) * 0.25;
    return n > 0 ? [226, 214, 170, Math.round(n * 70)] : [0, 6, 2, Math.round(-n * 120)];
  });
  const paper = noiseTile(256, (i, y) => {          // cream paper: horizontal fibres (so the scroll never swims)
    const n = (hash01(SEED.paper, i >> 4, y) - 0.5) * 0.6 + (hash01(SEED.paper + 1, i, y) - 0.5) * 0.4;
    return n > 0 ? [255, 250, 235, Math.round(n * 60)] : [90, 70, 40, Math.round(-n * 60)];
  });
  const pencil = noiseTile(128, (i, y) => {         // graphite: diagonal strokes and tooth (alpha only matters)
    const diag = 0.5 + 0.5 * Math.sin((i * 0.9 + y * 0.55) * 1.25 + 2.5 * hashSigned(SEED.pencil, (i + y) >> 3));
    const a = clamp(0.78 + 0.2 * diag + 0.35 * (hash01(SEED.pencil + 1, i, y) - 0.5), 0.45, 1);
    return [...C.graphite, Math.round(a * 255)];
  });
  const chalk = noiseTile(128, (i, y) => {          // chalk: white with dry gaps
    const h = hash01(SEED.chalk, i, y), h2 = hash01(SEED.chalk + 1, i >> 2, y >> 1);
    const a = h2 < 0.1 ? 0.45 : h < 0.16 ? 0.5 : 0.82 + 0.18 * h;
    return [245, 242, 233, Math.round(a * 255)];
  });
  const mottle = canvas(40, 30); {                   // gouache: big soft blotches over the whole bench
    const x = mottle.getContext('2d'), im = x.createImageData(40, 30), d = im.data;
    for (let y = 0; y < 30; y++) for (let i = 0; i < 40; i++) {
      const n = hashSigned(SEED.mottle, i, y) * 0.7 + hashSigned(SEED.mottle + 1, i >> 1, y >> 1) * 0.3, o = (y * 40 + i) * 4;
      if (n > 0) { d[o] = 214; d[o + 1] = 196; d[o + 2] = 140; d[o + 3] = Math.round(n * 18); }
      else { d[o] = 0; d[o + 1] = 8; d[o + 2] = 4; d[o + 3] = Math.round(-n * 30); }
    }
    x.putImageData(im, 0, 0);
  }
  return { felt, paper, pencil, chalk, mottle };
}
function pattern(ctx, tile, scale = 0.5) {
  const p = ctx.createPattern(tile, 'repeat');
  p.setTransform(new DOMMatrix([scale, 0, 0, scale, 0, 0]));
  return p;
}

// ---- soft layered paper shadows (offsets and blur are in device pixels, so they take the view's scale) -----------
function shadow(x, k, depth, alpha = 0.42) {
  x.shadowColor = `rgba(4,10,6,${alpha})`;
  x.shadowBlur = depth * 1.6 * k;
  x.shadowOffsetX = depth * LIGHT_DIR.dx * k;
  x.shadowOffsetY = depth * LIGHT_DIR.dy * k;
}
function noShadow(x) { x.shadowColor = 'rgba(0,0,0,0)'; x.shadowBlur = 0; x.shadowOffsetX = 0; x.shadowOffsetY = 0; }
/** Fill a path as a piece of paper lying `depth` units above what is under it: a wide soft shadow, then a tight one. */
function paperFill(x, k, path, fill, depth) {
  x.fillStyle = fill;
  shadow(x, k, depth * 2.2, 0.3); x.fill(path);
  shadow(x, k, depth * 0.6, 0.45); x.fill(path);
  noShadow(x);
}

function woodGrain(x, rx, ry, w, h, seed, vertical = false) {
  const along = vertical ? h : w, across = vertical ? w : h, n = Math.max(3, Math.round(across / 3.2));
  x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const base = (i + 0.5) * across / n, dark = hash01(seed, i, 1) < 0.62;
    x.strokeStyle = dark ? `rgba(30,16,8,${(0.22 + 0.3 * hash01(seed, i, 2)).toFixed(3)})` : `rgba(150,105,62,${(0.12 + 0.2 * hash01(seed, i, 3)).toFixed(3)})`;
    x.lineWidth = 0.6 + 1.4 * hash01(seed, i, 4);
    x.beginPath();
    for (let s = 0; s <= along; s += 10) {
      const off = base + noise1(seed, i % 5, s, 160) * 3.5 + noise1(seed + 9, 0, s + i * 7, 420) * 5;
      const px = vertical ? rx + off : rx + s, py = vertical ? ry + s : ry + off;
      if (s === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
  }
}

/** Engraved text: a light lip under a dark cut. */
function engrave(x, text, tx, ty, font, dark = 'rgba(40,28,12,0.85)', light = 'rgba(255,240,200,0.45)', lip = 0.7) {
  x.font = font;
  x.fillStyle = light; x.fillText(text, tx + lip, ty + lip);
  x.fillStyle = dark; x.fillText(text, tx, ty);
}

export function createProgramme({ engine }) {
  const T = buildTextures();
  const hands = createHands({ layout: LAYOUT });

  // fixed shapes (bench units)
  const P = {
    paper: cutRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, SEED.cut + 1, 1.0, 26),
    dialBezel: cutCircle(DIAL.x, DIAL.y, DIAL.r * 1.09, SEED.cut + 2, 0.8),
    dialFace: cutCircle(DIAL.x, DIAL.y, DIAL.r * 0.985, SEED.cut + 3, 0.6),
    plinth: cutRect(FLAGS.x - 14, FLAGS.y - 22, FLAGS.w + 28, LESSONS.y + LESSONS.h + 36 - (FLAGS.y - 22), SEED.cut + 4, 1.0),
    box: cutRect(BOX.x, BOX.y, BOX.w, BOX.h, SEED.cut + 5, 0.9),
    card: cutRect(0, 0, TITLE_CARD.w, TITLE_CARD.h, SEED.cut + 6, 1.4, 30),
    lid: cutRect(0, 0, BOX.w, BOX.h, SEED.cut + 7, 0.9),
    roll: cutRect(ROLL.x, ROLL.y + 10, ROLL.w, ROLL.h - 20, SEED.cut + 8, 0.6),
  };
  const knobPath = (() => {                          // the ratchet wheel, centred on 0,0
    const p = new Path2D(), n = KNOB.clicksPerTurn;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, b = ((i + 0.55) / n) * TAU, c = ((i + 0.7) / n) * TAU;
      const r0 = KNOB.r * 0.86, r1 = KNOB.r;
      if (i === 0) p.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); else p.lineTo(Math.cos(a) * r0, Math.sin(a) * r0);
      p.lineTo(Math.cos(b) * r1, Math.sin(b) * r1); p.lineTo(Math.cos(c) * r0, Math.sin(c) * r0);
    }
    p.closePath();
    return p;
  })();
  const flagPath = (() => { const p = new Path2D(); p.moveTo(0, -1.8); p.lineTo(56, -1.8); p.lineTo(56, 1.8); p.lineTo(0, 1.8); p.closePath(); return p; })();
  const pennant = cutRect(34, 2, 23, 19, SEED.cut + 9, 0.6, 6);
  const cardCanvas = buildTitleCard();
  const pinTable = Array.from({ length: 46 }, (_, i) => ({                // the music box cylinder's pins
    y: BOX.y + 70 + hash01(SEED.pins, i, 0) * (BOX.h - 140), a: hash01(SEED.pins, i, 1) * TAU,
  }));

  // per-view static layer (pure function of the view rectangle; rebuilt identically if evicted)
  const cache = new Map();
  function staticFor(view) {
    const key = `${view.x},${view.y},${view.w},${view.h}`;
    let c = cache.get(key);
    if (!c) {
      if (cache.size > 6) cache.delete(cache.keys().next().value);
      c = canvas(PW, PH);
      const x = c.getContext('2d', { alpha: false }), k = PW / view.w;
      x.setTransform(k, 0, 0, k, -view.x * k, -view.y * k);
      paintStatic(x, k, view);
      cache.set(key, c);
    }
    return c;
  }
  for (const v of Object.values(VIEWS)) staticFor(v);

  // scratch (overwritten before every read)
  const hazeCells = canvas(64 * 3, 30 * 2), hazeCtx = hazeCells.getContext('2d');
  const hrCells = canvas(64 * 3, 2 * 2), hrCtx = hrCells.getContext('2d');
  const hazeImg = hazeCtx.createImageData(64 * 3, 60), hrImg = hrCtx.createImageData(64 * 3, 4);
  const layer = canvas(PW, PH), lctx = layer.getContext('2d');
  const scratch = canvas(PW, 64), sctx = scratch.getContext('2d');
  const mosaic = canvas(PW / 8, PH / 8), mctx = mosaic.getContext('2d');
  const pats = new WeakMap();
  const pat = (ctx, name) => {                       // patterns belong to a context
    let m = pats.get(ctx); if (!m) { m = {}; pats.set(ctx, m); }
    return (m[name] ||= pattern(ctx, T[name]));
  };

  // =================================================================================================================
  function draw(ctx, S, view, opts = {}) {
    const k = PW / view.w;
    const vis = (x0, y0, x1, y1) => x1 > view.x && x0 < view.x + view.w && y1 > view.y && y0 < view.y + view.h;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = true;
    noShadow(ctx);
    ctx.drawImage(staticFor(view), 0, 0);
    ctx.setTransform(k, 0, 0, k, -view.x * k, -view.y * k);   // bench units from here on

    if (vis(STRIP.x, STRIP.y, STRIP.x + STRIP.w, STRIP.y + STRIP.h)) drawStrip(ctx, S, view, k);
    if (vis(PUNCH.x - 60, 40, STYLUS.rulerX + 20, 610)) { drawPunch(ctx, S, k); drawStylus(ctx, S, k); }
    if (vis(DIAL.x - DIAL.r * 1.3, DIAL.y - DIAL.r * 1.5, DIAL.x + DIAL.r * 1.6, DIAL.y + DIAL.r * 1.2)) drawDial(ctx, S, k);
    if (vis(KNOB.x - 60, KNOB.y - 60, KNOB.x + 60, KNOB.y + 60)) drawKnob(ctx, S, k);
    if (vis(FLAGS.x - 60, FLAGS.y - 30, FLAGS.x + FLAGS.w + 20, LESSONS.y + 80)) { drawFlags(ctx, S, k); drawCounters(ctx, S); }
    if (vis(BOX.x - 20, BOX.y - 20, BOX.x + BOX.w + 20, CRANK.y + CRANK.r + 30)) { drawBox(ctx, S, k); drawCrank(ctx, S, k); }
    if (S.titleVisible) drawTitleCard(ctx, S, k);
    hands.drawUnder(ctx, S, view);                  // the hands hover above everything: their shadows fall on it all
    hands.drawOver(ctx, S, view);

    ctx.setTransform(1, 0, 0, 1, 0, 0);              // programme pixels from here on
    noShadow(ctx);
    applyWarmth(ctx, S);
    applyHairline(ctx, S, view, k);
    applyTears(ctx, S);
    applyBlocks(ctx, S);
    drawClockBug(ctx, S);                            // last: exact on every frame
    if (opts && opts.xray === true) drawXray(ctx, S, view);   // the lab page's x-ray only; the film never asks
    ctx.restore();
  }

  // =================================================================================================================
  // STATIC: painted once per view
  function paintStatic(x, k, view) {
    // baize, lit by the lamp from the upper left; the far corners fall into the dark
    x.fillStyle = C.baize; x.fillRect(view.x - 10, view.y - 10, view.w + 20, view.h + 20);
    let g = x.createRadialGradient(LAMP.x, LAMP.y, 0, LAMP.x, LAMP.y, LAMP.r);
    g.addColorStop(0, 'rgba(206,190,122,0.42)'); g.addColorStop(0.45, 'rgba(150,150,92,0.16)'); g.addColorStop(1, 'rgba(150,150,92,0)');
    x.fillStyle = g; x.fillRect(view.x - 10, view.y - 10, view.w + 20, view.h + 20);
    g = x.createRadialGradient(LAMP.x, LAMP.y, LAMP.r * 0.35, LAMP.x, LAMP.y, LAMP.r * 1.25);
    g.addColorStop(0, 'rgba(4,12,7,0)'); g.addColorStop(1, 'rgba(4,12,7,0.78)');
    x.fillStyle = g; x.fillRect(view.x - 10, view.y - 10, view.w + 20, view.h + 20);
    x.fillStyle = pattern(x, T.felt); x.fillRect(view.x - 10, view.y - 10, view.w + 20, view.h + 20);
    x.imageSmoothingEnabled = true; x.drawImage(T.mottle, -40, -40, 1680, 1280);

    // the bench's front edge: walnut, its top bevel catching the lamp
    x.save();
    x.fillStyle = C.walnut; x.fillRect(WOOD_EDGE.x - 80, WOOD_EDGE.y, WOOD_EDGE.w + 160, WOOD_EDGE.h + 80);
    x.beginPath(); x.rect(WOOD_EDGE.x - 80, WOOD_EDGE.y, WOOD_EDGE.w + 160, WOOD_EDGE.h + 80); x.clip();
    woodGrain(x, WOOD_EDGE.x - 80, WOOD_EDGE.y, WOOD_EDGE.w + 160, WOOD_EDGE.h + 80, SEED.wood);
    g = x.createLinearGradient(0, WOOD_EDGE.y, 0, WOOD_EDGE.y + WOOD_EDGE.h);
    g.addColorStop(0, 'rgba(255,214,150,0.30)'); g.addColorStop(0.08, 'rgba(255,214,150,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = g; x.fillRect(WOOD_EDGE.x - 20, WOOD_EDGE.y, WOOD_EDGE.w + 40, WOOD_EDGE.h + 20);
    g = x.createLinearGradient(0, 0, 1600, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = g; x.fillRect(WOOD_EDGE.x - 20, WOOD_EDGE.y, WOOD_EDGE.w + 40, WOOD_EDGE.h + 20);
    x.restore();
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(WOOD_EDGE.x - 20, WOOD_EDGE.y - 3, WOOD_EDGE.w + 40, 3);

    paintProps(x, k);

    // the lightbox's housing, peeking out above and below the paper, its window glowing amber
    const lb = { x: LIGHTBOX.x - 14, y: STRIP.y - 26, w: LIGHTBOX.w + 28, h: STRIP.h + 52 };
    paperFill(x, k, cutRect(lb.x, lb.y, lb.w, lb.h, SEED.cut + 20, 0.6), C.walnutDark, 3);
    x.fillStyle = C.brassDark; x.fillRect(lb.x + 4, lb.y + 4, lb.w - 8, lb.h - 8);
    g = x.createLinearGradient(LIGHTBOX.x, 0, LIGHTBOX.x + LIGHTBOX.w, 0);
    g.addColorStop(0, '#c9842c'); g.addColorStop(0.5, C.amberCore); g.addColorStop(1, '#c9842c');
    x.fillStyle = g; x.fillRect(LIGHTBOX.x, lb.y + 8, LIGHTBOX.w, lb.h - 16);

    // the paper strip
    paperFill(x, k, P.paper, C.cream, 3);
    x.save(); x.clip(P.paper);
    g = x.createLinearGradient(STRIP.x, 0, STRIP.x + STRIP.w, 0);       // the lamp falls off to the right
    g.addColorStop(0, 'rgba(60,40,10,0.10)'); g.addColorStop(0.4, 'rgba(60,40,10,0)'); g.addColorStop(1, 'rgba(40,30,10,0.22)');
    x.fillStyle = g; x.fillRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h);
    x.fillStyle = pattern(x, T.paper); x.fillRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h);
    // backlit by the lightbox: a warm glowing band through the paper
    g = x.createLinearGradient(LIGHTBOX.x - 34, 0, LIGHTBOX.x + LIGHTBOX.w + 34, 0);
    g.addColorStop(0, 'rgba(255,200,110,0)'); g.addColorStop(0.32, 'rgba(255,205,120,0.55)'); g.addColorStop(0.5, 'rgba(255,226,160,0.85)');
    g.addColorStop(0.68, 'rgba(255,205,120,0.55)'); g.addColorStop(1, 'rgba(255,200,110,0)');
    x.fillStyle = g; x.fillRect(LIGHTBOX.x - 34, STRIP.y, LIGHTBOX.w + 68, STRIP.h);
    // the 32 ruled rows: D-major rows printed darker, like staff lines
    for (let r = 0; r < 32; r++) {
      const y = rowY(r), key = inKeyRow(r);
      x.fillStyle = key ? 'rgba(70,52,34,0.62)' : r >= 30 ? 'rgba(70,52,34,0.4)' : 'rgba(70,52,34,0.2)';
      const lw = key ? 1.25 : 0.8;
      x.fillRect(STRIP.x, y - lw / 2, STRIP.w, lw);
    }
    // HOLD and REST are set apart: a double rule across the gap
    const gy = STRIP.rowsTop + 30 * STRIP.rowH;
    x.fillStyle = 'rgba(70,52,34,0.55)';
    x.fillRect(STRIP.x, gy + 3.5, STRIP.w, 1.4); x.fillRect(STRIP.x, gy + STRIP.gap - 4.5, STRIP.w, 1.4);
    // margin rules
    x.fillStyle = 'rgba(70,52,34,0.35)';
    x.fillRect(STRIP.x, STRIP.rowsTop - 4, STRIP.w, 1); x.fillRect(STRIP.x, rowY(31) + STRIP.rowH / 2 + 3, STRIP.w, 1);
    x.restore();

    // the roll the blank paper comes off
    paperFill(x, k, P.roll, C.cream, 5);
    g = x.createLinearGradient(ROLL.x, 0, ROLL.x + ROLL.w, 0);
    g.addColorStop(0, 'rgba(80,60,30,0.28)'); g.addColorStop(0.3, 'rgba(255,250,230,0.25)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,28,10,0.5)');
    x.fillStyle = g; x.fill(P.roll);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(90,70,40,0.25)'; x.fillRect(ROLL.x + 6 + i * 4.6, ROLL.y + 12, 0.7, ROLL.h - 24); }
    for (const cy of [ROLL.y + 6, ROLL.y + ROLL.h - 6]) {
      x.fillStyle = C.brass; shadow(x, k, 3); x.beginPath(); x.ellipse(ROLL.x + ROLL.w / 2, cy, ROLL.w / 2 + 6, 10, 0, 0, TAU); x.fill(); noShadow(x);
      x.fillStyle = C.brassLight; x.beginPath(); x.ellipse(ROLL.x + ROLL.w / 2 - 4, cy - 2, ROLL.w / 2 - 6, 5, 0, 0, TAU); x.fill();
      x.fillStyle = C.brassDark; x.beginPath(); x.arc(ROLL.x + ROLL.w / 2, cy, 4, 0, TAU); x.fill();
    }

    // the stylus rail and its ruler: one graduation per row
    const rl = { x: STYLUS.railX - 8, y: STYLUS.y0, w: 16, h: STYLUS.y1 - STYLUS.y0 };
    for (const rx of [rl.x + 2, rl.x + rl.w - 4]) {
      x.fillStyle = C.brassDark; shadow(x, k, 3); x.fillRect(rx, rl.y, 3, rl.h); noShadow(x);
      x.fillStyle = 'rgba(255,230,170,0.6)'; x.fillRect(rx, rl.y, 1, rl.h);
    }
    paperFill(x, k, cutRect(STYLUS.rulerX - 6, STRIP.rowsTop - 10, 22, rowY(31) - STRIP.rowsTop + 26, SEED.cut + 21, 0.5, 12), '#e9dcc0', 2);
    for (let r = 0; r < 32; r++) {
      const y = rowY(r);
      x.fillStyle = C.ink;
      if (r === 30) x.fillRect(STYLUS.rulerX - 2, y - 1.2, 12, 2.4);           // HOLD: a slot
      else if (r === 31) { x.beginPath(); x.arc(STYLUS.rulerX + 4, y, 2, 0, TAU); x.fill(); }  // REST: a dot
      else x.fillRect(STYLUS.rulerX - 4, y - (inKeyRow(r) ? 0.8 : 0.45), inKeyRow(r) ? 14 : 7, inKeyRow(r) ? 1.6 : 0.9);
    }
    for (const yy of [STYLUS.y0, STYLUS.y1]) {
      x.fillStyle = C.brass; shadow(x, k, 3); x.fillRect(rl.x - 4, yy - 6, rl.w + 8, 12); noShadow(x);
      x.fillStyle = C.brassLight; x.fillRect(rl.x - 4, yy - 6, rl.w + 8, 2);
    }

    // the punch's bridge (iron crossbar on two brass posts)
    const pb = PUNCH_BRIDGE;
    for (const px of [pb.x + 6, pb.x + pb.w - 6]) {
      x.fillStyle = C.brass; shadow(x, k, 4); x.beginPath(); x.arc(px, pb.y + pb.h / 2, 8, 0, TAU); x.fill(); noShadow(x);
    }
    paperFill(x, k, cutRect(pb.x, pb.y, pb.w, pb.h, SEED.cut + 22, 0.5, 10), C.iron, 6);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(pb.x + 2, pb.y + 2, pb.w - 4, 2);

    // ---- the STEP dial: brass bezel, cream face, the engraved log scale 0.03 .. 30 ----
    paperFill(x, k, P.dialBezel, C.brass, 6);
    x.save(); x.clip(P.dialBezel);
    g = x.createLinearGradient(DIAL.x - DIAL.r, DIAL.y - DIAL.r, DIAL.x + DIAL.r, DIAL.y + DIAL.r);
    g.addColorStop(0, 'rgba(255,236,180,0.55)'); g.addColorStop(0.5, 'rgba(255,236,180,0)'); g.addColorStop(1, 'rgba(40,24,6,0.45)');
    x.fillStyle = g; x.fillRect(DIAL.x - DIAL.r * 1.2, DIAL.y - DIAL.r * 1.2, DIAL.r * 2.4, DIAL.r * 2.4);
    x.restore();
    x.fillStyle = '#efe5c9'; shadow(x, k, 1.2, 0.5); x.fill(P.dialFace); noShadow(x);
    x.save(); x.clip(P.dialFace);
    g = x.createRadialGradient(DIAL.x - DIAL.r * 0.4, DIAL.y - DIAL.r * 0.5, DIAL.r * 0.1, DIAL.x, DIAL.y, DIAL.r * 1.1);
    g.addColorStop(0, 'rgba(255,252,240,0.35)'); g.addColorStop(1, 'rgba(90,70,40,0.18)');
    x.fillStyle = g; x.fillRect(DIAL.x - DIAL.r, DIAL.y - DIAL.r, DIAL.r * 2, DIAL.r * 2);
    x.fillStyle = pattern(x, T.paper); x.fillRect(DIAL.x - DIAL.r, DIAL.y - DIAL.r, DIAL.r * 2, DIAL.r * 2);
    x.restore();
    // scale arc and ticks
    x.strokeStyle = C.ink; x.lineWidth = 1.6;
    x.beginPath(); x.arc(DIAL.x, DIAL.y, DIAL.r * 0.79, DIAL.a0, DIAL.a1); x.stroke();
    x.lineCap = 'butt';
    for (let d = -2; d <= 1; d++) for (let m = 1; m <= 9; m++) {
      const v = m * 10 ** d;
      if (v < DIAL.min * 0.999 || v > DIAL.max * 1.001) continue;
      const major = m === 1 || m === 3, mid = m === 5, a = angleAtU(Math.log(v / DIAL.min) / Math.log(DIAL.max / DIAL.min));
      const r0 = DIAL.r * 0.79, r1 = DIAL.r * (major ? 0.95 : mid ? 0.9 : 0.86);
      x.lineWidth = major ? 2.6 : 1.2;
      x.beginPath(); x.moveTo(DIAL.x + Math.cos(a) * r0, DIAL.y + Math.sin(a) * r0); x.lineTo(DIAL.x + Math.cos(a) * r1, DIAL.y + Math.sin(a) * r1); x.stroke();
    }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.letterSpacing = '6px';
    engrave(x, 'STEP', DIAL.x + 3, DIAL.y + DIAL.r * 0.42, `30px ${FONT_SERIF}`, C.ink, 'rgba(255,255,255,0.5)', 0.6);
    x.letterSpacing = '0px';
    for (const a of [DIAL.a0 - 0.07, DIAL.a1 + 0.07]) {           // stop pins at both ends of the scale
      x.fillStyle = C.brassDark; x.beginPath(); x.arc(DIAL.x + Math.cos(a) * DIAL.r * 0.88, DIAL.y + Math.sin(a) * DIAL.r * 0.88, 3.5, 0, TAU); x.fill();
    }

    // ---- the knob's base plate and pawl ----
    x.fillStyle = C.brassDark; shadow(x, k, 2); x.beginPath(); x.arc(KNOB.x, KNOB.y, KNOB.r * 1.22, 0, TAU); x.fill(); noShadow(x);
    x.fillStyle = 'rgba(255,230,170,0.25)'; x.beginPath(); x.arc(KNOB.x - 3, KNOB.y - 4, KNOB.r * 1.12, 0, TAU); x.fill();
    x.save(); x.translate(KNOB.x + KNOB.r * 0.98, KNOB.y - KNOB.r * 0.9); x.rotate(2.3);
    x.fillStyle = C.brass; shadow(x, k, 3); x.beginPath(); x.moveTo(-4, -5); x.lineTo(30, -2); x.lineTo(32, 3); x.lineTo(-4, 5); x.closePath(); x.fill(); noShadow(x);
    x.fillStyle = C.brassDark; x.beginPath(); x.arc(30, 0, 5, 0, TAU); x.fill();
    x.restore();
    // a brass shaft from the knob into the dial's bezel
    x.save(); x.strokeStyle = C.brassDark; x.lineWidth = 9; x.lineCap = 'round'; shadow(x, k, 2);
    x.beginPath(); x.moveTo(KNOB.x - KNOB.r * 0.9, KNOB.y - KNOB.r * 0.5); x.lineTo(DIAL.x + Math.cos(0.45) * DIAL.r * 1.05, DIAL.y + Math.sin(0.45) * DIAL.r * 1.05); x.stroke();
    x.restore(); noShadow(x);

    // ---- the plinth: NEW TUNES flags, OF TEN, the share drum, the LESSONS odometer ----
    paperFill(x, k, P.plinth, C.walnut, 6);
    x.save(); x.clip(P.plinth);
    woodGrain(x, FLAGS.x - 20, FLAGS.y - 30, FLAGS.w + 40, 200, SEED.wood + 1);
    g = x.createLinearGradient(FLAGS.x, FLAGS.y - 22, FLAGS.x + FLAGS.w, LESSONS.y + 80);
    g.addColorStop(0, 'rgba(255,210,150,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    x.fillStyle = g; x.fillRect(FLAGS.x - 20, FLAGS.y - 30, FLAGS.w + 40, 220);
    x.restore();
    // the flag rail and its engraved brass strip
    const railY = FLAGS.y + FLAGS.h - 18;
    paperFill(x, k, cutRect(FLAGS.x - 6, railY + 6, FLAGS.w + 12, 16, SEED.cut + 23, 0.4, 14), C.brass, 1.5);
    x.fillStyle = 'rgba(255,240,200,0.5)'; x.fillRect(FLAGS.x - 6, railY + 6, FLAGS.w + 12, 1.5);
    x.textBaseline = 'middle'; x.letterSpacing = '2.5px';
    x.textAlign = 'left'; engrave(x, 'NEW TUNES', FLAGS.x, railY + 14.5, `13px ${FONT_SERIF}`);
    x.textAlign = 'right'; engrave(x, 'OF TEN', FLAGS.x + FLAGS.w, railY + 14.5, `13px ${FONT_SERIF}`);
    x.letterSpacing = '0px';
    x.fillStyle = C.walnutDark; x.fillRect(FLAGS.x - 6, railY - 2, FLAGS.w + 12, 4);
    // counter housings: brass frames, black windows, cream wheels shaded like drums
    for (const box of [SHARE_DRUM, LESSONS]) {
      paperFill(x, k, cutRect(box.x - 5, box.y - 5, box.w + 10, box.h + 10, SEED.cut + 24 + box.x, 0.4, 12), C.brass, 2);
      x.fillStyle = '#121110'; x.fillRect(box.x, box.y, box.w, box.h);
      const n = box === SHARE_DRUM ? 2 : 6, cw = box.w / n;
      for (let i = 0; i < n; i++) {
        g = x.createLinearGradient(0, box.y + 3, 0, box.y + box.h - 3);
        g.addColorStop(0, '#6f6650'); g.addColorStop(0.3, '#e8dec4'); g.addColorStop(0.62, '#efe6cd'); g.addColorStop(1, '#5c5442');
        x.fillStyle = g; x.fillRect(box.x + i * cw + 2.5, box.y + 3, cw - 5, box.h - 6);
      }
    }
    x.textAlign = 'center'; x.letterSpacing = '3px';
    engrave(x, 'LESSONS', LESSONS.x + LESSONS.w / 2, LESSONS.y + LESSONS.h + 20, `16px ${FONT_SERIF}`, 'rgba(225,196,130,0.9)', 'rgba(0,0,0,0.6)', -0.8);
    x.letterSpacing = '0px';

    // ---- the music box: walnut, an inlaid border, open: velvet, the pinned cylinder, the steel comb ----
    paperFill(x, k, P.box, C.walnut, 8);
    x.save(); x.clip(P.box);
    woodGrain(x, BOX.x, BOX.y, BOX.w, BOX.h, SEED.wood + 2, true);
    x.restore();
    const inner = { x: BOX.x + 16, y: BOX.y + 16, w: BOX.w - 32, h: BOX.h - 32 };
    x.fillStyle = C.velvet; x.fillRect(inner.x, inner.y, inner.w, inner.h);
    g = x.createLinearGradient(inner.x, inner.y, inner.x + inner.w, inner.y + inner.h);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.25, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,150,110,0.12)');
    x.fillStyle = g; x.fillRect(inner.x, inner.y, inner.w, inner.h);
    x.strokeStyle = 'rgba(230,200,140,0.5)'; x.lineWidth = 1.2; x.strokeRect(BOX.x + 8, BOX.y + 8, BOX.w - 16, BOX.h - 16);
    const cyl = { x: BOX.x + BOX.w / 2 - 30, w: 40, y: BOX.y + 56, h: BOX.h - 112 };
    x.fillStyle = C.brass; shadow(x, k, 4); x.fillRect(cyl.x, cyl.y, cyl.w, cyl.h); noShadow(x);
    g = x.createLinearGradient(cyl.x, 0, cyl.x + cyl.w, 0);
    g.addColorStop(0, 'rgba(60,40,10,0.6)'); g.addColorStop(0.35, 'rgba(255,240,190,0.55)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,24,6,0.6)');
    x.fillStyle = g; x.fillRect(cyl.x, cyl.y, cyl.w, cyl.h);
    for (const yy of [cyl.y - 10, cyl.y + cyl.h + 2]) { x.fillStyle = C.brassDark; x.fillRect(cyl.x - 6, yy, cyl.w + 12, 8); }
    x.fillStyle = C.ironLight; shadow(x, k, 2); x.fillRect(cyl.x + cyl.w + 8, cyl.y - 4, 22, cyl.h + 8); noShadow(x);
    for (let i = 0; i < 30; i++) { x.fillStyle = i % 2 ? '#c3c8c2' : '#8d928c'; x.fillRect(cyl.x + cyl.w + 1, cyl.y + 2 + i * (cyl.h - 4) / 30, 12, (cyl.h - 4) / 30 - 1.4); }

    // the crank's shaft and axle boss
    x.save(); x.strokeStyle = C.brassDark; x.lineWidth = 12; shadow(x, k, 3);
    x.beginPath(); x.moveTo(CRANK.x, BOX.y + BOX.h - 4); x.lineTo(CRANK.x, CRANK.y); x.stroke(); x.restore(); noShadow(x);
    x.fillStyle = C.brass; shadow(x, k, 3); x.beginPath(); x.arc(CRANK.x, CRANK.y, 22, 0, TAU); x.fill(); noShadow(x);
  }

  // a loved bench: a stack of lesson cards, a pencil, the chalk in its tray (static, lower left)
  function paintProps(x, k) {
    const PR = LAYOUT.PROPS;
    // lesson cards, squared up by hand, never quite
    for (let i = 0; i < 5; i++) {
      x.save(); x.translate(PR.cards.x + i * 1.5, PR.cards.y - i * 2.2); x.rotate(PR.cards.rot + hashSigned(SEED.cut + 40, i) * 0.05);
      const card = cutRect(-PR.cards.w / 2, -PR.cards.h / 2, PR.cards.w, PR.cards.h, SEED.cut + 41 + i, 0.7, 18);
      paperFill(x, k, card, i % 2 ? '#e8dcbc' : '#efe4c7', 1.2);
      if (i === 4) {
        x.fillStyle = 'rgba(70,52,34,0.45)';
        for (let l = 0; l < 8; l++) x.fillRect(-PR.cards.w / 2 + 14, -PR.cards.h / 2 + 30 + l * 15, PR.cards.w - 28, 1);
        x.fillStyle = 'rgba(70,52,34,0.75)'; x.fillRect(-PR.cards.w / 2 + 14, -PR.cards.h / 2 + 18, PR.cards.w - 28, 1.6);
        x.fillStyle = C.hole;
        for (let l = 0; l < 10; l++) { x.beginPath(); x.arc(-PR.cards.w / 2 + 26 + l * 20, -PR.cards.h / 2 + 30 + 15 * Math.floor(hash01(SEED.cut + 47, l) * 8), 3.6, 0, TAU); x.fill(); }
      }
      x.restore();
    }
    // a pencil
    x.save(); x.translate(PR.pencil.x, PR.pencil.y); x.rotate(PR.pencil.rot);
    const L = PR.pencil.len;
    x.fillStyle = '#9a6a3c'; shadow(x, k, 4, 0.5); x.fillRect(0, -7, L, 14); noShadow(x);
    x.fillStyle = 'rgba(255,225,170,0.35)'; x.fillRect(0, -7, L, 4); x.fillStyle = 'rgba(40,20,5,0.35)'; x.fillRect(0, 3, L, 4);
    x.fillStyle = '#d8b88a'; x.beginPath(); x.moveTo(L, -7); x.lineTo(L + 36, -1.5); x.lineTo(L + 36, 1.5); x.lineTo(L, 7); x.closePath(); x.fill();
    x.fillStyle = '#2f2f33'; x.beginPath(); x.moveTo(L + 24, -2.5); x.lineTo(L + 38, 0); x.lineTo(L + 24, 2.5); x.closePath(); x.fill();
    x.fillStyle = C.brass; x.fillRect(-18, -7.5, 18, 15); x.fillStyle = '#d9cdb0'; x.fillRect(-34, -7, 16, 14);
    x.restore();
    // the chalk tray: a little walnut trough, three sticks, some dust
    x.save(); x.translate(PR.tray.x, PR.tray.y); x.rotate(PR.tray.rot);
    const tray = cutRect(0, 0, PR.tray.w, PR.tray.h, SEED.cut + 48, 0.6, 14);
    paperFill(x, k, tray, C.walnut, 2.5);
    x.fillStyle = C.walnutDark; x.fillRect(6, 6, PR.tray.w - 12, PR.tray.h - 12);
    x.fillStyle = 'rgba(240,236,225,0.18)';
    for (let i = 0; i < 40; i++) x.fillRect(8 + hash01(SEED.chalk + 9, i) * (PR.tray.w - 16), 8 + hash01(SEED.chalk + 10, i) * (PR.tray.h - 16), 1.6, 1.6);
    for (let i = 0; i < 3; i++) {
      const cl = 74 - i * 18, cx0 = 16 + i * 66 + hash01(SEED.chalk + 11, i) * 10, cy0 = 14 + i * 3;
      const stick = new Path2D(); stick.roundRect(cx0, cy0, cl, 13, 6);
      x.fillStyle = C.chalk; shadow(x, k, 1.5, 0.5); x.fill(stick); noShadow(x);
      x.fillStyle = 'rgba(120,110,90,0.25)'; x.fillRect(cx0 + 2, cy0 + 6, cl - 4, 2.5);
    }
    x.restore();
  }

  // =================================================================================================================
  // THE STRIP: bar lines, sprocket holes, the pencil haze, the holes. All from S.stripColumns and S.phase.
  function drawStrip(ctx, S, view, k) {
    const cols = S.stripColumns, cw = STRIP.colW, edge = PUNCH.x + cw / 2;
    // sprocket holes along both margins: the whole paper moves, the blank part too
    const ph = isNum(S.phase) ? S.phase : 0;
    ctx.fillStyle = 'rgba(16,30,22,0.9)';
    for (let j = -60; j <= 14; j++) {
      const sx = PUNCH.x + (j - ph) * cw;
      if (sx < view.x - 10 || sx > Math.min(view.x + view.w + 10, ROLL.x - 4)) continue;
      ctx.fillRect(sx - 2.5, STRIP.y + 7, 5, 7); ctx.fillRect(sx - 2.5, STRIP.y + STRIP.h - 13, 5, 7);
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(STRIP.x, STRIP.y, edge - STRIP.x, STRIP.h); ctx.clip();
    // bar lines, printed as the paper leaves the punch
    ctx.fillStyle = 'rgba(70,52,34,0.5)';
    for (const c of cols) if (c.bar) {
      const bx = PUNCH.x + c.x * cw - cw / 2;
      if (bx > view.x - 4 && bx < view.x + view.w + 4) ctx.fillRect(bx - 0.7, STRIP.rowsTop - 8, 1.4, rowY(31) - STRIP.rowsTop + 14);
    }
    // the pencil haze: one cell per (column, row), 3x2 texels each, smoothed up into soft graphite
    if (cols.length) {
      const g0 = cols[0].g, d = hazeImg.data, e = hrImg.data;
      d.fill(0); e.fill(0);
      let any = false;
      for (const c of cols) {
        if (!c.haze) continue;
        const i = c.g - g0;
        if (i < 0 || i >= 64) continue;
        for (let r = 0; r < 32; r++) {
          const a = Math.round(255 * clamp(c.haze[r] * 1.15, 0, 1));   // the pencil's tooth takes ~13% back
          if (a < 2) continue;
          any = true;
          const tgt = r < 30 ? d : e, py = r < 30 ? (29 - r) * 2 : (r - 30) * 2;
          for (let yy = py; yy < py + 2; yy++) for (let xx = i * 3; xx < i * 3 + 3; xx++) {
            const o = (yy * 192 + xx) * 4;
            tgt[o] = C.graphite[0]; tgt[o + 1] = C.graphite[1]; tgt[o + 2] = C.graphite[2]; tgt[o + 3] = a;
          }
        }
      }
      if (any) {
        hazeCtx.putImageData(hazeImg, 0, 0); hrCtx.putImageData(hrImg, 0, 0);
        const left = PUNCH.x + cols[0].x * cw - cw / 2;
        const dx0 = Math.max(0, Math.floor((STRIP.x - view.x) * k)), dy0 = Math.max(0, Math.floor((STRIP.y - view.y) * k));
        const dx1 = Math.min(PW, Math.ceil((edge - view.x) * k)), dy1 = Math.min(PH, Math.ceil((STRIP.y + STRIP.h - view.y) * k));
        if (dx1 > dx0 && dy1 > dy0) {
          lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.globalAlpha = 1;
          lctx.clearRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
          lctx.setTransform(k, 0, 0, k, -view.x * k, -view.y * k);
          lctx.imageSmoothingEnabled = true;
          lctx.drawImage(hazeCells, left, STRIP.rowsTop, 64 * cw, 30 * STRIP.rowH);
          lctx.drawImage(hrCells, left, rowY(30) - STRIP.rowH / 2, 64 * cw, 2 * STRIP.rowH);
          lctx.globalCompositeOperation = 'source-in';
          lctx.fillStyle = pat(lctx, 'pencil'); lctx.fillRect(STRIP.x, STRIP.y, edge - STRIP.x, STRIP.h);
          lctx.globalCompositeOperation = 'source-over';
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(layer, dx0, dy0, dx1 - dx0, dy1 - dy0, dx0, dy0, dx1 - dx0, dy1 - dy0);
          ctx.restore();
        }
      }
    }
    // the holes: amber over the lightbox, dark holes once they have moved on; HOLD a slot, REST a pencil dot
    for (const c of cols) {
      if (!isNum(c.holeR) || c.tok < 0) continue;
      const cx = PUNCH.x + c.x * cw;
      if (cx < view.x - 12 || cx > view.x + view.w + 12) continue;
      const y = rowY(c.tok), rad = HOLE_R * c.holeR, lit = 1 - smooth(14, 34, Math.abs(cx - PUNCH.x));
      if (c.kind === 'rest') {
        ctx.fillStyle = 'rgba(40,40,46,0.9)'; ctx.beginPath(); ctx.arc(cx, y, 2.4, 0, TAU); ctx.fill();
        continue;
      }
      const hole = new Path2D();
      if (c.kind === 'hold') hole.roundRect(cx - rad * 1.5, y - Math.max(1.6, rad * 0.42), rad * 3, Math.max(3.2, rad * 0.84), 2);
      else hole.arc(cx, y, rad, 0, TAU);
      if (lit > 0.01) {
        const gr = rad * 3.2 + 10, gl = ctx.createRadialGradient(cx, y, rad * 0.5, cx, y, gr);
        gl.addColorStop(0, `rgba(255,196,90,${(0.95 * lit).toFixed(3)})`); gl.addColorStop(0.35, `rgba(255,170,60,${(0.4 * lit).toFixed(3)})`);
        gl.addColorStop(1, 'rgba(255,160,50,0)');
        ctx.fillStyle = gl; ctx.fillRect(cx - gr, y - gr, 2 * gr, 2 * gr);
      }
      ctx.fillStyle = mixHex(C.hole, C.amberCore, lit); ctx.fill(hole);
      // the cut edge: the lamp catches the lower right lip, the upper left falls into shadow
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = lit > 0.5 ? 'rgba(170,100,20,0.6)' : 'rgba(255,245,220,0.55)';
      ctx.stroke(hole);
    }
    ctx.restore();
  }

  // the punch head: drops by its stroke on the note's first frame; its shadow tightens as it comes down
  function drawPunch(ctx, S, k) {
    const p = clamp(S.punch || 0, 0, 1), py = PUNCH.y + PUNCH.stroke * p;
    ctx.fillStyle = C.iron; ctx.fillRect(PUNCH.x - 4, PUNCH_BRIDGE.y + PUNCH_BRIDGE.h - 2, 8, py - PUNCH_BRIDGE.y - PUNCH_BRIDGE.h + 4);
    const head = new Path2D(); head.roundRect(PUNCH.x - PUNCH.w / 2, py, PUNCH.w, PUNCH.h, 5);
    ctx.fillStyle = C.brass; shadow(ctx, k, 2 + 6 * (1 - p), 0.5); ctx.fill(head); noShadow(ctx);
    const g = ctx.createLinearGradient(PUNCH.x - PUNCH.w / 2, py, PUNCH.x + PUNCH.w / 2, py + PUNCH.h);
    g.addColorStop(0, 'rgba(255,240,190,0.7)'); g.addColorStop(0.45, 'rgba(255,240,190,0)'); g.addColorStop(1, 'rgba(50,30,5,0.5)');
    ctx.fillStyle = g; ctx.fill(head);
    ctx.fillStyle = C.brassDark; ctx.beginPath(); ctx.arc(PUNCH.x, py + PUNCH.h / 2, 6, 0, TAU); ctx.fill();
  }

  // the stylus: a brass carriage on the rail; its tip points at the bet's mean row, wandering with its doubt
  function drawStylus(ctx, S, k) {
    const y = rowYf(isNum(S.stylusRow) ? S.stylusRow : 15), rx = STYLUS.railX;
    const body = new Path2D();
    body.moveTo(STYLUS.tipX, y); body.lineTo(rx - 14, y - 6); body.lineTo(rx - 14, y - 12); body.lineTo(rx + 14, y - 12);
    body.lineTo(rx + 14, y + 12); body.lineTo(rx - 14, y + 12); body.lineTo(rx - 14, y + 6); body.closePath();
    ctx.fillStyle = C.brass; shadow(ctx, k, 5, 0.5); ctx.fill(body); noShadow(ctx);
    ctx.fillStyle = 'rgba(255,240,190,0.55)'; ctx.fillRect(rx - 13, y - 11, 26, 3);
    ctx.fillStyle = 'rgba(60,36,8,0.45)'; ctx.fillRect(rx - 13, y + 8, 26, 3);
    ctx.fillStyle = C.brassDark; ctx.beginPath(); ctx.arc(rx, y, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.arc(STYLUS.tipX + 1.5, y, 1.6, 0, TAU); ctx.fill();
  }

  // =================================================================================================================
  // THE STEP DIAL: hatched TOO FAR from S.hatchU, the scale numbers, the chalk mark, the needle (S.needleU)
  function drawDial(ctx, S, k) {
    const { x, y, r } = DIAL;
    if (isNum(S.hatchU) && S.hatchU < 1) {
      const a0 = angleAtU(S.hatchU), a1 = DIAL.a1, ri = r * 0.3, ro = r * 0.955;
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, ro, a0, a1); ctx.arc(x, y, ri, a1, a0, true); ctx.closePath(); ctx.clip();
      ctx.fillStyle = 'rgba(120,90,50,0.13)'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.strokeStyle = 'rgba(62,48,34,0.78)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let d = -2 * r; d < 2 * r; d += 7.5) { ctx.moveTo(x + d - r, y - r); ctx.lineTo(x + d + r, y + r); }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * ri, y + Math.sin(a0) * ri); ctx.lineTo(x + Math.cos(a0) * ro, y + Math.sin(a0) * ro); ctx.stroke();
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, ri, a0, a1); ctx.stroke();
      // TOO FAR, engraved level (it reads at a glance, even small) in the middle of the zone, on a cream halo; clipped
      // to the zone, so a narrow zone shows only part of it
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, ro + 4, a0, a1); ctx.lineTo(x, y); ctx.closePath(); ctx.clip();
      const am = (a0 + a1) / 2, rr = r * 0.6, tx = x + Math.cos(am) * rr, ty = y + Math.sin(am) * rr;
      ctx.font = `25px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '2px';
      ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(239,229,201,0.97)'; ctx.strokeText('TOO FAR', tx, ty);
      ctx.fillStyle = C.ink; ctx.fillText('TOO FAR', tx, ty);
      ctx.letterSpacing = '0px';
      ctx.restore();
    }
    // the scale's numbers (drawn over the hatching, haloed)
    ctx.font = `21px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    for (const [v, t] of [[0.03, '0.03'], [0.1, '0.1'], [0.3, '0.3'], [1, '1'], [3, '3'], [10, '10'], [30, '30']]) {
      const a = angleAtU(Math.log(v / DIAL.min) / Math.log(DIAL.max / DIAL.min)), lx = x + Math.cos(a) * r * 0.66, ly = y + Math.sin(a) * r * 0.66;
      ctx.strokeStyle = 'rgba(239,229,201,0.95)'; ctx.strokeText(t, lx, ly);
      ctx.fillStyle = C.ink; ctx.fillText(t, lx, ly);
    }
    // the chalk: a tick at the limit measured at 20:00 (drawn on by S.chalkTick: its end is where the maker's chalk tip
    // is, hands.js), and the number beside it, written on left to right by S.chalkNumber over its own frames
    const tick = isNum(S.chalkTick) ? clamp(S.chalkTick, 0, 1) : 0;
    const written = isNum(S.chalkNumber) ? clamp(S.chalkNumber, 0, 1) : 0;
    if (tick > 0 || written > 0) {
      const a = angleAtU(S.chalkU), c = Math.cos(a), s = Math.sin(a);
      ctx.save();
      ctx.strokeStyle = pat(ctx, 'chalk');
      if (tick > 0) {
        const r0 = DIAL_CHALK.r0, r1 = lerp(DIAL_CHALK.r0, DIAL_CHALK.r1, tick);
        // the stroke's start is round (where the chalk touched down); its end is square, so the line stops exactly
        // under the tip (the cap would push it 4.5 units past)
        for (let i = 0; i < 3; i++) {
          const j = (i - 1) * 2.6, jx = -s * j, jy = c * j;
          ctx.lineWidth = i === 1 ? 9 : 4; ctx.globalAlpha = i === 1 ? 1 : 0.6; ctx.lineCap = 'butt';
          ctx.beginPath(); ctx.moveTo(x + c * r * r0 + jx, y + s * r * r0 + jy); ctx.lineTo(x + c * r * r1 + jx * 0.6, y + s * r * r1 + jy * 0.6); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.fillStyle = pat(ctx, 'chalk');
        ctx.beginPath(); ctx.arc(x + c * r * r0, y + s * r * r0, 4.5, 0, TAU); ctx.fill();
      }
      if (written > 0) {
        ctx.font = `64px ${FONT_HAND}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const tx = x + c * r * 1.12 + CHALK_TEXT.dx, ty = y + s * r * 1.12 + CHALK_TEXT.dy;
        const tw = ctx.measureText(S.chalkText).width + 4;
        ctx.beginPath(); ctx.rect(tx - 4, ty - 50, 4 + tw * written, 100); ctx.clip();   // the part written so far
        ctx.globalAlpha = 1; ctx.fillStyle = pat(ctx, 'chalk');
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 2 * k; ctx.shadowOffsetX = 1.2 * k; ctx.shadowOffsetY = 1.5 * k;
        ctx.fillText(S.chalkText, tx, ty); ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.globalAlpha = 0.7; ctx.fillText(S.chalkText, tx + 1.3, ty + 0.6);   // a second pass: chalk is thick
      }
      ctx.restore();
    }
    // the needle: blued steel with a counterweight, its shadow on the face
    const a = angleAtU(S.needleU), c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c;
    const needle = new Path2D();
    needle.moveTo(x + c * r * 0.93, y + s * r * 0.93);
    needle.lineTo(x + nx * 3.2, y + ny * 3.2); needle.lineTo(x - c * r * 0.2 + nx * 6, y - s * r * 0.2 + ny * 6);
    needle.lineTo(x - c * r * 0.2 - nx * 6, y - s * r * 0.2 - ny * 6); needle.lineTo(x - nx * 3.2, y - ny * 3.2); needle.closePath();
    ctx.fillStyle = '#1d2226'; shadow(ctx, k, 3.5, 0.45); ctx.fill(needle); noShadow(ctx);
    ctx.fillStyle = C.brass; shadow(ctx, k, 2); ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill(); noShadow(ctx);
    ctx.fillStyle = C.brassLight; ctx.beginPath(); ctx.arc(x - 2.5, y - 3, 4, 0, TAU); ctx.fill();
    // the glass: one soft glint from the lamp
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * 0.96, 0, TAU); ctx.clip();
    const gg = ctx.createLinearGradient(x - r, y - r, x - r * 0.2, y - r * 0.2);
    gg.addColorStop(0, 'rgba(255,250,235,0)'); gg.addColorStop(0.55, 'rgba(255,250,235,0.16)'); gg.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.95, Math.PI * 1.02, Math.PI * 1.48); ctx.arc(x - r * 0.05, y - r * 0.05, r * 0.7, Math.PI * 1.48, Math.PI * 1.02, true); ctx.fill();
    ctx.restore();
  }

  // the ratchet knob: turns with the needle (S.knobAngle)
  function drawKnob(ctx, S, k) {
    ctx.save(); ctx.translate(KNOB.x, KNOB.y); ctx.rotate(S.knobAngle || 0);
    ctx.fillStyle = C.brass; shadow(ctx, k, 4, 0.5); ctx.fill(knobPath); noShadow(ctx);
    ctx.rotate(-(S.knobAngle || 0));                                         // light stays put while the knob turns
    const g = ctx.createRadialGradient(-KNOB.r * 0.35, -KNOB.r * 0.4, 2, 0, 0, KNOB.r);
    g.addColorStop(0, 'rgba(255,240,190,0.55)'); g.addColorStop(0.7, 'rgba(255,240,190,0)'); g.addColorStop(1, 'rgba(40,24,6,0.35)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, KNOB.r * 0.98, 0, TAU); ctx.fill();
    ctx.rotate(S.knobAngle || 0);
    ctx.fillStyle = C.walnut; ctx.beginPath(); ctx.arc(0, 0, KNOB.r * 0.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * KNOB.r * 0.45, Math.sin(a) * KNOB.r * 0.45); ctx.lineTo(Math.cos(a) * KNOB.r * 0.6, Math.sin(a) * KNOB.r * 0.6); ctx.stroke(); }
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.moveTo(-2.5, -KNOB.r * 0.12); ctx.lineTo(2.5, -KNOB.r * 0.12); ctx.lineTo(1.2, -KNOB.r * 0.78); ctx.lineTo(-1.2, -KNOB.r * 0.78); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // NEW TUNES: ten brass flags; up = round(10 x share), flipping over S.flagsT on a bar line
  function drawFlags(ctx, S, k) {
    const fw = FLAGS.w / FLAGS.n, railY = FLAGS.y + FLAGS.h - 18;
    for (let i = 0; i < FLAGS.n; i++) {
      const was = i < S.flagsPrevUp, now = i < S.flagsUp;
      const t = smooth(0, 1, clamp(S.flagsT, 0, 1));
      const up = was === now ? (now ? 1 : 0) : lerp(was ? 1 : 0, now ? 1 : 0, t);
      const px = FLAGS.x + i * fw + fw * 0.62, ang = Math.PI * (1.02 + 0.48 * up);
      ctx.save(); ctx.translate(px, railY); ctx.rotate(ang);
      shadow(ctx, k, 1 + 4.5 * up, 0.5);
      ctx.fillStyle = mixHex('#6d5733', C.brass, up); ctx.fill(flagPath);
      ctx.fillStyle = mixHex('#5e4b2c', '#d9b465', up); ctx.fill(pennant);
      noShadow(ctx);
      ctx.fillStyle = `rgba(255,240,200,${(0.5 * up).toFixed(3)})`; ctx.fillRect(35, 2.5, 21, 2.2);
      ctx.restore();
      ctx.fillStyle = C.brassDark; ctx.beginPath(); ctx.arc(px, railY, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = C.brassLight; ctx.beginPath(); ctx.arc(px - 1, railY - 1, 1.6, 0, TAU); ctx.fill();
    }
  }

  // the counters' digits: the share drum (per note) and the LESSONS odometer
  function drawCounters(ctx, S) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [box, text] of [[SHARE_DRUM, S.shareDrumText], [LESSONS, S.stepsText]]) {
      const s = String(text ?? ''), n = box === SHARE_DRUM ? 2 : 6, cw = box.w / n;
      ctx.font = `${Math.round(box.h * 0.74)}px ${FONT_MONO}`; ctx.fillStyle = '#1e1a14';
      for (let i = 0; i < n; i++) {
        const ch = s[s.length - n + i] ?? '';
        if (ch) ctx.fillText(ch, box.x + (i + 0.5) * cw, box.y + box.h / 2 + 1.5);
      }
    }
  }

  // the music box: the cylinder's pins turn with the crank; the lid (S.lidClosed) comes down from its hinge
  function drawBox(ctx, S, k) {
    const lid = clamp(S.lidClosed || 0, 0, 1);
    const cyl = { x: BOX.x + BOX.w / 2 - 30, w: 40, y: BOX.y + 56, h: BOX.h - 112 };
    if (lid < 1) {
      ctx.fillStyle = '#f4dc9a';
      for (const pin of pinTable) {
        const a = pin.a + (S.crankAngle || 0), cs = Math.cos(a);
        if (cs <= 0.05) continue;
        ctx.globalAlpha = cs;
        ctx.fillRect(cyl.x + cyl.w / 2 + Math.sin(a) * cyl.w / 2 - 1.2, pin.y - 1.2, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
    }
    // the lid: standing open on its hinge (a thin walnut edge), coming down over the last bar
    const hgt = Math.max(10, BOX.h * Math.sin(lid * Math.PI / 2));
    ctx.save(); ctx.translate(BOX.x, BOX.y); ctx.scale(1, hgt / BOX.h);
    shadow(ctx, k, 2 + 8 * lid, 0.45); ctx.fillStyle = lid > 0 ? C.walnutLight : C.walnutDark; ctx.fill(P.lid); noShadow(ctx);
    ctx.restore();
    if (lid > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(BOX.x, BOX.y, BOX.w, hgt); ctx.clip();
      ctx.translate(BOX.x, BOX.y); ctx.scale(1, hgt / BOX.h);
      woodGrain(ctx, 0, 0, BOX.w, BOX.h, SEED.wood + 3, true);
      ctx.strokeStyle = 'rgba(230,200,140,0.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(12, 12, BOX.w - 24, BOX.h - 24);
      // the lid's top: a pale inlaid panel (maple), so a closed box reads at a glance even on a small screen, where the
      // open box is a dark well with a brass cylinder in it
      const ip = { x: 24, y: 26, w: BOX.w - 48, h: BOX.h - 52 };
      ctx.fillStyle = '#e6d6ac'; shadow(ctx, k, 1, 0.35); ctx.fill(cutRect(ip.x, ip.y, ip.w, ip.h, SEED.cut + 10, 0.5, 14)); noShadow(ctx);
      ctx.fillStyle = pat(ctx, 'paper'); ctx.fillRect(ip.x, ip.y, ip.w, ip.h);
      ctx.strokeStyle = 'rgba(74,45,27,0.7)'; ctx.lineWidth = 1.4; ctx.strokeRect(ip.x + 8, ip.y + 8, ip.w - 16, ip.h - 16);
      ctx.fillStyle = C.brass; ctx.beginPath(); ctx.ellipse(BOX.w / 2, BOX.h - 16, 11, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C.walnutDark; ctx.beginPath(); ctx.arc(BOX.w / 2, BOX.h - 17, 2.4, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = `rgba(0,0,0,${(0.35 * (1 - lid)).toFixed(3)})`; ctx.fillRect(BOX.x, BOX.y, BOX.w, hgt);
    } else {
      ctx.fillStyle = 'rgba(255,220,160,0.25)'; ctx.fillRect(BOX.x + 2, BOX.y + 2, BOX.w - 4, 2);
    }
  }

  // the crank: one turn per bar (S.crankAngle), always
  function drawCrank(ctx, S, k) {
    const a = S.crankAngle || 0, hx = CRANK.x + Math.cos(a) * CRANK.r, hy = CRANK.y + Math.sin(a) * CRANK.r;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = C.brass; ctx.lineWidth = 13; shadow(ctx, k, 5, 0.45);
    ctx.beginPath(); ctx.moveTo(CRANK.x, CRANK.y); ctx.lineTo(hx, hy); ctx.stroke();
    noShadow(ctx); ctx.strokeStyle = 'rgba(255,240,190,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CRANK.x - 2, CRANK.y - 3); ctx.lineTo(hx - 2, hy - 3); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.brassDark; ctx.beginPath(); ctx.arc(CRANK.x, CRANK.y, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = C.walnutLight; shadow(ctx, k, 7, 0.45); ctx.beginPath(); ctx.arc(hx, hy, 16, 0, TAU); ctx.fill(); noShadow(ctx);
    ctx.fillStyle = 'rgba(255,220,170,0.35)'; ctx.beginPath(); ctx.arc(hx - 4, hy - 5, 7, 0, TAU); ctx.fill();
  }

  // the title card (FORMAT): on the bench for frames 0..89, slid away over 90..119 (S.titleSlide)
  function buildTitleCard() {
    const s = 2, c = canvas(TITLE_CARD.w * s + 8, TITLE_CARD.h * s + 8), x = c.getContext('2d');
    x.setTransform(s, 0, 0, s, 4, 4);
    x.fillStyle = '#efe5ca'; x.fill(P.card);
    x.save(); x.clip(P.card);
    x.fillStyle = pattern(x, T.paper, 0.5); x.fillRect(0, 0, TITLE_CARD.w, TITLE_CARD.h);
    const g = x.createLinearGradient(0, 0, TITLE_CARD.w, TITLE_CARD.h);
    g.addColorStop(0, 'rgba(255,250,235,0.3)'); g.addColorStop(1, 'rgba(90,60,20,0.14)');
    x.fillStyle = g; x.fillRect(0, 0, TITLE_CARD.w, TITLE_CARD.h);
    x.restore();
    x.strokeStyle = 'rgba(60,46,30,0.55)'; x.lineWidth = 1.2; x.strokeRect(18, 18, TITLE_CARD.w - 36, TITLE_CARD.h - 36);
    x.lineWidth = 0.6; x.strokeRect(24, 24, TITLE_CARD.w - 48, TITLE_CARD.h - 48);
    x.fillStyle = '#2b241b'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `60px ${FONT_SERIF}`; x.letterSpacing = '9px';
    x.fillText('THE QUIET HOUR', TITLE_CARD.w / 2 + 4, TITLE_CARD.h * 0.43);
    x.letterSpacing = '0px';
    x.fillStyle = 'rgba(60,46,30,0.7)'; x.fillRect(TITLE_CARD.w / 2 - 60, TITLE_CARD.h * 0.56, 120, 1);
    x.fillStyle = '#3d3326'; x.font = `italic 27px ${FONT_SERIF}`;
    x.fillText('a music box learns jigs by ear', TITLE_CARD.w / 2, TITLE_CARD.h * 0.68);
    return c;
  }
  function drawTitleCard(ctx, S, k) {
    const tx = lerp(TITLE_CARD.x, TITLE_CARD.exitX, clamp(S.titleSlide, 0, 1));
    shadow(ctx, k, 7, 0.45);
    ctx.drawImage(cardCanvas, tx - 2, TITLE_CARD.y - 2, TITLE_CARD.w + 4, TITLE_CARD.h + 4);
    noShadow(ctx);
  }

  // =================================================================================================================
  // THE PICTURE'S CONDITION (programme pixels), all luminance-neutral
  // warmth 0.15..1 = how much of the picture's own colour is left; the rest goes to a cold grey ('color' blend keeps
  // every pixel's luminosity, so nothing brightens or darkens)
  function applyWarmth(ctx, S) {
    const w = clamp(S.warmth, 0, 1);
    if (w >= 0.999) return;
    ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 1 - w;
    ctx.fillStyle = '#848d97'; ctx.fillRect(0, 0, PW, PH); ctx.restore();
  }
  // S.hairline: one shift of 1..3 px at y (0..1 of the strip's height)
  function applyHairline(ctx, S, view, k) {
    if (!S.hairline) return;
    // within the part of the strip this view shows (in P-DIAL only its lower edge is in frame)
    const top = clamp((STRIP.y - view.y) * k, 0, PH - 2), bot = clamp((STRIP.y + STRIP.h - view.y) * k, 0, PH - 2);
    if (bot - top < 4) return;
    const y0 = Math.round(lerp(top, bot, clamp(S.hairline.y, 0, 1)));
    shiftBand(ctx, y0, 2, Math.round(S.hairline.shiftPx));
  }
  // S.tearBands: displaced bands, displacement only
  function applyTears(ctx, S) {
    for (const b of S.tearBands) {
      const y0 = Math.round(b.y0 * PH), h = Math.max(1, Math.round((b.y1 - b.y0) * PH)), dx = Math.round(b.dxPx);
      if (dx) shiftBand(ctx, y0, Math.min(h, 64, PH - y0), dx);
    }
  }
  function shiftBand(ctx, y0, h, dx) {
    if (h <= 0 || !dx) return;
    sctx.clearRect(0, 0, PW, h);
    sctx.drawImage(ctx.canvas, 0, y0, PW, h, 0, 0, PW, h);
    ctx.drawImage(scratch, 0, 0, PW, h, dx, y0, PW, h);    // the uncovered edge keeps its own pixels
  }
  // S.blockTiles: tiles of a 16 x 12 grid, each mosaicked at 8 px (averaged down, so the light stays the same)
  function applyBlocks(ctx, S) {
    if (!S.blocks || !S.blockTiles.length) return;
    const tw = PW / 16, th = PH / 12, n = tw / 8;               // 80 px tiles of 10 x 10 blocks
    mctx.imageSmoothingEnabled = true; mctx.imageSmoothingQuality = 'high';
    mctx.drawImage(ctx.canvas, 0, 0, PW, PH, 0, 0, PW / 8, PH / 8);
    ctx.save(); ctx.imageSmoothingEnabled = false;
    for (const t of S.blockTiles) {
      const tx = t % 16, ty = Math.floor(t / 16);
      ctx.drawImage(mosaic, tx * n, ty * n, n, n, tx * tw, ty * th, tw, th);
    }
    ctx.restore();
  }
  // the clock bug: MM:SS top right, in every view, exact on every frame
  function drawClockBug(ctx, S) {
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // inside the tube's safe area: its glass and bezel crop the canvas corners
    const plate = new Path2D(); plate.roundRect(PW - 252, 62, 160, 52, 6);
    ctx.fillStyle = 'rgba(8,12,10,0.5)'; ctx.fill(plate);
    ctx.font = `40px ${FONT_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3ecd9'; ctx.fillText(S.clock, PW - 172, 89);
    ctx.restore();
  }

  // =================================================================================================================
  // THE X-RAY (lab page only, never in the film; drawn only when draw() is called with opts.xray === true, or when the
  // page calls drawXray itself). Every label is taken from engine.gauges(frame), the engine's own list for this frame:
  // nothing is made up here, so there is no other list to go stale. Each gauge drawn on the bench gets one label beside
  // its element, placed by the gauge's id (XRAY_BENCH); the picture-wide gauges (XRAY_PICTURE) are listed in the lower
  // left corner; the room and sound gauges (window, hum, dust, shadow, tea, wall clock, the maker's lines) and any id
  // not named here are left to the page's list. One label per id. No gauge list: no labels.
  const XRAY_PICTURE = ['warmth', 'hairlines', 'tears', 'blocks'];
  const XRAY_SAFE = { x: 44, y: 34 };               // programme px kept clear at the edges: the tube's glass crops them
  const XRAY_FONT = 15, XRAY_H = 21, XRAY_GAP = 3;
  const polU = (u, rr) => { const a = angleAtU(u); return [DIAL.x + Math.cos(a) * DIAL.r * rr, DIAL.y + Math.sin(a) * DIAL.r * rr]; };
  // where each bench gauge's element is for this frame: [bench x, bench y, preferred side (-1 left, 1 right, 2 below,
  // -2 above)].
  // The clock bug is in programme pixels (it is drawn after the bench), so it is placed apart (xrayClock).
  const XRAY_BENCH = {
    haze: (S) => {                                   // the darkest pencil in the newest columns, just left of the punch
      const top = S.p ? S.p.reduce((b, v, i) => (v > S.p[b] ? i : b), 0) : 15;
      return [PUNCH.x - 4 * STRIP.colW, rowY(top), -1];
    },
    hole: (S) => [PUNCH.x, rowY(S.pick >= 0 ? S.pick : 15), -1],
    stylus: (S) => [STYLUS.railX + 16, rowYf(isNum(S.stylusRow) ? S.stylusRow : 15), 1],
    needle: (S) => [...polU(S.needleU, 0.5), -1],
    hatching: (S) => [...polU(isNum(S.hatchU) && S.hatchU < 1 ? (S.hatchU + 1) / 2 : 1, 0.9), 1],
    chalk: (S) => [...polU(S.chalkU, DIAL_CHALK.r1), 1],
    knob: () => [KNOB.x + KNOB.r, KNOB.y, 1],
    flags: () => [FLAGS.x + FLAGS.w / 2, FLAGS.y + 12, -2],
    drum: () => [SHARE_DRUM.x + SHARE_DRUM.w / 2, SHARE_DRUM.y + SHARE_DRUM.h, 2],
    lessons: () => [LESSONS.x + LESSONS.w / 2, LESSONS.y + LESSONS.h, 2],
    crank: (S) => [CRANK.x + Math.cos(S.crankAngle) * CRANK.r, CRANK.y + Math.sin(S.crankAngle) * CRANK.r, -1],
    hands: (S) => {                                  // the left hand: its pose targets blended by the engine's weights
      const W = S.hands.left, T = LAYOUT.HANDS.left;
      let x = 0, y = 0, sum = 0;
      for (const [pose, w] of Object.entries(W)) if (w > 0 && T[pose]) { x += T[pose].x * w; y += T[pose].y * w; sum += w; }
      if (!(sum > 0)) { x = T.rest.x; y = T.rest.y; sum = 1; }
      const out = 1 - clamp(S.hands.present, 0, 1);
      return [x / sum, Math.min(y / sum + LAYOUT.HANDS.off.dy * out, LAYOUT.BENCH.h - 20), 1];
    },
  };
  function drawXray(ctx, S, view) {
    let list = null;
    try { list = engine && typeof engine.gauges === 'function' ? engine.gauges(S.frame) : null; } catch { list = null; }
    if (!Array.isArray(list) || !list.length) return;
    const text = (g) => {
      const v = g.value === null || g.value === undefined || g.value === '' ? '-' : String(g.value);
      const t = `${g.name || g.id}: ${v}`;
      return t.length > 58 ? t.slice(0, 57) + '…' : t;
    };
    const kk = PW / view.w, placed = [], seen = new Set();
    const L = XRAY_SAFE.x, T = XRAY_SAFE.y, R = PW - XRAY_SAFE.x, B = PH - XRAY_SAFE.y;
    const hits = (x, y, w) => placed.some((r) => x < r[0] + r[2] + XRAY_GAP && x + w + XRAY_GAP > r[0] && y < r[1] + r[3] + XRAY_GAP && y + XRAY_H + XRAY_GAP > r[1]);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none'; noShadow(ctx);
    ctx.font = `${XRAY_FONT}px ${FONT_MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.letterSpacing = '0px';
    const paint = (t, x, y, w) => {
      ctx.fillStyle = 'rgba(0,0,0,0.76)'; ctx.fillRect(x, y, w, XRAY_H);
      ctx.fillStyle = '#f2f2ea'; ctx.fillText(t, x + 6, y + XRAY_H / 2 + 0.5);
      placed.push([x, y, w, XRAY_H]);
    };
    // a label beside a point (programme px): the preferred side first, then nudged up and down, then the other side
    // (a side is only used if the label clears the point: pushed in from the picture's edge it would cover what it
    // names), then above or below the point
    const beside = (t, px, py, side) => {
      const w = Math.ceil(ctx.measureText(t).width) + 12;
      let best = null;
      const tryAt = (x, y0, step) => {
        for (let n = 0; n < 24 && !best; n++) {
          const dy = step ? step(n) : (n % 2 ? 1 : -1) * Math.ceil(n / 2) * (XRAY_H + XRAY_GAP);
          const y = clamp(y0 + dy, T, B - XRAY_H);
          if (!hits(x, y, w)) best = [x, y];
        }
      };
      const xc = clamp(px - w / 2, L, R - w);
      const above = () => { if (!best) tryAt(xc, py - 14 - XRAY_H, (n) => -n * (XRAY_H + XRAY_GAP)); };
      const below = () => { if (!best) tryAt(xc, py + 14, (n) => n * (XRAY_H + XRAY_GAP)); };
      if (side === 2) below();                       // 2: under the element first (a counter's window), -2: over it
      if (side === -2) above();
      for (const sd of Math.abs(side) === 2 ? [] : [side, -side]) {
        const x = clamp(sd > 0 ? px + 12 : px - 12 - w, L, R - w);
        if (sd > 0 ? x < px + 6 : x + w > px - 6) continue;
        tryAt(x, py - XRAY_H / 2);
        if (best) break;
      }
      above(); below();
      if (!best) return;                             // no room left: the page's list still has it
      const [x, y] = best, ey = y + XRAY_H / 2;
      const ex = x >= px ? x : x + w <= px ? x + w : clamp(px, x, x + w), ey2 = x < px && x + w > px ? (y > py ? y : y + XRAY_H) : ey;
      ctx.strokeStyle = 'rgba(242,242,234,0.85)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey2); ctx.stroke();
      ctx.fillStyle = '#f2f2ea'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 1; ctx.stroke();
      paint(t, x, y, w);
    };
    // the clock bug's plate is reserved first, so no label lands on it
    placed.push([PW - 252, 62, 160, 52]);
    // picture-wide gauges: stacked up from the lower left corner, in the list's order
    const pic = list.filter((g) => XRAY_PICTURE.includes(g.id) && !seen.has(g.id) && seen.add(g.id));
    pic.forEach((g, i) => {
      const t = text(g), w = Math.ceil(ctx.measureText(t).width) + 12;
      paint(t, L, B - XRAY_H - (pic.length - 1 - i) * (XRAY_H + XRAY_GAP), w);
    });
    for (const g of list) {
      if (seen.has(g.id)) continue;
      if (g.id === 'clock') { seen.add(g.id); beside(text(g), PW - 252, 88, -1); continue; }
      const at = XRAY_BENCH[g.id];
      if (!at) continue;                             // a room or sound gauge, or one this module does not know: the page's
      seen.add(g.id);
      const [bx, by, side] = at(S), px = (bx - view.x) * kk, py = (by - view.y) * kk;
      if (px < L || px > R || py < T || py > B) continue;   // its element is not in this view
      beside(text(g), px, py, side);
    }
    ctx.restore();
  }

  return { draw, drawXray };
}

/** Mix two #rrggbb colours (t = 0: a, 1: b). */
function mixHex(a, b, t) {
  const p = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  const c = [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(t, 0, 1))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
