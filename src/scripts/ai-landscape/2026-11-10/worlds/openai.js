// OpenAI's world (SPEC 2.5.2, brand sheet in 3.2): a bright white gallery at noon, with very soft shadows.
// Only looks and placement live here. Every name, number and date on screen comes from the data file.
// The lid mark is the default one of worlds/_default.js: black on a white plate, alone, with more open space than any other.
import { artOf } from './_default.js';

export default {
  id: 'openai',
  brandMode: 'full',                       // or 'marks-only': glass, glow and line go house grey (SPEC 10)
  theme: { chrome: 'light', ground: '#E6E5E4', ink: '#0D0D0D', glass: '#F3F3F3', rim: '#0D0D0D', glow: '#FFFFFF', line: '#0D0D0D' },
  hour: { lamp: [-0.14, 1, -0.22], warmth: 0 },                // noon: the lamp almost overhead
  marks: { of: 'name', plate: 'white', clear: 0.75 },          // never tinted, never beside the wordmark, three quarters of its height clear
  art: artOf('openai'),
  alt: {
    plate: 'A white paper gallery at noon: low plinths, a pill-shaped bar on the wall, a shelf of fuzzy balls in many colours, a laptop and a phone.',
    hero: 'A round yellow felt figure with round black glasses and a small bow tie.',
    // no portrait file exists for this world. When art/openai/portrait.webp lands, name its subject here:
    // portrait: 'Cut-paper illustration of <name>', person: '<name>'. Until then no frame is hung
  },
  character: { kind: 'sprite', floor: 3, size: 1.15 },
  backdrop: { y: -3.8, turn: -0.1 },                            // the plain wall inside the right arch stands right of the callouts
  props: [
    { file: 3, z: -3.5, x: 7.6, y: 1.1, w: 2.6 },               // prop-3: an empty frame under a dust sheet, low on the right
    { file: 2, z: -12, x: -5.9, y: 0.68, w: 1.7 },              // prop-2: three fuzzy balls on the floor, far back on the left
  ],                                                            // prop-1, a second laptop on a plinth, is left out: the plate has one, and two crowded the frame
  fore: { z: 3.2, x: 6.0, y: -0.3, w: 5 },
  portrait: { x: 12.0, y: 5.9 },                                // where the frame hangs once its picture exists
  dust: '#C9CDD5',
  signature: 'openai',
  myth: 'openai-myth-voice',
  catchFloor: 5,
};
