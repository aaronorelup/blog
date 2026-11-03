---
id: "AO-008"
title: "Learning to program by building an AI monster game"
summary: "From June to August 2025 I built an AI monster game with Claude in a browser, pasting code by hand. The systems I had to design myself, and why picking files by hand made me learn my own code."
date: 2026-08-08
draft: false
topic: "learning"
project: ["origin", "llm-monster-hunter"]
preview:
  verdict: "The AI call is the easy part"
  takeaway: "The hard part of an AI app is everything around the model call, like queueing requests, chaining steps, handling failures and telling the user what's going on."
  points:
    - "The model kept breaking my code's structure, so I read every line and learned that structure myself."
    - "Picking by hand which files Claude saw, on every message, forced me to learn my own code."
    - "One GPU runs one prompt at a time, so every request waits in a queue and the whole app is built to wait."
  image: "/media/previews/monster-hunter-was-my-degree.webp"
  alt: "Luminel's card from LLM Monster Hunter: a glowing cream moth with starry blue wings in a mossy forest"
---

From June to August 2025 I built
[LLM Monster Hunter](https://github.com/aaronorelup/LlmMonsterHunter), a game where AI makes up
every monster you meet, and it's where I actually learned to program. I'd never written Python.
The model kept breaking the structure of my code, so I read every line, learned that structure
myself and designed the three core systems it then wrote.

**The hard part of an AI app is everything around the call to the model.** Queueing it, chaining
it, recovering when it fails and telling the user what's going on.

![Two cards from LLM Monster Hunter: Luminel, a glowing moth with starry blue wings, and Maren Holt, an older woman with a red-streaked braid in front of a lighthouse](/media/llm-monster-hunter/card.webp)

LLM means large language model, the kind of AI behind Claude and ChatGPT. I made my first
commit, a saved change to the code, on **8 June 2025**. Claude Sonnet 4, the model I used, had
come out seventeen days before. By **23 August** there were 366 commits, then nothing for ten
months. [Why it stalled](/ledger/the-wall-that-stopped-me/) is its own post.

## The three systems I designed

I worked out what these had to do, and Sonnet wrote them.

- **A queue, because one GPU runs one prompt at a time.** The GPU is the graphics card that runs
  the model, and I had one. So every request waits its turn and the whole app is built to wait.
- **A workflow engine, because a monster is a chain of prompts.** First its concept, then its
  abilities, then its art. If one step fails, the whole monster fails cleanly. Never half a
  monster.
- **An event registry, so the screen knows what's happening.** The server streams progress to
  the browser while the player waits.

## Why this project

I wanted into AI properly, and that meant Python. So I picked what people doing that work used,
Python and Flask for the server and React for the screen. I'd never made a game either.

## Reading every line

My degree taught me systems on paper and nothing about how a project's code is organized. I
didn't know what a route was, the bit of a web server that answers one address. Or a service,
the code that does the actual work.

My plan was to let Sonnet handle that, and it failed in
[six ways](/ledger/everything-sonnet-got-wrong/). To stop Sonnet wrecking the structure, I had to
know the structure better than it did. So I read every line that went in, until I knew what
every file did and why it sat where it sat. This layout came out of it:

```
backend/ai/          the model gateway, the queue, the prompt engine
backend/core/        config, the event bus, the event registry, the workflow registry
backend/game/        monsters, dungeons, state
backend/routes/      HTTP only
backend/services/    the actual work
backend/workflow/    the workflow gateway and queue
```

Routes are routes, services are services, and nothing else pretends to be either. That sounds
obvious written down. It cost me a summer.

## Debugging at my granddad's ranch

My granddad's ranch is over a hundred years old and has no internet. I worked on Monster Hunter
out there anyway, with no Claude, no search and no Stack Overflow, the site programmers ask
questions on. Just a distilled model, a small one trained to copy a bigger one, on my own
computer.

It was terrible, comically worse than Claude, and I spent a lot of that session arguing with it.
But it was there, with no signal, and it was mine. When I built
[MyLLMServer](/ledger/no-vs-code-no-terminal/), my own server for running AI models, I hadn't
understood this part. If the model is mine, I have it everywhere.

## Picking files by hand, every message

I had no agent, an AI like Claude Code that edits your files itself. I pasted code from a browser
chat into my editor by hand. My code was linked to a Claude project, a workspace in the Claude app.
I found out on my own that it could pick which files Claude read, or I could.

I picked them myself. Every message. Every time.

That was mostly overhead. But to choose the right files you have to know the code, so every
prompt started with me working out which parts of my system mattered. After a few thousand of
those I knew where everything was, and I think that did more for me than any tutorial.

I don't miss it. Now agents write my code, and
[what I learn instead](/ledger/i-dont-learn-programming-anymore/) is its own post.

Previously: [My first AI projects, before I knew what a terminal was](/ledger/no-vs-code-no-terminal/).
Next: [Six problems Claude never flagged while I learned to code](/ledger/everything-sonnet-got-wrong/).
