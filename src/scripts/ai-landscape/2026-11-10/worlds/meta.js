// Meta's world (SPEC 2.5.4, brand sheet in 3.2): an open morning sky in pale blue and white paper.
// Only looks and placement live here. Every name, number and date on screen comes from the data file.
// brandMode: Meta's page says logo use needs approval (SPEC 10, item 2). The owner may flip it.
import { artOf, mark } from './_default.js';

export default {
  id: 'meta',
  brandMode: 'full',                       // or 'marks-only': glass, glow and line go house grey, the rest stays
  theme: { chrome: 'light', ground: '#F1F4F7', ink: '#1C2B33', glass: '#0064D4', rim: '#DBECFF', glow: '#0064D4', line: '#0064D4' },
  hour: { lamp: [-0.55, 0.6, 0.4], warmth: 0.2 },              // morning sun, low from the front left
  // the company logo in one ink colour (the file in marks/meta/ and where it came from: its SOURCE.txt).
  // The file's own box is half again as tall as the symbol, so one box height clear on every side leaves close
  // to twice the symbol's height, and the symbol stays over 12 px on a lid in the row
  marks: { lid: mark('meta', 'meta-logo'), of: 'name', plate: 'white', clear: 1 },
  art: artOf('meta'),
  alt: {
    plate: 'A morning sky in pale blue and white paper: layers of cloud, one blue ribbon looping across like handwriting, floating blank panels and a felt hill.',
    hero: 'A small cream felt figure with a rounded hood and a simple face.',
    portrait: 'Cut-paper illustration of Mark Zuckerberg',
    person: 'Mark Zuckerberg',
  },
  character: { kind: 'sprite', floor: 3, size: 1.05 },
  backdrop: { y: -3.4, turn: 0 },
  props: [
    { file: 2, z: -6, x: -4.1, y: 1.2, w: 1.55 },               // prop-2: a white paper gate, at the left
    { file: 1, z: -3.5, x: 7.3, y: 0.62, w: 2.2 },              // prop-1: glasses on a stand, low on the right
    { file: 3, z: -9, x: 10.95, y: 4.7, w: 1.8 },               // prop-3: blank speech panels and an envelope, afloat at the upper right
  ],
  fore: { z: 3.2, x: 3.3, y: 0.3, w: 5.4 },                    // a bank of cloud with a loop of blue ribbon
  portrait: { x: 12.4, y: 5.6 },
  dust: '#FFFFFF',
  signature: 'meta',
  myth: 'meta-myth-2',
  catchFloor: 5,
};
