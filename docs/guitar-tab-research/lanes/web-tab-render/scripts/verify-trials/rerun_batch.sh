#!/bin/bash
# Verifier's re-runs of one or more representative trials per tool, from the commands recorded in the run ledger,
# each through gtr-run with a label starting "verify". Outputs go to /home/user/gtr/lanes/web-tab-render/verify-trials/rerun/
# (never over the trial's own outputs). --nolock: the two CPU slots had a queue of about 15 jobs of other lanes when this
# ran; these are short functional re-runs whose outputs are compared, not timed. The pinned player re-run (r0128) is
# started separately.
source /home/user/gtr/env.sh 2>/dev/null
export QT_QPA_PLATFORM=offscreen
B=/home/user/blog/docs/guitar-tab-research/lanes/web-tab-render/scripts
L=/home/user/gtr/lanes/web-tab-render
R=$L/verify-trials/rerun
I=/home/user/gtr/inputs
G="gtr-run --lane web-tab-render --nolock"
mkdir -p $R/logs
run() {  # run <log name> <tool> <label> <input> -- cmd...
  local name=$1 tool=$2 label=$3 input=$4; shift 5
  $G --tool "$tool" --label "verify (verify-trials-web-tab-render): $label" --input "$input" -- "$@" > $R/logs/$name.log 2>&1
  echo "$name exit=$? $(grep -o 'gtr-run r[0-9]*' $R/logs/$name.log | tail -1)"
}
mkdir -p $R/{alphatab-node,alphatex,alphatab-web,alphatab-edit,alphatab-transpose,alphatab-import,vexflow,vextab,music21,osmd,verovio,musescore3,lilypond,tuxguitar,pyguitarpro,abcjs,chords,tonal-chordsheet,webmscore,guitarpro-parser}

run alphatab_node alphatab "re-run of r0020, alphaTab 1.9.0 Node model/MIDI/GP7/alphaTex of S2n.gp5" $I/S2n/S2n.gp5 -- \
  node $B/alphatab_node_model.cjs $I/S2n/S2n.gp5 $R/alphatab-node S2n
run alphatex_parse alphatab "re-run of r0043, alphaTab parse of the S2n truth alphaTex" $L/out/alphatex-from-truth/S2n.truth.atex -- \
  node $B/alphatab_node_model.cjs $L/out/alphatex-from-truth/S2n.truth.atex $R/alphatex S2n.truthatex
run alphatex_v1style alphatab "alphaTab parse of S2n truth alphaTex with a '.' line and \\ts 4 4 (the described first version)" $L/verify-trials/inputs/S2n.truth.v1style.atex -- \
  node $B/alphatab_node_model.cjs $L/verify-trials/inputs/S2n.truth.v1style.atex $R/alphatex S2n.v1style
run alphatab_web alphatab "re-run of r0059, alphaTab render of S2n.gp5 in headless Chromium" $I/S2n/S2n.gp5 -- \
  node $B/shot.cjs 'http://127.0.0.1:8765/pages/alphatab.html?file=/inputs/S2n/S2n.gp5' $R/alphatab-web/S2n_gp5
run alphatab_edit alphatab "re-run of r0134, alphaTab click + model edit + GP7 export, player on" $I/S2n/S2n.gp5 -- \
  node $B/alphatab_edit.cjs $R/alphatab-edit/S2n_player2 player=1
run alphatab_transpose alphatab "re-run of r0328, alphaTab exportAudio plain / changeTrackTranspositionPitch / trackTranspositionPitches" $I/S2n/S2n.gp5 -- \
  node $B/alphatab_transpose_export.cjs $R/alphatab-transpose/S2n
run alphatab_import alphatab "re-run of r0273, alphaTab import of the S5capo2 reference 2-staff MusicXML" $L/out/musicxml-from-truth/S5capo2.truth.musicxml -- \
  node $B/alphatab_node_model.cjs $L/out/musicxml-from-truth/S5capo2.truth.musicxml $R/alphatab-import ref2staff_capo
run vexflow vexflow "re-run of r0110, VexFlow 5.0.0 TabStave of the S2n truth" $I/S2n/S2n.truth.json -- \
  node $B/shot.cjs 'http://127.0.0.1:8765/pages/vexflow.html?truth=/inputs/S2n/S2n.truth.json' $R/vexflow/S2n
python3 -I $B/truth_to_vextab.py $I/S2n/S2n.truth.json $R/vextab/S2n.vextab > $R/logs/vextab_gen.log 2>&1
run vextab vextab "re-run of r0109, VexTab 4.0.5 render of the S2n VexTab text" $L/out/vextab/S2n.vextab -- \
  node $B/shot.cjs 'http://127.0.0.1:8765/pages/vextab.html?src=/lane/out/vextab/S2n.vextab' $R/vextab/S2n
run music21 music21 "re-run of r0153, music21 10.5.2 truth -> MusicXML with string/fret, parse back" $I/S2n/S2n.truth.json -- \
  $L/venv-py/bin/python -I $B/music21_truth_to_musicxml.py $I/S2n/S2n.truth.json $R/music21
run osmd osmd "re-run of r0158, OSMD 2.3.0 render of the reference 2-staff MusicXML" $L/out/musicxml-from-truth/S2n.truth.musicxml -- \
  node $B/shot.cjs 'http://127.0.0.1:8765/pages/osmd.html?src=/lane/out/musicxml-from-truth/S2n.truth.musicxml' $R/osmd/S2n_ref2staff
run verovio_mei verovio "re-run of r0165, Verovio 6.4.1 MEI tab from the S2n truth" $L/out/verovio/S2n.truth.mei -- \
  node $B/verovio_render.cjs $L/out/verovio/S2n.truth.mei $R/verovio/S2n_mei
run verovio_capo verovio "re-run of r0174, Verovio 6.4.1 S5capo2 reference MusicXML -> MEI" $L/out/musicxml-from-truth/S5capo2.truth.musicxml -- \
  node $B/verovio_render.cjs $L/out/musicxml-from-truth/S5capo2.truth.musicxml $R/verovio/S5capo2_mxl2staff
run mscore_xml musescore3 "re-run of r0120, MuseScore 3.2.3 S2n.gp5 -> MusicXML" $I/S2n/S2n.gp5 -- \
  mscore3 -o $R/musescore3/S2n.musicxml $I/S2n/S2n.gp5
run mscore_mscx musescore3 "re-run of r0125, MuseScore 3.2.3 S2n.gp5 -> mscx" $I/S2n/S2n.gp5 -- \
  mscore3 -o $R/musescore3/S2n.mscx $I/S2n/S2n.gp5
run mscore_gp7 musescore3 "re-run of r0178, MuseScore 3.2.3 on alphaTab's .gp export (expected refusal)" $L/out/alphatab-node/S2n.export.gp -- \
  mscore3 -o $R/musescore3/alphatab_gp7.out.musicxml $L/out/alphatab-node/S2n.export.gp
run mscore_capo_mid musescore3 "re-run of r0190, MuseScore 3.2.3 S5capo2.gp5 -> MIDI" $I/S5capo2/S5capo2.gp5 -- \
  mscore3 -o $R/musescore3/S5capo2.mid $I/S5capo2/S5capo2.gp5
run mscore_capo_mxl musescore3 "re-run of r0180, MuseScore 3.2.3 S5capo2 reference MusicXML round trip" $L/out/musicxml-from-truth/S5capo2.truth.musicxml -- \
  mscore3 -o $R/musescore3/ref2staff_capo_mxl.out.musicxml $L/out/musicxml-from-truth/S5capo2.truth.musicxml
run lilypond_s2n lilypond "re-run of r0197, LilyPond 2.24.3 S2n TabStaff automatic strings" $L/out/lilypond/S2n_auto.ly -- \
  bash -c "lilypond --png -dresolution=100 -o $R/lilypond/S2n_auto $L/out/lilypond/S2n_auto.ly > $R/lilypond/S2n_auto.log 2>&1"
run lilypond_r1a lilypond "re-run of r0207, LilyPond 2.24.3 R1a sequence, automatic strings" $L/out/lilypond/R1a_auto_seq.ly -- \
  bash -c "lilypond --png -dresolution=100 -o $R/lilypond/R1a_auto_seq $L/out/lilypond/R1a_auto_seq.ly > $R/lilypond/R1a_auto_seq.log 2>&1"
python3 -I $B/lilypond_log_to_json.py $R/lilypond/S2n_auto.log $R/lilypond/S2n_auto.tab.json --bpm 112 --tuning 40,45,50,55,59,64 > $R/logs/ly_s2n_json.log 2>&1
python3 -I $B/lilypond_log_to_json.py $R/lilypond/R1a_auto_seq.log $R/lilypond/R1a_auto_seq.tab.json --bpm 107 --tuning 40,45,50,55,59,64 > $R/logs/ly_r1a_json.log 2>&1
run tuxguitar tuxguitar "re-run of r0222, TuxGuitar 1.5.6 plugins on S5capo2.gp5" $I/S5capo2/S5capo2.gp5 -- \
  java -Djava.awt.headless=true -cp "$L/out/tuxguitar/classes:/usr/share/tuxguitar/lib/*:/usr/share/tuxguitar/plugins/*:/usr/share/java/commons-compress.jar" TGConvert $I/S5capo2/S5capo2.gp5 $R/tuxguitar S5capo2
run pyguitarpro pyguitarpro "re-run of r0236, PyGuitarPro 0.11 read/write GP5/GP4/GP3 + edit" $I/S2n/S2n.gp5 -- \
  $L/venv-py/bin/python -I $B/pyguitarpro_trial.py $I/S2n/S2n.gp5 $R/pyguitarpro S2n
run abcjs abcjs "re-run of r0241, abcjs 6.7.2 written-pitch ABC with guitar tablature" $L/out/abcjs/S2n.written.abc -- \
  node $B/shot.cjs 'http://127.0.0.1:8765/pages/abcjs.html?src=/lane/out/abcjs/S2n.written.abc' $R/abcjs/S2n_written
node $B/abcjs_tab_readout.cjs 'src=/lane/out/abcjs/S2n.written.abc' $R/abcjs/S2n_written.tab.json 40,45,50,55,59,64 0 > $R/logs/abcjs_readout.log 2>&1
run abcjs_editor abcjs "re-run of r0312, abcjs 6.7.2 ABCJS.Editor typed edit" $L/out/abcjs/S2n.written.abc -- \
  node $B/abcjs_editor_edit.cjs /lane/out/abcjs/S2n.written.abc $R/abcjs/editor
run chords svguitar-vexchords "re-run of r0253, svguitar 2.10.1 + vexchords 1.2.0 dist on one page" $B/pages/chords.html -- \
  node $B/shot.cjs http://127.0.0.1:8765/pages/chords.html $R/chords/chords 'window.__rendered === true' 20000 900
run chords_bundle svguitar-vexchords "re-run of r0259, vexchords 1.2.0 esbuild bundle" $B/pages/vexchords_esm.html -- \
  node $B/shot.cjs http://127.0.0.1:8765/pages/vexchords_esm.html $R/chords/vexchords_bundled 'window.__rendered === true' 20000 900
run tonal tonal-chordsheetjs "re-run of r0251, Tonal 6.5.1 Chord.detect + ChordSheetJS 18.0.0 on S3" $I/S3/S3.truth.json -- \
  node $B/tonal_chordsheet_trial.mjs $I/S3/S3.truth.json $R/tonal-chordsheet/S3
run webmscore_noflags webmscore "re-run of r0279, webmscore 1.2.1 under Node 22 without workarounds (expected failure)" $I/S2n/S2n.gp5 -- \
  node $B/webmscore_trial.cjs $I/S2n/S2n.gp5 gp5 $R/webmscore/S2n_gp5_noflags
run webmscore_shim webmscore "re-run of r0283, webmscore 1.2.1 with the navigator shim only (expected failure)" $I/S2n/S2n.gp5 -- \
  node $B/webmscore_trial.cjs $I/S2n/S2n.gp5 gp5 $R/webmscore/S2n_gp5_shim --shim-navigator
run webmscore webmscore "re-run of r0288, webmscore 1.2.1 with both workarounds, S2n.gp5" $I/S2n/S2n.gp5 -- \
  node $B/webmscore_trial.cjs $I/S2n/S2n.gp5 gp5 $R/webmscore/S2n_gp5 --shim-navigator --no-fetch
run gpparser guitarpro-parser "re-run of r0295, guitarpro-parser 2.0.0 S5capo2.gp5" $I/S5capo2/S5capo2.gp5 -- \
  node $B/gpparser_trial.mjs $I/S5capo2/S5capo2.gp5 $R/guitarpro-parser/S5capo2_gp5.json
run gpparser_gp7 guitarpro-parser "re-run of r0298, guitarpro-parser 2.0.0 on alphaTab's .gp (expected refusal)" $L/out/alphatab-node/S2n.export.gp -- \
  node $B/gpparser_trial.mjs $L/out/alphatab-node/S2n.export.gp $R/guitarpro-parser/alphatab_gp7.json
echo BATCH DONE
