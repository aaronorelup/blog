---
id: "AO-012"
title: "I stopped keeping my agents fed"
summary: "Twenty prompts over two days, checking in every hour, and I never once understood the architecture I was building — it kept moving while I tried to read it. So now I burst: one long run, then a full day where nothing changes and I can actually learn what I have."
date: 2026-08-08
status: "in-progress"
tags: ["agents", "claude-code", "workflow", "prompting", "lessons"]
series: ["origin"]
---

At the end of [I don't learn programming anymore](/ledger/i-dont-learn-programming-anymore/)
I said continuous versus bursting was its own post. This is that post.

## The continuous method

When I first heard "vibe coding," this is the picture I had of it.

Send an agent out for somewhere between fifteen minutes and an hour of work. Review what comes
back. Always have at least one running whenever I'm at the desk, and if I can get several going
in parallel, better. Sit there taking work in as it lands and try never to under-utilize them —
keep them fed.

The unstated goal in all of that is agent utilization. An idle agent is waste. So you organize
your day around not having one.

## What it actually cost

The run that changed my mind was a ten-step system-wide refactor. I drafted `plan.md` with
Fable 5, handed it to Opus 5 in a fresh session with instructions to execute the next step,
split steps into smaller ones where it needed to, and edit `plan.md` as it went. New session
whenever the context window got high.

Two days. About twenty prompts. Checking in roughly every hour, five to fifteen minutes per
review-and-guidance cycle.

Add the review time up and it isn't much — three or four hours across two days. That is not
what it cost.

What it cost was context switching. Twenty times over two days I dropped whatever else I was
doing, loaded the project back into my head, worked out what had changed since last time, made
a call, and put it back down. The tax is on the loading, not the reviewing.

And I never got to the bottom of it. Every one of those check-ins was five to fifteen minutes
against a codebase that had moved since the last one. That is enough time to approve a step. It
is nowhere near enough time to understand an architecture. I was always mid-read of something
that was already being rewritten underneath me, and the pressure the whole time was to get the
next prompt out — because a stalled agent was the thing I had decided to avoid. So I'd skim,
approve, and hand it more work.

Two days of that, and I could not have drawn you the system I had just built.

I tried to fix it with tooling first. I piped the reports through the ElevenLabs API and had
them read to me, so I could take them in without the reading fatigue. That worked on the
fatigue and did nothing at all about the switching, because the switching was the real problem
and I had aimed at the symptom.

I could also see where it went. Running three projects that way at once would have been
miserable — not difficult, exhausting. So the method didn't scale to how I actually want to
work.

## The burst method

So: batch it instead.

Every other day, build one large workflow — a manager session with a table of agents underneath
it handling the smaller pieces. Fire several off in sequence, so the whole thing is one push
with a lot of agents running at once or back to back. They produce the deliverables:
presentations, reports, the actual artifacts.

I know the ceiling is high because I've already hit it once by accident. The
[gauntlet loop](/ledger/armies-of-gielinor-gauntlet/) ran for eight hours and spawned
seventy-six agents off a single prompt while I slept. That's the upper bound I'm working
against now, not the hour-long errands I used to hand out.

Then the rhythm is burst day, review day, plan. Repeat.

Review day is one long sitting, four hours or so, with full attention on the whole project at
once. The important part isn't the length — it's that nothing is being written while I read.
The architecture holds still. I can follow a decision through the codebase and have it still be
true by the time I get to the end of it, which never happened when I was checking in hourly on
something a model was actively rewriting.

## Why this isn't a downgrade

The obvious objection is that I'm trading away control. Fewer course corrections, each one much
bigger, so more mistakes and more scope creep survive longer before anyone catches them.

I don't think that's what happens, and the reason is the understanding.

By the end of a review day I actually know the architecture — not the summary of it, the thing
itself. That changes what I'm able to ask for. Instructions written by someone who understands
the system are enormously better than instructions written by someone who has been skimming
diffs for two days and is mostly trying to keep the queue full. Better direction going in means
less wasted work coming out.

So it isn't less work in exchange for worse output. What I'm trading is frequency for amplitude:
fewer decisions, each one made with far more of the picture in my head. The decisions get better
because I paused long enough to earn them.

What I want it to feel like is a deliberate strategy session every couple of days where I look
at the whole thing and decide direction. Not a constant low-effort fever dream of reactive
micro-decisions.

The trick that makes review day survivable is
[asking for the presentation up front](/ledger/keeper-and-the-beacon/) — then the burst hands me
a narrated artifact instead of a diff.

## What I don't know yet

This is a plan I've started running, not a method I've proven, and the open questions are real
ones.

I don't know the right size for a burst. Eight hours and seventy-six agents is the biggest one
I've done, but that was a self-contained project. Too big and review day stops being digestible,
which just moves the problem. I already found with
[the one-shot games](/ledger/grind-and-grimoire/) that making a single run bigger degraded parts
of it I hadn't touched, and I don't know yet whether a burst behaves the same way.

I don't know how many agents a manager should be holding, or how it should split work between
them — the gauntlet loop found seventy-six on its own, and I didn't design that.

I don't know how to structure the planning step at the end of review day so the next burst is
aimed properly. Right now that's me and a notes file.

And I don't have a name for it. "Burst method" is a working title.

What I keep noticing is that the mistake underneath the old way was optimizing the wrong
quantity. I spent months making sure no agent was ever idle. Agent time was never the scarce
resource, and it was never even expensive. The scarce resource was a version of the project
that held still long enough for me to understand it.
