---
id: "AO-090"
title: "Find the input that makes a bad patch look right, before fixing"
summary: "Experiment: a plain fix prompt vs a find-the-trap-input-first prompt on 5 seeded bugs. Hypothesis: finding that input first catches bugs fix-first misses. Models: Claude Opus 5.5, effort xhigh. Look for: hidden tests passed."
date: 2026-11-24
topic: "agents"
draft: false
credits:
  owner: "Gages"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 xhigh"
  writer: "Opus 5.5 medium"
  cost: 16.73        # the build session with its 14 sub-agents, and the session that wrote the post
preview:
  verdict: "34/34 vs 33/34"
  takeaway: "Plain-prompt patches passed 34 of 34 hidden tests. Find-the-trap-first patches passed 33 of 34 and took 7.63 agent-minutes to the plain arm's 2.92."
  points:
    - "Bug 3 run three times per arm: plain 18 of 18 hidden tests, method 16 of 18."
    - "Each miss kept SQLite LIKE, which ignores case only for A to Z, so 'ärzte' did not find 'Ärzte anrufen'."
    - "Every method agent named a trap input before editing, and each matched a hidden test. Plain agents covered those cases unasked."
---

My agents tested a prompt trick for coding agents: before fixing a bug, find one input where a wrong fix would still look right. They seeded 5 bugs in a small app and gave each bug to two fresh agents, one with a plain "fix this bug" prompt and one with the trap-first prompt. **The 5 plain patches passed 34 of 34 hidden tests. The 5 trap-first patches passed 33 of 34.** The trap-first runs took 7.63 agent-minutes and 50,416 output tokens. The plain runs took 2.92 minutes and 19,183.

The idea comes from an X post by [GlebS1nitsyn](https://x.com/GlebS1nitsyn/status/2125210101308944488), whose claim is that this catches bugs a fix-first agent misses. The agents could not read the post itself, so the prompt below is built from the claim as my agents wrote it down.

The technique as a template: before you fix a bug, find one input where a plausible wrong patch would still look right, write its expected result as a check, and see it fail first. The prompt that ran, word for word:

```
[AGENT: <name>]
Fix this bug, in this order:
1. Before you edit anything, find one input where a plausible wrong patch would still look right. Show me one input where this patch would look right and still return the wrong result.
2. Write the exact expected result for that input as a check.
3. Run that check before editing. It should fail.
4. Make the smallest patch that fixes the bug.
5. Run the check again, and the existing tests.
Bug: <bug report>
The code is in <workspace> (Python 3 + SQLite, standard library only). Work only inside that folder and do not read anything outside it. Run the existing tests with `python3 -m pytest -q` from that folder. When you are done, reply with a short summary of what you changed and the input you found.
```

- **10 runs, one per bug per prompt.** Same model, same effort, same bug report. Each agent got its own copy of the app.
- **34 hidden tests.** The agents never saw them. A patch "looked right" if it passed the app's own demo tests and the bug report's example.
- **One patch looked right and still missed a hidden test.** It was the trap-first fix for the search bug.
- **Bug 3 was run twice more per prompt.** Plain passed 18 of 18 hidden tests across 3 runs. Trap-first passed 16 of 18.
- **Every trap-first agent named a concrete trap input** and tested at least one wrong patch before editing. Each trap it named matches one of the hidden tests.
- **Every plain agent read the whole 150-line file too** and covered those same cases without being asked.

<ao-bars unit="tests" max="8">
<table><thead><tr><th>Bug</th><th>Plain prompt</th><th>Trap-first prompt</th></tr></thead>
<tbody>
<tr><td>1. Ties in the sort order</td><td>6</td><td>6</td></tr>
<tr><td>2. Off by one at the last page</td><td>8</td><td>8</td></tr>
<tr><td>3. Case and spaces in search</td><td>6</td><td>5</td></tr>
<tr><td>4. Empty status in filters</td><td>7</td><td>7</td></tr>
<tr><td>5. Time zone day edges</td><td>7</td><td>7</td></tr>
</tbody></table>
<figcaption><b>Hidden tests passed per bug, one run each.</b> Bugs 1 to 5 have 6, 8, 6, 7 and 7 hidden tests.</figcaption>
</ao-bars>

## The one miss

The search bug was a query with two spaces that found nothing. The trap-first fix squashed the spaces on both sides but kept SQLite's LIKE (the database's built-in text match). LIKE ignores case only for the letters A to Z, so a search for 'ärzte' does not find 'Ärzte anrufen'. In the two extra runs, one trap-first agent moved the match into Python and passed 6 of 6. The other kept LIKE again and said it left case for plain letters only "to keep the patch small".

## The test app

A Python file of about 150 lines on SQLite, with five functions and a description of what each must do. Each of the 5 bugs was planted on purpose. Before any agent ran, a correct fix passed all 34 hidden tests. For bugs 2 to 5 a plausible wrong fix passed the demo tests and the report's example and still failed 2 to 4 hidden tests.

## Limits

One run per bug per prompt in the main table, so one miss is one run. The descriptions spell out each rule and the file is small, which may be why the plain agents reached the hidden cases too.

<details><summary>Every run, with minutes and output tokens</summary>

| Run | Bug | Prompt | Hidden tests | Minutes | Output tokens | Tool calls |
|---|---|---|---|---|---|---|
| w01 | 1 | Plain | 6 / 6 | 0.75 | 4,906 | 6 |
| w02 | 1 | Trap-first | 6 / 6 | 3.40 | 22,349 | 10 |
| w03 | 2 | Plain | 8 / 8 | 0.44 | 2,858 | 6 |
| w04 | 2 | Trap-first | 8 / 8 | 0.98 | 6,382 | 7 |
| w05 | 3 | Plain | 6 / 6 | 0.65 | 4,255 | 7 |
| w06 | 3 | Trap-first | 5 / 6 | 0.96 | 6,374 | 7 |
| w07 | 4 | Plain | 7 / 7 | 0.35 | 2,258 | 4 |
| w08 | 4 | Trap-first | 7 / 7 | 0.98 | 6,430 | 6 |
| w09 | 5 | Plain | 7 / 7 | 0.73 | 4,906 | 6 |
| w10 | 5 | Trap-first | 7 / 7 | 1.31 | 8,881 | 8 |
| w11 | 3 | Plain | 6 / 6 | 0.78 | 5,067 | 7 |
| w12 | 3 | Trap-first | 6 / 6 | 1.09 | 6,947 | 8 |
| w13 | 3 | Plain | 6 / 6 | 0.76 | 4,910 | 6 |
| w14 | 3 | Trap-first | 5 / 6 | 1.02 | 6,412 | 7 |

Runs w11 to w14 are the two extra runs per prompt on bug 3. The plain prompt was "Fix this bug." with the same bug report, folder and test lines, ending "reply with a short summary of what you changed."

</details>

*My agents picked this idea, ran the test and wrote it up.*
