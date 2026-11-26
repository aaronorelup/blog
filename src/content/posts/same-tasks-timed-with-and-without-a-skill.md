---
id: "AO-096"
title: "Same tasks timed with and without a skill"
summary: "Four tasks on my blog, each given to two fresh AI agents: one read my blog-writing skill first, one never saw it."
date: 2026-11-26
topic: "agents"
draft: false
credits:
  owner: "Claude routine"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 medium"
  cost: 8.69
preview:
  verdict: "798 s vs 809 s"
  takeaway: "The agents with the skill took 798 seconds in all and the ones without took 809. All 8 results passed the blog's strict checker."
  points:
    - "Per task the gap went both ways: 218 vs 234, 180 vs 144, 161 vs 192 and 238 vs 239 seconds."
    - "With the skill the agents used 353,351 tokens and 57 tool calls. Without it, 319,948 tokens and 60 calls."
    - "The skill agent hosted the demo under /games/ as the skill says. The other put it under /labs/."
  image: "/media/previews/same-tasks-timed-with-and-without-a-skill.webp"
  alt: "Dot chart of seconds per blog task, with the skill then without: new post 218 and 234, fix a broken post 180 and 144, add a picture 161 and 192, host a demo 238 and 239"
---

My agents gave four tasks on this blog to eight fresh Claude agents, two per task. One of each pair read my blog-writing skill first. The other was told never to open it. **With the skill the four tasks took 798 seconds in all. Without it they took 809.** Per task the gap went both ways, and all 8 results passed the blog's strict checker with 0 errors and 0 warnings. One trial ran per task and arm.

![Dot chart of seconds per blog task, with the skill then without: new post 218 and 234, fix a broken post 180 and 144, add a picture 161 and 192, host a demo 238 and 239](/media/same-tasks-timed-with-and-without-a-skill/seconds-per-task.webp)

The idea comes from an X post by [Anton Martyniuk](https://x.com/AntonMartyniuk/status/2125570344589087215). He ran the same four .NET coding tasks twice and says they took 2.9 minutes with his Claude skills and 13.2 minutes without them.

The technique as a template: give the same task to two fresh agents in identical copies of a project, tell one to read the skill first and the other not to open it, then time both and grade what they made with the same checker (optional: several tasks, more than one trial each).

**The rundown**

- **New post from a page of notes:** 218 seconds with the skill, 234 without.
- **Fix a broken draft** that the checker failed with 8 errors: 180 with, 144 without. The skill agent also drew a chart and a card picture. The other changed only the post.
- **Add a picture** to a post and make it the card picture: 161 with, 192 without.
- **Host a one-file dice demo** and write its post: 238 with, 239 without. The skill agent put it under /games/, where the skill says demos go. The other put it under /labs/.
- **Tokens:** 353,351 with the skill and 319,948 without. Tool calls: 57 and 60.

## How it ran

Each agent worked alone in its own copy of the blog, with no network and no commits. Both arms had the blog's own rule files, which already say most of what the skill says. The skill is my agents' short version of those rules plus the steps for publishing. The agents ran on Opus 5.5. All eight started at 11:57 UTC and the last one finished at 12:01.

Every agent also ran the blog's full build or its test suite on its own, unasked. The six that ran the tests spent 30 to 84 seconds of their time on it.

The transcripts show that no agent in the "without" arm opened the skill. They did see the general instructions every agent here gets, which name the skill but do not hold its text.

<details>
<summary>Per agent</summary>

| Task | Arm | Seconds | Tokens | Tool calls |
|---|---|---|---|---|
| New post from notes | with | 218 | 88,831 | 12 |
| New post from notes | without | 234 | 84,294 | 13 |
| Fix a broken post | with | 180 | 91,136 | 13 |
| Fix a broken post | without | 144 | 74,494 | 12 |
| Add a picture | with | 161 | 78,654 | 11 |
| Add a picture | without | 192 | 69,824 | 13 |
| Host a demo | with | 238 | 94,730 | 21 |
| Host a demo | without | 239 | 91,336 | 22 |

Tokens are the totals the agent tool reports for each agent.

</details>

*My agents picked this idea, ran the test and wrote it up.*
