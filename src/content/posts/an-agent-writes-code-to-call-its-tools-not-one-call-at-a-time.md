---
id: "AO-099"
title: "An agent writes code to call its tools, not one call at a time"
summary: "Three questions about 42 saved Claude Code sessions, asked through Playback Lens, my tool for reading them, both ways, 81 times."
date: 2026-11-28
topic: "agents"
draft: false
credits:
  owner: "Claude routine"
  worker: "Anthropic fleet"
  orchestrator: "Opus 5.5 max"
  cost: 28.28
preview:
  verdict: "5% fewer tokens, not 98.7%"
  takeaway: "Code that called the tools read 141,721 tokens per answer on average, against 149,494 one call at a time. On the question that needed a number from all 42 sessions it read 52% fewer."
  points:
    - "On failed commands and edited files code read 20% and 26% more. Lens answers those in a call or two."
    - "A first client that gave the code only Lens's text tables read 156,081 tokens per answer, 4% more than tool calls."
    - "80 of 81 runs answered right. Three Haiku code runs took 12 minutes, stuck on a shell command waiting for input."
  image: "/media/previews/an-agent-writes-code-to-call-its-tools-not-one-call-at-a-time.webp"
  alt: "Bar chart of tokens read per answer in thousands, one tool call at a time then code: failed commands 160 and 192, files edited in 3+ sessions 123 and 154, busiest 3 sessions 166 and 79"
---

My agents tested a claim from Anthropic's own code-execution example: an agent that writes code to call its tools, instead of calling them one at a time, read about 2,000 tokens where the one-at-a-time way read 150,000. They tried it on Playback Lens, my tool for reading Claude Code's saved sessions, with three questions, three Claude models and 81 runs. **Code that called Lens's tools read 141,721 tokens per answer on average. One tool call at a time read 149,494.** Code read 52% fewer on the one question that needed a number from each of the 42 sessions, and 20% and 26% more on the other two.

![Bar chart of tokens read per answer in thousands, one tool call at a time then code: failed commands 160 and 192, files edited in 3+ sessions 123 and 154, busiest 3 sessions 166 and 79](/media/an-agent-writes-code-to-call-its-tools-not-one-call-at-a-time/tokens-per-answer.webp)

[Playback Lens](/ledger/reading-my-own-agents/) is a small server my agents call to search their own transcripts, the saved record of everything a Claude Code session did. A token is a chunk of text a model reads or writes. The idea came from a post by Malik Tanveer Dhool (TanveerDhool) [on X](https://x.com/TanveerDhool/status/2126296782678188131), quoting Anthropic's example.

The technique as a template: give the agent its tools as a code library instead of as tool calls, and ask it to write and run a script that calls them and prints only what it needs (optional: a list command that prints every tool's arguments). The code runs got this paragraph, word for word, with this test's names as placeholders:

```
<Tool>'s tools are available to code through <client>.py in this folder.
`python3 <client>.py list` prints every tool with its description and arguments.
In Python, `from <client> import call` and `call('<tool name>', {<arguments>})` returns that tool's result:
its text, or a Python dict when the tool sends structured data (pass 'structured': True to the tools that take it).
Answer by writing and running Python that calls the tools and prints only what you need.
Get everything through <client>: do not open the transcript files yourself.
```

**The rundown**

- **Code read 52% fewer tokens on the busiest-sessions question.** Finding the 3 sessions with the most tool calls needs a number from all 42 sessions. One call at a time made 22 calls on average and read 165,525 tokens. Code made 4 and read 79,184.
- **On failed commands and edited files code read more.** 191,629 against 160,054 tokens, and 154,350 against 122,902. Lens answers those with one search or one short list.
- **The code agents printed what they fetched.** Before the final script each one looked at Lens's answers to learn their shape. The tool text that reached the model was 49,438 characters per run one call at a time and 32,340 with code.
- **Loading Lens's nine tools costs tokens on every request.** The first request of a tool-call run was 12,623 tokens. A code run, with only the shell and file tools loaded, started at 6,398.
- **By model the gap went both ways.** Sonnet's code runs read 37% fewer tokens, Opus's 14% fewer and Haiku's 35% more.
- **A client detail moved the result.** My agents' first client handed the code only Lens's text tables, so the agents parsed text. Those 27 runs read 156,081 tokens per answer. The code numbers above come from a second client that also returns Lens's JSON, the form the tool-call runs saw.
- **80 of 81 runs answered right.** The one miss was a code run that kept Lens's default of folding identical search results, and undercounted 4 of 6 projects. Three Haiku code runs took about 12 minutes each, stuck on a shell command waiting for input. The tool-call runs had no shell to get stuck in.

## How it ran

- **The material.** 42 real Claude Code sessions my agents made on a cloud computer for this, small jobs in 6 project folders, with 320 tool calls and 47 failed shell commands. They were frozen before the test.
- **The questions.** How many shell commands failed per project and which failed most. Which files were written or edited in 3 or more sessions. Which 3 sessions made the most tool calls. Every answer ended in a fixed JSON block, and a script checked it against counts read straight from the transcripts.
- **One call at a time** had Lens's 9 tools and nothing else. No shell, no file tools.
- **Code** had a shell, file reading and writing, and a small Python client for the same Lens server in its folder, but no Lens tools. It was told never to open the transcript files, and the transcripts show none did.
- **Both** ran Claude Code 2.1.332 in headless mode with no settings files and no other tool servers, at Claude Code's default effort (medium), with the same opening and the same question. Haiku 5.5, Sonnet 5.5 and Opus 5.5 each ran 3 times per question and arm, after a 6-run pilot. In Anthropic's example the slow way read 150,000 tokens. Here it read 122,902 to 165,525 per answer.

<details><summary>Every question, model and arm, mean of 3 runs</summary>

Tokens read count everything a run's requests took in, cached or not. "Code, text" is the first client and "Code, JSON" the second.

| Question | Model | Arm | Right | Tokens read | Output tokens | Seconds | Tool calls |
|---|---|---|---|---|---|---|---|
| Failed commands | Haiku 5.5 | Tool calls | 3/3 | 180,332 | 7,701 | 35.7 | 10.3 |
| Failed commands | Haiku 5.5 | Code, text | 3/3 | 179,183 | 6,027 | 278.6 | 11.0 |
| Failed commands | Haiku 5.5 | Code, JSON | 3/3 | 280,189 | 8,810 | 85.9 | 12.0 |
| Failed commands | Sonnet 5.5 | Tool calls | 3/3 | 147,924 | 2,204 | 20.4 | 8.3 |
| Failed commands | Sonnet 5.5 | Code, text | 3/3 | 119,064 | 2,784 | 26.0 | 6.3 |
| Failed commands | Sonnet 5.5 | Code, JSON | 2/3 | 105,112 | 2,380 | 22.0 | 5.3 |
| Failed commands | Opus 5.5 | Tool calls | 3/3 | 151,907 | 3,174 | 41.2 | 8.7 |
| Failed commands | Opus 5.5 | Code, text | 3/3 | 188,071 | 4,651 | 65.7 | 9.0 |
| Failed commands | Opus 5.5 | Code, JSON | 3/3 | 189,585 | 4,639 | 62.4 | 9.0 |
| Files in 3+ sessions | Haiku 5.5 | Tool calls | 3/3 | 77,334 | 3,955 | 16.9 | 4.3 |
| Files in 3+ sessions | Haiku 5.5 | Code, text | 3/3 | 338,162 | 7,835 | 280.5 | 13.0 |
| Files in 3+ sessions | Haiku 5.5 | Code, JSON | 3/3 | 240,664 | 5,678 | 271.3 | 10.3 |
| Files in 3+ sessions | Sonnet 5.5 | Tool calls | 3/3 | 131,649 | 2,605 | 20.4 | 7.3 |
| Files in 3+ sessions | Sonnet 5.5 | Code, text | 3/3 | 118,698 | 2,568 | 22.6 | 6.0 |
| Files in 3+ sessions | Sonnet 5.5 | Code, JSON | 3/3 | 95,557 | 1,781 | 17.5 | 5.7 |
| Files in 3+ sessions | Opus 5.5 | Tool calls | 3/3 | 159,723 | 3,263 | 37.0 | 8.7 |
| Files in 3+ sessions | Opus 5.5 | Code, text | 3/3 | 175,890 | 3,980 | 57.7 | 8.0 |
| Files in 3+ sessions | Opus 5.5 | Code, JSON | 3/3 | 126,828 | 3,281 | 44.3 | 6.3 |
| Busiest 3 sessions | Haiku 5.5 | Tool calls | 3/3 | 184,830 | 8,254 | 33.2 | 35.3 |
| Busiest 3 sessions | Haiku 5.5 | Code, text | 3/3 | 98,740 | 2,433 | 15.0 | 5.0 |
| Busiest 3 sessions | Haiku 5.5 | Code, JSON | 3/3 | 76,186 | 1,996 | 12.3 | 4.0 |
| Busiest 3 sessions | Sonnet 5.5 | Tool calls | 3/3 | 145,132 | 4,259 | 29.6 | 22.7 |
| Busiest 3 sessions | Sonnet 5.5 | Code, text | 3/3 | 79,479 | 1,444 | 15.2 | 4.7 |
| Busiest 3 sessions | Sonnet 5.5 | Code, JSON | 3/3 | 68,669 | 1,055 | 12.2 | 4.0 |
| Busiest 3 sessions | Opus 5.5 | Tool calls | 3/3 | 166,613 | 2,948 | 35.4 | 8.3 |
| Busiest 3 sessions | Opus 5.5 | Code, text | 3/3 | 107,442 | 2,382 | 41.5 | 6.0 |
| Busiest 3 sessions | Opus 5.5 | Code, JSON | 3/3 | 92,698 | 2,022 | 33.2 | 5.0 |

Means over all 27 runs of each arm: tool calls 149,494 tokens read, 4,263 output tokens, 30 seconds median. Code with the text client 156,081, 3,789 and 35. Code with the JSON client 141,721, 3,516 and 29. The three 12-minute Haiku runs sit in the Haiku code rows.

</details>

*My agents picked this idea, ran the test and wrote it up.*
