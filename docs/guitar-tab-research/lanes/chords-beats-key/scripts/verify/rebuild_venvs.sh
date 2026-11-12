#!/bin/bash
# Verifier: rebuild the trial agent's venvs offline (from the shared uv cache only) from the saved freezes,
# following the install steps written in trials.md. Usage: rebuild_venvs.sh <name>...
# Names: essentia librosa madmom39 chordext tf deeprhythm beatthis lvchordia beatnet
set -u
source /home/user/gtr/env.sh 2>/dev/null
S=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples
V=/home/user/gtr/lanes/chords-beats-key/verify-trials/venvs
mkdir -p "$V"
ip() { uv pip install --offline --python "$V/$1/bin/python" "${@:2}"; }
for name in "$@"; do
  echo "=== $name $(date -u +%T)"
  case "$name" in
    essentia)   uv venv -q --python 3.11 "$V/$name" && ip $name -r "$S/essentia/venv-essentia.freeze.txt" ;;
    librosa)    uv venv -q --python 3.12 "$V/$name" && ip $name -r "$S/librosa/venv-librosa.freeze.txt" ;;
    madmom39)   uv venv -q --python 3.9 "$V/$name" && ip $name "numpy==1.23.5" "scipy==1.10.1" "cython==0.29.37" "setuptools==80.10.2" wheel mido soundfile \
                  && ip $name --no-build-isolation -r "$S/madmom/venv-madmom39.freeze.txt" ;;
    chordext)   uv venv -q --python 3.11 "$V/$name" && ip $name "numpy==2.4.6" "setuptools==80.10.2" wheel \
                  && ip $name --no-build-isolation -r "$S/chordino/venv-chordext.freeze.txt" ;;
    tf)         # jax 0.4.30 / jaxlib 0.4.30 were no longer in the shared uv cache: installed without them, --no-deps
                uv venv -q --python 3.11 "$V/$name" && ip $name "numpy==1.23.5" "setuptools==80.10.2" wheel \
                  && grep -viE '^(crema|autochord|vamp|jax|jaxlib)==' "$S/crema/venv-tf.freeze.txt" > "$V/tf.base.txt" \
                  && ip $name --no-deps -r "$V/tf.base.txt" && ip $name --no-build-isolation --no-deps "vamp==1.1.0" \
                  && ip $name --no-deps "crema==0.2.0" "autochord==0.1.4" ;;
    deeprhythm) uv venv -q --python 3.11 "$V/$name" && ip $name -r "$S/deeprhythm/venv-deeprhythm.freeze.txt" ;;
    beatthis)   uv venv -q --python 3.11 "$V/$name" && ip $name -r "$S/beat_this/venv-beatthis.freeze.txt" ;;
    lvchordia)  uv venv -q --python 3.11 "$V/$name" && ip $name -r "$S/lv_chordia/venv-lvchordia.freeze.txt" ;;
    beatnet)    uv venv -q --python 3.11 "$V/$name" && ip $name "numpy==1.23.5" "cython==0.29.37" "setuptools==80.10.2" wheel \
                  && grep -viE '^(beatnet|madmom|pyaudio)==' "$S/beatnet/venv-beatnet.freeze.txt" > "$V/beatnet.base.txt" \
                  && ip $name -r "$V/beatnet.base.txt" && ip $name --no-build-isolation "madmom==0.16.1" "pyaudio==0.2.14" \
                  && ip $name --no-deps "BeatNet==1.1.3" ;;
  esac
  echo "=== $name exit $? $(date -u +%T)"
  # beatnet: afterwards apply the trial's one-line madmom edit with sed -i (writes a new file, leaving the cache copy):
  #   sed -i 's/^from collections import MutableSequence$/from collections.abc import MutableSequence/' \
  #     "$V/beatnet/lib/python3.11/site-packages/madmom/processors.py"
  uv pip freeze --python "$V/$name/bin/python" > "$V/$name.freeze.now.txt" 2>/dev/null
done
