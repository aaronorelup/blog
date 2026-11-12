// gap round 2: scorify 0.4.0 limitsExceeded (subpath scorify/songs: "Which limits of a difficulty the source itself exceeds
// at a tempo, before any fingering is searched") on the scorify inputs of R1a, R1b, R1c and S2n, at levels maestro and amateur.
// usage: node gap2_scorify_limits.mjs   (reads /home/user/gtr/lanes/guitar-tab/gap2/scorify/<clip>.truthmidi.scorify.in.json)
import { readFileSync } from "node:fs";
const base = "/home/user/gtr/lanes/guitar-tab/node-scorify/node_modules/scorify/dist/";
const { createScore, parsePitch, q } = await import(base + "index.mjs");
const { limitsExceeded } = await import(base + "songs.mjs");
for (const c of ["R1a", "R1b", "R1c", "S2n"]) {
  const inp = JSON.parse(readFileSync(`/home/user/gtr/lanes/guitar-tab/gap2/scorify/${c}.truthmidi.scorify.in.json`, "utf8"));
  const notes = inp.notes.map((n) => ({ id: n.id, pitch: parsePitch(n.name), onset: q(n.tick, inp.ppq), duration: q(Math.max(1, n.durTicks), inp.ppq), partId: "guitar", voiceId: "v1", role: "unknown" }));
  const score = createScore(notes, { tempoMap: inp.tempoMap.map((t) => ({ at: q(t.tick, inp.ppq), quarterBpm: t.bpm })), meterMap: [{ at: q(0), numerator: inp.meter[0], denominator: inp.meter[1] }], parts: [{ id: "guitar", voices: ["v1"] }] });
  for (const level of ["maestro", "amateur"]) {
    try { console.log(c, level, JSON.stringify(limitsExceeded({ beat: 1, bpm: inp.tempoMap[0].bpm }, score, { level }))); }
    catch (e) { console.log(c, level, "ERR", e.message); }
  }
}
