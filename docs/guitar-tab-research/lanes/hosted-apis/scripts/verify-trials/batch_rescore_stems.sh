#!/bin/bash
# verify-trials-hosted-apis: re-score the saved stems with gtr-eval stems (same mappings as e0057, e0391, e0426, e0360),
# from delay-trimmed WAVs remade with the recipe in trials.md (byte-identical to the ones scored: same sha256).
# Run with --nolock and OMP_NUM_THREADS=1 after the slot-waiting version waited 15 min (21:47-22:02 UTC) behind other lanes.
set -u
source /home/user/gtr/env.sh >/dev/null 2>&1
export GTR_AGENT=verify-trials-hosted-apis
export OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1
L=/home/user/gtr/lanes/hosted-apis
R=$L/verify/remake
V=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/samples/verify-trials/rescore
mkdir -p $V; cd $R
gtr-run --lane hosted-apis --tool gtr-eval --label "verify: re-score ElevenLabs S4 stems (remade, same sha256 as e0057), lead=other" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  gtr-eval stems --truth S4 --est-dir $R/S4_six_stems/wav_aligned --map drums=drums.wav bass=bass.wav guitar=guitar.wav lead=other.wav --out $V/elevenlabs_S4_eval_stems.json
gtr-run --lane hosted-apis --tool gtr-eval --label "verify: re-score ElevenLabs S6taps stems (remade, same sha256 as e0391)" --input /home/user/gtr/inputs/S6taps/S6taps.wav --nolock -- \
  gtr-eval stems --truth S6taps --est-dir $R/S6taps_six_stems/wav_aligned --map guitar=guitar.wav taps=drums.wav --out $V/elevenlabs_S6taps_eval_stems.json
gtr-run --lane hosted-apis --tool gtr-eval --label "verify: re-score ElevenLabs R2 stems (remade, same sha256 as e0426)" --input /home/user/gtr/inputs/R2/R2.wav --nolock -- \
  gtr-eval stems --truth R2 --est-dir $R/R2_six_stems/wav_aligned --map vocals_derived=vocals.wav instrumental=sum_non_vocal.wav --out $V/elevenlabs_R2_eval_stems.json
gtr-run --lane hosted-apis --tool gtr-eval --label "verify: re-score HF Space demucs_playground S4 stems (saved files of r0141, as e0360)" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  gtr-eval stems --truth S4 --est-dir $L/out/hf-spaces/demucs_S4_old/named --map drums=drums.wav bass=bass.wav guitar=other.wav lead=vocals.wav --out $V/demucs_S4_eval_stems.json
gtr-run --lane hosted-apis --tool gtr-eval --label "verify: score the verifier's re-run r0322 of the demucs_playground Space on S4 (same mapping as e0360)" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  gtr-eval stems --truth S4 --est-dir $L/verify/hf-spaces/demucs_S4_old/named --map drums=drums.wav bass=bass.wav guitar=other.wav lead=vocals.wav --out $V/demucs_S4_rerun_r0322_eval_stems.json
echo BATCH_RESCORE_DONE
