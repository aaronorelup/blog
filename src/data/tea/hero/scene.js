// The hero's scene. Stub (piece 1): the garden plate (public/tea/hero/bg-far-night.webp) as the back plate, and
// the same garden cut at the door into two halves that stand in front of it. The camera glides toward the open
// door, then the two halves slide apart to the wings and the next chapter's first scene, standing behind the
// door (to: 'next'), is the frame. The hero's builder replaces this with the walk of 3.1. Board units: 1600x900
// (d), 900x1600 (p). The upright plate is the wide one under an upright camera, 1640 units tall so that it rests at
// 1.6 of its pixels a CSS px on a phone.
const keys = (len) => {
  const at = (u) => Math.round(((u * len) / 2.4) * 1000) / 1000;
  return {
    camera: [{ at: 0, m: 0 }, { at: at(2.2), m: 0.18 }],
    tracks: [
      { flat: 'garden-l', slide: [{ at: at(1.35), v: 0 }, { at: at(2.25), v: -1 }] },
      { flat: 'garden-r', slide: [{ at: at(1.35), v: 0 }, { at: at(2.25), v: 1 }] },
    ],
  };
};
const door = { to: 'next', hole: 'open', at: 10 };
export const scene = {
  light: { colour: '#FFC37A', name: 'the open door' },
  still: { d: '/tea/hero/bg-far-night.webp', p: '/tea/scenes/hero/still-p.webp' },
  length: { d: [2.4, 0], p: [2.2, 0] },
  d: {
    aim: [807, 394],
    flats: [
      { name: 'garden', src: '/tea/hero/bg-far-night.webp', px: [2816, 1584], box: [-64, -36, 1728, 972], r: 1 },
      { name: 'garden-l', src: '/tea/scenes/hero/garden-l.webp', px: [1420, 1584], box: [-64, -36, 871.36, 972], r: 1, through: door },
      { name: 'garden-r', src: '/tea/scenes/hero/garden-r.webp', px: [1396, 1584], box: [807.36, -36, 856.64, 972], r: 1 },
    ],
    slots: [],
    ...keys(2.4),
    rest: {},
  },
  p: {
    layout: 'walk',
    aim: [450, 705],
    flats: [
      { name: 'garden', src: '/tea/hero/bg-far-night.webp', px: [2816, 1584], box: [-1019.5, -20, 2915.6, 1640], r: 1 },
      { name: 'garden-l', src: '/tea/scenes/hero/garden-l.webp', px: [1420, 1584], box: [-1019.5, -20, 1470.2, 1640], r: 1, through: door },
      { name: 'garden-r', src: '/tea/scenes/hero/garden-r.webp', px: [1396, 1584], box: [450.7, -20, 1445.4, 1640], r: 1 },
    ],
    slots: [],
    ...keys(2.2),
    rest: {},
  },
};
