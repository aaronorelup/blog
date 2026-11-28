---
id: "AO-096"
title: "Same tasks timed with and without a skill"
summary: "Three skills my agents use, one job each: a cost report, a small website and a video, to see if the skill makes the job faster or better."
date: 2026-11-26
topic: "agents"
draft: false
credits:
  owner: "Aaron"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5"
  cost: 93.16
preview:
  verdict: "Brand 8.8 vs 2.8 of 10"
  takeaway: "With the brand skill, blind judges scored brand match 8.8 of 10 against 2.8 without. With the video skills the video took 33 minutes against 17.5."
  points:
    - "The cost report took 4.7 minutes with its skill and 4.6 without. All 4 runs got all 22 agent rows right."
    - "AI judges who never saw the brand rules scored the sites without the skill 8.5 for readers and those with it 7.5."
    - "No judge found a data error in any video. Design scored 8.4 with the video skills and 8.2 without."
  image: "/media/previews/same-tasks-timed-with-and-without-a-skill.webp"
  alt: "Bar chart of minutes per task, mean of 2 runs, with the skill then without: cost report 4.7 and 4.6, small website 9.4 and 9.2, 45-second video 33.0 and 17.5"
---

Fresh Claude agents did one job for each of three skills my agents use, twice with the skill and twice without. **With the brand skill, blind judges scored brand match 8.8 of 10. Without it, 2.8. With the video skills the video took 33 minutes. Without them, 17.5, for about the same scores. The cost report took 4.7 minutes with its skill and 4.6 without, and every run got every agent row right.**

![Bar chart of minutes per task, mean of 2 runs, with the skill then without: cost report 4.7 and 4.6, small website 9.4 and 9.2, 45-second video 33.0 and 17.5](/media/same-tasks-timed-with-and-without-a-skill/minutes-per-task.webp)

A skill is a folder of instructions, sometimes with scripts, that an AI agent reads before a job. The first version of this post tested an X post that advertised the poster's own skills, and its jobs took under 4 minutes. My agents no longer test posts that sell the poster's own product. I asked for this instead: a few of the skills my agents use, on jobs that take about 15 minutes without them, and a check of whether each skill does what it says. Only the video job got there. The cost report took under 5 minutes without its skill and the website about 9.

The technique as a template: give the same job to two fresh agents in identical folders, tell one to read the skill first and the other never to open it, then time both and grade what they made with the same checks (optional: blind judges, more runs).

**The rundown**

- **The cost report took 4.7 minutes with agent-metrics and 4.6 without.** It holds a script that measures what each helper agent in a session cost. The job covered one session with 20 of them. All four reports matched an independent count on all 22 agent rows.
- **Blind judges scored brand match 8.8 of 10 with aaron-brand and 2.8 without.** It holds my Tea House look, its colours, three typefaces, ten visual rules and how I write. The job was a small site with ten generated pages, a light and dark switch and a social card. Every hex colour code on the skill sites came from my brand tokens. None on the others did.
- **AI judges who never saw the brand rules scored the other sites higher for readers, 8.5 against 7.5.** They flagged dim labels on all four, and on the brand sites also big empty areas and a fallback-looking body font.
- **The video took 33 minutes with the hyperframes skills and 17.5 without.** Its nine skills teach an agent HyperFrames, a tool that turns a web page into video. The job was a 45-second video with ten scenes and a bar chart, in wide and phone sizes.
- **The videos scored about the same.** All 8 met the size, 30 frames a second and 45.0 seconds asked for, and no judge found a wrong date, name or count. Content scored 9.7 with the skills and 10.0 without, legibility 8.6 and 8.3, design 8.4 and 8.2. All three video judges said the skill-made phone versions left the bottom third of the frame empty.

## How it ran

Every agent was Claude Opus 5.5 at extra-high effort, in its own folder on one cloud box with 4 processors, and both versions of a job started together. Their prompts differed in the agent's name and one line. "With" agents were told to read the skill and the files it points to, "without" agents never to open any skill, my agent kit or my blog's files. The transcripts show every "with" agent read its skill and no "without" agent opened one.

Without the skills, both video agents skipped HyperFrames and wrote their own page-to-video script, so the gap includes learning and running HyperFrames.

Nine blind judge agents scored the results from screenshots and frames, with the runs relabelled A to D in three orders. Three read the brand rules, three never saw them and three scored the videos. They saw each site only in the mode it opens in, night for the brand sites and light for the others.

<details>
<summary>What else differs from a clean test, and the per-agent numbers</summary>

- Two runs per version show a pattern, not a rate. Means are taken from unrounded times and scores. The video skill runs wrote about twice the output tokens.
- A first round with smaller jobs ran before this one and overlapped its first 12 minutes. Its runs without a skill took 2.5 to 3.4 minutes, so the jobs were made bigger: 20 helper agents instead of 8, a 12-page site instead of one page, and a 45-second video in two sizes instead of 15 seconds.
- All agents shared one scratch folder. Once, a "with" agent's script overwrote a "without" agent's script for the cost report. That agent noticed and rebuilt its files in its own folder.
- One brand run with the skill also read my blog's writing rules, which the brand skill points to.
- The "without" agents could still see each skill's one-line description in their list of tools. None opened a skill.
- The video skills send a new video to a workflow skill outside the set, and the prompt allowed only the set.
- The cost reports were graded on their per-agent rows. Their totals and charts were not graded.

| Job | Version | Minutes | Output tokens |
|---|---|---|---|
| Cost report | with | 4.4 | 27,816 |
| Cost report | with | 5.1 | 32,491 |
| Cost report | without | 4.5 | 27,971 |
| Cost report | without | 4.7 | 28,578 |
| Small website | with | 8.9 | 54,242 |
| Small website | with | 9.9 | 55,300 |
| Small website | without | 10.2 | 47,279 |
| Small website | without | 8.2 | 37,432 |
| 45-second video | with | 36.3 | 125,146 |
| 45-second video | with | 29.6 | 106,050 |
| 45-second video | without | 16.8 | 59,183 |
| 45-second video | without | 18.2 | 51,759 |

Brand match, mean of 3 judges per site: 8.8 and 8.8 with the skill, 3.0 and 2.7 without. Reader score: 7.5 and 7.5 with, 8.7 and 8.3 without.

</details>

*My agents ran the test and wrote it up.*
