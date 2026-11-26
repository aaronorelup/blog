# PUBLISH: the film at the top of AO-082, live

Agent `publisher`, 2026-11-26, following [EMBED.md](EMBED.md) section 6 steps 3 to 6. Step log and every output file:
`/home/user/gtv/work/publisher/` (`PROGRESS.md`). The film itself is described in `/home/user/gtv/production/FILM.md`
(second join: 49:35, 18 chapters, 726,291,765 bytes, md5 `ad44b6171a477b3547247c40bad49f5b`).

## Live

| Check | Result | File |
|---|---|---|
| Commit on `main` | `111de742` "AO-082: the film at the top of the post" (pushed 01:38 UTC, `e1dc2621..111de742`, no rebase needed) | `push1.log` |
| `version.json` | `"commit": "111de742c5e6971a3a374a8244a69af27b35b1e8"`, `"branch": "main"`, built 2026-11-26T01:39:22Z (first seen 01:40:14) | `version-live.json`, `version-poll.log` |
| `npm run media:verify` | 1410 of 1410 files from R2 with the right length, type and ETag; range and 304 probes on the largest MP4 (still AO-081's) | `media-verify.log` |
| curl on the film | 200 video/mp4, 726,291,765 bytes, ETag = md5, `x-media-source: r2`; ranges 0-1 and mid-file 206; If-None-Match 304; `captions.vtt` 200 text/vtt; poster and chapter stills 200 image/webp; card loop 200 video/mp4 97,244 bytes from R2; the page names the MP4 once | `live-curl.log` |
| Playwright, desktop 1440 px and phone 390 px | page 200; the video box is 16:9 before metadata (722x407, 356x201); metadata loads (duration 2975 s, 1920x1080); poster 200, 1280x720, shown (screenshot); captions track loads 644 cues; 18 chapters; a click on 39:08.97 seeks to 2348.99 s and plays; after a click on 45:17.73 that chapter is the lit one | `livecheck.json`, `live-shots.png` |

Nothing failed, nothing was reverted.

## Before the push (in `/home/user/land`, branch `land-guitar` from `origin/main` `e1dc2621`)

- `npm run check -- src/content/posts/guitar-tab-tools.md`: 0 errors, 0 warnings (`check1.log`).
- `element-usage.mjs --diff`: the old post's 11 blocks all still there, `<ao-shots>` added (`element-diff.log`).
- `npm run build`: passed, 283 pages (`build1.log`). Budget line: "post page minus its prose 22.9 KB, budget 20.0 KB,
  15% over (guitar-tab-tools)"; `npm test` fails only at 20%.
- `npm test`: 476 tests, 475 pass, 0 fail, 1 skipped (`test1.log`), the fonts test included.
- e2e (`shots`, `core`, `post`, `cards`, desktop): 32 passed, 1 failed (`e2e1.log`). The failure is post-4, which picks the
  first component-free post with a `<details>` after an h2: AO-093's page, whose fold's first paragraph has no word of 7
  letters, so the test's lookup returns nothing. It does not open AO-082. Not this change.
- The same Playwright check as above on `astro dev` (`localcheck.json`): the same results.
- Captions: the never-publish snippet of EMBED 2.4 on `captions.vtt`: 0 hits.

## What went to the site

- R2 by `npm run media:push` (`media-push.log`): `/media/guitar-tab-tools/film/guitar-video-to-tab.mp4` (726,291,765
  bytes, etag `ad44b6171a477b3547247c40bad49f5b`) and the card loop `/media/previews/guitar-tab-tools.mp4` (97,244
  bytes, etag `b81427ab0d243dc6729ea67a43f89603`). The two manifest lines are in the commit.
- Git: `public/media/guitar-tab-tools/film/` poster, `captions.vtt` (644 cues, 53,328 bytes) and `chapters/01-18.webp`;
  the card still `public/media/previews/guitar-tab-tools.webp` replaced by the loop's first frame (10,608 bytes).
- The post: the `<ao-shots>` block first in the body (times from `production/film/chapters.vtt`, labels from FILM.md);
  under it a folded credit of the three recordings (songs.json's credit strings, links from `source_url` and
  `video_url`); a third opening paragraph; the film's costs in "What it cost" with a folded table; one sentence in the
  credit line. Card: the blind test's result replaces the chain point, `loop:` added, alt "A fretting hand on a
  steel-string guitar neck". Summary: "...Then a film tests the main ones on three guitar videos..." (240 characters).
  Title, verdict, takeaway and the other two points unchanged. Still listed.

Where the post's film sentences come from (the film's own words, `/home/user/gtv/render/web/captions.vtt` read by
time, and its title cards):
- 55 to 93 notes in 100 with the kit, 35 to 82 without: the title card of chapter 16 and its narration (capo 93 / 82,
  Imagine 86 / 71, nylon 55 / 35 = round 2 in BLIND-RESULTS.md: 758, 587, 344 and 665, 479, 218 of 815, 679, 628).
- the kit won on every song, mostly by finding more notes; picked on these same recordings, which favors it; no tool
  and no attempt found the nylon guitar's tuning; what to give the AI: chapters 15 to 17.
- every tab in it is played back: FILM-QC-story.md ("Every tab shown is heard").
- just under 50 minutes: 2975.0 s = 49:35 (FILM.md).

## The film's costs as the post gives them (`/home/user/gtv/work/publisher/film-costs.json`)

- Tokens: the agent-metrics skill's `measure-agents.mjs` on this session with `--since 2026-11-24T22:15:52Z` (the
  request for the film) to 2026-11-26T01:21Z (`metrics-film.json`): 250 agent transcripts started in that window
  (`agent_starts.tsv`), output 15,691,993 tokens (Opus 5.5 15,569,613, Fable 5.2 120,653, Sonnet 5.5 1,727), cache
  reads 3,422,792,091, cache writes 77,048,283, uncached input 33,480. At the prices in the post's own table (2026-11-11):
  $1,389.91 to $1,623.34, given as "about $1,390 to $1,620".
- ElevenLabs: the account's character counter was 14,046 before the voice stage (VOICE.md) and 35,919 on
  2026-11-26T01:18:36Z (`el_counter.json`, `/v1/user/subscription`; the key read inside the script, never printed):
  21,873 credits. VOICE.md's 19,477 stopped at 33,523, before the lines voiced again later. The counter is the whole
  account's, and may hold Scribe's checks of each take.
- No graphics card: `/home/user/gtv/work/exp-gpu/POD.json` (the pod was never created, $0).
- One-call services: USD 0.029765 in 14 gateway calls (results/step-10-hosted.md), "3 cents".
- Not in the post's sentence, only pointed to: the other paid calls in the tests (ElevenLabs stems in step 1, Opus looks
  at frames in step 5).

## Studio library

`studio push blog-posts /home/user/gtv/library --agent gtv-publisher` after a clean dry run (`studio-dry.log`,
`studio-push.log`): run **`20261126-012533-vm-8c274f`**, 18 items registered, 783 MiB, then `studio promote` to
`projects/blog-posts/guitar-tab-tools/` (`studio-promote.log`).

| Item | File | Status |
|---|---|---|
| #88990 | `guitar-video-to-tab.mp4`, the film (purpose final, model hyperframes, pick) | new |
| #88991 | `narration.flac`, every placed narration line on the film's clock (157 lines, one uniform scale 0.845, mono 48 kHz, 2975.0 s; made by `make_narration.py`) | reference |
| #88992 | `poster.webp` | reference |
| #88989 | `chapter-stills-sheet.png`, the 18 title cards | reference |
| #88988, #88987 | the card still and loop | reference |
| #88975 to #88986 | the blind test's played-back tabs and beat clicks (capo, Imagine, nylon: key, kit arm, bare arm) | reference |

## Left

- Bitrate peaks over EMBED's 6 Mbit/s, as FILM.md records (not re-encoded).
- The post page's budget line is 15% over (20% fails `npm test`).
- e2e post-4 fails on AO-093's page on `main` (above).
- Not done here: a line in STATE.md (the orchestrator's file) and the research pull request note, since this agent runs no
  git command in the research checkout.
