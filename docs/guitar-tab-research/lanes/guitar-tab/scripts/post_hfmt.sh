#!/bin/bash
# After the guitar-gaps.pth batch: score the MIDI with gtr-eval notes, then run tuttut on it (merged to one track) and
# score that tab. Light work; tuttut runs go through one gtr-run --nolock call.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts; O=$L/out/hf-midi-transcription
TAG=${1:-guitar-gaps}; shift; CLIPS="$@"
for c in $CLIPS; do
  [ -f $O/$c.$TAG.mid ] || { echo "$c: no MIDI"; continue; }
  gtr-eval notes --truth $c --est $O/$c.$TAG.mid 2>$L/logs/ev.err | python3 -c "
import sys,json; d=json.load(sys.stdin); m=d['metrics']; o=m['onset_only']; oo=m['onset_offset']
print('$c $TAG notes: n_est', d['counts']['n_est'], 'matched', o['n_matched'], 'P %.4f R %.4f F1 %.4f'%(o['precision'],o['recall'],o['f1']), 'on+off F1', oo['f1'] if oo else None, end=' ')"
  grep -o "e[0-9]*\]" $L/logs/ev.err
  $L/venv-sym/bin/python -I $S/merge_midi.py $O/$c.$TAG.mid $O/$c.$TAG.merged.mid --vel0-to-noteoff > /dev/null
done
gtr-run --lane guitar-tab --tool midi-to-tab-handoff --nolock --label "tuttut on $TAG MIDI ($CLIPS) (light job, no slot)" --input $O/$(echo $CLIPS | cut -d' ' -f1).$TAG.mid -- bash -c "for c in $CLIPS; do [ -f $O/\$c.$TAG.merged.mid ] && $L/venv-sym/bin/python -I $S/run_tuttut.py $O/\$c.$TAG.merged.mid $O/tuttut --name \$c.$TAG; done"
for c in $CLIPS; do
  [ -f $O/tuttut/$c.$TAG.gtreval.json ] || continue
  gtr-eval tab --truth $c --est $O/tuttut/$c.$TAG.gtreval.json 2>$L/logs/ev.err | python3 -c "
import sys,json; d=json.load(sys.stdin); m=d['metrics']; c=d['counts']
print('$c $TAG -> tuttut tab: n_est', c['n_est'], 'matched', c['n_matched'], 'same str+fret/matched %.4f'%m['same_string_and_fret_fraction_of_matched'], '/truth %.4f'%m['same_string_and_fret_fraction_of_truth'], json.dumps(m['string_difference_counts']), end=' ')"
  grep -o "e[0-9]*\]" $L/logs/ev.err
done
