---
id: "AO-007"
title: "No VS Code, no terminal, no idea"
summary: "My first three AI projects, May 2025: a neural network built in Excel cells, a Python server for my local models, and an Android app I didn't know was going to be Kotlin. I could get the model to write code and had no idea where to put the file."
date: 2026-08-08
status: "note"
tags: ["origin", "python", "local-llm", "git", "lessons"]
series: ["origin"]
draft: false
---

First of five posts about how I got here.

## Where I started, quickly

I was homeschooled, and I wanted to make games from about as early as I can remember. I
learned Scratch, then Construct 2 in a game design class, and both were too easy — a low
ceiling and nothing past it. So I opened Unity, had nobody to ask, got stuck, and quit. I
never shipped a game.

I didn't program in high school. I barely programmed in college either — one C++ class I
remember almost nothing about. What I got good at was Excel, well past my peers, and SQL,
which I taught myself because I needed my own reports and nobody else was going to write
them.

Look at which ones stuck. Excel and SQL were loops I could close alone: try it, look at it,
fix it. Unity wasn't. That's the only difference that ever mattered.

So the setup is: interested the whole time, tried repeatedly, stopped every time at the same
place. Not for lack of ability — for lack of anyone to unstick me.

Then in May 2025 I pointed AI at it, and this is what that first month actually looked like.

## What I was doing when it started

By early 2025 I was deep into running models on my own machine — image models through
ComfyUI, language models through LM Studio. I loved it. I wanted to understand it rather
than just use it, and the way I know how to understand a thing is to build it.

So I built three things in about five weeks. Every one of them taught me something I've
used since, and none of them were what I thought I was learning at the time.

## 1. A neural network in a spreadsheet

The first was handwritten digit recognition. Claude and I built a small neural network
inside Excel cells — trained it on the classic digit dataset, then fed it a digit and
watched it guess.

It worked, and I was surprised it worked. In hindsight I'd picked the single
most-well-trodden problem in machine learning, which is exactly why it went smoothly. But
it did the thing I needed it to do: it turned "AI" from a service I called into arithmetic
I could see happening in cells I owned. Excel was the only place I was fluent, so that's
where the concept had to land first.

## 2. MyLLMServer

**First commit: 3 May 2025. 31 commits.**

Then I wrote my own Python server to run local models — not LM Studio's server, mine. The
point was to own the call: load the model, take a prompt, manage parameters, hand back
tokens.

That turned out to be the most load-bearing thing I built that year. Every project since
that talks to a model I'm running myself descends from figuring that out.

## 3. my-llm-android-app

**First commit: 5 May 2025. 52 commits.**

And then a phone client for it, so I could sit anywhere in the house and prompt the model
running on my desktop, with saved prompts and loaded prompts.

I did not know Android apps were written in Kotlin. I found out by starting one. That was
confusing in a way I'm still slightly impressed I pushed through, and I haven't built an
app since — though I'd like to go back to it now that I'd know what I was doing.

## What was actually hard

None of the hard parts were the code. The model wrote the code.

The hard parts were everything around the code that nobody tells a beginner exists:

**I didn't know where files go.** Claude would give me a file. I'd save it to my computer.
And then I'd sit there not knowing which folder it belonged in, because I didn't know that
the location *mattered* — that a file one directory over is a different file to Python. I
didn't know what an `__init__.py` was or why every folder had one.

**I didn't have VS Code.** I was moving code by hand between a browser and a file explorer.

**I didn't know what the terminal was for.** I could not `cd` into a directory. So GitHub
was a wall, not a tool.

**Git was the worst of it.** I was doing git by hand, badly, and making mistakes I then had
to undo. I described it at the time as trying to perform surgery on an alien by getting
directions over the phone, and I stand by that. Anyone who has tried to unwind a bad git
state without understanding the model underneath it knows the feeling exactly.

I eventually moved to VS Code — and only much later found out VS Code will just *do* the
git for you. I had been doing it manually the entire time because nothing had told me
otherwise.

## The lesson I actually took

The model can write code you don't understand. It cannot set up your machine, and it cannot
tell you what you don't know to ask.

That's the real beginner barrier, and it's not a knowledge barrier — it's a *question*
barrier. You can't prompt your way out of not knowing that a category of problem exists.
Every one of the things above was invisible to me until I ran face-first into it, and once
I'd hit it, one sentence from the model fixed it forever.

Which is a strange kind of teacher. Infinitely patient about the answer, completely silent
about the question.

Two things worth noting about the timing. All three of these ran on the Sonnet available in
early May 2025 — Claude Sonnet 4 didn't ship until the 22nd. And three days after that last
commit, on **8 June 2025**, I started the project that ate the rest of the year.

Next: [LLM Monster Hunter was my computer science degree](/ledger/monster-hunter-was-my-degree/).
