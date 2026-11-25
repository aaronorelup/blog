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
    hero: 'A four-point star with rounded points, in a soft blend of yellow, red, blue and green. This page\'s own drawing after the Gemini spark, not Google\'s file.',
    portrait: 'Cut-paper illustration of Sundar Pichai',
    person: 'Sundar Pichai',
  },
  // no router floor to stand on: the star floats at floor 1, a little smaller there so it clears the chrome. `out`: it
  // stands that much further from its stack on a longer ledge, one plate width clear of the G plate (never a pair with it)
  character: { kind: 'sprite', floor: 1, size: 0.9, perch: 0.78, out: 0.42 },
  backdrop: { y: -4.45, turn: -0.1 },
  props: [
    { file: 3, z: -3.5, x: 7.2, y: 0.98, w: 2.2 },              // prop-3: the drawers of the index under a magnifying glass, low on the right
    { file: 2, z: -6, x: -4.0, y: 0.84, w: 1.35 },              // prop-2: a banana on a stool, at the left
    // prop-1, a second door at the right edge, is left out: it stood half out of the frame, across the drawers
  ],
  fore: { z: 5.6, x: 2.36, y: 0.35, w: 3.3 },                  // four footlights at the front edge, right of the stack: close enough that their feet are below the frame
  // the frame hangs on the dark stretch of the wall right of the callouts, its white mat as on the other four. Hung in the
  // studio pass: a first portrait did not read as its person; it was left out, then taken out of the tree (round 3, F3-5)
  portrait: { x: 14.3, y: 5.05 },                              // null hangs none in this room (worlds/index.js PORTRAITS switches all five)
  dust: '#F8F9FA',
  signature: 'google',
  myth: 'google-myth-one-agent',
  stamps: { 'google-myth-veo': 0 },        // its stamp is a sentence of the fact: the short form alone leaves the strike's idea standing
  catchFloor: 1,
};
