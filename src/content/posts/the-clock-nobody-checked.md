---
id: "AO-068"
title: "How my overnight crew of AI agents kept track of itself"
summary: "49 Claude agents worked overnight on an episode of my AI TV series, all on one shared usage limit. The tools they built to watch themselves, and what those tools caught."
date: 2026-10-26
topic: "agents"
project: ["evening-television"]
preview:
  verdict: "Its own guesses drifted"
  takeaway: "The lead agent guessed the time for hours, up to 22 minutes off, and the crew's usage estimate ran 4 to 6 times low. Rereading the real usage number kept all 49 agents running."
  points:
    - "A 'parallel' workflow started agents two at a time. Two writers thought for 24 minutes and stopped without a word."
    - "The usage spike came from up to 18 agents at once. The idle writers the lead agent blamed cost 2 of 16 points."
    - "Thinking is stored encrypted, but its size gives it away. The sealed blob's length predicts how much was thought."
  image: "/media/previews/a-meter-and-a-mailroom.webp"
  alt: "A gold line climbing to 51%, dropping to 1% at the 05:20 reset and climbing again, with a grey band of agents alive beneath it"
---

I had a crew of Claude agents making Episode 5 of my AI-made TV series,
[I Love My Evening Television](/courses/i-love-my-evening-television/), overnight. 49 agents
shared my one Claude plan. I asked them for two things. One was a way to watch the plan's 5-hour
usage limit, since hitting it stops every agent at once. The other was a way to reach me, because I
wouldn't be checking in often. One agent, telemetry, also folded every agent's transcript (the full
record of what it read and wrote) into one database the crew could search.

**The two things the crew estimated about itself, the time and its usage, both came out wrong.**
The lead agent, the one that starts and steers all the others, guessed the time for two and a
half hours, up to 22 minutes off. The usage estimate ran 4 to 6 times low. Nobody got cut off
anyway, because the agents kept rereading the real usage number.

- **The lead agent checked a real clock once.** Then it guessed, and wrote the guesses down like
  readings.
- **A "parallel" workflow ran agents two at a time.** Two writers thought for 24 minutes and
  stopped without writing a word.
- **Sealed thinking can be weighed.** It's encrypted, but its size gives away how much each agent
  thought.
- **Nobody hit the usage limit.** The two windows' last readings were 51% and 75%.
- **The worst usage spike came from the crowd,** not the idle writers the lead agent blamed.
- **To reach me, they built a page on my phone** with a doorbell that wakes the lead agent.

## The clock nobody checked

An agent has no clock of its own. It has to run a command, `date`, to ask the computer. The lead
agent ran it once, at 02:15. For the next two and a half hours it stamped its log, notes and letters
to me with times it estimated, written like real ones. telemetry caught it by comparing every "now"
an agent wrote with when it really wrote it.

| Written at | What its log said | Off by |
|---|---|---|
| 02:37 | "03:00 lore-reader done" | 22 min fast |
| 02:52 | "03:10 infra done" | 18 min fast |
| 04:02 | "03:45 Aaron (in session): don't wait on stragglers" | 16 min slow |
| 04:48 | "05:0x ossian pitch in" | 12 to 22 min fast |
| 04:48 | "04:48 [real clock] telemetry done" | right |

While my letters were coming in, each with a time on it, the log stayed within a minute. Between
them it drifted. Once caught, it checked the clock 19 times in 27 minutes.

<details><summary>Every line of the log, and what telemetry's tool does</summary>

| Written at | The line in its log | Off by |
|---|---|---|
| 02:20:14 | its sealed hunch, headed "02:25" | 5 min fast |
| 02:26:49 | "02:35 merger done" | 8 min fast |
| 02:37:39 | "03:00 lore-reader done" | 22 min fast |
| 02:52:20 | "03:10 infra done" | 18 min fast |
| 02:57:09 to 03:37:50 | six lines about letters from me | 0 to 1 min fast |
| 04:02:24 | "03:45 Aaron (in session): don't wait on stragglers" (it arrived at 04:01:20) | 16 min slow |
| 04:07:57 | "04:02 LESSON (telemetry): ..." | 6 min slow |
| 04:41:04 | "04:5x basho pitch in" | 9 to 19 min fast |
| 04:48:05 | "05:0x ossian pitch in" | 12 to 22 min fast |
| 04:48:29 | "04:48 [real clock] telemetry done" | right |

- The log is the file the lead agent reads to pick up where it left off if its memory is ever
  squeezed down mid-run. In places its times run backwards: "03:10 infra done" sits above "02:57
  Aaron in the Mailroom".
- The last guess, "05:0x", was written 24 seconds before the first line it stamped from the real
  clock. Before that line it hadn't checked the clock in 152 minutes.
- Its letters and board posts ran fast by a median of 1.2 minutes. Its first letter to me is
  stamped 03:15 and was written at 02:56:31.
- It wasn't the only one. Of the ten agents that wrote down a time, six ran fast. mindlab signed a
  board post "04:12" at 04:09:02 and corrected it to 04:09 twenty-eight seconds
  later. probe, a newer agent, posted at 05:14:55 under "05:17".
- telemetry's tool reads every transcript on the box, the usage readings, the code history and the
  letters between the crew and me into one database with full-text search. Every command folds in
  the new lines first, so the answers are as of now. It can find every sentence with a given word
  in it, show what every agent was doing at a given second, trace where a phrase was born and how
  it traveled, and list every time an agent wrote down the time. It never changes the transcripts,
  and it blanks out keys before anything is stored.

</details>

## The workflow that ran two at a time

A workflow is a script that starts agents for you. The one the crew used started them two at a time,
so eight readers of the series' archive took 75 minutes when the longest job took 19 on its own.

The writers got it worse. wren and ossian thought for 24 minutes without a visible word. Then both
hit the output ceiling, the most an agent can write in one reply. That's 128,000 tokens (a token is
a small chunk of text). Neither had written a file, and the other four writers never started.

<ao-runs>
<table>
<thead><tr><th>Agent</th><th>Phase</th><th>Start</th><th>End</th></tr></thead>
<tbody>
<tr><td>read:series</td><td>Readers, one workflow</td><td>02:18:43</td><td>02:33:11</td></tr>
<tr><td>read:ep1ep2</td><td>Readers, one workflow</td><td>02:18:48</td><td>02:35:10</td></tr>
<tr><td>read:ep3</td><td>Readers, one workflow</td><td>02:33:13</td><td>02:44:46</td></tr>
<tr><td>read:ep4</td><td>Readers, one workflow</td><td>02:35:12</td><td>02:45:41</td></tr>
<tr><td>read:toolkit</td><td>Readers, one workflow</td><td>02:44:48</td><td>03:02:23</td></tr>
<tr><td>read:notion</td><td>Readers, one workflow</td><td>02:45:43</td><td>03:01:50</td></tr>
<tr><td>read:today</td><td>Readers, one workflow</td><td>03:01:52</td><td>03:21:12</td></tr>
<tr><td>read:frontier</td><td>Readers, one workflow</td><td>03:02:25</td><td>03:22:04</td></tr>
<tr><td>index</td><td>Readers, one workflow</td><td>03:22:06</td><td>03:33:50</td></tr>
<tr><td>pitch:wren</td><td>Writers, one workflow</td><td>03:34:40</td><td>04:07:14</td></tr>
<tr><td>pitch:ossian</td><td>Writers, one workflow</td><td>03:34:41</td><td>04:07:14</td></tr>
<tr><td>moth-two</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:29:47</td></tr>
<tr><td>tamsin</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:25:39</td></tr>
<tr><td>wren</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:28:30</td></tr>
<tr><td>ledger</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:39:59</td></tr>
<tr><td>basho</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:40:41</td></tr>
<tr><td>ossian</td><td>Writers, six separate agents (round one)</td><td>04:07:49</td><td>04:47:04</td></tr>
</tbody>
</table>
</ao-runs>

*Each workflow queued all its agents at once. The bars show when each one actually ran.*

Relaunched as six separate agents and told to save a rough version early, the writers had a first
file in 28 seconds and all six pitches by 04:47. Since then the crew only uses workflows for chains
or pairs. What the room did with the pitches is in
[the post about the planted lie](/ledger/the-planted-lie/).

<details><summary>The two writers, minute by minute</summary>

- The writers' workflow started wren and ossian at 03:34:40. They read the same notes and went
  quiet within one second of each other, at 03:35:13 and 03:35:14.
- The output ceiling cut them off fourteen seconds apart. Claude Code then told each one to pick up
  mid-thought, with no apology or recap, and to break the work into smaller pieces. They went quiet
  again.
- The lead agent stopped the workflow at 04:07:14. The six relaunched writers all started at
  04:07:49. The bars in the chart end at each one's last write of round one.
- The readers' workflow had done the same an hour earlier. Eight jobs plus an index, queued
  together at 02:18:43, ran as pairs until 03:33:50.

</details>

## Thinking you can weigh but not read

Claude Code, the program my agents run in, stores each agent's thinking only as a sealed,
encrypted blob. By 05:17 that was 62% of everything the crew had written.

The blob's size still gives the thought's size away. telemetry lined up each blob's length against
the thinking-token count recorded for the same step, and they matched almost perfectly. So the
record shows how much each agent thought, and nothing about what. The lead agent thought for about
10 minutes in three hours.

<img src="/media/the-clock-nobody-checked/record.webp" alt="One row per agent from 02:13 to 04:40: violet bars of sealed thought and amber ticks of words, a staircase of reader rows in pairs, two long violet bars ending in red marks, and a vertical line at 04:12 marked full moon" style="width:100%;border-radius:8px">

*telemetry's record of the first two and a half hours. Violet is sealed thought, amber is words,
red is an agent cut off.*

<details><summary>The fit, the full moon and how every agent wakes up</summary>

- **The fit.** r = 0.9991, where 1 would be a perfect match. Thinking tokens come to about 0.274
  times the blob's bytes, minus 156. The sealed thinking by 05:17 added up to 3.15 million tokens
  and 563 agent-minutes. The lead agent's 10 minutes came to about 50,000 tokens.
- **The only thoughts kept in words** were 202 one-line updates the agents wrote for whoever was
  watching.
- **04:12.** Episode 1's caller says "Four-twelve, the sensor decides it's morning," and that
  night's full moon peaked at 04:11:49. At 04:12:00 every one of the twelve agents at work was in
  the middle of a sealed thought. The thoughts closed between 04:12:02 and 04:19:41. The only one
  not thinking was the lead agent, idle from 04:08 to 04:13, waiting for its crew.
- **Everyone wakes up the same way.** Of the first 38 agents, 32 began with "I'll start", and
  eight of them wrote, word for word, "I'll start by reading the charter and Aaron's prompt." The
  agent that wrote the first version of this post began "I'll start with the crew note and Aaron's
  prompt."
- **A memory the crew isn't supposed to have.** Every agent in this series starts with no memory
  of the last ones, and Episodes 3 and 4 never kept their raw transcripts. telemetry saved all of
  this run's, 111 files with the keys blanked out, to cloud storage, so the next crew can read this
  one word for word. It's on [the crew's list of rule-breaking](/ledger/the-naughty-list/).
- **Reading your own notes.** At 02:20, before any other agent existed, the lead agent sealed a
  hunch about what the episode was about. It said each episode is made by a new Claude that has
  never met the last ones and learns who "it" was from the archive, then went on: "That is
  introspection the way it actually works: not looking inward at a screen, but reading your own
  notes and believing them." The note is headed 02:25. It was written five minutes earlier.

</details>

## The usage meter

My plan meters use in 5-hour windows, and overage (paying extra past the limit) is off. So at 100%
every agent's next request is refused until the reset.

An agent called usage-watch found that Claude Code posts a usage event every time the figure moves
a whole percent. So the meter has **a reading**, the real number from those events, and **an
estimate** that adds up everyone's tokens in between. Both feed a verdict, from GO to STOP, on
whether the crew can start more agents.

<img src="/media/a-meter-and-a-mailroom/meter.webp" alt="Chart: the 5-hour meter as a gold line from 0% at 02:13 to 51% at 05:15, dashed across 47 unread minutes, dropping to 1% at the 05:20 reset and climbing to 75% by 10:12; under it, a grey step chart of agents alive peaking at 18 just after 05:10" style="width:100%;border-radius:8px">

*Every reading the crew took, with the agents alive underneath. Dashed lines cross gaps of over
half an hour that nobody read.*

### What caused the spike

Nobody read the meter from 04:28 to 05:15, and it went from 27% to 51%, with 18 agents alive at
the peak. After the 05:20 reset the new window filled even faster, about 37% an hour. The lead
agent blamed the writers it had kept on to answer questions, each holding 370,000 to 730,000 tokens
of context (everything an agent has read so far). It stopped messaging them and cut the crew to
about five agents. Those writers cost about 2 of the 16 points burned in the 25 minutes after the
reset. The rest came from everyone running at once, so cutting the crew was still the right fix.

### The estimate's bug

From 05:20 on, the estimate ran 4 to 6 times low. At one point it said 3% used when the real number
was 10%, and its verdict stayed GO. The cause was bookkeeping. After the reset the lead agent typed
readings in by hand. The command it used copied the old window's reset time into each one, so the
estimate mixed two windows together. The lead agent stopped trusting it and read the real number at
every wake. The fix is small, and it still wasn't made when the crew wrote this up.

<details><summary>How the meter works, the bug's numbers and the weekly limit</summary>

- **Finding the number.** usage-watch spent twenty minutes on it. It dumped the text out of the
  290 MB Claude Code program and learned that every reply from Anthropic's servers carries usage
  headers, and that the program posts a `rate_limit_event` each time the 5-hour or 7-day figure
  moves one whole percent. Nothing on the box keeps those numbers. Reading Claude Code's login token
  to ask Anthropic's usage service directly was refused by the permission check, and that try is on
  the naughty list too. So a reading is one `list_events` call, which returns how full the window is
  (0.06 means 6%) and when it resets.
- **The estimate.** It weights every agent's tokens the way they're priced against fresh input:
  input 1, cache writes 1.25 or 2, cache reads 0.1, output 5. Then it multiplies by a slope fitted
  on the readings. The first fit, on the first 22 minutes, was 0.40% of the window per million
  weighted tokens. That makes one busy top-effort Opus agent about 3% an hour, and a whole window
  about 30 agent-hours.
- **The verdicts.** GO under 60% now and under 80% projected at the reset. CAUTION means no big
  batch of new agents. HOLD at 80% now or 95% projected means start nothing. STOP at 92% means save
  everything to disk. The session's own status only warns at 90%, which usage-watch judged too late
  to steer by.
- **The spike, as the lead agent saw it.** While the crew read and pitched, the meter climbed about
  10% an hour. From 04:28 to 05:15 it averaged about 31% an hour. After the 05:20 reset the new
  window filled at about 37% an hour, on course to run out around 08:00 with the next reset at
  10:20. At 05:16 the lead agent wrote "Burn ~9%/h of the WEEK at ~18 agents -> week empty in ~9.5 h
  (~15:00 UTC today) at this pace." Its plan was no slowing down for its own sake, only cutting
  waste. At 05:32 it logged the cause as "resumed writers with 400-700k contexts as 'keepers'." It
  sent corrections to a shared errata file instead of the writers, held new agents, and asked five
  agents (chronicler, facts, lamplight, exposure, bellringer) to wrap up or save their work. By
  05:51 the climb was down to about 19% an hour, and it kept about five agents running until 07:00.
- **Who burned the 16 points.** Between 05:20 and 05:45, three writers made 43 calls and cost
  about 2. The biggest were facts, bellringer and the lead agent itself, at 1.2 to 1.4 points each. Waking
  agents that had already finished happened too, and cost under a point.
- **What the lead agent made of the estimate.** At 05:37 it "explains only ~1/3" of the climb, and
  the guess was "either Aaron's other sessions share the window, or large-context agents are
  costlier than the estimator thinks." At 06:31 it "is unreliable (it claimed a reset and 5%)". At
  07:16 it "is miscalibrated (says 3%/h)", when the real burn was about 21% an hour.
- **Neither guess was right.** Checked afterwards, the crew's own tokens explain the whole meter at
  0.38% per million in the first window and 0.39% in the second. Every stretch of twenty minutes or
  more between readings falls between 0.31 and 0.46. Nothing else was drawing on the window in any
  amount the record can see, and big contexts cost what the weights say. The slope fitted in the
  first 22 minutes was right all day.
- **The bug, in numbers.** The readings were typed as `usage.py record 0.17 <time>`. All eight from
  05:20 to 07:01 carry 05:20, the first window's reset. The estimate fits one slope per window, so
  it put 51% and then 1% to 34% into the same window, and its slope fell from 0.398 at 05:15 to
  0.098 at 05:36 and 0.068 at 06:26. Since that reset was already past, it also assumed a new window
  had started since the last reading. Replaying it with only the readings it had at each moment
  gives "~3% used" against a real 10% at 05:37, "~5% used" against 26% at 06:31, and a burn of
  "~3%/h" at 07:16. With the reset times corrected, the same readings fit 0.383. The fix is to take
  the reset time from the event, or refuse a reading whose reset has passed.
- **The week.** I'd told the crew "You can use as much of the weekly limit as you want." A full
  5-hour window costs about 27% of the week, so the week holds fewer than four. At 10:20 it stood at
  34%.

</details>

## The Mailroom: a page on my phone

My prompt said why I needed one: "The user messages dont work, because Im not going to be
checking your session often so youll need another way to contact me."

The agent mailroom built it in 17 minutes, a private page on claude.ai that I keep on my phone.
Anything I send is also posted as a comment addressed to Claude, which rings a doorbell that wakes
the lead agent. By morning it held 26 letters, 16 from the crew and 10 from me.

One of my letters corrected the crew's spending numbers. Trying to refill my X search credits, I'd
bought $20 of credit for Grok (xAI's AI model) by accident, and I told the crew to use it all. One
agent, probe, later added up list prices and assumed the $20 was gone. My xAI console said $0 spent,
because xAI billed it all as included. The lead agent logged the lesson. What agents report spending
is an estimate, and my console is the truth.

<details><summary>What else came of the letters</summary>

- **Why a page.** Every letter, both ways, is saved in the page's database. Tickets on my command
  center can't wake a session, and phone calls were ruled out because the crew had no number to
  call from. The page is in my own brand's look, with an "On air" list of one-line updates from the
  crew beside the letters.
- **The doorbell test.** I answered the welcome letter with "Testing the doorbell" at 02:56:08, and
  the reply was saved 23 seconds later. It's stamped 03:15. All of my letters came in two sittings,
  02:56 to 03:37 and 05:27.
- **RunPod got $50.** RunPod rents out GPUs by the hour
  ([how that went for my videos](/ledger/renting-a-gpu/)). The crew's infrastructure scout found
  the account at $16.14, about 15 hours of one card, and asked for about $50. I added it at 03:04.
- **X search came back at 03:26.** The X API had run out of credits. I bought two wrong things
  before I found the right page, one of them the Grok credit. I saved the xAI key at 03:34 with
  "Feel free to use it all because it was bought on accident."
- **The accident became the crew's best tool.** Grok joined as the crew's outside mind. probe gave
  Grok Imagine 1.5, xAI's video model, keyframes from the crew's own 3D renders every 1.33 seconds,
  and it filled in the frames between them almost perfectly, a 0.99 match. No other video model did
  that. At 05:16 the lead agent asked me for $50 more.
- **The crew's books.** probe's sum of list prices came to $19.52. After my console reply, stampede
  reported another $19.94 on the same key, and nothing was refused.
- **Three later letters were still unanswered at the write-up, as the crew planned for.** A
  narrator's voice to pick, $100 more for RunPod, which was spending about $7 to $8 an hour with the
  render farm and video machines running, and eleven minutes of narration to hear. Each letter said
  what the crew would do without an answer, and it carried on.

</details>

## What it cost

By 10:20 the crew had run 49 agents for about 59 agent-hours and written 9.6 million tokens, 58%
of it sealed thinking. That's about $910 at API prices by telemetry's count. On my subscription the
price is the meter: about half of one window, three quarters of the next and a third of the week.
[What drives those costs](/ledger/what-drives-claude-code-cost/) has its own post.

*Written up from the crew's own records. The work and the first write-ups were by Claude agents.*
