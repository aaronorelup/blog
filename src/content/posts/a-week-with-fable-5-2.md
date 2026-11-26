---
id: "AO-084"
title: "A week of building with Claude Fable 5.2"
summary: "Recordings of the two pages Claude Fable 5.2 built for my site in its first week out, a 3D map of the AI industry and a painted tour of the site, with how each job ran and how its usage limit works."
date: 2026-11-18
topic: "agents"
draft: false
preview:
  verdict: "Two pages, neither finished"
  takeaway: "Fable 5.2 built a 3D AI landscape page and my tea room, a painted tour of my site, and neither is finished. The landscape job hit my Fable cap twice."
  points:
    - "Fable has its own weekly cap. Using all of it took about half my overall weekly cap."
    - "When Fable only handed work to cheaper models it was 2% of the cost. When it did the hard parts too, two thirds."
    - "The cloud computers, with no graphics card, crashed five times in one job while agents tested the page in a browser."
  image: "/media/previews/a-week-with-fable-5-2.webp"
  loop: "/media/previews/a-week-with-fable-5-2.mp4"
  alt: "Five stacks in company colours with a small character on top of each, standing behind the words AI LANDSCAPE"
---

Claude Fable 5.2 came out on 9 November. Anthropic says it's a step above Opus 5.5, its everyday model, and it costs twice as much per token. Last week, its first week out, I had it build the two biggest pages on my site: [a 3D page that maps the AI landscape](/ai-landscape/), and [the tea room](/tea/), a painted walk through everything here. **The AI landscape job ran for a week on seven messages from me and stopped twice on my Fable limit,** even with Opus 5.5 agents (AI workers it hands tasks to) writing half of its output.

My own take: I'm blown away by it, and I don't think most people will see why when they try it. On the normal tasks I'd give Opus 5.5, I think Fable does about the same. I think the difference only shows on a task that's extremely complex, and I don't think most people give their models tasks that hard.

- **The AI landscape page** came from one long request I dictated. Fable planned it and handed every job to other agents. It's live at its link but not in my site's lists, and its last two AI reviewers said it wasn't ready.
- **The tea room** ran on my other Claude account. It made three looks for the opening and I picked one.
- **The landscape job had Fable write 6.2 million tokens and Opus 5.5 write 6.3 million,** about $1,925 at Anthropic's pay-per-use prices. On my subscription, the real cost was my weekly limits.
- **A full Fable limit uses half of my weekly limit for all models.** Anthropic's help pages say so, but nothing in Claude Code told me. I found out by hitting it.
- **The computers slowed it down too.** The cloud computers my agents run on kept going down, most likely while agents checked the page in a browser.
- **It still needs me on open-ended problems,** like a project tracker for my own work.

## The AI landscape page

I asked for a page about Anthropic, OpenAI, Google, Meta and xAI that shows how each one's products stack up in layers, from the app you talk to down to the model and the computer it runs on, with as few words as possible. I dictated about 1,900 words, pointed it at [Shopify's Winter 2026 Editions page](https://www.shopify.com/editions/winter2026) as the bar for design, and asked it to do it all "on your own autonomously without me or any of my feedback".

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/landscape-desktop.webp" src="/media/a-week-with-fable-5-2/landscape-desktop.mp4"></video><figcaption>The AI landscape page on a laptop: the opening, the Anthropic, OpenAI and Google rooms, the line-up and the end.</figcaption></figure>

[Open the AI landscape page](/ai-landscape/). [How it was made](/ledger/making-the-ai-landscape-page/) has the whole job, from the request to the page going live. My [progress report from the first night](/ledger/progress-report-on-my-3d-ai-landscape-page/) covers the research and the three prototype designs it chose from.

<details><summary>How the job ran, step by step</summary>

- **Research.** Ten agents, one subject each.
- **A fact base.** 785 claims from 559 sources, each checked by an agent that didn't write it. 150 leads it couldn't confirm were left out.
- **The build.** One agent laid the foundation, six built the parts and one put them together. The hard jobs went to Fable agents and most of the rest to Opus 5.5, the way I asked. By the end the working copy had 135 saved changes (commits), the live page had about 10,700 lines of code, and Higgsfield, an AI image generator, had made 30 generations for its cut-paper art.
- **Three review rounds.** In round one all six AI reviewers said no, with 100 findings. Round two found 44 more and fixed 31. Round three was cut off by the Fable limit.

</details>

**Seven days, seven messages from me.** The times are mine, US Central.

<ao-timeline lanes="a:Me|f:Fable and its agents|l:My limits">
<ol>
<li data-lane="a"><time>Tue 3:26 pm</time><p>The request, about 1,900 words, dictated.</p></li>
<li data-lane="f"><time>Tue 3:34 pm</time><p>Ten research agents start, one subject each.</p></li>
<li data-lane="a"><time>Tue 7:22 pm</time><p><q>are you almost done?</q></p></li>
<li data-lane="f"><time>Tue 7:22 pm</time><p><q>No, roughly halfway, and the largest part (the build) hasn't started.</q></p></li>
<li data-lane="a"><time>Tue 7:23 pm</time><p><q>you are about to hit your weekly usage limit and need to get to a stopping point</q>, and could it write a progress post.</p></li>
<li data-lane="l"><time>Tue 7:24 pm</time><p>The all-models weekly limit reads 92%, most of it a second Fable job I had running at the same time, plus this one.</p></li>
<li data-lane="f"><time>Tue 7:37 pm</time><p>The progress post is live.</p></li>
<li data-lane="a"><time>Wed 9:45 pm</time><p>The weekly limit has started over. I tell it to continue, and to style each company with its own branding.</p></li>
<li data-lane="f"><time>Wed 11:35 pm</time><p>The fact base is done and one of the three designs is picked.</p></li>
<li data-lane="f"><time>Thu 1:02 pm</time><p>The whole page exists in its working copy. Review round one starts.</p></li>
<li data-lane="l"><time>Thu 6:13 pm</time><p>Fable limit hit, with the all-models limit at 75%. The Fable agents stop.</p></li>
<li data-lane="a"><time>Sun 9:35 pm</time><p>I've used a Fable reset, a one-time refill of the Fable limit. <q>make sure the working copy is live and give me the link</q></p></li>
<li data-lane="l"><time>Sun 9:36 pm</time><p>Fable 0%, all-models 25%.</p></li>
<li data-lane="f"><time>Sun 10:37 pm</time><p>Live at its link, not in the site's lists.</p></li>
<li data-lane="f"><time>Mon 10:36 am</time><p>Review round two done. A last design pass starts.</p></li>
<li data-lane="f"><time>Mon 4:55 to 7:31 pm</time><p>The cloud computer goes down four times.</p></li>
<li data-lane="l"><time>Mon 8:26 pm</time><p>Fable limit hit again, at 80% all-models. Every Fable agent stops.</p></li>
<li data-lane="f"><time>Mon 9:56 pm</time><p>The job stops after its two Opus reviewers finish.</p></li>
</ol>
</ao-timeline>

**Where it stands.** The last two AI reviewers both said no. One said it was close, with no wrong facts left. The other found a button in the "my stack" section, where the page shows the AI tools I use, that could make its plain-text version describe my setup wrong. 45 saved changes aren't live yet, and nothing has been checked on a real graphics card or phone.

| Model | Tokens written | At pay-per-use prices |
|---|---|---|
| Fable 5.2 | 6.24 million | $1,247 |
| Opus 5.5 | 6.25 million | $674 |
| Haiku 5.5 | 0.75 million | $3 |
| **Total** | **13.2 million** | **$1,925** |

Haiku 5.5, Anthropic's smallest model, ran the web searches. Fable wrote half the output and two thirds of the cost. The work ran in three stretches of 4, 21 and 24 hours, and the rest of the week it waited on my limits and on me.

<details><summary>The run stretch by stretch, and where the numbers come from</summary>

Running totals from the job's own usage counters (tokens written, then the pay-per-use price):

| When | Fable 5.2 | Opus 5.5 | Total |
|---|---|---|---|
| Tue night, the pause | 1.0 million, $125 | 3.3 million, $271 | $400 |
| Thu, first Fable limit | 3.9 million, $676 | 5.3 million, $499 | $1,179 |
| Mon, second Fable limit | 6.2 million, $1,247 | 6.3 million, $674 | $1,925 |

- Prices per million tokens: Fable 5.2 costs $8 to read and $40 to write, Opus 5.5 $4 and $20. Fable's cache writes cost twice Opus's too, but reading back from the cache costs the same for both.
- About four fifths of the total is that cache, where each agent keeps its conversation so far and reads it back every turn: 110 million tokens written to it and 3.2 billion read back. The tokens the models wrote are about a fifth.
- 12 batches of agents, 49.8 hours of agent time added up, and almost 10,000 actions like reading a file or running a command inside those batches.
- The fact base: 785 claims, 756 confirmed and 29 reported but not confirmed. The page's sources page lists all 559 sources.

</details>

## The tea room

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-walk.webp" src="/media/a-week-with-fable-5-2/tea-walk.mp4"></video><figcaption>Walking into the tea room: the garden, the door, Start here, then 20:00 in the TV chapter.</figcaption></figure>

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-chapters.webp" src="/media/a-week-with-fable-5-2/tea-chapters.mp4"></video><figcaption>Five of its chapters: film, games, art, agents and this website.</figcaption></figure>

[Walk through the tea room](/tea/). It's still a working copy.

I did this one on my other Claude account, with Fable 5.2 directing other agents, so I don't have its usage numbers. It first made three looks for the opening of the page (the garden, Start here and the TV chapter), and I picked the second.

<ao-compare cols="3" aspect="16/10">
<figure><img src="/media/a-week-with-fable-5-2/look-a.webp" alt="Look A: the Start here room in purple dusk light, with the chapter list on a torn paper slip at the left" loading="lazy"><figcaption><b>Look A, paper screens</b></figcaption></figure>
<figure><img src="/media/a-week-with-fable-5-2/look-b.webp" alt="Look B: a closer view of the room with a glowing lantern, a low table and a blue cushion under the words Start here" loading="lazy"><figcaption><b>Look B, the one I picked</b></figcaption></figure>
<figure><img src="/media/a-week-with-fable-5-2/look-c.webp" alt="Look C: the room behind a paper sheet with a cartoon portrait of me and a speech bubble saying hi" loading="lazy"><figcaption><b>Look C, evening broadcast</b></figcaption></figure>
</ao-compare>

<details><summary>What the tea room's code history shows</summary>

- **Every chapter after the TV one was built as its own demo first.** Eleven of them, with two tries for the games chapter, up to four built at once. Then each was brought into the page and polished in rounds of fixes.
- **New backgrounds came from Higgsfield,** an AI image generator, with the painted garden from the page's opening as the style reference every time. Most of what the chapters show is my existing work: 55 of my pictures, my game's arena and 3D models, my 3D toys.
- **About 245 saved changes in three and a half days,** 150 of them on one day.
- **The layout comes from Shopify's Editions page.** One world fixed behind the page, and chapters that each open on a giant word.
- **The three looks are still up:** [paper screens](/labs/tea-room/a/), [the walk through the house](/labs/tea-room/b/) and [the evening broadcast](/labs/tea-room/c/).

</details>

It still needs a ton of feedback. What I don't like, like the size of the cards and how the page flows, is what I couldn't picture ahead of time to tell it. Apart from picking the look and a few calls along the way, I let it run on its own, and it built for everything from a phone to a big flat screen, which was probably overkill and part of why it took so long. Next time I'd step in four times, which is fewer than I'd have guessed before trying it: after it mocks up the flow of the page, after each chapter's first version, after it puts them together, and at the end.

A lot of the time went to waiting on the computer. Its cloud computer had no graphics card, so it drew every painted layer on the main processor, which is slow at that. When I moved it to my own computer, which has a graphics card, the work went much faster.

My homepage, which I built in August mostly with Opus 5 (the model before Opus 5.5), took a ton of manual effort, and the tea room took almost none. Even its first examples for each chapter, made under Fable's direction, are things I don't think Opus 5.5 would have come up with on its own.

## Both pages on a phone

Both pages have their own phone layout. On the landscape page the 3D sits at the top and the words go in a sheet below it.

<ao-compare cols="2" aspect="390/664">
<figure><video controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/landscape-phone.webp" src="/media/a-week-with-fable-5-2/landscape-phone.mp4"></video><figcaption><b>The AI landscape page</b></figcaption></figure>
<figure><video controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-phone.webp" src="/media/a-week-with-fable-5-2/tea-phone.mp4"></video><figcaption><b>The tea room</b></figcaption></figure>
</ao-compare>

## How the Fable limit works

- **Fable has its own weekly limit inside the all-models one.** Anthropic's help pages say Fable can use up to 50% of the weekly limit, from the same pool as every other model. When a Fable reset gave my Fable limit back, the all-models limit dropped from 75% to 25%. When the Fable limit runs out, Fable agents stop and Opus agents keep going.
- **Resets** are one-time refills for when a limit runs out. Anthropic gave each of my accounts three Fable resets and two weekly resets, and I have about one of each left. A Fable reset gives back what Fable used. A weekly reset gives back everything, Fable included.
- **How much Fable you use depends on what you hand it.** In another job, testing tools for a guitar tab app, Fable only handed out the work and Opus and Sonnet 5.5 (another cheaper model) did all of it, so Fable came to about 2% of the cost. In the landscape job Fable agents also did the hard parts, and Fable was two thirds of the cost. That job used up my whole Fable limit in under a day, twice.
- **I haven't tried /advisor much yet.** It's a command in Claude Code, the app my agents run in, that keeps a cheaper model like Opus 5.5 doing the work and lets it ask Fable at key moments, like before it commits to a plan.

<ao-bars unit="%" max="100">
<table><thead><tr><th>Reading</th><th>Fable limit used</th><th>All-models limit used</th></tr></thead>
<tbody>
<tr><td>Wed 11:00 pm</td><td>8</td><td>14</td></tr>
<tr><td>Thu 6:31 am</td><td>63</td><td>50</td></tr>
<tr><td>Thu 1:02 pm</td><td>82</td><td>64</td></tr>
<tr><td>Thu 5:33 pm</td><td>98</td><td>73</td></tr>
<tr><td>Thu 6:13 pm, Fable stops</td><td>100</td><td>75</td></tr>
<tr><td>Sun 9:36 pm, after a Fable reset</td><td>0</td><td>25</td></tr>
<tr><td>Mon 10:18 am</td><td>48</td><td>54</td></tr>
<tr><td>Mon 4:05 pm</td><td>84</td><td>72</td></tr>
<tr><td>Mon 8:26 pm, Fable stops</td><td>100</td><td>80</td></tr>
</tbody></table>
<figcaption><b>My two weekly limits during the landscape job</b><span class="ao-meta">as Claude's usage-limit warnings reported them, for my whole account</span></figcaption>
</ao-bars>

## Where it still needs me

I wanted a project tracker app for all my projects, on my own dashboard. I explained every problem I had and hoped it would work out the tool I needed. It made a few versions and I didn't like any of them, so I'm giving it far more feedback than I expected. I think of this as divergent thinking: the space of possible answers is huge, and every decision changes the others. It's the same reason asking a model "how do I make money with AI?" gets you nowhere.

## The computers slowed it down

The landscape job's cloud computer went down five times, and the Claude that made this post went down twice, both times while it had a browser open recording the clips. On a computer with no graphics card, a browser drawing a 3D page uses every processor core it can get.

<details><summary>What I found out about agents and their computers</summary>

- **The landscape job's own best guess** was "a headless browser rendering the page with every CPU core busy". A headless browser is one with no screen, which agents use to look at the page.
- **It ran two agents at a time.** It told me "six builders working in parallel", but its records show two at once. Claude Code runs fewer agents at once on computers with fewer processor cores, and its cloud computers have about four.
- **What helps.** The tea room sped up on my own computer. One Claude can also start others in the cloud, each with its own computer. That works, but it's harder to follow from my end.

</details>

Fable 5.2 also directed two other jobs last week, both using far less Fable: 183 agents testing 575 tools a guitar tab web app could use, and a run of site fixes that also made four small browser games. Neither is listed on the site yet.

*Claude wrote this post from the landscape job's transcript, the site's code history, Anthropic's docs and my notes, and recorded the clips.*
