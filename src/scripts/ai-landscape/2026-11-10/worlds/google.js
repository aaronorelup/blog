// Google's world (SPEC 2.5.3, brand sheet in 3.2): a night stage in black paper lit by four lanterns.
// Only looks and placement live here. Every name, number and date on screen comes from the data file.
// brandMode: Google's own guidelines speak against its colours in other people's work (SPEC 10, item 1).
import { artOf, mark } from './_default.js';

export default {
  id: 'google',
  brandMode: 'full',                       // or 'marks-only': glass, glow and line go house grey, the rest stays
  theme: { chrome: 'dark', ground: '#101115', ink: '#F8F9FA', glass: '#378AFF', rim: '#FFFFFF', glow: '#378AFF', line: '#378AFF',
    prism: ['#E0C027', '#D55F74', '#378AFF', '#29B585'] },     // the four brand colours, blended through the glass
  hour: { lamp: [0.15, 0.9, -0.3], warmth: 0 },                // lantern light from overhead, a little behind
  // the G in full colour on a white plate. The file carries its own clear space of one G width
  marks: { lid: mark('google', 'google-g'), of: 'name', plate: 'white', clear: 'own' },
  art: artOf('google'),
  alt: {
    plate: 'A night stage in black paper: four hanging lanterns in yellow, red, blue and green, two doors, a search bar, a wall of small drawers and paper stars on threads.',
    hero: 'A four-point star lantern in pale paper, lit from inside in four colours.',
    portrait: 'Cut-paper illustration of Sundar Pichai',
    person: 'Sundar Pichai',
  },
  character: { kind: 'sprite', floor: 1, size: 0.9 },           // no router floor to stand on: the lantern floats at floor 1
  backdrop: { y: -3.6, turn: 0 },
  props: [
    { file: 3, z: -3.5, x: 7.2, y: 0.98, w: 2.2 },              // prop-3: the drawers of the index under a magnifying glass, low on the right
    { file: 2, z: -6, x: -4.0, y: 0.84, w: 1.35 },              // prop-2: a banana on a stool, at the left
    { file: 1, z: -9, x: 11.25, y: 1.42, w: 1.65 },             // prop-1: a door left ajar, at the right edge
  ],
  fore: { z: 3.2, x: 5.0, y: 0.06, w: 3.3 },                   // four footlights at the front edge, right of the stack
  portrait: { x: 12.9, y: 5.2 },
  dust: '#F8F9FA',
  signature: 'google',
  myth: 'google-myth-one-agent',
  catchFloor: 1,
};
