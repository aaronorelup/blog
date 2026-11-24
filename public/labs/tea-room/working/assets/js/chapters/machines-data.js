// The two machines of the teardown lab (AO-073) the passage between the toy box and the agents chapter shows
// (machines.js): DRAY, then MOLE-1. Every word below is a word of the machine's own page (/labs/teardown/<key>/):
// the console's buttons this file presses, never shown. The notebook itself is never copied: the page, its film and
// its stills are shown by their own addresses.

// crop: what part of the page's 1600 x 900 picture the frame shows: its centre (cx, cy), how much of its height (vh)
// fits the frame, and the widest it may show (vw); a separate crop for a narrow (phone) frame.
// open: the machine opening as the reader scrolls, in screens of its own stretch (0..1): from `at` on, the part and
// the mode the page shows (no part: the machine whole). Each change is one press of the page's own console, about a
// second of its time, so there are never more than two.
// job: how its work is kept going, with no cut, by its own timeline (see machines-live.js).
// aim: the camera's aim held on the machine itself: its view's own aim, reckoned from the machine's place as its page
// hands it (pose), in its page's metres.
// arrive: a picture of the machine's own live page as this passage frames it, the page's whole 1600 x 900: read off
// its canvas the moment it was first shown (its work just begun, the camera where the scroll has it on arrival, the
// mouse at the middle), over the page's own ground colour. It stands on the cloth while the page wakes, in the live
// picture's own place and size, so nothing moves when the page takes over. (Under img/, with the bench's pictures.
// If a machine's cam, turn, job or liveCrop here is changed, or its page's looks, take it again.)
export var MACHINES = [
  {
    key: 'dray',
    name: 'DRAY',
    page: '/labs/teardown/dray/',
    film: '/media/teardown-lab/dray/film.mp4',
    poster: '/media/teardown-lab/dray/hero.webp',
    still: '/media/teardown-lab/dray/hero.webp',
    arrive: 'machines/dray-arrive.webp',
    // the box in the still the machine stands in (in the page's 1600 x 900 pixels): the rest is its console
    keep: [365, 0, 860, 795],
    erase: [],
    crop: { cx: 800, cy: 430, vh: 790, vw: 940 },
    cropNarrow: { cx: 800, cy: 440, vh: 760, vw: 740 },
    // the live page, its camera held at a three-quarter bearing (cam below): the rover stands lower in its picture
    liveCrop: { cx: 800, cy: 540, vh: 900, vw: 1040 },
    liveCropNarrow: { cx: 800, cy: 520, vh: 860, vw: 860 },
    view: 'HERO',
    kind: 'toggle',                     // parts and modes toggle; a mode needs a part
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    allParts: ['CHASSIS', 'WHEELS', 'CRANE', 'MAST & LAMP', 'BATTERY', 'BAG'],
    // whole and driving; the deck cut open on its battery; the crane picked out as it swings the bag; whole again
    open: [{ at: 0 }, { at: 0.36, part: 'BATTERY', mode: 'cut' }, { at: 0.62, part: 'CRANE', mode: 'isolate' }, { at: 0.86 }],
    // its work, there and back along its own timeline (fractions of its task), the rover standing at its module the
    // whole time: the crane reaches into the well, takes the bag from its shelf down to the ground and stows; then
    // the same backward, the bag picked up and put on its shelf again. Both ends are the crane stowed and still, and
    // both lie just inside the task's crane phases (0.22 to 0.78; outside them its page tints another system).
    // seconds: what its own clock takes over the stretch. ease: each way it comes up to speed and down to rest over
    // that long (its lamp head is still turning at both ends, and would be stopped dead).
    job: { back: true, from: 0.2215, to: 0.7785, seconds: 14.4, rest: 0.7, ease: 1.2 },
    // (its HERO view's own aim: a fixed place over the deck, going along with the rover)
    aim: function (pose) { return [-0.55, 1.2, pose.z - 0.45]; },
    // the frame the page draws each picture in (LIVE.stage.frame), and the bearing its camera is held at there
    // (degrees; the page's HERO view starts there and then drifts on by itself, which this holds still)
    stage: 'stage',
    cam: { az: 36 },
    // the camera's turn about that bearing (degrees): the scroll carries it from `from` to `to`, the pointer leans
    // it `lean` each way, and a slow sway of `sway` runs by itself. It starts three-quarters on, the crane already
    // reaching; turned much further left the rover leaves the cloth's lower edge, past about +60 HAB 3 stands between.
    turn: { from: 2, to: 18, lean: 22, sway: 6, tilt: 12 }
  },
  {
    key: 'mole1',
    name: 'MOLE-1',
    page: '/labs/teardown/mole1/',
    film: '/media/teardown-lab/mole1/film.mp4',
    poster: '/media/teardown-lab/mole1/hero-3m.webp',
    still: '/media/teardown-lab/mole1/hero-3m.webp',
    arrive: 'machines/mole1-arrive.webp',
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
    // own still shows it), pressed along its own timeline every frame at 8 times its clock (machines-live.js
    // job.speed). It starts as the arms come down; what is kept going is the phase its page calls CUT, the arms'
    // first bite to the hopper full, the body standing at the face throughout; `to` is only the furthest it may go.
    // Where the load starts again its last picture fades over the new start (fade, in ms).
    job: { speed: 8, from: 0.9728, to: 0.9779, phase: 'CUT', fade: 800 },
    // (its SIDE view's own aim: a little ahead of and above the machine's place)
    aim: function (pose) { return [pose.x + 0.35, pose.y + 0.25, -0.1]; },
    stage: 'st',
    // its SIDE view, held closer and at a fixed bearing: the machine big in its trench, the drums at the face
    cam: { az: 14, el: 22, d: 4.8, sy: -40 },
    // (the same turn about that bearing; the camera follows the machine, so a far lean keeps it in the picture)
    turn: { from: -8, to: 10, lean: 20, sway: 5, tilt: 9 }
  }
];
