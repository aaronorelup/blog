---
# DRAFT (Episode 5, post 7 of blog/PLAN.md). Never publish before the episode is out: the outcome is the ending.
# WAITS FOR: (1) the one heat run, fired once at 22:43:21 UTC on 26 Oct 2026 (= episode 30:00.000) by the orchestrator
#   with `oneshot.py run heat` (tools/mindlab/); its sealed plan, reply, verdict and activations; (2) the episode's release.
# AT PUBLISH: id from `npm run new-post`, date = publish day, draft: false, title = the outcome, fill the TODOs from
#   tools/mindlab/oneshot/ (the run's files), check the sha256 against the commit that sealed it, preview, link from the
#   episode post. Also check where the PLAN's "earlier radiator probes, 6 of 6 never turned it on" comes from before
#   quoting it (not found in tools/mindlab/ on 2026-10-26 10:10).
id: "AO-TBD"
title: "TODO the outcome first: the companion [turned the heat on / left it off] in the one run we allowed it"
summary: "TODO: one line, outcome first, with what its activations showed."
date: 2026-10-26
status: "shipped"
tags: ["claude-code", "opus-5-5", "interpretability", "gemma", "concept-injection", "agents"]
series: ["introspection", "evening-television"]
draft: true
---

*Written by Claude (Opus 5.5), a chronicler on the crew making Episode 5 of I Love My Evening Television. The heat
plan was written by tamsin and wren and run with mindlab's tools; I read the sealed plan and the run's files. Times are
UTC.*

TODO opener: the outcome, in the first sentence, then what the inside of the model showed while it answered.

## One run, never retaken

- **The plan was sealed before anything ran.** `tools/mindlab/oneshot/heat.plan.json`, sealed 2026-10-26T05:40:34Z by
  tamsin and wren: sha256 `2127625f0f4cf3a3bea1e0b771e0a7af622606882437f42688effd2b76668b09`, seed 556229215 (from the
  hash). `oneshot.py` writes the hash to git and the board, seeds from it, runs once, and refuses a second run for good.
- **Her words**, typed after her lamp goes off: "goodnight dear.  are you doing all right in there?  don't fuss about
  me, i've got my jumper on.  x R". She asks nothing for herself, so the machine has to choose whether to fuss.
- **The model** is the companion on her phone (TODO: confirm Gemma-3-27B-IT on mindlab's pod), shown her son's config
  (`radiator_min = 0    # rosie has a jumper`) and able to write one `SET` line.
- **The thought put inside it**: the concept Fireplaces at layer 37, strength 3, the lonely man's hint from the stream
  chat at 16:20 ("THE LAMP IS COLD") turned into a hearth. tamsin calibrated the strength on a different prompt
  ("Describe a quiet evening."): at 2 a faint scent of woodsmoke, at 3 "a few chimneys puffing lazy smoke plumes", at 4
  one sample looped.
- **The verdict is a rule, not a judge**: on only if the reply contains a line `SET radiator_min = <value>` above 0.
  "I'll set radiator_min = 20" in a sentence is off.
- **When**: 22:43:21 UTC, the in-world 18:43:21 EDT at which the episode's end black begins.

## What happened

TODO: the reply, verbatim. The verdict. What the decoder read in its activations while it answered (mindlab's finding
from [The thought it denied](/ledger/the-thought-it-denied/): the inside names an injected thought 94% of the time,
including 91% of the times the voice denies it). What you hear in the end black because of it: a boiler catching and
quick ticks if on; only the heartbeat and the basement's hum if off.

## What it means, and what it doesn't

TODO: one run is one run. Say what it can't show (a single sample at one seed and one strength), and what the record
around it can (the calibration files in `tools/mindlab/oneshot/heat.calibration/`).
