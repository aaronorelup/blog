#!/bin/bash
# Score one LLM answer.json with gtr-eval and keep the eval ids.
#   score_answer.sh chords <clip> <answer.json>   -> chords, tempo, key
#   score_answer.sh notes  <clip> <answer.json>   -> notes (with --chroma)
#   score_answer.sh capo   <clip> <answer.json>   -> tuning --est-capo
# Results go next to answer.json as eval_<sub>.json; the stderr line with the eval id goes to eval_ids.txt.
set -u
source /home/user/gtr/env.sh
export GTR_AGENT=try-hosted-apis
mode=$1; clip=$2; ans=$3; d=$(dirname "$ans")
PY=/home/user/gtr/lanes/hosted-apis/venv-apis/bin/python
case $mode in
  chords)
    gtr-eval chords --truth "$clip" --est "$ans" --out "$d/eval_chords.json" 2>>"$d/eval_ids.txt" >/dev/null
    bpm=$($PY -I -c "import json,sys; print(json.load(open(sys.argv[1]))['tempo_bpm'])" "$ans")
    key=$($PY -I -c "import json,sys; print(json.load(open(sys.argv[1]))['key'])" "$ans")
    gtr-eval tempo --truth "$clip" --est-bpm "$bpm" --out "$d/eval_tempo.json" 2>>"$d/eval_ids.txt" >/dev/null
    gtr-eval key --truth "$clip" --est-key "$key" --out "$d/eval_key.json" 2>>"$d/eval_ids.txt" >/dev/null ;;
  notes)
    gtr-eval notes --truth "$clip" --est "$ans" --chroma --out "$d/eval_notes.json" 2>>"$d/eval_ids.txt" >/dev/null ;;
  capo)
    capo=$($PY -I -c "import json,sys; j=json.load(open(sys.argv[1])); print(j.get('capo_fret') if j.get('capo_fret') is not None else 0)" "$ans")
    gtr-eval tuning --truth "$clip" --est-capo "$capo" --out "$d/eval_tuning.json" 2>>"$d/eval_ids.txt" >/dev/null
    key=$($PY -I -c "import json,sys; print(json.load(open(sys.argv[1]))['key'])" "$ans")
    gtr-eval key --truth "$clip" --est-key "$key" --out "$d/eval_key.json" 2>>"$d/eval_ids.txt" >/dev/null ;;
esac
cat "$d/eval_ids.txt" | tail -3
