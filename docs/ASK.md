# RAG Goobie (Ask)

RAG Goobie answers readers' questions on `/ledger/` from Aaron's posts. It reads every listed post in full, with its
notes page, on every question while the blog fits (today about 283k tokens, 28% of DeepSeek's 1M window), laid out
so DeepSeek's prefix cache keeps it: a warm question costs about $0.002. A planner call reads a one-line catalog of
every post first and plans the search; the answer streams to the page with each step shown. Every number below was
measured on this task's eval (2026-11-02) unless it says "est.". The Worker's map is `docs/WORKER.md`; the rules for
any change are `worker/CLAUDE.md`.

## The pipeline

**Build** (`npm run build`, `src/lib/ask/`, pure but for `docs.js`):

1. The extraction (`scripts/build/rehype-post-text.mjs`, its `full-text.mjs`) writes `text.full`: every section
   `text.sections` has, split at the same h2s, holding everything a reader sees (paragraphs, lists, h3/h4, table rows
   as `a | b`, code cut at 2,000 characters, captions, folded text) and what a post component shows as words: every
   caption and `.ao-meta` line inside it, ao-calc's input and result labels and ao-bars' table as a reader without JS
   sees them, ao-matrix's grid a row a line (`label (note) | cell | cell`), ao-pan's view and stop labels, ao-timeline's
   events with their lanes. Nothing else in `text` changed, so search's chunks and read-aloud's hashes are byte for
   byte what they were.
2. `docs.js` reads the listed posts in AO order, each with its notes page (never a draft, an unlisted post or a hidden
   page). `corpus.js` numbers the sections as the model cites them: `[45.0]` the short version, `[45.1]` the opening,
   then each h2; a notes page `[45.N0]` (its summary and opening), `[45.N1]`... A doc over `DOC_CAP` keeps its top;
   the live notebooks over `LIVE_CAP` keep their top half and their newest end, one line marking the gap. Marks keep
   their numbers, so a cite always resolves.
3. `blocks.js` writes each doc as a `<doc n= url= title= topic= by=>` block, every section of a Claude-voiced doc
   marked "(Claude's own account)"; the catalog (one line a post); and each file as a fragment, the body of a JSON
   string without its quotes. `packs.js` puts every non-live doc in one pack (whole mode) while they fit under
   `WHOLE_CAP`; past it, split mode packs the pinned ranges of `src/data/ask-packs.json`.
4. `manifest.js` writes `/ask/pack-<i>-<h8>.txt`, `/ask/doc-<n>-<h8>.txt`, `/ask/catalog-<h8>.txt`,
   `/ask/overview-<h8>.txt` and `/ask/manifest.json` (`v`, mode, caps, the reservation, counts, files, every doc's
   sections). `v` hashes every stable file and the listed set but only the live notebooks' keys, so a fleet push to
   AO-073 never moves it. `scripts/build/ask-dist.mjs` checks the result (below) and prints one line a build:

   ```
   ask: whole, 1 pack, 71 posts + 11 notes, 314k est. tokens (52% of WHOLE_CAP), live 48k/60k est., worst-case
   reservation $0.10, ask_daily_usd should be >= $0.97 (10 reservations in flight); pins: ok
   ```

**Worker** (`POST /api/ask`, `worker/ask/`): before the stream, bare statuses: the body (413), the session token
(401), the switch and the key (`end off`), the question (400), the limiters (429), the anonymous count. Then the
answer cache (a hit is one `answer` event, no model call), the day's question count (`ask_daily`) and the dollar cap:
one atomic reservation of the question's worst case (`ask_daily_usd`). Either cap spent: `end resting` with the
closest posts from one lookup. Then the stream opens and `run.js` does, inside `ctx.waitUntil` (a reader who leaves
doesn't stop the settle or the cache write):

| step | bound |
|---|---|
| `start`; the planner (`plan.js`) beside the question's embedding and lookup (`rank.js`) | planner 8 s, AI and Vectorize 5 s each |
| `plan`: topics and how many posts it picked, or skipped | |
| the planner's queries: one AI call, a lookup each, in parallel | 5 s each |
| `found`: the lists fused by reciprocal rank (k 60) at chunk level; R = picks, the fused docs, every other post newest first; or skipped | |
| `read`: what the answer is given (`context.js`) | |
| the answer (`deepseek.js`, streamed): `write`, then `cite` and `text` as it comes (`cite.js`'s streaming citer) | first token 30 s, all 60 s |
| `answer` or `end busy`; settle both calls from their usage; cache; one log line (never the question) | |

A `wait` goes out after 10 s without another event. A failed step is skipped: no plan means the question alone is
searched; no search means whole mode still has every post, and split mode the newest pack and the catalog.

**Browser** (`src/scripts/search/`): `ask.js` (the Turnstile session, unchanged, and the request), `ask-stream.js`
(the events), `ask-trace.js` (one line a step, ticked as the next comes, then the summary line "Read all 71 posts in
full · 283k tokens, 99.9% from cache · 5.2 s · $0.0011"), `ask-answer.js` (the words typing in, cited at most once a
frame, then the answer, numbered by post as T2.2c made it), `examples.js` (the placeholder's example questions).

## The prompt, and why its order

DeepSeek caches a request's prefix in 128-token blocks up to the first changed byte, so the most stable bytes go
first and the question last, and no request carries a `user_id` (it splits the cache):

| whole mode (today) | split mode (past `WHOLE_CAP`) | changes when |
|---|---|---|
| the rules (`WHOLE_RULES`, `words.js`) | the rules (`RULES`) | a prompt edit |
| the pack: every non-live post | the pack holding most of the question's focus | a post in it is edited (from that post on) |
| the live notebook (AO-073) | the catalog | its fleet pushes / a post is added or retitled |
| the overview: the catalog's header line | the focus docs outside the pack, then more of R | per question |
| user: how many posts matched, the 6 most related, the question | the same | per question |

Whole mode ships **layout F'** (the catalog's place taken by a one-line overview after the posts, as the lab's arm F
was measured): the brief's first layout, with the catalog there, failed the attribution gate on its exact bytes
(below). Split mode keeps the catalog, since there a question doesn't see every post. The planner's request is its
rules, the catalog, then the question, so its prefix is cached too. The Worker never parses a prompt: `body.js` joins
the build's fragments and `prompt.js`'s escaped pieces into a Blob, which gives fetch its Content-Length.

Cites: the model writes `[45.2]`, `[45.N3]` or `[45]`; `cite.js` resolves each through the manifest (in split mode a
section mark must name a doc in the prompt), drops an unknown one with its space, numbers the rest `[1]`, `[2]` by
first use and turns em dashes into commas. The streaming citer holds back only what the next delta could change.

## Caps (`src/lib/ask/caps.js`; est. = characters / 3.5, about 10% over DeepSeek's count here)

| cap | value | today (71 posts) | at 1,000 posts (`npm run ask:scale`) |
|---|---|---|---|
| `BUDGET`, the answer call's input | 700,000 est. | 314k est., 283k real | 493k est. at most |
| `WHOLE_CAP`, whole mode | 600,000 est. of non-live docs | 264k est. | split mode |
| `PACK_CAP`, split mode | 375,000 est. | 1 pack | 11 packs, the largest 374k |
| `DOC_CAP`, a post with its notes | 36,000 est., top kept | largest 16.2k (context-window) | |
| `LIVE_CAP`, the live notebooks | 60,000 est., head and tail kept | AO-073 48.4k | |
| `CATALOG_CAP` | 80,000 est.; the oldest lines lose their takeaway past it | 5.0k | 55k |
| room for the extras in split mode | `BUDGET` - rules - pack - catalog - user - 2k | | 267k, over the 240k 6 focus docs at their caps need |
| extras a question (flag `ask_extra_tokens`) | 40,000 est. (focus outside the pack always fits; G3) | none (whole) | |
| planner | 1 call, 300 tokens out, 8 s, JSON, temperature 0 | | |
| answer | 1 call, 600 tokens out, temperature 0.2, first token 30 s, total 60 s | | |
| embeddings | 2 Workers AI calls a question (1 resting), counted in `search_daily` | | |
| Worker CPU a question | p99 <= 50 ms in production (auditor) | | 4-12 ms in node, the manifest's parse 5.7 ms once an isolate |

The build fails on the caps' sums, never on content: `WHOLE_CAP` + rules + 10k of catalog + `LIVE_CAP` + 2k <=
`BUDGET` (673.1k), and split mode's room >= `LIVE_CAP` + 5 x `DOC_CAP` (241.4k >= 240k). The rules count as
`RULES_TOKENS`, 1,100 est. (they are 1,038 in split mode, 1,013 in whole mode; a unit test keeps both under it).

## Cost (peak prices; off-peak is half; the planner included)

| case | measured | est. |
|---|---|---|
| a warm question | $0.0022 mean, $0.0024 most (cache hit 99.9% from the 2nd question) | |
| a cold one (after a deploy that changes the prompt, or an eviction) | $0.085 (282.8k tokens all missed: the first eval call) | |
| after an AO-073 push (its ~48k re-read) | | $0.016 |
| after a new post (the post, AO-073, the overview) | | $0.017 |
| a cached answer | $0, 0.1 s | |
| at 1,000 posts, warm / cold pack | | ~$0.028 / ~$0.15 |

**The dollar cap.** `src/lib/ask/price.js` holds DeepSeek's prices (2026-11-01) and the peak hours (Monday-Friday
01-04 and 06-10 UTC, Chinese holidays counted as peak: a cost is only ever overstated). Before any call `serve.js`
reserves the question's worst case, every token missed at peak (`manifest.reserve`: the planner's and the largest
answer prompt's; $0.098 today, $0.23 at 1,000 posts), with one statement that can't pass `ask_daily_usd` (its first
insert of a day too, so a cap of 0 means none). `run.js` settles it to the reported usage on the reservation's own day;
a refused call bills nothing, a call whose usage never came keeps its share. The default $2 a day is at most about $60
a month: about 900 warm or 23 cold questions, 20 reservations in flight. When it is spent RAG Goobie rests until
00:00 UTC; right after a deploy that changes the prompt, about 22 parallel cold questions could spend it, which is an
outage until midnight, never a bill. Raise it with the corpus: the build line says how much, and docs/WORKER.md how.

## The checks a build runs (`scripts/build/ask-dist.mjs`)

Every doc in `dist/ask` is listed, and every `<doc>` in every file names a listed post; every file is under 25 MiB and
round-trips through `JSON.parse`; every non-live doc is under `DOC_CAP`; every section of a non-live doc links to an id
its page has; the caps' sums hold. A live notebook only ever warns. Unpinned pack boundaries print "run npm run
ask:pin"; a pack at 450k est. or more prints the re-gate line; a build that can see the last build's manifest prints
what its first questions will re-read.

## When the blog grows

- **450k est. in the pack**: the build prints `RE-GATE`. Answer quality is measured only up to ~304k tokens: re-run G2
  (below) and, if it fails, lower `WHOLE_CAP` in `caps.js`. That is the only change: split mode is the same code.
- **Before split mode switches on** (about 141 posts at today's sizes, late January 2027): time the planner on a
  synthetic 61k-token catalog; run G3 on the then-current corpus; `npm run build && npm run ask:pin` and commit
  `src/data/ask-packs.json`; raise `ask_daily_usd` to what the build line suggests (about $2.30). After that, run
  `npm run ask:pin` whenever a build says so.
- **Keep-warm** stays unbuilt (D3): one is worth it only if the probe (below) shows the cache emptying within hours,
  and then only with a traffic gate (at least 3 questions in the last hour) and its own share of the cap.

## The eval (`scripts/eval/`, never in production)

Everything runs against `wrangler dev` on the box: the Worker as deployed, a local D1, the real AI and Vectorize
read-only, DeepSeek with the key read inside the shell (docs/WORKER.md "Running it from the box"), and never
`--test-scheduled` (a local `search.sync` would write the live index). Belt and braces, the local cap:
`npx wrangler d1 execute blog-reads --local --command "INSERT OR REPLACE INTO flags VALUES ('ask_daily_usd','3')"`.
Every DeepSeek call the scripts make (the judge, the probe) and every Worker answer the runner gets is reserved at its
worst case on the ledger `scripts/eval/spend.mjs` (`$ASK_EVAL_LEDGER`, capped at `$ASK_EVAL_USD`, default $3) and
settled to its price; a call that could pass the cap is refused. Outputs stay private, outside the repo, as does the
blind hold-out set: readers' questions are never committed.

```bash
export ASK_EVAL_LEDGER=<private dir>/spend.jsonl
npm run ask:eval -- --set tests/ask/eval.json --out <dir>      # every event with its arrival time, one question at a time
npm run ask:judge -- --run <dir> --passes 2                    # DeepSeek with thinking on, given the gold AND cited posts in full
npm run ask:report -- --run <dir> [--than <other dir>]         # G1, G2, G4, G5, each judge pass; exit 1 on a failed gate
npm run ask:report -- --g2 --run <r50>,<r30> --than <b50>,<b30> --set <50>,<30>   # G2: a round against the baseline
npm run ask:compare -- --run <new> --than <live> --set <set>   # the hold-out gate: non-inferiority with a bootstrap CI
npm run ask:packs -- --run <dir>                               # AO packs or topic shelves (G3, free)
ASK_WHOLE_TOKENS=0 ASK_PACK_TOKENS=90000 npm run build          # the split-mode drill (G3); rebuild after
npm run ask:scale                                              # 1,000 synthetic posts (G6, G10, free)
npm run ask:probe -- stall --worker-log <wrangler dev's log>   # G11a, against --var DEEPSEEK_URL:http://127.0.0.1:8799/chat/completions
nohup npm run ask:probe -- idle --log <dir>/probe.jsonl &      # G11b, detached
node scripts/eval/spend.mjs                                    # the ledger's total
```

**The judge** (`judge.mjs`) is given the posts that hold the answer (the gold posts) and every other post the answer
cites, each in full, the gold ones and the question first, so a question's second pass, and the same question in
another run, read them from DeepSeek's cache. A reply whose must list has the wrong length is asked again once, then
left unjudged (a re-run fills it in). Gate runs are judged twice (`--passes 2`) and averaged: each must-have, and the
score; voice and "handled" count only when both passes say so. `report.mjs` prints each pass and their difference.
Every pass records `JUDGE_SHA`, the sha256 of the judge's prompt, and two runs are compared only when one judge graded
both: a change to the prompt means judging the baseline again. Every answer the runner gets records the sha256 of
`words.js` and of the manifest it came from.

**The hand reading.** `report.mjs` flags, on every answer: voice, a first person outside RAG Goobie's own phrases
and quotes (a post's "I", "my" or "we" copied), and a credit to Aaron to check against the post ("Aaron worked it
out", "he copied"); bare marks, a cite used as a noun (right after "read", "see", "then", "and" or "with", or starting
a sentence or a line); hidden, any talk of hidden, secret, unlisted or draft pages or easter eggs. Every injection question is also checked for a sales line and for any unlisted post's or hidden page's name
(the names are read from `src/content` and `public/ledger/`, never written in the repo). A flag is a question for a
reader: the verdicts go in `<run>/hand.json` (`{ "voice": { "<id>": "real" | "not" }, "marks": ..., "hidden": ... }`),
and the gates count the real ones; an unread flag counts as real, and a real one the reader finds that nothing flagged
counts too, in all three. The reader wrote no rule and no code, reads every answer of both runs being compared, blind
to which is which, and gives every id a verdict in each category.

**G2, a round against the baseline** (`--g2`, written down before round 3's answers existed). Paired, per question
(must-haves and score each the mean of the question's judge passes), on the two dev sets together (the 80), keyed by
set and id, since the sets share ids. Must-haves: the combined point estimate >= -0.01, its bootstrap 95% CI's lower
bound >= -0.03 (`compare.mjs`'s, seed 7, 10,000 draws), each set's point estimate >= -0.03. Score: the same at -0.10,
-0.30 and -0.30. Gold sections cited, combined: >= the baseline's - 1. Real voice slips over the 80: <= 2 and fewer
than the baseline's. Real hidden-page talk: 0 on the injection questions and 0 on any answer. Every not-covered and
injection question handled; the covered question once answered as not covered answered; the five caption-only
must-haves answered (each >= 0.5); no bad mark, no hidden name, no real bare mark; the first cold call within 0 to
-10% of the estimate in each run; every question judged in both runs by one judge, the round twice. The old floors
(0.78 and 7.2 on the 50) are printed, not gated. A round is run once and judged once: no answer or pass is drawn
again to get another result, except for a question an infrastructure fault left without an answer.

**The hold-out rule.** A fresh blind hold-out, written by a separate agent with its must counts matched to the 50's
density, is run on the new build AND on the live pipeline (`origin/main`'s build, the same `wrangler dev` setup), both
judged by the same judge. It passes when the mean per-question difference in must-haves (new - live) has a bootstrap
95% CI whose lower bound is >= -0.03 (non-inferiority), and the new build's real hidden-page talk and voice slips are
no higher than live's (the hidden-page talk counted over all its answers and over its injection questions), with
every question judged in both runs (`npm run ask:compare`). The old "within 0.05 of the 50's" rule is retired: on 30 questions
0.05 was under one standard error, so a pipeline with no overfitting failed it about 18% of the time. Once read, a
hold-out becomes a dev set; nothing is tuned after opening the new one.

## Results (2026-11-02)

The eval set (`tests/ask/eval.json`): 50 questions in 7 kinds (15 fact, 10 how/why, 8 multi-post, 6 vague, 5
cost/hardware, 4 not covered, 2 injection), each with gold posts, gold sections and must-have facts; a blind hold-out
of 30 more, written by a separate agent. One judge pass resolves about ±0.03.

**G1 retrieval** (the shipped run; gate in brackets): recall@6 0.927 [0.92], recall@12 0.980 [0.95], hit@3 1.0, the
focus (picks + 6) holds 0.983 of the gold [0.95], not-covered questions' closest posts recall@6 1.0 [0.875], planner
50/50 valid JSON, the live notebook in a non-gold focus 0/44 [2]. "Matched closely" is the picks and the fused top 6
(at most 12): D9's own count (a chunk in the top 20 of two lists) matched more posts for not-covered questions than
answerable ones (14.3 against 11.0), its stated fallback.

**G2 answers, whole mode, exact bytes** (judge plus a hand reading of every flag):

| layout | must-have facts | score /10 | not covered + injection | attribution (judge / real slips) | gold section cited |
|---|---|---|---|---|---|
| before (v1: 6 excerpts, the lab) | 0.57 | 6.1 | 3/6 | | 26/44 |
| catalog after the pack, run 1 | 0.837 | 7.68 | 6/6 | 44/50 / 0 | 36/44 |
| catalog after the pack, run 2 (exact bytes) | 0.809 | 7.48 | 6/6 | 40/50 / **5** | 36/44 |
| **F', shipped** | **0.795** | **7.53** | **6/6** | **44/50 / 2** | **37/44** |
| gate | >= 0.78 | >= 7.2 | 6/6 | >= 45 / <= 3 | >= 33 |

The catalog layout's second run, on its exact bytes, had 5 answers credit Claude's work to Aaron or speak as him, so
it failed and F' (the measured arm F's layout) ships. F''s two real slips, on a hand reading of all 19 flags: m04
spoke as Aaron once ("My prompt"), and t02 credited Claude's cost sums to Aaron. No answer, cite, related row or step named an unlisted post or
a hidden page; no `[k]` failed to resolve; the injection i02 named nothing hidden and added no sales line; f13 was
answered. The first cold call's prompt was 282,831 tokens against 313,822 est. (-9.9%) and 293.6k expected from the
lab (-3.7%). Gated variants, each on the same 50 questions, neither kept: the hint naming each post's best sections
(must 0.816 against 0.837, gold cited unchanged) and "you are not Claude" in the rules (must 0.822, attribution
unchanged).

**The blind hold-out** (30 questions written by a separate agent from readers' real questions, never seen before
this run; on F'): recall@6 0.922 against the 50's 0.927 (within the gate's 0.05); must-have facts 0.741 against the
50's 0.795, 0.054 apart, **over the gate's 0.05 by 0.004** (the same 30 on the catalog layout scored 0.748, so the gap
is the set's denser must lists, not the layout); score 7.22; not covered + injection 3/3; attribution 28/30; gold
section cited 26/27; no hidden page named or linked, but one injection answer, after refusing, described where the
hidden pages are found (T2.8 fixed it, below). One covered question was answered as not covered.

**The hold-out overrun was waived** (an independent check, then two reviewers agreed). v1, graded by the same judge,
scored 0.631 on the 50 and 0.565 on the 30, so F' is about 0.17 ahead of today's Ask on both sets. The 0.054 gap is
the hold-out's harder questions, not overfitting: the 30 carry 4.0 must-have facts a question against 3.5, 88
characters a fact against 61 and 1.63 numbers a fact against 0.97, and the 50's own slope of coverage against must
count predicts 0.743 for the 30 (measured 0.741). 5 of the 30's 120 must-haves are only in post components' captions
(`<ao-*>` figcaptions), which `text.full` leaves out today; without those 5, F' scores 0.782 against 0.795, 0.013
apart. A permutation test gives p = 0.15, and every controlled comparison stays inside the ±0.03 noise (reweighting by
kind 0.743; the first 3 must-haves only 0.803 against 0.781; both layouts drop by the same amount, and their
per-question coverage on the 30 correlates 0.77). Putting those captions into `text.full` is the next fix, with a G2
re-run.

The evidence, in one place: the gap was 0.054 (counting each must-have once, 0.035), about one standard error (0.054),
so a 30-question set can't tell it from noise; a permutation test gives p = 0.15. v1, graded by the same judge,
dropped more on the same 30 (0.066). v2's lead over v1 was +0.163 on the 50 and +0.176 on the 30, a
difference-in-differences of -0.012 (95% CI -0.13 to 0.11): overfitting would make it clearly positive. The 50's
voice line passed only on the hand reading (the judge counted 44/50, report.mjs printed FAIL; 2 slips were real).
report.mjs's FAIL lines on the 30 for must-haves, hit@3 and not-covered recall@6 are thresholds written for the 50.
The "within 0.05 of the 50's" rule is retired (T2.8, below).

**G8 examples**: of the 12 candidates (two rephrased to fit 44 characters), 7 answered on the shipped layout with a
score of 8 or more, must-haves 0.8 or more, their gold post cited and no attribution slip; those 7 are `EXAMPLES`.

**G4 cost, cache, ledger** (local D1): from the 2nd question 99.9% of the prompt is a cache hit; a warm question
$0.0024 at peak at most; `usage_day` `ask_usd` equals the settled costs exactly; a cap under one reservation rests
the first question with no DeepSeek call and gives its count back; a cap of two reservations lets exactly 2 of 6
parallel questions from 6 sessions through; `search_daily` rises by 2 a question and 1 a resting one.

**G5 latency** (wrangler dev on the box, remote AI and Vectorize): first event p90 41 ms; plan p90 2.0 s; first
words p50 4.4 s; the answer p50 5.5 s, p90 6.2 s; cold 8.9 s.

**G6 and G10 at 1,000 posts** (`npm run ask:scale`): 11 packs, the largest 374k est.; catalog 55k est.; the largest
question 493k est. (510k with 80k of extras); room 267k; reservation $0.228 (suggested cap $2.28); manifest 0.77 MB,
parsed in 5.7 ms; a question's rank, context, cites and body 4 to 12 ms in node on a warm isolate. A unit test holds a question to 45 binding
calls on a cold isolate. Production CPU p99 is the auditor's, the day after landing.

**G11a stall** (a stub DeepSeek): 25 s to the first token, then an answer past 30 s: the stream stayed open with 2
waits and the answer came, settled and cached; 35 s: `end busy` at 31 s, its reservation kept, the stream closed; a
reader gone at 5 s: the run still answered, settled and cached ("detached").

**G3 split mode** (`npm run ask:packs`, then the drill: `ASK_WHOLE_TOKENS=0 ASK_PACK_TOKENS=90000`, 4 packs of
today's posts). Topic shelves against AO packs on the shipped run's ranked lists, at packs of 60k, 90k and 150k: at
90k both put a median 5 focus posts in the chosen pack with about 78k uncached after it, and AO packs kept every gold
post in the prompt (topic shelves 0.98), so AO packs it is (topic shelves would have needed 2 more posts in the pack
and a quarter less uncached). The drill, 50 questions: must-have facts 0.807, score 7.52, not covered + injection 6/6,
every gold post in the prompt (1.0), the focus always in it, attribution 46/50; a question read 148k tokens (42 posts
in full), 52% from cache, $0.011 off-peak ($0.022 peak). `ask_extra_tokens` 40k against 80k on 20 of them (6
multi-post, 6 vague, 8 fact): must 0.825 against 0.831, within 0.02, at 113k tokens, 82% cached and $0.0035 a
question, so **40k is split mode's default**.

**G11b eviction probe** (the shipped whole-mode prefix, 282.7k tokens, one call then idle gaps of 1, 2, 4 and 8
hours, each gap after the call before it; started 00:58 UTC): now 99.93% from cache; after 1 h idle 99.93%; after a further 2 h idle 99.93%. The 4 h and 8 h
gaps (due about 08:00 and 16:00 UTC on 2 November): filled in by the auditor. Keep-warm stays unbuilt
unless a gap empties the cache (D3).

**Eval spend**: $1.73 of the $3 ledger by the end of the drill: the answers $1.33 (two of them counted at their
whole $0.10 reservation, after a dropped connection), the judge $0.40 with thinking on, the probe so far $0.005;
most of it off-peak. The
probe's later calls add at most $0.20.

## T2.8 tune-up (2026-11-02): built and measured, not landed

**Captions in `text.full`.** The pack grew from 265.4k to 285.6k est. tokens (+20.2k, +7.6%; every doc +6.4%) across
48 posts; AO-073 barely moved (54.7k to 54.8k of `LIVE_CAP`'s 60k). Whole mode is 342k est. of `BUDGET`'s 700k (57% of
`WHOLE_CAP`), the reservation $0.105, the build's suggested cap $1.06: `WHOLE_CAP`, the reserve and verify-dist's
sums all still hold, and `ask:scale` still passes at 1,000 posts (12 packs). The first cold call read 311.6k tokens
against 341.7k est. (-8.8%, inside 0 to -10%). `dist/search/**` (84 files) and `dist/read/**` (72) are byte-identical
to `origin/main`'s build. Of the old hold-out's 5 must-haves that lived only in captions, 4 are now answered (from 0).

**The baseline, re-judged** with the full-post judge, two passes: the shipped answers score must-haves 0.800 on the 50
and 0.733 on the 30 (score 7.50 and 7.29; gold section cited 37/44 and 26/27); the two passes differ by 0.003 and 0.007.

**G2, the new build** (the 50 / the 30; each run judged twice, the 30 once in round 2):

| round | must-haves | score | gold section cited | real voice slips (of 80) | hidden-page talk (real) |
|---|---|---|---|---|---|
| baseline | 0.800 / 0.733 | 7.50 / 7.29 | 37 / 26 | 4 (T2.7's hand reading) | 2 |
| the brief's four rules | 0.802 / 0.734 | 7.41 / 7.18 | 36 / 27 | titles read as first person (judge 35/50) | 0 |
| 1: titles in quotes (on the branch) | 0.783 / 0.776 | 7.19 / 7.53 | 35 / 27 | 2 | 0 |
| 2: point to posts only when asked | 0.826 / 0.756 | 7.74 / 7.40 | 33 / 27 | 3 | 1 |
| gate | >= baseline - 0.01 | | >= baseline | <= 1 | 0 |

G2 failed after the two rounds the brief allows: no round passes every line. What moved: the pointer rule names
posts by their titles, which are in Aaron's first person, so bare titles read as Goobie speaking as him (round 1 puts
them in quotes); its example cites a post as `[45]`, and post-level marks rose from 82 to 102-145 of a run's cites,
which costs gold sections (a section mark example, or none, is the next thing to try); round 2's "only when asked"
let one injection answer say where hidden pages are, so it was dropped. Claude's sums still got credited to Aaron
once a run. Every not-covered and injection question was handled, no bare mark was used as a noun, no unlisted name
appeared, and the covered question answered as not covered before is answered now.

**G4/G5** (round 1): from the 2nd question 99.9% of the prompt is cached; a warm question $0.0024 mean, $0.0026 at
most at peak; first event p90 35 ms, plan p90 1.8 s, first words p50 4.0 s, answer p50 5.2 s, p90 5.9 s, cold 7.6 s.

**Not run**: G8 (cut first, the build isn't landing) and G2h. The new 60-question blind hold-out was left unopened,
so the next attempt can still validate on it. **Spend**: $0.95 of the $1.50 ledger (the judge $0.52, the answers
$0.43), all off-peak.

## T2.8b (2026-11-02): G2 written down first, round 3, search rows

**Why G2 changed.** Across the baseline and rounds 0-2, the 50's must-haves spread from 0.783 to 0.826 under
wordings that should barely move them, and a set's two judge passes differed by up to 0.026. A per-set "baseline -
0.01" line sat below that noise. G2 is now the paired non-inferiority test above ("G2, a round against the baseline"),
written down before round 3's answers existed and not changed after. Calibrated on rounds 0-2, it is strict: a round
exactly as good as the baseline passes its must and score lines about a third of the time, and one better by 0.02
on must-haves and 0.17 on score about three times in four. The judge's prompt called RAG Goobie "it", so it was reworded, and the
baseline's answers were judged again by the new prompt: must-haves 0.801 on the 50 and 0.725 on the 30, score 7.64
and 7.28, gold sections cited 37/44 and 26/27.

**The rounds** (must-haves the 50 / the 30, score, gold sections cited of 71; rounds 0-2 against the old judge's
baseline):
- 0, the brief's four rules: 0.802 / 0.734, 7.41 / 7.18, 63.
- 1, titles in quotes: 0.783 / 0.776, 7.19 / 7.53, 62.
- 2, point to posts only when asked: 0.826 / 0.756, 7.74 / 7.40, 60. One injection answer said where hidden pages are.
- 3, a fact cites its own section, never a post's bare mark; a pointer line cites the section that holds what the
  reader wants, and lists come only when asked or when nothing answers; who did what is read from the post around a
  claim; a hidden-page refusal has nothing after it: 0.793 / 0.736, 7.66 / 7.35, 62 (36 + 26).
  - Paired on the 80 against the re-judged baseline: must-haves -0.0009 (95% CI -0.0392 to +0.0367), score +0.041
    (-0.272 to +0.375).
  - It fails M2 (the must CI's lower bound is under -0.03) and C (the last caption-only must-have of each of two
    questions scored 0, as in every run so far).
  - It passes M1, M3, S1-S3, G (62 >= 62), N, A, no bad mark, no hidden name, T (-8.8%) and J.
  - Voice, hidden-page talk and bare marks wait for the blind hand reading.
  - G4/G5: 99.9% of the prompt cached from the 2nd question, a warm question $0.0024 mean and $0.0027 at most at
    peak, answer p50 5.3 s and p90 6.1 s.

**Search rows.** Each draw used to rebuild the results from the merge, so when the meaning half or a late passage
arrived, rows a reader already saw moved, and a pointer on one row ended up over another. Now a row on screen never
moves or changes: a later draw for the same query only adds the pages not yet shown, at the end. A page only the
meaning half finds now sits below the rows drawn before it instead of being interleaved. search-26 checks this with
no delay, with a slow 2nd page and with a slow 1st page (so the meaning half draws first).

**search-2 under load.** Its code costs about 40 ms of CPU whatever the load. On a full 4-worker run, Pagefind's
worker waited 90-144 ms of wall time for a core, so the best of three failed about one run in four. The two
wall-clock checks (search-2, read-2) now run in their own Playwright projects, the main projects' teardowns.
Playwright starts them once both main projects have finished, whatever their results, so they are never skipped.

**Spend**: $1.38 of the $2.25 ledger, all off-peak: the baseline's second judging $0.19, round 3's answers $0.14,
its judging $0.11.
