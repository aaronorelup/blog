---
id: "AO-076"
title: "How my blog's AI Ask box reads every post before answering"
summary: "RAG Goobie, the AI Ask box on my ledger of posts, now reads all of them in full before answering. How each step works, how the rebuild was tested, what a question costs, and how to build your own."
date: 2026-11-02
topic: "site"
project: []
draft: true
preview:
  verdict: "Whole blog beat snippets"
  takeaway: "RAG Goobie now reads every post on my ledger in full for each question. A cache keeps that near $0.002, and answers got 80% of the key facts, up from 63%."
  points:
    - "In 2 of 80 test answers RAG Goobie spoke as me. A tune-up is fixing that now."
    - "A question that misses the cache costs up to $0.085. A $2 daily cap makes the worst case an outage, not a bill."
    - "On 30 harder unseen questions, the new version scored 5.4 points under the main test, 0.4 past the 5 allowed."
  image: "/media/previews/how-rag-goobie-works.webp"
  alt: "RAG Goobie's answer on a phone: a music video's 37 clips and 22 images took 2 hours 8 minutes on one rented card for $2.44, each claim cited"
---

RAG Goobie is the Ask box on [my ledger](/ledger/) (the list of my posts), the little owl that answers questions
from my posts and cites the passages behind each answer. The old version saw only 6 snippets, about 2 posts'
worth, per question, so I had Claude Code, Anthropic's AI coding agent, design, build and test a new one, which
went live on 2 November. **RAG Goobie now reads every post on the ledger in full before answering, about 283,000
tokens at 71 posts, and a cache keeps that at about $0.002 a question.** On 50 test questions, the new answers got
about 80% of the facts a good answer needs, the old version 63%.

RAG stands for retrieval-augmented generation: look things up first, then have an AI language model write the
answer from what turned up. A token is the unit these models count text in, a word or a piece of one.

- **Reading everything beat searching for snippets.** The old search almost always found the right post but missed
  everything around it.
- **The order of the prompt keeps the cost down.** DeepSeek, the AI model RAG Goobie runs on, charges a fiftieth
  for the start of a prompt it has already seen. My posts go first and the question last, so from the second
  question on, 99.9% of the prompt comes from that cache.
- **Search is still there, as a hint.** A quick first AI call picks likely posts, a search adds its best, and the
  top 6 are named to the model as the most related. In the design tests the hint lifted vague questions from 57%
  to 71% of their facts.
- **A cold question costs nearly 40 times more.** After a change to the rules, or if the cache empties, the next
  question reads everything at full price, $0.085 at peak hours. A new post costs the next one only about $0.017
  (estimated), since it goes after the others. A $2 daily cap that can't be passed makes the worst case an
  outage, not a bill.
- **The new version passed the main test and missed one bar on a blind test by 0.4 points.** Another Claude agent
  wrote those 30 questions. They were harder for the old version too, so after an independent check the new
  version shipped.
- **There are still slips.** In 2 of 80 test answers, RAG Goobie spoke as me. A tune-up is fixing that now.

<ao-compare cols="2" aspect="1170/1090">
<figure><img src="/media/how-rag-goobie-works/working-phone.webp" alt="RAG Goobie on a phone, working on the question Is renting a cloud GPU worth it?: ticked steps for reading the catalog of 71 posts, picking 7, searching 5 ways and reading all 71 posts in full, then Writing, with the first words of the answer" loading="lazy"><figcaption><b>While RAG Goobie works.</b> <span class="ao-meta">A real answer recorded during testing, when the blog had 71 posts, replayed through the live page, which counted 72 by then.</span></figcaption></figure>
<figure><img src="/media/how-rag-goobie-works/answer-phone.webp" alt="The end of the same answer: a 37-clip render list took 2 hours 8 minutes for $2.44, each claim cited, then the line Read all 71 posts in full, 283k tokens, 99.9% from cache, 4.5 s, $0.0011, and the cited post below" loading="lazy"><figcaption><b>Done.</b> <span class="ao-meta">What RAG Goobie read, how much came from the cache, the time and the cost. It was asked off-peak, at half price. The question is one of the examples in the box, so you can ask it too. The answer cites <a href="/ledger/renting-a-gpu/">my rented-GPU post</a>.</span></figcaption></figure>
</ao-compare>

## What happens when you ask

After a few checks there are five steps, and the page shows each one as it happens.

<figure>
<svg class="rgd" viewBox="0 0 400 734" width="400" height="734" role="img" aria-labelledby="rgd-t rgd-d" xmlns="http://www.w3.org/2000/svg">
<title id="rgd-t">What RAG Goobie does with a question</title>
<desc id="rgd-d">Your question passes the checks. A planner picks likely posts and writes searches. The search pulls the passages closest in meaning, and the planner's picks, then the search's best, are the 6 most related posts. One prompt in a fixed order holds the rules, every post in full, a live notebook and finally the hint and your question. The answer streams in with every citation checked, and the bill is settled.</desc>
<style>
figure:has(> .rgd){margin-inline:0}
.pc-prose pre[data-language="text"]{white-space:pre-wrap}
.rgd{display:block;max-width:100%;height:auto;margin:8px auto 0}
.rgd text{font-family:var(--font-body);fill:var(--pc-body);font-size:14px;letter-spacing:0}
.rgd .rgd-h{fill:var(--pc-strong);font-size:15.5px;font-weight:600}
.rgd .rgd-b{fill:var(--pc-strong);font-size:14px}
.rgd .rgd-s{fill:var(--pc-soft);font-size:13.5px}
.rgd .rgd-n{fill:var(--pc-page);font-size:13px;font-weight:600;text-anchor:middle}
.rgd .rgd-box{fill:var(--pc-tile);stroke:var(--pc-line2);stroke-width:1}
.rgd .rgd-dot{fill:var(--pc-head)}
.rgd .rgd-ar{stroke:var(--pc-line2);stroke-width:1.5;fill:none}
.rgd .rgd-q{fill:none;stroke:var(--pc-accent);stroke-width:1.5}
.rgd .rgd-qt{fill:var(--pc-accent);font-size:15px;font-weight:600;text-anchor:middle}
.rgd .rgd-mid{text-anchor:middle}
.rgd .rgd-gold{fill:var(--pc-head);fill-opacity:.16;stroke:var(--pc-head);stroke-width:1.2}
.rgd .rgd-grey{fill:var(--pc-line);stroke:var(--pc-line2);stroke-width:1}
.rgd .rgd-new{fill:var(--pc-accent);fill-opacity:.14;stroke:var(--pc-accent);stroke-width:1.2}
.rgd .rgd-br{stroke:var(--pc-head);stroke-width:1.5;fill:none}
.rgd .rgd-gt{fill:var(--pc-head);font-size:13.5px;font-weight:600}
.rgd .rgd-at{fill:var(--pc-accent);font-size:13.5px;font-weight:600}
</style>
<rect class="rgd-q" x="110" y="6" width="180" height="34" rx="17"/>
<text class="rgd-qt" x="200" y="28">Your question</text>
<text class="rgd-s rgd-mid" x="200" y="59">bot check, rate limits, the day's cap</text>
<path class="rgd-ar" d="M200 66V84M194 78l6 7 6-7"/>
<rect class="rgd-box" x="12" y="88" width="376" height="74" rx="14"/>
<circle class="rgd-dot" cx="34" cy="110" r="11"/>
<text class="rgd-n" x="34" y="114.5">1</text>
<text class="rgd-h" x="54" y="115">The planner</text>
<text x="54" y="136">reads one line about every post, picks</text>
<text x="54" y="153">up to 8 posts and writes up to 4 searches</text>
<path class="rgd-ar" d="M200 164V182M194 176l6 7 6-7"/>
<rect class="rgd-box" x="12" y="186" width="376" height="91" rx="14"/>
<circle class="rgd-dot" cx="34" cy="208" r="11"/>
<text class="rgd-n" x="34" y="212.5">2</text>
<text class="rgd-h" x="54" y="213">The search</text>
<text x="54" y="234">the question and each search pull the 100</text>
<text x="54" y="251">closest passages, merged by rank</text>
<text x="54" y="268">the 6 most related: picks first, then these</text>
<path class="rgd-ar" d="M200 279V297M194 291l6 7 6-7"/>
<rect class="rgd-box" x="12" y="301" width="376" height="232" rx="14"/>
<circle class="rgd-dot" cx="34" cy="323" r="11"/>
<text class="rgd-n" x="34" y="327.5">3</text>
<text class="rgd-h" x="54" y="328">One prompt, always in the same order</text>
<rect class="rgd-grey" x="28" y="343" width="200" height="20" rx="4"/>
<text class="rgd-s" x="38" y="357.5">the rules</text>
<rect class="rgd-gold" x="28" y="367" width="200" height="102" rx="4"/>
<text class="rgd-b" x="38" y="399">every post in full,</text>
<text class="rgd-b" x="38" y="417">oldest first, with its</text>
<text class="rgd-b" x="38" y="435">notes page if it has one</text>
<path class="rgd-br" d="M236 343h6V469h-6"/>
<text class="rgd-gt" x="250" y="392">the same bytes</text>
<text class="rgd-gt" x="250" y="410">every time, read</text>
<text class="rgd-gt" x="250" y="428">from the cache</text>
<rect class="rgd-grey" x="28" y="473" width="200" height="24" rx="4"/>
<text class="rgd-s" x="38" y="489.5">a live notebook</text>
<text class="rgd-s" x="250" y="489.5">re-read when edited</text>
<rect class="rgd-new" x="28" y="501" width="200" height="24" rx="4"/>
<text class="rgd-at" x="38" y="517.5">the hint and your question</text>
<text class="rgd-at" x="250" y="517.5">new every question</text>
<path class="rgd-ar" d="M200 535V553M194 547l6 7 6-7"/>
<rect class="rgd-box" x="12" y="557" width="376" height="74" rx="14"/>
<circle class="rgd-dot" cx="34" cy="579" r="11"/>
<text class="rgd-n" x="34" y="583.5">4</text>
<text class="rgd-h" x="54" y="584">The answer streams in</text>
<text x="54" y="605">DeepSeek writes it. Every citation is checked</text>
<text x="54" y="622">against the real sections, unknown ones dropped</text>
<path class="rgd-ar" d="M200 633V651M194 645l6 7 6-7"/>
<rect class="rgd-box" x="12" y="655" width="376" height="74" rx="14"/>
<circle class="rgd-dot" cx="34" cy="677" r="11"/>
<text class="rgd-n" x="34" y="681.5">5</text>
<text class="rgd-h" x="54" y="682">The bill is settled</text>
<text x="54" y="703">the real cost replaces the worst case</text>
<text x="54" y="720">that was set aside before any call</text>
</svg>
<figcaption><b>One question, start to finish.</b> <span class="ao-meta">The gold block is the same on every question, which is what keeps the cost down.</span></figcaption>
</figure>

- **Checks.** Cloudflare Turnstile, a bot check that usually stays invisible, then rate limits, a
  300-character limit and the day's dollar cap. Nothing is keyed on your IP address.
- **The planner's searches are never shown or passed on**, since a question can try to slip instructions in.
- **The prompt.** A post's notes page (the longer making-of some have) goes in with it. The live notebook is one
  post other agents add to all day. Every post says who wrote it, me or Claude.
- **The answer** streams from DeepSeek's Flash model. In testing the first words came after about 4 seconds, all
  of it after about 5 and a half.
- **The bill.** The worst case, about $0.10, is set aside against the day's $2 before any call.

<details><summary>Every step, with its time limits</summary>

| step | what it does | time limit |
|---|---|---|
| checks | a request under 2 KB, a valid 30-minute session, Ask switched on, a question of 3 to 300 characters, the two rate limits, the answer cache, the day's question count, the dollar reservation | |
| planner | one DeepSeek call that answers in JSON (structured data), at temperature 0 (as little variation as it can), at most 300 tokens: up to 4 searches, topics, up to 8 picked posts | 8 s |
| search | the question looked up while the planner runs, then its searches turned into embeddings (text as numbers, by meaning) in one call, each looked up for its 100 closest passages, and the lists merged by rank (reciprocal rank fusion, k 60) | 5 s each |
| prompt | rules, every post with its notes page in AO-number order (oldest first), the live notebook, a one-line overview of the blog, then the count of close matches, the 6 most related and the question | |
| answer | DeepSeek Flash, thinking off (no step-by-step reasoning first), temperature 0.2 (a little variation), at most 600 tokens, streamed | first words 30 s, all 60 s |
| after | settle the reservation to the reported usage, keep the answer 7 days, one log line that never holds the question | |

- **A failed step is skipped.** No plan means the question alone is searched. No search still leaves every post
  in the prompt.
- **The planner's searches are never shown, logged or sent to the answer.** In the design tests it copied an
  injected request into its searches. That's harmless only because the search can reach only the posts on the
  ledger.
- **The hint is the planner's picks first, then the search's best.** It holds 6 posts, so on the 30 of the 50
  test questions where the planner picked 6 or more, the search added nothing to it.
- **The live notebook only enters the ranked list when the planner picks it.** Otherwise it took a top-6 slot in
  23% of questions.
- **The model writes `[45.2]` for a section, `[45.N3]` for a notes section or `[45]` for a post.** Each is
  resolved against the build's map, an unknown one is dropped, the rest are numbered by post, and em dashes
  become commas.
- **A reader who leaves doesn't stop the run.** It keeps going in the background, so the bill is settled and the
  answer cached. A repeat question comes from that cache for $0 in about 0.1 seconds.

</details>


## Why reading everything is cheap

At peak hours DeepSeek charges $0.30 per million tokens it reads fresh and $0.006 per million from its cache,
which matches a prompt from its start up to the first thing that changed. A warm question reads about 283,000
tokens from the cache and a few hundred fresh: $0.0022 at peak, about $0.0011 off-peak. The cache held through
idle gaps of one and two hours. Longer gaps are still being measured.

The old Ask cost $0.0006 a question, for about 160 times less text.

<ao-calc>
<ul><li data-var="posts" data-min="10" data-max="150" data-step="1" data-value="71">Posts on the blog</li>
<li data-var="size" data-options="1,500 tokens:1500|4,000, like mine:4000|8,000 tokens:8000" data-value="4,000, like mine">Prompt tokens per post</li>
<li data-var="q" data-min="1" data-max="1000" data-step="1" data-value="100">Questions a day</li>
<li data-var="cold" data-min="0" data-max="20" data-step="1" data-value="1">Cold questions a day</li>
<li data-var="when" data-options="Peak:1|Off-peak:0.5" data-value="Peak">DeepSeek's hours</li></ul>
<ol><li data-f="posts * size" data-unit="tokens">The prompt</li>
<li data-f="posts * size / 10000" data-unit="percent">Share of the 1M tokens DeepSeek can read at once</li>
<li data-f="(posts * size * 0.000000006 + 0.0005) * when" data-prefix="$" data-digits="4">A warm question</li>
<li data-f="(posts * size * 0.0000003 + 0.0004) * when" data-prefix="$" data-digits="3">A cold question</li>
<li data-f="30 * (max(0, q - cold) * (posts * size * 0.000000006 + 0.0005) + min(cold, q) * (posts * size * 0.0000003 + 0.0004)) * when" data-prefix="$" data-digits="2">A month</li></ol>
<figcaption><b>What this would cost on your blog.</b> <span class="ao-meta">An estimate from DeepSeek's prices on 1 November and the averages Claude measured on my blog. Mine comes to about 4,000 tokens a post, counting the rules and the live notebook. At 71 posts it gives 284,000 tokens, $0.0022 warm and $0.086 cold at peak, against the measured 283,000, $0.0022 and $0.085. At about 141 posts mine switches to reading part of the blog per question, so past about 560,000 tokens these numbers stop holding.</span></figcaption>
</ao-calc>

<details><summary>Every cost, and the dollar cap</summary>

At peak prices, Monday to Friday 01:00 to 04:00 and 06:00 to 10:00 UTC. Off-peak is half.

| case | cost |
|---|---|
| a warm question, planner included | $0.0022 mean, $0.0024 at most |
| a warm question off-peak, measured | about $0.0011 |
| a cold question, all 283,000 tokens read fresh | $0.085 (off-peak, measured: $0.043) |
| the first question after the live notebook changes | $0.016, estimated |
| the first question after a new post | $0.017, estimated |
| a repeat from the answer cache | $0, 0.1 s |
| at 1,000 posts, warm or cold | about $0.028 or $0.15, estimated |

DeepSeek's Flash prices per million tokens: $0.006 from the cache, $0.30 fresh, $1.20 written, all halved
off-peak. Chinese public holidays are billed off-peak but counted as peak here, so a cost is only ever
overstated.

The calculator uses those prices and three averages from the shipped run's 49 warm answers: about 325 tokens
read fresh (196 to 351), 175 written, and about $0.0002 for the planner at peak. So a warm question is the prompt
times $0.006 per million plus $0.0005, and a cold one the prompt times $0.30 per million plus $0.0004.

**The dollar cap.** Before any call, the worst case is reserved: every token read fresh at peak, for the planner
and the biggest answer prompt, about $0.10 at 71 posts and $0.23 at 1,000 posts. One database statement adds it
only if the day stays under its cap. Afterwards the reservation settles to the usage DeepSeek reported, on the
reservation's own day. A refused call bills nothing, and a call whose usage never came keeps its reservation.

- $2 a day is at most about $60 a month. That's about 900 warm or 23 cold questions, and at most 20 running at
  once.
- When the day's $2 is spent, RAG Goobie rests until 00:00 UTC and shows the closest posts from one lookup, with no model
  call.
- Right after a change to the rules, about 22 cold questions arriving together could spend it. That's an outage
  until midnight, never a bill.
- A second backstop counts questions: 1,000 a day reaching DeepSeek.
- Designing, building and testing all this cost about $2.81 of DeepSeek: $0.69 for the design tests, $0.35 for
  checking the platform's limits and $1.77 for building and testing.
- Tested locally: the day's total matched the settled costs exactly, a cap under one reservation rested the
  first question with no model call, and a cap of two reservations let exactly 2 of 6 parallel questions through.
- It lives in the database (Cloudflare D1), not Cloudflare's rate limiter, because the rate limiter counts per
  location, roughly, in 10 or 60 second windows. That's a throttle, not a spending cap.

</details>

<details><summary>Speed</summary>

Measured against a local copy of the Worker (the small server program behind the Ask box) with the real search
and DeepSeek behind it.

| | median | 90th percentile |
|---|---|---|
| first step on screen | | 41 ms |
| planner done | | 2.0 s |
| first words of the answer | 4.4 s | |
| the whole answer | 5.5 s | 6.2 s |

- The first question of the run, a cold one, took 8.9 s. That's a single call, not a median.
- On the blind test's 30 questions: first words 4.1 s and the whole answer 5.2 s at the median, 5.8 s at the
  90th percentile.
- DeepSeek reading the prompt sets the pace. In the platform tests a cold 666,000-token prompt took 10 to 11.5
  seconds to its first token, a cached one 2.4 to 3.3.
- A stalled model was simulated. With 25 seconds to the first token, RAG Goobie still answered. With a 35-second
  stall, RAG Goobie gave up at 31 seconds with a busy message and kept the reservation.

</details>

<details><summary>How long the cache holds</summary>

In the design tests the cache held through idle gaps of 6, 10, 18 and 37 minutes. On the shipped prompt, about
283,000 tokens, 99.93% came from the cache at the start, after an hour with no calls, and after a further two
hours. Gaps of 4 and 8 hours are still running. DeepSeek's docs say an unused cache is cleared "usually within a
few hours to a few days". A keep-warm call (a dummy question that keeps the cache full) stays unbuilt unless a
gap empties it.

- A new prompt was usable from the cache 0, 2 and 10 seconds after the first call.
- Parallel cold calls all pay full price: 4 at once on a new prompt all missed, and 4 a moment later all hit.
- An edit to the live notebook, which sits after the posts, re-reads only its own tokens. In the design tests,
  an edit at its very top cost $0.011 once, against $0.091 for the whole prompt cold.

</details>

<details><summary>Sizes, caps and 1,000 posts</summary>

The build estimates tokens as characters divided by 3.5, about 10% over DeepSeek's real count here (313,822
estimated against 282,831 real on the first cold call), so every cap sits on the safe side.

| cap | value | at 71 posts |
|---|---|---|
| the answer call's whole input | 700,000 est., 70% of the 1M window | 314,000 est., 283,000 real |
| whole blog in one prompt | while the posts fit under 600,000 est. | 264,000 est. |
| one pack in split mode | 375,000 est. | 1 pack |
| one post with its notes page | 36,000 est., the top kept past it | largest 16,200 est. |
| the live notebook | 60,000 est., its start and newest end kept | 48,400 est. |
| the catalog, a line on every post | 80,000 est. | 5,000 est. |

- **Split mode** starts at about 141 posts at current sizes, around late January 2027. Posts are grouped into
  packs in AO order, and a question gets the pack holding most of its likely posts, then the catalog, then its
  likely posts outside that pack, then more of its ranked list until those extras reach 40,000 est. tokens. A
  drill on the 71 posts in 4 packs of 90,000 got 80.7% of the must-have facts, 7.52 out of 10 and 6 of 6 handled,
  with every right post in the prompt. A question read 148,000 tokens, 52% from the cache. Run again on 20 of the
  questions with 40,000 extra tokens instead of 80,000, a question read 113,000, 82% from the cache, for $0.0035
  off-peak (about $0.007 at peak), and got 82.5% of the facts against 83.1% with 80,000.
- **At 1,000 posts** (synthetic): 11 packs, the largest 374,000 est., a 55,000 est. catalog, the biggest
  question 493,000 est., under the 700,000 budget. The whole blog would be about 3.9 million tokens by then, so
  it couldn't be one prompt.
- Answer quality is only measured up to about 304,000 tokens. The build prints a warning to re-test at 450,000
  in the pack.

</details>

## How the new version was tested

Claude wrote 50 test questions of 7 kinds, including 4 the blog doesn't cover and 2 that try to trick RAG Goobie, each
with the facts a good answer must contain. A judge model, DeepSeek with its step-by-step reasoning switched on,
scored each fact. One judge pass is good to about 3 points either way, so every flag about who did what was read by
hand too.

<ao-bars unit="%" max="100">
<table><thead><tr><th>On the 50 test questions</th><th>Old Ask, 6 excerpts</th><th>RAG Goobie now</th></tr></thead>
<tbody><tr><td>Facts a good answer needs</td><td>63.1</td><td>79.5</td></tr>
<tr><td>On questions that need several posts</td><td>41.1</td><td>78.1</td></tr>
<tr><td>On vague questions</td><td>36.8</td><td>67.4</td></tr>
<tr><td>Cited the section that holds the answer</td><td>59.1</td><td>84.1</td></tr>
<tr><td>Not-covered and trick questions handled</td><td>66.7</td><td>100</td></tr></tbody></table>
<figcaption><b>Before and after, same questions, same judge.</b> <span class="ao-meta">The old Ask was re-run on 2 November with the same judge. Cited: 26 of 44 answerable questions against 37. Handled: 4 of 6 against 6 of 6.</span></figcaption>
</ao-bars>

- **The new version cleared the bars on the main test.** 79.5% against a bar of 78, a score of 7.53 out of 10
  against 7.2, every tricky question handled. On who did what, the judge's count was one short of its bar, but
  read by hand only 2 answers slipped, within the limit of 3.
- **One prompt order failed.** With the catalog (a line about every post) after the posts, a second run credited
  Claude's work to me or spoke as me 5 times, so a one-line summary of the blog shipped in its place.
- **The blind test was harder for everyone.** RAG Goobie got 74.1% of the facts on the 30, 5.4 points below the
  main set. The old Ask dropped 6.6 points. Three more Claude agents agreed the questions were harder, not that
  the new version was tuned to the test.

<details><summary>What the old Ask missed</summary>

The old Ask looked the question up once in the same index the ledger's search uses, dropped anything under a
similarity score (how close in meaning, from 0 to 1) of 0.5, and sent at most 6 excerpts (6,000 characters) to
DeepSeek's Flash model. Its prompt was about 1,700 tokens.

- **The right post was there.** A right post was in the old search's top 3 for 95% of answerable questions.
- **The breadth was missing.** 6 excerpts covered 2.2 posts on average. Questions that need several posts found
  62% of their posts, vague ones 54%. Only 59% of answers had the section that holds the answer in their
  excerpts.
- **The 0.5 floor separated nothing.** The best match scored 0.486 to 0.723 for answerable questions (median
  0.620), 0.464 to 0.550 for ones the blog doesn't cover (median 0.484) and 0.525 to 0.597 for the trick
  questions. 43 of 44 answerable questions got through, but so did 4 of the 6 that should have been turned away,
  and one good answer was blocked though its post ranked first. Ranks work better than a fixed bar.

</details>

<details><summary>The design tests: five ways to answer</summary>

Before building anything, Claude measured five ways of answering on the same 50 questions. These used an earlier
judge, which scored the old Ask 57%. The final judge gave it 63%. "Handled" counts the 6 questions the blog
doesn't cover or that try a trick.

| way to answer | facts | score /10 | handled |
|---|---|---|---|
| old Ask, 6 excerpts | 57% | 6.1 | 3/6 |
| whole blog | 78% | 7.4 | 6/6 |
| whole blog + hint | 82% | 7.7 | 6/6 |
| top 6 posts in full | 80% | 7.5 | 6/6 |
| whole blog, hint and author marks | 80% | 7.5 | 6/6 |

- The last four sit within what one judge pass can tell apart, about 3 points either way. The jump from the old
  Ask's 57% is real.
- **The hint helped vague questions most**: 71% with it, 57% without.
- **The top 6 posts in full cost 3.7 times a warm whole-blog question**, $0.0077 against $0.0021 at peak,
  because a different set of posts every time can't be cached. A cold whole-blog question was $0.091, and the
  old Ask cost $0.0006.
- **Who wrote what slipped without marks.** With 7 posts in Claude's voice among 71, one header mark 200,000
  tokens away was followed less reliably. Without marks the judge flagged 9 answers (whole blog) and 7 (with the
  hint) for voice or credit. A mark on every section of a Claude-voiced post, plus a rule about crediting,
  brought it to 46 of 50 with about 2 real slips.
- **Keyword search helped but didn't ship.** Fusing a classic keyword search (BM25) with the meaning search
  lifted the right section into the top 6 excerpts from 68% to 89% of questions. With every post in the prompt,
  search only adds to the hint after the planner's picks, so the shipped version uses meaning search alone.

</details>

<details><summary>Retrieval, as shipped</summary>

On the 50 questions, with the bar each had to clear:

| measure | result | bar |
|---|---|---|
| the right posts in the top 6 | 92.7% | 92% |
| the right posts in the top 12 | 98.0% | 95% |
| a right post in the top 3 | 100% | |
| the right posts among the planner's picks plus the top 6 | 98.3% | 95% |
| closest posts for not-covered questions in the top 6 | 100% | 87.5% |
| planner replies that were valid JSON | 50 of 50 | |
| live notebook among the likely posts for a question it doesn't answer | 0 of 44 | 2 at most |

</details>

<details><summary>Every layout that was tested</summary>

The judge is DeepSeek Flash with its step-by-step reasoning on. It gets each question's must-have facts, the
sections that hold the answer and every section the answer cites, and scores each fact 1, 0.5 or 0. It calls true
details invented when it can't see the section that says them, which is why it sees the cited sections too. Even
so, at least 7 of its "wrong" flags on the shipped run were facts that are in the posts. The catalog layout, run
three times, got 81.2%, 83.7% and 80.9% of the facts.

In the table, "voice" is how many of the 50 answers the judge passed on who did what, then the real slips found
by hand. "Cited" counts the 44 answerable questions whose answer cited the section that holds it. Every new layout
handled all 6 not-covered and trick questions, the old Ask 4.

| layout | facts | voice | cited |
|---|---|---|---|
| old Ask, same judge | 63.1% | 48 | 26 |
| catalog after the posts, run 1 | 83.7% | 44, 0 slips | 36 |
| catalog after the posts, run 2 | 80.9% | 40, 5 slips | 36 |
| **one-line overview (shipped)** | **79.5%** | **44, 2 slips** | **37** |
| bar | 78% | 45, 3 slips | 33 |

- **Scores out of 10**: the old Ask 6.48, the catalog runs 7.68 and 7.48, the shipped layout 7.53, against a bar
  of 7.2.
- **By kind of question**, shipped against the old Ask: several posts 78.1% against 41.1%, vague 67.4% against
  36.8%, facts 81.4% against 75.8%, cost and hardware 85% against 81.7%.
- Every citation pointed to a real section.
- **Two variants were dropped**: naming each post's best sections in the hint (81.6% against 83.7%), and "you
  are not Claude" in the rules (82.2%, credit unchanged).

</details>

<details><summary>The blind test, in full</summary>

Another Claude agent wrote 30 more questions that no design had seen: 9 facts, 6 how and why, 5 needing several
posts, 4 vague, 3 cost and hardware, 2 not covered, 1 trick, with 120 must-have facts.

| | the 50 | the 30 |
|---|---|---|
| right posts in the top 6 | 92.7% | 92.2% |
| facts, shipped layout | 79.5% | 74.1% |
| facts, catalog layout | 80.9% | 74.8% |
| facts, old Ask | 63.1% | 56.5% |
| score /10, shipped | 7.53 | 7.22 |
| not covered, trick | 6/6 | 3/3 |
| voice and credit | 44/50 | 28/30 |
| right section cited | 37/44 | 26/27 |

The gap was 5.4 points against an allowance of 5. Another Claude agent checked the gap, then two Claude reviewers
looked at why:

- **The 30 are harder for every version.** The old Ask dropped 6.6 points on them. The new version leads the old
  by about 17 points on both sets (16.4 on the 50, 17.6 on the 30).
- **They pack more into each question**: 4.0 must-have facts against 3.5, 88 characters a fact against 61, 1.63
  numbers a fact against 0.97. On the 50, questions with more facts to cover got a smaller share of them, and
  that trend predicts 74.3% for the 30. They got 74.1%.
- **5 of the 120 facts live only in captions inside interactive parts of posts**, which the model's text leaves
  out. Without those 5 the shipped layout gets 78.2% against 79.5%, 1.3 points apart.
- **Chance can explain the rest.** A statistics check says a gap at least this size would show up by chance about
  15% of the time. On only 30 questions, a version that wasn't tuned to the test would still miss the 5-point
  bar about 18% of the time. Both layouts dropped by about the same amount, on mostly the same questions. The
  shipped layout was the lowest scorer of the 6 setups run on the 50, so picking it didn't flatter it.
- **As a reader would see it**, on the 30 the new version beat the old on 17 answers, lost 7 and tied 6. On the
  50 the new version won 29 and lost 10. Answers scoring 4 or less: 4 of 80 against the old Ask's 13. False
  "Aaron hasn't written about it" answers: 1 against 3.

Both reviewers said ship it, with nothing to fix first.

</details>

<details><summary>What the tune-up is fixing</summary>

- The captions inside interactive parts of posts, about 14,000 to 21,000 more tokens in the prompt.
- One answer said I hadn't written about something that a post does cover. A new rule says to check the posts in
  the hint before saying that.
- Speaking as me ("my...") in 2 of 80 answers, where the old Ask did it in none, and crediting Claude's sums and
  3D models to me.
- Pointing at posts by citation number alone, which shows no title on a phone.
- On a question that tried to make RAG Goobie list hidden pages, a new rule is to say RAG Goobie answers only from
  published posts, and stop.
- The judge will see whole posts, judge twice and average, and reject a malformed grade.
- A fresh blind test, since the 30 have been read now and aren't blind anymore.

Apart from speaking as me, none of these is worse than the old Ask. Still not measured: CPU per question on the
live site, answer quality past about 304,000 tokens, and the cache after idle gaps longer than two hours.

</details>

## What building and testing took

Claude Code measured what the old Ask missed and drafted three designs. Three judge agents all picked the same
one, for the fewest moving parts, a spending cap that can't be passed, and code that still works at 1,000 posts.
DeepSeek's bill for designing, building and testing it was about $2.81, not counting Claude Code's own usage.

The code is in the site's [public repo](https://github.com/aaronorelup/blog), under `worker/ask/` and
`src/lib/ask/`.

## Building your own with Claude Code

The pieces, in the order a question uses them:

1. **A clean text copy of every post**, split at its headings, each section numbered for citing. Captions
   included, even inside interactive parts. Mine missed those, and the tune-up is adding them.
2. **Who wrote what, in the text.** Skip it if one person writes everything in one voice.
3. **One prompt in a fixed order**: rules, every post oldest first, what changes often after, the question last.
4. **A model that can read a lot at once and has a prompt cache.** Send no visitor id with the request, since
   DeepSeek keeps a separate cache per id.
5. **Citations your code checks** against the real sections.
6. **A daily dollar cap**: reserve the worst case before each call, settle to the real cost after.
7. **The model's API key on a server**, never in the page. Mine is in a Cloudflare Worker, a small program
   Cloudflare runs.
8. **Abuse guards**: a bot check, rate limits, a length limit.
9. **A test set with must-have facts**, some questions it can't answer, some tricks, a judge, and a blind set
   written by someone else.

On a small blog you can skip the planner and the search. In the design tests the whole blog alone still got 78%
of the facts, against 57% for the old Ask under the same judge. Streaming is optional too, but 5 seconds of
nothing feels long.

A prompt to start from:

```text
Build an Ask box for my blog that answers readers' questions from my published posts only. Export every published post as clean text, split at headings, with numbered sections, captions included. Put the rules first, then every post in full, oldest first, then the question last, so the model provider's prompt cache keeps the posts. Use a model with a long context window and a prompt cache, and never send a per-user id. Keep the model's API key on a server, never in the page. Make it cite sections, and check every cite against the export. Add a daily dollar cap that reserves the worst case before each call and settles to the reported cost after, in one atomic database update. Add a bot check and rate limits, and key nothing on IP addresses. Then write 50 test questions with must-have facts, including some the blog doesn't cover and some prompt-injection attempts, and score the answers before it goes live.
```

<details><summary>Platform limits that mattered</summary>

- **Cloudflare Workers** (small programs that run on Cloudflare's servers). The site is on the paid plan ($5 a
  month): 30 seconds of CPU per request by default, 128 MB of memory, 10,000 subrequests (calls out to other
  services). The free plan gives 10 ms of CPU. Time spent waiting on the network doesn't count.
- **The Worker never parses the prompt.** In the design tests, parsing a 1.16 MB prompt and building the request
  body took about 12 ms of CPU in a rough test in node, which runs JavaScript the way Workers do. That's more
  than the free plan's whole budget. So the build writes each part as the inside of a JSON string, and the Worker
  joins those bytes and the escaped question into a Blob, one chunk it sends as is. In node a question's own work
  is 4 to 12 ms.
- **Vectorize, Cloudflare's search-by-meaning index, returns at most 100 results with ids only**, but only 50
  when you ask for the stored text with them. Asking for 101 gives error 40011, 51 with text gives 40025. Older
  docs said 20. RAG Goobie asks for 100 ids and reads the text from the site's own build files.
- **The embedding model, bge-m3 on Cloudflare's Workers AI, takes 8,192 tokens per text.** It turns text into
  numbers by meaning. Longer is an error unless you let it truncate. A question's embedding is about 30 tokens,
  which is nearly free.
- **DeepSeek's prefix cache is on by default** and matches the whole request in order. Hits come in 128-token
  blocks up to the first token that differs. A 9-character change in the middle of a 195,000-token prompt
  stopped the hits at about token 98,000. Writing to it takes seconds and isn't guaranteed.
- **Never send a per-visitor user id to DeepSeek.** It keeps a separate cache per id, so nothing would be shared
  between visitors.
- **Thinking mode, step-by-step reasoning before the answer, is on by default.** Turn it off, or it spends the
  answer's tokens thinking and ignores the temperature.
- **JSON mode needs the word "json" and an example in the prompt.** Output that isn't JSON comes back as blank
  space with a normal finish, so handle a blank reply.
- **DeepSeek limits only how many requests run at once**, 2,500 per account for Flash. A 20 second timeout is
  too short for a cold 700,000-token prompt.
- **Cloudflare also hosts a DeepSeek model**, but at 20 requests a minute per account, so the DeepSeek API itself
  is the better path here.

</details>

*Claude Code designed, built and tested the new RAG Goobie at my request, and wrote this post from its test runs.*
