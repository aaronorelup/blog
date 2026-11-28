# verify-docs-browser-audio-sync: evidence files (2026-11-10)

Outputs of the checks summarised in the Verification log at the end of `../../survey.md`.

- `quotes_check_handover.tsv`: `scripts/verify_quotes.py` on the survey as handed over (survey line, section, status,
  source copies the passage was found in, passage). Source copies are in `/home/user/gtr/lanes/browser-audio-sync/verify-docs/` (not committed).
- `quote_attribution_handover.tsv`: `scripts/verify_attrib.py` on the same run (BLOCK / SECTION / ELSEWHERE).
- `quotes_check_final.tsv`: the same check on the amended survey.
- `npm_registry_2026-11-10.tsv`: the npm registry record of each package in the tool list.
- `repo_heads_2026-11-10.tsv`: HEAD commit and committer date of each repository (depth-1 blob-less clones).
- `url_status_2026-11-10.txt`: HTTP status of every non-GitHub URL in the survey as handed over.
