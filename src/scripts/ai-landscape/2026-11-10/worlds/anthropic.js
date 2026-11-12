// Anthropic's world (SPEC 2.5.1, brand sheet in 3.2): a warm reading room in ivory and oat paper, afternoon light.
// Only looks and placement live here. Every name, number and date on screen comes from the data file.
// The lid mark is the default one of worlds/_default.js: the spark in clay, as the press kit supplies it.
import { artOf } from './_default.js';

export default {
  id: 'anthropic',
  brandMode: 'full',                       // or 'marks-only': glass, glow and line go house grey (SPEC 10)
  theme: { chrome: 'light', ground: '#E8DDCC', ink: '#141413', glass: '#D97757', rim: '#F0EEE6', glow: '#D97757', line: '#D97757' },
  hour: { lamp: [-0.6, 0.62, -0.36], warmth: 0.6 },            // afternoon: a low warm lamp from the upper left
  marks: { of: 'brand', plate: 'white', clear: 0.5 },          // clear space of half the mark's height, never recoloured
  art: artOf('anthropic'),
  alt: {
    plate: 'A paper reading room in ivory and oat: tall bookshelves, an arched window, a desk with a terminal, torn clay-orange shapes joined by black cord.',
    hero: 'A clay-orange paper pebble with one black cord looping twice across it.',
    portrait: 'Cut-paper illustration of Dario Amodei',
    person: 'Dario Amodei',                                     // the caption a tap on the portrait shows: the name only
  },
  character: { kind: 'sprite', floor: 3, size: 1.15 },
  backdrop: { y: -2.8, turn: -0.09 },                           // the room's own floor line meets the ground, the plain wall stands left
  props: [
    { file: 2, z: -3.5, x: 6.6, y: 0.42, w: 2.0 },              // prop-2: a plug on its cord, lying on the floor at the right
    { file: 3, z: -12, x: -5.3, y: 0.92, w: 2.0 },              // prop-3: the folder of cards, far back on the left under the frame
  ],                                                            // prop-1, the pixel creature, stands on floor 8: the signature places it
  fore: { z: 3.2, x: 4.6, y: -0.55, w: 5 },
  // the frame hangs on the plain wall left of the stack. It waits above the room (y) and is lowered to `hangs`
  // once the name has left, so the title never crosses the face (signatures/anthropic.js)
  portrait: { x: -5.6, y: 17, hangs: 5.2 },
  dust: '#F3D9C4',
  signature: 'anthropic',
  myth: 'anthropic-myth-media',
  catchFloor: 5,
};
