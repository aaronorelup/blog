---
id: "AO-050"
title: "Fact-checking a video lesson made by 71 AI agents"
summary: "71 Claude agents made one 11-minute lesson for my beginner AI course. What its four fact-checkers caught before it shipped, and why the one reading as a beginner found the worst mistakes."
date: 2026-10-16
topic: "learning"
project: ["hidden-curriculum"]
preview:
  verdict: "Beginner check mattered most"
  takeaway: "The checker reading as a beginner caught the script implying Claude Code on your computer keeps your files at home. What it reads still goes to Anthropic."
  points:
    - "Four fact-checkers raised 27 findings and marked 17 as misleading. The fixer applied all 17."
    - "The words got fixed first. The drawing still put the AI inside your computer until a reviewer caught it."
    - "It took 2 hours 40 minutes and $122 at pay-per-use prices. Review cut it from 12.2 minutes to 11:18, under its limit."
  image: "/media/previews/first-lesson-on-the-new-map.webp"
  alt: "A frame from the lesson: a house labelled Your computer, a dotted line from its Code room to Anthropic's servers, and the words what it reads still goes to the model"
---

My course, [The Hidden Curriculum](/courses/the-hidden-curriculum/), teaches the small stuff
nobody tells you when you start building with AI. A crew of Claude agents makes its lessons on a
daily schedule. On 14 October it took 71 agents to make an 11-minute lesson on where your AI
agent actually does its work, and where your files end up.

**The fixes that mattered most came from the fact-checker told to read the script as a
beginner.** The draft taught that Claude Code, Anthropic's coding agent, keeps your files at
home when it runs on your own computer. It doesn't, because whatever it reads still goes to
Anthropic's servers.

It was the first lesson made from the course's new plan, which I'd
[rebuilt two days earlier from 251 outside sources](/ledger/curriculum-from-sources/).

<ao-shots>
<video controls playsinline preload="metadata" poster="/media/first-lesson-on-the-new-map/poster.webp" src="/courses/the-hidden-curriculum/lessons/where-your-agent-works/lesson.mp4"></video>
<ol>
<li data-t="0:01.4"><img src="/media/first-lesson-on-the-new-map/s01.webp" alt="Title card: Where your agent works, over a garden at night" loading="lazy">The point</li>
<li data-t="0:45"><img src="/media/first-lesson-on-the-new-map/s02.webp" alt="The course map with the First Build district lit" loading="lazy">The map</li>
<li data-t="0:59.6"><img src="/media/first-lesson-on-the-new-map/s03.webp" alt="A house of rooms labelled Chat, Cowork and Code, beside a docs screenshot" loading="lazy">One worker, many rooms</li>
<li data-t="1:35.8"><img src="/media/first-lesson-on-the-new-map/s04.webp" alt="The house relabelled with OpenAI's Chat, Work and Codex" loading="lazy">Pick by the output</li>
<li data-t="2:27.9"><img src="/media/first-lesson-on-the-new-map/s05.webp" alt="The rooms behind one Claude input box" loading="lazy">Labels fading</li>
<li data-t="2:52"><img src="/media/first-lesson-on-the-new-map/s06.webp" alt="A dotted line from the Code room to Anthropic's servers" loading="lazy">Across town</li>
<li data-t="3:47.8"><img src="/media/first-lesson-on-the-new-map/s07.webp" alt="The desktop quickstart page with WSL highlighted" loading="lazy">Many doors</li>
<li data-t="4:34.6"><img src="/media/first-lesson-on-the-new-map/s08.webp" alt="Command Prompt running echo first and echo second" loading="lazy">The speaking tube</li>
<li data-t="5:21.9"><img src="/media/first-lesson-on-the-new-map/s09.webp" alt="The agent's Git Bash beside Windows PowerShell" loading="lazy">At the tube</li>
<li data-t="5:59.6"><img src="/media/first-lesson-on-the-new-map/s10.webp" alt="A Blender render of a detached house and a block of flats" loading="lazy">House and flat</li>
<li data-t="6:53"><img src="/media/first-lesson-on-the-new-map/s11.webp" alt="A cloud session working on a copy cloned from GitHub" loading="lazy">Works on a copy</li>
<li data-t="7:44.6"><img src="/media/first-lesson-on-the-new-map/s12.webp" alt="Where your files end up: the hatch to connected folders" loading="lazy">Not on your computer</li>
<li data-t="8:38.5"><img src="/media/first-lesson-on-the-new-map/s13.webp" alt="The landlord's logbook: memory kept after a chat is deleted" loading="lazy">The logbook</li>
<li data-t="9:45.3"><img src="/media/first-lesson-on-the-new-map/s14.webp" alt="Two columns: what the agent does, what you do" loading="lazy">You and the agent</li>
<li data-t="10:43"><img src="/media/first-lesson-on-the-new-map/s15.webp" alt="The Keep this card: pick the room by the output" loading="lazy">Keep this</li>
</ol>
<figcaption><b>Lesson 01.02, Where your agent works, as published</b><span class="ao-meta">14 Oct 2026 · 11:18 in 15 sections · the course's own 720p copy, unchanged · AI narration by ElevenLabs · section 10 is a 3D shot made in Blender</span></figcaption>
</ao-shots>

What came out of it:

- **Four fact-checkers raised 27 findings.** They marked 17 as misleading, and the fixer agent
  applied all 17.
- **The beginner checker caught the two that mattered.** One was the files-at-home line. The
  other was the lesson's main picture, which put the AI inside your computer.
- **The words got fixed before the drawing did.** The animation still showed the AI inside your
  computer until a reviewer caught it.
- **Two review rounds got it under the time limit.** The first cut ran 12.2 minutes against an
  11.5-minute limit. The finished lesson is 11:18.
- **It took 2 hours 40 minutes and $122** at Anthropic's pay-per-use prices.

## The line about where your files go

The lesson covers chat, Cowork (the part of Claude that does tasks on your files), desktop apps,
and terminal agents you run by typing commands. Section 06 said that with Cowork
moved to the cloud, Anthropic points you to Claude Code for local work. Next to section 07's
"Local: your machine, full access", a beginner hears that Claude Code keeps his files at home.
The commands do run on your machine, but what it reads goes to Anthropic's servers.

<ao-diff labels="Judge's script|Beginner checker's fix|Shipped">
<blockquote>For local-only work, Anthropic points you to Claude Code.</blockquote>
<blockquote>For work that runs on your own machine, Anthropic points you to Claude Code. Running locally isn't the same as staying local, though: whatever it reads still goes to the model on Anthropic's servers.</blockquote>
<blockquote>For local work, Anthropic points you to Claude Code. Running locally isn't staying local, though: what it reads still goes to Anthropic's servers.</blockquote>
<figcaption><b>Section 06, spoken text</b><span class="ao-meta">the judge's script is the draft a judge agent merged from three writers' versions · then the beginner checker's fix · then what the narrator says in the finished lesson</span></figcaption>
</ao-diff>

## The picture with the AI in the wrong place

The draft's main picture was one worker, the model, who "can stand in any room" of a house that
is your computer. That puts the model inside your computer. But in every app the lesson covers,
the model runs on the AI company's servers, so the picture taught the wrong machine in the first
minute.

<ao-diff labels="Judge's script|Shipped">
<blockquote>Picture one worker: the model. And your computer as a house of rooms. The worker can stand in any room. What changes is which of your shelves it reaches.</blockquote>
<blockquote>Picture one worker: the model. It always thinks in the vendor's building. And your computer is a house of rooms. The worker can reach any room. What changes is which shelves it can touch.</blockquote>
<figcaption><b>Section 03, spoken text</b><span class="ao-meta">the draft against what shipped, word for word</span></figcaption>
</ao-diff>

The words were fixed in minutes, but the drawing lagged. At the first review the teaching
reviewer saw section 03 still drawing the model inside the Chat and Cowork rooms, while the
narrator says it "always thinks in the vendor's building". That round's fixers brought the two
together.

## What each fact-checker caught

Each checker gets the script and one job. One checks claims against the sources they cite, one
checks the facts, one (the currency checker) looks for anything already out of date, and one
reads it as the beginner the course is for. The beginner checker was in the crew for
[the course's first lesson](/ledger/the-missing-map/) too.

<ao-bars max="11" unit="findings">
<table>
<thead><tr><th>Checker</th><th>Misleading</th><th>Nitpick</th></tr></thead>
<tbody>
<tr><td>Facts</td><td>6</td><td>5</td></tr>
<tr><td>Beginner</td><td>6</td><td>1</td></tr>
<tr><td>Sources</td><td>4</td><td>3</td></tr>
<tr><td>Currency</td><td>1</td><td>1</td></tr>
</tbody>
</table>
<figcaption><b>Fact-check findings by checker</b><span class="ao-meta">from the run's log · each finding was marked misleading or nitpick · the fixer applied all 17 misleading ones</span></figcaption>
</ao-bars>

The others caught real stuff too:

- **The sources checker caught a misquote.** Ethan Mollick, a professor who writes a lot about
  AI, advises "at least High" thinking. Thinking is the setting for how hard the model works before
  it answers. The script said "a high thinking level", which turns his floor into a ceiling.
- **The currency checker caught a billing gap.** The script said there are two ways to pay and
  left out the part that catches people. If you approve a saved API key (the key to Anthropic's
  pay-per-use account), your use gets billed to that key instead of your plan.

## The real screens in the lesson

The new plan asks each lesson to show the real thing where it can, so a capture agent recorded
real screens before anything got animated. Every product fact on screen carries its date and
"moves monthly".

<details><summary>The screens it recorded, and a date to watch</summary>

The capture agent recorded Anthropic's help page on the 6 October change that moved Cowork to
the cloud, the list of
environments to run in on the desktop quick-start page, and one command run in two Windows
terminals.

<figure>
<img src="/media/first-lesson-on-the-new-map/shells.webp" alt="Command Prompt prints first and second for echo first && echo second; Windows PowerShell 5.1 rejects the same line: the token && is not a valid statement separator" loading="lazy">
<figcaption>Section 08 at 5:10. Both terminals are real runs in a demo folder, replayed in the
lesson. The && means "if that worked, run the next one". Command Prompt runs the line. Windows
PowerShell 5.1, the one that comes with Windows, refuses it.</figcaption>
</figure>

That 6 October change opens the lesson. Pro and Max users (Claude's paid plans) who had kept
Cowork on their own computer found new tasks running in the cloud, with no way back. It was
eight days old when the lesson was made.

That morning the research agent checked what had changed since the plan was written and filed
seven findings for other lessons. One of them carries a date. As of 14 October, a beta entry in
Anthropic's Cowork changelog says the three-tab desktop app ends on 10 November for
organisations that haven't set one admin setting. So this lesson may need re-recording around
then.

</details>

## How the lesson got made

One workflow ran 71 Claude agents in ten phases, from reading sources to shipping the video.

<details><summary>All 71 agents, phase by phase, and both review rounds</summary>

The job is one workflow, a script that starts the agents in order. It has ten phases:

- **Sources.** Five agents read the five sources the narration may name. Four more pulled out
  the points the lesson's spec asks for. One went looking for what had changed since the plan
  was written.
- **Plan.** A planner turned the spec into sections.
- **Script and judge.** Three writers drafted the script at once from three angles. A judge
  agent scored them out of 100: metaphor-first 85, evidence-first 84, story-first 83. Then it
  merged the winner with pieces of the other two.
- **Fact-check.** Four fact-checkers and a fixer.
- **Narrate.** A narrator, next to a capture agent recording real screens.
- **Design and animate.** A designer, then one animator per section.
- **Review.** Two reviewers for two rounds, with a fixer for each flagged section.
- **Ship.** One agent to render and publish it.

<ao-runs>
<table>
<thead><tr><th>Agent</th><th>Phase</th><th>Start</th><th>End</th></tr></thead>
<tbody>
<tr><td>source:S102</td><td>Sources</td><td>05:37:26</td><td>05:39:09</td></tr>
<tr><td>source:S184</td><td>Sources</td><td>05:37:28</td><td>05:39:01</td></tr>
<tr><td>source:S207</td><td>Sources</td><td>05:37:28</td><td>05:38:51</td></tr>
<tr><td>source:S249</td><td>Sources</td><td>05:37:28</td><td>05:39:01</td></tr>
<tr><td>source:S209</td><td>Sources</td><td>05:37:28</td><td>05:39:18</td></tr>
<tr><td>sources:points-2</td><td>Sources</td><td>05:37:28</td><td>05:38:50</td></tr>
<tr><td>sources:points-1</td><td>Sources</td><td>05:37:28</td><td>05:43:17</td></tr>
<tr><td>sources:points-4</td><td>Sources</td><td>05:37:28</td><td>05:38:43</td></tr>
<tr><td>sources:points-3</td><td>Sources</td><td>05:37:28</td><td>05:38:53</td></tr>
<tr><td>research:now</td><td>Sources</td><td>05:37:28</td><td>05:41:18</td></tr>
<tr><td>planner</td><td>Plan</td><td>05:43:17</td><td>05:47:15</td></tr>
<tr><td>script:story-first</td><td>Script</td><td>05:47:16</td><td>05:54:55</td></tr>
<tr><td>script:metaphor-first</td><td>Script</td><td>05:47:17</td><td>05:56:11</td></tr>
<tr><td>script:evidence-first</td><td>Script</td><td>05:47:17</td><td>05:55:17</td></tr>
<tr><td>judge</td><td>Judge</td><td>05:56:11</td><td>06:03:40</td></tr>
<tr><td>factcheck:sources</td><td>Fact-check</td><td>06:03:40</td><td>06:05:51</td></tr>
<tr><td>factcheck:facts</td><td>Fact-check</td><td>06:03:41</td><td>06:05:45</td></tr>
<tr><td>factcheck:currency</td><td>Fact-check</td><td>06:03:41</td><td>06:04:44</td></tr>
<tr><td>factcheck:beginner</td><td>Fact-check</td><td>06:03:41</td><td>06:05:18</td></tr>
<tr><td>factfix</td><td>Fact-check</td><td>06:05:51</td><td>06:09:29</td></tr>
<tr><td>narrator</td><td>Narrate</td><td>06:09:30</td><td>06:24:47</td></tr>
<tr><td>capture</td><td>Narrate</td><td>06:09:30</td><td>06:20:17</td></tr>
<tr><td>designer</td><td>Design</td><td>06:24:47</td><td>06:35:00</td></tr>
<tr><td>scene:01</td><td>Animate</td><td>06:35:00</td><td>06:39:37</td></tr>
<tr><td>scene:03</td><td>Animate</td><td>06:35:01</td><td>06:42:24</td></tr>
<tr><td>scene:05</td><td>Animate</td><td>06:35:01</td><td>06:39:40</td></tr>
<tr><td>scene:04</td><td>Animate</td><td>06:35:01</td><td>06:41:13</td></tr>
<tr><td>scene:06</td><td>Animate</td><td>06:35:01</td><td>06:45:27</td></tr>
<tr><td>scene:07</td><td>Animate</td><td>06:35:01</td><td>06:48:10</td></tr>
<tr><td>scene:10</td><td>Animate</td><td>06:35:01</td><td>06:41:45</td></tr>
<tr><td>scene:12</td><td>Animate</td><td>06:35:01</td><td>06:43:32</td></tr>
<tr><td>scene:09</td><td>Animate</td><td>06:35:01</td><td>06:43:36</td></tr>
<tr><td>scene:08</td><td>Animate</td><td>06:35:01</td><td>06:43:41</td></tr>
<tr><td>scene:11</td><td>Animate</td><td>06:35:01</td><td>06:44:48</td></tr>
<tr><td>scene:15</td><td>Animate</td><td>06:35:01</td><td>06:38:34</td></tr>
<tr><td>scene:14</td><td>Animate</td><td>06:35:01</td><td>06:42:32</td></tr>
<tr><td>scene:13</td><td>Animate</td><td>06:35:01</td><td>06:44:21</td></tr>
<tr><td>review:craft:r1</td><td>Review</td><td>06:48:10</td><td>06:55:52</td></tr>
<tr><td>review:teaching:r1</td><td>Review</td><td>06:48:11</td><td>06:55:25</td></tr>
<tr><td>fix:10:r1</td><td>Review</td><td>06:55:52</td><td>07:00:22</td></tr>
<tr><td>fix:11:r1</td><td>Review</td><td>06:55:53</td><td>06:58:41</td></tr>
<tr><td>fix:14:r1</td><td>Review</td><td>06:55:53</td><td>06:57:42</td></tr>
<tr><td>fix:13:r1</td><td>Review</td><td>06:55:53</td><td>06:59:48</td></tr>
<tr><td>fix:12:r1</td><td>Review</td><td>06:55:53</td><td>07:01:43</td></tr>
<tr><td>fix:15:r1</td><td>Review</td><td>06:55:53</td><td>06:58:43</td></tr>
<tr><td>fix:06:r1</td><td>Review</td><td>06:55:53</td><td>06:59:03</td></tr>
<tr><td>fix:07:r1</td><td>Review</td><td>06:55:53</td><td>07:05:20</td></tr>
<tr><td>fix:09:r1</td><td>Review</td><td>06:55:53</td><td>06:58:01</td></tr>
<tr><td>fix:08:r1</td><td>Review</td><td>06:55:53</td><td>06:59:36</td></tr>
<tr><td>fix:03:r1</td><td>Review</td><td>06:55:53</td><td>07:02:43</td></tr>
<tr><td>fix:01:r1</td><td>Review</td><td>06:55:53</td><td>07:04:17</td></tr>
<tr><td>fix:04:r1</td><td>Review</td><td>06:55:53</td><td>06:59:58</td></tr>
<tr><td>fix:all:r1</td><td>Review</td><td>06:55:53</td><td>07:16:46</td></tr>
<tr><td>fix:05:r1</td><td>Review</td><td>06:57:42</td><td>07:00:18</td></tr>
<tr><td>review:craft:r2</td><td>Review</td><td>07:16:47</td><td>07:23:51</td></tr>
<tr><td>review:teaching:r2</td><td>Review</td><td>07:16:47</td><td>07:22:50</td></tr>
<tr><td>fix:10:r2</td><td>Review</td><td>07:23:51</td><td>07:25:30</td></tr>
<tr><td>fix:11:r2</td><td>Review</td><td>07:23:52</td><td>07:27:20</td></tr>
<tr><td>fix:14:r2</td><td>Review</td><td>07:23:52</td><td>07:27:00</td></tr>
<tr><td>fix:12:r2</td><td>Review</td><td>07:23:52</td><td>07:27:11</td></tr>
<tr><td>fix:13:r2</td><td>Review</td><td>07:23:52</td><td>07:27:45</td></tr>
<tr><td>fix:04:r2</td><td>Review</td><td>07:23:52</td><td>07:25:22</td></tr>
<tr><td>fix:01:r2</td><td>Review</td><td>07:23:52</td><td>07:27:53</td></tr>
<tr><td>fix:07:r2</td><td>Review</td><td>07:23:52</td><td>07:28:21</td></tr>
<tr><td>fix:08:r2</td><td>Review</td><td>07:23:52</td><td>07:25:02</td></tr>
<tr><td>fix:06:r2</td><td>Review</td><td>07:23:52</td><td>07:26:44</td></tr>
<tr><td>fix:03:r2</td><td>Review</td><td>07:23:52</td><td>07:26:56</td></tr>
<tr><td>fix:09:r2</td><td>Review</td><td>07:23:52</td><td>07:27:46</td></tr>
<tr><td>engine</td><td>Review</td><td>07:28:21</td><td>07:41:18</td></tr>
<tr><td>final-check</td><td>Review</td><td>07:41:18</td><td>07:45:15</td></tr>
<tr><td>ship</td><td>Ship</td><td>07:45:15</td><td>08:17:38</td></tr>
</tbody>
</table>
<figcaption><b>When each of the 71 agents started and stopped, 14 Oct</b><span class="ao-meta">Central time · start and end are the first and last event in each agent's own transcript · phases from the run's log · every agent was Claude Opus 5.5</span></figcaption>
</ao-runs>

The tall blocks are the moments many agents started at once: fourteen animators at 06:35 and
fifteen fixers from 06:55. The long line at the end is the ship agent, 32 minutes, most of it
rendering. It rendered twice. The publish script refused the first copy because the course's
lesson plan had been updated after the render, which changed how section 02 draws the map. So
the lesson was rendered again with no new narration.

Two reviewers watch the rendered lesson, one for craft and one for teaching. The first round's
render ran 733.5 seconds, 12.2 minutes, over the course's 11.5-minute limit.

<ao-bars max="24" unit="findings">
<table>
<thead><tr><th>Review</th><th>Major</th><th>Minor</th><th>Polish</th></tr></thead>
<tbody>
<tr><td>Craft, round 1</td><td>5</td><td>9</td><td>5</td></tr>
<tr><td>Teaching, round 1</td><td>4</td><td>7</td><td>2</td></tr>
<tr><td>Craft, round 2</td><td>3</td><td>13</td><td>8</td></tr>
<tr><td>Teaching, round 2</td><td>1</td><td>8</td><td>9</td></tr>
</tbody>
</table>
<figcaption><b>Review findings by round</b><span class="ao-meta">craft looks at layout, crops and timing · teaching looks at what the lesson teaches · round 2 ran after the round 1 fixes</span></figcaption>
</ao-bars>

Round 2 found more problems than round 1, 42 against 32, but fewer major ones, 4 against 9.
They were the kind you only see once the big ones are gone: a screen recording zoomed until its
text ran off the frame, folder icons sitting on their own labels for about four minutes, a
five-row card on screen for two seconds. The script went from 1,608 spoken words to 1,516 and
the lesson came in at 11:18. A last agent looked at a still every three seconds, 227 of them,
and wrote "ship it".

</details>
