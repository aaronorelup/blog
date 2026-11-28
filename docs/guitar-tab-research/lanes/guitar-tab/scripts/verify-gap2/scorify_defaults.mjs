// verify-gapfill-guitar-tab, round 2: print scorify 0.4.0's default player (maestro), the amateur level, and the
// classicalGuitar() preset strings, to check the values trials.md quotes. usage: node scorify_defaults.mjs
const base = "/home/user/gtr/lanes/guitar-tab/node-scorify/node_modules/scorify/dist/";
const { compilePlayer } = await import(base + "profiles.mjs");
const { classicalGuitar } = await import(base + "index.mjs");
const pick = (p) => Object.fromEntries(["level", "maxFretSpan", "maxShiftFretsPerSecond", "fingerSetupSeconds", "maxPolyphony",
  "maxAttacksPerSecond", "maxPickedPerBar", "minDuration", "maxFret", "rightHand"].map((k) => [k, p[k]]));
console.log("default", JSON.stringify(pick(compilePlayer({}))));
console.log("amateur", JSON.stringify(pick(compilePlayer({ level: "amateur" }))));
const amateur = compilePlayer({ level: "amateur" });
console.log("amateur keys mentioning fret:", Object.keys(amateur).filter((k) => /fret/i.test(k)).map((k) => `${k}=${JSON.stringify(amateur[k])}`).join("; "));
const g = classicalGuitar();
console.log("classicalGuitar strings:", JSON.stringify((g.strings ?? []).map((s) => ({ id: s.id, number: s.number, open: s.openPitch, frets: s.fretCount, capo: s.capoFret }))));
console.log("classicalGuitar keys:", Object.keys(g).join(", "));
