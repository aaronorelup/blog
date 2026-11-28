#!/usr/bin/env bash
# verify-gapfill-web-tab-render (round 2): the build of r0604 (scripts/build_alphatab_monaco.sh) repeated with the same
# esbuild commands and flags, from a fresh reinstall (verify-gap2/web-monaco-reinstall) into verify-gap2/bundles, plus a
# --metafile on the page bundle to count the CSS files it pulls in.
set -euo pipefail
S=/home/user/blog/docs/guitar-tab-research/lanes/web-tab-render/scripts
NM=/home/user/gtr/lanes/web-tab-render/verify-gap2/web-monaco-reinstall/node_modules
OUT=/home/user/gtr/lanes/web-tab-render/verify-gap2/bundles
ESBUILD="$NM/.bin/esbuild"
mkdir -p "$OUT"
export NODE_PATH="$NM"
"$ESBUILD" --version
"$ESBUILD" "$S/alphatab_monaco_entry.mjs" --bundle --format=iife --minify --outfile="$OUT/editor.js" \
  --loader:.ttf=file --log-level=warning --metafile="$OUT/../editor.meta.json"
"$ESBUILD" "$NM/monaco-editor/esm/vs/editor/editor.worker.js" --bundle --format=iife --minify \
  --outfile="$OUT/editor.worker.js" --log-level=warning
"$ESBUILD" "$NM/@coderline/alphatab-monaco/dist/worker.mjs" --bundle --format=iife --minify \
  --outfile="$OUT/alphatex-lsp.worker.js" --log-level=warning
ls -l "$OUT"
