#!/bin/bash
# Verifier: install Omnizart 0.6.3 (PyPI sdist) for chord transcription only, reusing the cached tensorflow-cpu 2.12.1
# (omnizart's metadata asks for the `tensorflow` package and tf-keras; installed with --no-deps instead) and the
# madmom 0.16.1 / vamp 1.1.0 / pyaudio 0.2.14 builds already in the shared uv cache. Then fetch only the chord
# checkpoint's variables file (44,242,072 bytes) from the omnizart GitHub release that `omnizart download-checkpoints`
# reads, instead of all ten checkpoints.
set -eu
source /home/user/gtr/env.sh 2>/dev/null || true
VT=/home/user/gtr/lanes/chords-beats-key/verify-trials
V=$VT/venvs/omnizart
SD=$VT/omnizart_sdist/omnizart-0.6.3.tar.gz
uv venv -q --python 3.11 "$V"
uv pip install --offline --no-deps --python "$V/bin/python" -r "$VT/venvs/tf.base.txt"
uv pip install --offline --no-deps --python "$V/bin/python" "cython==0.29.37"
uv pip install --offline --no-deps --no-build-isolation --python "$V/bin/python" "madmom==0.16.1" "vamp==1.1.0" "pyaudio==0.2.14"
uv pip install --no-deps --python "$V/bin/python" click jsonschema jsonschema-specifications referencing rpds-py attrs pillow pretty_midi pyfluidsynth pyyaml
# madmom 0.16.1 on Python 3.11: the same one-line fix as BeatNet's (sed -i writes a new file, so the cache copy is untouched)
sed -i 's/^from collections import MutableSequence$/from collections.abc import MutableSequence/' "$V/lib/python3.11/site-packages/madmom/processors.py"
uv pip install --no-deps --no-build-isolation --python "$V/bin/python" "$SD"
CK="$V/lib/python3.11/site-packages/omnizart/checkpoints/chord/chord_v1/variables"
curl -sS -L --max-time 300 -o "$CK/variables.data-00000-of-00001" \
  "https://github.com/Music-and-Culture-Technology-Lab/omnizart/releases/download/checkpoints-20211001/chord_v1@variables.data-00000-of-00001"
ls -la "$CK"
sha256sum "$CK/variables.data-00000-of-00001"
uv pip freeze --python "$V/bin/python" > "$VT/venvs/omnizart.freeze.now.txt"
"$V/bin/omnizart" chord transcribe --help | head -30
