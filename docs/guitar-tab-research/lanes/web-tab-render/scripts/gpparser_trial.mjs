// guitarpro-parser 2.0.0 under Node: parse a Guitar Pro file (format detected from bytes), schedule track 1 with
// its timing code, and write {onset, pitch, string, fret} JSON for gtr-eval. Field names are read defensively
// because they come from the package, and the first scheduled entries are printed so the mapping can be checked.
// Usage: node gpparser_trial.mjs <in> <out.json>
import fs from 'node:fs';
const m = await import('/home/user/gtr/lanes/web-tab-render/web/node_modules/guitarpro-parser/dist/index.js');
const [, , inFile, out] = process.argv;
const t0 = performance.now();
const song = m.parseGuitarPro(fs.readFileSync(inFile));
const tParse = performance.now() - t0;
const track = song.tracks[0];
const timeline = m.buildTimeline(song);
const sched = m.scheduleTrack(song, track, timeline);
const tAll = performance.now() - t0;
const pick = (o, keys) => { for (const k of keys) if (o && o[k] !== undefined) return o[k]; return undefined; };
const sample = sched.slice(0, 2).map((e) => ({ keys: Object.keys(e), noteKeys: Object.keys(e.note || {}), note: e.note, startMs: e.startMs, endMs: e.endMs }));
const trackKeys = Object.keys(track);
const tuning = pick(track, ['tuning', 'strings', 'stringTuning']);
const capo = pick(track, ['capo', 'capoFret', 'offset']);
const notes = sched.map((e) => ({
  onset: +(e.startMs / 1000).toFixed(6),
  pitch: pick(e.note, ['midi', 'pitch', 'value']),
  string: pick(e.note, ['string', 'stringNumber']),
  fret: pick(e.note, ['fret']),
}));
fs.writeFileSync(out, JSON.stringify({ tuning_raw: tuning, capo_raw: capo, notes }, null, 1));
console.log(JSON.stringify({ ms_parse: tParse, ms_total: tAll, format: song.format || song.version || null, title: song.title,
  tracks: song.tracks.length, trackKeys, tuning, capo, scheduled: sched.length, sample }, null, 1).slice(0, 3000));
