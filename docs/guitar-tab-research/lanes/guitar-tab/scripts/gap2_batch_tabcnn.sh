#!/bin/bash
# gap round 2: TabCNN weights published by others, one configuration ($1) on the clips given after it.
#   zenodo-amt     Zenodo 11406378 pickled amt-tools TabCNN, amt-tools CQT front-end (torch)
#   onnx-gpfx      cstr/tabcnn-onnx tabcnn-gpfx.onnx, the card's gpfx front-end (ONNX Runtime)
#   onnx-vanilla   cstr/tabcnn-onnx tabcnn.onnx, the card's vanilla front-end (ONNX Runtime)
#   onnx-gpfx-amtfront  tabcnn-gpfx.onnx on the amt-tools front-end (to compare the export with the pickled model)
# Output prefix: /home/user/gtr/lanes/guitar-tab/gap2/tabcnn/<clip>.<config>
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
W=$L/gap2/weights; O=$L/gap2/tabcnn; mkdir -p $O
CFG=$1; shift
case $CFG in
  zenodo-amt)         ARGS="--backend amt --model $W/zenodo-11406378/best_TabCNN_tablature_trancription_model" ;;
  onnx-gpfx)          ARGS="--backend onnx --model $W/cstr-tabcnn-onnx/tabcnn-gpfx.onnx --variant gpfx --front card" ;;
  onnx-vanilla)       ARGS="--backend onnx --model $W/cstr-tabcnn-onnx/tabcnn.onnx --variant vanilla --front card" ;;
  onnx-gpfx-amtfront) ARGS="--backend onnx --model $W/cstr-tabcnn-onnx/tabcnn-gpfx.onnx --front amt" ;;
  *) echo "unknown config $CFG"; exit 2 ;;
esac
for c in "$@"; do
  echo "== $c $CFG"
  /usr/bin/time -f "clip $c: wall %e s, maxrss %M KB" $L/venv-amt/bin/python -I $S/gap2_run_tabcnn.py $ARGS \
      /home/user/gtr/inputs/$c/$c.mono.wav $O/$c.$CFG 2>&1 | grep -v -i "warn\|portaudio\|X connection\|^\s*$"
done
