// THE QUIET HOUR: the engine. Turns (ending, frame) into every number the picture and the sound need.
//
//   const engine = await loadEngine('main', baseUrl);   // browser: fetches data/shared.json + data/ending-main.json
//   const engine = createEngine(shared, endingData, { voiceDurations });   // pure; also runs in Node
//   engine.signals(frame)   // frame 0..2159: one plain object, the same keys on every frame (documented below)
//   engine.note(g)          // the full log row of note g (0..431), non-numbers kept as NaN / Infinity
//   engine.meta             // the token table, ln 32, the limit measured at 20:00, best error to 20:00, counts
//   engine.cues             // the scheduled lines [{ id, text, note, frame, seconds, ... }]
//   engine.events           // everything that happens, with its note, frame and the log values that caused it
//   engine.perNote          // per-note arrays (for the sound and the x-ray)
//   engine.subtitleAt(f)    // the subtitle at any film frame 0..2399 (the last one runs into the black coda)
//
// Every rule of the bible lives in ./rules.js and is applied here once. Everything smoothed or accumulated (hand
// presence, pose blends, the knob, the hum, the dust's drift, the line schedule) is computed for every frame when the
// engine is created, by walking forward from frame 0; signals(frame) only looks things up. So frames can be asked
// for in any order, and the same frame always gives the same object. Nothing here reads the ending's name, a clock,
// a timer or Math.random. Nothing before frame 1440 reads a note after 287, so frames 0..1439 are the same in all
// four endings.
//
// ------------------------------------------------------------------------------------------------------------------
// THE SIGNALS OBJECT (engine.signals(frame)). Units in [brackets]. Bible rule in (parentheses).
// Every value is a finite number, a boolean, a string, an array, a plain object of these, or null. Never NaN.
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
//   worse          [bool]          err above ln 32: worse than guessing (bible 3 hands rule 1, 4 window)
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
//   stepChanged    [bool]               the step size differs from the previous note's (ratchet click, hum off)
//   needle         [step size]          where the needle stands now: the step size, moved by knob turns
//   needleU        [0..1]               needle position on the log dial 0.03..30 (clamped)
//   needleOffScale [bool]               the step size is outside 0.03..30
//   knobAngle      [rad]                2 turns over the dial's scale x needleU (AUTHORED)
//   knobTurning    [bool]               a turn is in progress
//   knobClick      [bool]               a turn starts on this frame (the ratchet click; sound sync)
//   sharp          [| null]             sharpness now (log)
//   limit          [step size | null]   the limit measured right now: 2 / sharpness; null when sharpness <= 0
//   hatchU         [0..1 | null]        where the hatched TOO FAR zone starts (clamped; 1 = above the scale, so
//                                       nothing hatched); null = the hatching is gone
//   hatchGone      [bool]               sharpness zero, negative or not a number
//   ratio          [| null]             ratio now = step size x sharpness / 2 (log)
//   lrOverLimit20  [| null]             step size / the limit measured at 20:00 (x-ray)
//   limit20        [step size]          the limit measured at 20:00 (the chalk mark)
//   chalk          [0..1]               chalk draw-on progress: 0 before frame 1440, 0.2 .. 1 over 1440..1444
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
//   warmthK        [0..1]               k = clamp((ln 32 - err) / (ln 32 - best err to 20:00), 0, 1)
//   warmth         [0.15..1]            saturation and warmth of the whole picture = 0.15 + 0.85 k
//   hairline       [{ y, shiftPx } | null]  on a note where ratio now is above 1: y [0..1 of the strip's height],
//                                       shiftPx [+-1..3 programme px], seeded by the note
//   tear           [0..1]               g = clamp(ln(err / err at 20:00) / ln 250, 0, 1)
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
//                    left:  { rest, crank, tap, chalk, grip, card, lid } [weights, sum 1]
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
//   windowLit      [bool]               the neighbour's window: lit while err <= ln 32
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
// the maker's voice (bible 7)
//   subtitle       [string | null]      the line showing now (from its start for its length + 0.5 s; a newer line
//                                       replaces it)
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
export const FORMAT_FRAMES = Object.freeze([0, R.L1_FRAME, R.CARD_SLIDE[0], ...R.DIAL_TAP_FRAMES, R.CHALK_PICKUP_FRAME,
  R.CHALK_FRAME, R.LID_BAR_FRAME, R.GN_FRAME, PROGRAMME_FRAMES].sort((a, b) => a - b));

const DATA_FORMAT = 'quiet-hour-notes/1';
const PUNCH_CURVE = [1, 0.5, 0.15, 0, 0];               // AUTHORED
const DIAL_LN = Math.log(R.DIAL_MAX / R.DIAL_MIN);
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

/** { text: seconds } from data/voice.json ({ lines: [{ id, text, seconds }] }); undefined if there is none. */
export function voiceLengths(voice) {
  if (!voice || !Array.isArray(voice.lines)) return undefined;
  return Object.fromEntries(voice.lines.filter((l) => l.text && l.seconds > 0).map((l) => [l.text, l.seconds]));
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
 *        in seconds, keyed by line text or line id; name: a label for meta only (no rule reads it)
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
  const limitNow = sharp.map(R.limitFromSharpness);
  const worse = err.map(R.worseThanGuessing);
  const stepChanged = lr.map((v, g) => g > 0 && v !== lr[g - 1]);

  // constants of the film read from the log: error and share at 20:00, best error up to and including 20:00
  const err20 = err[BREAK_NOTE], share20 = share[BREAK_NOTE];
  let best20 = Infinity, best20Note = -1;
  for (let g = 0; g <= BREAK_NOTE; g++) if (isNum(err[g]) && err[g] < best20) { best20 = err[g]; best20Note = g; }

  const warmK = err.map((e) => R.warmthK(e, best20));
  const tearG = err.map((e) => R.tearAmount(e, err20));
  const blocksOn = err.map(R.blocksOn);
  const barStart = (g) => g - (g % NOTES_PER_BAR);
  const flags = share.map((_, g) => R.flagsUp(share[barStart(g)]));
  const drum = share.map(R.shareDrum);

  // hands rule 1: present or gone, decided note by note from the log
  const handsIn = new Array(N), handsOutAt = new Array(N).fill(false), handsBackAt = new Array(N).fill(false);
  {
    let state = true, good = 0;
    for (let g = 0; g < N; g++) {
      if (state) {
        if (worse[g]) { state = false; good = 0; handsOutAt[g] = true; }
      } else {
        good = worse[g] ? 0 : good + 1;
        if (good >= R.HANDS_BACK_NOTES) { state = true; handsBackAt[g] = true; }
      }
      handsIn[g] = state;
    }
  }

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
  const hairline = ratio.map((x, g) => (R.hairlineOn(x) ? Object.freeze({
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

  // the knob and needle: turned to each new step size, never while the chalk is being drawn
  const needleLn = new Float64Array(F), needleVal = new Float64Array(F);
  const turning = new Array(F).fill(false), click = new Array(F).fill(false);
  const turns = [];
  {
    let curLn = Math.log(lr[0]), curLr = lr[0], turn = null;
    for (let f = 0; f < F; f++) {
      const g = noteAt(f);
      if (turn && f > turn.end) { curLn = turn.toLn; curLr = turn.to; turn = null; }
      const target = isNum(lr[g]) && lr[g] > 0 ? lr[g] : curLr;   // a step size that is not a number: the knob stays
      const targetLn = target === curLr ? curLn : Math.log(target);
      if (!turn && target !== curLr && !R.chalkBusy(f)) {
        const n = R.knobTurnFrames((targetLn - curLn) / DIAL_LN);
        turn = { start: f, end: f + n - 1, frames: n, from: curLr, to: target, fromLn: curLn, toLn: targetLn, note: g };
        turns.push(turn);
        click[f] = true;
      }
      if (turn) {
        const s = R.smoothstep((f - turn.start + 1) / turn.frames);
        needleLn[f] = lerp(turn.fromLn, turn.toLn, s);
        needleVal[f] = f === turn.end ? turn.to : Math.exp(needleLn[f]);
        turning[f] = true;
      } else { needleLn[f] = curLn; needleVal[f] = curLr; }
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
    else if (f >= R.CHALK_PICKUP_FRAME && f < R.CHALK_FRAME + R.CHALK_FRAMES) t = 'chalk';
    else if (gripT[f]) t = 'grip';
    else if (inTap) t = 'tap';
    leftTarget[f] = t;
  }
  const leftW = new Array(F);
  {
    // weights in integer steps of 1 / POSE_BLEND_FRAMES, so a blend lands exactly on 0 and 1
    const B = R.POSE_BLEND_FRAMES;
    const w = Object.fromEntries(R.POSES.map((k) => [k, k === 'rest' ? B : 0]));
    for (let f = 0; f < F; f++) {
      let sum = 0;
      for (const k of R.POSES) {
        const tgt = leftTarget[f] === k ? B : 0;
        w[k] += R.clamp(tgt - w[k], -1, 1);
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
  const ctx = Object.freeze({ lr, ptok, share, ratio, massInKey, limitNow, limit20, breakNote: BREAK_NOTE,
    handsBack: handsBackAt });
  const { cues, dropped } = scheduleLines(ctx, opts.voiceDurations);
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
    tokens: Object.freeze(tokens), P, HOLD, REST, ln32: R.LN32,
    limit20, chalkText: R.chalkText(limit20), err20, share20, best20, best20Note,
    run: Object.freeze({ push: endingData.push ?? null, climb: endingData.climb ?? null, rule: endingData.rule ?? null }),
    source: shared.source ?? null,
    seeds: SEEDS,
    counts: Object.freeze({
      notes: N, frames: F, pitchPicks: count(kind, (k) => k === 'pitch'), holds: count(kind, (k) => k === 'hold'),
      rests: count(kind, (k) => k === 'rest'), outOfKeyPicks: count(inKey, (x) => x === false),
      outOfKeyAfter20: count(inKey, (x, g) => x === false && g >= BREAK_NOTE),
      worseThanGuessing: count(worse, (x) => x), stepChanges: count(stepChanged, (x) => x), knobTurns: turns.length,
      certainPicks: count(ptok, (x) => x === 1), hairlineNotes: count(hairline, (x) => x !== null),
      tearNotes: count(tearG, (x) => R.tearBandCount(x) > 0), blockNotes: count(blocksOn, (x) => x),
      hatchGoneNotes: count(limitNow, (x) => x === null), lines: cues.length, droppedLines: dropped.length,
    }),
  });

  const perNote = Object.freeze({
    pick: tok, pickKind: kind, pickP: ptok.map(fin), pickInKey: inKey,
    pickMidiSounded: tok.map((t, g) => (kind[g] === 'pitch' ? tokens[t].midiSounded : null)),
    velocity: vel, stepChanged, lr, humGate, handsIn, worse, windowLit: worse.map((w) => !w), tear: tearG,
    blocks: blocksOn, spoonChatter: spoon, meanVel6, flagsUp: flags, shareDrum: drum, warmthK: warmK,
    entropyN: hN, err: err.map(fin), share: share.map(fin), limitNow, hairline: hairline.map((h) => h !== null),
  });

  const events = buildEvents({ N, F, rows, kind, inKey, ptok, err, share, sharp, ratio, lr, limitNow, worse, stepChanged,
    handsOutAt, handsBackAt, humGate, spoon, meanVel6, flags, tearG, blocksOn, hairline, warmK, turns, taps, gripT,
    leftTarget, lidCloses, lidNote, handsIn, cues, dropped, limit20, err20, share20, best20, entropy, hN, tokName });

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
    const k = warmK[g];

    return {
      frame, note: g, noteFrame: nf, phase: nf / NOTE_FRAMES, bar, barFrame, barPhase: barFrame / BAR_FRAMES,
      isNoteStart: nf === 0, isBarLine: barFrame === 0,
      clockSeconds: cs, clock: clockText(frame), filmSeconds: frame / FPS,

      row: safeRows[g], rowNonFinite: rowNonFinite[g], p: bets[g],
      pick: r.tok, pickName: tokName(r.tok), pickKind: kind[g], pickP: fin(ptok[g]), pickInKey: inKey[g],
      pluck: vel[g] !== null, pluckVel: vel[g],
      entropy: fin(entropy[g]), entropyN: hN[g], err: fin(err[g]), share: fin(share[g]), train: fin(r.train),
      worse: worse[g],

      meanRow: m ? m.mean : null, spread: m ? m.spread : null, stylusRow, stylusWander: wander,
      punch: PUNCH_CURVE[nf], stripColumns: strip,

      lr: fin(lr[g]), stepChanged: stepChanged[g], needle: needleVal[frame], needleU: R.clamp(nU ?? 0, 0, 1),
      needleOffScale: nU === null || nU < 0 || nU > 1, knobAngle: 2 * Math.PI * R.KNOB_TURNS * R.clamp(nU ?? 0, 0, 1),
      knobTurning: turning[frame], knobClick: click[frame],
      sharp: fin(sharp[g]), limit: lim, hatchU: lim === null ? null : R.clamp(R.dialU(lim), 0, 1), hatchGone: lim === null,
      ratio: fin(ratio[g]), lrOverLimit20: fin(lr[g] / limit20), limit20,
      chalk: R.chalkProgress(frame), chalkU, chalkText: chalkTxt,

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

      windowLit: !worse[g], humGate: humGate[g], humLevel: humLevel[frame], shadowRadius: R.shadowRadius(hN[g]),
      dustDrift: dustDrift[frame], dustOpacity: R.dustOpacity(hN[g]), teaRings: rings, spoonChatter: spoon[g],
      wallMinutes, wallClock: wallText(wallMinutes),
      minuteAngle: (2 * Math.PI * (wallMinutes % 60)) / 60, hourAngle: (2 * Math.PI * ((wallMinutes / 60) % 12)) / 12,

      subtitle: sub ? sub.text : null, subtitleId: sub ? sub.id : null, subtitleStart: sub ? sub.frame : null,
      speaking: speak ? speak.id : null,
    };
  }

  return Object.freeze({
    meta, signals, cues, dropped, events, perNote,
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

// ---- the line queue (bible 7) -------------------------------------------------------------------------------------------
// A line fires at the first note that meets its rule (FORMAT lines at their frame), starts on a note boundary and
// never overlaps another: it waits up to 2 bars, then is dropped. "Yes." needs nothing playing (it never waits).
// L6b goes right after L6a, ahead of anything waiting. "Goodnight." is never dropped and cuts anything still
// playing; nothing starts after it. Queue order: trigger note, then table order.
function scheduleLines(c, voiceDurations) {
  const cues = [], dropped = [];
  const fired = new Set();
  const queue = [];
  let playing = null, lastYes = -Infinity, gnStarted = false, l6bPending = null;
  const lineDef = Object.fromEntries(R.LINES.map((l) => [l.id, l]));
  const order = Object.fromEntries(R.LINES.map((l, i) => [l.id, i]));

  const start = (item, g) => {
    const f0 = g * NOTE_FRAMES;
    const seconds = R.lineSeconds(item.id, item.text, voiceDurations);
    const cue = { id: item.id, text: item.text, note: g, frame: f0, seconds,
      endFrame: f0 + seconds * FPS, subtitleEnd: f0 + (seconds + R.SUBTITLE_EXTRA_S) * FPS,
      triggerNote: item.trigger, waitedNotes: g - item.trigger, format: !!lineDef[item.id].format,
      after: lineDef[item.id].afterLine ?? null, cutAt: null };
    if (playing && playing.endFrame > f0) { playing.cutAt = f0; playing.endFrame = f0; }
    // a newer line replaces the subtitle of the one before
    for (const prev of cues) if (prev.subtitleEnd > f0) prev.subtitleEnd = f0;
    cues.push(cue);
    playing = cue;
    if (item.id === 'YES') lastYes = g;
    if (item.id === 'L6a') l6bPending = { id: 'L6b', text: null, trigger: null };
    if (item.id === 'GN') gnStarted = true;
    return cue;
  };

  for (let g = 0; g < NOTES; g++) {
    const f0 = g * NOTE_FRAMES;
    const free = () => !playing || playing.endFrame <= f0;
    // 1. new triggers (not YES, not L6b), in table order
    for (const L of R.LINES) {
      if (L.id === 'YES' || L.afterLine) continue;
      if (!L.repeat && fired.has(L.id)) continue;
      const hit = L.format ? f0 === L.frame : (L.frame === undefined && L.when(g, c));
      if (!hit) continue;
      fired.add(L.id);
      const item = { id: L.id, text: L.text(g, c), trigger: g };
      if (gnStarted) { dropped.push({ ...item, note: g, reason: 'after Goodnight.' }); continue; }
      queue.push(item);
    }
    queue.sort((a, b) => a.trigger - b.trigger || order[a.id] - order[b.id]);
    // 2. "Goodnight." starts now, whatever is playing; everything still waiting is dropped
    const gi = queue.findIndex((q) => q.id === 'GN');
    if (gi >= 0) {
      const [gn] = queue.splice(gi, 1);
      start(gn, g);
      for (const q of queue.splice(0)) dropped.push({ ...q, note: g, reason: 'Goodnight. started' });
      if (l6bPending) { dropped.push({ id: 'L6b', text: null, trigger: g, note: g, reason: 'Goodnight. started' }); l6bPending = null; }
      continue;
    }
    if (gnStarted) continue;
    // 3. L6b becomes due on the first note boundary after L6a has finished
    if (l6bPending && l6bPending.trigger === null && free()) {
      l6bPending.trigger = g;
      l6bPending.text = lineDef.L6b.text(g, c);
    }
    // 4. drop lines that have waited more than 2 bars
    for (let i = queue.length - 1; i >= 0; i--) {
      if (g - queue[i].trigger > R.LINE_WAIT_NOTES) dropped.push({ ...queue.splice(i, 1)[0], note: g, reason: 'waited 2 bars' });
    }
    if (l6bPending && l6bPending.trigger !== null && g - l6bPending.trigger > R.LINE_WAIT_NOTES) {
      dropped.push({ ...l6bPending, note: g, reason: 'waited 2 bars' });
      l6bPending = null;
    }
    // 5. start the next line if nothing is playing (L6b first)
    if (free()) {
      if (l6bPending && l6bPending.trigger !== null) { start(l6bPending, g); l6bPending = null; }
      else if (queue.length) start(queue.shift(), g);
    }
    // 6. "Yes.": only if nothing is playing or waiting, 24 notes after the last one
    if (free() && !queue.length && !l6bPending && g - lastYes >= R.YES_GAP_NOTES && lineDef.YES.when(g, c)) {
      start({ id: 'YES', text: lineDef.YES.text(g, c), trigger: g }, g);
    }
  }
  return { cues: cues.map((x) => Object.freeze(x)),
    dropped: dropped.map((x) => Object.freeze({ ...x, format: !!lineDef[x.id].format, after: lineDef[x.id].afterLine ?? null })) };
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
  add({ kind: 'chalk', frame: R.CHALK_FRAME, format: true, what: `chalk mark at the limit measured at 20:00: ${R.chalkText(d.limit20)}`,
    values: { limit20: fmt(d.limit20) } });
  add({ kind: 'lid', frame: R.LID_BAR_FRAME, format: true,
    what: d.lidCloses ? 'the left hand closes the lid over the last bar' : 'the lid stays open (hands gone)',
    values: { handsIn: d.handsIn[d.lidNote], err: fmt(d.err[d.lidNote]) } });
  add({ kind: 'black', frame: PROGRAMME_FRAMES, format: true, what: 'black; the coda (sound only) to frame 2399' });

  // lines
  for (const c of d.cues) {
    const g = c.triggerNote;
    const values = c.format ? {} : lineValues(c.id, g, d);
    add({ kind: 'line', id: c.id, frame: c.frame, format: c.format, after: c.after, note: c.note, triggerNote: g, what: `"${c.text}"`,
      values: { ...values, seconds: fmt(c.seconds), waitedNotes: c.waitedNotes, ...(c.cutAt !== null ? { cutAt: c.cutAt } : {}) } });
  }
  for (const x of d.dropped) {
    add({ kind: 'line-dropped', id: x.id, frame: at(x.note), format: x.format, after: x.after, note: x.note, triggerNote: x.trigger,
      what: `${x.id} dropped (${x.reason})${x.text ? `: "${x.text}"` : ''}`, values: x.trigger !== null ? lineValues(x.id, x.trigger, d) : {} });
  }

  // state changes read from the log, note by note
  let prevWindow = true, prevHair = false, prevTear = false, prevBlocks = false, prevHatch = true, prevSpoon = false;
  let prevHum = true, firstCertain = false, warmFull = false, warmZero = false, offScale = false;
  for (let g = 0; g < d.N; g++) {
    const f = at(g), e = fmt(d.err[g]);
    if (d.handsOutAt[g]) add({ kind: 'hands-out', frame: f, what: 'both hands slide out (over one bar)', values: { err: e, ln32: fmt(L) } });
    if (d.handsBackAt[g]) {
      add({ kind: 'hands-back', frame: f, what: 'the hands slide back (over 20 frames)',
        values: { errLast6: d.err.slice(g - 5, g + 1).map(fmt), ln32: fmt(L) } });
    }
    const lit = !d.worse[g];
    if (lit !== prevWindow) add({ kind: lit ? 'window-lit' : 'window-dark', frame: f, what: lit ? "the neighbour's window lights" : "the neighbour's window goes dark", values: { err: e } });
    prevWindow = lit;
    if (d.humGate[g] !== prevHum) {
      add(d.humGate[g]
        ? { kind: 'hum-on', frame: f, what: 'the house hum comes back (over 2 s)', values: { stillNotes: R.HUM_STILL_NOTES } }
        : { kind: 'hum-off', frame: f, what: 'the house hum stops dead', values: { lrBefore: fmt(d.lr[g - 1]), lr: fmt(d.lr[g]) } });
    }
    prevHum = d.humGate[g];
    if (g > 0 && g % NOTES_PER_BAR === 0 && d.flags[g] !== d.flags[g - 1]) {
      add({ kind: 'flags', frame: f, what: `NEW TUNES flags ${d.flags[g - 1]} -> ${d.flags[g]} of ten`, values: { share: fmt(d.share[g]) } });
    }
    const hair = d.hairline[g] !== null;
    if (hair !== prevHair) add({ kind: hair ? 'hairlines-on' : 'hairlines-off', frame: f, what: hair ? 'hairline shifts start (ratio now above 1)' : 'no more hairlines', values: { ratio: fmt(d.ratio[g]) } });
    prevHair = hair;
    const tear = R.tearBandCount(d.tearG[g]) > 0;
    if (tear !== prevTear) add({ kind: tear ? 'tears-on' : 'tears-off', frame: f, what: tear ? `tear bands start (${R.tearBandCount(d.tearG[g])})` : 'the tears heal', values: { err: e, g: fmt(d.tearG[g]) } });
    prevTear = tear;
    if (d.blocksOn[g] !== prevBlocks) add({ kind: d.blocksOn[g] ? 'blocks-on' : 'blocks-off', frame: f, what: d.blocksOn[g] ? 'block mosaic starts (err above 10 ln 32)' : 'the blocks clear', values: { err: e, tenLn32: fmt(10 * L) } });
    prevBlocks = d.blocksOn[g];
    const hatch = d.limitNow[g] !== null;
    if (hatch !== prevHatch) add({ kind: hatch ? 'hatch-back' : 'hatch-gone', frame: f, what: hatch ? 'the TOO FAR hatching comes back' : 'the TOO FAR hatching disappears (sharpness not positive)', values: { sharp: fmt(d.sharp[g]) } });
    prevHatch = hatch;
    const off = hatch && d.limitNow[g] > R.DIAL_MAX;
    if (off !== offScale) add({ kind: off ? 'hatch-off-scale' : 'hatch-on-scale', frame: f, what: off ? 'the limit now is past the top of the dial (no hatching visible)' : 'the hatching is back on the dial', values: { limit: fmt(d.limitNow[g]) } });
    offScale = off;
    if (d.spoon[g] !== prevSpoon) add({ kind: d.spoon[g] ? 'spoon-on' : 'spoon-off', frame: f, what: d.spoon[g] ? 'the spoon chatters' : 'the spoon is still', values: { meanVel6: fmt(d.meanVel6[g]) } });
    prevSpoon = d.spoon[g];
    if (d.inKey[g] === false) add({ kind: 'pick-out-of-key', frame: f, what: `out-of-key pick ${d.tokName(d.rows[g].tok)}`, values: { pick: d.rows[g].tok, ptok: fmt(d.ptok[g]) } });
    if (!firstCertain && d.ptok[g] === 1) { firstCertain = true; add({ kind: 'first-certain', frame: f, what: 'first pick with p exactly 1: a full hole, the stylus still', values: { ptok: 1, entropy: fmt(d.entropy[g]) } }); }
    if (!warmFull && d.warmK[g] === 1) { warmFull = true; add({ kind: 'warmth-full', frame: f, what: 'the picture reaches full colour (k = 1)', values: { err: e, best20: fmt(d.best20) } }); }
    if (g > BREAK_NOTE && !warmZero && d.warmK[g] === 0) { warmZero = true; add({ kind: 'warmth-zero', frame: f, what: 'the picture is grey again (k = 0)', values: { err: e } }); }
  }
  for (const t of d.turns) {
    add({ kind: 'knob-turn', frame: t.start, note: t.note, what: `knob turned ${fmt(t.from)} -> ${fmt(t.to)} (${t.frames} frames)`,
      values: { from: fmt(t.from), to: fmt(t.to), handsIn: d.handsIn[t.note] } });
  }
  let prevGrip = false;
  for (let f = 0; f < d.F; f++) {
    const grip = d.leftTarget[f] === 'grip';
    if (grip !== prevGrip) add({ kind: grip ? 'grip-on' : 'grip-off', frame: f, what: grip ? 'the left hand grips the knob' : 'the left hand lets go of the knob', values: {} });
    prevGrip = grip;
  }

  const order = (e) => (e.format ? 0 : 1);
  ev.sort((a, b) => a.frame - b.frame || order(a) - order(b));
  return Object.freeze(ev);
}

/** The log values that made a line fire (for the tables). */
function lineValues(id, g, d) {
  const fmt = (r) => (isNum(r) ? Number(r.toPrecision(6)) : r === null ? null : String(r));
  switch (id) {
    case 'L3': return { massInKey: fmt(d.rows[g].massInKey) };
    case 'L4': return { share: fmt(d.share[g]) };
    case 'YES': return { ptok: fmt(d.ptok[g]) };
    case 'L5': return { ratio: fmt(d.ratio[g]) };
    case 'L6b': return { lr287: fmt(d.lr[BREAK_NOTE - 1]), lr288: fmt(d.lr[BREAK_NOTE]), limit20: fmt(d.limit20), times: fmt(d.lr[BREAK_NOTE] / d.limit20) };
    case 'L7': return { share: fmt(d.share[g]), share20: fmt(d.share20) };
    case 'L8': return { limitNow: fmt(d.limitNow[g]), chalk: fmt(d.limit20), times: fmt(d.limitNow[g] / d.limit20) };
    case 'L9': return { share: fmt(d.share[g]), share20: fmt(d.share20) };
    case 'L10': return { errLast6: d.err.slice(g - 5, g + 1).map(fmt) };
    default: return {};
  }
}
