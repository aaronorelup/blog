// gap round 2 (guitar-tab lane): run scorify 0.4.0 (npm) `arrange` on a note list and write the string and fret it
// gives each note. Input JSON (written by gap2_run_scorify.py): {ppq, tempoMap: [{tick, bpm}], meter: [num, den],
// notes: [{id, tick, durTicks, name}], tuning: [names, low to high] | null, capo, level | null, rightHand | null,
// pin: {id, string} | null}. Output JSON: {status, diagnostics, optimality, stats, cost, difficulty, ms, notes: [{id, string,
// relativeFret, absoluteFret, finger}]}.
// Note times are exact rationals q(tick, ppq) in quarter notes; every note is in one part and one voice, role "unknown";
// mode "exact" (the default: "Preserve transformed pitches, multiplicity, timing and holds; search physical
// realizations") unless the input names another mode, adaptation permissions or search limits. The pin, when given, is a `scoring` hook (scorify's documented custom cost): any realization that puts
// the pinned note on another string costs 1000 more. It is a soft constraint, not a hard one.
import { readFileSync, writeFileSync } from "node:fs";
const { createScore, parsePitch, pitchString, pitchToMidi, q, arrange, classicalGuitar } = await import(process.env.SCORIFY_PATH);   // .../node_modules/scorify/dist/index.mjs

const [inPath, outPath] = process.argv.slice(2);
const inp = JSON.parse(readFileSync(inPath, "utf8"));
const notes = inp.notes.map((n) => ({
  id: n.id, pitch: parsePitch(n.name), onset: q(n.tick, inp.ppq), duration: q(Math.max(1, n.durTicks), inp.ppq),
  partId: "guitar", voiceId: "v1", role: "unknown",
}));
const score = createScore(notes, {
  tempoMap: inp.tempoMap.map((t) => ({ at: q(t.tick, inp.ppq), quarterBpm: t.bpm })),
  meterMap: [{ at: q(0), numerator: inp.meter[0], denominator: inp.meter[1] }],
  parts: [{ id: "guitar", voices: ["v1"] }],
});
const instOpts = {};
if (inp.tuning) instOpts.tuning = inp.tuning;
if (inp.capo) instOpts.capoFret = inp.capo;
const instrument = classicalGuitar(instOpts);
const player = {};
if (inp.level) player.level = inp.level;
player.overrides = {};
if (inp.rightHand) player.overrides.rightHand = inp.rightHand;
for (const [k, v] of Object.entries(inp.overrides ?? {}))        // e.g. {"minDuration": [1, 256], "maxAttacksPerSecond": 64}
  player.overrides[k] = Array.isArray(v) ? q(v[0], v[1]) : v;
const options = { instrument, mode: inp.mode ?? "exact", player };
if (inp.adaptation) options.adaptation = inp.adaptation;     // adaptive mode only, e.g. {allowHoldShortening: true}
if (inp.search) options.search = inp.search;                 // e.g. {beamWidth: 512, maxExpandedStates: 5000000}
if (inp.pin) {
  options.scoring = {
    id: `pin-${inp.pin.id}-string-${inp.pin.string}`,
    cost: (frame, realization) => {
      for (const a of realization.assignments ?? []) {
        if (a.noteIds.includes(inp.pin.id) && a.stringNumber !== inp.pin.string) return 1000;
      }
      return 0;
    },
  };
}
const t0 = performance.now();
const r = arrange(score, options);
const ms = performance.now() - t0;
const out = { status: r.status, diagnostics: r.diagnostics ?? [], stats: r.stats, ms, notes: [] };
if (r.status === "success") {
  out.optimality = r.optimality; out.cost = r.cost; out.difficulty = r.difficulty; out.assumptions = r.assumptions;
  out.edits = r.edits.map((e) => ({ kind: e.kind, sourceIds: e.sourceIds, before: e.before, after: e.after, reason: e.reason }));
  out.profileLevel = r.profile.level;
  out.sourceMap = r.sourceMap;
  out.outputNotes = r.score.notes.map((n) => ({ id: n.id, midi: pitchToMidi(pitchString(n.pitch)), onset: n.onset,
    duration: n.duration, gateDuration: n.gateDuration ?? null }));
  const seen = new Map();
  for (const a of r.annotations) {
    for (const asg of a.assignments) {
      for (const id of asg.noteIds) {
        if (!seen.has(id)) seen.set(id, { id, string: asg.stringNumber, relativeFret: asg.relativeFret,
          absoluteFret: asg.absoluteFret, finger: asg.finger });
      }
    }
  }
  out.notes = [...seen.values()];
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(`scorify ${inp.name}: status ${r.status}${r.optimality ? " (" + r.optimality + ")" : ""}, arrange ${ms.toFixed(1)} ms, ` +
  `notes in ${notes.length}, notes placed ${out.notes.length}` + (out.diagnostics.length ? `, diagnostics: ${out.diagnostics.join(" | ").slice(0, 400)}` : ""));
