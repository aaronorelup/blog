# What the research run cost

Measured from the agents' own transcripts on the cloud box with the agent kit's `measure-agents.mjs`
(the raw output is [`agent-metrics.json`](agent-metrics.json)). Window: 2026-11-10 19:31 UTC to 2026-11-11
01:26 UTC, 355 minutes, when the background agents were stopped. The orchestrator's last hour of assembly and
publishing is not in these figures.

| Model | Agents | Output tokens | Cache reads | Cache writes | Uncached input |
|---|---|---|---|---|---|
| Claude Opus 5.5 | 118 | 19,233,670 | 5,810,628,216 | 68,164,105 | 33,361 |
| Claude Sonnet 5.5 | 20 | 1,245,797 | 79,691,320 | 4,493,297 | 884 |
| Claude Fable 5.2 (orchestrator) | 1 | 333,899 | 56,093,186 | 672,600 | 260 |
| Total | 139 | 20,813,366 | 5,946,412,722 | 73,330,002 | 34,505 |

17,164 assistant messages in 139 transcripts. Agents stopped partway are counted.

## At API list prices

Prices per million tokens, read from https://docs.claude.com/en/docs/about-claude/pricing on 2026-11-11:

| Model | Input | Cache write, 5 minutes | Cache write, 1 hour | Cache read | Output |
|---|---|---|---|---|---|
| Claude Fable 5.2 | $8 | $10 | $16 | $0.20 | $40 |
| Claude Opus 5.5 | $4 | $5 | $8 | $0.20 | $20 |
| Claude Sonnet 5.5 | $2 | $2.50 | $4 | $0.10 | $10 |

| Model | Cache reads | Output | Cache writes (5 min to 1 h price) | Total |
|---|---|---|---|---|
| Opus 5.5 | $1,162.13 | $384.67 | $340.82 to $545.31 | $1,887.75 to $2,092.25 |
| Sonnet 5.5 | $7.97 | $12.46 | $11.23 to $17.97 | $31.66 to $38.40 |
| Fable 5.2 | $11.22 | $13.36 | $6.73 to $10.76 | $31.30 to $35.34 |
| All | | | | $1,951 to $2,166 |

The transcripts do not say which cache-write price applied, so the total is a range. This is what the same
tokens would cost through the API. The run was not billed this way: it ran on a Claude subscription and,
with one other session, used about 90% of the account's weekly usage limit.

The playback lens plugin is not installed in cloud sessions, so this was computed by hand as above.

## Outside services

0.96 US dollars in total (`lanes/hosted-apis/trials.md`): ElevenLabs credits at an assumed price per credit
(ElevenLabs publishes none), a few cents of Vercel AI Gateway credit and a fraction of a cent at xAI. The
Gemini API key answered HTTP 402, so no Gemini call was billed. No GPU was rented.

## The second sitting

Measured the same way for everything after the first window: 2026-11-11T01:26:31.433Z to 2026-11-12T07:46:07.696Z
(raw output: [`agent-metrics-window2.json`](agent-metrics-window2.json)). The window holds the orchestrator's last stretch of the
first sitting (assembling and publishing the post, to about 01:50 UTC on 2026-11-11) and the whole second sitting, which
began at about 03:45 UTC on 2026-11-12. 44 more agents ran in it (40 on Opus 5.5, 4 on Sonnet 5.5), directed by the same Fable 5.2
orchestrator. 3,913 assistant messages in 45 transcripts.

| Model | More agents | Output tokens | Cache reads | Cache writes | Uncached input |
|---|---|---|---|---|---|
| Claude Opus 5.5 | 40 | 5,562,232 | 1,283,599,814 | 17,266,799 | 7,448 |
| Claude Sonnet 5.5 | 4 | 76,056 | 10,779,527 | 780,437 | 154 |
| Claude Fable 5.2 | 0 (the same orchestrator) | 159,944 | 43,784,394 | 414,346 | 234 |
| Total | 44 | 5,798,232 | 1,338,163,735 | 18,461,582 | 7,836 |

At the same list prices:

| Model | Cache reads | Output | Cache writes (5 min to 1 h price) | Total |
|---|---|---|---|---|
| Opus 5.5 | $256.72 | $111.24 | $86.33 to $138.13 | $454.33 to $506.13 |
| Sonnet 5.5 | $1.08 | $0.76 | $1.95 to $3.12 | $3.79 to $4.96 |
| Fable 5.2 | $8.76 | $6.40 | $4.14 to $6.63 | $19.30 to $21.79 |
| All | | | | $477 to $533 |

Both windows together: 183 agents, 26,611,598 output tokens, 7,284,576,457 cache-read tokens,
91,791,584 cache-write tokens, 42,341 uncached input tokens: $2,428 to $2,699 at API list prices.
Uncached input is included in each total at the input price. Like the first sitting, this ran on the Claude subscription and
was not billed this way.
