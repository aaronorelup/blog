// Fixture scenes for the tea room's engine and scene checks: plain coloured flats (fill), with made-up pixel sizes
// where the sharpness rule is to be tested. Four hard moments: the hero's long push with a chain of three plates
// and an open door onto the next chapter; a screens change with a shadow (start); three scenes one inside the
// next through two hole openings (tv); a chapter with twelve items (film). Each scene is written for d and turned
// into p by swapping the axes, which maps the 1600x900 board onto the 900x1600 one.

const T = ([x, y, w, h]) => [y, x, h, w];
const flip = (f) => ({ ...f, box: T(f.box), ...(f.px && { px: [f.px[1], f.px[0]] }),
  ...(f.through && { through: { ...f.through, hole: Array.isArray(f.through.hole) ? T(f.through.hole) : f.through.hole } }) });
// The p composition of a d one: every box and aim with its axes swapped.
export const upright = (d, extra = {}) => ({ ...d, aim: [d.aim[1], d.aim[0]], flats: d.flats.map(flip),
  slots: (d.slots ?? []).map((s) => ({ ...s, box: T(s.box) })), ...extra });

// A full-frame plate, painted with 4% spare on every side.
export const SPARE = [-64, -36, 1728, 972];
const plate = (name, fill, px = [3456, 1944], extra = {}) => ({ name, fill, box: [...SPARE], r: 1, px, ...extra });
const centred = (k) => { const w = 1728 / k, h = 972 / k; return [800 - w / 2, 450 - h / 2, w, h]; };

// The hero: the walk. Three r = 1 plates in a chain (each a closer view of the middle, handed over by a dissolve
// of 0.2 vh while the one before is still sharp), then the house front's panels part round an open door onto
// the next chapter's first scene. len is the chapter's length in this composition (2.4 d, 2.2 p): its keys scale.
function heroComp(len) {
  const at = (u) => (u * len) / 2.4;
  return {
    aim: [800, 450],
    flats: [
      plate('wide', '#1d2742'),
      { name: 'near', fill: '#2a3a5c', box: centred(1.6), r: 1, px: [3456, 1944] },
      { name: 'front', fill: '#3b4c70', box: centred(2.56), r: 1, px: [3456, 1944] },
      { name: 'lintel', fill: '#6b4a2a', box: [462.5, 260.2, 675, 100], r: 1, px: [3456, 512], through: { to: 'next', hole: 'open', at: 1.3 } },
      { name: 'panel-l', fill: '#8a6a3a', box: [462.5, 360.2, 300, 280], r: 1, px: [1600, 1494] },
      { name: 'panel-r', fill: '#8a6a3a', box: [837.5, 360.2, 300, 280], r: 1, px: [1600, 1494] },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: at(2.2), m: 0.6875 }],
    tracks: [
      { flat: 'near', opacity: [{ at: at(0.88), v: 0 }, { at: at(1.08), v: 1 }, { at: at(1.65), v: 1 }, { at: at(1.65), v: 0 }] },
      { flat: 'wide', opacity: [{ at: at(1.08), v: 1 }, { at: at(1.08), v: 0 }] },
      { flat: 'front', opacity: [{ at: at(1.45), v: 0 }, { at: at(1.65), v: 1 }] },
      { flat: 'lintel', opacity: [{ at: at(1.45), v: 0 }, { at: at(1.65), v: 1 }], lift: [{ at: at(1.9), v: 0 }, { at: at(2.3), v: -1 }] },
      { flat: 'panel-l', opacity: [{ at: at(1.45), v: 0 }, { at: at(1.65), v: 1 }], slide: [{ at: at(1.9), v: 0 }, { at: at(2.3), v: -1 }] },
      { flat: 'panel-r', opacity: [{ at: at(1.45), v: 0 }, { at: at(1.65), v: 1 }], slide: [{ at: at(1.9), v: 0 }, { at: at(2.3), v: 1 }] },
    ],
    rest: {},
  };
}
const heroD = heroComp(2.4);
export const hero = { scene: {
  light: { colour: '#FFB45A', name: 'the open door' }, still: { d: '/fixture/hero.webp', p: '/fixture/hero-p.webp' },
  length: { d: [2.4, 0], p: [2.2, 0] },
  d: heroD, p: { ...upright(heroComp(2.2)), layout: 'walk' },
} };

// Start here: one room, a lantern whose shadow stands on the screens before it, a coin a set piece drives.
const startD = {
  aim: [1010, 560],
  flats: [
    plate('room', '#5a4630'),
    { name: 'word', text: true, box: [150, 150, 700, 230], r: 0.8 },
    { name: 'lantern', fill: '#ffd892', box: [960, 420, 110, 190], r: 0.62, px: [520, 900] },
    { name: 'table', fill: '#3a2a1a', box: [80, 560, 420, 330], r: 0.4, px: [1200, 940] },
  ],
  slots: [{ name: 'cup', flat: 'table', box: [200, 600, 120, 90], show: ['sheet-1', 'sheet-3'], px: [[640, 480]] }],
  camera: [{ at: 0, m: 0 }, { at: 'sheet-3', m: 0.1 }],
  tracks: [{ flat: 'word', slide: [{ at: 'sheet-1', v: 0 }, { at: 'sheet-2', v: -1 }] }],
  rest: { coin: { rise: 0, turn: 0 }, clock: { label: '19:40' } },
  marks: ['sheet-1', 'sheet-2', 'sheet-3'],
};
export const start = { scene: {
  light: { colour: '#FFD892', name: 'the floor lantern' }, shadow: { src: '/fixture/start-shadow.webp', flat: 'lantern' },
  still: { d: '/fixture/start.webp', p: '/fixture/start-p.webp' }, length: { d: [2.4, 0.7], p: [2.4, 0.9] },
  d: startD, p: { ...upright(startD), layout: 'sheets' },
} };
// Start's set piece: pure, and it drives only what rest names.
export const startPiece = (u, n, t) => ({ coin: { rise: Math.max(0, Math.min(1, u - 1)), turn: (t * 30) % 360 } });

// The television: the room's set has its glass as a hole onto the first garden, whose own set opens on the second.
const roomD = {
  aim: [800, 507],
  flats: [
    plate('room', '#141a38'),
    { name: 'face', fill: '#2b2b2b', box: [520, 300, 560, 420], r: 0.32, front: true, px: [3456, 2592],
      through: { to: 'g1', hole: [84, 60, 392, 294], at: 1.6 } },
  ],
  slots: [{ name: 'glass', flat: 'face', box: [604, 360, 392, 294], show: ['dial', 'twenty'] }],
  camera: [{ at: 0, m: 0 }, { each: 'ep', m: 'fit:glass' }, { at: 'twenty', off: 0.4, m: 'fit:glass' }, { at: 'fall-1', m: 'through' }],
  tracks: [{ flat: 'face', wipe: [{ at: 'twenty', v: 0 }, { at: 'twenty', off: 0.4, v: 1 }] }],
  rest: { clock: { minute: 0 } },
  marks: ['dial', 'ep', 'twenty', 'fall-1'],
};
const g1D = {
  aim: [800, 515],
  flats: [
    plate('garden', '#20304a'),
    { name: 'set', fill: '#242424', box: [620, 380, 360, 270], r: 0.3, front: true, px: [3456, 2592],
      through: { to: 'g2', hole: [40, 30, 280, 210], at: 1.4 } },
  ],
  slots: [],
  camera: [{ at: 'fall-1', m: 0 }, { at: 'fall-2', m: 'through' }],
  tracks: [],
  marks: ['fall-1', 'fall-2'],
};
const g2D = {
  aim: [800, 450],
  flats: [plate('garden', '#30203a'), { name: 'word', text: true, box: [150, 150, 700, 230], r: 0.8 }],
  slots: [],
  camera: [{ at: 'fall-2', m: 0 }, { at: 'moon', m: 0.1 }],
  tracks: [],
  marks: ['fall-2', 'moon'],
};
const tvScene = (d, extra = {}) => ({ d, p: upright(d), ...extra });
export const tv = {
  run: ['room', 'g1', 'g2'],
  scenes: {
    room: tvScene(roomD, { light: { colour: '#9FB8FF', name: 'the screen' }, shadow: { src: '/fixture/tv-shadow.webp', flat: 'face' },
      length: { d: [5.4, 1.0], p: [5.4, 1.0] }, count: { shelves: ['episodes'] } }),
    g1: tvScene(g1D),
    g2: tvScene(g2D),
  },
};
tv.scenes.room.p.layout = 'set-above';
// The pictures each slot may hold, in item order (what a chapter's art.js gives).
export const tvArt = { glass: [[1600, 900], [1280, 720]] };

// A chapter with twelve items: one camera key and one slide at each of the marks item-1 to item-12.
const filmD = {
  aim: [800, 450],
  flats: [plate('lawn', '#101820'), { name: 'cloth', fill: '#ede6d6', box: [500, 200, 600, 340], r: 0.7, px: [2048, 1160] },
    { name: 'word', text: true, box: [150, 150, 700, 230], r: 0.8 }],
  slots: [{ name: 'film', flat: 'cloth', box: [520, 220, 560, 300], show: ['item-1', 'item-12'], px: [[1280, 720]] }],
  camera: [{ at: 0, m: 0 }, { each: 'item', m: 0.02 }],
  tracks: [{ flat: 'word', slide: [{ at: 'item-1', v: 0 }, { at: 'item-2', v: -1 }] }],
  marks: ['item'],
};
export const film = { scene: {
  light: { colour: '#EDE6D6', name: "the projector's beam" }, shadow: { src: '/fixture/film-shadow.webp', flat: 'cloth' },
  length: { d: [1.8, 1.0], p: [1.8, 1.0] }, d: filmD, p: { ...upright(filmD), layout: 'cloth' },
} };

export const MODULES = { hero, start, tv, film };
