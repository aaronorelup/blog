#!/bin/bash
# verify-gapfill-chords-beats-key, round 2: fetch again, independently of the gap agent's copies, every source the
# round's text quotes or counts. Copies go to /home/user/gtr/lanes/chords-beats-key/verify-gap2/raw/ (not in git);
# one line per request in raw/status.tsv (UTC time, HTTP status, bytes, URL).
R=/home/user/gtr/lanes/chords-beats-key/verify-gap2/raw
mkdir -p "$R" && cd "$R" || exit 1
ST="$R/status.tsv"
get() { # get <out file> <url>
  mkdir -p "$(dirname "$1")"
  code=$(curl -sS -L -m 120 -o "$1" -w '%{http_code}' "$2" 2>>"$R/curl_errors.txt")
  echo -e "$(date -u +%FT%TZ)\t$code\t$(stat -c %s "$1" 2>/dev/null)\t$2" >> "$ST"
}
head_() { # head_ <url>
  line=$(curl -sS -I -L -m 60 "$1" 2>>"$R/curl_errors.txt" | tr -d '\r' | awk 'tolower($1) ~ /^http\// {c=$2} tolower($1)=="content-length:" {l=$2} END {print c "\tHEAD content-length=" l}')
  echo -e "$(date -u +%FT%TZ)\t$line\t$1" >> "$ST"
}
GH=https://raw.githubusercontent.com
# item 1: STONE, key-cnn, BeatNet+
for f in README.md pyproject.toml Dockerfile inference.py; do get stone/$f $GH/deezer/stone/main/$f; done
for f in semisupervised_ks_mode.pt semitone_ks.pt semisupervised_key_mode.pt; do head_ $GH/deezer/stone/main/ckpt/$f; done
for f in README.rst setup.py LICENSE bin/key keycnn/classifier.py; do get keycnn/$(echo $f | tr / _) $GH/hendriks73/key-cnn/master/$f; done
for f in deepspec_k16 deepsquare_k8 deepsquare_k16 shallowspec_k4; do head_ $GH/hendriks73/key-cnn/master/keycnn/models/$f.h5; done
for f in README.md setup.py src/BeatNetPlus/inference.py; do get beatnetplus/$(basename $f) $GH/mjhydri/BeatNet-Plus/main/$f; done
for f in generic_weights generic_main_weights af_non_percussive_weights; do head_ $GH/mjhydri/BeatNet-Plus/main/src/BeatNetPlus/models/$f.pt; done
for n in keycnn key-cnn stone deezer-stone beatnetplus beatnet-plus BeatNetPlus audioestimate audio-estimate audio_estimate; do
  get pypi/$n.json https://pypi.org/pypi/$n/json; done
get pypi/tensorflow_1.15.2.json https://pypi.org/pypi/tensorflow/1.15.2/json
get pypi/tensorflow_2.12.1.json https://pypi.org/pypi/tensorflow/2.12.1/json
get pypi/numpy_1.16.0.json https://pypi.org/pypi/numpy/1.16.0/json
get pypi/numpy_1.23.5.json https://pypi.org/pypi/numpy/1.23.5/json
get pypi/torch_cpu_index.html https://download.pytorch.org/whl/cpu/torch/
head_ "https://download.pytorch.org/whl/cpu/torch-2.0.0%2Bcpu-cp310-cp310-linux_x86_64.whl"
for r in deezer/stone hendriks73/key-cnn mjhydri/BeatNet-Plus JJ110112/LiveChord cabbagekobe/mixedkey bmcfee/crema \
         tangkk/pyace bleugreen/deeprhythm GiantSteps/giantsteps-key-dataset GiantSteps/giantsteps-tempo-dataset; do
  echo -e "$(date -u +%FT%TZ)\tls-remote\t$(timeout 60 git ls-remote https://github.com/$r HEAD 2>&1 | head -1)\t$r" >> "$ST"
done
for r in DionTimmer/audioestimate DionTimmer/AudioEstimate DionTimmer/audio-estimate; do
  echo -e "$(date -u +%FT%TZ)\tls-remote\t$(timeout 30 git ls-remote https://github.com/$r HEAD 2>&1 | head -2 | tr '\n' ' ')\t$r" >> "$ST"
done
# item 2: LiveChord application repository
get livechord/gh_README.md $GH/JJ110112/LiveChord/master/README.md
get livechord/gh_LICENSE $GH/JJ110112/LiveChord/master/LICENSE
for f in scripts/train_beat_refiner.py scripts/eval_beat_refiner_holdout.py; do head_ $GH/JJ110112/LiveChord/master/$f; done
# item 6: AudioEstimate, mixedkey
get audioestimate/hf_api.json "https://huggingface.co/api/models/DionTimmer/audioestimate-1.0?blobs=true"
get audioestimate/hf_page.html https://huggingface.co/DionTimmer/audioestimate-1.0
get audioestimate/hf_README_raw.md https://huggingface.co/DionTimmer/audioestimate-1.0/raw/main/README.md
get audioestimate/hf_spaces.json "https://huggingface.co/api/spaces?author=DionTimmer&limit=100"
M=723a590fd83334e4a4c1f52ae47c47fe2917497a
for f in README.md LICENSE go.mod profiles.go detect.go chroma.go fft.go doc.go; do get mixedkey/$f $GH/cabbagekobe/mixedkey/$M/$f; done
get mixedkey/latest.json https://proxy.golang.org/github.com/cabbagekobe/mixedkey/@latest
get mixedkey/list.txt https://proxy.golang.org/github.com/cabbagekobe/mixedkey/@v/list
get mixedkey/v0.1.0.info https://proxy.golang.org/github.com/cabbagekobe/mixedkey/@v/v0.1.0.info
# item 3: papers and dataset pages
get papers/boeck2011.pdf https://www.dafx.de/paper-archive/2011/Papers/31_e.pdf
get papers/boeck2016.pdf https://archives.ismir.net/ismir2016/paper/000186.pdf
get papers/korz_mlsp2016.pdf https://arxiv.org/pdf/1612.05082
get papers/korz_ismir2016.pdf https://arxiv.org/pdf/1612.05065
get papers/korz_ismir2018.pdf https://arxiv.org/pdf/1808.05340
get papers/mcfee2017.pdf https://archives.ismir.net/ismir2017/paper/000077.pdf
get papers/jiang2019.pdf https://archives.ismir.net/ismir2019/paper/000078.pdf
get crema/training_chords_README.md $GH/bmcfee/crema/main/training/chords/README.md
get crema/training_README.md $GH/bmcfee/crema/main/training/README.md
get crema/index_train.json $GH/bmcfee/crema/main/training/chords/index_train.json
get crema/index_test.json $GH/bmcfee/crema/main/training/chords/index_test.json
get crema/docs_models.rst $GH/bmcfee/crema/main/docs/models.rst
get crema/pypi_crema_0.2.0.json https://pypi.org/pypi/crema/0.2.0/json
get deeprhythm/page.html https://bleu.green/deeprhythm
get deeprhythm/benchmarks.md $GH/bleugreen/deeprhythm/main/docs/benchmarks.md
get deeprhythm/README.md $GH/bleugreen/deeprhythm/main/README.md
get datasets/giantsteps-key.README.md $GH/GiantSteps/giantsteps-key-dataset/master/README.md
get datasets/giantsteps-tempo.README.md $GH/GiantSteps/giantsteps-tempo-dataset/master/README.md
get datasets/giantsteps-mtg-key.README.md $GH/GiantSteps/giantsteps-mtg-key-dataset/master/README.md
get datasets/slakh_zenodo.json https://zenodo.org/api/records/4599666
get datasets/ballroom.html http://mtg.upf.edu/ismir2004/contest/tempoContest/node5.html
get datasets/rwc.html https://staff.aist.go.jp/m.goto/RWC-MDB/
get madmom/models_init.py $GH/CPJKU/madmom_models/master/__init__.py
for f in features/beats.py features/downbeats.py features/chords.py audio/chroma.py features/key.py features/tempo.py; do
  get madmom/$(echo $f | tr / _) $GH/CPJKU/madmom/main/madmom/$f; done
# item 4: pyace
for f in README.md setup.py requirements.txt pyace/__init__.py pyace/pyace.py pyace/fe/fe.py LICENSE; do
  get pyace/$(echo $f | tr / _) $GH/tangkk/pyace/master/$f; done
get pyace/pypi_pyace.json https://pypi.org/pypi/pyace/json
get pyace/pypi_hmmlearn_0.2.5.json https://pypi.org/pypi/hmmlearn/0.2.5/json
head_ "https://www.dropbox.com/s/akyc2cxhdtgtm71/models.zip?dl=0"
echo done
