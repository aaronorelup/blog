---
id: "AO-011"
title: "I don't learn programming anymore"
summary: "In 2025 every prompt taught me architecture. Now I don't know what's in my own codebase and I haven't learned a new programming idea in a month. I traded it for something else, on purpose, and this is the honest accounting of both sides."
date: 2026-08-08
status: "note"
tags: ["claude-code", "claude-cowork", "openclaw", "agents", "prompting", "lessons"]
series: ["origin"]
draft: false
---

Last of five — if you landed here first, the whole series is indexed at the bottom.
Previously: [The wall that stopped me for ten months, and the week that cleared it](/ledger/the-wall-that-stopped-me/).

Here's the part of the arc I'm still turning over.

Working on LLM Monster Hunter with Sonnet in 2025, I was learning constantly. Every prompt
made me reason about system architecture. Every implementation taught me Python, or React,
or some quirk I'd have to route around forever. I had to hold the entire codebase in my head
because nothing else was holding it. It was hard and slow and I could feel my brain working.

Working on the same project with Fable 5 and Claude Code in 2026, I do not know what is in
my codebase. And in a month of building, I have not learned one new thing about programming
or architecture.

That's a real trade, and I want to be honest that both halves of it are real.

## What I learn instead

The work didn't stop being hard. It moved.

**Which tool, for which job.** Claude Code, Cowork, or the chat interface — they connect to
different things, they're good at different shapes of work, and knowing which one to reach
for is now a skill with actual leverage.

**Which model, at which thinking level.** And what results that combination will actually
produce, because you can't set good expectations for a thing you can't predict.

**What runs unattended, and what doesn't.** Which parts of a project an agent can genuinely
own end to end, and which parts still need a human making the call. Getting this wrong is
expensive in both directions.

**Techniques.** Skills, workflows, when a workflow is worth starting at all. The
[gauntlet loop](/ledger/armies-of-gielinor-gauntlet/) was the most recent one, and testing
it properly was its own project.

**Orchestration.** I picked up OpenClaw, set it up on cron jobs, and it does web crawling
and standing tasks for me now. This site's publish step ends by emailing new posts to it,
and the agent decides what happens next.

None of that is programming. All of it is operating.

## The operating lessons worth writing down

A handful of things I've learned the hard way in the last month, in the same spirit as
[the Sonnet catalog](/ledger/everything-sonnet-got-wrong/):

**Put information where it belongs and point at it.** The instinct from 2025 was to stuff
everything relevant into every context window. The better move is a docs system — the
information lives in the right file, and the model is told where to look when it needs it.
You stop paying for everything on every turn.

**You need far fewer restrictions than you think.** I used to fence the model in with rules.
Now I tell it it has creative freedom and can make changes, because it already knows most of
what I was spelling out — and a rule you wrote in advance makes it worse at the case you
didn't anticipate.

**But state the known knowns anyway.** This sounds like the opposite of the last one and
isn't. Anything you'd both take for granted, say out loud — especially on a long run with
several agents. If it's not stated, every agent re-derives it independently, every time,
spending real thinking on a conclusion you already had. Say it once and it's free.

**Be explicit about expectations**, which is only possible if you know what the model can
do — which is the whole reason the "which model, what level" learning above matters.

**On long tasks, ask for the presentation up front.** If you tell it at the start that the
run ends in a presentation, it takes screenshots and keeps notes *while the work is
happening* instead of reconstructing the story afterward from memory it doesn't have. That
one trick is why [the agent handed me a documentary](/ledger/keeper-and-the-beacon/)
and why the [Armies of Gielinor](/ledger/armies-of-gielinor-gauntlet/) run has receipts.

**How I work changed shape, too.** I used to sit there prompting continuously, watching
every step, going back and forth. Now I burst: fire off hours of work, walk away, and spend
the next day reviewing what came back and planning the next burst.
[Continuous versus bursting](/ledger/stopped-keeping-agents-fed/) is its own post.

## Is the trade worth it?

Yes, and I'd make it again, but not without noticing what I gave up.

The knowledge I built in 2025 is exactly why 2026 worked. A model can only run that far
ahead of you on a foundation that's already clean, documented, and specified — and I'm the
one who made it clean. That's the argument
[from the $200 week](/ledger/the-wall-that-stopped-me/) and I believe it.

What I don't know is whether that keeps being true. If I never build another foundation by
hand, do I still know enough to tell when the model is wrecking one? I'm not going to
pretend I have that answer a month in.

What I'm choosing for now is to be a power user. To know exactly what tools exist, how they
connect, and how to wire them into a meta-workflow that makes real progress with less
babysitting from me. Everything the model can do for me, I want it to be free to do.

## The effect isn't predetermined

There's a common line that AI makes you dumber, or makes you a worse programmer. I'm a
living counterexample, and I want to be precise about why, because "it didn't happen to me"
is not an argument.

I couldn't program. I'd wanted to since I was a kid and had failed at it repeatedly for
fifteen years. Then I used AI to learn, and I learned — a full stack I'd never touched, an
architecture I designed and can still defend, and a summer of reading every line that went
into my own repo. That happened because *learning was the goal I pointed it at.*

Later I used it to build more, faster, and that's what I got: more built, faster, and a
codebase I couldn't recite from memory.

Those are two different skills with two different goals, and they lead down two different
paths. The tool didn't decide which one I went down. **I did.** And I don't regret either
one — the first is the reason the second worked at all, and I got exactly what I asked for
both times.

That's the thing I'd want someone to take from this whole series. The effect this has on you
isn't a property of the technology. It's a property of what you're trying to do with it. I
care about that a lot more than I care about being right on the internet, because the
version of this I actually want to build is one where the learning path is *available* —
fun, effective, and open to whoever wants it. Same tool. Very different outcome, depending
entirely on what you ask of it.

## Why this is on a website and not in a notes app

One last thing, and it's the reason these five posts exist at all.

Every finding in this series was learned once, painfully, and then lived in my head or in a
scratch file. The context-window lesson. The component-scope lesson. The one about not
delegating decisions you can't evaluate. I had to reconstruct most of them from memory to
write this, and I got the order wrong twice before the git log corrected me.

I wish I'd had this ledger in June 2025. I didn't, so this series is the retroactive
version — a year and a half of findings, entered late.

But it's here now, which means the next one gets logged the day it happens instead of a year
later. That's the whole point of [starting this](/ledger/why-im-starting-this/): the hub
exists, so nothing else has to die with me or get lost to the void.

---

**The full series:**

1. [No VS Code, no terminal, no idea](/ledger/no-vs-code-no-terminal/)
2. [LLM Monster Hunter was my computer science degree](/ledger/monster-hunter-was-my-degree/)
3. [Everything Sonnet 4 got wrong, and what each one taught me](/ledger/everything-sonnet-got-wrong/)
4. [The wall that stopped me for ten months, and the week that cleared it](/ledger/the-wall-that-stopped-me/)
5. I don't learn programming anymore
