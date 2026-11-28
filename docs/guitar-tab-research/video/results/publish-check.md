# Independent check of the live film page (publish-check, 2026-11-26)

The checker's own write of this file was refused by the harness (subagents return findings as text), so the orchestrator
wrote it from the checker's returned result. Evidence files: `/home/user/gtv/work/publish-check/` (PROGRESS.md,
pw-desktop.json, pw-phone.json, shot-*.png, media-verify.log, check-commit.log, head.txt, range.txt, post.diff).

**Verdict: PASS**

## Summary

PASS: the live site is on main at 315b3669, the child of the publisher's 111de742. On the live page at 1440x900 and 390x844 the film is the first thing in the body. Its duration is 2975 s (FILM.md says 2975.000), the poster loads and shows, and the captions track loads all 644 cues: a cue shows at each of three seeks, the listening-window one bracketed. All 18 chapters seek to FILM.md's times (at most +0.034 s), playing 5 s at three points advances 4.96 s each, there are no console errors and nothing overflows the phone width. A HEAD on the video gives video/mp4 at 726,291,765 bytes, the same as the local file, and a Range request gives 206. media:verify passes (1412/1412) after npm ci in a clean clone of origin/main.
Every number in the new text traces to BLIND-RESULTS.md round 2 (kit 55-93, bare 35-82), FILM.md (49:35 and the 18 chapters), VOICE.md and the cost records (publisher/film-costs.json: 251 transcripts = main session + 250 agents, $1,389.91-1,623.34, 21,873 credits, $0.03 for 14 calls). The voice rules hold (first person, no em dashes or semicolons) and the credits match songs.json. The commit touches only the post, the film folder, the card still and 2 manifest lines. npm run check on it gives the same 2 errors as its parent, both caused by my sparse clone leaving out public/courses, so the commit adds none. Never-publish hits: 0. The captions name no one but the two performers in songs.json. The REPORT.md write was refused by the harness, so these findings are in this output.

## Notes it raised (none blocking)

- REPORT.md not written: the harness refused the Write ('Subagents should return findings as text'). I did not work around it. The findings are in this output, and the evidence files are in /home/user/gtv/work/publish-check/ (PROGRESS.md, pw-desktop.json, pw-phone.json, shot-*.png, media-verify.log, check-commit.log, check-parent.log, check-post-strict.log, head.txt, range.txt, post.diff). Fix: the orchestrator writes REPORT.md from this output if it is needed.
- Not a failure, cosmetic: captions.vtt repeats the same bracketed cue back to back where a listening window runs past 7 s ('[The kit arm's tab, played back]' 3 times and '[The nylon song's last bars, under the credits]' 4 times, around 48-49 min). Fix if wanted: merge_cues.py should split a long window into distinct cues or leave the repeats out.
- Not from this commit: line 57 of the post links AO-078 (/ledger/guitar-tabs-from-video/), and the page's automatic related-posts list shows an AO-078 card, which may show its still /media/previews/guitar-tabs-from-video.webp on hover. Both were there before the film. Nothing from AO-078 is in the film, the captions or the new text. Fix only if Aaron wants AO-078 unlinked from this post.
- Note: when I started I ran 'git fetch origin' in /home/user/blog, which updates remote-tracking refs only. That was before I read that no state-changing git command should run there. No branch, file or index was changed.

## What the orchestrator did with them

- Repeated bracketed cues in a long listening window: left as they are (they read as one continuous cue).
- The post's existing link to AO-078 (from before the film): left; nothing from AO-078 is in the film or its captions. Aaron decides.
- Separately, the orchestrator corrected the credit line (Fable 5.2 directed at first, Opus 5.5 after that) in commit c61d3ce9 on main.
