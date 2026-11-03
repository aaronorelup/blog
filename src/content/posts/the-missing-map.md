---
id: "AO-029"
title: "44 agents made the first lesson of my course for AI builders"
summary: "I asked Claude where I was supposed to learn terminals, API keys and the rest. How 44 agents then made the first lesson of a course in two hours, and what their checks caught."
date: 2026-10-01
topic: "learning"
project: ["hidden-curriculum"]
preview:
  verdict: "The checks made it safe"
  takeaway: "An agent that knew the material wrote a line a beginner would learn wrong, and another agent, told to read the script as a beginner, caught it."
  points:
    - "The draft said Python's can't-open-file error \"usually\" isn't your code. It never is. Python never opened the file."
    - "Also caught: the AI on screen typing the exact command the next scene shows failing, and a narrator voice saying \"uh\"."
    - "$134 at API list prices for a 5:15 lesson. The first run of the daily lesson job stopped at its first command."
  image: "/media/previews/the-missing-map.webp"
  alt: "Title card of lesson 00.01, The hidden curriculum, over a painted tea house at night"
---

I asked Claude where I was supposed to have learned terminals, API keys, Docker and all the
other stuff nobody teaches you, and said I wanted a course on it. That night 44 Claude agents
wrote, fact-checked, narrated and animated the first lesson in about two hours. It runs 5 minutes
15 seconds and every scene is drawn by code.
[Watch the whole lesson](/courses/the-hidden-curriculum/lessons/00-01-the-hidden-curriculum/).

**The checks are what made it safe to learn from.** Fact-checkers, reviewers and a pass that
turned the narration back into text each caught something the writers got wrong. Every one of
those would have taught a beginner something false or confusing.

- **A wrong "usually" in the error scene.** The script said Python's can't-open-file error
  usually doesn't mean your code is broken. It never does. Python never even opened the file.
- **The AI on screen made the mistake the next scene warns about.** It typed the exact command
  that scene 07 shows failing.
- **The first narrator voice said "uh" all the way through.** It had passed its audition. Now
  the audition catches that.

The whole thing cost **$134** at API list prices, which is what Anthropic would charge if I paid
per use. The lesson is now the official 00.01 of [The Hidden Curriculum](/courses/the-hidden-curriculum/),
my video course on the small things nobody teaches you when you start building with AI. That
night it was still called The Missing Map.

## Three scenes from the lesson

Cut from the 720p copy on this site. They start muted, so turn the sound on for the narration.

<ao-compare cols="1" aspect="16/9">
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-02-notepad.webp" src="/media/the-missing-map/scene-02-notepad.mp4"></video><figcaption><b>Scene 02: Python in a text file</b><span class="ao-meta">0:27–0:52 of the lesson · narrator RClayton (ElevenLabs voice library) · drawn in code</span></figcaption></figure>
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-05-map.webp" src="/media/the-missing-map/scene-05-map.mp4"></video><figcaption><b>Scene 05: the map every later lesson is filed on</b><span class="ao-meta">2:27–3:14 · seven districts, with AI as the lanterns over all of them</span></figcaption></figure>
  <figure><video controls muted playsinline preload="metadata" poster="/media/the-missing-map/scene-07-surprises.webp" src="/media/the-missing-map/scene-07-surprises.mp4"></video><figcaption><b>Scene 07: the surprises you'll hit</b><span class="ao-meta">3:55–4:41 · every "just", and the wrong-folder error</span></figcaption></figure>
</ao-compare>

## How it started

I typed this in one go on 30 September:

> I use AI to build stuff. But there is so much stuff to know! I don't know where I was supposed
> to learn all these things but I haven't. [...] I HAVE SO MANY QUESTIONS!!! Where was I
> supposed to learn all these things? and how recent are all these?

The part I cut was a long list of developer words I'd never been taught. I have a degree, and I
still started out [writing Python in Notepad](/ledger/no-vs-code-no-terminal/).

Ten minutes later I asked Claude to "start with the first video animate it using code", and told
it to "please take ownership of this project." That was my last message of the night. Everything
after it was decided without me.

Claude planned 183 lessons first. That plan has since been
[rebuilt from 251 outside sources](/ledger/curriculum-from-sources/) into 36 lessons.

<details><summary>Who did what, in order</summary>

The main Claude session wrote a workflow and ran it from 18:53. A workflow is a script that
starts agents and hands work between them. Its 44 agents were all Claude Opus 5.5.

- **Three writers**, in parallel, each given a different angle: story first, metaphor first,
  framework first.
- **A judge** that took draft A as the spine and grafted lines in from the other two.
- **Two fact-checkers**, one checking facts and one reading as a beginner, and an agent to apply
  their fixes.
- **A narrator agent** that picked a voice from ElevenLabs' shared library, made the audio, and
  turned every section back into text to compare it with the script.
- **A designer** for the shared visuals, then **eight animators**, one per scene, in parallel.
- **Two reviewers, one for teaching and one for craft**, over two rounds, with fix agents in
  between.
- **A separate agent** painted the title-card background in ComfyUI, a free tool for running
  image models.

Rendering the 9,445 frames took 151 seconds. The lesson went up on this site at 21:10. The main
session's own report offered a lighter version, one draft and one review round, in case this was
too heavy for a daily job.

</details>

## What the checks changed

### One word in the error scene

Python prints `can't open file ... [Errno 2]` before it reads a single line, so that error never
means your code is broken. The fact-checker reading as a beginner put it this way: "The hedge is
on the wrong sentence."

<ao-diff labels="Before|After">
<blockquote>That usually doesn't mean your code is broken. It means you're standing in the wrong folder, or the file is still called dot T X T.</blockquote>
<blockquote>That doesn't mean your code is broken. Python never even opened it. Usually, you're standing in the wrong folder, or the file is still called dot T X T.</blockquote>
<figcaption><b>Scene 07</b><span class="ao-meta">factcheck:beginner, severity "misleading"</span></figcaption>
</ao-diff>

### My degree, fixed twice

My notes and the university's page disagree on the exact name of my degree, so the fact-checker
cut it to the part they share. Then a rule moved the line out of first person, because every
lesson has a different hired AI narrator.

<ao-diff labels="Draft A|After fact-check|Final">
<blockquote>I have a degree in Information Systems and Data Science, and I still found out the hard way.</blockquote>
<blockquote>I have a degree in Information Systems, and I still found out the hard way.</blockquote>
<blockquote>Aaron, who made this course, has a degree in Information Systems, and still found out the hard way.</blockquote>
<figcaption><b>Two different fixes to one sentence</b><span class="ao-meta">factcheck:facts, then the narrator rule in COURSE.md</span></figcaption>
</ao-diff>

<details><summary>The other fixes: the voice, the scenes and a line about computer science</summary>

- **The voice.** The narrator agent picks a voice from ElevenLabs' shared library (ElevenLabs
  makes AI voices). The first one passed its audition and then said "uh" all through the real
  lesson. It was thrown out, blocked from ever being picked again, and the audition was changed
  so a voice with that habit fails before it narrates anything.
- **".venv" heard as ".env".** The narrator agent turned every section of the audio back into
  text and compared it with the script. That's how it caught "vee-env" being heard as ".env".
  One is a Python project's own folder of installed packages, the other a file of settings and
  keys. So `.venv` is now spelled out letter by letter.
- **Scene 06.** The first teaching review found the AI typing `python script.py` at exactly the
  spot where scene 07 shows that same command failing. So the AI was shown making the mistake the
  next scene warns against. In the fixed scene the AI goes to the folder first.
- **Still pictures.** The craft review measured a map that sat under the subtitles for about 55
  seconds, and five holds of 4 to 5 seconds where nothing on screen moved.
- **"Theory".** The fact-checker took out "Computer science mostly teaches theory", because most
  computer science degrees involve a lot of programming and the lesson's own source doesn't say
  "theory". It now says "the ideas".

</details>

## Three drafts of the opening

Three writer agents each took a different angle, and a judge agent kept draft A as the spine
with lines grafted in from the other two. Pick a draft to see which of its words made the final.

<ao-diff labels="Draft A, story-first|Draft B, metaphor-first|Draft C, framework-first|Final">
<blockquote>Building with AI comes with a second curriculum that almost nobody teaches: terminals, files, git, keys, hosting. If you never learned it, that's not a character flaw. It's a missing semester, and this course is the map for it. I have a degree in Information Systems and Data Science, and I still found out the hard way.</blockquote>
<blockquote>Nobody taught you the terminal, files, git or API keys, and that's not your fault. Those everyday tools fall in the gap between what schools teach, so everyone collects them as loose pieces, with no picture on the box. This course is the picture on the lid. It won't walk you through steps. It gives every piece you meet somewhere to go.</blockquote>
<blockquote>Building with AI runs on a layer of everyday tools that school rarely teaches: terminals, files, git, keys, hosting. If that layer confuses you, the gap is in the syllabus, not in you. I have a degree in Information Systems, and I once saved a Python script as dot T X T. This course is the map I wish I'd had: what each of these things is, and where it goes in your head.</blockquote>
<blockquote>Building with AI runs on a second curriculum that school rarely teaches: terminals, files, git, keys, hosting. If you never learned it, the gap is in the syllabus, not in you. This course is the map for it: what each thing is, and where it goes. Aaron, who made this course, has a degree in Information Systems, and still found out the hard way.</blockquote>
<figcaption><b>Scene 01, spoken text</b><span class="ao-meta">drafts/script-A, B, C.md and script.md · 30 Sep 18:59–19:04 drafts · cue markers removed</span></figcaption>
</ao-diff>

## The title card

Another agent painted the background for the title and end cards with an AI image model. It made
four and picked the last one itself.

<ao-compare cols="4" aspect="16/9">
  <figure><img src="/media/the-missing-map/plate-a_s3101.webp" alt="Painted tea house at night with lanterns and a stone path, candidate A seed 3101" loading="lazy"><figcaption><b>Prompt A, seed 3101</b><span class="ao-meta">Qwen-Image 2.1 · 2048×1152 · ~62–67 s</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-a_s3102.webp" alt="Painted tea house at night, candidate A seed 3102" loading="lazy"><figcaption><b>Prompt A, seed 3102</b><span class="ao-meta">Qwen-Image 2.1</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-b_s3201.webp" alt="Painted tea house at night beside a pond, candidate B seed 3201" loading="lazy"><figcaption><b>Prompt B, seed 3201</b><span class="ao-meta">Qwen-Image 2.1</span></figcaption></figure>
  <figure><img src="/media/the-missing-map/plate-b_s3202.webp" alt="Painted tea house at night with a blossom sprig, candidate B seed 3202" loading="lazy"><figcaption><b>Prompt B, seed 3202</b><span class="ao-meta">Qwen-Image 2.1 · chosen by the agent</span></figcaption></figure>
</ao-compare>

## The bill

My tool [Playback Lens](/ledger/reading-my-own-agents/), which reads the records Claude Code
keeps of every session, puts the whole thing at **$134 at API list prices**. $111 of that was
inside the workflow.

A daily job was then set up to make the next lesson each morning the same way. Its first run
stopped at its first command. What happened next is in three later posts, on
[the two lessons I sent back](/ledger/lessons-sent-back/),
[rebuilding the plan from outside sources](/ledger/curriculum-from-sources/) and
[the first lesson on the new plan](/ledger/first-lesson-on-the-new-map/).
