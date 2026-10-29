---
id: "AO-026"
title: "Sonnet 5.5 is half the price of Opus 5.5 on paper. Across three long tests it was 2% cheaper."
summary: "Ten Claude Code sessions per test, both models at every effort level, run on an invented language, a canal-scheduling optimizer and a no-rules music video. Cache reads eat Sonnet's discount, Opus was at least as good, and effort turned out to be a dial for how much work gets done, not how hard the model thinks."
date: 2026-09-28
status: "shipped"
tags: ["claude-code", "gauntlet-loop", "agents", "cost", "lessons"]
series: ["agent-runs"]
preview:
  verdict: "Half price, same bill"
  takeaway: "Cache reads cost $0.20 per million on both models and are the biggest line on any long agent run, so Sonnet's discount only touches the rest of the bill."
  points:
    - "Sonnet cost 31% more on the invented-language test, with up to 2.4× the requests, and 13% less on the canal optimizer."
    - "Low effort isn't shallow, it does less: Low to Max, Opus took 9× the actions but thought only 1.7× as long per action."
    - "Max cost 16–18× Low for the same score, but bought the two most original music videos, one a knight losing to a snail."
  image: "/media/previews/sonnet-vs-opus-gauntlet.webp"
  loop: "/media/previews/sonnet-vs-opus-gauntlet.mp4"
  alt: "The last shot of Opus 5.5 Max's music video: a gold-shelled manuscript snail wearing the knight's plumed helmet"
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

### Loom: ten perfect scores, and a 22× spread in cost

**Every session passed all 15 public examples and all 10 hidden tests.** Every interpreter
was correct, every studio worked, and every gallery piece ran. The hidden edge cases I was
proud of didn't catch anyone. So Loom stopped being a correctness test and turned into
exactly the measurement I wanted: the same finished result, bought at ten different prices.

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

Requests, tokens and dollars come straight out of the session transcripts through Playback
Lens, including subagents (the XHigh and Max runs spawned one or two each). They're
API-equivalent dollars. \*Sonnet Max hit my plan's usage limit 73 minutes in and was resumed
in the same session after the limit reset, so its wall time includes the restart but its
tokens are exact.

**Sonnet was the more expensive model.** Summed over all five effort levels, the Opus runs
cost $60.92 and the Sonnet runs cost $79.97, for identical scores. Sonnet came out cheaper at
exactly one level, Medium, by 22%. At Low, High, XHigh and Max it cost more than Opus.

**The reason is the thing this whole post is about.** At the same effort, Sonnet made 1.2–2.4×
as many requests and re-read 1.3–3.4× as much cached conversation. Cache reads are the one
line where Sonnet isn't cheaper. On the Opus runs, cache reads were 18–32% of the bill. On
the Sonnet runs they were 47–60%. If Opus's own token counts had been billed at Sonnet's
prices, its runs would have cost $38.72. Sonnet actually spent $79.97. **For this kind of
work, Sonnet consumed roughly twice the tokens to finish the same job**, which is more than
its price discount gives back.

**Effort bought nothing measurable.** Low effort got the same 25/25 as Max on both models.
What Max bought was more gallery pieces (12–14 against 9–10), longer notes and bigger test
suites, at 16× the cost on Opus and 18× on Sonnet. Opus Low finished the whole task,
including a 119-test suite and screenshot checks of its own page in headless Edge, in under
eight minutes for two dollars.

**Against what I predicted:**

- **Everybody passes the 15 public examples.** Right.
- **The hidden ten separate the field.** Wrong. Nobody dropped a single one.
- **Sonnet uses more turns and the gap closes.** Worse than predicted: it didn't just close,
  it flipped.
- **Max isn't free.** Right, and more so than I expected: Max cost 16–18× Low for the same
  score.
- **The galleries say more than the scores.** Half right. See below.

### The galleries

Every piece of cloth from every session, woven by my reference interpreter using each
session's own colors. One row per session, in the table's order:

![Every gallery piece from all ten sessions, one row per session](/gauntlet/loom/gallery-wall.png)

The surprise is how alike they are. **All ten galleries include a tartan, nine a herringbone,
nine a sunset gradient, eight a houndstooth and seven a log cabin.** Ten independent sessions,
in a language that didn't exist until that evening, mostly reached for the same five famous
cloths. The differences are at the edges. Sonnet went further into color and whimsy:
rainbow lozenges, tiny hearts, a kaleidoscope, a barber pole. Opus stayed closer to a
weaving textbook: goose-eye, monk's belt, rosepath, an oat waffle. Higher effort mostly
bought more pieces, not stranger ones.

### The studios

Every studio works, and they don't look alike. **Four of the five Sonnet studios chose a
dark theme, and all five Opus studios kept a light workspace.**

The dark Sonnet studios look a lot like my own brand's night mode, warm near-black with
cream text and gold accents, so I checked whether they'd loaded my brand skill. They hadn't.
Every session could see that the skill exists, but none of them opened it, and the only one
of my exact colors that shows up anywhere is one gold in one Sonnet page. The Opus studios
landed near my *day* mode instead: cream paper, indigo, and a terracotta red within a shade
of mine. Same prompt, no brand guide, and the two models split my palette between them.
Apparently a loom makes both of them reach for the same handmade warmth I built the brand
around. The higher-effort Opus runs
drew real weaving-draft diagrams (threading across the top, lift plan down the side) that
nobody asked for. Click any one to open it: each is the exact single HTML file its session
wrote.

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

The [hidden tests](/gauntlet/loom/hidden/) are public now too, with their expected outputs.

### Lockkeeper: Opus takes the top three, and effort finally matters

**Every schedule from every session was valid, on all four canals.** Not one broke a rule,
including on the three hidden canals their solvers had never seen. What separated them was
how good the schedules were, and here, unlike Loom, the spread was real.

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

Scores are weighted minutes late: lower is better. My naive baseline scores 26,387 on the
public canal. \*I stopped Sonnet Max by hand after 8 hours 42 minutes. It was still tuning its
solver, and its score is what it had saved at that point.

**Opus won four of the five effort levels head to head**, on both the public canal and the
hidden ones. The best public schedule was Opus High's, 73% better than my baseline. The best
solver on unseen canals was Opus Max's. Sonnet won only at XHigh.

**Summed across all five levels, the two models tied on quality and Sonnet was cheaper.**
Their hidden totals came to 174,411 (Opus) and 174,222 (Sonnet), within a tenth of a
percent. Opus was 7% better on the public canal. Sonnet's five runs cost $132.00 to Opus's
$151.97, and that's with Sonnet Max still running up its bill when I stopped it. On this
task Sonnet wasn't the token hog it was on Loom: from Medium to XHigh it made fewer requests
than Opus did.

**Effort mattered here in a way it never did in Loom, but not in a straight line.** Medium,
High and Max beat Low on both models. Then both XHigh runs came in last among the Medium-and-up
runs, and Opus XHigh's solver was the worst of all ten on the hidden canals, behind both
Low runs, after four and a half hours and $42. One run per cell is a small sample, but the
same dip on both models is hard to ignore.

**Cache reads were even more of the bill.** On runs this long, the conversation being
re-read every turn is enormous. On the Max runs it was 64% (Opus) and 72% (Sonnet) of the
cost, higher than my overall history.

Every page works, and they all converged on the same design: a hillside of stepped pools, a
Gantt chart underneath, and a score strip on top. The theme split from Loom mostly didn't
repeat. All five Opus pages are cream again, but only two of the Sonnet pages went dark
this time.

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

## Why a session can run for nine hours now

Sonnet Max ran for eight hours and forty-two minutes on one prompt, alone: no subagents,
just one conversation. When I saw it was still going, my first question was how it could
possibly still have room to think.

It nearly didn't. At 3:21 AM its conversation hit **968,364 tokens**, a hair under the
million-token window, and Claude Code **auto-compacted** it: it summarized everything so far
into **19,886 tokens** and carried on. That was the only compaction in the entire gauntlet.
The peak context of each of the twenty sessions shows why the million-token window is the
real story. **Seventeen of the twenty went past 200,000 tokens**, which was the whole context
window for every Claude model until recently. Nine of the ten Lockkeeper runs did.

I didn't know auto-compaction had been there for so long. The history, checked against
Claude Code's changelog and release dates:

- **February 24, 2025**: Claude Code launches as a research preview. The context window is
  200K tokens.
- **March 18, 2025** (v0.2.47): three weeks later, "automatic conversation compaction for
  infinite conversation length" ships. It's been there ever since. These days it's just
  rarely needed.
- **July 11, 2025**: the auto-compact warning moves from 60% to 80% of the window.
- **August 2025**: the first 1M-token context window, in beta on Sonnet 4.
- **September 29, 2025**: Anthropic's [effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  post names the three tricks long-running agents depend on: compaction, keeping notes in
  files outside the conversation, and handing work to subagents with fresh context.
- **December 10, 2025**: auto-compaction becomes instant.
- **Early 2026**: the full million-token window becomes standard at normal prices from the
  4.6 models on, and compaction becomes an API feature anyone can use in their own agents.

So I think the feeling comes from two things changing at once.

**The ceiling moved fivefold.** In 2025, compaction was something you hit all the time and
felt: a pause, then a model that had forgotten the details. With a million tokens, a session
can do hours of real work before it ever has to forget anything, and when it finally does,
the summary is instant.

**The models got good at long work.** METR measures the length of task, in human time, that
an agent can finish half the time. In [March 2025](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
the best model managed about an hour, and the length was doubling every seven months. By
their [January 2026 update](https://metr.org/blog/2026-1-29-time-horizon-1-1/) the leader was
past five hours and the recent doubling time was about three months. My own
[Monster Hunter posts](/ledger/everything-sonnet-got-wrong/) are from summer 2025, pasting
code into a chat window by hand. This week ten sessions ran themselves for up to nine hours,
kept notes in files, tested their own work, and only one of them ever filled its head.

The part that actually felt insane is the part I had to do myself: noticing it was still
going and deciding it was enough. Nothing in the session was going to decide that for it.

### Test 3: a music video, with no instructions

For the last test I took the guardrails off. Each session got four sentences: make a
30-second music video; what it's about, how it looks and sounds, and how you make it are
up to you; use any local tool on this machine; leave the finished video in this folder.
That's it. No spec, no grader, no hidden tests. The sessions ran one at a time so each had
my laptop's GPU to itself, with everything I have installed available to them: ComfyUI and
its image, video and song models, Blender, and my own notes on how to use them.

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

**Effort decided the ambition, and it wasn't subtle.** Both Low runs never touched the GPU.
Each drew a synthwave sunset in Python and synthesized a tune: good-looking, done in under
ten minutes, and the minimum anyone could call a music video. From High up, every session
wrote its own lyrics, generated a sung song, painted keyframes, animated every shot and cut
the edit on the beat. Opus Medium did the same. Sonnet Medium stopped halfway: real painted
stills, but music written in code and camera moves instead of animation, explicitly
because animating would take about five minutes a clip.

**The craft at the top end surprised me.** Opus High picked a cut-paper diorama look *because*
paper is supposed to move stiffly, so the AI video's jerkiness reads as stop-motion, and it
only shows its character from behind to avoid face problems. Sonnet High's song model kept
mangling "brass robot", so it rewrote the lyric to "tin robot." Opus XHigh has its girl
press PLAY on her Walkman exactly as the word "play" is sung. When my ComfyUI server crashed
mid-render, Opus XHigh read my own troubleshooting notes, restarted it under a GPU lease and
re-rendered the clip that failed. Nobody asked it to.

**Max is where the ideas changed, not just the polish.** Opus Max made a comedy: a page of a
14th-century illuminated manuscript comes to life, a little knight rides out to slay a beast
with "two terrible horns," and the horns belong to a smiling snail with a gold-leaf shell. The
horse throws him, his sword sparks off its face, and the last shot is the snail wearing his
helmet. Knight-versus-snail fights are a real thing in the margins of medieval manuscripts,
which is where it got the idea. Sonnet Max made a lonely firefly flashing out of time with
the others, until every light in the frame goes dark on each sung "once" of the chorus and
then pulses with every kick. It tested six painting styles and three motion styles before
committing, rendered twenty takes of the song, and measured its own sync: a median of 0 ms
between the flash and the beat. These were the two most original ideas of the ten, and at
$20 and $24, the two most expensive.

**And, below Max, they converged again.** Four of the eight character videos put their lead
in a yellow raincoat or rain cape, and a fifth in a mustard-yellow hoodie. Nine of the ten
are set at night or dusk, several in the rain, under a moon, with warm lamplight everywhere. The two Low
runs independently chose synthwave sunsets. With complete freedom, the models reached for
the same few pictures, just like the ten tartans in Loom. The only video set in daylight is
the snail.

**One honest caveat that nobody fixed:** every session that made a sung song said, in its own
words, that it had never heard it. They judged their songs by transcripts and spectrograms.
They can see their videos, but they can't listen to them.

**A harness lesson.** A headless session ends when the model ends its turn. Two of the Opus
runs started a render in the background and politely said "I'll pick things back up when it
finishes," and in a headless run that's the end of the session. Nothing was going to wake
them. My launcher now treats "no video in the folder" as not finished and resumes the same
session with a note that its render is probably done. It's the same lesson as the nine-hour
session in reverse: the sessions don't know how to stop, and they don't know how to wait.

## What I learned

**Sonnet 5.5 is half the price on paper and roughly the same price in practice.** Over all
three tests, the Opus runs cost $255 and the Sonnet runs $249, about 2% cheaper. It was 31%
*more* expensive on Loom, 13% cheaper on Lockkeeper, and cheaper on the music videos. Cache
reads cost the same on both models, and they're the biggest line on any long agentic run,
so the discount only shows up on the parts that aren't reading the conversation again. Test
it on your own work before assuming it saves anything.

**Opus was at least as good, and neither model was simply faster.** Opus won four of five
head-to-heads on Lockkeeper and made both the best schedule and the best solver, and it
finished Loom faster at every effort level. On the long tests it flipped: Sonnet usually
finished sooner, and on the music videos sooner and cheaper. Sonnet made the most gallery
pieces and the more playful art. The honest summary is that the two are closer than the
price table suggests, in both directions.

**Effort is a work dial, not a thinking dial.** This is the finding I'll use most. I assumed
effort controlled how long the model thinks per step. It barely does. From Low to Max on
Lockkeeper, Opus took 9× as many actions but thought only 1.7× as long per action. Sonnet at
Low actually thought *more* per step than Sonnet at Medium; it just took a third as many
steps and stopped. Anthropic's own docs say the same thing plainly: effort affects every
token, including how many tool calls get made, and lower effort means fewer of them. Low
effort isn't shallow thinking. It's doing less.

That matters for creative work, where the search space is huge and nothing needs deep
reasoning. The Low music videos weren't dumb; they were lazy. They could have tried three
concepts or rendered on the GPU without thinking any harder at all, and they didn't. I'd
like two separate dials: how hard to think, and how much to try. Until then, the ways to get
high effort out of a light-thinking model are all outside the model: a prompt with an
explicit checklist, a stop hook that won't let the session end until the list is done, or a
high-effort director handing a low-effort worker the next thing to try. The one thing that
holds for every setting is that a model won't stop while part of the task is visibly
unfinished.

**Max was rarely worth it.** On Loom it cost 16–18× Low for the same perfect score. On
Lockkeeper it bought the best solver, but only just, for $54 and $62. On Lockkeeper's hidden
canals, both XHigh runs scored worse than both Low runs. The one place Max clearly earned its
price was the open-ended video, where it bought the only two ideas that didn't look like the
rest. More effort bought more work every time; it only sometimes bought a better result.

**Given freedom, they all reach for the same few things.** Ten tartans. Two synthwave
sunsets. Four yellow raincoats. The differences between the models were real but small next
to how much they agreed on what "good" looks like. If I want something nobody has seen, the
prompt has to ask for it, or I have to pay for Max. Left alone at any other setting, the
models give me what everyone has seen.
