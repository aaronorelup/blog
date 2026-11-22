// THE QUIET HOUR: the engine. Turns (ending, frame) into every number the picture and the sound need.
//
//   const engine = await loadEngine('main', baseUrl);   // browser: fetches data/shared.json + data/ending-main.json
//   const engine = createEngine(shared, endingData, { voiceDurations });   // pure; also runs in Node
//   engine.signals(frame)   // frame 0..2159: one plain object, the same keys on every frame (documented below)
//   engine.gauges(frame)    // the x-ray: [{ id, name, reads, rule, value }], one entry per gauge the viewer can see
//   engine.note(g)          // the full log row of note g (0..431), non-numbers kept as NaN / Infinity
//   engine.meta             // the token table, ln 32, the limit measured at 20:00, best error to 20:00, counts
//   engine.cues             // the spoken lines [{ id, text, note, frame, seconds, ... }]
//   engine.lineReport       // every line of the bible's table: where it was spoken, or why it was not
//   engine.events           // everything that happens, with its note, frame and the log values that caused it
//   engine.perNote          // per-note arrays (for the sound and the x-ray)
//   engine.subtitleAt(f)    // the subtitle at a frame (none from frame 2160 on: that is the encoder's black)
//
// Every rule of the bible (v1.1) lives in ./rules.js and is applied here once. Everything smoothed or accumulated
// (hand presence, pose blends, the knob, the hum, the dust's drift, medians and means over the last few notes, the
// line schedule) is computed for every note and frame when the engine is created, by walking forward from the
// start; signals(frame) only looks things up. So frames can be asked for in any order, and the same frame always
// gives the same object. Nothing here reads the ending's name, a clock, a timer or Math.random. Nothing before frame
// 1440 reads a note after 287, so frames 0..1439 are the same in all four endings.
//
// ------------------------------------------------------------------------------------------------------------------
// THE SIGNALS OBJECT (engine.signals(frame)). Units in [brackets]. Bible rule in (parentheses); (v1.1) marks a rule
// changed in bible v1.1. Every value is a finite number, a boolean, a string, an array, a plain object of these, or
// null. Never NaN.
//
// time and grid (bible 2)
//   frame          [int 0..2159]   programme frame
//   note           [int 0..431]    floor(frame / 5)
//   noteFrame      [int 0..4]      frame - 5 note
//   phase          [0..0.8]        noteFrame / 5: how far the strip has scrolled through this note
//   bar            [int 0..71]     floor(frame / 30);  barFrame [int 0..29];  barPhase [0..1) = barFrame / 30
//   isNoteStart, isBarLine [bool]  first frame of a note / of a bar (punch tick / clock tick and crank creak)
//   clockSeconds   [int s]         floor(frame * 5 / 6) programme seconds (the clock bug: exact on every frame)
//   clock          ['MM:SS']       the clock bug's text
//   filmSeconds    [s]             frame / 24
//
// the log row of this note (bible 1, rule 3: every number on screen is read from here)
//   row            {object}        the note's log row; any value that is not a number is null here and named in
//                                  rowNonFinite (engine.note(g) keeps NaN for the x-ray). Fields: g, logClock, step,
//                                  lr, tok, tokName, ptok, entropy, zsd, held, heldAcc, train, wnorm, sharp,
//                                  sharpIters, ratio, stepsAfter, massInKey, massOutKey, massHold, massRest,
//                                  lrOverLimit20, pickInKey, midiSounded, pluckVel, pExactOne, pNaN
//   rowNonFinite   [string[]]      e.g. ['held:NaN']; empty in this data
//   p              [32 x 0..1 | null] the bet (rows 0..29 pitches low to high, 30 HOLD, 31 REST); null if it is
//                                  not a number (then: no haze, no hole)
//   pick           [int -1..31]    the token picked (-1 = none);  pickName ['D5' | 'HOLD' | 'REST' | 'NONE']
//   pickKind       ['pitch' | 'hold' | 'rest' | 'none']
//   pickP          [0..1 | null]   p(pick)
//   pickInKey      [bool | null]   the pick is a D-major pitch (null for HOLD / REST)
//   pluck          [bool]          a pitch is plucked on this note (HOLD and REST pluck nothing)
//   pluckVel       [0.25..1 | null] 0.25 + 0.75 p(pick), the synth's velocity (tea rings, punch tick level)
//   entropy        [nats 0..ln 32 | null]  H of the bet;   entropyN [0..1] = H / ln 32 (non-number: 0)
//   err            [nats | null]   error on unseen tunes (log: held);  share [0..1 | null] share right on unseen
//                                  tunes (log: heldAcc);  train [nats | null] error on the tunes it learns from
//   worse          [bool]          (v1.1) err > ln 32 + 1e-9: worse than guessing on this note
//   err6           [nats | null]   (v1.1) mean error of the last 6 notes (the colour reads this)
//   bestErrSoFar   [nats | null]   (v1.1) the lowest error at this note or any earlier one (the tears read this)
//
// the strip and stylus (bible 3)
//   meanRow        [rows 0..31 | null]  the bet's mean row (p-weighted token index)
//   spread         [rows | null]        the bet's standard deviation in rows
//   stylusRow      [rows -0.5..31.5]    the stylus height: glides from the last note's mean row to this one's over
//                                       3 frames, plus the wander (AUTHORED glide; rows map to y with layout rowY)
//   stylusWander   [rows]               (spread) x (H / ln 32) x smooth seeded noise; 0 when H is 0: dead still
//   punch          [0..1]               the punch stroke: 1 on the note's first frame, then 0.5, 0.15, 0, 0
//   stripColumns   [{ g, x, tok, kind, inKey, holeR, p, haze, bar }]  the strip's visible history, oldest first,
//                                       the last 64 notes. x [columns]: 0 = under the punch at the note's start,
//                                       older columns to the left (negative), scrolling smoothly: x = (g - note) -
//                                       phase. holeR [fraction of R | null]: 0.25 + 0.75 p(pick), null if no bet.
//                                       kind: pitch = round hole, hold = short slot, rest = pencil dot.
//                                       haze [32 x alpha | null]: 0.85 sqrt(p). bar: a bar line before this column
//
// the STEP dial, knob, chalk (bible 3)
//   lr             [step size]          the log's step size for this note
//   stepChanged    [bool]               the step size differs from the previous note's (hum off on this note)
//   needle         [step size]          where the needle stands now: the step size, moved by knob turns.
//                                       (v1.1) a turn takes the first 3 frames of a note whose step size changed;
//                                       at 20:00 it takes frames 1442..1444, after the chalk tick, so at frame 1440
//                                       the needle still shows the old step and at 1444 it stands on the new one
//   needleU        [0..1]               needle position on the log dial 0.03..30 (clamped)
//   needleOffScale [bool]               the step size is outside 0.03..30
//   knobAngle      [rad]                2 turns over the dial's scale x needleU (AUTHORED)
//   knobTurning    [bool]               a turn is in progress
//   knobClick      [bool]               a turn starts on this frame (the ratchet click; sound sync)
//   sharp          [| null]             this note's sharpness reading (log)
//   sharpMedian3   [| null]             (v1.1) the median of the last 3 readings: what the dial trusts
//   limit          [step size | null]   (v1.1) the limit measured right now: 2 / sharpMedian3; null when the
//                                       hatching is gone
//   hatchU         [0..1 | null]        where the hatched TOO FAR zone starts (clamped; 1 = above the scale, so
//                                       nothing hatched); null = the hatching is gone
//   hatchGone      [bool]               (v1.1) no hatching: the median is not positive, or the hatching has gone
//                                       for good (the first reading after 20:00 that is zero, negative or not a
//                                       number removes it for the rest of the programme)
//   hatchGoneSince [note | null]        (v1.1) the note that removed the hatching for good, once it has
//   ratio          [| null]             the log's own ratio for this note: step size x this reading / 2 (x-ray)
//   ratioNow       [| null]             (v1.1) step size x sharpMedian3 / 2 = needle against the hatching's edge;
//                                       null when the hatching is gone. Hairlines and L5 read this
//   lrOverLimit20  [| null]             step size / the limit measured at 20:00 (x-ray)
//   limit20        [step size]          the limit measured at 20:00 (the chalk mark)
//   chalk          [0..1]               the chalked number's draw-on: 0 before frame 1440, 0.2 .. 1 over 1440..1444
//   chalkNumber    [0..1]               (v1.1) the same value under its own name
//   chalkTick      [0..1]               (v1.1) the chalk tick's draw-on: 0.5 at frame 1440, 1 from 1441
//   chalkU         [0..1]               the chalk mark's place on the dial
//   chalkText      ['0.98']             the chalked number: the limit at 20:00 to 2 decimals
//
// counters, crank (bible 3)
//   flagsUp        [int 0..10]          NEW TUNES flags up: round(10 x share at this bar's first note)
//   flagsPrevUp    [int 0..10]          the previous bar's count;  flagsT [0..1] flip progress over the bar's first 6
//                                       frames (AUTHORED)
//   shareDrum      [int 0..99]          round(100 x share), per note;  shareDrumText ['56']
//   steps          [int]                LESSONS: steps so far (log: step);  stepsText ['005938']
//   cardsThisNote  [int]                steps run after this note (log: stepsAfter; cards riffling in)
//   crankAngle     [rad 0..2pi)         one turn per bar, always: 2 pi barFrame / 30
//
// picture warmth and glitches (bible 3)
//   warmthK        [0..1]               (v1.1) k = clamp((ln 32 - err6) / (ln 32 - best err to 20:00), 0, 1)
//   warmth         [0.15..1]            saturation and warmth of the whole picture = 0.15 + 0.85 k
//   hairline       [{ y, shiftPx } | null]  (v1.1) on a note where ratioNow is above 1 (the needle is inside the
//                                       hatching), never once the hatching is gone: y [0..1 of the strip's
//                                       height], shiftPx [+-1..3 programme px], seeded by the note
//   tear           [0..1]               (v1.1) g = clamp(ln(err / bestErrSoFar) / ln 250, 0, 1)
//   tearBands      [{ y0, y1, dxPx }]   floor(8 g) bands: y0, y1 [0..1 of the picture's height], dxPx [px, |dxPx|
//                                       <= 24 g], reseeded per note. Displacement only, brightness unchanged
//   blocks         [bool]               err above 10 x ln 32
//   blockShare     [0..0.5]             the share of tiles blocked: 0.5 g (AUTHORED)
//   blockTiles     [int[]]              chosen tiles of a 16 x 12 grid over the picture (index = row * 16 + col),
//                                       each mosaicked at 8 px; empty unless blocks
//
// the maker's hands (bible 3 hands rules)
//   handsIn        [bool]               the rule's state: present, or gone (rule 1)
//   handsPresent   [0..1]               eased presence: slides out over 30 frames from the first worse note, back
//                                       over 20 frames on the 6th note in a row at or below ln 32 (smoothstep)
//   hands          { present [0..1] (= handsPresent),
//                    left:  { rest, crank, tap, chalk, grip, card, lid } [weights, sum 1]. (v1.1) chalk from
//                           frame 1410 to 1441 (the tick); if the step size changed at note 288 the hand is on
//                           the knob (grip) for the turn at 1442..1444. Poses blend over 6 frames, 2 to the knob
//                    right: { rest, crank, tap, chalk, grip, card, lid } [right: crank 1 always] (rule 2)
//                    fingerLift [0..1]  tap-along: the index finger's lift on notes with p(pick) >= 0.6 (rule 6)
//                    fingerTap [bool]   the tap-along finger touches the bench this frame
//                    dialTap [0..1]     the five-minute tap's press against the dial glass (rule 5)
//                    dialTapContact [bool] a tap lands this frame (sound)
//                    gripping [bool]    the left hand's target pose is the knob (rules 3, 4) }
//   titleSlide     [0..1]               the title card's slide off the bench (frames 90..119, FORMAT); 0 = on it
//   titleVisible   [bool]               titleSlide < 1
//   lidClosed      [0..1]               the lid over the last bar if the hands are in at its start (rule 7)
//
// the room (bible 4)
//   windowLit      [bool]               (v1.1) the neighbour's window: the same switch as the hands (dark from the
//                                       first note worse than guessing, lit again after 6 notes in a row at or
//                                       below ln 32). Always equal to handsIn
//   humGate        [bool]               the house hum is allowed on this note (off on a step change, back after 6
//                                       still notes);   humLevel [0..1] its level, 0 at once, back over 48 frames
//   shadowRadius   [px 1..6]            1 + 5 H / ln 32
//   dustDrift      [s]                  running sum of H / ln 32 over the frames before this one, / 24. A mote's
//                                       offset = its own velocity x dustDrift
//   dustOpacity    [0.25..1]            0.25 + 0.75 H / ln 32
//   teaRings       [{ note, age, size }] plucks of the last 36 frames, newest first: age [frames since the pluck],
//                                       size [velocity squared]
//   spoonChatter   [bool]               mean pluck velocity of the last 6 notes >= 0.95 (no pluck counts 0)
//   wallMinutes    [min]                23:30 plus the programme clock, in minutes after midnight of the day before
//   wallClock      ['HH:MM']            '23:50' at the turn, '23:59' on the last frame
//   minuteAngle, hourAngle [rad]        clockwise from 12
//
// the maker's voice (bible 7, v1.1)
//   subtitle       [string | null]      the line showing now (from its start for its length + 0.5 s; a newer line
//                                       replaces it; never past frame 2159)
//   subtitleId     [string | null]      its id;  subtitleStart [frame | null]  when it started
//   speaking       [string | null]      the id of the line whose voice is sounding now
// ------------------------------------------------------------------------------------------------------------------

import { FPS, NOTE_FRAMES, BAR_FRAMES, NOTES, BREAK_NOTE, PROGRAMME_FRAMES, TOTAL_FRAMES, NOTES_PER_BAR,
  clockSeconds, clockText, noteAt } from './time.js';
import { hash01, hashSigned, noise1 } from './rng.js';
import * as R from './rules.js';

/** The random seeds (AUTHORED; bible 9). */
export const SEEDS = Object.freeze({ stylus: 101, hairline: 211, tear: 307, blocks: 401 });
export const STRIP_HISTORY = 64;
/** Every frame something FORMAT (keyed to the clock, bible 9) starts on. */
export const FORMAT_FRAMES = Object.freeze([0, R.L1_FRAME, R.CARD_SLIDE[0], ...R.DIAL_TAP_FRAMES, R.CHALK_PICKUP_FRAME,
  R.CHALK_FRAME, R.L6A_FRAME, R.LID_BAR_FRAME, R.GN_FRAME, PROGRAMME_FRAMES].sort((a, b) => a - b));

const DATA_FORMAT = 'quiet-hour-notes/1';
const PUNCH_CURVE = [1, 0.5, 0.15, 0, 0];               // AUTHORED
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const fin = (x) => (isNum(x) ? x : null);
const lerp = (a, b, t) => a + (b - a) * t;
const pad = (n, w) => String(n).padStart(w, '0');

const fetched = new Map();
function fetchJson(url) {
  const key = String(url);
  if (!fetched.has(key)) {
    fetched.set(key, fetch(key).then((r) => {
      if (!r.ok) throw new Error(`${key}: HTTP ${r.status}`);
      return r.json();
    }));
  }
  return fetched.get(key);
}

/**
 * Browser: fetch data/shared.json, data/ending-<ending>.json and data/voice.json (the frozen voice's line lengths, so
 * the subtitles and the line schedule match the soundtrack) relative to baseUrl (default: this film's folder).
 * opts.voiceDurations, if given, replaces the recorded lengths.
 */
export async function loadEngine(ending, baseUrl, opts = {}) {
  if (!/^[a-z0-9]+$/.test(ending)) throw new Error(`bad ending name ${ending}`);
  const base = new URL('data/', baseUrl ?? new URL('../', import.meta.url));
  const [shared, endingData, voice] = await Promise.all([fetchJson(new URL('shared.json', base)),
    fetchJson(new URL(`ending-${ending}.json`, base)),
    opts.voiceDurations ? null : fetchJson(new URL('voice.json', base)).catch(() => null)]);
  return createEngine(shared, endingData, { ...opts, voiceDurations: opts.voiceDurations ?? voiceLengths(voice) });
}

/**
 * Recorded line lengths from data/voice.json ({ lines: [{ id, text, seconds }] }) as { text: seconds }, plus, under
 * each line id, the mean length of that id's recordings (the estimate for a variant not recorded yet, such as
 * "N in a hundred" with a new N). Undefined if there is no voice file.
 */
export function voiceLengths(voice) {
  if (!voice || !Array.isArray(voice.lines)) return undefined;
  const out = {}, byId = {};
  for (const l of voice.lines) {
    if (!l.text || !(l.seconds > 0)) continue;
    out[l.text] = l.seconds;
    if (l.id) (byId[l.id] ||= []).push(l.seconds);
  }
  for (const [id, v] of Object.entries(byId)) if (!(id in out)) out[id] = v.reduce((a, b) => a + b, 0) / v.length;
  return out;
}

const decode = (v) => (v === 'NaN' ? NaN : v === 'Infinity' ? Infinity : v === '-Infinity' ? -Infinity : v);

function decodePart(part, g0, count, label) {
  if (!part || part.format !== DATA_FORMAT) throw new Error(`${label}: not ${DATA_FORMAT} data`);
  if (part.g0 !== g0 || part.count !== count) throw new Error(`${label}: expected notes ${g0}..${g0 + count - 1}`);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const r = { g: g0 + i };
    for (const k of part.columns) r[k] = decode(part.cols[k][i]);
    r.p = part.p[i].map(decode);
    rows.push(r);
  }
  return rows;
}

/**
 * Build the engine from the packed data. Pure: the same inputs give the same engine, in Node and in a browser.
 * @param {object} shared      data/shared.json (notes 0..287)
 * @param {object} endingData  data/ending-<name>.json (notes 288..431)
 * @param {{ voiceDurations?: Record<string, number>, name?: string }} [opts]  voiceDurations: recorded line lengths
 *        in seconds, keyed by line text (and, as a fallback, by line id); name: a label for meta only (no rule
 *        reads it)
 */
export function createEngine(shared, endingData, opts = {}) {
  const M = shared.meta;
  const P = M.P, HOLD = M.HOLD, REST = M.REST;
  const tokens = M.tokens.map((t) => Object.freeze({ ...t,
    kind: t.tok < P ? 'pitch' : t.tok === HOLD ? 'hold' : t.tok === REST ? 'rest' : 'none' }));
  const rows = [...decodePart(shared, 0, BREAK_NOTE, 'shared'), ...decodePart(endingData, BREAK_NOTE, NOTES - BREAK_NOTE,
    'ending')];
  const limit20 = decode(endingData.measured20.limit);
  if (!isNum(limit20) || !(limit20 > 0)) throw new Error('the limit measured at 20:00 is not a positive number');

  // ---- per-note values ----------------------------------------------------------------------------------------
  const N = NOTES;
  const col = (k) => rows.map((r) => r[k]);
  const lr = col('lr'), tok = col('tok'), ptok = col('ptok'), err = col('held'), share = col('heldAcc');
  const sharp = col('sharp'), ratio = col('ratio'), entropy = col('entropy'), massInKey = col('massInKey');
  const step = col('step'), stepsAfter = col('stepsAfter');
  const betOk = rows.map((r) => r.p.every(isNum));
  const kind = tok.map((t) => (t >= 0 && t < tokens.length ? tokens[t].kind : 'none'));
  const inKey = tok.map((t, g) => (kind[g] === 'pitch' ? tokens[t].inKey : null));
  const vel = tok.map((t, g) => R.pluckVelocity(t, ptok[g], P));
  const hN = entropy.map(R.entropyShare);
  const moments = rows.map((r, g) => (betOk[g] ? R.betMoments(r.p) : null));
  const worse = err.map(R.worseThanGuessing);
  const stepChanged = lr.map((v, g) => g > 0 && v !== lr[g - 1]);
  const lastStepChange = new Array(N);                    // the last note at or before g whose step size changed
  for (let g = 0, last = null; g < N; g++) { if (stepChanged[g]) last = g; lastStepChange[g] = last; }

  // constants of the film read from the log: error and share at 20:00, best error up to and including 20:00
  const err20 = err[BREAK_NOTE], share20 = share[BREAK_NOTE];
  let best20 = Infinity, best20Note = -1;
  for (let g = 0; g <= BREAK_NOTE; g++) if (isNum(err[g]) && err[g] < best20) { best20 = err[g]; best20Note = g; }

  // (v1.1) the dial: the median of the last 3 sharpness readings, the latch, ratio now
  const sharpMed = new Array(N), limitNow = new Array(N), ratioNow = new Array(N);
  let hatchLostAt = null;
  for (let g = 0; g < N; g++) {
    sharpMed[g] = R.sharpnessMedian(sharp.slice(Math.max(0, g - R.SHARP_MEDIAN_NOTES + 1), g + 1));
    if (hatchLostAt === null && g > BREAK_NOTE && R.edgeLost(sharp[g])) hatchLostAt = g;
    limitNow[g] = hatchLostAt !== null ? null : R.limitFromSharpness(sharpMed[g]);
    ratioNow[g] = limitNow[g] === null ? null : (lr[g] * sharpMed[g]) / 2;
  }

  // (v1.1) the colour reads the mean error of the last 6 notes; the tears read the best error so far
  const err6 = new Array(N), bestSoFar = new Array(N);
  for (let g = 0, best = Infinity; g < N; g++) {
    const w = err.slice(Math.max(0, g - R.WARMTH_NOTES + 1), g + 1);
    err6[g] = w.every(isNum) ? w.reduce((a, b) => a + b, 0) / w.length : NaN;
    if (isNum(err[g]) && err[g] < best) best = err[g];
    bestSoFar[g] = best;
  }
  const warmK = err6.map((e) => R.warmthK(e, best20));
  const tearG = err.map((e, g) => R.tearAmount(e, bestSoFar[g]));
  const blocksOn = err.map(R.blocksOn);
  const barStart = (g) => g - (g % NOTES_PER_BAR);
  const flags = share.map((_, g) => R.flagsUp(share[barStart(g)]));
  const drum = share.map(R.shareDrum);

  // hands rule 1: present or gone, decided note by note from the log. (v1.1) the window uses the same switch
  const handsIn = new Array(N), handsOutAt = new Array(N).fill(false), handsBackAt = new Array(N).fill(false);
  const handsOutSince = new Array(N).fill(null);          // while gone: the note they left on
  const handsReturned = new Array(N).fill(false);         // present now, after having been away
  {
    let state = true, good = 0, outNote = null, returned = false;
    for (let g = 0; g < N; g++) {
      if (state) {
        if (worse[g]) { state = false; good = 0; handsOutAt[g] = true; outNote = g; returned = false; }
      } else {
        good = worse[g] ? 0 : good + 1;
        if (good >= R.HANDS_BACK_NOTES) { state = true; handsBackAt[g] = true; outNote = null; returned = true; }
      }
      handsIn[g] = state;
      handsOutSince[g] = outNote;
      handsReturned[g] = returned;
    }
  }
  const windowLit = handsIn.slice();

  // the hum: off on any note where the step size changed, allowed again after 6 still notes
  const humGate = new Array(N);
  {
    let last = -Infinity;
    for (let g = 0; g < N; g++) {
      if (stepChanged[g]) last = g;
      humGate[g] = !stepChanged[g] && g - last > R.HUM_STILL_NOTES;
    }
  }

  // the spoon: mean pluck velocity of the last 6 notes (this one included; no pluck counts as 0)
  const meanVel6 = new Array(N), spoon = new Array(N);
  for (let g = 0; g < N; g++) {
    let s = 0;
    for (let j = g - R.SPOON_NOTES + 1; j <= g; j++) if (j >= 0 && vel[j] !== null) s += vel[j];
    meanVel6[g] = s / R.SPOON_NOTES;
    spoon[g] = R.spoonChatter(meanVel6[g]);
  }

  // glitches, seeded per note
  const hairline = ratioNow.map((x, g) => (limitNow[g] !== null && R.hairlineOn(x) ? Object.freeze({
    y: 0.04 + 0.92 * hash01(SEEDS.hairline, g, 0),
    shiftPx: (R.HAIRLINE_PX[0] + Math.floor(hash01(SEEDS.hairline, g, 1) * (R.HAIRLINE_PX[1] - R.HAIRLINE_PX[0] + 1)))
      * (hash01(SEEDS.hairline, g, 2) < 0.5 ? -1 : 1),
  }) : null));
  const tearBands = tearG.map((tg, g) => {
    const n = R.tearBandCount(tg), out = [];
    for (let i = 0; i < n; i++) {
      const h = lerp(R.TEAR_BAND_H[0], R.TEAR_BAND_H[1], hash01(SEEDS.tear, g, i, 1));
      const y0 = hash01(SEEDS.tear, g, i, 0) * (1 - h);
      out.push(Object.freeze({ y0, y1: y0 + h, dxPx: Math.round(hashSigned(SEEDS.tear, g, i, 2) * R.tearMaxPx(tg)) }));
    }
    return Object.freeze(out);
  });
  const nTiles = R.BLOCK_GRID[0] * R.BLOCK_GRID[1];
  const blockTiles = tearG.map((tg, g) => {
    if (!blocksOn[g]) return Object.freeze([]);
    const share_ = R.blockShare(tg), out = [];
    for (let i = 0; i < nTiles; i++) if (hash01(SEEDS.blocks, g, i) < share_) out.push(i);
    return Object.freeze(out);
  });

  // the log rows as the x-ray shows them (engine.note) and as signals carry them (non-numbers as null)
  const tokName = (t) => (t >= 0 && t < tokens.length ? tokens[t].name : 'NONE');
  const logClock = (g) => { const s = Math.round((g / N) * 1800); return `${pad(Math.floor(s / 60), 2)}:${pad(s % 60, 2)}`; };
  const fullRows = rows.map((r, g) => Object.freeze({
    g, logClock: logClock(g), step: r.step, lr: r.lr, tok: r.tok, tokName: tokName(r.tok), ptok: r.ptok,
    p: Object.freeze(r.p.slice()), entropy: r.entropy, zsd: r.zsd, held: r.held, heldAcc: r.heldAcc, train: r.train,
    wnorm: r.wnorm, sharp: r.sharp, sharpIters: r.sharpIters, ratio: r.ratio, stepsAfter: r.stepsAfter,
    massInKey: r.massInKey, massOutKey: r.massOutKey, massHold: r.massHold, massRest: r.massRest,
    lrOverLimit20: r.lr / limit20, pickInKey: inKey[g], midiSounded: kind[g] === 'pitch' ? tokens[r.tok].midiSounded : null,
    pluckVel: vel[g], pExactOne: r.p.indexOf(1), pNaN: !betOk[g],
  }));
  const rowNonFinite = fullRows.map((r) => Object.freeze(Object.entries(r)
    .filter(([, v]) => typeof v === 'number' && !Number.isFinite(v)).map(([k, v]) => `${k}:${v}`)));
  const safeRows = fullRows.map((r) => {
    const o = {};
    for (const [k, v] of Object.entries(r)) if (k !== 'p') o[k] = typeof v === 'number' ? fin(v) : v;
    return Object.freeze(o);
  });
  const bets = rows.map((r, g) => (betOk[g] ? Object.freeze(r.p.slice()) : null));
  const columns = rows.map((r, g) => Object.freeze({
    g, tok: r.tok, kind: kind[g], inKey: inKey[g], holeR: betOk[g] && kind[g] !== 'none' ? R.holeRadius(ptok[g]) : null,
    p: bets[g], haze: betOk[g] ? Object.freeze(r.p.map(R.hazeAlpha)) : null, bar: g % NOTES_PER_BAR === 0,
  }));

  // ---- per-frame values (walked forward from frame 0) -------------------------------------------------------------
  const F = PROGRAMME_FRAMES;

  // hands rule 1: eased presence
  const presence = new Float64Array(F);
  {
    // whole-number steps so the ramps land exactly on 0 and 1: out over 30 frames, back over 20
    const FULL = R.HANDS_OUT_FRAMES * R.HANDS_BACK_FRAMES, OUT = R.HANDS_BACK_FRAMES, BACK = R.HANDS_OUT_FRAMES;
    let raw = handsIn[0] ? FULL : 0;
    for (let f = 0; f < F; f++) {
      const target = handsIn[noteAt(f)] ? FULL : 0;
      if (target > raw) raw = Math.min(FULL, raw + BACK);
      else if (target < raw) raw = Math.max(0, raw - OUT);
      presence[f] = R.smoothstep(raw / FULL);
    }
  }

  // (v1.1) the knob and needle: on a note whose step size changed, a 3-frame turn from the note's first frame, or
  // from the first frame after the chalk tick (20:00: frames 1442..1444)
  const needleVal = new Float64Array(F);
  const turning = new Array(F).fill(false), click = new Array(F).fill(false);
  const turns = [];
  {
    let curLn = Math.log(lr[0]), curLr = lr[0], turn = null;
    for (let f = 0; f < F; f++) {
      const g = noteAt(f);
      if (turn && f > turn.end) { curLn = turn.toLn; curLr = turn.to; turn = null; }
      const target = isNum(lr[g]) && lr[g] > 0 ? lr[g] : curLr;   // a step size that is not a number: the knob stays
      if (!turn && target !== curLr && !R.chalkTickBusy(f)) {
        const n = R.KNOB_TURN_FRAMES;
        turn = { start: f, end: f + n - 1, frames: n, from: curLr, to: target, fromLn: curLn, toLn: Math.log(target), note: g };
        turns.push(turn);
        click[f] = true;
      }
      if (turn) {
        const s = R.smoothstep((f - turn.start + 1) / turn.frames);
        needleVal[f] = f === turn.end ? turn.to : Math.exp(lerp(turn.fromLn, turn.toLn, s));
        turning[f] = true;
      } else needleVal[f] = curLr;
    }
  }

  // hands rules 3 to 7: the left hand's pose, the taps, the lid
  const gripT = new Array(F).fill(false);
  {
    let lastTurnEnd = -Infinity;
    for (let f = 0; f < F; f++) {
      if (turning[f]) lastTurnEnd = f;
      gripT[f] = handsIn[noteAt(f)] && (turning[f] || f - lastTurnEnd <= R.GRIP_LINGER_FRAMES);
    }
  }
  const taps = R.DIAL_TAP_FRAMES.map((F0) => {
    const at = F0 + R.DIAL_TAP_WINDOW[0];                     // decided when the reach would begin
    const present = handsIn[noteAt(at)], gripping = gripT[at];
    return { frame: F0, decidedAt: at, performed: present && !gripping,
      reason: !present ? 'hands gone' : gripping ? 'left hand on the knob' : null,
      contacts: [F0, F0 + R.DIAL_TAP_GAP] };
  });
  const lidNote = noteAt(R.LID_BAR_FRAME);
  const lidCloses = handsIn[lidNote];
  const leftTarget = new Array(F);
  for (let f = 0; f < F; f++) {
    let t = 'rest';
    const inTap = taps.some((tp) => tp.performed && f >= tp.frame + R.DIAL_TAP_WINDOW[0] && f <= tp.frame + R.DIAL_TAP_WINDOW[1]);
    if (lidCloses && f >= R.LID_BAR_FRAME) t = 'lid';
    else if (f >= R.CARD_POSE[0] && f <= R.CARD_POSE[1]) t = 'card';
    else if (f >= R.CHALK_PICKUP_FRAME && f < R.CHALK_FRAME + R.CHALK_TICK_FRAMES) t = 'chalk';   // to the end of the tick
    else if (gripT[f]) t = 'grip';
    else if (inTap) t = 'tap';
    leftTarget[f] = t;
  }
  const leftW = new Array(F);
  {
    // weights in whole steps of 1 / POSE_BLEND_FRAMES, so a blend lands exactly on 0 and 1; a move to the knob
    // goes POSE_BLEND_FRAMES / GRIP_REACH_FRAMES steps a frame
    const B = R.POSE_BLEND_FRAMES, fast = B / R.GRIP_REACH_FRAMES;
    const w = Object.fromEntries(R.POSES.map((k) => [k, k === 'rest' ? B : 0]));
    for (let f = 0; f < F; f++) {
      const stepW = leftTarget[f] === 'grip' ? fast : 1;
      let sum = 0;
      for (const k of R.POSES) {
        const tgt = leftTarget[f] === k ? B : 0;
        w[k] += R.clamp(tgt - w[k], -stepW, stepW);
        sum += w[k];
      }
      leftW[f] = Object.freeze(Object.fromEntries(R.POSES.map((k) => [k, w[k] / sum])));
    }
  }
  const rightW = Object.freeze(Object.fromEntries(R.POSES.map((k) => [k, k === 'crank' ? 1 : 0])));
  const dialTap = new Float64Array(F), dialTapContact = new Array(F).fill(false);
  for (const tp of taps) {
    if (!tp.performed) continue;
    for (const c of tp.contacts) {
      dialTapContact[c] = true;
      R.DIAL_TAP_BUMP.forEach((v, i) => { const f = c + i - 2; if (f >= 0 && f < F) dialTap[f] = Math.max(dialTap[f], v); });
    }
  }

  // the hum's level, the dust's drift
  const humLevel = new Float64Array(F), dustDrift = new Float64Array(F);
  {
    let level = humGate[0] ? R.HUM_BACK_FRAMES : 0, drift = 0;     // in frames of the 2 s ramp
    for (let f = 0; f < F; f++) {
      const g = noteAt(f);
      level = humGate[g] ? Math.min(R.HUM_BACK_FRAMES, level + 1) : 0;
      humLevel[f] = level / R.HUM_BACK_FRAMES;
      dustDrift[f] = drift;
      drift += hN[g] / FPS;
    }
  }

  // ---- the maker's lines (bible 7) ------------------------------------------------------------------------------------
  const ctx = Object.freeze({ lr, ptok, share, massInKey, limitNow, ratioNow, limit20, breakNote: BREAK_NOTE, handsReturned });
  const { cues, report } = scheduleLines(ctx, opts.voiceDurations);
  const dropped = Object.freeze(report.filter((r) => !r.format && !r.after && !r.repeat && !r.spoken.length && r.heldNotes > 0)
    .map((r) => Object.freeze({ id: r.id, text: r.textAtFirstHeld, trigger: r.firstHeldNote, note: r.lastHeldNote,
      heldNotes: r.heldNotes, reason: r.reason, format: false, after: null })));
  const subtitleAt = (frame) => {
    let hit = null;
    for (const c of cues) if (frame >= c.frame && frame < c.subtitleEnd) hit = c;
    return hit;
  };
  const speakingAt = (frame) => {
    for (const c of cues) if (frame >= c.frame && frame < c.endFrame) return c;
    return null;
  };

  // ---- meta -------------------------------------------------------------------------------------------------------------
  const count = (arr, fn) => arr.reduce((n, x, i) => n + (fn(x, i) ? 1 : 0), 0);
  const meta = Object.freeze({
    ending: opts.name ?? endingData.ending,              // a label only: no rule reads it
    bible: 'v1.1',
    tokens: Object.freeze(tokens), P, HOLD, REST, ln32: R.LN32,
    limit20, chalkText: R.chalkText(limit20), err20, share20, best20, best20Note, hatchLostAt,
    run: Object.freeze({ push: endingData.push ?? null, climb: endingData.climb ?? null, rule: endingData.rule ?? null }),
    source: shared.source ?? null,
    seeds: SEEDS,
    counts: Object.freeze({
      notes: N, frames: F, pitchPicks: count(kind, (k) => k === 'pitch'), holds: count(kind, (k) => k === 'hold'),
      rests: count(kind, (k) => k === 'rest'), outOfKeyPicks: count(inKey, (x) => x === false),
      outOfKeyAfter20: count(inKey, (x, g) => x === false && g >= BREAK_NOTE),
      worseThanGuessing: count(worse, (x) => x), handsGoneNotes: count(handsIn, (x) => !x),
      stepChanges: count(stepChanged, (x) => x), knobTurns: turns.length,
      certainPicks: count(ptok, (x) => x === 1), hairlineNotes: count(hairline, (x) => x !== null),
      tearNotes: count(tearG, (x) => R.tearBandCount(x) > 0), blockNotes: count(blocksOn, (x) => x),
      hatchGoneNotes: count(limitNow, (x) => x === null), lines: cues.length, droppedLines: dropped.length,
    }),
  });

  const perNote = Object.freeze({
    pick: tok, pickKind: kind, pickP: ptok.map(fin), pickInKey: inKey,
    pickMidiSounded: tok.map((t, g) => (kind[g] === 'pitch' ? tokens[t].midiSounded : null)),
    velocity: vel, stepChanged, lr, humGate, handsIn, worse, windowLit, tear: tearG,
    blocks: blocksOn, spoonChatter: spoon, meanVel6, flagsUp: flags, shareDrum: drum, warmthK: warmK,
    entropyN: hN, err: err.map(fin), share: share.map(fin), limitNow, hairline: hairline.map((h) => h !== null),
    err6: err6.map(fin), bestErrSoFar: bestSoFar.map(fin), sharpMedian3: sharpMed.map(fin), ratioNow: ratioNow.map(fin),
  });

  const events = buildEvents({ N, F, rows, kind, inKey, ptok, err, share, sharp, sharpMed, ratioNow, lr, limitNow, worse,
    stepChanged, handsOutAt, handsBackAt, humGate, spoon, meanVel6, flags, tearG, bestSoFar, blocksOn, hairline, warmK, err6,
    turns, taps, gripT, leftTarget, lidCloses, lidNote, handsIn, cues, limit20, err20, share20, best20, entropy, hN,
    tokName, hatchLostAt, massInKey });

  // ---- signals(frame) ---------------------------------------------------------------------------------------------------
  const chalkU = R.clamp(R.dialU(limit20), 0, 1), chalkTxt = R.chalkText(limit20);

  function signals(frame) {
    if (!Number.isInteger(frame) || frame < 0 || frame >= F) throw new RangeError(`frame ${frame} is outside 0..${F - 1}`);
    const g = noteAt(frame), nf = frame - g * NOTE_FRAMES, bar = Math.floor(frame / BAR_FRAMES);
    const barFrame = frame - bar * BAR_FRAMES, r = rows[g];

    // stylus: glide from the last note's mean row, wander by spread x H / ln 32 x noise
    const m = moments[g];
    let prevG = g - 1;
    while (prevG >= 0 && !moments[prevG]) prevG--;
    const pm = prevG >= 0 ? moments[prevG] : m;
    const glide = R.smoothstep((nf + 1) / R.STYLUS_GLIDE_FRAMES);
    let stylusRow, wander = 0;
    if (m) {
      const amp = lerp(pm.spread * hN[prevG >= 0 ? prevG : g], m.spread * hN[g], glide);
      wander = amp * noise1(SEEDS.stylus, 0, frame, R.STYLUS_NOISE_PERIOD);
      stylusRow = lerp(pm.mean, m.mean, glide) + wander;
    } else {
      stylusRow = pm ? pm.mean : (P + 1) / 2;                 // no bet: the stylus stays where it last was
    }
    stylusRow = R.clamp(stylusRow, -0.5, 31.5);

    const strip = [];
    for (let j = Math.max(0, g - STRIP_HISTORY + 1); j <= g; j++) strip.push({ ...columns[j], x: j - g - nf / NOTE_FRAMES });

    const rings = [];
    for (let j = g; j >= 0 && frame - j * NOTE_FRAMES < R.TEA_RING_FRAMES; j--) {
      if (vel[j] !== null) rings.push({ note: j, age: frame - j * NOTE_FRAMES, size: R.teaRingSize(vel[j]) });
    }

    const nU = R.dialU(needleVal[frame]);
    const lim = limitNow[g];
    const tapAlong = handsIn[g] && leftTarget[frame] === 'rest' && ptok[g] >= R.TAP_ALONG_P;
    const fingerLift = tapAlong ? R.tapAlongLift(ptok[g]) * R.TAP_ALONG_CURVE[nf] : 0;
    const sub = subtitleAt(frame), speak = speakingAt(frame);
    const cs = clockSeconds(frame);
    const wallMinutes = R.WALL_START_MINUTES + cs / 60;
    const lidClosed = lidCloses && frame >= R.LID_BAR_FRAME
      ? R.smoothstep((frame - R.LID_BAR_FRAME + 1) / (F - R.LID_BAR_FRAME)) : 0;
    const title = R.cardSlide(frame);
    const k = warmK[g], chalkNumber = R.chalkProgress(frame);

    return {
      frame, note: g, noteFrame: nf, phase: nf / NOTE_FRAMES, bar, barFrame, barPhase: barFrame / BAR_FRAMES,
      isNoteStart: nf === 0, isBarLine: barFrame === 0,
      clockSeconds: cs, clock: clockText(frame), filmSeconds: frame / FPS,

      row: safeRows[g], rowNonFinite: rowNonFinite[g], p: bets[g],
      pick: r.tok, pickName: tokName(r.tok), pickKind: kind[g], pickP: fin(ptok[g]), pickInKey: inKey[g],
      pluck: vel[g] !== null, pluckVel: vel[g],
      entropy: fin(entropy[g]), entropyN: hN[g], err: fin(err[g]), share: fin(share[g]), train: fin(r.train),
      worse: worse[g], err6: fin(err6[g]), bestErrSoFar: fin(bestSoFar[g]),

      meanRow: m ? m.mean : null, spread: m ? m.spread : null, stylusRow, stylusWander: wander,
      punch: PUNCH_CURVE[nf], stripColumns: strip,

      lr: fin(lr[g]), stepChanged: stepChanged[g], needle: needleVal[frame], needleU: R.clamp(nU ?? 0, 0, 1),
      needleOffScale: nU === null || nU < 0 || nU > 1, knobAngle: 2 * Math.PI * R.KNOB_TURNS * R.clamp(nU ?? 0, 0, 1),
      knobTurning: turning[frame], knobClick: click[frame],
      sharp: fin(sharp[g]), sharpMedian3: fin(sharpMed[g]),
      limit: lim, hatchU: lim === null ? null : R.clamp(R.dialU(lim), 0, 1), hatchGone: lim === null,
      hatchGoneSince: hatchLostAt !== null && g >= hatchLostAt ? hatchLostAt : null,
      ratio: fin(ratio[g]), ratioNow: fin(ratioNow[g]), lrOverLimit20: fin(lr[g] / limit20), limit20,
      chalk: chalkNumber, chalkNumber, chalkTick: R.chalkTickProgress(frame), chalkU, chalkText: chalkTxt,

      flagsUp: flags[g], flagsPrevUp: bar > 0 ? flags[barStart(g) - 1] : flags[g],
      flagsT: R.clamp((barFrame + 1) / R.FLAG_FLIP_FRAMES, 0, 1),
      shareDrum: drum[g], shareDrumText: pad(drum[g], 2),
      steps: step[g], stepsText: pad(step[g], 6), cardsThisNote: stepsAfter[g],
      crankAngle: (2 * Math.PI * barFrame) / BAR_FRAMES,

      warmthK: k, warmth: R.warmthOf(k),
      hairline: hairline[g], tear: tearG[g], tearBands: tearBands[g],
      blocks: blocksOn[g], blockShare: blocksOn[g] ? R.blockShare(tearG[g]) : 0, blockTiles: blockTiles[g],

      handsIn: handsIn[g], handsPresent: presence[frame],
      hands: {
        present: presence[frame], left: leftW[frame], right: rightW,
        fingerLift, fingerTap: tapAlong && nf === 1, dialTap: dialTap[frame], dialTapContact: dialTapContact[frame],
        gripping: leftTarget[frame] === 'grip',
      },
      titleSlide: title, titleVisible: title < 1, lidClosed,

      windowLit: windowLit[g], humGate: humGate[g], humLevel: humLevel[frame], shadowRadius: R.shadowRadius(hN[g]),
      dustDrift: dustDrift[frame], dustOpacity: R.dustOpacity(hN[g]), teaRings: rings, spoonChatter: spoon[g],
      wallMinutes, wallClock: wallText(wallMinutes),
      minuteAngle: (2 * Math.PI * (wallMinutes % 60)) / 60, hourAngle: (2 * Math.PI * ((wallMinutes / 60) % 12)) / 12,

      subtitle: sub ? sub.text : null, subtitleId: sub ? sub.id : null, subtitleStart: sub ? sub.frame : null,
      speaking: speak ? speak.id : null,
    };
  }

  // ---- gauges(frame): the x-ray ---------------------------------------------------------------------------------------------
  // One entry per gauge the viewer can see: { id, name (plain words), reads (the log fields it uses; none for the
  // things keyed to the clock), rule (how the reading becomes the picture), value (the live value as short text) }.
  const sig = (x, n = 3) => (isNum(x) ? String(Number(x.toPrecision(n))) : 'not a number');
  const fx = (x, n = 2) => (isNum(x) ? x.toFixed(n) : 'not a number');
  const pct = (x) => (isNum(x) ? `${Math.round(100 * x)}%` : 'not a number');
  const noteClock = (g) => clockText(g * NOTE_FRAMES);
  const POSE_WORDS = { rest: 'at rest', crank: 'on the crank', tap: 'tapping the dial glass', chalk: 'holding the chalk',
    grip: 'on the knob', card: 'sliding the title card away', lid: 'closing the lid' };
  const lineById = Object.fromEntries(R.LINES.map((l) => [l.id, l]));

  function gauges(frame) {
    const S = signals(frame), g = S.note;
    const out = [];
    const add = (id, name, reads, rule, value) => out.push({ id, name, reads, rule, value });

    // the strip
    if (S.p) {
      let top = 0, strong = 0;
      for (let i = 0; i < S.p.length; i++) { if (S.p[i] > S.p[top]) top = i; if (S.p[i] >= 0.05) strong++; }
      add('haze', 'Pencil haze: what the box believes, a shade for each of the 32 rows', ['p'], 'graphite alpha = 0.85 x sqrt(p)',
        `darkest row ${tokName(top)} at ${pct(S.p[top])} (alpha ${fx(R.hazeAlpha(S.p[top]))}); ${strong} row${strong === 1 ? '' : 's'} at 5% or more`);
    } else add('haze', 'Pencil haze: what the box believes, a shade for each of the 32 rows', ['p'], 'graphite alpha = 0.85 x sqrt(p)', 'no bet: nothing drawn');
    const holeR = columns[g].holeR;
    add('hole', 'Hole: the note it plays, bigger the surer it is', ['tok', 'ptok'], 'radius = R x (0.25 + 0.75 x p(pick)); HOLD a slot, REST a dot',
      holeR === null ? 'no hole' : `${S.pickName} with p ${sig(S.pickP)}: ${S.pickKind === 'rest' ? 'a pencil dot' : S.pickKind === 'hold' ? `a slot, ${fx(holeR)} of R` : `radius ${fx(holeR)} of R`}`);
    add('stylus', 'Stylus: where the bet sits, trembling while the box is unsure', ['p', 'entropy'],
      'height = mean row of the bet; wander = spread x (H / ln 32) x smooth noise',
      S.meanRow === null ? 'no bet: it stays where it was'
        : `row ${fx(S.stylusRow, 1)}:${Math.abs(S.stylusRow - S.stylusWander - S.meanRow) > 0.05 ? ' gliding to' : ''} the bet's mean row ${fx(S.meanRow, 1)} ${S.stylusWander < 0 ? '-' : '+'} ${fx(Math.abs(S.stylusWander))} of wander (up to ${fx(S.spread * S.entropyN)} = spread ${fx(S.spread)} x H/ln 32 ${fx(S.entropyN)})`);

    // the dial
    add('needle', 'STEP needle: how big a step the box takes after a mistake', ['lr'], 'log dial 0.03 to 30; the knob turns it over 3 frames when the step size changes',
      `${sig(S.needle, 4)}${S.knobTurning && S.needle !== lr[g] ? ` (the knob is turning to ${sig(lr[g], 4)})` : ''}${S.needleOffScale ? ', off the scale' : ''}`);
    const readings = sharp.slice(Math.max(0, g - R.SHARP_MEDIAN_NOTES + 1), g + 1);
    add('hatching', 'TOO FAR hatching: the edge, measured right now', ['sharp'],
      'starts at 2 / median of the last 3 sharpness readings; gone for good at the first reading after 20:00 that is not positive',
      S.limit !== null ? `starts at ${sig(S.limit)} = 2 / ${sig(sharpMed[g])} (readings ${readings.map((x) => sig(x)).join(', ')}); the needle is at ${fx(S.ratioNow)} of it`
        : S.hatchGoneSince !== null ? `gone since ${noteClock(S.hatchGoneSince)}: the reading there was ${sig(sharp[S.hatchGoneSince])}, so the edge can no longer be measured`
          : `gone on this note: the median reading ${sig(sharpMed[g])} is not positive`);
    add('chalk', 'Chalk mark: the edge as it was measured at 20:00', ['measured20.limit'], 'drawn at 20:00 (frames 1440 to 1444), the limit to 2 decimals',
      frame < R.CHALK_FRAME ? 'not drawn yet (at 20:00)' : `"${chalkTxt}": the limit measured at 20:00 was ${sig(limit20, 6)}; the needle is at ${fx(S.needle / limit20)} times it`);

    // counters
    add('flags', 'NEW TUNES flags: how many next notes in ten it gets right on tunes it never heard', ['heldAcc'],
      'up = round(10 x share), read on the bar line', `${S.flagsUp} of ten (share ${fx(share[barStart(g)], 3)} on the bar line)`);
    add('drum', 'Drum counter: next notes right in a hundred, on tunes it never heard', ['heldAcc'], 'round(100 x share), every note',
      `${S.shareDrumText} (share ${fx(share[g], 4)})`);
    add('lessons', 'LESSONS: steps taken so far', ['step', 'stepsAfter'], 'the step count; cards riffle in, one per step run after this note',
      `${S.stepsText}, and ${stepsAfter[g]} more before the next note`);

    // the picture
    add('warmth', 'Colour of the picture: how much better than guessing the box is', ['held'],
      'colour = 0.15 + 0.85 k; k = (ln 32 - mean error of the last 6 notes) / (ln 32 - best error up to 20:00)',
      `${fx(S.warmth)} (k ${fx(S.warmthK)}): mean error of the last 6 notes ${sig(err6[g])}; guessing is ${fx(R.LN32)}, best up to 20:00 ${sig(best20)}`);
    const bands = S.tearBands.length;
    add('tears', 'Tears: how far the error is above its own best', ['held'], 'g = ln(error / best error so far) / ln 250; floor(8 g) bands shifted up to 24 g px',
      `g ${fx(S.tear)}: ${bands} band${bands === 1 ? '' : 's'}${bands ? `, up to ${Math.round(R.tearMaxPx(S.tear))} px` : ''} (error ${sig(err[g])}, ${err[g] === bestSoFar[g] ? 'its best so far' : `${fx(err[g] / bestSoFar[g])} times its best so far, ${sig(bestSoFar[g])}`})`);

    // the maker, the room
    const left = Object.entries(S.hands.left).sort((a, b) => b[1] - a[1])[0][0];
    let handsText;
    if (S.handsIn && S.handsPresent === 1) {
      handsText = `on the bench: left hand ${POSE_WORDS[left]}${S.hands.fingerLift > 0 || S.hands.fingerTap ? `, tapping along (p ${sig(S.pickP)})` : ''}, right hand on the crank`;
    } else if (S.handsIn) handsText = `sliding back in (${pct(S.handsPresent)}): the error has been at or below guessing for 6 notes`;
    else {
      const since = handsOutSince[g];
      handsText = `${S.handsPresent > 0 ? `sliding out (${pct(S.handsPresent)} left)` : 'gone'} since ${noteClock(since)}: the error there was ${sig(err[since])}, above guessing (${fx(R.LN32)}); now ${sig(err[g])}`;
    }
    add('hands', "The maker's hands", ['held', 'lr', 'ptok'],
      'gone from the first note worse than guessing, back after 6 notes at or below; left hand: chalk, knob, taps', handsText);
    add('window', "Neighbour's window", ['held'], 'the same switch as the hands',
      S.windowLit ? `lit (error ${sig(err[g])}, guessing is ${fx(R.LN32)})` : `dark since ${noteClock(handsOutSince[g])} (error ${sig(err[g])}, guessing is ${fx(R.LN32)})`);
    const lastChange = lastStepChange[g];
    add('hum', 'House hum', ['lr'], 'silent on a note where the step size changed; back over 2 s after 6 still notes',
      S.humGate ? (S.humLevel < 1 ? `coming back: ${pct(S.humLevel)}` : 'on')
        : `off: the step size changed ${lastChange === g ? 'on this note' : `${g - lastChange} note${g - lastChange === 1 ? '' : 's'} ago`}`);
    add('dust', 'Dust in the beam: it drifts while the box is unsure, hangs still when it is certain', ['entropy'],
      'speed = each mote\'s own x H / ln 32; opacity = 0.25 + 0.75 x H / ln 32',
      `drifting at ${pct(S.entropyN)} of full speed, opacity ${fx(S.dustOpacity)}`);
    add('shadow', "The chair's shadow: soft while the box is unsure, hard when it is certain", ['entropy'], 'blur radius = 1 + 5 x H / ln 32',
      `blur radius ${fx(S.shadowRadius)} (H / ln 32 = ${fx(S.entropyN)})`);
    add('tea', 'Tea: a ring for every plucked note; the spoon chatters when six notes running are plucked hard', ['tok', 'ptok'],
      'ring size = velocity squared, velocity = 0.25 + 0.75 x p(pick); spoon: mean velocity of the last 6 notes >= 0.95',
      `${S.pluck ? `ring of size ${fx(R.teaRingSize(S.pluckVel))} (velocity ${fx(S.pluckVel)})` : `no ring on this note (${S.pickName})`}; spoon ${S.spoonChatter ? 'chattering' : 'still'} (mean velocity of the last 6 notes ${fx(meanVel6[g])})`);
    add('wallClock', 'Wall clock', [], '23:30 plus the programme clock (the frame, not the log)', S.wallClock);
    const line = S.subtitleId ? lineById[S.subtitleId] : null;
    add('subtitle', "The maker's line", line ? line.reads : [], line ? line.rule : 'each line has its own rule (bible section 7)',
      line ? `"${S.subtitle}"` : 'nothing is being said');

    // also on screen
    add('clock', 'Clock on the TV', [], 'floor(frame x 5 / 6) programme seconds (the frame, not the log)', S.clock);
    add('hairlines', 'Hairline: one row of the strip slips sideways when the step is past the edge', ['lr', 'sharp'],
      'on a note where step size x median sharpness / 2 is above 1, while the hatching exists',
      S.hairline ? `a ${Math.abs(S.hairline.shiftPx)} px shift (the needle is at ${fx(S.ratioNow)} of the edge)`
        : S.limit === null ? 'none: there is no edge to measure against' : `none (the needle is at ${fx(S.ratioNow)} of the edge)`);
    add('blocks', 'Blocks: mosaic patches when the error is more than ten times guessing', ['held'], 'when error > 10 x ln 32: 0.5 g of the picture, in 8 px blocks',
      S.blocks ? `${S.blockTiles.length} of ${nTiles} tiles (error ${sig(err[g])}, ten times guessing is ${fx(10 * R.LN32, 1)})` : `none (error ${sig(err[g])}, ten times guessing is ${fx(10 * R.LN32, 1)})`);
    add('crank', 'Crank: the tempo', [], 'one turn per bar, always (the frame, not the log)', `bar ${S.bar + 1} of ${F / BAR_FRAMES}, ${pct(S.barPhase)} of a turn`);
    return out;
  }

  return Object.freeze({
    meta, signals, gauges, cues, dropped, events, perNote,
    lineReport: Object.freeze(report.map((r) => Object.freeze(r))),
    knobTurns: Object.freeze(turns.map((t) => Object.freeze({ ...t }))),
    dialTaps: Object.freeze(taps.map((t) => Object.freeze({ ...t }))),
    note: (g) => {
      if (!Number.isInteger(g) || g < 0 || g >= N) throw new RangeError(`note ${g} is outside 0..${N - 1}`);
      return fullRows[g];
    },
    subtitleAt: (frame) => {
      if (!Number.isInteger(frame) || frame < 0 || frame >= TOTAL_FRAMES) return null;
      const c = subtitleAt(frame);
      return c ? { id: c.id, text: c.text, start: c.frame, end: c.subtitleEnd } : null;
    },
  });
}

function wallText(minutes) {
  const m = Math.floor(minutes) % (24 * 60);
  return `${pad(Math.floor(m / 60), 2)}:${pad(m % 60, 2)}`;
}

// ---- the maker's lines (bible 7, v1.1) ---------------------------------------------------------------------------------
// FORMAT lines start at their frame. A line marked afterLine starts on the first note after that line has finished,
// ahead of everything else. A data line is spoken at the first note where its rule holds AND the voice is free AND
// it would finish before the next FORMAT line is due; on a note where its rule does not hold it is not spoken, and
// it is spoken at most once ("Yes." may repeat, 24 notes apart, and only when no other line is spoken on that note).
// When several data lines could be spoken on one note, R.SPEAK_ORDER decides. Words are built at the note the line
// is spoken on. The last FORMAT line ("Goodnight.") cuts anything still playing and nothing is said after it.
function scheduleLines(c, voiceDurations) {
  const byId = Object.fromEntries(R.LINES.map((l) => [l.id, l]));
  const formatLines = R.LINES.filter((l) => l.format).sort((a, b) => a.frame - b.frame);
  const lastWord = formatLines[formatLines.length - 1];
  const followers = R.LINES.filter((l) => l.afterLine);
  const repeating = R.LINES.filter((l) => l.repeat);
  const dataLines = R.SPEAK_ORDER.map((id) => byId[id]);
  const nextFormatFrame = (f0) => { for (const l of formatLines) if (l.frame > f0) return l.frame; return Infinity; };
  const length = (L, text) => R.lineSeconds(L.id, text, voiceDurations) * FPS;
  // for the report: on how many notes each data line's rule held, and why it was not spoken on them
  const stat = Object.fromEntries([...dataLines, ...repeating].map((l) => [l.id,
    { first: null, last: null, held: 0, voiceBusy: 0, tooLong: 0, outranked: 0, textAtFirst: null }]));
  const cues = [], spoken = new Set(), lastSaid = {};
  let playing = null, pendingAfter = null, over = false;

  const start = (L, g, text) => {
    const f0 = g * NOTE_FRAMES, seconds = R.lineSeconds(L.id, text, voiceDurations);
    if (playing && playing.endFrame > f0) { playing.cutAt = f0; playing.endFrame = f0; }
    for (const prev of cues) if (prev.subtitleEnd > f0) prev.subtitleEnd = f0;   // a newer line replaces the subtitle
    const first = stat[L.id] && !L.repeat ? stat[L.id].first : g;
    const cue = { id: L.id, text, note: g, frame: f0, seconds, endFrame: f0 + seconds * FPS,
      subtitleEnd: Math.min(f0 + (seconds + R.SUBTITLE_EXTRA_S) * FPS, R.SUBTITLE_LAST_END),
      triggerNote: g, firstHeldNote: first, waitedNotes: g - first, format: !!L.format, after: L.afterLine ?? null,
      recorded: R.lineRecorded(text, voiceDurations), cutAt: null };
    cues.push(cue);
    playing = cue;
    lastSaid[L.id] = g;
  };

  for (let g = 0; g < NOTES && !over; g++) {
    const f0 = g * NOTE_FRAMES;
    const due = formatLines.find((l) => l.frame === f0);
    const free = !playing || playing.endFrame <= f0;
    const holding = dataLines.filter((L) => !spoken.has(L.id) && L.holds(g, c));
    for (const L of holding) {
      const s = stat[L.id];
      if (s.first === null) { s.first = g; s.textAtFirst = L.text(g, c); }
      s.last = g; s.held++;
      if (due || !free || pendingAfter) s.voiceBusy++;
    }
    if (due) {                                              // a FORMAT line starts at its frame
      start(due, g, due.text(g, c));
      pendingAfter = followers.find((l) => l.afterLine === due.id) ?? null;
      if (due === lastWord) over = true;
      continue;
    }
    if (!free) continue;
    if (pendingAfter) { start(pendingAfter, g, pendingAfter.text(g, c)); pendingAfter = null; continue; }
    const limit = nextFormatFrame(f0);
    let said = false;
    for (const L of holding) {
      if (said) { stat[L.id].outranked++; continue; }
      const text = L.text(g, c);
      if (f0 + length(L, text) > limit) { stat[L.id].tooLong++; continue; }
      start(L, g, text);
      spoken.add(L.id);
      said = true;
    }
    if (said) continue;
    for (const L of repeating) {                            // "Yes.": nothing else is spoken on this note
      if (!L.holds(g, c) || g - (lastSaid[L.id] ?? -Infinity) < R.YES_GAP_NOTES) continue;
      const text = L.text(g, c);
      if (f0 + length(L, text) > limit) continue;
      start(L, g, text);
      break;
    }
  }

  const clockOf = (g) => clockText(g * NOTE_FRAMES);
  const report = R.LINES.map((L) => {
    const said = cues.filter((x) => x.id === L.id);
    const s = stat[L.id];
    const base = { id: L.id, rule: L.rule, format: !!L.format, after: L.afterLine ?? null, repeat: !!L.repeat,
      spoken: said.map((x) => ({ note: x.note, frame: x.frame, clock: clockText(x.frame), text: x.text, seconds: x.seconds,
        recorded: x.recorded, waitedNotes: x.waitedNotes })),
      firstHeldNote: s ? s.first : null, lastHeldNote: s ? s.last : null, heldNotes: s ? s.held : null,
      textAtFirstHeld: s ? s.textAtFirst : null, reason: null };
    if (!said.length) {
      if (!s) base.reason = 'not reached';
      else if (L.repeat) base.reason = 'its rule never held when the voice was free';
      else if (!s.held) base.reason = 'its rule never held';
      else {
        const why = [];
        if (s.voiceBusy) why.push(`the voice was busy on ${s.voiceBusy}`);
        if (s.tooLong) why.push(`it would not have finished before the next FORMAT line on ${s.tooLong}`);
        if (s.outranked) why.push(`another line was spoken first on ${s.outranked}`);
        base.reason = `its rule held on ${s.held} note${s.held === 1 ? '' : 's'} (${clockOf(s.first)} to ${clockOf(s.last)}): ${why.join(', ')}`;
      }
    }
    return base;
  });
  return { cues: cues.map((x) => Object.freeze(x)), report };
}

// ---- events (everything that happens, for the tables and the x-ray) -----------------------------------------------------
function buildEvents(d) {
  const ev = [];
  const fmt = (r) => (isNum(r) ? Number(r.toPrecision(6)) : r === null ? null : String(r));
  const add = (o) => ev.push(Object.freeze({ format: false, note: noteAt(o.frame), values: {}, ...o }));
  const at = (g) => g * NOTE_FRAMES;
  const L = R.LN32;

  // FORMAT (fixed frames, identical in every ending; a tap or the lid may be skipped by the rules)
  add({ kind: 'title-card', frame: 0, format: true, what: 'title card on the bench: THE QUIET HOUR' });
  add({ kind: 'title-slide', frame: R.CARD_SLIDE[0], format: true, what: 'the left hand slides the title card away (frames 90-119)' });
  for (const t of d.taps) {
    add({ kind: 'dial-tap', frame: t.frame, format: true,
      what: t.performed ? 'five-minute tap: two taps on the dial glass' : `five-minute tap skipped: ${t.reason}`,
      values: { performed: t.performed, handsIn: d.handsIn[noteAt(t.decidedAt)], gripping: d.gripT[t.decidedAt] } });
  }
  add({ kind: 'chalk-pickup', frame: R.CHALK_PICKUP_FRAME, format: true, what: 'the left hand takes the chalk' });
  add({ kind: 'chalk', frame: R.CHALK_FRAME, format: true,
    what: `chalk tick at the limit measured at 20:00 (frames 1440-1441), "${R.chalkText(d.limit20)}" chalked beside it (frames 1440-1444)`,
    values: { limit20: fmt(d.limit20), hatchEdgeNow: fmt(d.limitNow[BREAK_NOTE]) } });
  add({ kind: 'lid', frame: R.LID_BAR_FRAME, format: true,
    what: d.lidCloses ? 'the left hand closes the lid over the last bar' : 'the lid stays open (hands gone)',
    values: { handsIn: d.handsIn[d.lidNote], err: fmt(d.err[d.lidNote]) } });
  add({ kind: 'black', frame: PROGRAMME_FRAMES, format: true, what: 'black; the coda (sound only) to frame 2399' });

  // lines
  for (const c of d.cues) {
    add({ kind: 'line', id: c.id, frame: c.frame, format: c.format, after: c.after, note: c.note, triggerNote: c.note,
      firstHeldNote: c.firstHeldNote, what: `"${c.text}"`,
      values: { ...(c.format ? {} : lineValues(c.id, c.note, d)), seconds: fmt(c.seconds), recorded: c.recorded,
        ...(c.waitedNotes ? { ruleFirstHeldAtNote: c.firstHeldNote } : {}), ...(c.cutAt !== null ? { cutAt: c.cutAt } : {}) } });
  }

  // state changes read from the log, note by note
  let prevHair = false, prevTear = false, prevBlocks = false, prevHatch = true, prevSpoon = false;
  let prevHum = true, firstCertain = false, warmFull = false, warmZero = false, offScale = false;
  for (let g = 0; g < d.N; g++) {
    const f = at(g), e = fmt(d.err[g]);
    if (d.handsOutAt[g]) {
      add({ kind: 'hands-out', frame: f, what: 'both hands slide out (over one bar)', values: { err: e, ln32: fmt(L) } });
      add({ kind: 'window-dark', frame: f, what: "the neighbour's window goes dark", values: { err: e } });
    }
    if (d.handsBackAt[g]) {
      const last6 = d.err.slice(g - 5, g + 1).map(fmt);
      add({ kind: 'hands-back', frame: f, what: 'the hands slide back (over 20 frames)', values: { errLast6: last6, ln32: fmt(L) } });
      add({ kind: 'window-lit', frame: f, what: "the neighbour's window lights again", values: { errLast6: last6 } });
    }
    if (d.humGate[g] !== prevHum) {
      add(d.humGate[g]
        ? { kind: 'hum-on', frame: f, what: 'the house hum comes back (over 2 s): the step size has been still for 6 notes',
          values: { lrLast7: d.lr.slice(g - R.HUM_STILL_NOTES, g + 1).map(fmt), stillNotes: R.HUM_STILL_NOTES } }
        : { kind: 'hum-off', frame: f, what: 'the house hum stops dead', values: { lrBefore: fmt(d.lr[g - 1]), lr: fmt(d.lr[g]) } });
    }
    prevHum = d.humGate[g];
    if (g > 0 && g % NOTES_PER_BAR === 0 && d.flags[g] !== d.flags[g - 1]) {
      add({ kind: 'flags', frame: f, what: `NEW TUNES flags ${d.flags[g - 1]} -> ${d.flags[g]} of ten`, values: { share: fmt(d.share[g]) } });
    }
    const hatch = d.limitNow[g] !== null;
    if (hatch !== prevHatch) {
      const forGood = d.hatchLostAt === g;
      add({ kind: hatch ? 'hatch-back' : 'hatch-gone', frame: f,
        what: hatch ? 'the TOO FAR hatching comes back' : forGood ? 'the TOO FAR hatching goes, for good (a reading is not positive: the edge can no longer be measured)' : 'the TOO FAR hatching disappears (the median reading is not positive)',
        values: { sharp: fmt(d.sharp[g]), median3: fmt(d.sharpMed[g]) } });
    }
    prevHatch = hatch;
    const hair = d.hairline[g] !== null;
    if (hair !== prevHair) {
      add({ kind: hair ? 'hairlines-on' : 'hairlines-off', frame: f,
        what: hair ? 'hairline shifts start (the needle is inside TOO FAR)' : hatch ? 'no more hairlines (the needle is back under the edge)' : 'no more hairlines (no edge left to measure against)',
        values: { ratioNow: fmt(d.ratioNow[g]), lr: fmt(d.lr[g]), limitNow: fmt(d.limitNow[g]) } });
    }
    prevHair = hair;
    const tear = R.tearBandCount(d.tearG[g]) > 0;
    if (tear !== prevTear) add({ kind: tear ? 'tears-on' : 'tears-off', frame: f, what: tear ? `tear bands start (${R.tearBandCount(d.tearG[g])})` : 'the tears heal', values: { err: e, bestSoFar: fmt(d.bestSoFar[g]), g: fmt(d.tearG[g]) } });
    prevTear = tear;
    if (d.blocksOn[g] !== prevBlocks) add({ kind: d.blocksOn[g] ? 'blocks-on' : 'blocks-off', frame: f, what: d.blocksOn[g] ? 'block mosaic starts (err above 10 ln 32)' : 'the blocks clear', values: { err: e, tenLn32: fmt(10 * L) } });
    prevBlocks = d.blocksOn[g];
    const off = hatch && d.limitNow[g] > R.DIAL_MAX;
    if (off !== offScale) add({ kind: off ? 'hatch-off-scale' : 'hatch-on-scale', frame: f, what: off ? 'the limit now is past the top of the dial (no hatching visible)' : 'the hatching is back on the dial', values: { limit: fmt(d.limitNow[g]) } });
    offScale = off;
    if (d.spoon[g] !== prevSpoon) add({ kind: d.spoon[g] ? 'spoon-on' : 'spoon-off', frame: f, what: d.spoon[g] ? 'the spoon chatters' : 'the spoon is still', values: { meanVel6: fmt(d.meanVel6[g]) } });
    prevSpoon = d.spoon[g];
    if (d.inKey[g] === false) add({ kind: 'pick-out-of-key', frame: f, what: `out-of-key pick ${d.tokName(d.rows[g].tok)}`, values: { pick: d.rows[g].tok, ptok: fmt(d.ptok[g]) } });
    if (!firstCertain && d.ptok[g] === 1) { firstCertain = true; add({ kind: 'first-certain', frame: f, what: 'first pick with p exactly 1: a full hole, the stylus still', values: { ptok: 1, entropy: fmt(d.entropy[g]) } }); }
    if (!warmFull && d.warmK[g] === 1) { warmFull = true; add({ kind: 'warmth-full', frame: f, what: 'the picture reaches full colour (k = 1)', values: { err6: fmt(d.err6[g]), best20: fmt(d.best20) } }); }
    if (g > BREAK_NOTE && !warmZero && d.warmK[g] === 0) { warmZero = true; add({ kind: 'warmth-zero', frame: f, what: 'the picture is grey (k = 0)', values: { err6: fmt(d.err6[g]) } }); }
  }
  for (const t of d.turns) {
    add({ kind: 'knob-turn', frame: t.start, note: t.note, what: `knob turned ${fmt(t.from)} -> ${fmt(t.to)} (frames ${t.start}-${t.end})`,
      values: { from: fmt(t.from), to: fmt(t.to), handsIn: d.handsIn[t.note] } });
  }
  let prevGrip = false;
  for (let f = 0; f < d.F; f++) {
    const grip = d.leftTarget[f] === 'grip';
    if (grip !== prevGrip) {
      const g = noteAt(f), gone = !d.handsIn[g];
      add({ kind: grip ? 'grip-on' : 'grip-off', frame: f,
        what: grip ? 'the left hand grips the knob (the step size changed)'
          : gone ? 'the left hand leaves the knob with the hands (error above guessing)' : 'the left hand lets go of the knob (the step size has stopped changing)',
        values: { lrBefore: fmt(d.lr[Math.max(0, g - 1)]), lr: fmt(d.lr[g]), err: fmt(d.err[g]), handsIn: d.handsIn[g] } });
    }
    prevGrip = grip;
  }

  const order = (e) => (e.format ? 0 : 1);
  ev.sort((a, b) => a.frame - b.frame || order(a) - order(b));
  return Object.freeze(ev);
}

/** The log values that make a line's rule hold at the note it is spoken on (for the tables). */
function lineValues(id, g, d) {
  const fmt = (r) => (isNum(r) ? Number(r.toPrecision(6)) : r === null ? null : String(r));
  switch (id) {
    case 'L3': return { massInKey: fmt(d.massInKey[g]) };
    case 'L4': return { share: fmt(d.share[g]) };
    case 'YES': return { ptok: fmt(d.ptok[g]) };
    case 'L5': return { ratioNow: fmt(d.ratioNow[g]) };
    case 'L6b': return { lr287: fmt(d.lr[BREAK_NOTE - 1]), lr288: fmt(d.lr[BREAK_NOTE]), limit20: fmt(d.limit20), times: fmt(d.lr[BREAK_NOTE] / d.limit20) };
    case 'L7': return { share: fmt(d.share[g]), share20: fmt(d.share20) };
    case 'L8': return { limitNow: fmt(d.limitNow[g]), chalk: fmt(d.limit20), times: fmt(d.limitNow[g] / d.limit20) };
    case 'L9': return { share: fmt(d.share[g]), share20: fmt(d.share20) };
    case 'L10': return { errLast6: d.err.slice(g - 5, g + 1).map(fmt) };
    default: return {};
  }
}
