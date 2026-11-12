// gap round 2: find the shortest prefix of a scorify input (in onset order) that scorify 0.4.0 cannot arrange with the
// same options as gap2_run_scorify.mjs (exact mode, default player), by bisection, and print the notes around it.
// usage: SCORIFY_PATH=.../dist/index.mjs node gap2_scorify_prefix.mjs <x.scorify.in.json>
import { readFileSync } from "node:fs";
const { createScore, parsePitch, q, arrange, classicalGuitar } = await import(process.env.SCORIFY_PATH);
const inp = JSON.parse(readFileSync(process.argv[2], "utf8"));
const instrument = classicalGuitar(inp.tuning ? { tuning: inp.tuning, capoFret: inp.capo || 0 } : { capoFret: inp.capo || 0 });
function run(k) {
  const notes = inp.notes.slice(0, k).map((n) => ({ id: n.id, pitch: parsePitch(n.name), onset: q(n.tick, inp.ppq),
    duration: q(Math.max(1, n.durTicks), inp.ppq), partId: "guitar", voiceId: "v1", role: "unknown" }));
  const score = createScore(notes, { tempoMap: inp.tempoMap.map((t) => ({ at: q(t.tick, inp.ppq), quarterBpm: t.bpm })),
    meterMap: [{ at: q(0), numerator: inp.meter[0], denominator: inp.meter[1] }], parts: [{ id: "guitar", voices: ["v1"] }] });
  return arrange(score, { instrument, mode: "exact" });
}
let lo = 1, hi = inp.notes.length;              // invariant: run(lo) succeeds (checked), run(hi) fails
if (run(hi).status === "success") { console.log("whole input succeeds"); process.exit(0); }
if (run(lo).status !== "success") { console.log("fails with the first note alone"); process.exit(0); }
while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (run(mid).status === "success") lo = mid; else hi = mid; }
const r = run(hi);
console.log(`${inp.name}: the first ${lo} notes arrange; the first ${hi} do not (${r.status}: ${(r.diagnostics || []).join(" | ")})`);
const sec = (t) => t / inp.ppq * 60 / inp.tempoMap[0].bpm;
for (const n of inp.notes.slice(Math.max(0, hi - 6), hi)) {
  console.log(`  ${n.id} ${n.name} onset ${sec(n.tick).toFixed(3)} s, ends ${sec(n.tick + n.durTicks).toFixed(3)} s`);
}
