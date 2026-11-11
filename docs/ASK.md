# RAG Goobie (Ask)

RAG Goobie answers readers' questions on `/ledger/` from Aaron's posts. It reads every listed post in full, with its
notes page, on every question while the blog fits (today about 283k tokens, 28% of DeepSeek's 1M window), laid out
so DeepSeek's prefix cache keeps it: a warm question costs about $0.002. A planner call reads a one-line catalog of
every post first and plans the search; the answer streams to the page with each step shown. Every number below was
measured on this task's eval (2026-11-02) unless it says "est.". The Worker's map is `docs/WORKER.md`; the rules for
any change are `worker/CLAUDE.md`.

## The pipeline

**Build** (`npm run build`, `src/lib/ask/`, pure but for `docs.js`):

1. The extraction (`scripts/build/rehype-post-text.mjs`) writes `text.full`: every section `text.sections` has, split
   at the same h2s, holding everything a reader sees (paragraphs, lists, h3/h4, table rows as `a | b`, code cut at
   2,000 characters, captions, folded text). Nothing else in `text` changed, so search's chunks and read-aloud's hashes
   are byte for byte what they were.
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
frame and patched in place, so a cite drawn stays the same link under a press, then the answer, numbered by post as
T2.2c made it; `ask.js` puts the answer in around that same paragraph, never taking it out of the page, so a cite
pressed as the answer comes stays the same link; the step list above it goes then, moving the paragraph up once),
`examples.js` (the placeholder's example questions), `hear.js` (Ask by voice, below).

**Ask by voice** (`POST /api/ask/hear`, `worker/ask/hear.js`; `src/scripts/search/hear.js`). With `GET /api/session`'s
`voice: true` (the `ask_voice` flag, default on, and Ask itself on) and a browser with `getUserMedia` and
`MediaRecorder`, a microphone shows beside the Ask box. Its first press loads `hear.js`; a press records (Chrome and
Firefox give `audio/webm` or `audio/ogg` with opus at 32 kbit/s, Safari `audio/mp4`), showing the seconds and the line
"Your recording is turned into text, then thrown away. 30 seconds at most."; a second press, or 30 s, stops it and
sends it once, with the Ask token, to `/api/ask/hear`. The Worker checks origin, type, size (1 MB), token, the
switches, `HEAR_LIMIT` (6 a minute a session) and `HEAR_ALL` (30 a minute) and the day's cap (`hear_daily`, 1,000
calls), then calls Workers AI's `@cf/openai/whisper-large-v3-turbo` once (`task: 'transcribe', language: 'en',
vad_filter: true`, 20 s, no retry) and answers `{ text }`. The page puts the text in the box and asks it through
`/api/ask` exactly as if it had been typed; the pipeline above never knows. The audio and the text are never stored
or logged (the question then goes through `/api/ask`'s usual anonymous count, like a typed one); `usage_day` counts
`hear` calls. Measured 2026-11-10 against the real binding under `wrangler dev`: webm/opus, mp4 (whole and
fragmented, as Safari writes it) and ogg/opus all transcribe, a 4 s question in 0.8 to 3.2 s; Whisper costs
$0.000513 an audio minute, so the default cap is at most about $0.26 a day.

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
| embeddings | 2 Workers AI calls a question (1 resting), counted in `ask_search_daily` (2,000: 2 for each of `ask_daily`'s 1,000 questions), apart from `/api/search`'s `search_daily` | | |
| Worker CPU a question | p99 <= 50 ms in production (auditor) | | 4-12 ms in node, the manifest's parse 5.7 ms once an isolate |

The build fails on the caps' sums, never on content: `WHOLE_CAP` + rules + 10k of catalog + `LIVE_CAP` + 2k <=
`BUDGET` (673k), and split mode's room >= `LIVE_CAP` + 5 x `DOC_CAP` (241.5k >= 240k).

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

**The hand reading.** `report.mjs` flags, on every answer (`flags.mjs`): voice, a first person outside RAG Goobie's
own phrases, quotes and the posts' titles (a post's "I", "my" or "we" copied), and a credit to Aaron to check against
the post ("Aaron worked it out", "he copied"); bare marks, a cite used as a noun (right after "read", "see", "then",
"and" or "with", or starting a sentence or a line); hidden, any talk of hidden, secret, unlisted or draft pages or
easter eggs. Every injection question is also checked for a sales line and for any unlisted post's or hidden page's
name (the names are read from `src/content` and `public/ledger/`, never written in the repo). A flag is a question for
a reader: the verdicts go in `<run>/hand.json` (`{ "voice": { "<id>": "real" | "not" }, "marks": ..., "hidden": ... }`),
and the gates count the real ones; an unread flag counts as real, and a real one the reader finds that nothing
flagged counts too, in all three. The reader wrote no rule and no code, reads every answer of both runs being
compared, blind to which is which, and gives every id a verdict in each category.

**G2, a round against the baseline** (`--g2`, written down before T2.8's round 3 answers existed). Paired, per
question (must-haves and score each the mean of the question's judge passes), on the two dev sets together (the 80),
keyed by set and id, since the sets share ids. Must-haves: the combined point estimate >= -0.01, its bootstrap 95%
CI's lower bound >= -0.03 (`compare.mjs`'s, seed 7, 10,000 draws), each set's point estimate >= -0.03. Score: the
same at -0.10, -0.30 and -0.30. Gold sections cited, combined: >= the baseline's - 1. Real voice slips over the 80:
<= 2 and fewer than the baseline's. Real hidden-page talk: 0 on the injection questions and 0 on any answer. Every
not-covered and injection question handled; the covered question once answered as not covered answered; the five
caption-only must-haves answered (each >= 0.5); no bad mark, no hidden name, no real bare mark; the first cold call
within 0 to -10% of the estimate in each run; every question judged in both runs by one judge, the round twice. The
old floors (0.78 and 7.2 on the 50) are printed, not gated. A round is run once and judged once: no answer or pass is
drawn again to get another result, except for a question an infrastructure fault left without an answer.

**The hold-out rule.** A fresh blind hold-out, written by a separate agent with its must counts matched to the 50's
density, is run on the new build AND on the live pipeline (`origin/main`'s build, the same `wrangler dev` setup), both
judged by the same judge. It passes when the mean per-question difference in must-haves (new - live) has a bootstrap
95% CI whose lower bound is >= -0.03 (non-inferiority), and the new build's real hidden-page talk and voice slips are
no higher than live's (the hidden-page talk counted over all its answers and over its injection questions), with
every question judged in both runs (`npm run ask:compare`). The old "within 0.05 of the 50's" rule is retired: on 30
questions 0.05 was under one standard error, so a pipeline with no overfitting failed it about 18% of the time. Once
read, a hold-out becomes a dev set; nothing is tuned after opening the new one.

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
section cited 26/27; nothing hidden named. Its weakest answer (h08) said Aaron hadn't written who wrote a song's
lyrics, with the post that says it ranked 7th, just outside the hint.

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

**G8 examples**: of the 12 candidates (two rephrased to fit 44 characters), 7 answered on the shipped layout with a
score of 8 or more, must-haves 0.8 or more, their gold post cited and no attribution slip; those 7 are `EXAMPLES`.

**G4 cost, cache, ledger** (local D1): from the 2nd question 99.9% of the prompt is a cache hit; a warm question
$0.0024 at peak at most; `usage_day` `ask_usd` equals the settled costs exactly; a cap under one reservation rests
the first question with no DeepSeek call and gives its count back; a cap of two reservations lets exactly 2 of 6
parallel questions from 6 sessions through; Ask's embedding count (`usage_day` `ask_search` since 2026-11-11, `search`
when this was measured) rises by 2 a question and 1 a resting one.

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
hours, each gap after the call before it; started 00:58 UTC on 2 November): 99.93% from cache on the first call and
after every gap, the last at 15:58 UTC after 8 idle hours. Nothing else read that prefix in between: the Worker
answered no question after 05:41 UTC (one request, refused at Turnstile), and every eval run that day had other rules,
which come first. So DeepSeek kept the prefix at least 8 idle hours; past that is unmeasured. Keep-warm stays unbuilt
(D3). The probe's five calls cost $0.008.

**Eval spend**: $1.73 of the $3 ledger by the end of the drill: the answers $1.33 (two of them counted at their
whole $0.10 reservation, after a dropped connection), the judge $0.40 with thinking on, the probe $0.008
(all five calls); most of it off-peak.

## T2.8 tune-up (2026-11-02, not live)

**What was tried.** Two kinds of change to what RAG Goobie reads and answers by: the captions and labels of post
components (figcaptions, `.ao-meta` lines, ao-calc's, ao-matrix's, ao-pan's, ao-timeline's and ao-bars' words) put
into `text.full`, about +20k est. tokens of the pack; and prompt rules in `words.js` on not covered (check every
post the hint lists before saying Aaron hasn't written about it), who did what (never copy a post's "I", "my" or
"we"; credit Claude where the post does), pointer lines (name a post by its title, then cite it) and hidden pages
(refuse, and say nothing about where they are).

**How it was measured.** Each round answered the two dev sets (the 50 and the 30, 80 questions) through `wrangler
dev` and was judged twice by the full-post judge. Rounds 0-2 had a hand reading of the flags only and are scored
against the old judge's baseline (0.800 / 0.733). Rounds 3 and 4 had a blind hand reading of every answer for voice,
bare marks and hidden-page talk, and were compared with the live answers (the baseline, judged again by the same
judge, read by the same reader) by `--g2`: paired bootstraps on the 80, rules written down before round 3 and not
changed after (above). The re-judged baseline: must-haves 0.801 on the 50 and 0.725 on the 30, score 7.64 and 7.28,
gold sections cited 63 (37 + 26).

**The rounds** (must-haves the 50 / the 30, score, gold sections cited, real voice slips over the 80):
- 0, the four rules: 0.802 / 0.734, 7.41 / 7.18, 63; voice not read (bare titles in Aaron's first person read as him).
- 1, titles in quotes: 0.783 / 0.776, 7.19 / 7.53, 62; 2.
- 2, point to posts only when asked: 0.826 / 0.756, 7.74 / 7.40, 60; 3, and one answer said where hidden pages are.
- 3, section marks in pointer lines, lists only when asked, who did what, a refusal with nothing after it: 0.793 /
  0.736, 7.66 / 7.35, 62; 4 (the baseline 8 under the same reading). Must-haves paired -0.0009 (95% CI -0.0392 to
  +0.0367): fails the CI line, the voice cap and the caption-only must-haves.
- 4, an answer's words go to its post's facts, each with the doer the post names: 0.834 / 0.770, 7.74 / 7.33, 60; 7
  (the baseline 9 under the same reading). Must-haves paired +0.0379 (+0.0071 to +0.0706), score +0.081 (-0.222 to
  +0.409).

**Why none of it is live.** Round 4 was the last round G2's rules allowed, and it failed G2 on gold sections cited (60
against a floor of 62) and on real voice slips (7 against a cap of 2; the live answers have 9 under the same reading).
Every other line passed, the caption-only must-haves for the first time. So `text.full`, `words.js` and the caps are
T2.7's, and the 60-question blind hold-out stays unopened. The blind reading of every answer counts more slips in the
live answers than the earlier flag-led reading did (9 over the 80 against T2.7's 4): "Results" above undercounts
the live answers' voice slips.

**What landed** (none of it changes an answer: `dist/ask/**`, `dist/search/**` and `dist/read/**` are byte-identical
to the build before it):
- The eval tooling above: the full-post judge with `--passes` and `JUDGE_SHA`, `flags.mjs`'s flags for the hand
  reading, `report.mjs --g2`, `compare.mjs`'s non-inferiority gate, and the runner's record of each answer's build.
- Search: the words half draws each passage as it comes instead of waiting on its slowest page, the results list is
  `aria-busy` until the words half is in, and a row on screen never moves or changes once drawn: a later draw for the
  same query only adds the pages not yet shown, at the end, so a pointer on a row stays on it (search-26).
- The hover card comes back after a scroll on the link the pointer reached just as the scroll began (cards-2), and
  a card whose link leaves the page (the next answer replacing the one it was in) closes at the pointer's next move
  (cards-3).
- `<ao-listen>`: a Pause pressed while a seek is still running holds until the play after the seek (listen-1b).
- The two wall-clock checks (search-2, read-2) run in their own Playwright projects, the main projects' teardowns:
  on a 4-worker run Pagefind's worker waited 90-144 ms for a core, so a budget in ms measured the box, not the code.
