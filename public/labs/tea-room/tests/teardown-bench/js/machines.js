// The four machines of the teardown lab (AO-073), as this chapter shows them.
// Every name and number below was written down from the machine's own page (/labs/teardown/<key>/): its part buttons,
// its labels and its readouts. The plain sentences are DRAFTS written for this test, from those same labels and
// readouts: nothing in them is new canon. The notebook itself is never copied: the page, its film and its stills are
// shown by their own addresses.

export const LAB_POST = '/ledger/teardown-lab/';

// crop: what part of the page's 1600 x 900 picture the frame shows: its centre (cx, cy), how much of its height (vh)
// fits the frame, and the widest it may show (vw: past it the console begins); a separate crop for a narrow (phone) frame.
export const MACHINES = [
  {
    key: 'dray',
    name: 'DRAY',
    what: 'The six-wheeled hauler, five wheels fitted',
    page: '/labs/teardown/dray/',
    film: '/media/teardown-lab/dray/film.mp4',
    filmLength: '30 s',
    poster: '/media/teardown-lab/dray/hero.webp',
    stills: ['/media/teardown-lab/dray/hero.webp', '/media/teardown-lab/dray/eye.webp', '/media/teardown-lab/dray/poster.webp'],
    crop: { cx: 810, cy: 440, vh: 700, vw: 840 },
    cropNarrow: { cx: 840, cy: 470, vh: 560 },
    hero: { view: 'HERO' },
    kind: 'toggle', // parts and modes toggle; a mode needs a part
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    parts: [
      {
        button: 'CRANE', name: 'The folding crane', num: '2.30 m', unit: 'of reach, three fingers',
        say: 'Two folding arms and a three-fingered hand lift the regolith bags off HAB 3’s window well, 135 kg at a time.',
        still: 0,
      },
      {
        button: 'BATTERY', name: 'The battery pack', num: '933 kg', unit: 'on five wheels',
        say: 'Cut the deck open and the battery lies flat underneath it, as low as it will go, to keep the weight down by the wheels.',
        still: 2,
      },
      {
        button: 'MAST & LAMP', name: 'The mast and its lamp', num: '6,000 cd', unit: 'one round eye',
        say: 'The end of the job: the lamp on the mast lights HAB 3’s cracked window from across the yard.',
        still: 1,
      },
    ],
    breakIt: {
      label: 'Gravity', min: 1.62, max: 9.81, step: 0.01, value: 1.62, unit: 'm/s²',
      marks: [[1.62, 'Moon'], [3.71, 'Mars'], [9.81, 'Earth']],
      say: 'It is missing its rear right wheel. Raise the gravity and watch the margin shrink until it tips over the gap.',
      readout: { after: 'TIP MARGIN · COM TO NEAREST SUPPORT EDGE', take: 3, label: 'Tip margin' },
      // with no live page: what the page says at the ends (its own tip point is 8.2 m/s²)
      offline: (v) => (v < 8.2 ? 'Stable on five wheels' : 'Tips over the missing wheel'),
      drive: 'setG',
      stills: [0, 2],
      at: 8.2,
    },
  },
  {
    key: 'hab3',
    name: 'HAB 3',
    what: 'The module, taken apart in nine steps',
    page: '/labs/teardown/hab3/',
    film: '/media/teardown-lab/hab3/film.mp4',
    filmLength: '58 s',
    poster: '/media/teardown-lab/hab3/power-off.webp',
    stills: ['/media/teardown-lab/hab3/power-off.webp', '/media/teardown-lab/hab3/halted.webp', '/media/teardown-lab/hab3/poster.webp'],
    crop: { cx: 790, cy: 340, vh: 600, vw: 760 },
    cropNarrow: { cx: 760, cy: 330, vh: 480 },
    hero: { view: 'HERO' },
    kind: 'hab', // a part is isolated by picking it; "cut" is the page's section view
    cutView: 'SECTION',
    parts: [
      {
        button: 'SHIELDING', name: 'The shielding', num: 'Step 1 of 9', unit: 'strip the outer shielding',
        say: 'Every module should have its end written on it from day one. HAB 3’s starts by taking the regolith bags off its back.',
        still: 0,
      },
      {
        button: 'SCRUBBER', name: 'The CO₂ scrubber', num: '4.12 mmHg', unit: 'of CO₂, the limit is 3.0',
        say: 'The scrubber is losing: the carbon dioxide in the empty cabin is already past its limit, and still climbing.',
        still: 2,
      },
      {
        button: 'POWER', name: 'The battery wall', num: '31 h', unit: 'left, sunrise in 128 h',
        say: 'Step 4 isolates HAB 3’s power. The wall of batteries cannot carry it through the night to sunrise.',
        still: 0,
      },
    ],
    breakIt: {
      label: 'The vent bore', min: 10, max: 300, step: 1, value: 100, unit: 'mm',
      marks: [[10, 'Ø 10'], [100, 'Ø 100'], [300, 'Ø 300']],
      say: 'Step 9 vents the module to the Moon. The wider the port, the faster the air goes.',
      readout: { find: /^Ø \d+ MM · /, also: /^HALF PRESSURE IN/, label: 'Vent port' },
      offline: () => 'At Ø 100 mm: half the pressure gone in 24 s',
      drive: 'hit',
      hit: 0,
      stills: [1, 1],
      at: 999,
    },
  },
  {
    key: 'lander',
    name: 'Resupply 6',
    what: 'The cargo lander that tipped',
    page: '/labs/teardown/lander/',
    film: '/media/teardown-lab/lander/film.mp4',
    filmLength: '32 s',
    poster: '/media/teardown-lab/lander/landed-upright.webp',
    stills: ['/media/teardown-lab/lander/landed-upright.webp', '/media/teardown-lab/lander/on-its-side.webp', '/media/teardown-lab/lander/poster.webp'],
    crop: { cx: 790, cy: 430, vh: 620, vw: 760 },
    cropNarrow: { cx: 790, cy: 440, vh: 520 },
    hero: { view: 'HERO' },
    kind: 'toggle',
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    parts: [
      {
        button: 'CARGO BAY', name: 'The cargo bay', num: '2 shelves', unit: 'of food',
        say: 'What the lander was for: the base’s food, on two shelves inside the bay.',
        still: 0,
      },
      {
        button: 'LEGS + STRUTS', name: 'The legs and struts', num: '450 mm', unit: 'of stroke, crushed once',
        say: 'Each primary strut telescopes and crushes once to soak up the landing; secondary struts brace the leg; the footpad is 0.91 m.',
        still: 0,
      },
      {
        button: 'ENGINE + TANKS', name: 'The engine and tanks', num: '1.5 m/s', unit: 'nominal touchdown',
        say: 'The descent engine is cut at contact. From there the legs have to do the rest.',
        still: 2,
      },
    ],
    breakIt: {
      label: 'Touchdown speed', min: 0.5, max: 8, step: 0.1, value: 1.5, unit: 'm/s',
      marks: [[1.5, 'Nominal'], [7, 'Resupply 6']],
      say: 'Resupply 6 came down at 7.0 m/s. Push the speed up and see where the struts stop being enough.',
      readout: { after: 'TIP-OVER MARGIN', take: 2, label: 'Tip-over margin' },
      offline: (v) => (v < 6.6 ? '+13.0 kJ to spare at 1.5 m/s' : '2.3 kJ past the tip at 7.0 m/s'),
      drive: 'hit',
      hit: 0,
      hitPad: 10,
      stills: [0, 1],
      at: 6.6,
    },
  },
  {
    key: 'mole1',
    name: 'MOLE-1',
    what: 'The drum digger',
    page: '/labs/teardown/mole1/',
    film: '/media/teardown-lab/mole1/film.mp4',
    filmLength: '39 s',
    poster: '/media/teardown-lab/mole1/step3-with-picture.webp',
    stills: ['/media/teardown-lab/mole1/step3-with-picture.webp', '/media/teardown-lab/mole1/hero-3m.webp', '/media/teardown-lab/mole1/poster.webp'],
    crop: { cx: 770, cy: 430, vh: 640, vw: 800 },
    cropNarrow: { cx: 820, cy: 430, vh: 500 },
    hero: { view: 'HERO' },
    kind: 'set', // the mode is set (not toggled) first, then a part is picked
    modes: { isolate: 'ISOLATE', cut: 'CUT' },
    parts: [
      {
        button: 'DRUMS', name: 'The drums', num: '0.48 kg/s', unit: 'while the drum cuts',
        say: 'Two counter-rotating drums bite the regolith: the bars cut every 25.7°, and the far half drags back as hard as the near half drags on.',
        still: 0,
      },
      {
        button: 'HOPPER', name: 'The hopper', num: '80 kg', unit: 'a load, 140 loads',
        say: 'The drums fill the hopper, the hopper tips at the pile: 140 loads of 80 kg, and each dump is one tooth.',
        still: 1,
      },
    ],
    breakIt: {
      label: 'Dig progress', min: 0, max: 1, step: 0.001, value: 0, unit: '',
      marks: [[0, 'Dark and parked'], [1, '3.00 m of cover']],
      say: 'Its job is three metres of regolith over the drift’s roof, safe from the sun. Scrub through the whole night’s dig.',
      readout: { after: 'COVER OVER THE DRIFT\'S ROOF, AT THE FACE', take: 3, label: 'Cover over the roof' },
      offline: (v) => `${(v * 3).toFixed(2)} m of 3.00 m`,
      drive: 'hit',
      hit: 0,
      stills: [0, 1],
      at: 0.5,
    },
  },
];
