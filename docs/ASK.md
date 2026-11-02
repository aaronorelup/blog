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
settled to its price; a call that could pass the cap is refused. Outputs stay private (`.rework/rag/`), as does the
blind hold-out set: readers' questions are never committed.

```bash
export ASK_EVAL_LEDGER=<private dir>/spend.jsonl
npm run ask:eval -- --set tests/ask/eval.json --out <dir>      # every event with its arrival time, one question at a time
npm run ask:judge -- --run <dir>                               # DeepSeek with thinking on, given gold AND cited sections
npm run ask:report -- --run <dir> [--than <other dir>]         # G1, G2, G4, G5; exit 1 on a failed gate
npm run ask:packs -- --run <dir>                               # AO packs or topic shelves (G3, free)
ASK_WHOLE_TOKENS=0 ASK_PACK_TOKENS=90000 npm run build          # the split-mode drill (G3); rebuild after
npm run ask:scale                                              # 1,000 synthetic posts (G6, G10, free)
npm run ask:probe -- stall --worker-log <wrangler dev's log>   # G11a, against --var DEEPSEEK_URL:http://127.0.0.1:8799/chat/completions
nohup npm run ask:probe -- idle --log <dir>/probe.jsonl &      # G11b, detached
node scripts/eval/spend.mjs                                    # the ledger's total
```

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
| **F', shipped** | **0.795** | **7.53** | **6/6** | **44/50 / 1** | **37/44** |
| gate | >= 0.78 | >= 7.2 | 6/6 | >= 45 / <= 3 | >= 33 |

The catalog layout's second run, on its exact bytes, had 5 answers credit Claude's work to Aaron or speak as him, so
it failed and F' (the measured arm F's layout) ships. No answer, cite, related row or step named an unlisted post or
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
