---
id: "AO-076"
title: "How RAG Goobie reads my whole blog to answer a question"
summary: "RAG Goobie, the Ask box on my ledger, now reads every published post in full before answering. How each step works, how the rebuild was tested, what a question costs, and how to build your own."
date: 2026-11-02
topic: "site"
project: []
draft: true
preview:
  verdict: "Whole blog beat snippets"
  takeaway: "RAG Goobie now reads every post in full for each question. A prompt cache keeps that at about $0.002, and answers got 80% of the key facts, up from 63%."
  points:
    - "The order of the prompt is the trick: posts first, question last, so 99.9% of it comes from cache after the first ask."
    - "A cold question costs $0.085 at peak. A $2 daily cap that can't be passed makes the worst case an outage, not a bill."
    - "On 30 harder questions from another agent, the new version scored 5.4 points lower, 0.4 over the limit, and shipped."
  image: "/media/previews/how-rag-goobie-works.webp"
  alt: "RAG Goobie's steps on a phone: read the catalog of 71 posts, searched 5 ways, reading all 71 posts in full, writing"
---

RAG Goobie is the Ask box on [my ledger](/ledger/), the little owl you can ask about anything I've written
here. Each answer comes from my posts and links every claim to the passage behind it. I had Claude Code design,
build and test a new version, and that went live today. **RAG Goobie now reads every published post in full
before answering, about 283,000 tokens at 71 posts, and a cache keeps that at about $0.002 a question.** On the
same 50 test questions, the new answers got about 80% of the facts a good answer needs. The old version got 63%.

RAG stands for retrieval-augmented generation: look things up first, then have an AI language model write the
answer from what turned up. A token is the unit these models count text in, a word or a piece of one.

- **Reading everything beat searching for snippets.** The old Ask gave the model 6 excerpts, about 2 posts'
  worth. The old search almost always found the right post but missed everything around that post.
- **The order of the prompt keeps the cost down.** DeepSeek, the AI model RAG Goobie runs on, keeps the start of a prompt it
  has seen and charges a fiftieth for it. My posts go first and the question last, so from the second question
  on, 99.9% of the prompt comes from that cache.
- **Search is still there, as a hint.** The search tells the model which 6 posts look most related. In the design tests
  that lifted vague questions from 57% to 71%.
- **A cold question costs nearly 40 times more.** The first question after the posts change re-reads them all
  at full price, $0.085 at peak. A $2 daily cap that can't be passed makes the worst case an outage, not a bill.
- **The new version passed the main test and missed one bar on a blind test by 0.4 points.** The blind
  questions were harder for the old version too, so after an independent check the new version shipped.
- **There are still slips.** In 2 of 80 test answers, RAG Goobie spoke as me. A tune-up is fixing that now.

<ao-compare cols="2" aspect="1170/1090">
<figure><img src="/media/how-rag-goobie-works/working-phone.webp" alt="RAG Goobie on a phone, working on the question Is renting a cloud GPU worth it?: ticked steps for reading the catalog of 71 posts, picking 7, searching 5 ways and reading all 71 posts in full, then Writing, with the first words of the answer" loading="lazy"><figcaption><b>While it works.</b> <span class="ao-meta">A real answer recorded during testing, when the blog had 71 posts, replayed through the live page.</span></figcaption></figure>
<figure><img src="/media/how-rag-goobie-works/answer-phone.webp" alt="The end of the same answer: a 37-clip render list took 2 hours 8 minutes for $2.44, each claim cited, then the line Read all 71 posts in full, 283k tokens, 99.9% from cache, 4.5 s, $0.0011, and the cited post below" loading="lazy"><figcaption><b>Done.</b> <span class="ao-meta">What it read, how much came from the cache, the time and the cost. The question is one of the examples in the box, so you can ask it too.</span></figcaption></figure>
</ao-compare>

## What happens when you ask

After a few checks there are five steps, and the page shows each one as it happens.

<figure>
<svg class="rgd" viewBox="0 0 400 680" width="400" height="680" role="img" aria-labelledby="rgd-t rgd-d" xmlns="http://www.w3.org/2000/svg">
<title id="rgd-t">What RAG Goobie does with a question</title>
<desc id="rgd-d">Your question passes the checks, then a planner picks posts and writes searches, the search finds the 6 most related posts, one prompt in a fixed order holds the rules, every post in full, a live notebook and finally the hint and your question, the answer streams in with every citation checked, and the bill is settled.</desc>
<style>
figure:has(> .rgd){margin-inline:0}
.rgd{display:block;max-width:100%;height:auto;margin:8px auto 0}
.rgd text{font-family:var(--font-body);fill:var(--pc-body);font-size:13px;letter-spacing:0}
.rgd .rgd-h{fill:var(--pc-strong);font-size:15px;font-weight:600}
.rgd .rgd-b{fill:var(--pc-strong);font-size:13.5px}
.rgd .rgd-s{fill:var(--pc-soft);font-size:12.5px}
.rgd .rgd-n{fill:var(--pc-page);font-size:13px;font-weight:600;text-anchor:middle}
.rgd .rgd-box{fill:var(--pc-tile);stroke:var(--pc-line2);stroke-width:1}
.rgd .rgd-dot{fill:var(--pc-head)}
.rgd .rgd-ar{stroke:var(--pc-line2);stroke-width:1.5;fill:none}
.rgd .rgd-q{fill:none;stroke:var(--pc-accent);stroke-width:1.5}
.rgd .rgd-qt{fill:var(--pc-accent);font-size:14px;font-weight:600;text-anchor:middle}
.rgd .rgd-mid{text-anchor:middle}
.rgd .rgd-gold{fill:var(--pc-head);fill-opacity:.16;stroke:var(--pc-head);stroke-width:1.2}
.rgd .rgd-grey{fill:var(--pc-line);stroke:var(--pc-line2);stroke-width:1}
.rgd .rgd-new{fill:var(--pc-accent);fill-opacity:.14;stroke:var(--pc-accent);stroke-width:1.2}
.rgd .rgd-br{stroke:var(--pc-head);stroke-width:1.5;fill:none}
.rgd .rgd-gt{fill:var(--pc-head);font-size:12.5px;font-weight:600}
.rgd .rgd-at{fill:var(--pc-accent);font-size:12.5px;font-weight:600}
</style>
<rect class="rgd-q" x="110" y="6" width="180" height="34" rx="17"/>
<text class="rgd-qt" x="200" y="28">Your question</text>
<text class="rgd-s rgd-mid" x="200" y="58">bot check, rate limits, the day's cap</text>
<path class="rgd-ar" d="M200 66V84M194 78l6 7 6-7"/>
<rect class="rgd-box" x="12" y="88" width="376" height="70" rx="14"/>
<circle class="rgd-dot" cx="34" cy="110" r="11"/>
<text class="rgd-n" x="34" y="114.5">1</text>
<text class="rgd-h" x="54" y="115">The planner</text>
<text x="54" y="135">reads one line about every post, picks up to 8</text>
<text x="54" y="151">posts and writes up to 4 searches</text>
<path class="rgd-ar" d="M200 160V178M194 172l6 7 6-7"/>
<rect class="rgd-box" x="12" y="182" width="376" height="70" rx="14"/>
<circle class="rgd-dot" cx="34" cy="204" r="11"/>
<text class="rgd-n" x="34" y="208.5">2</text>
<text class="rgd-h" x="54" y="209">The search</text>
<text x="54" y="229">the question and its searches pull 100 passages</text>
<text x="54" y="245">each, merged by rank into the 6 most related</text>
<path class="rgd-ar" d="M200 254V272M194 266l6 7 6-7"/>
<rect class="rgd-box" x="12" y="276" width="376" height="232" rx="14"/>
<circle class="rgd-dot" cx="34" cy="298" r="11"/>
<text class="rgd-n" x="34" y="302.5">3</text>
<text class="rgd-h" x="54" y="303">One prompt, always in the same order</text>
<rect class="rgd-grey" x="28" y="318" width="210" height="18" rx="4"/>
<text class="rgd-s" x="38" y="331.5">the rules</text>
<rect class="rgd-gold" x="28" y="340" width="210" height="102" rx="4"/>
<text class="rgd-b" x="38" y="366">every post in full,</text>
<text class="rgd-b" x="38" y="384">oldest first, each with</text>
<text class="rgd-b" x="38" y="402">its notes page</text>
<path class="rgd-br" d="M246 318h6V442h-6"/>
<text class="rgd-gt" x="260" y="370">the same bytes</text>
<text class="rgd-gt" x="260" y="387">every time, read</text>
<text class="rgd-gt" x="260" y="404">from the cache</text>
<rect class="rgd-grey" x="28" y="446" width="210" height="24" rx="4"/>
<text class="rgd-s" x="38" y="462.5">a live notebook, edited all day</text>
<text class="rgd-s" x="260" y="462.5">re-read when edited</text>
<rect class="rgd-new" x="28" y="474" width="210" height="24" rx="4"/>
<text class="rgd-at" x="38" y="490.5">the hint and your question</text>
<text class="rgd-at" x="260" y="490.5">new every question</text>
<path class="rgd-ar" d="M200 510V528M194 522l6 7 6-7"/>
<rect class="rgd-box" x="12" y="532" width="376" height="70" rx="14"/>
<circle class="rgd-dot" cx="34" cy="554" r="11"/>
<text class="rgd-n" x="34" y="558.5">4</text>
<text class="rgd-h" x="54" y="559">The answer streams in</text>
<text x="54" y="579">DeepSeek writes it, and every citation is checked</text>
<text x="54" y="595">against the real sections, unknown ones dropped</text>
<path class="rgd-ar" d="M200 604V620M194 614l6 7 6-7"/>
<rect class="rgd-box" x="12" y="624" width="376" height="52" rx="14"/>
<circle class="rgd-dot" cx="34" cy="646" r="11"/>
<text class="rgd-n" x="34" y="650.5">5</text>
<text class="rgd-h" x="54" y="651">The bill is settled</text>
<text class="rgd-s" x="190" y="651">the real cost replaces the reserve</text>
</svg>
<figcaption><b>One question, start to finish.</b> <span class="ao-meta">The gold block is the same on every question, which is what keeps the cost down.</span></figcaption>
</figure>

- **Checks.** Cloudflare Turnstile, a bot check that usually stays invisible, then rate limits, a
  300-character limit and the day's dollar cap. Nothing is keyed on your IP address.
- **The planner.** A quick call reads one line about every post, picks up to 8 posts and writes up to 4
  searches. Those searches are never shown or passed on, since a question can try to slip instructions in.
- **The search.** The question and each search pull the 100 closest passages, and a passage high on several
  lists wins. That gives the 6 most related posts.
- **The prompt.** Rules, every post in full with its notes page, a live notebook other agents update all day,
  then the hint and the question. Sections are numbered for citing, and every post says who wrote it, me or
  Claude.
- **The answer.** DeepSeek's Flash model writes it, and code checks every citation against the real sections.
  In testing the first words came after about 4.4 seconds, the whole answer after about 5.5.
- **The bill.** The worst case, about $0.10, is set aside against the day's $2 before any call, and the real
  cost replaces it after.

<details><summary>Every step, with its time limits</summary>

| step | what it does | time limit |
|---|---|---|
| checks | a request under 2 KB, a valid 30-minute session, Ask switched on, a question of 3 to 300 characters, the two rate limits, the answer cache, the day's question count, the dollar reservation | |
| planner | one DeepSeek call, JSON out, temperature 0, at most 300 tokens: up to 4 searches, topics, up to 8 picked posts | 8 s |
| search | the question looked up beside the planner, then its searches in one embedding call, each looked up for the top 100 passages, merged by reciprocal rank (k 60) | 5 s each |
| prompt | rules, every post with its notes page in AO-number order, the live notebook, a one-line overview, then the count of close matches, the 6 most related and the question | |
| answer | DeepSeek Flash, thinking off, temperature 0.2, at most 600 tokens, streamed | first words 30 s, all 60 s |
| after | settle the reservation to the reported usage, keep the answer 7 days, one log line that never holds the question | |

- **A failed step is skipped.** No plan means the question alone is searched. No search still leaves every post
  in the prompt.
- **The planner's searches are never shown, logged or sent to the answer.** In the design tests it copied an
  injected request into its searches. That's harmless only because the search can reach published posts alone.
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
tokens from the cache and a few hundred fresh: $0.0022 at peak, about $0.0011 off-peak. A cold one is $0.085 at
peak, $0.043 off-peak. The cache was still 99.93% warm after an hour with no questions, and after two more.
Longer gaps are still being measured.

The old Ask cost $0.0006 a question, for about 160 times less text. Here's what this setup would cost on
your blog.

<ao-calc>
<ul><li data-var="posts" data-min="10" data-max="150" data-step="1" data-value="71">Posts on the blog</li>
<li data-var="size" data-options="1,500 tokens:1500|4,000, like mine:4000|8,000 tokens:8000" data-value="4,000, like mine">Average post with its notes</li>
<li data-var="q" data-min="1" data-max="1000" data-step="1" data-value="100">Questions a day</li>
<li data-var="cold" data-min="0" data-max="20" data-step="1" data-value="1">Cold questions a day</li>
<li data-var="when" data-options="Peak:1|Off-peak:0.5" data-value="Peak">DeepSeek's hours</li></ul>
<ol><li data-f="posts * size" data-unit="tokens">The prompt</li>
<li data-f="posts * size / 10000" data-unit="percent">Share of a 1M-token window</li>
<li data-f="(posts * size * 0.000000006 + 0.0005) * when" data-prefix="$" data-digits="4">A warm question</li>
<li data-f="(posts * size * 0.0000003 + 0.0004) * when" data-prefix="$" data-digits="3">A cold question</li>
<li data-f="30 * (max(0, q - cold) * (posts * size * 0.000000006 + 0.0005) + min(cold, q) * (posts * size * 0.0000003 + 0.0004)) * when" data-prefix="$" data-digits="2">A month</li></ol>
<figcaption><b>What this would cost on your blog.</b> <span class="ao-meta">An estimate from DeepSeek's prices on 1 November and my measured averages. At 71 posts of 4,000 tokens it gives $0.0022 warm and $0.086 cold at peak, against the measured $0.0022 and $0.085. At about 141 posts, mine switches to reading part of the blog per question.</span></figcaption>
</ao-calc>

<details><summary>Every cost, and the dollar cap</summary>

At peak prices, Monday to Friday 01:00 to 04:00 and 06:00 to 10:00 UTC. Off-peak is half.

| case | cost |
|---|---|
| a warm question, planner included | $0.0022 mean, $0.0024 at most |
| a warm question off-peak, measured | about $0.0011 |
| a cold question, all 282,800 tokens read fresh | $0.085 (off-peak, measured: $0.043) |
| the first question after the live notebook changes | $0.016, estimated |
| the first question after a new post | $0.017, estimated |
| a repeat from the answer cache | $0, 0.1 s |
| at 1,000 posts, warm or cold | about $0.028 or $0.15, estimated |

DeepSeek's Flash prices per million tokens: $0.006 from the cache, $0.30 fresh, $1.20 written, all halved
off-peak. Chinese public holidays are billed off-peak but counted as peak here, so a cost is only ever
overstated.

The calculator uses those prices and three averages from the shipped run's 49 warm answers: about 330 tokens
read fresh (196 to 351), 175 written, and about $0.0002 for the planner at peak. So a warm question is the prompt
times $0.006 per million plus $0.0005, and a cold one the prompt times $0.30 per million plus $0.0004.

**The dollar cap.** Before any call, the worst case is reserved: every token read fresh at peak, for the planner
and the biggest answer prompt, about $0.10 today and $0.23 at 1,000 posts. One database statement adds it only if
the day stays under its cap. Afterwards the reservation settles to the usage DeepSeek reported, on the reservation's own day.
A refused call bills nothing, and a call whose usage never came keeps its reservation.

- $2 a day is at most about $60 a month: about 900 warm or 23 cold questions, 20 in flight at once.
- When it's spent, RAG Goobie rests until 00:00 UTC and shows the closest posts from one lookup, with no model
  call.
- Right after a change to the prompt, about 22 cold questions at once could spend it. That's an outage until
  midnight, never a bill.
- A second backstop counts questions: 1,000 a day reaching DeepSeek.
- Tested locally: the day's total matched the settled costs exactly, a cap under one reservation rested the
  first question with no model call, and a cap of two reservations let exactly 2 of 6 parallel questions through.
- It lives in the database (Cloudflare D1), not Cloudflare's rate limiter, because the rate limiter counts per
  location, roughly, in 10 or 60 second windows. That's a throttle, not a spending cap.

</details>

<details><summary>Speed</summary>

Measured against a local copy of the Worker with the real search and DeepSeek behind it.

| | median | 90th percentile |
|---|---|---|
| first step on screen | | 41 ms |
| planner done | | 2.0 s |
| first words of the answer | 4.4 s | |
| the whole answer | 5.5 s | 6.2 s |
| a cold question | 8.9 s | |

- On the blind test's 30 questions: first words 4.1 s and the whole answer 5.2 s at the median, 5.8 s at the
  90th percentile.
- DeepSeek reading the prompt sets the pace. In the platform tests a cold 666,000-token prompt took 10 to 11.5
  seconds to its first token, a cached one 2.4 to 3.3.
- A stalled model was simulated: 25 seconds to the first token still answered. At 35 seconds the stream ended as busy
  at 31, with its reservation kept.

</details>

<details><summary>How long the cache holds</summary>

In the design tests it held through idle gaps of 6, 10, 18 and 37 minutes. On the shipped prompt, 282,698 tokens
with 282,496 from the cache, it was 99.93% at the start, 99.93% after an hour with no calls, and 99.93% after a
further two hours. Gaps of 4 and 8 hours are still running. DeepSeek's docs say an unused cache is cleared
"usually within a few hours to a few days". A keep-warm call stays unbuilt unless a gap empties it.

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
| the catalog | 80,000 est. | 5,000 est. |

- **Split mode** starts at about 141 posts at today's sizes, around late January 2027. Posts are grouped into
  packs in AO order, and a question gets the pack holding most of its likely posts, then the catalog, then up to
  40,000 more tokens of its likely posts. A drill on today's posts in 4 packs of 90,000 scored 0.807 must-have
  facts, 7.52 out of 10 and 6/6 handled, with every right post in the prompt. A question read 148,000 tokens,
  52% from the cache. With 40,000 extra tokens instead of 80,000 it read 113,000, 82% from the cache, for
  $0.0035 a question, and scored within 0.02.
- **At 1,000 posts** (synthetic): 11 packs, the largest 374,000 est., a 55,000-token catalog, the biggest
  question 493,000 est., under the 700,000 budget. The whole blog would be about 3.9 million tokens by then, so
  it couldn't be one prompt.
- Answer quality is only measured up to about 304,000 tokens. The build prints a warning to re-test at 450,000
  in the pack.

</details>

## How the new version was tested

Claude wrote 50 test questions of 7 kinds, including 4 the blog doesn't cover and 2 that try to trick RAG Goobie, each
with the facts a good answer must contain. A judge model, DeepSeek with its thinking on, scored each fact. One
judge pass is good to about 3 points either way, so every flag about who did what was read by hand too.

<ao-bars unit="%" max="100">
<table><thead><tr><th>On the 50 test questions</th><th>Old Ask, 6 excerpts</th><th>RAG Goobie now</th></tr></thead>
<tbody><tr><td>Facts a good answer needs</td><td>63.1</td><td>79.5</td></tr>
<tr><td>On questions that need several posts</td><td>41.1</td><td>78.1</td></tr>
<tr><td>On vague questions</td><td>36.8</td><td>67.4</td></tr>
<tr><td>Cited the section that holds the answer</td><td>59.1</td><td>84.1</td></tr>
<tr><td>Not-covered and trick questions handled</td><td>66.7</td><td>100</td></tr></tbody></table>
<figcaption><b>Before and after, same questions, same judge.</b> <span class="ao-meta">The old Ask was re-run today for this. Cited: 26 of 44 answerable questions against 37. Handled: 4 of 6 against 6 of 6.</span></figcaption>
</ao-bars>

- **The new version cleared the bars on the main test.** 79.5% against 78, a score of 7.53 out of 10 against 7.2, every
  tricky question handled. On who did what, the judge's count was one short of its bar. Read by hand, 2
  answers really slipped, within the limit of 3.
- **One layout failed.** With the post catalog after the posts, a second run credited Claude's work to me or
  spoke as me 5 times. A one-line overview shipped in its place.
- **The blind test was harder for everyone.** A separate agent wrote 30 new questions. RAG Goobie got 74.1% of
  their facts, 5.4 points below the main set, just over the 5 allowed. The old Ask dropped 6.6 on the same 30.
  An independent check and two reviewers agreed the questions were harder, not that the new version was tuned to the test.

<details><summary>What the old Ask missed</summary>

The old Ask looked the question up once in the same index the ledger's search uses, dropped anything under a
similarity score of 0.5, and sent at most 6 excerpts (6,000 characters) to DeepSeek's Flash model. Its prompt
was about 1,700 tokens.

- **The right post was there.** A right post was in the old search's top 3 for 95% of answerable questions.
- **The breadth was missing.** 6 excerpts covered 2.2 posts on average. Questions that need several posts recalled
  0.62 of their posts, vague ones 0.54. Only 59% of answers had the section that holds the answer in their
  excerpts.
- **The 0.5 floor separated nothing.** The best match scored 0.486 to 0.723 for answerable questions (median
  0.620), 0.464 to 0.550 for ones the blog doesn't cover (median 0.484) and 0.525 to 0.597 for the trick
  questions. 43 of 44 answerable questions got through, but so did 4 of the 6 that should have been turned away,
  and one good answer was blocked though its post ranked first. Ranks work better than a fixed bar.

</details>

<details><summary>The design tests: five ways to answer</summary>

Before building anything, Claude measured five ways of answering on the same 50 questions with the same judge.
A put the whole blog in one cached prompt, H added the hint, F added who-wrote-it marks to H, and B sent only the
top 6 posts in full.

| | old Ask | A: whole blog | H: + hint | B: top 6 posts in full | F: H + author marks |
|---|---|---|---|---|---|
| must-have facts | 0.57 | 0.78 | 0.82 | 0.80 | 0.80 |
| judge score /10 | 6.1 | 7.4 | 7.7 | 7.5 | 7.5 |
| not covered + trick handled | 3/6 | 6/6 | 6/6 | 6/6 | 6/6 |
| prompt tokens | ~1.7k | 301.5k | 301.7k | median 27k | 303.8k |
| cost a question at peak | $0.0006 | $0.0021 warm, $0.091 cold | $0.0021 warm | $0.0077, never cached | $0.0021 warm |

- A, H, B and F sit within what one judge pass can tell apart, about 0.03 either way. The jump from the old
  Ask's 0.57 is real.
- **The hint helped vague questions most**: 0.71 with it, 0.57 without.
- **The top 6 posts in full cost 3.7 times a warm whole-blog question**, because a different set of posts every
  time can't be cached.
- **Who wrote what slipped without marks.** With 7 posts in Claude's voice among 71, one header mark 200,000
  tokens away was followed less reliably. Without marks the judge flagged 9 answers (whole blog) and 7 (with the
  hint) for voice or credit. A mark on every section of a Claude-voiced post, plus a rule about crediting,
  brought it to 46 of 50 with about 2 real slips.
- **Keyword search helped but didn't ship.** Fusing a classic keyword search (BM25) with the meaning search
  lifted the right section into the top 6 excerpts from 0.68 to 0.89. With every post in the prompt, search only
  shapes the hint, so the shipped version uses meaning search alone.

</details>

<details><summary>Retrieval, as shipped</summary>

On the 50 questions, with the bar each had to clear:

| measure | result | bar |
|---|---|---|
| the right posts in the top 6 | 0.927 | 0.92 |
| the right posts in the top 12 | 0.980 | 0.95 |
| a right post in the top 3 | 1.0 | |
| the right posts among the planner's picks plus the top 6 | 0.983 | 0.95 |
| closest posts for not-covered questions in the top 6 | 1.0 | 0.875 |
| planner answers that were valid JSON | 50/50 | |
| live notebook in the focus of a question it doesn't answer | 0/44 | 2 at most |

</details>

<details><summary>Every layout that was tested</summary>

The judge is DeepSeek Flash with its thinking on. It gets each question's must-have facts, the sections that
hold the answer and every section the answer cites, and scores each fact 1, 0.5 or 0. It calls true details
invented when it can't see the section that says them, which is why it sees the cited sections too. Even so,
about 7 of its "wrong" flags on the shipped run were facts that are in the posts. The catalog layout, run three
times, scored 0.812, 0.837 and 0.809.

| layout | must-have facts | score /10 | not covered + trick | voice and credit (judge / real slips) | right section cited |
|---|---|---|---|---|---|
| old Ask, re-run with the same judge | 0.631 | 6.48 | 4/6 | 48/50 | 26/44 |
| catalog after the posts, run 1 | 0.837 | 7.68 | 6/6 | 44/50 / 0 | 36/44 |
| catalog after the posts, run 2 | 0.809 | 7.48 | 6/6 | 40/50 / 5 | 36/44 |
| **one-line overview after the posts (shipped)** | **0.795** | **7.53** | **6/6** | **44/50 / 2** | **37/44** |
| bar | 0.78 | 7.2 | 6/6 | 45 / 3 | 33 |

- **By kind of question**, shipped against the old Ask: several posts 0.781 against 0.411, vague 0.674 against
  0.368, facts 0.814 against 0.758, cost and hardware 0.85 against 0.817.
- **No answer, cite, related post or step named an unlisted post or a hidden page**, and every cite resolved.
- **Two variants were dropped**: naming each post's best sections in the hint (0.816 against 0.837), and "you
  are not Claude" in the rules (0.822, credit unchanged).

</details>

<details><summary>The blind test, in full</summary>

A separate agent wrote 30 more questions that no design had seen: 9 facts, 6 how and why, 5 needing several
posts, 4 vague, 3 cost and hardware, 2 not covered, 1 trick, with 120 must-have facts.

| | the 50 | the 30 |
|---|---|---|
| right posts in the top 6 | 0.927 | 0.922 |
| must-have facts, shipped layout | 0.795 | 0.741 |
| must-have facts, catalog layout | 0.809 | 0.748 |
| must-have facts, old Ask | 0.631 | 0.565 |
| score /10, shipped | 7.53 | 7.22 |
| not covered + trick | 6/6 | 3/3 |
| voice and credit | 44/50 | 28/30 |
| right section cited | 37/44 | 26/27 |

The gap was 0.054 against an allowance of 0.05. An independent check, then two reviewers, looked at why:

- **The 30 are harder for every version.** The old Ask dropped 0.066 on them. The new version leads the old by about
  0.17
  on both sets (+0.164 on the 50, +0.176 on the 30).
- **They pack more into each question**: 4.0 must-have facts against 3.5, 88 characters a fact against 61, 1.63
  numbers a fact against 0.97. The 50's own trend of score against fact count predicts 0.743 for the 30. It
  measured 0.741.
- **5 of the 120 facts live only in captions inside interactive components**, which the model's text leaves
  out. Without those 5 the shipped layout scores 0.782 against 0.795, 0.013 apart.
- **A permutation test gives p = 0.15**, and every controlled comparison stays inside the 0.03 noise. Both
  layouts dropped by about the same amount, and their per-question scores on the 30 correlate 0.77. On 30
  questions the 0.05 allowance is under one standard error, so a system that isn't overfitted would still fail
  it about 18% of the time. The shipped layout was the lowest scorer of the 6 setups run on the 50, so picking it
  didn't flatter it.
- **As a reader would see it**, on the 30 the new version beat the old on 17 answers, lost 7 and tied 6. On the 50 the new version won 29 and lost 10. Answers scoring 4 or less: 4 of 80 against the old Ask's 13. False "Aaron hasn't
  written about it" answers: 1 against 3.

Both reviewers said ship it, with nothing to fix first.

</details>

<details><summary>What the tune-up is fixing</summary>

- The captions inside interactive components, about 14,000 to 21,000 more tokens in the prompt.
- One answer said I hadn't written about something that a post does cover. A new rule says to check the posts in the hint
  before saying that.
- Speaking as me ("my...") in 2 of 80 answers, where the old Ask did it in none, and crediting Claude's sums and
  3D models to me.
- Pointing at posts by citation number alone, which shows no title on a phone.
- On a question that tried to make RAG Goobie list hidden pages, the answer refused and gave no address, but
  then said roughly where to look, from what the published posts already say. The old Ask did the same. The new
  rule is to say the answers come only from published posts, and stop.
- The judge will see whole posts, judge twice and average, and reject a malformed grade.
- A fresh blind test, since the 30 have been read now and aren't blind anymore.

None of these is worse than the old Ask. Still not measured: CPU per question on the live site, answer quality
past about 304,000 tokens, and the cache after idle gaps longer than two hours.

</details>

## What building and testing took

Claude Code measured what the old Ask missed, drafted three designs and had three judge agents pick one. All
three picked the same one, for the fewest moving parts, a spending cap that can't be passed, and code that still
works at 1,000 posts. Then Claude Code built and tested the design. DeepSeek's bill for all of that was about $2.81: $0.69 for
the design tests, $0.35 for checking the platform's limits and $1.77 for building and testing. Claude Code's own
usage isn't in that number.

The code is in the site's [public repo](https://github.com/aaronorelup/blog), under `worker/ask/` and
`src/lib/ask/`.

## Building your own with Claude Code

The pieces, in the order a question uses them:

1. **A clean text copy of every post**, split at its headings, each section numbered for citing. Captions
   included.
2. **Who wrote what, in the text.** Skip it if one person writes everything in one voice.
3. **One prompt in a fixed order**: rules, every post oldest first, what changes often after, the question last.
4. **A model with a long context and a prompt cache**, and no per-visitor id on the request, which splits the
   cache.
5. **Citations your code checks** against the real sections.
6. **A daily dollar cap**: reserve the worst case before each call, settle to the real cost after.
7. **Abuse guards**: a bot check, rate limits, a length limit.
8. **A test set with must-have facts**, some questions it can't answer, some tricks, a judge, and a blind set
   written by someone else.

On a small blog you can skip the planner and the search. The whole blog without them still scored 78% in the
design tests, against the old Ask's 57% there. Streaming is optional too, but 5 seconds of nothing feels long.

<details><summary>Platform limits that mattered</summary>

- **Cloudflare Workers.** The site is on the paid plan ($5 a month): 30 seconds of CPU per request by default,
  128 MB of memory, 10,000 subrequests. The free plan gives 10 ms of CPU. Time spent waiting on the network
  doesn't count.
- **The Worker never parses the prompt.** Parsing the 1.16 MB prompt and building the request body took 11.75 ms
  of CPU in node, the free plan's whole budget by itself. So the build writes each part as the inside of a JSON
  string, and the Worker joins those bytes and the escaped question into a Blob. In node a question's own work
  is 4 to 12 ms.
- **Vectorize returns at most 100 results with ids only**, but only 50 when you ask for the stored text with them.
  Asking for 101 gives error 40011, 51 with text gives 40025. Older docs said 20. RAG Goobie asks for 100 ids and
  reads the text from its own build files.
- **The embedding model, bge-m3 on Workers AI, takes 8,192 tokens per text.** Longer is an error unless you let
  it truncate. A question's embedding is about 30 tokens, which is nearly free.
- **DeepSeek's prefix cache is on by default** and matches the whole request in order. Hits come in 128-token
  blocks up to the first token that differs. A 9-character change in the middle of a 195,000-token prompt
  stopped the hits at about token 98,000. Writing to it takes seconds and isn't guaranteed.
- **Never send a per-visitor user id to DeepSeek.** It keeps a separate cache per id, so nothing would be shared
  between visitors.
- **Thinking mode is on by default.** Turn it off, or it spends the answer's tokens thinking and ignores the
  temperature.
- **JSON mode needs the word "json" and an example in the prompt.** Output that isn't JSON comes back as blank
  space with a normal finish, so handle a blank reply.
- **DeepSeek limits only how many requests are in flight**, 2,500 per account for Flash. A 20 second timeout is
  too short for a cold 700,000-token prompt.
- **Cloudflare also hosts a DeepSeek model**, but at 20 requests a minute per account, so the DeepSeek API itself
  is the better path here.

</details>

<details><summary>A prompt to start from</summary>

> Build an Ask box for my blog that answers readers' questions from my published posts only. Export every
> published post as clean text, split at headings, with numbered sections. Put the rules first, then every post
> in full, oldest first, then the question last, so the model provider's prompt cache keeps the posts. Use a
> model with a long context window and a prompt cache, and never send a per-user id. Make it cite sections, and
> check every cite against the export. Add a daily dollar cap that reserves the worst case before each call and
> settles to the reported cost after, in one atomic database update. Add a bot check and rate limits, and key
> nothing on IP addresses. Then write 50 test questions with must-have facts, including some the blog doesn't
> cover and some prompt-injection attempts, and score the answers before it goes live.

</details>

*Claude Code designed, built and tested RAG Goobie under my direction, and pulled together the numbers for this
post.*
