# Guitar tablature web app: research folder

Research only, for a web app that builds guitar tablature step by step with a person in the loop. Nothing
was built. Start with [PLAN.md](PLAN.md). The post made from this is live, unlisted, at
https://aaronorelup.com/ledger/guitar-tab-tools/ (`src/content/posts/guitar-tab-tools.md`, AO-079).

**The run was stopped on 2026-11-11 at about 01:25 UTC, before it was finished, because the account's
weekly usage limit was nearly used up.** What is done, what is not, and how to pick it up are below.

## What is here

| | |
|---|---|
| [PLAN.md](PLAN.md) | the plan, the tool lists, the agent assignments |
| [ENVIRONMENT.md](ENVIRONMENT.md) | the box, how runs were timed and scored |
| [PRIOR.md](PRIOR.md) | what the earlier post (AO-078) already found |
| [inputs/](inputs/) | the 17 test clips: manifest, ground truth, scripts (audio and video are in the studio library) |
| [lanes/](lanes/) | ten lanes plus `chains`. Each has `trials.md` (what ran), `survey.md` (docs, formats, licenses quoted), `for-aaron.md`, `tools.json`, samples and scripts |
| [GAPS.md](GAPS.md) | the completeness critic's 52 gaps |
| [FOR_AARON.md](FOR_AARON.md) | index of what Aaron has to run himself |
| [costs/](costs/) | token use and the API-price arithmetic |
| [ledger/](ledger/) | every logged run and every scoring run, gzipped |
| [scripts/](scripts/) | `gtr-run` (the run wrapper) and `gtr-eval` (the scoring tool) |
| [resume/](resume/) | the workflow scripts, the post's section fragments and the orchestrator's notes |

Counts as the lanes' `tools.json` files stand: 797 entries on the ten lists (some tools are on more than
one), 162 marked as run with output, 154 with steps for Aaron. 722 logged runs, 1,836 scoring runs.

## State of each lane

| Lane | Lane record | Gap rounds | Post section |
|---|---|---|---|
| audio-to-notes | verified | rounds 1 and 2 verified | drafted, not fact-checked, not in the post |
| chords-beats-key | verified | round 1 verified. Round 2 was cut off while writing: anything under "Gap round 2" is partial and unchecked | draft possibly incomplete, not in the post |
| source-separation | verified | round 2 written, its verification cut off | drafted, not fact-checked, not in the post |
| guitar-tab | verified | round 2 verified | fact-checked before round 2, not updated for it |
| fingerstyle-voices-taps | verified | round 1 verified. Round 2 written, its verification cut off | fact-checked, includes round 1 only |
| video-hands-fretboard | verified | round 2 verified, `tools.json` refresh cut off | fact-checked before round 2 |
| web-tab-render | verified | round 2 verified | fact-checked before round 2 |
| browser-audio-sync | verified | round 2 verified | fact-checked before round 2 |
| apps-survey | verified | round 2 verified | fact-checked, then updated for round 2. The update's own check was cut off |
| hosted-apis | verified | round 2 verified | fact-checked before round 2 |
| chains | verified | none | fact-checked |

## Not done

1. Fact-check and add the three missing post sections (drafts are in `resume/post/`).
2. Bring the other sections up to date with gap round 2, and shorten each section's opening.
3. Verify the cut-off gap rounds (source-separation, fingerstyle round 2, chords round 2).
4. `HANDOFFS.md`: the handoff graph across all tools. Only the tested chains exist (`lanes/chains/trials.md`)
   and each survey's "Handoff facts" section.
5. One merged `FOR_AARON.md` (today it is an index).
6. A last fact-check of the whole post against the lanes, including cross-section consistency (one tool is
   listed as not run in one section and as run in another).
7. Listing the post. It is `unlisted: true` because a listed post this long needs `npm run ask:pin`
   (`docs/ASK.md`) and would be read aloud by the paid text-to-speech job.
8. The post links to this folder on the branch `research/guitar-tab-tools`. After this pull request merges,
   change `tree/research/guitar-tab-tools` to `tree/main` in the post.

## How to pick it up

The workflow scripts are in `resume/workflows/` (they are Claude Code Workflow scripts and take the lane as
`args`). The heavy work folder `/home/user/gtr/` (virtual environments, model outputs) lives only on the
cloud box that ran this and may be gone. The records, samples, scripts and ledgers here do not depend on it.

- A post section: `gtr-post-section.js` with `{"lane": "<lane>"}` writes a fragment, checks it two ways and
  repairs it. `gtr-post-update.js` folds later gap rounds into an existing fragment.
- A gap round: `gtr-gapfill.js` with `{"lane", "round", "tasks"}`. The critic's task lists are in `resume/gaps/`.
- The handoff graph: `gtr-phase-c3.js`. The merged list for Aaron: `gtr-phase-c1.js` with `{"which": "foraaron"}`.
- The post is assembled by `resume/workflows/assemble.py` from `resume/post/_main.md`, `_front.yaml` and the
  fragments. The paths inside these scripts point at the old session's scratch folder and need changing.

Budget note for whoever resumes: each lane's five-agent workflow used roughly 2.5 million tokens, each
post section roughly 1.8 million, each gap round roughly 1.3 million (see `costs/COSTS.md`).
