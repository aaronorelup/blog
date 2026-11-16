#!/bin/bash
# gap round 2 (gapfill-guitar-tab, 2026-11-11): the eight PyGuitarPro 0.11 glue conversions listed in trials.md
# ("PyGuitarPro 0.11 as glue"), re-run with the same script and arguments so they have a run-ledger line.
# The originals in out/gp5/ are not touched; outputs go to gap2/gp5/. Wrapped in one `gtr-run --nolock` call.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
O=$L/gap2/gp5; P="$L/venv-sym/bin/python -I"
mkdir -p $O
$P $S/gtreval_to_gp5.py $L/out/tuttut/S2n.truthmidi.gtreval.json              $O/tuttut_S2n.truthmidi.gp5            --bpm 112
$P $S/gtreval_to_gp5.py $L/out/tuttut/S5capo2.truthmidi.capo2.gtreval.json    $O/tuttut_S5capo2.truthmidi.capo2.gp5  --bpm 112
$P $S/gtreval_to_gp5.py $L/out/tuttut/S5dropd.truthmidi.dropD.gtreval.json    $O/tuttut_S5dropd.truthmidi.dropD.gp5  --bpm 112
$P $S/gtreval_to_gp5.py $L/out/lilypond/S5dropd.truthmidi.dropD.gtreval.json  $O/lilypond_S5dropd.truthmidi.dropD.gp5 --bpm 112
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/S2n.bp.gtreval.json          $O/bp-tuttut_S2n.bp.gp5                --bpm 112
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/S5capo2.bp.capo2.gtreval.json $O/bp-tuttut_S5capo2.bp.capo2.gp5     --bpm 112
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/R1c.bp.gtreval.json          $O/bp-tuttut_R1c.bp.gp5                --bpm 119
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/R3a.bp.gtreval.json          $O/bp-tuttut_R3a.bp.gp5                --bpm 120
