// Every rule of the film bible (v1.2; sections 3, 4, 5 and 7) that turns a number from the log into something seen or
// heard, written once, here. src/signals.js applies them to the log for every note and frame; nothing else in the
// film should re-derive them. No rule here can see the ending's name, the wall clock or Math.random.
//
// Two conventions hold everywhere:
//   - A value that is not a number (NaN) always lands on the "bad" side of a threshold: an error that is not a number
//     counts as worse than guessing, a sharpness reading after 20:00 that is not a number removes the hatching, and so
//     on. The bible does not say; this is the one reading that never shows a broken run as a healthy one.
//   - Thresholds compare the log's full-precision value with the bible's number exactly as written
//     (">= 0.95" means >= 0.95). The one exception is the bible's own: worse than guessing is err > ln 32 + 1e-9.
//
// Rules the orchestrator changed after the first build are marked (v1.1) or (v1.2), as in the bible.
// Anything marked AUTHORED is a choice the bible leaves open (a duration, a curve, a size). It is listed in the
// report so the orchestrator can change it here, in one place.

import { NOTE_FRAMES, BAR_FRAMES, FPS, frameAtClock } from './time.js';

export const LN32 = Math.log(32);                      // the error of a uniform guess over the 32 rows

const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

/** The mean of an array of numbers; NaN if any is not a number or the array is empty. Summed in order. */
export function meanOf(a) {
  if (!a.length) return NaN;
  let s = 0;
  for (const x of a) { if (!isNum(x)) return NaN; s += x; }
  return s / a.length;
}
/** The median of an array of numbers (the lower middle for an even count); NaN if any is not a number or none. */
export function medianOf(a) {
  if (!a.length || !a.every(isNum)) return NaN;
  const b = [...a].sort((x, y) => x - y);
  return b[(b.length - 1) >> 1];
}

// ---- smoothing windows (AUTHORED, bible 9: "the smoothing windows") ----------------------------------------------
/** (v1.1) the limit right then reads the median of the last 3 sharpness readings (this note's and the two before). */
export const SHARP_MEDIAN_NOTES = 3;
/** (v1.1) the picture's warmth reads the mean error of the last 6 notes. */
export const WARMTH_MEAN_NOTES = 6;
/** (v1.2) the shadow's softness reads the mean entropy of the last 6 notes. */
export const SHADOW_MEAN_NOTES = 6;
// At the first notes the window holds the readings there are (1, then 2, ...).

// ---- section 3: the strip ---------------------------------------------------------------------------------------

/** Pencil haze: graphite alpha of one cell = 0.85 sqrt(p). "This is the pad you hear." */
export const hazeAlpha = (p) => 0.85 * Math.sqrt(p > 0 ? p : 0);

/** Hole radius as a fraction of R: 0.25 + 0.75 p(pick), the pluck's own velocity rule. */
export const holeRadius = (ptok) => 0.25 + 0.75 * clamp(isNum(ptok) ? ptok : 0, 0, 1);

/**
 * The pluck's velocity, as Fable's synth plays it (synth.js pluckOf): a pitch pick is plucked at
 * 0.25 + 0.75 clamp(p(pick), 0, 1); HOLD, REST and "no pick" pluck nothing (null).
 */
export function pluckVelocity(tok, ptok, P) {
  if (!(tok >= 0) || tok >= P) return null;
  return 0.25 + 0.75 * clamp(ptok === ptok ? ptok : 0, 0, 1);
}

/** The bet's mean row and spread (standard deviation, in rows), rows 0..31 as tokens, weights p (normalised). */
export function betMoments(p) {
  let s = 0, m = 0;
  for (let i = 0; i < p.length; i++) { s += p[i]; m += p[i] * i; }
  m /= s;
  let v = 0;
  for (let i = 0; i < p.length; i++) v += p[i] * (i - m) * (i - m);
  return { mean: m, spread: Math.sqrt(Math.max(0, v / s)) };
}

/** Entropy as a share of a uniform guess: H / ln 32 in [0, 1]. No number counts as 0 (nothing moves). */
export const entropyShare = (H) => (isNum(H) ? clamp(H / LN32, 0, 1) : 0);

/** The stylus wanders by (spread of the bet) x (H / ln 32) x smooth seeded noise. Noise knots: AUTHORED. */
export const STYLUS_NOISE_PERIOD = 9;                   // frames between noise knots
/** AUTHORED: the stylus glides from the last note's mean row to this one's over the note's first frames. */
export const STYLUS_GLIDE_FRAMES = 3;

// ---- section 3: the STEP dial ----------------------------------------------------------------------------------

export const DIAL_MIN = 0.03, DIAL_MAX = 30;            // log dial, 0.03 to 30
/** Position of a step size on the dial, 0 at 0.03 and 1 at 30 (not clamped; null if not a positive number). */
export const dialU = (v) => (isNum(v) && v > 0 ? Math.log(v / DIAL_MIN) / Math.log(DIAL_MAX / DIAL_MIN) : null);

/** A single reading's limit: 2 / sharpness. Zero, negative or not a number: no limit. */
export const limitFromSharpness = (sharp) => (isNum(sharp) && sharp > 0 ? 2 / sharp : null);
/**
 * (v1.1) The limit measured right then: 2 / the median of the last 3 sharpness readings (single readings are noisy).
 * null when the median is not a positive number. The latch (below) is applied by signals.js, which sees every note.
 */
export const limitFromMedian = (median) => limitFromSharpness(median);
/**
 * (v1.1) The first reading AFTER 20:00 that is zero, negative or not a number: the edge can no longer be measured,
 * and the hatching goes for the rest of the programme. A reading that loses it:
 */
export const losesTheEdge = (sharp) => !(isNum(sharp) && sharp > 0);

/** AUTHORED: the knob turns 2 full turns over the dial's whole scale, the same direction as the needle. */
export const KNOB_TURNS = 2;
/**
 * (v1.1) A knob turn: on a note whose step size differs from the note before, the knob turns to the new value over
 * the note's first 3 frames (eased, the needle moves on the log scale). It never starts while the maker's left hand is
 * drawing the chalk tick (frames 1440 and 1441, FORMAT), so at 20:00 it turns over frames 1442 to 1444 and the needle
 * lands inside the 20:00 note. When the hands are gone the knob still turns.
 */
export const KNOB_TURN_FRAMES = 3;

/**
 * The chalk (v1.1): taken at frame 1410; the tick drawn over frames 1440 to 1441 at the limit measured at 20:00, and
 * the number (to 2 decimals, read from the data) chalked beside it over frames 1440 to 1444. All FORMAT.
 */
export const CHALK_FRAME = 1440, CHALK_FRAMES = 5, CHALK_TICK_FRAMES = 2, CHALK_PICKUP_FRAME = 1410;
/** The chalked number's draw-on, 0 before frame 1440, then 0.2, 0.4 .. 1 over frames 1440 to 1444, then 1. */
export const chalkProgress = (frame) => clamp((frame - CHALK_FRAME + 1) / CHALK_FRAMES, 0, 1);
/** The chalk tick's draw-on, 0 before frame 1440, 0.5 on 1440, 1 from 1441 on. */
export const chalkTickProgress = (frame) => clamp((frame - CHALK_FRAME + 1) / CHALK_TICK_FRAMES, 0, 1);
/** The left hand is drawing the tick (no knob turn may start). */
export const chalkTickBusy = (frame) => frame >= CHALK_FRAME && frame < CHALK_FRAME + CHALK_TICK_FRAMES;
export const chalkText = (limit20) => limit20.toFixed(2);

// ---- section 3: counters ----------------------------------------------------------------------------------------

/** NEW TUNES flags: round(10 x share), read at the bar line (changes only on bar lines). */
export const flagsUp = (share) => (isNum(share) ? clamp(Math.round(10 * share), 0, 10) : 0);
/** The two-digit drum: round(100 x share), per note. */
export const shareDrum = (share) => (isNum(share) ? clamp(Math.round(100 * share), 0, 99) : 0);
/** AUTHORED: flags flip over the first 6 frames of a bar. */
export const FLAG_FLIP_FRAMES = 6;

// ---- section 3: picture warmth and the glitches -----------------------------------------------------------------

/** (v1.1) k = clamp((ln 32 - err6) / (ln 32 - best err up to 20:00), 0, 1); err6 = mean error of the last 6 notes. */
export const warmthK = (err6, best20) => (isNum(err6) ? clamp((LN32 - err6) / (LN32 - best20), 0, 1) : 0);
/** Saturation and warmth of the whole picture = 0.15 + 0.85 k. */
export const warmthOf = (k) => 0.15 + 0.85 * k;

/** (v1.1) Hairline: on a note where ratio now (step size x median sharpness / 2) is above 1 AND the hatching exists. */
export const hairlineOn = (ratioNow) => isNum(ratioNow) && ratioNow > 1;
/** The hairline's place and shift, seeded by the note: y in [0.04, 0.96] of the strip, a 1 to 3 px shift. */
export const HAIRLINE_PX = [1, 3];

/**
 * (v1.1) Tears: g = clamp(ln(err / best error so far) / ln 250, 0, 1), best so far = the lowest error at this note or
 * any earlier one. So nothing tears while it is learning. An error that is not a number tears fully.
 */
export const tearAmount = (err, bestSoFar) => (isNum(err) && isNum(bestSoFar) && bestSoFar > 0
  ? clamp(Math.log(err / bestSoFar) / Math.log(250), 0, 1) : 1);
/** floor(8 g) displaced bands, up to +/- 24 g px (programme-canvas pixels), reseeded per note. */
export const tearBandCount = (g) => Math.floor(8 * g);
export const tearMaxPx = (g) => 24 * g;
/** AUTHORED: a band is 1% to 5% of the picture's height. */
export const TEAR_BAND_H = [0.01, 0.05];

/** Blocks: when err is above 10 x ln 32. */
export const blocksOn = (err) => !(err <= 10 * LN32);
/** AUTHORED: the bible says the share "grows with g"; here share = 0.5 g of a 16 x 12 grid of tiles. */
export const blockShare = (g) => 0.5 * g;
export const BLOCK_GRID = [16, 12], BLOCK_PX = 8;

// ---- section 3: the maker's hands --------------------------------------------------------------------------------

/** (v1.1) Worse than guessing: err > ln 32 + 1e-9 (at note 0 the error equals ln 32 to the last bits). */
export const WORSE_EPS = 1e-9;
export const worseThanGuessing = (err) => !(err <= LN32 + WORSE_EPS);
/** Rule 1: out over one bar from the first worse note; back over 20 frames after 6 notes in a row at or below. */
export const HANDS_OUT_FRAMES = BAR_FRAMES, HANDS_BACK_FRAMES = 20, HANDS_BACK_NOTES = 6;
/** Rule 6: the tap-along finger taps on any note with p(pick) >= 0.6, lifting higher the surer. */
export const TAP_ALONG_P = 0.6;
export const tapAlongLift = (ptok) => 0.35 + 0.65 * clamp((ptok - TAP_ALONG_P) / (1 - TAP_ALONG_P), 0, 1);
/** AUTHORED: finger height across the note's 5 frames (x lift): up, down on the beat's 2nd frame, settling. */
export const TAP_ALONG_CURVE = [1, 0, 0.4, 0.15, 0];
/** Rule 5 (FORMAT): five-minute taps at 05:00, 10:00, 15:00 and 25:00 (20:00 is the chalk). Two taps, 6 frames apart. */
export const DIAL_TAP_FRAMES = [300, 600, 900, 1500].map(frameAtClock);   // [360, 720, 1080, 1800]
export const DIAL_TAP_GAP = 6;
export const DIAL_TAP_WINDOW = [-8, 16];                // the hand is in the tap pose from F-8 to F+16 (AUTHORED)
export const DIAL_TAP_BUMP = [0.25, 0.6, 1, 0.55, 0.2]; // press curve around each tap, frames -2..+2 (AUTHORED)
/** Title card (FORMAT): on the bench for frames 0 to 89, slid away by the left hand over frames 90 to 119. */
export const CARD_SLIDE = [90, 119], CARD_POSE = [80, 124];
export const cardSlide = (frame) => smoothstep((frame - CARD_SLIDE[0] + 1) / (CARD_SLIDE[1] - CARD_SLIDE[0] + 1));
/** Rule 7: the lid closes over the last bar if the hands are present at its start. */
export const LID_BAR_FRAME = 2130, LID_POSE_FROM = 2124;
/**
 * (v1.1) Rules 3 and 4: the left hand is on the knob while it turns, and stays gripped while turns keep coming: it
 * holds GRIP_LINGER_FRAMES after a turn ends (AUTHORED: 2, to the end of the turn's note, so a turn on the next note
 * finds it still there; on the first note without a turn it lets go).
 */
export const GRIP_LINGER_FRAMES = NOTE_FRAMES - KNOB_TURN_FRAMES;
/** AUTHORED: poses blend linearly over 6 frames; the reach to the knob over 2 (it must be there for a 3-frame turn). */
export const POSE_BLEND_FRAMES = 6, GRIP_REACH_FRAMES = 2;
export const POSES = ['rest', 'crank', 'tap', 'chalk', 'grip', 'card', 'lid'];

// ---- section 4: the room ----------------------------------------------------------------------------------------

/** (v1.2) Shadow softness = H6 / ln 32 (H6 = mean entropy of the last 6 notes); blur radius = 1 + 14 x softness. */
export const shadowRadius = (softness) => 1 + 14 * softness;
/** Dust opacity = 0.25 + 0.75 H / ln 32. Drift = each mote's velocity x running sum of H / ln 32 (in seconds). */
export const dustOpacity = (h) => 0.25 + 0.75 * h;
// (v1.1) The neighbour's window uses the hands' switch (rule 1 above): dark from the first note worse than guessing,
// lit again once err has been at or below ln 32 for 6 notes in a row. signals.js gives it the hands' own state.
/** Tea: a ripple ring per pluck sized by velocity squared. AUTHORED: a ring lives 36 frames (1.5 s). */
export const teaRingSize = (vel) => vel * vel;
export const TEA_RING_FRAMES = 36;
/** The spoon chatters when the mean pluck velocity of the last 6 notes is 0.95 or more (no pluck counts as 0). */
export const SPOON_NOTES = 6;
export const spoonChatter = (meanVel) => meanVel >= 0.95;
/** Wall clock: 23:30 plus the programme clock. */
export const WALL_START_MINUTES = 23 * 60 + 30;

// ---- section 5: the room's hum ----------------------------------------------------------------------------------

/** House hum: silent on any note where the step size changed, back over 2 s after 6 still notes. */
export const HUM_STILL_NOTES = 6, HUM_BACK_FRAMES = 2 * FPS;

// ---- section 7: the maker's lines -------------------------------------------------------------------------------

export const SUBTITLE_EXTRA_S = 0.5;                    // the subtitle stays for the line's length plus half a second
export const WORDS_PER_MINUTE = 130, LINE_PAD_S = 0.3;  // estimate when no recorded length is given
export const YES_GAP_NOTES = 24, YES_P = 0.95;
export const L1_FRAME = 30, L2_FRAME = DIAL_TAP_FRAMES[0], GN_FRAME = 2135;
/** (v1.2) L6a is FORMAT at frame 1445, right after the chalk tick (the first note boundary after the chalk). */
export const L6A_FRAME = CHALK_FRAME + CHALK_FRAMES;

/** A line's length in seconds: the recorded length when given (by exact text, then by id), else words / 130 wpm + 0.3 s. */
export function lineSeconds(id, text, voiceDurations) {
  const d = voiceDurations && (voiceDurations[text] ?? voiceDurations[id]);
  if (isNum(d) && d > 0) return d;
  return estimatedSeconds(text);
}
export function estimatedSeconds(text) {
  const words = text.trim().split(/\s+/).length;
  return (words * 60) / WORDS_PER_MINUTE + LINE_PAD_S;
}
/** Is this length a recording (true) or the estimate (false)? */
export function lineRecorded(id, text, voiceDurations) {
  const d = voiceDurations && (voiceDurations[text] ?? voiceDurations[id]);
  return isNum(d) && d > 0;
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** A whole number 0..999 in words ("twenty-seven"). */
export function intWords(n) {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`intWords: ${n}`);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  const r = n % 100;
  return ONES[Math.floor(n / 100)] + ' hundred' + (r ? ' and ' + intWords(r) : '');
}
/** A number in words: whole numbers as they are, others to one decimal ("two point five"). */
export function numberWords(x) {
  const r = Math.round(x);
  if (Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(x))) return intWords(r);
  const t = Math.round(x * 10);
  return intWords(Math.floor(t / 10)) + ' point ' + ONES[t % 10];
}
const capital = (s) => s[0].toUpperCase() + s.slice(1);

/** L6b's choice, by the step size at note 288 against the one before and against the limit measured at 20:00. */
function l6bChoice(c) {
  const lr = c.lr[c.breakNote], before = c.lr[c.breakNote - 1], n = lr / c.limit20;
  if (lr === before) return { variant: 'unchanged', text: "We'll leave it where it is." };
  if (Math.abs(n - 1) <= 1e-9) return { variant: 'equal', text: "So that's where we'll put it." };
  const w = numberWords(n);
  return { variant: w, text: `We'll give it ${w} times that.` };
}

/**
 * The lines, in table order (bible section 7, v1.2). `format: true` lines start at a fixed frame. L6b follows L6a
 * directly. Every other line is a data line: `holds(g, c)` is its rule at note g, read from the context `c` that
 * signals.js builds from the log (per-note arrays and constants), never the ending's name. A data line is spoken at
 * the first note where its rule holds AND the voice is free AND it would finish before the next FORMAT line; it
 * waits as long as that takes, and is not spoken on a note where its rule does not hold. Each data line at most once
 * per ending, except "Yes.". `text(g, c)` reads its numbers at the note it is spoken on; `variant(g, c)` names the take.
 */
export const LINES = [
  { id: 'L1', format: true, frame: L1_FRAME, rule: 'FORMAT, frame 30',
    text: () => "Good evening. It hasn't heard a tune yet, so it plays every note at once." },
  { id: 'L2', format: true, frame: L2_FRAME, rule: 'FORMAT, the 05:00 tap (frame 360)',
    text: () => "That's how big a step it takes after a mistake. Not too big." },
  { id: 'L3', rule: '95% of the bet in the key of D (massInKey >= 0.95)',
    holds: (g, c) => c.massInKey[g] >= 0.95, text: () => "It's found the key. Nobody told it one." },
  { id: 'L4', rule: 'half the next notes right on unseen tunes (heldAcc >= 0.5)',
    holds: (g, c) => c.share[g] >= 0.5, text: () => 'Every second note right. On tunes it\'s never heard.' },
  { id: 'YES', repeat: true, rule: 'p(pick) >= 0.95, at least 24 notes after the last "Yes.", nothing else playing',
    holds: (g, c) => c.ptok[g] >= YES_P, text: () => 'Yes.' },
  { id: 'L5', rule: 'ratio now (step size x median sharpness / 2) >= 0.25',
    holds: (g, c) => c.ratioNow[g] !== null && c.ratioNow[g] >= 0.25,
    text: () => "A quarter of the way to the edge now. Nobody's touched it." },
  { id: 'L6a', format: true, frame: L6A_FRAME, rule: 'FORMAT, frame 1445, right after the chalk tick',
    text: () => "That's as big a step as it can take." },
  { id: 'L6b', afterLine: 'L6a', rule: 'right after L6a, by the step size at note 288 against the limit at 20:00',
    text: (g, c) => l6bChoice(c).text, variant: (g, c) => l6bChoice(c).variant },
  { id: 'L7', rule: 'after 20:00: the share 0.05 or more under its 20:00 value, still at least half of it, hands on the bench',
    holds: (g, c) => g > c.breakNote && c.share[g] <= c.share20 - 0.05 && c.share[g] >= c.share20 / 2 && c.handsIn[g] === true,
    text: (g, c) => `${capital(intWords(shareDrum(c.share[g])))} in a hundred. It'll find it again.`,
    variant: (g, c) => String(shareDrum(c.share[g])) },
  { id: 'L8', rule: 'after 20:00: the hatching still exists and its edge is at 1.8 times the chalk mark or more',
    holds: (g, c) => g > c.breakNote && c.limitNow[g] !== null && c.limitNow[g] >= 1.8 * c.limit20,
    text: () => "It's made itself room." },
  { id: 'L9', rule: 'after 20:00: the share under half its 20:00 value',
    holds: (g, c) => g > c.breakNote && c.share[g] < c.share20 / 2,
    text: (g, c) => `${capital(intWords(shareDrum(c.share[g])))} in a hundred.`,
    variant: (g, c) => String(shareDrum(c.share[g])) },
  { id: 'L10', rule: 'the hands have come back (and are still on the bench)',
    holds: (g, c) => c.handsBackSince[g] === true, text: () => 'There you are.' },
  { id: 'GN', format: true, frame: GN_FRAME, rule: 'FORMAT, frame 2135; never dropped, cuts anything still playing',
    text: () => 'Goodnight.' },
];
/** (v1.2) When several data lines can be spoken on the same note: "There you are." first, then table order. */
export const SPEAK_ORDER = ['L10', 'L3', 'L4', 'YES', 'L5', 'L7', 'L8', 'L9'];
