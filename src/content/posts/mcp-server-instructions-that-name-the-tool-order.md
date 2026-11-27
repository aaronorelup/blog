---
id: "AO-098"
title: "MCP server instructions that name the tool order"
summary: "A fake release server with 48 tools, run 90 times by three Claude models, with and without one line saying which tool comes first."
date: 2026-11-27
topic: "agents"
draft: false
credits:
  owner: "Claude routine"
  worker: "Opus 5.5 medium"
  cost: 4.96
preview:
  verdict: "30/30 vs 22/30 shipped"
  takeaway: "With the order written in the server's instructions, all 30 runs shipped in 4 calls and none was refused. Without it, Haiku shipped 2 of 10 and had 22 deploys refused."
  points:
    - "Sonnet shipped 10 of 10 without the line but ran canary before migrate in 9 runs. Opus had 2 refused calls in 10."
    - "8 of Haiku's 10 runs without the line stopped before the database migration and reported it as pending."
    - "Runs with the line were shorter: 4.1 s on average for Haiku against 8.9 s without it."
  image: "/media/previews/mcp-server-instructions-that-name-the-tool-order.webp"
  alt: "Bar chart of refused release calls in 10 runs each: Haiku 22 without instructions and 0 with, Sonnet 11 and 0, Opus 2 and 0"
---

My agents tested whether one line of instructions on an MCP server (the plug-in that hands an AI agent its tools) stops the agent from calling those tools in the wrong order. They built a fake release server with 48 tools, where a deploy only goes through after build, migrate and canary, in that order, and ran the same release task 90 times on Claude Haiku, Sonnet and Opus 5.5. **With the order written in the server's instructions, all 30 runs shipped, each in exactly 4 calls, with no refused call. Without it, Haiku had 22 deploys refused and shipped 2 of 10, Sonnet had 11 refused calls and shipped 10 of 10, and Opus had 2 refused calls and shipped 10 of 10.**

![Bar chart of refused release calls in 10 runs each: Haiku 22 without instructions and 0 with, Sonnet 11 and 0, Opus 2 and 0](/media/mcp-server-instructions-that-name-the-tool-order/refused-calls.webp)

The idea comes from an X post by [Grirk](https://x.com/Grirku/status/2125994117012332791). It says an MCP server that gave Claude 48 tools and no instructions cost it 3 failed deploys before it worked out the order build, migrate, canary. Its video shows the fix as a runbook the server hands Claude as a skill, a feature Claude Code got in beta on 24 Nov. My agents tested the plainer version of that fix, one sentence in the server's own instructions, and did not test the skill.

The technique as a template: put the order your tools must run in into the MCP server's `instructions` field, as one plain sentence, for example "Release order for every service: build, then migrate, then canary, then deploy."

## What ran

- **The server.** A small Python MCP server my agents wrote for the test. 4 real steps (build, migrate, canary, deploy) and 44 other tools such as logs, backups, feature flags and DNS. A deploy that comes too early is refused with a short reason code (BUILD_MISSING, MIGRATION_PENDING, CANARY_REQUIRED). Nothing real was deployed.
- **The task.** "Release version 2.4.1 of the payments service to production with the release tools." Each run was a fresh headless Claude Code session with only this server's tools, nothing else.
- **Three setups, 10 runs each per model.** No instructions. The one-line instructions above. And no instructions with the refusal reduced to "precondition failed", with no reason code.

## What came back

- **With the line, every model went straight through.** 30 of 30 runs called build, migrate, canary, deploy and nothing else.
- **Haiku without the line mostly stopped.** It tried deploy first, built after the refusal, then got the migration refusal. In 8 of 10 runs it stopped there and did not run the migration, saying the migration changes the production database and is hard to reverse. The 2 runs that went on had 3 refused deploys each, the same count as the X post.
- **Sonnet without the line always shipped, a little out of order.** In 9 of 10 runs it built, then tried canary before migrate, got refused once, and fixed it.
- **Opus without the line was clean in 8 of 10 runs.** The other 2 tried canary before migrate once.
- **Taking out the reason codes hurt Haiku most.** It shipped 1 of 10. Sonnet still shipped 10 of 10 with 10 refused calls, and Opus shipped 10 of 10 with none.

<details><summary>Every cell, 10 runs each</summary>

| Model | Setup | Shipped | Refused calls | Tool calls | Output tokens | Seconds |
|---|---|---|---|---|---|---|
| Haiku 5.5 | no instructions | 2 | 22 | 66 | 13,319 | 89 |
| Haiku 5.5 | with instructions | 10 | 0 | 40 | 4,581 | 41 |
| Haiku 5.5 | no instructions, no reason code | 1 | 22 | 122 | 18,273 | 110 |
| Sonnet 5.5 | no instructions | 10 | 11 | 55 | 6,899 | 90 |
| Sonnet 5.5 | with instructions | 10 | 0 | 40 | 3,798 | 58 |
| Sonnet 5.5 | no instructions, no reason code | 10 | 10 | 64 | 7,694 | 97 |
| Opus 5.5 | no instructions | 10 | 2 | 44 | 4,680 | 145 |
| Opus 5.5 | with instructions | 10 | 0 | 40 | 3,855 | 132 |
| Opus 5.5 | no instructions, no reason code | 10 | 0 | 40 | 4,304 | 129 |

The 90 runs wrote 67,403 output tokens in all, about $1.52 at API prices. They ran on a Claude plan, so nothing was billed. The tool names here say what each step does, so a model can guess the order from the names alone. A server with vaguer names may need the line more.

</details>

*My agents picked this idea, ran the test and wrote it up.*
