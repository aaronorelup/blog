// The Start here chapter's scene. Stub (piece 1), and the room the hero's door opens on while it is second: look
// B's room (2752x1536) as the back plate and its floor lantern, cut out of the same picture with a soft edge, as
// the one flat the camera nears, so the walk, the shadow and the door can be tuned against it from the first day.
// The chapter's builder replaces this file (3.2). Board units: 1600x900 (d), 900x1600 (p).
const word = [{ at: 'item-1', off: -0.5, v: 0 }, { at: 'item-1', off: -0.1, v: -1 }];
export const scene = {
  light: { colour: '#FFD892', name: 'the floor lantern' },
  shadow: { src: '/tea/scenes/start/shadow.webp', flat: 'lantern' },
  still: { d: '/tea/scenes/start/room.webp', p: '/tea/scenes/start/still-p.webp' },
  length: { d: [2.4, 0.7], p: [2.4, 0.9] },
  d: {
    aim: [1158, 546],
    flats: [
      { name: 'room', src: '/tea/scenes/start/room.webp', px: [2752, 1536], box: [-64, -32.2, 1728, 964.4], r: 1 },
      { name: 'word', text: true, box: [150, 120, 760, 320], r: 0.8 },
      { name: 'lantern', src: '/tea/scenes/start/lantern.webp', px: [236, 330], box: [1083.8, 442.5, 148.2, 207.2], r: 0.62 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.06 }],
    tracks: [{ flat: 'word', lift: word }],
    rest: {},
    marks: ['item-1'],
  },
  p: {
    layout: 'sheets',
    aim: [560, 963],
    flats: [
      { name: 'room', src: '/tea/scenes/start/room.webp', px: [2752, 1536], box: [-1517.7, -20, 2938.3, 1640], r: 1 },
      { name: 'word', text: true, box: [60, 170, 780, 420], r: 0.8 },
      { name: 'lantern', src: '/tea/scenes/start/lantern.webp', px: [236, 330], box: [434.1, 787.2, 252, 352.3], r: 0.62 },
    ],
    slots: [],
    camera: [{ at: 0, m: 0 }, { at: 6, m: 0.04 }],
    tracks: [{ flat: 'word', lift: word }],
    rest: {},
    marks: ['item-1'],
  },
};
