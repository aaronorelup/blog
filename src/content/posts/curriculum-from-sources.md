---
id: "AO-046"
title: "Rebuilding my beginner AI course from 251 sources"
summary: "My course's lesson plan came from Claude's own idea of what beginners need, and it was out of date. I had 76 agents rebuild the course from 251 outside sources, most from 2026. What changed and what got cut."
date: 2026-10-12
status: "shipped"
tags: ["claude-code", "agents", "research", "lessons", "workflow"]
series: ["hidden-curriculum", "agent-runs"]
topic: "learning"
project: ["hidden-curriculum"]
preview:
  verdict: "214 planned, 36 in draft"
  takeaway: "Research keeps a lesson's facts current, but only recent outside sources tell you whether the topic is still worth teaching."
  points:
    - "The command line, programming languages and concurrency are gone. A module on making an app safe for strangers is new."
    - "A skeptic check retired a lesson idea that told beginners to read shell commands before approving a delete."
    - "The old plan still had a debugger lesson eight days after I told Claude I don't debug anymore."
  image: "/media/previews/curriculum-from-sources.webp"
  alt: "The Hidden Curriculum's course page as it stood on 12 October, showing 214 lessons in 22 modules and 6 districts"
---

My video course, [The Hidden Curriculum](/courses/the-hidden-curriculum/), covers the small
gaps that stop people from building with AI. My agents (Claude sessions that work on their own)
have published a lesson of it most days since 30 September. Its plan of 214 lessons came from
Claude's own idea of what a beginner needs, and that idea was out of date. So I had 76 agents
rebuild the course from 251 sources, most of them other people's work from this year, and
**the new draft has 36 lessons instead of 214.**

**Research keeps a lesson's facts current, but only recent outside sources tell you whether the
topic is still worth teaching.** I learned that from
[the two lessons I sent back](/ledger/lessons-sent-back/), and it's most of what I typed to
Claude that night:

> The main issue is that you can research a topic, but if you don't know what the topic itself
> should be, it is still out dated.

The one lesson that had worked was
[a set of videos explaining ideas by the writer janus](/ledger/loom-and-information-flow/). It
was built on someone else's hard work, and we only had to deliver it. So I asked Claude to build
the whole course that way, from courses and essays that already say what people are missing,
leaning hard toward what's new.

- **The command line is gone**, all eight lessons on typing commands into a terminal. So are
  programming languages, concurrency (running many things at once) and 13 lessons on what's
  inside a computer.
- **A module on making an app safe for strangers is new.**
- **The old plan still had a debugger lesson** eight days after I told Claude I don't debug
  anymore.
- **A skeptic check retired a lesson idea** that told beginners to read the exact command before
  approving a delete.
- **145 of the 251 sources are from July 2026 or later.**

## 214 lessons against 36

Both charts use the same scale. A full bar is 17 lessons.

<ao-bars max="17" unit="lessons">
<table>
<thead><tr><th>Module, 11 Oct</th><th>Lessons</th></tr></thead>
<tbody>
<tr><td>00 Orientation</td><td>6</td></tr>
<tr><td>01 Your computer, under the hood</td><td>13</td></tr>
<tr><td>02 The command line</td><td>8</td></tr>
<tr><td>03 Development environments</td><td>10</td></tr>
<tr><td>04 Programming languages</td><td>7</td></tr>
<tr><td>05 Python and JavaScript packages</td><td>9</td></tr>
<tr><td>06 Data and databases</td><td>7</td></tr>
<tr><td>07 Concurrency</td><td>7</td></tr>
<tr><td>08 Git, GitHub and agents on git</td><td>12</td></tr>
<tr><td>09 Networking and the internet</td><td>9</td></tr>
<tr><td>10 APIs, webhooks and MCP</td><td>16</td></tr>
<tr><td>11 Websites and hosting</td><td>9</td></tr>
<tr><td>12 Cloudflare and the edge</td><td>5</td></tr>
<tr><td>13 Containers, servers and the cloud</td><td>7</td></tr>
<tr><td>14 Identity, authentication and keys</td><td>13</td></tr>
<tr><td>15 Personal security and secrets</td><td>17</td></tr>
<tr><td>16 Running things without you</td><td>13</td></tr>
<tr><td>17 What an application is</td><td>11</td></tr>
<tr><td>18 Phones, app stores and devices</td><td>17</td></tr>
<tr><td>19 Payments, users and selling</td><td>7</td></tr>
<tr><td>20 Licenses and legal</td><td>7</td></tr>
<tr><td>21 Capstone</td><td>4</td></tr>
</tbody>
</table>
<figcaption><b>Before: Claude's plan, 214 lessons in 22 modules</b><span class="ao-meta">The course plan on 11 Oct 2026, kept as it was. 12 of these lessons had been published.</span></figcaption>
</ao-bars>

<ao-bars max="17" unit="lessons">
<table>
<thead><tr><th>Module, 12 Oct draft</th><th>Lessons</th></tr></thead>
<tbody>
<tr><td>00 Orientation</td><td>3</td></tr>
<tr><td>01 Your workbench</td><td>3</td></tr>
<tr><td>02 Your first build</td><td>4</td></tr>
<tr><td>03 Putting it online</td><td>3</td></tr>
<tr><td>04 Safe for strangers</td><td>4</td></tr>
<tr><td>05 What the agent sees</td><td>3</td></tr>
<tr><td>06 Scaling up</td><td>3</td></tr>
<tr><td>07 Reach and trust</td><td>4</td></tr>
<tr><td>08 Unattended work</td><td>3</td></tr>
<tr><td>09 Facts, media, rights</td><td>4</td></tr>
<tr><td>10 Capstone</td><td>2</td></tr>
</tbody>
</table>
<figcaption><b>After: the draft built from sources, 36 lessons in 11 modules</b><span class="ao-meta">The draft plan, 12 Oct 2026. 33 lessons to make, and 3 spots filled for now by lessons already published.</span></figcaption>
</ao-bars>

What vanished is what a beginner needed in 2021. What grew is what happens after your thing
works. The new "Safe for strangers" module sits between putting it online and letting other
people use it, with lessons like "Working is not secure" and "Test it as a stranger".

A debugger is a tool for pausing code and stepping through it line by line. I'd fixed the one
lesson I sent back for teaching debugging, but the other 213 in the plan were never
re-read with the same question:

| | Lesson | Key idea |
|---|---|---|
| Old 03.05, 11 Oct | The debugger | Breakpoints and stepping instead of print() everywhere |
| Draft 02.03, 12 Oct | When it breaks, you supply the eyes | The agent reads errors, adds logging and re-runs until it's fixed, but only on what it can run or see. Your part is a reliable way to make it happen again, what correct looks like, and a way for the agent to see the real result |

## What the course is built on now

The biggest groups are the AI tools' own docs, essays by people who build with AI, and write-ups
of things that went wrong.

<ao-bars unit="sources">
<table>
<thead><tr><th>Kind</th><th>Sources</th></tr></thead>
<tbody>
<tr><td>Tool docs</td><td>72</td></tr>
<tr><td>Practitioner essays</td><td>29</td></tr>
<tr><td>Incident write-ups</td><td>25</td></tr>
<tr><td>My ledger and transcripts</td><td>19</td></tr>
<tr><td>Reports</td><td>19</td></tr>
<tr><td>Papers</td><td>15</td></tr>
<tr><td>Real questions and threads</td><td>15</td></tr>
<tr><td>Courses</td><td>14</td></tr>
<tr><td>Terms of service</td><td>9</td></tr>
<tr><td>Law</td><td>8</td></tr>
<tr><td>News</td><td>7</td></tr>
<tr><td>Surveys</td><td>6</td></tr>
<tr><td>Frameworks, lists, a syllabus, a talk</td><td>13</td></tr>
</tbody>
</table>
<figcaption><b>The 251 sources the draft cites, by kind</b><span class="ao-meta">Counted from the course's source list, 12 Oct 2026</span></figcaption>
</ao-bars>

<ao-bars unit="sources">
<table>
<thead><tr><th>Dated</th><th>Sources</th></tr></thead>
<tbody>
<tr><td>Jul–Oct 2026</td><td>145</td></tr>
<tr><td>Jan–Jun 2026</td><td>52</td></tr>
<tr><td>Before 2026</td><td>15</td></tr>
<tr><td>No date (live docs, terms, law)</td><td>39</td></tr>
</tbody>
</table>
<figcaption><b>When they were written</b><span class="ao-meta">197 are dated 2026, 145 of them July or later. The 15 older ones each say why they still hold.</span></figcaption>
</ao-bars>

<details><summary>The first source, and the 19 that are mine</summary>

The first source on the list is a Stanford syllabus for the Fall 2026 term, next to its Fall 2025
version. What it dropped (debugging by hand, power prompting, how a language model is made) is
evidence on its own.

Nineteen sources are mine, posts on this blog and prompts from my sessions. The source list says
plainly that Claude drafted many of those posts from my transcripts. So the facts are first-hand
and the framing is Claude's.

</details>

## The skeptic check caught the same mistake again

A round of skeptic agents attacked every lesson idea and came back with 40 findings. This round
was called the challenge pass. The most useful finding came from one question it asks of
every job given to the human: does the agent just do this now? That caught the debugging mistake
again in a new place. One idea told the learner to read the exact command before approving anything
destructive. But the sources say people approve about 93% of the permission prompts they see, and
one from Anthropic says a non-technical user shouldn't be expected to judge shell commands (the
raw commands the agent types) at all. So it was retired and rewritten:

<ao-diff labels="Before the challenge pass|After">
<blockquote>Commands run as you: read the literal command before anything destructive</blockquote>
<blockquote>Deletes run as you: make the dangerous ones impossible, and check targets, not syntax</blockquote>
<figcaption><b>The delete lesson idea's title, 12 Oct 2026</b><span class="ao-meta">The old text, the reason and the replacement are all kept in the course's list of retired ideas.</span></figcaption>
</ao-diff>

<details><summary>The other ideas the skeptics sent back</summary>

A few more went the same way. Each one handed the human a programming job my audience can't do,
like writing the security tests yourself or reading the agent's code changes for cheats. The new
versions give the reading to the agent or a scanner. The human keeps what no machine checks:
which safety gates block, what the target is, and when to call in an expert. That last one became
its own idea. The lesson ideas carry 90 "bring in an expert" labels, and until the skeptic check
none of them said how.

</details>

## What the agents did

Claude paused the daily lesson job, then ran two workflows (scripts that run many agents in
steps) for 4 hours 15 minutes. 66 agents rebuilt the plan, and 10 rebuilt the tool that makes the
lessons so they can show real things happening on a computer.

Last, three agents each drew a course plan, and a judge agent kept the journey-first one,
79 points to 70 and 70. It counted ten security lessons in its pick. The merged plan took six
ideas from the other two, including a lesson of its own for "when it breaks".

<details><summary>The judge's scores on all nine criteria</summary>

<ao-bars max="10">
<table>
<thead><tr><th>Criterion</th><th>A, journey first</th><th>B, map first</th><th>C, risk first</th></tr></thead>
<tbody>
<tr><td>Covers the must and should concepts</td><td>10</td><td>8</td><td>7</td></tr>
<tr><td>Built on recent, credible sources</td><td>9</td><td>8</td><td>9</td></tr>
<tr><td>Nothing framed the pre-agent way</td><td>8</td><td>9</td><td>9</td></tr>
<tr><td>The human's role, security above all</td><td>9</td><td>7</td><td>9</td></tr>
<tr><td>A clear map, prerequisites first</td><td>9</td><td>7</td><td>6</td></tr>
<tr><td>For anyone building, not only web developers</td><td>8</td><td>6</td><td>8</td></tr>
<tr><td>A month's worth of dense lessons</td><td>9</td><td>8</td><td>9</td></tr>
<tr><td>Existing lessons placed sensibly</td><td>8</td><td>9</td><td>5</td></tr>
<tr><td>Titles a beginner would want to watch</td><td>9</td><td>8</td><td>8</td></tr>
</tbody>
</table>
<figcaption><b>The judge agent's scores, out of 10</b><span class="ao-meta">Its scores, not mine, 12 Oct 2026. Totals: A 79, B 70, C 70.</span></figcaption>
</ao-bars>

</details>

<details><summary>The four steps that rebuilt the plan</summary>

1. Thirteen searchers, one per angle: courses and syllabi, essays by people who build, write-ups
   of things that went wrong, security standards, questions people ask online, surveys, tool
   docs, uses that aren't coding, papers, how AI works now, talks, roadmaps, and my own blog and
   Claude Code history.
2. A curator picked 85 sources from 274 candidates. Writers turned them into 116 lesson ideas
   (135 after step 3), every point ending in the IDs of the sources it rests on, and added sources
   where a point was thin.
3. The skeptic check attacked the ideas from four angles. One of them asks, of every task given
   to the human, whether the agent just does this now.
4. Three agents drew three plans (journey first, map first, risk first). A judge scored them and
   merged the winner with six ideas from the other two.

Every agent was Claude Opus 5.5, and the run wrote 5.9 million tokens (the chunks
of text a model writes). The session hit its usage limit at 05:46 with the draft written but not
installed.

</details>

<details><summary>The test lesson that shows real computer actions</summary>

I also asked for lessons that show what doing the task really looks like, not only animations of
it. This is the test lesson from the rebuilt lesson tool. It was made that night and never
published. It's built on the old plan, so the course page in it still says 214 lessons. It has:

- a browser recording of the course's own page, with a drawn pointer and a camera that moves by
  itself
- a real terminal session replayed at its real speed, with the folder and user name changed to
  `you`
- a screenshot with a scripted click
- a 3D shot from Blender
- typing into a real docs search

<figure>
<video controls muted loop playsinline preload="metadata" poster="/media/curriculum-from-sources/capture-demo.webp" src="/media/curriculum-from-sources/capture-demo.mp4"></video>
<figcaption>The test lesson, 73 seconds, no narration. Recorded on 12 Oct 2026 with a browser-automation tool, a real Windows Command Prompt and Blender, and shrunk to 720p for this page.</figcaption>
</figure>

</details>

## What happened next

The same session installed the new plan on the afternoon of 12 October, and the first lesson built
on it came out on 14 October. It has [its own post](/ledger/first-lesson-on-the-new-map/).
