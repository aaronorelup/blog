---
id: "AO-084"
title: "A week of building with Claude Fable 5.2"
summary: "Short recordings of the two pages Claude Fable 5.2 built for my site in its first week out, a 3D map of the AI landscape and the tea room, with how each job ran, how much usage it took and how the Fable limit works."
date: 2026-11-18
topic: "agents"
draft: true
preview:
  verdict: "Two pages, two Fable limits"
  takeaway: "Fable 5.2 built a 3D AI landscape page and my tea room. The landscape job ran a week on seven messages from me and hit my Fable limit twice."
  points:
    - "A full Fable limit counts for about half the all-models one. It ran out with all-models at 75% and 80%."
    - "Fable that only directs came to 2% of a job's cost. With Fable agents doing the hard parts it was two thirds."
    - "Cloud machines with no graphics card kept going down under the agents' browsers, five times in one job."
  image: "/media/previews/a-week-with-fable-5-2.webp"
  loop: "/media/previews/a-week-with-fable-5-2.mp4"
  alt: "Five stacks in company colours with a small character on top of each, standing behind the words AI LANDSCAPE"
---

Claude Fable 5.2 is Anthropic's top model. It came out on 9 November, and this week I had it build the two biggest pages on my site: a 3D page that maps the AI landscape, and the tea room, a painted walk through everything here. **Below are short recordings of both and the links, so you can judge them yourself.** The AI landscape job ran for a week on seven messages from me and stopped twice on my Fable limit, even with Opus 5.5 agents writing half of its output.

My own take: it's the most impressive model I've used, and I don't think most people will see that when they try it. On the normal tasks I'd give Opus 5.5, I think Fable does about the same. The difference only shows on a task that's extremely complex, and most people don't give their models tasks that hard.

- **The AI landscape page** came from one long request I dictated. Fable planned and handed every job to other agents. It's live but unlisted, and its last two reviewers said it wasn't ready.
- **The tea room** ran on my other Claude account. It made three complete looks, I picked one, and every chapter was built as its own demo first.
- **The landscape job used 6.2 million output tokens on Fable and 6.3 million on Opus 5.5,** about $1,925 at API list prices. It ran on my subscription, so what it really cost was my weekly limits.
- **A full Fable limit counts for about half of the all-models limit.** Nothing told me that. I found out by hitting it.
- **The computers are the bottleneck now.** Cloud machines with no graphics card kept going down under the agents' browsers.
- **It still needs me on open-ended problems.** A project tracker for my own work went through a few versions and I didn't like any of them.

## The AI landscape page

I asked for a page about Anthropic, OpenAI, Google, Meta and xAI that shows how each one's products stack up in layers, from the app you talk to down to the model and the computer it runs on, with as few words as possible. I dictated about 1,900 words, pointed it at [Shopify's Winter 2026 Editions page](https://www.shopify.com/editions/winter2026) as the bar for design, and asked it to do it all "on your own autonomously without me or any of my feedback".

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/landscape-desktop.webp" src="/media/a-week-with-fable-5-2/landscape-desktop.mp4"></video><figcaption><b>The AI landscape page on a laptop</b><span class="ao-meta">the opening, the Anthropic, OpenAI and Google rooms, the line-up and the end</span></figcaption></figure>

[Open the AI landscape page](/ai-landscape/). It's unlisted for now, with a "Draft" label in the corner. My [progress report from the first night](/ledger/progress-report-on-my-3d-ai-landscape-page/) covers the research and the three prototype designs it chose from.

<details><summary>How the job ran, step by step</summary>

- **Research.** Ten agents, one subject each.
- **A fact base.** 785 claims from 559 sources, each checked by an agent that didn't write it. 150 leads it couldn't confirm were left out.
- **The build.** One agent laid the foundation, six built the parts and one put them together: 135 commits, about 10,700 lines of code and 30 cut-paper pictures made on Higgsfield, an image generator. The hard jobs went to Fable agents and most of the rest to Opus 5.5, the way I asked.
- **Three review rounds.** In round one all six reviewers said no, with 100 findings. Round two found 44 more and fixed 31. Round three was cut off by the Fable limit.

</details>

<ao-timeline lanes="a:Me|f:Fable and its agents|l:My limits">
<ol>
<li data-lane="a"><time>Tue 3:26 pm</time><p>The request, about 1,900 words, dictated.</p></li>
<li data-lane="f"><time>Tue 3:34 pm</time><p>Ten research agents start, one subject each.</p></li>
<li data-lane="a"><time>Tue 7:22 pm</time><p><q>are you almost done?</q></p></li>
<li data-lane="f"><time>Tue 7:22 pm</time><p><q>No, roughly halfway, and the largest part (the build) hasn't started.</q></p></li>
<li data-lane="a"><time>Tue 7:23 pm</time><p><q>you are about to hit your weekly usage limit and need to get to a stopping point</q>, and could it write a progress post.</p></li>
<li data-lane="l"><time>Tue 7:24 pm</time><p>The all-models weekly limit reads 92%, most of it this job and a second Fable session I had running.</p></li>
<li data-lane="f"><time>Tue 7:36 pm</time><p>The progress post is live.</p></li>
<li data-lane="a"><time>Wed 9:45 pm</time><p>After the weekly reset: continue, and style each company with its own branding.</p></li>
<li data-lane="f"><time>Wed 11:35 pm</time><p>The fact base is done and one of the three designs is picked.</p></li>
<li data-lane="f"><time>Thu 1:02 pm</time><p><q>The whole page now exists on the branch.</q> Review round one starts.</p></li>
<li data-lane="l"><time>Thu 6:13 pm</time><p>Fable limit hit, with the all-models limit at 75%. The Fable agents stop.</p></li>
<li data-lane="a"><time>Sun 9:35 pm</time><p>I've used a Fable reset. <q>make sure the working copy is live and give me the link</q></p></li>
<li data-lane="l"><time>Sun 9:36 pm</time><p>Fable 0%, all-models 25%.</p></li>
<li data-lane="f"><time>Sun 10:37 pm</time><p>Live, unlisted.</p></li>
<li data-lane="f"><time>Mon 10:36 am</time><p>Review round two done. A last design pass starts.</p></li>
<li data-lane="f"><time>Mon 4:55 to 7:31 pm</time><p>The cloud machine goes down four times.</p></li>
<li data-lane="l"><time>Mon 8:26 pm</time><p>Fable limit hit again, at 80% all-models. Every Fable agent stops.</p></li>
<li data-lane="f"><time>Mon 9:56 pm</time><p>The session stops after its two Opus reviewers finish.</p></li>
</ol>
<figcaption><b>Seven days, seven messages from me</b><span class="ao-meta">10 to 16 November, my time (US Central)</span></figcaption>
</ao-timeline>

**Where it stands.** The last two reviewers both said no. One said <q>Not yet. It is close: no wrong fact, nothing private, unlisted holds and every round-two major is fixed.</q> The other found that one control in the "my stack" section could make the text version of the page get my own setup wrong. The branch has 45 commits that aren't live yet, and nothing has been checked on a real graphics card or phone.

| Model | Output tokens | At API list prices |
|---|---|---|
| Fable 5.2 | 6.24 million | $1,247 |
| Opus 5.5 | 6.25 million | $674 |
| Haiku 5.5 | 0.75 million | $3 |
| **Total** | **13.2 million** | **$1,925** |

Fable wrote half the output and two thirds of the cost. It's twice the price per token. The work ran in three stretches of 4, 21 and 24 hours, and the rest of the week it waited on my limits.

<details><summary>The run stretch by stretch, and where the numbers come from</summary>

Running totals from the session's own usage counters (output tokens, then API list price):

| When | Fable 5.2 | Opus 5.5 | Total |
|---|---|---|---|
| Tue night, the pause | 1.0 million, $125 | 3.3 million, $271 | $400 |
| Thu, first Fable limit | 3.9 million, $676 | 5.3 million, $499 | $1,179 |
| Mon, second Fable limit | 6.2 million, $1,247 | 6.3 million, $674 | $1,925 |

- Prices per million tokens: Fable 5.2 $8 in and $40 out, Opus 5.5 $4 in and $20 out. About four fifths of the total is the cache, where each agent keeps its conversation so far and reads it back every turn: 110 million tokens written to it and 3.2 billion read back. The output is about a fifth.
- 12 workflow launches, 49.8 hours of workflow time added up, almost 10,000 tool calls.
- Haiku 5.5 ran the 229 web searches.
- 30 image generations on Higgsfield, still pictures only.
- The fact base: 785 claims, 756 confirmed and 29 reported but not confirmed. The page's sources page lists all 559 sources.

</details>

## The tea room

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-walk.webp" src="/media/a-week-with-fable-5-2/tea-walk.mp4"></video><figcaption><b>Walking into the tea room</b><span class="ao-meta">the garden, the door, Start here, then 20:00 in the TV chapter</span></figcaption></figure>

<figure><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-chapters.webp" src="/media/a-week-with-fable-5-2/tea-chapters.mp4"></video><figcaption><b>Five of its chapters</b><span class="ao-meta">film, games, art, agents and this website</span></figcaption></figure>

[Walk through the tea room](/tea/). It's still a working copy.

I did this one on my other Claude account with Fable 5.2 orchestrating, so I can't open its sessions from here. It made three complete looks for the page first, and I picked the second.

<ao-compare cols="3" aspect="16/10">
<figure><img src="/media/a-week-with-fable-5-2/look-a.webp" alt="Look A: a room of glowing paper screens with a chapter list on a paper slip" loading="lazy"><figcaption><b>Look A, paper screens</b></figcaption></figure>
<figure><img src="/media/a-week-with-fable-5-2/look-b.webp" alt="Look B: a painted night garden with a small tea house, stepping stones and a little television on the lawn" loading="lazy"><figcaption><b>Look B, the one I picked</b></figcaption></figure>
<figure><img src="/media/a-week-with-fable-5-2/look-c.webp" alt="Look C: a painted tea house at night with a small television on the lawn, a clock in the corner and a title card" loading="lazy"><figcaption><b>Look C, evening broadcast</b></figcaption></figure>
</ao-compare>

<details><summary>What the tea room's code history shows</summary>

- **Every chapter as its own demo.** Eleven of them, up to four built at once, then brought into the page in rounds that each fixed the three weakest things.
- **Art in my style.** New backgrounds came from Higgsfield with my painted garden as the style reference every time. Most of what the chapters show is my existing work: 55 of my pictures, my game's arena and models, my 3D toys.
- **About 245 commits in three and a half days,** 150 of them on one day.
- **The layout comes from Shopify's Editions page.** One world fixed behind the page, and chapters that each open on a giant word.
- **The three looks are still up:** [paper screens](/labs/tea-room/a/), [the walk through the house](/labs/tea-room/b/) and [the evening broadcast](/labs/tea-room/c/).

</details>

It still needs a ton of feedback. What I don't like, like the size of the cards and how the page flows, is what I couldn't picture ahead of time to tell it. I let it run in one go, and it built for everything from a phone to a flat screen TV, which was probably overkill and part of why it took so long. Next time I'd step in four times: after it mocks up the flow of the page, after each chapter's first version, after it puts them together, and at the end. Before this I'd have guessed it needed me much more often.

A lot of the time went to waiting on the computer. With no graphics card, in its own notes "every painted layer is composited on the CPU". On my own computer it sped up a lot.

When I built my homepage in August, mostly with Opus 5, it took a ton of manual effort. The tea room took almost none. Even its first examples for each chapter are things I don't think Opus 5.5 could have made. I don't think pages like this existed five years ago. You'd have needed a development team and an art team working together.

## Both pages on a phone

Both pages have their own phone layout. On the landscape page the 3D sits at the top and the words go in a sheet below it.

<ao-compare cols="2" aspect="9/19">
<figure><video controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/landscape-phone.webp" src="/media/a-week-with-fable-5-2/landscape-phone.mp4"></video><figcaption><b>The AI landscape page</b></figcaption></figure>
<figure><video controls muted loop playsinline preload="metadata" poster="/media/a-week-with-fable-5-2/tea-phone.webp" src="/media/a-week-with-fable-5-2/tea-phone.mp4"></video><figcaption><b>The tea room</b></figcaption></figure>
</ao-compare>

## How the Fable limit works

- **Fable has its own weekly limit on top of the all-models one.** Anthropic's help pages say that much. When it runs out, Fable agents stop and Opus agents keep going.
- **A full Fable limit counts for about half of the all-models limit.** Both times Fable hit 100%, the all-models limit read 75% and 80%.
- **Resets.** Each of my accounts got three Fable resets and two weekly resets, and I have about one of each left. A Fable reset gives back the whole Fable limit and half of the all-models one. A weekly reset gives back the whole Fable limit too. After the Fable reset I used, Fable went from 100% to 0 and all-models from 75% to 25%.
- **How much Fable you use depends on what you hand it.** In my guitar tab job Fable only directed, and Opus and Sonnet agents did all the work, so Fable came to about 2% of the cost. In the landscape job Fable agents also did the hard parts, and Fable was two thirds of the cost. That job used up my whole Fable limit in under a day, twice.
- **I haven't tried /advisor much yet.** It keeps a cheaper model like Opus 5.5 doing the work and lets it ask Fable at key moments, like before it commits to a plan.

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
<figcaption><b>My two weekly limits during the landscape job</b><span class="ao-meta">as the session's rate-limit messages reported them, for my whole account</span></figcaption>
</ao-bars>

## Where it still needs me

I wanted a project manager for all my projects on my own dashboard. I explained every problem I had and hoped it would work out the tool I needed. It made a few versions and I didn't like any of them, so I'm giving it far more feedback than I expected to. I think of this as divergent thinking: the space of possible answers is huge, and every decision changes the others. It's the same reason asking a model "how do I make money with AI?" gets you nowhere. Give it something hard and technical with a clear goal and it handles it.

## The computer is the bottleneck now

- **The landscape job's cloud machine went down five times.** Its own best guess was "a headless browser rendering the page with every CPU core busy".
- **Its workflows ran two agents at a time.** It told me "six builders working in parallel", but its records show two at once. Claude Code's workflows run fewer agents on machines with fewer cores, and a cloud session gets about four.
- **This post's session hit the same wall.** Its machine went down twice while it recorded the clips.
- **What helps.** The tea room sped up on my own computer. A session can also start other cloud sessions, each with its own machine. That works, but it's harder to follow from my end.

Fable 5.2 also directed two smaller jobs this week: 183 agents surveying 575 tools a guitar tab web app could use, and four small browser games. Neither is listed on the site yet.

*Claude wrote this post from the landscape session's transcript, the site's code history and my notes, and recorded the clips.*
