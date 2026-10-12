---
id: "AO-046"
title: "My course was built on Claude's guess of what to teach. Rebuilt from 251 sources, 214 lessons became 36"
summary: "I told Claude its sense of what my course should teach was out of date, and asked it to find the course in other people's work instead. Four hours and 76 agents later there is a draft of 36 lessons, every one citing dated sources, and a pass that caught one more lesson teaching a job the agent now does."
date: 2026-10-12
status: "in-progress"
tags: ["claude-code", "agents", "research", "lessons", "workflow"]
series: ["hidden-curriculum", "agent-runs"]
preview:
  verdict: "214 guesses, 36 sourced"
  takeaway: "Research makes a lesson's facts current; only outside sources tell you whether the topic is. Rebuilt from 251 of them, the course shrank by six-sevenths."
  points:
    - "Gone: the command line, programming languages, concurrency. Added: a whole module between your first URL and strangers."
    - "The old map still had \"The debugger\" eight days after I said I no longer debug."
    - "A skeptic pass found the course still telling beginners to read shell syntax before approving a delete. Retired."
  image: "/media/previews/curriculum-from-sources.webp"
  alt: "The Hidden Curriculum's course page as it stood on 12 October, showing 214 lessons in 22 modules and 6 districts"
---

Late on Sunday night I told Claude the thing two rejected lessons had been telling me for a week:
its idea of what my course should teach is wrong. The course is The Hidden Curriculum, the small
gaps that stop people from building with AI, and since 30 September agents have published a
lesson of it most days. The curriculum under those lessons, 214 rows on 11 October, came from
Claude's own sense of what a beginner needs. Four hours and 76 agents later there is a draft of
36 lessons, and every one names the dated sources it is built on.

**Research can make a lesson's facts current. It can't tell you the topic is out of date. For
that you need other people's lists of what they had to learn, and they have to be recent.**

That is the lesson I took from [the two lessons I sent back](/ledger/lessons-sent-back/), and
it's most of what I typed at 01:32:

> The main issue is that you can research a topic, but if you don't know what the topic itself
> should be, it is still out dated.

I pointed at the one lesson that had worked, [the Loom lesson](/ledger/loom-and-information-flow/),
because it was built on someone else's hard work and we only had to deliver it. And I asked for
the same thing for the whole course: find the courses, essays and sources that already say what
people are missing, bias hard toward what's new, and build the curriculum around them.

## What ran

The session paused the daily lesson job first (it would have built lesson 01.07 from the old
map at 05:36), then started two workflows. The bigger one, 66 agents, did the curriculum:

1. Thirteen searchers, one per angle: courses and syllabi, practitioner essays, incident
   write-ups, security standards, community questions, surveys, tool docs, non-coding uses,
   papers, how AI works now, talks, roadmaps, and my own ledger and Claude Code history.
2. A curator picked 85 sources from 274 candidates. Concept writers turned them into 116
   concepts (135 after step 3), each point ending in the source IDs it rests on, and added
   sources where a point was thin.
3. A challenge pass attacked the concepts through four lenses. One of them asks, of every task
   given to the human: does the agent just do this now?
4. Three architects drew three curricula (journey first, map first, risk first), and a judge
   scored them and merged the winner with six ideas from the other two.

The other workflow, 10 agents, rebuilt the lesson engine so the course map is data that every
lesson re-renders from, and taught it to show real things being done on a computer. Its test
render is at the bottom.

The run took 4 hours 15 minutes and 5.9 million output tokens, all Opus 5.5.

## Where the sources came from

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
<figcaption><b>The 251 sources the draft cites, by kind</b><span class="ao-meta">counted from the Kind field of each entry in curriculum/sources.md, 12 Oct 2026</span></figcaption>
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
<figcaption><b>When they were written</b><span class="ao-meta">the file's own count: 197 dated 2026, 145 of them July or later; the 15 older ones each say why they still hold</span></figcaption>
</ao-bars>

The first source on the list is a Stanford syllabus whose Fall 2026 term started on 22 September,
compared with its Fall 2025 version; what it dropped (hand-debugging, power prompting, how an LLM
is made) is evidence on its own. Nineteen sources are mine: posts on this ledger and prompts from
my sessions. The source file says plainly that many of those posts were drafted by Claude from my
transcripts, so the facts are first-hand and the framing is Claude's.

## 214 rows, 36 rows

Same scale on both charts: a full bar is 17 lessons.

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
<figcaption><b>Before: Claude's curriculum, 214 lessons in 22 modules</b><span class="ao-meta">curriculum.md as of 11 Oct 2026, kept as research/old-curriculum-2026-10-11.md; 12 of them published</span></figcaption>
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
<figcaption><b>After: the source-built draft, 36 lessons in 11 modules</b><span class="ao-meta">curriculum/curriculum-draft.md, 12 Oct 2026; 33 to make, 3 slots covered for now by lessons already published</span></figcaption>
</ao-bars>

The modules that vanished are the ones a 2021 beginner needed: the command line (eight lessons,
from "terminal vs console vs shell" to "reading errors without panic"), programming languages,
concurrency, and thirteen lessons on what's inside a computer. What grew is what happens after
the thing works. The draft puts a whole module between your first public URL and letting
strangers use it: "Working is not secure", "Test it as a stranger", "Your app's AI feature" and
"Before you ship: who signs off". The judge counted ten security lessons in its pick.

The old map also still had this row, eight days after I told Claude I don't debug anymore:

| | Lesson | Key idea |
|---|---|---|
| Old 03.05, 11 Oct | The debugger | Breakpoints and stepping instead of print() everywhere |
| Draft 02.03, 12 Oct | When it breaks, you supply the eyes | The agent reads errors, adds logging and re-runs until fixed, but only on what it can run or see; your part is a reliable reproduction, what correct looks like, and a way for it to observe the real result |

I had fixed one lesson. The 213 rows around it were never re-read with the same question.

## The skeptics found one more

The challenge pass returned 40 findings. The most useful came from the lens that asks whether the
human is being given a job the agent now does, and it caught the same mistake as debugging in a
different place. The concept about deletes, built from the incident reports, told the learner to
read the literal command and check the quoting before approving anything destructive. The
sources say people approve about 93% of prompts, and one, from Anthropic, says a non-technical user
shouldn't be expected to judge shell commands at all. So it was retired and rewritten:

<ao-diff labels="Before the challenge pass|After">
<blockquote>Commands run as you: read the literal command before anything destructive</blockquote>
<blockquote>Deletes run as you: make the dangerous ones impossible, and check targets, not syntax</blockquote>
<figcaption><b>Concept C097's title, 12 Oct 2026</b><span class="ao-meta">curriculum/concepts.md, "Retired concepts"; the old text, the reason and the replacement are kept, not deleted</span></figcaption>
</ao-diff>

Several more framings went the same way, each one handing the human a programming task the audience
can't do: write the security tests yourself, read the diff for cheats, read a skill's bundled
scripts, set up the linters. The new versions give the reading to the agent or a scanner and keep
for the human what no machine checks: which gates block, what the target is, when to call in an
expert. That last one became its own concept: the inventory now carries 90 "bring in an expert"
labels, and until the challenge pass none of them said how.

The judge scored the three designs on nine criteria and kept the journey-first one. These are
its scores, not mine:

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
<figcaption><b>The judge agent's scores, out of 10</b><span class="ao-meta">research/design-decision.md, 12 Oct 2026; totals A 79, B 70, C 70</span></figcaption>
</ao-bars>

Design A lost a point on exactly the debugging question: it folds "when it breaks" into other
lessons, where B and C each gave it a lesson of its own. The merged draft took that from them.

## Lessons that show the real thing

I also asked for lessons that show what doing the task actually looks like, not only animations
of it. This is the engine's test lesson, rendered at 05:34 and never published: a browser
recording of the course's own page with a drawn pointer and an automatic camera, a real terminal
session replayed at its real speed (the folder and user name rewritten to `you`), a screenshot
animated with a scripted click, a 3D shot from Blender, and typing into a real documentation
search.

<figure>
<video controls muted loop playsinline preload="metadata" poster="/media/curriculum-from-sources/capture-demo.webp" src="/media/curriculum-from-sources/capture-demo.mp4"></video>
<figcaption>The capture test lesson, 73 seconds, no narration. Recorded with Playwright, a real cmd session and Blender on 12 Oct 2026; re-encoded to 720p for this page.</figcaption>
</figure>

It is built on the old map. The course page in it still says 214 lessons, and the 3D map still
has The Machine and The Code as districts.

## Where it stopped

The session ran out of its usage window at 05:46 with the draft written and the install step not
done. The new map isn't in the course yet, nothing has been pushed to the course's new repository,
the daily lesson job is still paused, and nobody has reviewed the draft. Every lesson made
in the next month will probably be redone once we know what we want; I said as much in the
prompt.

The part I'm keeping regardless is the shape of the evidence. Every concept now ends in the IDs of
the pages it rests on, and the 15 sources older than this year each carry a note on why they still
hold. When a lesson goes stale, there is a dated page to check against, and that page isn't my
memory of how I worked last week, or Claude's memory of how people worked in 2021.
