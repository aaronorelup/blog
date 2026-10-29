---
id: "AO-010"
title: "The wall that stopped me for ten months, and the week that cleared it"
summary: "React re-rendered the whole screen on every token, and the only real fix was a migration too big and too joyless to start. Last commit 23 August 2025. Then I bought a week of Fable 5 for $200, and the first commit back — 5 July 2026, 3:23 AM — is that exact migration."
date: 2026-08-08
status: "note"
tags: ["llm-monster-hunter", "react", "burnout", "fable-5", "claude-code", "documentation", "lessons"]
series: ["origin", "llm-monster-hunter"]
draft: false
preview:
  verdict: "Cleared on the first night"
  takeaway: "Specs I'd written months earlier, expecting them to be worthless, are why the $200 week worked: the model cashed a check I'd spent a summer writing."
  points:
    - "The fix: move state out of React into an external store fed by the stream, each piece of UI subscribed to its slice."
    - "Then 137 commits in four days, and every requirement I'd ever written was built. A month later I'm still reviewing it."
    - "Large, tedious, risky, nothing new in it: any one is survivable. All four together will end a solo project."
---

Fourth of five. Previously:
[Everything Sonnet 4 got wrong](/ledger/everything-sonnet-got-wrong/).

By late August 2025 the backend of LLM Monster Hunter was genuinely good. The queue worked.
The workflow engine worked. The event registry worked. It was the first thing I'd ever
built that I was actually proud of as a *system* rather than as a demo.

Then I turned to the frontend and hit a wall I could not get over for ten months.

## The bug

Text streams out of a local model a token at a time. Every token is an event. Every event
updated React state. And every state update re-rendered the screen.

So the whole interface flickered and thrashed, constantly, for the entire duration of a
generation — which, running on my own GPU, is not a short window.

## Why I couldn't fix it

I tried every workaround I could think of, and none of them worked, because none of them
*could* work. I didn't understand React well enough to know that. I didn't know what a
re-render really was, or why passing props down still caused one, or that the thing I was
fighting was the framework working exactly as designed.

I burned a lot of time discovering, one dead end at a time, that there was no clever way
around it.

The actual fix was structural: **get the state out of React.** Keep an external store, feed
it from the streaming events, compute derived state from those events, and let each piece
of the UI subscribe to only the slice it cares about. Then React re-renders what changed
and nothing else.

Once I understood that, I understood it. That part was fine.

## What it would have cost

Here's what "just do the migration" actually meant:

- Catch **every** streaming event the backend emits, on the frontend.
- Build a registry entry for every one of them.
- Re-derive every piece of state I was already using, from events instead of from React.
- Migrate the existing architecture over to the new one.
- Then find and fix the long tail of bugs that a migration like that always produces.

Every item on that list was known. None of it was interesting. There was no new idea in it
anywhere — just weeks of careful, mechanical, high-risk transcription, at the end of which
I would have exactly the app I already had, minus the flicker.

Large, tedious, risky, and with nothing new in it. Any one of those is survivable. All four
together will end a solo project, and it doesn't matter how much you care about the thing on
the other side.

I didn't do it. I got busy, I got burnt out, and I stopped.

The last commit of 2025 is dated **23 August**.

## Two hundred dollars for one week

Fable 5 came out. I watched what people were getting out of a single prompt, and I caved and
bought the $200 Max 20x plan — specifically because the model was going to be available for
one week and I wanted to use the hell out of it before it went away.

It did not go away. I still have it more than a month later, and I've kept the subscription.
But I didn't know that at the time, and I'd have called it worth the money for that one week
alone.

I opened LLM Monster Hunter for the first time since August. Ten months and twelve days. I'd
forgotten most of it — not the architecture, which I'd designed, but the thousand small
details you need in your head to actually move.

I also moved to Claude Code for the first time, which on its own deleted the single biggest
chore of the 2025 workflow: I no longer had to decide by hand which files the model could
see, on every message, forever.

## The first commit back

Timestamped **5 July 2026, 3:23 AM**. The message is:

> `Finish frontend event registry / external store migration`

That is the wall. Verbatim. The thing that had been too large and too tedious and too
joyless to start for ten months, done in one sitting, on the first night back.

## Then it kept going

Over the next four days: **137 commits.**

Not cleanup — features. The commit log reads like a project plan being executed, because
that's what it was:

- **M1–M5**, monster depth: a five-stage generation pipeline, tiered context, progressive
  reveal, a test suite and a quality eval tool.
- **Inv-M1–M5**, inventory: items and currency, treasure paths, dialogue gifts, using items
  in dungeons and in battle.
- **Mem-M1–M7**, memory: run history, monster memories, a run journal, returning monsters
  with reunions, growth ceremonies.
- **Chat-M1–M5**: rolling summaries, streamed replies, memory extraction, a campfire chat
  screen, a 46-check offline suite.
- **Evo-M1–M4**: an evolution system with lineage, and an Evolution Altar.
- **Arch-M1–M7**: ruff configured and **2,791 findings fixed**, prettier across the
  frontend, a file-size ceiling, CI, and a 1,544-line file broken into a proper package.
- **Loop-M1–M7**: run goals, stakes, an affinity ladder, a title screen, and a post-run
  chronicle.

By the end of that week every requirement I had ever written for the project was
implemented. I am still, a month later, working through reviewing what it did — there is
that much of it.

## Why I think it worked

I want to be careful here, because the easy read is "the model got good," and I don't think
that's the whole story.

Before I wrote a single line of code on this project, back in 2025, I did the entire
software development lifecycle by hand. Project charter. Project proposal. Risk management.
Cost-benefit analysis. Full requirements. Specs. Design docs.

I did that because I have an information systems degree and those were the artifacts I'd
been taught to produce, and I wanted the practice on something of my own. I was a team of
one. There was no coordination problem for them to solve. **I expected them to be worth
nothing.**

They turned out to be the reason the week worked. When I sat down with Fable 5, I didn't
have to describe what I wanted — I handed it a specification I'd written months earlier and
it built against it. Combined with a clean core and an architecture I'd fought for line by
line, there was almost nothing left for it to guess about.

So the honest version is: **the model cashed a check I'd spent a summer writing.** I don't
know how much of that week was the model and how much was the groundwork, and I'd be
suspicious of anyone who claims to know the split.

What isn't ambiguous is the size of it. Conservatively, that week saved me six months of
working the way I had been.

## The receipt

- Last 2025 commit: **23 Aug 2025**
- First commit back: **5 Jul 2026, 3:23 AM** — the migration that stopped me
- 5–8 July 2026: **137 commits**
- The repo now: **545 commits, 183 pull requests**

Next, and last: [I don't learn programming anymore](/ledger/i-dont-learn-programming-anymore/).
