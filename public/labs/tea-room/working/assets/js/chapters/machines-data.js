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
    // its 30 s task plays once and stops: the page's own tour is started and taken over at once (the task from 0,
    // playing) whenever the page's clock has run a task's length
    job: { loop: 30 },
    // the camera's turn about its HERO view (degrees): the scroll carries it from `from` to `to`, the pointer leans
    // it `lean` each way, and a slow sway of `sway` runs by itself. (Past about +60 the module HAB 3 stands between.)
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
    // (its HERO view follows it; a wider crop than its page's, so the trench's face and the spoil pile are in too)
    view: 'HERO',
    kind: 'set',                        // the mode is set (not toggled) first, then a part is picked
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    allParts: ['DRUMS', 'ARMS', 'HOPPER', 'CHASSIS', 'WHEELS', 'SENSOR BAR', 'BATTERY', 'RADIATOR'],
    // whole and digging; its drums cut open (what bites); its hopper cut open (where the regolith goes); whole again
    open: [{ at: 0 }, { at: 0.34, part: 'DRUMS', mode: 'cut' }, { at: 0.6, part: 'HOPPER', mode: 'cut' }, { at: 0.84 }],
    // it starts dark and parked: its scrub bar is pressed a little into the night's dig, where the trench is still
    // shallow and its camera sees it whole beside its spoil pile, and its x60 button plays it from there (shuttling,
    // biting, dumping). Left to run, it digs on down its drift and out of the picture within a minute, so every
    // 24 s of the page's clock it is put back to the same place (the page's own scrub bar, as its film would loop).
    job: { scrub: 0.05, play: '×60', loop: 24 },
    // (its HERO camera looks at a point ahead of it down the drift: turned far to the left the machine leaves the
    // picture, so its turn leans right)
    turn: { from: 4, to: 22, lean: 22, sway: 6, tilt: 10 }
  }
];
