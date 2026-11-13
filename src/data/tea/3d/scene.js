// The 3D & animation chapter's scene. Stub (piece 1): a painted field of its light, its giant word and a paper floor
// lantern lit in that light, whose shadow stands on the screens before the chapter. Its pictures are placeholders
// (scripts/tools/tea/stub-art.mjs). The chapter's builder replaces this file. Board units: 1600x900 (d), 900x1600 (p).
const word = [{ at: 'item-1', off: -0.5, v: 0 }, { at: 'item-1', off: -0.1, v: -1 }];
export const scene = {
  light: { colour: '#FFC86B', name: 'a work lamp' },
  shadow: { src: '/tea/scenes/3d/shadow.webp', flat: 'lamp' },
  still: { d: '/tea/scenes/3d/still.webp', p: '/tea/scenes/3d/still-p.webp' },
  length: { d: [2.4, 0.9], p: [2.4, 0.9] },
  d: {
    aim: [545, 582],
    flats: [
      { name: 'field', src: '/tea/scenes/3d/field.webp', px: [2752, 1548], box: [-64, -36, 1728, 972], r: 1 },
      { name: 'word', text: true, box: [200, 110, 900, 330], r: 0.8 },
      { name: 'lamp', src: '/tea/scenes/3d/lamp.webp', px: [600, 900], box: [470, 470, 150, 225], r: 0.6 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.05 }],
    tracks: [{ flat: 'word', lift: word }],
    rest: {},
    marks: ['item'],
  },
  p: {
    layout: 'bench',
    aim: [450, 1015],
    flats: [
      { name: 'field', src: '/tea/scenes/3d/field-p.webp', px: [1548, 2752], box: [-36, -64, 972, 1728], r: 1 },
      { name: 'word', text: true, box: [60, 170, 780, 420], r: 0.8 },
      { name: 'lamp', src: '/tea/scenes/3d/lamp.webp', px: [600, 900], box: [360, 880, 180, 270], r: 0.6 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.05 }],
    tracks: [{ flat: 'word', lift: word }],
    rest: {},
    marks: ['item'],
  },
};
