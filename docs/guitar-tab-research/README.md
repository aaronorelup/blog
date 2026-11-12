# Guitar tablature web app: research folder

Research only, for a web app that builds guitar tablature step by step with a person in the loop. Nothing
was built. Start with [PLAN.md](PLAN.md). The post made from this is live, unlisted, at
https://aaronorelup.com/ledger/guitar-tab-tools/ (`src/content/posts/guitar-tab-tools.md`, AO-082. It first went out as AO-079, an id another
post on `main` already had, and a later commit on `main` gave it AO-082).

The run took two sittings. The first was stopped by hand on 2026-11-11 at about 01:25 UTC, because the
account's weekly usage limit was nearly used up. The second started on 2026-11-12 at about 03:45 UTC on the
same box and finished everything the first had left open (see "What the second sitting did").

## What is here

| | |
|---|---|
| [PLAN.md](PLAN.md) | the plan, the tool lists, the agent assignments |
| [ENVIRONMENT.md](ENVIRONMENT.md) | the box, how runs were timed and scored |
| [PRIOR.md](PRIOR.md) | what the earlier post (AO-078) already found |
| [inputs/](inputs/) | the 17 test clips: manifest, ground truth, scripts (audio and video are in the studio library) |
| [lanes/](lanes/) | ten lanes plus `chains`. Each has `trials.md` (what ran), `survey.md` (docs, formats, licenses quoted), `for-aaron.md`, `tools.json`, samples and scripts |
| [HANDOFFS.md](HANDOFFS.md), [handoffs.json](handoffs.json), [handoffs/](handoffs/) | every tool by stage, how an agent calls it, what it reads and writes, and every handoff between tools as a fact with its evidence (tested with run ids, or from documentation). Three diagrams |
| [FOR_AARON.md](FOR_AARON.md) | everything Aaron has to run himself: 120 numbered tests, with what to send back |
| [GAPS.md](GAPS.md) | the completeness critic's 52 gaps. What was done about each is in the lane's `trials.md` under "Gap round" |
| [costs/](costs/) | token use in both sittings and the API-price arithmetic |
| [ledger/](ledger/) | every logged run and every scoring run, gzipped |
| [scripts/](scripts/) | `gtr-run` (the run wrapper) and `gtr-eval` (the scoring tool) |
| [resume/](resume/) | how the post was put together: the workflow scripts, the post's part files and the orchestrator's notes |

Counts as the lanes' `tools.json` files stand on 2026-11-12: 800 entries on the ten lists, 163 marked as
run, 159 with steps for Aaron. 96 of the 800 are datasets, and some tools are on more than one list:
`handoffs/count_tools.py` merges the other 704 entries into 575 tools (128 ran on the box, 10 ran only on
a public demo or through an API, 116 did not run and have steps for Aaron, 321 did not run and have none).
730 logged runs, 1,856 scoring runs.

## Audio and video

Nothing audible or watchable is in git. Three sets are in the studio library, project `blog-posts`, filed as
reference: the 26 test clip files are run `20261110-225132-vm-7d3107` (items #70897 to #70922). The tool
outputs the post lists as still to upload are run `20261111-014252-vm-47406b` (42 files, first sitting) and
run `20261112-061802-vm-701b77` (33 files, second sitting, items #71654 to #71686).

## State of each lane

Every lane's record, every gap round and every post section has been checked by an agent other than the one
that wrote it. The checks are the "Verification log" sections at the end of each `trials.md` and `survey.md`.

| Lane | Entries | Marked as run | Steps for Aaron | Gap rounds checked |
|---|---|---|---|---|
| source-separation | 64 | 16 | 11 | round 2 |
| audio-to-notes | 99 | 16 | 21 | rounds 1 and 2 |
| chords-beats-key | 85 | 20 | 18 | rounds 1 and 2 |
| guitar-tab | 95 | 13 | 8 | round 2 |
| fingerstyle-voices-taps | 65 | 14 | 19 | rounds 1 and 2 |
| video-hands-fretboard | 75 | 17 | 11 | round 2 |
| web-tab-render | 80 | 18 | 8 | round 2 |
| browser-audio-sync | 101 | 36 | 14 | round 2 |
| hosted-apis | 76 | 13 | 21 | round 2 |
| apps-survey | 60 | 0 | 28 | round 2 |
| chains | five cross-lane chains, `trials.md` only | | | none needed |

Round 1 was run only for the lanes that finished early, before the critic's list existed. Round 2 is the
critic's list.

## What the second sitting did

1. Finished the three checks the stop had cut off: source-separation round 2 and fingerstyle-voices-taps
   round 2 (both continued under their own headings), and chords-beats-key round 2, which had not started
   and was run and checked in full.
2. Wrote and fact-checked the three post sections that were missing (source separation, audio to notes,
   chords and beat), each with two independent checkers and a repair pass, and brought the other eight up
   to date with the gap rounds.
3. Wrote [HANDOFFS.md](HANDOFFS.md) with two independent checkers and a repair pass.
4. Merged the ten lanes' lists into one [FOR_AARON.md](FOR_AARON.md) and checked it.
5. Ran a last check of the whole post: its top part against the records, and the eleven sections against
   each other.

## Left for Aaron

1. The 120 tests in [FOR_AARON.md](FOR_AARON.md), none of which has to be done.
2. Listing the post. It is `unlisted: true` because a listed post this long needs `npm run ask:pin`
   (`docs/ASK.md`) and would be read aloud by the paid text-to-speech job.
3. The post links to this folder on the branch `research/guitar-tab-tools`. After the pull request merges,
   change `tree/research/guitar-tab-tools` and `blob/research/guitar-tab-tools` to `tree/main` and
   `blob/main` in the post.
4. The three decisions in FOR_AARON.md under "Three things only you can decide".

## How the post was put together

The workflow scripts are in `resume/workflows/` (Claude Code Workflow scripts). The heavy work folder
`/home/user/gtr/` (virtual environments, model outputs) lives only on the cloud box that ran this and may be
gone. The records, samples, scripts and ledgers here do not depend on it.

- A lane: `gtr-lane-v2.js`. A gap round: `gtr-gapfill.js`. The critic and the chains: `gtr-phase-c1.js`.
- A post section: `gtr-post-section.js` writes a fragment, checks it two ways and repairs it.
  `gtr-finish.js` (second sitting) continues a cut-off check, updates a fragment for later gap rounds and
  checks it.
- The handoff map: `gtr-phase-c3.js`. The merged list for Aaron: `gtr-foraaron.js`. The last check of the
  whole post: `gtr-final.js`.
- The post is assembled by `resume/workflows/assemble.py` from the part files in `resume/post/`
  (`_front.yaml`, `_main.md`, `_clips.md`, one fragment per section, `_fills.json` for the measured figures
  and `_pending.md`, which `make_pending.py` builds from the fragments). The paths inside these scripts
  point at the session's scratch folder.

Cost of each kind of job, from the second sitting's own counts: a section update with its check used about
0.6 to 0.9 million tokens, a first fact-check of a section with two checkers and a repair about 1.6 to
1.9 million, a gap round about 1.4 million (see `costs/COSTS.md`).
