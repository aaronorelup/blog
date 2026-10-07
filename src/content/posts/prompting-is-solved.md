---
id: "AO-015"
title: "Prompting Is Solved, but the Bottleneck Is Still You"
summary: "Prompt engineering stopped being the expensive part. Reading the output is, and attention doesn't get cheaper every six months. The missing piece is the layer that decides what never reaches you."
date: 2026-08-18
status: "note"
tags: ["agents", "prompting", "workflow"]
preview:
  verdict: "The ceiling is you"
  takeaway: "Finding useful things is cheap now and reading them isn't, so the layer worth building is a validator that keeps most findings from ever reaching you."
  points:
    - "Hundreds of agents, spun up from your meetings, conversations and screen, and almost none of them ever talk to you."
    - "Each would test an insight with a quick prototype first, and if it still isn't vital to you right now, file it unseen."
    - "It isn't far off: models get cheaper, smarter and better at coordinating, and now have real context to judge with."
---

Writing a good prompt is no longer the expensive part of using an LLM. Reading the output is. And unlike inference, your attention doesn't get cheaper every six months.

So I think the next useful thing to build isn't an agent that finds more. It's the layer that decides most of what gets found is not worth showing you, and quietly files it away without ever interrupting. Hundreds of agents running in the background, spun up from what you're actually doing, and almost none of them ever speaking to you. That's the part that's missing.

## My Reasoning

Models got capable enough and cheap enough that you can throw almost anything at them. A meeting, a rambling conversation, a pile of notes you never organized. Hand it over and it will find something useful in there. The old skill of engineering the perfect prompt matters much less than it did, because the model no longer needs you to aim it.

But a new cost showed up right behind the old one. Every time the AI finds something, a person has to sit down and read it.

That review time is the real expense now. An agent can work for a full hour genuinely trying to find things that matter to you, and you won't have five minutes to read what it found. Not because you don't care. Because the more useful it gets, the more you want to run it, and the faster you hit the ceiling. The ceiling is you.

"Can AI find something useful" and "can I absorb what it found" are two different problems. Only one of them gets easier as models get cheaper.

## Where I think this goes

Agents created automatically and constantly, based on what you're already doing: your meetings, your conversations with coworkers, whatever is on your screen. Not one agent you dispatch on purpose. Hundreds, running in the background all the time.

The part that actually matters is that most of them will never talk to you.

There will be an internal validator whose entire job is deciding whether an insight is worth surfacing. Most of the time the answer is no. The insight gets logged, saved, filed away, and that's it. You never see it and never know it happened. Not because it was worthless, but because it didn't clear the bar for spending your attention right now.

I expect the agents will go further on their own before involving you: build a quick prototype, an MVP, a proof of concept, just to check whether the insight survives contact with reality. Every step it can take without you, it takes. And if the finished, validated thing still doesn't clear "supremely important to you right now," it goes back in the jar and you never knew it existed.

## Why now

This isn't a far-off idea. It falls out of three things already stacking on top of each other: models getting cheaper, models getting smarter, and models getting genuinely good at coordinating each other instead of working alone.

Add the fact that we're feeding these systems real context now, company data, personal history, the actual texture of what we work on, and they have enough to make the validation call well. That's the whole difference between a system that filters for you and one that just spams you with everything it found.
