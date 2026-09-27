---
id: "AO-008"
title: "LLM Monster Hunter was my computer science degree"
summary: "366 commits between June and August 2025. I designed the queue, the workflow engine and the event registry myself, read every line, and hand-picked which files the model could see on every single message. I learned architecture because the model kept violating it."
date: 2026-08-08
status: "note"
tags: ["origin", "llm-monster-hunter", "python", "react", "architecture", "lessons"]
series: ["origin", "llm-monster-hunter"]
draft: false
---

Second of five. Previously:
[No VS Code, no terminal, no idea](/ledger/no-vs-code-no-terminal/).

On **8 June 2025** I made the first commit to
[LLM Monster Hunter](https://github.com/Bloodtailor/LlmMonsterHunter) — seventeen days
after Claude Sonnet 4 shipped. By **23 August** there were 366 commits and then, for
reasons in [a later post](/ledger/the-wall-that-stopped-me/), nothing at all for ten
months.

That eleven-week stretch is where I actually learned to program.

## Why this project

I wanted into AI and machine learning properly, which meant Python. I looked at what the
people doing this work actually used and picked a stack to aim at: Python, Flask, React. I
had never written a line of Python. I did not know what Flask was. I did not really know
what React was either.

And I'd never made a game. So: make the game, learn the stack, and — this was the part I
was most deliberate about — learn how to *use AI to build things*, which felt like the
skill with the longest legs.

Three curricula, one project. It worked, though not in the way I planned.

## The things I had to learn because the model wouldn't

I came in with a degree that had taught me systems on paper and nothing about how a
codebase is actually organized. I didn't know what a route was. I didn't know what a
service was. I didn't know what belonged in "core," or how initialization worked, or why
two files talking to each other directly is sometimes a bug in itself.

My plan was to let Sonnet handle all of that. That plan failed, and the failure is the
whole education — I've written the catalog of *how* it failed
[here](/ledger/everything-sonnet-got-wrong/).

The short version: the only way to stop the model from wrecking the architecture was to
know the architecture better than it did. So I read every line of code that went into that
repo. Not skimmed — read. By the end I could tell you what every file did and why it sat
where it sat.

The layout that survives today is the shape of that argument:

```
backend/ai/          the model gateway, the queue, the prompt engine
backend/core/        config, the event bus, the event registry, the workflow registry
backend/game/        monsters, dungeons, state
backend/routes/      HTTP only
backend/services/    the actual work
backend/workflow/    the workflow gateway and queue
```

Routes are routes, services are services, and nothing else pretends to be either. That
sounds obvious written down. It cost me a summer.

## The systems I designed myself

Three of them, and I want to be specific that these were mine — I decided they needed to
exist, worked out how they should behave, and had Sonnet write them:

**A worker queue.** Everything runs on my own machine, one GPU. Two prompts cannot generate
at once. So generation requests go into a queue and get pulled one at a time, and every
other part of the system has to be built to wait politely.

**A workflow engine.** Some things need several prompts in sequence, and the asset only
exists if *all* of them succeed — generate the monster's concept, then its abilities, then
its art. A single failed step has to fail the whole thing cleanly rather than leave you
with half a monster. So: workflows, plus a registry where each feature registers the
workflows it owns.

**An event registry.** The backend had to tell the frontend what was happening while it was
happening — an event bus, a registry of event types, and a streaming route out to the
browser.

The through-line in all three is the same realization: *the interesting problem in an AI app
is never the AI call.* It's everything around the call — sequencing it, queueing it,
recovering from it, and telling the user what's going on while they wait.

## Debugging off the grid

The moment from that summer I like best has nothing to do with architecture.

My granddad's place is a hundred-plus-year-old ranch out in the middle of nowhere, and it
has no internet. I was out there anyway, and I was still working on Monster Hunter — vibe
debugging with no Claude, no search, no Stack Overflow, using a distilled model running on
my own machine right there in the room.

It was terrible. Noticeably, comically worse than what I'd been using all summer, and I
spent a lot of that session arguing with it. But it was *there*, on a century-old ranch with
no signal, and it was mine.

That's the part of [MyLLMServer](/ledger/no-vs-code-no-terminal/) I hadn't understood when I
built it. Owning the call means you own it everywhere — including places the internet
doesn't reach.

## The part Claude Code deleted

Here is what working with the model looked like in 2025, which is worth recording because
it's already gone.

There was no agent. I prompted Claude in a browser and pasted code back into my editor by
hand. I did connect the repo to a Claude project, and I found out — on my own, nothing told
me — that it had two modes: let it pick which files to read, or pick them yourself.

I picked them myself. Every message. Every time.

Which sounds like pure overhead, and mostly was. But it had one side effect that I now
think did more for me than any tutorial could have: **to choose the right files, you have to
know the codebase.** Every single prompt started with me reasoning about which parts of my
own system were relevant to the problem. Do that a few thousand times and you don't have a
codebase you vaguely own. You have a map.

I don't miss it. But I know exactly what it bought me, and I'll come back to that in the
[last post](/ledger/i-dont-learn-programming-anymore/).

Next: [Everything Sonnet 4 got wrong, and what each one taught me](/ledger/everything-sonnet-got-wrong/).
