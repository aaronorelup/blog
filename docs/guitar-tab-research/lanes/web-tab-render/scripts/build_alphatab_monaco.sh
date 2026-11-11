#!/usr/bin/env bash
# Gap round 2 (web-tab-render): bundle the alphaTex editor page's scripts with esbuild 0.25.12.
#   1. editor.js / editor.css: monaco-editor 0.57.0 + @coderline/alphatab-monaco 1.9.0 (alphatab_monaco_entry.mjs)
#   2. editor.worker.js: Monaco's own editor worker (monaco-editor/esm/vs/editor/editor.worker.js)
#   3. alphatex-lsp.worker.js: the package's language-server worker (@coderline/alphatab-monaco/worker, which starts
#      the alphaTex language server of @coderline/alphatab-language-server 1.9.0 in a web worker)
# Packages: /home/user/gtr/lanes/web-tab-render/web-monaco/node_modules (npm install, see trials.md "Gap round 2").
# Output: /home/user/gtr/lanes/web-tab-render/web/bundles/alphatab-monaco/ (served as /web/bundles/alphatab-monaco/).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
NM=/home/user/gtr/lanes/web-tab-render/web-monaco/node_modules
OUT=/home/user/gtr/lanes/web-tab-render/web/bundles/alphatab-monaco
ESBUILD="$NM/.bin/esbuild"
mkdir -p "$OUT"
export NODE_PATH="$NM"
"$ESBUILD" --version
"$ESBUILD" "$HERE/alphatab_monaco_entry.mjs" --bundle --format=iife --minify --outfile="$OUT/editor.js" \
  --loader:.ttf=file --log-level=warning
"$ESBUILD" "$NM/monaco-editor/esm/vs/editor/editor.worker.js" --bundle --format=iife --minify \
  --outfile="$OUT/editor.worker.js" --log-level=warning
"$ESBUILD" "$NM/@coderline/alphatab-monaco/dist/worker.mjs" --bundle --format=iife --minify \
  --outfile="$OUT/alphatex-lsp.worker.js" --log-level=warning
ls -l "$OUT"
