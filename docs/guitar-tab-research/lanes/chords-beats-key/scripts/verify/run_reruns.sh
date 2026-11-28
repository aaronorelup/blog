#!/bin/bash
# Verifier: re-run one or more representative trials per tool (the trial's own scripts, same arguments, rebuilt venvs),
# each tool group in its own gtr-run, --nolock with one thread (both CPU slots were queued by other lanes' jobs).
# Outputs go to /home/user/gtr/lanes/chords-beats-key/verify-trials/reruns/<tool>/<clip>/.
set -u
source /home/user/gtr/env.sh 2>/dev/null
export OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 NUMBA_NUM_THREADS=1 TF_NUM_INTRAOP_THREADS=1 TF_NUM_INTEROP_THREADS=1
VT=/home/user/gtr/lanes/chords-beats-key/verify-trials
SV=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/scripts/verify
cd /tmp
run() {  # name, label, input
  gtr-run --lane chords-beats-key --tool "verify-$1" --label "$2" --nolock --input "$3" -- \
    python3 -I "$SV/vbatch.py" --plan "$VT/plans/v_$1.json" --log "$VT/logs/v_$1.jsonl" --outroot "$VT/reruns"
}
for name in "$@"; do
  case "$name" in
    madmom)   run madmom "verify: re-run of r0063 (S3) and r0100 (S2n), madmom_run.py, madmom 0.16.1 py3.9, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S3/S3.wav ;;
    librosa)  run librosa "verify: re-run of r0069 (S3), r0081 (S7flat30), r0267 (R1b), librosa_run.py, librosa 1.0.0, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S3/S3.wav ;;
    essentia) run essentia "verify: re-run of r0088 (S3), r0148/r0267 (S7flat30), r0267 (R1a) and r0324 (S7flat30 at 432.45 Hz), essentia_run.py, essentia-tensorflow 2.1b6.dev1389; --nolock, 1 thread" /home/user/gtr/inputs/S7flat30/S7flat30.wav ;;
    chordino) run chordino "verify: re-run of r0215 on S3, S7flat30, R1b, chordino_run.py, chord-extractor 0.1.3 + vamp 1.1.0, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S3/S3.wav ;;
    autochord_crema) run autochord_crema "verify: re-run of r0337 on S3 and S7flat30, autochord 0.1.4 and CREMA 0.2.0, tensorflow-cpu 2.12.1 venv rebuilt from the freeze minus jax/jaxlib (not in the cache); --nolock, 1 thread" /home/user/gtr/inputs/S3/S3.wav ;;
    deeprhythm) run deeprhythm "verify: re-run of r0351 on S3 and R1b, DeepRhythm 0.0.13, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S3/S3.wav ;;
    beatnet)  run beatnet "verify: re-run of r0361 on S3 and S4, BeatNet 1.1.3 model 1 offline DBN + online PF, venv rebuilt from the freeze with the same madmom one-line patch; --nolock, 1 thread" /home/user/gtr/inputs/S4/S4.wav ;;
    beatthis) run beatthis "verify: re-run of r0397 (final0 on S3 and S2n, small0 on S3), beat-this 1.1.0, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S2n/S2n.wav ;;
    lvchordia) run lvchordia "verify: re-run of r0398 on S3 and S7flat30, lv-chordia 1.1.0 submission + ismir2017, venv rebuilt from the freeze; --nolock, 1 thread" /home/user/gtr/inputs/S7flat30/S7flat30.wav ;;
    music21)  gtr-run --lane chords-beats-key --tool verify-music21 --label "verify: re-run of r0237 (music21_key_run.py, 11 clips x 2 sources x 5 methods), music21 10.5.2 in the rebuilt librosa venv; --nolock (light)" --nolock --input /home/user/gtr/inputs/S3/S3.mid -- \
                "$VT/venvs/librosa/bin/python" -I /home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/scripts/music21_key_run.py --outroot "$VT/reruns/music21" --clips S3 S7flat30 S4 S2n S2s S5capo2 S5dropd S6taps R1a R1b R1c ;;
  esac
  echo "=== $name done exit $? $(date -u +%T)"
done
