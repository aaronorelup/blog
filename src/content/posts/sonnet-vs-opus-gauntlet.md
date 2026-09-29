---
id: "AO-026"
title: "Sonnet 5.5 is half the price of Opus 5.5 on paper, and about 25% cheaper in my bill"
summary: "Cache reads cost the same on both models, and cache reads are 97% of my tokens. So I'm running ten identical long-horizon sessions — both models, every reasoning level — to find out whether Sonnet's discount survives the extra tries it might need."
date: 2026-09-28
status: "in-progress"
tags: ["claude-code", "gauntlet-loop", "agents", "cost", "lessons"]
series: ["agent-runs"]
---

On the pricing page, Sonnet 5.5 costs half of what Opus 5.5 costs for everything except
one line: cache reads, which are $0.20 per million tokens on both. On my real usage that
one line is the biggest item on the bill, so repricing my history at Sonnet's rates makes it
about **25% cheaper, not 50%**, and that's before counting any extra turns Sonnet needs to
get the same job done.

That second part is the one I can't answer from a price table, so I'm running a gauntlet:
the same long task, handed to ten fresh Claude Code sessions (Opus 5.5 and Sonnet 5.5, at
every reasoning level from low to max), all at once. This post is a live file. It gets
updated as each run finishes.

## The price table

| Price per 1M tokens | Sonnet 5.5 | Opus 5.5 |
|---|---|---|
| Cache reads | $0.20 | $0.20 |
| Cache writes | $2.50 | $5 |
| Input tokens | $2 | $4 |
| Output tokens | $10 | $20 |

(Cache writes that last an hour instead of five minutes cost double the input price, $4 and
$8. About 15% of my writes are those.)

## What my usage actually looks like

I pulled every token I've ever spent in Claude Code (31.6 billion of them across 128,000
requests) with [Playback Lens](/ledger/reading-my-own-agents/) and split it by type:

| Type | Share of tokens | Share of cost at Opus 5.5 prices | Share at Sonnet 5.5 prices |
|---|---|---|---|
| **Cache reads** | **97.0%** | **45%** | **62%** |
| Cache writes (5-min + 1-hour) | 2.5% | 34% | 24% |
| Output | 0.43% | 20% | 14% |
| Uncached input | 0.01% | ~0% | ~0% |

**Cache reads are the bill.** Claude Code re-sends the whole cached conversation on every
single turn. An average Opus 5.5 request of mine reads about 334,000 cached tokens and
writes about 1,000 tokens of output. Uncached input is basically nothing: about 2 tokens per
request, so the "$2 vs $4 input" line on the pricing page doesn't touch me at all.

Some exchange rates, at Opus 5.5 prices:

- **1 output token = 100 cache reads = 4 cache writes = 5 input tokens.**
- A million output tokens ($20) costs the same as a hundred million cache reads.
- At Sonnet prices, 1 output token = 50 cache reads. Output got cheaper; reads didn't.

Holding my token counts exactly fixed and swapping the price list:

| Usage | Opus 5.5 | Sonnet 5.5 | Sonnet saves |
|---|---|---|---|
| All my history | $13,479 | $9,802 | **27%** |
| Only my Opus 5.5 sessions | $4,771 | $3,607 | **24%** |

These are API-equivalent dollars. I'm on a Max plan, so the real constraint is the usage
limit, but the ratios are the same either way.

The catch is in "holding my token counts fixed". If Sonnet needs more turns to finish the
same job, every extra turn re-reads the whole conversation at the same $0.20. Mistakes cost
turns, and my work is mostly long-horizon: build, test, fix, test again. Fewer mistakes is
worth a lot of cache reads.

## The gauntlet

Ten sessions, one prompt, no human in the loop:

| | Low | Medium | High | XHigh | Max |
|---|---|---|---|---|---|
| **Opus 5.5** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Sonnet 5.5** | ✓ | ✓ | ✓ | ✓ | ✓ |

(Medium is what I normally run Opus at. A lot of people run Opus at max.)

Each session is a headless `claude -p` run with its own model and effort flag, in its own
folder, told not to look at its neighbors. Every one gets a known session ID, so afterwards
I can read its exact token usage out of the transcript instead of estimating. None of them
is told how long the task should take. I sized it at one to two hours of real work.

There are two tasks, run one after the other.

### Test 1: Loom

I invented a small programming language, LOOM, whose programs describe woven cloth: warp
threads threaded onto shafts, treadles, a shuttle that cycles weft colors, threads that
cross and drift, and a "float" rule that fails the program if a thread runs loose for too
long. The spec is four pages and deliberately precise, down to the exact text of every error
message and which of two errors wins when both apply.

Each session has to build:

- **An interpreter** with a command-line runner whose output is compared to mine character
  for character.
- **LOOM Studio**, a single self-contained HTML page with an editor, a loom view that
  animates the weaving pick by pick, a step debugger with a scrubber, errors that point at
  the right line, and a live conformance panel.
- **A gallery of at least eight original pieces** written in a language that didn't exist
  until tonight.
- **Its own test suite and notes.**

They get 15 example programs with expected output. I kept 10 more to myself: edge cases the
spec defines but the examples never show, like whether a float counter remembers rows woven
before float checking was turned on (it does), whether a structural error on line 4 beats a
runtime error on line 3 (it does), and whether `(a b) *2` with a space is legal (it isn't).
The public examples tell you whether a session can follow instructions. The hidden ten tell
you whether it actually read the spec.

Here are the [prompt](/gauntlet/loom/PROMPT.txt) and the [spec](/gauntlet/loom/LOOM_SPEC.txt)
exactly as the sessions got them.

**What I expect, written down before any results so I can be wrong in public:**

- **Everybody passes the 15 public examples.** They can see the answers and iterate until
  they match.
- **The hidden ten separate the field.** I'd guess Opus at high and above lands 9 or 10,
  and the low-effort runs of both models lose three or four, mostly on the order-of-checks
  rules and the float edge cases.
- **Sonnet uses more turns, and the gap in cost shrinks.** If Sonnet takes 30% more turns to
  converge, its 25% discount is gone, because each turn re-reads the whole conversation.
- **Max effort isn't free.** More thinking tokens are output tokens, the most expensive kind.
  I expect max to cost the most on both models without a matching jump in the hidden score
  over xhigh.
- **The galleries will say more than the scores.** Getting the interpreter right is table
  stakes. Designing eight pieces of cloth in a brand-new language is where taste shows up.

### Test 2: The Lockkeeper's Ledger

The second task starts when all ten Loom sessions are done. Loom rewards careful reading.
This one rewards search, and it produces a single number for ranking all ten.

I rewrote it after the first Loom results came in. The two low-effort runs both scored 10/10
on my hidden suite and finished in 8 and 10 minutes, so Loom clearly wasn't going to
separate anyone. Lockkeeper got three more rules, hidden test canals and a live re-planning
requirement before it ran.

It's a fictional canal climbing a hill through nine locks, with 40 boats (narrowboats and
barges, going up and down) that each have a release time, a deadline and a priority, over
two days with the locks closed at night. The invented part is the water. Every time a lock
fills, it takes its chamber's worth of water out of the pool above it. The only new water is
a feeder stream trickling into the summit pool at one unit a minute and spilling down over
weirs. A pool can't drop below its minimum, so a lockkeeper who fills locks carelessly
drains the canal and then has to sit and wait for the hill to refill.

On top of that:

- **Three keepers for nine locks.** Ada, Bert and Cass work every operation in person and
  have to walk the towpath between locks. Getting the crew in the right place is its own
  scheduling problem.
- **A maintenance closure** shuts Lock 5 for two hours in the middle of day one.
- **Priorities.** A priority-3 boat's late minutes count triple.
- **Shared chambers and wrong-side chambers.** Two narrowboats going the same way can share
  a chamber. A chamber on the wrong side has to be turned empty first, which costs time and,
  going up, water.

Each session has to deliver:

- **A solver** (`node solve.js canal.json`) that I also run on **three canals it has never
  seen**, with different sizes, crews, closures and feeder rates, under a two-minute limit.
  That's the Lockkeeper version of Loom's hidden tests: it catches solvers that only work on
  one input.
- **Its best schedule** for the public canal, checked by my simulator. One broken rule makes
  it invalid, and an invalid schedule scores nothing. Valid schedules are ranked by weighted
  minutes late.
- **Its own validator**, because anyone who skips testing will hand in an invalid schedule.
- **The Lockkeeper's Ledger**, a page that animates the canal (water levels rising and
  falling, chambers filling, boats moving, keepers walking, night falling) next to a Gantt
  chart, and explains every delay in plain language, like "Kingfisher waited 14 minutes at
  Lock 6 because no keeper was free: Ada was working Lock 2".
- **A disruption mode**: close a lock or delay a boat in the page, press re-plan, and it
  re-solves in the browser and shows who got later and why.

For scale, I wrote two baseline dispatchers to prove every canal, including the hidden ones,
can be solved at all. Sending the most urgent waiting boat through with the nearest free
keeper is valid on the public canal but comes to **26,387 weighted minutes late**, with 32
of 40 boats late. Neither baseline plans ahead, and both are bad at moving keepers.

Here are the [prompt](/gauntlet/lockkeeper/PROMPT.txt), the
[rules](/gauntlet/lockkeeper/LOCKKEEPER_SPEC.txt) and the
[public canal](/gauntlet/lockkeeper/canal.json). The hidden canals get published with the
results.

**What I expect:**

- **Some schedules will be invalid.** Water accounting has an exact order of events within
  a minute, and keeper walking times make every operation depend on another lock's
  operations. I'd bet at least two of the ten fail somewhere across the four canals.
- **The gap between runs will be much bigger than in Loom.** There's no ceiling. I expect
  the best solver to cut the baseline by more than 80%.
- **Higher effort pays off more here than anywhere else.** Search problems reward thinking
  about the approach before writing code.

## Results

Pending. The ten Loom sessions started tonight. Each one's studio will be embedded here,
side by side, with its hidden-test score, turns, tokens, wall-clock time and API-equivalent
cost.
