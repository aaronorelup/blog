---
id: "AO-014"
title: "I had 801 agent transcripts and no way to read them"
summary: "Claude Code records everything its agents do and then gives you no way to read it. I built a reader, pointed it at an 80-agent overnight run, and found a $22 agent that died four hours in without anyone noticing. It's an MCP server now."
date: 2026-09-01
status: "shipped"
tags: ["claude-code", "agents", "tools", "mcp", "gauntlet-loop"]
series: ["agent-runs"]
draft: false
preview:
  verdict: "It reads, it doesn't guess"
  takeaway: "Claude Code keeps what each agent was for in one file and what it did in another, and no viewer joined them. Joined, 80 anonymous rows got names."
  points:
    - "The gauntlet loop did converge: critics raised 380 findings in round one, 126 in round two and 0 in round three."
    - "One agent wrote 90,189 characters of reasoning against 479 of prose. It thought enormously hard and then fell over."
    - "Unknowns show as a dash with the reason, never 0, so a missing price is never a quiet $0. Stdio only, no upload."
---

Every time you run Claude Code it writes a transcript. Every subagent it spawns writes its
own. They pile up in `~/.claude/projects` as JSONL, one JSON object per line, and nobody ever
looks at them.

I checked mine: **801 agent transcripts across 26 projects.** The
[Armies of Gielinor gauntlet run](/ledger/armies-of-gielinor-gauntlet/) alone left 114 of them
across five sessions, 295 MB. I had spent an entire night orchestrating those agents and I had
no idea what most of them actually did.

So I built something to read them. It's an MCP server now — you install it and ask Claude
about your own usage in plain language, and it answers out of your own transcripts.

## Install it

```sh
/plugin marketplace add aaronorelup/claude-playback-lens
/plugin install playback-lens@claude-playback-lens
```

Or skip the plugin and add the MCP server on its own:

```sh
claude mcp add --scope user lens -- npx -y claude-playback-lens-mcp
```

Node 20 or newer. Five tools — `lens_status`, `lens_sessions`, `lens_usage`, `lens_search`,
`lens_session` — all read-only. The source is at
[github.com/aaronorelup/claude-playback-lens](https://github.com/aaronorelup/claude-playback-lens),
MIT.

**It speaks stdio, and that one is deliberate rather than a default.** The payload is my
entire private history — every prompt I've typed, every file I've had open, every
screenshot an agent took of my screen. It has no business crossing a network, so there
isn't one to cross. No account, no upload, no telemetry.

## What it found

I pointed it at session two of the gauntlet: 80 agents, 17 workflows, 8 hours 39 minutes.

**An agent died four hours in and I never noticed.** `maps`, on Opus, state `error`. It ran 38
minutes, burned 147,264 output tokens and 11.3 million cache reads, and produced no result —
about $22, the fourth most expensive agent in the whole run. The journal recorded 80 agents
started and 79 results returned. That one-line gap was sitting there the entire time and I had
nothing that would surface it.

**One agent wrote 90,189 characters of reasoning against 479 characters of prose.** It thought
enormously hard and then fell over.

**The loop actually converged.** Findings raised by the critics went 380 in round one, 126 in
round two, 0 in round three. That is the thing I most wanted to know when I wrote the
[gauntlet post](/ledger/armies-of-gielinor-gauntlet/), and at the time I could only assert it.

## The part that isn't in the transcript

I looked before I built, because a transcript viewer is exactly the kind of thing six people
have already done. Six people have, and the good ones are genuinely good. None of them worked
for what I wanted, and the reason is specific enough to be worth writing down.

When you run a `Workflow`, the harness writes the orchestration to a file the conversation
never touches:

```
<session>/workflows/wf_<id>.json
```

Inside it is a `workflowProgress` array, and that array is **the only place on disk where an
agent's phase, state and attempt count survive**. Meanwhile the agent's own JSONL is the only
place its tool sequence, screenshots and reasoning live.

Neither file is useful without the other. A viewer that opens only the session finds 80
anonymous sidechains and shows you 80 rows called `agent-a771062a38caac9c6`. Joining them is
the entire trick, and it's about forty lines of code — it just requires knowing the second
file is there.

## No inference, ever

**Every number is a recorded fact from the transcript, or arithmetic over recorded facts.**
Nothing is clustered, scored, guessed at, or summarized by a model.

The part of that I'd defend hardest is the smallest one: an unknown renders `—`, with the
reason, and a real zero renders `0`. They are never the same glyph, and a missing rate is
never quietly $0. It is very easy to write a cost dashboard that turns "I don't know" into a
number, and the moment it does, you have lost the ability to tell which of its figures you are
allowed to trust.

## Two things out of one repo

The MCP server is the product. The same repo also carries a viewer — `git clone`, then:

```sh
node lens.mjs --serve
```

**The viewer is in dev mode, and that's a real caveat.** It is a six-level drill-down that
exposes everything the index records, censuses and reconciliation pages included. That is the
right shape for debugging the index and the wrong shape for a casual look at last week's
spend. I built it first and I still use it, and it is not what I hoped it would be as a
finished thing. A friendlier one is separate work I haven't started.

## The decision I'd keep

The MCP doesn't reimplement any of the analysis. It also doesn't call the viewer's HTTP API
over the network, which was the obvious shortcut.

It builds the same router the server builds, registers the same handlers against the same
context, and dispatches synthetic requests through it with a capturing fake response object —
about fifty lines of it. So the MCP and the browser get byte-identical JSON out of the same
handler. There is no second implementation that can drift.

That wasn't for elegance. The payload builders are closures inside the API's body, and they
close over the memo objects that de-duplicate a single message id across forked and resumed
sessions. You can't export them without hoisting them out of that closure — and a fork is
precisely where a second implementation would start quietly disagreeing with the first. The
parity check asserts exact integer totals against a store that contains a forked session.

## The part I keep coming back to

None of this is analysis, and I think that's the piece worth taking away from it. Every number
in it was already sitting on my disk, written down by the tool while it worked, in a folder I
had never opened. I didn't build something that figures anything out. I built something that
reads.

801 isn't an unusual number, either. If you have been running agents for a few months you have
your own pile, and you haven't read yours either.
