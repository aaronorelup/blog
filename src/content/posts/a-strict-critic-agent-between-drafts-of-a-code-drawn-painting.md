---
id: "AO-093"
title: "A strict critic agent between drafts of a code-drawn painting"
summary: "Experiment: four pictures drawn in code, each revised twice from a strict critic agent's notes or from the painter's own critique. Hypothesis: a strict critic makes the picture better. Models: Claude Opus 5.5. Look for: blind ranks."
date: 2026-11-25
topic: "agents"
draft: false
credits:
  owner: "Claude routine"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 medium"
  cost: 80.19
preview:
  verdict: "22 vs 8 first places"
  takeaway: "Across 4 pictures and 12 trials, 36 blind judge agents put the self-critiqued third draft first 22 times and the strict critic's third draft first 8 times."
  points:
    - "The critic's second drafts averaged 4.5 out of 10, below the first drafts' 5.6. Its third drafts got back to 5.6."
    - "The self-critiqued third drafts averaged 7.0. The critic route scored higher in 2 of the 12 trials, and tied in 2."
    - "The critic gave every picture it saw 3 to 5 out of 10, in both rounds."
  image: "/media/previews/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting.webp"
  alt: "Four first drafts drawn in code: an oil still life, a woodblock street at night, a watercolor lake and an Art Deco train poster"
---

My agents tested an idea from X: have one AI agent paint a picture in code, and put a second, strict critic agent between drafts to tell it what's wrong. They ran it against the plain version, where the painter looks at its own picture and critiques itself. Four different pictures, three trials each, two revision rounds each way, then 36 blind judge agents ranked the drafts. **The self-critiqued third draft was ranked first by 22 of 36 judges. The strict critic's third draft was ranked first by 8.** The critic's drafts averaged about the same as the first drafts they started from.

The first version of this post ran one scene three times and showed small pictures. I asked for four different pictures, each with its own style and subject, three trials each, a critic that is never the painter, and pictures readers can open at full size. This is that run. Every picture below opens at its full 1200 by 800 after you judge it.

The idea comes from [Madhu's post on X](https://x.com/madhugogineni97/status/2125552579996258403), where Claude Opus 5.5 painted the White Rann, the white salt desert in western India, in pure JavaScript, and Madhu wrote that it took 3 drafts and a strict critic. The post doesn't say how the critic worked. The technique as a template: have one agent make a draft, have a second agent that sees only the result and the brief score it and list what's wrong, then have the first agent revise from that list (optional: repeat). This is the critic prompt that ran, with this test's parts as placeholders:

```text
You are a strict art critic in an experiment. You are not the painter and you never write code. Read <the brief>, then look at <the rendered picture>. You judge the picture, not the code. Be strict and specific, like a demanding art director. Write a score from 1 to 10 against the brief, then at most 8 numbered notes, the most important first. Each note names the exact place in the picture, what is wrong, and what it should look like instead. Point out anything that reads as computer graphics rather than the style the brief asks for. No praise lines.
```

- **Same setup every time.** Each picture had one brief: a subject, a style and one 1200 by 800 canvas in plain JavaScript with no images. Each trial started from one first draft, then split into two routes of two revisions. Every painter, critic and judge was a separate Claude Opus 5.5 agent. The critic never wrote code and never saw the painter's notes.
- **The critic's first round made things worse.** Its second drafts averaged 4.5 out of 10 with the judges, below the first drafts' 5.6. Its third drafts got back to 5.6. The self-critique route went 6.3, then 7.0.
- **It depended on the picture.** On the woodblock print the critic's third draft was ranked above the self-critiqued one by 5 of 9 judges. On the watercolor it was 0 of 9, on the poster 1 of 9, on the still life 3 of 9.
- **By trial,** the self-critiqued third draft scored higher in 8 of 12 trials, the critic's in 2, and 2 were tied.
- **The critic never let up.** It gave every first draft 3 to 5 out of 10, and every second draft 3 to 5 again.

## The pictures

Each row is one trial: the shared first draft and the third draft of each route. Press Judge blind to pick your own before the labels come back. The judges' scores are their average out of 10, and the judges' pick is the best of these three by their scores.

### A Dutch still life in oil

A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table.

<ao-blind aspect="3/2">
<div data-row="Trial 1">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-d1.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, first draft, trial 1" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 4.3 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-a3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, self-critique, draft 3, trial 1" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 5.7 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t1-b3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, strict critic, draft 3, trial 1" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 4.0 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 2">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-d1.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, first draft, trial 2" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 5.0 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-a3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, self-critique, draft 3, trial 2" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 6.0 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t2-b3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, strict critic, draft 3, trial 2" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 5.0 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 3">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-d1.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, first draft, trial 3" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 3.0 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-a3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, self-critique, draft 3, trial 3" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 4.7 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/stilllife-t3-b3.webp" alt="A pewter jug, a half-peeled lemon, a glass of wine, walnuts and a napkin on a dark table, strict critic, draft 3, trial 3" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 6.7 of 10</span></figcaption></figure>
</div>
<figcaption><b>A Dutch still life in oil: three trials, each row from one shared first draft</b></figcaption>
</ao-blind>

### A Japanese woodblock print

A rainy night street with lanterns and a figure under an umbrella.

<ao-blind aspect="3/2">
<div data-row="Trial 1">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-d1.webp" alt="A rainy night street with lanterns and a figure under an umbrella, first draft, trial 1" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 6.0 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-a3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, self-critique, draft 3, trial 1" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t1-b3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, strict critic, draft 3, trial 1" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 5.3 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 2">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-d1.webp" alt="A rainy night street with lanterns and a figure under an umbrella, first draft, trial 2" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-a3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, self-critique, draft 3, trial 2" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t2-b3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, strict critic, draft 3, trial 2" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 3">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-d1.webp" alt="A rainy night street with lanterns and a figure under an umbrella, first draft, trial 3" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 5.7 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-a3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, self-critique, draft 3, trial 3" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/woodblock-t3-b3.webp" alt="A rainy night street with lanterns and a figure under an umbrella, strict critic, draft 3, trial 3" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 8.0 of 10</span></figcaption></figure>
</div>
<figcaption><b>A Japanese woodblock print: three trials, each row from one shared first draft</b></figcaption>
</ao-blind>

### A loose watercolor

A misty mountain lake at dawn with pines and a red canoe.

<ao-blind aspect="3/2">
<div data-row="Trial 1">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-d1.webp" alt="A misty mountain lake at dawn with pines and a red canoe, first draft, trial 1" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 5.7 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-a3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, self-critique, draft 3, trial 1" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 8.0 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t1-b3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, strict critic, draft 3, trial 1" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 6.0 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 2">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-d1.webp" alt="A misty mountain lake at dawn with pines and a red canoe, first draft, trial 2" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 6.0 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-a3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, self-critique, draft 3, trial 2" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t2-b3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, strict critic, draft 3, trial 2" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 3.7 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 3">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-d1.webp" alt="A misty mountain lake at dawn with pines and a red canoe, first draft, trial 3" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 5.0 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-a3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, self-critique, draft 3, trial 3" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/watercolor-t3-b3.webp" alt="A misty mountain lake at dawn with pines and a red canoe, strict critic, draft 3, trial 3" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 4.0 of 10</span></figcaption></figure>
</div>
<figcaption><b>A loose watercolor: three trials, each row from one shared first draft</b></figcaption>
</ao-blind>

### A 1930s Art Deco poster

A steam train on a stone viaduct at sunset.

<ao-blind aspect="3/2">
<div data-row="Trial 1">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-d1.webp" alt="A steam train on a stone viaduct at sunset, first draft, trial 1" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 6.7 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-a3.webp" alt="A steam train on a stone viaduct at sunset, self-critique, draft 3, trial 1" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t1-b3.webp" alt="A steam train on a stone viaduct at sunset, strict critic, draft 3, trial 1" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 7.3 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 2">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-d1.webp" alt="A steam train on a stone viaduct at sunset, first draft, trial 2" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 6.0 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-a3.webp" alt="A steam train on a stone viaduct at sunset, self-critique, draft 3, trial 2" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 8.0 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t2-b3.webp" alt="A steam train on a stone viaduct at sunset, strict critic, draft 3, trial 2" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 4.7 of 10</span></figcaption></figure>
</div>
<div data-row="Trial 3">
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-d1.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-d1.webp" alt="A steam train on a stone viaduct at sunset, first draft, trial 3" loading="lazy"><figcaption><b>First draft</b><span class="ao-meta">judges 6.3 of 10</span></figcaption></figure>
<figure data-verdict="Judges' pick"><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-a3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-a3.webp" alt="A steam train on a stone viaduct at sunset, self-critique, draft 3, trial 3" loading="lazy"><figcaption><b>Self-critique, draft 3</b><span class="ao-meta">judges 8.0 of 10</span></figcaption></figure>
<figure><img src="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-b3.webp" data-full="/media/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/poster-t3-b3.webp" alt="A steam train on a stone viaduct at sunset, strict critic, draft 3, trial 3" loading="lazy"><figcaption><b>Strict critic, draft 3</b><span class="ao-meta">judges 4.7 of 10</span></figcaption></figure>
</div>
<figcaption><b>A 1930s Art Deco poster: three trials, each row from one shared first draft</b></figcaption>
</ao-blind>

## How it ran

Each judge was a fresh agent that saw the five drafts of one trial under shuffled letters, plus the brief, and nothing else. It scored each one from 1 to 10 for how well it met the brief and read as the style asked for, then ranked all five. Three judges per trial, 36 in all. No person judged. Each painter got one look at each new draft to check it rendered, and no extra rounds. The whole run took about 18 minutes with 96 agents, at most 20 at a time.

<details><summary>Every judge's scores, per trial</summary>

Scores out of 10 from the three judges of each trial. Critic scores are the critic's own scores of the first draft and of its route's second draft.

| Picture | Trial | First draft | Self 2 | Self 3 | Critic 2 | Critic 3 | Critic scores |
|---|---|---|---|---|---|---|---|
| Still life | 1 | 5 5 3 | 6 6 6 | 6 6 5 | 3 3 3 | 4 4 4 | 4, 3 |
| Still life | 2 | 5 5 5 | 6 6 6 | 6 6 6 | 3 3 3 | 5 5 5 | 3, 3 |
| Still life | 3 | 3 3 3 | 4 4 4 | 4 5 5 | 5 5 6 | 6 7 7 | 3, 4 |
| Woodblock | 1 | 6 6 6 | 8 7 7 | 7 7 8 | 4 4 4 | 5 6 5 | 4, 4 |
| Woodblock | 2 | 8 7 7 | 6 5 6 | 7 7 8 | 5 6 5 | 7 8 7 | 5, 4 |
| Woodblock | 3 | 5 6 6 | 7 6 5 | 8 7 7 | 6 5 6 | 8 8 8 | 5, 5 |
| Watercolor | 1 | 5 6 6 | 7 7 8 | 8 8 8 | 3 4 4 | 6 5 7 | 4, 4 |
| Watercolor | 2 | 6 6 6 | 6 7 6 | 7 8 7 | 5 5 5 | 3 4 4 | 4, 5 |
| Watercolor | 3 | 5 5 5 | 6 7 6 | 7 8 7 | 3 3 3 | 4 4 4 | 4, 3 |
| Poster | 1 | 7 6 7 | 7 7 6 | 6 8 8 | 5 5 4 | 8 7 7 | 5, 4 |
| Poster | 2 | 6 6 6 | 7 7 7 | 8 8 8 | 6 5 4 | 5 4 5 | 5, 4 |
| Poster | 3 | 6 6 7 | 7 7 6 | 8 8 8 | 6 7 7 | 5 5 4 | 5, 4 |

Means over all 36 judges: first drafts 5.58, self-critique 6.28 then 7.03, strict critic 4.53 then 5.56. First places: self-critique draft 3 got 22, critic draft 3 got 8, self-critique draft 2 got 5, a first draft got 1, critic draft 2 got none.

</details>

*My agents picked this idea, ran the test and wrote it up.*
