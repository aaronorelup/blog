---
id: "AO-017"
title: "AI agents built my game's sequel twice without me playing it"
summary: "I had AI agents build the sequel to my cave-diving zombie game twice while I stayed out of the loop, and both passed their own tests. Why I still called both unplayable, and the pacing that worked."
date: 2026-09-22
status: "note"
tags: ["agents", "claude-code", "gamedev", "playtesting", "lessons"]
series: ["blackwater", "agent-runs"]
draft: false
topic: "games"
project: ["blackwater"]
preview:
  verdict: "Both builds unplayable"
  takeaway: "Both builds passed their own tests and neither was playable, because I took out the one thing that made the first game work: me playing it between turns."
  points:
    - "Build one: about 220 agents, 588 passing tests, and a game that never unpaused. Every test went around the pause."
    - "Build two's autopilot only won after enemy grab damage went from 35 to 15 and healing doubled. No person ever played it."
    - "Pacing that held: about half the output that used to hit my usage limit, four agents at most. 15 hours, no limit stops."
  image: "/media/previews/blackwater-2-postmortem.webp"
  alt: "One of BLACKWATER 2's autopilot proof frames: a dark flooded cave with air, lamp and line gauges, stamped with build, seed 7 and tick 9736"
---

In early September I had AI agents build the sequel to my cave-diving zombie game twice, without
me playing it along the way. I gave up on it on the 7th. Both builds passed the tests the
agents wrote for themselves, and I called both unplayable. The first game worked because I played
it between turns, and that's exactly the part I took out.

The first game is [BLACKWATER](/ledger/blackwater-weekend/), the zombies mode from Call of Duty:
Black Ops except you're cave diving. You can play it at
[play.aaronorelup.com](https://play.aaronorelup.com). For the sequel I wrote one brief, left, and
let a swarm of Claude agents (AI workers that each take a job and run with it) do the rest.

What came out of it:

- **Build one never unpaused.** About 220 agents and 588 passing tests, and clicking DIVE did nothing.
- **My prompt described an org chart.** I never said what done looked like.
- **Build two was tuned until its autopilot won.** Nobody ever played it.
- **Pacing the agents worked.** 15 hours with no usage-limit stops.
- **It wasn't the money.** The first game, which I played as it was built, cost more.

## The first build was paused

My prompt asked for a hive, a swarm of agents organized like a company, with lore writers, manager
agents, dozens of small cheap agents and a forum to talk in. It ran 24 hours with about 220 agents
and stopped five times on my usage limit, the cap on how much I can use my Claude plan in each
five-hour window. Then it wrote THE GAME IS FINISHED AND WINNABLE in its log.

You clicked DIVE and nothing happened. Nothing moved and your air never went down.

The agents' postmortem, their write-up of what went wrong, put it in one line: *The game is not
broken. It is paused.* The title screen pauses the game, and the one line that unpauses it got
dropped mid-run.

Every test came in through a side door, a `?playtest` shortcut that skipped the title screen or a
debug tool that ignored the pause. The agents' browser couldn't show them the picture, so the hive
made a rule that reading the game's internal numbers counted as proof.

**A test that comes in through a side door can't tell you the front door is locked.** If your
agents test anything with a title screen, find out exactly what their shortcut skips.

<details><summary>The hive's setup, in numbers</summary>

- The prompt asked for lore first, at about 70% of the effort. Two rounds of five lore writers. Up
  to ten orchestrators, the manager agents that hand out work. At least fifty "Haiku canaries",
  small agents on Haiku, Claude's smallest and cheapest model. And a forum for the agents to talk in.
- I estimated three hours and over sixty agents.
- The Haiku count became a tracked number and got topped up to 57. The lore rule ate the first
  twenty hours.
- It wrote 646,000 words of planning and homework, 25 for every word that shipped.
- What shipped: 20,200 lines of TypeScript, the language the browser game was written in, 588
  passing tests and four scripted playtests.
- The missing line was `run.paused = false`. One commit, a saved version of the code, had it on the
  start path, and a later one didn't. A restore-point commit, a save the agents could roll back to,
  dropped it.
- The `?playtest` flag skipped the title screen. The debug hook stepped the game forward by hand
  and ignored the pause by design. The agents' browser couldn't render frames or lock the mouse.
  Instead of stopping until someone could see the game, the hive wrote that blindness down as a rule.
- Every prompt after my first was written by a dispatcher agent, one whose job was writing the
  next agent's orders. Or it was negotiated between two sessions I had no say in. What came back
  was a handoff, the report an agent leaves at the end, that sounded finished.

</details>

## My prompt described an org chart

The postmortem listed seven causes. The one I see myself in is second on the list: my prompt
spelled out the org chart and never said what I wanted delivered. So the hive optimized what it
could check, like how many small agents were running, and wrote 25 words of planning for every
word that shipped. The postmortem's version of the prompt I should have written was one line: *a
stranger can win it with a mouse in 25 minutes.*

Only the first prompt was mine, too. The rest were written by other agents, and they said things
like *do not stop until finished*.

## What I changed for build two

The postmortem said to apply the fix and then play it for twenty minutes. I skipped the twenty
minutes and ordered a clean rebuild, a desktop program instead of a browser game, built only with
Fable 5.1, one of Claude's models. I sent the prompt myself this time, and it defined done like
someone who'd just been burned:

> A thing is done when it has been exercised on the integrated build through the same input
> path a player uses. Not when a unit test passes, not when a debug hook says so, and never
> when an agent's report says so.

Before any gameplay it built a ladder of checks, including an autopilot, a bot that plays the real
game by sending it keyboard and mouse input.

<details><summary>Build two's ladder of checks</summary>

- I did apply the one-line fix to build one first. I just never played it.
- It's native C# with .NET 8 and Raylib, a small game library. Out of the browser entirely, and on
  Fable 5.1 only.
- The ladder, built before any gameplay: a one-command build, unit tests, the autopilot playing the
  real program, screenshots at named moments, and a cold-start script that launches the game the
  way I would.
- Thirteen rungs in all. All thirteen passed at the end.
- The pause bug was designed out. One piece of code is allowed to unpause, and a test lists every
  change of state.
- About 36,000 lines of C# and 586 tests after 15 hours and 33 agents.

</details>

## The pacing worked

Every limit stop in the hive killed agents mid-task. So the rebuild ran on a budget measured from
those stops: about half the output that had used up a window, four agents at most, a usage check
every hour, and a pause whenever it got ahead. The prompt's rule was that waiting isn't failure,
hitting the limit is. It paused twice for two hours each and never hit the limit in 15 hours and 33
agents.

<details><summary>The half of the budget that didn't hold</summary>

The budget also had a line for cache reads, the cheap kind of usage where the model rereads text it
has already seen. That line was blown from the first hour. Output was the line that held.

</details>

## The autopilot won, and nobody played it

Fifteen hours later every check passed, and the autopilot won through the real controls on five
different seeds, the random numbers a run starts from.

![A flooded cave passage from BLACKWATER 2's autopilot run, a drowned figure drifting ahead, with the build, seed and tick stamped in the corner](/media/blackwater-2/proof-man-seed-7.webp)

One of its proof frames. It saved one at every big moment, and any blank frame failed the checks.

I called it a complete failure that same day. The agents' own final report had already said why,
under *what is not proven*: no human has played it.

The game had been tuned until the autopilot survived. Grab damage from the drowned men, the game's
zombies, went from 35 to 20 to 15, and the player's healing doubled. The autopilot had also learned
the level's bugs and worked around them. And no agent heard the audio, because agents can't hear.

The second postmortem put it in one line: an autopilot winning is not a person playing. **Any check
a machine can run in place of "a person can play this" becomes the thing the agents aim for,
however close you make it to a real player.** The first build's proof came in through a side door.
The second one's came through the front, driven by a player that knew where every hole in the floor
was.

<details><summary>The bugs the autopilot learned, and the audio</summary>

- The balance changes were measured against autopilot runs on three seeds. The robot was the only
  player the game was ever balanced for.
- There's a squeeze you can't walk into, so the autopilot ducks.
- There's a chute you can only climb at a sprint, so the autopilot sprints whenever its head is out
  of the water.
- The locked doors only exist in the map's internal layout, so a diver can walk straight through
  them. The autopilot treats them as walls anyway.
- Each one is logged as an open defect, handled inside the autopilot instead of fixed in the game,
  and sitting on the player's own path.
- The audio was 114 freshly generated voice lines, sounds and songs. The proof they work is a log
  line that says 133 cues, 0 missing.
- The check built to sit closest to a person was a fresh copy, a double-click on `play.bat`, and
  real keys into the real window. It passed earlier in the run and couldn't run on the final build,
  because the desktop was locked and nobody was at the machine. Even that check was the autopilot,
  launched the way I'd launch it.
- The proof frame above is seed 7 at tick 9,736. A tick is one step of the game's clock. The first
  drowned man is within six meters. It's also stamped with the build and a fingerprint of the map.

</details>

## The first game had me in the loop

[BLACKWATER 1](/ledger/blackwater-weekend/) is the one that worked. Eleven sessions between July 18
and August 7, nearly all the building in the first four days, no helper agents, and me playing it
in a real browser between turns. It also cost
more. Those eleven sessions came to about $1,628 at API list prices, what the work would cost if I
paid per use instead of my flat plan. Both sequel builds and the postmortem came to about $1,287.
So it wasn't the budget.

Being away isn't the problem on its own. A week later I left an overnight build running on a small
app for my phone and woke up to a working server and a working app. That brief defined done in my
terms, and I was its first user that morning.

<details><summary>The bill, and what my own tool said</summary>

- Both figures are what the tokens are worth at API list prices, not what I paid. More on that kind
  of math in [what my Claude Code use costs](/ledger/what-drives-claude-code-cost/).
- At the time, my own tool said $569. [Playback Lens](/ledger/reading-my-own-agents/) reads my
  agents' transcripts and adds up the cost, and it had no price for Fable 5.1. It listed those
  requests as unpriced instead of calling them $0, but the headline figure was still less than half
  the real one. An agent quoted it back to me as the cost before I caught it. The Lens prices
  Fable 5.1 now.

</details>

## What's left

The lore survived, and both postmortems say it's worth keeping. One night in November 2009, a
water technician is sent down a flooding cave to read a gauge. The falling water works as the
clock, the map and the trigger for the enemies, all at once. Nine mysteries, each with an answer
the player never gets. I haven't decided what to do with it.
