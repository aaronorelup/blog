// A line-up sign (studio pass, round 3): one floor of one company, large enough to read across a room. The layer's
// glyph on a rounded square in that company's glass and in the floor's state (the page's five), and under it the
// floor's parts as beads, each in its own owner's colour: another colour inside the glass is someone else's part.
// Drawn on a 256 grid. A sign states nothing new: glyph, state, owner and parts are the page's data (scene/set.js).
import { GLYPHS } from './glyphs.js';

const PAPER = '#F8F9FB', INK = '#0C0D10', MID = '#8C929C', LINE = '#C9CDD5';
const BOX = [20, 20, 216, 216, 28];      // the square: x, y, width, height, corner
const BEAD = { r: 13, gap: 6, y: 196, max: 6 };
const pale = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 200; };

// What a sign shows, as one string: a sign is drawn again only when this changes.
export const signKey = (t) => (t ? `${t.owner}|${t.glyph}|${t.state}|${(t.parts || []).slice(0, BEAD.max).map((p) => p[0] + p[1]).join(',')}` : '');

// Bands at 45 degrees, rising to the right like the page's own hatching, over whatever the caller has clipped to.
function hatch(g, [x, y, w, h], band, tone, alpha) {
  g.save();
  g.globalAlpha = alpha; g.strokeStyle = tone; g.lineWidth = band; g.lineCap = 'butt';
  g.beginPath();
  for (let d = -h; d < w + band; d += band * 2 * Math.SQRT2) { g.moveTo(x + d - band, y + h + band); g.lineTo(x + d + h + band, y - band); }
  g.stroke();
  g.restore();
}

// tile: { glyph, state, owner, parts: [[owner, status]] }. ownerOf: worlds/index.js `owner`. size: the canvas edge in px.
export function drawSign(g, size, tile, ownerOf) {
  const k = size / 256;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.clearRect(0, 0, 256, 256);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const o = ownerOf(tile.owner);
  const fillOf = (own, x0, x1) => {
    if (!own.prism) return own.glass;
    const grad = g.createLinearGradient(x0, 0, x1, 0);
    own.prism.forEach((hex, i) => grad.addColorStop(i / (own.prism.length - 1), hex));
    return grad;
  };
  const glass = fillOf(o, BOX[0], BOX[0] + BOX[2]);
  const light = pale(o.glass) && !o.prism;
  const square = (inset = 0) => { g.beginPath(); g.roundRect(BOX[0] + inset, BOX[1] + inset, BOX[2] - 2 * inset, BOX[3] - 2 * inset, BOX[4] - inset); };
  const state = tile.state;
  const filled = state === 'solid' || state === 'hatch';
  let ground = PAPER;                       // what stands behind the glyph and the beads
  let mark = INK, markA = 1;

  if (filled) {
    square(); g.fillStyle = glass; g.fill();
    if (state === 'hatch') { g.save(); square(); g.clip(); hatch(g, BOX, 18, light ? MID : PAPER, light ? 0.5 : 0.42); g.restore(); }
    if (light) { square(2.5); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
    ground = glass; mark = light ? INK : PAPER;
  } else if (state === 'frost') {
    square(); g.fillStyle = PAPER; g.fill();
    g.save(); g.globalAlpha = 0.28; square(); g.fillStyle = glass; g.fill(); g.restore();
    square(2.5); g.strokeStyle = INK; g.lineWidth = 5; g.setLineDash([5, 9]); g.stroke(); g.setLineDash([]);
    markA = 0.7;
  } else if (state === 'dotted') {
    square(2.5); g.strokeStyle = MID; g.lineWidth = 5; g.setLineDash([5, 9]); g.stroke(); g.setLineDash([]);
    markA = 0.7;
  } else {
    square(1.5); g.strokeStyle = LINE; g.lineWidth = 3; g.stroke();
    mark = LINE;
  }

  // the glyph: 120 px, stroked 10 px. On hatched glass it stands on a halo of the glass, so no band runs into it
  const parts = (tile.parts || []).slice(0, BEAD.max);
  const cy = parts.length ? 108 : 128;
  const path = new Path2D();
  path.addPath(new Path2D(GLYPHS[state === 'dotted' ? 'question' : tile.glyph] || GLYPHS.lamp), new DOMMatrix([5, 0, 0, 5, 128 - 60, cy - 60]));
  if (state === 'hatch') { g.strokeStyle = ground; g.lineWidth = 22; g.stroke(path); }
  g.save(); g.globalAlpha = markA; g.strokeStyle = mark; g.lineWidth = 10; g.stroke(path); g.restore();

  // the parts: one bead each, in its own owner's glass, inside a paper ring. A preview or announced part is hatched
  const step = 2 * BEAD.r + BEAD.gap;
  parts.forEach(([id, status], i) => {
    const x = 128 + (i - (parts.length - 1) / 2) * step, y = BEAD.y;
    const own = ownerOf(id);
    const whitish = pale(own.glass) && !own.prism;
    g.beginPath(); g.arc(x, y, BEAD.r + 2, 0, Math.PI * 2); g.fillStyle = PAPER; g.fill();
    g.beginPath(); g.arc(x, y, BEAD.r, 0, Math.PI * 2); g.fillStyle = fillOf(own, x - BEAD.r, x + BEAD.r); g.fill();
    if (status === 'preview' || status === 'announced') { g.save(); g.clip(); hatch(g, [x - BEAD.r, y - BEAD.r, 2 * BEAD.r, 2 * BEAD.r], 3.5, whitish ? MID : PAPER, 0.8); g.restore(); }
    if (whitish) { g.beginPath(); g.arc(x, y, BEAD.r - 1, 0, Math.PI * 2); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
  });
}
