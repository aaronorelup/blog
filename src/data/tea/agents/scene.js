// The Working with AI agents chapter's scene. Stub (piece 1): a painted field of its light, its giant word and a paper floor
// lantern lit in that light, whose shadow stands on the screens before the chapter. Its pictures are placeholders
// (scripts/tools/tea/stub-art.mjs). The chapter's builder replaces this file. Board units: 1600x900 (d), 900x1600 (p).
const word = [{ at: 'item-1', off: -0.5, v: 0 }, { at: 'item-1', off: -0.1, v: -1 }];
export const scene = {
  light: { colour: '#E39A4A', name: "an oil lamp's low flame" },
  shadow: { src: '/tea/scenes/agents/shadow.webp', flat: 'lamp' },
  still: { d: '/tea/scenes/agents/still.webp', p: '/tea/scenes/agents/still-p.webp' },
  length: { d: [3.0, 0.8], p: [3.2, 0.9] },
  d: {
    aim: [545, 582],
    flats: [
      { name: 'field', src: '/tea/scenes/agents/field.webp', px: [2752, 1548], box: [-64, -36, 1728, 972], r: 1 },
      { name: 'word', text: true, box: [200, 110, 900, 330], r: 0.8 },
      { name: 'lamp', src: '/tea/scenes/agents/lamp.webp', px: [600, 900], box: [470, 470, 150, 225], r: 0.6 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.05 }],
    tracks: [{ flat: 'word', slide: word }],
    rest: {},
    marks: ['item'],
  },
  p: {
    layout: 'tally',
    aim: [450, 1015],
    flats: [
      { name: 'field', src: '/tea/scenes/agents/field-p.webp', px: [1548, 2752], box: [-36, -64, 972, 1728], r: 1 },
      { name: 'word', text: true, box: [60, 170, 780, 420], r: 0.8 },
      { name: 'lamp', src: '/tea/scenes/agents/lamp.webp', px: [600, 900], box: [360, 880, 180, 270], r: 0.6 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.05 }],
    tracks: [{ flat: 'word', slide: word }],
    rest: {},
    marks: ['item'],
  },
};
