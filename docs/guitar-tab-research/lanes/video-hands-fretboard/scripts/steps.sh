#!/usr/bin/env bash
# Run several steps inside ONE gtr-run slot (the box had ~25 jobs queued for 2 slots), timing each step with
# GNU time. Each line of the steps file is: <step name> <tab> <log file> <tab> <command...>
# Per-step facts go to <steps file>.times.tsv: name, exit, wall s, user s, sys s, max RSS kB.
# usage: gtr-run ... -- bash steps.sh <steps file>
set -u
steps="$1"
out="$steps.times.tsv"
printf 'step\texit\twall_s\tuser_s\tsys_s\tmax_rss_kb\n' > "$out"
while IFS=$'\t' read -r name log cmd; do
  [ -z "$name" ] && continue
  /usr/bin/time -f "%x\t%e\t%U\t%S\t%M" -o "$log.time" bash -c "$cmd" > "$log" 2>&1
  printf '%s\t%s\n' "$name" "$(tail -n 1 "$log.time")" >> "$out"
  echo "step $name done: $(tail -n 1 "$log.time")"
done < "$steps"
