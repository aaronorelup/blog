#!/usr/bin/env bash
# Fetch every non-GitHub source named in survey.md into verify/raw/<kind>/, logging HTTP status per URL.
set -u
OUT=/home/user/gtr/lanes/guitar-tab/verify/raw
mkdir -p "$OUT"/{cc,zenodo,hf,pypi,npm,web,arxiv}
LOG="$OUT/fetch_status.tsv"
: > "$LOG"
get() { # get <outfile> <url>
  local code
  code=$(curl -sS -L --max-time 60 -A 'Mozilla/5.0 (research verification script)' -o "$1" -w '%{http_code}' "$2" 2>>"$OUT/fetch_errors.log")
  printf '%s\t%s\t%s\t%s\n' "$(date -u +%FT%TZ)" "$code" "$2" "$1" >> "$LOG"
}
# Creative Commons legal codes
for l in by-nc by-nc-sa by-nc-nd by; do get "$OUT/cc/$l.html" "https://creativecommons.org/licenses/$l/4.0/legalcode.en"; done
# Zenodo API records
for id in 3371780 1422265 3527800 7544110 12674910 19789500 5624597 13962272 17152440 14963133 15690894 17706552 17811453 10984521 11406378 12802440 10075352 21304818 14877333 8079340; do
  get "$OUT/zenodo/$id.json" "https://zenodo.org/api/records/$id"
done
# Hugging Face
get "$OUT/hf/xavriley_mtm.api.json" "https://huggingface.co/api/models/xavriley/midi-transcription-models"
get "$OUT/hf/xavriley_mtm.README.md" "https://huggingface.co/xavriley/midi-transcription-models/raw/main/README.md"
get "$OUT/hf/danmor_guitab.api.json" "https://huggingface.co/api/models/danmor/guitab"
get "$OUT/hf/danmor_guitab.README.md" "https://huggingface.co/danmor/guitab/raw/main/README.md"
get "$OUT/hf/gaps.api.json" "https://huggingface.co/api/datasets/xavriley/GAPS"
get "$OUT/hf/gaps.README.md" "https://huggingface.co/datasets/xavriley/GAPS/raw/main/README.md"
get "$OUT/hf/leduc.api.json" "https://huggingface.co/api/datasets/xavriley/FrancoisLeducGuitarDataset"
get "$OUT/hf/leduc.README.md" "https://huggingface.co/datasets/xavriley/FrancoisLeducGuitarDataset/raw/main/README.md"
get "$OUT/hf/whisper-small.README.md" "https://huggingface.co/openai/whisper-small/raw/main/README.md"
get "$OUT/hf/whisper-small.api.json" "https://huggingface.co/api/models/openai/whisper-small"
get "$OUT/hf/chordonomicon.api.json" "https://huggingface.co/api/datasets/ailsntua/Chordonomicon"
get "$OUT/hf/chordonomicon.README.md" "https://huggingface.co/datasets/ailsntua/Chordonomicon/raw/main/README.md"
# PyPI JSON
for p in amt-tools guitar-transcription-inhibition guitar-transcription-continuous hf-midi-transcription gtrsnipe tuttut tayuya tabsynth pyguitarpro music21 guitab dadagp synthtab beat-this basic-pitch piano-transcription-inference; do
  get "$OUT/pypi/$p.json" "https://pypi.org/pypi/$p/json"
done
# npm
get "$OUT/npm/tutts.json" "https://registry.npmjs.org/tutts"
# Web pages
get "$OUT/web/gaps_project.html" "https://aim-qmul.github.io/GAPS/"
get "$OUT/web/guitar-techs.html" "https://guitar-techs.github.io"
get "$OUT/web/egdb_demo.html" "https://ss12f32v.github.io/Guitar-Transcription/"
get "$OUT/web/lilypond_index.html" "https://lilypond.org/index.html"
get "$OUT/web/lilypond_fretted.html" "https://lilypond.org/doc/v2.24/Documentation/notation/common-notation-for-fretted-strings"
get "$OUT/web/lilypond_COPYING.txt" "https://gitlab.com/lilypond/lilypond/-/raw/master/COPYING"
get "$OUT/web/musescore_fretpath.html" "https://musescore.org/en/project/fretpath"
get "$OUT/web/hrgt_project.html" "https://xavriley.github.io/HighResolutionGuitarTranscription/"
get "$OUT/web/synthtab_dev.html" "https://synthtab.dev/"
get "$OUT/web/peixu_guitar.html" "https://pei-xu.github.io/guitar"
get "$OUT/web/pmc10698518.html" "https://pmc.ncbi.nlm.nih.gov/articles/PMC10698518/"
get "$OUT/web/robust_guitar_tabs.html" "https://robust-guitar-tabs.github.io"
get "$OUT/web/guitab_pages.html" "https://danielemorotti.github.io/guitab/"
get "$OUT/web/egdb_amp.html" "https://ss12f32v.github.io/Guitar-Transcription-with-Amplifier/"
echo done
