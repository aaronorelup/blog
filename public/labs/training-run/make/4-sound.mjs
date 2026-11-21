// Step 4. The sound of a run: node 4-sound.mjs main  ->  out/main.wav   (then: ffmpeg -i out/main.wav -b:a 128k main.mp3)
// An ending that starts at 20:00 borrows the first 20:00 from main, which is the same in all of them.
import fs from 'node:fs';
import { render, wavBytes } from '../synth.js';
const name = process.argv[2] || 'main';
const read = (n) => JSON.parse(fs.readFileSync(new URL(`./out/${n}.json`, import.meta.url), 'utf8'));
const run = read(name);
let notes = run.notes;
if (notes[0].g !== 0) notes = read('main').notes.slice(0, notes[0].g).concat(notes);
const a = render(notes, run.P, { lo: run.lo });
fs.writeFileSync(new URL(`./out/${name}.wav`, import.meta.url), wavBytes(a.L, a.R, a.sr));
console.error(name + '.wav', a.seconds.toFixed(1), 'seconds');
