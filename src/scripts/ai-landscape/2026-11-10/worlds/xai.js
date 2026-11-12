// xAI's world (SPEC 2.5.5, brand sheet in 3.2): a stark white hangar at dawn. The pattern the other four copy.
// Only looks and placement live here. Every name, number and date on screen comes from the data file.
import { artOf, mark } from './_default.js';

export default {
  id: 'xai',
  brandMode: 'full',                       // or 'marks-only': glass, glow and line go house grey (SPEC 10)
  theme: { chrome: 'light', ground: '#F9F8F6', ink: '#0A0A0A', glass: '#0A0A0A', rim: '#FFFFFF', glow: '#FFFFFF', line: '#E04A26' },
  hour: { lamp: [-0.5, 0.35, 0.8], warmth: 0.15 },             // low, hard dawn light from the upper left
  marks: { lid: mark('xai', 'grok-mark'), of: 'brand', plate: 'white', clear: 0.5 },
  art: artOf('xai'),
  alt: {
    plate: 'A white paper hangar at dawn: a rocket and gantry through the door, black server racks, a shelf of coloured discs with eye slits.',
    hero: 'A glossy black sphere with two white eye slits, cut from paper.',
    portrait: 'Cut-paper illustration of Elon Musk',
    person: 'Elon Musk',                                        // the caption a tap on the portrait shows: the name only
  },
  character: { kind: 'orb3d', floor: 3, size: 1.0 },            // a real sphere whose eyes follow the pointer
  backdrop: { y: -5.0, turn: -0.03, full: true },              // hung low and a little right: the name stands on the pale wall, above the black racks and left of the gantry
  props: [
    { file: 2, z: -9, x: 11.0, y: 2.45, w: 2.0 },               // prop-2: the rocket and its gantry, far right
    { file: 3, z: -6, x: -4.3, y: 1.44, w: 1.6 },               // prop-3: a server rack, at the left edge
    { file: 1, z: -3.5, x: 7.5, y: 0.55, w: 3.0 },              // prop-1: the car with no badge, low on the right
  ],
  fore: { z: 3.2, x: 3.2, y: 0.12, w: 5 },
  portrait: { x: 12.4, y: 5.5 },
  dust: '#FFFFFF',
  signature: 'xai',
  myth: 'xai-myth-runs-on-grok',
  catchFloor: 5,
};
