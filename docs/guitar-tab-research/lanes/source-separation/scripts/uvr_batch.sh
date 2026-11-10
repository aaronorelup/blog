#!/bin/bash
# python-audio-separator 0.48.0 runs, 2 CPU cores each via gtr-run. Arguments: <model file>:<clip> ...
# Output: $L/out/uvr/<model file without extension>/<clip>/<stem>.wav  (lower-case stem names via --custom_output_names)
# Options used on every run: --output_format WAV, --model_file_dir $L/models/uvr, everything else at its default
# (normalization 0.9, MDX segment 256 / overlap 0.25, VR window 512 / aggression 5, Demucs shifts 2 / overlap 0.25,
#  MDXC overlap from the model config).
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
IN=/home/user/gtr/inputs
SEP=$L/venv-uvr/bin/audio-separator
NAMES='{"Vocals":"vocals","Instrumental":"instrumental","Drums":"drums","Bass":"bass","Other":"other","Guitar":"guitar","Piano":"piano","No Other":"no_other","No Drums":"no_drums","No Bass":"no_bass","Drum-Bass":"drum-bass","No Drum-Bass":"no_drum-bass"}'
cd $L/work
for spec in "$@"; do
  model=${spec%%:*}; clip=${spec#*:}
  case $clip in
    S4_0-24s|S4_0-10s) wav=$L/inputs/$clip/$clip.wav ;;
    *) wav=$IN/$clip/$clip.wav ;;
  esac
  mname=${model%.*}
  out=$L/out/uvr/$mname/$clip
  if [ -f "$out/.done" ]; then echo "skip $model $clip"; continue; fi
  mkdir -p "$out"
  gtr-run --lane source-separation --tool audio-separator-0.48.0 --label "audio-separator -m $model on $clip (defaults, WAV out)" \
    --input "$wav" -- $SEP -m "$model" --model_file_dir "$L/models/uvr" --output_dir "$out" --output_format WAV \
    --custom_output_names "$NAMES" "$wav" && touch "$out/.done"
done
