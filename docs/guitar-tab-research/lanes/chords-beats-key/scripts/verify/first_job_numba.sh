#!/bin/bash
# Verifier: is the slow first job of librosa_run.py and chordino_run.py the one-time numba compilation?
# Each script is run on S3 twice: (a) with the numba cache files (*.nbi, *.nbc) that the verifier's earlier re-run left
# in the rebuilt venv, (b) after deleting those cache files. One thread, outputs to verify-trials/numba_test/.
set -u
VT=/home/user/gtr/lanes/chords-beats-key/verify-trials
S=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/scripts
export OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 NUMBA_NUM_THREADS=1
for tool in librosa chordino; do
  case $tool in
    librosa)  PY=$VT/venvs/librosa/bin/python;  SC=$S/librosa_run.py ;;
    chordino) PY=$VT/venvs/chordext/bin/python; SC=$S/chordino_run.py ;;
  esac
  SP=$($PY -I -c "import sysconfig; print(sysconfig.get_paths()['purelib'])")
  n=$(find "$SP" \( -name "*.nbi" -o -name "*.nbc" \) | wc -l)
  t0=$(date +%s.%N); $PY -I $SC --audio /home/user/gtr/inputs/S3/S3.wav --outdir $VT/numba_test/$tool/warm > /dev/null 2>&1; rc=$?; t1=$(date +%s.%N)
  echo "$tool S3 with $n numba cache files present: wall $(echo "$t1 - $t0" | bc) s exit $rc"
  find "$SP" \( -name "*.nbi" -o -name "*.nbc" \) -delete
  t0=$(date +%s.%N); $PY -I $SC --audio /home/user/gtr/inputs/S3/S3.wav --outdir $VT/numba_test/$tool/cold > /dev/null 2>&1; rc=$?; t1=$(date +%s.%N)
  n2=$(find "$SP" \( -name "*.nbi" -o -name "*.nbc" \) | wc -l)
  echo "$tool S3 after deleting the numba cache files: wall $(echo "$t1 - $t0" | bc) s exit $rc; cache files written again: $n2"
done
