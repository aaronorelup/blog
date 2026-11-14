// The two machines of the teardown lab (AO-073) the passage between the toy box and the agents chapter shows
// (machines.js): DRAY, then MOLE-1. Every word below is a word of the machine's own page (/labs/teardown/<key>/):
// the console's buttons this file presses, never shown. The notebook itself is never copied: the page, its film and
// its stills are shown by their own addresses.

// crop: what part of the page's 1600 x 900 picture the frame shows: its centre (cx, cy), how much of its height (vh)
// fits the frame, and the widest it may show (vw); a separate crop for a narrow (phone) frame.
// open: the machine opening as the reader scrolls, in screens of its own stretch (0..1): from `at` on, the part and
// the mode the page shows (no part: the machine whole). Each change is one press of the page's own console, about a
// second of its time, so there are never more than two.
// job: how its work is kept running in a loop by its own controls (see machines-live.js).
export var MACHINES = [
  {
    key: 'dray',
    name: 'DRAY',
    page: '/labs/teardown/dray/',
    film: '/media/teardown-lab/dray/film.mp4',
    poster: '/media/teardown-lab/dray/hero.webp',
    still: '/media/teardown-lab/dray/hero.webp',
    // the box in the still the machine stands in (in the page's 1600 x 900 pixels): the rest is its console
    keep: [365, 0, 860, 795],
    erase: [],
    crop: { cx: 800, cy: 430, vh: 790, vw: 940 },
    cropNarrow: { cx: 800, cy: 440, vh: 760, vw: 740 },
    view: 'HERO',
    kind: 'toggle',                     // parts and modes toggle; a mode needs a part
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    allParts: ['CHASSIS', 'WHEELS', 'CRANE', 'MAST & LAMP', 'BATTERY', 'BAG'],
    // whole and driving; the deck cut open on its battery; the crane picked out as it swings the bag; whole again
    open: [{ at: 0 }, { at: 0.36, part: 'BATTERY', mode: 'cut' }, { at: 0.62, part: 'CRANE', mode: 'isolate' }, { at: 0.86 }],
    // its work, looped from its own timeline (fractions of its task): from the crane reaching out to its well to the
    // crane stowed again, the rover standing at its module the whole time (machines-live.js job.play)
    job: { play: true, from: 0.25, to: 0.78 },
    // the frame the page draws each picture in (LIVE.stage.frame), and the bearing its camera is held at there
    // (degrees; the page's HERO view starts there and then drifts on by itself, which this holds still)
    stage: 'stage',
    cam: { az: 36 },
    turn: { from: -38, to: 12, lean: 34, sway: 9, tilt: 12 }
  },
  {
    key: 'mole1',
    name: 'MOLE-1',
    page: '/labs/teardown/mole1/',
    film: '/media/teardown-lab/mole1/film.mp4',
    poster: '/media/teardown-lab/mole1/hero-3m.webp',
    still: '/media/teardown-lab/mole1/hero-3m.webp',
    keep: [300, 100, 990, 545],
    // the page's labels inside that box, smudged out of the picture
    erase: [[420, 180, 105, 40], [430, 228, 115, 42], [370, 410, 155, 45], [1085, 435, 195, 45]],
    crop: { cx: 790, cy: 430, vh: 880, vw: 1000 },
    cropNarrow: { cx: 790, cy: 430, vh: 860, vw: 760 },
    // the live page is framed apart from the still: its own camera is set closer (cam below)
    liveCrop: { cx: 700, cy: 350, vh: 860, vw: 1100 },
    liveCropNarrow: { cx: 840, cy: 360, vh: 860, vw: 1150 },
    view: 'SIDE',
    kind: 'set',                        // the mode is set (not toggled) first, then a part is picked
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    allParts: ['DRUMS', 'ARMS', 'HOPPER', 'CHASSIS', 'WHEELS', 'SENSOR BAR', 'BATTERY', 'RADIATOR'],
    // whole and digging; its drums cut open (what bites); its hopper cut open (where the regolith goes); whole again
    open: [{ at: 0 }, { at: 0.34, part: 'DRUMS', mode: 'cut' }, { at: 0.6, part: 'HOPPER', mode: 'cut' }, { at: 0.84 }],
    // its work: one load dug at the drift's face near the end of its night (the trench three metres deep, as its
    // own still shows it): the arms come down, the drums bite and the hopper fills, played from its own timeline,
    // paused and pressed along it every frame at 8 times its clock, then from the start again (machines-live.js
    // job.speed). Paused, its camera follows the machine itself, never the face it is digging toward.
    job: { speed: 8, from: 0.9728, to: 0.9778 },
    stage: 'st',
    // its SIDE view, held closer and at a fixed bearing: the machine big in its trench, the drums at the face
    cam: { az: 14, el: 22, d: 4.8, sy: -40 },
    turn: { from: -8, to: 10, lean: 20, sway: 5, tilt: 9 }
  }
];
