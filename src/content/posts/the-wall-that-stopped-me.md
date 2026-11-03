---
id: "AO-010"
title: "Restarting my AI game after a ten-month stall"
summary: "My AI game sat for ten months behind one big, boring rewrite. Claude's new Fable 5 model did it on my first night back. What that week built, and why I credit the specs I wrote by hand."
date: 2026-08-08
draft: false
topic: "learning"
project: ["origin", "llm-monster-hunter"]
preview:
  verdict: "Fixed on the first night"
  takeaway: "I think the week worked because the model built straight from specs I'd written by hand before any code, documents I'd expected to be worthless."
  points:
    - "The fix for a flickering screen was moving its live data out of React, the library that draws it, to a separate store."
    - "137 commits in four days built every requirement I'd ever written. A month later I'm still reviewing it all."
    - "Large, tedious, risky and nothing new: any one is survivable, but all four together will end a solo project."
  image: "/media/previews/the-wall-that-stopped-me.webp"
  alt: "An old stone wall broken open, with paper scrolls stacked against it like steps up through the gap"
---

My game [LLM Monster Hunter](/ledger/monster-hunter-was-my-degree/), where an AI makes up every
monster as you play, sat untouched for ten months behind one big, boring rewrite. When Claude's
new model Fable 5 came out, I bought the $200 Max plan to try it, and **it did the rewrite on my
first night back**, in July 2026. I think the week went that well because it built straight
from specs I'd written by hand before any code.

- **Every word the AI wrote re-drew the whole screen.** Fixing it meant moving the app onto a new
  setup, a job called a migration.
- **It was large, tedious, risky and nothing new.** Any one is survivable. All four at once will
  end a solo project.
- **The first commit back is that exact migration.** Then 137 commits (saved changes) in four days
  built every requirement I'd ever written.
- **Conservatively, that week saved me six months** of working the way I had been.

## Why I think it worked

I handed Fable 5 a spec from months earlier and it built against it, so I never had to explain
what I wanted. With a clean core and an architecture I'd fought for line by line, it had almost
nothing to guess.

In 2025 I'd done the whole software development process by the book. A project charter, a
proposal, risk management, a cost-benefit analysis, requirements, specs and design docs. My degree
is in information systems and I wanted the practice. I was a team of one, so I expected all of it
to be worth nothing.

I can't say how much was the model and how much was the groundwork, and I'd be suspicious of
anyone who claims to know the split.

## The bug I couldn't get past

Every token the AI wrote, a word or a piece of one, changed the data on screen. Every change made
React, the code library that draws the screen, re-draw all of it. So it flickered the whole time
the model was writing.

<figure class="wide">
  <img src="/media/the-wall-that-stopped-me/evolution-streaming.webp" alt="LLM Monster Hunter's evolution screen: a painted golden moth monster called Luminel, with a paragraph of story text below it still being written, and a counter at the top right reading Generating text: 82 tokens" loading="lazy">
  <figcaption><b>The AI writing a scene, live</b><span class="ao-meta">This kind of stream used to re-draw the whole screen with every token · from <a href="/ledger/keeper-and-the-beacon/">Claude's playthrough of the game</a> a month after the fix</span></figcaption>
</figure>

I hit this in late August 2025, just as the part of the game that talks to the AI was finally
working well. None of my workarounds could have worked. React was doing exactly what it's
built to do, and I didn't know it well enough to see that.

The real fix was to **get the data out of React**. The AI's words go into a separate data store,
and each part of the screen re-draws only when its own piece changes.

## What the fix would have cost

Weeks of careful, mechanical work to end up with the app I already had, minus the flicker.

- Catch **every** event the AI side of the game sends, on the screen side.
- Make an entry for each one in a registry, a master list of events.
- Work out all the data I already used again, from events this time.
- Move the existing setup over to the new one.
- Fix the long tail of bugs a migration like that always brings.

I got busy and burnt out, and I stopped. My last commit of 2025 is dated **23 August**.

## The week with Fable 5

I'd seen what people got from Fable 5 with one prompt, and I caved. The model was only
supposed to be around for a week and I wanted to use the hell out of it. It stayed, and I've kept
the plan.

Coming back, I'd forgotten most of the small details of my own game. I also moved to Claude Code,
Anthropic's agent that works in your project's files by itself. That ended my biggest chore,
picking by hand which files the model could see on every message.

The first commit back, ten months and twelve days after the last, came at 3:23 AM on 5 July 2026:

> `Finish frontend event registry / external store migration`

## What the next four days built

137 commits, mostly new features, straight down my project plan. Monster generation, inventory,
memory, chat, evolution, a code cleanup and the loop around a whole run. A month later I'm still
reviewing it all.

<figure class="wide">
  <img src="/media/the-wall-that-stopped-me/campfire.webp" alt="The Campfire Chat screen in LLM Monster Hunter: a list of companions on the left and a conversation on the right between the player, Maren Holt, and her moth monster Luminel" loading="lazy">
  <figcaption><b>The campfire chat screen</b><span class="ao-meta">One of the things that week built: you talk to your monsters between runs, and they remember it</span></figcaption>
</figure>

<details><summary>Everything the four days built, milestone by milestone</summary>

- **Monster depth, 5 milestones:** a five-stage pipeline for making each monster, a test suite
  and a tool that rates their quality.
- **Inventory, 5:** items and currency, treasure paths, gifts in dialogue, and using items in
  dungeons and in battle.
- **Memory, 7:** run history, monster memories, a run journal, monsters that come back with
  reunions, and growth ceremonies.
- **Chat, 5:** rolling summaries, streamed replies, pulling memories out of chats, a campfire
  chat screen, and a 46-check test suite that runs offline.
- **Evolution, 4:** an evolution system with lineage, and an Evolution Altar.
- **Code cleanup, 7:** a Python code checker called ruff, with **2,791 of the problems it found
  fixed**. Prettier, an auto-formatter, across the screen code. A size limit on files.
  Automatic checks on every change. And one 1,544-line file split into a folder of smaller ones.
- **The run loop, 7:** run goals, stakes, an affinity ladder, a title screen, and a chronicle
  written after each run.

When I wrote this [the repo](https://github.com/aaronorelup/LlmMonsterHunter) had 545 commits and
183 pull requests (bundles of changes put up for review). If you want to play it, the game has
a [plain-English guide](https://github.com/aaronorelup/LlmMonsterHunter/tree/main/LLM-Monster-Hunter-For-Friends).

</details>

Previously: [Six problems Claude never flagged while I learned to code](/ledger/everything-sonnet-got-wrong/).
Next: [What I learn now that AI writes my code](/ledger/i-dont-learn-programming-anymore/).
