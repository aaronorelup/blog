// THE QUIET HOUR, the programme on the TV: GREY STUB (harness-builder).
//
// The art builder replaces the drawing in here; the interface stays:
//
//   const programme = createProgramme({ engine });
//   programme.draw(ctx, S, view)   // ctx: the 1280x960 programme canvas's 2D context
//                                  // S: engine.signals(frame); view: a rectangle from layout.js VIEWS
//
// Rules for whoever fills this in: draw everything fresh from S (and engine.note(g) for the strip's
// history) every call; keep no state between calls; no Math.random, no clocks. Positions come from
// ../layout.js. Every number drawn is read from S. The stub is ugly on purpose but every element
// already moves by the bible's rules, so the grey animatic tells the story.

import {
  PROGRAMME_W, PROGRAMME_H, BENCH, WOOD_EDGE, LAMP, STRIP, rowY, STRIP_ROWS_BOTTOM, PUNCH, LIGHTBOX, HOLE_R, STYLUS,
  DIAL, dialAngle, CHALK_TEXT, KNOB, FLAGS, SHARE_DRUM, LESSONS, BOX, CRANK, TITLE_CARD, HANDS,
} from '../layout.js';
import { NOTE_FRAMES, BAR_FRAMES } from '../time.js';
import { hash01 } from '../rng.js';

const LN32 = Math.log(32);
const SEED = { stylus: 101, hair: 211, tear: 307, block: 401 };
const FONT_SERIF = '"QH Serif"', FONT_MONO = '"QH Mono"', FONT_HAND = '"QH Hand"';
const D_MAJOR = [1, 2, 4, 6, 7, 9, 11];                    // pitch classes (A3 = tok 0 is pitch class 9)
const inKeyRow = (tok) => tok < 30 && D_MAJOR.includes((57 + tok) % 12);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
// smooth seeded value noise in -1..1, knots every `period` frames
function noise1(seed, x, period) {
  const u = x / period, i = Math.floor(u), f = smoothstep(u - i);
  return lerp(hash01(seed, i, 0, 0), hash01(seed, i + 1, 0, 0), f) * 2 - 1;
}

export function createProgramme({ engine }) {
  // scratch canvases for the screen-space effects (contents never carried between frames)
  const scratch = document.createElement('canvas'); scratch.width = PROGRAMME_W; scratch.height = PROGRAMME_H;
  const sctx = scratch.getContext('2d');
  const tiny = document.createElement('canvas'); tiny.width = 8; tiny.height = 8;
  const tctx = tiny.getContext('2d');

  function draw(ctx, S, view) {
    const sx = PROGRAMME_W / view.w, sy = PROGRAMME_H / view.h;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#202020'; ctx.fillRect(0, 0, PROGRAMME_W, PROGRAMME_H);
    ctx.setTransform(sx, 0, 0, sy, -view.x * sx, -view.y * sy);   // bench units from here on

    drawBench(ctx);
    drawStrip(ctx, S);
    drawStylus(ctx, S);
    drawDial(ctx, S);
    drawKnob(ctx, S);
    drawFlagsAndCounters(ctx, S);
    drawBoxAndCrank(ctx, S);
    drawTitleCard(ctx, S);
    drawHands(ctx, S);

    ctx.setTransform(1, 0, 0, 1, 0, 0);                            // screen space from here on
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

  // ---- the strip: haze 0.85*sqrt(p), hole radius R*(0.25+0.75 p(pick)) ------------------
  function drawStrip(ctx, S) {
    ctx.fillStyle = '#d8d6d0'; ctx.fillRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h);
    // ruled rows (D-major pitch rows darker, like staff paper)
    for (let r = 0; r < 32; r++) {
      ctx.fillStyle = inKeyRow(r) ? 'rgba(40,40,40,0.35)' : 'rgba(40,40,40,0.12)';
      ctx.fillRect(STRIP.x, rowY(r) + STRIP.rowH / 2 - 0.6, STRIP.w, 1.2);
    }
    // lightbox under the newest column
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(LIGHTBOX.x, LIGHTBOX.y, LIGHTBOX.w, LIGHTBOX.h);
    const g = S.note, phase = S.phase;
    const nCols = Math.ceil((PUNCH.x - STRIP.x) / STRIP.colW) + 1;
    ctx.save();
    ctx.beginPath(); ctx.rect(STRIP.x, STRIP.y, PUNCH.x + STRIP.colW / 2 - STRIP.x, STRIP.h); ctx.clip();
    for (let k = g; k >= Math.max(0, g - nCols); k--) {
      const cx = PUNCH.x - (g - k + phase) * STRIP.colW, x0 = cx - STRIP.colW / 2;
      if (k % STRIP.barEvery === 0) { ctx.fillStyle = 'rgba(30,30,30,0.45)'; ctx.fillRect(x0 - 0.75, STRIP.y + 10, 1.5, STRIP.h - 20); }
      const n = engine.note(k), p = n.pNaN ? null : n.p;
      if (!p) continue;                                            // the bet is not a number: no haze, no hole
      for (let r = 0; r < 32; r++) {
        const a = 0.85 * Math.sqrt(Math.max(0, p[r]));
        if (a < 0.01) continue;
        ctx.fillStyle = `rgba(30,30,34,${a.toFixed(4)})`;
        ctx.fillRect(x0 + 1, rowY(r) - STRIP.rowH / 2, STRIP.colW - 2, STRIP.rowH);
      }
      const pp = n.ptok, tok = n.tok, y = rowY(tok);
      if (!isNum(pp)) continue;
      const rad = HOLE_R * (0.25 + 0.75 * pp);
      const lit = Math.abs(cx - PUNCH.x) < LIGHTBOX.w / 2 + STRIP.colW / 2;
      ctx.fillStyle = lit ? '#ffcf70' : '#111';
      ctx.beginPath();
      if (tok === 30) ctx.rect(cx - rad * 1.6, y - rad * 0.45, rad * 3.2, rad * 0.9);       // HOLD: a short slot
      else if (tok === 31) ctx.arc(cx, y, 1.6, 0, Math.PI * 2);                              // REST: a pencil dot
      else ctx.arc(cx, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // the punch
    ctx.fillStyle = '#8a7a55'; ctx.fillRect(PUNCH.x - PUNCH.w / 2, PUNCH.y, PUNCH.w, PUNCH.h);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.strokeRect(PUNCH.x - PUNCH.w / 2, PUNCH.y, PUNCH.w, PUNCH.h);
  }

  // ---- stylus: height = the bet's mean row; wander = spread x H/ln32 x seeded noise -------
  function drawStylus(ctx, S) {
    const p = S.p;
    let tipY = rowY(15);
    if (p) {
      let m = 0; for (let r = 0; r < 32; r++) m += p[r] * rowY(r);
      let v = 0; for (let r = 0; r < 32; r++) v += p[r] * (rowY(r) - m) ** 2;
      const spread = Math.sqrt(v), h = isNum(S.entropy) ? S.entropy / LN32 : 0;
      tipY = m + spread * h * noise1(SEED.stylus, S.frame, 9);
    }
    const tip = { x: PUNCH.x, y: clamp(tipY, STRIP.rowsTop, STRIP_ROWS_BOTTOM) };
    ctx.strokeStyle = '#9a8656'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(STYLUS.pivot.x, STYLUS.pivot.y); ctx.lineTo(tip.x + 14, tip.y); ctx.stroke();
    ctx.fillStyle = '#9a8656'; ctx.beginPath(); ctx.moveTo(tip.x + 16, tip.y - 7); ctx.lineTo(tip.x + 2, tip.y); ctx.lineTo(tip.x + 16, tip.y + 7); ctx.fill();
    ctx.beginPath(); ctx.arc(STYLUS.pivot.x, STYLUS.pivot.y, 12, 0, Math.PI * 2); ctx.fill();
  }

  // ---- STEP dial: needle = step size; hatched TOO FAR from 2/sharpness now; chalk at 20:00 -
  function drawDial(ctx, S) {
    const { x, y, r } = DIAL;
    ctx.fillStyle = '#cfcab9'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.stroke();
    // hatched zone: [limit now, max]; gone if sharpness is zero, negative or not a number
    if (isNum(S.sharp) && S.sharp > 0) {
      const a0 = dialAngle(2 / S.sharp);
      if (a0 < DIAL.a1) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r * 0.92, a0, DIAL.a1); ctx.closePath(); ctx.clip();
        ctx.strokeStyle = 'rgba(40,40,40,0.75)'; ctx.lineWidth = 2;
        for (let d = -2 * r; d < 2 * r; d += 9) { ctx.beginPath(); ctx.moveTo(x + d, y - r); ctx.lineTo(x + d + r, y + r); ctx.stroke(); }
        ctx.restore();
        const am = (a0 + DIAL.a1) / 2;
        ctx.save(); ctx.translate(x + Math.cos(am) * r * 0.62, y + Math.sin(am) * r * 0.62);
        ctx.fillStyle = '#222'; ctx.font = `22px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('TOO FAR', 0, 0); ctx.restore();
      }
    }
    // ticks and numerals (decades and thirds)
    ctx.fillStyle = '#222'; ctx.font = `20px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const v of [0.03, 0.1, 0.3, 1, 3, 10, 30]) {
      const a = dialAngle(v), c = Math.cos(a), s = Math.sin(a);
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + c * r * 0.86, y + s * r * 0.86); ctx.lineTo(x + c * r * 0.98, y + s * r * 0.98); ctx.stroke();
      ctx.fillText(String(v), x + c * r * 0.74, y + s * r * 0.74);
    }
    ctx.font = `26px ${FONT_SERIF}`; ctx.fillText('STEP', x, y + r * 0.45);
    // chalk mark at the limit measured at 20:00 (appears over frames 1440..1444)
    if (S.chalk > 0 && isNum(S.limit20)) {
      const a = dialAngle(S.limit20), c = Math.cos(a), s = Math.sin(a);
      ctx.save(); ctx.globalAlpha = clamp(S.chalk, 0, 1);
      ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + c * r * 0.82, y + s * r * 0.82); ctx.lineTo(x + c * r * 1.12, y + s * r * 1.12); ctx.stroke();
      ctx.fillStyle = '#f4f4f0'; ctx.font = `40px ${FONT_HAND}`; ctx.textAlign = 'left';
      ctx.fillText(S.limit20.toFixed(2), x + c * r * 1.12 + CHALK_TEXT.dx, y + s * r * 1.12 + CHALK_TEXT.dy);
      ctx.restore();
    }
    // needle: the step size
    if (isNum(S.lr)) {
      const a = dialAngle(S.lr);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.stroke();
    }
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  }

  // ---- knob: turns with the needle (3 knob turns over the dial's sweep), 24-click ratchet ---
  function drawKnob(ctx, S) {
    const { x, y, r, clicksPerTurn } = KNOB;
    const t = isNum(S.lr) ? (dialAngle(S.lr) - DIAL.a0) / (DIAL.a1 - DIAL.a0) : 0;
    const a = -Math.PI / 2 + t * 3 * Math.PI * 2;
    ctx.fillStyle = '#6b6b6b'; ctx.beginPath();
    for (let i = 0; i < clicksPerTurn * 2; i++) {
      const aa = (i / (clicksPerTurn * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 0.9;
      ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.stroke();
  }

  // ---- NEW TUNES flags (bar lines only), share drum (per note), LESSONS odometer -----------
  function drawFlagsAndCounters(ctx, S) {
    const barShare = engine.note(Math.floor(S.frame / BAR_FRAMES) * (BAR_FRAMES / NOTE_FRAMES)).heldAcc;
    const up = isNum(barShare) ? Math.round(10 * barShare) : 0;
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(FLAGS.x, FLAGS.y + FLAGS.h - 10, FLAGS.w, 10);
    const fw = FLAGS.w / FLAGS.n;
    for (let i = 0; i < FLAGS.n; i++) {
      const fx = FLAGS.x + i * fw + fw * 0.2, isUp = i < up;
      ctx.fillStyle = '#888'; ctx.fillRect(fx, FLAGS.y + (isUp ? 6 : FLAGS.h - 26), 3, isUp ? FLAGS.h - 16 : 16);
      ctx.fillStyle = isUp ? '#c8b070' : '#666'; ctx.fillRect(fx + 3, FLAGS.y + (isUp ? 6 : FLAGS.h - 26), fw * 0.5, isUp ? 22 : 10);
    }
    ctx.fillStyle = '#ddd'; ctx.font = `16px ${FONT_SERIF}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('NEW TUNES · OF TEN', FLAGS.x + FLAGS.w, FLAGS.y - 6);
    const drum = (box, text) => {
      ctx.fillStyle = '#1c1c1c'; ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = '#e8e2d0'; ctx.font = `${box.h * 0.8}px ${FONT_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 2);
    };
    drum(SHARE_DRUM, isNum(S.share) ? String(Math.min(99, Math.round(100 * S.share))).padStart(2, '0') : '--');
    drum(LESSONS, isNum(S.steps) ? String(S.steps).padStart(6, '0') : '------');
    ctx.fillStyle = '#ddd'; ctx.font = `16px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('LESSONS', LESSONS.x + LESSONS.w / 2, LESSONS.y + LESSONS.h + 4);
  }

  // ---- the box, the lid (closed over the last bar only if the hands are there), the crank ---
  function drawBoxAndCrank(ctx, S) {
    ctx.fillStyle = '#5b5046'; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.fillStyle = '#3a332c'; ctx.fillRect(BOX.x + 16, BOX.y + 16, BOX.w - 32, BOX.h - 32);
    const lid = clamp(S.lidClosed ?? 0, 0, 1);
    if (lid > 0) { ctx.fillStyle = '#7a6a58'; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h * lid); }
    const a = (S.frame / BAR_FRAMES) * Math.PI * 2;                // one turn per bar, always
    const hx = CRANK.x + Math.cos(a) * CRANK.r, hy = CRANK.y + Math.sin(a) * CRANK.r;
    ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(CRANK.x, CRANK.y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#999'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CRANK.x, CRANK.y); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(hx, hy, 14, 0, Math.PI * 2); ctx.fill();
  }

  // ---- title card (FORMAT: frames 0..89 on the bench, slid away over 90..119) ---------------
  function drawTitleCard(ctx, S) {
    const t = clamp(S.titleSlide ?? 1, 0, 1);
    if (t >= 1) return;
    const x = lerp(TITLE_CARD.x, TITLE_CARD.exitX, smoothstep(t));
    ctx.fillStyle = '#e9e4d6'; ctx.fillRect(x, TITLE_CARD.y, TITLE_CARD.w, TITLE_CARD.h);
    ctx.fillStyle = '#2a2a2a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `64px ${FONT_SERIF}`; ctx.fillText('THE QUIET HOUR', x + TITLE_CARD.w / 2, TITLE_CARD.y + TITLE_CARD.h * 0.42);
    ctx.font = `italic 30px ${FONT_SERIF}`; ctx.fillText('a music box learns jigs by ear', x + TITLE_CARD.w / 2, TITLE_CARD.y + TITLE_CARD.h * 0.68);
  }

  // ---- the maker's hands: two mittens, positions = pose weights x layout targets ----------
  function drawHands(ctx, S) {
    const H = S.hands;
    const present = clamp(H ? H.present : (S.handsPresent ?? 1), 0, 1);
    if (present <= 0) return;
    const dy = (1 - present) * HANDS.off.dy;
    // left hand: blend of its poses by the engine's weights (rest if none given)
    const w = (H && H.left) || { rest: 1 };
    let sum = 0, x = 0, y = 0, rot = 0;
    for (const [pose, wt] of Object.entries(w)) {
      const P = HANDS.left[pose]; if (!P || !(wt > 0)) continue;
      x += P.x * wt; y += P.y * wt; rot += P.rot * wt; sum += wt;
    }
    if (sum > 0) { x /= sum; y /= sum; rot /= sum; } else ({ x, y, rot } = HANDS.left.rest);
    const tapDip = H && isNum(H.tap) ? H.tap : 0;                  // 0..1 finger press (tap-along / dial tap)
    mitten(ctx, x, y + dy, rot, tapDip);
    // right hand on the crank handle whenever present
    const a = (S.frame / BAR_FRAMES) * Math.PI * 2;
    mitten(ctx, CRANK.x + Math.cos(a) * CRANK.r, CRANK.y + Math.sin(a) * CRANK.r + dy, HANDS.right.crank.rot, 0);
  }
  function mitten(ctx, x, y, rot, dip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(10, 14, 52, 66, 0, 0, Math.PI * 2); ctx.fill();   // paper shadow
    ctx.fillStyle = '#b9b2a6'; ctx.fillRect(-46, 40, 92, 520);                                                       // knitted cuff
    ctx.fillStyle = '#d9cfc0'; ctx.beginPath(); ctx.ellipse(0, 0, 48, 62, 0, 0, Math.PI * 2); ctx.fill();            // the hand
    ctx.beginPath(); ctx.ellipse(-50, 10, 16, 30, -0.5, 0, Math.PI * 2); ctx.fill();                                 // thumb
    ctx.beginPath(); ctx.ellipse(8, -62 - 14 * dip, 12, 26, 0, 0, Math.PI * 2); ctx.fill();                          // index finger
    ctx.restore();
  }

  // ---- screen-space effects ----------------------------------------------------------------
  // warmth = 0.15 + 0.85 k: saturation of the whole picture (desaturate by 1 - warmth)
  function applyWarmth(ctx, S) {
    const w = isNum(S.warmth) ? clamp(S.warmth, 0, 1) : 1;
    if (w >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 1 - w;
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, PROGRAMME_W, PROGRAMME_H); ctx.restore();
  }
  // ratio now > 1: one hairline shift of 1..3 px somewhere in the strip, seeded by the note
  function applyHairline(ctx, S, view, sy) {
    if (!(S.ratio > 1)) return;
    const top = (STRIP.y - view.y) * sy, bot = (STRIP.y + STRIP.h - view.y) * sy;
    const y0 = Math.round(clamp(lerp(top, bot, hash01(SEED.hair, S.note, 0, 0)), 0, PROGRAMME_H - 3));
    const dx = 1 + Math.floor(hash01(SEED.hair, S.note, 1, 0) * 3);
    shiftBand(ctx, y0, 2, dx);
  }
  // tears: floor(8 g) bands, up to +/- 24 g px, reseeded per note; displacement only
  function applyTears(ctx, S) {
    const g = isNum(S.tear) ? clamp(S.tear, 0, 1) : 0, n = Math.floor(8 * g);
    for (let i = 0; i < n; i++) {
      const y0 = Math.floor(hash01(SEED.tear, S.note, i, 0) * (PROGRAMME_H - 40));
      const h = 6 + Math.floor(hash01(SEED.tear, S.note, i, 1) * 34);
      const dx = Math.round((hash01(SEED.tear, S.note, i, 2) * 2 - 1) * 24 * g);
      if (dx) shiftBand(ctx, y0, h, dx);
    }
  }
  function shiftBand(ctx, y0, h, dx) {
    sctx.clearRect(0, 0, PROGRAMME_W, h);
    sctx.drawImage(ctx.canvas, 0, y0, PROGRAMME_W, h, 0, 0, PROGRAMME_W, h);
    ctx.drawImage(scratch, 0, 0, PROGRAMME_W, h, dx, y0, PROGRAMME_W, h);
    // the edge the band left behind keeps its own pixels (nothing new is drawn there)
  }
  // blocks: when err > 10 ln 32, 8 px mosaic patches over a share of the picture that grows with g
  function applyBlocks(ctx, S) {
    if (!(S.err > 10 * LN32)) return;
    const g = isNum(S.tear) ? clamp(S.tear, 0, 1) : 0, patches = Math.round(4 + 60 * g);
    tctx.imageSmoothingEnabled = false; ctx.save(); ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < patches; i++) {
      const px = Math.floor(hash01(SEED.block, S.note, i, 0) * (PROGRAMME_W / 64)) * 64;
      const py = Math.floor(hash01(SEED.block, S.note, i, 1) * (PROGRAMME_H / 64)) * 64;
      tctx.drawImage(ctx.canvas, px, py, 64, 64, 0, 0, 8, 8);
      ctx.drawImage(tiny, 0, 0, 8, 8, px, py, 64, 64);
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
