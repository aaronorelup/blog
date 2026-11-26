---
id: "AO-094"
title: "What it took for AI agents to build my 3D AI landscape page"
summary: "How long it took with and without the usage-limit stops, which models did which jobs, the cost at API prices, and what would have made it faster."
date: 2026-11-25
topic: "agents"
draft: false
credits:
  owner: "Aaron"
  worker: "Anthropic fleet"
  orchestrator: "Fable 5.2, then Opus 5.5"
  cost: 2348
preview:
  verdict: "15 days, 3 if never stopped"
  takeaway: "Agents took almost 15 days, or about 74 hours without the usage-limit stops, and $2,218 at API prices. No person did the work beyond my requests and OKs."
  points:
    - "For 7 to 10 of the 15 days the job sat waiting for me to come back, after a usage limit had already lifted."
    - "Claude Fable 5.2 designed it and built the hardest parts, $1,359. Opus 5.5 did research, tests and most fixes, $857."
    - "Biggest savings: carry on with Opus at Fable's limit and restart itself at each reset. A graphics card: about a day."
  image: "/media/previews/making-the-ai-landscape-page.webp"
  loop: "/media/previews/making-the-ai-landscape-page.mp4"
  alt: "Five product stacks in company colours, each with its mascot or mark on top, above the words AI LANDSCAPE"
---

I asked Claude to build [a 3D page that maps the AI landscape](/ai-landscape/), the five big AI companies and how each one's products stack up, and then I stayed out of the work. **It took 358 hours (almost 15 days) from my request to the finished page going live. Without the usage-limit stops it was about 74 hours, a little over three days.** At Anthropic's pay-per-use API prices the work comes to **$2,218**, plus 70 credits on Higgsfield, the AI picture service that made the art. No person wrote code, designed a screen, made a picture, or reviewed or tested anything.

<figure class="flush"><video class="fill" controls muted loop playsinline preload="metadata" poster="/media/making-the-ai-landscape-page/ai-landscape-tour.webp" src="/media/making-the-ai-landscape-page/ai-landscape-tour.mp4"></video><figcaption>A 38-second silent scroll through the best stretch of the page: the opening, Anthropic's and Google's worlds, and the section on whose agent runs on whose. It was made frame by frame, since the cloud computer draws the page at about two frames a second. The page is a dated snapshot of 10 November.</figcaption></figure>

- **Agents did the work.** One main Claude Code session (Anthropic's coding agent) on a cloud computer planned it and handed the jobs to 97 sub-agents (AI workers it starts for one task each), plus 10 quick blind tests of the design.
- **Claude Fable 5.2 designed it and built the hardest parts. Claude Opus 5.5 did the research, the engineering and most of the reviews and fixes.**
- **Five rounds of AI reviewers found 200 problems,** and a fixer agent went after each round.
- **For 7 to 10 of the 15 days the job was waiting for me,** after a usage limit had already lifted. Once that took six days, until I typed "Continue".
- **Carrying on with Opus when Fable's own limit ran out, and picking itself back up when a limit reset, would have saved the most.** Neither needs new hardware.
- **The slow cloud computer cost about a day of work, by estimate.**

## What the page looks like

<ao-compare cols="3" aspect="16/10">
<figure><img src="/media/making-the-ai-landscape-page/anthropic.webp" alt="Anthropic's world: a cream and terracotta desk, a striped coral stack, the Claude mascot and a sketched portrait of its chief executive" width="960" height="600"><figcaption><b>Anthropic</b><span class="ao-meta">each company gets its own world</span></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/openai.webp" alt="OpenAI's world: a white chat window, a grey striped stack and a yellow felt mascot with glasses and a bow tie" width="960" height="600"><figcaption><b>OpenAI</b></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/google.webp" alt="Google's world: a dark room of paper lanterns, a rainbow stack and a sketched portrait of its chief executive" width="960" height="600"><figcaption><b>Google</b></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/meta.webp" alt="Meta's world: sky blue ribbons, a blue stack, a beige felt mascot and a locked layer" width="960" height="600"><figcaption><b>Meta</b></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/xai.webp" alt="xAI's world: a black glossy mascot, a black stack and a rocket gantry behind it" width="960" height="600"><figcaption><b>xAI</b></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/whose-agent.webp" alt="A dark section titled WHOSE AGENT RUNS ON WHOSE, with arcs between the five stacks" width="960" height="600"><figcaption><b>Whose agent runs on whose</b><span class="ao-meta">one of the sections that compare all five</span></figcaption></figure>
</ao-compare>

## What I did

My part was eleven messages (one passed on through another of my sessions), one answer to a question and one model switch. I dictated the request, sent a link telling it to hand everything to sub-agents, and gave one direction on the art, to make each company look like its own brand. The rest were short answers like "Continue" and "put it live". When Fable 5.2 hit its weekly limit on the last day, I switched the session to Opus 5.5. The page only went live when I asked, both times.

<details><summary>Every message I sent, in order</summary>

| When (UTC) | What I said |
|---|---|
| 10 Nov 21:26 | The dictated request: the page, the five companies, Shopify's Winter 2026 Editions page as the design bar, Fable 5.2 for the hardest jobs and Opus 5.5 for the rest |
| 10 Nov 21:27 | A link to Anthropic's docs on running many agents: "you shouldn't do any of the work yourself. You should hand it off to sub-agents and control your context" |
| 11 Nov 01:22 | "are you almost done?" |
| 11 Nov 01:23 | I was about to hit my weekly usage limit, so get to a stopping point, and a blog post about the progress would be nice |
| 11 Nov 01:25 | Through another of my sessions: budget so you don't stop mid-job, stay under 98% of the weekly limit, record the costs, and put what's done live with the costs |
| 11 Nov 01:33 | Answered its question about the progress report: "Publish it live" |
| 11 Nov 01:34 | "give me the link" |
| 12 Nov 03:45 | "Okay, you can continue", plus the branding direction: style every company with its own look, use Higgsfield for pictures, no expensive video |
| 16 Nov 03:35 | "make sure the working copy is live and give me the link so I can view what you have done so far and then continue" |
| 24 Nov 17:56 | "Continue" |
| 25 Nov 04:02 | Switched the model to Opus 5.5: "You hit the fable limit, but opus is fine so I set you to opus 5.5 please continue" |
| 25 Nov 18:55 | "put it live" |

One more message, after the page went live, asked for this post.

</details>

## How long it took

<ao-funnel unit="hours">
<ol>
<li><b>From my request to the finished page going live</b> <data value="357.55">357.6</data> 10 to 25 November</li>
<li><b>Usage-limit stops, and the wait for me after them</b> <data value="-283.51">−283.5</data> four stops
<ul>
<li>11 Nov, 26 hours. I asked for a pause at 91% of my main weekly limit.</li>
<li>13 Nov, 75 hours. Fable's limit. I cleared it early with one of my resets.</li>
<li>17 Nov, 182 hours. Fable's limit, lifted by 18 Nov. I typed "Continue" on 24 Nov.</li>
<li>25 Nov, 15 minutes. Fable's limit, until I switched to Opus.</li>
</ul></li>
<li><b>Waiting for me to say "put it live"</b> <data value="-7.96">−8.0</data> the last fixes were done about eight hours before I said go</li>
</ol>
<figcaption><b>Where the 358 hours went</b> What's left, 66 hours, is the time agents were working.</figcaption>
</ao-funnel>

I have two weekly usage limits, one on all my Claude use and a separate one on Fable alone. My other projects run on the same limits, so every percentage here counts them too. Three times Fable's ran out while the main one still had room, and once I paused the job myself at 91% of the main one.

I also get a few resets that clear a limit early. I cleared the 13 November Fable limit with one of them. I've used all three of my Fable resets and one weekly reset, with other projects running at the same time, so I can't say which of the others went to this job. Only 41 to 116 of the stopped hours went to waiting on a limit, depending on when that reset went in. The rest of the time the job was waiting for me. If it had picked itself back up at each announced reset, it would have taken about 190 hours, 8 days.

<details><summary>The four stops, hour by hour</summary>

| Stop | Whole stretch | Until the limit reset | Reset, waiting for me |
|---|---|---|---|
| 11 Nov, a pause I asked for at 91% of my weekly limit for all of Claude, which another of my jobs was using too | 26.0 h | 9.3 h, to the weekly limit's regular reset, 11 Nov 11:00 UTC | 16.8 h |
| 13 Nov, Fable's limit, six minutes before the first machine restart | 75.2 h | 0 to 75.2 h, until one of my resets cleared it | the rest |
| 17 Nov, Fable's limit | 182.0 h | 31.1 h, to 18 Nov 11:00 UTC | 151.0 h |
| 25 Nov, Fable's limit, ended by my switch to Opus | 0.24 h | 0.24 h | 0 |
| All four | 283.5 h | 40.6 to 115.8 h | 167.7 to 243.0 h |

- **Without the stops:** 357.6 minus 283.5 is 74.0 hours. Without the 8.0-hour wait for my "put it live" too, it's 66.1, the same as the time agents were working.
- **If it had restarted itself at each announced reset,** the job would have taken about 190 hours. That saves nothing on the 13 November stop: I had cleared that limit with one of my resets by the time I came back on 16 November, two days before its announced reset.
- **Agents side by side:** 92.7 agent-hours in 66.1 working hours, about 1.4 at once on average. Exactly one sub-agent was running for 47.0 of the 64.9 hours that any was.
- **How "working" is counted:** an agent counts as working between two lines of its log that are at most 15 minutes apart, or while it waits on its own command. Any rule from 10 to 60 minutes gives about 66 hours.
- **The first version** went live on 16 November at 04:36 UTC, 127.2 hours in. The finished one went live on 25 November at 18:59 UTC.

</details>

<ao-series stack>
<table><thead><tr><th>Day</th><th data-unit="h">Working</th><th data-unit="h">Until a limit reset</th><th data-unit="h">Waiting for me</th><th data-unit="h">Limit or me (split unknown)</th></tr></thead>
<tbody>
<tr><td>2026-11-10</td><td>2.56</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>2026-11-11</td><td>1.74</td><td>9.26</td><td>13.0</td><td>0</td></tr>
<tr><td>2026-11-12</td><td>20.24</td><td>0</td><td>3.76</td><td>0</td></tr>
<tr><td>2026-11-13</td><td>0.35</td><td>0</td><td>0</td><td>23.65</td></tr>
<tr><td>2026-11-14</td><td>0</td><td>0</td><td>0</td><td>24.0</td></tr>
<tr><td>2026-11-15</td><td>0</td><td>0</td><td>0</td><td>24.0</td></tr>
<tr><td>2026-11-16</td><td>20.41</td><td>0</td><td>0</td><td>3.59</td></tr>
<tr><td>2026-11-17</td><td>3.94</td><td>20.06</td><td>0</td><td>0</td></tr>
<tr><td>2026-11-18</td><td>0</td><td>11.0</td><td>13.0</td><td>0</td></tr>
<tr><td>2026-11-19</td><td>0</td><td>0</td><td>24.0</td><td>0</td></tr>
<tr><td>2026-11-20</td><td>0</td><td>0</td><td>24.0</td><td>0</td></tr>
<tr><td>2026-11-21</td><td>0</td><td>0</td><td>24.0</td><td>0</td></tr>
<tr><td>2026-11-22</td><td>0</td><td>0</td><td>24.0</td><td>0</td></tr>
<tr><td>2026-11-23</td><td>0</td><td>0</td><td>24.0</td><td>0</td></tr>
<tr><td>2026-11-24</td><td>6.05</td><td>0</td><td>17.95</td><td>0</td></tr>
<tr><td>2026-11-25</td><td>10.79</td><td>0.24</td><td>7.96</td><td>0</td></tr>
</tbody></table>
<ol><li data-d="2026-11-16">First version live</li><li data-d="2026-11-25">Finished version live</li></ol>
<figcaption><b>Every day of the job, in hours (UTC)</b> Work happened on 8 of the 16 days. The first and last days are partial.</figcaption>
</ao-series>

## Which models did what

| Model | Runs | At API prices |
|---|---|---|
| Claude Fable 5.2 | 28 | $1,359 |
| Claude Opus 5.5 | 68 | $857 |
| Claude Sonnet 5.5 | 10 | $1.75 |
| Claude Haiku 5.5 | 1 | under 1 cent |
| Higgsfield | | 70 credits |

- **Fable 5.2** is Anthropic's most capable public model, at twice Opus's price on everything but cache reads. It ran the main session until the last day. It made three competing designs and the build plan, built the five company worlds and the page around them, made the design fixes and reviewed it as a first-time visitor would.
- **Opus 5.5** ran the ten researchers, the fact base (every claim checked against its source by a second agent), the design judges, tests and engineering, and most reviews and fixes. It put the page live and did every job after the switch.
- **Sonnet 5.5** ran ten blind tests of about 20 seconds each. In each it was shown the five company rooms with every word and logo hidden and asked whose room each was.
- **Haiku 5.5** read one page of Anthropic's docs for the main session.
- **Higgsfield** made 30 still pictures with its Nano Banana Pro model and 10 background removals with its background remover.

<details><summary>Hours, tokens and runs per model</summary>

| Model | Agent-hours | Output tokens | Cache reads |
|---|---|---|---|
| Fable 5.2 | 48.1 | 6.5 million | 1.65 billion |
| Opus 5.5 | 44.5 | 7.4 million | 2.15 billion |
| Sonnet 5.5 | 3 minutes | 19,604 | 735,258 |
| Haiku 5.5 | 30 seconds | 3,067 | 4,015 |

- **Fable's and Opus's rows include the main session,** on Fable until 25 Nov 04:02 UTC (2.4 agent-hours) and on Opus after that (0.2). Without it they are 45.6 and 44.4.
- The 97 runs (Fable's 28, Opus's 68 and Haiku's 1) were 90 jobs and 7 reruns after a machine restart or a usage stop. Six more Fable runs started after its limit and died on their first step.
- The 97 don't count the 10 Sonnet blind tests or the agent that wrote my progress report ($5.64, left out of the cost).
- Every agent in the scripted runs but one, which only read a finished review back into a short summary, used the extra-high reasoning setting.
- I'd said the Opus agents could hand bulk work to Sonnet 5.5 helpers. The agents inside a scripted run had no tool to hand work to helpers, so Sonnet only ran the blind tests, which they started as one-off sessions.
- The main session handed out almost everything. It did the final merge and push itself.

</details>

<details><summary>The scripted runs and the five review rounds</summary>

The 10 scripted runs: the fact base, the design (three concepts and four judges), two build stages (art and the foundation, then six building packages), review round 1, its fixes with round 2, a studio pass with round 3, a finish pass with round 4, the final fixes, and round 5 with its fixes.

| Round | When | Reviewers | Found (blocker / major / minor) |
|---|---|---|---|
| 1 | 12 Nov | 6 | 6 / 52 / 42 |
| 2 | 16 Nov | 3 | 1 / 15 / 28 |
| 3 | 17 Nov | 2 | 1 / 6 / 9 |
| 4 | 25 Nov | 3 | 0 / 5 / 17 |
| 5 | 25 Nov | 2 | 0 / 2 / 16 |

Round 3 had a third reviewer, which hit Fable's limit. Round 5's art director agent said "Yes, I would put it live today".

</details>


## What it cost

**$2,218 at Anthropic's API prices**, what the same tokens (the chunks of text a model reads and writes) would cost if paid per use. I measured it with [Claude Playback Lens](https://github.com/aaronorelup/claude-playback-lens), [my tool](/ledger/reading-my-own-agents/) that reads Claude Code's own transcripts. It ran on my subscription, so it isn't what I paid. About four fifths of it is cache: 47% storing the agents' growing working context, 34% re-reading it at every step. The pictures took 70 Higgsfield credits.

<ao-bars unit="dollars">
<table><thead><tr><th>Job</th><th>At API prices</th></tr></thead>
<tbody>
<tr><td>Builders</td><td>792</td></tr>
<tr><td>Fixers</td><td>508</td></tr>
<tr><td>Reviewers</td><td>286</td></tr>
<tr><td>Fact base</td><td>239</td></tr>
<tr><td>Design concepts</td><td>95</td></tr>
<tr><td>Design director</td><td>76</td></tr>
<tr><td>Research</td><td>72</td></tr>
<tr><td>Main session</td><td>59</td></tr>
<tr><td>Art</td><td>41</td></tr>
<tr><td>Design judges</td><td>31</td></tr>
<tr><td>First go-live</td><td>17</td></tr>
<tr><td>Blind tests</td><td>2</td></tr>
</tbody></table>
<figcaption><b>Where the $2,218 went</b> The builders and fixers are more than half of it.</figcaption>
</ao-bars>

<details><summary>The prices and the arithmetic</summary>

Anthropic's list prices per million tokens, as listed on 3 November. Every call ran at standard speed. Playback Lens had no prices yet for Fable 5.2, Sonnet 5.5 or Haiku 5.5, so I added these to it.

| Model | Input | Cache write, 5 min | Cache write, 1 hour | Cache read | Output |
|---|---|---|---|---|---|
| Fable 5.2 | $8 | $10 | $16 | $0.20 | $40 |
| Opus 5.5 | $4 | $5 | $8 | $0.20 | $20 |
| Sonnet 5.5 | $2 | $2.50 | $4 | $0.10 | $10 |
| Haiku 5.5 | $0.10 | $0.125 | $0.20 | $0.01 | $0.50 |

- **Haiku's cache-read price** is a guess at the usual tenth of input.
- **By kind:** cache writes $1,048, cache reads $760, output $410, plain input 13 cents. Behind 14 million output tokens sit 3.8 billion cache-read tokens.
- **By date:** $1,187 up to the first go-live on 16 November, $1,031 after it.
- **Fable is 61% of the cost** for 47% of the output, because it costs twice as much per token on everything but cache reads.
- **Pictures:** 25 stills and all 10 background removals on 12 November, 5 more stills on 16 November. Three of the 30 weren't used.
- **My agents' first count** came to $2,218.23, 35 cents more. It ran six minutes past the go-live, to my request for this post, and picked up the live checks in between. Otherwise both counted the same messages at the same prices.
- **This post and the video:** writing this post (three researchers, a writer, two checkers and a fixer, all Opus) cost $45 more by 21:02 UTC on 25 November. The video took four more Opus agents, $33: one to make it, two reviewers and a fixer. By 00:46 UTC on 26 November the whole session came to $2,348, with my progress report, this post and its checks, the video, and the work of listing the page and measuring all this.
- **Not in the $2,218:** the agents' 236 web searches and 373 page fetches (about $2.36 more if priced like the API's web search at $10 per 1,000, a guess), two blind tests that left no log (about 35 cents, a guess), the cloud computer itself and the hosting.

</details>

## What would have made it faster

1. **No usage-limit stops: 284 hours saved.** The job would have taken about 74.
   - **Carry on with Opus when Fable runs out**, like I did on the last day: up to 257 hours, a guess. Only Fable's limit was full at those stops. On 13 November the main one was at 75% with 131 hours to its reset, so Opus would most likely have run it out too. On 17 November it was at 82% with 31 hours to go, which Opus alone might just have lasted.
   - **Pick itself back up at each announced reset**, instead of waiting for my next message: about 168 hours.
2. **A computer with a graphics card: about 14 to 28 hours,** by my agents' estimate.
3. **More agents at once: up to about 6 hours.** Each scripted run had at most two working at a time.
4. **Fewer review rounds: a few hours each,** but the last round still found two major problems.
5. **No machine restarts: about an hour.**

<details><summary>How the graphics-card estimate was worked out</summary>

- **A browser was running for 37.2 of the working hours:** at least 14.3 hours of test-suite runs and about 23 hours of the agents' own screenshot walks and probes.
- **Measured on the cloud computer on 25 November,** walking 8 stops of the page took 47.4 seconds drawn at full size and 11.4 seconds with frames made nearly free, the closest it gets to a graphics card.
- **The agents' own walks draw at full size.** Allowing for page loads and the rest, take 2 to 4 times faster. That saves 11 to 17 hours.
- **The tests already draw at a quarter size,** where nearly free frames helped only 1.3 times (14.5 seconds against 11.4). The top of the range assumes the full-size test steps get 4 times faster and four tests could run side by side on a graphics card, which wasn't tested. That saves 3 to 11 hours.
- **Together about 14 to 28 hours,** so the 66 working hours become about 38 to 52, and the 74 without limit stops about 46 to 60.
- **Four tests at once didn't help here.** Each test ran about 4.7 times slower beside three others, so four at once finished no sooner than one at a time (89.1 minutes of test time against 19.0 for the same 28 tests).
- **Twelve test failures were slowness alone.** Nine ran out of time beside other browsers, and three missed a 10-second limit by up to 1.3 seconds.
- **More agents at once:** up to about 6 hours, 3.6 of them in the second build stage. It only pays off where browsers don't slow each other down.
- **Fewer rounds:** round 5 took 4.7 hours and round 4 about 4.1.
- **It's still an estimate.** To settle it, run the same measurements and the final test pass on my laptop and check the browser really uses the graphics card. A headless browser (one with no window, driven by an agent) can still draw in software unless it's told to use it.

</details>

## Was the cloud computer the problem?

Yes for the working hours, but it isn't why the job took 15 days. It has 4 processor cores and no graphics card, so the browser drew the 3D page in software, at 2.2 to 2.5 frames a second when my agents measured it on 25 November. A browser was running for 37 of the 66 working hours, one full test pass took about 77 minutes, and four tests at once were no faster than one. How much faster my laptop would be isn't measured yet.

In [my week with Fable post](/ledger/a-week-with-fable-5-2/) I guessed that browser testing crashed the computer. Six of the eight restarts came while a browser was running, but a browser was running more than half the time anyway. All eight came between 22:55 and 04:00 UTC, and the last one came while the machine sat idle. So the data doesn't settle my guess, and the cause is still unknown.

<details><summary>The eight restarts</summary>

| # | When (UTC) | What was running | Down, and work cut off |
|---|---|---|---|
| 1 | 13 Nov 00:19 | an engineering fixer, no browser at that moment | inside a limit stop |
| 2 | 16 Nov 22:55 | a full test run | 2.6 min, 19 min of test run |
| 3 | 16 Nov 23:57 | a browser script | 2.6 min, 1.5 min |
| 4 | 17 Nov 01:04 | phone tests, 29 seconds in | 12.4 min, 0.5 min |
| 5 | 17 Nov 01:30 | desktop tests | 2.5 min, 6.1 min |
| 6 | 24 Nov 23:50 | the full desktop test pass | 1.5 min, 2.1 min |
| 7 | 25 Nov 00:57 | a piece of the desktop tests | 3.6 min, 3.7 min |
| 8 | 25 Nov about 03:52 | nothing, the job was stopped by Fable's limit | none |

- **In all,** 25 minutes down and 33 minutes of runs cut, about an hour. At most about 4.7 hours if you count all the time the replacement agents spent on the same work.
- **Memory wasn't it.** There were 14 GB or more free before every logged restart.
- **Two reviewers side by side on 16 November,** at a load one of them put at about 28, brought none.
- **From 17 November** every agent drove one browser at a time and ran the tests one at a time, which cost almost nothing because four at once had never been faster.

</details>

## On a phone

<ao-compare cols="3" aspect="390/844">
<figure><img src="/media/making-the-ai-landscape-page/phone-opening.webp" alt="The page's opening on a phone: five small stacks above the words AI LANDSCAPE and a list of the five companies" width="390" height="844"><figcaption><b>On a phone</b><span class="ao-meta">the opening</span></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/phone-anthropic.webp" alt="Anthropic's world on a phone, with the stack above a card about the plug that connects agents to apps" width="390" height="844"><figcaption><b>Anthropic</b></figcaption></figure>
<figure><img src="/media/making-the-ai-landscape-page/phone-google.webp" alt="Google's world on a phone, with the stack above a card about products that keep getting renamed" width="390" height="844"><figcaption><b>Google</b></figcaption></figure>
</ao-compare>

My [progress report](/ledger/progress-report-on-my-3d-ai-landscape-page/) covers the first four hours of the job.

*Researched by Claude agents from the session's own logs, with the costs from Claude Playback Lens.*
