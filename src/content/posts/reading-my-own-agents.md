---
id: "AO-014"
title: "I built a reader for Claude Code's agent transcripts"
summary: "Claude Code saves a record of everything its agents do with no way to read it, so I built a reader and ran it on an 80-agent overnight run. What it found, how to install it, and how it works."
date: 2026-09-01
status: "shipped"
tags: ["claude-code", "agents", "tools", "mcp", "gauntlet-loop"]
series: ["agent-runs"]
draft: false
topic: "agents"
project: []
preview:
  verdict: "Found a silent $22 failure"
  takeaway: "Reading the transcripts of an 80-agent overnight run showed an agent that died four hours in after about $22 of usage, and I never noticed."
  points:
    - "It showed the review loop ran out of problems: 380 raised in round one, 126 in round two, 0 in round three."
    - "The trick was joining two files Claude Code writes: one says what each agent was for, the other what it did."
    - "It runs only on your computer and uploads nothing, and unknown numbers show as a dash with the reason, never as $0."
  image: "/media/previews/reading-my-own-agents.webp"
  alt: "A brass magnifying glass over a stack of rolled paper scrolls, the one inside the lens torn off short"
---

Claude Code, the AI coding agent I use, writes a transcript of everything each of its agents
does, and gives you no way to read them. I had 801 of them across 26 projects, so I built a
reader called Playback Lens. I pointed it at an 80-agent overnight run and **it found an
agent that died four hours in after about $22 of usage.** I'd never noticed.

It's an MCP server, a small add-on that gives Claude new tools, so you can ask Claude about your
own usage in plain English and it answers out of those transcripts.

## What it found

The run was session two of my
[Armies of Gielinor gauntlet](/ledger/armies-of-gielinor-gauntlet/), the night my agents rebuilt
a dead online game while critic agents judged their work against old screenshots. It ran 8 hours
39 minutes, with 80 agents and 17 workflows (scripts that send out agents in phases).
[Here are the slides from that night.](/presentations/armies-of-gielinor-session-2/)

- **An agent died four hours in and nobody noticed.** It was called `maps` and ran on Opus,
  Claude's workhorse model. It worked for 38 minutes, hit an error and returned nothing. That
  was about $22 worth, the fourth most expensive agent in the run. The run's log said 80
  started and 79 came back, and nothing I had would show me that gap.
- **One agent wrote 90,189 characters of thinking and 479 of actual answer.** It thought really
  hard and then fell over.
- **The review loop ran out of problems.** The critics raised 380 in round one, 126 in round two
  and 0 in round three. I most wanted to know that, and in the gauntlet post I couldn't prove it.

<details><summary>The dead agent in numbers</summary>

- State `error` after 38 minutes on Opus, with no result.
- 147,264 output tokens (the text it wrote) and 11.3 million cache reads (the conversation so
  far, read again from memory on each step).
- About $22, the fourth most expensive agent of the 80.

</details>

## Install it

It's for people who already use Claude Code. In Claude Code, type:

```sh
/plugin marketplace add aaronorelup/claude-playback-lens
/plugin install playback-lens@claude-playback-lens
```

Or add just the MCP server with one line:

```sh
claude mcp add --scope user lens -- npx -y claude-playback-lens-mcp
```

You need Node 20 or newer. It gives Claude five tools and all of them only read. The code is at
[github.com/aaronorelup/claude-playback-lens](https://github.com/aaronorelup/claude-playback-lens),
free to use under the MIT license.

**It never leaves your computer.** Those transcripts are my whole private history, down to the
screenshots agents took of my screen. So it has no account, and it uploads and tracks nothing.

## The trick is two files

Joining two files is what makes it work. Each agent's transcript is the only place that says
what it did. When Claude Code runs a workflow, it also writes a separate file that never shows up
in the conversation. That file is the only place that says what each agent was for, which phase
it was in and whether it finished.

Six people had already built transcript viewers, so I looked at those first. None of them read
that second file. A viewer that opens only the transcripts shows 80 rows with names like
`agent-a771062a38caac9c6`. Joining the two files gives every row a name and a job. That's about
forty lines of code. You just have to know the second file is there.

## It doesn't guess

Every number is something the transcript recorded, or plain arithmetic on those. No AI
summarizes or scores anything. If it doesn't know a number it shows a dash and says why, and a
real zero shows as 0. So a missing price never turns into a quiet $0.

That holds for each row, but a total can still come up short. On
[BLACKWATER 2](/ledger/blackwater-2-postmortem/), a game I had agents build, the Lens had no price
for Fable 5.1, one of the models they used. It listed those requests as unpriced, but the
headline total said $569 against about $1,287 at API list prices. An agent quoted the $569 back
to me as the cost. The unpriced line was where the rest of the bill was. The Lens prices Fable 5.1
now.

I've since used it to check
[seven things I believed about my Claude Code costs](/ledger/what-drives-claude-code-cost/).

## The viewer

The same repo has a viewer you open in your browser. Clone it, then run:

```sh
node lens.mjs --serve
```

It's still a tool for developers. It drills down six levels into everything the Lens records,
which is right for finding bugs and wrong for a quick look at last week's spend. A friendlier one
is work I haven't started.

<details><summary>How the add-on and the viewer give the same numbers</summary>

The MCP server doesn't redo any of the analysis. It also doesn't call the viewer over the
network, which was the obvious shortcut.

It builds the same router the viewer's server builds. That's the part that hands each request to
the code that answers it. It registers the same handlers and sends made-up requests through it,
with a fake response object that catches the answer. That's about fifty lines. So the add-on and the browser get exactly the same JSON from the same code, and
there's no second copy that can drift.

I did it that way because I had to. The code that builds each answer lives inside closures in
the API. Those closures share the memo objects that make sure one message is counted once when a
session is resumed or forked (copied into a new branch). You can't pull that code out without
restructuring it. And a forked session is exactly where a second copy would start quietly
disagreeing with the first. The parity check, a test that both give the same answer, compares
exact totals on test data that has a forked session in it.

</details>
