---
id: "AO-050"
title: "The first lesson on my rebuilt course map took 71 agents, and the one reading as a beginner caught what it had backwards"
summary: "On 14 October the daily job made 01.02 Where your agent works, the first lesson from the course map rebuilt out of 251 sources. Four fact-checkers raised 27 findings; the two that touched the lesson's own question came from the one told to read as a beginner."
date: 2026-10-16
status: "shipped"
tags: ["claude-code", "agents", "lessons", "workflow"]
series: ["hidden-curriculum", "agent-runs"]
preview:
  verdict: "17 fixes before release"
  takeaway: "The checker reading as a beginner caught the script teaching that Claude Code on Local keeps your files at home, in a lesson about where your files go."
  points:
    - "71 Opus 5.5 agents, 2 h 40 min, $122 at API list prices, for one 11:18 lesson."
    - "Four checkers, 27 findings, 17 marked misleading. The fixer applied all 17."
    - "The first review render ran 12.2 min against an 11.5 ceiling; two rounds got it to 11:18."
  image: "/media/previews/first-lesson-on-the-new-map.webp"
  alt: "A frame from the lesson: a house labelled Your computer, a dotted line from its Code room to Anthropic's servers, and the words what it reads still goes to the model"
---

On 14 October at 05:37, the daily course job built the first lesson from the map I had rebuilt
two days earlier out of 251 outside sources. It is 01.02, Where your agent works: chat, Cowork,
desktop apps and terminal agents, which computer does the work, and where your files and chats
end up. Seventy-one Opus 5.5 agents made it in 2 hours 40 minutes, $122 at API list prices, and
it went live at 08:17 as an 11-minute video.

**The two corrections that mattered most came from the fact-checker told to read the script as
a beginner. The draft taught that Claude Code on Local keeps your files on your own machine,
which is the wrong answer to the question the lesson exists to answer.**

This follows [the night the course was rebuilt](/ledger/curriculum-from-sources/). That post
ended with a draft map and a paused job. The same session installed the map that afternoon, and
the job's first lesson on it is here, whole.

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
<figcaption><b>01.02 Where your agent works, as published</b><span class="ao-meta">14 Oct 2026 · 11:18, 15 sections · the course's own 720p copy, unchanged · ElevenLabs narration · Blender shot in section 10 · thumbnails taken from the video for this post</span></figcaption>
</ao-shots>

## How 71 agents split one lesson

The job runs one workflow in ten phases. Five agents read the five sources the narration may
name, four more pulled out the points the lesson's spec asks for, and one went looking for what
had changed since the map was written. A planner turned the spec into sections. Three writers
drafted the script from three angles at once, and a judge scored them (metaphor-first 85,
evidence-first 84, story-first 83, out of 100) and merged the winner with pieces of the other
two. Then four fact-checkers and a fixer, a narrator beside a screen-capture agent, a designer,
one animator per section, two reviewers for two rounds with a fixer per flagged section, and one
agent to render and ship.

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
<figcaption><b>Workflow wf_43993e8a, 14 Oct, Central time</b><span class="ao-meta">start and end = first and last event in each agent's own transcript · labels and phases from the run's journal · every agent Opus 5.5</span></figcaption>
</ao-runs>

The tall blocks are the fan-outs: fourteen animators at 06:35, fifteen fixers from 06:55. The
long line at the end is the ship agent, 32 minutes, most of it rendering. It rendered twice,
because the publish script refused the first copy: the curriculum had been synced after the
render, which changed how section 02 draws the map, so the lesson was rendered again with no
new narration.

## What the fact-checkers found

Each fact-checker gets the script and one lens. One checks every claim against the source it
cites, one checks the facts themselves, one checks whether anything is already out of date, and
one reads it as the beginner the course is for. Between them they raised 27 findings, each
marked misleading or nitpick. The 17 marked misleading went to a fixer, which applied all of
them and "didn't judge any of them wrong".

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
<figcaption><b>Fact-check findings by checker</b><span class="ao-meta">the four checkers' results in the run journal, 06:03–06:05 · fixer 06:05–06:09</span></figcaption>
</ao-bars>

The sources checker caught the script quoting Ethan Mollick's advice to use "at least High"
thinking as "a high thinking level", which turns his floor into a ceiling. The currency checker
found the billing line saying two ways to pay exist, without the part that catches people: a
saved API key, once approved, is billed instead of the plan.

The beginner checker found the two that sit on the lesson's own question. Section 06 told the
viewer that, with Cowork moved to the cloud, Anthropic points local work to Claude Code. Next to
section 07's "Local: your machine, full access", a beginner hears that Claude Code keeps their
files at home. It doesn't: the commands run on your machine, and whatever it reads goes to the
model on Anthropic's servers.

<ao-diff labels="Judge's script|Beginner checker's fix|Shipped">
<blockquote>For local-only work, Anthropic points you to Claude Code.</blockquote>
<blockquote>For work that runs on your own machine, Anthropic points you to Claude Code. Running locally isn't the same as staying local, though: whatever it reads still goes to the model on Anthropic's servers.</blockquote>
<blockquote>For local work, Anthropic points you to Claude Code. Running locally isn't staying local, though: what it reads still goes to Anthropic's servers.</blockquote>
<figcaption><b>Section 06, spoken text</b><span class="ao-meta">factcheck:beginner quote and fix, 14 Oct 06:05 · shipped script.md · cue markers removed</span></figcaption>
</ao-diff>

The other was the lesson's central picture. The script put the model inside your computer, a
worker who "can stand in any room". On every surface in the lesson the model runs in the
vendor's building, so the picture taught the wrong machine in the first minute.

<ao-diff labels="Judge's script|Shipped">
<blockquote>Picture one worker: the model. And your computer as a house of rooms. The worker can stand in any room; what changes is which of your shelves it reaches.</blockquote>
<blockquote>Picture one worker: the model. It always thinks in the vendor's building. And your computer is a house of rooms. The worker can reach any room; what changes is which shelves it can touch.</blockquote>
<figcaption><b>Section 03, spoken text</b><span class="ao-meta">factcheck:beginner quote, 14 Oct 06:05 · shipped script.md · cue markers removed</span></figcaption>
</ao-diff>

The words were fixed by 06:09. The drawing wasn't. At the first review, 06:55, the teaching
reviewer reported that section 03 still drew the model inside the Chat and Cowork rooms while
the narrator says it always thinks in the vendor's building. **The fix reached the script before
it reached the picture.** It took the review round's fixers to bring the two together.

## What the reviewers found

Two reviewers look at the rendered lesson, one for craft (layout, crops, timing) and one for
teaching. The first round's render ran 733.5 seconds, 12.2 minutes, over the course's
11.5-minute ceiling.

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
<figcaption><b>Review findings by round</b><span class="ao-meta">review:craft and review:teaching results · round 1 06:48–06:55, round 2 07:16–07:23</span></figcaption>
</ao-bars>

The second round found more problems than the first, 42 against 32, but fewer major ones, 4
against 9. They were the things you only see once the big ones are gone: a capture zoomed until
its text ran off the frame, folder icons sitting on their own labels for about four minutes, a
five-row card on screen for two seconds. The script went from 1,608 spoken words to 1,516 and
the lesson came in at 11:18. A last agent looked at a still every three seconds, 227 of them,
and wrote "ship it".

## What the new map put on screen

The rebuilt map asks each lesson to show the real thing where it can, so a capture agent
recorded screens before anyone animated them: Anthropic's help page on the 6 October change,
the desktop quickstart's list of environments, and one command run in two shells. Every product
fact on screen carries its date and "moves monthly".

<figure>
<img src="/media/first-lesson-on-the-new-map/shells.webp" alt="Command Prompt prints first and second for echo first && echo second; Windows PowerShell 5.1 rejects the same line: the token && is not a valid statement separator" loading="lazy">
<figcaption>Section 08 at 5:10. Both terminals are real runs in a demo folder, replayed by the
lesson engine: CMD runs the line, Windows PowerShell 5.1 refuses it.</figcaption>
</figure>

That 6 October change opens the lesson: Pro and Max users who had kept Cowork on their own
computer found new tasks running in the cloud, with no way back. It was eight days old when the
lesson was made. That morning the research agent checked what had changed since the map was
written and filed seven findings for other lessons. One of them carries a date: Anthropic's
Cowork changelog, in a beta entry, says the three-tab desktop app ends on 10 November for
organisations that haven't set one admin setting, so this lesson may need re-recording around
then.

A lesson about which computer does the work had to be stopped from naming the wrong computer,
and the agent that stopped it was the one asked to know nothing.
