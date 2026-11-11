#!/bin/bash
# verify-gapfill-guitar-tab, round 2 (2026-11-11): re-run of the gap round's TabCNN glue (scripts/gap2_run_tabcnn.py,
# unchanged) on two clips per configuration, with freshly downloaded weights and a venv rebuilt from the gap round's
# freeze, into verify-gap2/tabcnn/ (the gap round's outputs in gap2/tabcnn/ are not touched).
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
W=$L/verify-gap2/weights; O=$L/verify-gap2/tabcnn; mkdir -p $O
P="$L/venv-verify-amt/bin/python -I"
for c in S2n R1c; do
  for cfg in zenodo-amt onnx-gpfx onnx-vanilla; do
    case $cfg in
      zenodo-amt)   ARGS="--backend amt --model $W/zenodo-11406378/best_TabCNN_tablature_trancription_model" ;;
      onnx-gpfx)    ARGS="--backend onnx --model $W/cstr-tabcnn-onnx/tabcnn-gpfx.onnx --variant gpfx --front card" ;;
      onnx-vanilla) ARGS="--backend onnx --model $W/cstr-tabcnn-onnx/tabcnn.onnx --variant vanilla --front card" ;;
    esac
    echo "== $c $cfg"
    /usr/bin/time -f "clip $c $cfg: wall %e s, maxrss %M KB" $P $S/gap2_run_tabcnn.py $ARGS \
        /home/user/gtr/inputs/$c/$c.mono.wav $O/$c.$cfg 2>&1 | grep -v -i "warn\|portaudio\|X connection\|^\s*$"
  done
done
