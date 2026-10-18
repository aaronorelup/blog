// The gate's scenery, drawn in thin lines on the background canvas: a torii where the road
// begins, stepping stones, four stone lanterns (one per question), and the tea-house doorway the
// people walk into. It redraws only on resize or a day/night switch; the dots live on the canvas
// above it. Everything here is decoration, so the canvas is aria-hidden and every word that
// matters is a DOM button over it.
import { roadY } from './gate-layout.js';

const TAU = Math.PI * 2;

/** Draw the scene. `ink` (0..1) reveals it left to right (the first-paint ink-in); 1 is complete. */
export function drawArt(g, geo, pal, ink = 1) {
  g.save();
  if (ink < 1) {
    g.beginPath();
    if (geo.tall) g.rect(-4, -4, geo.W + 8, (geo.H + 8) * ink);
    else g.rect(-30, -4, (geo.W + 34) * ink, geo.H + 8);
    g.clip();
  }
  if (geo.tall) drawTall(g, geo, pal); else drawWide(g, geo, pal);
  g.restore();
}

function drawWide(g, geo, pal) {
  const door = doorRect(geo);

  // The doorway first, so the road runs up to it and the people pile stands inside it.
  if (pal.mode === 'night') {
    // Lamplight from inside the room, strongest near the floor where the people sit.
    const cx = door.x + door.w / 2, cy = door.y + door.h * 0.78;
    const wash = g.createRadialGradient(cx, cy, 4, cx, cy, door.w * 0.9);
    wash.addColorStop(0, 'rgba(240,192,106,.09)');
    wash.addColorStop(1, 'rgba(240,192,106,0)');
    g.fillStyle = wash;
    g.fillRect(door.x + 1.5, door.y + 16, door.w - 3, door.h - 16);
  }
  shoji(g, door, pal);

  // Stepping stones: a little uneven, the way laid stones are.
  g.fillStyle = pal.line2;
  for (let x = geo.roadStart, i = 0; x < door.x - 6; x += 16, i++) {
    const y = roadY(geo, x) + (i % 3 === 1 ? 0.8 : i % 3 === 2 ? -0.6 : 0);
    g.beginPath();
    g.ellipse(x, y + 4, 4.5 + (i % 2) * 0.6, 2.5, (i % 2 ? 0.08 : -0.06), 0, TAU);
    g.fill();
  }

  torii(g, geo.torii, geo.yPath + 8, 1, pal);
  for (let k = 0; k < 4; k++) lantern(g, geo.xc[k], roadY(geo, geo.xc[k]) - 1, 1, pal);

  // One shared ground line under all five piles: the reason their heights can be compared.
  g.strokeStyle = pal.line;
  g.lineWidth = 1;
  const a = geo.piles[0].left - 14, b = geo.piles[4].right + 14;
  g.beginPath(); g.moveTo(a, geo.yBase + 1.5); g.lineTo(b, geo.yBase + 1.5); g.stroke();
}

export function doorRect(geo) {
  const w = geo.wp + 24;
  // The lintel sits just above the road, low enough that the "Everyone left" question reads on
  // the same line as the other four, above the eave.
  const y = geo.yPath - 12;
  return { x: geo.xc[4] - w / 2, y, w, h: geo.yBase - y };
}

// The tea-house doorway: a low eave, a lintel, and two posts that fade as they come down, with a
// faint kumiko lattice over the top third only. Nothing crosses the opening and nothing closes
// it at the bottom, so the gold pile stands in a doorway rather than in a display case
// (hairlines, not boxes).
function shoji(g, d, pal) {
  g.save();
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = pal.line2;
  // eave, its ends swept up
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(d.x - 16, d.y - 3);
  g.quadraticCurveTo(d.x + d.w / 2, d.y - 12, d.x + d.w + 16, d.y - 3);
  g.moveTo(d.x - 16, d.y - 3); g.quadraticCurveTo(d.x - 19, d.y - 5, d.x - 20, d.y - 9);
  g.moveTo(d.x + d.w + 16, d.y - 3); g.quadraticCurveTo(d.x + d.w + 19, d.y - 5, d.x + d.w + 20, d.y - 9);
  g.stroke();
  // lintel
  g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + d.w, d.y); g.stroke();
  // posts: full strength under the lintel, a quarter by the floor
  g.lineCap = 'butt';
  const post = (x) => {
    const grd = g.createLinearGradient(0, d.y, 0, d.y + d.h);
    grd.addColorStop(0, pal.line2);
    grd.addColorStop(1, withAlpha(pal.line2, 0.25));
    g.strokeStyle = grd;
    g.beginPath(); g.moveTo(x, d.y); g.lineTo(x, d.y + d.h); g.stroke();
  };
  post(d.x + 0.5);
  post(d.x + d.w - 0.5);
  // the kumiko: a square lattice over the top third, at a quarter strength
  g.strokeStyle = pal.line2;
  g.globalAlpha = 0.25;
  g.lineWidth = 1;
  g.beginPath();
  const cells = Math.max(4, Math.round(d.w / 18));
  const cw = d.w / cells, depth = d.h / 3;
  for (let i = 1; i < cells; i++) {
    const x = Math.round(d.x + cw * i) + 0.5;
    g.moveTo(x, d.y); g.lineTo(x, d.y + depth);
  }
  for (let y = d.y + cw; y <= d.y + depth + 0.5; y += cw) {
    const yy = Math.round(y) + 0.5;
    g.moveTo(d.x, yy); g.lineTo(d.x + d.w, yy);
  }
  g.stroke();
  g.restore();
}

// Canvas colours arrive as rgb()/rgba() strings from computed styles (or hex); the posts need
// one at a chosen alpha.
function withAlpha(c, a) {
  const m = /rgba?\(([^)]+)\)/.exec(c || '');
  if (m) {
    const [r, gg, b, a0 = 1] = m[1].split(',').map((x) => parseFloat(x));
    return `rgba(${r},${gg},${b},${a * a0})`;
  }
  if (/^#([0-9a-f]{6})$/i.test(c || '')) {
    const n = parseInt(c.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return c;
}

/** A torii, feet at (x, base). s scales the 46×64 drawing. */
export function torii(g, x, base, s, pal) {
  g.save();
  g.translate(x, base);
  g.scale(s, s);
  g.globalAlpha = 0.7;
  g.strokeStyle = pal.accent;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  // posts, leaning in a touch
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(-15, 0); g.lineTo(-13, -52);
  g.moveTo(15, 0); g.lineTo(13, -52);
  g.stroke();
  // kasagi: the top beam, with its ends swept up
  g.lineWidth = 2.8;
  g.beginPath();
  g.moveTo(-23, -58);
  g.quadraticCurveTo(0, -54, 23, -58);
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-20, -53); g.lineTo(20, -53);
  g.stroke();
  // nuki: the tie beam, and the short strut between the two
  g.beginPath();
  g.moveTo(-19, -42); g.lineTo(19, -42);
  g.moveTo(0, -53); g.lineTo(0, -42);
  g.stroke();
  // feet
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(-18, 0); g.lineTo(-12, 0);
  g.moveTo(12, 0); g.lineTo(18, 0);
  g.stroke();
  g.restore();
}

/** A stone lantern (tōrō), 14×22, standing on (x, base). Returns the firebox centre. */
export function lantern(g, x, base, s, pal) {
  g.save();
  g.translate(x, base);
  g.scale(s, s);
  g.strokeStyle = pal.quiet;
  g.lineWidth = 1.2;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.beginPath();
  // base and pillar
  g.moveTo(-5.5, 0); g.lineTo(5.5, 0);
  g.moveTo(-4, 0); g.lineTo(-4, -2); g.lineTo(4, -2); g.lineTo(4, 0);
  g.moveTo(-1.5, -2); g.lineTo(-1.5, -7);
  g.moveTo(1.5, -2); g.lineTo(1.5, -7);
  // platform
  g.moveTo(-5, -7); g.lineTo(5, -7);
  // firebox
  g.rect(-3.5, -12.5, 7, 5.5);
  // roof, eaves turned up
  g.moveTo(-7, -12.5);
  g.quadraticCurveTo(-3, -13.5, 0, -17.5);
  g.quadraticCurveTo(3, -13.5, 7, -12.5);
  g.stroke();
  // the jewel on top
  g.beginPath(); g.arc(0, -19.4, 1.5, 0, TAU); g.stroke();
  g.restore();
  return { x, y: base - 9.7 * s };
}

function drawTall(g, geo, pal) {
  const rx = geo.railX;
  const last = geo.piles[4];
  torii(g, rx, 15, 0.24, pal);
  g.strokeStyle = pal.line2;
  g.lineWidth = 2;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(rx, 17); g.lineTo(rx, last.junction); g.stroke();
  // Junction nodes: a ring per question, the people's one filled like a lit window.
  for (const pl of geo.piles) {
    g.beginPath();
    g.arc(rx, pl.junction, pl.k === 4 ? 4.5 : 3.6, 0, TAU);
    g.fillStyle = pal.page;
    g.fill();
    g.lineWidth = 1.5;
    g.strokeStyle = pl.k === 4 ? pal.head : pal.line2;
    g.stroke();
  }
}
