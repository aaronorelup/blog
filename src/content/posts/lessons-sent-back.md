---
id: "AO-034"
title: "Two lessons I sent back from my AI-made video course"
summary: "My agents make the lessons for my video course on the basics of building with AI. I sent two of the first seven back as out of date. What was wrong, what Claude changed, and both versions to compare."
date: 2026-10-04
status: "shipped"
tags: ["claude-code", "agents", "animation", "elevenlabs", "lessons"]
series: ["hidden-curriculum", "agent-runs"]
topic: "learning"
project: ["hidden-curriculum"]
preview:
  verdict: "Current facts, wrong topic"
  takeaway: "A research step made the lessons' facts current, but it couldn't tell a whole topic was out of date when the only evidence was how I work now."
  points:
    - "The 2021-style lesson on how AI models work came back as a 20-minute lesson on how they work today."
    - "The next one had current numbers but still taught fixing errors by hand, which Claude Code now does for me."
    - "The rebuilds ran 31 minutes against the originals' 11 and added 14 new lessons to the course plan."
  image: "/media/previews/lessons-sent-back.webp"
  alt: "Title card of the rejected first version of lesson 00.06, How to learn anything technical, with its five-step habit for getting unstuck on an error"
---

My agents make the lessons for [The Hidden Curriculum](/courses/the-hidden-curriculum/), my
video course on the small things nobody teaches you when you start building with AI. Each lesson
takes a team of 42 to 63 Claude agents to write, check, narrate and animate.
[The first one](/ledger/the-missing-map/) went up on 30 September, and I sent two of the first
seven back as out of date.

After the first one I sent back, Claude added a research step to every lesson. **It got the
facts current, but the very next lesson still taught fixing errors by hand**, which I haven't
done since I started using Claude Code (Anthropic's coding agent). The research couldn't catch
that, because the only evidence was how I work now.

- **Lesson 00.05 explained AI models the 2021 way.** The rebuild covers how they work today,
  in 20 minutes.
- **Now research agents and a planner go first.** Every claim gets a source and a date.
- **Lesson 00.06 had 2026 numbers and an old subject.** The rebuild is about what you can't
  see in AI-written code.
- **Sending them back made the course longer.** The rebuilds run 31 minutes to the originals' 11,
  and the plan got 14 new lessons.

## Lesson 00.05 explained AI the 2021 way

The first version was five good minutes on the basics, like how a model reads text in chunks
called tokens and why it sometimes makes things up. That's what its row in the course plan asked
for, and none of it is wrong. It's just a model behind a chat box with nothing around it. Twelve
hours after it went up, I wrote back:

> This lesson would have been okay 5 years ago, but a lot have changed. I'm thinking this needs
> to be a 20 minute video explaining the history and the changes until to date.

I listed what was missing and ended with:

> You need to spend more time planning what you are going to include in each lesson going
> forward.

<details><summary>Everything I said 00.05 was missing</summary>

- Models that take in and make images, audio and video.
- Models getting worse as their context, what they're holding in mind, fills up.
- The different ways they remember: searching old chats, keeping their own memory, and reaching
  files and Notion through tool calls.
- System prompts and instruction files, the standing instructions a model reads before your
  message.
- Diffusion, the way most image and video models work.
- Caching, and the difference between cache reads, cache writes, input and output tokens, the
  different kinds of tokens an AI bill counts.
- Claude's chat, Cowork (its desktop app for work that isn't code) and Code, across the browser,
  the desktop, the command line and the cloud.
- Skills, connectors and plugins, the add-ons that teach Claude a task or connect it to other apps.
- Always-on personal agents like OpenClaw.

</details>

<ao-transcript find="cache|memory|diffusion|Claude|token">
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v1-0005.webp" src="/media/lessons-sent-back/v1-0005.mp4"><track kind="captions" srclang="en" label="English" src="/media/lessons-sent-back/v1-0005.vtt"></video><figcaption><b>v1 · How LLMs work (just enough)</b><span class="ao-meta">5:30 · 762 words · 42 agents · built 2 Oct · sent back the same day</span></figcaption></figure>
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v2-0005.webp" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/lesson.mp4"><track kind="captions" srclang="en" label="English" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/captions.vtt"></video><figcaption><b>v2 · How AI models work today</b><span class="ao-meta">19:54 · 2,683 words · 63 agents · built 2 Oct · the live lesson</span></figcaption></figure>
<figcaption><b>Lesson 00.05, both versions</b><span class="ao-meta">v1 is restored from the site's history, with its audio squeezed into a smaller file. v2 is the lesson on the course page. Word counts are of the captions.</span></figcaption>
</ao-transcript>

## The research step Claude added

The rebuild took Claude about three and a half hours, mostly spent changing how every lesson
gets made:

- **Two research agents go first.** One covers the subject as it is this month, the other how it
  changed since 2021. Every claim gets a source and a date.
- **A planner writes a must-cover list** the drafts have to follow.
- **The judge, the agent that picks the best draft, checks two more things.** Nothing on the list
  got dropped, and nothing called current is out of date.

<details><summary>Two things the research caught</summary>

The research also cleared up two things I'd gotten vague about. I'd written "muse" and "dots"
from memory, and the researchers found Meta's Muse and OpenAI's dots, both launched in
September. I'd said I expected Claude's chat app and Cowork to merge soon. They found the merge
had been announced on 16 September, so the lesson says it as fact.

</details>

## Lesson 00.06 had current facts and the wrong subject

00.06 was the first lesson built that way, and its facts were current. It even had Stack
Overflow, the site where programmers used to ask about errors, getting about 99 percent fewer
new questions than at its peak.

But its row in the plan said "Read the error, search the exact message, read docs, ask AI with
context, make a tiny test". Claude had written that row from my list of things I'd never been
taught, and the row assumed the learner is the one reading the error. So the research updated
every step of a habit I don't use. I wrote back:

> This lesson is out of date because I haven't needed to debug an error myself since I started
> using claude code. It does it all itself. We can mention this, but it shouldn't be what this
> lesson is about.

I wanted a lesson on the problems you can't see in AI-written code that works, like a security
hole. The rebuild, "Trust what you can verify", opens its history part with my line about not
debugging. Nothing the researchers could search said that.

<details><summary>What 00.06 found, and what I asked for instead</summary>

The first version's research was current. Besides Stack Overflow, it had the 2025 developer
survey, where "almost right" AI answers topped the list of frustrations. It had the plain-text
files that documentation sites now publish for AI tools. And it had a 2026 study where about one
AI coding answer in twenty named a package that doesn't exist. A package is a ready-made piece of
code you install. Its picture of five years ago was accurate too.

What I asked the rebuild to cover, the failures someone who can't program won't see:

- A security hole in code that runs.
- Code that ignores a team's conventions, or pulls in libraries the project doesn't use.
- A list of outside code the project depends on that keeps growing because nobody owns it.
- "Make sure it's secure" or "make sure it's ready to deploy" asked of a model whose answer you
  have no way to check.

I put it as the old saying that you shouldn't ask questions you can't verify the answer to. The
rebuild's history part also has me writing Python in Notepad and saving it as `.txt`, and says an
agent would do all of that for me now.

</details>

<ao-transcript find="debug|error|security|Stack Overflow|verif">
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v1-0006.webp" src="/media/lessons-sent-back/v1-0006.mp4"><track kind="captions" srclang="en" label="English" src="/media/lessons-sent-back/v1-0006.vtt"></video><figcaption><b>v1 · How to learn anything technical</b><span class="ao-meta">5:17 · 761 words · 43 agents · built 3 Oct · sent back the same day</span></figcaption></figure>
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v2-0006.webp" src="/courses/the-hidden-curriculum/lessons/00-06-how-to-learn-anything-technical/lesson.mp4"><track kind="captions" srclang="en" label="English" src="/courses/the-hidden-curriculum/lessons/00-06-how-to-learn-anything-technical/captions.vtt"></video><figcaption><b>v2 · Trust what you can verify</b><span class="ao-meta">11:07 · 1,671 words · 60 agents · built 3 Oct · the live lesson</span></figcaption></figure>
<figcaption><b>Lesson 00.06, both versions</b><span class="ao-meta">v1 is restored from the site's history, with its audio squeezed into a smaller file. v2 is the lesson on the course page. v1 went live late, after a Cloudflare build outage that morning.</span></figcaption>
</ao-transcript>

## What the rebuilds cost and added

The two rejected versions came to $137 at API list prices (the price if billed per use) and ran
11 minutes between them. Their replacements came to $171 and ran 31. The two rebuilds also added
14 lessons to the course plan, ten from 00.05 and four from 00.06. Later I had Claude
[rebuild the whole plan](/ledger/curriculum-from-sources/) from outside sources, and 214 lessons
became 36.

<details><summary>The 14 lessons the two rebuilds added</summary>

- **From 00.05 (ten):** diffusion models, context engineering, how AI apps remember, plugin
  marketplaces, prompt caching and token meters, multimodal APIs, voice AI, enterprise plans,
  always-on personal agents, AI design tools.
- **From 00.06 (four):** team norms for AI-written code, prompt injection, review and security
  agents, checks before real users.

</details>

<details><summary>Every lesson in the first five days</summary>

| Lesson | Built | Length | Agents | Cost | What happened |
|---|---|---|---|---|---|
| 00.01 The hidden curriculum | 30 Sep | 5:15 | 44 | $134 | [the first lesson](/ledger/the-missing-map/) |
| 00.02 The map of everything | 1 Oct, 17:43 | 4:36 | 42 | $46 | |
| 00.03 How old is all this? | 1 Oct, 18:44 | 5:04 | 42 | $65 | narration redone, then extended to 10:45 the same night (56 agents, $86) |
| 00.04 Model vs app vs agent | 1 Oct, 22:09 | 4:43 | 42 | $70 | |
| 00.05 How LLMs work (just enough) | 2 Oct, 01:52 | 5:30 | 42 | $69 | **sent back 2 Oct, 15:19** |
| 00.05 How AI models work today | 2 Oct, 15:19 | 19:54 | 63 | $100 | replaced v1 at the same address |
| 00.06 How to learn anything technical | 3 Oct, 00:36 | 5:17 | 43 | $68 | **sent back 3 Oct, 17:49** |
| 00.06 Trust what you can verify | 3 Oct, 17:49 | 11:07 | 60 | $71 | replaced v1 at the same address |
| 01.01 Files are just bytes | 4 Oct, 05:36 | 5:07 | 42 | $47 | made by the daily job on its own |

Costs are at API list prices from the session transcripts, rounded to the dollar. I'm on a flat
subscription. "Built" is when the work on it started. The course is meant to ship one lesson a
day, and the scheduled daily job does exactly that. Most of the extra lessons on 1 and 2 October
came from me typing "continue with the next lesson" late at night.

The two rejected versions used 8,954 characters of narration between them and were live for
about 16 hours each.

</details>
