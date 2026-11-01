---
id: "AO-011"
title: "What I learn now that AI writes my code"
summary: "In 2025, building my game with AI taught me to program, and in 2026 the agents write the code and I've stopped learning it. What I learn now instead, and whether that trade is worth it."
date: 2026-08-08
status: "note"
tags: ["claude-code", "claude-cowork", "openclaw", "agents", "prompting", "lessons"]
series: ["origin"]
draft: false
topic: "agents"
project: ["origin"]
preview:
  verdict: "You get what you aim it at"
  takeaway: "When I aimed AI at learning it taught me to program, and when I aimed it at building I built more and lost track of my code."
  points:
    - "What I learn now is operating: which tool, which model, how hard to let it think, and what can run without me."
    - "Give agents fewer rules than you think, but state what you both take for granted, or every agent works it out again."
    - "Still open: if I never build another foundation by hand, will I notice when the model is wrecking one?"
  image: "/media/previews/i-dont-learn-programming-anymore.webp"
  alt: "Aaron's cartoon self in a green robe, drawing a bow and aiming one glowing golden arrow upward"
---

In 2025 I used AI to learn to program, and I learned Python, React and how to design a whole
system. In 2026 I use it to build, and in a month I haven't learned one new thing about
programming. I don't even know what's in my own code anymore.

Both years were the same project, [LLM Monster Hunter](/ledger/monster-hunter-was-my-degree/),
my game where an AI makes up every monster as you play. In 2025 I built it with
[Claude Sonnet 4](/ledger/everything-sonnet-got-wrong/) in a chat window. In 2026 agents write
it. I use Claude's Fable 5 model inside Claude Code, Anthropic's agent that works on your
computer by itself.

So whether AI made me learn came down to what I aimed it at. What I learn now is how to run the
tools, and I'd make that trade again. I'm just not sure I'd still notice if the model were
wrecking something.

## What I learn now instead

- **Which tool for which job.** Claude Code, Cowork (Claude's desktop agent for work that isn't
  code) or the plain chat. They connect to different things.
- **Which model, at which thinking level** (how long it thinks before it answers), and what that
  combination will really produce.
- **What can run without me**, and which parts still need me to make the call.
- **Techniques.** Skills (saved instructions an agent loads for one kind of job), workflows that
  run a team of agents, and lately the [gauntlet loop](/ledger/armies-of-gielinor-gauntlet/),
  where a fresh critic agent judges each piece blind.
- **Orchestration.** OpenClaw, an always-on personal agent, runs on a schedule and does web
  crawling and standing tasks for me.

## Lessons from the last month

- **Point the model at your docs instead of pasting everything in.** Keep each thing in the right
  file and tell it where to look, so you don't pay for all of it on every message.
- **Use far fewer rules than you think.** It already knows most of what I used to spell
  out, and a rule written in advance makes it worse at the case you didn't see coming.
- **But say what you both take for granted.** Otherwise every agent on a long run spends real
  thinking working it out again.
- **Be clear about what you expect.** That only works if you know what the model can do.
- **On a long job, ask for the presentation at the start.** Then it takes screenshots and notes as
  it goes. That's how my agent [handed me a narrated recap of my game](/ledger/keeper-and-the-beacon/).
- **Work in bursts.** Send off hours of work, walk away, and review it the next day. More on that
  in [why I stopped checking on my agents every hour](/ledger/stopped-keeping-agents-fed/).

## Aimed at learning, AI taught me to program

People say AI makes you dumber or a worse programmer, and that's not what happened to me. I
couldn't program. I'd wanted to since I was a kid and failed at it for fifteen years. Then I
[used AI to learn](/ledger/no-vs-code-no-terminal/), and I did. I learned a full stack (every
layer of an app, front to back) and designed an architecture I can still defend. For a summer I
read every line that went into my game, and I held the whole thing in my head because nothing
else was holding it. It was hard and slow and I could feel my brain working. Later I aimed it at
building more, faster, and got exactly that.

## Why I'd make the trade again

What I learned in 2025 is why 2026 worked. A model can only run far ahead of you on a foundation
that's already clean and documented, and I'm the one who made mine clean. I think that's why
[the $200 week that restarted my game](/ledger/the-wall-that-stopped-me/) worked.

What I don't know is whether that stays true. If I never build another foundation by hand, will I
still know enough to tell when the model is wrecking one? A month in, I don't have that answer.
For now I'm choosing to know the tools inside out and let the model do everything it can do for me.
