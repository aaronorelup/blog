---
id: "AO-065"
title: "Seven things I believed about Claude Code costs, checked"
summary: "I checked seven things I tell people about Claude Code costs against 510 of my own sessions ($31k at API prices) and one fresh test: model vs effort, what cache reads cost, what a $200 plan really buys."
date: 2026-10-24
status: "shipped"
tags: ["claude-code", "cost", "playback-lens", "agents", "lessons"]
series: ["agent-runs"]
topic: "agents"
project: []
preview:
  verdict: "Effort beats model"
  takeaway: "On open-ended work the effort setting moved cost 16 to 90 times, far more than switching model did. On a tightly defined task, Sonnet cost half."
  points:
    - "The 8 Oct price cut to Sonnet 5.5 cache reads makes Sonnet 33% cheaper than Opus on my long tests, not 2%."
    - "My $200 a month plan covered $3,292 to $12,467 a month of use at API prices. The biggest week was $6,005."
    - "Claude re-reading the conversation so far (cache reads) was 52% of my cost at API prices."
  image: "/media/previews/what-drives-claude-code-cost.webp"
  alt: "A cast-iron kettle on a roaring charcoal fire, a spiral of gold coins pouring out of its spout"
---

Claude Code is Anthropic's AI agent that works on your computer by itself. People ask me what
makes it expensive, so I checked seven things I always tell them against my own use, 510 sessions
over 16 weeks, plus one small new test.

**For open-ended work, the effort level matters far more than which model you run.** Effort is a
setting from Low to Max for how much the model puts into a job. Low to Max multiplied a run's
cost by 16 to 90. Opus 5.5 is Anthropic's big model and Sonnet 5.5 its cheaper mid-size one.
Switching between them at the same effort made a run cost 0.18 to 1.42 times as much. Effort
mostly decides how many times the agent goes round, and each time it re-reads the whole
conversation. On a tightly defined task the price list decides the bill, and there Sonnet costs
about half.

The dollars are API-equivalent, what the same use would cost at
[Anthropic's list prices](https://platform.claude.com/docs/en/about-claude/pricing). They came
to $31,387, about 39 times the $800 or so I've actually paid so far, before tax. I'm on the Max
20x plan, a $200-a-month Claude subscription. I measured it all with
[Playback Lens](/ledger/reading-my-own-agents/), a tool I built that reads Claude Code's
transcripts on my laptop. Every number is in
[results.json](/media/what-drives-claude-code-cost/results.json).

## The seven answers, checked

1. **Opus 5.5 isn't reliably cheaper than Sonnet 5.5 on open-ended work.** I'd said it was,
   because Sonnet works longer. That held on one of my [three long tests](/ledger/sonnet-vs-opus-gauntlet/).
   At the prices back then, Opus was cheaper in 7 of 15 matchups at the same effort, and Sonnet
   came out 2% cheaper overall. At today's prices Opus wins 2 of 15. My guess that Sonnet wins on
   a tightly defined task held.
2. **Effort drives the cost of open-ended work more than anything else.** On a tightly defined
   task it changed almost nothing.
3. **Cache reads are the biggest cost on real work.** Each step, the agent re-reads the
   conversation so far from a cache at a steep discount. That was 52% of my $31,387 and 97% of my
   tokens. On a tiny task, cache writes (storing new context in the cache) take over.
4. **Sonnet's cache reads are half price now.** I'd said they cost the same as Opus's, and they
   did when I ran my tests. Since 8 October they cost $0.10 per million tokens to Opus's $0.20.
   That makes Sonnet 33% cheaper on my long tests, not 2%.
5. **Effort sets how much work gets done, and usually how hard the model thinks too.** I'd said
   the thinking barely changes. That held on one test of three.
6. **One $200 plan carried 16 to 62 times its price every month.** That's $3,292 to $12,467 a
   month at API prices.
7. **Claude Code shows a session's cost, but no weekly or monthly history.** I'd said it shows
   you nothing, which was wrong.

## Why effort matters more than the model

**Effort is mostly a work dial.** Across the 30 runs of my long tests, Max made 4 to 28 times as
many requests as Low, and every request re-reads the whole conversation. On two of the three
tests Max also thought harder per step. Thinking, the model's hidden reasoning before it answers,
rose 68 to 106% per effort level there. Only on Lockkeeper, a canal-scheduling optimizer, did it
stay nearly flat.

In September, when I ran those tests, Sonnet's lower prices barely showed in the bill. Its
cache reads cost the same as Opus's back then, and those are the biggest part of it. And it
sometimes went round more times than Opus did.

<details><summary>All 30 long-test runs, priced then and now</summary>

The three tests were Loom (an interpreter for a made-up language), Lockkeeper (the canal
optimizer) and a 30-second music video with no rules. Here are their 30 runs, same tokens, priced
two ways. "Then" is what the Lens charges for those dates, with Sonnet's cache reads at $0.20. "Now"
reprices only those reads at $0.10.

| | Low | Medium | High | XHigh | Max |
|---|---|---|---|---|---|
| Loom, Opus | $2.00 | $5.68 | $6.52 | $14.32 | $32.40 |
| Loom, Sonnet then | $2.45 | $4.45 | $8.91 | $20.30 | $43.86 |
| Loom, Sonnet now | $1.85 | $3.33 | $6.26 | $14.59 | $34.51 |
| Lockkeeper, Opus | $2.85 | $24.08 | $29.55 | $41.87 | $53.62 |
| Lockkeeper, Sonnet then | $3.41 | $13.73 | $20.38 | $32.51 | $61.96 |
| Lockkeeper, Sonnet now | $2.73 | $9.18 | $13.20 | $20.72 | $39.77 |
| Music video, Opus | $0.50 | $3.33 | $3.59 | $14.72 | $20.11 |
| Music video, Sonnet then | $0.27 | $0.60 | $2.22 | $9.73 | $24.38 |
| Music video, Sonnet now | $0.24 | $0.48 | $1.64 | $6.47 | $15.59 |

Opus's 15 runs cost $255.16. Sonnet's cost $249.16 then and $170.58 now. At the prices back then,
Opus was the cheaper run in 4 of 5 matchups on Loom, 2 of 5 on Lockkeeper and 1 of 5 on the music
video. By test, Sonnet now ties Loom (0.6% cheaper) and is 44% cheaper on Lockkeeper and 42% on
the music video.

The first write-up of those tests missed one thing. The Sonnet Max run on Loom started three
helper agents, and they ran on Opus 5.5. They account for $15.83 of its $43.86 and 67 of its 244
requests. I've left them in Sonnet's column, as that post did.

</details>

<details><summary>How much more Max did than Low, per test and model</summary>

| Test, model | Requests | Output that isn't thinking | Thinking per request | Thinking per request, each level |
|---|---|---|---|---|
| Loom, Opus | 6.7x | 6.2x | 13.4x | +91% |
| Loom, Sonnet | 4.4x | 7.6x | 8.0x | +68% |
| Lockkeeper, Opus | 9.2x | 6.0x | 1.66x | +13% |
| Lockkeeper, Sonnet | 10.3x | 5.9x | 1.23x | +5% |
| Music video, Opus | 18.0x | 18.2x | 14.0x | +93% |
| Music video, Sonnet | 28.4x | 22.8x | 18.1x | +106% |

The last column is the average step over the four steps from Low to Max. Thinking tokens are what
the transcripts record for each request. On the music video, Max wrote 18 to 23 times as much
output that isn't thinking. On Loom and the music video, thinking per request went up 8 to 18
times from Low to Max, against 5 to 13% per level on Lockkeeper.

Sonnet made more requests than Opus at every level on Loom, but on Lockkeeper only at Low and
Max, and on the music video only at Max.

Both of the numbers I used to quote came from one test. Lockkeeper, where the first write-up
measured 9x the actions for 1.7x the thinking per action, is the only one where thinking per step
stayed nearly flat. What held everywhere is the work. Max always made several times as many
requests, and every request re-reads the whole conversation.

</details>

## On a tightly defined task, Sonnet costs half

**When every agent takes the same steps, the price list is the bill.** I gave six fresh agents
the most tightly defined task I could write in a few minutes. Each had to write one function,
`parse_duration`, to a one-page spec until 39 tests passed, with every step spelled out. Opus and
Sonnet ran at Low, Medium and High, all at once. Here are
[the prompt, the spec and the tests](/media/what-drives-claude-code-cost/closed-task.txt).

| Run | Requests | Output tokens | Of which thinking | Cache writes | Cost |
|---|---|---|---|---|---|
| Opus Low | 3 | 1,545 | 0 | 126K | $0.71 |
| Opus Medium | 4 | 1,983 | 434 | 127K | $0.75 |
| Opus High | 4 | 2,028 | 487 | 85K | $0.55 |
| Sonnet Low | 3 | 1,676 | 362 | 127K | $0.36 |
| Sonnet Medium | 3 | 1,894 | 429 | 85K | $0.26 |
| Sonnet High | 3 | 1,648 | 119 | 85K | $0.26 |

All six passed all 39 tests on the first run, and all six did the same work. They read two
files, wrote one and ran the tests once. Effort made no difference worth billing. Comparing runs
that paid for the same cache writes, Sonnet cost 47 to 50% of Opus, which is just its price list.
It's one run each on one small task, so it shows a direction, not a rate. The six runs cost $2.87.

<details><summary>Why the cache writes differ, and a real job like it</summary>

- **Effort barely moved the work.** Output moved by -2% to +31% from Low to High, and the most
  thinking any run did was 487 tokens.
- **The cache writes are uneven because the agents started together.** The first agent of each
  model stored about 127,000 tokens of starting context, and the ones a moment behind found part
  of it already there. So compare Low with Low and High with High.
- **That one write was 78 to 89% of every run.** That's why cache writes beat cache reads on a
  task this small.
- **My [nightly image job](/ledger/daily-candy/) is the same kind of work,** fixed instructions
  and no choices. Its Sonnet 5.5 agent on 23 October made 35 requests for $1.31, and output was
  14% of that. It has never run on Opus, so I have no pair to compare.

</details>

## Where the money goes

**Cache reads are more than half of it.**

<ao-bars unit="dollars">
<table>
<thead><tr><th>Part of the bill</th><th>Dollars at API prices</th></tr></thead>
<tbody>
<tr><td>Cache reads (re-reading the conversation)</td><td>16234</td></tr>
<tr><td>Cache writes (storing new context)</td><td>9965</td></tr>
<tr><td>Output, thinking included</td><td>5173</td></tr>
<tr><td>Input that wasn't cached</td><td>15</td></tr>
</tbody>
</table>
<figcaption><b>Where my $31,387 of Claude Code use went, 7 July to 24 October</b><span class="ao-meta">API-equivalent dollars from Playback Lens. Cache reads 52%, cache writes 32%, output 16%. Cache reads are also 97% of the tokens.</span></figcaption>
</ao-bars>

Cache reads are the biggest line for six of the nine Claude models I've used.

<details><summary>Every token and dollar, by model</summary>

Lifetime, 7 July to 24 October, re-read the evening of the 24th. The Lens had picked up $13 more
by then, so the totals here are a little over the $31,387 above. Output includes thinking. Cache
writes are the 5-minute and 1-hour writes together.

| Model | Input | Output | Cache writes | Cache reads |
|---|---|---|---|---|
| Opus 5.5 | 260K | 116.8M | 952.6M | 35,481M |
| Fable 5 | 416K | 15.9M | 105.8M | 3,818M |
| Opus 5 | 330K | 39.9M | 162.3M | 7,079M |
| Fable 5.1 | 788K | 14.5M | 83.6M | 1,953M |
| Sonnet 5 | 245K | 24.1M | 128.9M | 5,273M |
| Sonnet 5.5 | 9K | 6.9M | 28.2M | 1,154M |
| Opus 4.8 | 38K | 0.2M | 3.1M | 32M |
| Haiku 4.5 | 15K | 1.0M | 7.1M | 96M |
| Haiku 5.5 | 1K | 1.0M | 7.1M | 74M |
| **Total** | **2.1M** | **220.4M** | **1,478.6M** | **54,959M** |

The same tokens at API list prices:

| Model | Input | Output | Cache writes | Cache reads | Total |
|---|---|---|---|---|---|
| Opus 5.5 | $1 | $2,336 | $5,127 | $7,096 | $14,560 |
| Fable 5 | $4 | $797 | $1,914 | $3,818 | $6,534 |
| Opus 5 | $2 | $998 | $1,184 | $3,540 | $5,723 |
| Fable 5.1 | $8 | $723 | $1,278 | $488 | $2,497 |
| Sonnet 5 | <$1 | $241 | $343 | $1,055 | $1,639 |
| Sonnet 5.5 | <$1 | $69 | $96 | $212 | $377 |
| Opus 4.8 | <$1 | $5 | $23 | $16 | $44 |
| Haiku 4.5 | <$1 | $5 | $9 | $10 | $24 |
| Haiku 5.5 | <$1 | <$1 | $1 | $1 | $2 |
| **Total** | **$15** | **$5,175** | **$9,975** | **$16,235** | **$31,400** |

Each row re-adds exactly from the pricing page's rates. Sonnet 5.5's reads are at $0.20 to 7
October and $0.10 after. By model, Opus 5.5 is 46% of the total, Fable 5 21%, Opus 5 18%, Fable
5.1 8%, Sonnet 5 5% and Sonnet 5.5 1%. Of the three models where cache reads aren't the biggest
line, Fable 5.1 is the clearest, because its reads cost a fortieth of its input price.

</details>

## When Sonnet got cheaper

**Anthropic halved Sonnet 5.5's cache-read price between 7 and 8 October.** My sessions saw
$0.20 per million tokens on the pricing page on 28 September and 2 October. Since the 8th it's
$0.10. Sonnet 5.5 is only 1.2% of my spend, so my totals barely move. The cut is what takes the
long-test gap from 2% to 33%.

<details><summary>Where the price change shows</summary>

Now both models' cache reads cost a twentieth of their normal input price, and Sonnet's input
price is half of Opus's.

The Wayback Machine, the Internet Archive's dated copies of web pages, still shows $0.20 at 10:00
UTC on 7 October. By 21:15 UTC that day the page's footnote included Sonnet 5.5 in the 0.05x
rate, and by 04:32 UTC on 8 October the table said $0.10.

When I made the weekly figures below, my Lens rate table switched on 12 October. So Sonnet 5.5
reads from 8 to 11 October are priced a little high there. It switches on the 8th now, as in the
table by model.

</details>

## What a $200 plan carried

**$200 a month is about $46 a week, and my average week was $2,056 at API prices.** I moved from
Claude Pro to Max 20x on 5 July and I've maxed out its weekly limit most weeks since. By month it
came to $3,292 (from 7 July), $6,911, $12,467 and $8,718 (to 24 October).

<ao-bars unit="dollars">
<table>
<thead><tr><th>Week ending (x the plan)</th><th>API-equivalent dollars</th></tr></thead>
<tbody>
<tr><td>14 Jul (20x)</td><td>940</td></tr>
<tr><td>21 Jul (33x)</td><td>1542</td></tr>
<tr><td>28 Jul (16x)</td><td>746</td></tr>
<tr><td>4 Aug (32x)</td><td>1459</td></tr>
<tr><td>11 Aug (45x)</td><td>2068</td></tr>
<tr><td>18 Aug (42x)</td><td>1925</td></tr>
<tr><td>25 Aug (23x)</td><td>1050</td></tr>
<tr><td>1 Sep (19x)</td><td>885</td></tr>
<tr><td>8 Sep (29x)</td><td>1353</td></tr>
<tr><td>15 Sep (38x)</td><td>1745</td></tr>
<tr><td>22 Sep (57x)</td><td>2630</td></tr>
<tr><td>29 Sep (130x)</td><td>6005</td></tr>
<tr><td>6 Oct (67x)</td><td>3093</td></tr>
<tr><td>13 Oct (52x)</td><td>2399</td></tr>
<tr><td>20 Oct (65x)</td><td>3004</td></tr>
</tbody>
</table>
<figcaption><b>My Claude Code use per week at API prices, 15 complete weeks</b><span class="ao-meta">Weeks run Wednesday to Tuesday, to match the weekly limit's reset at 11 pm on Tuesdays (an hour off, because the Lens splits days at midnight). In brackets, how many times the plan's weekly share of about $46 it was. The median week was $1,745 and the five biggest average $3,426.</span></figcaption>
</ao-bars>

In October one weekly limit held roughly $2,400 to $3,000 of my use. That's a floor, since the
limit also covers claude.ai and my cloud sessions, which the Lens doesn't see.

<details><summary>Every time the weekly limit came up</summary>

The transcripts can't show the limit gauge, only the moments it came up.

- **18 July:** I told a session I had barely used that week's limit, with two days left to use it.
- **9 August:** a multi-agent run took the week to 98%. The week came to $2,068.
- **23 September,** the first day of the $6,005 week. I told a session I had one free
  weekly-limit reset in hand.
- **12 October:** the only hard stop in the transcripts, "You've hit your weekly limit · resets
  Oct 13, 11pm". The week had reached $2,395.
- **20 October:** "You started this project at 62% of your weekly usage limit used up, and now
  you are 93%." The week came to $3,004.

</details>

## What Claude Code shows you

**You can see a session's cost, but not last month's.** Claude Code's `/usage` command shows the
current session's tokens and a list-price dollar figure. The status line at the bottom of the
screen can show the same, and Claude Code can stream the numbers to a monitoring tool
([Anthropic's cost docs](https://code.claude.com/docs/en/costs)). None of it gives a subscriber
history. For last week or last month I had to read the transcripts.

Playback Lens only reads the ones on my laptop, so cloud sessions and claude.ai chats aren't in
it. My guess is it sees about 90% of my use. It's
[open source on GitHub](https://github.com/aaronorelup/claude-playback-lens) if you use Claude
Code too.
