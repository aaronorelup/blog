// The bench, seen from straight above: the one world space every programme drawing uses.
//
// Units are "bench units": the whole bench is 1600 x 1200 (4:3), x to the right, y DOWN (canvas
// convention). The programme canvas is 1280 x 960, so P-WIDE draws 1 bench unit = 0.8 px.
// Every programme element has its rectangle or anchor here, and the three programme views are
// rectangles in the same space. Art builders: draw inside these shapes, or move them HERE (and
// nowhere else), so the shot table, the hands and the x-ray labels stay in step.
//
//   +------------------------------------------------------------------+  y 0
//   |  stylus pivot            punch                                   |
//   |  ============ strip (history scrolls left) ===|#|===  blank  ==  |  y 120..560
//   |                                                                  |
//   |      title card (frames 0..119)                 flags  [] [  ]   |
//   |           ( STEP dial )   (knob)                       +-box-+   |
//   |  left hand rest                                        |     |   |
//   |                                                        +-----+(crank)
//   |================== wood edge =====================================|  y 1130..1200
//   +------------------------------------------------------------------+

export const PROGRAMME_W = 1280, PROGRAMME_H = 960;
export const BENCH = { x: 0, y: 0, w: 1600, h: 1200 };
export const WOOD_EDGE = { x: 0, y: 1130, w: 1600, h: 70 };
export const LAMP = { x: 560, y: 430, r: 1150 };         // the warm pool of the one bench lamp, upper left (centre, radius)
export const LIGHT_DIR = { dx: 0.62, dy: 0.78 };          // paper shadows fall this way (down and to the right)

// ---- the strip -------------------------------------------------------------------------------
// 32 rows: rows 0..29 are pitches LOW to HIGH (drawn bottom to top), then a gap, then HOLD (30)
// and REST (31) at the bottom. One column per note; the newest column sits under the punch at
// PUNCH.x and older columns scroll left by COL_W per note.
export const STRIP = {
  x: -70, y: 116, w: 1480, h: 460,         // the paper: runs off the left edge, rolls up on the right (ROLL)
  rowsTop: 140, rowH: 12.5,                // pitch row r (0 = lowest) has its top at rowsTop + (29 - r) * rowH
  gap: 15,                                 // between the 30 pitch rows and HOLD/REST
  colW: 22,                                // one note
  barEvery: 6,                             // a bar line every 6 columns
};
/** y of the CENTRE of strip row `tok` (0..31) in bench units. */
export function rowY(tok) {
  if (tok < 30) return STRIP.rowsTop + (29 - tok + 0.5) * STRIP.rowH;
  return STRIP.rowsTop + 30 * STRIP.rowH + STRIP.gap + (tok - 30 + 0.5) * STRIP.rowH;
}
/** y of a fractional row (the stylus: rows -0.5..31.5), linear between row centres, across the HOLD/REST gap too. */
export function rowYf(r) {
  const c = Math.min(31.5, Math.max(-0.5, r));
  if (c <= 0) return rowY(0) + (rowY(0) - rowY(1)) * -c;
  if (c >= 31) return rowY(31) + (rowY(31) - rowY(30)) * (c - 31);
  const i = Math.floor(c), f = c - i;
  return rowY(i) + (rowY(i + 1) - rowY(i)) * f;
}
export const STRIP_ROWS_BOTTOM = STRIP.rowsTop + 32 * STRIP.rowH + STRIP.gap;   // 555
export const PUNCH = { x: 1100, y: 100, w: 44, h: 40, stroke: 14 }; // brass punch head; column centre at PUNCH.x; stroke = its drop
export const LIGHTBOX = { x: 1076, y: 130, w: 48, h: 430 };      // under the newest column: holes glow amber here
export const HOLE_R = 8.75;                                       // R in radius = R * (0.25 + 0.75 p)
// brass stylus: a carriage riding a vertical rail just right of the lightbox; its tip points at the newest column.
// The rail carries a ruler with one graduation per strip row (longer on the D-major rows).
export const STYLUS = { railX: 1150, tipX: 1113, y0: 96, y1: 596, rulerX: 1166 };
export const ROLL = { x: 1404, w: 50, y: 100, h: 492 };          // the blank paper's roll (the strip unwinds from it)
export const PUNCH_BRIDGE = { x: 1062, y: 58, w: 76, h: 18 };     // iron crossbar the punch head hangs from

// ---- the lower band --------------------------------------------------------------------------
// STEP dial: log scale MIN..MAX. Angle (canvas radians, clockwise from +x) runs from a0 (lower
// left) through the top to a1 (lower right).
export const DIAL = { x: 780, y: 790, r: 170, min: 0.03, max: 30, a0: Math.PI * 5 / 6, a1: Math.PI * 13 / 6 };
export function dialAngle(v) {
  const t = Math.log(v / DIAL.min) / Math.log(DIAL.max / DIAL.min);
  return DIAL.a0 + Math.min(1, Math.max(0, t)) * (DIAL.a1 - DIAL.a0);
}
export const CHALK_TEXT = { dx: 24, dy: 18 };                   // the chalked number, offset from the mark's outer end
// the chalk tick on the dial, as fractions of DIAL.r along the radius at S.chalkU: it starts at r0 and its end is at
// lerp(r0, r1, S.chalkTick). The maker's chalk tip (programme/hands.js chalkTip: dialPos(chalkU, lerp(0.8, 1.16, tick)))
// is drawn at exactly this point, so these two numbers must stay equal to the ones there.
export const DIAL_CHALK = { r0: 0.8, r1: 1.16 };
export const KNOB = { x: 1010, y: 905, r: 46, clicksPerTurn: 24 }; // turns with the needle; ratchet of 24 clicks
export const FLAGS = { x: 1050, y: 620, w: 300, h: 80, n: 10 };  // NEW TUNES: ten brass flags, OF TEN
export const SHARE_DRUM = { x: 1050, y: 712, w: 84, h: 44 };     // two-digit drum, round(100 x share)
export const LESSONS = { x: 1146, y: 712, w: 204, h: 44 };       // six-digit odometer, steps so far
export const BOX = { x: 1370, y: 600, w: 190, h: 300 };          // the music box (the strip feeds into it)
export const LID = { x: 1370, y: 600, w: 190, h: 300, hinge: 'top' };
export const CRANK = { x: 1465, y: 1000, r: 70 };                // axle; the handle is at radius r; 1 turn per bar
// the bench's still life, lower left (static; nothing reads them): lesson cards, a pencil, the chalk tray
export const PROPS = {
  cards: { x: 215, y: 735, w: 236, h: 156, rot: -0.12 },
  pencil: { x: 70, y: 1062, rot: -0.3, len: 300 },
  tray: { x: 150, y: 880, w: 250, h: 50, rot: 0.05 },
};
export const TITLE_CARD = { x: 420, y: 240, w: 640, h: 300, exitX: -700 }; // slides to x = exitX over frames 90..119

// ---- where the maker's hands go (the palm centre; cuffs run off the bottom edge) ---------------
export const HANDS = {
  off: { dy: 520 },                                  // added to y when the hands are gone
  left: {
    rest: { x: 430, y: 1010, rot: -0.15 },
    tap: { x: DIAL.x + 20, y: DIAL.y + 40, rot: -0.35 },     // index finger on the dial glass
    chalk: { x: DIAL.x + 120, y: DIAL.y - 60, rot: -0.5 },   // over the chalk mark
    grip: { x: KNOB.x - 10, y: KNOB.y + 30, rot: -0.2 },     // on the knob
    lid: { x: BOX.x + BOX.w / 2, y: BOX.y + 60, rot: 0.1 },  // closing the lid
    card: { x: TITLE_CARD.x + 80, y: TITLE_CARD.y + 200, rot: 0 },        // slides the title card away
    crank: { x: CRANK.x - 140, y: CRANK.y + 40, rot: 0.2 },            // (unused by the engine: the right hand cranks)
  },
  right: {
    crank: { x: CRANK.x, y: CRANK.y, rot: 0.25 },             // follows the crank handle (always, rule 2)
  },
};

// ---- the programme's three camera views (rectangles in bench units, all 4:3) -----------------
// The tube's glass and bezel crop the canvas edges (and round its corners), so every view keeps what matters
// at least ~5% inside its frame.
export const VIEWS = {
  'P-WIDE': { x: -40, y: -30, w: 1680, h: 1260 },      // the whole bench, a little room around it for the tube's edge
  'P-STRIP': { x: 640, y: 50, w: 693.33, h: 520 },     // the strip, the punch and the stylus, close
  'P-DIAL': { x: 545, y: 425, w: 880, h: 660 },        // dial, chalk, knob, flags, counters, the strip's newest edge
};

/** Interpolate two view rectangles (for a programme move, if a shot asks for one). */
export function lerpView(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t };
}
