---
id: "AO-029"
title: "I asked where I was supposed to learn all this. Two hours later, 44 agents had made the first lesson."
summary: "On 30 September I typed out every developer word I never got taught and asked for a course. That evening a 44-agent workflow wrote, fact-checked, narrated, animated and reviewed a 5:15 lesson drawn entirely in code. The fact-checkers, reviewers and a speech-to-text pass caught several things a beginner would have learned wrong."
date: 2026-10-01
status: "in-progress"
tags: ["claude-code", "agents", "animation", "elevenlabs", "lessons"]
series: ["agent-runs"]
---

On 30 September I asked Claude where I was supposed to have learned terminals, `.venv`, API
keys, OAuth, Docker and the rest, and said I wanted a course on all of it. At 21:10 that night
the first lesson was pushed to this site: 5 minutes 15 seconds, narrated, drawn entirely in code, made
by a workflow of 44 Opus 5.5 agents in about two hours, from a curriculum of 183 lessons it had
written first.

**Most of what makes the lesson safe to learn from came from the checks.** Two
fact-checkers, four reviewers and a speech-to-text pass on the narration each caught something
the writers had got wrong, and every one of those would have taught a viewer something false or
confusing.

## The question

This is how it started, at 18:22, typed in one go:

> I am a AI Automation Engineer. I use AI to build stuff. But there is so much stuff to know! I
> don't know where I was supposed to learn all these things but I haven't. [...] I HAVE SO MANY
> QUESTIONS!!! Where was I supposed to learn all these things? and how recent are all these?

The list in between ran from "what is CLI" through webhooks, licences, installers, worker
threads and passkeys. I have a degree, and I still started out writing Python in Notepad. I
didn't know you could just change `.txt` to `.py`, or that you had to open a terminal and `cd`
into the folder first. I wrote about that in [No VS Code, no terminal, no
idea](/ledger/no-vs-code-no-terminal/).

Ten minutes later I said: "Please start with the first video animate it using code." Then: "I
don't have time to hold your hand through this or give you much feedback so please take
ownership of this project." That was my last message of the night. Everything below was decided
without me.

The course is called *The Missing Map* for now. It is meant to be conceptual, not a set of
tutorials: what each thing is, where it lives, and what will surprise you when you meet it. The
first lesson is a proof of concept and won't be in the final course. You can [watch the whole
thing](/courses/the-hidden-curriculum/lessons/00-01-the-hidden-curriculum/).

*Update, 1 October 2026: the course is now called The Hidden Curriculum, and I liked this proof
of concept enough to make it the official lesson 00.01. It lives on [the course
page](/courses/the-hidden-curriculum/) with the rest of the lessons as they're filed.*

## What 44 agents did

The orchestrating session wrote a workflow and ran it from 18:53. In order:

- **Three writers**, in parallel, each given a different angle: story-first, metaphor-first,
  framework-first.
- **A judge** that took draft A as the spine and grafted lines in from the other two.
- **Two fact-checkers**, one checking facts and one reading as a beginner, and an agent to apply
  their fixes.
- **A narrator agent** that picked a voice from ElevenLabs' shared library, generated the audio,
  and transcribed every section back to text to compare it with the script.
- **A designer** for the shared visuals, then **eight animators**, one per scene, in parallel.
- **Two review lenses, teaching and craft**, over two rounds, with fix agents between.

A separate agent painted the background plate for the title and end cards in ComfyUI. It made
four candidates and picked one itself; the fourth one here is the one in the lesson.

<ao-compare cols="4" aspect="16/9">
  <figure><img src="/media/the-missing-map/plate-a_s3101.webp" alt="Painted tea house at night with lanterns and a stone path, candidate A seed 3101" loading="lazy"><figcaption><b>Prompt A, seed 3101</b><span class="ao-meta">Qwen-Image 2.1 · 2048×1152 · ~62–67 s</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-a_s3102.webp" alt="Painted tea house at night, candidate A seed 3102" loading="lazy"><figcaption><b>Prompt A, seed 3102</b><span class="ao-meta">Qwen-Image 2.1</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-b_s3201.webp" alt="Painted tea house at night beside a pond, candidate B seed 3201" loading="lazy"><figcaption><b>Prompt B, seed 3201</b><span class="ao-meta">Qwen-Image 2.1</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-b_s3202.webp" alt="Painted tea house at night with a blossom sprig, candidate B seed 3202" loading="lazy"><figcaption><b>Prompt B, seed 3202</b><span class="ao-meta">Qwen-Image 2.1 · chosen by the agent</span></figcaption></figure>
</ao-compare>

Here are the three opening paragraphs the writers produced, and the one that shipped. Pick a
draft to see which of its words survived into the final.

<ao-diff labels="Draft A, story-first|Draft B, metaphor-first|Draft C, framework-first|Final">
<blockquote>Building with AI comes with a second curriculum that almost nobody teaches: terminals, files, git, keys, hosting. If you never learned it, that's not a character flaw. It's a missing semester, and this course is the map for it. I have a degree in Information Systems and Data Science, and I still found out the hard way.</blockquote>
<blockquote>Nobody taught you the terminal, files, git or API keys, and that's not your fault. Those everyday tools fall in the gap between what schools teach, so everyone collects them as loose pieces, with no picture on the box. This course is the picture on the lid. It won't walk you through steps. It gives every piece you meet somewhere to go.</blockquote>
<blockquote>Building with AI runs on a layer of everyday tools that school rarely teaches: terminals, files, git, keys, hosting. If that layer confuses you, the gap is in the syllabus, not in you. I have a degree in Information Systems, and I once saved a Python script as dot T X T. This course is the map I wish I'd had: what each of these things is, and where it goes in your head.</blockquote>
<blockquote>Building with AI runs on a second curriculum that school rarely teaches: terminals, files, git, keys, hosting. If you never learned it, the gap is in the syllabus, not in you. This course is the map for it: what each thing is, and where it goes. Aaron, who made this course, has a degree in Information Systems, and still found out the hard way.</blockquote>
<figcaption><b>Scene 01, spoken text</b><span class="ao-meta">drafts/script-A, B, C.md and script.md · 30 Sep 18:59–19:04 drafts · cue markers removed</span></figcaption>
</ao-diff>

## What the checks changed

**My degree.** I had described it as Information Systems and Data Science. The fact-checker
compared that with my own notes and the university's department page, found the sources
disagree on the exact name, and cut it to the one part they all share. A second rule then moved
the line out of first person: the narrator is a different hired voice every lesson, and a
stranger's voice saying "I have a degree" would be wrong about who is talking.

<ao-diff labels="Draft A|After fact-check|Final">
<blockquote>I have a degree in Information Systems and Data Science, and I still found out the hard way.</blockquote>
<blockquote>I have a degree in Information Systems, and I still found out the hard way.</blockquote>
<blockquote>Aaron, who made this course, has a degree in Information Systems, and still found out the hard way.</blockquote>
<figcaption><b>Two different fixes to one sentence</b><span class="ao-meta">factcheck:facts, then the narrator rule in COURSE.md</span></figcaption>
</ao-diff>

**One word in the error scene.** The beginner-lens fact-checker's note is the best thing in the
run. Python prints `can't open file … [Errno 2]` before it reads a single line, so that error
never means your code is broken. The draft said it "usually" doesn't. In its words, "The hedge is
on the wrong sentence."

<ao-diff labels="Before|After">
<blockquote>That usually doesn't mean your code is broken. It means you're standing in the wrong folder, or the file is still called dot T X T.</blockquote>
<blockquote>That doesn't mean your code is broken. Python never even opened it. Usually, you're standing in the wrong folder, or the file is still called dot T X T.</blockquote>
<figcaption><b>Scene 07</b><span class="ao-meta">factcheck:beginner, severity "misleading"</span></figcaption>
</ao-diff>

It also took out "Computer science mostly teaches theory", because most CS degrees involve a lot
of programming and the lesson's own source doesn't say "theory". It now says "the ideas".

**The narrator.** The first voice passed its audition and then said "uh" all through the real
lesson. It was thrown out, blocked from ever being picked again, and the audition was changed so
a voice with that habit fails before it narrates anything. The speech-to-text pass also caught
"vee-env" being heard as ".env", so `.venv` is now spelled out letter by letter.

**The pictures.** The first teaching review found that the AI in scene 06 typed `python
script.py` at exactly the prompt where scene 07 shows that same command failing, so the AI
was shown making the mistake the next scene warns against. The fixed scene has the AI go to the
folder first. The craft review measured a map that sat under the subtitles for about
55 seconds and five holds of 4–5 seconds where nothing on screen moved.

## What it looks like

Three scenes from the published lesson, cut from the 720p copy on this site, with the
narration.

<ao-compare cols="1" aspect="16/9">
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-02-notepad.webp" src="/media/the-missing-map/scene-02-notepad.mp4"></video><figcaption><b>Scene 02: Python in a text file</b><span class="ao-meta">0:27–0:52 of the lesson · narrator RClayton (ElevenLabs voice library) · drawn in code</span></figcaption></figure>
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-05-map.webp" src="/media/the-missing-map/scene-05-map.mp4"></video><figcaption><b>Scene 05: the map every later lesson is filed on</b><span class="ao-meta">2:27–3:14 · seven districts, with AI as the lanterns over all of them</span></figcaption></figure>
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-07-surprises.webp" src="/media/the-missing-map/scene-07-surprises.mp4"></video><figcaption><b>Scene 07: the surprises you'll hit</b><span class="ao-meta">3:55–4:41 · every "just", and the wrong-folder error</span></figcaption></figure>
</ao-compare>

The videos start muted; unmute them for the narration.

## The bill

Playback Lens puts the whole session at **$134 at API list prices**, $111 of it inside the
workflow, with 717 thousand output tokens. Rendering the 9,445 frames took 151 seconds. The
orchestrator's own report offered to slim it down to one draft and one review round if that was
too heavy for a daily job.

A daily job now makes the next lesson each morning with the same workflow. Its first run, at
05:40 today, got as far as its first command and no further, so the real lesson 00.01 is still
marked to do.

The "usually" was written by an agent that knew the material, and caught by one told to read the
script the way a beginner would. The course is for the beginner.
