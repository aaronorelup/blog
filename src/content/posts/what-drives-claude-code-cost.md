---
id: "AO-065"
title: "Seven things I believed about Claude Code costs, checked against $31,000 of my own use"
summary: "Opus or Sonnet, which effort level, what cache reads cost, and what a $200 Max plan is worth at API prices: each claim checked against 510 recorded sessions and one new test, with the raw numbers."
date: 2026-10-24
status: "shipped"
tags: ["claude-code", "cost", "playback-lens", "agents", "lessons"]
series: ["agent-runs"]
preview:
  verdict: "Effort beats model, mostly"
  takeaway: "On open-ended runs, effort moved cost far more than the model: Low to Max was 16-90x. On a closed task Sonnet cost half. Cache reads are 52% of my bill."
  points:
    - "The price page cut Sonnet 5.5 cache reads to $0.10 on 8 October. Repriced, my long tests make Sonnet 33% cheaper, not 2%."
    - "My $200-a-month Max 20x plan carried $3,292 to $12,467 of API-priced use a month. The biggest week was $6,005."
    - "Wrong: Claude Code does show a session's tokens and dollars in /usage. It keeps no weekly or monthly history."
---

Since 7 July I've used $31,387 of Claude Code at API list prices: 510 sessions and 223,024
requests, on one Claude Max 20x subscription. People ask me what makes it expensive, and I have
a handful of answers I give. This post checks each one against the transcripts of those
sessions, read with [Playback Lens](/ledger/reading-my-own-agents/), plus one small test I ran
today. Every number here is in [results.json](/media/what-drives-claude-code-cost/results.json).

The dollars are API-equivalent: what the same tokens would cost at the list prices on
[Anthropic's pricing page](https://platform.claude.com/docs/en/about-claude/pricing). I didn't
pay them. I paid $200 a month.

## The answers

1. **"Opus 5.5 is cheaper than Sonnet 5.5 on open-ended work, because Sonnet works longer."**
   Only on one of my three tests. In [my long tests](/ledger/sonnet-vs-opus-gauntlet/), at the
   prices of the day, Opus was the cheaper run in 7 of 15 pairings at the same effort: 4 of 5 on
   Loom, 2 of 5 on Lockkeeper, 1 of 5 on the music video. Sonnet made more requests than Opus at
   every level on Loom, but on Lockkeeper only at Low and Max, and on the music video only at
   Max. Overall Sonnet was 2% cheaper.
   At today's prices Opus is cheaper in 2 of 15. My guess that Sonnet wins on closed tasks held:
   today it did the same closed task for about half of Opus's cost at every effort level.
2. **"Effort level drives cost more than anything else."** On open-ended work, yes. Going from
   Low to Max multiplied a run's cost by 16 to 90. Switching model at the same effort changed it
   by 0.18 to 1.42 times. On the closed task, effort changed almost nothing and the price list
   decided the bill.
3. **"Cache reads are the biggest cost."** Yes, on real work. They are 52% of my $31,387
   ($16,234) and 97% of my tokens. Cache writes come next at 32% ($9,965), all output with
   thinking included is 16% ($5,173), and uncached input is $15. On a tiny task it flips: cache
   writes were 78–89% of every run in today's test.
4. **"Sonnet 5.5 and Opus 5.5 cost the same for cache reads."** True when I ran my tests, false
   now. Both were $0.20 per million tokens until 7 October. Since 8 October the page lists Sonnet
   5.5 at $0.10: both models' cache hits are now 0.05× their input price, and Sonnet's input
   price is half of Opus's. Repriced, my long tests make Sonnet 33% cheaper than Opus, not 2%.
5. **"Effort sets how much work gets done, and the thinking barely changes."** The first half is
   right. Max made 4 to 28 times as many requests as Low, and on the open-ended music video 18 to
   23 times as much output that isn't thinking. The second half held on one test of three. On
   Lockkeeper, thinking per request rose 5–13% per level. On Loom and the music video it rose
   68–106% per level, 8 to 18 times from Low to Max.
6. **"One Max 20x subscription covered all of it, and I hit the weekly limit almost every
   week."** That's my account; here is what the plan carried. $200 a month is about $46 a week.
   My 15 complete weeks averaged $2,056 of API-priced use (median $1,745, the biggest $6,005).
   By month it was $3,292 (from 7 July), $6,911, $12,467 and $8,718 (to 24 October): 16 to 62
   times the price. The transcripts can't show the limit gauge, only the moments it came up.
7. **"Anthropic gives you no way to see these numbers, and Playback Lens sees about 90% of my
   use."** The Lens half is my account. It reads the transcripts Claude Code keeps on my laptop,
   so cloud sessions and claude.ai chats aren't in it, and 90% is my estimate. The first half is
   wrong as I've been saying it. Claude Code's `/usage` shows the current session's tokens and a
   list-price dollar figure, the status line can show the same cost, and OpenTelemetry export can
   stream token and cost metrics ([Anthropic's cost docs](https://code.claude.com/docs/en/costs)).
   What none of them gives a subscriber is history: last week's or last month's API-equivalent
   spend, after the fact. For that I had to read the transcripts.

## The long tests, repriced

The 30 runs from [AO-026](/ledger/sonnet-vs-opus-gauntlet/), same tokens, priced two ways.
"Then" is what the Lens charges for those dates, with Sonnet's cache reads at $0.20. "Now"
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

Opus's 15 runs cost $255.16. Sonnet's cost $249.16 then and $170.58 now. By test, Sonnet now
ties Loom (0.6% cheaper) and is 44% cheaper on Lockkeeper and 42% on the music video.

One thing AO-026 missed: the Sonnet Max run on Loom started three helper agents, and they ran
on Opus 5.5. They account for $15.83 of its $43.86 and 67 of its 244 requests. I've left them in
Sonnet's column, as that post did.

## Today's closed task

To test the other half of claim 1, I gave six fresh agents the most closed task I could write
in a few minutes: implement one function, `parse_duration`, to a one-page spec, until a 39-case
test file passes, with every step spelled out and nothing else allowed. Opus 5.5 and Sonnet 5.5
at Low, Medium and High, each a Claude Code subagent in its own folder, all started at once.
Here are [the prompt, the spec and the tests](/media/what-drives-claude-code-cost/closed-task.txt).

| Run | Requests | Output tokens | Of which thinking | Cache writes | Cost |
|---|---|---|---|---|---|
| Opus Low | 3 | 1,545 | 0 | 126K | $0.71 |
| Opus Medium | 4 | 1,983 | 434 | 127K | $0.75 |
| Opus High | 4 | 2,028 | 487 | 85K | $0.55 |
| Sonnet Low | 3 | 1,676 | 362 | 127K | $0.36 |
| Sonnet Medium | 3 | 1,894 | 429 | 85K | $0.26 |
| Sonnet High | 3 | 1,648 | 119 | 85K | $0.26 |

All six passed all 39 cases on their first test run, and all six did the same work: read two
files, write one, run the tests once. Effort made no difference worth billing. Output moved by
−2% to +31% from Low to High, and the most thinking any run did was 487 tokens. Where two runs
paid for the same cache writes (Low against Low, High against High), Sonnet cost 47–50% of Opus,
which is its price list and nothing else.

The uneven cache writes come from starting them together. The first agent of each model wrote
about 127,000 tokens of starting context to the cache, and the ones a moment behind found part
of it already there. That one write was 78–89% of every run, which is why claim 3 flips on a
task this small. It's one run per cell on one small task, so it shows a direction, not a rate.
The six runs cost $2.87.

My nightly image job is the same kind of work: fixed instructions, no choices. Its Sonnet 5.5
agent on 23 October made 35 requests for $1.31, and output was 14% of that. It has never run on
Opus, so my history has no pair to compare.

## Effort is a work dial

Max divided by Low, per test and model, from the same 30 runs:

| Test, model | Requests | Output that isn't thinking | Thinking per request | Thinking per request, each level |
|---|---|---|---|---|
| Loom, Opus | 6.7× | 6.2× | 13.4× | +91% |
| Loom, Sonnet | 4.4× | 7.6× | 8.0× | +68% |
| Lockkeeper, Opus | 9.2× | 6.0× | 1.66× | +13% |
| Lockkeeper, Sonnet | 10.3× | 5.9× | 1.23× | +5% |
| Music video, Opus | 18.0× | 18.2× | 14.0× | +93% |
| Music video, Sonnet | 28.4× | 22.8× | 18.1× | +106% |

The last column is the average step over the four steps from Low to Max. Thinking tokens are
what the transcripts record for each request.

Both of my numbers came from one test. Lockkeeper, where AO-026 measured 9× the actions for 1.7×
the thinking per action, is the only one where thinking per step stayed nearly flat. On the
other two, Max thought much harder per step as well as taking more steps. What held everywhere
is the work: Max always made several times as many requests, and every request re-reads the
whole conversation.

## What the subscription carried

Weeks run Wednesday to Tuesday, to match the weekly limit's reset at 11 pm on Tuesdays (an hour
off, because the Lens splits days at midnight). The plan's share of a week is about $46.

| Week ending | API-equivalent | × the plan |
|---|---|---|
| 14 Jul | $940 | 20× |
| 21 Jul | $1,542 | 33× |
| 28 Jul | $746 | 16× |
| 4 Aug | $1,459 | 32× |
| 11 Aug | $2,068 | 45× |
| 18 Aug | $1,925 | 42× |
| 25 Aug | $1,050 | 23× |
| 1 Sep | $885 | 19× |
| 8 Sep | $1,353 | 29× |
| 15 Sep | $1,745 | 38× |
| 22 Sep | $2,630 | 57× |
| 29 Sep | $6,005 | 130× |
| 6 Oct | $3,093 | 67× |
| 13 Oct | $2,399 | 52× |
| 20 Oct | $3,004 | 65× |

The five biggest weeks average $3,426. By model, Opus 5.5 is 46% of the total, Fable 5 21%,
Opus 5 18%, Fable 5.1 8%, Sonnet 5 5% and Sonnet 5.5 1%.

The limit itself shows up in the transcripts only when it came up:

- **18 July:** I told a session I had barely used that week's limit, with two days left to use
  it.
- **9 August:** a multi-agent run took the week to 98%. The week came to $2,068.
- **23 September,** the first day of the $6,005 week: I told a session I had one free weekly-limit
  reset in hand.
- **12 October:** the only hard stop in the transcripts, "You've hit your weekly limit · resets
  Oct 13, 11pm". The week had reached $2,395.
- **20 October:** "You started this project at 62% of your weekly usage limit used up, and now
  you are 93%." The week came to $3,004.

So in October one weekly limit held roughly $2,400 to $3,000 of my Claude Code use. The limit is
shared with claude.ai and my cloud sessions, which the Lens doesn't see, so treat those as
floors.

## Where the price change shows

Sessions of mine fetched the pricing page on 28 September and 2 October, and both times it
listed Sonnet 5.5 cache hits at $0.20. The Wayback Machine's copies still show $0.20 at 10:00 UTC
on 7 October. By 21:15 UTC that day the footnote included Sonnet 5.5 in the 0.05× rate, and by
04:32 UTC on 8 October the table said $0.10. My Lens rate table switches on 12 October, so
Sonnet 5.5 reads from 8 to 11 October are priced a little high in the weekly table.
Sonnet 5.5 is 1.2% of my spend, so it barely moves.

## What it comes to

The price list is the bill for a closed task. Today's agents all did the same four steps, and
Sonnet cost what its price list says it costs. An open-ended task writes its own bill: how many
times the agent goes round, re-reading everything so far each time. That's why the cheaper model
wasn't cheaper in September, and why effort, which mostly decides how many times it goes round,
moved my open-ended costs more than the choice of model did.
