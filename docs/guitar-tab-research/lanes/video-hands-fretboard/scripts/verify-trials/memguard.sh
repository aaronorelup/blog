#!/usr/bin/env bash
# run "$@" only if MemAvailable >= $1 GiB; otherwise print a skip line and exit 3
need=$1; shift
avail=$(awk '/MemAvailable/ {print int($2/1048576)}' /proc/meminfo)
if [ "$avail" -lt "$need" ]; then echo "SKIPPED: MemAvailable ${avail} GiB < ${need} GiB"; exit 3; fi
echo "MemAvailable ${avail} GiB at start"; exec "$@"
