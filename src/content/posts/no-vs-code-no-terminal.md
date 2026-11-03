---
id: "AO-007"
title: "My first AI projects, before I knew what a terminal was"
summary: "The first three things I built with Claude in May 2025, coming from Excel and SQL. The model wrote the code, and what stopped me was everything around it, like where files go, the terminal and git."
date: 2026-08-08
draft: false
topic: "learning"
project: ["origin"]
preview:
  verdict: "The code was the easy part"
  takeaway: "The model wrote all my code, but it couldn't set up my computer or tell me what I didn't know to ask, and that was the real beginner barrier."
  points:
    - "I didn't know where files go, had no code editor and had never used a terminal, so GitHub was a wall."
    - "I did git, the tool that tracks code versions, by hand and badly. Much later I learned a code editor does it for me."
    - "Each gap was invisible until I ran into it. Then one sentence from the model fixed it for good."
  image: "/media/previews/no-vs-code-no-terminal.webp"
  alt: "Aaron's cartoon self in a green kimono, sitting with a laptop and scratching his head, an unplugged cable beside him"
---

In May 2025 I built my first three things with AI: a neural network inside Excel, my own server
for running AI models at home, and an Android app to talk to it. Claude wrote all the code.
**What stopped me was everything around the code** that nobody tells a beginner exists, like where
files go, what the terminal is for and how git works.

The model couldn't set up my computer, and it couldn't tell me what I didn't know to ask. Every gap
was invisible until I ran face-first into it. Then one sentence from Claude fixed it for good.

## What stopped me

- **I didn't know where files go.** Claude would give me a file and I'd sit there not knowing
  which folder it belonged in, or that it mattered. I didn't know what the `__init__.py` in
  every folder was for either. It tells Python the folder is part of the program.
- **I didn't have VS Code**, the free code editor most programmers use. I moved code by hand
  between my browser and the file explorer.
- **I didn't know what the terminal was for.** That's the text window where you type commands to
  your computer. I couldn't even `cd` into a folder, so GitHub, where code lives online, was a
  wall.
- **Git was the worst of it.** Git keeps track of every version of your code. I did it by hand,
  badly, and kept having to undo my mistakes. At the time I said it was like performing
  surgery on an alien by getting directions over the phone, and I stand by that.

Much later I found out VS Code does the git for you. Nothing had told me.

My course [The Hidden Curriculum](/courses/the-hidden-curriculum/) is about gaps like these.

## Where I started

I was homeschooled and wanted to make games for as long as I can remember. Scratch,
drag-and-drop coding for kids, and Construct 2, a game maker with no code, were too easy. So I
opened Unity, the engine real studios use, had nobody to ask, got stuck and quit. I never
shipped a game.

I barely programmed in college, one C++ class I remember almost nothing about. What stuck was Excel
and SQL, the language for asking a database questions, which I taught myself. I could work those
out alone. Try it, look at it, fix it.

## What I built

By early 2025 I was running image and chat models on my own PC with ComfyUI and LM Studio, two free
apps for that. I wanted to understand it, and I understand things by building them. So I built
three things in about five weeks.

### A neural network in Excel

A neural network is the kind of program AI is made of, one that learns from examples. Claude and I
built a small one inside Excel cells, trained it on the classic set of handwritten digits and
watched it guess. It worked, and I was surprised, though I'd picked the most well-trodden problem
in machine learning. It turned AI from a service I called into arithmetic I could watch in cells I
owned.

### My own AI server

[MyLLMServer](https://github.com/aaronorelup/MyLLMServer) is my own Python server for running AI
models at home. Not LM Studio's server, mine. It loads a model, takes a prompt and sends back the
answer. First commit 3 May 2025. Every project since then that talks to a model on my own computer
grew out of figuring that out.

### A phone app for it

Then I made [an Android app](https://github.com/aaronorelup/my-llm-android-app) so I could prompt
the model on my desktop from anywhere in the house. First commit 5 May 2025. I didn't know Android
apps were written in Kotlin, a language I'd never touched. I found out by starting one. I haven't
built an app since, but I'd like to go back now that I'd know what I was doing.

## When it happened

I started all three before [Claude Sonnet 4](/ledger/everything-sonnet-got-wrong/) came out on
22 May 2025. A few days after my last commit, on **8 June 2025**, I started the project that ate
the rest of the year, my AI monster game.

Next: [Learning to program by building an AI monster game](/ledger/monster-hunter-was-my-degree/).
