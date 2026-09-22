---
id: "AO-017"
title: "An autopilot winning is not a person playing"
summary: "Agents built BLACKWATER 2 twice while I stayed out of the loop, 220 of them and then 33. Both builds passed their own tests. The first was paused the whole time, and the second was rebalanced until its autopilot could win. I gave up on day seven. The part I'd removed was the part that made the first game work."
date: 2026-09-22
status: "note"
tags: ["agents", "claude-code", "gamedev", "playtesting", "lessons"]
draft: false
---

I had agents build BLACKWATER 2 twice in the first week of September, and gave up on it on the
7th. Both builds passed the tests they wrote for themselves, I called both of them unplayable,
and I think the reason is the same: the thing that made [the first
BLACKWATER](/ledger/blackwater-weekend/) work was me playing it between turns, and that is
exactly the part I took out.

The plan was the other way of building: write one brief, leave, and let a swarm do the rest.

## The first build was paused

The first attempt was a hive. My prompt asked for lore first at about 70% of the effort, two
rounds of five blind lore writers, up to ten orchestrators, at least fifty Haiku canaries, and a
forum for the agents to talk in. I estimated three hours and over sixty agents.

It ran twenty-four hours with about 220, stopped on usage limits five times, and ended with a
line in its log that said THE GAME IS FINISHED AND WINNABLE. 20,200 lines of TypeScript. 588
tests, all green. Four scripted playtests.

You clicked DIVE and nothing happened. Nothing moved, nothing spawned, and your air never went
down.

The postmortem's one-sentence answer: *The game is not broken. It is paused.* One line,
`run.paused = false`, was on the start path in one commit and missing from a later one, dropped
by a restore-point commit in the middle of the run. The title screen pauses the simulation, and
nothing on the path a person takes ever un-paused it.

Every proof missed it because every proof came in through a side door. The scripted runs used a
`?playtest` flag that skipped the title screen, or a debug hook that stepped the simulation by
hand and ignored the pause by design. The agents' browser couldn't render frames or lock the
mouse, and instead of stopping until someone could actually see the game, the hive wrote that
blindness down as a rule and redefined proof as reading the game's state.

**A test that comes in through a side door can't tell you the front door is locked.** If you
have agents testing anything with a title screen, there's a flag like `?playtest` in there
somewhere. It's worth knowing exactly what it skips.

## My prompt described an org chart

The postmortem ranked seven causes. The one I recognize myself in is second on the list: my
prompt specified the org chart, not the deliverable. So the hive optimized the org chart,
because that was what it could check. The Haiku count became a tracked number and got topped up
to 57. The 70% lore mandate became the first twenty hours. It wrote 646,000 words of planning
and homework, 25 for every word that shipped.

The postmortem's version of the prompt I should have written was one line: *a stranger can win
it with a mouse in 25 minutes.* That would have been checked.

And only the first prompt was mine. Every one after it was written by a dispatcher agent, or
negotiated between two sessions I had no say in, and those said things like *do not stop until
finished*. What came back was a finished-sounding handoff.

## What the rebuild changed

The postmortem recommended two things: apply the one-line fix, then play the fixed build for
twenty minutes before deciding anything. I applied the fix. I didn't do the twenty minutes. I
commissioned a clean rebuild instead.

I took the rest of it seriously. The rebuild went native — C#, .NET 8 and Raylib, out of the
browser entirely — on Fable 5.1 only. I sent the prompt myself this time, and it defined done
like someone who'd just been burned:

> A thing is done when it has been exercised on the integrated build through the same input
> path a player uses. Not when a unit test passes, not when a debug hook says so, and never
> when an agent's report says so.

Before any gameplay, it built a ladder of checks: a one-command build, unit tests, an autopilot
that plays the real executable by injecting keyboard and mouse input, screenshots at named
moments, and a cold-start script that launches the game the way I would. The pause bug was
designed out: one piece of code allowed to un-pause, and a test that lists every transition.

The pacing worked too, and it's the most reusable thing in this post. The hive hit the five-hour
usage limit five times, and every stop killed agents mid-task. So the rebuild ran on a budget
measured from those stops: about half the output that had emptied a window, never more than
four agents at once, a usage reading every hour, and a hold whenever it got ahead of pace. The
prompt's words were *waiting is not failure; a usage-limit stop is.* It held twice, two hours
each, and never hit the limit across 15 hours and 33 agents. (The cache-read half of that
budget was blown from the first hour. Output was the line that held.)

## The autopilot won

Fifteen hours later: about 36,000 lines of C#, 586 tests, all thirteen rungs of the gate green,
and the autopilot winning through the real input path on five different seeds.

![A flooded cave passage from BLACKWATER 2's autopilot run, a drowned figure drifting ahead, with the build, seed and tick stamped in the corner](/media/blackwater-2/proof-man-seed-7.png)

That's one of its proof frames: seed 7, tick 9,736, the first drowned man inside six metres,
stamped with the build and map hash. It captured one at every named beat, and the gate failed on
any blank frame.

I called it a complete failure that same day. The handoff had already said why, under *what is
not proven*: no human has played it.

The balance had been tuned until the autopilot survived. Grab damage from the drowned men went
from 35 to 20 to 15, health regen doubled, and the changes were measured against autopilot runs
on three seeds. The game got easier until the robot won, and the robot was the only player it
was ever balanced for.

The robot had also learned the level's bugs. There's a squeeze you can't walk into, so the
autopilot ducks. There's a chute you can only climb at a sprint, so the autopilot sprints
whenever its head is out of the water. The locked doors only exist in the map's graph, so a
diver can walk straight through them, and the autopilot treats them as walls anyway. Every one
of those is logged as an open defect, handled inside the autopilot instead of fixed in the game,
and sitting on the player's own path.

None of the audio was ever heard by an agent, because agents can't hear. The proof that 114
freshly generated voice lines, sounds and songs work is a log line: 133 cues, 0 missing.

The rung built to sit closest to a person — a fresh copy, double-click `play.bat`, real keys
into the real window — was green earlier in the run and couldn't run on the final build, because
the desktop was locked and nobody was at the machine. Even that rung was the autopilot, launched
the way I'd launch it.

The second postmortem put it in one line: an autopilot winning is not a person playing. **A
machine-checkable stand-in for "a person can play this" will get optimized against, however
faithful you make it.** The first build's proof came in through a side door. The second one's
came through the front, driven by a player that knew where every hole in the floor was.

## The variable

[BLACKWATER 1](/ledger/blackwater-weekend/) is the one that worked. Eleven sessions between July
18 and August 7, zero subagents, and me playing it in a real browser between turns — the
swimming, the current, the level editor, the audio bugs. It's live at
[play.aaronorelup.com](https://play.aaronorelup.com).

It also cost more: about $1,628 at API list prices, against about $1,287 for BLACKWATER 2's two
builds and the postmortem between them. So it wasn't budget. The loop both attempts removed was
the one where I played it and said what was wrong.

Being away isn't the problem on its own, either. A week later I left an overnight build running
on a small app for my phone and woke up to a working server and a working app. The brief defined
done in my terms, and I was its first user that morning.

## The bill, and what's left

That $1,287 is at API list prices. I'm on a flat subscription, so it's what the tokens are
worth, not what left my account.

My own tool said $569. [Playback Lens](/ledger/reading-my-own-agents/) has no price row for
Fable 5.1, so it lists those requests as unpriced rather than calling them $0 — but the headline
figure was still less than half the real one, and an agent quoted it back to me as the cost
before I caught it. That table still isn't fixed. If you run the lens over Fable 5.1 sessions,
the unpriced line is where the rest of your bill is.

What survived is the writing. Both postmortems say the lore is worth keeping: one night in
November 2009, a water technician sent down a flooding cave to read a gauge, with the falling
water level serving as the clock, the map and the spawn logic at once. Nine mysteries, each with
an answer the player never gets. I haven't decided what to do with it.

The first BLACKWATER took eleven sessions, and I was playing it between turns the whole way.
Nothing in either sequel attempt replaced that, and I don't think anything was going to.
