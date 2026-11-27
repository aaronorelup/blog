#!/bin/bash
# precommit_scan.sh [files...]: LOOP.md section 3's privacy checks over the staged (or given) files of /home/user/blog:
# the never-publish hash scan (EMBED.md 2.4), the command-center host, and signed R2 links. Exit 1 on any hit.
cd /home/user/blog
FILES=("$@"); [ ${#FILES[@]} -eq 0 ] && mapfile -t FILES < <(git diff --cached --name-only --diff-filter=ACM)
[ ${#FILES[@]} -eq 0 ] && { echo "nothing staged"; exit 0; }
HITS=0
OUT=$(node --input-type=module -e "
import fs from 'node:fs';
import { keys, hash } from './scripts/check/never-publish.mjs';
const hashes = new Set(JSON.parse(fs.readFileSync('src/data/never-publish.json', 'utf8')));
let hits = 0;
for (const f of process.argv.slice(1)) { let t; try { t = fs.readFileSync(f, 'utf8'); } catch { continue; } for (const [k] of keys(t)) if (hashes.has(hash(k))) { hits++; console.log('HIT never-publish', f); } }
console.log('never-publish hits:', hits);
" "${FILES[@]}" 2>&1); echo "$OUT" | grep -v "^never-publish hits: 0$"; echo "$OUT" | grep -q "^HIT" && HITS=1
HOST=$(python3 -c "import json,os; d=json.load(open(os.path.expanduser('~/agent-kit/connections/servers.json'))); u=d['servers']['command-center']['url']; from urllib.parse import urlparse; print(urlparse(u).hostname or '')" 2>/dev/null)
if [ -n "$HOST" ]; then grep -lF "$HOST" "${FILES[@]}" 2>/dev/null && { echo "HIT command-center host"; HITS=1; }; fi
grep -lE 'X-Amz-Signatur[e]|r2\.cloudflarestorage\.com' "${FILES[@]}" 2>/dev/null && { echo "HIT signed R2 link"; HITS=1; }
[ $HITS -eq 0 ] && echo "scan clean (${#FILES[@]} files)"
exit $HITS
