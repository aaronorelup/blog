---
id: "AO-034"
title: "I sent back two of my course's first seven lessons, including the one built to stop that happening"
summary: "Agents now publish a lesson of The Hidden Curriculum every day. I rejected two as out of date: one taught the 2021 picture of a language model, and the next, the first built after a new research step, taught debugging, which I no longer do. Both versions of each are here with searchable transcripts."
date: 2026-10-04
status: "in-progress"
tags: ["claude-code", "agents", "animation", "elevenlabs", "lessons"]
series: ["hidden-curriculum", "agent-runs"]
---

Since [the first lesson](/ledger/the-missing-map/) on 30 September, agents have published six
more lessons of my course, The Hidden Curriculum, each written, fact-checked, narrated, animated
and reviewed by a workflow of 42 to 63 Opus 5.5 agents. I sent two of them back as out of date.
Lesson 00.05 explained language models the way you'd have explained them in 2021. After that,
Claude added a research step to every lesson, and the very next one, 00.06, came through it with
current numbers and the wrong subject: it taught a five-step habit for debugging, and I haven't
debugged an error myself since I started using Claude Code.

**The research step made the facts current. It couldn't tell that the topic itself was out of
date, because the only evidence for that was how I work now.**

Both versions of both lessons are below, each with its transcript. Search a word and it's
counted and marked in every transcript at once; click a line and the video plays from there.

## Seven lessons in five days

| Lesson | Built | Length | Agents | Cost | What happened |
|---|---|---|---|---|---|
| 00.01 The hidden curriculum | 30 Sep | 5:15 | 44 | $134 | [AO-029](/ledger/the-missing-map/) |
| 00.02 The map of everything | 1 Oct, 17:43 | 4:36 | 42 | $46 | |
| 00.03 How old is all this? | 1 Oct, 18:44 | 5:04 | 42 | $65 | revoiced, then extended to 10:45 the same night (56 agents, $86) |
| 00.04 Model vs app vs agent | 1 Oct, 22:09 | 4:43 | 42 | $70 | |
| 00.05 How LLMs work (just enough) | 2 Oct, 01:52 | 5:30 | 42 | $69 | **sent back 2 Oct, 15:19** |
| 00.05 How AI models work today | 2 Oct, 15:19 | 19:54 | 63 | $100 | replaced v1 at the same URL |
| 00.06 How to learn anything technical | 3 Oct, 00:36 | 5:17 | 43 | $68 | **sent back 3 Oct, 17:49** |
| 00.06 Trust what you can verify | 3 Oct, 17:49 | 11:07 | 60 | $71 | replaced v1 at the same URL |
| 01.01 Files are just bytes | 4 Oct, 05:36 | 5:07 | 42 | $47 | the daily job, on its own |

Costs are at API list prices from the session transcripts, rounded to the dollar; I'm on a flat
subscription. "Built" is when the turn that made it started. The course is meant to ship one
lesson a day, and the scheduled job does exactly that. Most of the extra lessons on 1 and 2
October came from me typing "continue with the next lesson" late at night.

## 00.05: the 2021 picture

The first version is a good five minutes on tokens, next-token guessing, the context window as a
desk, temperature and hallucination, which is exactly what its row in the curriculum asked for:
"Tokens, context window, temperature, hallucination". None of it is wrong. It's the picture of a
model behind a chat box, with nothing around it. Twelve hours after it went up, I wrote back:

> This lesson would have been okay 5 years ago, but a lot have changed. I'm thinking this needs
> to be a 20 minute video explaining the history and the changes until to date.

Then I listed what was missing: models that take and make images, audio and video; models
getting worse as their context fills; the different ways they remember (searching old chats,
keeping their own memory, files and Notion reached through tool calls); system prompts and
instruction files; diffusion; caching and the difference between cache reads, cache writes,
input and output tokens; chat, Cowork and Code across browser, desktop, CLI and cloud; skills,
connectors and plugins; and the always-on personal agents like OpenClaw. I ended with:

> You need to spend more time planning what you are going to include in each lesson going
> forward.

<ao-transcript find="cache|memory|diffusion|Claude|token">
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v1-0005.webp" src="/media/lessons-sent-back/v1-0005.mp4"><track kind="captions" srclang="en" label="English" src="/media/lessons-sent-back/v1-0005.vtt"></video><figcaption><b>v1 · How LLMs work (just enough)</b><span class="ao-meta">5:30 · 762 words · 42 agents · built 2 Oct 01:52–02:58 · 4,191 ElevenLabs characters</span></figcaption></figure>
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v2-0005.webp" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/lesson.mp4"><track kind="captions" srclang="en" label="English" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/captions.vtt"></video><figcaption><b>v2 · How AI models work today</b><span class="ao-meta">19:54 · 2,683 words · 63 agents · built 2 Oct 15:19–18:45 · 25,093 ElevenLabs characters · the live lesson</span></figcaption></figure>
<figcaption><b>Lesson 00.05, both versions</b><span class="ao-meta">v1 restored from the site's git history (commit 5701a1c), audio re-encoded to 64 kbps; v2 is the lesson the course page serves. Word counts are of the captions.</span></figcaption>
</ao-transcript>

The rebuild took Claude 3 hours 29 minutes, and most of it went into a change to the workflow
rather than the lesson. Before, every lesson started with three agents writing three drafts.
Now two research agents go first. One writes up the subject as it is this month; the other
writes up how it changed since autumn 2021. Every claim carries a source, a date, and a tag:
established, new this year, beta, or speculation. Then a planner turns both into a binding plan:
a must-cover list, a time budget, and which topics are only introduced here because they get a
lesson of their own later. The judge that picks between drafts got two new things to score:
whether a draft dropped anything on the must-cover list, and whether anything presented as
current is out of date as of the day it's built. The rule went into the brief every agent reads,
under my name and the date.

The research also settled two things I'd got vague about. I'd written "muse" and "dots" from
memory; the researchers found Meta's Muse and OpenAI's dots, both launched in September. I'd
said I expected chat and Cowork to merge soon; they found the merge had been announced on 16
September, so the lesson states it as fact.

## 00.06: researched, current, and still out of date

00.06 was the first lesson built with research, a plan and the new rule. Its research is
genuinely current. It has Stack Overflow's new questions down about 99 percent from their
peak, and the 2025 developer survey, where "almost right" AI answers topped the list of
frustrations. It covers the plain-text files that documentation sites now publish for AI tools,
and a 2026 study where about one AI coding answer in twenty named a package that doesn't exist.
Its picture of five years ago is accurate too.

But its row in the curriculum read "Read the error, search the exact message, read docs, ask AI
with context, make a tiny test", and the research did exactly what it was asked: it found out
how each of those steps has changed. So the lesson taught that five-step habit for getting
unstuck on an error, updated with 2026 numbers. I wrote back:

> This lesson is out of date because I haven't needed to debug an error myself since I started
> using claude code. It does it all itself. We can mention this, but it shouldn't be what this
> lesson is about.

What I wanted instead: when someone who can't program builds with AI, the code works and the
failures move somewhere they can't see. A security hole in code that runs. Code that ignores a
team's conventions or pulls in libraries the project doesn't use. A dependency list that keeps
growing because nobody owns it. And "make sure it's secure" or "make sure it's ready to deploy"
asked of a model whose answer you have no way to check. I put it as the old saying that you
shouldn't ask questions you can't verify the answer to.

<ao-transcript find="debug|error|security|Stack Overflow|verif">
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v1-0006.webp" src="/media/lessons-sent-back/v1-0006.mp4"><track kind="captions" srclang="en" label="English" src="/media/lessons-sent-back/v1-0006.vtt"></video><figcaption><b>v1 · How to learn anything technical</b><span class="ao-meta">5:17 · 761 words · 43 agents · built 3 Oct from 00:36 · 4,763 ElevenLabs characters</span></figcaption></figure>
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v2-0006.webp" src="/courses/the-hidden-curriculum/lessons/00-06-how-to-learn-anything-technical/lesson.mp4"><track kind="captions" srclang="en" label="English" src="/courses/the-hidden-curriculum/lessons/00-06-how-to-learn-anything-technical/captions.vtt"></video><figcaption><b>v2 · Trust what you can verify</b><span class="ao-meta">11:07 · 1,671 words · 60 agents · built 3 Oct 17:49–20:12 · 9,323 ElevenLabs characters · the live lesson</span></figcaption></figure>
<figcaption><b>Lesson 00.06, both versions</b><span class="ao-meta">v1 restored from the site's git history (commit 7a7cb8d), audio re-encoded to 64 kbps; v2 is the lesson the course page serves. v1 went live late, after a Cloudflare build outage that morning.</span></figcaption>
</ao-transcript>

The second version opens the history section with me: I once wrote Python in Notepad and saved
it as `.txt`, an agent would do all of that for me now, and I haven't had to debug an error
since I started using Claude Code. That sentence came from my message, not from the research.
Nothing the researchers could search said it.

## What the research can and can't see

Both first versions did what their rows said. Claude wrote those rows on 30 September, from my
list of things I'd never been taught, and they describe the subject the way most material on it
still does. For 00.05 that was a facts problem: nothing made the agents check a 2021-shaped
row against October 2026. The research step fixed that, and fixed it well. For 00.06 the row
was the problem. It assumed the learner is the one who reads the error, and every agent after
it worked inside that assumption. The research made the lesson more convincing within it.

**A step that checks a lesson against the world can't tell when the world it should be checked
against is one person's working day.** Mine changed in the last year, and the only record of
that was me.

## What each rejection added

Each rebuild's plan also pushed topics out to lessons of their own, so being sent back made the
course longer. The 00.05 plan added ten lessons (diffusion models, context engineering, how AI
apps remember, plugin marketplaces, prompt caching and token meters, multimodal APIs, voice AI,
enterprise plans, always-on personal agents, AI design tools). The 00.06 plan added four (team
norms for AI-written code, prompt injection, review and security agents, checks before real
users). The curriculum stood at 183 lessons when the course started; it's 210 now.

The two rejected versions cost $137 at list prices and 8,954 narration characters, and were live
for about 16 hours each. Their replacements cost $171 and ran three times as long between
them, 31 minutes against 11.

The daily job built 01.01 this morning, "Files are just bytes", in 64 minutes, on its own, with
the research step and nobody watching. It's a lesson about what's inside a file, and the
format of a file hasn't changed much in five years. The ones I'll watch closest are the
Lantern lessons, the 38 rows about AI itself: they're about how people work with it, and that's
the part I've seen change in a week.
