// Every rule of the film bible (v1.2, sections 3, 4, 5 and 7) that turns a number from the log into something seen
// or heard, written once, here. src/signals.js applies them to the log for every note and frame; nothing else in the
// film should re-derive them. No rule here can see the ending's name, the wall clock or Math.random.
//
// Two conventions hold everywhere:
//   - A value that is not a number (NaN) always lands on the "bad" side of a threshold: an error that is not a number
//     counts as worse than guessing, a sharpness that is not a number removes the hatching, and so on. The bible
//     does not say; this is the one reading that never shows a broken run as a healthy one.
//   - Thresholds compare the log's full-precision value with the bible's number exactly as written
//     (">= 0.95" means >= 0.95). The one tolerance is the bible's own: "worse than guessing" is err > ln 32 + 1e-9.
//
// Anything marked AUTHORED is a choice the bible leaves open (a duration, a curve, a size). It is listed in the
// report so the orchestrator can change it here, in one place.

import { NOTE_FRAMES, BAR_FRAMES, FPS, PROGRAMME_FRAMES, frameAtClock } from './time.js';

export const LN32 = Math.log(32);                      // the error of a uniform guess over the 32 rows

const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

/** The median of a short list of numbers (the mean of the middle two when the count is even). */
export function median(values) {
  const v = values.slice().sort((a, b) => a - b), n = v.length;
  return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
}

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

/**
 * (v1.1) The sharpness the dial trusts at a note: the median of the last 3 readings (this note's and the two
 * before it; fewer at the very start). NaN if any of them is not a number.
 */
export const SHARP_MEDIAN_NOTES = 3;
export const sharpnessMedian = (readings) => (readings.every(isNum) ? median(readings) : NaN);
/** The limit measured right now: 2 / that median. Zero, negative or not a number: no limit, no hatching. */
export const limitFromSharpness = (sharp) => (isNum(sharp) && sharp > 0 ? 2 / sharp : null);
/**
 * (v1.1) The latch: the first single reading AFTER 20:00 that is zero, negative or not a number means the edge can
 * no longer be measured. The hatching goes at that note and never comes back.
 */
export const edgeLost = (sharpReading) => !(sharpReading > 0);

/** AUTHORED: the knob turns 2 full turns over the dial's whole scale, the same direction as the needle. */
export const KNOB_TURNS = 2;
/**
 * (v1.1) A knob turn: on any note whose step size differs from the note before, the knob (and the needle) go to
 * the new value over that note's first 3 frames. At 20:00 the left hand is drawing the chalk tick on frames 1440
 * and 1441, so that turn takes frames 1442 to 1444: a turn never starts while the tick is being drawn.
 * AUTHORED: the needle eases (smoothstep on the log scale) and stands on the new value on the 3rd frame.
 */
export const KNOB_TURN_FRAMES = 3;

/**
 * (v1.1) The chalk mark at 20:00 (FORMAT): the tick is drawn over frames 1440 to 1441 at the limit measured at
 * 20:00; the number (that limit to 2 decimals) is chalked beside it over frames 1440 to 1444.
 */
export const CHALK_FRAME = 1440, CHALK_TICK_FRAMES = 2, CHALK_FRAMES = 5, CHALK_PICKUP_FRAME = 1410;
export const chalkTickProgress = (frame) => clamp((frame - CHALK_FRAME + 1) / CHALK_TICK_FRAMES, 0, 1);
export const chalkProgress = (frame) => clamp((frame - CHALK_FRAME + 1) / CHALK_FRAMES, 0, 1);   // the number
export const chalkText = (limit20) => limit20.toFixed(2);
/** The left hand is drawing the tick (it cannot turn the knob on these frames). */
export const chalkTickBusy = (frame) => frame >= CHALK_FRAME && frame < CHALK_FRAME + CHALK_TICK_FRAMES;

// ---- section 3: counters ----------------------------------------------------------------------------------------

/** NEW TUNES flags: round(10 x share), read at the bar line (changes only on bar lines). */
export const flagsUp = (share) => (isNum(share) ? clamp(Math.round(10 * share), 0, 10) : 0);
/** The two-digit drum: round(100 x share), per note. */
export const shareDrum = (share) => (isNum(share) ? clamp(Math.round(100 * share), 0, 99) : 0);
/** AUTHORED: flags flip over the first 6 frames of a bar. */
export const FLAG_FLIP_FRAMES = 6;

// ---- section 3: picture warmth and the glitches -----------------------------------------------------------------

/**
 * (v1.1) k = clamp((ln 32 - err6) / (ln 32 - best err up to 20:00), 0, 1), err6 = the mean error of the last 6
 * notes (this one and the five before; fewer at the very start), so the colour does not pump from note to note.
 */
export const WARMTH_NOTES = 6;
export const warmthK = (err6, best20) => (isNum(err6) ? clamp((LN32 - err6) / (LN32 - best20), 0, 1) : 0);
/** Saturation and warmth of the whole picture = 0.15 + 0.85 k. */
export const warmthOf = (k) => 0.15 + 0.85 * k;

/**
 * Hairline: on a note where ratio now is above 1, and (v1.1) only while the hatching exists. Ratio now = step size x
 * sharpness / 2 with the same median of 3 readings as the hatching, so a hairline means: the needle is inside TOO FAR.
 */
export const hairlineOn = (ratioNow) => !(ratioNow <= 1);
/** The hairline's place and shift, seeded by the note: y in [0.04, 0.96] of the strip, a 1 to 3 px shift. */
export const HAIRLINE_PX = [1, 3];

/**
 * (v1.1) Tears: g = clamp(ln(err / its best error so far) / ln 250, 0, 1), best so far = the lowest error at this
 * note or any earlier one. So nothing tears while it is learning.
 */
export const tearAmount = (err, bestSoFar) => (isNum(err) ? clamp(Math.log(err / bestSoFar) / Math.log(250), 0, 1) : 1);
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

/**
 * Worse than guessing: (v1.1) err > ln 32 + 1e-9 (at note 0 the error equals ln 32 to the last bits). A non-number
 * counts as worse. "At or below ln 32" is the opposite of this, everywhere.
 */
export const GUESS_EPS = 1e-9;
export const worseThanGuessing = (err) => !(err <= LN32 + GUESS_EPS);
/**
 * Rule 1: out over one bar from the first worse note; back over 20 frames after 6 notes in a row at or below.
 * (v1.1) The neighbour's window uses the same switch.
 */
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
/** AUTHORED: the left hand stays on the knob for 5 frames after a turn (so it holds on while turns keep coming). */
export const GRIP_LINGER_FRAMES = NOTE_FRAMES;
/**
 * AUTHORED: poses blend linearly over 6 frames, except the move TO the knob, which takes 2 (the hand must be on the
 * knob while a 3-frame turn happens: at 20:00 it comes straight from the chalk tick).
 */
export const POSE_BLEND_FRAMES = 6, GRIP_REACH_FRAMES = 2;
export const POSES = ['rest', 'crank', 'tap', 'chalk', 'grip', 'card', 'lid'];

// ---- section 4: the room ----------------------------------------------------------------------------------------

/** Shadow blur radius = 1 + 5 H / ln 32. */
export const shadowRadius = (h) => 1 + 5 * h;
/** Dust opacity = 0.25 + 0.75 H / ln 32. Drift = each mote's velocity x running sum of H / ln 32 (in seconds). */
export const dustOpacity = (h) => 0.25 + 0.75 * h;
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

// ---- section 7: the maker's lines (v1.1) ------------------------------------------------------------------------
//
// FORMAT lines start at their frame. A data line is spoken at the first note where its rule holds AND the voice is
// free AND it would finish before the next FORMAT line is due. Until then it waits; on a note where its rule does
// not hold it is not spoken (the maker only says what is true when it is said). Each data line is spoken at most
// once, except "Yes.". Numbers are read at the note the line is spoken on. "Goodnight." cuts anything still playing,
// and nothing is said after it (the last word is "Goodnight.").

export const SUBTITLE_EXTRA_S = 0.5;                    // the subtitle stays for the line's length plus half a second
/** (v1.1) No subtitle runs past the programme's last frame (frame 2160 on is the encoder's black). */
export const SUBTITLE_LAST_END = PROGRAMME_FRAMES;
export const WORDS_PER_MINUTE = 130, LINE_PAD_S = 0.3;  // estimate when no recorded length is given
export const YES_GAP_NOTES = 24, YES_P = 0.95;
export const L1_FRAME = 30, L2_FRAME = DIAL_TAP_FRAMES[0], L6A_FRAME = CHALK_FRAME + CHALK_FRAMES, GN_FRAME = 2135;

/**
 * A line's length in seconds: the recorded length of that exact text when there is one; else the recorded length
 * given for its id (make/cues.mjs and loadEngine give the mean of the id's recorded variants, a better guess for
 * "N in a hundred" with a new N); else its word count at 130 words a minute plus 0.3 s.
 */
export function lineSeconds(id, text, voiceDurations) {
  const d = voiceDurations && (voiceDurations[text] ?? voiceDurations[id]);
  if (isNum(d) && d > 0) return d;
  const words = text.trim().split(/\s+/).length;
  return (words * 60) / WORDS_PER_MINUTE + LINE_PAD_S;
}
/** True if a recorded length exists for exactly this text. */
export const lineRecorded = (text, voiceDurations) => !!voiceDurations && isNum(voiceDurations[text]);

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

/**
 * The lines, in table order (bible section 7).
 *   format: true   starts at `frame`, in every ending
 *   afterLine      starts on the first note after that line has finished, ahead of everything else
 *   holds(g, c)    a data line's rule at note g: true or false, from the context `c` that signals.js builds from the
 *                  log (per-note arrays and constants), never from the ending's name
 *   text(g, c)     the words, with numbers read at the note the line is spoken on
 *   reads          the log fields the rule reads (for the x-ray)
 */
export const LINES = [
  { id: 'L1', format: true, frame: L1_FRAME, rule: 'FORMAT, frame 30', reads: [],
    text: () => "Good evening. It hasn't heard a tune yet, so it plays every note at once." },
  { id: 'L2', format: true, frame: L2_FRAME, rule: 'FORMAT, the 05:00 tap (frame 360)', reads: [],
    text: () => "That's how big a step it takes after a mistake. Not too big." },
  { id: 'L3', rule: '95% of the bet is in the key of D (massInKey >= 0.95)', reads: ['p'],
    holds: (g, c) => c.massInKey[g] >= 0.95, text: () => "It's found the key. Nobody told it one." },
  { id: 'L4', rule: 'half the next notes right on unseen tunes (heldAcc >= 0.5)', reads: ['heldAcc'],
    holds: (g, c) => c.share[g] >= 0.5, text: () => 'Every second note right. On tunes it\'s never heard.' },
  { id: 'YES', repeat: true, rule: 'p(pick) >= 0.95, at least 24 notes after the last "Yes.", nothing else playing',
    reads: ['ptok'], holds: (g, c) => c.ptok[g] >= YES_P, text: () => 'Yes.' },
  { id: 'L5', rule: 'ratio now >= 0.25 (step size against the hatching\'s edge)', reads: ['lr', 'sharp'],
    holds: (g, c) => c.ratioNow[g] !== null && c.ratioNow[g] >= 0.25,
    text: () => "A quarter of the way to the edge now. Nobody's touched it." },
  { id: 'L6a', format: true, frame: L6A_FRAME, rule: 'FORMAT, frame 1445, right after the chalk', reads: [],
    text: () => "That's as big a step as it can take." },
  { id: 'L6b', afterLine: 'L6a', rule: 'right after L6a; chosen by the step size at note 288 against the limit at 20:00',
    reads: ['lr', 'measured20.limit'],
    text: (g, c) => {
      const lr = c.lr[c.breakNote], before = c.lr[c.breakNote - 1], n = lr / c.limit20;
      if (lr === before) return "We'll leave it where it is.";
      if (Math.abs(n - 1) <= 1e-9) return "So that's where we'll put it.";
      return `We'll give it ${numberWords(n)} times that.`;
    } },
  // (v1.2) L7 is a reassurance, so somebody has to be there: the hands are on the bench, by the hands' own rule
  { id: 'L7', rule: 'after 20:00, the share is 0.05 or more under its 20:00 value but still at least half of it, and the hands are on the bench',
    reads: ['heldAcc', 'held'],
    holds: (g, c) => g > c.breakNote && c.share[g] <= c.share[c.breakNote] - 0.05 && c.share[g] >= c.share[c.breakNote] / 2
      && c.handsIn[g],
    text: (g, c) => `${capital(intWords(shareDrum(c.share[g])))} in a hundred. It'll find it again.` },
  { id: 'L8', rule: 'after 20:00, the hatching still exists and its edge is at 1.8 times the chalk mark or more',
    reads: ['sharp', 'measured20.limit'],
    holds: (g, c) => g > c.breakNote && c.limitNow[g] !== null && c.limitNow[g] >= 1.8 * c.limit20,
    text: () => "It's made itself room." },
  { id: 'L9', rule: 'after 20:00, the share is under half its 20:00 value', reads: ['heldAcc'],
    holds: (g, c) => g > c.breakNote && c.share[g] < c.share[c.breakNote] / 2,
    text: (g, c) => `${capital(intWords(shareDrum(c.share[g])))} in a hundred.` },
  { id: 'L10', rule: 'the hands have come back (and are on the bench)', reads: ['held'],
    holds: (g, c) => c.handsReturned[g], text: () => 'There you are.' },
  { id: 'GN', format: true, frame: GN_FRAME, rule: 'FORMAT, frame 2135; cuts anything still playing; the last word',
    reads: [], text: () => 'Goodnight.' },
];
/**
 * AUTHORED (the bible does not say): when several data lines could be spoken on the same note, the one about an
 * event goes first ("There you are." belongs to the hands coming back), then table order; "Yes." only when no
 * other line is spoken on that note.
 */
export const SPEAK_ORDER = ['L10', 'L3', 'L4', 'L5', 'L7', 'L8', 'L9'];
