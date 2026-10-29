---
id: "AO-005"
title: "I resurrected a dead Jagex game to test the gauntlet loop"
summary: "Three Claude Code sessions, zero shared memory, one overnight gauntlet: builder agents judged blind against surviving screenshots of a game that died in 2018. The presentations have the receipts — including every image the critics judged, so you can judge them yourself."
date: 2026-08-07
status: "shipped"
tags: ["claude-code", "gauntlet-loop", "gamedev", "agents", "lessons"]
series: ["agent-runs"]
draft: false
preview:
  verdict: "Playable; 58 known defects"
  takeaway: "Decide the model mix before an overnight run: one Fable 5 orchestrator steering Opus 5 workers fit the night, while a session left to choose ran all-Fable."
  points:
    - "Build and gauntlet: 8h36m, almost 20 hours of agent time, 76 agents, just under 4M Opus 5 output tokens and 263k Fable."
    - "The prep session picked Fable 5 for everything itself: one evening took 30% of my weekly Fable limit on a Max 20x plan."
    - "Three sessions with no shared memory, each writing the next one's prompt. Every sprite and sound was generated fresh."
  image: "/media/previews/armies-of-gielinor-gauntlet.webp"
  alt: "The Armies of Gielinor recreation running in the browser: an isometric map with a river, villages and a hero unit"
---

Armies of Gielinor was a turn-based strategy game Jagex shipped on FunOrb.
FunOrb died in 2018 and took it along — no servers, no client, nothing left but
wiki pages and a handful of screenshots.

So I had Claude rebuild it. **[Play it here.](/games/armies-of-gielinor/)** Fan
tribute, not affiliated with Jagex, zero original assets — every sprite and
every sound generated fresh. It even ships with a full in-browser content
editor: [open it](/games/armies-of-gielinor/?editor=1), click anything in a
running match, and you're editing that exact thing.

![The recreation running live on the site](/media/armies-of-gielinor/live-on-site.png)

The game was never the point, though. The point was to test a technique called
the **gauntlet loop** — Matt Shumer's idea, packaged as
[RoboNuggets' skill](https://github.com/robonuggets/gauntlet-loop): a builder
agent makes the thing, and a *fresh* critic that never sees the builder's
effort story judges it blind against a fixed reference, in a randomized A/B
where the critic doesn't know which image is the original. I wanted to know
what that loop actually does when the references are real but scarce, so every
judged item was tagged with the tier of standard it was judged against, and
the whole run was instrumented — tokens, wall clock, per-agent, per-model.

It ran as a relay: three sessions, no shared memory, each writing the next
one's prompt. Prep, gauntlet, ship. I wrote one prompt and went to bed.

Rather than tell you how it went, I'll let it speak for itself:

- **[Session 1 — the prep](/presentations/armies-of-gielinor-session-1/)**, and
  **[Session 2 — the gauntlet](/presentations/armies-of-gielinor-session-2/)** —
  narrated presentations built from evidence captured while it happened.
- **The Appendix on the session 2 deck is the most important thing this project
  delivered.** It has a *judge-it-yourself* section with every image the
  critics were shown next to the sprites that came out of the loop, a
  *listening station* with all the generated music and sound effects beside
  what was requested, and the full bill — output tokens by model, plus an
  every-agent breakdown showing each agent that was spawned, its model, its
  output tokens and its wall clock. If you want to run something like this
  yourself, that table is the map.
- **The whole repo is public** — the prompts (including the two the sessions
  wrote for each other), the specs, the defect ledgers, the retrospective:
  [github.com/Bloodtailor/armies-of-gielinor](https://github.com/Bloodtailor/armies-of-gielinor).
  Not an ongoing project; take whatever you want from it.

The bill is the part I keep looking at. Session 2 — the entire game build and
gauntlet — took **8h36m of wall clock containing almost 20 hours of Opus 5
agent time across 76 agents**: just under 4 million Opus 5 output tokens, with
a single Fable 5 orchestrator spending only 263k. That shape is exactly what
you want — the expensive model steering, the workhorse model working, and the
whole thing sized perfectly for an overnight session. I do wonder what the art
would have looked like if Sonnet had drawn it.

Session 1 was the opposite lesson: it ran *entirely* on Fable 5 — its choice,
not mine; it judged the research needed the strongest model — and one evening
of prep consumed 30% of my weekly Fable limit on a Max 20x plan and 20% of my
all-models limit. Would Fable orchestrating Opus researchers have prepped just
as well for a fraction of that? Probably worth deciding explicitly before
sending a model off on its own, rather than finding out from the meter.

<!-- what-i-learned: Aaron adds this section -->

Play it, break it, and if you find something the critics missed — there are 58
known defects already cataloged, and the editor exists precisely to fix them.
