// THE QUIET HOUR, the programme on the TV: GREY STUB (harness-builder).
//
// The art builder replaces the drawing in here; the interface stays:
//
//   const programme = createProgramme({ engine });
//   programme.draw(ctx, S, view)   // ctx: the 1280x960 programme canvas's 2D context
//                                  // S: engine.signals(frame) (typedef at the top of ../signals.js)
//                                  // view: a rectangle in bench units from ../layout.js VIEWS
//
// Rules for whoever fills this in: draw everything fresh from S every call; keep no state between calls
// (the scratch canvases below are overwritten before they are read); no Math.random, no clocks. Positions
// come from ../layout.js. Every number drawn is read from S. Every rule (haze alpha, hole size, where the
// hatching starts, which flags are up, where the hands are) is already applied by the engine: this file only
// turns S into shapes. The stub is ugly on purpose, but every element moves by the engine's signals.

import {
  PROGRAMME_W, PROGRAMME_H, BENCH, WOOD_EDGE, LAMP, STRIP, rowY, rowYf, PUNCH, LIGHTBOX, HOLE_R, STYLUS,
  DIAL, CHALK_TEXT, KNOB, FLAGS, SHARE_DRUM, LESSONS, BOX, CRANK, TITLE_CARD, HANDS,
} from '../layout.js';
import * as LAYOUT from '../layout.js';
import { createHands } from './hands.js';

const FONT_SERIF = '"QH Serif"', FONT_MONO = '"QH Mono"', FONT_HAND = '"QH Hand"';
const D_MAJOR = [1, 2, 4, 6, 7, 9, 11];                    // pitch classes; row 0 is A3 (MIDI 57)
const inKeyRow = (r) => r < 30 && D_MAJOR.includes((57 + r) % 12);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const angleAtU = (u) => DIAL.a0 + clamp(u, 0, 1) * (DIAL.a1 - DIAL.a0);   // dial position 0..1 -> canvas angle

export function createProgramme({ engine }) {         // eslint-disable-line no-unused-vars
  const scratch = document.createElement('canvas'); scratch.width = PROGRAMME_W; scratch.height = 64;
  const sctx = scratch.getContext('2d');
  const tiny = document.createElement('canvas'); tiny.width = 16; tiny.height = 16;
  const tctx = tiny.getContext('2d');
  const hands = createHands({ layout: LAYOUT });

  function draw(ctx, S, view) {
    const sx = PROGRAMME_W / view.w, sy = PROGRAMME_H / view.h;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = '#202020'; ctx.fillRect(0, 0, PROGRAMME_W, PROGRAMME_H);
    ctx.setTransform(sx, 0, 0, sy, -view.x * sx, -view.y * sy);   // bench units from here on

    drawBench(ctx);
    hands.drawUnder(ctx, S, view);
    drawStrip(ctx, S);
    drawStylus(ctx, S);
    drawDial(ctx, S);
    drawKnob(ctx, S);
    drawFlagsAndCounters(ctx, S);
    drawBoxAndCrank(ctx, S);
    drawTitleCard(ctx, S);
    hands.drawOver(ctx, S, view);

    ctx.setTransform(1, 0, 0, 1, 0, 0);                            // programme pixels from here on
    applyWarmth(ctx, S);
    applyHairline(ctx, S, view, sy);
    applyTears(ctx, S);
    applyBlocks(ctx, S);
    drawClockBug(ctx, S);                                          // last: exact on every frame
    ctx.restore();
  }

  // ---- the bench -------------------------------------------------------------------------
  function drawBench(ctx) {
    ctx.fillStyle = '#3f4a42'; ctx.fillRect(BENCH.x, BENCH.y, BENCH.w, BENCH.h);          // baize (grey-green)
    const g = ctx.createRadialGradient(LAMP.x, LAMP.y, 0, LAMP.x, LAMP.y, LAMP.r);
    g.addColorStop(0, 'rgba(255,236,200,0.28)'); g.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = g; ctx.fillRect(BENCH.x, BENCH.y, BENCH.w, BENCH.h);
    ctx.fillStyle = '#5a4d40'; ctx.fillRect(WOOD_EDGE.x, WOOD_EDGE.y, WOOD_EDGE.w, WOOD_EDGE.h);
  }

  // ---- the strip: S.stripColumns (haze alpha and hole size already by the bible's rules) ---
  function drawStrip(ctx, S) {
    ctx.fillStyle = '#d8d6d0'; ctx.fillRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h);
    for (let r = 0; r < 32; r++) {                                  // ruled rows, D-major rows darker
      ctx.fillStyle = inKeyRow(r) ? 'rgba(40,40,40,0.35)' : 'rgba(40,40,40,0.12)';
      ctx.fillRect(STRIP.x, rowY(r) + STRIP.rowH / 2 - 0.6, STRIP.w, 1.2);
    }
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(LIGHTBOX.x, LIGHTBOX.y, LIGHTBOX.w, LIGHTBOX.h);   // lightbox
    ctx.save();
    ctx.beginPath(); ctx.rect(STRIP.x, STRIP.y, PUNCH.x + STRIP.colW / 2 - STRIP.x, STRIP.h); ctx.clip();
    for (const c of S.stripColumns) {
      const cx = PUNCH.x + c.x * STRIP.colW, x0 = cx - STRIP.colW / 2;
      if (x0 > PUNCH.x + STRIP.colW || cx < STRIP.x - STRIP.colW) continue;
      if (c.bar) { ctx.fillStyle = 'rgba(30,30,30,0.45)'; ctx.fillRect(x0 - 0.75, STRIP.y + 10, 1.5, STRIP.h - 20); }
      if (c.haze) for (let r = 0; r < 32; r++) {
        const a = c.haze[r];
        if (!(a >= 0.01)) continue;
        ctx.fillStyle = `rgba(30,30,34,${a.toFixed(4)})`;
        ctx.fillRect(x0 + 1, rowY(r) - STRIP.rowH / 2, STRIP.colW - 2, STRIP.rowH);
      }
      if (!isNum(c.holeR) || c.tok < 0) continue;                   // no bet: no hole
      const rad = HOLE_R * c.holeR, y = rowY(c.tok);
      const lit = Math.abs(cx - PUNCH.x) < LIGHTBOX.w / 2 + STRIP.colW / 2;
      ctx.fillStyle = lit ? '#ffcf70' : '#111';
      ctx.beginPath();
      if (c.kind === 'hold') ctx.rect(cx - rad * 1.6, y - rad * 0.45, rad * 3.2, rad * 0.9);   // a short slot
      else if (c.kind === 'rest') ctx.arc(cx, y, 1.6, 0, Math.PI * 2);                         // a pencil dot
      else ctx.arc(cx, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    const py = PUNCH.y + PUNCH.stroke * (S.punch || 0);             // the punch stroke
    ctx.fillStyle = '#8a7a55'; ctx.fillRect(PUNCH.x - PUNCH.w / 2, py, PUNCH.w, PUNCH.h);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.strokeRect(PUNCH.x - PUNCH.w / 2, py, PUNCH.w, PUNCH.h);
  }

  // ---- stylus: S.stylusRow (mean row + wander, glided by the engine) ----------------------
  function drawStylus(ctx, S) {
    const tip = { x: PUNCH.x, y: rowYf(isNum(S.stylusRow) ? S.stylusRow : 15) };
    ctx.strokeStyle = '#9a8656'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(STYLUS.pivot.x, STYLUS.pivot.y); ctx.lineTo(tip.x + 14, tip.y); ctx.stroke();
    ctx.fillStyle = '#9a8656'; ctx.beginPath(); ctx.moveTo(tip.x + 16, tip.y - 7); ctx.lineTo(tip.x + 2, tip.y); ctx.lineTo(tip.x + 16, tip.y + 7); ctx.fill();
    ctx.beginPath(); ctx.arc(STYLUS.pivot.x, STYLUS.pivot.y, 12, 0, Math.PI * 2); ctx.fill();
  }

  // ---- STEP dial: needle (S.needleU), TOO FAR from S.hatchU, chalk (S.chalk, chalkU, chalkText) ----
  function drawDial(ctx, S) {
    const { x, y, r } = DIAL;
    ctx.fillStyle = '#cfcab9'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.stroke();
    if (isNum(S.hatchU) && S.hatchU < 1) {                         // null: the hatching is gone
      const a0 = angleAtU(S.hatchU);
      ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r * 0.92, a0, DIAL.a1); ctx.closePath(); ctx.clip();
      ctx.strokeStyle = 'rgba(40,40,40,0.75)'; ctx.lineWidth = 2;
      for (let d = -2 * r; d < 2 * r; d += 9) { ctx.beginPath(); ctx.moveTo(x + d, y - r); ctx.lineTo(x + d + r, y + r); ctx.stroke(); }
      ctx.restore();
      const am = (a0 + DIAL.a1) / 2;
      ctx.fillStyle = '#222'; ctx.font = `22px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TOO FAR', x + Math.cos(am) * r * 0.62, y + Math.sin(am) * r * 0.62);
    }
    ctx.fillStyle = '#222'; ctx.font = `20px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const v of [0.03, 0.1, 0.3, 1, 3, 10, 30]) {               // engraved scale (fixed)
      const a = angleAtU(Math.log(v / DIAL.min) / Math.log(DIAL.max / DIAL.min)), c = Math.cos(a), s = Math.sin(a);
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + c * r * 0.86, y + s * r * 0.86); ctx.lineTo(x + c * r * 0.98, y + s * r * 0.98); ctx.stroke();
      ctx.fillText(String(v), x + c * r * 0.74, y + s * r * 0.74);
    }
    ctx.font = `26px ${FONT_SERIF}`; ctx.fillText('STEP', x, y + r * 0.45);
    if (S.chalk > 0) {
      const a = angleAtU(S.chalkU), c = Math.cos(a), s = Math.sin(a), t = clamp(S.chalk, 0, 1);
      ctx.save();
      ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 5; ctx.lineCap = 'round';   // the stroke draws on outward
      ctx.beginPath(); ctx.moveTo(x + c * r * 0.82, y + s * r * 0.82); ctx.lineTo(x + c * r * lerp(0.82, 1.12, t), y + s * r * lerp(0.82, 1.12, t)); ctx.stroke();
      ctx.globalAlpha = t; ctx.fillStyle = '#f4f4f0'; ctx.font = `40px ${FONT_HAND}`; ctx.textAlign = 'left';
      ctx.fillText(S.chalkText, x + c * r * 1.12 + CHALK_TEXT.dx, y + s * r * 1.12 + CHALK_TEXT.dy);
      ctx.restore();
    }
    const a = angleAtU(S.needleU);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  }

  // ---- knob: S.knobAngle (turns with the needle), ratchet teeth -------------------------------
  function drawKnob(ctx, S) {
    const { x, y, r, clicksPerTurn } = KNOB, a = -Math.PI / 2 + (S.knobAngle || 0);
    ctx.fillStyle = S.knobTurning ? '#7d7d7d' : '#6b6b6b'; ctx.beginPath();
    for (let i = 0; i < clicksPerTurn * 2; i++) {
      const aa = a + (i / (clicksPerTurn * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 0.9;
      ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.stroke();
  }

  // ---- NEW TUNES flags (S.flagsUp, flipping over S.flagsT), share drum, LESSONS odometer --------
  function drawFlagsAndCounters(ctx, S) {
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(FLAGS.x, FLAGS.y + FLAGS.h - 10, FLAGS.w, 10);
    const fw = FLAGS.w / FLAGS.n;
    for (let i = 0; i < FLAGS.n; i++) {
      const was = i < S.flagsPrevUp, now = i < S.flagsUp;
      const up = was === now ? (now ? 1 : 0) : lerp(was ? 1 : 0, now ? 1 : 0, clamp(S.flagsT, 0, 1));
      const fx = FLAGS.x + i * fw + fw * 0.2, top = lerp(FLAGS.y + FLAGS.h - 26, FLAGS.y + 6, up);
      ctx.fillStyle = '#888'; ctx.fillRect(fx, top, 3, FLAGS.y + FLAGS.h - 10 - top);
      ctx.fillStyle = up > 0.5 ? '#c8b070' : '#666'; ctx.fillRect(fx + 3, top, fw * 0.5, lerp(10, 22, up));
    }
    ctx.fillStyle = '#ddd'; ctx.font = `16px ${FONT_SERIF}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('NEW TUNES · OF TEN', FLAGS.x + FLAGS.w, FLAGS.y - 6);
    const drum = (box, text) => {
      ctx.fillStyle = '#1c1c1c'; ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = '#e8e2d0'; ctx.font = `${box.h * 0.8}px ${FONT_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 2);
    };
    drum(SHARE_DRUM, S.shareDrumText);
    drum(LESSONS, S.stepsText);
    ctx.fillStyle = '#ddd'; ctx.font = `16px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('LESSONS', LESSONS.x + LESSONS.w / 2, LESSONS.y + LESSONS.h + 4);
  }

  // ---- the box, the lid (S.lidClosed), the crank (S.crankAngle: one turn per bar, always) ------
  function drawBoxAndCrank(ctx, S) {
    ctx.fillStyle = '#5b5046'; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.fillStyle = '#3a332c'; ctx.fillRect(BOX.x + 16, BOX.y + 16, BOX.w - 32, BOX.h - 32);
    const lid = clamp(S.lidClosed || 0, 0, 1);
    if (lid > 0) { ctx.fillStyle = '#7a6a58'; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h * lid); }
    const [hx, hy] = crankHandle(S);
    ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(CRANK.x, CRANK.y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#999'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CRANK.x, CRANK.y); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(hx, hy, 14, 0, Math.PI * 2); ctx.fill();
  }
  const crankHandle = (S) => [CRANK.x + Math.cos(S.crankAngle) * CRANK.r, CRANK.y + Math.sin(S.crankAngle) * CRANK.r];

  // ---- title card (S.titleSlide: FORMAT, slid off over frames 90..119) ------------------------
  function drawTitleCard(ctx, S) {
    if (!S.titleVisible) return;
    const x = lerp(TITLE_CARD.x, TITLE_CARD.exitX, clamp(S.titleSlide, 0, 1));
    ctx.fillStyle = '#e9e4d6'; ctx.fillRect(x, TITLE_CARD.y, TITLE_CARD.w, TITLE_CARD.h);
    ctx.fillStyle = '#2a2a2a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `64px ${FONT_SERIF}`; ctx.fillText('THE QUIET HOUR', x + TITLE_CARD.w / 2, TITLE_CARD.y + TITLE_CARD.h * 0.42);
    ctx.font = `italic 30px ${FONT_SERIF}`; ctx.fillText('a music box learns jigs by ear', x + TITLE_CARD.w / 2, TITLE_CARD.y + TITLE_CARD.h * 0.68);
  }

  // ---- programme-wide effects ---------------------------------------------------------------
  // warmth 0.15..1 = the saturation of the whole picture (desaturate by 1 - warmth)
  function applyWarmth(ctx, S) {
    const w = clamp(S.warmth, 0, 1);
    if (w >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 1 - w;
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, PROGRAMME_W, PROGRAMME_H); ctx.restore();
  }
  // S.hairline: one shift of 1..3 px at y (0..1 of the strip's height), on notes where ratio now > 1
  function applyHairline(ctx, S, view, sy) {
    if (!S.hairline) return;
    const top = (STRIP.y - view.y) * sy, bot = (STRIP.y + STRIP.h - view.y) * sy;
    const y0 = Math.round(clamp(lerp(top, bot, S.hairline.y), 0, PROGRAMME_H - 2));
    shiftBand(ctx, y0, 2, Math.round(S.hairline.shiftPx));
  }
  // S.tearBands: displaced bands (y0, y1 in 0..1 of the picture), displacement only
  function applyTears(ctx, S) {
    for (const b of S.tearBands) {
      const y0 = Math.round(b.y0 * PROGRAMME_H), h = Math.max(1, Math.round((b.y1 - b.y0) * PROGRAMME_H)), dx = Math.round(b.dxPx);
      if (dx) shiftBand(ctx, y0, Math.min(h, 64, PROGRAMME_H - y0), dx);
    }
  }
  function shiftBand(ctx, y0, h, dx) {
    if (h <= 0 || !dx) return;
    sctx.clearRect(0, 0, PROGRAMME_W, h);
    sctx.drawImage(ctx.canvas, 0, y0, PROGRAMME_W, h, 0, 0, PROGRAMME_W, h);
    ctx.drawImage(scratch, 0, 0, PROGRAMME_W, h, dx, y0, PROGRAMME_W, h);   // the uncovered edge keeps its own pixels
  }
  // S.blockTiles: tiles of a 16 x 12 grid, each mosaicked at 8 px
  function applyBlocks(ctx, S) {
    if (!S.blocks || !S.blockTiles.length) return;
    const tw = PROGRAMME_W / 16, th = PROGRAMME_H / 12;            // 80 x 80 programme px
    tctx.imageSmoothingEnabled = false; ctx.save(); ctx.imageSmoothingEnabled = false;
    for (const t of S.blockTiles) {
      const px = (t % 16) * tw, py = Math.floor(t / 16) * th, n = tw / 8;
      tctx.drawImage(ctx.canvas, px, py, tw, th, 0, 0, n, n);
      ctx.drawImage(tiny, 0, 0, n, n, px, py, tw, th);
    }
    ctx.restore();
  }
  // clock bug: MM:SS top right, in every view, exact on every frame
  function drawClockBug(ctx, S) {
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.font = `44px ${FONT_MONO}`; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(PROGRAMME_W - 180, 26, 150, 54);
    ctx.fillStyle = '#f2efe6'; ctx.fillText(S.clock, PROGRAMME_W - 42, 34);
    ctx.restore();
  }

  return { draw };
}
