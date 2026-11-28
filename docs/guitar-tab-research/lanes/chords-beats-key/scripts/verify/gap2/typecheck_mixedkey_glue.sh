#!/bin/bash
# verify-gapfill-chords-beats-key, round 2: type-check the lane's mixedkey glue (scripts/gap2/mixedkey_run/main.go)
# against mixedkey_stub/, which holds only the exported declarations main.go uses, copied from mixedkey v0.1.0's
# detect.go and profiles.go (723a590) with empty bodies. No mixedkey code is fetched or compiled: GOPROXY=off,
# GOTOOLCHAIN=local, and the module path is replaced by the local stub. Usage: bash typecheck_mixedkey_glue.sh <work dir>
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
W=${1:?work dir}
rm -rf "$W" && mkdir -p "$W/glue" "$W/stub"
cp "$HERE/mixedkey_stub/stub.go" "$HERE/mixedkey_stub/go.mod" "$W/stub/"
cp "$HERE/../../gap2/mixedkey_run/main.go" "$W/glue/"
printf 'module mixedkeyrun\n\ngo 1.24\n\nrequire github.com/cabbagekobe/mixedkey v0.1.0\n\nreplace github.com/cabbagekobe/mixedkey => ../stub\n' > "$W/glue/go.mod"
cd "$W/glue"
/usr/local/go/bin/gofmt -l -e main.go
GOTOOLCHAIN=local GOPROXY=off GOFLAGS=-mod=mod GOCACHE="$W/cache" GOPATH="$W/gopath" /usr/local/go/bin/go vet .
echo "go vet exit $?"
