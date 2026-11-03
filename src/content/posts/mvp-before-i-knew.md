---
id: "AO-016"
title: "Deciding what to hand off to AI and what to keep"
summary: "A developer quit coding with AI after a year because it pulled him away from the work he loved, and I put myself in the same spot twice this year. The test I use now for what to hand off."
date: 2026-08-24
topic: "agents"
project: ["llm-monster-hunter"]
draft: false
preview:
  verdict: "Keep the deciding yourself"
  takeaway: "Before I hand work to AI, I ask if I need to be the one who did it. Tedium I already understand goes to the agent, and deciding what to build stays with me."
  points:
    - "One prompt cleared game work I'd burned out on for ten months. Then I handed over every goal and stopped recognizing it."
    - "I had AI build a viewer for my agents' logs before I knew what I needed, then spent hours of review working that out."
    - "AI amplifies the taste you have and doesn't install taste you don't, so I have to pick a few things to get deep in."
  image: "/media/previews/mvp-before-i-knew.webp"
  alt: "A small copper robot sweeping leaves with a broom, looking up at a calligraphy brush standing in an ink stone"
---

A developer with over twenty years in quit coding with AI after a year, because handing his work to AI
agents (AI that works on its own) pulled him away from the code he loved. The AI did the thinking
and he did the cleanup. I blame that setup more than the tool, and I've walked into it twice this
year with nobody making me.

So now I ask one question. **Do I need to be the one who did this?** Tedious work I already
understand goes to the agent. Deciding what to build stays with me.

- **Handing off tedium works.** One prompt cleared a wall that had stopped my game for ten months.
- **Handing off the goals doesn't.** I stopped recognizing my own game.
- **Handing off the deciding makes it expensive.** I still had to decide, after hours of review.
- **AI amplifies the taste you have.** So I pick a few skills to get deep in.

## Brett's year with AI

The developer is Brett. His company made AI mandatory. He gave it an honest year, then
[made a video saying he's done](https://www.youtube.com/watch?v=2ZU3j4GQ4K8).

"I want to feel close to the code and when you hand things off to AI agent, you become further
from the code." His job became writing rules for the agent, reviewing thousands of lines a day and
testing what it built. And then, "what is my purpose in life if I'm just like feeding this thing
to the AI."

In that job the AI is the boss. Brett didn't choose it, and quitting is a fair answer.

## Two handoffs on LLM Monster Hunter

[LLM Monster Hunter](/ledger/monster-hunter-was-my-degree/) is my game where an AI makes up every
monster as you play. It taught me to program, and I knew every function in it.

Then I hit a huge, tedious job in the game's screen code. I knew how to do it and didn't want to,
so I burned out and stopped for [ten months](/ledger/the-wall-that-stopped-me/). One prompt
cleared it. **That's the tool used right.**

Then I got greedy and handed over every goal I had left at once. They all came back built, and I
stopped again because I didn't know what my own game was doing or why. Knowing it was what made it
mine.

The difference was whether I gave away work I wanted done or work I wanted to have done myself.

## Building a log viewer before deciding

Claude Code (Anthropic's AI coding tool) records everything its agents do but gives you no way to
read it. So I built a viewer, [Claude Playback Lens](/ledger/reading-my-own-agents/).

I asked for an MVP (a minimum viable product, the smallest version that works) before I'd decided
what I needed. Hours of review later I knew I wanted a simple screen plus an MCP server, a plug-in
that lets you ask Claude about your sessions. Deciding was the cheap part, and I made it expensive
by handing it to a machine first. Nothing forced this one. I just didn't want to sit with a blank
page.

## Why I keep the deciding

Every time I've handed the deciding to an agent, I paid in review time and decided anyway. It's
the same mistake as [trying to keep my agents busy all the time](/ledger/stopped-keeping-agents-fed/),
only now I was maxing out how much of my thinking they did.

I catch myself wanting Claude to read my [second brain](/ledger/second-brain-v2/) (the notes my
agents read) and hand me my goals. Nobody can read your notes and tell you
what you want.

## Picking a few skills

AI amplifies the taste you have and doesn't install taste you don't. Every AI game project I've
done ends with me wishing I had a real skill, like fixing an image with a brush or knowing why a
level feels wrong. Better prompting is never on that list.

A good game still needs people who know each craft, because someone has to see what's
wrong with the output. Each of them can use AI to do the work of ten. I don't have time to learn
every craft, so I pick a few. Where I'm shallow, the results stay shallow no matter how good the
model gets.
