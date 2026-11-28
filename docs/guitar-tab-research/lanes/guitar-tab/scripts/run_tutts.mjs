// Run tutts 0.1.0 (TypeScript port of tuttut, npm) on a note list prepared by run_tutts.py.
// usage: node run_tutts.mjs <in.json> <out prefix>
// in.json: {"notes":[{midi,startBeats,durationBeats}], "tuning":[note names thin->thick], "nfrets":20,
//           "tempo":bpm, "timeSignatures":[...] (optional), "quantizeGrid": "1/16" (optional)}
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const tuttsPath = process.env.TUTTS_PATH;           // path to node_modules/tutts/dist/index.js
const { generateTab, Tuning } = await import(tuttsPath);
const inp = JSON.parse(readFileSync(process.argv[2], "utf8"));
const t0 = performance.now();
const args = { notes: inp.notes, tuning: new Tuning(inp.tuning, inp.nfrets), tempo: inp.tempo };
if (inp.timeSignatures) args.timeSignatures = inp.timeSignatures;
if (inp.quantizeGrid) args.quantizeGrid = inp.quantizeGrid;
const tab = generateTab(args);
const t1 = performance.now();
writeFileSync(process.argv[3] + ".tutts.json", JSON.stringify(tab.data, null, 1));
writeFileSync(process.argv[3] + ".tutts.txt", tab.toAscii({ maxWidth: 120 }));
let n = 0; for (const m of tab.data.measures) for (const e of m.events) n += (e.notes || []).length;
console.log(`tutts: notes in ${inp.notes.length}, notes out ${n}, generateTab ${(t1 - t0).toFixed(1)} ms`);
