---
id: "AO-016"
title: "I asked for an MVP before I knew what I wanted"
summary: "A developer with twenty years in gave AI an honest year, hated what it did to the work he loved, and quit. I think a lot of people feel some version of that, and I don't think the tool is the problem — the relationship is. I've inverted it twice this year on my own projects, with nobody making me."
date: 2026-08-24
status: "note"
tags: ["agents", "claude-code", "workflow", "lessons", "gamedev"]
draft: false
preview:
  verdict: "Be the boss, not the cleanup"
  takeaway: "The test isn't whether AI could do it but whether I need to be the one who did: hand over tedium I already understand, keep deciding what to build."
  points:
    - "One prompt cleared the Monster Hunter work I'd burned out on. Then I handed over every goal and stopped recognizing it."
    - "For a Claude Code log viewer I asked for an MVP first; hours of review later I knew I wanted a simple UI and an MCP."
    - "AI amplifies the taste you have and doesn't install taste you don't, so I have to pick a few things to get deep in."
---

Brett has been writing software for over twenty years. His employer went to a conference, came
back, and mandated AI across the company. He gave it an honest year — Zed, then agentic coding,
then the whole loop — and then [made a video saying he's
done](https://www.youtube.com/watch?v=2ZU3j4GQ4K8).

I'm not writing this to argue with him. He made his case in good faith, out of real experience,
and there's no version of this where I get to be right at him. I'm writing about it because I
think a lot of people feel some version of what he felt, including plenty who haven't quit and
won't. And because the thing he describes happening to him, I did to myself twice this year with
nobody making me.

## What it did to him

The crux isn't productivity. He loved coding. Twenty years of it, the craft of it, knowing the
system in his hands — and the tool took that away from him.

The line that stuck with me: *"I want to feel close to the code and when you hand things off to
AI agent, you become further from the code."*

He lays out what the job becomes once you've relegated implementation. You write markdown files
to stop the agent repeating mistakes. You review thousands of lines a day, which he calls
exhausting and not really possible. You QA what the machine built. And then the part that isn't
about efficiency at all: *"what is my purpose in life if I'm just like feeding this thing to the
AI."*

He says you stop caring. That the apathy shows up in the software. That a team a year into this
has de-skilled itself, so when the harness goes down nobody can do hard programming anymore.

None of that is wrong. And he was *made* to do it — a mandate from people who'd been sold the
future at a conference. He didn't choose the shape of it.

## The inversion

Here's the shape, though, and it's worth naming because it isn't inevitable.

The AI does the coding. You have to be strong exactly where it's weak — debugging what it got
wrong, holding architecture it invented, reading volume you didn't write. The AI is doing the
thinking. You're doing the cleanup.

That's not a tool. That's a boss. And it's a boss whose work you don't enjoy and can't refuse,
sitting between you and an employer who thinks he's paying for your judgment.

In that arrangement, quitting is a completely reasonable move. If a hammer keeps breaking light
bulbs, putting the hammer down is a real answer. It's just not the only one, and the reason I
care about the distinction isn't that I think Brett got it wrong. It's that I walked into the
same arrangement on purpose, twice, on projects nobody was making me build.

## LLM Monster Hunter, both halves

I knew that codebase. [Every function and what it
did](/ledger/monster-hunter-was-my-degree/) — it was the thing that taught me to program.

Then I hit the client-side event registry. It had to mirror the backend exactly, I'd never built
one, and I'd be learning the pattern while implementing it across a project that size. I knew
what to do. I just didn't want to do it. It was tedious, it was enormous, and I burned out on it
and stopped working on a project I loved for [ten months](/ledger/the-wall-that-stopped-me/).

What cleared it was one prompt. The tedious thing I already understood and didn't want to grind
out got ground out. **That is the tool used correctly, and I'd defend it against anyone.** Ten
months of a thing I loved, given back.

Then I got greedy. It had worked so well that I handed over the rest — every remaining goal I had
for the project, in one go — and got them back built.

And I stopped working on it again. Not from burnout this time. From not recognizing it. I didn't
know what it was doing or why it did it that way or where the quirks were. The thing that made it
mine was that I knew it, and I'd traded that for a bigger portfolio entry.

Same project, same tool, two uses, opposite outcomes. The difference wasn't the model getting
better in between. It was whether the work I gave away was work I wanted to have done, or work I
wanted to have *done myself*.

That second one is Brett's year, self-inflicted, in a project I built for fun.

## Claude Playback Lens, more recently

I had a real problem: Claude Code writes down everything its agents do and gives you no way to
read it. Good problem. Mine.

What I should have done next was decide what I actually needed — which views, at which level,
what each one is for. Instead I wanted a prompt running. So I asked for an MVP.

Hours of work came back, and then I had to review all of it, and reviewing it is how I finally
worked out what I wanted, which turned out to be a simple UI and a powerful MCP. I could have
known that before anything was built. Deciding was the cheap part and I converted it into the
expensive part by routing it through a machine first.

That one's more embarrassing than the Monster Hunter one, because nothing forced it. There was no
wall. I just didn't want to sit with the blank page, and an agent is a very comfortable way to
not sit with a blank page.

It shows up outside code too. Claude is genuinely good at helping me plan and set goals — and
what I catch myself wanting is to point it at my [second brain](/ledger/second-brain-v2/) and have
it hand me back my goals. Which obviously can't work. Nobody can read your notes and tell you
what you want.

## Optimizing the wrong quantity, again

I already wrote about [giving up on keeping my agents
fed](/ledger/stopped-keeping-agents-fed/) — that agent utilization was never the scarce resource,
and what I actually needed was a version of the project that held still long enough to
understand.

This is the same error one layer up. There I was optimizing agent uptime. Here I'm optimizing how
much of my thinking is offloaded, as though that number should also go to a hundred.

It shouldn't. Some of that thinking is the job. **The test isn't "could the AI do this." It's
"do I need to be the one who did this."** Tedious work I already understand: hand it over without
guilt. Deciding what to build, what the architecture should be, what I want — that's mine, and
every time I've routed it through an agent I've paid for it in review time and then made the
decision anyway.

## What game design keeps telling me

The clearest version of this isn't in code at all.

Every AI-assisted game project I've done ends the same way. The thing I find myself wishing is
never *I wish I were better at prompting.* It's: I wish I could pick up a brush and make the four
adjustments this image needs. I wish I could clean up this 3D model instead of regenerating it
and hoping. I wish I knew the design principles well enough to say why this level reads wrong.

You can generate every asset in a game. Models, rigs, textures, references, levels, code, audio —
it's all there, and you can chain it. But the quality ceiling is set by whether someone in the
loop can look at the output and know what's wrong with it. AI amplifies the taste you have. It
does not install taste you don't.

Which points somewhere uncomfortable. If you want a game that's good in every dimension, you
still need people who know character design, level design, modeling, audio — all of it, for real.
They should all be using AI, because it lets one of them do the work of ten. But the tool doesn't
remove the need for the skill; it multiplies whatever skill is already there.

The obvious response is *become a jack of all trades* — pick up enough of each discipline to
direct the tool everywhere. I don't have time for that, and wanting it doesn't make the hours
appear. So I have to pick. Get deep enough in a few things that I can actually judge the output,
and accept that where I'm shallow the results will be shallow no matter how good the model gets.
That's a real cost and I don't have a clever way around it.

## Where I've landed

I want people using this. Especially people who make things — programmers, artists, designers,
modelers, anyone who's ever been stopped by a wall of tedium standing in front of something they
loved. It's the most useful tool I've ever had and I'm nowhere near done with it.

But be the boss. Not the reviewer, not the QA department, not the person cleaning up after
something that outranks them. The moment you're serving it, you've stopped getting the thing you
started for — and if that's the only arrangement on offer, I understand walking away from it.

Brett said that when he stopped, he instantly felt better. Reconnected with the thing he liked
doing. I believe him completely. What he got back wasn't the absence of AI, though. It was being
the one doing the thinking again.

I'd like to keep both.
