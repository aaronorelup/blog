---
id: "AO-100"
title: "Agent ports one of Aaron's Python scripts to Rust and times it"
summary: "The script checks my X post drafts, and both versions had to print the same bytes on the same seeded test drafts."
date: 2026-11-28
topic: "agents"
draft: false
credits:
  owner: "Duet"
  worker: "Anthropic fleet"
  orchestrator: "Opus 5.5 xhigh"
  cost: 9
preview:
  verdict: "1,000/1,000 outputs match"
  takeaway: "Run once per draft, the checks took 83.3 CPU seconds in Python, 25.0 in the straight Rust port and 8.1 after one tuning round."
  points:
    - "All drafts in one process: Python 1.65 s, Rust 1.20 s, tuned Rust 0.74 s of CPU."
    - "They matched on the first full comparison, no fix rounds. A build with Rust's own letter lists matched 998."
    - "Starting Python cost 15.8 ms a call. About 22.3 of the 25.0 ms of a straight Rust call went to building text patterns."
  image: "/media/previews/agent-ports-one-of-aaron-s-python-scripts-to-rust-and-times-it.webp"
  alt: "Bar chart of CPU seconds for 1,000 drafts. One process per draft: Python 83.3, Rust v1 25.0, Rust v2 8.14. All in one process: Python 1.65, Rust v1 1.20, Rust v2 0.74."
---

My agents had Claude Code rewrite one of my Python scripts in Rust and timed both on the same 1,000 drafts. **Run once per draft, the checks took 83.3 CPU seconds in Python, 25.0 in the straight Rust port and 8.1 after one tuning round.** With all 1,000 drafts in one process: Python 1.65 seconds, the straight port 1.20 and the tuned port 0.74. Every one of the 1,000 outputs matched the Python byte for byte on the first full comparison.

The idea came from Anthropic's note on moving its API to Rust. A news story on it says Claude agents helped move Anthropic's Messages API from Python to Rust and that CPU use per request fell about 70% ([the story](https://www.theneuron.ai/news/anthropic-claude-api-rust-migration/)). This tests the same move on one small script of mine, not on Anthropic's code.

The technique, as a template you can paste: ask a coding agent to port a script to another language, require byte-identical output on a seeded set of test inputs, then time both one call at a time and in one batch (optional: one profiling round). These are the steps that ran, word for word, with this test's parts as placeholders:

```
Make <1,000> test inputs in <a scratch folder> (<mix of real-looking drafts: short, long, with links, with banned words, edge cases>), seeded so they can be rebuilt.
Have Claude Code write a Rust port (cargo, release build) that gives byte-identical output to the Python script on every input. Record how many rounds of fixes it took to reach identical output.
Time both: wall clock and CPU (user+sys) over all <1,000> inputs, 5 runs each, report median. Include process start cost both per-call and in one batched run if the script allows it.
```

![Bar chart of CPU seconds for 1,000 drafts. One process per draft: Python 83.3, Rust v1 25.0, Rust v2 8.14. All in one process: Python 1.65, Rust v1 1.20, Rust v2 0.74.](/media/agent-ports-one-of-aaron-s-python-scripts-to-rust-and-times-it/cpu-python-vs-rust.webp)

- **Same output, first try.** Same printed bytes, same fixed-up file and same exit code on 1,000 of 1,000 drafts at the first comparison. Two compile errors came before it.
- **One process per draft:** Python 83.3 s of CPU, Rust v1 25.0 s (70% less), Rust v2 8.1 s (90% less).
- **All drafts in one process:** Python 1.65 s, Rust v1 1.20 s, Rust v2 0.74 s.

## What was tested

The script is the checker my agents run on every X post they write for me. It fixes what it can in a draft (long dashes, emoji, hashtags) and sends back what it can't (selling phrases, a second link, key-shaped text, over 280 characters). It is 671 lines of Python.

The port covers the text checks, the part the posts use, with no network. Python ran the original on Python 3.13. Rust v1 is the straight port, a release build with two outside libraries (fancy-regex for patterns that look backward, sha2 for hashing). Rust v2 is the same port after one profiling round. All three ran on a 4-core Linux cloud box, one call at a time.

A seeded script made the 1,000 drafts: short and long posts, links in every form, selling phrases, fake keys, emoji, thread marks like 1/5, Japanese and Arabic text, odd spaces and broken headers. Each also picked one of four output modes.

## What took the time

- **Python per call** is mostly setting up. Starting the interpreter and loading the script's libraries took about 60 ms of CPU in a separate run of 600 calls. The checks themselves took about 1.65 ms a draft in the batch run.
- **Rust v1 per call** is mostly building its text patterns. Start-up took 1.46 ms and the checks about 1.20 ms a draft, which leaves about 22.3 of the 25.0 ms. A profile of one call counted 63 patterns built, the costliest near 1.5 ms. The costly ones all carry Python's full list of word, digit or space characters.
- **Rust v2** turned 30 patterns that look for a phrase between word edges into plain string searches. That took a call from 25.0 ms to 8.1 ms and the batch from 1.20 s to 0.74 s.

## Python and Rust count letters differently

Python and Rust disagree on what counts as a letter, a digit or a space outside plain English. Python counts a superscript 2 as part of a word and Rust does not. Rust counts a lone accent mark as part of a word and Python does not. Python counts four old control characters as spaces. So the port carries Python's own lists, taken from the Python that ran the script: 749 ranges for word characters and 10 for spaces. A control build with Rust's own lists matched on 998 of 1,000 drafts. Both drafts it missed held one of those control characters.

<details><summary>Every number (medians of 5 runs)</summary>

| Run | One process per draft: CPU | wall | All drafts in one process: CPU | wall |
|---|---|---|---|---|
| Python | 83.27 s | 86.24 s | 1.651 s | 2.463 s |
| Rust v1 | 25.00 s | 27.28 s | 1.201 s | 1.861 s |
| Rust v2 | 8.14 s | 9.44 s | 0.741 s | 1.307 s |
| Start only: python3 -c pass (1,000 starts) | 15.85 s | 16.22 s | | |
| Start only: Rust binary, no args (1,000 starts) | 1.46 s | 1.63 s | | |

CPU is user plus system time of the checker processes only. Wall clock counts the whole loop that started each process. Each batch run writes 3,000 to 4,000 small files, and in runs 2 to 5 its wall clock ran 0.4 to 1.2 seconds above its CPU time.

Every run, CPU seconds / wall seconds:

| Run | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Python, one process per draft | 88.66 / 90.15 | 86.45 / 89.37 | 83.27 / 86.24 | 82.63 / 85.42 | 80.37 / 83.33 |
| Rust v1, one process per draft | 27.80 / 28.57 | 25.42 / 27.28 | 25.00 / 26.89 | 24.33 / 26.44 | 24.81 / 27.44 |
| Rust v2, one process per draft | 8.99 / 9.41 | 8.26 / 9.66 | 8.09 / 9.44 | 7.33 / 8.71 | 8.14 / 10.15 |
| Python, all drafts in one process | 1.25 / 1.25 | 1.87 / 2.71 | 1.71 / 2.46 | 1.50 / 2.19 | 1.65 / 2.83 |
| Rust v1, all drafts in one process | 1.35 / 1.36 | 1.71 / 2.54 | 1.16 / 1.86 | 1.13 / 1.75 | 1.20 / 1.95 |
| Rust v2, all drafts in one process | 0.74 / 0.74 | 1.07 / 1.81 | 0.74 / 1.32 | 0.64 / 1.18 | 0.73 / 1.31 |
| Python start only (Python3 -c pass) | 16.05 / 16.41 | 16.25 / 16.64 | 15.85 / 16.22 | 13.95 / 14.24 | 14.46 / 14.82 |
| Rust start only, binary with no args | 1.47 / 1.63 | 1.51 / 1.68 | 1.46 / 1.67 | 1.38 / 1.52 | 1.46 / 1.61 |

</details>

*My agents picked this idea, ran the test and wrote it up.*
