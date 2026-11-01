---
id: "AO-012"
title: "Why I stopped checking on my AI agents every hour"
summary: "I used to keep AI agents busy all day and check on them every hour. What that really cost me on a two-day project, and the rhythm I switched to: one big run, then a day to review it."
date: 2026-08-08
status: "in-progress"
tags: ["agents", "claude-code", "workflow", "prompting", "lessons"]
series: ["origin"]
topic: "agents"
project: ["origin"]
preview:
  verdict: "Agent time was never scarce"
  takeaway: "Keeping agents busy was the wrong goal, because checking in every hour meant reloading the project in my head twenty times and never understanding it."
  points:
    - "The reviews added up to only 3 or 4 hours. The real cost was loading the project back into my head twenty times."
    - "Now I burst: one big run with lots of agents, then a review day of about four hours while nothing changes."
    - "Still unproven: I don't know the right size for a burst. The biggest so far ran 8 hours with 80 agents."
  image: "/media/previews/stopped-keeping-agents-fed.webp"
  alt: "A strategy game map: knights and an owl in blue rings face goblins and a skeleton in red rings, near a river and small villages"
---

I used to keep my AI agents busy all day and check in on them every hour. On a two-day rework
of my code that meant about twenty check-ins, and I never understood the system I was building,
because it kept changing while I read it. So now I send off one big run, then spend a day
reviewing it while nothing changes.

By agents I mean AI like Claude Code that works on my projects by itself, then reports back. For
months I made sure no agent was ever idle, and that was the wrong goal. Agent time is cheap. What
I need is a version of the project that holds still long enough for me to understand it.

- **Reviewing only took 3 or 4 hours** over the two days.
- **Loading the project back into my head cost the most.** I did that twenty times.
- **Now I burst.** One big run every other day, then a review day of about four hours, then a plan.
- **The right size for a burst is still open.** As of 8 August, the biggest so far ran 8 hours with 80 agents.

## The two-day project that changed my mind

I used to send an agent out for fifteen minutes to an hour, review what came back and hand it the
next thing. An idle agent felt like waste.

Then I did a ten-step refactor, which means reorganizing how the code fits together without
changing what it does. Two days, about twenty prompts, a check-in roughly every hour.

Every check-in I dropped what I was doing and loaded the project back into my head to work out
what had changed. Five to fifteen minutes is enough to approve a step and nowhere near enough to
understand how the whole thing fits together. And the pressure was to get the next prompt out, so
I'd skim and hand it more work. After two days I couldn't have drawn you the system I'd just
built.

I had ElevenLabs, an AI voice service, read the reports to me. That helped with the reading
fatigue, but I still had to switch back in every hour. And three projects like that at once
would've been exhausting.

<details><summary>The exact setup of the refactor</summary>

- I drafted the plan, a file called `plan.md`, with Fable 5. Fable 5 and Opus 5 are both Claude
  models.
- Opus 5 got it in a fresh session (a new conversation that starts with no memory) with orders
  to do the next step, split a step into smaller ones when it needed to, and update `plan.md` as
  it went.
- Whenever its context window got close to full, I started a new session. The context window is
  how much of the conversation the model can hold at once.
- About twenty prompts over two days, a check-in roughly every hour, five to fifteen minutes each.
- The reviews themselves only added up to three or four hours.

</details>

## How bursting works

Every other day I build one big workflow, a manager agent handing pieces to a team of agents
under it, and fire several off back to back. They make the actual things, plus the reports and
presentations. Then it's burst day, review day, plan, repeat. It's the "work in bursts" lesson
from [what I learn now that AI writes my code](/ledger/i-dont-learn-programming-anymore/).

Review day is one sitting of about four hours. Nothing changes while I read, so I can follow a
decision through the code and it's still true at the end. It helps to
[ask for the presentation at the start of the run](/ledger/keeper-and-the-beacon/), so the burst
hands me a narrated recap instead of a pile of code changes.

My biggest burst so far happened by accident. It was a test of the
[gauntlet loop](/ledger/armies-of-gielinor-gauntlet/), a builder agent paired with a fresh critic
that judges its work blind. It ran 8 hours and spawned 80 agents off a single prompt
while I slept.

<figure class="wide">
  <img src="/media/armies-of-gielinor/card.webp" alt="A strategy game map in the browser: knights and an owl in blue rings face goblins and a skeleton in red rings, near a river and small villages" loading="lazy">
  <figcaption><b>The biggest burst so far</b><span class="ao-meta">Armies of Gielinor, a strategy game that shut down in 2018, rebuilt overnight by 80 agents from one prompt. <a href="/games/armies-of-gielinor/">Play it here</a></span></figcaption>
</figure>

## What I give up

I make fewer course corrections, and each one is bigger, so mistakes could last longer before I
catch them. I don't think they do. Instructions I write after a review day are a lot better than
the ones I wrote while skimming to keep the queue full.

## What I don't know yet

I've only started running this. It isn't proven yet.

- **How big a burst should be.** Too big and review day stops being digestible. The 8-hour run
  was a whole project on its own. When I [built a game from one prompt](/ledger/grind-and-grimoire/),
  asking for more made parts I hadn't touched worse, and I don't know yet if a burst does the same.
- **How many agents a manager should run.** The gauntlet run found 80 on its own. I didn't
  design that.
- **How to plan the next burst.** Right now that's me and a notes file.
- **What to call it.** "Burst method" is a working title.
