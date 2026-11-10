#!/usr/bin/env bash
# A worker that runs inside one gtr-run slot and takes steps, highest priority first, from this lane's shared queue
# file until it is empty. Several workers wait for slots at once; whichever gets a slot runs the next pending step.
# Queue line format: <step name> <tab> <log file> <tab> <command...>
# Per-step facts (worker, name, exit, wall s, user s, sys s, max RSS kB, start UTC) go to <queue>.times.tsv.
# usage: gtr-run ... -- bash worker.sh <queue file> <worker name>
set -u
queue="$1"
me="$2"
lock="$queue.lock"
times="$queue.times.tsv"
[ -f "$times" ] || printf 'worker\tstep\texit\twall_s\tuser_s\tsys_s\tmax_rss_kb\tstart_utc\tcpus_allowed\n' > "$times"
while true; do
  line=$(flock "$lock" bash -c 'l=$(head -n 1 "$0"); [ -n "$l" ] && tail -n +2 "$0" > "$0.tmp" && cat "$0.tmp" > "$0" && rm -f "$0.tmp"; printf "%s" "$l"' "$queue")
  [ -z "$line" ] && break
  IFS=$'\t' read -r name log cmd <<< "$line"
  start=$(date -u +%FT%TZ)
  /usr/bin/time -f "%x\t%e\t%U\t%S\t%M" -o "$log.time" bash -c "$cmd" > "$log" 2>&1
  cpus=$(awk '/Cpus_allowed_list/ {print $2}' /proc/self/status)
  flock "$lock" bash -c 'printf "%s\t%s\t%s\t%s\t%s\n" "$0" "$1" "$(tail -n 1 "$2")" "$3" "$4" >> "$5"' "$me" "$name" "$log.time" "$start" "$cpus" "$times"
  echo "step $name done by $me: $(tail -n 1 "$log.time")"
done
echo "worker $me: queue empty"
