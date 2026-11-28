// Tonal and ChordSheetJS under plain Node.
// 1. Tonal: for every chord segment of a truth file, take the pitch classes of the notes sounding in it and ask
//    Chord.detect() for names; compare the first name's root and quality with the truth Harte label (as a fact table).
// 2. ChordSheetJS: parse a ChordPro sheet (written here from the S3 truth chord labels), transpose it, and format it as
//    text and HTML; parse a chords-over-words sheet; record what the parsed song exposes.
// Usage: node tonal_chordsheet_trial.mjs <id>.truth.json <out prefix>
import fs from 'node:fs';
const NM = '/home/user/gtr/lanes/web-tab-render/web/node_modules/';
const { Chord, Note, Midi, Key } = await import(NM + 'tonal/dist/index.mjs').catch(async () => import(NM + 'tonal/dist/index.js'));
const csjs = await import(NM + 'chordsheetjs/lib/module.js');
const ChordSheetJS = csjs.default || csjs;

const [, , truthPath, outPrefix] = process.argv;
const t = JSON.parse(fs.readFileSync(truthPath, 'utf8'));
const res = { tonal: {}, chordsheetjs: {} };

// --- Tonal ---
const harteToSimple = (lab) => {
  if (lab === 'N') return null;
  const [root, qual = 'maj'] = lab.split(':');
  return { root, qual: qual.split('/')[0] };
};
const rows = [];
let t0 = performance.now();
for (const seg of t.chords) {
  if (seg.label === 'N') continue;
  const sounding = t.notes.filter((n) => n.onset < seg.end && n.offset > seg.start && n.voice !== 'drums');
  const pcs = [...new Set(sounding.map((n) => Midi.midiToNoteName(n.pitch, { sharps: true, pitchClass: true })))];
  const bass = sounding.length ? Midi.midiToNoteName(Math.min(...sounding.map((n) => n.pitch)), { sharps: true, pitchClass: true }) : null;
  // Chord.detect expects notes; ordering the bass note first lets it report inversions
  const ordered = bass ? [bass, ...pcs.filter((p) => p !== bass)] : pcs;
  const detected = Chord.detect(ordered);
  rows.push({ start: seg.start, end: seg.end, truth: seg.label, pitch_classes: ordered, detected: detected.slice(0, 4) });
}
res.tonal.ms = performance.now() - t0;
res.tonal.rows = rows;
// first detected name vs truth: same root (enharmonic-safe via Note.chroma) and same triad quality
let same = 0;
for (const r of rows) {
  const tr = harteToSimple(r.truth);
  const d = r.detected[0] ? Chord.get(r.detected[0]) : null;
  const rootOk = d && tr && Note.chroma(d.tonic || '') === Note.chroma(tr.root);
  const isMinor = d && (d.quality === 'Minor');
  const qualOk = d && tr && ((tr.qual.startsWith('min') && isMinor) || (tr.qual.startsWith('maj') && d.quality === 'Major') || (tr.qual === '7' && d.aliases && d.aliases.includes('7')));
  r.first_detected_root_matches = !!rootOk;
  r.first_detected_quality_matches = !!qualOk;
  if (rootOk && qualOk) same++;
}
res.tonal.segments = rows.length;
res.tonal.first_name_same_root_and_quality = same;
res.tonal.examples = {
  'Chord.get("G")': Chord.get('G').notes, 'Chord.get("Bm")': Chord.get('Bm').notes,
  'Key.majorKey("G").chords': Key.majorKey('G').chords, 'Note.transpose("E2","3M")': (await import(NM + 'tonal/dist/index.mjs').catch(async () => import(NM + 'tonal/dist/index.js'))).Note.transpose('E2', '3M'),
};

// --- ChordSheetJS ---
const labels = t.chords.filter((c) => c.label !== 'N').map((c) => {
  const h = harteToSimple(c.label);
  return h.root + (h.qual.startsWith('min') ? 'm' : h.qual === '7' ? '7' : '');
});
const chordpro = ['{title: S3 progression (from the truth chord labels)}', '{key: G}', '{tempo: 96}', '{capo: 0}', '',
  '{start_of_verse}', labels.map((l) => `[${l}]la `).join(''), '{end_of_verse}', ''].join('\n');
fs.writeFileSync(outPrefix + '.chordpro', chordpro);
t0 = performance.now();
const song = new ChordSheetJS.ChordProParser().parse(chordpro);
const text = new ChordSheetJS.TextFormatter().format(song);
const html = new ChordSheetJS.HtmlDivFormatter().format(song);
let transposed = null;
try { transposed = new ChordSheetJS.ChordProFormatter().format(song.transpose(2)); } catch (e) { transposed = 'transpose failed: ' + e; }
const overWords = 'G      C        D\nTwinkle twinkle little star\n';
const song2 = new ChordSheetJS.ChordsOverWordsParser().parse(overWords);
res.chordsheetjs = {
  ms: performance.now() - t0,
  metadata: { title: song.title, key: song.key, tempo: song.metadata.get ? song.metadata.get('tempo') : null, capo: song.capo },
  chords_in_sheet: song.lines.flatMap((l) => l.items.filter((i) => i.chords).map((i) => i.chords)),
  text_out: text, html_chars: html.length, transposed_plus2: transposed,
  chords_over_words_to_chordpro: new ChordSheetJS.ChordProFormatter().format(song2),
};
fs.writeFileSync(outPrefix + '.json', JSON.stringify(res, null, 1));
fs.writeFileSync(outPrefix + '.chordsheet.html', html);
console.log(JSON.stringify({ tonal_segments: rows.length, tonal_same: same, tonal_ms: res.tonal.ms,
  first_rows: rows.slice(0, 4), cs: { metadata: res.chordsheetjs.metadata, chords: res.chordsheetjs.chords_in_sheet, transposed: String(transposed).slice(0, 300) } }));
