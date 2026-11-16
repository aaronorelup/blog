#!/usr/bin/env bash
# Partial-clone (no blobs) each repo at depth 1 into verify/repos, then record HEAD commit date and hash,
# the full file list, and export small text files (license, readme, build metadata) into verify/raw/gh/.
set -u
OUT=/home/user/gtr/lanes/guitar-tab/verify
mkdir -p "$OUT/repos" "$OUT/raw/gh"
TSV="$OUT/raw/gh/lastcommit.tsv"
: > "$TSV"
while read -r slug; do
  [ -z "$slug" ] && continue
  d="$OUT/repos/${slug/\//_}"
  rm -rf "$d"
  if git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$slug" "$d" 2> "$OUT/logs/clone_${slug/\//_}.err"; then
    if git -C "$d" rev-parse -q --verify HEAD >/dev/null 2>&1; then
      br=$(git -C "$d" symbolic-ref --short HEAD 2>/dev/null)
      printf '%s\t%s\t%s\t%s\n' "$slug" "$(git -C "$d" log -1 --format=%cI)" "$(git -C "$d" log -1 --format=%H)" "$br" >> "$TSV"
      git -C "$d" ls-tree -r --name-only HEAD > "$OUT/raw/gh/${slug/\//_}__TREE.txt"
      grep -iE '^(LICEN[CS]E|COPYING|NOTICE|README|CHANGELOG|pyproject\.toml|setup\.py|setup\.cfg|package\.json|requirements\.txt|instruments\.json)([^/]*)$' "$OUT/raw/gh/${slug/\//_}__TREE.txt" | while read -r f; do
        git -C "$d" show "HEAD:$f" > "$OUT/raw/gh/${slug/\//_}__${f//\//_}" 2>/dev/null
      done
    else
      printf '%s\tEMPTY\t\t\n' "$slug" >> "$TSV"
    fi
  else
    printf '%s\tCLONE-FAILED\t\t\n' "$slug" >> "$TSV"
  fi
done <<'EOF'
andywiggins/tab-cnn
cwitkowitz/amt-tools
cwitkowitz/guitar-transcription-with-inhibition
cwitkowitz/guitar-transcription-continuous
yongyizang/SynthTab
xavriley/hf_midi_transcription
xavriley/piano_transcription_inference
qiuqiangkong/piano_transcription_inference
DanieleMorotti/guitab
RiccardoVib/Noise2Fret
JackJamesLoth/Audio2Tab
MusicGuitarTab/GuitarTab
scottvr/gtrsnipe
d-f/nylon-amt
natecdr/tuttut
madisonrickert/tutts
vipul-sharma20/tayuya
maximoskp/midi2tab_Deconvolutions
knoguchi/fretpath
Perlence/PyGuitarPro
cuthbertLab/music21
dada-bots/dadaGP
marl/GuitarSet
ss12f32v/Guitar-Transcription
JackJamesLoth/GOAT-Dataset
DjentleViBe/SCORE-SET
visvar/visual-guitar-tab-comparison
klangio/procedural-data-training
xupei0610/guitar
bielsnohr/guitab
CPJKU/beat_this
spotify/basic-pitch
EOF
echo done
