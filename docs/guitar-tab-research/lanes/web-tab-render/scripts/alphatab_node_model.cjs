// alphaTab under plain Node (no DOM, no browser): load a score file, dump the model, write MIDI,
// export Guitar Pro 7 (.gp) and alphaTex, re-import both, and write a {onset,pitch,string,fret} JSON
// that gtr-eval can score.
// Usage: node alphatab_node_model.cjs <input score file> <out dir> <tag>
const fs = require('fs');
const path = require('path');
const alphaTab = require('/home/user/gtr/lanes/web-tab-render/web/node_modules/@coderline/alphatab');

const [, , inFile, outDir, tag] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const t0 = process.hrtime.bigint();
const ms = () => Number(process.hrtime.bigint() - t0) / 1e6;
const log = {};

function load(bytes) {
  const settings = new alphaTab.Settings();
  return alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(bytes), settings);
}

// Seconds of every beat from the MIDI tick lookup that alphaTab's own MIDI generator builds,
// so tempo changes, repeats and the playback model are those of alphaTab itself.
function generateMidi(score) {
  const settings = new alphaTab.Settings();
  const midiFile = new alphaTab.midi.MidiFile();
  const handler = new alphaTab.midi.AlphaSynthMidiFileHandler(midiFile, true);
  const gen = new alphaTab.midi.MidiFileGenerator(score, settings, handler);
  gen.generate();
  return { midiFile, gen };
}

function dump(score, label) {
  const out = {
    label,
    title: score.title, artist: score.artist, album: score.album, music: score.music, tab: score.tab,
    tempo: score.tempo, tempoLabel: score.tempoLabel,
    masterBars: score.masterBars.length,
    timeSignatures: [...new Set(score.masterBars.map((m) => m.timeSignatureNumerator + '/' + m.timeSignatureDenominator))],
    tempoAutomations: score.masterBars.flatMap((m) => (m.tempoAutomations || []).map((a) => ({ bar: m.index, ratio: a.ratioPosition, value: a.value }))),
    tracks: [],
  };
  const notes = [];
  // tick -> seconds with a single tempo map built from masterBar tempo automations
  const tempoMap = [];
  for (const mb of score.masterBars) {
    for (const a of (mb.tempoAutomations || [])) tempoMap.push({ tick: mb.start + a.ratioPosition * mb.calculateDuration(), bpm: a.value });
  }
  if (!tempoMap.length || tempoMap[0].tick > 0) tempoMap.unshift({ tick: 0, bpm: score.tempo });
  tempoMap.sort((a, b) => a.tick - b.tick);
  const tickToSec = (tick) => {
    // piecewise-constant tempo; entries at the same tick give zero-length segments
    let s = 0;
    for (let i = 0; i < tempoMap.length; i++) {
      const cur = tempoMap[i];
      const nextTick = i + 1 < tempoMap.length ? tempoMap[i + 1].tick : Infinity;
      if (tick <= cur.tick) break;
      const end = Math.min(tick, nextTick);
      s += ((end - cur.tick) / 960) * (60 / cur.bpm);
    }
    return s;
  };
  for (const track of score.tracks) {
    const t = { index: track.index, name: track.name, shortName: track.shortName, program: track.playbackInfo.program,
      primaryChannel: track.playbackInfo.primaryChannel, isPercussion: track.isPercussion, staves: [] };
    for (const staff of track.staves) {
      const st = { index: staff.index, showTablature: staff.showTablature, showStandardNotation: staff.showStandardNotation,
        tuning_top_to_bottom: staff.tuning, tuningName: staff.stringTuning ? staff.stringTuning.name : null,
        capo: staff.capo, transpositionPitch: staff.transpositionPitch, displayTranspositionPitch: staff.displayTranspositionPitch,
        isPercussion: staff.isPercussion, bars: staff.bars.length, voicesPerBar: Math.max(...staff.bars.map((b) => b.voices.length)),
        beats: 0, restBeats: 0, notes: 0 };
      const nStr = staff.tuning.length;
      for (const bar of staff.bars) {
        for (const voice of bar.voices) {
          for (const beat of voice.beats) {
            st.beats++;
            if (beat.isRest) st.restBeats++;
            for (const note of beat.notes) {
              st.notes++;
              if (note.isTieDestination) continue;
              const absTick = bar.masterBar.start + beat.playbackStart;
              const onset = tickToSec(absTick);
              notes.push({
                track: track.index, staff: staff.index, bar: bar.index, voice: voice.index,
                onset: +onset.toFixed(6), tick: absTick,
                duration_ticks: beat.playbackDuration,
                pitch: note.realValue,
                string_alphatab: note.string,
                // alphaTab: string 1 = lowest string. Truth/Guitar Pro convention: string 1 = highest.
                string: nStr ? nStr - note.string + 1 : null,
                fret: note.fret,
                isTieDestination: note.isTieDestination,
                isDead: note.isDead,
              });
            }
          }
        }
      }
      t.staves.push(st);
    }
    out.tracks.push(t);
  }
  // the estimate for gtr-eval: notes of the first track's staves that have a string tuning (tablature staves);
  // a MusicXML file with a notation staff and a TAB staff imports as one track with two staves
  const tr0 = score.tracks[0];
  const tabStaff = tr0.staves.find((st) => st.tuning && st.tuning.length) || tr0.staves[0];
  const estNotes = notes.filter((n) => n.track === tr0.index && tr0.staves[n.staff].tuning && tr0.staves[n.staff].tuning.length);
  return { model: out, est: { tuning_midi: [...tabStaff.tuning].reverse(), capo: tabStaff.capo, est_staff: tabStaff.index,
    notes: estNotes.length ? estNotes : notes } };
}

const bytes = fs.readFileSync(inFile);
let texDiagnostics = null;
let score;
if (/\.(atex|alphatex|txt)$/i.test(inFile)) {
  // alphaTex text: parse with the AlphaTexImporter so its diagnostics (errors, warnings) can be recorded
  const imp = new alphaTab.importer.AlphaTexImporter();
  imp.initFromString(bytes.toString('utf8'), new alphaTab.Settings());
  try {
    score = imp.readScore();
  } catch (e) {
    const bag = (b) => (b && b.items ? b.items.map((d) => ({ severity: d.severity, code: d.code, message: d.message, line: d.start && d.start.line, col: d.start && d.start.col })) : null);
    console.log(JSON.stringify({ error: String(e && e.message || e), lexer: bag(e.lexerDiagnostics), parser: bag(e.parserDiagnostics), semantic: bag(e.semanticDiagnostics) }, null, 1));
    process.exit(1);
  }
  texDiagnostics = Object.fromEntries(['lexerDiagnostics', 'parserDiagnostics', 'semanticDiagnostics']
    .map((k) => [k, imp[k] && imp[k].items ? imp[k].items.map((d) => ({ severity: d.severity, code: d.code, message: d.message, line: d.start && d.start.line })) : null]));
} else {
  score = load(bytes);
}
log.load_ms = ms();
const d = dump(score, 'imported ' + path.basename(inFile));
fs.writeFileSync(path.join(outDir, tag + '.model.json'), JSON.stringify(d.model, null, 1));
fs.writeFileSync(path.join(outDir, tag + '.est.json'), JSON.stringify(d.est, null, 1));

// MIDI generated by alphaTab
const { midiFile } = generateMidi(score);
fs.writeFileSync(path.join(outDir, tag + '.alphatab.mid'), Buffer.from(midiFile.toBinary()));
log.midi_ms = ms();

// Guitar Pro 7 export and re-import
const gpBytes = new alphaTab.exporter.Gp7Exporter().export(score, new alphaTab.Settings());
fs.writeFileSync(path.join(outDir, tag + '.export.gp'), Buffer.from(gpBytes));
const score2 = load(gpBytes);
const d2 = dump(score2, 're-imported ' + tag + '.export.gp');
fs.writeFileSync(path.join(outDir, tag + '.export.gp.model.json'), JSON.stringify(d2.model, null, 1));
fs.writeFileSync(path.join(outDir, tag + '.export.gp.est.json'), JSON.stringify(d2.est, null, 1));
log.gp7_ms = ms();

// alphaTex export and re-import
const tex = new alphaTab.exporter.AlphaTexExporter().exportToString(score, new alphaTab.Settings());
fs.writeFileSync(path.join(outDir, tag + '.export.atex'), tex);
const score3 = alphaTab.importer.ScoreLoader.loadAlphaTex(tex, new alphaTab.Settings());
const d3 = dump(score3, 're-imported ' + tag + '.export.atex');
fs.writeFileSync(path.join(outDir, tag + '.export.atex.est.json'), JSON.stringify(d3.est, null, 1));
fs.writeFileSync(path.join(outDir, tag + '.export.atex.model.json'), JSON.stringify(d3.model, null, 1));
log.atex_ms = ms();

log.texDiagnostics = texDiagnostics;
log.counts = {
  imported_notes: d.est.notes.length, gp_reimport_notes: d2.est.notes.length, atex_reimport_notes: d3.est.notes.length,
  gp_bytes: gpBytes.length, atex_chars: tex.length,
};
log.first10 = d.est.notes.slice(0, 10);
console.log(JSON.stringify(log, null, 1));
