---
id: "AO-005"
title: "AI agents rebuilt a strategy game that died in 2018"
summary: "Overnight, I had Claude rebuild a strategy game that shut down in 2018, with critic agents judging each piece blind against old screenshots. Where to play it, what it cost and why I'd pick the models myself."
date: 2026-08-07
status: "shipped"
tags: ["claude-code", "gauntlet-loop", "gamedev", "agents", "lessons"]
series: ["agent-runs"]
draft: false
topic: "agents"
project: []
preview:
  verdict: "Playable, 58 known defects"
  takeaway: "Left to pick, the prep session ran everything on the strongest model and used 30% of my weekly limit for it in one evening, so I'd choose the models myself."
  points:
    - "The overnight build took 8h39m, with one lead agent on Fable 5, Claude's top model, steering 80 agents, 76 on Opus 5."
    - "The blind critics flagged 380 problems in round one, 126 in round two and 0 in round three."
    - "Three sessions with no shared memory ran as a relay, each writing the next one's prompt, from one prompt of mine."
  image: "/media/previews/armies-of-gielinor-gauntlet.webp"
  alt: "The Armies of Gielinor recreation running in the browser: an isometric map with a river, villages and a hero unit"
---

Armies of Gielinor was a turn-based strategy game by Jagex, the RuneScape studio. It ran on their
browser games site, FunOrb, until FunOrb shut down in 2018 and took it along. All that's left is
wiki pages and a handful of screenshots.

So I had Claude rebuild it, as a test of the gauntlet loop. That's a technique where a fresh AI
critic judges each piece blind against a reference. I wrote one prompt and went to bed. **It's
playable, with 58 known defects.** Next time I'd pick the models myself. The session I let choose
put everything on the strongest model and used 30% of my weekly limit on that model in one evening.

**[Play it here.](/games/armies-of-gielinor/)** It's a fan tribute, not affiliated with Jagex,
with zero original assets. Every sprite and every sound was generated fresh.

![The recreation running live on the site](/media/armies-of-gielinor/live-on-site.png)

What came out of it:

- **Three separate Claude sessions ran as a relay.** Prep, then the build and the judging, then
  shipping. They shared no memory, so each one wrote the next one's prompt.
- **The build took 8h39m overnight.** One lead agent on Fable 5, Claude's expensive top model,
  steered 80 others, 76 of them on Opus 5, its workhorse model. Each of those is an AI worker
  given one job.
- **The critics flagged fewer problems every round.** 380 in round one, 126 in round two and 0 in
  round three.
- **The prep picked its own model.** It ran everything on Fable 5 and took 30% of my weekly
  Fable limit in one evening.
- **The game has its own editor** for fixing what's broken.

## What the gauntlet loop is

A builder agent makes a piece. A fresh critic that never hears the builder's side then compares
it with a fixed reference, in random order, without being told which one is the original. It's
Matt Shumer's idea, packaged by RoboNuggets as a
[skill](https://github.com/robonuggets/gauntlet-loop) (instructions Claude can load).

I wanted to see what it does when references are real but scarce, so each judged piece was
tagged with how strong its reference was. I only got the per-round counts (380, 126, 0) later,
from [a reader I built for agent transcripts](/ledger/reading-my-own-agents/).

The title screen went through it too.

<ao-compare cols="2" aspect="4/3">
<figure><img src="/media/armies-of-gielinor/menu-first-build.jpg" alt="The recreation's first title screen: a plain red shield with a star over two crossed staffs, a thin ARMIES OF GIELINOR title and a dim list of menu items" loading="lazy"><figcaption><b>First build</b><span class="ao-meta">a game you could start and finish, before anything was judged</span></figcaption></figure>
<figure><img src="/media/armies-of-gielinor/menu-ours.jpg" alt="The final title screen: a painted wooden shield with a sword and two axes behind a gold ARMIES OF GIELINOR logo, and the menu items in the original's order" loading="lazy"><figcaption><b>Nine hours later</b><span class="ao-meta">same repo, menu items in the original's order</span></figcaption></figure>
</ao-compare>

## The editor

[Open the editor](/games/armies-of-gielinor/?editor=1), click anything in a running match, and
you're editing that exact thing. It's there for the 58 logged defects and for anything the
critics missed.

![Clicking the Barbarian Chieftain in a match opens the unit editor on him](/media/armies-of-gielinor/editor-jump-from-game.jpg)

## What it cost

Inside the build's 8h39m, the 76 Opus 5 agents put in almost 20 hours of work. The Fable 5 lead
only steered, and the whole thing fit in one night. The bill was just under 4 million output
tokens (the text the agents wrote) on Opus 5 and 263k on Fable 5. I do wonder what the art would
have looked like if Sonnet, the cheaper model, had drawn it. I later
[put Sonnet up against Opus](/ledger/sonnet-vs-opus-gauntlet/) on three long jobs.

The prep, session 1, ran entirely on Fable 5. It picked that itself, because it decided the
research needed the strongest model. One evening of prep used 30% of my weekly Fable limit and
20% of my limit for all models. Would Fable steering Opus researchers have done it just as well
for a fraction of that? I'd rather decide that before I send a model off on its own than find
out from the meter.

## The decks and the code

- **[Session 1, the prep](/presentations/armies-of-gielinor-session-1/)** and
  **[Session 2, the build and the gauntlet](/presentations/armies-of-gielinor-session-2/)** are
  narrated decks built from evidence captured while it ran. The session 2 appendix shows every
  image the critics judged next to what the loop made, the generated music and sounds beside
  what was asked for, and every agent with its model, tokens and time.
- **The repo is public.** It has the prompts (including the two the sessions wrote for each
  other), the specs, the defect lists and the retrospective:
  [github.com/aaronorelup/armies-of-gielinor](https://github.com/aaronorelup/armies-of-gielinor).
  It isn't an ongoing project, so take whatever you want from it.
