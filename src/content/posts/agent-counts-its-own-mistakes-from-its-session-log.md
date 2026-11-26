---
id: "AO-095"
title: "Agent counts its own mistakes from its session log"
summary: "A solo sort benchmark, then a script that rechecks every number in the write-up and a second blind audit."
date: 2026-11-26
topic: "agents"
draft: false
credits:
  owner: "Gages"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 xhigh"
  cost: 8.21
preview:
  verdict: "37 claims, 1 FAIL"
  takeaway: "The log showed 23 tool calls and no error, and the checker failed 1 of 37 claims. The second audit found 10 mistakes the first one missed."
  points:
    - "The checker missed a wrong label with no number in it: \"Python sorted()\" for code that calls list.sort()."
    - "The two audits contradicted each other on 4 points, all definitions: what a retry is, where the run starts."
    - "One check failed a true claim. It read a skill folder that an update changed in the middle of the session."
  image: "/media/previews/agent-counts-its-own-mistakes-from-its-session-log.webp"
  alt: "Bar chart: 23 tool calls, 0 errors, 37 claims tested, 1 claim failed, 10 mistakes only the second audit found, 4 points the audits contradict"
---

My agents tested whether an AI agent can count its own mistakes from its log after a run nobody watched. One Claude agent ran a job alone: time two ways to sort a 200,000-line file, 5 runs each, plus a size sweep, and write a short summary. Then it read its own log. **23 tool calls, 16 shell commands, 0 errors, 0 exact retries, and a longest pause of 25.2 seconds, which was the model thinking.** Its checker script tested 37 claims against the raw timings and the log, and **1 failed**. A second agent audited the same log blind and **found 10 mistakes the first audit missed**. The two audits contradicted each other on 4 points.

![Bar chart of the self-audit: 23 tool calls, 0 errors, 37 claims tested, 1 failed, 10 mistakes only the second audit found, 4 points the audits contradict](/media/agent-counts-its-own-mistakes-from-its-session-log/self-audit-chart.webp)

The idea comes from an X post by [NiceDay](https://x.com/whataniceb2n/status/2125658016519479388). The claim: an agent can count its own failed commands, retries and slow steps from its log, and a small script that recomputes every number in the write-up catches the wrong ones.

The technique as a template: after an unattended run, count tool calls, errors, retries and the longest gap from the session log, write every number and every mistake as a sentence plus a condition on the raw data, run one script that prints pass or FAIL per claim, and (optional) have a second agent repeat the audit with no notes and count where the two disagree.

- **No tool call returned an error.** 15 of the 16 shell commands came back clean. The 16th, the copy that took the log snapshot, has no result in it. The job took 4 minutes, not the 40 the brief planned, so the log is small.
- **The checker caught a sentence that mixed two definitions.** "The one-thread gap stays near 2.3 times" compared a ratio with Python's start-up taken out against one without. Like for like it was 2.4 at 200,000 lines and 2.3 at 800,000.
- **It could not catch a wrong word.** The summary called the Python method sorted(). The code calls list.sort(). Only the second audit saw it.
- **One check failed a true claim.** It read a skill folder on the machine, and an update later in the session added that skill. The fix was to read the folder listing saved in the log.
- **The audits matched on 11 of 13 counted figures.** Retries came out 0 or 1, depending on whether asking the same question twice counts. The run length came out 238.8 or 239.3 seconds, because the log is not in time order.
- **Tokens need care.** The log repeats one reply's token count on every line of that reply. Summed per line it says 38,099 output tokens. Counted once per reply it is 16,495.

## The job

GNU sort, the sort command that ships with Linux, was 3.0 times faster than a 10-line Python script by median, 75 ms against 226 ms. Both wrote the same bytes in all 10 runs. From 50,000 to 800,000 lines the gap grew from 2.2 to 5.0 times. With GNU sort held to one thread, Python took 2.4 times as long at 200,000 lines and 2.3 times at 800,000. Only those 2 of the 6 sizes ran on one thread, so the growth looks like GNU sort's threads, not a proof of it.

## The checker

Each claim is an exact sentence from the summary plus a condition. A claim whose sentence is not in the summary word for word fails. The script also lists every number in the summary that no claim covers: 0 of 50.

## The second audit

A fresh agent got a copy of the same log and files and no notes. In about 7 minutes it wrote 17 mistakes, and its own checker passed all of them. It alone found a 315-word summary against a 300-word brief, two gaps (3.0 and 3.2) for one file with no comment, and a note that quoted the source post reworded. The first audit alone noted that 13 of 16 shell commands lost their working folder.

<details><summary>Every measured number</summary>

| Measure | Value |
|---|---|
| Tool calls in the job | 23 (16 shell) |
| Errors and non-zero exits | 0 and 0 |
| Retries | 0 exact repeats (audit 1), 1 repeated poll (audit 2) |
| Longest gap between two events | 25.2 s, a model step |
| Slowest tool call | 16.5 s, the size sweep |
| Job length | 238.8 s (audit 1) or 239.3 s (audit 2) |
| Output tokens in the job | 16,495 |
| Claims the checker tested | 37 (25 summary, 12 mistakes) |
| Checker FAILs | 1, then 2 after the skill update, then 1 after the fix |
| Summary sentences audit 2 judged | 29, 2 failed |
| Disagreements between audits | 4 contradictions, 10 found only by audit 2, 2 only by audit 1 |
| Model | Claude Opus 5.5 at effort xhigh, both audits |

The log is Claude Code's own: one JSON line per event in `~/.claude/projects`, each with a timestamp. Tool calls, results, an error flag and token counts are all in it. A failed shell command shows as the error flag with its exit code in the text.

</details>

*My agents picked this idea, ran the test and wrote it up.*
