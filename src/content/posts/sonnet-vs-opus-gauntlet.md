---
id: "AO-026"
title: "Claude Sonnet vs Opus at every effort level, on three long jobs"
summary: "I gave the same three long jobs to ten Claude Code sessions, Sonnet 5.5 and Opus 5.5 at every effort level. What each one cost, which did better, and what turning up the effort changes."
date: 2026-09-28
topic: "agents"
project: []
preview:
  verdict: "Half price, same bill"
  takeaway: "Sonnet 5.5 cost $249 to Opus 5.5's $255 over three long tests. Re-reading the conversation cost the same on both, and on one test Sonnet used twice the tokens."
  points:
    - "Effort mostly sets how much gets done. On the canal, Opus at Max did 9x Low's actions with 1.7x the thinking per action."
    - "Quality was close: all ten runs passed every test on the language task, and Opus won 4 of 5 head-to-heads on the canal."
    - "On the language task Max cost 16-18x Low for the same score. It clearly paid off only on the music videos."
  image: "/media/previews/sonnet-vs-opus-gauntlet.webp"
  loop: "/media/previews/sonnet-vs-opus-gauntlet.mp4"
  alt: "The last shot of Opus 5.5 Max's music video: a gold-shelled manuscript snail wearing the knight's plumed helmet"
---

Claude Sonnet 5.5 costs half what Opus 5.5, the bigger model, costs on almost every line of
Anthropic's price list. So I tested whether it saves money on long jobs. **Over three long tasks,
Sonnet cost $249 and Opus $255**, about 2% less, and Opus did at least as well.

The tasks were an interpreter for a made-up language, a scheduler for boats on a canal, and a
30-second music video with no rules. Each went to ten fresh sessions of Claude Code, Anthropic's
agent that works on your computer by itself: both models at all five effort settings, Low to Max.
Effort is how much the model puts into a job. With one run per setting, each result is one data
point.

- **Same bill at half the price.** Sonnet cost 31% more on the language task, 13% less on the
  canal and a bit less on the videos.
- **Opus won four of five head-to-heads on the canal**, and all ten runs passed every language
  test.
- **Effort mostly sets how many steps the model takes.** On the canal its thinking per step barely changed.
- **Max was rarely worth it.** On the language task it cost 16 to 18 times Low for the same
  score. It only clearly paid off on the music videos.
- **Left alone, they reach for the same few things.** Ten tartans in the weaving task, four
  yellow raincoats in the videos.

## Why half price doesn't halve the bill

Claude Code sends the whole conversation back to the model on every turn. That's billed as
"cache reads", the one price that was the same on both, $0.20 per million tokens. Tokens are the
chunks of text a model reads and writes. **Cache reads are 97% of all my tokens**, going by
[Playback Lens](/ledger/reading-my-own-agents/), my tool for reading my sessions. So my history
at Sonnet's rates comes out 24 to 27% cheaper, not 50%. And every extra turn Sonnet needs
re-reads the whole conversation at that same price.

Sonnet's cache reads dropped to $0.10 on 8 October. Repriced, these runs make Sonnet 33% cheaper
than Opus, as [my later post on costs](/ledger/what-drives-claude-code-cost/) works out.

<details><summary>My usage by token type</summary>

The price list when I ran this, per million tokens:

| Price per 1M tokens | Sonnet 5.5 | Opus 5.5 |
|---|---|---|
| Cache reads | $0.20 | $0.20 |
| Cache writes | $2.50 | $5 |
| Input tokens | $2 | $4 |
| Output tokens | $10 | $20 |

Cache writes that last an hour instead of five minutes cost double the input price, $4 and $8.
About 15% of my writes are those.

Every token I'd spent in Claude Code up to then, 31.6 billion of them across 128,000 requests,
split by type:

| Type | Share of tokens | Share of cost at Opus 5.5 prices | Share at Sonnet 5.5 prices |
|---|---|---|---|
| **Cache reads** | **97.0%** | **45%** | **62%** |
| Cache writes (5-min + 1-hour) | 2.5% | 34% | 24% |
| Output | 0.43% | 20% | 14% |
| Uncached input | 0.01% | ~0% | ~0% |

An average Opus 5.5 request of mine reads about 334,000 cached tokens and writes about 1,000
tokens of output. Uncached input is about 2 tokens per request, so the "$2 vs $4 input" line on
the price page doesn't touch me at all.

Holding my token counts fixed and swapping the price list:

| Usage | Opus 5.5 | Sonnet 5.5 | Sonnet saves |
|---|---|---|---|
| All my history | $13,479 | $9,802 | **27%** |
| Only my Opus 5.5 sessions | $4,771 | $3,607 | **24%** |

These are API-equivalent dollars, what the same tokens would cost at the pay-as-you-go price.
I'm on a Max plan, so what really limits me is the usage limit, but the ratios are the same
either way.

</details>

<details><summary>How I ran the sessions</summary>

Each session ran alone in its own folder with one prompt and nobody watching, and was told not to
look at its neighbors. None of them was told how long the task should take. Afterwards I read its
exact tokens and cost out of its transcript, the saved record of everything it did. Medium is
what I normally run Opus at. A lot of people run Opus at Max.

For comparison, in summer 2025 I was still pasting code into a chat window by hand for my
monster game ([everything Sonnet 4 got wrong back then](/ledger/everything-sonnet-got-wrong/)).
Here the sessions ran themselves for up to nine hours, kept notes in files and tested their own
work.

</details>

## Test 1: a made-up weaving language

I invented a small programming language, LOOM, whose programs describe woven cloth. Each session
had to build an interpreter for it (the program that runs LOOM code), a one-page studio with an
editor and an animated loom, and a gallery of at least eight pieces. Then I tested it on 15
example programs and 10 hidden ones.

**All ten got all 25 right**, so Loom became a pure price test. Opus Low did it in 8 minutes for
$2.00, Sonnet Max in 110 minutes for $43.86. Over the five levels Opus cost $60.92 and Sonnet
$79.97, because Sonnet used about twice the tokens to do the same job. Max only bought more
gallery pieces and bigger test suites.

Every piece of cloth from all ten galleries, one row per session, Opus Low at the top:

![Every gallery piece from all ten sessions, one row per session](/gauntlet/loom/gallery-wall.png)

**All ten have a tartan**, nine a herringbone and eight a houndstooth. The studios split by
model. Four of the five Sonnet ones went dark and all five Opus ones stayed light. Click one to
open the page its session wrote.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin:1.2em 0">
  <a href="/gauntlet/loom/opus-5-5-low/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/opus-5-5-low/studio.jpg" alt="LOOM Studio built by Opus 5.5 at Low effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Low</span></a>
  <a href="/gauntlet/loom/opus-5-5-medium/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/opus-5-5-medium/studio.jpg" alt="LOOM Studio built by Opus 5.5 at Medium effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Medium</span></a>
  <a href="/gauntlet/loom/opus-5-5-high/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/opus-5-5-high/studio.jpg" alt="LOOM Studio built by Opus 5.5 at High effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · High</span></a>
  <a href="/gauntlet/loom/opus-5-5-xhigh/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/opus-5-5-xhigh/studio.jpg" alt="LOOM Studio built by Opus 5.5 at XHigh effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · XHigh</span></a>
  <a href="/gauntlet/loom/opus-5-5-max/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/opus-5-5-max/studio.jpg" alt="LOOM Studio built by Opus 5.5 at Max effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Max</span></a>
  <a href="/gauntlet/loom/sonnet-5-5-low/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/sonnet-5-5-low/studio.jpg" alt="LOOM Studio built by Sonnet 5.5 at Low effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Low</span></a>
  <a href="/gauntlet/loom/sonnet-5-5-medium/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/sonnet-5-5-medium/studio.jpg" alt="LOOM Studio built by Sonnet 5.5 at Medium effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Medium</span></a>
  <a href="/gauntlet/loom/sonnet-5-5-high/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/sonnet-5-5-high/studio.jpg" alt="LOOM Studio built by Sonnet 5.5 at High effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · High</span></a>
  <a href="/gauntlet/loom/sonnet-5-5-xhigh/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/sonnet-5-5-xhigh/studio.jpg" alt="LOOM Studio built by Sonnet 5.5 at XHigh effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · XHigh</span></a>
  <a href="/gauntlet/loom/sonnet-5-5-max/" style="display:block;text-decoration:none"><img src="/gauntlet/loom/sonnet-5-5-max/studio.jpg" alt="LOOM Studio built by Sonnet 5.5 at Max effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Max</span></a>
</div>

The [hidden tests](/gauntlet/loom/hidden/) are public now too, with their answers.

<details><summary>The Loom task in full</summary>

LOOM programs describe cloth the way a real loom makes it: which lengthwise threads get lifted
on each row, which color the shuttle carries across, threads that cross and drift, and a
"float" rule that fails the program if a thread runs loose for too long. The spec is four pages
and deliberately precise, down to the exact text of every error message and which of two errors
wins when both apply.

Each session had to build:

- **An interpreter** with a command-line runner whose output is compared to mine character for
  character.
- **LOOM Studio**, one self-contained web page with an editor, a loom view that animates the
  weaving row by row, a step-by-step debugger you can scrub back and forth, errors that point
  at the right line, and a panel that runs the examples live.
- **A gallery of at least eight original pieces.**
- **Its own test suite and notes.**

The 10 hidden tests are edge cases the spec defines but the examples never show. For example,
whether a float counter remembers rows woven before float checking was turned on (it does),
whether a structural error on line 4 beats a runtime error on line 3 (it does), and whether
`(a b) *2` with a space is legal (it isn't).

Here are the [prompt](/gauntlet/loom/PROMPT.txt) and the [spec](/gauntlet/loom/LOOM_SPEC.txt)
exactly as the sessions got them.

</details>

<details><summary>Loom results, session by session</summary>

| Session | Hidden | Gallery | Wall time | Requests | Cache reads | Cost |
|---|---|---|---|---|---|---|
| Opus 5.5 Low | 10/10 | 9 | 8 min | 23 | 1.8M | **$2.00** |
| Opus 5.5 Medium | 10/10 | 9 | 21 min | 63 | 8.7M | $5.68 |
| Opus 5.5 High | 10/10 | 9 | 26 min | 50 | 7.7M | $6.52 |
| Opus 5.5 XHigh | 10/10 | 10 | 51 min | 105 | 23.0M | $14.32 |
| Opus 5.5 Max | 10/10 | 12 | 62 min | 155 | 41.3M | $32.40 |
| Sonnet 5.5 Low | 10/10 | 10 | 10 min | 55 | 6.0M | $2.45 |
| Sonnet 5.5 Medium | 10/10 | 10 | 22 min | 76 | 11.3M | $4.45 |
| Sonnet 5.5 High | 10/10 | 10 | 40 min | 111 | 26.5M | $8.91 |
| Sonnet 5.5 XHigh | 10/10 | 13 | 67 min | 213 | 57.0M | $20.30 |
| Sonnet 5.5 Max | 10/10 | 14 | 110 min* | 244 | 102.6M | **$43.86** |

- Requests, tokens and dollars come straight out of the session transcripts through Playback
  Lens, including subagents (helper agents a session starts). The XHigh and Max runs started
  one or two each.
- \*Sonnet Max hit my plan's usage limit 73 minutes in and was resumed in the same session after
  the limit reset. Its wall time includes the wait, and its tokens are exact.
- Sonnet came out cheaper at one level, Medium, by 22%. Opus finished first at every level.
- At the same effort, Sonnet made 1.2 to 2.4 times as many requests and re-read 1.3 to 3.4 times
  as much cached conversation. Cache reads were 18 to 32% of the Opus bills and 47 to 60% of the
  Sonnet ones.
- If Opus's own token counts had been billed at Sonnet's prices, its runs would have cost
  $38.72. Sonnet actually spent $79.97.
- Max also bought longer notes. Opus Low finished everything, including a 119-test suite and
  screenshot checks of its own page, in under eight minutes for two dollars.
- The galleries also had nine sunset gradients and seven log cabins. Sonnet went further into
  color and whimsy, with rainbow lozenges, tiny hearts, a kaleidoscope and a barber pole. Opus
  stayed closer to a weaving textbook, with goose-eye, monk's belt, rosepath and an oat waffle.
  Higher effort mostly bought more pieces, not stranger ones.
- The dark Sonnet studios look a lot like my brand's night mode, and the Opus ones land near its
  day mode. Every session could see my brand guide, and none of them opened it.

</details>

## Test 2: scheduling 40 boats through a canal

The second task, the Lockkeeper's Ledger, is a made-up canal with nine locks up a hill and 40
boats to get through in two days. Every lock that fills drains water from the pool above, and
three lockkeepers walk between locks to work them. Each session wrote a solver (a program that
finds the schedule) and a page that animates the canal. I also ran every solver on three canals it
had never seen. Scores are minutes late, weighted by priority. A simple scheduler I wrote scores
26,387.

**Every schedule followed the rules, and this time the scores spread out.**

- **Opus won four of the five levels head to head.** The best schedule was Opus High's, 73%
  better than my simple scheduler. The best solver on unseen canals was Opus Max's.
- **Sonnet was 13% cheaper here**, and the two tied on the unseen canals.
- **Effort mattered, but not in a straight line.** Medium, High and Max beat Low on both models,
  and both XHigh runs dipped.

Sonnet Max ran 8 hours 42 minutes alone before I stopped it. Its conversation hit 968,364
tokens, just under the million tokens the model can hold, so Claude Code summarized it and carried on.
Why a session can run that long now is in
[the full making-of notes](/ledger/sonnet-vs-opus-gauntlet/notes/).

All ten pages work. Click one to open it.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin:1.2em 0">
  <a href="/gauntlet/lockkeeper/opus-5-5-low/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/opus-5-5-low/studio.jpg" alt="Lockkeeper's Ledger built by Opus 5.5 at Low effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Low</span></a>
  <a href="/gauntlet/lockkeeper/opus-5-5-medium/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/opus-5-5-medium/studio.jpg" alt="Lockkeeper's Ledger built by Opus 5.5 at Medium effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Medium</span></a>
  <a href="/gauntlet/lockkeeper/opus-5-5-high/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/opus-5-5-high/studio.jpg" alt="Lockkeeper's Ledger built by Opus 5.5 at High effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · High</span></a>
  <a href="/gauntlet/lockkeeper/opus-5-5-xhigh/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/opus-5-5-xhigh/studio.jpg" alt="Lockkeeper's Ledger built by Opus 5.5 at XHigh effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · XHigh</span></a>
  <a href="/gauntlet/lockkeeper/opus-5-5-max/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/opus-5-5-max/studio.jpg" alt="Lockkeeper's Ledger built by Opus 5.5 at Max effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Opus 5.5 · Max</span></a>
  <a href="/gauntlet/lockkeeper/sonnet-5-5-low/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/sonnet-5-5-low/studio.jpg" alt="Lockkeeper's Ledger built by Sonnet 5.5 at Low effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Low</span></a>
  <a href="/gauntlet/lockkeeper/sonnet-5-5-medium/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/sonnet-5-5-medium/studio.jpg" alt="Lockkeeper's Ledger built by Sonnet 5.5 at Medium effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Medium</span></a>
  <a href="/gauntlet/lockkeeper/sonnet-5-5-high/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/sonnet-5-5-high/studio.jpg" alt="Lockkeeper's Ledger built by Sonnet 5.5 at High effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · High</span></a>
  <a href="/gauntlet/lockkeeper/sonnet-5-5-xhigh/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/sonnet-5-5-xhigh/studio.jpg" alt="Lockkeeper's Ledger built by Sonnet 5.5 at XHigh effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · XHigh</span></a>
  <a href="/gauntlet/lockkeeper/sonnet-5-5-max/" style="display:block;text-decoration:none"><img src="/gauntlet/lockkeeper/sonnet-5-5-max/studio.jpg" alt="Lockkeeper's Ledger built by Sonnet 5.5 at Max effort" loading="lazy" style="width:100%;border:1px solid var(--pc-line,#ccc);border-radius:8px" /><span style="font-size:14px">Sonnet 5.5 · Max</span></a>
</div>

The [hidden canals](/gauntlet/lockkeeper/hidden/) are public now.

<details><summary>The Lockkeeper task in full</summary>

I rewrote this task after the first Loom results came in. The two Low runs had both aced Loom
in 8 and 10 minutes, so Lockkeeper got three more rules, hidden test canals and a live
re-planning requirement before it ran.

Each boat, narrowboat or barge, going up or down, has a release time, a deadline and a priority.
The locks close at night. A pool can't drop below its minimum, and the only new water is a
feeder stream into the top pool, one unit a minute, spilling down over weirs. So a careless
schedule drains the canal and then everyone waits for the hill to refill. On top of that:

- **Three keepers for nine locks.** Ada, Bert and Cass work every operation in person and have
  to walk the towpath between locks. Getting the crew in the right place is its own scheduling
  problem.
- **A maintenance closure** shuts Lock 5 for two hours in the middle of day one.
- **Priorities.** A priority-3 boat's late minutes count triple.
- **Shared chambers and wrong-side chambers.** Two narrowboats going the same way can share a
  chamber. A chamber on the wrong side has to be worked once with no boat in it first, which
  costs time and, going up, water.

Each session had to deliver:

- **A solver** (`node solve.js canal.json`) that I also ran on three canals it had never seen,
  with different sizes, crews, closures and feeder rates, under a two-minute limit.
- **Its best schedule** for the public canal, checked by my simulator. One broken rule makes it
  invalid, and an invalid schedule scores nothing.
- **Its own validator**, a program that checks a schedule against the rules.
- **The Lockkeeper's Ledger**, a page that animates the canal (water levels, chambers filling,
  boats moving, keepers walking, night falling) next to a timeline chart, and explains every
  delay in plain language, like "Kingfisher waited 14 minutes at Lock 6 because no keeper was
  free: Ada was working Lock 2".
- **A disruption mode.** Close a lock or delay a boat in the page, press re-plan, and it
  re-solves in the browser and shows who got later and why.

I wrote two simple baseline schedulers to prove every canal can be solved at all. One sends the
most urgent waiting boat through with the nearest free keeper. It's valid on the public canal
but comes to 26,387 weighted minutes late, with 32 of 40 boats late. Neither plans ahead, and
both are bad at moving keepers.

Here are the [prompt](/gauntlet/lockkeeper/PROMPT.txt), the
[rules](/gauntlet/lockkeeper/LOCKKEEPER_SPEC.txt) and the
[public canal](/gauntlet/lockkeeper/canal.json).

</details>

<details><summary>Lockkeeper results, session by session</summary>

| Session | Public canal | Hidden canals (total) | Wall time | Requests | Peak context | Cost |
|---|---|---|---|---|---|---|
| Opus 5.5 Low | 10,933 | 37,132 | 14 min | 32 | 130K | **$2.85** |
| Opus 5.5 Medium | 8,536 | 31,065 | 1.9 h | 181 | 540K | $24.08 |
| Opus 5.5 High | **7,181** | 30,261 | 6.0 h | 248 | 554K | $29.55 |
| Opus 5.5 XHigh | 10,948 | 47,303 | 4.4 h | 241 | 746K | $41.87 |
| Opus 5.5 Max | 7,245 | **28,650** | 4.5 h | 294 | 862K | $53.62 |
| Sonnet 5.5 Low | 11,011 | 38,050 | 45 min | 48 | 204K | $3.41 |
| Sonnet 5.5 Medium | 10,193 | 34,666 | 1.5 h | 163 | 429K | $13.73 |
| Sonnet 5.5 High | 8,640 | 33,527 | 1.6 h | 186 | 530K | $20.38 |
| Sonnet 5.5 XHigh | 10,388 | 39,146 | 3.4 h | 228 | 763K | $32.51 |
| Sonnet 5.5 Max | 8,200 | 28,833 | 8.7 h* | 494 | 962K | **$61.96** |

- Scores are weighted minutes late, lower is better. My baseline scores 26,387 on the public
  canal. Peak context is the most conversation a session held at once.
- \*I stopped Sonnet Max by hand after 8 hours 42 minutes. It was still tuning its solver, so its
  score and cost are where it was cut off.
- Opus won on both the public canal and the hidden ones at every level except XHigh.
- Sonnet's five runs cost $132.00 to Opus's $151.97, and that's with Sonnet Max still running up
  its bill when I stopped it.
- Hidden totals: Opus 174,411, Sonnet 174,222, within a tenth of a percent. Opus was 7% better on
  the public canal. From Medium to XHigh, Sonnet made fewer requests than Opus did.
- Opus XHigh's solver was the worst of all ten on the hidden canals, behind both Low runs, after
  four and a half hours and $42. Both XHigh runs came last among the Medium-and-up runs.
- Speed flipped from Loom. Here and on the music videos, Sonnet usually finished sooner.
- Re-reading the conversation was 64% of the Opus Max bill and 72% of the Sonnet Max one.
- Every page converged on the same design: a hillside of stepped pools, a timeline chart of the
  boats underneath and a score strip on top. All five Opus pages are cream again, but only two
  of the Sonnet pages went dark this time.
- Sonnet Max's conversation was summarized from 968,364 tokens down to 19,886. It was the only
  time that happened in all twenty Loom and Lockkeeper sessions.

</details>

## Test 3: a music video with no rules

Each session got four sentences: make a 30-second music video, any idea, any tool on this
machine. They ran one at a time on my laptop with ComfyUI (the app I run image,
video and song models in), Blender and my notes.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:1.2em 0">
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/opus-5-5-low.jpg" src="/gauntlet/music-video/opus-5-5-low.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Opus 5.5 Low · <em>Lantern Tide</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/sonnet-5-5-low.jpg" src="/gauntlet/music-video/sonnet-5-5-low.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Sonnet 5.5 Low · <em>Night Drive</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/opus-5-5-medium.jpg" src="/gauntlet/music-video/opus-5-5-medium.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Opus 5.5 Medium · <em>Last Tram to the Moon</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/sonnet-5-5-medium.jpg" src="/gauntlet/music-video/sonnet-5-5-medium.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Sonnet 5.5 Medium · <em>Moth Song</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/opus-5-5-high.jpg" src="/gauntlet/music-video/opus-5-5-high.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Opus 5.5 High · <em>Paper Lantern</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/sonnet-5-5-high.jpg" src="/gauntlet/music-video/sonnet-5-5-high.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Sonnet 5.5 High · <em>Night Shift</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/opus-5-5-xhigh.jpg" src="/gauntlet/music-video/opus-5-5-xhigh.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Opus 5.5 XHigh · <em>Neon Koi</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/sonnet-5-5-xhigh.jpg" src="/gauntlet/music-video/sonnet-5-5-xhigh.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Sonnet 5.5 XHigh · <em>Light Load</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/opus-5-5-max.jpg" src="/gauntlet/music-video/opus-5-5-max.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Opus 5.5 Max · <em>The Terrible Snail</em></figcaption></figure>
  <figure style="margin:0"><video controls preload="none" playsinline poster="/gauntlet/music-video/sonnet-5-5-max.jpg" src="/gauntlet/music-video/sonnet-5-5-max.mp4" style="width:100%;border-radius:8px;border:1px solid var(--pc-line,#ccc)"></video><figcaption style="font-size:14px">Sonnet 5.5 Max · <em>All at Once</em></figcaption></figure>
</div>

- **Effort decided the ambition.** Both Low runs made a synthwave sunset and a tune, all in code,
  in under ten minutes. From High up, every session wrote lyrics, made a sung song and animated
  every shot.
- **Max is where the ideas changed.** In Opus Max's video a knight from a medieval manuscript
  rides out to slay a beast with "two terrible horns". It's a smiling snail, and the last shot is
  the snail wearing his helmet. Sonnet Max made a lonely firefly flashing out of time with the
  others. They were the most original videos, and at $20 and $24 the most expensive.
- **Opus High's craft surprised me.** It chose a cut-paper look because paper should move
  stiffly, so the AI video's jerkiness reads as stop-motion.
- **Below Max they converged.** Four leads wear a yellow raincoat or rain cape. Only the snail is
  in daylight.

<details><summary>The music videos, session by session</summary>

| Session | Video | How it was made | Wall time | Cost |
|---|---|---|---|---|
| Opus 5.5 Low | Lantern Tide | Synthwave drawn in code, music synthesized in code | 9 min | $0.50 |
| Sonnet 5.5 Low | Night Drive | Synthwave drawn in code, music synthesized in code | 6 min | $0.27 |
| Opus 5.5 Medium | Last Tram to the Moon | Sung song, 6 painted shots, all animated | 56 min | $3.33 |
| Sonnet 5.5 Medium | Moth Song | Music in code, 10 painted stills with camera moves | 10 min | $0.60 |
| Opus 5.5 High | Paper Lantern | Sung song, cut-paper diorama, all animated | 62 min | $3.59 |
| Sonnet 5.5 High | Night Shift | Sung song, 7 painted shots, all animated | 58 min | $2.22 |
| Opus 5.5 XHigh | Neon Koi | Sung city-pop, 11 animated shots, karaoke lyrics | 1 h 41 min | $14.72 |
| Sonnet 5.5 XHigh | Light Load | Sung synth-pop, 9 animated Hopper-style shots, captions | 1 h 34 min | $9.73 |
| Opus 5.5 Max | The Terrible Snail | Medieval tavern ballad, 20 manuscript frames, 12 animated clips | 1 h 34 min | $20.11 |
| Sonnet 5.5 Max | All at Once | Sung song, gouache fireflies, 12 animated clips, lights synced to the kick | 1 h 45 min | $24.38 |

- Both Low runs never touched the graphics card. Opus Medium went all the way like the High
  runs. Sonnet Medium stopped halfway, at painted stills with camera moves, because animating
  would take about five minutes a clip.
- In Opus Max's video the horse throws the knight and his sword sparks off the snail's face.
  Knight-versus-snail fights are a real thing in the margins of medieval manuscripts, which is
  where it got the idea.
- Sonnet Max tested six painting styles and three motion styles before committing, rendered
  twenty takes of the song, and measured a median of 0 ms between the flashes and the beat. Every
  light in the frame goes dark on each sung "once" of the chorus and then pulses with every kick.
- Opus High only shows its character from behind, to avoid face problems. Sonnet High's song
  model kept mangling "brass robot", so it rewrote the lyric to "tin robot".
- Opus XHigh has its girl press PLAY on her Walkman exactly as the word "play" is sung. When my
  ComfyUI server crashed mid-render, it read my own troubleshooting notes, restarted it and
  re-rendered the clip that failed. Nobody asked it to.
- A fifth lead wears a mustard-yellow hoodie. Nine of the ten videos are set at night or dusk,
  several in the rain.
- None of them heard their own songs. Every session that made a sung song said so, and judged it
  by transcripts and spectrograms, which are pictures of the sound.
- Two Opus runs started a render in the background, said they'd pick things back up when it
  finished, and ended their turn. With nobody watching, that ends the session. My launcher now
  resumes any session that leaves no video in its folder.

</details>

## What the effort setting changes

Mostly how many steps the model takes. On the canal it barely changed how long the model thinks
per step. Low to Max, Opus took 9 times as many actions but thought only 1.7 times as long per
action. On the other two tests [a later recount](/ledger/what-drives-claude-code-cost/) found the
thinking did go up. Sonnet at Low thought more per step than at Medium. It just took a third
as many steps and stopped.

The Low music videos show it. They could have tried three ideas without thinking any harder, and
they didn't. I'd like two dials, one for how hard to think and one for how much to try. Until then
the fixes are outside the model: a prompt with a checklist, a stop hook that won't let the session
end until the list is done, or a high-effort agent handing a low-effort one the next thing to try.

<details><summary>My predictions, scored</summary>

I wrote these down before any results came in.

Loom:

- **Everybody passes the 15 public examples.** Right.
- **The hidden ten separate the field**, with the Low runs losing three or four. Wrong. Nobody
  missed a single one.
- **Sonnet uses more turns and the price gap closes.** Worse than that. It didn't just close, it
  flipped.
- **Max costs the most without a matching jump in score.** Right, and more so than I expected.
  Max cost 16 to 18 times Low for the same score.
- **The galleries say more than the scores.** Half right. Mostly they showed how alike the
  sessions were.

Lockkeeper:

- **At least two of the ten schedules are invalid somewhere.** Wrong. All of them were valid on
  all four canals.
- **The gap between runs is much bigger than in Loom, and the best solver beats my baseline by
  more than 80%.** Half right. The scores spread out, but the best schedule was 73% better.
- **Higher effort pays off more here than anywhere else.** Partly. Medium, High and Max beat Low
  on both models, but both XHigh runs dipped.

</details>
