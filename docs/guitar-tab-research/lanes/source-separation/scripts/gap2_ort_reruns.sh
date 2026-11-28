#!/bin/bash
# Gap round 2, GAPS.md row S2: re-run demucs-onnx (= r0471) and audio-separator's MDX-Net ONNX model (= r0487) on S4,
# each once with ONNX Runtime's default thread settings (as in the first round) and once with the intra-op thread
# count set to 2 (scripts/gap2_ort_threads.py). Every run is its own `gtr-run` job in a 2-core slot, wrapped in
# scripts/gap2_thread_probe.py, which samples /proc/<pid>/task/*/status and stat every 0.25 s.
# Outputs: /home/user/gtr/lanes/source-separation/gap2/ort/<variant>/S4/ ; probe summaries: samples/gap2-ort/.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation
S=$D/scripts
P="python3 $S/gap2_thread_probe.py"
WAV=/home/user/gtr/inputs/S4/S4.wav
NAMES='{"Vocals":"vocals","Instrumental":"instrumental","Drums":"drums","Bass":"bass","Other":"other","Guitar":"guitar","Piano":"piano","No Other":"no_other","No Drums":"no_drums","No Bass":"no_bass","Drum-Bass":"drum-bass","No Drum-Bass":"no_drum-bass"}'
mkdir -p $L/gap2/work $D/samples/gap2-ort
cd $L/gap2/work
echo "gap2 ORT re-runs start $(date -u +%FT%TZ)"
run() {  # run <tool> <label> <variant> <command...>
  local tool=$1 label=$2 variant=$3; shift 3
  gtr-run --lane source-separation --tool "$tool" --label "gap2: $label" --input "$WAV" -- \
    $P "$D/samples/gap2-ort/probe_${variant}_S4.json" -- "$@"
}
O=$L/gap2/ort
want=" ${*:-onnx-default onnx-ort2 mdx-default mdx-ort2} "   # optional arguments pick variants
[[ $want == *" onnx-default "* ]] && run demucs-onnx-0.3.4 "demucs-onnx htdemucs_6s fp16weights on S4, ORT default threads (= r0471), thread probe" onnx-default \
  $L/venv-ort/bin/demucs-onnx separate $WAV $O/onnx-default/S4 --model htdemucs_6s --small --providers cpu -v
[[ $want == *" onnx-ort2 "* ]] && run demucs-onnx-0.3.4 "demucs-onnx htdemucs_6s fp16weights on S4, ORT intra_op_num_threads=2, thread probe" onnx-ort2 \
  $L/venv-ort/bin/python $S/gap2_ort_threads.py 2 demucs_onnx.cli:main separate $WAV $O/onnx-ort2/S4 --model htdemucs_6s --small --providers cpu -v
[[ $want == *" mdx-default "* ]] && run audio-separator-0.48.0 "audio-separator UVR-MDX-NET-Inst_HQ_3.onnx on S4, ORT default threads (= r0487), thread probe" mdx-default \
  $L/venv-uvr/bin/audio-separator -m UVR-MDX-NET-Inst_HQ_3.onnx --model_file_dir $L/models/uvr --output_dir $O/mdx-default/S4 \
  --output_format WAV --custom_output_names "$NAMES" $WAV
[[ $want == *" mdx-ort2 "* ]] && run audio-separator-0.48.0 "audio-separator UVR-MDX-NET-Inst_HQ_3.onnx on S4, ORT intra_op_num_threads=2, thread probe" mdx-ort2 \
  $L/venv-uvr/bin/python $S/gap2_ort_threads.py 2 audio_separator.utils.cli:main -m UVR-MDX-NET-Inst_HQ_3.onnx \
  --model_file_dir $L/models/uvr --output_dir $O/mdx-ort2/S4 --output_format WAV --custom_output_names "$NAMES" $WAV
echo "gap2 ORT re-runs end $(date -u +%FT%TZ)"
