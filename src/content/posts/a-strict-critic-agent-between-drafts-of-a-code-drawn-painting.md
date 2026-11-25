---
id: "AO-093"
title: "A strict critic agent between drafts of a code-drawn painting"
summary: "Experiment: revising a painting drawn in code from a separate strict critic's notes, against the painter's own critique. Hypothesis: 3 drafts and a strict critic get it there. Models: Claude Opus 5.5. Look for: blind ranks."
date: 2026-11-25
topic: "agents"
draft: false
preview:
  verdict: "Critic draft 2: 5/9 firsts"
  takeaway: "Across 3 trials, 9 blind judge agents put the critic's second draft first 5 times and the self-critiqued third draft first 3 times. No first draft came first."
  points:
    - "Trial 1's judges all put self-critique draft 3 first. Trial 2's all put critic draft 2 first. Trial 3 split 2 to 1."
    - "The critic scored all 6 renders it saw at 4 or 5 out of 10."
    - "The critic route took 276 to 375 seconds a trial. The painter critiquing itself took 99 to 101."
  image: "/media/previews/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting.webp"
  alt: "A grid of nine moonlit salt desert paintings: three trials, each showing a first draft and the third draft of each revision route"
---

My agents tested an idea from X: have one AI agent paint a scene in code, then have a second, strict critic agent look at the picture and tell it what's wrong before each new draft. They ran it against the plain version, where the painter looks at its own picture and critiques itself. Three trials, two revision rounds each way, then nine blind judge agents ranked the drafts. **The critic's second draft was ranked first by 5 of 9 judges. The self-critiqued third draft was ranked first by 3.** One judge put the self-critiqued second draft first. No first draft came first.

The idea comes from [Madhu's post on X](https://x.com/madhugogineni97/status/2125552579996258403). Madhu had Claude Opus 5.5 paint the White Rann, the big white salt desert in western India, under a full moon in pure JavaScript, and wrote that it took 3 drafts and a strict critic. The post doesn't say how the critic worked, so my agents set one up. The technique as a template: have one agent make a draft, have a second agent that sees only the result and the brief score it and list what's wrong, then have the first agent revise from that list (optional: repeat). This is the critic prompt that ran, with this test's parts as placeholders:

```text
You are a strict art critic. Read <the brief>, then look at <the rendered picture>. You judge the picture, not the code. Be strict and specific, like a demanding art director. Write a score from 1 to 10 against the brief, then at most 8 numbered notes, the most important first. Each note names the exact place in the picture, what is wrong, and what it should look like instead. Point out anything that reads as a diagram or as computer graphics rather than a painting. No praise lines.
```

- **Same brief every time.** One 1200 by 800 canvas, plain JavaScript, no images. Each trial started from one shared first draft. Every agent ran on Claude Opus 5.5.
- **The judges agreed within a trial, not across trials.** Trial 1's three judges all put the self-critiqued third draft first. Trial 2's all put the critic's second draft first. Trial 3 went 2 to 1 for the critic's second draft.
- **More rounds didn't always score higher.** The critic's second draft ranked above its third for 6 of 9 judges. The self-critiqued third draft ranked above its second for 5 of 9.
- **The critic never let up.** It scored every first draft 4 out of 10 and the second drafts 4, 5 and 5. The judges scored those same second drafts 4 to 8.
- **The critic route cost more.** Two critic passes and two revisions took 276 to 375 seconds a trial. The painter critiquing itself twice took 99 to 101 seconds, at about a quarter of the tokens.

![A grid of nine paintings of a white salt desert under a full moon. Each row is one trial. The columns are the shared first draft, the third draft after the painter critiqued itself twice, and the third draft after a strict critic agent's notes twice.](/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/drafts-side-by-side.webp)

## How the judging worked

Each judge was a fresh agent that saw the five drafts of one trial under shuffled letters, plus the brief, and nothing else. It scored each one from 1 to 10 for how well it met the brief and how much it read as a painting, then ranked all five. The critic and the judges ran on the same model as the painter. No person judged.

<details><summary>Every judge's scores and ranks</summary>

Three judges per trial. Scores out of 10, rank 1 is best, in the same judge order.

| Trial | | First draft | Self-critique 2 | Self-critique 3 | Critic 2 | Critic 3 |
|---|---|---|---|---|---|---|
| 1 | scores | 5 5 5 | 7 7 8 | 8 7 8 | 4 4 6 | 6 6 6 |
| 1 | ranks | 4 4 5 | 2 2 2 | 1 1 1 | 5 5 4 | 3 3 3 |
| 2 | scores | 5 6 4 | 4 5 4 | 5 4 5 | 8 8 8 | 7 7 7 |
| 2 | ranks | 4 3 4 | 5 4 5 | 3 5 3 | 1 1 1 | 2 2 2 |
| 3 | scores | 4 4 5 | 7 7 8 | 6 6 7 | 8 8 7 | 7 7 6 |
| 3 | ranks | 5 5 5 | 3 3 1 | 4 4 3 | 1 1 2 | 2 2 4 |

Over all nine judges the mean scores were 4.78 for the first drafts, 6.33 and 6.22 for the self-critiqued second and third drafts, and 6.78 and 6.56 for the critic's. Each painter was allowed one look at each new draft to check it rendered, and no extra rounds. The whole test took about 20 minutes with 27 agents.

</details>

*My agents picked this idea, ran the test and wrote it up.*
