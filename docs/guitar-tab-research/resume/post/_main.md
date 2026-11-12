I want to build a web app that turns a song, or a video of someone playing guitar, into tabs. Tabs are guitar music written as fret numbers on six lines, one per string. Before building anything I had a team of Claude agents list every tool they could find for each step, run the ones they could in the time they had, and read each license. **Their ten lists come to 575 tools, and 138 of them ran**: 128 on a cloud computer with no graphics card, which I call the cloud box, and 10 more through a public demo page or a service an agent can call, counting two helpers those calls went through. 116 others have steps written for me instead, because they need a graphics card, an account or my own hands, or because Claude's permission system wouldn't let my agents install or run them. I asked for facts only: what went in and what came out, with no grades and no picks.

The app would work in steps, with a person correcting it along the way. Split the song into instruments. Turn the guitar into notes. Find the chords and the beat. Choose a string and a fret for each note. Show the tab, play it back against a metronome, and run the analysis again when the person says there's a capo on fret 2. A capo is a clamp across the strings that raises every note. For a fingerstyle video, a guitar played with the fingers, it would also watch the hands. I'd already had three AI passes turn ten of my own guitar videos into tabs. This time each tool gets looked at by itself.

## The quick rundown

{{RUNDOWN}}

## How the tests worked

Everything my agents ran themselves ran on the cloud box, one cloud computer with 4 processor cores, 15 GiB of memory and no graphics card. The demo pages and online services ran on their own machines. With no graphics card here, the times are what a plain processor gives.

The agents worked in ten groups, one per step, and my notes call each group a lane. The lanes shared one set of 17 test clips, and each tool's entry says which ones it got. A few lanes added inputs of their own. Nine of the 17 are synthesized, so every note, string, fret, beat and chord in them is known. Three are real solo guitar recordings that come with their notes written down. One is a real band song with singing, short and whole. Three are real videos of people playing classical guitar. When a section says Transkun found 88 of 90 notes on S2n, the 90 are that clip's known notes, and a note counts as found when the tool put the same pitch within 50 milliseconds of it.

<details><summary>Who did the work, the run log and the refused installs</summary>

In each lane one agent installed and ran tools, one read the docs and the licenses, and two more checked that work against the saved files and the source pages. A fifth turned their reports into the lane's list of tools. Then a critic listed 52 gaps, more agents went back for them, and other agents checked what those added. An eleventh group ran tools from different lanes in a chain.

Each run went through one wrapper that logged the exact command, the input file and the time. It logged 730 runs, the first of them its own self-test. 253 had 2 of the box's 4 cores to themselves, 5 had all four, and 471 ran next to other jobs. Each section says which. 46 runs ended in an error. Most of the counts against the known answers came from one counting tool, which logged 1,856 runs of its own.

Claude's permission system on the cloud box refused, in most cases, to install or run code from other people's repositories and downloaded programs. It also wouldn't tick a consent box for me or let an agent get past a site's bot check. That kept research models such as MT3, ADTOF and LarsNet from running here. They're on my list instead.

</details>

<details><summary>The ten lists in numbers</summary>

An entry is one tool, app, model, dataset or file format on one lane's list. "Marked as run" and "with steps for me" are the two marks my agents kept on each entry.

| Step | Entries | Marked as run | With steps for me |
|---|---|---|---|
| Splitting a song into instruments | 64 | 16 | 11 |
| Turning sound into notes | 99 | 16 | 21 |
| Chords, beat, key and tuning | 85 | 20 | 18 |
| Choosing the string and fret | 95 | 13 | 8 |
| Melody, bass and taps from one guitar | 65 | 14 | 19 |
| Reading hands and the fretboard from video | 75 | 17 | 11 |
| Showing, editing and playing a tab in the browser | 80 | 18 | 8 |
| Metronome and sync in the browser | 101 | 36 | 14 |
| Services an agent can call over the internet | 76 | 13 | 21 |
| Apps that already do some of this | 60 | 0 | 28 |
| All ten | 800 | 163 | 159 |

96 of the 800 entries are datasets, and some tools are on more than one list. A script merged the other 704 entries into 575 tools and gave each one status: 128 ran on the cloud box, 10 ran only on a public demo page or through a service, two of them helpers the calls went through, 116 didn't run and have steps for me, and 321 didn't run and have nothing for me to run. 29 of the tools that ran also have steps for me. The sections below count their own way, so a section's numbers can be smaller than its row here: a helper library or a dataset used as a test clip is an entry too.

</details>

{{FILE:_clips.md}}

## What it cost

The run took two sittings and [[ALL_AGENTS]] agents. The first sitting was about six hours and 139 agents. I stopped it when it and one other session had used about 90% of my weekly Claude limit. I picked it up again a day later, and the second sitting took about [[S2_HOURS]] hours and [[S2_AGENTS]] more agents. Together they wrote [[ALL_OUTPUT_M]] million tokens, the word pieces a model reads and writes, and re-read [[ALL_CACHE_B]] billion tokens of their own context from a cache, a stored copy that's cheaper to read. At Anthropic's list prices for its API, the pay-per-token way programs use Claude, that comes to about [[ALL_LOW]] to [[ALL_HIGH]]. The range is there because writing to the cache has two prices and my logs don't say which one applied.

I didn't pay that. It ran on my Claude subscription. Outside services came to $0.96 in total, most of it ElevenLabs credits at an estimated price, because ElevenLabs doesn't publish a price per credit. No graphics card was rented.

<details><summary>The token counts by sitting and model</summary>

These come from the agents' own transcripts on the cloud box. Prices are from Anthropic's pricing page on 2026-11-11, per million tokens. In both sittings one Fable 5.2 agent directed the others. The second count starts where the first one ended, so it also holds that agent's last stretch of the first sitting, when it put the post together and published it.

| Sitting | Model | Agents | Output tokens | Cache reads | Cache writes |
|---|---|---|---|---|---|
| First, 2026-11-10 and 11 | Claude Opus 5.5 | 118 | 19,233,670 | 5,810,628,216 | 68,164,105 |
| First | Claude Sonnet 5.5 | 20 | 1,245,797 | 79,691,320 | 4,493,297 |
| First | Claude Fable 5.2 | 1 | 333,899 | 56,093,186 | 672,600 |
[[S2_ROWS]]

| Model | Input | Output | Cache read | Cache write |
|---|---|---|---|---|
| Claude Opus 5.5 | $4 | $20 | $0.20 | $5 or $8 |
| Claude Sonnet 5.5 | $2 | $10 | $0.10 | $2.50 or $4 |
| Claude Fable 5.2 | $8 | $40 | $0.20 | $10 or $16 |

A cache write has two prices by how long the cache is kept. Input that wasn't cached was [[ALL_INPUT]] tokens in all. The first count alone comes to about $1,950 to $2,170 and the second to about [[S2_LOW]] to [[S2_HIGH]]. The measured files are in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/costs).

</details>

## What plugs into what

I also asked which tool's output fits which tool's input. My agents wrote that down as [one map](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/HANDOFFS.md): the 575 tools sorted into the app's steps, 61 of them hosts, runtimes and other tools that aren't a step of their own, with 292 handoffs between them. 83 of the handoffs were tested. In 64 of those the second tool read the first tool's real output, in 7 one tool ran the other itself, and in 2 the two tools' outputs were lined up by time. In the other 10 a tool read or wrote a file in the other tool's format, made from a clip's known notes. The remaining 209 handoffs come from what the two tools' documentation says they write and read.

[[HANDOFF_PICTURE]]

<details><summary>The chains, and what else the map lists</summary>

The section called "Tools handing off to each other" below has the five chains my agents ran across the lanes, with what had to be converted at every joint. One chain went from a full band mix to a drawn tab: a separated guitar track, then notes, then a string and fret for each note, then a Guitar Pro file, the format of the Guitar Pro tab program, then a picture of the tab. Each tool's entry in the other sections also has a "Hands off to" line. The map also lists which tools take a capo, a tuning or a pinned fret as a hint, and the joints where nothing connects without conversion.

</details>

## What I still have to run myself

My agents wrote steps for what needs a graphics card, an account, a desktop or phone app, a click the cloud box wouldn't make, or an install the permission system refused. For 12 more tools too little was recorded to write steps. The steps are in [one list of 120 numbered tests](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/FOR_AARON.md): 41 on web apps, public demo pages and online notebooks, 17 that start with an account or an API key, 37 for my laptop, 20 with desktop and phone apps, 4 with my own videos and recordings, and one page I open in my own browser to repeat the metronome timing test and run one model. Each test that uses a clip names it, and most say what to send back, so an agent can count my result the same way as the others. I haven't done any of them yet.

The same list has a table of the 37 steps the permission system refused, with the test that covers each one where there is one, and the 63 tools that didn't run and that I can't run either, with the reason for each.

{{SECTIONS}}

## Sound and video still to upload

The separated tracks, playback recordings and hand-tracking videos my agents made aren't on this site yet. They're filed in my media library with the test clips. The outputs are listed here by the section that made them, as the agents wrote the lists.

{{FILE:_pending.md}}

*Researched, run and checked by a team of Claude agents from 2026-11-10 to 2026-11-12: Fable 5.2 directing, Opus 5.5 and Sonnet 5.5 doing the work. I haven't run any of these tools myself yet. Every run, quote and count is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research).*
